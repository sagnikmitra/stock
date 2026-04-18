import { prisma } from "@ibo/db";
import type { Prisma } from "@ibo/db";
import type { MarketDataAdapter, FiiDiiFlow, MarketBreadth, QuoteSnapshot } from "@ibo/types";
import { Timeframe } from "@ibo/types";
import { getAdapter } from "../adapters";

const DAY_MS = 24 * 60 * 60 * 1000;
const MIN_HISTORY_FOR_INCREMENTAL = 220;
const INCREMENTAL_OVERLAP_DAYS = 7;

const DEFAULT_QUOTES_PRIORITY = ["nse_official", "indian_stock_market_api", "twelvedata", "fmp"];
const DEFAULT_CONTEXT_PRIORITY = ["nse_official", "twelvedata", "fmp"];
const DEFAULT_CANDLES_PRIORITY = ["nse_official", "twelvedata", "fmp"];
const DEFAULT_PREMARKET_SYMBOL_LIMIT = 80;
const DEFAULT_POSTCLOSE_SYMBOL_LIMIT = 140;
const DEFAULT_BOOTSTRAP_DAYS = 420;
const DEFAULT_SYMBOL_UNIVERSE_LIMIT: number | null = null;
const MIN_EXPECTED_NSE_UNIVERSE = 1500;

type SyncPhase = "pre_market" | "post_close";
type Capability = "quotes" | "eodCandles" | "fiiDii" | "marketBreadth";

interface ProviderRow {
  id: string;
  key: string;
  isEnabled: boolean;
}

interface ProviderAttemptResult<T> {
  value: T | null;
  providerKey: string | null;
  warnings: string[];
}

interface SyncConfig {
  quotePriority: string[];
  contextPriority: string[];
  candlePriority: string[];
  preMarketSymbolLimit: number;
  postCloseSymbolLimit: number;
  bootstrapDays: number;
  symbolUniverseLimit: number | null;
}

export interface FreeDataSyncResult {
  phase: SyncPhase;
  marketDate: string;
  instrumentScope: number;
  providerUsed: {
    quotes: string | null;
    fiiDii: string | null;
    breadth: string | null;
    candles: string[];
  };
  counts: {
    symbolsSynced: number;
    quoteSnapshots: number;
    fiiDiiRows: number;
    breadthRows: number;
    candleRows: number;
    candleSymbolsCovered: number;
    candleSymbolsMissing: number;
  };
  warnings: string[];
}

function toDateKey(date: Date): string {
  return date.toISOString().split("T")[0];
}

function parsePositiveInt(input: string | undefined, fallback: number): number {
  if (!input) return fallback;
  const parsed = Number(input);
  if (!Number.isFinite(parsed) || parsed <= 0) return fallback;
  return Math.floor(parsed);
}

function parseOptionalPositiveInt(input: string | undefined, fallback: number | null): number | null {
  if (!input || input.trim().length === 0) return fallback;
  const parsed = Number(input);
  if (!Number.isFinite(parsed)) return fallback;
  if (parsed <= 0) return null;
  return Math.floor(parsed);
}

function toBigIntOrNull(value: unknown): bigint | null {
  if (value == null) return null;
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return null;
  return BigInt(Math.max(0, Math.trunc(parsed)));
}

export function parseProviderPriority(raw: string | undefined, fallback: string[]): string[] {
  if (!raw || raw.trim().length === 0) return [...fallback];
  const unique = new Set(
    raw
      .split(",")
      .map((part) => part.trim().toLowerCase())
      .filter(Boolean),
  );
  return unique.size > 0 ? Array.from(unique) : [...fallback];
}

export function isFreeDataSyncEnabled(): boolean {
  return (process.env.FREE_DATA_SYNC_ENABLED ?? "true").toLowerCase() !== "false";
}

