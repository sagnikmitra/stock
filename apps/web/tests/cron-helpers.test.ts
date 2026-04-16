import test from "node:test";
import assert from "node:assert/strict";
import {
  buildDigestSummary,
  isCalendarMonthEnd,
  shouldRenderDegradedMode,
} from "../app/api/cron/_helpers";
import { nseCalendar } from "@ibo/utils";

test("isCalendarMonthEnd respects trading days over naive calendar boundaries", () => {
  // Jan 2026: 31st is Saturday. Last trading day is 30th (Friday).
  assert.equal(isCalendarMonthEnd(new Date("2026-01-31T10:00:00Z")), false); // Saturday not a trading day!
  assert.equal(isCalendarMonthEnd(new Date("2026-01-30T10:00:00Z")), true);  // Friday is the trade month-end!

  // May 2026: 1st is Maharashtra Day holiday.
  // April 2026 month-end should be 30th (Thursday), but wait, the check is just testing the calendar bounds correctly.
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
