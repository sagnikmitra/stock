import { cn } from "@/lib/cn";

interface PostureIndicatorProps {
  posture: "favorable" | "mixed" | "hostile";
  score: number;
  className?: string;
}

const postureConfig = {
  favorable: { label: "Favorable", color: "text-favorable", bg: "bg-green-50", ring: "ring-green-200" },
  mixed: { label: "Mixed", color: "text-mixed", bg: "bg-amber-50", ring: "ring-amber-200" },
  hostile: { label: "Hostile", color: "text-hostile", bg: "bg-red-50", ring: "ring-red-200" },
};

export function PostureIndicator({ posture, score, className }: PostureIndicatorProps) {
  const config = postureConfig[posture];
  return (
    <div
      className={cn(
        "inline-flex items-center gap-2 rounded-lg px-3 py-1.5 ring-1",
        config.bg,
        config.ring,
        className,
      )}
    >
      <div className={cn("h-2.5 w-2.5 rounded-full", posture === "favorable" ? "bg-favorable" : posture === "hostile" ? "bg-hostile" : "bg-mixed")} />
      <span className={cn("text-sm font-semibold", config.color)}>{config.label}</span>
      <span className="text-xs text-slate-500">{score}/5</span>
    </div>
  );
}
