"use client";

import { useState } from "react";
import { SCREENER_BUNDLES } from "../../lib/screener-bundles";

type BundleResult = {
  symbol: string;
  overlapCount: number;
  explanation: string;
};

export default function ScreenerPresetPage() {
  const [loadingKey, setLoadingKey] = useState<string | null>(null);
  const [results, setResults] = useState<Record<string, BundleResult[]>>({});

  async function runBundle(bundleKey: string, screenerKeys: string[], mode: "intersection" | "union", minOverlap?: number) {
    setLoadingKey(bundleKey);
    const marketDate = new Date().toISOString().split("T")[0];
    const response = await fetch("/api/screeners/intersection", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ screenerKeys, mode, minOverlap, marketDate }),
    });
    const payload = await response.json();
    setResults((prev) => ({ ...prev, [bundleKey]: payload.data ?? [] }));
    setLoadingKey(null);
  }

  return (
    <div className="space-y-4">
      {SCREENER_BUNDLES.map((bundle) => (
        <div key={bundle.key} className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-800">
          <h2 className="text-lg font-semibold">{bundle.name}</h2>
          <p className="mb-2 text-sm text-slate-500">{bundle.description}</p>
          <p className="mb-2 text-xs text-slate-500">Keys: {bundle.screenerKeys.join(", ")}</p>
          <button
            type="button"
            onClick={() => runBundle(bundle.key, bundle.screenerKeys, bundle.defaultMode, bundle.minOverlap)}
            disabled={loadingKey === bundle.key}
            className="rounded-lg bg-brand-600 px-3 py-2 text-sm font-medium text-white"
          >
            {loadingKey === bundle.key ? "Running..." : "Run Bundle"}
          </button>
          {results[bundle.key]?.length ? (
            <div className="mt-3 max-h-60 overflow-auto rounded-lg border border-slate-200 p-2 text-sm dark:border-slate-700">
              {results[bundle.key].slice(0, 25).map((item) => (
                <div key={`${bundle.key}-${item.symbol}`} className="flex items-center justify-between py-1">
                  <span>{item.symbol}</span>
                  <span className="text-slate-500">{item.overlapCount}</span>
                </div>
              ))}
            </div>
          ) : null}
        </div>
      ))}
      <p className="text-xs text-slate-500">Educational use only. Screener outputs are not trade calls.</p>
    </div>
  );
}

