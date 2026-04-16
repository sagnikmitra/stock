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

  if (!input.force) {
    const completed = await prisma.auditEvent.findFirst({
      where: {
        action: "cron_completed",
        entityType: "CronJob",
        entityId: lockKey,
      },
      orderBy: { createdAt: "desc" },
    });
    if (completed) {
      return {
        canRun: false,
        lockKey,
        reason: "already_completed",
      };
    }
  } else {
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

  const now = new Date();
  const thirtyMinutesAgo = new Date(now.getTime() - 30 * 60 * 1000);
  const activeLock = await prisma.auditEvent.findFirst({
    where: {
      action: "cron_lock_acquired",
      entityType: "CronJob",
      entityId: lockKey,
      createdAt: { gte: thirtyMinutesAgo },
    },
    orderBy: { createdAt: "desc" },
  });

  if (activeLock && !input.force) {
    return {
      canRun: false,
      lockKey,
      reason: "locked",
    };
  }

  const lock = await prisma.auditEvent.create({
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
