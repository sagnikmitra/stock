import { prisma } from "@ibo/db";
import type { Prisma } from "@ibo/db";

export interface CronLockResult {
  canRun: boolean;
  lockKey: string;
  lockEventId?: string;
  reason?: string;
}

function lockKeyFor(jobKey: string, marketDate: string): string {
  return `${jobKey}:${marketDate}`;
}

export async function acquireCronLock(input: {
  jobKey: string;
  marketDate: string;
  force: boolean;
}): Promise<CronLockResult> {
  const lockKey = lockKeyFor(input.jobKey, input.marketDate);
  const parsedDate = new Date(`${input.marketDate}T00:00:00.000Z`);

  if (!input.force) {
    const existing = await prisma.cronJobLock.findUnique({
      where: {
        jobKey_marketDate: {
          jobKey: input.jobKey,
          marketDate: parsedDate,
        },
      },
    });

    if (existing) {
      if (existing.status === "completed") {
        return {
          canRun: false,
          lockKey,
          reason: "already_completed",
        };
      }

      const thirtyMinutesAgo = new Date(Date.now() - 30 * 60 * 1000);
      if (existing.status === "running" && existing.lockedAt > thirtyMinutesAgo) {
        return {
          canRun: false,
          lockKey,
          reason: "locked",
        };
      }
    }
  } else {
    // Audit force rerun
    await prisma.auditEvent.create({
      data: {
        actor: "admin",
        action: "cron_force_rerun_requested",
        entityType: "CronJob",
        entityId: lockKey,
        details: { jobKey: input.jobKey, marketDate: input.marketDate },
      },
    });
  }

  // Atomically upsert the lock
  const lock = await prisma.cronJobLock.upsert({
    where: {
      jobKey_marketDate: {
        jobKey: input.jobKey,
        marketDate: parsedDate,
      },
    },
    update: {
      status: "running",
      lockedAt: new Date(),
    },
    create: {
      jobKey: input.jobKey,
      marketDate: parsedDate,
      status: "running",
      lockedAt: new Date(),
    },
  });

  // Retain audit event for observability only
  await prisma.auditEvent.create({
    data: {
      actor: "system",
      action: "cron_lock_acquired",
      entityType: "CronJob",
      entityId: lockKey,
      details: {
        jobKey: input.jobKey,
        marketDate: input.marketDate,
      },
    },
  });

  return {
    canRun: true,
    lockKey,
    lockEventId: lock.id,
  };
}

export async function releaseCronLock(input: {
  lockKey: string;
  status: "completed" | "failed";
  details?: Record<string, unknown>;
}) {
  const [jobKey, marketDateStr] = input.lockKey.split(":");
  const parsedDate = new Date(`${marketDateStr}T00:00:00.000Z`);

  await prisma.cronJobLock.update({
    where: {
      jobKey_marketDate: {
        jobKey: jobKey!,
        marketDate: parsedDate,
      },
    },
    data: {
      status: input.status,
      details: input.details as Prisma.InputJsonValue | undefined,
    },
  });

  await prisma.auditEvent.create({
    data: {
      actor: "system",
      action: input.status === "completed" ? "cron_completed" : "cron_failed",
      entityType: "CronJob",
      entityId: input.lockKey,
      details: input.details as Prisma.InputJsonValue | undefined,
    },
  });
}

export async function withRetries<T>(
  fn: () => Promise<T>,
  attempts = 2,
): Promise<T> {
  let lastError: unknown;
  for (let attempt = 1; attempt <= attempts; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      if (attempt < attempts) {
        await new Promise((resolve) => setTimeout(resolve, 350 * attempt));
      }
    }
  }
  throw lastError;
}
