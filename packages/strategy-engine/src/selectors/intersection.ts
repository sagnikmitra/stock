import type { IntersectionRequest, IntersectionResult } from "@ibo/types";

interface ScreenerMatch {
  screenerKey: string;
  screenerLabel: string;
  family: string;
}

export interface SymbolMatches {
  symbol: string;
  companyName: string;
  matches: ScreenerMatch[];
}

/**
 * Compute intersection/union/difference across screener results.
 */
export function computeIntersection(
  request: IntersectionRequest,
  matchesByScreener: Map<string, SymbolMatches[]>,
): IntersectionResult[] {
  // Build per-symbol aggregation
  const symbolMap = new Map<string, { companyName: string; matches: ScreenerMatch[] }>();

  for (const [screenerKey, results] of matchesByScreener) {
    if (!request.screenerKeys.includes(screenerKey)) continue;
    for (const r of results) {
      const existing = symbolMap.get(r.symbol);
      if (existing) {
        existing.matches.push(...r.matches);
      } else {
        symbolMap.set(r.symbol, {
          companyName: r.companyName,
          matches: [...r.matches],
        });
      }
    }
  }

  const totalScreeners = request.screenerKeys.length;
  const minOverlap = request.minOverlap ?? (request.mode === "intersection" ? totalScreeners : 1);

  const results: IntersectionResult[] = [];

  for (const [symbol, data] of symbolMap) {
    const uniqueScreeners = new Set(data.matches.map((m) => m.screenerKey));
    const overlapCount = uniqueScreeners.size;

    if (request.mode === "intersection" && overlapCount < minOverlap) continue;
    if (request.mode === "difference" && overlapCount >= totalScreeners) continue;

    // Family mix
    const familyMix: Record<string, number> = {};
    for (const m of data.matches) {
      familyMix[m.family] = (familyMix[m.family] ?? 0) + 1;
    }

    const weightedScore = overlapCount / totalScreeners;
    const matchedBy = data.matches.map((m) => ({ key: m.screenerKey, label: m.screenerLabel }));

    const familyNames = Object.keys(familyMix);
    const explanation =
      `${symbol} matched ${overlapCount}/${totalScreeners} screeners` +
      (familyNames.length > 1 ? ` across ${familyNames.join(", ")} families` : "");

    results.push({
      symbol,
      companyName: data.companyName,
      overlapCount,
      weightedScore,
      matchedBy,
      familyMix,
      explanation,
    });
  }

  // Sort by overlap count desc, then weighted score desc
  results.sort((a, b) => b.overlapCount - a.overlapCount || b.weightedScore - a.weightedScore);

  return results;
}
