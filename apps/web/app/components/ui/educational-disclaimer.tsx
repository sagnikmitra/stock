import { cn } from "@/lib/cn";

interface EducationalDisclaimerProps {
  className?: string;
  compact?: boolean;
}

export function EducationalDisclaimer({ className, compact = false }: EducationalDisclaimerProps) {
  return (
    <div
      className={cn(
        "rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900",
        className,
      )}
      role="note"
      aria-label="Educational disclaimer"
    >
      <p className={compact ? "text-xs" : "text-sm"}>
        Educational use only. Market data, strategy signals, and backtest outputs are research aids, not
        investment advice or execution recommendations.
      </p>
    </div>
  );
}
