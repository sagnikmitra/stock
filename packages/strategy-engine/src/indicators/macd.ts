import { computeEMA } from "./ema";

export interface MACDResult {
  macd: number[];
  signal: number[];
  histogram: number[];
}

/**
 * MACD: EMA(fast) − EMA(slow), signal = EMA(macd, signalPeriod)
 */
export function computeMACD(
  closes: number[],
  fastPeriod = 12,
  slowPeriod = 26,
  signalPeriod = 9,
): MACDResult {
  const emaFast = computeEMA(closes, fastPeriod);
  const emaSlow = computeEMA(closes, slowPeriod);
  const macdLine: number[] = new Array(closes.length).fill(NaN);

  for (let i = 0; i < closes.length; i++) {
    if (!isNaN(emaFast[i]) && !isNaN(emaSlow[i])) {
      macdLine[i] = emaFast[i] - emaSlow[i];
    }
  }

  // Build signal from non-NaN MACD values
  const validMacd = macdLine.filter((v) => !isNaN(v));
  const signalRaw = computeEMA(validMacd, signalPeriod);

  const signal: number[] = new Array(closes.length).fill(NaN);
  const histogram: number[] = new Array(closes.length).fill(NaN);
  let validIdx = 0;
  for (let i = 0; i < closes.length; i++) {
    if (!isNaN(macdLine[i])) {
      signal[i] = signalRaw[validIdx] ?? NaN;
      if (!isNaN(signal[i])) {
        histogram[i] = macdLine[i] - signal[i];
      }
      validIdx++;
    }
  }

  return { macd: macdLine, signal, histogram };
}
