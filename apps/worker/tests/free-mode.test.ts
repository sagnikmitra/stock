import test from "node:test";
import assert from "node:assert/strict";
import { isFreeDataSyncEnabled, parseProviderPriority } from "../src/ingestion/free-mode";

test("parseProviderPriority uses fallback for empty value", () => {
  const fallback = ["nse_official", "twelvedata"];
  assert.deepEqual(parseProviderPriority(undefined, fallback), fallback);
  assert.deepEqual(parseProviderPriority("", fallback), fallback);
});

test("parseProviderPriority normalizes, trims and deduplicates", () => {
  const result = parseProviderPriority(" NSE_OFFICIAL, twelvedata , nse_official , fmp ", ["nse_official"]);
  assert.deepEqual(result, ["nse_official", "twelvedata", "fmp"]);
});

test("isFreeDataSyncEnabled defaults to true and supports explicit false", () => {
  const previous = process.env.FREE_DATA_SYNC_ENABLED;
  try {
    delete process.env.FREE_DATA_SYNC_ENABLED;
    assert.equal(isFreeDataSyncEnabled(), true);

    process.env.FREE_DATA_SYNC_ENABLED = "false";
    assert.equal(isFreeDataSyncEnabled(), false);

    process.env.FREE_DATA_SYNC_ENABLED = "FALSE";
    assert.equal(isFreeDataSyncEnabled(), false);

    process.env.FREE_DATA_SYNC_ENABLED = "true";
    assert.equal(isFreeDataSyncEnabled(), true);
  } finally {
    if (previous === undefined) delete process.env.FREE_DATA_SYNC_ENABLED;
    else process.env.FREE_DATA_SYNC_ENABLED = previous;
  }
});
