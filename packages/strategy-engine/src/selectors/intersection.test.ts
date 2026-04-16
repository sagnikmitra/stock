import test from "node:test";
import assert from "node:assert/strict";
import { computeIntersection } from "./intersection";
import { computeConfluenceScore } from "./confluence";

test("computeIntersection supports strong confluence set math", () => {
  const result = computeIntersection(
    {
      screenerKeys: [
        "trend_continuation_internal",
        "breakout_quality_internal",
        "sma_13_34_internal",
      ],
      mode: "intersection",
      minOverlap: 2,
      marketDate: "2026-04-16",
    },
    new Map([
      [
        "trend_continuation_internal",
        [
          {
            symbol: "ABC",
            companyName: "ABC Industries",
            matches: [
              {
                screenerKey: "trend_continuation_internal",
                screenerLabel: "Trend Continuation Internal",
                family: "swing",
              },
            ],
          },
        ],
      ],
      [
        "breakout_quality_internal",
        [
          {
            symbol: "ABC",
            companyName: "ABC Industries",
            matches: [
              {
                screenerKey: "breakout_quality_internal",
                screenerLabel: "Breakout Quality Internal",
                family: "swing",
              },
            ],
          },
        ],
      ],
      [
        "sma_13_34_internal",
        [
          {
            symbol: "XYZ",
            companyName: "XYZ Limited",
            matches: [
              {
                screenerKey: "sma_13_34_internal",
                screenerLabel: "SMA 13/34 Internal",
                family: "swing",
              },
            ],
          },
        ],
      ],
    ]),
  );

  assert.equal(result.length, 1);
  assert.equal(result[0]?.symbol, "ABC");
  assert.equal(result[0]?.overlapCount, 2);
});

test("computeConfluenceScore returns deterministic bucket", () => {
  const scored = computeConfluenceScore(
    {
      symbol: "ABC",
      companyName: "ABC Industries",
      overlapCount: 3,
      weightedScore: 1,
      matchedBy: [
        { key: "trend_continuation_internal", label: "Trend" },
        { key: "breakout_quality_internal", label: "Breakout" },
        { key: "investment_bb_internal", label: "BB" },
      ],
      familyMix: {
        swing: 2,
        investment: 1,
      },
      explanation: "ABC matched 3/3",
    },
    3,
  );

  assert.equal(scored.bucket, "review_now");
  assert.ok(scored.score >= 0.7);
});

