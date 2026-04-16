/** Status dot color mapping */
export const STATUS_DOT_COLORS: Record<string, string> = {
  active: "bg-green-500",
  completed: "bg-green-500",
  running: "bg-blue-500 animate-pulse",
  pending: "bg-slate-400",
  draft: "bg-slate-400",
  experimental: "bg-amber-500",
  deprecated: "bg-red-400",
  archived: "bg-slate-300",
  failed: "bg-red-500",
  partial: "bg-amber-500",
};

export interface StatusDot {
  status: string;
  className: string;
}

export function getStatusDot(status: string): StatusDot {
  return {
    status,
    className: `inline-block h-2 w-2 rounded-full ${STATUS_DOT_COLORS[status] ?? "bg-slate-400"}`,
  };
}
