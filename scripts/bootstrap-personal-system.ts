import { prisma } from "@ibo/db";
import { runPreMarketPipelineCore, runPostClosePipelineCore } from "@ibo/pipelines";
import { runFreePreMarketSync, runFreePostCloseSync } from "../apps/worker/src/ingestion/free-mode";
import { POST as runBacktestRoute } from "../apps/web/app/api/backtests/route";

const SYNTHETIC_DAYS = 280;
const TARGET_SYMBOLS = Number(process.env.BOOTSTRAP_TARGET_SYMBOLS ?? "30");
const FORCE_SYNTHETIC = ["1", "true", "yes"].includes((process.env.BOOTSTRAP_FORCE_SYNTHETIC ?? "0").toLowerCase());
const SKIP_FREE_SYNC = ["1", "true", "yes"].includes((process.env.BOOTSTRAP_SKIP_FREE_SYNC ?? "0").toLowerCase());

function toDateKey(date: Date): string {
  return date.toISOString().split("T")[0];
}

function symbolSeed(symbol: string): number {
  let hash = 0;
  for (let i = 0; i < symbol.length; i++) {
    hash = (hash * 31 + symbol.charCodeAt(i)) >>> 0;
  }
  return hash;
}

function generateSyntheticClose(prevClose: number, day: number, seed: number): number {
  const regime = seed % 4;
  const baseDrift =
    regime === 0 ? 0.0018
      : regime === 1 ? 0.0006
        : regime === 2 ? -0.0003
          : 0.0009;
  const endBoost = day > SYNTHETIC_DAYS - 25 ? 0.0018 : 0;
  const drift = baseDrift + endBoost + (((seed % 7) - 3) / 4000);
  const wave = Math.sin((day + seed) / (regime === 2 ? 5 : 8)) * (regime === 2 ? 0.02 : 0.01);
  const noise = Math.cos((day + seed) / 7) * 0.003;
  const next = prevClose * (1 + drift + wave + noise);
  return Math.max(5, next);
}

async function seedSyntheticCandlesIfNeeded(marketDate: string): Promise<{ symbolsSeeded: number; rows: number }> {
  const marketDateObj = new Date(`${marketDate}T00:00:00.000Z`);
  const provider = await prisma.provider.findUnique({ where: { key: "manual_import" }, select: { id: true } });
  const instruments = await prisma.instrument.findMany({
    where: { isActive: true },
    select: { id: true, symbol: true },
    orderBy: { symbol: "asc" },
    take: TARGET_SYMBOLS,
  });

  if (instruments.length === 0) return { symbolsSeeded: 0, rows: 0 };

  const counts = await prisma.candle.groupBy({
    by: ["instrumentId"],
    where: { instrumentId: { in: instruments.map((i) => i.id) }, timeframe: "D1" },
    _count: { _all: true },
  });
  const countByInstrument = new Map(counts.map((c) => [c.instrumentId, c._count._all]));

  const latestQuotes = await prisma.quoteSnapshot.findMany({
    where: { instrumentId: { in: instruments.map((i) => i.id) } },
    orderBy: [{ ts: "desc" }],
    select: { instrumentId: true, ltp: true },
    take: instruments.length * 3,
  });
  const quoteByInstrument = new Map<string, number>();
  for (const row of latestQuotes) {
    if (!quoteByInstrument.has(row.instrumentId)) {
      quoteByInstrument.set(row.instrumentId, Number(row.ltp));
    }
  }

  let symbolsSeeded = 0;
  let rows = 0;

  for (const instrument of instruments) {
    const existing = countByInstrument.get(instrument.id) ?? 0;
    if (!FORCE_SYNTHETIC && existing >= 220) continue;

    const seed = symbolSeed(instrument.symbol);
    const anchor = quoteByInstrument.get(instrument.id) ?? (80 + (seed % 800));
    let prevClose = Math.max(20, anchor * (0.75 + (seed % 20) / 100));

    for (let i = SYNTHETIC_DAYS - 1; i >= 0; i--) {
      const ts = new Date(marketDateObj);
      ts.setUTCDate(ts.getUTCDate() - i);

      let close = generateSyntheticClose(prevClose, SYNTHETIC_DAYS - i, seed);
      let open = prevClose * (1 + Math.sin((SYNTHETIC_DAYS - i + seed) / 11) * 0.003);
      let high = Math.max(open, close) * (1 + 0.004 + (seed % 3) / 1000);
      let low = Math.min(open, close) * (1 - 0.004 - (seed % 2) / 1000);
      let volume = BigInt(150000 + ((seed + i * 97) % 950000));
      let deliveryPct = 32 + ((seed + i) % 38);

      // Force deterministic "signal days" on the latest bar so screeners and
      // backtests have visible output in fresh personal setups.
      if (i === 0) {
        const profile = seed % 5;
        if (profile === 0) {
          open = prevClose * 0.99;
          close = prevClose * 1.08;
          high = close * 1.01;
          low = open * 0.995;
          volume = BigInt(2_400_000 + (seed % 250_000));
          deliveryPct = 58;
        } else if (profile === 1) {
          open = prevClose * 0.985;
          close = prevClose * 1.035;
          high = close * 1.008;
          low = open * 0.996;
          volume = BigInt(1_700_000 + (seed % 200_000));
          deliveryPct = 49;
        }
      }

      await prisma.candle.upsert({
        where: {
          instrumentId_timeframe_ts: {
            instrumentId: instrument.id,
            timeframe: "D1",
            ts,
          },
        },
        update: {
          open,
          high,
          low,
          close,
          volume,
          deliveryPct,
          providerId: provider?.id ?? null,
          sourceAsOf: new Date(),
        },
        create: {
          instrumentId: instrument.id,
          timeframe: "D1",
          ts,
          open,
          high,
          low,
          close,
          volume,
          deliveryPct,
          providerId: provider?.id ?? null,
          sourceAsOf: new Date(),
        },
      });

      prevClose = close;
      rows += 1;
    }

    symbolsSeeded += 1;
  }

  return { symbolsSeeded, rows };
}

