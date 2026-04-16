import type { Candle } from "@ibo/types";

/**
 * Average Directional Index (Wilder's smoothing).
 */
export function computeADX(candles: Candle[], period = 14): number[] {
  const len = candles.length;
  const result: number[] = new Array(len).fill(NaN);
  if (len < 2 * period + 1) return result;

  const plusDM: number[] = [0];
  const minusDM: number[] = [0];
  const tr: number[] = [0];

  for (let i = 1; i < len; i++) {
    const upMove = candles[i].high - candles[i - 1].high;
    const downMove = candles[i - 1].low - candles[i].low;
    plusDM.push(upMove > downMove && upMove > 0 ? upMove : 0);
    minusDM.push(downMove > upMove && downMove > 0 ? downMove : 0);

    const highLow = candles[i].high - candles[i].low;
    const highPrevClose = Math.abs(candles[i].high - candles[i - 1].close);
    const lowPrevClose = Math.abs(candles[i].low - candles[i - 1].close);
    tr.push(Math.max(highLow, highPrevClose, lowPrevClose));
  }

  // Seed smoothed values
  let smoothPlusDM = 0, smoothMinusDM = 0, smoothTR = 0;
  for (let i = 1; i <= period; i++) {
    smoothPlusDM += plusDM[i];
    smoothMinusDM += minusDM[i];
    smoothTR += tr[i];
  }

  const dx: number[] = [];
  for (let i = period; i < len; i++) {
    if (i > period) {
      smoothPlusDM = smoothPlusDM - smoothPlusDM / period + plusDM[i];
      smoothMinusDM = smoothMinusDM - smoothMinusDM / period + minusDM[i];
      smoothTR = smoothTR - smoothTR / period + tr[i];
    }
    const plusDI = smoothTR > 0 ? (100 * smoothPlusDM) / smoothTR : 0;
    const minusDI = smoothTR > 0 ? (100 * smoothMinusDM) / smoothTR : 0;
    const diSum = plusDI + minusDI;
    dx.push(diSum > 0 ? (100 * Math.abs(plusDI - minusDI)) / diSum : 0);
  }

  // ADX = SMA of DX over `period`
  if (dx.length >= period) {
    let adxSum = 0;
    for (let i = 0; i < period; i++) adxSum += dx[i];
    let adx = adxSum / period;
    result[2 * period - 1] = adx;

    for (let i = period; i < dx.length; i++) {
      adx = (adx * (period - 1) + dx[i]) / period;
      result[period + i] = adx;
    }
  }

  return result;
}
