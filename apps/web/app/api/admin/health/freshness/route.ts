import { NextResponse } from "next/server";
import { prisma } from "@ibo/db";
import type { RunStatus } from "@ibo/db";

type SourceFreshness = {
  source: string;
  latestAt: string | null;
  ageHours: number | null;
  staleAfterHours: number;
  stale: boolean;
  extra?: Record<string, unknown>;
};

type CronFreshness = {
  jobKey: string;
  lastRunAt: string | null;
  lastRunStatus: RunStatus | null;
  lastSuccessAt: string | null;
  ageHoursSinceSuccess: number | null;
  staleAfterHours: number;
  stale: boolean;
};

function hoursSince(date: Date | null): number | null {
  if (!date) return null;
  return Number(((Date.now() - date.getTime()) / 3_600_000).toFixed(2));
}

function staleFromAge(ageHours: number | null, staleAfterHours: number): boolean {
  if (ageHours == null) return true;
  return ageHours > staleAfterHours;
}

async function latestSnapshots(): Promise<SourceFreshness[]> {
  const [latestCandle, latestQuote, latestFiiDii, latestBreadth] = await Promise.all([
    prisma.candle.findFirst({
      where: { timeframe: "D1" },
      orderBy: { ts: "desc" },
      select: { ts: true },
    }),
    prisma.quoteSnapshot.findFirst({
      orderBy: { ts: "desc" },
      select: { ts: true },
    }),
    prisma.fiiDiiSnapshot.findFirst({
      orderBy: { date: "desc" },
      select: { date: true, fiiCashNet: true, diiCashNet: true },
    }),
    prisma.marketBreadthSnapshot.findFirst({
      orderBy: { date: "desc" },
      select: { date: true, advances: true, declines: true },
    }),
  ]);

  const candlesAge = hoursSince(latestCandle?.ts ?? null);
  const quotesAge = hoursSince(latestQuote?.ts ?? null);
  const fiiDiiAge = hoursSince(latestFiiDii?.date ?? null);
  const breadthAge = hoursSince(latestBreadth?.date ?? null);

  return [
    {
      source: "candles_d1",
      latestAt: latestCandle?.ts?.toISOString() ?? null,
      ageHours: candlesAge,
      staleAfterHours: 48,
      stale: staleFromAge(candlesAge, 48),
    },
    {
      source: "quotes",
      latestAt: latestQuote?.ts?.toISOString() ?? null,
      ageHours: quotesAge,
      staleAfterHours: 24,
      stale: staleFromAge(quotesAge, 24),
    },
    {
      source: "fii_dii",
      latestAt: latestFiiDii?.date?.toISOString() ?? null,
      ageHours: fiiDiiAge,
      staleAfterHours: 72,
      stale: staleFromAge(fiiDiiAge, 72),
      extra: {
        fiiCashNet: latestFiiDii?.fiiCashNet ?? null,
        diiCashNet: latestFiiDii?.diiCashNet ?? null,
      },
    },
    {
      source: "market_breadth",
      latestAt: latestBreadth?.date?.toISOString() ?? null,
      ageHours: breadthAge,
      staleAfterHours: 48,
      stale: staleFromAge(breadthAge, 48),
      extra: {
        advances: latestBreadth?.advances ?? null,
        declines: latestBreadth?.declines ?? null,
      },
    },
  ];
}

async function cronFreshness(): Promise<CronFreshness[]> {
  const jobs: Array<{ key: string; staleAfterHours: number }> = [
    { key: "ingest_eod_fast", staleAfterHours: 48 },
    { key: "ingest_eod_enrich", staleAfterHours: 48 },
    { key: "pre_market", staleAfterHours: 48 },
    { key: "post_close", staleAfterHours: 48 },
    { key: "provider_health", staleAfterHours: 2 },
    { key: "weekly", staleAfterHours: 24 * 8 },
    { key: "month_end", staleAfterHours: 24 * 35 },
  ];

  const rows: CronFreshness[] = [];
  for (const job of jobs) {
    const [lastRun, lastSuccess] = await Promise.all([
      prisma.cronJobLock.findFirst({
        where: { jobKey: job.key },
        orderBy: { lockedAt: "desc" },
        select: { lockedAt: true, status: true },
      }),
      prisma.cronJobLock.findFirst({
        where: { jobKey: job.key, status: "completed" },
        orderBy: { lockedAt: "desc" },
        select: { lockedAt: true },
      }),
    ]);

    const ageHoursSinceSuccess = hoursSince(lastSuccess?.lockedAt ?? null);
    rows.push({
      jobKey: job.key,
      lastRunAt: lastRun?.lockedAt?.toISOString() ?? null,
      lastRunStatus: (lastRun?.status as RunStatus | undefined) ?? null,
      lastSuccessAt: lastSuccess?.lockedAt?.toISOString() ?? null,
      ageHoursSinceSuccess,
      staleAfterHours: job.staleAfterHours,
      stale: staleFromAge(ageHoursSinceSuccess, job.staleAfterHours),
    });
  }

  return rows;
}

export async function GET() {
  const [sources, crons] = await Promise.all([latestSnapshots(), cronFreshness()]);
  const staleSources = sources.filter((source) => source.stale).map((source) => source.source);
  const staleCrons = crons.filter((cron) => cron.stale).map((cron) => cron.jobKey);

  return NextResponse.json({
    data: {
      checkedAt: new Date().toISOString(),
      healthy: staleSources.length === 0 && staleCrons.length === 0,
      staleSources,
      staleCrons,
      sources,
      crons,
    },
  });
}