async function run() {
  process.env.FREE_DATA_PREMARKET_SYMBOL_LIMIT = process.env.FREE_DATA_PREMARKET_SYMBOL_LIMIT ?? "30";
  process.env.FREE_DATA_POSTCLOSE_SYMBOL_LIMIT = process.env.FREE_DATA_POSTCLOSE_SYMBOL_LIMIT ?? "30";
  process.env.FREE_DATA_SYMBOL_UNIVERSE_LIMIT = process.env.FREE_DATA_SYMBOL_UNIVERSE_LIMIT ?? "0";
  process.env.FREE_DATA_BOOTSTRAP_DAYS = process.env.FREE_DATA_BOOTSTRAP_DAYS ?? "420";

  const marketDate = toDateKey(new Date());
  const oneWeekAgo = new Date();
  oneWeekAgo.setUTCDate(oneWeekAgo.getUTCDate() - 7);
  const startDate = toDateKey(oneWeekAgo);

  console.log("[bootstrap] marketDate", marketDate);

  const preSync = SKIP_FREE_SYNC ? null : await runFreePreMarketSync(marketDate);
  const postSync = SKIP_FREE_SYNC ? null : await runFreePostCloseSync(marketDate);

  const synthetic = await seedSyntheticCandlesIfNeeded(marketDate);

  const preDigest = await runPreMarketPipelineCore();
  const postDigest = await runPostClosePipelineCore();

  const preferredBacktestStrategies = [
    "swing_ema_9_15_st_4h",
    "swing_sma_44",
    "swing_sma_13_34_200",
    "swing_breakout",
    "swing_abc",
    "swing_btst",
  ];

  let backtestStatus = "skipped";
  let backtestId: string | null = null;
  let backtestStrategyKey: string | null = null;
  const attempts: Array<{ strategyKey: string; status: number; trades: number }> = [];

  for (const strategyKey of preferredBacktestStrategies) {
    const req = new Request("http://localhost/api/backtests", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        strategyKey,
        startDate,
        endDate: marketDate,
        universe: "active_nse",
        capital: 500000,
        riskPerTradePct: 2,
      }),
    });
    const res = await runBacktestRoute(req);
    const payload = await res.json();
    const trades = Number(payload?.data?.metrics?.totalTrades ?? 0);
    attempts.push({ strategyKey, status: res.status, trades });

    backtestStatus = String(res.status);
    backtestId = payload?.data?.backtestId ?? null;
    backtestStrategyKey = strategyKey;

    if (res.ok && trades > 0) {
      break;
    }
  }

  const [digests, preCount, postCount, screenerRuns, strategyRuns, backtests, candles, instruments] = await Promise.all([
    prisma.digest.count(),
    prisma.digest.count({ where: { digestType: "pre_market" } }),
    prisma.digest.count({ where: { digestType: "post_close" } }),
    prisma.screenerRun.count({ where: { status: "completed" } }),
    prisma.strategyRun.count({ where: { status: "completed" } }),
    prisma.backtest.count(),
    prisma.candle.count({ where: { timeframe: "D1" } }),
    prisma.instrument.count({ where: { isActive: true } }),
  ]);

  console.log("[bootstrap] summary", {
    preSync: {
      skipped: SKIP_FREE_SYNC,
      scope: preSync?.instrumentScope ?? null,
      counts: preSync?.counts ?? null,
      warnings: preSync?.warnings.length ?? 0,
    },
    postSync: {
      skipped: SKIP_FREE_SYNC,
      scope: postSync?.instrumentScope ?? null,
      counts: postSync?.counts ?? null,
      warnings: postSync?.warnings.length ?? 0,
    },
    synthetic,
    preDigest,
    postDigest,
    backtestStatus,
    backtestId,
    backtestStrategyKey,
    backtestAttempts: attempts,
    totals: {
      digests,
      preCount,
      postCount,
      screenerRuns,
      strategyRuns,
      backtests,
      candles,
      instruments,
    },
  });
}

run()
  .catch((error) => {
    console.error("[bootstrap] failed", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
