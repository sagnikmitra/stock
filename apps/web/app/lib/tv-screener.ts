import fieldDataJson from "@/data/tvscreener-field-data.json";
import type {
  TvFilterInput,
  TvScreenerColumn,
  TvScreenerField,
  TvScreenerFieldData,
  TvScreenerOperator,
  TvScreenerQueryInput,
  TvScreenerQueryResult,
  TvScreenerType,
  TvSelectedField,
} from "@/types/tv-screener";

const FIELD_DATA = fieldDataJson as TvScreenerFieldData;

const SCREENER_ENDPOINT: Record<TvScreenerType, string> = {
  stock: "global",
  crypto: "crypto",
  forex: "forex",
  bond: "bond",
  futures: "futures",
  coin: "coin",
};

const DEFAULT_SORT_FIELD: Partial<Record<TvScreenerType, string>> = {
  stock: "MARKET_CAPITALIZATION",
  crypto: "VOLUME_24H_IN_USD",
  forex: "NAME",
  bond: "VOLUME",
  futures: "VOLUME",
  coin: "MARKET_CAP",
};

const DEFAULT_FIELDS: Record<TvScreenerType, string[]> = {
  stock: [
    "NAME",
    "DESCRIPTION",
    "PRICE",
    "CHANGE_PERCENT",
    "VOLUME",
    "MARKET_CAPITALIZATION",
    "SECTOR",
    "INDUSTRY",
  ],
  crypto: [
    "NAME",
    "DESCRIPTION",
    "PRICE",
    "CHANGE_PERCENT",
    "VOLUME_24H_IN_USD",
    "MARKET_CAPITALIZATION",
  ],
  forex: ["NAME", "DESCRIPTION", "CHANGE_PERCENT", "BID", "ASK", "HIGH", "LOW"],
  bond: [
    "NAME",
    "CLOSE",
    "CHANGE",
    "VOLUME",
    "COUPON",
    "CURRENT_YIELD",
    "YIELD_TO_MATURITY",
  ],
  futures: [
    "NAME",
    "DESCRIPTION",
    "CLOSE",
    "CHANGE",
    "VOLUME",
    "OPEN",
    "HIGH",
    "LOW",
  ],
  coin: ["NAME", "DESCRIPTION", "CLOSE", "CHANGE", "VOLUME", "MARKET_CAP"],
};

const MARKET_VALUE: Record<string, string> = {
  ALL: "ALL",
  AMERICA: "america",
  UK: "uk",
  GERMANY: "germany",
  FRANCE: "france",
  JAPAN: "japan",
  CANADA: "canada",
  AUSTRALIA: "australia",
  INDIA: "india",
  BRAZIL: "brazil",
  CHINA: "china",
  HONG_KONG: "hongkong",
  HONGKONG: "hongkong",
  SWITZERLAND: "switzerland",
};

const OPERATION_VALUE: Record<TvScreenerOperator, string> = {
  ">": "greater",
  ">=": "egreater",
  "<": "less",
  "<=": "eless",
  "==": "equal",
  "!=": "nequal",
  between: "in_range",
  isin: "in_range",
  not_in: "not_in_range",
  match: "match",
  crosses: "crosses",
  crosses_above: "crosses_above",
  crosses_below: "crosses_below",
};

const REQUEST_HEADERS = {
  "Content-Type": "application/json",
  "User-Agent":
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
  Origin: "https://www.tradingview.com",
  Referer: "https://www.tradingview.com/",
};

type TradingViewPayloadFilter = {
  left: string;
  operation: string;
  right: unknown;
};

export function getTvScreenerFieldData(): TvScreenerFieldData {
  return FIELD_DATA;
}

export function getTvScreenerConfig(type: TvScreenerType) {
  return FIELD_DATA.screeners[type];
}

export function findTvField(
  type: TvScreenerType,
  name: string,
): TvScreenerField | null {
  return (
    FIELD_DATA.screeners[type]?.fields.find((field) => field.name === name) ??
    null
  );
}

