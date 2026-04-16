import { prisma } from "@ibo/db";
import { Card, CardHeader, CardTitle, CardDescription } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { PageHeader } from "../components/ui/page-header";
import { EducationalDisclaimer } from "../components/ui/educational-disclaimer";
import Link from "next/link";
import { BacktestRunForm } from "./backtest-run-form";

export const dynamic = "force-dynamic";

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
  searchParams: Promise<{ strategyKey?: string }>;
}

export default async function BacktestDashboardPage({ searchParams }: Props) {
  const { strategyKey } = await searchParams;

  const [backtests, strategies] = await Promise.all([
    prisma.backtest.findMany({
      include: {
        strategyVersion: { include: { strategy: true } },
        _count: { select: { trades: true } },
      },
      orderBy: { createdAt: "desc" },
    }),
    prisma.strategy.findMany({ where: { status: "active" }, orderBy: { name: "asc" } }),
  ]);

  return (
    <>
      <PageHeader
        title="Backtester"
        description="Run and review deterministic historical replays for strategy versions"
      />
      <EducationalDisclaimer className="mb-4" />

      <Card className="mb-6">
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

      {backtests.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {backtests.map((backtest) => {
            const metrics = (backtest.summaryJson as BacktestMetrics | null) ?? {};
            const config = backtest.configJson as Record<string, unknown> | null;
            const startDate = config?.startDate as string | undefined;
            const endDate = config?.endDate as string | undefined;

            return (
              <Link key={backtest.id} href={`/backtest/${backtest.id}`}>
                <Card className="transition-colors hover:border-brand-200">
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
