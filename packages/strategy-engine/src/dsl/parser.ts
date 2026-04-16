import {
  Timeframe,
  type StrategyDSL,
  type ScreenerDSL,
  type FilterCondition,
  type ComparisonOp,
  type RuleKind,
  type DSLValidationResult,
  type DSLValidationError,
} from "@ibo/types";

const VALID_OPERATORS: ComparisonOp[] = [">=", ">", "<=", "<", "==", "!="];
const VALID_REVIEW_FREQUENCIES = new Set([
  "daily",
  "weekly",
  "month_end",
  "pre_market",
  "on_demand",
]);
const VALID_TIMEFRAMES = new Set(Object.values(Timeframe));
const VALID_RULE_KINDS = new Set<RuleKind>([
  "hard",
  "soft",
  "ambiguity",
  "derived",
  "informational",
]);
const FIELD_PATH_RE = /^(daily|weekly|monthly|h4|derived|instrument)\.[A-Za-z][A-Za-z0-9_.]*$/;

type LooseRecord = Record<string, unknown>;

function isObject(value: unknown): value is LooseRecord {
  return value !== null && typeof value === "object";
}

function err(
  code: DSLValidationError["code"],
  path: string,
  message: string,
): DSLValidationError {
  return { code, path, message };
}

function validateFilter(
  filter: unknown,
  path: string,
): { filter: FilterCondition | null; errors: DSLValidationError[] } {
  const errors: DSLValidationError[] = [];

  if (!isObject(filter)) {
    return {
      filter: null,
      errors: [err("INVALID_TYPE", path, "Condition must be an object.")],
    };
  }

  const input = filter as LooseRecord;
  const field = input.field;
  const operator = input.operator;
  const value = input.value;
  const valueRef = input.valueRef;
  const timeframe = input.timeframe;
  const kind = input.kind;
  const label = input.label;

  if (typeof field !== "string" || field.trim().length === 0) {
    errors.push(err("MISSING_FIELD", `${path}.field`, "field is required."));
  } else if (!FIELD_PATH_RE.test(field)) {
    errors.push(
      err(
        "INVALID_FIELD_PATH",
        `${path}.field`,
        `Invalid field path "${field}". Use scope.field format (e.g. daily.close).`,
      ),
    );
  }

  if (typeof operator !== "string" || !VALID_OPERATORS.includes(operator as ComparisonOp)) {
    errors.push(
      err(
        "INVALID_OPERATOR",
        `${path}.operator`,
        `operator must be one of ${VALID_OPERATORS.join(", ")}.`,
      ),
    );
  }

  const hasValue = value !== undefined;
  const hasValueRef = valueRef !== undefined;
  if (!hasValue && !hasValueRef) {
    errors.push(
      err(
        "MISSING_FIELD",
        `${path}.value`,
        "Either value or valueRef is required.",
      ),
    );
  }
  if (hasValue && hasValueRef) {
    errors.push(
      err(
        "AMBIGUOUS_VALUE",
        path,
        "Provide only one of value or valueRef, not both.",
      ),
    );
  }

  if (hasValue) {
    const validType =
      typeof value === "number" || typeof value === "boolean" || typeof value === "string";
    if (!validType) {
      errors.push(
        err(
          "INVALID_VALUE",
          `${path}.value`,
          "value must be number, boolean, or string.",
        ),
      );
    }
  }

  if (hasValueRef) {
    if (typeof valueRef !== "string" || !FIELD_PATH_RE.test(valueRef)) {
      errors.push(
        err(
          "INVALID_FIELD_PATH",
          `${path}.valueRef`,
          "valueRef must be a valid field path.",
        ),
      );
    }
  }

  if (timeframe !== undefined) {
    if (typeof timeframe !== "string" || !VALID_TIMEFRAMES.has(timeframe as Timeframe)) {
      errors.push(
        err(
          "INVALID_ENUM",
          `${path}.timeframe`,
          `timeframe must be one of ${Array.from(VALID_TIMEFRAMES).join(", ")}.`,
        ),
      );
    }
  }

  if (kind !== undefined) {
    if (typeof kind !== "string" || !VALID_RULE_KINDS.has(kind as RuleKind)) {
      errors.push(
        err(
          "INVALID_ENUM",
          `${path}.kind`,
          `kind must be one of ${Array.from(VALID_RULE_KINDS).join(", ")}.`,
        ),
      );
    }
  }

  if (label !== undefined && typeof label !== "string") {
    errors.push(err("INVALID_TYPE", `${path}.label`, "label must be a string."));
  }

  if (errors.length > 0) return { filter: null, errors };

  const normalized: FilterCondition = {
    field: field as string,
    operator: operator as ComparisonOp,
    ...(hasValue ? { value: value as number | string | boolean } : {}),
    ...(hasValueRef ? { valueRef: valueRef as string } : {}),
    ...(timeframe ? { timeframe: timeframe as Timeframe } : {}),
    ...(kind ? { kind: kind as RuleKind } : {}),
    ...(label ? { label: label as string } : {}),
  };

  return { filter: normalized, errors: [] };
}

