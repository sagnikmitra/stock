import test from "node:test";
import assert from "node:assert/strict";
import { evaluateStrategy } from "../src/evaluators";
import type { DataContext } from "../src/evaluators/condition-evaluator";
import type { StrategyDSL } from "@ibo/types";

function baseDsl(): StrategyDSL {
  return {
    key: "test_strategy",
    family: "swing",
    reviewFrequency: "daily",
    primaryTimeframe: "D1",
    filters: [
      { field: "daily.close", operator: ">", value: 100, kind: "hard" },
      { field: "daily.rsi14", operator: ">=", value: 55, kind: "hard" },
      { field: "daily.volume_ratio_20", operator: ">=", value: 1, kind: "soft" },
    ],
  };
}

test("Strategy evaluator passes valid context", () => {
  const dsl = baseDsl();
  const ctx: DataContext = {
    "daily.close": 125,
    "daily.rsi14": 62,
    "daily.volume_ratio_20": 1.4,
  };
  const result = evaluateStrategy(dsl, "TEST", "2026-04-16", ctx);
  assert.equal(result.allPassed, true);
  assert.ok(result.softScore >= 0.5);
});

test("Strategy evaluator fails hard rule", () => {
  const dsl = baseDsl();
  const ctx: DataContext = {
    "daily.close": 125,
    "daily.rsi14": 42,
    "daily.volume_ratio_20": 2,
  };
  const result = evaluateStrategy(dsl, "TEST", "2026-04-16", ctx);
  assert.equal(result.allPassed, false);
  assert.equal(result.hardRulesPassed, false);
});

