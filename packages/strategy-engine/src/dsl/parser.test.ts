import test from "node:test";
import assert from "node:assert/strict";
import {
  parseStrategyDSL,
  parseScreenerDSL,
  validateStrategyDSL,
} from "./parser";

test("parseStrategyDSL validates canonical strategy payload", () => {
  const result = parseStrategyDSL({
    key: "swing_breakout",
    family: "swing",
    reviewFrequency: "daily",
    primaryTimeframe: "D1",
    canonicalVersionTag: "breakout.v1.canonical",
    filters: [
      { field: "daily.close", operator: ">", valueRef: "daily.sma44", kind: "hard" },
      { field: "daily.rsi14", operator: ">=", value: 60, kind: "soft" },
    ],
    entry: { type: "confirmation_close" },
    stopLoss: { type: "recent_swing_low", timeframe: "D1", lookbackBars: 15 },
  });

  assert.equal(result.valid, true);
  assert.equal(result.errors.length, 0);
  assert.equal(result.normalized?.canonicalVersionTag, "breakout.v1.canonical");
  assert.equal(result.normalized?.filters.length, 2);
});

test("validateStrategyDSL rejects ambiguous condition value", () => {
  const result = validateStrategyDSL({
    key: "bad_strategy",
    family: "swing",
    reviewFrequency: "daily",
    primaryTimeframe: "D1",
    filters: [
      {
        field: "daily.close",
        operator: ">",
        value: 100,
        valueRef: "daily.sma44",
      },
    ],
  });

  assert.equal(result.valid, false);
  assert.ok(result.errors.some((error) => error.code === "AMBIGUOUS_VALUE"));
});

test("parseScreenerDSL rejects invalid field scope", () => {
  const result = parseScreenerDSL({
    key: "bad_screener",
    filters: [{ field: "intraday.close", operator: ">", value: 0 }],
  });

  assert.equal(result.valid, false);
  assert.ok(result.errors.some((error) => error.code === "INVALID_FIELD_PATH"));
});

