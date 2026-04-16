import { NextResponse } from "next/server";
import { prisma } from "@ibo/db";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { symbol, notes, tags } = body;

    if (typeof symbol !== "string" || symbol.trim() === "") {
      return NextResponse.json(
        { error: "Missing or invalid 'symbol' (non-empty string required)" },
        { status: 400 },
      );
    }

    if (tags !== undefined && !Array.isArray(tags)) {
      return NextResponse.json(
        { error: "'tags' must be an array of strings" },
        { status: 400 },
      );
    }

    const watchlist = await prisma.watchlist.findUnique({ where: { id } });

    if (!watchlist) {
      return NextResponse.json(
        { error: "Watchlist not found" },
        { status: 404 },
      );
    }

    // Find instrument by symbol (case-insensitive)
    const instrument = await prisma.instrument.findFirst({
      where: { symbol: { equals: symbol.trim().toUpperCase() } },
    });

    if (!instrument) {
      return NextResponse.json(
        { error: `Instrument with symbol '${symbol}' not found` },
        { status: 404 },
      );
    }

    // Check for existing (potentially inactive) item
    const existing = await prisma.watchlistItem.findUnique({
      where: {
        watchlistId_instrumentId: {
          watchlistId: id,
          instrumentId: instrument.id,
        },
      },
    });

    let item;

    if (existing) {
      // Reactivate if inactive, or update notes/tags
      item = await prisma.watchlistItem.update({
        where: { id: existing.id },
        data: {
          isActive: true,
          notes: notes?.trim() || existing.notes,
          tagsJson: tags ?? existing.tagsJson,
        },
      });
    } else {
      item = await prisma.watchlistItem.create({
        data: {
          watchlistId: id,
          instrumentId: instrument.id,
          notes: notes?.trim() || null,
          tagsJson: tags ?? null,
        },
      });
    }

    await prisma.auditEvent.create({
      data: {
        actor: "admin",
        action: "watchlist_item_added",
        entityType: "WatchlistItem",
        entityId: item.id,
        details: {
          watchlistId: id,
          symbol: instrument.symbol,
          reactivated: !!existing,
        },
      },
    });

    return NextResponse.json(
      {
        data: {
          id: item.id,
          watchlistId: id,
          symbol: instrument.symbol,
          notes: item.notes,
          tags: item.tagsJson,
          addedAt: item.addedAt.toISOString(),
        },
      },
      { status: existing ? 200 : 201 },
    );
  } catch (error) {
    console.error("POST /api/watchlists/[id]/items error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { symbol } = body;

    if (typeof symbol !== "string" || symbol.trim() === "") {
      return NextResponse.json(
        { error: "Missing or invalid 'symbol' (non-empty string required)" },
        { status: 400 },
      );
    }

    const watchlist = await prisma.watchlist.findUnique({ where: { id } });

    if (!watchlist) {
      return NextResponse.json(
        { error: "Watchlist not found" },
        { status: 404 },
      );
    }

    const instrument = await prisma.instrument.findFirst({
      where: { symbol: { equals: symbol.trim().toUpperCase() } },
    });

    if (!instrument) {
      return NextResponse.json(
        { error: `Instrument with symbol '${symbol}' not found` },
        { status: 404 },
      );
    }

    const item = await prisma.watchlistItem.findUnique({
      where: {
        watchlistId_instrumentId: {
          watchlistId: id,
          instrumentId: instrument.id,
        },
      },
    });

    if (!item || !item.isActive) {
      return NextResponse.json(
        { error: `'${symbol}' is not in this watchlist` },
        { status: 404 },
      );
    }

    // Soft-delete by setting isActive to false
    await prisma.watchlistItem.update({
      where: { id: item.id },
      data: { isActive: false },
    });

    await prisma.auditEvent.create({
      data: {
        actor: "admin",
        action: "watchlist_item_removed",
        entityType: "WatchlistItem",
        entityId: item.id,
        details: {
          watchlistId: id,
          symbol: instrument.symbol,
        },
      },
    });

    return NextResponse.json({
      data: { removed: true, symbol: instrument.symbol },
    });
  } catch (error) {
    console.error("DELETE /api/watchlists/[id]/items error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
