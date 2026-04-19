import { NextResponse } from "next/server";
import { acquireCronLock, releaseCronLock, withRetries } from "../_scheduler";
import { NseBhavcopyAdapter } from "../../../../../worker/src/adapters/nse-bhavcopy";
import { enrichDeliveryPct, writeBhavcopyCandles } from "../../../../../worker/src/ingestion/candles";

/**
 * Evening enrichment cron. Fetches the NSE security-wise bhavcopy for the
 * current market date (available ~17:30-18:00 IST) and:
 *   - Upserts today's candle (authoritative OHLC from the exchange).
 *   - Fills delivery % on existing candles (needed for breakout filters).
 *
 * Idempotent via CronJobLock on (ingest_eod_enrich, today).
 */
export async function GET(req: Request) {
  const authHeader = req.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const todayStr = new Date().toISOString().split("T")[0];
  const { searchParams } = new URL(req.url);
  const force = searchParams.get("force") === "1";
  const targetDate = searchParams.get("date") ?? todayStr;

  const lock = await acquireCronLock({
    jobKey: "ingest_eod_enrich",
    marketDate: todayStr,
    force,
  });
  if (!lock.canRun) {
    return NextResponse.json({
      data: { status: "skipped", reason: lock.reason, marketDate: todayStr },
    });
  }

  try {
    const adapter = new NseBhavcopyAdapter();
    const rows = await withRetries(
      async () => {
        const r = await adapter.fetchBhavcopy(targetDate);
        if (!r) throw new Error(`bhavcopy not available for ${targetDate}`);
        return r;
      },
      3,
    );

    const { written, instrumentsCreated } = await writeBhavcopyCandles(rows);
    const deliveryUpdates = await enrichDeliveryPct(rows);

    await releaseCronLock({
      lockKey: lock.lockKey,
      status: "completed",
      details: { marketDate: todayStr, targetDate, written, instrumentsCreated, deliveryUpdates },
    });

    return NextResponse.json({
      data: {
        marketDate: todayStr,
        targetDate,
        bhavcopyRows: rows.length,
        candleWrites: written,
        instrumentsCreated,
        deliveryUpdates,
      },
    });
  } catch (error) {
    await releaseCronLock({
      lockKey: lock.lockKey,
      status: "failed",
      details: {
        marketDate: todayStr,
        targetDate,
        error: error instanceof Error ? error.message : "Unknown error",
      },
    });
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Internal server error" },
      { status: 500 },
    );
  }
}
