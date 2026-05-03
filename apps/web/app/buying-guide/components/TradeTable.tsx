import type { BuyingGuideStock } from "@/types/buying-guide";
import {
  formatCurrencyINR,
  formatRange,
  getDistanceFromBuyZone,
  getRiskGradeColor,
  getStatusColor,
  getTradeStatus,
  getVerdictLabel,
  normalizeLabel,
} from "@/lib/buying-guide-utils";
import { RiskRewardMiniChart } from "./RiskRewardMiniChart";

interface TradeTableProps {
  stocks: BuyingGuideStock[];
  selectedSymbol?: string;
  onSelect: (stock: BuyingGuideStock) => void;
  onOpenDetails: (stock: BuyingGuideStock) => void;
}

export function TradeTable({ stocks, selectedSymbol, onSelect, onOpenDetails }: TradeTableProps) {
  if (stocks.length === 0) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white/90 p-8 text-center text-sm text-slate-500">
        No trades match the current filters. Try disabling near buy zone only.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white/92 shadow-[0_8px_24px_rgba(15,23,42,0.06)]">
      <table className="min-w-[1120px] w-full text-left text-sm">
        <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
          <tr>
            <th className="px-3 py-3">Rank</th>
            <th className="px-3 py-3">Symbol</th>
            <th className="px-3 py-3">Stock</th>
            <th className="px-3 py-3">Sector</th>
            <th className="px-3 py-3">Latest</th>
            <th className="px-3 py-3">Buy zone</th>
            <th className="px-3 py-3">Stop</th>
            <th className="px-3 py-3">Targets</th>
            <th className="px-3 py-3">Score</th>
            <th className="px-3 py-3">Risk</th>
            <th className="px-3 py-3">Strategy</th>
            <th className="px-3 py-3">Status</th>
            <th className="px-3 py-3">R:R</th>
            <th className="px-3 py-3">Verdict</th>
            <th className="px-3 py-3">Action</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {stocks.map((stock) => {
            const status = getTradeStatus(stock);
            const selected = selectedSymbol === stock.symbol;
            return (
              <tr key={stock.symbol} className={selected ? "bg-cyan-50/55" : "hover:bg-slate-50/70"}>
                <td className="px-3 py-3 font-bold text-slate-950">#{stock.rank}</td>
                <td className="px-3 py-3 font-bold text-slate-950">{stock.symbol}</td>
                <td className="px-3 py-3 text-slate-700">{stock.stock}</td>
                <td className="px-3 py-3 text-slate-600">{stock.sector}</td>
                <td className="px-3 py-3 font-semibold tabular-nums">{formatCurrencyINR(stock.latest_price)}</td>
                <td className="px-3 py-3 font-semibold text-cyan-800 tabular-nums">{formatRange(stock.limit_buy_zone)}</td>
                <td className="px-3 py-3 font-semibold text-rose-800 tabular-nums">{formatCurrencyINR(stock.stop_loss?.hard_sl)}</td>
                <td className="px-3 py-3 text-xs tabular-nums">
                  {[stock.targets?.target_1, stock.targets?.target_2, stock.targets?.target_3]
                    .filter(Boolean)
                    .map((value) => formatCurrencyINR(value as number))
                    .join(" / ") || "n/a"}
                </td>
                <td className="px-3 py-3 font-bold tabular-nums">{stock.setup_score_out_of_100}</td>
                <td className="px-3 py-3">
                  <span className={`rounded-lg border px-2 py-1 text-xs font-bold ${getRiskGradeColor(stock.risk_grade)}`}>
                    {normalizeLabel(stock.risk_grade)}
                  </span>
                </td>
                <td className="px-3 py-3 text-xs font-semibold text-slate-700">{normalizeLabel(stock.primary_strategy)}</td>
                <td className="px-3 py-3">
                  <span className={`rounded-lg border px-2 py-1 text-xs font-bold ${getStatusColor(status)}`}>{status}</span>
                  <span className="mt-1 block text-[11px] text-slate-400">
                    {getDistanceFromBuyZone(stock).toFixed(2)}% from zone
                  </span>
                </td>
                <td className="px-3 py-3">
                  <RiskRewardMiniChart stock={stock} />
                </td>
                <td className="px-3 py-3 text-xs font-semibold text-slate-600">{getVerdictLabel(stock.verdict)}</td>
                <td className="px-3 py-3">
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => onSelect(stock)}
                      className="rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-xs font-bold text-slate-700 hover:border-slate-950"
                    >
                      Select
                    </button>
                    <button
                      type="button"
                      onClick={() => onOpenDetails(stock)}
                      className="rounded-lg bg-slate-950 px-2.5 py-1.5 text-xs font-bold text-white hover:bg-slate-800"
                    >
                      Details
                    </button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