function getSyncConfig(): SyncConfig {
  return {
    quotePriority: parseProviderPriority(process.env.FREE_QUOTES_PROVIDER_PRIORITY, DEFAULT_QUOTES_PRIORITY),
    contextPriority: parseProviderPriority(process.env.FREE_CONTEXT_PROVIDER_PRIORITY, DEFAULT_CONTEXT_PRIORITY),
    candlePriority: parseProviderPriority(process.env.FREE_CANDLE_PROVIDER_PRIORITY, DEFAULT_CANDLES_PRIORITY),
    preMarketSymbolLimit: parsePositiveInt(process.env.FREE_DATA_PREMARKET_SYMBOL_LIMIT, DEFAULT_PREMARKET_SYMBOL_LIMIT),
    postCloseSymbolLimit: parsePositiveInt(process.env.FREE_DATA_POSTCLOSE_SYMBOL_LIMIT, DEFAULT_POSTCLOSE_SYMBOL_LIMIT),
    bootstrapDays: parsePositiveInt(process.env.FREE_DATA_BOOTSTRAP_DAYS, DEFAULT_BOOTSTRAP_DAYS),
    symbolUniverseLimit: parseOptionalPositiveInt(process.env.FREE_DATA_SYMBOL_UNIVERSE_LIMIT, DEFAULT_SYMBOL_UNIVERSE_LIMIT),
  };
}

async function getProviderMap(): Promise<Map<string, ProviderRow>> {
  const rows = await prisma.provider.findMany({
    select: { id: true, key: true, isEnabled: true },
  });
  return new Map(rows.map((row) => [row.key, row]));
}

async function createProviderJob(providerId: string, jobKey: string): Promise<string> {
  const job = await prisma.providerJobRun.create({
    data: {
      providerId,
      jobKey,
      startedAt: new Date(),
      status: "running",
    },
  });
  return job.id;
}

async function completeProviderJob(input: {
  jobId: string;
  status: "completed" | "failed";
  detail: Record<string, unknown>;
}) {
  await prisma.providerJobRun.update({
    where: { id: input.jobId },
    data: {
      status: input.status,
      finishedAt: new Date(),
      detailJson: input.detail as Prisma.InputJsonValue,
    },
  });
}

function adapterSupports(adapter: MarketDataAdapter, capability: Capability): boolean {
  switch (capability) {
    case "quotes":
      return adapter.supports.quotes;
    case "eodCandles":
      return adapter.supports.eodCandles;
    case "fiiDii":
      return adapter.supports.fiiDii;
    case "marketBreadth":
      return adapter.supports.marketBreadth;
    default:
      return false;
  }
}

async function fetchWithFallback<T>(input: {
  providerOrder: string[];
  providersByKey: Map<string, ProviderRow>;
  capability: Capability;
  jobKey: string;
  execute: (args: {
    adapter: MarketDataAdapter;
    providerKey: string;
    providerId: string;
  }) => Promise<T>;
  isUsable: (value: T) => boolean;
}): Promise<ProviderAttemptResult<T>> {
  const warnings: string[] = [];

  for (const providerKey of input.providerOrder) {
    const provider = input.providersByKey.get(providerKey);
    if (!provider) {
      warnings.push(`Provider '${providerKey}' missing in registry`);
      continue;
    }
    if (!provider.isEnabled) {
      warnings.push(`Provider '${providerKey}' disabled`);
      continue;
    }

    const adapter = getAdapter(providerKey);
    if (!adapter) {
      warnings.push(`Provider '${providerKey}' has no adapter`);
      continue;
    }
    if (!adapterSupports(adapter, input.capability)) {
      warnings.push(`Provider '${providerKey}' does not support ${input.capability}`);
      continue;
    }

    const jobId = await createProviderJob(provider.id, input.jobKey);
    try {
      const value = await input.execute({
        adapter,
        providerKey,
        providerId: provider.id,
      });

      if (!input.isUsable(value)) {
        warnings.push(`Provider '${providerKey}' returned empty ${input.capability} payload`);
        await completeProviderJob({
          jobId,
          status: "failed",
          detail: {
            capability: input.capability,
            warning: "empty_payload",
          },
        });
        continue;
      }

      await completeProviderJob({
        jobId,
        status: "completed",
        detail: {
          capability: input.capability,
          providerKey,
        },
      });
      return { value, providerKey, warnings };
    } catch (error) {
      const message = error instanceof Error ? error.message : "unknown provider error";
      warnings.push(`Provider '${providerKey}' failed ${input.capability}: ${message}`);
      await completeProviderJob({
        jobId,
        status: "failed",
        detail: {
          capability: input.capability,
          providerKey,
          error: message,
        },
      });
    }
  }

  return { value: null, providerKey: null, warnings };
}

