import { NextResponse } from "next/server";
import { prisma } from "@ibo/db";
import { buildIndicatorSet } from "@ibo/strategy-engine";
import type { Candle, Timeframe } from "@ibo/types";

function asTimeframe(raw: string): Timeframe {
  const tf = raw.toUpperCase();
  if (tf === "D1" || tf === "W1" || tf === "MN1") return tf;
  return "D1";
}

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const symbols = Array.isArray(body.symbols) ? (body.symbols as string[]).map((s) => s.toUpperCase()) : undefined;
  const timeframe = asTimeframe(String(body.timeframe ?? "D1"));
  const fromDate = body.fromDate ? new Date(String(body.fromDate)) : undefined;

  const instruments = await prisma.instrument.findMany({
    where: {
      isActive: true,
      symbol: symbols?.length ? { in: symbols } : undefined,
    },
    select: { id: true, symbol: true },
    take: 2000,
  });

  let recomputed = 0;
  for (const instrument of instruments) {
    const rows = await prisma.candle.findMany({
      where: {
        instrumentId: instrument.id,
        timeframe,
        ts: { gte: fromDate },
      },
      orderBy: { ts: "asc" },
    });
    if (rows.length < 20) continue;

    const candles: Candle[] = rows.map((row) => ({
      ts: row.ts,
      open: Number(row.open),
      high: Number(row.high),
      low: Number(row.low),
      close: Number(row.close),
      volume: Number(row.volume ?? 0),
      deliveryPct: row.deliveryPct ? Number(row.deliveryPct) : undefined,
    }));
    const indicators = buildIndicatorSet(candles);
    const latest = rows[rows.length - 1];

    await prisma.indicatorSnapshot.upsert({
      where: {
        instrumentId_timeframe_ts: {
          instrumentId: instrument.id,
          timeframe,
          ts: latest.ts,
        },
      },
      create: {
        instrumentId: instrument.id,
        timeframe,
        ts: latest.ts,
        rsi14: indicators.rsi14 ?? null,
        sma13: indicators.sma13 ?? null,
        sma34: indicators.sma34 ?? null,
        sma44: indicators.sma44 ?? null,
        sma50: indicators.sma50 ?? null,
        sma200: indicators.sma200 ?? null,
        ema9: indicators.ema9 ?? null,
        ema15: indicators.ema15 ?? null,
        bbUpper: indicators.bbUpper ?? null,
        bbMiddle: indicators.bbMiddle ?? null,
        bbLower: indicators.bbLower ?? null,
        superTrend: indicators.superTrend ?? null,
        superTrendDir: indicators.superTrendDir ?? null,
        atr14: indicators.atr14 ?? null,
        relativeVolume: indicators.relativeVolume ?? null,
      },
      update: {
        rsi14: indicators.rsi14 ?? null,
        sma13: indicators.sma13 ?? null,
        sma34: indicators.sma34 ?? null,
        sma44: indicators.sma44 ?? null,
        sma50: indicators.sma50 ?? null,
        sma200: indicators.sma200 ?? null,
        ema9: indicators.ema9 ?? null,
        ema15: indicators.ema15 ?? null,
        bbUpper: indicators.bbUpper ?? null,
        bbMiddle: indicators.bbMiddle ?? null,
        bbLower: indicators.bbLower ?? null,
        superTrend: indicators.superTrend ?? null,
        superTrendDir: indicators.superTrendDir ?? null,
        atr14: indicators.atr14 ?? null,
        relativeVolume: indicators.relativeVolume ?? null,
      },
    });
    recomputed++;
  }

  return NextResponse.json({
    data: {
      timeframe,
      symbols: symbols ?? null,
      recomputed,
    },
  });
}

