import { NextResponse } from "next/server";
import { prisma } from "@ibo/db";

export async function GET() {
  try {
    const flags = await prisma.featureFlag.findMany({
      orderBy: { key: "asc" },
    });

    const data = flags.map((f) => ({
      id: f.id,
      key: f.key,
      name: f.name,
      isEnabled: f.isEnabled,
      notes: f.notes,
    }));

    return NextResponse.json({ data });
  } catch (error) {
    console.error("GET /api/admin/feature-flags error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

export async function PATCH(req: Request) {
  try {
    const body = await req.json();
    const { key, isEnabled } = body;

    if (typeof key !== "string" || key.trim() === "") {
      return NextResponse.json(
        { error: "Missing or invalid 'key' (string required)" },
        { status: 400 },
      );
    }

    if (typeof isEnabled !== "boolean") {
      return NextResponse.json(
        { error: "Missing or invalid 'isEnabled' (boolean required)" },
        { status: 400 },
      );
    }

    const flag = await prisma.featureFlag.findUnique({ where: { key } });

    if (!flag) {
      return NextResponse.json(
        { error: `Feature flag '${key}' not found` },
        { status: 404 },
      );
    }

    const updated = await prisma.featureFlag.update({
      where: { key },
      data: { isEnabled },
    });

    await prisma.auditEvent.create({
      data: {
        actor: "admin",
        action: "feature_flag_toggled",
        entityType: "FeatureFlag",
        entityId: flag.id,
        details: {
          key,
          previousValue: flag.isEnabled,
          newValue: isEnabled,
        },
      },
    });

    return NextResponse.json({
      data: {
        key: updated.key,
        name: updated.name,
        isEnabled: updated.isEnabled,
      },
    });
  } catch (error) {
    console.error("PATCH /api/admin/feature-flags error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