async function getInstrumentScope(limit: number): Promise<Array<{ id: string; symbol: string }>> {
  const watchlistItems = await prisma.watchlistItem.findMany({
    where: { isActive: true },
    select: {
      instrument: {
        select: { id: true, symbol: true },
      },
    },
    orderBy: { addedAt: "desc" },
    take: limit,
  });

  const byId = new Map<string, { id: string; symbol: string }>();
  for (const item of watchlistItems) {
    byId.set(item.instrument.id, item.instrument);
  }

  if (byId.size < limit) {
    const existingIds = Array.from(byId.keys());
    const remaining = await prisma.instrument.findMany({
      where: {
        isActive: true,
        ...(existingIds.length > 0 ? { id: { notIn: existingIds } } : {}),
      },
      select: { id: true, symbol: true },
      orderBy: { symbol: "asc" },
      take: limit - byId.size,
    });

    for (const instrument of remaining) {
      byId.set(instrument.id, instrument);
    }
  }

  return Array.from(byId.values()).slice(0, limit);
}

async function syncInstrumentUniverseWithFallback(input: {
  providerOrder: string[];
  providersByKey: Map<string, ProviderRow>;
  targetLimit: number | null;
}): Promise<{ synced: number; providerUsed: string | null; warnings: string[] }> {
  const warnings: string[] = [];
  const exchange = await prisma.exchange.findUnique({
    where: { code: "NSE" },
    select: { id: true },
  });

  if (!exchange) {
    return {
      synced: 0,
      providerUsed: null,
      warnings: ["Exchange 'NSE' not found in DB"],
    };
  }

  for (const providerKey of input.providerOrder) {
    const provider = input.providersByKey.get(providerKey);
    if (!provider) {
      warnings.push(`Provider '${providerKey}' missing in registry`);
      continue;
    }
    if (!provider.isEnabled) {
      warnings.push(`Provider '${providerKey}' disabled`);
      continue;
    }

    const adapter = getAdapter(providerKey);
    if (!adapter) {
      warnings.push(`Provider '${providerKey}' has no adapter`);
      continue;
    }

    const jobId = await createProviderJob(provider.id, "sync_symbols");
    try {
      const symbols = await adapter.getSymbols();
      if (!Array.isArray(symbols) || symbols.length === 0) {
        warnings.push(`Provider '${providerKey}' returned empty symbols payload`);
        await completeProviderJob({
          jobId,
          status: "failed",
          detail: {
            warning: "empty_symbols_payload",
          },
        });
        continue;
      }

      const unique = new Map<string, { symbol: string; companyName: string; exchange: string; isin?: string; sector?: string; industry?: string }>();
      for (const item of symbols) {
        const symbol = String(item.symbol ?? "").trim().toUpperCase();
        if (!symbol) continue;
        if (item.exchange && item.exchange.toUpperCase() !== "NSE") continue;
        unique.set(symbol, {
          symbol,
          companyName: String(item.companyName ?? symbol).trim() || symbol,
          exchange: "NSE",
          isin: item.isin,
          sector: item.sector,
          industry: item.industry,
        });
      }

      const selected = Array.from(unique.values())
        .sort((a, b) => a.symbol.localeCompare(b.symbol))
        .slice(0, input.targetLimit ?? Number.POSITIVE_INFINITY);

      let synced = 0;
      for (const row of selected) {
        await prisma.instrument.upsert({
          where: {
            exchangeId_symbol: {
              exchangeId: exchange.id,
              symbol: row.symbol,
            },
          },
          update: {
            companyName: row.companyName,
            isin: row.isin ?? null,
            sector: row.sector ?? null,
            industry: row.industry ?? null,
            isActive: true,
          },
          create: {
            exchangeId: exchange.id,
            symbol: row.symbol,
            companyName: row.companyName,
            isin: row.isin ?? null,
            sector: row.sector ?? null,
            industry: row.industry ?? null,
            isActive: true,
          },
        });
        synced += 1;
      }

      await completeProviderJob({
        jobId,
        status: "completed",
        detail: {
          providerKey,
          received: symbols.length,
          synced,
        },
      });

      if (synced > 0) {
        return {
          synced,
          providerUsed: providerKey,
          warnings,
        };
      }

      warnings.push(`Provider '${providerKey}' yielded zero valid NSE symbols`);
    } catch (error) {
      const message = error instanceof Error ? error.message : "unknown provider error";
      warnings.push(`Provider '${providerKey}' failed symbol sync: ${message}`);
      await completeProviderJob({
        jobId,
        status: "failed",
        detail: {
          providerKey,
          error: message,
        },
      });
    }
  }

  return {
    synced: 0,
    providerUsed: null,
    warnings,
  };
}

