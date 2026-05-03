import type { BuyingGuideStock } from "@/types/buying-guide";
import { getRewardToRisk, getRiskRewardQuality } from "@/lib/buying-guide-utils";

interface RiskRewardMiniChartProps {
  stock: BuyingGuideStock;
}

export function RiskRewardMiniChart({ stock }: RiskRewardMiniChartProps) {
  const values = [
    ["T1", stock.risk_reward_from_mid_entry?.r_to_t1 ?? getRewardToRisk(stock, stock.targets?.target_1)],
    ["T2", stock.risk_reward_from_mid_entry?.r_to_t2 ?? getRewardToRisk(stock, stock.targets?.target_2)],
    ["T3", stock.risk_reward_from_mid_entry?.r_to_t3 ?? getRewardToRisk(stock, stock.targets?.target_3)],
  ].filter(([, value]) => typeof value === "number" && Number.isFinite(value) && value > 0) as Array<[string, number]>;

  if (values.length === 0) return <p className="text-xs text-slate-500">R:R unavailable</p>;

  return (
    <div className="flex flex-wrap gap-1.5" aria-label={`${stock.symbol} reward to risk`}>
      {values.map(([label, value]) => (
        <span key={label} className={`rounded-lg border px-2 py-1 text-xs font-bold tabular-nums ${getRiskRewardQuality(value)}`}>
          {label} {value.toFixed(2)}R
        </span>
      ))}
    </div>
  );
}
