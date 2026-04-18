import test from "node:test";
import assert from "node:assert/strict";
import { prisma } from "@ibo/db";
import { GET } from "../app/api/market-context/route";
import {
  marketContextMaterializedInternals,
  normalizeClampedLimit,
} from "../app/api/market-context/materialized-latest";

function buildPrimedPayload() {
  return {
    latest: {
      globalContext: {
        date: "2026-04-16",
        posture: "mixed",
        score: 2.5,
        giftNiftyChange: 0.1,
        dowFuturesChange: -0.2,
        goldChange: 0,
        crudeChange: 0.3,
        narrative: "cached snapshot",
        breakdown: [],
      },
      fiiDii: {
        date: "2026-04-16",
        fiiCashNet: 100,
        diiCashNet: -100,
      },
      breadth: {
        date: "2026-04-16",
        advances: 25,
        declines: 25,
        new52WeekHighs: 5,
        new52WeekLows: 2,
      },
    },
    contexts: [],
    fiiDii: [],
    breadth: [],
  };
}

test("market-context limit normalization clamps and defaults safely", () => {
  assert.equal(normalizeClampedLimit(null, 1, 30), 1);
  assert.equal(normalizeClampedLimit("abc", 1, 30), 1);
  assert.equal(normalizeClampedLimit("0", 1, 30), 1);
  assert.equal(normalizeClampedLimit("3.9", 1, 30), 3);
  assert.equal(normalizeClampedLimit("999", 1, 30), 30);
});

test("GET /api/market-context returns stale materialized latest snapshot when refresh fails", async () => {
  marketContextMaterializedInternals.resetForTests();

  const originalGlobalFindMany = prisma.globalContextSnapshot.findMany;
  const originalFiiFindMany = prisma.fiiDiiSnapshot.findMany;
  const originalBreadthFindMany = prisma.marketBreadthSnapshot.findMany;

  (prisma.globalContextSnapshot as { findMany: unknown }).findMany = async () => {
    throw new Error("db unavailable");
  };
  (prisma.fiiDiiSnapshot as { findMany: unknown }).findMany = async () => {
    throw new Error("db unavailable");
  };
  (prisma.marketBreadthSnapshot as { findMany: unknown }).findMany = async () => {
    throw new Error("db unavailable");
  };

  marketContextMaterializedInternals.primeForTests(buildPrimedPayload(), Date.now() - 30_000);

  try {
    const response = await GET(new Request("http://localhost/api/market-context"));
    const payload = await response.json();

    assert.equal(response.status, 200);
    assert.equal(Boolean(payload.degraded), false);
    assert.equal(payload.data.latest.globalContext?.narrative, "cached snapshot");
  } finally {
    (prisma.globalContextSnapshot as { findMany: unknown }).findMany = originalGlobalFindMany;
    (prisma.fiiDiiSnapshot as { findMany: unknown }).findMany = originalFiiFindMany;
    (prisma.marketBreadthSnapshot as { findMany: unknown }).findMany = originalBreadthFindMany;
    marketContextMaterializedInternals.resetForTests();
  }
});

test("GET /api/market-context degrades with empty payload when no materialized snapshot exists", async () => {
  marketContextMaterializedInternals.resetForTests();

  const originalGlobalFindMany = prisma.globalContextSnapshot.findMany;
  const originalFiiFindMany = prisma.fiiDiiSnapshot.findMany;
  const originalBreadthFindMany = prisma.marketBreadthSnapshot.findMany;

  (prisma.globalContextSnapshot as { findMany: unknown }).findMany = async () => {
    throw new Error("db unavailable");
  };
  (prisma.fiiDiiSnapshot as { findMany: unknown }).findMany = async () => {
    throw new Error("db unavailable");
  };
  (prisma.marketBreadthSnapshot as { findMany: unknown }).findMany = async () => {
    throw new Error("db unavailable");
  };

  try {
    const response = await GET(new Request("http://localhost/api/market-context"));
    const payload = await response.json();

    assert.equal(response.status, 200);
    assert.equal(payload.degraded, true);
    assert.deepEqual(payload.data.contexts, []);
    assert.deepEqual(payload.data.fiiDii, []);
    assert.deepEqual(payload.data.breadth, []);
  } finally {
    (prisma.globalContextSnapshot as { findMany: unknown }).findMany = originalGlobalFindMany;
    (prisma.fiiDiiSnapshot as { findMany: unknown }).findMany = originalFiiFindMany;
    (prisma.marketBreadthSnapshot as { findMany: unknown }).findMany = originalBreadthFindMany;
    marketContextMaterializedInternals.resetForTests();
  }
});
