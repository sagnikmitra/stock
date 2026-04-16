import { cn } from "@/lib/cn";

type BadgeVariant =
  | "default"
  | "investment"
  | "swing"
  | "favorable"
  | "hostile"
  | "mixed"
  | "ambiguity"
  | "muted";

const variantClasses: Record<BadgeVariant, string> = {
  default: "bg-slate-100 text-slate-700",
  investment: "bg-blue-100 text-blue-800",
  swing: "bg-purple-100 text-purple-800",
  favorable: "bg-green-100 text-green-800",
  hostile: "bg-red-100 text-red-800",
  mixed: "bg-amber-100 text-amber-800",
  ambiguity: "bg-orange-100 text-orange-800",
  muted: "bg-slate-50 text-slate-500",
};

interface BadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
  className?: string;
}

export function Badge({ children, variant = "default", className }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
        variantClasses[variant],
        className,
      )}
    >
      {children}
    </span>
  );
}
