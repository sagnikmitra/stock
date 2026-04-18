import { prisma } from "@ibo/db";
import { Card, CardHeader, CardTitle, CardDescription } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { PageHeader } from "../components/ui/page-header";
import { EducationalDisclaimer } from "../components/ui/educational-disclaimer";
import Link from "next/link";
import { BacktestRunForm } from "./backtest-run-form";

export const revalidate = 30; // Cache for 30s — data changes only on pipeline/admin runs

type BacktestMetrics = {
  winRate?: number;
  profitFactor?: number;
  maxDrawdown?: number;
};

const statusVariant = (status: string) => {
  switch (status) {
    case "completed":
      return "favorable" as const;
    case "running":
      return "investment" as const;
    case "failed":
      return "hostile" as const;
    case "partial":
      return "mixed" as const;
    default:
      return "muted" as const;
  }
};

interface Props {
  searchParams: Promise<{ strategyKey?: string; page?: string }>;
}

export default async function BacktestDashboardPage({ searchParams }: Props) {
  const { strategyKey, page } = await searchParams;
  const pageNumber = Math.max(1, Number.parseInt(page ?? "1", 10) || 1);
  const pageSize = 36;
  const skip = (pageNumber - 1) * pageSize;

  const [backtests, backtestCount, strategies] = await Promise.all([
    prisma.backtest.findMany({
      include: {
        strategyVersion: { include: { strategy: true } },
        _count: { select: { trades: true } },
      },
      orderBy: { createdAt: "desc" },
      skip,
      take: pageSize,
    }),
    prisma.backtest.count(),
    prisma.strategy.findMany({ where: { status: "active" }, orderBy: { name: "asc" } }),
  ]);
  const totalPages = Math.max(1, Math.ceil(backtestCount / pageSize));
  const prevPage = pageNumber > 1 ? pageNumber - 1 : null;
  const nextPage = pageNumber < totalPages ? pageNumber + 1 : null;

  return (
    <>
      <PageHeader
        title="Backtester"
        description="Deterministic historical replay console for strategy-level validation."
      />
      <EducationalDisclaimer className="mb-4" />

      <Card className="mb-6 bg-gradient-to-r from-white/92 to-cyan-50/55">
        <CardHeader>
          <CardTitle>Run New Backtest</CardTitle>
          <CardDescription>
            Event-replay mode. Results are deterministic for identical data windows and strategy versions.
          </CardDescription>
        </CardHeader>
        <BacktestRunForm
          strategies={strategies.map((strategy) => ({ key: strategy.key, name: strategy.name }))}
          initialStrategyKey={strategyKey}
        />
      </Card>

      <div className="mb-4 flex items-center justify-between rounded-2xl border border-slate-200/80 bg-white/88 p-3 text-sm text-slate-600 shadow-[0_8px_20px_rgba(15,23,42,0.06)]">
        <p>
          Showing page {pageNumber} of {totalPages} ({backtestCount} backtests)
        </p>
        <div className="flex items-center gap-2">
          {prevPage ? (
            <Link
              href={`/backtest?page=${prevPage}${strategyKey ? `&strategyKey=${strategyKey}` : ""}`}
              className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold hover:bg-slate-50"
            >
              Previous
            </Link>
          ) : null}
          {nextPage ? (
            <Link
              href={`/backtest?page=${nextPage}${strategyKey ? `&strategyKey=${strategyKey}` : ""}`}
              className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold hover:bg-slate-50"
            >
              Next
            </Link>
          ) : null}
        </div>
      </div>

      {backtests.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {backtests.map((backtest) => {
            const metrics = (backtest.summaryJson as BacktestMetrics | null) ?? {};
            const config = backtest.configJson as Record<string, unknown> | null;
            const startDate = config?.startDate as string | undefined;
            const endDate = config?.endDate as string | undefined;

            return (
              <Link key={backtest.id} href={`/backtest/${backtest.id}`}>
                <Card className="border-slate-200/70 bg-white/86">
                  <CardHeader>
                    <CardTitle>{backtest.name}</CardTitle>
                    <CardDescription>
                      {backtest.strategyVersion.strategy.name} (v{backtest.strategyVersion.version})
                    </CardDescription>
                  </CardHeader>

                  <div className="mb-3 flex flex-wrap gap-2">
                    <Badge variant={statusVariant(backtest.status)}>{backtest.status}</Badge>
                    <Badge variant="muted">{backtest.mode}</Badge>
                    <Badge variant="muted">{backtest._count.trades} trades</Badge>
                  </div>

                  {startDate && endDate ? (
                    <p className="mb-3 text-xs text-slate-400">
                      {startDate} to {endDate}
                    </p>
                  ) : null}

                  <div className="grid grid-cols-3 gap-2 text-center text-xs">
                    <div>
                      <p className="text-slate-400">Win Rate</p>
                      <p className="font-semibold">
                        {metrics.winRate !== undefined ? `${(metrics.winRate * 100).toFixed(1)}%` : "—"}
                      </p>
                    </div>
                    <div>
                      <p className="text-slate-400">Profit Factor</p>
                      <p className="font-semibold">
                        {metrics.profitFactor !== undefined ? metrics.profitFactor.toFixed(2) : "—"}
                      </p>
                    </div>
                    <div>
                      <p className="text-slate-400">Max Drawdown</p>
                      <p className="font-semibold text-red-600">
                        {metrics.maxDrawdown !== undefined ? `${(metrics.maxDrawdown * 100).toFixed(1)}%` : "—"}
                      </p>
                    </div>
                  </div>
                </Card>
              </Link>
            );
          })}
        </div>
      ) : (
        <Card>
          <p className="text-sm text-slate-400">No backtests found yet. Run one using the form above.</p>
        </Card>
      )}
    </>
  );
}
