import { AlertTriangle, ChevronDown, CircleDollarSign, Crosshair, Shield, Target } from "lucide-react";
import type { BuyingGuideStock } from "@/types/buying-guide";
import {
  formatCurrencyINR,
  formatRange,
  getRiskGradeColor,
  getRiskPerShare,
  getStatusColor,
  getTradeStatus,
  getVerdictLabel,
  normalizeLabel,
} from "@/lib/buying-guide-utils";
import { PriceZoneVisualizer } from "./PriceZoneVisualizer";
import { RiskRewardMiniChart } from "./RiskRewardMiniChart";
import { TradeScoreBar } from "./TradeScoreBar";

interface TradeCardProps {
  stock: BuyingGuideStock;
  selected?: boolean;
  onSelect?: (stock: BuyingGuideStock) => void;
  onOpenDetails?: (stock: BuyingGuideStock) => void;
  tone?: "default" | "defensive" | "conditional";
}

export function TradeCard({ stock, selected, onSelect, onOpenDetails, tone = "default" }: TradeCardProps) {
  const status = getTradeStatus(stock);
  const riskPerShare = stock.risk_reward_from_mid_entry?.risk_per_share ?? getRiskPerShare(stock);
  const toneClass =
    tone === "defensive"
      ? "border-cyan-100 bg-white"
      : tone === "conditional"
        ? "border-amber-200 bg-amber-50/35"
        : selected
          ? "border-slate-950 bg-white shadow-[0_18px_44px_rgba(15,23,42,0.14)]"
          : "border-slate-200 bg-white/92 shadow-[0_10px_28px_rgba(15,23,42,0.07)]";

  return (
    <article className={`rounded-2xl border p-4 transition ${toneClass}`} id={`trade-${stock.symbol}`}>
      <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
        <div className="min-w-0">
          <div className="mb-2 flex flex-wrap items-center gap-2">
            <span className="rounded-lg bg-slate-950 px-2.5 py-1 text-xs font-bold text-white">#{stock.rank}</span>
            <span className={`rounded-lg border px-2.5 py-1 text-xs font-bold ${getStatusColor(status)}`}>{status}</span>
            <span className={`rounded-lg border px-2.5 py-1 text-xs font-bold ${getRiskGradeColor(stock.risk_grade)}`}>
              {normalizeLabel(stock.risk_grade)}
            </span>
            <span className="rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-semibold text-slate-600">
              {getVerdictLabel(stock.verdict)}
            </span>
          </div>
          <h2 className="text-xl font-bold tracking-tight text-slate-950">
            {stock.symbol} <span className="text-sm font-semibold text-slate-500">{stock.stock}</span>
          </h2>
          <p className="mt-1 text-sm text-slate-500">{stock.sector}</p>
        </div>
        <TradeScoreBar score={stock.setup_score_out_of_100} />
      </div>

      <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        <DataTile icon={<CircleDollarSign className="h-4 w-4" />} label="Latest" value={formatCurrencyINR(stock.latest_price)} />
        <DataTile icon={<Crosshair className="h-4 w-4" />} label="Buy Zone" value={formatRange(stock.limit_buy_zone)} accent="buy" />
        <DataTile icon={<Shield className="h-4 w-4" />} label="Hard SL" value={formatCurrencyINR(stock.stop_loss?.hard_sl)} accent="risk" />
        <DataTile icon={<Target className="h-4 w-4" />} label="Targets" value={[stock.targets?.target_1, stock.targets?.target_2, stock.targets?.target_3].filter(Boolean).map((value) => formatCurrencyINR(value as number)).join(" / ") || "n/a"} />
      </div>

      <div className="mt-4 grid gap-3 lg:grid-cols-[1.35fr_0.65fr]">
        <PriceZoneVisualizer stock={stock} />
        <div className="rounded-xl border border-slate-200 bg-slate-50/80 p-3">
          <p className="mb-2 text-xs font-bold uppercase tracking-wide text-slate-500">Reward / Risk</p>
          <RiskRewardMiniChart stock={stock} />
          <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
            <span className="rounded-lg bg-white p-2 text-slate-500">
              Risk/share
              <strong className="block text-sm text-slate-950">{formatCurrencyINR(riskPerShare)}</strong>
            </span>
            <span className="rounded-lg bg-white p-2 text-slate-500">
              Strategy
              <strong className="block text-sm text-slate-950">{normalizeLabel(stock.primary_strategy)}</strong>
            </span>
          </div>
        </div>
      </div>

      {status === "Do Not Chase" || status === "Invalidated" ? (
        <div className="mt-4 rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm font-semibold text-rose-900">
          <AlertTriangle className="mr-2 inline h-4 w-4" />
          {status === "Do Not Chase" ? "Price is beyond avoid-chase level. Wait for retest." : "Trade is below hard stop. Setup invalidated."}
        </div>
      ) : null}

      <details className="group mt-4 rounded-xl border border-slate-200 bg-slate-50/70 p-3">
        <summary className="flex cursor-pointer list-none items-center justify-between gap-3 text-sm font-bold text-slate-800">
          Trade reasoning and invalidation
          <ChevronDown className="h-4 w-4 transition group-open:rotate-180" />
        </summary>
        <div className="mt-3 space-y-3 text-sm leading-6 text-slate-600">
          <p><span className="font-bold text-slate-900">Why:</span> {stock.why_selected}</p>
          {stock.ideal_entry_zone ? <p><span className="font-bold text-slate-900">Ideal entry:</span> {formatRange(stock.ideal_entry_zone)}</p> : null}
          {stock.breakout_entry_above ? <p><span className="font-bold text-slate-900">Breakout watch:</span> above {formatCurrencyINR(stock.breakout_entry_above)}</p> : null}
          {stock.avoid_chasing_above ? <p><span className="font-bold text-slate-900">Avoid chase:</span> above {formatCurrencyINR(stock.avoid_chasing_above)}</p> : null}
          {stock.trade_management?.invalid_if ? <p><span className="font-bold text-rose-800">Invalid if:</span> {stock.trade_management.invalid_if}</p> : null}
          {stock.stop_loss?.reason ? <p><span className="font-bold text-slate-900">SL logic:</span> {stock.stop_loss.reason}</p> : null}
        </div>
      </details>

      <div className="mt-4 flex flex-wrap gap-2">
        {onSelect ? (
          <button
            type="button"
            onClick={() => onSelect(stock)}
            className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm font-bold text-slate-700 hover:border-slate-950"
          >
            Select
          </button>
        ) : null}
        {onOpenDetails ? (
          <button
            type="button"
            onClick={() => onOpenDetails(stock)}
            className="rounded-xl bg-slate-950 px-3 py-2 text-sm font-bold text-white hover:bg-slate-800"
          >
            Open Detail
          </button>
        ) : null}
      </div>
    </article>
  );
}

function DataTile({
  label,
  value,
  icon,
  accent,
}: {
  label: string;
  value: string;
  icon: React.ReactNode;
  accent?: "buy" | "risk";
}) {
  const color = accent === "buy" ? "text-cyan-800" : accent === "risk" ? "text-rose-800" : "text-slate-950";
  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50/80 p-3">
      <p className="mb-1 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-slate-500">
        {icon}
        {label}
      </p>
      <p className={`text-sm font-bold tabular-nums ${color}`}>{value}</p>
    </div>
  );
}
