import type { StrategyEvalResult } from "@ibo/types";
import { explainCondition } from "./condition-explainer";

/**
 * Generate a structured human-readable explanation for a strategy eval result.
 */
export function explainStrategy(result: StrategyEvalResult): string {
  const lines: string[] = [];
  const status = result.allPassed ? "✅ MATCH" : "❌ NO MATCH";

  lines.push(`${status}: ${result.symbol} — ${result.strategyKey}`);
  lines.push(`Date: ${result.marketDate}`);
  lines.push(`Hard rules: ${result.hardRulesPassed ? "passed" : "failed"}`);
  lines.push(`Soft score: ${Math.round(result.softScore * 100)}%`);
  lines.push("");

  const passed = result.conditions.filter((c) => c.passed);
  const failed = result.conditions.filter((c) => !c.passed);

  if (passed.length > 0) {
    lines.push("Conditions met:");
    for (const c of passed) lines.push(`  ✓ ${explainCondition(c)}`);
  }

  if (failed.length > 0) {
    lines.push("Conditions not met:");
    for (const c of failed) lines.push(`  ✗ ${explainCondition(c)}`);
  }

  if (result.entryPrice) {
    lines.push("");
    lines.push(`Suggested entry: ₹${result.entryPrice.toFixed(2)}`);
  }
  if (result.stopLoss) {
    lines.push(`Stop-loss: ₹${result.stopLoss.toFixed(2)}`);
  }

  return lines.join("\n");
}
