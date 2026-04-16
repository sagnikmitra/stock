import type { Candle } from "@ibo/types";
import { computeATR } from "./atr";

export interface SuperTrendResult {
  values: number[];
  directions: ("up" | "down")[];
}

/**
 * SuperTrend indicator. Default (10, 3).
 * "up" = bullish (price above), "down" = bearish (price below).
 */
export function computeSuperTrend(
  candles: Candle[],
  atrPeriod = 10,
  multiplier = 3,
): SuperTrendResult {
  const len = candles.length;
  const values: number[] = new Array(len).fill(NaN);
  const directions: ("up" | "down")[] = new Array(len).fill("down");
  const atr = computeATR(candles, atrPeriod);

  const upperBand: number[] = new Array(len).fill(NaN);
  const lowerBand: number[] = new Array(len).fill(NaN);

  for (let i = atrPeriod; i < len; i++) {
    if (isNaN(atr[i])) continue;

    const hl2 = (candles[i].high + candles[i].low) / 2;
    let basicUpper = hl2 + multiplier * atr[i];
    let basicLower = hl2 - multiplier * atr[i];

    // Carry forward if tighter
    if (i > atrPeriod) {
      if (!isNaN(upperBand[i - 1]) && basicUpper > upperBand[i - 1] && candles[i - 1].close <= upperBand[i - 1]) {
        basicUpper = upperBand[i - 1];
      }
      if (!isNaN(lowerBand[i - 1]) && basicLower < lowerBand[i - 1] && candles[i - 1].close >= lowerBand[i - 1]) {
        basicLower = lowerBand[i - 1];
      }
    }

    upperBand[i] = basicUpper;
    lowerBand[i] = basicLower;

    if (i === atrPeriod) {
      directions[i] = candles[i].close > upperBand[i] ? "up" : "down";
    } else {
      const prevDir = directions[i - 1];
      if (prevDir === "up") {
        directions[i] = candles[i].close < lowerBand[i] ? "down" : "up";
      } else {
        directions[i] = candles[i].close > upperBand[i] ? "up" : "down";
      }
    }

    values[i] = directions[i] === "up" ? lowerBand[i] : upperBand[i];
  }

  return { values, directions };
}
