import test from "node:test";
import assert from "node:assert/strict";
import type { StrategyDSL } from "@ibo/types";
import { evaluateCondition } from "./condition-evaluator";
import { evaluateStrategy } from "./strategy-evaluator";

test("evaluateCondition resolves snake_case and camelCase field aliases", () => {
  const condition = {
    field: "daily.candleColor",
    operator: "==",
    value: "green",
    kind: "hard",
  } as const;

  const result = evaluateCondition(condition, {
    "daily.candle_color": "green",
  });

  assert.equal(result.passed, true);
  assert.ok(result.trace.some((line) => line.includes("daily.candle_color")));
});

test("evaluateStrategy returns deterministic explainability counts", () => {
  const dsl: StrategyDSL = {
    key: "swing_test",
    family: "swing",
    reviewFrequency: "daily",
    primaryTimeframe: "D1",
    filters: [
      { field: "daily.close", operator: ">", valueRef: "daily.sma44", kind: "hard" },
      { field: "daily.rsi14", operator: ">=", value: 55, kind: "soft" },
    ],
    entry: { type: "confirmation_close" },
    stopLoss: { type: "fixed_pct", pct: 2 },
  };

  const result = evaluateStrategy(dsl, "TEST", "2026-04-16", {
    "daily.close": 120,
    "daily.sma44": 100,
    "daily.rsi14": 60,
    "derived.recent_swing_low": 95,
  });

  assert.equal(result.allPassed, true);
  assert.equal(result.explainability.passedCount, 2);
  assert.equal(result.explainability.failedCount, 0);
  assert.equal(result.explainability.hardFailedCount, 0);
  assert.equal(result.explainability.softPassedCount, 1);
  assert.equal(result.explainability.softTotalCount, 1);
});

