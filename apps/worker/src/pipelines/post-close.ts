import { prisma } from "@ibo/db";
import {
  buildIndicatorSet,
  evaluateStrategy,
  evaluateScreener,
  computeIntersection,
  computeConfluenceScore,
} from "@ibo/strategy-engine";
import type { DataContext, SymbolMatches } from "@ibo/strategy-engine";
import type {
  StrategyDSL,
  ScreenerDSL,
  Candle,
  IndicatorSet,
} from "@ibo/types";
import { Timeframe } from "@ibo/types";
import { getAdapter } from "../adapters";

/**
 * Post-close pipeline.
 * Schedule: 4:30 PM IST (11:00 UTC)
 *
 * 1. Fetch EOD candle data for all tracked instruments
 * 2. Compute indicators using buildIndicatorSet
 * 3. Save IndicatorSnapshot records
 * 4. Run all active strategies against all instruments
 * 5. Save StrategyRun + StrategyResult records
 * 6. Run all active screeners
 * 7. Save ScreenerRun + ScreenerResult records
 * 8. Compute confluence using intersection engine
 * 9. Save ConfluenceResult records
 * 10. Generate post-close Digest with sections
 * 11. Save Digest + DigestSections + DigestStockMentions
 */
export async function runPostClosePipeline() {
  const today = new Date();
  const dateStr = today.toISOString().split("T")[0];
  const marketDate = new Date(`${dateStr}T00:00:00.000Z`);
  console.log(`[post-close] Running pipeline for ${dateStr}`);

  const adapter = getAdapter("twelvedata") ?? getAdapter("nse_official");

  // -------------------------------------------------------------------------
  // Step 1: Fetch active strategies, screeners, and instruments
  // -------------------------------------------------------------------------
  const [strategies, screeners, instruments] = await Promise.all([
    prisma.strategy.findMany({
      where: { status: "active" },
      include: { versions: { where: { isActive: true }, take: 1 } },
    }),
    prisma.screener.findMany({
      where: { isExternalReference: false },
      include: { versions: { where: { isActive: true }, take: 1 } },
    }),
    prisma.instrument.findMany({
      where: { isActive: true },
    }),
  ]);

  console.log(
    `[post-close] ${instruments.length} instruments, ${strategies.length} strategies, ${screeners.length} screeners`,
  );

  if (instruments.length === 0) {
    console.warn("[post-close] No active instruments found. Pipeline exiting early.");
    return;
  }

  // -------------------------------------------------------------------------
  // Step 2 & 3: Fetch EOD candles, compute indicators, save snapshots
  // -------------------------------------------------------------------------
  // Map of instrumentId -> { candles, indicators, lastCandle }
  const instrumentData = new Map<
    string,
    {
      symbol: string;
      companyName: string;
      candles: Candle[];
      indicators: IndicatorSet;
      lastCandle: Candle | null;
    }
  >();

  // Compute lookback: 200 SMA needs 200+ bars
  const lookbackDays = 250;
  const fromDate = new Date(today);
  fromDate.setDate(fromDate.getDate() - lookbackDays);
  const fromStr = fromDate.toISOString().split("T")[0];

  let candleFetchErrors = 0;

  for (const instrument of instruments) {
    try {
      let candles: Candle[] = [];

      if (adapter) {
        const series = await adapter.getHistoricalCandles({
          symbol: instrument.symbol,
          timeframe: Timeframe.D1,
          from: fromStr,
          to: dateStr,
        });

        if (series && series.candles && series.candles.length > 0) {
          candles = series.candles.map((c) => ({
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

      // If adapter returned nothing, fall back to DB candle history
      if (candles.length === 0) {
        const dbCandles = await prisma.candle.findMany({
          where: {
            instrumentId: instrument.id,
            timeframe: "D1",
            ts: { gte: fromDate, lte: today },
          },
          orderBy: { ts: "asc" },
        });
        candles = dbCandles.map((c) => ({
          ts: c.ts,
          open: Number(c.open),
          high: Number(c.high),
          low: Number(c.low),
          close: Number(c.close),
          volume: Number(c.volume ?? 0),
          deliveryPct: c.deliveryPct ? Number(c.deliveryPct) : undefined,
        }));
      }

      if (candles.length < 2) {
        // Skip instruments with insufficient data
        continue;
      }

      // Compute indicators
      const indicators = buildIndicatorSet(candles);
      const lastCandle = candles[candles.length - 1];

      instrumentData.set(instrument.id, {
        symbol: instrument.symbol,
        companyName: instrument.companyName,
        candles,
        indicators,
        lastCandle,
      });

      // Save IndicatorSnapshot
      await prisma.indicatorSnapshot.upsert({
        where: {
          instrumentId_timeframe_ts: {
            instrumentId: instrument.id,
            timeframe: "D1",
            ts: marketDate,
          },
        },
        create: {
          instrumentId: instrument.id,
          timeframe: "D1",
          ts: marketDate,
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
    } catch (err) {
      candleFetchErrors++;
      const msg = err instanceof Error ? err.message : "Unknown error";
      console.warn(`[post-close] Failed processing ${instrument.symbol}: ${msg}`);
    }
  }

  console.log(
    `[post-close] Processed ${instrumentData.size}/${instruments.length} instruments (${candleFetchErrors} errors)`,
  );

  // -------------------------------------------------------------------------
  // Step 4 & 5: Run strategies, save StrategyRun + StrategyResult
  // -------------------------------------------------------------------------
  const allStrategyMatches: Array<{
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

  for (const strategy of strategies) {
    const activeVersion = strategy.versions[0];
    if (!activeVersion) {
      console.warn(`[post-close] Strategy ${strategy.key} has no active version, skipping.`);
      continue;
    }

    const dsl = activeVersion.normalizedDsl as unknown as StrategyDSL;
    if (!dsl || !dsl.filters) {
      console.warn(`[post-close] Strategy ${strategy.key} has invalid DSL, skipping.`);
      continue;
    }

    // Create StrategyRun
    const strategyRun = await prisma.strategyRun.create({
      data: {
        strategyVersionId: activeVersion.id,
        runAt: new Date(),
        runScope: "daily",
        marketDate,
        status: "running",
      },
    });

    let matchCount = 0;
    let evalCount = 0;

    for (const [instrumentId, data] of instrumentData) {
      const ctx = buildDataContext(data.candles, data.indicators, "daily");

      const result = evaluateStrategy(dsl, data.symbol, dateStr, ctx);
      evalCount++;

      if (result.allPassed) matchCount++;

      // Save StrategyResult
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
        allStrategyMatches.push({
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

    // Update StrategyRun with summary
    await prisma.strategyRun.update({
      where: { id: strategyRun.id },
      data: {
        status: "completed",
        summaryJson: {
          totalEvaluated: evalCount,
          totalMatched: matchCount,
          matchRate: evalCount > 0 ? (matchCount / evalCount * 100).toFixed(1) + "%" : "0%",
        },
      },
    });

    console.log(
      `[post-close] Strategy ${strategy.key}: ${matchCount}/${evalCount} matched`,
    );
  }

  // -------------------------------------------------------------------------
  // Step 6 & 7: Run screeners, save ScreenerRun + ScreenerResult
  // -------------------------------------------------------------------------
  const screenerMatchesByKey = new Map<string, SymbolMatches[]>();
  const screenerHighlights: Array<{
    screenerKey: string;
    screenerName: string;
    matchCount: number;
    symbols: string[];
  }> = [];

  for (const screener of screeners) {
    const activeVersion = screener.versions[0];
    const dsl = (activeVersion?.expressionDsl ?? screener.expressionDsl) as unknown as ScreenerDSL | null;

    if (!dsl || !dsl.filters) {
      console.warn(`[post-close] Screener ${screener.key} has no valid DSL, skipping.`);
      continue;
    }

    // Create ScreenerRun
    const screenerRun = await prisma.screenerRun.create({
      data: {
        screenerId: screener.id,
        runAt: new Date(),
        marketDate,
        scope: "daily",
        status: "running",
      },
    });

    const matchedSymbols: SymbolMatches[] = [];
    let matchCount = 0;

    for (const [instrumentId, data] of instrumentData) {
      const ctx = buildDataContext(data.candles, data.indicators, "daily");
      const result = evaluateScreener(dsl, data.symbol, ctx);

      // Save ScreenerResult
      await prisma.screenerResult.create({
        data: {
          screenerRunId: screenerRun.id,
          instrumentId,
          marketDate,
          matched: result.passed,
          metricsJson: {
            conditions: result.conditions.map((c) => ({
              field: c.field,
              passed: c.passed,
              actual: c.actualValue,
              expected: c.expectedValue,
            })),
          },
          explanation: result.passed
            ? `${data.symbol} matched all ${result.conditions.length} filter(s) for ${screener.key}`
            : null,
        },
      });

      if (result.passed) {
        matchCount++;
        // Determine family from linked strategy or default
        const family = screener.linkedStrategyId
          ? (
              strategies.find((s) => s.id === screener.linkedStrategyId)
                ?.family ?? "swing"
            )
          : "swing";

        matchedSymbols.push({
          symbol: data.symbol,
          companyName: data.companyName,
          matches: [
            {
              screenerKey: screener.key,
              screenerLabel: screener.name,
              family,
            },
          ],
        });
      }
    }

    // Update ScreenerRun summary
    await prisma.screenerRun.update({
      where: { id: screenerRun.id },
      data: {
        status: "completed",
        summaryJson: {
          totalEvaluated: instrumentData.size,
          totalMatched: matchCount,
        },
      },
    });

    screenerMatchesByKey.set(screener.key, matchedSymbols);
    screenerHighlights.push({
      screenerKey: screener.key,
      screenerName: screener.name,
      matchCount,
      symbols: matchedSymbols.map((m) => m.symbol),
    });

    console.log(
      `[post-close] Screener ${screener.key}: ${matchCount}/${instrumentData.size} matched`,
    );
  }

  // -------------------------------------------------------------------------
  // Step 8 & 9: Compute confluence and save ConfluenceResult
  // -------------------------------------------------------------------------
  const screenerKeys = Array.from(screenerMatchesByKey.keys());
  const confluenceResults =
    screenerKeys.length >= 2
      ? computeIntersection(
          {
            screenerKeys,
            mode: "union",
            marketDate: dateStr,
          },
          screenerMatchesByKey,
        )
      : [];

  const topConfluence: Array<{
    symbol: string;
    companyName: string;
    score: number;
    bucket: string;
    overlapCount: number;
    explanation: string;
    instrumentId?: string;
  }> = [];

  for (const result of confluenceResults) {
    const { score, bucket } = computeConfluenceScore(result, screenerKeys.length);

    // Find instrumentId for this symbol
    const instrument = instruments.find((i) => i.symbol === result.symbol);
    if (!instrument) continue;

    await prisma.confluenceResult.upsert({
      where: {
        instrumentId_marketDate: {
          instrumentId: instrument.id,
          marketDate,
        },
      },
      create: {
        instrumentId: instrument.id,
        marketDate,
        overlapCount: result.overlapCount,
        overlapKeys: result.matchedBy.map((m) => m.key),
        weightedScore: score,
        familyMix: result.familyMix,
        explanation: result.explanation,
      },
      update: {
        overlapCount: result.overlapCount,
        overlapKeys: result.matchedBy.map((m) => m.key),
        weightedScore: score,
        familyMix: result.familyMix,
        explanation: result.explanation,
      },
    });

    topConfluence.push({
      symbol: result.symbol,
      companyName: result.companyName,
      score,
      bucket,
      overlapCount: result.overlapCount,
      explanation: result.explanation,
      instrumentId: instrument.id,
    });
  }

  // Sort by score descending
  topConfluence.sort((a, b) => b.score - a.score);

  console.log(`[post-close] Confluence: ${topConfluence.length} results computed`);

  // -------------------------------------------------------------------------
  // Step 10: Fetch market breadth data
  // -------------------------------------------------------------------------
  let breadthData: { advances?: number; declines?: number; new52WeekHighs?: number; new52WeekLows?: number } = {};
  if (adapter) {
    try {
      const raw = await adapter.getMarketBreadth(dateStr);
      if (raw && typeof raw === "object") {
        breadthData = {
          advances: raw.advances,
          declines: raw.declines,
          new52WeekHighs: raw.new52WeekHighs,
          new52WeekLows: raw.new52WeekLows,
        };
      }
    } catch (err) {
      console.warn(`[post-close] Market breadth fetch failed: ${err instanceof Error ? err.message : "Unknown"}`);
    }
  }

  // Save breadth snapshot if data available
  if (breadthData.advances !== undefined || breadthData.declines !== undefined) {
    await prisma.marketBreadthSnapshot.upsert({
      where: { date: marketDate },
      create: {
        date: marketDate,
        advances: breadthData.advances ?? null,
        declines: breadthData.declines ?? null,
        new52WeekHighs: breadthData.new52WeekHighs ?? null,
        new52WeekLows: breadthData.new52WeekLows ?? null,
        narrative: buildBreadthNarrative(breadthData),
      },
      update: {
        advances: breadthData.advances ?? null,
        declines: breadthData.declines ?? null,
        new52WeekHighs: breadthData.new52WeekHighs ?? null,
        new52WeekLows: breadthData.new52WeekLows ?? null,
        narrative: buildBreadthNarrative(breadthData),
      },
    });
  }

  // -------------------------------------------------------------------------
  // Step 11: Generate post-close Digest
  // -------------------------------------------------------------------------
  const digestTitle = `Post-Close Digest — ${dateStr}`;
  const digestSummary = buildPostCloseDigestSummary(
    allStrategyMatches.length,
    topConfluence.length,
    instrumentData.size,
    breadthData,
  );

  // Fetch today's global context for posture
  const globalCtx = await prisma.globalContextSnapshot
    .findUnique({ where: { date: marketDate } })
    .catch(() => null);

  const digest = await prisma.digest.upsert({
    where: {
      digestType_marketDate: {
        digestType: "post_close",
        marketDate,
      },
    },
    create: {
      digestType: "post_close",
      marketDate,
      title: digestTitle,
      summary: digestSummary,
      posture: globalCtx?.marketPosture ?? null,
      metricsJson: {
        instrumentsProcessed: instrumentData.size,
        strategyMatches: allStrategyMatches.length,
        confluenceResults: topConfluence.length,
        breadth: breadthData,
      },
    },
    update: {
      title: digestTitle,
      summary: digestSummary,
      posture: globalCtx?.marketPosture ?? null,
      metricsJson: {
        instrumentsProcessed: instrumentData.size,
        strategyMatches: allStrategyMatches.length,
        confluenceResults: topConfluence.length,
        breadth: breadthData,
      },
    },
  });

  // Delete old sections for upsert scenario, then create fresh
  await prisma.digestSection.deleteMany({ where: { digestId: digest.id } });

  await prisma.digestSection.createMany({
    data: [
      {
        digestId: digest.id,
        key: "market_summary",
        title: "Market Summary",
        bodyMarkdown: buildMarketSummarySection(instrumentData, breadthData),
        sortOrder: 1,
      },
      {
        digestId: digest.id,
        key: "strategy_matches",
        title: "Strategy Matches",
        bodyMarkdown: buildStrategyMatchesSection(allStrategyMatches, topConfluence),
        sortOrder: 2,
      },
      {
        digestId: digest.id,
        key: "screener_highlights",
        title: "Screener Highlights",
        bodyMarkdown: buildScreenerHighlightsSection(screenerHighlights),
        sortOrder: 3,
      },
      {
        digestId: digest.id,
        key: "breadth",
        title: "Market Breadth",
        bodyMarkdown: buildBreadthSection(breadthData),
        sortOrder: 4,
      },
    ],
  });

  // Save DigestStockMentions for top confluence and strategy matches
  const mentionData: Array<{
    digestId: string;
    instrumentId: string;
    mentionType: string;
    contextJson: Record<string, unknown>;
  }> = [];

  // Strategy match mentions
  for (const match of allStrategyMatches) {
    mentionData.push({
      digestId: digest.id,
      instrumentId: match.instrumentId,
      mentionType: "strategy_match",
      contextJson: {
        strategyKey: match.strategyKey,
        strategyName: match.strategyName,
        softScore: match.softScore,
        entryPrice: match.entryPrice,
        stopLoss: match.stopLoss,
      },
    });
  }

  // Confluence mentions (top 20)
  for (const conf of topConfluence.slice(0, 20)) {
    if (!conf.instrumentId) continue;
    mentionData.push({
      digestId: digest.id,
      instrumentId: conf.instrumentId,
      mentionType: "confluence",
      contextJson: {
        score: conf.score,
        bucket: conf.bucket,
        overlapCount: conf.overlapCount,
      },
    });
  }

  if (mentionData.length > 0) {
    // Deduplicate by instrumentId + mentionType
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

  console.log(`[post-close] Digest saved: ${digest.id} with ${mentionData.length} stock mentions`);
  console.log(`[post-close] Pipeline complete.`);
}

// =============================================================================
// Data context builder
// =============================================================================

/**
 * Build a flat DataContext from candle history and computed indicators.
 * Maps each indicator to its dot-path format for the condition evaluator.
 */
export function buildDataContext(
  candles: Candle[],
  indicators: IndicatorSet,
  timeframePrefix: "daily" | "monthly" | "weekly" | "h4",
): DataContext {
  const ctx: DataContext = {};
  const tf = timeframePrefix;

  if (candles.length === 0) return ctx;

  const last = candles[candles.length - 1];
  const prev = candles.length >= 2 ? candles[candles.length - 2] : null;

  // OHLCV data
  ctx[`${tf}.open`] = last.open;
  ctx[`${tf}.high`] = last.high;
  ctx[`${tf}.low`] = last.low;
  ctx[`${tf}.close`] = last.close;
  ctx[`${tf}.volume`] = last.volume;
  if (last.deliveryPct !== undefined) ctx[`${tf}.deliveryPct`] = last.deliveryPct;

  // Previous day data
  if (prev) {
    ctx[`${tf}.prev_close`] = prev.close;
    ctx[`${tf}.prev_high`] = prev.high;
    ctx[`${tf}.prev_low`] = prev.low;
    ctx[`${tf}.changePct`] = ((last.close - prev.close) / prev.close) * 100;
  }

  // Indicators
  if (indicators.rsi14 !== undefined) ctx[`${tf}.rsi14`] = indicators.rsi14;
  if (indicators.sma13 !== undefined) ctx[`${tf}.sma13`] = indicators.sma13;
  if (indicators.sma34 !== undefined) ctx[`${tf}.sma34`] = indicators.sma34;
  if (indicators.sma44 !== undefined) ctx[`${tf}.sma44`] = indicators.sma44;
  if (indicators.sma50 !== undefined) ctx[`${tf}.sma50`] = indicators.sma50;
  if (indicators.sma200 !== undefined) ctx[`${tf}.sma200`] = indicators.sma200;
  if (indicators.ema9 !== undefined) ctx[`${tf}.ema9`] = indicators.ema9;
  if (indicators.ema15 !== undefined) ctx[`${tf}.ema15`] = indicators.ema15;
  if (indicators.bbUpper !== undefined) ctx[`${tf}.bbUpper`] = indicators.bbUpper;
  if (indicators.bbMiddle !== undefined) ctx[`${tf}.bbMiddle`] = indicators.bbMiddle;
  if (indicators.bbLower !== undefined) ctx[`${tf}.bbLower`] = indicators.bbLower;
  if (indicators.superTrend !== undefined) ctx[`${tf}.superTrend`] = indicators.superTrend;
  if (indicators.superTrendDir !== undefined) ctx[`${tf}.superTrendDir`] = indicators.superTrendDir;
  if (indicators.atr14 !== undefined) ctx[`${tf}.atr14`] = indicators.atr14;
  if (indicators.relativeVolume !== undefined) ctx[`${tf}.relativeVolume`] = indicators.relativeVolume;

  // Derived structural analysis
  if (candles.length >= 5) {
    const recentCandles = candles.slice(-5);
    const recentHighs = recentCandles.map((c) => c.high);
    const recentLows = recentCandles.map((c) => c.low);

    ctx["derived.recent_swing_high"] = Math.max(...recentHighs);
    ctx["derived.recent_swing_low"] = Math.min(...recentLows);

    // Higher highs / higher lows detection (last 5 candles)
    const highs = recentCandles.map((c) => c.high);
    const lows = recentCandles.map((c) => c.low);
    let higherHighs = true;
    let higherLows = true;
    for (let i = 1; i < highs.length; i++) {
      if (highs[i] <= highs[i - 1]) higherHighs = false;
      if (lows[i] <= lows[i - 1]) higherLows = false;
    }
    ctx["derived.higher_highs"] = higherHighs;
    ctx["derived.higher_lows"] = higherLows;
  }

  // Price relative to key levels
  if (last.close && indicators.bbUpper) {
    ctx["derived.close_above_bb_upper"] = last.close > indicators.bbUpper;
    ctx["derived.close_pct_from_bb_upper"] =
      ((last.close - indicators.bbUpper) / indicators.bbUpper) * 100;
  }
  if (last.close && indicators.bbLower) {
    ctx["derived.close_below_bb_lower"] = last.close < indicators.bbLower;
  }
  if (last.close && indicators.bbMiddle) {
    ctx["derived.close_above_bb_middle"] = last.close > indicators.bbMiddle;
  }
  if (last.close && indicators.sma200) {
    ctx["derived.close_above_sma200"] = last.close > indicators.sma200;
    ctx["derived.close_pct_from_sma200"] =
      ((last.close - indicators.sma200) / indicators.sma200) * 100;
  }
  if (last.close && indicators.sma44) {
    ctx["derived.close_above_sma44"] = last.close > indicators.sma44;
  }
  if (last.close && indicators.superTrend) {
    ctx["derived.close_above_supertrend"] = last.close > indicators.superTrend;
  }

  // Volume analysis
  if (indicators.relativeVolume !== undefined) {
    ctx["derived.volume_surge"] = indicators.relativeVolume > 1.5;
    ctx["derived.volume_dry"] = indicators.relativeVolume < 0.5;
  }

  // Candle body analysis
  if (last.open && last.close && last.high && last.low) {
    const bodySize = Math.abs(last.close - last.open);
    const totalRange = last.high - last.low;
    ctx["derived.candle_body_pct"] = totalRange > 0 ? (bodySize / totalRange) * 100 : 0;
    ctx["derived.candle_color"] = last.close >= last.open ? "green" : "red";
    ctx["derived.is_doji"] = totalRange > 0 && bodySize / totalRange < 0.1;
  }

  return ctx;
}

// =============================================================================
// Digest section builders
// =============================================================================

function buildMarketSummarySection(
  instrumentData: Map<string, { candles: Candle[]; indicators: IndicatorSet; lastCandle: Candle | null }>,
  breadth: { advances?: number; declines?: number },
): string {
  let advancers = 0;
  let decliners = 0;
  let unchanged = 0;

  for (const [, data] of instrumentData) {
    if (data.candles.length < 2) continue;
    const last = data.candles[data.candles.length - 1];
    const prev = data.candles[data.candles.length - 2];
    const changePct = ((last.close - prev.close) / prev.close) * 100;
    if (changePct > 0.05) advancers++;
    else if (changePct < -0.05) decliners++;
    else unchanged++;
  }

  const lines = [
    `**Instruments processed**: ${instrumentData.size}`,
    "",
    "| Metric | Value |",
    "|--------|-------|",
    `| Advances (tracked) | ${advancers} |`,
    `| Declines (tracked) | ${decliners} |`,
    `| Unchanged | ${unchanged} |`,
  ];

  if (breadth.advances !== undefined) {
    lines.push(`| Advances (market-wide) | ${breadth.advances} |`);
  }
  if (breadth.declines !== undefined) {
    lines.push(`| Declines (market-wide) | ${breadth.declines} |`);
  }

  const ratio = decliners > 0 ? (advancers / decliners).toFixed(2) : "N/A";
  lines.push("", `**A/D Ratio (tracked)**: ${ratio}`);

  return lines.join("\n");
}

function buildStrategyMatchesSection(
  matches: Array<{
    symbol: string;
    companyName: string;
    strategyKey: string;
    strategyName: string;
    softScore: number;
    entryPrice?: number;
    stopLoss?: number;
  }>,
  topConfluence: Array<{
    symbol: string;
    score: number;
    bucket: string;
    overlapCount: number;
  }>,
): string {
  if (matches.length === 0) {
    return "No strategy matches today. All filters evaluated — no stocks passed all hard rules with sufficient soft score.";
  }

  const lines = [
    `**Total matches**: ${matches.length}`,
    "",
    "### Top Matches by Confluence",
    "",
  ];

  // Show top confluence results first
  if (topConfluence.length > 0) {
    lines.push(
      "| Symbol | Confluence | Bucket | Overlap |",
      "|--------|-----------|--------|---------|",
    );
    for (const c of topConfluence.slice(0, 15)) {
      lines.push(
        `| ${c.symbol} | ${(c.score * 100).toFixed(0)}% | ${c.bucket} | ${c.overlapCount} screeners |`,
      );
    }
    lines.push("");
  }

  // Group matches by strategy
  const byStrategy = new Map<string, typeof matches>();
  for (const m of matches) {
    const existing = byStrategy.get(m.strategyKey) ?? [];
    existing.push(m);
    byStrategy.set(m.strategyKey, existing);
  }

  lines.push("### Matches by Strategy", "");
  for (const [key, stratMatches] of byStrategy) {
    const stratName = stratMatches[0]?.strategyName ?? key;
    lines.push(`**${stratName}** (${stratMatches.length} matches):`);
    for (const m of stratMatches.slice(0, 10)) {
      const entry = m.entryPrice ? ` | Entry: ${m.entryPrice.toFixed(2)}` : "";
      const sl = m.stopLoss ? ` | SL: ${m.stopLoss.toFixed(2)}` : "";
      lines.push(`- ${m.symbol} (${m.companyName}) — Soft: ${(m.softScore * 100).toFixed(0)}%${entry}${sl}`);
    }
    if (stratMatches.length > 10) {
      lines.push(`- ... and ${stratMatches.length - 10} more`);
    }
    lines.push("");
  }

  return lines.join("\n");
}

function buildScreenerHighlightsSection(
  highlights: Array<{
    screenerKey: string;
    screenerName: string;
    matchCount: number;
    symbols: string[];
  }>,
): string {
  if (highlights.length === 0) {
    return "No screeners configured or no matches found.";
  }

  const lines = [
    "| Screener | Matches | Top Hits |",
    "|----------|---------|----------|",
  ];

  for (const h of highlights) {
    const topHits = h.symbols.slice(0, 5).join(", ");
    const more = h.symbols.length > 5 ? ` +${h.symbols.length - 5} more` : "";
    lines.push(
      `| ${h.screenerName} | ${h.matchCount} | ${topHits}${more} |`,
    );
  }

  // Active vs. zero-match summary
  const activeScreeners = highlights.filter((h) => h.matchCount > 0);
  lines.push(
    "",
    `**${activeScreeners.length}/${highlights.length}** screeners returned matches today.`,
  );

  return lines.join("\n");
}

function buildBreadthSection(breadth: {
  advances?: number;
  declines?: number;
  new52WeekHighs?: number;
  new52WeekLows?: number;
}): string {
  if (
    breadth.advances === undefined &&
    breadth.declines === undefined &&
    breadth.new52WeekHighs === undefined
  ) {
    return "Market breadth data not available from provider. Configure an adapter that supports breadth data.";
  }

  const lines = [
    "| Metric | Value |",
    "|--------|-------|",
  ];

  if (breadth.advances !== undefined) lines.push(`| Advances | ${breadth.advances} |`);
  if (breadth.declines !== undefined) lines.push(`| Declines | ${breadth.declines} |`);
  if (breadth.new52WeekHighs !== undefined) lines.push(`| New 52-week Highs | ${breadth.new52WeekHighs} |`);
  if (breadth.new52WeekLows !== undefined) lines.push(`| New 52-week Lows | ${breadth.new52WeekLows} |`);

  if (breadth.advances !== undefined && breadth.declines !== undefined && breadth.declines > 0) {
    const adRatio = (breadth.advances / breadth.declines).toFixed(2);
    lines.push("", `**A/D Ratio**: ${adRatio}`);

    if (Number(adRatio) > 2) {
      lines.push("\n*Breadth strongly positive — broad-based rally.*");
    } else if (Number(adRatio) < 0.5) {
      lines.push("\n*Breadth strongly negative — broad-based selling.*");
    }
  }

  if (breadth.new52WeekHighs !== undefined && breadth.new52WeekLows !== undefined) {
    const hlRatio = breadth.new52WeekLows > 0
      ? (breadth.new52WeekHighs / breadth.new52WeekLows).toFixed(2)
      : "N/A";
    lines.push(`\n**52-week High/Low Ratio**: ${hlRatio}`);
  }

  return lines.join("\n");
}

function buildBreadthNarrative(breadth: {
  advances?: number;
  declines?: number;
  new52WeekHighs?: number;
  new52WeekLows?: number;
}): string {
  const parts: string[] = [];
  if (breadth.advances !== undefined && breadth.declines !== undefined) {
    parts.push(`A/D: ${breadth.advances}/${breadth.declines}`);
  }
  if (breadth.new52WeekHighs !== undefined) {
    parts.push(`52wk highs: ${breadth.new52WeekHighs}`);
  }
  if (breadth.new52WeekLows !== undefined) {
    parts.push(`52wk lows: ${breadth.new52WeekLows}`);
  }
  return parts.length > 0 ? parts.join(". ") + "." : "Breadth data not available.";
}

function buildPostCloseDigestSummary(
  strategyMatches: number,
  confluenceResults: number,
  instrumentsProcessed: number,
  breadth: { advances?: number; declines?: number },
): string {
  const parts = [
    `Processed ${instrumentsProcessed} instruments.`,
    `${strategyMatches} strategy match(es).`,
    `${confluenceResults} confluence result(s).`,
  ];
  if (breadth.advances !== undefined && breadth.declines !== undefined) {
    parts.push(`Breadth: ${breadth.advances}A / ${breadth.declines}D.`);
  }
  return parts.join(" ");
}
