import { prisma } from "@ibo/db";

function hoursSince(date: Date | null): number | null {
  if (!date) return null;
  return Number(((Date.now() - date.getTime()) / 3_600_000).toFixed(2));
}

function renderAge(age: number | null): string {
  return age == null ? "n/a" : `${age}h`;
}

async function main() {
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

  const jobs = [
    "ingest_eod_fast",
    "ingest_eod_enrich",
    "pre_market",
    "post_close",
    "provider_health",
    "weekly",
    "month_end",
  ] as const;

  console.log(`# Data Freshness Report (${new Date().toISOString()})`);
  console.log("\n## Sources");
  console.log(`- candles_d1 latest: ${latestCandle?.ts?.toISOString() ?? "n/a"} (age ${renderAge(hoursSince(latestCandle?.ts ?? null))})`);
  console.log(`- quotes latest: ${latestQuote?.ts?.toISOString() ?? "n/a"} (age ${renderAge(hoursSince(latestQuote?.ts ?? null))})`);
  console.log(`- fii_dii latest: ${latestFiiDii?.date?.toISOString() ?? "n/a"} (age ${renderAge(hoursSince(latestFiiDii?.date ?? null))})`);
  console.log(`- market_breadth latest: ${latestBreadth?.date?.toISOString() ?? "n/a"} (age ${renderAge(hoursSince(latestBreadth?.date ?? null))})`);

  console.log("\n## Cron Last Success");
  for (const jobKey of jobs) {
    const lastSuccess = await prisma.cronJobLock.findFirst({
      where: { jobKey, status: "completed" },
      orderBy: { lockedAt: "desc" },
      select: { lockedAt: true, marketDate: true },
    });
    console.log(
      `- ${jobKey}: ${lastSuccess?.lockedAt?.toISOString() ?? "n/a"} (marketDate ${
        lastSuccess?.marketDate?.toISOString()?.slice(0, 10) ?? "n/a"
      })`,
    );
  }

  await prisma.$disconnect();
}

main().catch(async (error) => {
  console.error(error);
  await prisma.$disconnect();
  process.exit(1);
});
