import { NextResponse } from "next/server";
import { runWeeklySummaryPipelineCore } from "@ibo/pipelines";
import { acquireCronLock, releaseCronLock, withRetries } from "../_scheduler";

export async function GET(req: Request) {
  const authHeader = req.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const todayStr = new Date().toISOString().split("T")[0];
  const { searchParams } = new URL(req.url);
  const force = searchParams.get("force") === "1";
  const retryAttempts = Number(searchParams.get("attempts") ?? 2);

  const lock = await acquireCronLock({
    jobKey: "weekly",
    marketDate: todayStr,
    force,
  });

  if (!lock.canRun) {
    return NextResponse.json({
      data: { status: "skipped", reason: lock.reason, marketDate: todayStr },
    });
  }

  try {
    const result = await withRetries(
      async () => runWeeklySummaryPipelineCore(),
      Number.isFinite(retryAttempts) && retryAttempts > 0 ? retryAttempts : 2,
    );

    await releaseCronLock({
      lockKey: lock.lockKey,
      status: "completed",
      details: { marketDate: todayStr, ...result },
    });

    return NextResponse.json({ data: { status: "completed", ...result } });
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
      { error: error instanceof Error ? error.message : "Weekly pipeline failed" },
      { status: 500 },
    );
  }
}
