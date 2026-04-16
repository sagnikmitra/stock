import type { Candle, SwingPoint } from "@ibo/types";

function detectSwingPoints(
  candles: Candle[],
  lookback: number,
  order = 2,
): { swingHighs: SwingPoint[]; swingLows: SwingPoint[] } {
  const start = Math.max(0, candles.length - lookback);
  const swingHighs: SwingPoint[] = [];
  const swingLows: SwingPoint[] = [];

  for (let i = start + order; i < candles.length - order; i++) {
    let isHigh = true;
    let isLow = true;
    for (let j = 1; j <= order; j++) {
      if (candles[i].high <= candles[i - j].high || candles[i].high <= candles[i + j].high) {
        isHigh = false;
      }
      if (candles[i].low >= candles[i - j].low || candles[i].low >= candles[i + j].low) {
        isLow = false;
      }
    }

    if (isHigh) swingHighs.push({ index: i, price: candles[i].high, date: candles[i].ts, type: "high" });
    if (isLow) swingLows.push({ index: i, price: candles[i].low, date: candles[i].ts, type: "low" });
  }

  return { swingHighs, swingLows };
}

export function detectHigherHighsHigherLows(candles: Candle[], lookback: number): {
  isUptrend: boolean;
  swingHighs: number[];
  swingLows: number[];
} {
  const { swingHighs, swingLows } = detectSwingPoints(candles, lookback);
  const highs = swingHighs.map((p) => p.price);
  const lows = swingLows.map((p) => p.price);
  const hh = highs.length > 1 ? highs.slice(1).every((v, i) => v > highs[i]) : false;
  const hl = lows.length > 1 ? lows.slice(1).every((v, i) => v > lows[i]) : false;
  return { isUptrend: hh && hl, swingHighs: highs, swingLows: lows };
}

export function detectLowerHighsLowerLows(candles: Candle[], lookback: number): {
  isDowntrend: boolean;
  swingHighs: number[];
  swingLows: number[];
} {
  const { swingHighs, swingLows } = detectSwingPoints(candles, lookback);
  const highs = swingHighs.map((p) => p.price);
  const lows = swingLows.map((p) => p.price);
  const lh = highs.length > 1 ? highs.slice(1).every((v, i) => v < highs[i]) : false;
  const ll = lows.length > 1 ? lows.slice(1).every((v, i) => v < lows[i]) : false;
  return { isDowntrend: lh && ll, swingHighs: highs, swingLows: lows };
}

export function findRecentSwingHigh(candles: Candle[], lookback: number): number {
  const { swingHighs } = detectSwingPoints(candles, lookback);
  if (swingHighs.length > 0) return swingHighs[swingHighs.length - 1].price;
  return Math.max(...candles.slice(-lookback).map((c) => c.high));
}

export function findRecentSwingLow(candles: Candle[], lookback: number): number {
  const { swingLows } = detectSwingPoints(candles, lookback);
  if (swingLows.length > 0) return swingLows[swingLows.length - 1].price;
  return Math.min(...candles.slice(-lookback).map((c) => c.low));
}

export function candleBodyPct(candle: Candle): number {
  const range = candle.high - candle.low;
  if (range === 0) return 0;
  return (Math.abs(candle.close - candle.open) / range) * 100;
}

export function isBullishCandle(candle: Candle): boolean {
  return candle.close > candle.open;
}

export function detectTrendlineBreak(candles: Candle[], direction: "up" | "down"): boolean {
  if (candles.length < 8) return false;
  const recent = candles.slice(-8);
  const first = recent[0];
  const last = recent[recent.length - 1];
  const slope = direction === "up"
    ? (last.low - first.low) / (recent.length - 1)
    : (last.high - first.high) / (recent.length - 1);
  const projected = direction === "up"
    ? first.low + slope * (recent.length - 1)
    : first.high + slope * (recent.length - 1);
  return direction === "up" ? last.close < projected : last.close > projected;
}

