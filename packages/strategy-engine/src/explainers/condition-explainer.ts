import type { ConditionEvalResult } from "@ibo/types";

/**
 * Generate a human-readable explanation for a single condition result.
 */
export function explainCondition(result: ConditionEvalResult): string {
  const { field, label, passed, actualValue, expectedValue, operator } = result;
  const name = label ?? humanizeField(field);

  if (actualValue === undefined) {
    return `${name}: data not available`;
  }

  const actual = formatValue(actualValue);
  const expected = formatValue(expectedValue);
  const verdict = passed ? "met" : "not met";

  return `${name} is ${actual} (need ${operatorLabel(operator)} ${expected}) — ${verdict}`;
}

function humanizeField(field: string): string {
  return field
    .replace(/^(daily|weekly|monthly|h4|derived)\./, "")
    .replace(/_/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

function operatorLabel(op: string): string {
  const map: Record<string, string> = {
    ">=": "≥",
    ">": ">",
    "<=": "≤",
    "<": "<",
    "==": "=",
    "!=": "≠",
  };
  return map[op] ?? op;
}

function formatValue(v: unknown): string {
  if (v === undefined || v === null) return "N/A";
  if (typeof v === "number") return Number.isInteger(v) ? String(v) : v.toFixed(2);
  return String(v);
}
