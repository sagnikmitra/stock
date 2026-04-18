"use client";

import { Box, Card as MuiCard, Typography } from "@mui/material";
import { cn } from "@/lib/cn";

interface CardProps {
  children: React.ReactNode;
  className?: string;
}

export function Card({ children, className }: CardProps) {
  return (
    <MuiCard
      className={cn(className)}
      sx={{
        borderRadius: 1,
        p: 2,
        border: "1px solid",
        borderColor: "divider",
        backgroundColor: "#fff",
      }}
    >
      {children}
    </MuiCard>
  );
}

export function CardHeader({ children, className }: CardProps) {
  return (
    <Box className={cn(className)} sx={{ mb: 2 }}>
      {children}
    </Box>
  );
}

export function CardTitle({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <Typography className={cn(className)} variant="h6" component="h3" sx={{ fontWeight: 700, letterSpacing: -0.2 }}>
      {children}
    </Typography>
  );
}

export function CardDescription({ children }: { children: React.ReactNode }) {
  return (
    <Typography variant="body2" color="text.secondary" sx={{ mt: 0.75, lineHeight: 1.55 }}>
      {children}
    </Typography>
  );
}
