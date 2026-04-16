import { NextResponse } from "next/server";
import { runWeeklySummaryPipelineCore } from "@ibo/pipelines";

export async function GET(req: Request) {
  const authHeader = req.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const result = await runWeeklySummaryPipelineCore();
    return NextResponse.json({ data: { status: "completed", ...result } });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Weekly pipeline failed" },
      { status: 500 },
    );
  }
}
