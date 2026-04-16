import { NextResponse } from "next/server";
import { prisma } from "@ibo/db";

export async function GET() {
  const resources = await prisma.externalResource.findMany({
    orderBy: [{ category: "asc" }, { title: "asc" }],
  });

  return NextResponse.json({
    data: resources,
  });
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { key, title, url, category, provider, notes } = body;

    if (!key || !title || !url || !category) {
      return NextResponse.json(
        { error: "key, title, url, and category are required" },
        { status: 400 },
      );
    }

    const resource = await prisma.externalResource.upsert({
      where: { key },
      update: { title, url, category, provider: provider ?? null, notes: notes ?? null },
      create: { key, title, url, category, provider: provider ?? null, notes: notes ?? null },
    });

    await prisma.auditEvent.create({
      data: {
        actor: "admin",
        action: "reference_upserted",
        entityType: "ExternalResource",
        entityId: resource.id,
        details: { key: resource.key, category: resource.category },
      },
    });

    return NextResponse.json({ data: resource }, { status: 201 });
  } catch (error) {
    console.error("POST /api/admin/references error", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const body = await req.json();
    const { key, title, url, category, provider, notes } = body;

    if (!key) {
      return NextResponse.json({ error: "key is required" }, { status: 400 });
    }

    const existing = await prisma.externalResource.findUnique({ where: { key } });
    if (!existing) {
      return NextResponse.json({ error: `Reference '${key}' not found` }, { status: 404 });
    }

    const updated = await prisma.externalResource.update({
      where: { key },
      data: {
        title: title ?? existing.title,
        url: url ?? existing.url,
        category: category ?? existing.category,
        provider: provider !== undefined ? provider : existing.provider,
        notes: notes !== undefined ? notes : existing.notes,
      },
    });

    await prisma.auditEvent.create({
      data: {
        actor: "admin",
        action: "reference_updated",
        entityType: "ExternalResource",
        entityId: updated.id,
        details: { key: updated.key, category: updated.category },
      },
    });

    return NextResponse.json({ data: updated });
  } catch (error) {
    console.error("PATCH /api/admin/references error", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
