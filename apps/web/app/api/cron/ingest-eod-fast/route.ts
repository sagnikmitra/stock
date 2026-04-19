import { NextResponse } from "next/server";
import { prisma } from "@ibo/db";
import { acquireCronLock, releaseCronLock, withRetries } from "../_scheduler";
import { ingestLatestYahooForUniverse } from "../../../../../worker/src/ingestion/candles";

/**
 * Fast EOD ingestion. Runs ~15-20 min after NSE close.
 * Pulls the last few daily bars per instrument from Yahoo Finance so the
 * current-day candle is present in the DB with OHLCV (no delivery % yet —
 * that is filled by the enrich cron later in the evening).
 */
export async function GET(req: Request) {
  const authHeader = req.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const todayStr = new Date().toISOString().split("T")[0];
  const { searchParams } = new URL(req.url);
  const force = searchParams.get("force") === "1";
  const universeLimit = Number(searchParams.get("limit") ?? "0");
  const lookbackDays = Number(searchParams.get("lookback") ?? "5");

  const lock = await acquireCronLock({
    jobKey: "ingest_eod_fast",
    marketDate: todayStr,
    force,
  });
  if (!lock.canRun) {
    return NextResponse.json({
      data: { status: "skipped", reason: lock.reason, marketDate: todayStr },
    });
  }

  try {
    const instruments = await prisma.instrument.findMany({
      where: { isActive: true },
      select: { symbol: true },
      orderBy: { symbol: "asc" },
      ...(universeLimit > 0 ? { take: universeLimit } : {}),
    });
    const symbols = instruments.map((i) => i.symbol);

    const result = await withRetries(
      async () => ingestLatestYahooForUniverse(symbols, lookbackDays),
      2,
    );

    await releaseCronLock({
      lockKey: lock.lockKey,
      status: "completed",
      details: { marketDate: todayStr, ...result, universe: symbols.length },
    });

    return NextResponse.json({
      data: { marketDate: todayStr, universe: symbols.length, ...result },
    });
  } catch (error) {
    await releaseCronLock({
      lockKey: lock.lockKey,
      status: "failed",
      details: {
        marketDate: todayStr,
        error: error instanceof Error ? error.message : "Unknown error",
      },
    });
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Internal server error" },
      { status: 500 },
    );
  }
}
