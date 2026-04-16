export function isCalendarMonthEnd(date: Date): boolean {
  const next = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate() + 1));
  return next.getUTCMonth() !== date.getUTCMonth();
}

export function shouldRenderDegradedMode(warnings: string[]): boolean {
  return warnings.length > 0;
}

export function buildDigestSummary(input: {
  posture: string;
  score: number;
  warnings: string[];
}): string {
  const base = `Posture: ${input.posture.toUpperCase()} (${input.score}/5).`;
  if (!shouldRenderDegradedMode(input.warnings)) return `${base} Full-data mode.`;
  return `${base} DEGRADED MODE: ${input.warnings.join(", ")}`;
}
