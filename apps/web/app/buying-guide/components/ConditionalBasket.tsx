import { AlertTriangle } from "lucide-react";
import type { BuyingGuide, BuyingGuideStock } from "@/types/buying-guide";
import { formatCurrencyINR, formatRange, getStocksBySymbols, normalizeLabel } from "@/lib/buying-guide-utils";
import { TradeCard } from "./TradeCard";

interface ConditionalBasketProps {
  guide: BuyingGuide;
  selectedSymbol?: string;
  onSelect: (stock: BuyingGuideStock) => void;
  onOpenDetails: (stock: BuyingGuideStock) => void;
}

export function ConditionalBasket({ guide, selectedSymbol, onSelect, onOpenDetails }: ConditionalBasketProps) {
  const basket = guide.conditional_basket;
  const stocks = getStocksBySymbols(guide, basket?.stocks);

  if (!basket || stocks.length === 0) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white/90 p-8 text-center text-sm text-slate-500">
        No conditional basket in this weekly JSON.
      </div>
    );
  }

  return (
    <section className="space-y-4">
      <div className="rounded-2xl border border-amber-200 bg-amber-50/70 p-4">
        <div className="flex items-start gap-3">
          <AlertTriangle className="mt-0.5 h-5 w-5 text-amber-700" />
          <div>
            <h2 className="text-lg font-bold text-slate-950">Conditional Basket</h2>
            <p className="mt-1 text-sm leading-6 text-slate-700">{basket.reason}</p>
          </div>
        </div>
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        {stocks.map((stock) => (
          <div key={stock.symbol} className="space-y-3">
            <TradeCard
              stock={stock}
              selected={selectedSymbol === stock.symbol}
              onSelect={onSelect}
              onOpenDetails={onOpenDetails}
              tone="conditional"
            />
            <div className="rounded-2xl border border-amber-200 bg-white p-4">
              <p className="text-sm font-bold text-amber-900">Do not enter until...</p>
              <p className="mt-1 text-sm leading-6 text-slate-700">
                {stock.breakout_entry_above
                  ? `${stock.symbol} clears ${formatCurrencyINR(stock.breakout_entry_above)} or retests ${formatRange(stock.ideal_entry_zone ?? stock.limit_buy_zone)} while index conditions hold.`
                  : `${stock.symbol} trades inside ${formatRange(stock.ideal_entry_zone ?? stock.limit_buy_zone)} with market support intact.`}
              </p>
              <div className="mt-3 grid gap-2 text-sm md:grid-cols-2">
                <Info label="Trigger" value={stock.breakout_entry_above ? `Above ${formatCurrencyINR(stock.breakout_entry_above)}` : formatRange(stock.limit_buy_zone)} />
                <Info label="Stop loss" value={formatCurrencyINR(stock.stop_loss?.hard_sl)} danger />
                <Info label="Risk reason" value={normalizeLabel(stock.risk_grade)} />
                <Info label="Special rule" value={stock.trade_management?.special_rule ?? stock.trade_management?.invalid_if ?? "Use reduced size unless setup confirms."} danger={Boolean(stock.trade_management?.special_rule)} />
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function Info({ label, value, danger }: { label: string; value: string; danger?: boolean }) {
  return (
    <div className={`rounded-xl border p-3 ${danger ? "border-rose-100 bg-rose-50 text-rose-900" : "border-slate-200 bg-slate-50 text-slate-700"}`}>
      <p className="text-xs font-bold uppercase tracking-wide opacity-70">{label}</p>
      <p className="mt-1 font-semibold">{value}</p>
    </div>
  );
}
