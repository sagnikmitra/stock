import { NextResponse } from "next/server";
import { prisma } from "@ibo/db";
import type { Prisma } from "@ibo/db";
import {
  evaluateStrategy,
  buildIndicatorSet,
  type DataContext,
} from "@ibo/strategy-engine";
import type { StrategyDSL, Candle } from "@ibo/types";
import { acquireCronLock, releaseCronLock, withRetries } from "../_scheduler";
import { isCalendarMonthEnd } from "../_helpers";

/**
 * Month-end cron — runs on last trading day at 5:00 PM IST
 * Investment strategies: BB Monthly Breakout, MBB Mean-Reversion
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
  const retryAttempts = Number(searchParams.get("attempts") ?? 2);
  let runSucceeded = false;

  if (!force && !isCalendarMonthEnd(todayDate)) {
    await prisma.auditEvent.create({
      data: {
        actor: "system",
        action: "month_end_gated",
        entityType: "CronJob",
        entityId: `month_end:${todayStr}`,
        details: {
          marketDate: todayStr,
          reason: "not_calendar_month_end",
        },
      },
    });

    return NextResponse.json({
      data: {
        status: "skipped",
        reason: "not_month_end",
        marketDate: todayStr,
      },
    });
  }

  const lock = await acquireCronLock({
    jobKey: "month_end",
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
    const result = await withRetries(
      async () => {
        const investStrats = await prisma.strategy.findMany({
          where: { status: "active", family: "investment" },
          include: { versions: { where: { isActive: true }, take: 1 } },
        });

        const instruments = await prisma.instrument.findMany({
          where: { isActive: true },
          take: 500,
        });

        const bbHits: string[] = [];
        const mbbHits: string[] = [];
        let evaluated = 0;

        for (const inst of instruments) {
          const monthly = await prisma.candle.findMany({
            where: { instrumentId: inst.id, timeframe: "MN1" },
            orderBy: { ts: "asc" },
            take: 60,
          });
          if (monthly.length < 20) continue;
          evaluated++;

          const series: Candle[] = monthly.map((c) => ({
            ts: c.ts,
            open: Number(c.open),
            high: Number(c.high),
            low: Number(c.low),
            close: Number(c.close),
            volume: Number(c.volume ?? 0),
          }));

          const ind = buildIndicatorSet(series);
          const last = series[series.length - 1];

          const ctx: DataContext = {
            "monthly.open": last.open,
            "monthly.high": last.high,
            "monthly.low": last.low,
            "monthly.close": last.close,
            "monthly.volume": last.volume,
            "monthly.rsi14": ind.rsi14,
            "monthly.bb_upper_20_2": ind.bbUpper,
            "monthly.bb_middle_20": ind.bbMiddle,
            "monthly.sma_200": ind.sma200,
          };

          for (const strat of investStrats) {
            const v = strat.versions[0];
            if (!v) continue;

            const dsl = v.normalizedDsl as unknown as StrategyDSL | undefined;
            if (!dsl?.filters) continue;

            const evalResult = evaluateStrategy(dsl, inst.symbol, todayStr, ctx);
            if (!evalResult.allPassed) continue;

            const line = `**${inst.symbol}** — RSI ${ind.rsi14?.toFixed(1) ?? "?"}, Close ₹${last.close.toFixed(0)}`;
            if (strat.key === "investment_bb_monthly") bbHits.push(line);
            else if (strat.key === "investment_mbb") mbbHits.push(line);

            await prisma.strategyResult.create({
              data: {
                strategyId: strat.id,
                instrumentId: inst.id,
                marketDate: todayDate,
                matched: true,
                confluenceScore: evalResult.softScore,
                confidence: evalResult.softScore > 0.8 ? "high" : "medium",
                ruleResults: evalResult.conditions as unknown as Prisma.InputJsonValue,
                explanation: evalResult.explanation,
              },
            });
          }
        }

        const digest = await prisma.digest.upsert({
          where: {
            digestType_marketDate: { digestType: "month_end", marketDate: todayDate },
          },
          update: {
            summary: `${evaluated} evaluated. BB: ${bbHits.length}, MBB: ${mbbHits.length}.`,
          },
          create: {
            digestType: "month_end",
            marketDate: todayDate,
            title: `Month-End Review — ${todayStr}`,
            summary: `${evaluated} evaluated. BB: ${bbHits.length}, MBB: ${mbbHits.length}.`,
            sections: {
              create: [
                {
                  key: "bb_breakout",
                  title: "Monthly BB Breakout",
                  bodyMarkdown:
                    bbHits.length > 0
                      ? bbHits.map((h) => `- ${h}`).join("\n") +
                        "\n\n**Entry**: 1% above trigger high. **SL**: SuperTrend or swing low."
                      : "No BB breakout candidates this month.",
                  sortOrder: 0,
                },
                {
                  key: "mbb_dips",
                  title: "MBB Mean-Reversion",
                  bodyMarkdown:
                    mbbHits.length > 0
                      ? mbbHits.map((h) => `- ${h}`).join("\n") +
                        "\n\n**Action**: Consider adding to positions if fundamentals unchanged."
                      : "No MBB dip candidates.",
                  sortOrder: 1,
                },
                {
                  key: "portfolio_review",
                  title: "Portfolio Review",
                  bodyMarkdown: `${evaluated} instruments had sufficient monthly data. Review holdings against SuperTrend trail stops.`,
                  sortOrder: 2,
                },
              ],
            },
          },
        });

        runSucceeded = true;
        return {
          digestId: digest.id,
          evaluated,
          bbBreakouts: bbHits.length,
          mbbDips: mbbHits.length,
        };
      },
      Number.isFinite(retryAttempts) && retryAttempts > 0 ? retryAttempts : 2,
    );

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
    console.error("Month-end error:", msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  } finally {
    if (lock.canRun && runSucceeded) {
      await releaseCronLock({
        lockKey: lock.lockKey,
        status: "completed",
        details: {
          marketDate: todayStr,
        },
      });
    }
  }
}
