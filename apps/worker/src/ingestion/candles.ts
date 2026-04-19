import { prisma } from "@ibo/db";
import { Timeframe as TFEnum } from "@ibo/types";
import type { BhavcopyRow } from "../adapters/nse-bhavcopy";
import { YahooFinanceAdapter } from "../adapters/yahoo-finance";
import { NseBhavcopyAdapter } from "../adapters/nse-bhavcopy";

/**
 * Provider resolver — looks up Provider row by key and caches the id.
 * Providers table is seeded, so this is mostly a cached ID lookup.
 */
const providerIdCache: Record<string, string | null> = {};

async function providerIdByKey(key: string): Promise<string | null> {
  if (providerIdCache[key] !== undefined) return providerIdCache[key]!;
  const row = await prisma.provider.findUnique({ where: { key }, select: { id: true } });
  providerIdCache[key] = row?.id ?? null;
  return providerIdCache[key];
}

const NSE_EXCHANGE_CODE = "NSE";
const exchangeCache: Record<string, string> = {};

async function exchangeIdByCode(code: string): Promise<string> {
  if (exchangeCache[code]) return exchangeCache[code];
  const row = await prisma.exchange.findFirst({ where: { code } });
  if (!row) throw new Error(`Exchange not seeded: ${code}`);
  exchangeCache[code] = row.id;
  return row.id;
}

export interface InstrumentLite {
  id: string;
  symbol: string;
}

/**
 * Upsert instrument by (exchange, symbol). Returns its id. Used when
 * bhavcopy or yahoo returns a symbol we haven't catalogued yet.
 */
export async function ensureInstrument(
  symbol: string,
  companyName?: string,
  opts?: { sector?: string; industry?: string; marketCapBucket?: string; isin?: string },
): Promise<string> {
  const exchangeId = await exchangeIdByCode(NSE_EXCHANGE_CODE);
  const sym = symbol.toUpperCase();
  const found = await prisma.instrument.findUnique({
    where: { exchangeId_symbol: { exchangeId, symbol: sym } },
    select: { id: true },
  });
  if (found) return found.id;
  const created = await prisma.instrument.create({
    data: {
      exchangeId,
      symbol: sym,
      companyName: companyName ?? sym,
      sector: opts?.sector,
      industry: opts?.industry,
      marketCapBucket: opts?.marketCapBucket,
      isin: opts?.isin,
    },
    select: { id: true },
  });
  return created.id;
}

/**
 * Write bhavcopy rows into Candle table. Upserts by (instrumentId, timeframe, ts).
 * Ensures instruments are created on first sight.
 */
export async function writeBhavcopyCandles(rows: BhavcopyRow[]): Promise<{
  written: number;
  instrumentsCreated: number;
}> {
  const providerId = await providerIdByKey("nse_bhavcopy");
  let written = 0;
  let instrumentsCreated = 0;
  for (const row of rows) {
    const id = await ensureInstrumentCounted(row.symbol, row.symbol, () => instrumentsCreated++);
    const ts = new Date(`${row.date}T00:00:00.000Z`);
    await prisma.candle.upsert({
      where: {
        instrumentId_timeframe_ts: { instrumentId: id, timeframe: TFEnum.D1, ts },
      },
      update: {
        open: row.open,
        high: row.high,
        low: row.low,
        close: row.close,
        volume: BigInt(Math.round(row.totalQty || 0)),
        deliveryPct: Number.isFinite(row.deliveryPct) ? row.deliveryPct : null,
        providerId,
        sourceAsOf: new Date(),
      },
      create: {
        instrumentId: id,
        timeframe: TFEnum.D1,
        ts,
        open: row.open,
        high: row.high,
        low: row.low,
        close: row.close,
        volume: BigInt(Math.round(row.totalQty || 0)),
        deliveryPct: Number.isFinite(row.deliveryPct) ? row.deliveryPct : null,
        providerId,
        sourceAsOf: new Date(),
      },
    });
    written++;
  }
  return { written, instrumentsCreated };
}

/**
 * Enrich delivery % on an already-written Candle (update in place only).
 * Used by the late-evening bhavcopy enrichment cron.
 */
export async function enrichDeliveryPct(rows: BhavcopyRow[]): Promise<number> {
  let updated = 0;
  for (const row of rows) {
    if (!Number.isFinite(row.deliveryPct)) continue;
    const exchangeId = await exchangeIdByCode(NSE_EXCHANGE_CODE);
    const inst = await prisma.instrument.findUnique({
      where: { exchangeId_symbol: { exchangeId, symbol: row.symbol } },
      select: { id: true },
    });
    if (!inst) continue;
    const ts = new Date(`${row.date}T00:00:00.000Z`);
    const res = await prisma.candle.updateMany({
      where: { instrumentId: inst.id, timeframe: TFEnum.D1, ts },
      data: { deliveryPct: row.deliveryPct, sourceAsOf: new Date() },
    });
    updated += res.count;
  }
  return updated;
}

