"use client";

import { useEffect, useMemo, useState } from "react";
import { AlertTriangle, RotateCcw } from "lucide-react";
import type { ExecutionProtocol } from "@/types/buying-guide";

interface ExecutionChecklistProps {
  protocol?: ExecutionProtocol;
  guideAsOf: string;
  dangerZone?: number;
}

type ChecklistState = Record<string, boolean>;

export function ExecutionChecklist({ protocol, guideAsOf, dangerZone }: ExecutionChecklistProps) {
  const sections = useMemo(
    () => [
      ["before_market_open", "Before Market Open", protocol?.before_market_open ?? []],
      ["first_30_minutes", "First 30 Minutes", protocol?.first_30_minutes ?? []],
      ["entry_rules", "Entry Rules", protocol?.entry_rules ?? []],
      ["exit_rules", "Exit Rules", protocol?.exit_rules ?? []],
    ] as const,
    [protocol],
  );

  const storageKey = `buying-guide-checklist:${guideAsOf}`;
  const [checked, setChecked] = useState<ChecklistState>({});

  useEffect(() => {
    const stored = window.localStorage.getItem(storageKey);
    if (stored) setChecked(JSON.parse(stored) as ChecklistState);
  }, [storageKey]);

  useEffect(() => {
    window.localStorage.setItem(storageKey, JSON.stringify(checked));
  }, [checked, storageKey]);

  const toggle = (key: string) => {
    setChecked((current) => ({ ...current, [key]: !current[key] }));
  };

  const reset = () => setChecked({});
  const total = sections.reduce((sum, [, , rules]) => sum + rules.length, 0);
  const complete = Object.values(checked).filter(Boolean).length;

  if (!protocol) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white/90 p-8 text-center text-sm text-slate-500">
        No execution protocol in this weekly JSON.
      </div>
    );
  }

  return (
    <section className="space-y-4">
      <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-rose-950">
        <p className="flex items-center gap-2 text-sm font-bold">
          <AlertTriangle className="h-4 w-4" />
          If Nifty breaks {dangerZone ? dangerZone.toLocaleString("en-IN") : "the danger zone"}, stop forcing long trades.
        </p>
        <p className="mt-1 text-sm">A trade without a stop-loss is not a swing trade. It is uncontrolled risk.</p>
      </div>

      <div className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white/90 p-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-lg font-bold text-slate-950">Execution Checklist</h2>
          <p className="text-sm text-slate-500">{complete}/{total} checked for this weekly plan.</p>
        </div>
        <button
          type="button"
          onClick={reset}
          className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm font-bold text-slate-700 hover:border-slate-950"
        >
          <RotateCcw className="h-4 w-4" />
          Reset
        </button>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {sections.map(([key, title, rules]) => (
          <article key={key} className="rounded-2xl border border-slate-200 bg-white/92 p-4 shadow-[0_8px_24px_rgba(15,23,42,0.06)]">
            <h3 className="mb-3 text-base font-bold text-slate-950">{title}</h3>
            {rules.length === 0 ? (
              <p className="text-sm text-slate-500">No rules supplied.</p>
            ) : (
              <div className="space-y-2">
                {rules.map((rule, index) => {
                  const itemKey = `${key}:${index}`;
                  const done = Boolean(checked[itemKey]);
                  return (
                    <label
                      key={itemKey}
                      className={`flex cursor-pointer items-start gap-3 rounded-xl border p-3 text-sm leading-6 ${
                        done ? "border-emerald-200 bg-emerald-50 text-emerald-950" : "border-slate-200 bg-slate-50 text-slate-700"
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={done}
                        onChange={() => toggle(itemKey)}
                        className="mt-1 h-4 w-4 rounded border-slate-300 accent-slate-950"
                      />
                      <span className={done ? "line-through decoration-emerald-700/60" : ""}>{rule}</span>
                    </label>
                  );
                })}
              </div>
            )}
          </article>
        ))}
      </div>
    </section>
  );
}
