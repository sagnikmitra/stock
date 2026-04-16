import type { ScreenerDSL, ConditionEvalResult } from "@ibo/types";
import { evaluateCondition, type DataContext } from "./condition-evaluator";

export interface ScreenerEvalResult {
  screenerKey: string;
  symbol: string;
  passed: boolean;
  conditions: ConditionEvalResult[];
}

/**
 * Evaluate a ScreenerDSL against a stock's data context.
 * All filters must pass for the stock to match.
 */
export function evaluateScreener(
  dsl: ScreenerDSL,
  symbol: string,
  ctx: DataContext,
): ScreenerEvalResult {
  const conditions: ConditionEvalResult[] = [];
  let allPassed = true;

  for (const filter of dsl.filters) {
    const result = evaluateCondition(filter, ctx);
    conditions.push(result);
    if (!result.passed) allPassed = false;
  }

  return {
    screenerKey: dsl.key,
    symbol,
    passed: allPassed,
    conditions,
  };
}
