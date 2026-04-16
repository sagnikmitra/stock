import { NextResponse } from "next/server";
import { prisma } from "@ibo/db";
import type { Timeframe } from "@ibo/types";

function asTimeframe(raw: string | null): Timeframe {
  const tf = (raw ?? "D1").toUpperCase();
  if (tf === "D1" || tf === "W1" || tf === "MN1") return tf;
  return "D1";
}

export async function GET(
  req: Request,
  { params }: { params: Promise<{ symbol: string }> },
) {
  const { symbol } = await params;
  const sym = symbol.toUpperCase();
  const timeframe = asTimeframe(new URL(req.url).searchParams.get("timeframe"));

  const instrument = await prisma.instrument.findFirst({ where: { symbol: sym } });
  if (!instrument) return NextResponse.json({ error: "Symbol not found" }, { status: 404 });

  const snapshot = await prisma.indicatorSnapshot.findFirst({
    where: { instrumentId: instrument.id, timeframe },
    orderBy: { ts: "desc" },
  });

  if (!snapshot) return NextResponse.json({ data: null });

  return NextResponse.json({
    data: {
      id: snapshot.id,
      symbol: sym,
      timeframe: snapshot.timeframe,
      ts: snapshot.ts.toISOString(),
      rsi14: snapshot.rsi14 ? Number(snapshot.rsi14) : null,
      sma13: snapshot.sma13 ? Number(snapshot.sma13) : null,
      sma34: snapshot.sma34 ? Number(snapshot.sma34) : null,
      sma44: snapshot.sma44 ? Number(snapshot.sma44) : null,
      sma50: snapshot.sma50 ? Number(snapshot.sma50) : null,
      sma200: snapshot.sma200 ? Number(snapshot.sma200) : null,
      ema9: snapshot.ema9 ? Number(snapshot.ema9) : null,
      ema15: snapshot.ema15 ? Number(snapshot.ema15) : null,
      bbUpper: snapshot.bbUpper ? Number(snapshot.bbUpper) : null,
      bbMiddle: snapshot.bbMiddle ? Number(snapshot.bbMiddle) : null,
      bbLower: snapshot.bbLower ? Number(snapshot.bbLower) : null,
      superTrend: snapshot.superTrend ? Number(snapshot.superTrend) : null,
      superTrendDir: snapshot.superTrendDir,
      vwap: snapshot.vwap ? Number(snapshot.vwap) : null,
      atr14: snapshot.atr14 ? Number(snapshot.atr14) : null,
      relativeVolume: snapshot.relativeVolume ? Number(snapshot.relativeVolume) : null,
    },
  });
}

