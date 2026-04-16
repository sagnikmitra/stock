import { NextResponse } from "next/server";
import { prisma } from "@ibo/db";

const VALID_SEVERITIES = ["low", "medium", "high"] as const;

export async function GET() {
  const records = await prisma.ambiguityRecord.findMany({
    include: { strategy: { select: { key: true, name: true } } },
    orderBy: [{ severity: "desc" }, { key: "asc" }],
  });

  return NextResponse.json({ data: records });
}

export async function PATCH(req: Request) {
  try {
    const body = await req.json();
    const { key, normalizedNote, severity, uiBehavior } = body;

    if (typeof key !== "string" || key.trim().length === 0) {
      return NextResponse.json({ error: "key is required" }, { status: 400 });
    }

    const existing = await prisma.ambiguityRecord.findUnique({ where: { key } });
    if (!existing) {
      return NextResponse.json({ error: `Ambiguity '${key}' not found` }, { status: 404 });
    }

    if (severity !== undefined && !VALID_SEVERITIES.includes(severity)) {
      return NextResponse.json({ error: "severity must be low|medium|high" }, { status: 400 });
    }

    const updated = await prisma.ambiguityRecord.update({
      where: { key },
      data: {
        normalizedNote:
          normalizedNote !== undefined ? String(normalizedNote) : existing.normalizedNote,
        severity: severity ?? existing.severity,
        uiBehavior: uiBehavior !== undefined ? String(uiBehavior) : existing.uiBehavior,
      },
    });

    await prisma.auditEvent.create({
      data: {
        actor: "admin",
        action: "ambiguity_updated",
        entityType: "AmbiguityRecord",
        entityId: updated.id,
        details: {
          key: updated.key,
          severity: updated.severity,
          uiBehavior: updated.uiBehavior,
        },
      },
    });

    return NextResponse.json({ data: updated });
  } catch (error) {
    console.error("PATCH /api/admin/ambiguities error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