async function ensureInstrumentCounted(
  symbol: string,
  companyName: string,
  onCreate: () => void,
): Promise<string> {
  const exchangeId = await exchangeIdByCode(NSE_EXCHANGE_CODE);
  const sym = symbol.toUpperCase();
  const found = await prisma.instrument.findUnique({
    where: { exchangeId_symbol: { exchangeId, symbol: sym } },
    select: { id: true },
  });
  if (found) return found.id;
  const created = await prisma.instrument.create({
    data: { exchangeId, symbol: sym, companyName },
    select: { id: true },
  });
  onCreate();
  return created.id;
}

/**
 * Fetch Yahoo daily candles for a single symbol and upsert into DB.
 * Returns rows written.
 */
export async function backfillYahooSymbol(
  symbol: string,
  from: string,
  to: string,
  adapter?: YahooFinanceAdapter,
  mode: "bulk" | "upsert" = "bulk",
): Promise<number> {
  const yf = adapter ?? new YahooFinanceAdapter();
  const providerId = await providerIdByKey("yahoo_finance");
  const series = await yf.getHistoricalCandles({
    symbol,
    timeframe: TFEnum.D1,
    from,
    to,
  });
  if (series.candles.length === 0) return 0;
  const instrumentId = await ensureInstrument(symbol, symbol);
  const now = new Date();
  const rows = series.candles.map((c) => ({
    instrumentId,
    timeframe: TFEnum.D1,
    ts: new Date(`${c.ts.toISOString().slice(0, 10)}T00:00:00.000Z`),
    open: c.open,
    high: c.high,
    low: c.low,
    close: c.close,
    volume: BigInt(Math.round(c.volume || 0)),
    providerId,
    sourceAsOf: now,
  }));
  if (mode === "bulk") {
    const res = await prisma.candle.createMany({ data: rows, skipDuplicates: true });
    return res.count;
  }
  let written = 0;
  for (const r of rows) {
    await prisma.candle.upsert({
      where: { instrumentId_timeframe_ts: { instrumentId, timeframe: TFEnum.D1, ts: r.ts } },
      update: { open: r.open, high: r.high, low: r.low, close: r.close, volume: r.volume, providerId, sourceAsOf: now },
      create: r,
    });
    written++;
  }
  return written;
}

/**
 * Fast-path daily ingestion for today: pulls last ~5 daily candles per
 * symbol from Yahoo and upserts. Used by the 15:50 IST cron.
 */
export async function ingestLatestYahooForUniverse(
  symbols: string[],
  lookbackDays = 5,
): Promise<{ symbolsCovered: number; candleRows: number; failures: number }> {
  const yf = new YahooFinanceAdapter();
  const to = new Date();
  const from = new Date(to);
  from.setUTCDate(from.getUTCDate() - lookbackDays);
  const toIso = to.toISOString().slice(0, 10);
  const fromIso = from.toISOString().slice(0, 10);

  let covered = 0;
  let candleRows = 0;
  let failures = 0;

  const concurrency = 6;
  for (let i = 0; i < symbols.length; i += concurrency) {
    const batch = symbols.slice(i, i + concurrency);
    const results = await Promise.all(
      batch.map(async (sym) => {
        try {
          const n = await backfillYahooSymbol(sym, fromIso, toIso, yf, "upsert");
          return { ok: true, n };
        } catch {
          return { ok: false, n: 0 };
        }
      }),
    );
    for (const r of results) {
      if (r.ok) {
        covered++;
        candleRows += r.n;
      } else {
        failures++;
      }
    }
  }

  return { symbolsCovered: covered, candleRows, failures };
}

/**
 * Fetch bhavcopy for a market date and write all rows to DB. If bhavcopy
 * not yet published (404), returns null.
 */
export async function ingestBhavcopyForDate(marketDate: string): Promise<{
  written: number;
  instrumentsCreated: number;
  date: string;
} | null> {
  const adapter = new NseBhavcopyAdapter();
  const rows = await adapter.fetchBhavcopy(marketDate);
  if (!rows || rows.length === 0) return null;
  const { written, instrumentsCreated } = await writeBhavcopyCandles(rows);
  return { written, instrumentsCreated, date: marketDate };
}
