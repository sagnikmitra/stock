import { nseCalendar } from "@ibo/utils";

export function isCalendarMonthEnd(date: Date): boolean {
  return nseCalendar.isMonthEnd(date);
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
