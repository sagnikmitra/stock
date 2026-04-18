import { NextResponse } from "next/server";
import { prisma } from "@ibo/db";
import { scoreMarketContext } from "@ibo/strategy-engine";
import { unstable_cache } from "next/cache";
import {
  configureMaterializedLatest,
  getMaterializedLatestPayload,
  normalizeClampedLimit,
} from "./materialized-latest";

export const revalidate = 15;

const DEFAULT_LIMIT = 1;
const MAX_LIMIT = 30;
const MATERIALIZED_LATEST_TTL_MS = 15_000;

type MarketContextPayload = {
  latest: {
    globalContext: {
      date: string;
      posture: string | null;
      score: number | null;
      giftNiftyChange: number | null;
      dowFuturesChange: number | null;
      goldChange: number | null;
      crudeChange: number | null;
      narrative: string | null;
      breakdown: ReturnType<typeof scoreMarketContext>["breakdown"];
    } | null;
    fiiDii: {
      date: string;
      fiiCashNet: number | null;
      diiCashNet: number | null;
    } | null;
    breadth: {
      date: string;
      advances: number | null;
      declines: number | null;
      new52WeekHighs: number | null;
      new52WeekLows: number | null;
    } | null;
  };
  contexts: Array<{
    date: string;
    posture: string | null;
    score: number | null;
    giftNiftyChange: number | null;
    dowFuturesChange: number | null;
    goldChange: number | null;
    crudeChange: number | null;
    narrative: string | null;
    breakdown: ReturnType<typeof scoreMarketContext>["breakdown"];
  }>;
  fiiDii: Array<{
    date: string;
    fiiCashNet: number | null;
    diiCashNet: number | null;
  }>;
  breadth: Array<{
    date: string;
    advances: number | null;
    declines: number | null;
    new52WeekHighs: number | null;
    new52WeekLows: number | null;
  }>;
};

function toNum(value: unknown): number | null {
  if (value == null) return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function toDateKey(value: Date): string {
  return value.toISOString().split("T")[0];
}

function normalizeLimit(input: string | null): number {
  return normalizeClampedLimit(input, DEFAULT_LIMIT, MAX_LIMIT);
}

async function buildPayload(limit: number): Promise<MarketContextPayload> {
  const [contexts, fiiDii, breadth] = await Promise.all([
    prisma.globalContextSnapshot.findMany({
      orderBy: { date: "desc" },
      take: limit,
      select: {
        date: true,
        marketPosture: true,
        postureScore: true,
        giftNiftyChange: true,
        dowIndexChange: true,
        dowFuturesChange: true,
        goldChange: true,
        crudeChange: true,
        narrative: true,
      },
    }),
    prisma.fiiDiiSnapshot.findMany({
      orderBy: { date: "desc" },
      take: limit,
      select: { date: true, fiiCashNet: true, diiCashNet: true },
    }),
    prisma.marketBreadthSnapshot.findMany({
      orderBy: { date: "desc" },
      take: limit,
      select: { date: true, advances: true, declines: true, new52WeekHighs: true, new52WeekLows: true },
    }),
  ]);

  const fiiByDate = new Map(
    fiiDii.map((flow) => [
      toDateKey(flow.date),
      {
        fiiCashNet: toNum(flow.fiiCashNet),
        diiCashNet: toNum(flow.diiCashNet),
      },
    ]),
  );

  const contextsWithBreakdown = contexts.map((row) => {
    const date = toDateKey(row.date);
    const flow = fiiByDate.get(date);

    const projected = scoreMarketContext({
      date,
      giftNiftyChangePct: toNum(row.giftNiftyChange) ?? undefined,
      dowIndexChangePct: toNum(row.dowIndexChange) ?? undefined,
      dowFuturesChangePct: toNum(row.dowFuturesChange) ?? undefined,
      goldChangePct: toNum(row.goldChange) ?? undefined,
      crudeChangePct: toNum(row.crudeChange) ?? undefined,
      fiiNetCashCr: flow?.fiiCashNet ?? undefined,
    });

    return {
      date,
      posture: row.marketPosture,
      score: toNum(row.postureScore),
      giftNiftyChange: toNum(row.giftNiftyChange),
      dowFuturesChange: toNum(row.dowFuturesChange),
      goldChange: toNum(row.goldChange),
      crudeChange: toNum(row.crudeChange),
      narrative: row.narrative,
      breakdown: projected.breakdown,
    };
  });

  const latestContext = contextsWithBreakdown[0] ?? null;
  const latestFii = fiiDii[0]
    ? {
        date: toDateKey(fiiDii[0].date),
        fiiCashNet: toNum(fiiDii[0].fiiCashNet),
        diiCashNet: toNum(fiiDii[0].diiCashNet),
      }
    : null;
  const latestBreadth = breadth[0]
    ? {
        date: toDateKey(breadth[0].date),
        advances: breadth[0].advances,
        declines: breadth[0].declines,
        new52WeekHighs: breadth[0].new52WeekHighs,
        new52WeekLows: breadth[0].new52WeekLows,
      }
    : null;

  return {
    latest: {
      globalContext: latestContext,
      fiiDii: latestFii,
      breadth: latestBreadth,
    },
    contexts: contextsWithBreakdown,
    fiiDii: fiiDii.map((f) => ({
      date: toDateKey(f.date),
      fiiCashNet: toNum(f.fiiCashNet),
      diiCashNet: toNum(f.diiCashNet),
    })),
    breadth: breadth.map((b) => ({
      date: toDateKey(b.date),
      advances: b.advances,
      declines: b.declines,
      new52WeekHighs: b.new52WeekHighs,
      new52WeekLows: b.new52WeekLows,
    })),
  };
}

async function buildLatestPayload(): Promise<MarketContextPayload> {
  return buildPayload(1);
}

configureMaterializedLatest({
  ttlMs: MATERIALIZED_LATEST_TTL_MS,
  loader: buildLatestPayload,
});

const historicalLoaders = new Map<number, () => Promise<MarketContextPayload>>();

function getHistoricalPayloadLoader(limit: number) {
  const existing = historicalLoaders.get(limit);
  if (existing) return existing;

  const loader = unstable_cache(
    async () => buildPayload(limit),
    [`api-market-context-history-${limit}-v1`],
    { revalidate: 15 },
  );
  historicalLoaders.set(limit, loader);
  return loader;
}

function emptyPayload(): MarketContextPayload {
  return {
    latest: {
      globalContext: null,
      fiiDii: null,
      breadth: null,
    },
    contexts: [],
    fiiDii: [],
    breadth: [],
  };
}

async function withTimeout<T>(promise: Promise<T>, timeoutMs: number): Promise<T> {
  return await Promise.race([
    promise,
    new Promise<T>((_, reject) => {
      setTimeout(() => reject(new Error(`Timed out after ${timeoutMs}ms`)), timeoutMs);
    }),
  ]);
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const limit = normalizeLimit(searchParams.get("limit"));
  try {
    const data =
      limit === 1
        ? await withTimeout(getMaterializedLatestPayload(), 1500)
        : await withTimeout(getHistoricalPayloadLoader(limit)(), 1500);
    return NextResponse.json({ data });
  } catch (error) {
    return NextResponse.json(
      {
        data: emptyPayload(),
        degraded: true,
        warning:
          error instanceof Error
            ? `market-context fallback: ${error.message}`
            : "market-context fallback: unknown error",
      },
      { status: 200 },
    );
  }
}
