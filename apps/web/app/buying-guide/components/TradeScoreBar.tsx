import { getSetupScoreColor } from "@/lib/buying-guide-utils";

interface TradeScoreBarProps {
  score: number;
}

export function TradeScoreBar({ score }: TradeScoreBarProps) {
  return (
    <div className="min-w-32">
      <div className="mb-1 flex items-center justify-between text-xs font-semibold text-slate-500">
        <span>Setup</span>
        <span className={`rounded-md border px-1.5 py-0.5 tabular-nums ${getSetupScoreColor(score)}`}>{score}/100</span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-slate-200">
        <div
          className={`h-full rounded-full ${score >= 80 ? "bg-emerald-500" : score >= 70 ? "bg-cyan-500" : score >= 60 ? "bg-amber-500" : "bg-rose-500"}`}
          style={{ width: `${Math.max(0, Math.min(score, 100))}%` }}
        />
      </div>
    </div>
  );
}
