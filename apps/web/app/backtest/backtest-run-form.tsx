"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";

type StrategyOption = {
  key: string;
  name: string;
};

interface Props {
  strategies: StrategyOption[];
  initialStrategyKey?: string;
}

function todayIso() {
  return new Date().toISOString().split("T")[0];
}

function oneYearAgoIso() {
  const date = new Date();
  date.setUTCFullYear(date.getUTCFullYear() - 1);
  return date.toISOString().split("T")[0];
}

export function BacktestRunForm({ strategies, initialStrategyKey }: Props) {
  const router = useRouter();
  const fallbackStrategy = useMemo(() => initialStrategyKey ?? strategies[0]?.key ?? "", [initialStrategyKey, strategies]);

  const [strategyKey, setStrategyKey] = useState(fallbackStrategy);
  const [startDate, setStartDate] = useState(oneYearAgoIso());
  const [endDate, setEndDate] = useState(todayIso());
  const [capital, setCapital] = useState(500000);
  const [riskPerTradePct, setRiskPerTradePct] = useState(2);
  const [maxOpenPositions, setMaxOpenPositions] = useState(10);
  const [slippageBps, setSlippageBps] = useState(5);
  const [running, setRunning] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setRunning(true);
    setError(null);

    try {
      const response = await fetch("/api/backtests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          strategyKey,
          startDate,
          endDate,
          universe: "active_nse",
          capital,
          riskPerTradePct,
          maxOpenPositions,
          slippageBps,
        }),
      });
      const payload = await response.json();
      if (!response.ok) {
        throw new Error(payload.error ?? "Failed to run backtest.");
      }

      const backtestId = payload.data?.backtestId;
      if (!backtestId) throw new Error("Backtest completed without ID.");
      router.push(`/backtest/${backtestId}`);
      router.refresh();
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Failed to run backtest.");
      setRunning(false);
    }
  };

  return (
    <form className="grid gap-3 md:grid-cols-2" onSubmit={onSubmit}>
      <label className="text-sm">
        Strategy
        <select
          value={strategyKey}
          onChange={(event) => setStrategyKey(event.target.value)}
          className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2"
          required
        >
          {strategies.map((strategy) => (
            <option key={strategy.key} value={strategy.key}>
              {strategy.name}
            </option>
          ))}
        </select>
      </label>

      <label className="text-sm">
        Capital (₹)
        <input
          type="number"
          value={capital}
          onChange={(event) => setCapital(Number(event.target.value))}
          className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2"
          min={1000}
          required
        />
      </label>

      <label className="text-sm">
        Start Date
        <input
          type="date"
          value={startDate}
          onChange={(event) => setStartDate(event.target.value)}
          className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2"
          required
        />
      </label>

      <label className="text-sm">
        End Date
        <input
          type="date"
          value={endDate}
          onChange={(event) => setEndDate(event.target.value)}
          className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2"
          required
        />
      </label>

      <label className="text-sm">
        Risk Per Trade (%)
        <input
          type="number"
          value={riskPerTradePct}
          onChange={(event) => setRiskPerTradePct(Number(event.target.value))}
          className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2"
          min={0.1}
          max={10}
          step={0.1}
          required
        />
      </label>

      <label className="text-sm">
        Max Open Positions
        <input
          type="number"
          value={maxOpenPositions}
          onChange={(event) => setMaxOpenPositions(Number(event.target.value))}
          className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2"
          min={1}
          max={50}
          required
        />
      </label>

      <label className="text-sm md:col-span-2">
        Slippage (bps)
        <input
          type="number"
          value={slippageBps}
          onChange={(event) => setSlippageBps(Number(event.target.value))}
          className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2"
          min={0}
          max={100}
          required
        />
      </label>

      <div className="md:col-span-2">
        <button
          type="submit"
          disabled={running}
          className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {running ? "Running..." : "Run Backtest"}
        </button>
      </div>

      {error ? <p className="md:col-span-2 text-sm text-red-600">{error}</p> : null}
    </form>
  );
}
