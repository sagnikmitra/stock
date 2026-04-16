import { getDatabaseUnavailableReason, isDatabaseConfigured, prisma } from "@ibo/db";
import { nseCalendar } from "@ibo/utils";
import { Card, CardHeader, CardTitle, CardDescription } from "./components/ui/card";
import { Badge } from "./components/ui/badge";
import { PostureIndicator } from "./components/ui/posture-indicator";
import { PageHeader } from "./components/ui/page-header";
import { EducationalDisclaimer } from "./components/ui/educational-disclaimer";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  let strategies: Awaited<ReturnType<typeof prisma.strategy.findMany>> = [];
  let screeners: Awaited<ReturnType<typeof prisma.screener.findMany>> = [];
  let ambiguities: Awaited<ReturnType<typeof prisma.ambiguityRecord.findMany>> = [];
  let flags: Awaited<ReturnType<typeof prisma.featureFlag.findMany>> = [];
  let recentDigest: Awaited<ReturnType<typeof prisma.digest.findFirst>> = null;
  let databaseWarning = "";
  let latestProviderRuns: Array<any> = [];
  let topConfluence: Array<any> = [];
  let watchlistDelta = { added: 0, removed: 0, invalidated: 0 };
  let reviewQueue: Array<any> = [];
  let monthEndReminder = false;
  let lastRefresh: Date | null = null;

  if (isDatabaseConfigured) {
    try {
      [strategies, screeners, ambiguities, flags, recentDigest, latestProviderRuns, topConfluence, reviewQueue] = await Promise.all([
        prisma.strategy.findMany({
          where: { status: "active" },
          include: { _count: { select: { results: true } } },
          orderBy: { family: "asc" },
        }),
        prisma.screener.findMany({ orderBy: { name: "asc" } }),
        prisma.ambiguityRecord.findMany({ where: { severity: "high" } }),
        prisma.featureFlag.findMany({ where: { isEnabled: true } }),
        prisma.digest.findFirst({ orderBy: { marketDate: "desc" } }),
        prisma.providerJobRun.findMany({
          orderBy: { startedAt: "desc" },
          include: { provider: true },
          take: 8,
        }),
        prisma.confluenceResult.findMany({
          include: { instrument: { select: { symbol: true, companyName: true } } },
          orderBy: [{ marketDate: "desc" }, { overlapCount: "desc" }],
          take: 10,
        }),
        prisma.strategyResult.findMany({
          where: { OR: [{ matched: false }, { explanation: { contains: "ambig", mode: "insensitive" } }] },
          include: { instrument: { select: { symbol: true } }, strategy: { select: { name: true } } },
          orderBy: { createdAt: "desc" },
          take: 12,
        }),
      ]);

      const watchlistRecentAdds = await prisma.watchlistItem.count({
        where: { addedAt: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) } },
      });
      const watchlistInvalidated = await prisma.watchlistItem.count({ where: { isActive: false } });
      watchlistDelta = { added: watchlistRecentAdds, removed: 0, invalidated: watchlistInvalidated };
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
      <PageHeader
        title="Dashboard"
        description="Your daily market operating system"
      />
      <EducationalDisclaimer className="mb-4" />

      <div className="mb-4 rounded-xl border border-slate-200 bg-white p-3 text-sm text-slate-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200">
        <p>Last refresh: {lastRefresh ? lastRefresh.toISOString() : "Unknown"}</p>
        {lastRefresh ? null : <p className="text-xs text-amber-600">Data freshness warning: no recent digest timestamp found.</p>}
      </div>

      {monthEndReminder ? (
        <div className="mb-4 rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
          Month-end reminder: within 3 trading days of month-end review window.
        </div>
      ) : null}

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
        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500">Market Posture</p>
              <p className="mt-1 text-xs text-slate-400">
                Awaiting market data. Connect a provider to see live context.
              </p>
            </div>
            <PostureIndicator posture="mixed" score={0} />
          </div>
        </Card>
      </div>

      {/* Strategy Radar */}
      <div className="mb-6 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
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
                className="flex items-center justify-between rounded-lg px-3 py-2 text-sm hover:bg-slate-50"
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
                className="flex items-center justify-between rounded-lg px-3 py-2 text-sm hover:bg-slate-50"
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

        <Card>
          <CardHeader>
            <CardTitle>Quick Stats</CardTitle>
          </CardHeader>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-slate-500">Active Strategies</span>
              <span className="font-semibold">{strategies.length}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Screeners</span>
              <span className="font-semibold">{screeners.length}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">High Ambiguities</span>
              <span className="font-semibold text-orange-600">{ambiguities.length}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Enabled Features</span>
              <span className="font-semibold">{flags.length}</span>
            </div>
          </div>
        </Card>
      </div>

      {/* Digest Highlights */}
      <Card className="mb-6">
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
              <div key={run.id} className="flex items-center justify-between rounded border border-slate-100 px-2 py-1 dark:border-slate-700">
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
              <div key={item.id} className="flex items-center justify-between rounded border border-slate-100 px-2 py-1 dark:border-slate-700">
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
            <div key={item.id} className="rounded border border-slate-100 p-2 dark:border-slate-700">
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
