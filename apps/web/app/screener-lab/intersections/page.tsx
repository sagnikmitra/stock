"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";

type Screener = { key: string; name: string };
type Result = { symbol: string; overlapCount: number; matchedBy: { key: string }[]; explanation: string };

export default function ScreenerIntersectionsPage() {
  const [screeners, setScreeners] = useState<Screener[]>([]);
  const [selected, setSelected] = useState<string[]>([]);
  const [mode, setMode] = useState<"intersection" | "union" | "difference">("intersection");
  const [marketDate, setMarketDate] = useState(new Date().toISOString().split("T")[0]);
  const [results, setResults] = useState<Result[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch("/api/screeners?full=1")
      .then((r) => r.json())
      .then((payload) =>
        setScreeners(
          ((payload.data?.screeners ?? []) as Array<{
            key: string;
            name: string;
            isExternalReference?: boolean;
          }>)
            .filter((item) => !item.isExternalReference)
            .map((item) => ({ key: item.key, name: item.name })),
        ),
      )
      .catch(() => setScreeners([]));
  }, []);

  const vennSummary = useMemo(() => {
    const combos: Record<string, number> = {};
    for (const result of results) {
      const keys = result.matchedBy.map((item) => item.key).sort();
      for (let i = 0; i < keys.length; i++) {
        for (let j = i + 1; j < keys.length; j++) {
          const pair = `${keys[i]}∩${keys[j]}`;
          combos[pair] = (combos[pair] ?? 0) + 1;
        }
      }
      if (keys.length >= 3) {
        const triple = keys.join("∩");
        combos[triple] = (combos[triple] ?? 0) + 1;
      }
    }
    return Object.entries(combos).sort((a, b) => b[1] - a[1]).slice(0, 10);
  }, [results]);

  async function run() {
    setLoading(true);
    const response = await fetch("/api/screeners/intersection", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        screenerKeys: selected,
        mode,
        marketDate,
      }),
    });
    const payload = await response.json();
    setResults(payload.data ?? []);
    setLoading(false);
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Screener Intersections</h1>
        <Link href="/screener-lab" className="text-sm text-brand-600 hover:underline">Back to Screener Lab</Link>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-4 text-sm text-slate-600 dark:border-slate-700 dark:bg-slate-800">
        Educational tool. Intersections help shortlist candidates, not trade recommendations.
      </div>

      <div className="grid gap-3 rounded-xl border border-slate-200 bg-white p-4 md:grid-cols-4 dark:border-slate-700 dark:bg-slate-800">
        <input type="date" value={marketDate} onChange={(e) => setMarketDate(e.target.value)} className="rounded-lg border border-slate-300 px-3 py-2 text-sm" />
        <select value={mode} onChange={(e) => setMode(e.target.value as typeof mode)} className="rounded-lg border border-slate-300 px-3 py-2 text-sm">
          <option value="intersection">intersection</option>
          <option value="union">union</option>
          <option value="difference">difference</option>
        </select>
        <button type="button" onClick={run} disabled={loading || selected.length === 0} className="rounded-lg bg-brand-600 px-3 py-2 text-sm font-medium text-white disabled:opacity-60">
          {loading ? "Running..." : "Run"}
        </button>
      </div>

      <div className="grid gap-2 md:grid-cols-3">
        {screeners.map((screener) => (
          <label key={screener.key} className="flex items-center gap-2 rounded border border-slate-200 bg-white p-2 text-sm dark:border-slate-700 dark:bg-slate-800">
            <input
              type="checkbox"
              checked={selected.includes(screener.key)}
              onChange={() => setSelected((current) => current.includes(screener.key) ? current.filter((key) => key !== screener.key) : [...current, screener.key])}
            />
            <span>{screener.key}</span>
          </label>
        ))}
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-800">
        <h2 className="mb-2 text-sm font-semibold">Venn-style overlap summary</h2>
        {vennSummary.length ? vennSummary.map(([combo, count]) => (
          <p key={combo} className="text-sm">{combo}: {count} stocks</p>
        )) : <p className="text-sm text-slate-500">No overlap summary yet.</p>}
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-800">
        <h2 className="mb-2 text-sm font-semibold">Live Results</h2>
        {results.length ? (
          <div className="space-y-2">
            {results.map((item) => (
              <details key={item.symbol} className="rounded border border-slate-200 p-2 dark:border-slate-700">
                <summary className="cursor-pointer text-sm">{item.symbol} ({item.overlapCount})</summary>
                <p className="mt-1 text-xs text-slate-500">{item.explanation}</p>
              </details>
            ))}
          </div>
        ) : <p className="text-sm text-slate-500">No results.</p>}
      </div>
    </div>
  );
}
