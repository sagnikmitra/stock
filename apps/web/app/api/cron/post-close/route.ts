import { NextResponse } from "next/server";
import { prisma } from "@ibo/db";
import type { Prisma } from "@ibo/db";
import { evaluateStrategy, evaluateScreener, buildIndicatorSet, type DataContext } from "@ibo/strategy-engine";
import type { StrategyDSL, ScreenerDSL, Candle } from "@ibo/types";
import { acquireCronLock, releaseCronLock, withRetries } from "../_scheduler";

/**
 * Post-close cron — runs at 4:30 PM IST
 * candles → indicators → strategies → screeners → digest
 */
export async function GET(req: Request) {
  const authHeader = req.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const todayStr = new Date().toISOString().split("T")[0];
  const todayDate = new Date(todayStr);
  const { searchParams } = new URL(req.url);
  const force = searchParams.get("force") === "1";
  const retryAttempts = Number(searchParams.get("attempts") ?? 1);
  const startMs = Date.now();
  let totalStrategyMatches = 0;
  let totalScreenerHits = 0;
  let runSucceeded = false;
  const matchLines: string[] = [];
  const lock = await acquireCronLock({
    jobKey: "post_close",
    marketDate: todayStr,
    force,
  });

  if (!lock.canRun) {
    return NextResponse.json({
      data: {
        status: "skipped",
        reason: lock.reason,
        marketDate: todayStr,
      },
    });
  }

  try {
    const result = await withRetries(async () => {
      const instruments = await prisma.instrument.findMany({ where: { isActive: true }, take: 500 });
      const contexts = new Map<string, { ctx: DataContext; symbol: string; name: string }>();

    // --- Build indicator context per instrument ---
    for (const inst of instruments) {
      const candles = await prisma.candle.findMany({
        where: { instrumentId: inst.id, timeframe: "D1" },
        orderBy: { ts: "asc" },
        take: 250,
      });
      if (candles.length < 20) continue;

      const series: Candle[] = candles.map((c) => ({
        ts: c.ts, open: Number(c.open), high: Number(c.high), low: Number(c.low),
        close: Number(c.close), volume: Number(c.volume ?? 0),
        deliveryPct: c.deliveryPct ? Number(c.deliveryPct) : undefined,
      }));

      const ind = buildIndicatorSet(series);
      const last = series[series.length - 1];

      const ctx: DataContext = {
        "daily.open": last.open, "daily.high": last.high, "daily.low": last.low,
        "daily.close": last.close, "daily.volume": last.volume,
        "daily.rsi14": ind.rsi14, "daily.sma_13": ind.sma13, "daily.sma_34": ind.sma34,
        "daily.sma_44": ind.sma44, "daily.sma_50": ind.sma50, "daily.sma_200": ind.sma200,
        "daily.ema_9": ind.ema9, "daily.ema_15": ind.ema15,
        "daily.bb_upper_20_2": ind.bbUpper, "daily.bb_middle_20": ind.bbMiddle,
        "daily.bb_lower_20_2": ind.bbLower,
        "daily.supertrend_10_3": ind.superTrendDir,
        "daily.atr_14": ind.atr14, "daily.volume_ratio_20": ind.relativeVolume,
      };
      contexts.set(inst.id, { ctx, symbol: inst.symbol, name: inst.companyName });

      // Save individual indicator columns
      await prisma.indicatorSnapshot.upsert({
        where: { instrumentId_timeframe_ts: { instrumentId: inst.id, timeframe: "D1", ts: todayDate } },
        update: {
          rsi14: ind.rsi14, sma13: ind.sma13, sma34: ind.sma34, sma44: ind.sma44,
          sma50: ind.sma50, sma200: ind.sma200, ema9: ind.ema9, ema15: ind.ema15,
          bbUpper: ind.bbUpper, bbMiddle: ind.bbMiddle, bbLower: ind.bbLower,
          superTrend: ind.superTrend, superTrendDir: ind.superTrendDir,
          atr14: ind.atr14, relativeVolume: ind.relativeVolume,
        },
        create: {
          instrumentId: inst.id, timeframe: "D1", ts: todayDate,
          rsi14: ind.rsi14, sma13: ind.sma13, sma34: ind.sma34, sma44: ind.sma44,
          sma50: ind.sma50, sma200: ind.sma200, ema9: ind.ema9, ema15: ind.ema15,
          bbUpper: ind.bbUpper, bbMiddle: ind.bbMiddle, bbLower: ind.bbLower,
          superTrend: ind.superTrend, superTrendDir: ind.superTrendDir,
          atr14: ind.atr14, relativeVolume: ind.relativeVolume,
        },
      });
    }

    // --- Run strategies ---
    const strategies = await prisma.strategy.findMany({
      where: { status: "active" },
      include: { versions: { where: { isActive: true }, take: 1 } },
    });

    for (const strat of strategies) {
      const activeVersion = strat.versions[0];
      if (!activeVersion) continue;
      const dsl = activeVersion.normalizedDsl as unknown as StrategyDSL | undefined;
      if (!dsl?.filters) continue;

      const run = await prisma.strategyRun.create({
        data: {
          strategyVersionId: activeVersion.id,
          runAt: new Date(),
          runScope: "daily",
          marketDate: todayDate,
          status: "running",
        },
      });

      for (const [instId, { ctx, symbol }] of contexts) {
        const result = evaluateStrategy(dsl, symbol, todayStr, ctx);
        if (result.allPassed) {
          totalStrategyMatches++;
          matchLines.push(`${symbol} → ${strat.name}`);
          await prisma.strategyResult.create({
            data: {
              strategyId: strat.id, strategyRunId: run.id, instrumentId: instId,
              marketDate: todayDate, matched: true,
              confluenceScore: result.softScore,
              confidence: result.softScore > 0.8 ? "high" : result.softScore > 0.5 ? "medium" : "low",
              ruleResults: result.conditions as unknown as Prisma.InputJsonValue,
              explanation: result.explanation,
            },
          });
        }
      }

      await prisma.strategyRun.update({ where: { id: run.id }, data: { status: "completed" } });
    }

    // --- Run screeners ---
    const screeners = await prisma.screener.findMany({
      where: { isExternalReference: false },
      include: { versions: { where: { isActive: true }, take: 1 } },
    });

    for (const scr of screeners) {
      const dsl = scr.versions[0]?.expressionDsl as unknown as ScreenerDSL | undefined;
      if (!dsl) continue;

      const run = await prisma.screenerRun.create({
        data: { screenerId: scr.id, runAt: new Date(), marketDate: todayDate, scope: "daily", status: "running" },
      });

      for (const [instId, { ctx, symbol }] of contexts) {
        const result = evaluateScreener(dsl, symbol, ctx);
        if (result.passed) {
          totalScreenerHits++;
          await prisma.screenerResult.create({
            data: {
              screenerRunId: run.id, instrumentId: instId, marketDate: todayDate,
              matched: true, metricsJson: result.conditions as unknown as Prisma.InputJsonValue,
            },
          });
        }
      }

      await prisma.screenerRun.update({ where: { id: run.id }, data: { status: "completed" } });
    }

    // --- Digest ---
    const digest = await prisma.digest.upsert({
      where: { digestType_marketDate: { digestType: "post_close", marketDate: todayDate } },
      update: {
        title: `Post-Close Summary — ${todayStr}`,
        summary: `${totalStrategyMatches} strategy match(es), ${totalScreenerHits} screener hit(s) across ${contexts.size} instruments.`,
      },
      create: {
        digestType: "post_close", marketDate: todayDate,
        title: `Post-Close Summary — ${todayStr}`,
        summary: `${totalStrategyMatches} strategy match(es), ${totalScreenerHits} screener hit(s) across ${contexts.size} instruments.`,
        sections: {
          create: [
            { key: "market_summary", title: "Market Summary", bodyMarkdown: `Evaluated **${contexts.size}** instruments.`, sortOrder: 0 },
            { key: "strategy_matches", title: "Strategy Matches", bodyMarkdown: matchLines.length > 0 ? matchLines.map((m) => `- ${m}`).join("\n") : "No matches today.", sortOrder: 1 },
            { key: "screener_highlights", title: "Screener Highlights", bodyMarkdown: `**${totalScreenerHits}** hits across ${screeners.length} screeners.`, sortOrder: 2 },
          ],
        },
      },
    });

      runSucceeded = true;
      return {
        digestId: digest.id, marketDate: todayStr, instruments: contexts.size,
        strategyMatches: totalStrategyMatches, screenerHits: totalScreenerHits,
        elapsedMs: Date.now() - startMs,
      };
    }, Number.isFinite(retryAttempts) && retryAttempts > 0 ? retryAttempts : 1);

    return NextResponse.json({ data: result });
  } catch (error) {
    await releaseCronLock({
      lockKey: lock.lockKey,
      status: "failed",
      details: {
        marketDate: todayStr,
        error: error instanceof Error ? error.message : "Unknown error",
      },
    });
    const msg = error instanceof Error ? error.message : "Unknown error";
    console.error("Post-close pipeline error:", msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  } finally {
    if (lock.canRun && runSucceeded) {
      await releaseCronLock({
        lockKey: lock.lockKey,
        status: "completed",
        details: {
          marketDate: todayStr,
          strategyMatches: totalStrategyMatches,
          screenerHits: totalScreenerHits,
        },
      });
    }
  }
}
