import { NextResponse } from "next/server";
import { prisma } from "@ibo/db";

const VALID_PIPELINES = ["pre-market", "post-close", "month-end"] as const;
type Pipeline = (typeof VALID_PIPELINES)[number];

function isValidPipeline(value: unknown): value is Pipeline {
  return typeof value === "string" && VALID_PIPELINES.includes(value as Pipeline);
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { pipeline } = body;
    const force = Boolean(body.force);
    const attempts = typeof body.attempts === "number" ? body.attempts : 1;

    if (!isValidPipeline(pipeline)) {
      return NextResponse.json(
        {
          error: `Invalid 'pipeline'. Must be one of: ${VALID_PIPELINES.join(", ")}`,
        },
        { status: 400 },
      );
    }

    const triggeredAt = new Date().toISOString();

    console.log(
      `[cron-trigger] Pipeline "${pipeline}" manually triggered at ${triggeredAt}`,
    );

    await prisma.auditEvent.create({
      data: {
        actor: "admin",
        action: "cron_pipeline_triggered",
        entityType: "CronPipeline",
        entityId: pipeline,
        details: {
          pipeline,
          triggeredAt,
          force,
          attempts,
          note: "Manual trigger via admin API. Actual execution handled by worker/cron endpoint.",
        },
      },
    });

    return NextResponse.json({
      data: {
        pipeline,
        triggeredAt,
        force,
        attempts,
        status: "acknowledged",
        message: `Pipeline '${pipeline}' trigger acknowledged.`,
      },
    });
  } catch (error) {
    console.error("POST /api/admin/cron/trigger error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
