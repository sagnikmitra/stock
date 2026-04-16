import { computeSMA } from "./sma";

export interface BollingerResult {
  upper: number[];
  middle: number[];
  lower: number[];
}

/**
 * Bollinger Bands: SMA(period) ± multiplier × σ
 */
export function computeBollingerBands(
  closes: number[],
  period = 20,
  multiplier = 2,
): BollingerResult {
  const middle = computeSMA(closes, period);
  const upper: number[] = new Array(closes.length).fill(NaN);
  const lower: number[] = new Array(closes.length).fill(NaN);

  for (let i = period - 1; i < closes.length; i++) {
    let sumSq = 0;
    for (let j = i - period + 1; j <= i; j++) {
      const diff = closes[j] - middle[i];
      sumSq += diff * diff;
    }
    const stdDev = Math.sqrt(sumSq / period);
    upper[i] = middle[i] + multiplier * stdDev;
    lower[i] = middle[i] - multiplier * stdDev;
  }

  return { upper, middle, lower };
}
