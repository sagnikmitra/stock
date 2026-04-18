import type {
  BacktestConfig,
  BacktestMetrics,
  Candle,
  StrategyDSL,
} from "@ibo/types";
import { buildIndicatorSet } from "../indicators";
import { evaluateStrategy } from "../evaluators";
import type { DataContext } from "../evaluators/condition-evaluator";

interface BacktestTrade {
  symbol: string;
  entryDate: string;
  entryPrice: number;
  exitDate?: string;
  exitPrice?: number;
  pnlPct?: number;
  holdDays?: number;
}

export interface BacktestResult {
  config: BacktestConfig;
  trades: BacktestTrade[];
  metrics: BacktestMetrics;
}

/**
 * Run a simple event-replay backtest.
 * Iterates through candles day-by-day, evaluates strategy, tracks paper trades.
 */
export function runBacktest(
  config: BacktestConfig,
  dsl: StrategyDSL,
  candlesBySymbol: Map<string, Candle[]>,
): BacktestResult {
  const trades: BacktestTrade[] = [];
  const openPositions = new Map<string, BacktestTrade>();

  for (const [symbol, candles] of candlesBySymbol) {
    const closes = candles.map((c) => c.close);

    for (let i = 200; i < candles.length; i++) {
      const dateStr = candles[i].ts.toISOString().split("T")[0];
      if (dateStr < config.startDate || dateStr > config.endDate) continue;

      // Skip if already holding this symbol
      if (openPositions.has(symbol)) {
        // Check exit: simple SuperTrend flip approximation
        const prevClose = candles[i - 1].close;
        const position = openPositions.get(symbol)!;
        // Exit if close drops below entry - (entry - SL) i.e. 1R loss, or 3R profit
        const riskPerShare = position.entryPrice * 0.02; // approximate
        if (
          candles[i].close <= position.entryPrice - riskPerShare ||
          candles[i].close >= position.entryPrice + 3 * riskPerShare
        ) {
          const entryDate = new Date(position.entryDate);
          const exitDate = new Date(dateStr);
          const holdDays = Math.round((exitDate.getTime() - entryDate.getTime()) / 86400000);
          trades.push({
            ...position,
            exitDate: dateStr,
            exitPrice: candles[i].close,
            pnlPct: ((candles[i].close - position.entryPrice) / position.entryPrice) * 100,
            holdDays,
          });
          openPositions.delete(symbol);
        }
        continue;
      }

      if (openPositions.size >= config.maxOpenPositions) continue;

      // Build context from candle window
      const window = candles.slice(0, i + 1);
      const indicators = buildIndicatorSet(window) as unknown as Record<string, unknown>;
      const ctx: DataContext = flattenToContext(window, indicators);

      const evalResult = evaluateStrategy(dsl, symbol, dateStr, ctx);
      if (evalResult.allPassed && evalResult.entryPrice) {
        const trade: BacktestTrade = {
          symbol,
          entryDate: dateStr,
          entryPrice: evalResult.entryPrice,
        };
        openPositions.set(symbol, trade);
      }
    }
  }

  // Close any remaining open positions at last available price
  for (const [symbol, position] of openPositions) {
    const candles = candlesBySymbol.get(symbol);
    if (candles && candles.length > 0) {
      const lastCandle = candles[candles.length - 1];
      const entryDate = new Date(position.entryDate);
      const exitDate = new Date(lastCandle.ts);
      trades.push({
        ...position,
        exitDate: lastCandle.ts.toISOString().split("T")[0],
        exitPrice: lastCandle.close,
        pnlPct: ((lastCandle.close - position.entryPrice) / position.entryPrice) * 100,
        holdDays: Math.round((exitDate.getTime() - entryDate.getTime()) / 86400000),
      });
    }
  }

  const metrics = computeMetrics(trades);
  return { config, trades, metrics };
}

function computeMetrics(trades: BacktestTrade[]): BacktestMetrics {
  const completed = trades.filter((t) => t.pnlPct !== undefined);
  if (completed.length === 0) {
    return {
      totalTrades: 0, winRate: 0, avgWin: 0, avgLoss: 0,
      expectancy: 0, maxDrawdown: 0, profitFactor: 0,
      avgHoldDays: 0, medianHoldDays: 0,
    };
  }

  const wins = completed.filter((t) => (t.pnlPct ?? 0) > 0);
  const losses = completed.filter((t) => (t.pnlPct ?? 0) <= 0);

  const avgWin = wins.length > 0 ? wins.reduce((s, t) => s + (t.pnlPct ?? 0), 0) / wins.length : 0;
  const avgLoss = losses.length > 0 ? losses.reduce((s, t) => s + Math.abs(t.pnlPct ?? 0), 0) / losses.length : 0;
  const winRate = wins.length / completed.length;
  const expectancy = winRate * avgWin - (1 - winRate) * avgLoss;

  const grossProfit = wins.reduce((s, t) => s + (t.pnlPct ?? 0), 0);
  const grossLoss = losses.reduce((s, t) => s + Math.abs(t.pnlPct ?? 0), 0);
  const profitFactor = grossLoss > 0 ? grossProfit / grossLoss : grossProfit > 0 ? Infinity : 0;

  // Simple max drawdown from cumulative PnL
  let peak = 0;
  let cumPnl = 0;
  let maxDD = 0;
  for (const t of completed) {
    cumPnl += t.pnlPct ?? 0;
    if (cumPnl > peak) peak = cumPnl;
    const dd = peak - cumPnl;
    if (dd > maxDD) maxDD = dd;
  }

  const holdDays = completed.map((t) => t.holdDays ?? 0).sort((a, b) => a - b);
  const avgHoldDays = holdDays.reduce((s, d) => s + d, 0) / holdDays.length;
  const medianHoldDays = holdDays[Math.floor(holdDays.length / 2)];

  return {
    totalTrades: completed.length,
    winRate,
    avgWin,
    avgLoss,
    expectancy,
    maxDrawdown: maxDD,
    profitFactor,
    avgHoldDays,
    medianHoldDays,
  };
}

