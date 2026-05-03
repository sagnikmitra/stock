"use client";

import { useEffect } from "react";
import { X } from "lucide-react";
import type { BuyingGuideStock } from "@/types/buying-guide";
import {
  formatCurrencyINR,
  formatRange,
  getRiskGradeColor,
  getStatusColor,
  getTradeStatus,
  getVerdictLabel,
  normalizeLabel,
} from "@/lib/buying-guide-utils";
import { PriceZoneVisualizer } from "./PriceZoneVisualizer";
import { RiskRewardMiniChart } from "./RiskRewardMiniChart";

interface TradeDetailDrawerProps {
  stock?: BuyingGuideStock;
  open: boolean;
  onClose: () => void;
}

export function TradeDetailDrawer({ stock, open, onClose }: TradeDetailDrawerProps) {
  useEffect(() => {
    if (!open) return;
    const handler = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose, open]);

  if (!open || !stock) return null;

  const status = getTradeStatus(stock);

  return (
    <div className="fixed inset-0 z-50" role="dialog" aria-modal="true" aria-label={`${stock.symbol} trade detail`}>
      <button
        type="button"
        aria-label="Close trade detail overlay"
        className="absolute inset-0 bg-slate-950/40"
        onClick={onClose}
      />
      <aside className="absolute right-0 top-0 h-full w-full max-w-xl overflow-y-auto bg-white p-5 shadow-2xl">
        <div className="mb-4 flex items-start justify-between gap-4">
          <div>
            <div className="mb-2 flex flex-wrap gap-2">
              <span className={`rounded-lg border px-2.5 py-1 text-xs font-bold ${getStatusColor(status)}`}>{status}</span>
              <span className={`rounded-lg border px-2.5 py-1 text-xs font-bold ${getRiskGradeColor(stock.risk_grade)}`}>{normalizeLabel(stock.risk_grade)}</span>
              <span className="rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-bold text-slate-600">{getVerdictLabel(stock.verdict)}</span>
            </div>
            <h2 className="text-2xl font-bold text-slate-950">{stock.symbol}</h2>
            <p className="text-sm text-slate-500">{stock.stock} / {stock.sector}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close trade detail"
            className="rounded-xl border border-slate-200 bg-white p-2 text-slate-600 hover:border-slate-950"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <PriceZoneVisualizer stock={stock} />

        <div className="mt-4 grid grid-cols-2 gap-3">
          <Detail label="Latest" value={formatCurrencyINR(stock.latest_price)} />
          <Detail label="Buy zone" value={formatRange(stock.limit_buy_zone)} accent="buy" />
          <Detail label="Ideal entry" value={formatRange(stock.ideal_entry_zone)} />
          <Detail label="Avoid above" value={formatCurrencyINR(stock.avoid_chasing_above)} accent="risk" />
          <Detail label="Hard SL" value={formatCurrencyINR(stock.stop_loss?.hard_sl)} accent="risk" />
          <Detail label="Closing SL" value={formatCurrencyINR(stock.stop_loss?.closing_basis_sl)} accent="risk" />
          <Detail label="T1" value={formatCurrencyINR(stock.targets?.target_1)} />
          <Detail label="T2" value={formatCurrencyINR(stock.targets?.target_2)} />
          <Detail label="T3" value={formatCurrencyINR(stock.targets?.target_3)} />
          <Detail label="Strategy" value={normalizeLabel(stock.primary_strategy)} />
        </div>

        <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 p-4">
          <p className="mb-2 text-xs font-bold uppercase tracking-wide text-slate-500">Risk / reward</p>
          <RiskRewardMiniChart stock={stock} />
        </div>

        <div className="mt-4 space-y-3 text-sm leading-6 text-slate-700">
          <Block title="Why selected" body={stock.why_selected} />
          <Block title="Stop-loss logic" body={stock.stop_loss?.reason} />
          <Block title="Invalid if" body={stock.trade_management?.invalid_if} danger />
          <Block title="Book at T1" body={stock.trade_management?.book_at_t1} />
          <Block title="Trail after T2" body={stock.trade_management?.trail_after_t2} />
          <Block title="Special rule" body={stock.trade_management?.special_rule} danger />
        </div>
      </aside>
    </div>
  );
}

function Detail({ label, value, accent }: { label: string; value: string; accent?: "buy" | "risk" }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-3">
      <p className="text-xs font-bold uppercase tracking-wide text-slate-500">{label}</p>
      <p className={`mt-1 text-sm font-bold tabular-nums ${accent === "buy" ? "text-cyan-800" : accent === "risk" ? "text-rose-800" : "text-slate-950"}`}>{value}</p>
    </div>
  );
}

function Block({ title, body, danger }: { title: string; body?: string; danger?: boolean }) {
  if (!body) return null;
  return (
    <div className={`rounded-xl border p-3 ${danger ? "border-rose-200 bg-rose-50 text-rose-950" : "border-slate-200 bg-slate-50 text-slate-700"}`}>
      <p className="text-xs font-bold uppercase tracking-wide opacity-70">{title}</p>
      <p className="mt-1">{body}</p>
    </div>
  );
}
