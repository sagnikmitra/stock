"use client";

import { useState } from "react";

type ConditionRow = {
  indicator: string;
  operator: ">=" | "<=" | ">" | "<" | "==" | "crosses_above";
  value: string;
};

export default function ScreenerBuilderPage() {
  const [rows, setRows] = useState<ConditionRow[]>([{ indicator: "RSI", operator: ">=", value: "60" }]);
  const [results, setResults] = useState<Array<{ symbol: string; overlapCount: number; explanation: string }>>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  function updateRow(index: number, patch: Partial<ConditionRow>) {
    setRows((current) => current.map((row, i) => (i === index ? { ...row, ...patch } : row)));
  }

  async function runCustom() {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/screeners/run", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mode: "intersection",
          marketDate: new Date().toISOString().split("T")[0],
          customConditions: rows,
        }),
      });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error ?? "Failed to run");
      setResults(payload.data?.results ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to run custom screener");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold">Custom Screener Builder</h1>
      <p className="text-sm text-slate-500">Educational filter builder for exploratory analysis only.</p>
      <div className="space-y-2 rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-800">
        {rows.map((row, index) => (
          <div key={index} className="grid gap-2 md:grid-cols-4">
            <select value={row.indicator} onChange={(e) => updateRow(index, { indicator: e.target.value })} className="rounded-lg border border-slate-300 px-2 py-2 text-sm">
              {["RSI", "SMA", "EMA", "BB", "volume", "price", "delivery%"].map((opt) => (
                <option key={opt}>{opt}</option>
              ))}
            </select>
            <select value={row.operator} onChange={(e) => updateRow(index, { operator: e.target.value as ConditionRow["operator"] })} className="rounded-lg border border-slate-300 px-2 py-2 text-sm">
              {([">=", "<=", ">", "<", "==", "crosses_above"] as const).map((op) => (
                <option key={op}>{op}</option>
              ))}
            </select>
            <input value={row.value} onChange={(e) => updateRow(index, { value: e.target.value })} className="rounded-lg border border-slate-300 px-2 py-2 text-sm" />
            <button type="button" onClick={() => setRows((current) => current.filter((_, i) => i !== index))} className="rounded-lg border border-slate-300 px-2 py-2 text-sm">
              Remove
            </button>
          </div>
        ))}
        <div className="flex gap-2">
          <button type="button" onClick={() => setRows((current) => [...current, { indicator: "RSI", operator: ">=", value: "50" }])} className="rounded-lg border border-slate-300 px-3 py-2 text-sm">
            Add Condition
          </button>
          <button type="button" onClick={runCustom} disabled={loading} className="rounded-lg bg-brand-600 px-3 py-2 text-sm font-medium text-white">
            {loading ? "Running..." : "Run Custom Screener"}
          </button>
        </div>
      </div>

      {error ? <p className="text-sm text-red-600">{error}</p> : null}
      <div className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-800">
        <h2 className="mb-2 text-sm font-semibold">Results</h2>
        {results.length ? (
          <table className="w-full text-sm">
            <thead><tr><th className="text-left">Symbol</th><th className="text-left">Overlap</th><th className="text-left">Explanation</th></tr></thead>
            <tbody>
              {results.slice(0, 50).map((row) => (
                <tr key={row.symbol} className="border-t border-slate-100 dark:border-slate-700"><td>{row.symbol}</td><td>{row.overlapCount}</td><td>{row.explanation}</td></tr>
              ))}
            </tbody>
          </table>
        ) : <p className="text-sm text-slate-500">No results yet.</p>}
      </div>
    </div>
  );
}
