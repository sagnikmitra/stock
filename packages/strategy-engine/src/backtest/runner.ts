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
      const ctx: DataContext = flattenToContext(candles[i], indicators);

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

function flattenToContext(
  candle: Candle,
  indicators: Record<string, unknown>,
): DataContext {
  const ctx: DataContext = {};
  ctx["daily.open"] = candle.open;
  ctx["daily.high"] = candle.high;
  ctx["daily.low"] = candle.low;
  ctx["daily.close"] = candle.close;
  ctx["daily.volume"] = candle.volume;

  for (const [key, val] of Object.entries(indicators)) {
    if (val !== undefined && val !== null) {
      ctx[`daily.${camelToSnake(key)}`] = val as number | boolean | string;
    }
  }
  return ctx;
}

function camelToSnake(s: string): string {
  return s.replace(/([A-Z])/g, "_$1").toLowerCase().replace(/^_/, "");
}
