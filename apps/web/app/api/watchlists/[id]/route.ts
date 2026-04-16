import { NextResponse } from "next/server";
import { prisma } from "@ibo/db";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;

    const watchlist = await prisma.watchlist.findUnique({
      where: { id },
      include: {
        items: {
          where: { isActive: true },
          include: {
            instrument: {
              select: {
                symbol: true,
                companyName: true,
                sector: true,
                marketCapBucket: true,
              },
            },
          },
          orderBy: { addedAt: "desc" },
        },
      },
    });

    if (!watchlist) {
      return NextResponse.json(
        { error: "Watchlist not found" },
        { status: 404 },
      );
    }

    return NextResponse.json({
      data: {
        id: watchlist.id,
        name: watchlist.name,
        description: watchlist.description,
        kind: watchlist.kind,
        createdAt: watchlist.createdAt.toISOString(),
        updatedAt: watchlist.updatedAt.toISOString(),
        items: watchlist.items.map((item) => ({
          id: item.id,
          symbol: item.instrument.symbol,
          companyName: item.instrument.companyName,
          sector: item.instrument.sector,
          marketCapBucket: item.instrument.marketCapBucket,
          notes: item.notes,
          tags: item.tagsJson ?? [],
          addedAt: item.addedAt.toISOString(),
        })),
      },
    });
  } catch (error) {
    console.error("GET /api/watchlists/[id] error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;

    const watchlist = await prisma.watchlist.findUnique({ where: { id } });

    if (!watchlist) {
      return NextResponse.json(
        { error: "Watchlist not found" },
        { status: 404 },
      );
    }

    // WatchlistItem has onDelete: Cascade, so items are removed automatically
    await prisma.watchlist.delete({ where: { id } });

    await prisma.auditEvent.create({
      data: {
        actor: "admin",
        action: "watchlist_deleted",
        entityType: "Watchlist",
        entityId: id,
        details: { name: watchlist.name },
      },
    });

    return NextResponse.json({
      data: { deleted: true, id },
    });
  } catch (error) {
    console.error("DELETE /api/watchlists/[id] error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
