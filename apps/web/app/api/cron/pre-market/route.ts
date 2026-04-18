import { NextResponse } from "next/server";
import { runPreMarketPipelineCore } from "@ibo/pipelines";
import { acquireCronLock, releaseCronLock, withRetries } from "../_scheduler";
import { isFreeDataSyncEnabled, runFreePreMarketSync } from "../../../../../worker/src/ingestion/free-mode";

export async function GET(req: Request) {
  const authHeader = req.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const force = searchParams.get("force") === "1";
  const retryAttempts = Number(searchParams.get("attempts") ?? 2);
  const todayStr = new Date().toISOString().split("T")[0];

  const lock = await acquireCronLock({
    jobKey: "pre_market",
    marketDate: todayStr,
    force,
  });

  if (!lock.canRun) {
    return NextResponse.json({
      data: { status: "skipped", reason: lock.reason, marketDate: todayStr },
    });
  }

  try {
    let ingestion: Awaited<ReturnType<typeof runFreePreMarketSync>> | null = null;
    let ingestionError: string | null = null;
    if (isFreeDataSyncEnabled()) {
      try {
        ingestion = await withRetries(
          async () => runFreePreMarketSync(todayStr),
          1,
        );
      } catch (error) {
        ingestionError = error instanceof Error ? error.message : "Unknown free-data sync error";
      }
    }

    const result = await withRetries(
      async () => runPreMarketPipelineCore(),
      Number.isFinite(retryAttempts) && retryAttempts > 0 ? retryAttempts : 2,
    );

    const payload = {
      ...result,
      ingestion,
      ingestionError,
    };

    await releaseCronLock({
      lockKey: lock.lockKey,
      status: "completed",
      details: {
        marketDate: todayStr,
        ingestionWarnings: ingestion?.warnings ?? [],
        ingestionError,
      },
    });

    return NextResponse.json({ data: payload });
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