function validateEntryRule(
  input: unknown,
  path: string,
): DSLValidationError[] {
  if (input === undefined) return [];
  if (!isObject(input)) return [err("INVALID_TYPE", path, "entry must be an object.")];

  const entryType = input.type;
  if (
    typeof entryType !== "string" ||
    ![
      "buffer_above_trigger",
      "buffer_above_close",
      "next_day_open",
      "confirmation_close",
      "manual",
    ].includes(entryType)
  ) {
    return [err("INVALID_ENUM", `${path}.type`, "Invalid entry type.")];
  }

  const errors: DSLValidationError[] = [];
  if (input.bufferPct !== undefined && typeof input.bufferPct !== "number") {
    errors.push(err("INVALID_TYPE", `${path}.bufferPct`, "bufferPct must be a number."));
  }
  if (input.triggerRef !== undefined) {
    if (typeof input.triggerRef !== "string" || !FIELD_PATH_RE.test(input.triggerRef)) {
      errors.push(
        err("INVALID_FIELD_PATH", `${path}.triggerRef`, "triggerRef must be a valid field path."),
      );
    }
  }
  return errors;
}

function validateStopLossRule(
  input: unknown,
  path: string,
): DSLValidationError[] {
  if (input === undefined) return [];
  if (!isObject(input)) return [err("INVALID_TYPE", path, "stopLoss must be an object.")];

  const stopType = input.type;
  if (
    typeof stopType !== "string" ||
    ![
      "recent_swing_low",
      "recent_swing_high",
      "fixed_pct",
      "atr_multiple",
      "structure_based",
      "manual",
    ].includes(stopType)
  ) {
    return [err("INVALID_ENUM", `${path}.type`, "Invalid stopLoss type.")];
  }

  const errors: DSLValidationError[] = [];
  if (input.timeframe !== undefined) {
    if (typeof input.timeframe !== "string" || !VALID_TIMEFRAMES.has(input.timeframe as Timeframe)) {
      errors.push(err("INVALID_ENUM", `${path}.timeframe`, "Invalid timeframe."));
    }
  }
  if (input.lookbackBars !== undefined && typeof input.lookbackBars !== "number") {
    errors.push(err("INVALID_TYPE", `${path}.lookbackBars`, "lookbackBars must be a number."));
  }
  if (input.pct !== undefined && typeof input.pct !== "number") {
    errors.push(err("INVALID_TYPE", `${path}.pct`, "pct must be a number."));
  }
  if (input.atrMultiple !== undefined && typeof input.atrMultiple !== "number") {
    errors.push(err("INVALID_TYPE", `${path}.atrMultiple`, "atrMultiple must be a number."));
  }
  return errors;
}

