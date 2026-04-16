import { NextResponse } from "next/server";
import { prisma } from "@ibo/db";
import { buildIndicatorSet, computeIntersection, computeConfluenceScore, type SymbolMatches } from "@ibo/strategy-engine";
import type { Candle } from "@ibo/types";

type Mode = "intersection" | "union" | "difference";
type ConditionOperator = ">=" | "<=" | ">" | "<" | "==" | "crosses_above";
type ConditionIndicator = "RSI" | "SMA" | "EMA" | "BB" | "volume" | "price" | "delivery%";
type CustomCondition = {
  indicator: ConditionIndicator;
  operator: ConditionOperator;
  value: string;
};

function toMarketDate(dateInput?: string): Date {
  const dateStr = dateInput ?? new Date().toISOString().split("T")[0];
  return new Date(`${dateStr}T00:00:00.000Z`);
}

function toNumber(value: unknown): number | null {
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
}

function resolveIndicatorValue(indicator: ConditionIndicator, candle: Candle, fallback: ReturnType<typeof buildIndicatorSet>): number {
  switch (indicator) {
    case "RSI":
      return fallback.rsi14 ?? 0;
    case "SMA":
      return fallback.sma50 ?? fallback.sma44 ?? fallback.sma34 ?? 0;
    case "EMA":
      return fallback.ema15 ?? fallback.ema9 ?? 0;
    case "BB":
      return fallback.bbMiddle ?? fallback.bbLower ?? fallback.bbUpper ?? 0;
    case "volume":
      return candle.volume;
    case "price":
      return candle.close;
    case "delivery%":
      return candle.deliveryPct ?? 0;
    default:
      return 0;
  }
}

function evaluateCondition(
  condition: CustomCondition,
  current: number,
  previous: number,
  threshold: number,
): boolean {
  switch (condition.operator) {
    case ">=":
      return current >= threshold;
    case "<=":
      return current <= threshold;
    case ">":
      return current > threshold;
    case "<":
      return current < threshold;
    case "==":
      return current === threshold;
    case "crosses_above":
      return previous <= threshold && current > threshold;
    default:
      return false;
  }
}

