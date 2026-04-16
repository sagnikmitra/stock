import { NextResponse } from "next/server";
import { prisma } from "@ibo/db";

export async function GET() {
  const since = new Date(Date.now() - 24 * 60 * 60 * 1000);

  const [auditEvents, providerRuns] = await Promise.all([
    prisma.auditEvent.findMany({
      where: {
        createdAt: { gte: since },
        action: {
          in: [
            "cron_completed",
            "cron_failed",
            "digest_degraded_mode",
            "backtest_completed",
            "backtest_failed",
          ],
        },
      },
      orderBy: { createdAt: "desc" },
      take: 200,
    }),
    prisma.providerJobRun.findMany({
      where: { startedAt: { gte: since } },
      include: { provider: { select: { key: true, name: true } } },
      orderBy: { startedAt: "desc" },
      take: 100,
    }),
  ]);

  const counters = auditEvents.reduce<Record<string, number>>((acc, event) => {
    acc[event.action] = (acc[event.action] ?? 0) + 1;
    return acc;
  }, {});

  return NextResponse.json({
    data: {
      windowHours: 24,
      counters,
      latestAuditEvents: auditEvents.slice(0, 50).map((event) => ({
        id: event.id,
        action: event.action,
        entityType: event.entityType,
        entityId: event.entityId,
        createdAt: event.createdAt.toISOString(),
      })),
      providerRuns: providerRuns.map((run) => ({
        id: run.id,
        providerKey: run.provider.key,
        providerName: run.provider.name,
        jobKey: run.jobKey,
        status: run.status,
        startedAt: run.startedAt.toISOString(),
        finishedAt: run.finishedAt?.toISOString() ?? null,
      })),
    },
  });
}
