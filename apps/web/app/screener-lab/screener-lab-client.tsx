"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import sampleBuyingGuide from "@/data/sampleBuyingGuide.json";
import {
  formatCurrencyINR,
  formatRange,
  getRewardToRisk,
  getStatusColor,
  getTradeStatus,
} from "@/lib/buying-guide-utils";
import type { BuyingGuide, BuyingGuideStock } from "@/types/buying-guide";

type Mode = "intersection" | "union" | "difference";

type ScreenerOption = {
  key: string;
  name: string;
  isExternalReference: boolean;
};

type RunResult = {
  symbol: string;
  companyName: string;
  overlapCount: number;
  explanation: string;
  confluenceBucket?: string;
  confluenceScore?: number;
  matchedBy: { key: string; label: string }[];
};

interface Props {
  screeners: ScreenerOption[];
}

export function ScreenerLabClient({ screeners }: Props) {
  const internal = useMemo(
    () => screeners.filter((screener) => !screener.isExternalReference),
    [screeners],
  );
  const buyingGuideLookup = useMemo(() => {
    const guide = sampleBuyingGuide as unknown as BuyingGuide;
    return new Map((guide.final_watchlist ?? []).map((stock) => [normalizeSymbol(stock.symbol), stock]));
  }, []);

  const [selected, setSelected] = useState<string[]>([]);
  const [mode, setMode] = useState<Mode>("intersection");
  const [minOverlap, setMinOverlap] = useState<number>(2);
  const [running, setRunning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [results, setResults] = useState<RunResult[]>([]);
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});

  const today = new Date().toISOString().split("T")[0];

  const toggleScreener = (key: string) => {
    setSelected((current) =>
      current.includes(key)
        ? current.filter((item) => item !== key)
        : [...current, key],
    );
  };

  const run = async () => {
    if (selected.length === 0) {
      setError("Select at least one internal screener.");
      return;
    }

    setRunning(true);
    setError(null);

    try {
      const response = await fetch("/api/screeners/run", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          screenerKeys: selected,
          mode,
          minOverlap,
          marketDate: today,
        }),
      });

      const payload = await response.json();
      if (!response.ok) {
        throw new Error(payload.error ?? "Failed to run screener set operation.");
      }

      setResults(payload.data.results ?? []);
    } catch (runError) {
      setError(runError instanceof Error ? runError.message : "Unknown error");
      setResults([]);
    } finally {
      setRunning(false);
    }
  };

  const exportCsv = () => {
    if (results.length === 0) return;
    const header = ["symbol", "companyName", "overlapCount", "matchedBy", "explanation"];
    const lines = results.map((row) => [
      row.symbol,
      row.companyName,
      String(row.overlapCount),
      row.matchedBy.map((item) => item.key).join("|"),
      row.explanation.replaceAll(",", ";"),
    ]);
    const csv = [header, ...lines].map((line) => line.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `screener-intersection-${today}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-slate-200/80 bg-white/88 p-4 shadow-[0_8px_24px_rgba(15,23,42,0.07)]">
        <p className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-700">Set Operations</p>

        <div className="grid gap-4 lg:grid-cols-3">
          <div>
            <label className="mb-1 block text-xs font-medium uppercase tracking-wide text-slate-500">
              Operation
            </label>
            <select
              value={mode}
              onChange={(event) => setMode(event.target.value as Mode)}
              className="w-full rounded-xl border border-slate-300/80 bg-white px-3 py-2.5 text-sm font-medium"
            >
              <option value="intersection">Intersection</option>
              <option value="union">Union</option>
              <option value="difference">Difference</option>
            </select>
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium uppercase tracking-wide text-slate-500">
              Min Overlap
            </label>
            <input
              type="number"
              min={1}
              max={10}
              value={minOverlap}
              onChange={(event) => setMinOverlap(Number(event.target.value))}
              className="w-full rounded-xl border border-slate-300/80 bg-white px-3 py-2.5 text-sm font-medium"
            />
          </div>

          <div className="flex items-end">
            <button
              type="button"
              onClick={run}
              disabled={running}
              className="w-full rounded-xl bg-brand-600 px-3 py-2.5 text-sm font-semibold text-white shadow-[0_10px_20px_rgba(8,145,178,0.22)] hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {running ? "Running..." : "Run Intersection"}
            </button>
          </div>
        </div>

        <p className="mt-3 text-xs text-slate-500">
          Selected: {selected.length} screener(s) on {today}. Set math is deterministic over completed screener runs.
        </p>
      </div>

      <div className="rounded-2xl border border-slate-200/80 bg-white/88 p-4 shadow-[0_8px_24px_rgba(15,23,42,0.07)]">
        <p className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-700">Internal Screeners</p>
        <div className="grid gap-2 md:grid-cols-2 xl:grid-cols-3">
          {internal.map((screener) => {
            const isSelected = selected.includes(screener.key);
            return (
              <label
                key={screener.key}
                className={`rounded-lg border px-3 py-2 text-left text-sm transition-colors ${
                  isSelected
                    ? "border-brand-300 bg-brand-50/70 text-brand-900 shadow-[0_6px_14px_rgba(8,145,178,0.16)]"
                    : "border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50/70"
                }`}
              >
                <div className="mb-1 flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => toggleScreener(screener.key)}
                  />
                  <p className="font-medium">{screener.name}</p>
                </div>
                <p className="text-xs text-slate-500">{screener.key}</p>
              </label>
            );
          })}
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200/80 bg-white/88 p-4 shadow-[0_8px_24px_rgba(15,23,42,0.07)]">
        <p className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-700">Overlap View</p>
        {error ? <p className="mb-2 text-sm text-red-600">{error}</p> : null}

        {results.length === 0 ? (
          <p className="text-sm text-slate-500">Run a set operation to inspect overlap candidates and explanations.</p>
        ) : (
          <div className="space-y-2">
            <button
              type="button"
              onClick={exportCsv}
              className="rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
            >
              Export CSV
            </button>
            {results.map((row) => {
              const open = expanded[row.symbol] ?? false;
              const guideStock = buyingGuideLookup.get(normalizeSymbol(row.symbol));
              return (
                <div key={row.symbol} className="rounded-xl border border-slate-200/80 bg-white/90 p-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <p className="text-sm font-semibold text-slate-900">{row.symbol}</p>
                      <p className="text-xs text-slate-500">{row.companyName}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-slate-500">Overlap: {row.overlapCount}</p>
                      <p className="text-xs text-slate-500">
                        Confluence: {row.confluenceScore !== undefined ? row.confluenceScore.toFixed(2) : "n/a"}
                        {row.confluenceBucket ? ` • ${row.confluenceBucket}` : ""}
                      </p>
                    </div>
                  </div>
                  {guideStock ? <BuyingGuideRowBadge stock={guideStock} /> : null}
                  <button
                    type="button"
                    onClick={() => setExpanded((current) => ({ ...current, [row.symbol]: !open }))}
                    className="mt-2 rounded-lg border border-cyan-200 bg-cyan-50 px-2 py-1 text-xs font-semibold text-brand-700 hover:bg-cyan-100"
                  >
                    {open ? "Hide Explanation" : "Show Explanation"}
                  </button>
                  {open ? (
                    <div className="mt-2 rounded-xl border border-slate-200 bg-slate-50/90 p-2 text-xs text-slate-700">
                      <p>{row.explanation}</p>
                      <p className="mt-1">
                        Matched by: {row.matchedBy.map((item) => item.label).join(", ") || "n/a"}
                      </p>
                    </div>
                  ) : null}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

function BuyingGuideRowBadge({ stock }: { stock: BuyingGuideStock }) {
  const status = getTradeStatus(stock);
  const rrToT2 = stock.risk_reward_from_mid_entry?.r_to_t2 ?? getRewardToRisk(stock, stock.targets?.target_2);

  return (
    <div className="mt-3 flex flex-wrap items-center gap-2 rounded-xl border border-cyan-100 bg-cyan-50/70 p-2 text-xs">
      <span className={`rounded-lg border px-2 py-1 font-bold ${getStatusColor(status)}`}>{status}</span>
      <span className="rounded-lg bg-white px-2 py-1 font-bold text-slate-700">Score {stock.setup_score_out_of_100}</span>
      <span className="rounded-lg bg-white px-2 py-1 font-semibold text-cyan-800">Buy {formatRange(stock.limit_buy_zone)}</span>
      <span className="rounded-lg bg-white px-2 py-1 font-semibold text-rose-800">SL {formatCurrencyINR(stock.stop_loss?.hard_sl)}</span>
      <span className="rounded-lg bg-white px-2 py-1 font-semibold text-slate-700">T2 {rrToT2.toFixed(2)}R</span>
      <Link
        href={`/buying-guide?symbol=${encodeURIComponent(stock.symbol)}&tab=watchlist`}
        className="rounded-lg bg-slate-950 px-2.5 py-1 font-bold text-white hover:bg-slate-800"
      >
        View Buying Guide
      </Link>
    </div>
  );
}

function normalizeSymbol(symbol: string): string {
  return symbol.replace(/\.NS$/i, "").trim().toUpperCase();
}
