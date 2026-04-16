import { getDatabaseUnavailableReason, isDatabaseConfigured, prisma } from "@ibo/db";
import { Card, CardHeader, CardTitle, CardDescription } from "./components/ui/card";
import { Badge } from "./components/ui/badge";
import { PostureIndicator } from "./components/ui/posture-indicator";
import { PageHeader } from "./components/ui/page-header";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  let strategies: Awaited<ReturnType<typeof prisma.strategy.findMany>> = [];
  let screeners: Awaited<ReturnType<typeof prisma.screener.findMany>> = [];
  let ambiguities: Awaited<ReturnType<typeof prisma.ambiguityRecord.findMany>> = [];
  let flags: Awaited<ReturnType<typeof prisma.featureFlag.findMany>> = [];
  let recentDigest: Awaited<ReturnType<typeof prisma.digest.findFirst>> = null;
  let databaseWarning = "";

  if (isDatabaseConfigured) {
    try {
      [strategies, screeners, ambiguities, flags, recentDigest] = await Promise.all([
        prisma.strategy.findMany({
          where: { status: "active" },
          include: { _count: { select: { results: true } } },
          orderBy: { family: "asc" },
        }),
        prisma.screener.findMany({ orderBy: { name: "asc" } }),
        prisma.ambiguityRecord.findMany({ where: { severity: "high" } }),
        prisma.featureFlag.findMany({ where: { isEnabled: true } }),
        prisma.digest.findFirst({ orderBy: { marketDate: "desc" } }),
      ]);
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
      <Card>
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
    </>
  );
}
