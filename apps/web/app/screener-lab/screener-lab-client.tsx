"use client";

import { useMemo, useState } from "react";

type Mode = "intersection" | "union" | "difference";

type ScreenerOption = {
  key: string;
  name: string;
  description: string;
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
      <div className="rounded-xl border border-slate-200 bg-white p-4">
        <p className="mb-3 text-sm font-semibold text-slate-800">Set Operations</p>

        <div className="grid gap-4 lg:grid-cols-3">
          <div>
            <label className="mb-1 block text-xs font-medium uppercase tracking-wide text-slate-500">
              Operation
            </label>
            <select
              value={mode}
              onChange={(event) => setMode(event.target.value as Mode)}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
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
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
            />
          </div>

          <div className="flex items-end">
            <button
              type="button"
              onClick={run}
              disabled={running}
              className="w-full rounded-lg bg-brand-600 px-3 py-2 text-sm font-medium text-white hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {running ? "Running..." : "Run Intersection"}
            </button>
          </div>
        </div>

        <p className="mt-3 text-xs text-slate-500">
          Selected: {selected.length} screener(s) on {today}. Set math is deterministic over completed screener runs.
        </p>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-4">
        <p className="mb-3 text-sm font-semibold text-slate-800">Internal Screeners</p>
        <div className="grid gap-2 md:grid-cols-2 xl:grid-cols-3">
          {internal.map((screener) => {
            const isSelected = selected.includes(screener.key);
            return (
              <label
                key={screener.key}
                className={`rounded-lg border px-3 py-2 text-left text-sm transition-colors ${
                  isSelected
                    ? "border-brand-400 bg-brand-50 text-brand-800"
                    : "border-slate-200 bg-white text-slate-700 hover:border-slate-300"
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

      <div className="rounded-xl border border-slate-200 bg-white p-4">
        <p className="mb-3 text-sm font-semibold text-slate-800">Overlap View</p>
        {error ? <p className="mb-2 text-sm text-red-600">{error}</p> : null}

        {results.length === 0 ? (
          <p className="text-sm text-slate-500">Run a set operation to inspect overlap candidates and explanations.</p>
        ) : (
          <div className="space-y-2">
            <button
              type="button"
              onClick={exportCsv}
              className="rounded-lg border border-slate-300 px-2 py-1 text-xs"
            >
              Export CSV
            </button>
            {results.map((row) => {
              const open = expanded[row.symbol] ?? false;
              return (
                <div key={row.symbol} className="rounded-lg border border-slate-100 p-3">
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
                  <button
                    type="button"
                    onClick={() => setExpanded((current) => ({ ...current, [row.symbol]: !open }))}
                    className="mt-2 text-xs font-medium text-brand-600 hover:underline"
                  >
                    {open ? "Hide Explanation" : "Show Explanation"}
                  </button>
                  {open ? (
                    <div className="mt-2 rounded-lg bg-slate-50 p-2 text-xs text-slate-600">
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