async function runCustomConditions(conditions: CustomCondition[]) {
  const instruments = await prisma.instrument.findMany({
    where: { isActive: true },
    select: { id: true, symbol: true, companyName: true },
    take: 500,
  });

  const results: Array<{
    symbol: string;
    companyName: string;
    overlapCount: number;
    explanation: string;
    matchedBy: Array<{ key: string; label: string }>;
    confluenceScore: number;
    confluenceBucket: "low" | "medium" | "high";
  }> = [];

  for (const instrument of instruments) {
    const rows = await prisma.candle.findMany({
      where: { instrumentId: instrument.id, timeframe: "D1" },
      orderBy: { ts: "asc" },
      take: 260,
    });
    if (rows.length < 30) continue;

    const candles: Candle[] = rows.map((row) => ({
      ts: row.ts,
      open: Number(row.open),
      high: Number(row.high),
      low: Number(row.low),
      close: Number(row.close),
      volume: Number(row.volume ?? 0),
      deliveryPct: row.deliveryPct ? Number(row.deliveryPct) : undefined,
    }));

    const currentCandle = candles[candles.length - 1];
    const previousCandle = candles[candles.length - 2];
    const currentIndicators = buildIndicatorSet(candles);
    const previousIndicators = buildIndicatorSet(candles.slice(0, -1));

    const matchedBy: Array<{ key: string; label: string }> = [];
    const reasons: string[] = [];

    for (const condition of conditions) {
      const threshold = toNumber(condition.value);
      if (threshold === null) continue;

      const current = resolveIndicatorValue(condition.indicator, currentCandle, currentIndicators);
      const previous = resolveIndicatorValue(condition.indicator, previousCandle, previousIndicators);
      const passed = evaluateCondition(condition, current, previous, threshold);
      if (passed) {
        matchedBy.push({
          key: `custom_${condition.indicator.toLowerCase()}_${condition.operator}`,
          label: `${condition.indicator} ${condition.operator} ${threshold}`,
        });
      } else {
        reasons.push(`${condition.indicator} failed (${current.toFixed(2)} ${condition.operator} ${threshold})`);
      }
    }

    if (matchedBy.length === conditions.length && matchedBy.length > 0) {
      const overlapCount = matchedBy.length;
      const confluenceScore = Math.min(1, overlapCount / Math.max(conditions.length, 1));
      results.push({
        symbol: instrument.symbol,
        companyName: instrument.companyName,
        overlapCount,
        explanation: `Matched ${overlapCount}/${conditions.length} custom condition(s).`,
        matchedBy,
        confluenceScore,
        confluenceBucket: confluenceScore >= 0.8 ? "high" : confluenceScore >= 0.5 ? "medium" : "low",
      });
    } else if (reasons.length > 0) {
      // no-op: only return matched rows for now
    }
  }

  return results.sort((a, b) => b.overlapCount - a.overlapCount);
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const customConditions = Array.isArray(body.customConditions)
      ? (body.customConditions as CustomCondition[])
      : [];
    const screenerKeysInput = body.screenerKeys as string[] | undefined;
    const singleKey = body.screenerKey as string | undefined;
    const mode = (body.mode as Mode | undefined) ?? "intersection";
    const minOverlap = body.minOverlap as number | undefined;
    const marketDate = toMarketDate(body.marketDate as string | undefined);

    const screenerKeys = screenerKeysInput?.length
      ? screenerKeysInput
      : singleKey
        ? [singleKey]
        : [];

    if (customConditions.length > 0) {
      const customResults = await runCustomConditions(customConditions);
      return NextResponse.json({
        data: {
          marketDate: marketDate.toISOString().split("T")[0],
          mode: "intersection",
          minOverlap: customConditions.length,
          screenerKeys: [],
          totalCandidates: customResults.length,
          results: customResults,
        },
      });
    }

    if (screenerKeys.length === 0) {
      return NextResponse.json(
        { error: "screenerKey or screenerKeys[] is required" },
        { status: 400 },
      );
    }

    const runs = await prisma.screenerRun.findMany({
      where: {
        screener: { key: { in: screenerKeys } },
        marketDate,
        status: "completed",
      },
      include: {
        screener: { select: { key: true, name: true, linkedStrategy: { select: { family: true } } } },
        results: {
          where: { matched: true },
          include: { instrument: { select: { symbol: true, companyName: true } } },
        },
      },
      orderBy: { runAt: "desc" },
    });

    if (runs.length === 0) {
      return NextResponse.json(
        {
          error: "No completed screener runs found for requested keys/date",
          details: {
            screenerKeys,
            marketDate: marketDate.toISOString().split("T")[0],
          },
        },
        { status: 404 },
      );
    }

    const byScreener = new Map<string, SymbolMatches[]>();
    for (const run of runs) {
      const rows: SymbolMatches[] = run.results.map((result) => ({
        symbol: result.instrument.symbol,
        companyName: result.instrument.companyName,
        matches: [
          {
            screenerKey: run.screener.key,
            screenerLabel: run.screener.name,
            family: run.screener.linkedStrategy?.family ?? "swing",
          },
        ],
      }));
      byScreener.set(run.screener.key, rows);
    }

    const resultRows = computeIntersection(
      {
        screenerKeys,
        mode,
        minOverlap,
        marketDate: marketDate.toISOString().split("T")[0],
      },
      byScreener,
    );

    const scored = resultRows.map((row) => {
      const confluence = computeConfluenceScore(row, screenerKeys.length);
      return {
        ...row,
        confluenceScore: confluence.score,
        confluenceBucket: confluence.bucket,
      };
    });

    return NextResponse.json({
      data: {
        marketDate: marketDate.toISOString().split("T")[0],
        mode,
        minOverlap: minOverlap ?? null,
        screenerKeys,
        totalCandidates: scored.length,
        results: scored,
      },
    });
  } catch (error) {
    console.error("POST /api/screeners/run error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
