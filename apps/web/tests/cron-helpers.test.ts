import test from "node:test";
import assert from "node:assert/strict";
import {
  buildDigestSummary,
  isCalendarMonthEnd,
  shouldRenderDegradedMode,
} from "../app/api/cron/_helpers";

test("isCalendarMonthEnd returns true only for final UTC date in month", () => {
  assert.equal(isCalendarMonthEnd(new Date("2026-04-30T10:00:00Z")), true);
  assert.equal(isCalendarMonthEnd(new Date("2026-04-29T10:00:00Z")), false);
});

test("degraded mode detection follows warning presence", () => {
  assert.equal(shouldRenderDegradedMode([]), false);
  assert.equal(shouldRenderDegradedMode(["No FII data"]), true);
});

test("buildDigestSummary marks degraded mode explicitly", () => {
  const full = buildDigestSummary({ posture: "mixed", score: 2.6, warnings: [] });
  assert.ok(full.includes("Full-data mode"));

  const degraded = buildDigestSummary({
    posture: "hostile",
    score: 1.2,
    warnings: ["No FII/DII data", "No prior global context data"],
  });
  assert.ok(degraded.includes("DEGRADED MODE"));
});
