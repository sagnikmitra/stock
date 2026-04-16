import { NextResponse } from "next/server";
import { prisma } from "@ibo/db";

const VALID_STATUSES = ["active", "draft", "deprecated", "archived"] as const;
type ValidStatus = (typeof VALID_STATUSES)[number];

function isValidStatus(value: unknown): value is ValidStatus {
  return typeof value === "string" && VALID_STATUSES.includes(value as ValidStatus);
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ key: string }> },
) {
  try {
    const { key } = await params;
    const body = await req.json();
    const { status } = body;

    if (!isValidStatus(status)) {
      return NextResponse.json(
        {
          error: `Invalid 'status'. Must be one of: ${VALID_STATUSES.join(", ")}`,
        },
        { status: 400 },
      );
    }

    const strategy = await prisma.strategy.findUnique({ where: { key } });

    if (!strategy) {
      return NextResponse.json(
        { error: `Strategy '${key}' not found` },
        { status: 404 },
      );
    }

    const previousStatus = strategy.status;

    const updated = await prisma.strategy.update({
      where: { key },
      data: { status },
    });

    await prisma.auditEvent.create({
      data: {
        actor: "admin",
        action: "strategy_status_updated",
        entityType: "Strategy",
        entityId: strategy.id,
        details: {
          strategyKey: key,
          previousStatus,
          newStatus: status,
        },
      },
    });

    return NextResponse.json({
      data: {
        key: updated.key,
        name: updated.name,
        status: updated.status,
      },
    });
  } catch (error) {
    console.error("PATCH /api/admin/strategies/[key] error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
