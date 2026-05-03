"use client";

import { useMemo, useState } from "react";
import { useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { PageHeader } from "../../../components/ui/page-header";

type BacktestResponse = {
  backtestId: string;
  metrics: {
    totalTrades: number;
    winRate: number;
    maxDrawdown: number;
    profitFactor: number;
    expectancy: number;
  };
};

type StrategySummary = {
  name: string;
  family: string;
};

type BacktestDetail = {
  winLoss: { wins: number; losses: number };
  trades: Array<{
    id: string;
    symbol: string;
    entryDate: string | null;
    exitDate: string | null;
    entryPrice: number | null;
    exitPrice: number | null;
    pnlPct: number;
  }>;
};

export default function StrategyBacktestPage() {
  const params = useParams<{ strategyKey: string }>();
  const strategyKey = useMemo(() => String(params.strategyKey), [params.strategyKey]);
  const [form, setForm] = useState({
    startDate: "2024-01-01",
    endDate: new Date().toISOString().split("T")[0],
    capital: 500000,
    riskPerTradePct: 2,
    maxOpenPositions: 10,
    slippageBps: 5,
  });
  const [result, setResult] = useState<BacktestResponse | null>(null);
  const [strategy, setStrategy] = useState<StrategySummary | null>(null);
  const [detail, setDetail] = useState<BacktestDetail | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      const response = await fetch(`/api/strategies/${strategyKey}`);
      const payload = await response.json();
      if (response.ok && payload.data) {
        setStrategy({ name: payload.data.name, family: payload.data.family });
      }
    };
    void load();
  }, [strategyKey]);

  async function runBacktest() {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/strategies/${strategyKey}/backtest`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error ?? "Backtest failed");
      setResult(payload.data);

      const detailResponse = await fetch(`/api/backtests/${payload.data.backtestId}`);
      const detailPayload = await detailResponse.json();
      if (detailResponse.ok && detailPayload.data) {
        setDetail({
          winLoss: detailPayload.data.winLoss,
          trades: detailPayload.data.trades,
        });
      } else {
        setDetail(null);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Backtest failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={`${strategy?.name ?? strategyKey} Backtest`}
        description="Run an educational simulation against historical strategy rules."
      />

      <div className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-800">
        <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">{strategy?.name ?? strategyKey}</p>
        <p className="text-xs text-slate-500">Family: {strategy?.family ?? "loading"}</p>
        <p className="text-sm text-slate-500">Educational simulation only. Not investment advice.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <label className="text-sm">
          Start Date
          <input className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2" type="date" value={form.startDate} onChange={(e) => setForm({ ...form, startDate: e.target.value })} />
        </label>
        <label className="text-sm">
          End Date
          <input className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2" type="date" value={form.endDate} onChange={(e) => setForm({ ...form, endDate: e.target.value })} />
        </label>
        <label className="text-sm">
          Capital
          <input className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2" type="number" value={form.capital} onChange={(e) => setForm({ ...form, capital: Number(e.target.value) })} />
        </label>
        <label className="text-sm">
          Risk % per Trade
          <input className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2" type="number" step="0.1" value={form.riskPerTradePct} onChange={(e) => setForm({ ...form, riskPerTradePct: Number(e.target.value) })} />
        </label>
        <label className="text-sm">
          Max Open Positions
          <input className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2" type="number" value={form.maxOpenPositions} onChange={(e) => setForm({ ...form, maxOpenPositions: Number(e.target.value) })} />
        </label>
        <label className="text-sm">
          Slippage (bps)
          <input className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2" type="number" value={form.slippageBps} onChange={(e) => setForm({ ...form, slippageBps: Number(e.target.value) })} />
        </label>
      </div>

      <button type="button" onClick={runBacktest} disabled={loading} className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700 disabled:opacity-60">
        {loading ? "Running..." : "Run Backtest"}
      </button>

      {error ? <p className="text-sm text-red-600">{error}</p> : null}

      {result ? (
        <div className="space-y-3 rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-800">
          <h2 className="text-lg font-semibold">Results</h2>
          <table className="w-full text-sm">
            <tbody>
              <tr><td>Total Trades</td><td className="text-right">{result.metrics.totalTrades}</td></tr>
              <tr><td>Win Rate</td><td className="text-right">{(result.metrics.winRate * 100).toFixed(2)}%</td></tr>
              <tr><td>Max Drawdown</td><td className="text-right">{result.metrics.maxDrawdown.toFixed(2)}</td></tr>
              <tr><td>Profit Factor</td><td className="text-right">{result.metrics.profitFactor.toFixed(2)}</td></tr>
              <tr><td>Expectancy</td><td className="text-right">{result.metrics.expectancy.toFixed(4)}</td></tr>
            </tbody>
          </table>
          {detail ? (
            <div className="rounded-lg border border-slate-200 p-3 text-sm dark:border-slate-700">
              <p className="font-medium">Win/Loss Summary</p>
              <p className="text-slate-600 dark:text-slate-300">Wins: {detail.winLoss.wins} • Losses: {detail.winLoss.losses}</p>
            </div>
          ) : null}
          {detail?.trades?.length ? (
            <div>
              <p className="mb-2 text-sm font-medium">Recent Trades</p>
              <div className="max-h-72 overflow-auto rounded border border-slate-200 dark:border-slate-700">
                <table className="w-full text-xs">
                  <thead className="bg-slate-50 dark:bg-slate-900">
                    <tr>
                      <th className="px-2 py-1 text-left">Symbol</th>
                      <th className="px-2 py-1 text-left">Entry</th>
                      <th className="px-2 py-1 text-left">Exit</th>
                      <th className="px-2 py-1 text-right">PnL%</th>
                    </tr>
                  </thead>
                  <tbody>
                    {detail.trades.slice(0, 50).map((trade) => (
                      <tr key={trade.id} className="border-t border-slate-100 dark:border-slate-800">
                        <td className="px-2 py-1">{trade.symbol}</td>
                        <td className="px-2 py-1">{trade.entryDate ?? "—"}</td>
                        <td className="px-2 py-1">{trade.exitDate ?? "—"}</td>
                        <td className="px-2 py-1 text-right">{trade.pnlPct.toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : null}
          <Link href={`/backtest/${result.backtestId}`} className="text-sm text-brand-600 hover:underline">Open full backtest report</Link>
        </div>
      ) : null}

      <Link href={`/strategies/${strategyKey}`} className="text-sm text-slate-600 hover:underline">Back to strategy detail</Link>
    </div>
  );
}
