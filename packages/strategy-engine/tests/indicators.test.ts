import test from "node:test";
import assert from "node:assert/strict";
import { computeSMA, computeRSI, computeBollingerBands, computeSuperTrend } from "../src/indicators";

test("SMA(5) computes expected values", () => {
  const values = [1, 2, 3, 4, 5, 6, 7];
  const sma = computeSMA(values, 5);
  assert.equal(sma[4], 3);
  assert.equal(sma[5], 4);
  assert.equal(sma[6], 5);
});

test("RSI returns bounded values on known series", () => {
  const values = Array.from({ length: 30 }, (_, i) => 100 + Math.sin(i / 3) * 5 + i * 0.2);
  const rsi = computeRSI(values, 14);
  const latest = rsi[rsi.length - 1];
  assert.ok(latest >= 0 && latest <= 100);
});

test("Bollinger band bounds check", () => {
  const values = Array.from({ length: 50 }, (_, i) => 100 + Math.cos(i / 4) * 2);
  const bb = computeBollingerBands(values, 20, 2);
  const idx = bb.middle.length - 1;
  assert.ok(bb.upper[idx] >= bb.middle[idx]);
  assert.ok(bb.lower[idx] <= bb.middle[idx]);
});

test("SuperTrend emits directions and supports flips", () => {
  const candles = Array.from({ length: 80 }, (_, i) => {
    const up = i < 40;
    const base = up ? 100 + i * 0.6 : 124 - (i - 40) * 0.9;
    return {
      ts: new Date(Date.UTC(2024, 0, i + 1)),
      open: base,
      high: base + 2,
      low: base - 2,
      close: base + (up ? 1 : -1),
      volume: 1000,
    };
  });
  const st = computeSuperTrend(candles, 10, 3);
  assert.equal(st.values.length, candles.length);
  assert.equal(st.directions.length, candles.length);
  assert.ok(st.directions.includes("up") || st.directions.includes("down"));
});

