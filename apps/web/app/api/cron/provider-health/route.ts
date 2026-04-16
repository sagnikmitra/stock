import { NextResponse } from "next/server";
import { prisma } from "@ibo/db";
import { acquireCronLock, releaseCronLock, withRetries } from "../_scheduler";

/**
 * Provider health check — runs every 30 minutes
 * Pings each enabled provider's health endpoint.
 */
export async function GET(req: Request) {
  const authHeader = req.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const force = searchParams.get("force") === "1";
  const retryAttempts = Number(searchParams.get("attempts") ?? 1);
  const marketDate = new Date().toISOString().split("T")[0];
  const lock = await acquireCronLock({
    jobKey: "provider_health",
    marketDate,
    force,
  });
  if (!lock.canRun) {
    return NextResponse.json({
      data: {
        status: "skipped",
        reason: lock.reason,
      },
    });
  }

  try {
    const result = await withRetries(async () => {
      const providers = await prisma.provider.findMany({
        where: { isEnabled: true },
      });

      const results: { key: string; healthy: boolean; latencyMs: number | null }[] = [];

      for (const provider of providers) {
        if (!provider.baseUrl) {
          results.push({ key: provider.key, healthy: true, latencyMs: null });
          continue;
        }

        const start = Date.now();
        try {
          const res = await fetch(provider.baseUrl, {
            method: "HEAD",
            signal: AbortSignal.timeout(5000),
          });
          results.push({
            key: provider.key,
            healthy: res.ok,
            latencyMs: Date.now() - start,
          });
        } catch {
          results.push({
            key: provider.key,
            healthy: false,
            latencyMs: Date.now() - start,
          });
        }
      }

      return results;
    }, Number.isFinite(retryAttempts) && retryAttempts > 0 ? retryAttempts : 1);

    await releaseCronLock({
      lockKey: lock.lockKey,
      status: "completed",
      details: {
        checkedProviders: result.length,
      },
    });

    return NextResponse.json({ data: { checkedAt: new Date().toISOString(), results: result } });
  } catch (error) {
    await releaseCronLock({
      lockKey: lock.lockKey,
      status: "failed",
      details: {
        error: error instanceof Error ? error.message : "Unknown error",
      },
    });
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
