import type { Candle, FibonacciLevel } from "@ibo/types";

export interface SwingHighLow {
  high: number;
  highIndex: number;
  low: number;
  lowIndex: number;
}

const FIB_LEVELS = [0.236, 0.382, 0.5, 0.618, 0.786] as const;

/**
 * Compute Fibonacci retracement levels between a swing high and swing low.
 * Returns prices at each standard Fibonacci level.
 */
export function fibonacciRetracement(input: { high: number; low: number }): FibonacciLevel[] {
  const { high, low } = input;
  const range = high - low;
  return FIB_LEVELS.map((level) => ({
    level: Number(level),
    price: high - range * level,
  }));
}

/**
 * Find the most recent swing high and swing low within a lookback window.
 * Uses a simple pivot detection: a bar whose high (low) is higher (lower) than
 * the `order` bars on each side.
 */
export function findSwingHighLow(candles: Candle[], lookback: number, order = 3): SwingHighLow | null {
  if (candles.length < lookback) return null;

  const window = candles.slice(-lookback);
  let high = -Infinity;
  let highIndex = 0;
  let low = Infinity;
  let lowIndex = 0;

  for (let i = order; i < window.length - order; i++) {
    let isSwingHigh = true;
    let isSwingLow = true;

    for (let j = 1; j <= order; j++) {
      if (window[i].high <= window[i - j].high || window[i].high <= window[i + j].high) {
        isSwingHigh = false;
      }
      if (window[i].low >= window[i - j].low || window[i].low >= window[i + j].low) {
        isSwingLow = false;
      }
    }

    if (isSwingHigh && window[i].high > high) {
      high = window[i].high;
      highIndex = candles.length - lookback + i;
    }
    if (isSwingLow && window[i].low < low) {
      low = window[i].low;
      lowIndex = candles.length - lookback + i;
    }
  }

  if (high === -Infinity || low === Infinity) return null;
  return { high, highIndex, low, lowIndex };
}
