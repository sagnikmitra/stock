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

// Build datasource URL with pool tuning. Injects params only if not already present.
function buildDatasourceUrl(): string | undefined {
  const base = process.env.DATABASE_URL;
  if (!base) return undefined;
  try {
    const url = new URL(base);
    if (!url.searchParams.has("connection_limit")) url.searchParams.set("connection_limit", "5");
    if (!url.searchParams.has("pool_timeout")) url.searchParams.set("pool_timeout", "20");
    return url.toString();
  } catch {
    return base;
  }
}

export const prisma = isDatabaseConfigured
  ? globalForPrisma.prisma ??
    new PrismaClient({
      datasources: { db: { url: buildDatasourceUrl() } },
      // Disable query logging — it serializes every SQL string to stdout which
      // adds measurable per-request CPU overhead. Use warn+error only.
      log: process.env.NODE_ENV === "development" ? ["warn", "error"] : ["error"],
    })
  : makePrismaMock();

if (process.env.NODE_ENV !== "production") {
  if (isDatabaseConfigured) {
    globalForPrisma.prisma = prisma;
  }
}

export { PrismaClient };
export type * from "@prisma/client";