async function persistQuotes(input: {
  quotes: QuoteSnapshot[];
  instruments: Array<{ id: string; symbol: string }>;
  providerId: string;
}): Promise<number> {
  if (input.quotes.length === 0) return 0;

  const bySymbol = new Map(
    input.instruments.map((instrument) => [instrument.symbol.toUpperCase(), instrument.id]),
  );

  const rows = input.quotes
    .map((quote) => {
      const instrumentId = bySymbol.get(quote.symbol.toUpperCase());
      if (!instrumentId) return null;

      return {
        instrumentId,
        ts: quote.ts,
        ltp: quote.ltp,
        open: quote.open ?? null,
        high: quote.high ?? null,
        low: quote.low ?? null,
        close: quote.close ?? null,
        changePct: quote.changePct ?? null,
        volume: toBigIntOrNull(quote.volume),
        providerId: input.providerId,
        sourceAsOf: quote.ts,
      };
    })
    .filter((row): row is NonNullable<typeof row> => row !== null);

  if (rows.length === 0) return 0;
  await prisma.quoteSnapshot.createMany({ data: rows });
  return rows.length;
}

async function persistFiiDii(input: {
  marketDate: string;
  flow: FiiDiiFlow;
}): Promise<number> {
  const marketDate = new Date(`${input.marketDate}T00:00:00.000Z`);
  await prisma.fiiDiiSnapshot.upsert({
    where: { date: marketDate },
    update: {
      fiiCashNet: input.flow.fiiCashNet ?? null,
      diiCashNet: input.flow.diiCashNet ?? null,
      fiiIndexFuturesNet: input.flow.fiiIndexFuturesNet ?? null,
      fiiIndexOptionsNet: input.flow.fiiIndexOptionsNet ?? null,
      narrative: input.flow.narrative ?? null,
    },
    create: {
      date: marketDate,
      fiiCashNet: input.flow.fiiCashNet ?? null,
      diiCashNet: input.flow.diiCashNet ?? null,
      fiiIndexFuturesNet: input.flow.fiiIndexFuturesNet ?? null,
      fiiIndexOptionsNet: input.flow.fiiIndexOptionsNet ?? null,
      narrative: input.flow.narrative ?? null,
    },
  });
  return 1;
}

async function persistBreadth(input: {
  marketDate: string;
  breadth: MarketBreadth;
}): Promise<number> {
  const marketDate = new Date(`${input.marketDate}T00:00:00.000Z`);
  await prisma.marketBreadthSnapshot.upsert({
    where: { date: marketDate },
    update: {
      advances: input.breadth.advances ?? null,
      declines: input.breadth.declines ?? null,
      unchanged: input.breadth.unchanged ?? null,
      new52WeekHighs: input.breadth.new52WeekHighs ?? null,
      new52WeekLows: input.breadth.new52WeekLows ?? null,
    },
    create: {
      date: marketDate,
      advances: input.breadth.advances ?? null,
      declines: input.breadth.declines ?? null,
      unchanged: input.breadth.unchanged ?? null,
      new52WeekHighs: input.breadth.new52WeekHighs ?? null,
      new52WeekLows: input.breadth.new52WeekLows ?? null,
    },
  });
  return 1;
}

