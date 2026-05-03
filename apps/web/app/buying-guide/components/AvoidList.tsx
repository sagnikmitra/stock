import { Ban, ShieldAlert } from "lucide-react";
import type { AvoidedTrade } from "@/types/buying-guide";
import { getAvoidAction } from "@/lib/buying-guide-utils";

interface AvoidListProps {
  items?: AvoidedTrade[];
}

export function AvoidList({ items = [] }: AvoidListProps) {
  if (items.length === 0) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white/90 p-8 text-center text-sm text-slate-500">
        No avoid list in this weekly JSON.
      </div>
    );
  }

  return (
    <section className="grid gap-4 md:grid-cols-2">
      {items.map((item) => {
        const action = getAvoidAction(item.reason);
        return (
          <article key={item.stock_or_sector} className="rounded-2xl border border-rose-200 bg-white p-4 shadow-[0_10px_26px_rgba(127,29,29,0.08)]">
            <div className="mb-3 flex items-start justify-between gap-3">
              <div>
                <p className="text-xs font-bold uppercase tracking-wide text-rose-700">Avoid / Low Priority</p>
                <h2 className="mt-1 text-lg font-bold text-slate-950">{item.stock_or_sector}</h2>
              </div>
              <span className="rounded-xl border border-rose-200 bg-rose-50 p-2 text-rose-700">
                <Ban className="h-5 w-5" />
              </span>
            </div>
            <p className="text-sm leading-6 text-slate-600">{item.reason}</p>
            <div className="mt-4 grid gap-2 sm:grid-cols-2">
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                <p className="text-xs font-bold uppercase tracking-wide text-slate-500">Risk type</p>
                <p className="mt-1 text-sm font-semibold text-slate-800">{inferRiskType(item.reason)}</p>
              </div>
              <div className="rounded-xl border border-rose-100 bg-rose-50 p-3">
                <p className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-rose-700">
                  <ShieldAlert className="h-3.5 w-3.5" />
                  Suggested action
                </p>
                <p className="mt-1 text-sm font-semibold text-rose-900">{action}</p>
              </div>
            </div>
          </article>
        );
      })}
    </section>
  );
}

function inferRiskType(reason: string): string {
  const normalized = reason.toLowerCase();
  if (normalized.includes("sector")) return "Sector breakdown";
  if (normalized.includes("result") || normalized.includes("quarterly")) return "Event / earnings risk";
  if (normalized.includes("relative strength")) return "Weak relative strength";
  if (normalized.includes("volatile") || normalized.includes("slippage")) return "Liquidity / volatility";
  return "Unfavorable setup";
}
