import { runPostClosePipelineCore } from "@ibo/pipelines";
import type { Candle, IndicatorSet } from "@ibo/types";
import type { DataContext } from "@ibo/strategy-engine";

/**
 * Compatibility wrapper.
 * Pipeline implementation is centralized in @ibo/pipelines.
 */
export async function runPostClosePipeline() {
  return runPostClosePipelineCore();
}

/**
 * Backward-compatible utility for any legacy imports.
 */
export function buildDataContext(
  candles: Candle[],
  indicators: IndicatorSet,
  prefix: "daily" | "weekly" | "monthly" = "daily",
): DataContext {
  const last = candles[candles.length - 1];
  const ctx: DataContext = {
    [`${prefix}.open`]: last?.open,
    [`${prefix}.high`]: last?.high,
    [`${prefix}.low`]: last?.low,
    [`${prefix}.close`]: last?.close,
    [`${prefix}.volume`]: last?.volume,
    [`${prefix}.rsi14`]: indicators.rsi14,
    [`${prefix}.sma_13`]: indicators.sma13,
    [`${prefix}.sma_34`]: indicators.sma34,
    [`${prefix}.sma_44`]: indicators.sma44,
    [`${prefix}.sma_50`]: indicators.sma50,
    [`${prefix}.sma_200`]: indicators.sma200,
    [`${prefix}.ema_9`]: indicators.ema9,
    [`${prefix}.ema_15`]: indicators.ema15,
    [`${prefix}.bb_upper_20_2`]: indicators.bbUpper,
    [`${prefix}.bb_middle_20`]: indicators.bbMiddle,
    [`${prefix}.bb_lower_20_2`]: indicators.bbLower,
    [`${prefix}.supertrend_10_3`]: indicators.superTrendDir,
    [`${prefix}.atr_14`]: indicators.atr14,
    [`${prefix}.volume_ratio_20`]: indicators.relativeVolume,
  };

  return ctx;
}