export function searchTvFields(input: {
  type: TvScreenerType;
  query?: string;
  category?: string;
  limit?: number;
}): { fields: TvScreenerField[]; total: number } {
  const config = FIELD_DATA.screeners[input.type];
  const q = input.query?.trim().toLowerCase();
  const category = input.category?.trim();
  const limit = Math.max(20, Math.min(input.limit ?? 160, 500));
  const common = new Set(DEFAULT_FIELDS[input.type]);

  const fields = config.fields
    .filter((field) => {
      if (category && field.category !== category) return false;
      if (!q) return true;
      return (
        field.name.toLowerCase().includes(q) ||
        field.label.toLowerCase().includes(q) ||
        field.fieldName.toLowerCase().includes(q)
      );
    })
    .sort((a, b) => {
      const aCommon = common.has(a.name);
      const bCommon = common.has(b.name);
      if (aCommon && !bCommon) return -1;
      if (!aCommon && bCommon) return 1;
      return a.label.localeCompare(b.label);
    });

  return { fields: fields.slice(0, limit), total: fields.length };
}

export function normalizeTradingViewFieldName(fieldName: string): string {
  if (
    (fieldName.startsWith("change") ||
      fieldName.startsWith("relative_volume_intraday")) &&
    fieldName.includes(".")
  ) {
    const [, interval] = fieldName.split(".");
    if (
      interval &&
      (/^\d+$/.test(interval) || interval === "1W" || interval === "1M")
    ) {
      return fieldName.replace(/\./g, "|");
    }
  }
  return fieldName;
}

function fieldNameWithModifiers(
  field: TvScreenerField,
  input?: { interval?: string; history?: number },
): string {
  let base = normalizeTradingViewFieldName(field.fieldName);
  const root = base.split("|")[0]?.replace(/\[\d+\]$/, "") ?? base;

  if (input?.history && input.history > 0 && field.historical) {
    base = `${root}[${Math.min(99, Math.floor(input.history))}]`;
  }

  if (
    input?.interval &&
    input.interval !== "default" &&
    input.interval !== "1D" &&
    field.interval
  ) {
    base = `${base.split("|")[0]}|${input.interval}`;
  }

  return base;
}

function coerceFilterValue(
  value: TvFilterInput["value"] | TvFilterInput["value2"],
  field: TvScreenerField,
) {
  if (Array.isArray(value)) {
    return value.map((item) => coerceScalar(item, field));
  }
  return coerceScalar(value, field);
}

function coerceScalar(value: unknown, field: TvScreenerField) {
  if (typeof value === "boolean") return value;
  if (field.format !== "text" && field.format !== "bool") {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) return parsed;
  }
  if (field.format === "bool" && typeof value === "string") {
    if (value.toLowerCase() === "true") return true;
    if (value.toLowerCase() === "false") return false;
  }
  return String(value ?? "").trim();
}

function rightValueForFilter(filter: TvFilterInput, field: TvScreenerField) {
  if (filter.operator === "between") {
    return [
      coerceFilterValue(filter.value, field),
      coerceFilterValue(filter.value2 ?? filter.value, field),
    ];
  }
  if (filter.operator === "isin" || filter.operator === "not_in") {
    if (Array.isArray(filter.value))
      return coerceFilterValue(filter.value, field);
    return String(filter.value)
      .split(",")
      .map((item) => coerceFilterValue(item.trim(), field))
      .filter((item) => item !== "");
  }
  return coerceFilterValue(filter.value, field);
}

function buildFilters(
  type: TvScreenerType,
  filters: TvFilterInput[] = [],
): TradingViewPayloadFilter[] {
  const built: Array<TradingViewPayloadFilter | null> = filters.map(
    (filter) => {
      const field = findTvField(type, filter.field);
      if (!field) return null;
      const right = rightValueForFilter(filter, field);
      if (right === "" || (Array.isArray(right) && right.length === 0))
        return null;
      return {
        left: fieldNameWithModifiers(field, filter),
        operation: OPERATION_VALUE[filter.operator],
        right,
      };
    },
  );

  return built.filter(
    (filter): filter is TradingViewPayloadFilter => filter !== null,
  );
}

function selectedFieldsForQuery(
  type: TvScreenerType,
  input: TvScreenerQueryInput,
): TvSelectedField[] {
  if (input.selectAll) {
    return FIELD_DATA.screeners[type].fields.map((field) => ({
      name: field.name,
    }));
  }
  if (input.fields?.length) return input.fields;
  return DEFAULT_FIELDS[type].map((name) => ({ name }));
}

