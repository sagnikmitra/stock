import { prisma } from "@ibo/db";
import { notFound } from "next/navigation";
import { Card, CardHeader, CardTitle, CardDescription } from "../../components/ui/card";
import { Badge } from "../../components/ui/badge";
import { PageHeader } from "../../components/ui/page-header";
import { EducationalDisclaimer } from "../../components/ui/educational-disclaimer";
import Link from "next/link";

export const revalidate = 30; // Cache for 30s — data changes only on pipeline/admin runs

interface Props {
  params: Promise<{ id: string }>;
}

type BacktestMetrics = {
  totalTrades?: number;
  winRate?: number;
  avgWin?: number;
  avgLoss?: number;
  expectancy?: number;
  maxDrawdown?: number;
  profitFactor?: number;
  avgHoldDays?: number;
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

export default async function BacktestDetailPage({ params }: Props) {
  const { id } = await params;

  const backtest = await prisma.backtest.findUnique({
    where: { id },
    include: {
      strategyVersion: { include: { strategy: true } },
      trades: {
        include: { instrument: true },
        orderBy: { entryDate: "asc" },
      },
      metrics: true,
    },
  });

  if (!backtest) notFound();

  const summary = (backtest.summaryJson as BacktestMetrics | null) ?? {};

  // Build a metrics map from BacktestMetric records for any overrides
  const metricMap = new Map(backtest.metrics.map((m) => [m.key, m.value]));

  const displayMetrics: { label: string; value: string; highlight?: boolean }[] = [
    {
      label: "Total Trades",
      value:
        metricMap.get("total_trades") ??
        (summary.totalTrades !== undefined ? String(summary.totalTrades) : String(backtest.trades.length)),
    },
    {
      label: "Win Rate",
      value:
        metricMap.get("win_rate") ??
        (summary.winRate !== undefined ? `${(summary.winRate * 100).toFixed(1)}%` : "—"),
    },
    {
      label: "Avg Win",
      value:
        metricMap.get("avg_win") ??
        (summary.avgWin !== undefined ? `${(summary.avgWin * 100).toFixed(2)}%` : "—"),
    },
    {
      label: "Avg Loss",
      value:
        metricMap.get("avg_loss") ??
        (summary.avgLoss !== undefined ? `${(summary.avgLoss * 100).toFixed(2)}%` : "—"),
      highlight: true,
    },
    {
      label: "Expectancy",
      value:
        metricMap.get("expectancy") ??
        (summary.expectancy !== undefined ? summary.expectancy.toFixed(4) : "—"),
    },
    {
      label: "Max Drawdown",
      value:
        metricMap.get("max_drawdown") ??
        (summary.maxDrawdown !== undefined ? `${(summary.maxDrawdown * 100).toFixed(1)}%` : "—"),
      highlight: true,
    },
    {
      label: "Profit Factor",
      value:
        metricMap.get("profit_factor") ??
        (summary.profitFactor !== undefined ? summary.profitFactor.toFixed(2) : "—"),
    },
    {
      label: "Avg Hold Days",
      value:
        metricMap.get("avg_hold_days") ??
        (summary.avgHoldDays !== undefined ? `${summary.avgHoldDays.toFixed(1)} days` : "—"),
    },
  ];

  return (
    <>
      <PageHeader
        title={backtest.name}
        description={`${backtest.strategyVersion.strategy.name} (v${backtest.strategyVersion.version})`}
      >
        <Link
          href="/backtest"
          className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50"
        >
          All Backtests
        </Link>
      </PageHeader>
      <EducationalDisclaimer className="mb-4" />

      <div className="mb-4 flex flex-wrap gap-2">
        <Badge variant={statusVariant(backtest.status)}>{backtest.status}</Badge>
        <Badge variant="muted">{backtest.mode}</Badge>
        {backtest.startedAt && (
          <Badge variant="muted">
            Started: {backtest.startedAt.toISOString().split("T")[0]}
          </Badge>
        )}
        {backtest.finishedAt && (
          <Badge variant="muted">
            Finished: {backtest.finishedAt.toISOString().split("T")[0]}
          </Badge>
        )}
      </div>

      {/* Metrics Summary Cards */}
      <div className="mb-6 grid gap-4 sm:grid-cols-2 md:grid-cols-4">
        {displayMetrics.map((m) => (
          <Card key={m.label}>
            <p className="text-xs font-medium text-slate-400">{m.label}</p>
            <p
              className={`mt-1 text-lg font-semibold ${m.highlight ? "text-red-600" : "text-slate-900"}`}
            >
              {m.value}
            </p>
          </Card>
        ))}
      </div>

      {/* Trade List */}
      <Card>
        <CardHeader>
          <CardTitle>Trades</CardTitle>
          <CardDescription>{backtest.trades.length} total trades</CardDescription>
        </CardHeader>
        {backtest.trades.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 text-left text-xs font-semibold uppercase text-slate-400">
                  <th className="px-3 py-2">Symbol</th>
                  <th className="px-3 py-2">Entry Date</th>
                  <th className="px-3 py-2">Exit Date</th>
                  <th className="px-3 py-2 text-right">Entry Price</th>
                  <th className="px-3 py-2 text-right">Exit Price</th>
                  <th className="px-3 py-2 text-right">PnL</th>
                  <th className="px-3 py-2 text-right">PnL %</th>
                  <th className="px-3 py-2 text-right">Hold Days</th>
                </tr>
              </thead>
              <tbody>
                {backtest.trades.map((trade) => {
                  const pnlPct = trade.pnlPct ? Number(trade.pnlPct) : null;
                  const isWin = pnlPct !== null && pnlPct >= 0;
                  const holdDays =
                    trade.entryDate && trade.exitDate
                      ? Math.round(
                          (trade.exitDate.getTime() - trade.entryDate.getTime()) /
                            (1000 * 60 * 60 * 24),
                        )
                      : null;

                  return (
                    <tr
                      key={trade.id}
                      className="border-b border-slate-50 hover:bg-slate-50"
                    >
                      <td className="px-3 py-2">
                        {trade.instrument ? (
                          <Link
                            href={`/stocks/${trade.instrument.symbol}`}
                            className="font-medium text-brand-600 hover:underline"
                          >
                            {trade.instrument.symbol}
                          </Link>
                        ) : (
                          <span className="text-slate-400">—</span>
                        )}
                      </td>
                      <td className="px-3 py-2 text-slate-600">
                        {trade.entryDate
                          ? trade.entryDate.toISOString().split("T")[0]
                          : "—"}
                      </td>
                      <td className="px-3 py-2 text-slate-600">
                        {trade.exitDate
                          ? trade.exitDate.toISOString().split("T")[0]
                          : "—"}
                      </td>
                      <td className="px-3 py-2 text-right font-mono">
                        {trade.entryPrice ? Number(trade.entryPrice).toFixed(2) : "—"}
                      </td>
                      <td className="px-3 py-2 text-right font-mono">
                        {trade.exitPrice ? Number(trade.exitPrice).toFixed(2) : "—"}
                      </td>
                      <td
                        className={`px-3 py-2 text-right font-mono ${
                          trade.pnlAbs
                            ? Number(trade.pnlAbs) >= 0
                              ? "text-green-600"
                              : "text-red-600"
                            : "text-slate-400"
                        }`}
                      >
                        {trade.pnlAbs ? Number(trade.pnlAbs).toFixed(2) : "—"}
                      </td>
                      <td
                        className={`px-3 py-2 text-right font-mono ${
                          pnlPct !== null
                            ? isWin
                              ? "text-green-600"
                              : "text-red-600"
                            : "text-slate-400"
                        }`}
                      >
                        {pnlPct !== null
                          ? `${isWin ? "+" : ""}${pnlPct.toFixed(2)}%`
                          : "—"}
                      </td>
                      <td className="px-3 py-2 text-right text-slate-600">
                        {holdDays !== null ? holdDays : "—"}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-sm text-slate-400">No trades recorded for this backtest.</p>
        )}
      </Card>
    </>
  );
}