function flattenToContext(candles: Candle[], indicators: Record<string, unknown>): DataContext {
  const candle = candles[candles.length - 1];
  const prev = candles[candles.length - 2] ?? candle;
  const recent20 = candles.slice(-20);
  const recent22 = candles.slice(-22);
  const recent120 = candles.slice(-120);
  const recent252 = candles.slice(-252);
  const resistance20 = recent20.length > 0 ? Math.max(...recent20.map((c) => c.high)) : candle.high;
  const high52Week = recent252.length > 0 ? Math.max(...recent252.map((c) => c.high)) : candle.high;
  const candleRange = Math.max(candle.high - candle.low, 0.0001);
  const candleBodyPct = (Math.abs(candle.close - candle.open) / candleRange) * 100;
  const candleColor = candle.close >= candle.open ? "green" : "red";
  const dayChangePct = pctChange(candle.close, prev.close);
  const closeAboveResistancePct = resistance20 > 0 ? pctChange(candle.close, resistance20) : 0;
  const closeAbove52WeekHigh = high52Week > 0 ? candle.close >= high52Week * 0.995 : false;

  const rsi14 = asNumber(indicators.rsi14);
  const sma13 = asNumber(indicators.sma13);
  const sma34 = asNumber(indicators.sma34);
  const sma44 = asNumber(indicators.sma44);
  const sma50 = asNumber(indicators.sma50);
  const sma200 = asNumber(indicators.sma200);
  const ema9 = asNumber(indicators.ema9);
  const ema15 = asNumber(indicators.ema15);
  const bbUpper = asNumber(indicators.bbUpper);
  const bbMiddle = asNumber(indicators.bbMiddle);
  const bbLower = asNumber(indicators.bbLower);
  const superTrend = asNumber(indicators.superTrend);
  const atr14 = asNumber(indicators.atr14);
  const relativeVolume = asNumber(indicators.relativeVolume);
  const superTrendDir = asString(indicators.superTrendDir);

  const lowerBbTouch = bbLower !== undefined ? candle.low <= bbLower * 1.01 : false;
  const lowerBbInteraction = bbLower !== undefined ? candle.low <= bbLower * 1.02 : false;
  const nearSma50 = sma50 !== undefined && sma50 > 0 ? Math.abs(candle.close - sma50) / sma50 <= 0.02 : false;
  const trendlineBreakUp = sma50 !== undefined && sma50 > 0 ? candle.open <= sma50 && candle.close > sma50 : candle.close > candle.open;
  const dailyDipInUptrend =
    sma50 !== undefined && sma50 > 0
      ? candle.close >= sma50 && candle.low <= (sma34 ?? sma50)
      : candle.close >= prev.close;
  const bullishResolution = candle.close > prev.close && candleColor === "green";
  const primaryTrendNotBearish = sma200 !== undefined ? candle.close >= sma200 : true;
  const vwapApprox = (candle.high + candle.low + candle.close) / 3;
  const prevDayVolume = prev.volume;
  const priceAboveSuperTrend = superTrend !== undefined ? candle.close >= superTrend : candle.close >= (sma50 ?? candle.close);
  const sma13CrossAboveSma34 = sma13 !== undefined && sma34 !== undefined ? sma13 > sma34 && prev.close <= sma34 : false;
  const primaryUptrend = sma44 !== undefined && sma200 !== undefined ? candle.close >= sma44 && sma44 >= sma200 : candle.close >= prev.close;
  const reclaimAfterPullback = sma44 !== undefined ? prev.close <= sma44 && candle.close > sma44 : candle.close > prev.close;
  const consolidationCeiling = recent120.length > 0 ? Math.max(...recent120.map((c) => c.high)) : candle.high;
  const consolidationFloor = recent120.length > 0 ? Math.min(...recent120.map((c) => c.low)) : candle.low;
  const longConsolidationDetected = consolidationFloor > 0 ? (consolidationCeiling - consolidationFloor) / consolidationFloor <= 0.35 : false;
  const alphaApprox =
    recent20.length >= 2 ? pctChange(candle.close, recent20[0].close) : dayChangePct;
  const betaApprox = recent20.length >= 2 ? Math.max(0, Math.min(1, Math.abs(dayChangePct) / 4)) : 0.8;

  const ctx: DataContext = {};
  ctx["daily.open"] = candle.open;
  ctx["daily.high"] = candle.high;
  ctx["daily.low"] = candle.low;
  ctx["daily.close"] = candle.close;
  ctx["daily.volume"] = candle.volume;
  ctx["daily.rsi14"] = rsi14;
  ctx["daily.rsi_14"] = rsi14;
  ctx["daily.sma13"] = sma13;
  ctx["daily.sma_13"] = sma13;
  ctx["daily.sma34"] = sma34;
  ctx["daily.sma_34"] = sma34;
  ctx["daily.sma44"] = sma44;
  ctx["daily.sma_44"] = sma44;
  ctx["daily.sma50"] = sma50;
  ctx["daily.sma_50"] = sma50;
  ctx["daily.sma200"] = sma200;
  ctx["daily.sma_200"] = sma200;
  ctx["daily.ema9"] = ema9;
  ctx["daily.ema_9"] = ema9;
  ctx["daily.ema15"] = ema15;
  ctx["daily.ema_15"] = ema15;
  ctx["daily.bbUpper"] = bbUpper;
  ctx["daily.bb_upper_20_2"] = bbUpper;
  ctx["daily.bbMiddle"] = bbMiddle;
  ctx["daily.bb_middle_20"] = bbMiddle;
  ctx["daily.bbLower"] = bbLower;
  ctx["daily.bb_lower_20_2"] = bbLower;
  ctx["daily.superTrend"] = superTrend;
  ctx["daily.supertrend_10_3"] = superTrendDir;
  ctx["daily.superTrendDir"] = superTrendDir;
  ctx["daily.atr_14"] = atr14;
  ctx["daily.relativeVolume"] = relativeVolume;
  ctx["daily.volume_ratio_20"] = relativeVolume;
  ctx["daily.deliveryPct"] = candle.deliveryPct;
  ctx["daily.candleBodyPct"] = candleBodyPct;
  ctx["daily.candleColor"] = candleColor;
  ctx["daily.vwap"] = vwapApprox;

  ctx["h4.close"] = candle.close;
  ctx["h4.ema9"] = ema9;
  ctx["h4.ema15"] = ema15;
  ctx["h4.superTrendDir"] = superTrendDir;
  ctx["h4.candleColor"] = candleColor;

  ctx["monthly.high"] = recent22.length > 0 ? Math.max(...recent22.map((c) => c.high)) : candle.high;
  ctx["monthly.close"] = candle.close;
  ctx["monthly.rsi14"] = rsi14;
  ctx["monthly.bbUpper"] = bbUpper;
  ctx["monthly.bbMiddle"] = bbMiddle;

  ctx["instrument.marketCapBucket"] = "large_cap";
  ctx["derived.closeAbove52WeekHigh"] = closeAbove52WeekHigh;
  ctx["derived.closeAboveResistancePct"] = closeAboveResistancePct;
  ctx["derived.isTopGainer"] = dayChangePct >= 2;
  ctx["derived.isVolumeShocker"] = (relativeVolume ?? 0) >= 1.8;
  ctx["derived.dailyDipInUptrend"] = dailyDipInUptrend;
  ctx["derived.lowerBbTouch"] = lowerBbTouch;
  ctx["derived.lowerBbInteraction"] = lowerBbInteraction;
  ctx["derived.trendlineBreakUp"] = trendlineBreakUp;
  ctx["derived.nearSma50"] = nearSma50;
  ctx["derived.bullishResolution"] = bullishResolution;
  ctx["derived.primaryTrendNotBearish"] = primaryTrendNotBearish;
  ctx["derived.candleBodyPct"] = candleBodyPct;
  ctx["derived.prevDayVolume"] = prevDayVolume;
  ctx["derived.notPreHolidayOrExpiry"] = true;
  ctx["derived.priceAboveSuperTrend"] = priceAboveSuperTrend;
  ctx["derived.sma13CrossAboveSma34"] = sma13CrossAboveSma34;
  ctx["derived.primaryUptrend"] = primaryUptrend;
  ctx["derived.reclaimAfterPullback"] = reclaimAfterPullback;
  ctx["derived.consolidationCeiling"] = consolidationCeiling;
  ctx["derived.longConsolidationDetected"] = longConsolidationDetected;
  ctx["derived.alpha"] = alphaApprox;
  ctx["derived.beta"] = betaApprox;
  return ctx;
}

function asNumber(value: unknown): number | undefined {
  return typeof value === "number" && Number.isFinite(value) ? value : undefined;
}

function asString(value: unknown): string | undefined {
  return typeof value === "string" ? value : undefined;
}

function pctChange(current: number, previous: number): number {
  if (!Number.isFinite(previous) || previous === 0) return 0;
  return ((current - previous) / previous) * 100;
}
