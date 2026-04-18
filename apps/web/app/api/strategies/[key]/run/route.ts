import { NextResponse } from "next/server";
import { prisma } from "@ibo/db";
import type { Prisma } from "@ibo/db";
import { buildIndicatorSet, evaluateStrategy, type DataContext } from "@ibo/strategy-engine";
import type { Candle, StrategyDSL } from "@ibo/types";
import { chunk } from "@ibo/utils";

function toMarketDate(value: string | undefined): Date {
  const day = value || new Date().toISOString().split("T")[0];
  return new Date(`${day}T00:00:00.000Z`);
}

function pctChange(current: number, previous: number): number {
  if (!Number.isFinite(previous) || previous === 0) return 0;
  return ((current - previous) / previous) * 100;
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
  const toCreate: Prisma.StrategyResultCreateManyInput[] = [];

  for (const instrumentBatch of chunk(instruments, 24)) {
    const batchRows = await Promise.all(
      instrumentBatch.map(async (instrument): Promise<Prisma.StrategyResultCreateManyInput | null> => {
        const candles = await prisma.candle.findMany({
          where: { instrumentId: instrument.id, timeframe: "D1" },
          orderBy: { ts: "asc" },
          take: 260,
        });
        if (candles.length < 40) return null;

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
        const prevIndicators = buildIndicatorSet(series.slice(0, -1));
        const latest = series[series.length - 1];
        const prev = series[series.length - 2] ?? latest;
        const recent20 = series.slice(-20);
        const recent22 = series.slice(-22);
        const recent120 = series.slice(-120);
        const recent252 = series.slice(-252);
        const resistance20 = recent20.length > 0 ? Math.max(...recent20.map((c) => c.high)) : latest.high;
        const high52Week = recent252.length > 0 ? Math.max(...recent252.map((c) => c.high)) : latest.high;
        const candleRange = Math.max(latest.high - latest.low, 0.0001);
        const candleBodyPct = (Math.abs(latest.close - latest.open) / candleRange) * 100;
        const candleColor = latest.close >= latest.open ? "green" : "red";
        const dayChangePct = pctChange(latest.close, prev.close);
        const closeAboveResistancePct = resistance20 > 0 ? pctChange(latest.close, resistance20) : 0;
        const lowerBbTouch = indicators.bbLower !== undefined ? latest.low <= indicators.bbLower * 1.01 : false;
        const lowerBbInteraction = indicators.bbLower !== undefined ? latest.low <= indicators.bbLower * 1.02 : false;
        const sma50 = indicators.sma50 ?? latest.close;
        const sma44 = indicators.sma44 ?? latest.close;
        const sma200 = indicators.sma200 ?? latest.close;
        const nearSma50 = sma50 > 0 ? Math.abs(latest.close - sma50) / sma50 <= 0.02 : false;
        const trendlineBreakUp = sma50 > 0 ? latest.open <= sma50 && latest.close > sma50 : latest.close > latest.open;
        const dailyDipInUptrend =
          sma50 > 0
            ? latest.close >= sma50 && latest.low <= (indicators.sma34 ?? sma50)
            : latest.close >= prev.close;
        const bullishResolution = latest.close > prev.close && candleColor === "green";
        const primaryTrendNotBearish = indicators.sma200 !== undefined ? latest.close >= indicators.sma200 : true;
        const vwapApprox = (latest.high + latest.low + latest.close) / 3;
        const priceAboveSuperTrend = indicators.superTrend !== undefined ? latest.close >= indicators.superTrend : latest.close >= sma50;
        const sma13CrossAboveSma34 =
          indicators.sma13 !== undefined &&
          indicators.sma34 !== undefined &&
          prevIndicators.sma13 !== undefined &&
          prevIndicators.sma34 !== undefined
            ? indicators.sma13 > indicators.sma34 && prevIndicators.sma13 <= prevIndicators.sma34
            : false;
        const primaryUptrend = latest.close >= sma44 && sma44 >= sma200;
        const reclaimAfterPullback = prev.close <= sma44 && latest.close > sma44;
        const consolidationCeiling = recent120.length > 0 ? Math.max(...recent120.map((c) => c.high)) : latest.high;
        const consolidationFloor = recent120.length > 0 ? Math.min(...recent120.map((c) => c.low)) : latest.low;
        const longConsolidationDetected =
          consolidationFloor > 0 ? (consolidationCeiling - consolidationFloor) / consolidationFloor <= 0.35 : false;
        const alphaApprox = recent20.length >= 2 ? pctChange(latest.close, recent20[0].close) : dayChangePct;
        const betaApprox = recent20.length >= 2 ? Math.max(0, Math.min(1, Math.abs(dayChangePct) / 4)) : 0.8;

        const ctx: DataContext = {
      "daily.open": latest.open,
      "daily.high": latest.high,
      "daily.low": latest.low,
      "daily.close": latest.close,
      "daily.volume": latest.volume,
      "daily.rsi14": indicators.rsi14,
      "daily.rsi_14": indicators.rsi14,
      "daily.sma13": indicators.sma13,
      "daily.sma_13": indicators.sma13,
      "daily.sma34": indicators.sma34,
      "daily.sma_34": indicators.sma34,
      "daily.sma44": indicators.sma44,
      "daily.sma_44": indicators.sma44,
      "daily.sma50": indicators.sma50,
      "daily.sma_50": indicators.sma50,
      "daily.sma200": indicators.sma200,
      "daily.sma_200": indicators.sma200,
      "daily.ema9": indicators.ema9,
      "daily.ema_9": indicators.ema9,
      "daily.ema15": indicators.ema15,
      "daily.ema_15": indicators.ema15,
      "daily.bbUpper": indicators.bbUpper,
      "daily.bb_upper_20_2": indicators.bbUpper,
      "daily.bbMiddle": indicators.bbMiddle,
      "daily.bb_middle_20": indicators.bbMiddle,
      "daily.bbLower": indicators.bbLower,
      "daily.bb_lower_20_2": indicators.bbLower,
      "daily.superTrend": indicators.superTrend,
      "daily.supertrend_10_3": indicators.superTrendDir,
      "daily.superTrendDir": indicators.superTrendDir,
      "daily.atr_14": indicators.atr14,
      "daily.relativeVolume": indicators.relativeVolume,
      "daily.volume_ratio_20": indicators.relativeVolume,
      "daily.deliveryPct": latest.deliveryPct,
      "daily.candleBodyPct": candleBodyPct,
      "daily.candleColor": candleColor,
      "daily.vwap": vwapApprox,
      "h4.close": latest.close,
      "h4.ema9": indicators.ema9,
      "h4.ema15": indicators.ema15,
      "h4.superTrendDir": indicators.superTrendDir,
      "h4.candleColor": candleColor,
      "monthly.high": recent22.length > 0 ? Math.max(...recent22.map((c) => c.high)) : latest.high,
      "monthly.close": latest.close,
      "monthly.rsi14": indicators.rsi14,
      "monthly.bbUpper": indicators.bbUpper,
      "monthly.bbMiddle": indicators.bbMiddle,
      "instrument.marketCapBucket": instrument.marketCapBucket ?? "large_cap",
      "derived.closeAbove52WeekHigh": high52Week > 0 ? latest.close >= high52Week * 0.995 : false,
      "derived.closeAboveResistancePct": closeAboveResistancePct,
      "derived.isTopGainer": dayChangePct >= 2,
      "derived.isVolumeShocker": (indicators.relativeVolume ?? 0) >= 1.8,
      "derived.dailyDipInUptrend": dailyDipInUptrend,
      "derived.lowerBbTouch": lowerBbTouch,
      "derived.lowerBbInteraction": lowerBbInteraction,
      "derived.trendlineBreakUp": trendlineBreakUp,
      "derived.nearSma50": nearSma50,
      "derived.bullishResolution": bullishResolution,
      "derived.primaryTrendNotBearish": primaryTrendNotBearish,
      "derived.candleBodyPct": candleBodyPct,
      "derived.prevDayVolume": prev.volume,
      "derived.notPreHolidayOrExpiry": true,
      "derived.priceAboveSuperTrend": priceAboveSuperTrend,
      "derived.sma13CrossAboveSma34": sma13CrossAboveSma34,
      "derived.primaryUptrend": primaryUptrend,
      "derived.reclaimAfterPullback": reclaimAfterPullback,
      "derived.consolidationCeiling": consolidationCeiling,
      "derived.longConsolidationDetected": longConsolidationDetected,
      "derived.alpha": alphaApprox,
      "derived.beta": betaApprox,
    };

        const result = evaluateStrategy(dsl, instrument.symbol, marketDate.toISOString().split("T")[0], ctx);
        return {
          strategyId: strategy.id,
          strategyRunId: run.id,
          instrumentId: instrument.id,
          marketDate,
          matched: result.allPassed,
          confluenceScore: result.softScore,
          confidence: result.softScore > 0.8 ? "high" : result.softScore > 0.5 ? "medium" : "low",
          ruleResults: result.conditions as unknown as Prisma.InputJsonValue,
          explanation: result.explanation,
        };
      }),
    );

    for (const row of batchRows) {
      if (!row) continue;
      evaluatedCount++;
      if (row.matched) matchedCount++;
      toCreate.push(row);
    }
  }

  for (const createBatch of chunk(toCreate, 500)) {
    await prisma.strategyResult.createMany({
      data: createBatch,
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
