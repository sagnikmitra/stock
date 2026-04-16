import { prisma } from "@ibo/db";
import {
  buildIndicatorSet,
  evaluateStrategy,
} from "@ibo/strategy-engine";
import type {
  StrategyDSL,
  Candle,
  IndicatorSet,
} from "@ibo/types";
import { Timeframe } from "@ibo/types";
import { buildDataContext } from "./post-close";
import { getAdapter } from "../adapters";

/**
 * Month-end pipeline.
 * Schedule: Last trading day of month, 5:00 PM IST
 *
 * 1. Fetch monthly candle data for all instruments
 * 2. Compute monthly indicators (BB on monthly timeframe)
 * 3. Run investment strategies (BB Monthly, MBB) against monthly data
 * 4. Save results
 * 5. Generate month-end Digest with investment-focused sections
 * 6. Save Digest
 */
export async function runMonthEndPipeline() {
  const today = new Date();
  const dateStr = today.toISOString().split("T")[0];
  const marketDate = new Date(`${dateStr}T00:00:00.000Z`);
  console.log(`[month-end] Running pipeline for ${dateStr}`);

  const adapter = getAdapter("twelvedata") ?? getAdapter("nse_official");

  // -------------------------------------------------------------------------
  // Step 0: Load investment strategies, screeners, instruments
  // -------------------------------------------------------------------------
  const [investmentStrategies, allStrategies, instruments] = await Promise.all([
    prisma.strategy.findMany({
      where: { family: "investment", status: "active" },
      include: { versions: { where: { isActive: true }, take: 1 } },
    }),
    prisma.strategy.findMany({
      where: { status: "active" },
      include: { versions: { where: { isActive: true }, take: 1 } },
    }),
    prisma.instrument.findMany({
      where: { isActive: true },
    }),
  ]);

  // Also load screeners linked to investment strategies
  const screeners = await prisma.screener.findMany({
    where: {
      isExternalReference: false,
    },
    include: { versions: { where: { isActive: true }, take: 1 } },
  });

  console.log(
    `[month-end] ${instruments.length} instruments, ${investmentStrategies.length} investment strategies, ${screeners.length} screeners`,
  );

  if (instruments.length === 0) {
    console.warn("[month-end] No active instruments found. Pipeline exiting early.");
    return;
  }

  // -------------------------------------------------------------------------
  // Step 1: Fetch monthly candle data
  // -------------------------------------------------------------------------
  // For monthly indicators, we need ~24 months of monthly candles (for 20-period BB)
  const lookbackMonths = 36;
  const fromDate = new Date(today);
  fromDate.setMonth(fromDate.getMonth() - lookbackMonths);
  const fromStr = fromDate.toISOString().split("T")[0];

  const instrumentData = new Map<
    string,
    {
      symbol: string;
      companyName: string;
      sector: string | null;
      marketCapBucket: string | null;
      monthlyCandles: Candle[];
      monthlyIndicators: IndicatorSet;
      dailyCandles: Candle[];
      dailyIndicators: IndicatorSet;
    }
  >();

  // Also fetch recent daily data for portfolio health and alpha/beta
  const dailyLookback = new Date(today);
  dailyLookback.setDate(dailyLookback.getDate() - 250);

  for (const instrument of instruments) {
    try {
      let monthlyCandles: Candle[] = [];
      let dailyCandles: Candle[] = [];

      if (adapter) {
        // Fetch monthly candles
        const series = await adapter
          .getHistoricalCandles({
            symbol: instrument.symbol,
            timeframe: Timeframe.MN1,
            from: fromStr,
            to: dateStr,
          })
          .catch(() => null);

        if (series && series.candles && series.candles.length > 0) {
          monthlyCandles = series.candles.map((c) => ({
            ts: c.ts instanceof Date ? c.ts : new Date(c.ts),
            open: Number(c.open),
            high: Number(c.high),
            low: Number(c.low),
            close: Number(c.close),
            volume: Number(c.volume ?? 0),
            deliveryPct: c.deliveryPct !== undefined ? Number(c.deliveryPct) : undefined,
          }));
        }
      }

      // Fallback to DB monthly candles
      if (monthlyCandles.length === 0) {
        const dbCandles = await prisma.candle.findMany({
          where: {
            instrumentId: instrument.id,
            timeframe: "MN1",
            ts: { gte: fromDate, lte: today },
          },
          orderBy: { ts: "asc" },
        });
        monthlyCandles = dbCandles.map((c) => ({
          ts: c.ts,
          open: Number(c.open),
          high: Number(c.high),
          low: Number(c.low),
          close: Number(c.close),
          volume: Number(c.volume ?? 0),
          deliveryPct: c.deliveryPct ? Number(c.deliveryPct) : undefined,
        }));
      }

      // Fetch daily candles for supplementary analysis
      const dbDailyCandles = await prisma.candle.findMany({
        where: {
          instrumentId: instrument.id,
          timeframe: "D1",
          ts: { gte: dailyLookback, lte: today },
        },
        orderBy: { ts: "asc" },
      });
      dailyCandles = dbDailyCandles.map((c) => ({
        ts: c.ts,
        open: Number(c.open),
        high: Number(c.high),
        low: Number(c.low),
        close: Number(c.close),
        volume: Number(c.volume ?? 0),
        deliveryPct: c.deliveryPct ? Number(c.deliveryPct) : undefined,
      }));

      if (monthlyCandles.length < 2) continue;

      const monthlyIndicators = buildIndicatorSet(monthlyCandles);
      const dailyIndicators = dailyCandles.length >= 2 ? buildIndicatorSet(dailyCandles) : {};

      // Save monthly indicator snapshot
      await prisma.indicatorSnapshot.upsert({
        where: {
          instrumentId_timeframe_ts: {
            instrumentId: instrument.id,
            timeframe: "MN1",
            ts: marketDate,
          },
        },
        create: {
          instrumentId: instrument.id,
          timeframe: "MN1",
          ts: marketDate,
          rsi14: monthlyIndicators.rsi14 ?? null,
          sma13: monthlyIndicators.sma13 ?? null,
          sma34: monthlyIndicators.sma34 ?? null,
          sma44: monthlyIndicators.sma44 ?? null,
          sma50: monthlyIndicators.sma50 ?? null,
          sma200: monthlyIndicators.sma200 ?? null,
          ema9: monthlyIndicators.ema9 ?? null,
          ema15: monthlyIndicators.ema15 ?? null,
          bbUpper: monthlyIndicators.bbUpper ?? null,
          bbMiddle: monthlyIndicators.bbMiddle ?? null,
          bbLower: monthlyIndicators.bbLower ?? null,
          superTrend: monthlyIndicators.superTrend ?? null,
          superTrendDir: monthlyIndicators.superTrendDir ?? null,
          atr14: monthlyIndicators.atr14 ?? null,
          relativeVolume: monthlyIndicators.relativeVolume ?? null,
        },
        update: {
          rsi14: monthlyIndicators.rsi14 ?? null,
          sma13: monthlyIndicators.sma13 ?? null,
          sma34: monthlyIndicators.sma34 ?? null,
          sma44: monthlyIndicators.sma44 ?? null,
          sma50: monthlyIndicators.sma50 ?? null,
          sma200: monthlyIndicators.sma200 ?? null,
          ema9: monthlyIndicators.ema9 ?? null,
          ema15: monthlyIndicators.ema15 ?? null,
          bbUpper: monthlyIndicators.bbUpper ?? null,
          bbMiddle: monthlyIndicators.bbMiddle ?? null,
          bbLower: monthlyIndicators.bbLower ?? null,
          superTrend: monthlyIndicators.superTrend ?? null,
          superTrendDir: monthlyIndicators.superTrendDir ?? null,
          atr14: monthlyIndicators.atr14 ?? null,
          relativeVolume: monthlyIndicators.relativeVolume ?? null,
        },
      });

      instrumentData.set(instrument.id, {
        symbol: instrument.symbol,
        companyName: instrument.companyName,
        sector: instrument.sector,
        marketCapBucket: instrument.marketCapBucket,
        monthlyCandles,
        monthlyIndicators,
        dailyCandles,
        dailyIndicators,
      });
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Unknown error";
      console.warn(`[month-end] Failed processing ${instrument.symbol}: ${msg}`);
    }
  }

  console.log(`[month-end] Processed ${instrumentData.size}/${instruments.length} instruments`);

  // -------------------------------------------------------------------------
  // Step 2: Run BB Monthly Breakout scan
  // -------------------------------------------------------------------------
  const bbMonthlyBreakouts: Array<{
    symbol: string;
    companyName: string;
    instrumentId: string;
    close: number;
    bbUpper: number;
    pctAboveBB: number;
    rsi14?: number;
    volume?: number;
  }> = [];

  for (const [instrumentId, data] of instrumentData) {
    const lastCandle = data.monthlyCandles[data.monthlyCandles.length - 1];
    const ind = data.monthlyIndicators;

    if (lastCandle && ind.bbUpper && lastCandle.close > ind.bbUpper) {
      const pctAbove = ((lastCandle.close - ind.bbUpper) / ind.bbUpper) * 100;
      bbMonthlyBreakouts.push({
        symbol: data.symbol,
        companyName: data.companyName,
        instrumentId,
        close: lastCandle.close,
        bbUpper: ind.bbUpper,
        pctAboveBB: pctAbove,
        rsi14: ind.rsi14,
        volume: lastCandle.volume,
      });
    }
  }

  // Sort by pctAboveBB descending
  bbMonthlyBreakouts.sort((a, b) => b.pctAboveBB - a.pctAboveBB);
  console.log(`[month-end] BB Monthly breakouts: ${bbMonthlyBreakouts.length}`);

  // -------------------------------------------------------------------------
  // Step 3: Run MBB (Middle BB) mean-reversion scan
  // -------------------------------------------------------------------------
  const mbbOpportunities: Array<{
    symbol: string;
    companyName: string;
    instrumentId: string;
    close: number;
    bbMiddle: number;
    pctFromMBB: number;
    rsi14?: number;
    sector?: string | null;
  }> = [];

  for (const [instrumentId, data] of instrumentData) {
    const lastCandle = data.monthlyCandles[data.monthlyCandles.length - 1];
    const ind = data.monthlyIndicators;

    if (lastCandle && ind.bbMiddle) {
      const pctFromMBB = ((lastCandle.close - ind.bbMiddle) / ind.bbMiddle) * 100;

      // MBB dip-buy criteria: price within 5% of MBB (above or below), RSI not oversold
      if (Math.abs(pctFromMBB) <= 5 && (ind.rsi14 === undefined || ind.rsi14 > 30)) {
        mbbOpportunities.push({
          symbol: data.symbol,
          companyName: data.companyName,
          instrumentId,
          close: lastCandle.close,
          bbMiddle: ind.bbMiddle,
          pctFromMBB,
          rsi14: ind.rsi14,
          sector: data.sector,
        });
      }
    }
  }

  // Sort by proximity to MBB (closest first)
  mbbOpportunities.sort((a, b) => Math.abs(a.pctFromMBB) - Math.abs(b.pctFromMBB));
  console.log(`[month-end] MBB opportunities: ${mbbOpportunities.length}`);

  // -------------------------------------------------------------------------
  // Step 4: Run investment strategies via evaluateStrategy
  // -------------------------------------------------------------------------
  const strategyResults: Array<{
    symbol: string;
    companyName: string;
    instrumentId: string;
    strategyKey: string;
    strategyName: string;
    matched: boolean;
    softScore: number;
    entryPrice?: number;
    stopLoss?: number;
    explanation: string;
  }> = [];

  for (const strategy of investmentStrategies) {
    const activeVersion = strategy.versions[0];
    if (!activeVersion) continue;

    const dsl = activeVersion.normalizedDsl as unknown as StrategyDSL;
    if (!dsl || !dsl.filters) continue;

    // Create StrategyRun for month-end
    const strategyRun = await prisma.strategyRun.create({
      data: {
        strategyVersionId: activeVersion.id,
        runAt: new Date(),
        runScope: "month_end",
        marketDate,
        status: "running",
      },
    });

    let matchCount = 0;

    for (const [instrumentId, data] of instrumentData) {
      // Build context with both monthly and daily data
      const monthlyCtx = buildDataContext(data.monthlyCandles, data.monthlyIndicators, "monthly");
      const dailyCtx = data.dailyCandles.length >= 2
        ? buildDataContext(data.dailyCandles, data.dailyIndicators, "daily")
        : {};

      // Merge both timeframe contexts
      const ctx = { ...monthlyCtx, ...dailyCtx };

      const result = evaluateStrategy(dsl, data.symbol, dateStr, ctx);

      await prisma.strategyResult.create({
        data: {
          strategyId: strategy.id,
          strategyRunId: strategyRun.id,
          instrumentId,
          marketDate,
          matched: result.allPassed,
          ruleResults: result.conditions.reduce(
            (acc, c) => {
              acc[c.field] = {
                passed: c.passed,
                value: c.actualValue,
                reason: c.reason,
              };
              return acc;
            },
            {} as Record<string, { passed: boolean; value?: unknown; reason: string }>,
          ),
          explanation: result.explanation,
        },
      });

      if (result.allPassed) {
        matchCount++;
        strategyResults.push({
          symbol: data.symbol,
          companyName: data.companyName,
          instrumentId,
          strategyKey: strategy.key,
          strategyName: strategy.name,
          matched: true,
          softScore: result.softScore,
          entryPrice: result.entryPrice,
          stopLoss: result.stopLoss,
          explanation: result.explanation,
        });
      }
    }

    await prisma.strategyRun.update({
      where: { id: strategyRun.id },
      data: {
        status: "completed",
        summaryJson: {
          totalEvaluated: instrumentData.size,
          totalMatched: matchCount,
          scope: "month_end",
        },
      },
    });

    console.log(`[month-end] Strategy ${strategy.key}: ${matchCount}/${instrumentData.size} matched`);
  }

  // -------------------------------------------------------------------------
  // Step 5: Alpha/Beta large-cap quality screen
  // -------------------------------------------------------------------------
  const alphaBetaResults: Array<{
    symbol: string;
    companyName: string;
    instrumentId: string;
    sector: string | null;
    marketCap: string | null;
    rsi14Monthly?: number;
    aboveSma200: boolean;
    relativeVolume?: number;
  }> = [];

  for (const [instrumentId, data] of instrumentData) {
    // Alpha/Beta filter: large-cap, above 200 SMA on daily, RSI monthly 40-70 (healthy range)
    if (data.marketCapBucket !== "large_cap") continue;

    const lastDaily = data.dailyCandles.length > 0
      ? data.dailyCandles[data.dailyCandles.length - 1]
      : null;
    const dailyInd = data.dailyIndicators;
    const monthlyInd = data.monthlyIndicators;

    const aboveSma200 = lastDaily && dailyInd.sma200
      ? lastDaily.close > dailyInd.sma200
      : false;

    const healthyRsi = monthlyInd.rsi14 !== undefined
      ? monthlyInd.rsi14 >= 40 && monthlyInd.rsi14 <= 70
      : false;

    if (aboveSma200 && healthyRsi) {
      alphaBetaResults.push({
        symbol: data.symbol,
        companyName: data.companyName,
        instrumentId,
        sector: data.sector,
        marketCap: data.marketCapBucket,
        rsi14Monthly: monthlyInd.rsi14,
        aboveSma200,
        relativeVolume: dailyInd.relativeVolume,
      });
    }
  }

  console.log(`[month-end] Alpha/Beta screen: ${alphaBetaResults.length} large-cap quality stocks`);

  // -------------------------------------------------------------------------
  // Step 6: Portfolio review — check existing positions
  // -------------------------------------------------------------------------
  const portfolioReviewLines: string[] = [];

  try {
    // Find watchlist items marked as positions
    const watchlists = await prisma.watchlist.findMany({
      where: { kind: "strategy_generated" },
      include: {
        items: {
          where: { isActive: true },
          include: { instrument: true },
        },
      },
    });

    for (const wl of watchlists) {
      for (const item of wl.items) {
        const data = instrumentData.get(item.instrumentId);
        if (!data) continue;

        const lastMonthly = data.monthlyCandles.length > 0
          ? data.monthlyCandles[data.monthlyCandles.length - 1]
          : null;
        const mInd = data.monthlyIndicators;

        if (!lastMonthly) continue;

        const healthFlags: string[] = [];

        // Check if still above MBB
        if (mInd.bbMiddle && lastMonthly.close < mInd.bbMiddle) {
          healthFlags.push("BELOW MBB");
        }

        // Check RSI deterioration
        if (mInd.rsi14 !== undefined && mInd.rsi14 < 40) {
          healthFlags.push(`RSI weak (${mInd.rsi14.toFixed(1)})`);
        }

        // Check SuperTrend flip
        if (mInd.superTrendDir === "down") {
          healthFlags.push("SuperTrend DOWN on monthly");
        }

        // Daily support check
        const dInd = data.dailyIndicators;
        if (dInd.sma200) {
          const lastDaily = data.dailyCandles[data.dailyCandles.length - 1];
          if (lastDaily && lastDaily.close < dInd.sma200) {
            healthFlags.push("Below 200 SMA on daily");
          }
        }

        const status = healthFlags.length === 0 ? "HEALTHY" : "REVIEW NEEDED";
        const flags = healthFlags.length > 0 ? ` — ${healthFlags.join(", ")}` : "";
        portfolioReviewLines.push(
          `- **${data.symbol}** (${data.companyName}): ${status}${flags}`,
        );
      }
    }
  } catch (err) {
    console.warn(`[month-end] Portfolio review failed: ${err instanceof Error ? err.message : "Unknown"}`);
    portfolioReviewLines.push("Portfolio review data unavailable.");
  }

  // -------------------------------------------------------------------------
  // Step 7: Generate month-end Digest
  // -------------------------------------------------------------------------
  const digestTitle = `Month-End Investment Digest — ${dateStr}`;
  const digestSummary = buildMonthEndSummary(
    bbMonthlyBreakouts.length,
    mbbOpportunities.length,
    strategyResults.length,
    alphaBetaResults.length,
    instrumentData.size,
  );

  const globalCtx = await prisma.globalContextSnapshot
    .findUnique({ where: { date: marketDate } })
    .catch(() => null);

  const digest = await prisma.digest.upsert({
    where: {
      digestType_marketDate: {
        digestType: "month_end",
        marketDate,
      },
    },
    create: {
      digestType: "month_end",
      marketDate,
      title: digestTitle,
      summary: digestSummary,
      posture: globalCtx?.marketPosture ?? null,
      metricsJson: {
        instrumentsProcessed: instrumentData.size,
        bbBreakouts: bbMonthlyBreakouts.length,
        mbbOpportunities: mbbOpportunities.length,
        strategyMatches: strategyResults.length,
        alphaBetaPassers: alphaBetaResults.length,
      },
    },
    update: {
      title: digestTitle,
      summary: digestSummary,
      posture: globalCtx?.marketPosture ?? null,
      metricsJson: {
        instrumentsProcessed: instrumentData.size,
        bbBreakouts: bbMonthlyBreakouts.length,
        mbbOpportunities: mbbOpportunities.length,
        strategyMatches: strategyResults.length,
        alphaBetaPassers: alphaBetaResults.length,
      },
    },
  });

  // Replace sections
  await prisma.digestSection.deleteMany({ where: { digestId: digest.id } });

  await prisma.digestSection.createMany({
    data: [
      {
        digestId: digest.id,
        key: "bb_monthly_scan",
        title: "BB Monthly Breakout Scan",
        bodyMarkdown: buildBBMonthlyScanSection(bbMonthlyBreakouts),
        sortOrder: 1,
      },
      {
        digestId: digest.id,
        key: "mbb_opportunities",
        title: "MBB Dip-Buy Opportunities",
        bodyMarkdown: buildMBBSection(mbbOpportunities),
        sortOrder: 2,
      },
      {
        digestId: digest.id,
        key: "portfolio_review",
        title: "Portfolio Health Review",
        bodyMarkdown: buildPortfolioReviewSection(portfolioReviewLines),
        sortOrder: 3,
      },
      {
        digestId: digest.id,
        key: "alpha_beta_screen",
        title: "Alpha/Beta Large-Cap Quality Filter",
        bodyMarkdown: buildAlphaBetaSection(alphaBetaResults),
        sortOrder: 4,
      },
    ],
  });

  // Save stock mentions for all notable results
  const mentionData: Array<{
    digestId: string;
    instrumentId: string;
    mentionType: string;
    contextJson: Record<string, unknown>;
  }> = [];

  for (const bb of bbMonthlyBreakouts) {
    mentionData.push({
      digestId: digest.id,
      instrumentId: bb.instrumentId,
      mentionType: "breakout",
      contextJson: {
        type: "bb_monthly_breakout",
        close: bb.close,
        bbUpper: bb.bbUpper,
        pctAboveBB: bb.pctAboveBB,
      },
    });
  }

  for (const mbb of mbbOpportunities.slice(0, 30)) {
    mentionData.push({
      digestId: digest.id,
      instrumentId: mbb.instrumentId,
      mentionType: "watchlist_change",
      contextJson: {
        type: "mbb_opportunity",
        close: mbb.close,
        bbMiddle: mbb.bbMiddle,
        pctFromMBB: mbb.pctFromMBB,
      },
    });
  }

  for (const result of strategyResults) {
    mentionData.push({
      digestId: digest.id,
      instrumentId: result.instrumentId,
      mentionType: "strategy_match",
      contextJson: {
        strategyKey: result.strategyKey,
        softScore: result.softScore,
        entryPrice: result.entryPrice,
      },
    });
  }

  if (mentionData.length > 0) {
    const seen = new Set<string>();
    const uniqueMentions = mentionData.filter((m) => {
      const key = `${m.instrumentId}:${m.mentionType}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });

    await prisma.digestStockMention.deleteMany({ where: { digestId: digest.id } });
    await prisma.digestStockMention.createMany({ data: uniqueMentions });
  }

  console.log(`[month-end] Digest saved: ${digest.id}`);
  console.log(`[month-end] Pipeline complete.`);
}

// =============================================================================
// Digest section builders
// =============================================================================

function buildBBMonthlyScanSection(
  breakouts: Array<{
    symbol: string;
    companyName: string;
    close: number;
    bbUpper: number;
    pctAboveBB: number;
    rsi14?: number;
    volume?: number;
  }>,
): string {
  if (breakouts.length === 0) {
    return "No stocks breaking above the upper Bollinger Band on the monthly timeframe this month.\n\nThis is normal — BB breakouts on monthly are rare and signal strong momentum when they occur.";
  }

  const lines = [
    `**${breakouts.length} stock(s)** breaking above upper BB on monthly chart.`,
    "",
    "These represent rare momentum events on the highest timeframe. Per the investment strategy, these warrant immediate review for position initiation with a buffer entry above the breakout candle.",
    "",
    "| Symbol | Company | Close | BB Upper | % Above BB | Monthly RSI |",
    "|--------|---------|-------|----------|-----------|-------------|",
  ];

  for (const b of breakouts.slice(0, 25)) {
    lines.push(
      `| ${b.symbol} | ${b.companyName} | ${b.close.toFixed(2)} | ${b.bbUpper.toFixed(2)} | +${b.pctAboveBB.toFixed(2)}% | ${b.rsi14?.toFixed(1) ?? "N/A"} |`,
    );
  }

  if (breakouts.length > 25) {
    lines.push(`\n... and ${breakouts.length - 25} more.`);
  }

  lines.push(
    "",
    "### Action Items",
    "- Review charts for clean breakout structure (volume confirmation, candle body > 50%)",
    "- Compute entry price: buffer 1-2% above monthly high",
    "- Set stop-loss at recent monthly swing low or 8-10% below entry",
    "- Position size per risk calculator (max 2% capital risk per trade)",
  );

  return lines.join("\n");
}

function buildMBBSection(
  opportunities: Array<{
    symbol: string;
    companyName: string;
    close: number;
    bbMiddle: number;
    pctFromMBB: number;
    rsi14?: number;
    sector?: string | null;
  }>,
): string {
  if (opportunities.length === 0) {
    return "No stocks currently near the Middle Bollinger Band on monthly.\n\nMBB dip-buy opportunities appear during healthy pullbacks in uptrending stocks.";
  }

  const lines = [
    `**${opportunities.length} stock(s)** near monthly MBB — potential dip-buy zone.`,
    "",
    "MBB (20-period SMA on monthly) acts as a dynamic support in uptrends. Stocks pulling back to this level in an otherwise healthy trend represent mean-reversion buy opportunities for the investment portfolio.",
    "",
    "| Symbol | Company | Close | MBB | % From MBB | Monthly RSI | Sector |",
    "|--------|---------|-------|-----|-----------|-------------|--------|",
  ];

  for (const m of opportunities.slice(0, 25)) {
    lines.push(
      `| ${m.symbol} | ${m.companyName} | ${m.close.toFixed(2)} | ${m.bbMiddle.toFixed(2)} | ${m.pctFromMBB >= 0 ? "+" : ""}${m.pctFromMBB.toFixed(2)}% | ${m.rsi14?.toFixed(1) ?? "N/A"} | ${m.sector ?? "-"} |`,
    );
  }

  if (opportunities.length > 25) {
    lines.push(`\n... and ${opportunities.length - 25} more.`);
  }

  lines.push(
    "",
    "### Action Items",
    "- Confirm stock is in a structural uptrend (higher highs/lows on monthly)",
    "- Check for fundamental quality (earnings growth, sector strength)",
    "- Entry: at or near MBB level, or on next monthly green candle close above MBB",
    "- Stop-loss: below recent monthly swing low or lower BB",
  );

  return lines.join("\n");
}

function buildPortfolioReviewSection(reviewLines: string[]): string {
  if (reviewLines.length === 0) {
    return "No existing positions found in strategy-generated watchlists.\n\nAdd positions to a watchlist with kind 'strategy_generated' to enable monthly health checks.";
  }

  const healthy = reviewLines.filter((l) => l.includes("HEALTHY")).length;
  const needsReview = reviewLines.filter((l) => l.includes("REVIEW NEEDED")).length;

  const lines = [
    `**Portfolio snapshot**: ${healthy} healthy, ${needsReview} need review.`,
    "",
    ...reviewLines,
  ];

  if (needsReview > 0) {
    lines.push(
      "",
      "### Positions Needing Review",
      "Positions flagged above should be evaluated for:",
      "- Tightening stop-loss if trend structure has weakened",
      "- Partial exit if monthly SuperTrend has flipped down",
      "- Full exit if price has fallen below lower BB on monthly",
    );
  }

  return lines.join("\n");
}

function buildAlphaBetaSection(
  results: Array<{
    symbol: string;
    companyName: string;
    sector: string | null;
    marketCap: string | null;
    rsi14Monthly?: number;
    aboveSma200: boolean;
    relativeVolume?: number;
  }>,
): string {
  if (results.length === 0) {
    return "No large-cap stocks currently pass the Alpha/Beta quality filter.\n\nThis filter requires: large-cap + above 200 SMA on daily + monthly RSI in 40-70 range.";
  }

  const lines = [
    `**${results.length} large-cap stock(s)** passing the quality filter.`,
    "",
    "Alpha/Beta screen identifies fundamentally sound large-caps in a healthy technical position — suitable as core portfolio holdings.",
    "",
    "| Symbol | Company | Sector | Monthly RSI | Rel. Volume |",
    "|--------|---------|--------|-------------|-------------|",
  ];

  // Group by sector
  const bySector = new Map<string, typeof results>();
  for (const r of results) {
    const sector = r.sector ?? "Unknown";
    const existing = bySector.get(sector) ?? [];
    existing.push(r);
    bySector.set(sector, existing);
  }

  for (const r of results.slice(0, 30)) {
    lines.push(
      `| ${r.symbol} | ${r.companyName} | ${r.sector ?? "-"} | ${r.rsi14Monthly?.toFixed(1) ?? "N/A"} | ${r.relativeVolume?.toFixed(2) ?? "N/A"} |`,
    );
  }

  if (results.length > 30) {
    lines.push(`\n... and ${results.length - 30} more.`);
  }

  // Sector distribution
  lines.push("", "### Sector Distribution");
  for (const [sector, stocks] of bySector) {
    lines.push(`- ${sector}: ${stocks.length} stock(s)`);
  }

  return lines.join("\n");
}

function buildMonthEndSummary(
  bbBreakouts: number,
  mbbOpps: number,
  stratMatches: number,
  alphaBetaPassers: number,
  processed: number,
): string {
  return [
    `Processed ${processed} instruments on monthly timeframe.`,
    `BB breakouts: ${bbBreakouts}.`,
    `MBB opportunities: ${mbbOpps}.`,
    `Investment strategy matches: ${stratMatches}.`,
    `Alpha/Beta quality: ${alphaBetaPassers} large-caps.`,
  ].join(" ");
}
