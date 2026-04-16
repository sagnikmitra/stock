import { NextResponse } from "next/server";
import { prisma } from "@ibo/db";
import type { Prisma } from "@ibo/db";
import { buildIndicatorSet, evaluateStrategy, type DataContext } from "@ibo/strategy-engine";
import type { Candle, StrategyDSL } from "@ibo/types";

function toMarketDate(value: string | undefined): Date {
  const day = value || new Date().toISOString().split("T")[0];
  return new Date(`${day}T00:00:00.000Z`);
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ key: string }> },
) {
  const { key } = await params;
  const body = await req.json().catch(() => ({}));
  const marketDate = toMarketDate(body.marketDate);
  const symbolFilter = Array.isArray(body.symbolFilter)
    ? (body.symbolFilter as string[]).map((symbol) => symbol.toUpperCase())
    : undefined;

  const strategy = await prisma.strategy.findUnique({
    where: { key },
    include: { versions: { where: { isActive: true }, take: 1 } },
  });
  if (!strategy) return NextResponse.json({ error: "Strategy not found" }, { status: 404 });

  const version = strategy.versions[0];
  if (!version) return NextResponse.json({ error: "No active strategy version" }, { status: 400 });

  const run = await prisma.strategyRun.create({
    data: {
      strategyVersionId: version.id,
      runAt: new Date(),
      runScope: "manual",
      marketDate,
      status: "running",
    },
  });

  const instruments = await prisma.instrument.findMany({
    where: {
      isActive: true,
      symbol: symbolFilter?.length ? { in: symbolFilter } : undefined,
    },
    take: 1000,
  });

  const dsl = version.normalizedDsl as unknown as StrategyDSL;
  let evaluatedCount = 0;
  let matchedCount = 0;

  for (const instrument of instruments) {
    const candles = await prisma.candle.findMany({
      where: { instrumentId: instrument.id, timeframe: "D1" },
      orderBy: { ts: "asc" },
      take: 260,
    });
    if (candles.length < 40) continue;

    const series: Candle[] = candles.map((candle) => ({
      ts: candle.ts,
      open: Number(candle.open),
      high: Number(candle.high),
      low: Number(candle.low),
      close: Number(candle.close),
      volume: Number(candle.volume ?? 0),
      deliveryPct: candle.deliveryPct ? Number(candle.deliveryPct) : undefined,
    }));
    const indicators = buildIndicatorSet(series);
    const latest = series[series.length - 1];

    const ctx: DataContext = {
      "daily.open": latest.open,
      "daily.high": latest.high,
      "daily.low": latest.low,
      "daily.close": latest.close,
      "daily.volume": latest.volume,
      "daily.rsi14": indicators.rsi14,
      "daily.sma_13": indicators.sma13,
      "daily.sma_34": indicators.sma34,
      "daily.sma_44": indicators.sma44,
      "daily.sma_50": indicators.sma50,
      "daily.sma_200": indicators.sma200,
      "daily.ema_9": indicators.ema9,
      "daily.ema_15": indicators.ema15,
      "daily.bb_upper_20_2": indicators.bbUpper,
      "daily.bb_middle_20": indicators.bbMiddle,
      "daily.bb_lower_20_2": indicators.bbLower,
      "daily.supertrend_10_3": indicators.superTrendDir,
      "daily.atr_14": indicators.atr14,
      "daily.volume_ratio_20": indicators.relativeVolume,
    };

    const result = evaluateStrategy(dsl, instrument.symbol, marketDate.toISOString().split("T")[0], ctx);
    evaluatedCount++;
    if (result.allPassed) matchedCount++;

    await prisma.strategyResult.create({
      data: {
        strategyId: strategy.id,
        strategyRunId: run.id,
        instrumentId: instrument.id,
        marketDate,
        matched: result.allPassed,
        confluenceScore: result.softScore,
        confidence: result.softScore > 0.8 ? "high" : result.softScore > 0.5 ? "medium" : "low",
        ruleResults: result.conditions as unknown as Prisma.InputJsonValue,
        explanation: result.explanation,
      },
    });
  }

  await prisma.strategyRun.update({
    where: { id: run.id },
    data: {
      status: "completed",
      summaryJson: {
        strategyKey: key,
        marketDate: marketDate.toISOString().split("T")[0],
        evaluatedCount,
        matchedCount,
      } as Prisma.InputJsonValue,
    },
  });

  return NextResponse.json({
    data: {
      strategyKey: key,
      strategyRunId: run.id,
      marketDate: marketDate.toISOString().split("T")[0],
      evaluatedCount,
      matchedCount,
    },
  });
}

