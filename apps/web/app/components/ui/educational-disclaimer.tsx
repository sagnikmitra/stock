"use client";

import { Alert } from "@mui/material";

interface EducationalDisclaimerProps {
  className?: string;
  compact?: boolean;
}

export function EducationalDisclaimer({ className, compact = false }: EducationalDisclaimerProps) {
  return (
    <Alert
      severity="warning"
      className={className}
      sx={{
        borderRadius: 1,
        border: "1px solid #fde68a",
        backgroundColor: "#fffbeb",
        color: "#78350f",
        "& .MuiAlert-message": {
          fontSize: compact ? 12 : 13.5,
          lineHeight: 1.55,
        },
      }}
    >
      Educational use only. Market data, strategy signals, and backtest outputs are research aids, not
      investment advice or execution recommendations.
    </Alert>
  );
}
