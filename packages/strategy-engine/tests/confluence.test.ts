import test from "node:test";
import assert from "node:assert/strict";
import { computeConfluenceScore } from "../src/selectors/confluence";
import type { IntersectionResult } from "@ibo/types";

test("Confluence score for overlapping screeners", () => {
  const row: IntersectionResult = {
    symbol: "ABC",
    companyName: "ABC Corp",
    overlapCount: 3,
    weightedScore: 0,
    matchedBy: [],
    familyMix: { investment: 2, swing: 1 },
    explanation: "3 overlaps",
  };
  const score = computeConfluenceScore(row, 5);
  assert.ok(score.score > 0);
  assert.ok(["review_now", "watch_closely", "month_end_only", "contextual_only"].includes(score.bucket));
});

test("Confluence score is zero-ish with no overlap", () => {
  const row: IntersectionResult = {
    symbol: "XYZ",
    companyName: "XYZ Corp",
    overlapCount: 0,
    weightedScore: 0,
    matchedBy: [],
    familyMix: {},
    explanation: "none",
  };
  const score = computeConfluenceScore(row, 5);
  assert.equal(score.score, 0);
  assert.equal(score.bucket, "contextual_only");
});