async function ingestCandlesWithFallback(input: {
  providerOrder: string[];
  providersByKey: Map<string, ProviderRow>;
  instruments: Array<{ id: string; symbol: string }>;
  marketDate: string;
  bootstrapDays: number;
}): Promise<{
  providersUsed: string[];
  candleRows: number;
  coveredSymbols: number;
  missingSymbols: number;
  warnings: string[];
}> {
  const warnings: string[] = [];
  const providersUsed: string[] = [];
  const marketDateObj = new Date(`${input.marketDate}T00:00:00.000Z`);
  const instrumentIds = input.instruments.map((instrument) => instrument.id);
  const remaining = new Map(input.instruments.map((instrument) => [instrument.id, instrument]));

  const candleStats = await prisma.candle.groupBy({
    by: ["instrumentId"],
    where: {
      timeframe: "D1",
      instrumentId: { in: instrumentIds },
    },
    _max: { ts: true },
    _count: { _all: true },
  });

  const statByInstrument = new Map(
    candleStats.map((row) => [
      row.instrumentId,
      {
        latestTs: row._max.ts ?? null,
        count: row._count._all,
      },
    ]),
  );

  let candleRows = 0;
  let coveredSymbols = 0;

  for (const providerKey of input.providerOrder) {
    if (remaining.size === 0) break;
    const provider = input.providersByKey.get(providerKey);

    if (!provider) {
      warnings.push(`Provider '${providerKey}' missing in registry`);
      continue;
    }
    if (!provider.isEnabled) {
      warnings.push(`Provider '${providerKey}' disabled`);
      continue;
    }

    const adapter = getAdapter(providerKey);
    if (!adapter) {
      warnings.push(`Provider '${providerKey}' has no adapter`);
      continue;
    }
    if (!adapterSupports(adapter, "eodCandles")) {
      warnings.push(`Provider '${providerKey}' does not support eodCandles`);
      continue;
    }

    const jobId = await createProviderJob(provider.id, "daily_candle_ingest");
    const remainingSnapshot = Array.from(remaining.values());
    let providerCandleRows = 0;
    let providerCoveredSymbols = 0;

    try {
      for (const instrument of remainingSnapshot) {
        const stat = statByInstrument.get(instrument.id);
        const fromDate =
          stat?.latestTs && stat.count >= MIN_HISTORY_FOR_INCREMENTAL
            ? new Date(stat.latestTs.getTime() - INCREMENTAL_OVERLAP_DAYS * DAY_MS)
            : new Date(marketDateObj.getTime() - input.bootstrapDays * DAY_MS);

        const series = await adapter.getHistoricalCandles({
          symbol: instrument.symbol,
          timeframe: Timeframe.D1,
          from: toDateKey(fromDate),
          to: input.marketDate,
        });

        if (!series.candles || series.candles.length === 0) continue;

        let symbolRows = 0;
        for (const candle of series.candles) {
          if (!Number.isFinite(candle.open) || !Number.isFinite(candle.close)) continue;
          const ts = new Date(candle.ts);
          if (Number.isNaN(ts.getTime())) continue;

          await prisma.candle.upsert({
            where: {
              instrumentId_timeframe_ts: {
                instrumentId: instrument.id,
                timeframe: "D1",
                ts,
              },
            },
            update: {
              open: candle.open,
              high: candle.high,
              low: candle.low,
              close: candle.close,
              volume: toBigIntOrNull(candle.volume),
              deliveryPct: candle.deliveryPct ?? null,
              providerId: provider.id,
              sourceAsOf: new Date(),
            },
            create: {
              instrumentId: instrument.id,
              timeframe: "D1",
              ts,
              open: candle.open,
              high: candle.high,
              low: candle.low,
              close: candle.close,
              volume: toBigIntOrNull(candle.volume),
              deliveryPct: candle.deliveryPct ?? null,
              providerId: provider.id,
              sourceAsOf: new Date(),
            },
          });
          symbolRows += 1;
        }

        if (symbolRows > 0) {
          providerCandleRows += symbolRows;
          providerCoveredSymbols += 1;
          candleRows += symbolRows;
          coveredSymbols += 1;
          remaining.delete(instrument.id);
        }
      }

      providersUsed.push(providerKey);
      await completeProviderJob({
        jobId,
        status: "completed",
        detail: {
          requestedSymbols: remainingSnapshot.length,
          coveredSymbols: providerCoveredSymbols,
          candleRows: providerCandleRows,
          remainingAfterProvider: remaining.size,
        },
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : "unknown provider error";
      warnings.push(`Provider '${providerKey}' failed daily candle ingest: ${message}`);
      await completeProviderJob({
        jobId,
        status: "failed",
        detail: {
          requestedSymbols: remainingSnapshot.length,
          coveredSymbols: providerCoveredSymbols,
          candleRows: providerCandleRows,
          error: message,
        },
      });
    }
  }

  return {
    providersUsed,
    candleRows,
    coveredSymbols,
    missingSymbols: remaining.size,
    warnings,
  };
}

async function runFreeDataSync(phase: SyncPhase, marketDateInput?: string): Promise<FreeDataSyncResult> {
  const marketDate = marketDateInput ?? toDateKey(new Date());
  const config = getSyncConfig();
  const providersByKey = await getProviderMap();
  const instrumentLimit =
    phase === "pre_market"
      ? config.preMarketSymbolLimit
      : config.postCloseSymbolLimit;
  const warnings: string[] = [];
  let symbolsSynced = 0;
  const activeInstrumentCount = await prisma.instrument.count({ where: { isActive: true } });
  const shouldSyncSymbols =
    activeInstrumentCount === 0 ||
    (config.symbolUniverseLimit != null
      ? activeInstrumentCount < config.symbolUniverseLimit
      : activeInstrumentCount < MIN_EXPECTED_NSE_UNIVERSE);

  if (shouldSyncSymbols) {
    const syncSymbols = await syncInstrumentUniverseWithFallback({
      providerOrder: config.quotePriority,
      providersByKey,
      targetLimit: config.symbolUniverseLimit,
    });
    symbolsSynced = syncSymbols.synced;
    warnings.push(...syncSymbols.warnings);
  }

  const instruments = await getInstrumentScope(instrumentLimit);
  if (instruments.length === 0) {
    warnings.push("No active instruments found after symbol sync");
  }

  const quotesResult = await fetchWithFallback<QuoteSnapshot[]>({
    providerOrder: config.quotePriority,
    providersByKey,
    capability: "quotes",
    jobKey: `${phase}_quotes`,
    execute: async ({ adapter }) => adapter.getQuotes(instruments.map((instrument) => instrument.symbol)),
    isUsable: (quotes) => quotes.length > 0,
  });
  warnings.push(...quotesResult.warnings);

  let quoteSnapshots = 0;
  if (quotesResult.value && quotesResult.providerKey) {
    const providerId = providersByKey.get(quotesResult.providerKey)?.id;
    if (providerId) {
      quoteSnapshots = await persistQuotes({
        quotes: quotesResult.value,
        instruments,
        providerId,
      });
    }
  }

  const fiiResult = await fetchWithFallback<FiiDiiFlow[]>({
    providerOrder: config.contextPriority,
    providersByKey,
    capability: "fiiDii",
    jobKey: `${phase}_fii_dii`,
    execute: async ({ adapter }) => adapter.getFiiDiiFlows(marketDate),
    isUsable: (rows) => rows.length > 0,
  });
  warnings.push(...fiiResult.warnings);

  let fiiDiiRows = 0;
  if (fiiResult.value && fiiResult.value.length > 0) {
    fiiDiiRows = await persistFiiDii({
      marketDate,
      flow: fiiResult.value[0]!,
    });
  }

  const breadthResult = await fetchWithFallback<MarketBreadth>({
    providerOrder: config.contextPriority,
    providersByKey,
    capability: "marketBreadth",
    jobKey: `${phase}_market_breadth`,
    execute: async ({ adapter }) => {
      const row = await adapter.getMarketBreadth(marketDate);
      if (!row) {
        throw new Error("empty market breadth payload");
      }
      return row;
    },
    isUsable: (row) => Boolean(row),
  });
  warnings.push(...breadthResult.warnings);

  let breadthRows = 0;
  if (breadthResult.value) {
    breadthRows = await persistBreadth({
      marketDate,
      breadth: breadthResult.value,
    });
  }

  let candleRows = 0;
  let candleSymbolsCovered = 0;
  let candleSymbolsMissing = 0;
  let candleProviders: string[] = [];

  if (phase === "post_close") {
    const candleResult = await ingestCandlesWithFallback({
      providerOrder: config.candlePriority,
      providersByKey,
      instruments,
      marketDate,
      bootstrapDays: config.bootstrapDays,
    });
    warnings.push(...candleResult.warnings);
    candleRows = candleResult.candleRows;
    candleSymbolsCovered = candleResult.coveredSymbols;
    candleSymbolsMissing = candleResult.missingSymbols;
    candleProviders = candleResult.providersUsed;
  }

  return {
    phase,
    marketDate,
    instrumentScope: instruments.length,
    providerUsed: {
      quotes: quotesResult.providerKey,
      fiiDii: fiiResult.providerKey,
      breadth: breadthResult.providerKey,
      candles: candleProviders,
    },
    counts: {
      symbolsSynced,
      quoteSnapshots,
      fiiDiiRows,
      breadthRows,
      candleRows,
      candleSymbolsCovered,
      candleSymbolsMissing,
    },
    warnings,
  };
}

export async function runFreePreMarketSync(marketDate?: string): Promise<FreeDataSyncResult> {
  return runFreeDataSync("pre_market", marketDate);
}

export async function runFreePostCloseSync(marketDate?: string): Promise<FreeDataSyncResult> {
  return runFreeDataSync("post_close", marketDate);
}
