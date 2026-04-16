import test from "node:test";
import assert from "node:assert/strict";
import { runBacktest } from "../src/backtest";
import type { BacktestConfig, Candle, StrategyDSL } from "@ibo/types";

function makeCandles(symbolShift = 0): Candle[] {
  return Array.from({ length: 280 }, (_, i) => {
    const base = 100 + symbolShift + i * 0.25 + Math.sin(i / 8);
    return {
      ts: new Date(Date.UTC(2024, 0, i + 1)),
      open: base,
      high: base + 2,
      low: base - 2,
      close: base + 0.8,
      volume: 10000 + i * 10,
    };
  });
}

const dsl: StrategyDSL = {
  key: "backtest_strategy",
  family: "swing",
  reviewFrequency: "daily",
  primaryTimeframe: "D1",
  filters: [
    { field: "daily.close", operator: ">", value: 90, kind: "hard" },
    { field: "daily.rsi14", operator: ">", value: 45, kind: "hard" },
  ],
  entry: { type: "confirmation_close" },
  stopLoss: { type: "fixed_pct", pct: 2 },
};

test("Backtest runner produces lifecycle metrics", () => {
  const config: BacktestConfig = {
    strategyKey: "backtest_strategy",
    startDate: "2024-08-01",
    endDate: "2024-12-31",
    universe: "active_nse",
    capital: 500000,
    riskPerTradePct: 2,
    maxOpenPositions: 5,
    slippageBps: 5,
  };

  const candles = new Map<string, Candle[]>([
    ["AAA", makeCandles(0)],
    ["BBB", makeCandles(15)],
  ]);

  const result = runBacktest(config, dsl, candles);
  assert.ok(result.metrics.totalTrades >= 0);
  assert.ok(result.metrics.winRate >= 0 && result.metrics.winRate <= 1);
});

