import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient | undefined };

export const isDatabaseConfigured = Boolean(process.env.DATABASE_URL);

export function getDatabaseUnavailableReason(error?: unknown) {
  if (!isDatabaseConfigured) {
    return "Set DATABASE_URL in .env.local or .env to enable database-backed pages.";
  }

  if (error instanceof Error && error.message.trim()) {
    return error.message;
  }

  return "Database unavailable. Check DATABASE_URL and confirm PostgreSQL is running.";
}

const readFallbackByOperation: Record<string, unknown> = {
  findMany: [],
  findFirst: null,
  findUnique: null,
  findFirstOrThrow: null,
  findUniqueOrThrow: null,
  count: 0,
  aggregate: {},
  groupBy: [],
};

const makeModelProxy = () =>
  new Proxy(
    {},
    {
      get(_modelTarget, operation) {
        if (typeof operation !== "string") return undefined;

        return async () => {
          if (operation in readFallbackByOperation) {
            return readFallbackByOperation[operation];
          }

          throw new Error(getDatabaseUnavailableReason());
        };
      },
    },
  );

const makePrismaMock = () =>
  new Proxy(
    {},
    {
      get(_target, prop) {
        if (prop === "$connect" || prop === "$disconnect") {
          return async () => undefined;
        }

        if (prop === "$transaction") {
          return async () => [];
        }

        if (typeof prop !== "string") return undefined;
        return makeModelProxy();
      },
    },
  ) as PrismaClient;

export const prisma = isDatabaseConfigured
  ? globalForPrisma.prisma ??
    new PrismaClient({
      log: process.env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
    })
  : makePrismaMock();

if (process.env.NODE_ENV !== "production") {
  if (isDatabaseConfigured) {
    globalForPrisma.prisma = prisma;
  }
}

export { PrismaClient };
export type * from "@prisma/client";
