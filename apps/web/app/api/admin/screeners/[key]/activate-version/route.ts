import { NextResponse } from "next/server";
import { prisma } from "@ibo/db";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ key: string }> },
) {
  try {
    const { key } = await params;
    const body = await req.json();
    const version = Number(body.version);

    if (!Number.isInteger(version) || version < 1) {
      return NextResponse.json(
        { error: "version must be a positive integer" },
        { status: 400 },
      );
    }

    const screener = await prisma.screener.findUnique({
      where: { key },
      include: { versions: true },
    });

    if (!screener) {
      return NextResponse.json({ error: `Screener '${key}' not found` }, { status: 404 });
    }

    const target = screener.versions.find((item) => item.version === version);
    if (!target) {
      return NextResponse.json(
        { error: `Version ${version} not found for screener '${key}'` },
        { status: 404 },
      );
    }

    await prisma.$transaction([
      prisma.screenerVersion.updateMany({
        where: { screenerId: screener.id },
        data: { isActive: false },
      }),
      prisma.screenerVersion.update({
        where: { id: target.id },
        data: { isActive: true },
      }),
    ]);

    await prisma.auditEvent.create({
      data: {
        actor: "admin",
        action: "screener_version_activated",
        entityType: "Screener",
        entityId: screener.id,
        details: {
          screenerKey: key,
          activatedVersion: version,
        },
      },
    });

    return NextResponse.json({
      data: {
        screenerKey: key,
        activatedVersion: version,
      },
    });
  } catch (error) {
    console.error("POST /api/admin/screeners/[key]/activate-version error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