function validateExitRule(
  input: unknown,
  path: string,
): DSLValidationError[] {
  if (input === undefined) return [];
  if (!isObject(input)) return [err("INVALID_TYPE", path, "exit must be an object.")];

  const exitType = input.type;
  if (
    typeof exitType !== "string" ||
    !["supertrend_flip", "ma_cross_below", "rsi_threshold", "target_hit", "manual"].includes(exitType)
  ) {
    return [err("INVALID_ENUM", `${path}.type`, "Invalid exit type.")];
  }

  const errors: DSLValidationError[] = [];
  if (input.timeframe !== undefined) {
    if (typeof input.timeframe !== "string" || !VALID_TIMEFRAMES.has(input.timeframe as Timeframe)) {
      errors.push(err("INVALID_ENUM", `${path}.timeframe`, "Invalid timeframe."));
    }
  }
  if (input.params !== undefined && !isObject(input.params)) {
    errors.push(err("INVALID_TYPE", `${path}.params`, "params must be an object."));
  }
  return errors;
}

export function parseStrategyDSL(json: unknown): DSLValidationResult<StrategyDSL> {
  const errors: DSLValidationError[] = [];
  if (!isObject(json)) {
    return {
      valid: false,
      errors: [err("INVALID_TYPE", "$", "DSL must be a non-null object.")],
      normalized: null,
    };
  }

  const input = json as LooseRecord;

  if (typeof input.key !== "string" || input.key.trim().length === 0) {
    errors.push(err("MISSING_FIELD", "key", "key is required."));
  }
  if (typeof input.family !== "string" || input.family.trim().length === 0) {
    errors.push(err("MISSING_FIELD", "family", "family is required."));
  }
  if (
    typeof input.reviewFrequency !== "string" ||
    !VALID_REVIEW_FREQUENCIES.has(input.reviewFrequency)
  ) {
    errors.push(
      err(
        "INVALID_ENUM",
        "reviewFrequency",
        `reviewFrequency must be one of ${Array.from(VALID_REVIEW_FREQUENCIES).join(", ")}.`,
      ),
    );
  }
  if (
    typeof input.primaryTimeframe !== "string" ||
    !VALID_TIMEFRAMES.has(input.primaryTimeframe as Timeframe)
  ) {
    errors.push(
      err(
        "INVALID_ENUM",
        "primaryTimeframe",
        `primaryTimeframe must be one of ${Array.from(VALID_TIMEFRAMES).join(", ")}.`,
      ),
    );
  }
  if (input.secondaryTimeframe !== undefined) {
    if (
      typeof input.secondaryTimeframe !== "string" ||
      !VALID_TIMEFRAMES.has(input.secondaryTimeframe as Timeframe)
    ) {
      errors.push(err("INVALID_ENUM", "secondaryTimeframe", "Invalid secondaryTimeframe."));
    }
  }
  if (!Array.isArray(input.filters)) {
    errors.push(err("MISSING_FIELD", "filters", "filters must be an array."));
  }

  const normalizedFilters: FilterCondition[] = [];
  if (Array.isArray(input.filters)) {
    if (input.filters.length === 0) {
      errors.push(err("INVALID_VALUE", "filters", "filters cannot be empty."));
    }

    for (let i = 0; i < input.filters.length; i++) {
      const result = validateFilter(input.filters[i], `filters[${i}]`);
      errors.push(...result.errors);
      if (result.filter) normalizedFilters.push(result.filter);
    }
  }

  errors.push(...validateEntryRule(input.entry, "entry"));
  errors.push(...validateStopLossRule(input.stopLoss, "stopLoss"));
  errors.push(...validateExitRule(input.exit, "exit"));

  if (errors.length > 0) return { valid: false, errors, normalized: null };

  return {
    valid: true,
    errors: [],
    normalized: {
      key: input.key as string,
      family: input.family as string,
      reviewFrequency: input.reviewFrequency as StrategyDSL["reviewFrequency"],
      primaryTimeframe: input.primaryTimeframe as Timeframe,
      ...(input.secondaryTimeframe
        ? { secondaryTimeframe: input.secondaryTimeframe as Timeframe }
        : {}),
      filters: normalizedFilters,
      ...(input.entry ? { entry: input.entry as StrategyDSL["entry"] } : {}),
      ...(input.stopLoss ? { stopLoss: input.stopLoss as StrategyDSL["stopLoss"] } : {}),
      ...(input.exit ? { exit: input.exit as StrategyDSL["exit"] } : {}),
      ...(input.marketContextRequired !== undefined
        ? { marketContextRequired: Boolean(input.marketContextRequired) }
        : {}),
      ...(input.niftyAlignmentRequired !== undefined
        ? { niftyAlignmentRequired: Boolean(input.niftyAlignmentRequired) }
        : {}),
      ...(typeof input.canonicalVersionTag === "string"
        ? { canonicalVersionTag: input.canonicalVersionTag }
        : {}),
    },
  };
}

