import { AlertTriangle, Gauge, ShieldCheck, TrendingUp } from "lucide-react";
import type { BuyingGuide } from "@/types/buying-guide";
import { formatNumberIN, formatRange, getMarketMode, normalizeLabel } from "@/lib/buying-guide-utils";

interface MarketRegimeHeaderProps {
  guide: BuyingGuide;
}

export function MarketRegimeHeader({ guide }: MarketRegimeHeaderProps) {
  const regime = guide.market_regime;
  const nifty = regime?.index_levels?.nifty_50;
  const bankNifty = regime?.index_levels?.bank_nifty;
  const mode = getMarketMode(regime?.bias, regime?.regime_score_out_of_100);
  const score = regime?.regime_score_out_of_100 ?? 0;
  const modeColor =
    mode === "No Fresh Longs"
      ? "border-rose-200 bg-rose-50 text-rose-800"
      : mode === "Defensive"
        ? "border-amber-200 bg-amber-50 text-amber-800"
        : mode === "Selective Long Only"
          ? "border-cyan-200 bg-cyan-50 text-cyan-800"
          : "border-emerald-200 bg-emerald-50 text-emerald-800";

  if (!regime) {
    return (
      <section className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
        Market regime missing. Add market_regime to the weekly JSON before using this guide.
      </section>
    );
  }

  return (
    <section className="sticky top-[108px] z-20 rounded-2xl border border-slate-200/90 bg-white/95 p-4 shadow-[0_14px_36px_rgba(15,23,42,0.08)] backdrop-blur lg:top-0">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
        <div className="min-w-0">
          <div className="mb-3 flex flex-wrap items-center gap-2">
            <span className={`inline-flex items-center gap-2 rounded-lg border px-3 py-1.5 text-sm font-bold ${modeColor}`}>
              <ShieldCheck className="h-4 w-4" />
              Market Mode: {mode}
            </span>
            <span className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-700">
              Weekly
            </span>
            <span className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-600">
              Updated: {guide.as_of}
            </span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-950 md:text-3xl">Buying Guide</h1>
          <p className="mt-2 max-w-4xl text-sm leading-6 text-slate-600">{regime.summary}</p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-slate-950 p-4 text-white shadow-[0_16px_34px_rgba(15,23,42,0.18)]">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-300">Regime Score</p>
              <p className="mt-1 text-3xl font-bold tabular-nums">{score}<span className="text-base text-slate-400">/100</span></p>
            </div>
            <Gauge className="h-10 w-10 text-cyan-300" />
          </div>
          <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-800">
            <div
              className={`h-full rounded-full ${score >= 65 ? "bg-emerald-400" : score >= 40 ? "bg-amber-300" : "bg-rose-400"}`}
              style={{ width: `${Math.max(0, Math.min(score, 100))}%` }}
            />
          </div>
          <p className="mt-2 text-xs text-slate-300">{normalizeLabel(regime.bias)}</p>
        </div>
      </div>

      <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-5">
        <MetricCard label="Nifty Close" value={nifty ? formatNumberIN(nifty.close, 2) : "n/a"} icon={<TrendingUp className="h-4 w-4" />} />
        <MetricCard label="Nifty Support" value={formatRange(nifty?.immediate_support_zone, false)} />
        <MetricCard label="Danger Below" value={nifty ? formatNumberIN(nifty.danger_zone_below, 0) : "n/a"} danger />
        <MetricCard label="Reclaim Above" value={formatRange(nifty?.first_reclaim_zone, false)} />
        <MetricCard label="Bank Nifty" value={bankNifty ? `${formatRange(bankNifty.support_zone, false)} / ${formatRange(bankNifty.resistance_zone, false)}` : "n/a"} />
      </div>

      <div className="mt-4 grid gap-3 lg:grid-cols-2">
        {nifty?.trade_rule ? (
          <p className="rounded-xl border border-cyan-100 bg-cyan-50/70 p-3 text-sm font-medium text-cyan-900">
            {nifty.trade_rule}
          </p>
        ) : null}
        {regime.position_sizing_rules?.hard_rule ? (
          <p className="rounded-xl border border-rose-100 bg-rose-50/80 p-3 text-sm font-semibold text-rose-900">
            <AlertTriangle className="mr-2 inline h-4 w-4" />
            {regime.position_sizing_rules.hard_rule}
          </p>
        ) : null}
      </div>
    </section>
  );
}

function MetricCard({
  label,
  value,
  icon,
  danger,
}: {
  label: string;
  value: string;
  icon?: React.ReactNode;
  danger?: boolean;
}) {
  return (
    <div className={`rounded-xl border p-3 ${danger ? "border-rose-100 bg-rose-50/70" : "border-slate-200 bg-slate-50/80"}`}>
      <div className="mb-1 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
        {icon}
        <span>{label}</span>
      </div>
      <p className={`text-lg font-bold tabular-nums ${danger ? "text-rose-800" : "text-slate-950"}`}>{value}</p>
    </div>
  );
}
