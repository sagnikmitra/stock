"use client";

import { Chip, type ChipProps } from "@mui/material";
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

const variantStyles: Record<BadgeVariant, ChipProps["sx"]> = {
  default: { borderColor: "divider", backgroundColor: "background.paper", color: "text.primary" },
  investment: { borderColor: "#bfdbfe", backgroundColor: "#dbeafe", color: "#1e3a8a" },
  swing: { borderColor: "#99f6e4", backgroundColor: "#ccfbf1", color: "#115e59" },
  favorable: { borderColor: "#bbf7d0", backgroundColor: "#dcfce7", color: "#166534" },
  hostile: { borderColor: "#fecaca", backgroundColor: "#fee2e2", color: "#991b1b" },
  mixed: { borderColor: "#fde68a", backgroundColor: "#fef3c7", color: "#92400e" },
  ambiguity: { borderColor: "#fed7aa", backgroundColor: "#ffedd5", color: "#9a3412" },
  muted: { borderColor: "#e2e8f0", backgroundColor: "#f8fafc", color: "#475569" },
};

interface BadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
  className?: string;
}

export function Badge({ children, variant = "default", className }: BadgeProps) {
  return (
    <Chip
      className={cn(className)}
      label={children}
      size="small"
      variant="outlined"
      sx={{
        height: 24,
        borderRadius: 1,
        fontWeight: 600,
        "& .MuiChip-label": { px: 1.25, fontSize: 11.5, letterSpacing: 0.15 },
        ...variantStyles[variant],
      }}
    />
  );
}
