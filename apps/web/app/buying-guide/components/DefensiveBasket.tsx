import type { BuyingGuide, BuyingGuideStock } from "@/types/buying-guide";
import { formatCurrencyINR, formatRange, getStocksBySymbols, normalizeLabel } from "@/lib/buying-guide-utils";
import { TradeCard } from "./TradeCard";

interface DefensiveBasketProps {
  guide: BuyingGuide;
  selectedSymbol?: string;
  onSelect: (stock: BuyingGuideStock) => void;
  onOpenDetails: (stock: BuyingGuideStock) => void;
}

export function DefensiveBasket({ guide, selectedSymbol, onSelect, onOpenDetails }: DefensiveBasketProps) {
  const basket = guide.defensive_basket;
  const stocks = getStocksBySymbols(guide, basket?.stocks);

  if (!basket || stocks.length === 0) {
    return <Empty message="No defensive basket in this weekly JSON." />;
  }

  return (
    <section className="space-y-4">
      <div className="rounded-2xl border border-cyan-100 bg-cyan-50/55 p-4">
        <h2 className="text-lg font-bold text-slate-950">Defensive Basket</h2>
        <p className="mt-1 text-sm leading-6 text-slate-600">{basket.reason}</p>
        {basket.max_positions ? (
          <p className="mt-2 text-xs font-bold uppercase tracking-wide text-cyan-800">Max positions: {basket.max_positions}</p>
        ) : null}
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        {stocks.map((stock) => (
          <div key={stock.symbol} className="space-y-3">
            <TradeCard
              stock={stock}
              selected={selectedSymbol === stock.symbol}
              onSelect={onSelect}
              onOpenDetails={onOpenDetails}
              tone="defensive"
            />
            <div className="rounded-2xl border border-slate-200 bg-white/86 p-4 text-sm leading-6 text-slate-600">
              <p><strong className="text-slate-950">Why defensive:</strong> {stock.why_selected}</p>
              <p><strong className="text-slate-950">Market condition:</strong> Works best when broad market is fragile but Nifty holds its danger zone.</p>
              <p><strong className="text-rose-800">Downside invalidation:</strong> {stock.trade_management?.invalid_if ?? stock.stop_loss?.reason ?? "Close below hard stop."}</p>
              <p><strong className="text-emerald-800">Expected upside:</strong> {formatCurrencyINR(stock.targets?.target_1)} to {formatCurrencyINR(stock.targets?.target_2)}.</p>
              <p><strong className="text-slate-950">Conservative fit:</strong> {normalizeLabel(stock.risk_grade)} risk, buy only inside {formatRange(stock.limit_buy_zone)} with hard stop visible.</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function Empty({ message }: { message: string }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white/90 p-8 text-center text-sm text-slate-500">
      {message}
    </div>
  );
}
