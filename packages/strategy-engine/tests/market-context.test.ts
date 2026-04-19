import test from "node:test";
import assert from "node:assert/strict";
import { scoreMarketContext } from "../src/selectors/market-context";

test("scoreMarketContext adds resilience override for FII sell with strong DII buy", () => {
  const result = scoreMarketContext({
    date: "2026-04-19",
    fiiNetCashCr: -2000,
    diiNetCashCr: 2500,
  });

  const override = result.breakdown?.find((item) => item.key === "resilience_override");
  assert.ok(override);
  assert.equal(override?.status, "favorable");
});

test("scoreMarketContext does not add resilience override when DII buy is weak", () => {
  const result = scoreMarketContext({
    date: "2026-04-19",
    fiiNetCashCr: -2000,
    diiNetCashCr: 500,
  });

  const override = result.breakdown?.find((item) => item.key === "resilience_override");
  assert.equal(override, undefined);
});
