export type TvScreenerType =
  | "stock"
  | "crypto"
  | "forex"
  | "bond"
  | "futures"
  | "coin";

export type TvScreenerOperator =
  | ">"
  | ">="
  | "<"
  | "<="
  | "=="
  | "!="
  | "between"
  | "isin"
  | "not_in"
  | "match"
  | "crosses"
  | "crosses_above"
  | "crosses_below";

export interface TvScreenerField {
  name: string;
  label: string;
  fieldName: string;
  format: string | null;
  interval: boolean;
  historical: boolean;
  category: string;
}

export interface TvScreenerConfig {
  name: string;
  class: string;
  fieldClass: string;
  hasIndex?: boolean;
  hasMarket?: boolean;
  fields: TvScreenerField[];
}

export interface TvScreenerFieldData {
  screeners: Record<TvScreenerType, TvScreenerConfig>;
  operators: Array<{ name: string; symbol: string; label: string }>;
  indices: Array<{ name: string; label: string; symbol: string }>;
  markets: Array<{ name: string; label: string }>;
  symbolTypes?: Array<{ name: string; label: string }>;
  sectors?: Array<{ value: string; label: string }>;
  timeIntervals: Array<{ value: string; label: string }>;
  categories: string[];
}

export interface TvSelectedField {
  name: string;
  interval?: string;
  history?: number;
}

export interface TvFilterInput {
  id?: string;
  field: string;
  operator: TvScreenerOperator;
  value: string | number | boolean | Array<string | number | boolean>;
  value2?: string | number | boolean;
  interval?: string;
  history?: number;
}

export interface TvScreenerQueryInput {
  screenerType: TvScreenerType;
  market?: string;
  index?: string;
  search?: string;
  fields?: TvSelectedField[];
  selectAll?: boolean;
  filters?: TvFilterInput[];
  sortField?: string;
  sortOrder?: "asc" | "desc";
  limit?: number;
  offset?: number;
  dryRun?: boolean;
}

export interface TvScreenerColumn {
  key: string;
  label: string;
  format: string | null;
  fieldName: string;
}

export interface TvScreenerResultRow {
  symbol: string;
  values: Record<string, unknown>;
}

export interface TvScreenerQueryResult {
  screenerType: TvScreenerType;
  endpoint: string;
  request: unknown;
  columns: TvScreenerColumn[];
  results: TvScreenerResultRow[];
  total: number;
  source: "tradingview";
  warning: string;
}
