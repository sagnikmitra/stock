import type {
  FilterCondition,
  AllCondition,
  AnyCondition,
  ConditionGroup,
  ConditionEvalResult,
  ComparisonOp,
} from "@ibo/types";

/** Flat key-value map of resolved indicator/derived values for a stock */
export type DataContext = Record<string, number | boolean | string | undefined>;

interface ResolvedValue {
  value: number | boolean | string | undefined;
  resolvedField: string;
}

function normalizeFieldKey(field: string): string {
  return field.replace(/[^a-zA-Z0-9]/g, "").toLowerCase();
}

function resolveCtxValue(ctx: DataContext, field: string): ResolvedValue {
  if (field in ctx) {
    return {
      value: ctx[field],
      resolvedField: field,
    };
  }

  const normalizedTarget = normalizeFieldKey(field);
  for (const key of Object.keys(ctx)) {
    if (normalizeFieldKey(key) === normalizedTarget) {
      return {
        value: ctx[key],
        resolvedField: key,
      };
    }
  }

  return {
    value: undefined,
    resolvedField: field,
  };
}

/**
 * Evaluate a single FilterCondition against a data context.
 */
export function evaluateCondition(
  cond: FilterCondition,
  ctx: DataContext,
): ConditionEvalResult {
  const actualResolved = resolveCtxValue(ctx, cond.field);
  const expectedResolved = cond.valueRef
    ? resolveCtxValue(ctx, cond.valueRef)
    : { value: cond.value, resolvedField: cond.valueRef ?? "literal" };
  const actual = actualResolved.value;
  const expected = expectedResolved.value;
  const trace: string[] = [
    `field:${cond.field}->${actualResolved.resolvedField}`,
    cond.valueRef
      ? `valueRef:${cond.valueRef}->${expectedResolved.resolvedField}`
      : "valueRef:literal",
  ];

  if (actual === undefined || expected === undefined) {
    const missingFields = [
      ...(actual === undefined ? [cond.field] : []),
      ...(expected === undefined && cond.valueRef ? [cond.valueRef] : []),
    ];
    return {
      field: cond.field,
      label: cond.label,
      kind: cond.kind,
      passed: false,
      actualValue: actual,
      expectedValue: expected,
      operator: cond.operator,
      trace,
      missingFields,
      reason: actual === undefined
        ? `Missing data for ${cond.field} (resolved: ${actualResolved.resolvedField})`
        : `Missing reference value for ${cond.valueRef ?? "value"} (resolved: ${expectedResolved.resolvedField})`,
    };
  }

  const passed = compare(actual, cond.operator, expected);
  trace.push(`compare:${String(actual)} ${cond.operator} ${String(expected)} => ${passed}`);

  return {
    field: cond.field,
    label: cond.label,
    kind: cond.kind,
    passed,
    actualValue: actual,
    expectedValue: expected,
    operator: cond.operator,
    trace,
    reason: passed
      ? `${cond.label ?? cond.field}: ${actual} ${cond.operator} ${expected} ✓`
      : `${cond.label ?? cond.field}: ${actual} ${cond.operator} ${expected} ✗`,
  };
}

/**
 * Evaluate a ConditionGroup (all/any/single).
 * Returns array of individual results.
 */
export function evaluateConditionGroup(
  group: ConditionGroup,
  ctx: DataContext,
): { passed: boolean; results: ConditionEvalResult[] } {
  if ("all" in group) {
    return evaluateAll(group as AllCondition, ctx);
  }
  if ("any" in group) {
    return evaluateAny(group as AnyCondition, ctx);
  }
  // Single condition
  const result = evaluateCondition(group as FilterCondition, ctx);
  return { passed: result.passed, results: [result] };
}

function evaluateAll(
  group: AllCondition,
  ctx: DataContext,
): { passed: boolean; results: ConditionEvalResult[] } {
  const results: ConditionEvalResult[] = [];
  let allPassed = true;
  for (const cond of group.all) {
    const r = evaluateCondition(cond, ctx);
    results.push(r);
    if (!r.passed) allPassed = false;
  }
  return { passed: allPassed, results };
}

function evaluateAny(
  group: AnyCondition,
  ctx: DataContext,
): { passed: boolean; results: ConditionEvalResult[] } {
  const results: ConditionEvalResult[] = [];
  let anyPassed = false;
  for (const cond of group.any) {
    const r = evaluateCondition(cond, ctx);
    results.push(r);
    if (r.passed) anyPassed = true;
  }
  return { passed: anyPassed, results };
}

function compare(
  actual: number | boolean | string,
  op: ComparisonOp,
  expected: number | boolean | string,
): boolean {
  // Handle boolean/string equality
  if (op === "==") return actual === expected || Number(actual) === Number(expected);
  if (op === "!=") return actual !== expected && Number(actual) !== Number(expected);

  // Numeric comparisons
  const a = Number(actual);
  const b = Number(expected);
  if (isNaN(a) || isNaN(b)) return false;

  switch (op) {
    case ">": return a > b;
    case ">=": return a >= b;
    case "<": return a < b;
    case "<=": return a <= b;
    default: return false;
  }
}
