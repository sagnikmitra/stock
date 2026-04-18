import { prisma } from "@ibo/db";
import { Card, CardHeader, CardTitle, CardDescription } from "../../components/ui/card";
import { Badge } from "../../components/ui/badge";
import { PageHeader } from "../../components/ui/page-header";

export const revalidate = 30; // Cache for 30s — data changes only on pipeline/admin runs

export default async function AdminObservabilityPage() {
  const since = new Date(Date.now() - 24 * 60 * 60 * 1000);

  const [auditEvents, providerRuns] = await Promise.all([
    prisma.auditEvent.findMany({
      where: { createdAt: { gte: since } },
      orderBy: { createdAt: "desc" },
      take: 100,
    }),
    prisma.providerJobRun.findMany({
      where: { startedAt: { gte: since } },
      include: { provider: true },
      orderBy: { startedAt: "desc" },
      take: 100,
    }),
  ]);

  const degradedCount = auditEvents.filter((event) => event.action === "digest_degraded_mode").length;
  const cronFailCount = auditEvents.filter((event) => event.action === "cron_failed").length;
  const backtestFailCount = auditEvents.filter((event) => event.action === "backtest_failed").length;

  return (
    <>
      <PageHeader
        title="Admin: Observability"
        description="Provider health, cron outcomes, degraded digest events, and backtest audit hooks"
      />

      <div className="mb-6 grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Degraded Digests (24h)</CardTitle>
            <CardDescription>{degradedCount}</CardDescription>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Cron Failures (24h)</CardTitle>
            <CardDescription>{cronFailCount}</CardDescription>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Backtest Failures (24h)</CardTitle>
            <CardDescription>{backtestFailCount}</CardDescription>
          </CardHeader>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Recent Audit Events</CardTitle>
          </CardHeader>
          <div className="space-y-2 text-sm">
            {auditEvents.slice(0, 20).map((event) => (
              <div key={event.id} className="rounded-lg border border-slate-100 p-2">
                <div className="flex items-center justify-between gap-2">
                  <span className="font-medium text-slate-800">{event.action}</span>
                  <Badge variant="muted">{event.createdAt.toISOString().split("T")[0]}</Badge>
                </div>
                <p className="text-xs text-slate-500">
                  {event.entityType ?? "unknown"} / {event.entityId ?? "n/a"}
                </p>
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Provider Runs</CardTitle>
          </CardHeader>
          <div className="space-y-2 text-sm">
            {providerRuns.slice(0, 20).map((run) => (
              <div key={run.id} className="rounded-lg border border-slate-100 p-2">
                <div className="flex items-center justify-between gap-2">
                  <span className="font-medium text-slate-800">{run.provider.name}</span>
                  <Badge variant={run.status === "completed" ? "favorable" : run.status === "failed" ? "hostile" : "mixed"}>{run.status}</Badge>
                </div>
                <p className="text-xs text-slate-500">{run.jobKey}</p>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </>
  );
}
