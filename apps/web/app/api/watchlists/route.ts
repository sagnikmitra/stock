import { NextResponse } from "next/server";
import { prisma } from "@ibo/db";

export async function GET() {
  try {
    const watchlists = await prisma.watchlist.findMany({
      include: {
        _count: { select: { items: true } },
      },
      orderBy: { updatedAt: "desc" },
    });

    const data = watchlists.map((w) => ({
      id: w.id,
      name: w.name,
      description: w.description,
      kind: w.kind,
      itemCount: w._count.items,
      createdAt: w.createdAt.toISOString(),
      updatedAt: w.updatedAt.toISOString(),
    }));

    return NextResponse.json({ data });
  } catch (error) {
    console.error("GET /api/watchlists error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, description } = body;

    if (typeof name !== "string" || name.trim() === "") {
      return NextResponse.json(
        { error: "Missing or invalid 'name' (non-empty string required)" },
        { status: 400 },
      );
    }

    const watchlist = await prisma.watchlist.create({
      data: {
        name: name.trim(),
        description: description?.trim() || null,
        kind: "manual",
      },
    });

    await prisma.auditEvent.create({
      data: {
        actor: "admin",
        action: "watchlist_created",
        entityType: "Watchlist",
        entityId: watchlist.id,
        details: { name: watchlist.name },
      },
    });

    return NextResponse.json(
      {
        data: {
          id: watchlist.id,
          name: watchlist.name,
          description: watchlist.description,
          kind: watchlist.kind,
          createdAt: watchlist.createdAt.toISOString(),
        },
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("POST /api/watchlists error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
