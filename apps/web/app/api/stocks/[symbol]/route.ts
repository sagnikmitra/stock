import { NextResponse } from "next/server";
import { prisma } from "@ibo/db";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ symbol: string }> },
) {
  const { symbol } = await params;
  const sym = symbol.toUpperCase();

  const instrument = await prisma.instrument.findFirst({
    where: { symbol: sym },
    include: { exchange: true },
  });

  if (!instrument) {
    return NextResponse.json({ error: "Symbol not found" }, { status: 404 });
  }

  const [latestQuote, latestIndicators, recentCandles, strategyMatches] = await Promise.all([
    prisma.quoteSnapshot.findFirst({
      where: { instrumentId: instrument.id },
      orderBy: { ts: "desc" },
    }),
    prisma.indicatorSnapshot.findFirst({
      where: { instrumentId: instrument.id },
      orderBy: { ts: "desc" },
    }),
    prisma.candle.findMany({
      where: { instrumentId: instrument.id, timeframe: "D1" },
      orderBy: { ts: "desc" },
      take: 5,
    }),
    prisma.strategyResult.findMany({
      where: { instrumentId: instrument.id, matched: true },
      include: { strategy: { select: { key: true, name: true } } },
      orderBy: { marketDate: "desc" },
      take: 10,
    }),
  ]);

  return NextResponse.json({
    data: {
      symbol: sym,
      name: instrument.companyName,
      exchange: instrument.exchange.code,
      isin: instrument.isin,
      sector: instrument.sector,
      quote: latestQuote
        ? {
            ltp: Number(latestQuote.ltp),
            open: latestQuote.open ? Number(latestQuote.open) : null,
            high: latestQuote.high ? Number(latestQuote.high) : null,
            low: latestQuote.low ? Number(latestQuote.low) : null,
            close: latestQuote.close ? Number(latestQuote.close) : null,
            changePct: latestQuote.changePct ? Number(latestQuote.changePct) : null,
            volume: latestQuote.volume,
            ts: latestQuote.ts.toISOString(),
          }
        : null,
      indicators: latestIndicators
        ? {
            rsi14: latestIndicators.rsi14 ? Number(latestIndicators.rsi14) : null,
            sma200: latestIndicators.sma200 ? Number(latestIndicators.sma200) : null,
            superTrendDir: latestIndicators.superTrendDir,
          }
        : null,
      recentCandles: recentCandles.map((c) => ({
        date: c.ts.toISOString().split("T")[0],
        open: Number(c.open),
        high: Number(c.high),
        low: Number(c.low),
        close: Number(c.close),
        volume: c.volume,
      })),
      strategyMatches: strategyMatches.map((m) => ({
        strategyKey: m.strategy.key,
        strategyName: m.strategy.name,
        marketDate: m.marketDate.toISOString().split("T")[0],
        confluenceScore: m.confluenceScore ? Number(m.confluenceScore) : null,
      })),
    },
  });
}
