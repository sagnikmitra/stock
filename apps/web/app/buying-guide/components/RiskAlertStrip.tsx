import { AlertTriangle, ChevronDown } from "lucide-react";
import type { BuyingGuideRisk } from "@/types/buying-guide";
import { getRiskSeverity } from "@/lib/buying-guide-utils";

interface RiskAlertStripProps {
  risks?: BuyingGuideRisk[];
}

export function RiskAlertStrip({ risks = [] }: RiskAlertStripProps) {
  if (risks.length === 0) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white/88 p-4 text-sm text-slate-500">
        No macro risk strip in this weekly JSON.
      </div>
    );
  }

  return (
    <section className="rounded-2xl border border-amber-200/80 bg-amber-50/60 p-3 shadow-[0_8px_22px_rgba(146,64,14,0.08)]">
      <div className="mb-2 flex items-center gap-2 px-1 text-sm font-bold text-amber-950">
        <AlertTriangle className="h-4 w-4" />
        Risk Alerts
      </div>
      <div className="grid gap-2 lg:grid-cols-3">
        {risks.map((risk) => {
          const severity = getRiskSeverity(risk.risk, risk.impact);
          const color =
            severity === "High"
              ? "border-rose-200 bg-white text-rose-800"
              : severity === "Medium"
                ? "border-amber-200 bg-white text-amber-800"
                : "border-slate-200 bg-white text-slate-700";

          return (
            <details key={risk.risk} className={`group rounded-xl border p-3 ${color}`}>
              <summary className="flex cursor-pointer list-none items-start justify-between gap-3">
                <span>
                  <span className="block text-sm font-bold text-slate-950">{risk.risk}</span>
                  <span className="mt-1 line-clamp-2 block text-xs leading-5 text-slate-600">{risk.impact}</span>
                </span>
                <span className="flex shrink-0 items-center gap-1 rounded-lg border border-current/20 px-2 py-1 text-xs font-bold">
                  {severity}
                  <ChevronDown className="h-3 w-3 transition group-open:rotate-180" />
                </span>
              </summary>
              {risk.evidence ? (
                <p className="mt-3 rounded-lg bg-slate-50 p-2 text-xs leading-5 text-slate-600">{risk.evidence}</p>
              ) : null}
            </details>
          );
        })}
      </div>
    </section>
  );
}