function buildColumns(
  type: TvScreenerType,
  input: TvScreenerQueryInput,
): TvScreenerColumn[] {
  const selected = selectedFieldsForQuery(type, input);
  const seen = new Set<string>();
  const columns: TvScreenerColumn[] = [];

  for (const item of selected) {
    const field = findTvField(type, item.name);
    if (!field || field.fieldName.startsWith("candlestick")) continue;
    const key = fieldNameWithModifiers(field, item);
    if (seen.has(key)) continue;
    seen.add(key);
    columns.push({
      key,
      label: field.label,
      format: field.format,
      fieldName: field.fieldName,
    });
  }

  if (!seen.has("update_mode")) {
    columns.push({
      key: "update_mode",
      label: "Update Mode",
      format: "text",
      fieldName: "update_mode",
    });
  }

  return columns;
}

function buildSymbols(input: TvScreenerQueryInput) {
  if (input.index) {
    const index = FIELD_DATA.indices.find((item) => item.name === input.index);
    if (index) return { symbolset: [index.symbol] };
  }

  if (input.screenerType === "forex") return { query: { types: ["forex"] } };
  return { query: { types: [] }, tickers: [] };
}

function buildSort(input: TvScreenerQueryInput) {
  const sortName = input.sortField || DEFAULT_SORT_FIELD[input.screenerType];
  if (!sortName) return null;
  const field = findTvField(input.screenerType, sortName);
  if (!field) return null;
  return {
    sortBy: normalizeTradingViewFieldName(field.fieldName),
    sortOrder: input.sortOrder ?? "desc",
  };
}

export function buildTradingViewPayload(input: TvScreenerQueryInput) {
  const type = input.screenerType;
  const columns = buildColumns(type, input);
  const offset = Math.max(0, Math.floor(input.offset ?? 0));
  const limit = Math.max(1, Math.min(500, Math.floor(input.limit ?? 100)));
  const payload: Record<string, unknown> = {
    filter: buildFilters(type, input.filters),
    options: { lang: "en" },
    symbols: buildSymbols(input),
    sort: buildSort(input),
    range: [offset, offset + limit],
    columns: columns.map((column) => column.key),
  };

  if (input.search?.trim()) {
    payload.filter = [
      ...(payload.filter as unknown[]),
      {
        left: "name,description",
        operation: "match",
        right: input.search.trim(),
      },
    ];
  }

  if (type === "stock") {
    const market = MARKET_VALUE[input.market ?? "INDIA"] ?? MARKET_VALUE.INDIA;
    if (market !== "ALL") payload.markets = [market];
  }

  if (type === "crypto" || type === "coin") {
    payload.price_conversion = { to_symbol: false };
  }

  return {
    endpoint: `https://scanner.tradingview.com/${SCREENER_ENDPOINT[type]}/scan`,
    payload,
    columns,
  };
}

export async function runTradingViewScreener(
  input: TvScreenerQueryInput,
): Promise<TvScreenerQueryResult> {
  const built = buildTradingViewPayload(input);

  if (input.dryRun) {
    return {
      screenerType: input.screenerType,
      endpoint: built.endpoint,
      request: built.payload,
      columns: built.columns,
      results: [],
      total: 0,
      source: "tradingview",
      warning: "Dry run only. No TradingView request executed.",
    };
  }

  const response = await fetch(built.endpoint, {
    method: "POST",
    headers: REQUEST_HEADERS,
    body: JSON.stringify(built.payload),
    signal: AbortSignal.timeout(30_000),
    cache: "no-store",
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(
      `TradingView screener request failed (${response.status}): ${body.slice(0, 400)}`,
    );
  }

  const json = (await response.json()) as {
    data?: Array<{ s: string; d: unknown[] }>;
    totalCount?: number;
  };
  const rows = (json.data ?? []).map((item) => {
    const values: Record<string, unknown> = {};
    built.columns.forEach((column, index) => {
      values[column.key] = item.d[index];
    });
    return {
      symbol: item.s,
      values,
    };
  });

  return {
    screenerType: input.screenerType,
    endpoint: built.endpoint,
    request: built.payload,
    columns: built.columns,
    results: rows,
    total: json.totalCount ?? rows.length,
    source: "tradingview",
    warning:
      "Unofficial TradingView public screener query. Use for research only and verify live prices before action.",
  };
}
