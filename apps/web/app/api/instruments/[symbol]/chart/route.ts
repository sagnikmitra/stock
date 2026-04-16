import { NextResponse } from "next/server";
import { prisma } from "@ibo/db";
import type { Timeframe } from "@ibo/types";

function asTimeframe(raw: string | null): Timeframe {
  const tf = (raw ?? "D1").toUpperCase();
  if (tf === "D1" || tf === "W1" || tf === "MN1") return tf;
  return "D1";
}

function toDate(raw: string | null): Date | undefined {
  if (!raw) return undefined;
  const dt = new Date(raw);
  return Number.isNaN(dt.getTime()) ? undefined : dt;
}

export async function GET(
  req: Request,
  { params }: { params: Promise<{ symbol: string }> },
) {
  const { symbol } = await params;
  const sym = symbol.toUpperCase();
  const { searchParams } = new URL(req.url);

  const timeframe = asTimeframe(searchParams.get("timeframe"));
  const from = toDate(searchParams.get("from"));
  const to = toDate(searchParams.get("to"));
  const limit = Number(searchParams.get("limit") ?? 0);

  const instrument = await prisma.instrument.findFirst({ where: { symbol: sym } });
  if (!instrument) return NextResponse.json({ error: "Symbol not found" }, { status: 404 });

  const rows = await prisma.candle.findMany({
    where: {
      instrumentId: instrument.id,
      timeframe,
      ts: {
        gte: from,
        lte: to,
      },
    },
    orderBy: { ts: limit > 0 ? "desc" : "asc" },
    take: limit > 0 ? limit : undefined,
  });

  const normalized = (limit > 0 ? rows.reverse() : rows).map((candle) => ({
    ts: candle.ts.toISOString(),
    open: Number(candle.open),
    high: Number(candle.high),
    low: Number(candle.low),
    close: Number(candle.close),
    volume: Number(candle.volume ?? 0),
    deliveryPct: candle.deliveryPct ? Number(candle.deliveryPct) : null,
  }));

  return NextResponse.json({ data: normalized });
}

