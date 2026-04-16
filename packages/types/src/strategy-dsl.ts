// =============================================================================
// Strategy/Screener DSL contracts
// =============================================================================

import type { Timeframe, RuleKind } from "./enums";

export type ComparisonOp = ">=" | ">" | "<=" | "<" | "==" | "!=";
export type DSLValue = number | boolean | string;

export type RuleScope =
  | "daily"
  | "weekly"
  | "monthly"
  | "h4"
  | "derived"
  | "instrument";

export interface FilterCondition {
  /** Dot-path field, e.g. "daily.close", "monthly.rsi14", "derived.trendlineBreakUp" */
  field: string;
  /** Comparison operator */
  operator: ComparisonOp;
  /** Static value to compare against */
  value?: DSLValue;
  /** Dynamic reference field instead of static value */
  valueRef?: string;
  /** Timeframe context for this condition */
  timeframe?: Timeframe;
  /** Indicator parameters if the field requires computation */
  params?: Record<string, number | string>;
  /** Hard gate vs soft score contributor */
  kind?: RuleKind;
  /** Human-readable label for UI */
  label?: string;
  /** Optional freeform notes */
  notes?: string;
  /** Explanation template for matched/failed output */
  explanationTemplate?: string;
}

export interface AllCondition {
  all: FilterCondition[];
}

export interface AnyCondition {
  any: FilterCondition[];
}

export type ConditionGroup = AllCondition | AnyCondition | FilterCondition;

export type EntryType =
  | "buffer_above_trigger"
  | "buffer_above_close"
  | "next_day_open"
  | "confirmation_close"
  | "manual";

export interface EntryRule {
  type: EntryType;
  bufferPct?: number;
  triggerRef?: string;
}

export type StopLossType =
  | "recent_swing_low"
  | "recent_swing_high"
  | "fixed_pct"
  | "atr_multiple"
  | "structure_based"
  | "manual";

export interface StopLossRule {
  type: StopLossType;
  timeframe?: Timeframe;
  lookbackBars?: number;
  pct?: number;
  atrMultiple?: number;
}

export type ExitType =
  | "supertrend_flip"
  | "ma_cross_below"
  | "rsi_threshold"
  | "target_hit"
  | "manual";

export interface ExitRule {
  type: ExitType;
  timeframe?: Timeframe;
  params?: Record<string, number | string>;
}

export interface StrategyDSL {
  key: string;
  family: string;
  reviewFrequency: "daily" | "weekly" | "month_end" | "pre_market" | "on_demand";
  primaryTimeframe: Timeframe;
  secondaryTimeframe?: Timeframe;
  filters: FilterCondition[];
  entry?: EntryRule;
  stopLoss?: StopLossRule;
  exit?: ExitRule;
  marketContextRequired?: boolean;
  niftyAlignmentRequired?: boolean;
  /** Canonical label for ambiguity/version mapping, e.g. bb-monthly-breakout.v2.normalized-active */
  canonicalVersionTag?: string;
}

export interface ScreenerDSL {
  key: string;
  filters: FilterCondition[];
  sortBy?: string;
  sortDir?: "asc" | "desc";
  limit?: number;
  canonicalVersionTag?: string;
}

export interface DSLValidationError {
  code:
    | "INVALID_TYPE"
    | "MISSING_FIELD"
    | "INVALID_FIELD_PATH"
    | "INVALID_OPERATOR"
    | "INVALID_VALUE"
    | "INVALID_ENUM"
    | "AMBIGUOUS_VALUE";
  path: string;
  message: string;
}

export interface DSLValidationResult<T> {
  valid: boolean;
  errors: DSLValidationError[];
  normalized: T | null;
}

export interface ConditionEvalResult {
  field: string;
  label?: string;
  kind?: RuleKind;
  passed: boolean;
  actualValue?: DSLValue;
  expectedValue?: DSLValue;
  operator: ComparisonOp;
  reason: string;
  trace: string[];
  missingFields?: string[];
}

export interface StrategyEvalResult {
  strategyKey: string;
  symbol: string;
  marketDate: string;
  allPassed: boolean;
  hardRulesPassed: boolean;
  softScore: number;
  conditions: ConditionEvalResult[];
  entryPrice?: number;
  stopLoss?: number;
  targetPrice?: number;
  explanation: string;
  explainability: {
    passedCount: number;
    failedCount: number;
    hardFailedCount: number;
    softPassedCount: number;
    softTotalCount: number;
  };
}
