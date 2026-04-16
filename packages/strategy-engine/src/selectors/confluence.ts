import type { IntersectionResult, PriorityBucket } from "@ibo/types";

/**
 * Compute confluence score and assign priority bucket.
 *
 * Scoring: base = overlapCount / totalScreeners
 * Bonus for multi-family coverage (investment + swing = higher confidence)
 * Penalty for single-family overlap (may be redundant)
 */
export function computeConfluenceScore(
  result: IntersectionResult,
  totalScreeners: number,
): { score: number; bucket: PriorityBucket } {
  const baseScore = result.overlapCount / Math.max(totalScreeners, 1);
  const familyCount = Object.keys(result.familyMix).length;
  const familyBonus = familyCount > 1 ? 0.15 * (familyCount - 1) : 0;
  const score = Math.min(baseScore + familyBonus, 1);

  let bucket: PriorityBucket;
  if (score >= 0.7 && familyCount >= 2) {
    bucket = "review_now";
  } else if (score >= 0.5) {
    bucket = "watch_closely";
  } else if (score >= 0.3) {
    bucket = "month_end_only";
  } else {
    bucket = "contextual_only";
  }

  return { score, bucket };
}
