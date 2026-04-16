import test from "node:test";
import assert from "node:assert/strict";
import { GET } from "../app/api/strategies/route";

test("GET /api/strategies returns data array shape", async () => {
  const response = await GET();
  const payload = await response.json();
  assert.equal(Array.isArray(payload.data), true);
});
