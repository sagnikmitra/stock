import test from "node:test";
import assert from "node:assert/strict";
import { scoreMarketContext } from "./market-context";

test("scoreMarketContext returns favorable posture for aligned risk-on cues", () => {
  const scored = scoreMarketContext({
    date: "2026-04-16",
    giftNiftyChangePct: 0.9,
    dowFuturesChangePct: 0.7,
    goldChangePct: -0.8,
    crudeChangePct: -0.6,
    fiiNetCashCr: 2500,
    diiNetCashCr: 2500,
  });

  assert.equal(scored.posture, "favorable");
  assert.ok(scored.score >= 4);
  assert.equal(scored.breakdown?.length, 6);
  assert.equal(scored.breakdown?.every((factor) => factor.status === "favorable"), true);
});

test("scoreMarketContext flags degraded mode when factors are missing", () => {
  const scored = scoreMarketContext({
    date: "2026-04-16",
    giftNiftyChangePct: 0.2,
  });

  assert.equal(scored.posture, "mixed");
  assert.ok(scored.narrative.includes("Degraded mode active"));
  assert.equal(
    scored.breakdown?.filter((factor) => factor.status === "missing").length,
    5,
  );
});
