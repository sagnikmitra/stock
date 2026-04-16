import type {
  StrategyDSL,
  StrategyEvalResult,
  ConditionEvalResult,
} from "@ibo/types";
import { evaluateCondition, type DataContext } from "./condition-evaluator";

/**
 * Evaluate a full StrategyDSL against a stock's data context.
 */
export function evaluateStrategy(
  dsl: StrategyDSL,
  symbol: string,
  marketDate: string,
  ctx: DataContext,
): StrategyEvalResult {
  const conditions: ConditionEvalResult[] = [];
  let hardPassed = true;
  let hardFailedCount = 0;
  let softTotal = 0;
  let softPassed = 0;

  for (const filter of dsl.filters) {
    const result = evaluateCondition(filter, ctx);
    conditions.push(result);

    if (filter.kind === "hard" || filter.kind === undefined) {
      if (!result.passed) {
        hardPassed = false;
        hardFailedCount++;
      }
    } else if (filter.kind === "soft") {
      softTotal++;
      if (result.passed) softPassed++;
    }
  }

  const softScore = softTotal > 0 ? softPassed / softTotal : 1;
  const allPassed = hardPassed && softScore >= 0.5;

  // Compute entry price from DSL entry rule
  let entryPrice: number | undefined;
  if (dsl.entry && allPassed) {
    const close = Number(ctx["daily.close"] ?? ctx["monthly.close"] ?? ctx["h4.close"]);
    const high = Number(ctx["daily.high"] ?? ctx["monthly.high"] ?? ctx["h4.high"]);
    if (dsl.entry.type === "buffer_above_trigger" && dsl.entry.bufferPct) {
      const trigger = dsl.entry.triggerRef ? Number(ctx[dsl.entry.triggerRef]) : high;
      entryPrice = trigger * (1 + dsl.entry.bufferPct / 100);
    } else if (dsl.entry.type === "next_day_open") {
      entryPrice = close; // approximate
    } else if (dsl.entry.type === "confirmation_close") {
      entryPrice = close;
    }
  }

  // Compute stop-loss
  let stopLoss: number | undefined;
  if (dsl.stopLoss && allPassed) {
    if (dsl.stopLoss.type === "recent_swing_low") {
      stopLoss = Number(ctx["derived.recent_swing_low"]) || undefined;
    } else if (dsl.stopLoss.type === "fixed_pct" && dsl.stopLoss.pct && entryPrice) {
      stopLoss = entryPrice * (1 - dsl.stopLoss.pct / 100);
    } else if (dsl.stopLoss.type === "structure_based") {
      stopLoss = Number(ctx["derived.support_zone"]) || undefined;
    }
  }

  const explanation = buildExplanation(dsl, symbol, conditions, allPassed, softScore);

  return {
    strategyKey: dsl.key,
    symbol,
    marketDate,
    allPassed,
    hardRulesPassed: hardPassed,
    softScore,
    conditions,
    entryPrice,
    stopLoss,
    explanation,
    explainability: {
      passedCount: conditions.filter((c) => c.passed).length,
      failedCount: conditions.filter((c) => !c.passed).length,
      hardFailedCount,
      softPassedCount: softPassed,
      softTotalCount: softTotal,
    },
  };
}

function buildExplanation(
  dsl: StrategyDSL,
  symbol: string,
  conditions: ConditionEvalResult[],
  allPassed: boolean,
  softScore: number,
): string {
  const status = allPassed ? "MATCH" : "NO MATCH";
  const failed = conditions.filter((c) => !c.passed);
  const passed = conditions.filter((c) => c.passed);

  let text = `[${status}] ${symbol} vs ${dsl.key}\n`;
  text += `Hard rules: ${allPassed ? "ALL PASSED" : `${failed.length} failed`}\n`;
  text += `Soft score: ${Math.round(softScore * 100)}%\n`;

  if (passed.length > 0) {
    text += `\nPassed:\n`;
    for (const c of passed) text += `  ✓ ${c.reason}\n`;
  }
  if (failed.length > 0) {
    text += `\nFailed:\n`;
    for (const f of failed) text += `  ✗ ${f.reason}\n`;
  }

  return text;
}
