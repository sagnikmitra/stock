import { getDatabaseUnavailableReason, isDatabaseConfigured, prisma } from "@ibo/db";
import { nseCalendar } from "@ibo/utils";
import { unstable_cache } from "next/cache";
import { Card, CardHeader, CardTitle, CardDescription } from "./components/ui/card";
import { Badge } from "./components/ui/badge";
import { PostureIndicator } from "./components/ui/posture-indicator";
import { PageHeader } from "./components/ui/page-header";
import { EducationalDisclaimer } from "./components/ui/educational-disclaimer";
import Link from "next/link";

// Dashboard is force-dynamic (live digest/provider data), but static strategy
// metadata is cached for 60s to avoid repeated Supabase round-trips.
const getStaticDashboardData = unstable_cache(
  async () => {
    const strategies = await prisma.strategy.findMany({
      where: { status: "active" },
      include: { _count: { select: { results: true } } },
      orderBy: { family: "asc" },
    });
    return { strategies };
  },
  ["dashboard-static"],
  { revalidate: 60 }
);

export const revalidate = 15;

export default async function DashboardPage() {
  type StaticDashboardData = Awaited<ReturnType<typeof getStaticDashboardData>>;
  let strategies: StaticDashboardData["strategies"] = [];
  let recentDigest: {
    id: string;
    title: string;
    summary: string;
    marketDate: Date;
    updatedAt: Date;
    digestType: string;
  } | null = null;
  let databaseWarning = "";
  let latestProviderRuns: Array<any> = [];
  let topConfluence: Array<any> = [];
  let watchlistDelta = { added: 0, removed: 0, invalidated: 0 };
  let watchlistRecentAdds: number = 0;
  let watchlistInvalidated: number = 0;
  let reviewQueue: Array<any> = [];
  let monthEndReminder = false;
  let lastRefresh: Date | null = null;

  if (isDatabaseConfigured) {
    try {
      const staticData = await getStaticDashboardData();
      strategies = staticData.strategies;

      [recentDigest, latestProviderRuns, topConfluence, reviewQueue, watchlistRecentAdds, watchlistInvalidated] = await Promise.all([
        prisma.digest.findFirst({ orderBy: { marketDate: "desc" }, select: { id: true, title: true, summary: true, marketDate: true, updatedAt: true, digestType: true } }),
        prisma.providerJobRun.findMany({
          orderBy: { startedAt: "desc" },
          take: 8,
          select: { id: true, startedAt: true, finishedAt: true, status: true, provider: { select: { name: true } } },
        }),
        prisma.confluenceResult.findMany({
          orderBy: [{ marketDate: "desc" }, { overlapCount: "desc" }],
          take: 10,
          select: { id: true, overlapCount: true, marketDate: true, instrument: { select: { symbol: true, companyName: true } } },
        }),
        prisma.strategyResult.findMany({
          where: { OR: [{ matched: false }, { explanation: { contains: "ambig", mode: "insensitive" } }] },
          orderBy: { createdAt: "desc" },
          take: 12,
          select: { id: true, explanation: true, instrument: { select: { symbol: true } }, strategy: { select: { name: true } } },
        }),
        // These two were previously fired sequentially AFTER the batch — now parallel
        prisma.watchlistItem.count({ where: { addedAt: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) } } }),
        prisma.watchlistItem.count({ where: { isActive: false } }),
      ]);
      watchlistDelta = { added: watchlistRecentAdds as number, removed: 0, invalidated: watchlistInvalidated as number };

      lastRefresh = recentDigest?.updatedAt ?? null;
      const today = new Date();
      let remainingTradingDays = 0;
      const cursor = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate()));
      while (cursor.getUTCMonth() === today.getUTCMonth()) {
        if (nseCalendar.isTradingDay(cursor)) {
          remainingTradingDays += 1;
        }
        cursor.setUTCDate(cursor.getUTCDate() + 1);
      }
      monthEndReminder = remainingTradingDays <= 3;
    } catch (error) {
      databaseWarning = getDatabaseUnavailableReason(error);
    }
  } else {
    databaseWarning = getDatabaseUnavailableReason();
  }

  const investmentStrategies = strategies.filter((s) => s.family === "investment");
  const swingStrategies = strategies.filter((s) => s.family === "swing");

  return (
    <>
      <PageHeader title="Dashboard" description="Live operating console for digests, strategy health, and review queue." />
      <EducationalDisclaimer className="mb-4" />

      <div className="mb-6 grid gap-4 lg:grid-cols-[1.5fr_1fr]">
        <Card className="bg-white">
          <CardHeader>
            <CardTitle>Session Snapshot</CardTitle>
            <CardDescription>Operational signal quality and refresh posture for today.</CardDescription>
          </CardHeader>
          <div className="grid gap-3 text-sm sm:grid-cols-2">
            <div className="rounded-md border border-slate-200 px-3 py-2">
              <p className="text-xs uppercase tracking-wide text-slate-500">Last Refresh</p>
              <p className="mt-1 font-semibold text-slate-800">{lastRefresh ? lastRefresh.toISOString() : "Unknown"}</p>
            </div>
            <div className="rounded-md border border-slate-200 px-3 py-2">
              <p className="text-xs uppercase tracking-wide text-slate-500">Market Mode</p>
              <p className="mt-1 font-semibold text-slate-800">Educational Research Workspace</p>
            </div>
            <div className="rounded-md border border-slate-200 px-3 py-2">
              <p className="text-xs uppercase tracking-wide text-slate-500">Watchlist Added (24h)</p>
              <p className="mt-1 text-xl font-bold tracking-tight text-slate-900">{watchlistDelta.added}</p>
            </div>
            <div className="rounded-md border border-slate-200 px-3 py-2">
              <p className="text-xs uppercase tracking-wide text-slate-500">Invalidated</p>
              <p className="mt-1 text-xl font-bold tracking-tight text-slate-900">{watchlistDelta.invalidated}</p>
            </div>
          </div>
          {lastRefresh ? null : (
            <p className="mt-3 text-xs text-amber-700">
              Data freshness warning: no recent digest timestamp found.
            </p>
          )}
        </Card>

        <Card className={monthEndReminder ? "border-amber-200 bg-amber-50" : "bg-white"}>
          <CardHeader>
            <CardTitle>Month-End Gate</CardTitle>
            <CardDescription>Tracks proximity to the month-end review window.</CardDescription>
          </CardHeader>
          <p className="text-sm text-slate-700">
            {monthEndReminder
              ? "Within 3 trading days of month-end review window."
              : "Outside month-end window."}
          </p>
        </Card>
      </div>

      {databaseWarning ? (
        <div className="mb-6">
          <Card>
            <CardHeader>
              <CardTitle>Database Setup Needed</CardTitle>
              <CardDescription>{databaseWarning}</CardDescription>
            </CardHeader>
            <div className="text-sm text-slate-500">
              Expected local default: <code>postgresql://postgres:password@localhost:54322/investment_bible</code>
            </div>
          </Card>
        </div>
      ) : null}

      {/* Market Posture — placeholder until real data flows */}
      <div className="mb-6">
        <Card className="bg-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium uppercase tracking-wide text-slate-500">Market Posture</p>
              <p className="mt-1 text-sm text-slate-600">
                Awaiting market data. Connect a provider to see live context.
              </p>
            </div>
            <PostureIndicator posture="mixed" score={0} />
          </div>
        </Card>
      </div>

      {/* Strategy Radar */}
      <div className="mb-6 grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Investment Strategies</CardTitle>
            <CardDescription>Monthly review cycle</CardDescription>
          </CardHeader>
          <div className="space-y-2">
            {investmentStrategies.map((s) => (
              <Link
                key={s.key}
                href={`/strategies/${s.key}`}
                className="flex items-center justify-between rounded-xl border border-transparent px-3 py-2 text-sm hover:border-cyan-100 hover:bg-cyan-50/60"
              >
                <span className="font-medium text-slate-700">{s.name}</span>
                <Badge variant="investment">{s.confidence}</Badge>
              </Link>
            ))}
            {investmentStrategies.length === 0 && (
              <p className="text-sm text-slate-400">No active investment strategies</p>
            )}
          </div>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Swing Strategies</CardTitle>
            <CardDescription>Daily/weekly review cycle</CardDescription>
          </CardHeader>
          <div className="space-y-2">
            {swingStrategies.map((s) => (
              <Link
                key={s.key}
                href={`/strategies/${s.key}`}
                className="flex items-center justify-between rounded-xl border border-transparent px-3 py-2 text-sm hover:border-teal-100 hover:bg-teal-50/60"
              >
                <span className="font-medium text-slate-700">{s.name}</span>
                <Badge variant="swing">{s.confidence}</Badge>
              </Link>
            ))}
            {swingStrategies.length === 0 && (
              <p className="text-sm text-slate-400">No active swing strategies</p>
            )}
          </div>
        </Card>
      </div>

      {/* Digest Highlights */}
      <Card className="mb-6 bg-white">
        <CardHeader>
          <CardTitle>Latest Digest</CardTitle>
        </CardHeader>
        {recentDigest ? (
          <div className="text-sm">
            <Link href={`/digest/${recentDigest.marketDate.toISOString().split("T")[0]}`} className="font-medium text-brand-600 hover:underline">
              {recentDigest.title}
            </Link>
            <p className="mt-1 text-slate-500">{recentDigest.summary}</p>
          </div>
        ) : (
          <p className="text-sm text-slate-400">No digests yet. Run the pre-market cron to generate your first digest.</p>
        )}
      </Card>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Provider Health</CardTitle>
          </CardHeader>
          <div className="space-y-2 text-sm">
            {latestProviderRuns.map((run) => (
              <div key={run.id} className="flex items-center justify-between rounded-md border border-slate-200 px-2.5 py-1.5">
                <span>{run.provider.name}</span>
                <Badge variant={run.status === "completed" ? "favorable" : run.status === "failed" ? "hostile" : "mixed"}>{run.status}</Badge>
              </div>
            ))}
            {latestProviderRuns.length === 0 ? <p className="text-slate-500">No provider runs.</p> : null}
          </div>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Intersection Spotlight</CardTitle>
          </CardHeader>
          <div className="space-y-2 text-sm">
            {topConfluence.map((item) => (
              <div key={item.id} className="flex items-center justify-between rounded-md border border-slate-200 px-2.5 py-1.5">
                <span>{item.instrument.symbol}</span>
                <span>{item.overlapCount}</span>
              </div>
            ))}
            {topConfluence.length === 0 ? <p className="text-slate-500">No confluence records.</p> : null}
          </div>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Watchlist Delta</CardTitle>
          </CardHeader>
          <div className="space-y-2 text-sm">
            <p>Added: {watchlistDelta.added}</p>
            <p>Removed: {watchlistDelta.removed}</p>
            <p>Invalidated: {watchlistDelta.invalidated}</p>
          </div>
        </Card>
      </div>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Manual Review Needed</CardTitle>
          <CardDescription>Ambiguity or incomplete-signal queue.</CardDescription>
        </CardHeader>
        <div className="space-y-2 text-sm">
          {reviewQueue.map((item) => (
            <div key={item.id} className="rounded-md border border-slate-200 p-2.5">
              <p>{item.instrument.symbol} • {item.strategy.name}</p>
              <p className="text-xs text-slate-500">{item.explanation ?? "No explanation"}</p>
            </div>
          ))}
          {reviewQueue.length === 0 ? <p className="text-slate-500">No manual review items.</p> : null}
        </div>
      </Card>
    </>
  );
}
