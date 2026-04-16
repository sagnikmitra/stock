import type { Candle } from "@ibo/types";

/**
 * Average volume over the last `period` candles.
 */
export function volumeAverage(candles: Candle[], period: number): number {
  if (candles.length < period) return 0;
  const window = candles.slice(-period);
  return window.reduce((sum, c) => sum + c.volume, 0) / period;
}

/**
 * Relative volume: current bar volume / average volume over period.
 * > 1 means above-average participation; < 1 means below-average.
 */
export function relativeVolume(candles: Candle[], period: number): number {
  const avg = volumeAverage(candles, period);
  if (candles.length === 0) return 0;
  if (avg === 0) return 0;
  return candles[candles.length - 1].volume / avg;
}
