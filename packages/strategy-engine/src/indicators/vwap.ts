import type { Candle } from "@ibo/types";

/**
 * Volume-Weighted Average Price (cumulative intraday).
 */
export function computeVWAP(candles: Candle[]): number[] {
  const result: number[] = new Array(candles.length).fill(NaN);
  let cumTypicalVolume = 0;
  let cumVolume = 0;

  for (let i = 0; i < candles.length; i++) {
    const typical = (candles[i].high + candles[i].low + candles[i].close) / 3;
    cumTypicalVolume += typical * candles[i].volume;
    cumVolume += candles[i].volume;
    result[i] = cumVolume > 0 ? cumTypicalVolume / cumVolume : NaN;
  }
  return result;
}
