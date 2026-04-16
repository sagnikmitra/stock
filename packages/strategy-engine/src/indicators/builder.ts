import type { Candle, IndicatorSet } from "@ibo/types";
import { computeSMA } from "./sma";
import { computeEMA } from "./ema";
import { computeRSI } from "./rsi";
import { computeBollingerBands } from "./bollinger";
import { computeATR } from "./atr";
import { computeSuperTrend } from "./supertrend";

/**
 * Compute full IndicatorSet from candle series.
 * Returns latest (most recent bar) values.
 */
export function buildIndicatorSet(candles: Candle[]): IndicatorSet {
  if (candles.length === 0) return {};

  const closes = candles.map((c) => c.close);
  const last = candles.length - 1;

  const rsi = computeRSI(closes, 14);
  const sma13 = computeSMA(closes, 13);
  const sma34 = computeSMA(closes, 34);
  const sma44 = computeSMA(closes, 44);
  const sma50 = computeSMA(closes, 50);
  const sma200 = computeSMA(closes, 200);
  const ema9 = computeEMA(closes, 9);
  const ema15 = computeEMA(closes, 15);
  const bb = computeBollingerBands(closes, 20, 2);
  const atr = computeATR(candles, 14);
  const st = computeSuperTrend(candles, 10, 3);

  const avgVolume20 =
    candles.length >= 20
      ? candles.slice(-20).reduce((s, c) => s + c.volume, 0) / 20
      : undefined;
  const relativeVolume =
    avgVolume20 && avgVolume20 > 0
      ? candles[last].volume / avgVolume20
      : undefined;

  return {
    rsi14: nanToUndef(rsi[last]),
    sma13: nanToUndef(sma13[last]),
    sma34: nanToUndef(sma34[last]),
    sma44: nanToUndef(sma44[last]),
    sma50: nanToUndef(sma50[last]),
    sma200: nanToUndef(sma200[last]),
    ema9: nanToUndef(ema9[last]),
    ema15: nanToUndef(ema15[last]),
    bbUpper: nanToUndef(bb.upper[last]),
    bbMiddle: nanToUndef(bb.middle[last]),
    bbLower: nanToUndef(bb.lower[last]),
    superTrend: nanToUndef(st.values[last]),
    superTrendDir: isNaN(st.values[last]) ? undefined : st.directions[last],
    atr14: nanToUndef(atr[last]),
    relativeVolume,
    deliveryPct: candles[last].deliveryPct,
  };
}

function nanToUndef(v: number): number | undefined {
  return isNaN(v) ? undefined : v;
}
