import type { Candle, ConsolidationResult } from "@ibo/types";

/**
 * Detect a long consolidation (multi-month/multi-year base) in monthly candles.
 * Scans for a window of at least `minMonths` where the price range stays within
 * `maxRangePercent` of the ceiling.
 */
export function detectConsolidation(
  monthlyCandles: Candle[],
  params: { minMonths: number; maxRangePercent: number },
): ConsolidationResult | null {
  const { minMonths, maxRangePercent } = params;
  if (monthlyCandles.length < minMonths) return null;

  let bestResult: ConsolidationResult | null = null;
  let bestLength = 0;

  // Sliding window: try starting from each bar, extend as long as range stays within threshold
  for (let start = 0; start < monthlyCandles.length - minMonths; start++) {
    let ceiling = monthlyCandles[start].high;
    let floor = monthlyCandles[start].low;
    let ceilingTouches = 0;

    for (let end = start + 1; end < monthlyCandles.length; end++) {
      const c = monthlyCandles[end];
      const newCeiling = Math.max(ceiling, c.high);
      const newFloor = Math.min(floor, c.low);
      const rangePct = ((newCeiling - newFloor) / newCeiling) * 100;

      if (rangePct > maxRangePercent) break;

      ceiling = newCeiling;
      floor = newFloor;
      const length = end - start + 1;

      // Count touches near ceiling (within 2%)
      if (c.high >= ceiling * 0.98) ceilingTouches++;

      if (length >= minMonths && length > bestLength) {
        bestLength = length;
        const rangeDepthPct = ((ceiling - floor) / ceiling) * 100;
        // Compression score: longer base with tighter range = higher score
        const compressionScore = (length / minMonths) * (maxRangePercent / Math.max(rangeDepthPct, 1));

        bestResult = {
          rangeStart: monthlyCandles[start].ts,
          rangeEnd: monthlyCandles[end].ts,
          ceilingPrice: ceiling,
          floorPrice: floor,
          compressionScore: Math.round(compressionScore * 100) / 100,
          rangeDepthPct: Math.round(rangeDepthPct * 100) / 100,
          ceilingTouches,
        };
      }
    }
  }

  return bestResult;
}

/**
 * Check if the latest monthly candle(s) represent a breakout from a detected consolidation.
 * Breakout = close decisively above the ceiling price.
 */
export function isBreakoutFromBase(
  monthlyCandles: Candle[],
  consolidation: ConsolidationResult,
): boolean {
  if (monthlyCandles.length === 0) return false;
  const latest = monthlyCandles[monthlyCandles.length - 1];
  // Close must be above ceiling by at least 1% to confirm breakout
  return latest.close > consolidation.ceilingPrice * 1.01;
}