export function parseScreenerDSL(json: unknown): DSLValidationResult<ScreenerDSL> {
  const errors: DSLValidationError[] = [];
  if (!isObject(json)) {
    return {
      valid: false,
      errors: [err("INVALID_TYPE", "$", "Screener DSL must be a non-null object.")],
      normalized: null,
    };
  }

  const input = json as LooseRecord;
  if (typeof input.key !== "string" || input.key.trim().length === 0) {
    errors.push(err("MISSING_FIELD", "key", "key is required."));
  }
  if (!Array.isArray(input.filters)) {
    errors.push(err("MISSING_FIELD", "filters", "filters must be an array."));
  }

  const normalizedFilters: FilterCondition[] = [];
  if (Array.isArray(input.filters)) {
    if (input.filters.length === 0) {
      errors.push(err("INVALID_VALUE", "filters", "filters cannot be empty."));
    }

    for (let i = 0; i < input.filters.length; i++) {
      const result = validateFilter(input.filters[i], `filters[${i}]`);
      errors.push(...result.errors);
      if (result.filter) normalizedFilters.push(result.filter);
    }
  }

  if (input.sortDir !== undefined) {
    if (input.sortDir !== "asc" && input.sortDir !== "desc") {
      errors.push(err("INVALID_ENUM", "sortDir", "sortDir must be asc or desc."));
    }
  }
  if (input.limit !== undefined && (typeof input.limit !== "number" || input.limit <= 0)) {
    errors.push(err("INVALID_VALUE", "limit", "limit must be a positive number."));
  }

  if (errors.length > 0) return { valid: false, errors, normalized: null };

  return {
    valid: true,
    errors: [],
    normalized: {
      key: input.key as string,
      filters: normalizedFilters,
      ...(typeof input.sortBy === "string" ? { sortBy: input.sortBy } : {}),
      ...(input.sortDir === "asc" || input.sortDir === "desc" ? { sortDir: input.sortDir } : {}),
      ...(typeof input.limit === "number" ? { limit: input.limit } : {}),
      ...(typeof input.canonicalVersionTag === "string"
        ? { canonicalVersionTag: input.canonicalVersionTag }
        : {}),
    },
  };
}

export function validateStrategyDSL(json: unknown): DSLValidationResult<StrategyDSL> {
  return parseStrategyDSL(json);
}

export function validateScreenerDSL(json: unknown): DSLValidationResult<ScreenerDSL> {
  return parseScreenerDSL(json);
}

/**
 * Backward-compatible wrappers used by existing imports.
 */
export function parseDSL(json: unknown): { dsl: StrategyDSL | null; errors: string[] } {
  const result = parseStrategyDSL(json);
  return {
    dsl: result.normalized,
    errors: result.errors.map((e) => `${e.path}: ${e.message}`),
  };
}

export function validateDSL(json: unknown): { valid: boolean; errors: string[] } {
  const result = parseStrategyDSL(json);
  return {
    valid: result.valid,
    errors: result.errors.map((e) => `${e.path}: ${e.message}`),
  };
}

