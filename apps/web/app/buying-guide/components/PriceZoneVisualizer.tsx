import type { BuyingGuideStock } from "@/types/buying-guide";
import { formatCurrencyINR } from "@/lib/buying-guide-utils";

interface PriceZoneVisualizerProps {
  stock: BuyingGuideStock;
}

export function PriceZoneVisualizer({ stock }: PriceZoneVisualizerProps) {
  const levels = [
    stock.stop_loss?.hard_sl,
    stock.limit_buy_zone[0],
    stock.limit_buy_zone[1],
    stock.latest_price,
    stock.breakout_entry_above,
    stock.avoid_chasing_above,
    stock.targets?.target_1,
    stock.targets?.target_2,
    stock.targets?.target_3,
  ].filter((value): value is number => typeof value === "number" && Number.isFinite(value));

  if (levels.length < 2) return null;

  const min = Math.min(...levels);
  const max = Math.max(...levels);
  const pad = (max - min) * 0.08 || 1;
  const scaleMin = min - pad;
  const scaleMax = max + pad;
  const pct = (value: number) => `${Math.max(0, Math.min(100, ((value - scaleMin) / (scaleMax - scaleMin)) * 100))}%`;
  const [buyLow, buyHigh] = stock.limit_buy_zone;

  const markers = [
    stock.stop_loss?.hard_sl ? { label: "SL", value: stock.stop_loss.hard_sl, className: "bg-rose-600" } : null,
    { label: "Latest", value: stock.latest_price, className: "bg-slate-950" },
    stock.breakout_entry_above ? { label: "BO", value: stock.breakout_entry_above, className: "bg-cyan-600" } : null,
    stock.avoid_chasing_above ? { label: "Avoid", value: stock.avoid_chasing_above, className: "bg-amber-600" } : null,
    stock.targets?.target_1 ? { label: "T1", value: stock.targets.target_1, className: "bg-emerald-600" } : null,
    stock.targets?.target_2 ? { label: "T2", value: stock.targets.target_2, className: "bg-emerald-700" } : null,
    stock.targets?.target_3 ? { label: "T3", value: stock.targets.target_3, className: "bg-emerald-800" } : null,
  ].filter(Boolean) as Array<{ label: string; value: number; className: string }>;

  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50/80 p-3" aria-label={`${stock.symbol} price zones`}>
      <div className="relative h-12">
        <div className="absolute left-0 right-0 top-5 h-2 rounded-full bg-slate-200" />
        <div
          className="absolute top-4 h-4 rounded-full border border-cyan-300 bg-cyan-200/80"
          style={{ left: pct(buyLow), width: `calc(${pct(buyHigh)} - ${pct(buyLow)})` }}
          title={`Buy zone ${formatCurrencyINR(buyLow)}-${formatCurrencyINR(buyHigh)}`}
        />
        {markers.map((marker) => (
          <div
            key={`${marker.label}-${marker.value}`}
            className="absolute top-2 flex -translate-x-1/2 flex-col items-center gap-1"
            style={{ left: pct(marker.value) }}
            title={`${marker.label}: ${formatCurrencyINR(marker.value)}`}
          >
            <span className={`h-7 w-1 rounded-full ${marker.className}`} />
            <span className="text-[10px] font-bold uppercase text-slate-500">{marker.label}</span>
          </div>
        ))}
      </div>
      <div className="mt-2 flex flex-wrap gap-1.5 text-[11px] font-semibold text-slate-600">
        <span className="rounded-md bg-white px-2 py-1">SL {formatCurrencyINR(stock.stop_loss?.hard_sl)}</span>
        <span className="rounded-md bg-cyan-50 px-2 py-1 text-cyan-800">Buy {formatCurrencyINR(buyLow)}-{formatCurrencyINR(buyHigh)}</span>
        <span className="rounded-md bg-white px-2 py-1">Latest {formatCurrencyINR(stock.latest_price)}</span>
        {stock.avoid_chasing_above ? (
          <span className="rounded-md bg-amber-50 px-2 py-1 text-amber-800">Avoid &gt; {formatCurrencyINR(stock.avoid_chasing_above)}</span>
        ) : null}
      </div>
    </div>
  );
}
