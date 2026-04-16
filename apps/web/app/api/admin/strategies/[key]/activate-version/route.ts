import { NextResponse } from "next/server";
import { prisma } from "@ibo/db";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ key: string }> },
) {
  try {
    const { key } = await params;
    const body = await req.json();
    const { version } = body;

    if (typeof version !== "number" || !Number.isInteger(version) || version < 1) {
      return NextResponse.json(
        { error: "Missing or invalid 'version' (positive integer required)" },
        { status: 400 },
      );
    }

    const strategy = await prisma.strategy.findUnique({
      where: { key },
      include: { versions: true },
    });

    if (!strategy) {
      return NextResponse.json(
        { error: `Strategy '${key}' not found` },
        { status: 404 },
      );
    }

    const targetVersion = strategy.versions.find((v) => v.version === version);

    if (!targetVersion) {
      return NextResponse.json(
        { error: `Version ${version} not found for strategy '${key}'` },
        { status: 404 },
      );
    }

    // Deactivate all versions for this strategy, then activate the target
    await prisma.$transaction([
      prisma.strategyVersion.updateMany({
        where: { strategyId: strategy.id },
        data: { isActive: false },
      }),
      prisma.strategyVersion.update({
        where: { id: targetVersion.id },
        data: { isActive: true },
      }),
    ]);

    await prisma.auditEvent.create({
      data: {
        actor: "admin",
        action: "strategy_version_activated",
        entityType: "Strategy",
        entityId: strategy.id,
        details: {
          strategyKey: key,
          activatedVersion: version,
          previousActiveVersions: strategy.versions
            .filter((v) => v.isActive)
            .map((v) => v.version),
        },
      },
    });

    return NextResponse.json({
      data: {
        strategyKey: key,
        activatedVersion: version,
      },
    });
  } catch (error) {
    console.error("POST /api/admin/strategies/[key]/activate-version error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
