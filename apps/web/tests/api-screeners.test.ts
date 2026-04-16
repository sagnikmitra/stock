import test from "node:test";
import assert from "node:assert/strict";
import { POST } from "../app/api/screeners/intersection/route";

test("POST /api/screeners/intersection validates required input", async () => {
  const request = new Request("http://localhost/api/screeners/intersection", {
    method: "POST",
    body: JSON.stringify({
      screenerKeys: [],
    }),
    headers: { "Content-Type": "application/json" },
  });

  const response = await POST(request);
  const payload = await response.json();
  assert.equal(response.status, 400);
  assert.equal(typeof payload.error, "string");
});
