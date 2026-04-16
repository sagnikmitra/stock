import test from "node:test";
import assert from "node:assert/strict";
import {
  detectHigherHighsHigherLows,
  findRecentSwingHigh,
  findRecentSwingLow,
  candleBodyPct,
} from "../src/indicators/structure";
import type { Candle } from "@ibo/types";

const candles: Candle[] = Array.from({ length: 40 }, (_, i) => {
  const base = 100 + i * 1.2;
  return {
    ts: new Date(Date.UTC(2024, 0, i + 1)),
    open: base,
    high: base + 2,
    low: base - 2,
    close: base + 1,
    volume: 10000,
  };
});

test("Higher highs/lows detection on uptrend series", () => {
  const trend = detectHigherHighsHigherLows(candles, 30);
  assert.equal(typeof trend.isUptrend, "boolean");
});

test("Recent swing high/low finder", () => {
  const high = findRecentSwingHigh(candles, 20);
  const low = findRecentSwingLow(candles, 20);
  assert.ok(high >= low);
});

test("Candle body percent calculation", () => {
  const pct = candleBodyPct(candles[0]);
  assert.ok(pct >= 0 && pct <= 100);
});

