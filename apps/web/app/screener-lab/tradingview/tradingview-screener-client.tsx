"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type {
  TvFilterInput,
  TvScreenerColumn,
  TvScreenerField,
  TvScreenerOperator,
  TvScreenerResultRow,
  TvScreenerType,
  TvSelectedField,
} from "@/types/tv-screener";

type FieldResponse = {
  screenerType: TvScreenerType;
  screener: {
    name: string;
    fieldClass: string;
    fieldCount: number;
    hasIndex: boolean;
    hasMarket: boolean;
  };
  fields: TvScreenerField[];
  total: number;
  screeners: Array<{
    key: TvScreenerType;
    name: string;
    fieldClass: string;
    fieldCount: number;
    hasIndex: boolean;
    hasMarket: boolean;
  }>;
  operators: Array<{ name: string; symbol: string; label: string }>;
  indices: Array<{ name: string; label: string; symbol: string }>;
  markets: Array<{ name: string; label: string }>;
  sectors: Array<{ value: string; label: string }>;
  categories: string[];
  timeIntervals: Array<{ value: string; label: string }>;
};

type QueryResponse = {
  screenerType: TvScreenerType;
  endpoint: string;
  request: unknown;
  columns: TvScreenerColumn[];
  results: TvScreenerResultRow[];
  total: number;
  warning: string;
};

type EditableFilter = TvFilterInput & { id: string };

const SCREENER_PRESETS: Record<TvScreenerType, Record<string, string[]>> = {
  stock: {
    Basic: [
      "NAME",
      "DESCRIPTION",
      "PRICE",
      "CHANGE_PERCENT",
      "VOLUME",
      "MARKET_CAPITALIZATION",
    ],
    Technical: [
      "NAME",
      "PRICE",
      "CHANGE_PERCENT",
      "RELATIVE_STRENGTH_INDEX_14",
      "MACD_LEVEL_12_26",
      "SIMPLE_MOVING_AVERAGE_50",
      "SIMPLE_MOVING_AVERAGE_200",
    ],
    Performance: [
      "NAME",
      "PRICE",
      "CHANGE_PERCENT",
      "WEEKLY_PERFORMANCE",
      "MONTHLY_PERFORMANCE",
      "MONTH_PERFORMANCE_3",
      "YTD_PERFORMANCE",
    ],
    Valuation: [
      "NAME",
      "PRICE",
      "MARKET_CAPITALIZATION",
      "PRICE_TO_EARNINGS_RATIO_TTM",
      "PRICE_TO_BOOK_MRQ",
      "PRICE_TO_SALES_FY",
    ],
  },
  crypto: {
    Basic: [
      "NAME",
      "DESCRIPTION",
      "PRICE",
      "CHANGE_PERCENT",
      "VOLUME_24H_IN_USD",
      "MARKET_CAPITALIZATION",
    ],
    Technical: [
      "NAME",
      "PRICE",
      "CHANGE_PERCENT",
      "RELATIVE_STRENGTH_INDEX_14",
      "MACD_LEVEL_12_26",
    ],
    Performance: [
      "NAME",
      "PRICE",
      "CHANGE_PERCENT",
      "WEEKLY_PERFORMANCE",
      "MONTHLY_PERFORMANCE",
    ],
  },
  forex: {
    Basic: [
      "NAME",
      "DESCRIPTION",
      "CHANGE_PERCENT",
      "BID",
      "ASK",
      "HIGH",
      "LOW",
    ],
    Technical: [
      "NAME",
      "CHANGE_PERCENT",
      "RELATIVE_STRENGTH_INDEX_14",
      "MACD_LEVEL_12_26",
    ],
  },
  bond: {
    Basic: [
      "NAME",
      "CLOSE",
      "CHANGE",
      "VOLUME",
      "COUPON",
      "CURRENT_YIELD",
      "YIELD_TO_MATURITY",
    ],
  },
  futures: {
    Basic: [
      "NAME",
      "DESCRIPTION",
      "CLOSE",
      "CHANGE",
      "VOLUME",
      "OPEN",
      "HIGH",
      "LOW",
    ],
    Technical: ["NAME", "CHANGE", "RSI", "MACD_MACD", "SMA50", "SMA200"],
  },
  coin: {
    Basic: ["NAME", "DESCRIPTION", "CLOSE", "CHANGE", "VOLUME", "MARKET_CAP"],
    Technical: [
      "NAME",
      "CLOSE",
      "CHANGE",
      "RSI",
      "MACD_MACD",
      "SMA50",
      "SMA200",
    ],
  },
};

const DEFAULT_FILTER_FIELD: Record<TvScreenerType, string> = {
  stock: "PRICE",
  crypto: "PRICE",
  forex: "PRICE",
  bond: "CLOSE",
  futures: "CLOSE",
  coin: "CLOSE",
};

const OPERATOR_OPTIONS: Array<{ value: TvScreenerOperator; label: string }> = [
  { value: ">", label: ">" },
  { value: ">=", label: ">=" },
  { value: "<", label: "<" },
  { value: "<=", label: "<=" },
  { value: "==", label: "=" },
  { value: "!=", label: "!=" },
  { value: "between", label: "Between" },
  { value: "isin", label: "In list" },
  { value: "not_in", label: "Not in list" },
  { value: "match", label: "Text match" },
  { value: "crosses_above", label: "Crosses above" },
  { value: "crosses_below", label: "Crosses below" },
];

const STORAGE_KEY = "ibo.tradingview-screener.v1";

function classNames(...values: Array<string | false | null | undefined>) {
  return values.filter(Boolean).join(" ");
}

function makeFilter(field = "PRICE"): EditableFilter {
  return {
    id: String(Date.now() + Math.random()),
    field,
    operator: ">",
    value: "",
    value2: "",
    interval: "default",
    history: 0,
  };
}

function formatCell(value: unknown, format: string | null): string {
  if (value === null || value === undefined || value === "") return "--";
  if (typeof value === "number") {
    if (format === "percent")
      return `${value.toFixed(Math.abs(value) >= 100 ? 1 : 2)}%`;
    if (Math.abs(value) >= 1_000_000_000)
      return `${(value / 1_000_000_000).toFixed(2)}B`;
    if (Math.abs(value) >= 1_000_000)
      return `${(value / 1_000_000).toFixed(2)}M`;
    if (Math.abs(value) >= 1_000) return `${(value / 1_000).toFixed(2)}K`;
    return Number.isInteger(value) ? String(value) : value.toFixed(2);
  }
  return String(value);
}

function isPositive(value: unknown) {
  return typeof value === "number" && value > 0;
}

function isNegative(value: unknown) {
  return typeof value === "number" && value < 0;
}

export function TradingViewScreenerClient() {
  const [screenerType, setScreenerType] = useState<TvScreenerType>("stock");
  const [market, setMarket] = useState("INDIA");
  const [index, setIndex] = useState("");
  const [search, setSearch] = useState("");
  const [fieldSearch, setFieldSearch] = useState("");
  const [category, setCategory] = useState("");
  const [fields, setFields] = useState<TvScreenerField[]>([]);
  const [meta, setMeta] = useState<FieldResponse | null>(null);
  const [selectedFields, setSelectedFields] = useState<TvSelectedField[]>([
    { name: "NAME" },
    { name: "PRICE" },
    { name: "CHANGE_PERCENT" },
    { name: "VOLUME" },
    { name: "MARKET_CAPITALIZATION" },
  ]);
  const [selectAll, setSelectAll] = useState(false);
  const [filters, setFilters] = useState<EditableFilter[]>([]);
  const [sortField, setSortField] = useState("");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [limit, setLimit] = useState(100);
  const [loadingFields, setLoadingFields] = useState(false);
  const [running, setRunning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<QueryResponse | null>(null);
  const [showPayload, setShowPayload] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      const saved = JSON.parse(raw) as Partial<{
        screenerType: TvScreenerType;
        market: string;
        selectedFields: TvSelectedField[];
        filters: EditableFilter[];
        sortField: string;
        sortOrder: "asc" | "desc";
        limit: number;
      }>;
      if (saved.screenerType) setScreenerType(saved.screenerType);
      if (saved.market) setMarket(saved.market);
      if (Array.isArray(saved.selectedFields))
        setSelectedFields(saved.selectedFields);
      if (Array.isArray(saved.filters)) setFilters(saved.filters);
      if (saved.sortField) setSortField(saved.sortField);
      if (saved.sortOrder) setSortOrder(saved.sortOrder);
      if (saved.limit) setLimit(saved.limit);
    } catch {
      // Ignore invalid local state.
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        screenerType,
        market,
        selectedFields,
        filters,
        sortField,
        sortOrder,
        limit,
      }),
    );
  }, [
    screenerType,
    market,
    selectedFields,
    filters,
    sortField,
    sortOrder,
    limit,
  ]);

  const loadFields = useCallback(async () => {
    setLoadingFields(true);
    try {
      const params = new URLSearchParams({
        type: screenerType,
        q: fieldSearch,
        category,
        limit: "180",
      });
      const response = await fetch(
        `/api/tv-screener/fields?${params.toString()}`,
      );
      const payload = await response.json();
      if (!response.ok)
        throw new Error(payload.error ?? "Failed to load TradingView fields");
      setMeta(payload.data);
      setFields(payload.data.fields);
    } catch (fieldError) {
      setError(
        fieldError instanceof Error
          ? fieldError.message
          : "Failed to load TradingView fields",
      );
    } finally {
      setLoadingFields(false);
    }
  }, [screenerType, fieldSearch, category]);

  useEffect(() => {
    void loadFields();
  }, [loadFields]);

  const fieldByName = useMemo(() => {
    const map = new Map<string, TvScreenerField>();
    for (const field of fields) map.set(field.name, field);
    return map;
  }, [fields]);

  const toggleSelectedField = (field: TvScreenerField) => {
    setSelectAll(false);
    setSelectedFields((current) => {
      if (current.some((item) => item.name === field.name)) {
        return current.filter((item) => item.name !== field.name);
      }
      return [...current, { name: field.name }];
    });
  };

  const applyPreset = (names: string[]) => {
    setSelectAll(false);
    setSelectedFields(names.map((name) => ({ name })));
  };

  const updateFilter = (id: string, patch: Partial<EditableFilter>) => {
    setFilters((current) =>
      current.map((filter) =>
        filter.id === id ? { ...filter, ...patch } : filter,
      ),
    );
  };

  const run = async (dryRun = false) => {
    setRunning(true);
    setError(null);
    try {
      const response = await fetch("/api/tv-screener/query", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          screenerType,
          market,
          index: index || undefined,
          search,
          fields: selectedFields,
          selectAll,
          filters: filters.filter(
            (filter) => filter.field && String(filter.value).length > 0,
          ),
          sortField: sortField || undefined,
          sortOrder,
          limit,
          dryRun,
        }),
      });
      const payload = await response.json();
      if (!response.ok)
        throw new Error(payload.error ?? "TradingView query failed");
      setResult(payload.data);
      if (dryRun) setShowPayload(true);
    } catch (runError) {
      setError(
        runError instanceof Error
          ? runError.message
          : "Unknown TradingView screener error",
      );
    } finally {
      setRunning(false);
    }
  };

  const exportCsv = () => {
    if (!result?.results.length) return;
    const headers = ["symbol", ...result.columns.map((column) => column.label)];
    const lines = result.results.map((row) => [
      row.symbol,
      ...result.columns.map((column) =>
        String(row.values[column.key] ?? "").replaceAll(",", ";"),
      ),
    ]);
    const csv = [headers, ...lines].map((line) => line.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `tradingview-${screenerType}-screener.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const currentPresets = SCREENER_PRESETS[screenerType] ?? {};
  const selectedCount = selectAll
    ? (meta?.screener.fieldCount ?? 0)
    : selectedFields.length;
  const screenerTabs = meta?.screeners ?? [
    {
      key: "stock" as const,
      name: "Stock Screener",
      fieldClass: "StockField",
      fieldCount: 0,
      hasIndex: true,
      hasMarket: true,
    },
  ];

  return (
    <div className="grid gap-5 xl:grid-cols-[360px_minmax(0,1fr)]">
      <aside className="space-y-4">
        <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-500">
            Universe
          </p>
          <div className="mt-3 grid grid-cols-2 gap-2">
            {screenerTabs.map((item) => (
              <button
                key={item.key}
                type="button"
                onClick={() => {
                  setScreenerType(item.key);
                  setSelectedFields(
                    (SCREENER_PRESETS[item.key]?.Basic ?? []).map((name) => ({
                      name,
                    })),
                  );
                  setFilters([]);
                  setSortField("");
                  setResult(null);
                }}
                className={classNames(
                  "rounded-xl border px-3 py-2 text-left text-sm font-semibold",
                  screenerType === item.key
                    ? "border-cyan-300 bg-cyan-50 text-cyan-900"
                    : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50",
                )}
              >
                {item.name.replace(" Screener", "")}
                <span className="block text-[11px] font-medium text-slate-500">
                  {item.fieldCount ?? ""} fields
                </span>
              </button>
            ))}
          </div>

          <div className="mt-4 grid gap-3">
            {meta?.screener.hasMarket ? (
              <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Market
                <select
                  value={market}
                  onChange={(event) => setMarket(event.target.value)}
                  className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm normal-case tracking-normal text-slate-900"
                >
                  {(meta?.markets ?? []).map((item) => (
                    <option key={item.name} value={item.name}>
                      {item.label}
                    </option>
                  ))}
                </select>
              </label>
            ) : null}

            {meta?.screener.hasIndex ? (
              <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Index
                <select
                  value={index}
                  onChange={(event) => setIndex(event.target.value)}
                  className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm normal-case tracking-normal text-slate-900"
                >
                  <option value="">No index filter</option>
                  {(meta?.indices ?? []).map((item) => (
                    <option key={item.name} value={item.name}>
                      {item.label}
                    </option>
                  ))}
                </select>
              </label>
            ) : null}

            <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Search Symbol / Description
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="RELIANCE, bank, energy"
                className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm normal-case tracking-normal text-slate-900"
              />
            </label>
          </div>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex items-center justify-between gap-3">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-500">
              Filters
            </p>
            <button
              type="button"
              onClick={() =>
                setFilters((current) => [
                  ...current,
                  makeFilter(DEFAULT_FILTER_FIELD[screenerType]),
                ])
              }
              className="rounded-lg bg-slate-900 px-2.5 py-1.5 text-xs font-semibold text-white"
            >
              Add
            </button>
          </div>
          <div className="mt-3 space-y-3">
            {filters.length === 0 ? (
              <p className="text-sm text-slate-500">
                No filters. Add TradingView field conditions.
              </p>
            ) : null}
            {filters.map((filter) => {
              const selectedField = fieldByName.get(filter.field);
              return (
                <div
                  key={filter.id}
                  className="rounded-xl border border-slate-200 bg-slate-50 p-3"
                >
                  <div className="grid gap-2">
                    <select
                      value={filter.field}
                      onChange={(event) =>
                        updateFilter(filter.id, { field: event.target.value })
                      }
                      className="w-full rounded-lg border border-slate-300 bg-white px-2 py-2 text-sm"
                    >
                      {fields.map((field) => (
                        <option key={field.name} value={field.name}>
                          {field.label}
                        </option>
                      ))}
                    </select>
                    <div className="grid grid-cols-[120px_minmax(0,1fr)] gap-2">
                      <select
                        value={filter.operator}
                        onChange={(event) =>
                          updateFilter(filter.id, {
                            operator: event.target.value as TvScreenerOperator,
                          })
                        }
                        className="rounded-lg border border-slate-300 bg-white px-2 py-2 text-sm"
                      >
                        {OPERATOR_OPTIONS.map((item) => (
                          <option key={item.value} value={item.value}>
                            {item.label}
                          </option>
                        ))}
                      </select>
                      <input
                        value={String(filter.value ?? "")}
                        onChange={(event) =>
                          updateFilter(filter.id, { value: event.target.value })
                        }
                        placeholder={
                          filter.operator === "isin" ||
                          filter.operator === "not_in"
                            ? "A, B, C"
                            : "Value"
                        }
                        className="rounded-lg border border-slate-300 bg-white px-2 py-2 text-sm"
                      />
                    </div>
                    {filter.operator === "between" ? (
                      <input
                        value={String(filter.value2 ?? "")}
                        onChange={(event) =>
                          updateFilter(filter.id, {
                            value2: event.target.value,
                          })
                        }
                        placeholder="Upper value"
                        className="rounded-lg border border-slate-300 bg-white px-2 py-2 text-sm"
                      />
                    ) : null}
                    {selectedField?.interval ? (
                      <select
                        value={filter.interval ?? "default"}
                        onChange={(event) =>
                          updateFilter(filter.id, {
                            interval: event.target.value,
                          })
                        }
                        className="rounded-lg border border-slate-300 bg-white px-2 py-2 text-sm"
                      >
                        <option value="default">Default interval</option>
                        {(meta?.timeIntervals ?? []).map((item) => (
                          <option key={item.value} value={item.value}>
                            {item.label}
                          </option>
                        ))}
                      </select>
                    ) : null}
                    {selectedField?.historical ? (
                      <input
                        type="number"
                        min={0}
                        max={20}
                        value={filter.history ?? 0}
                        onChange={(event) =>
                          updateFilter(filter.id, {
                            history: Number(event.target.value),
                          })
                        }
                        className="rounded-lg border border-slate-300 bg-white px-2 py-2 text-sm"
                        aria-label="Historical bars back"
                      />
                    ) : null}
                    <button
                      type="button"
                      onClick={() =>
                        setFilters((current) =>
                          current.filter((item) => item.id !== filter.id),
                        )
                      }
                      className="justify-self-start rounded-lg border border-rose-200 bg-rose-50 px-2.5 py-1.5 text-xs font-semibold text-rose-700"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      </aside>

      <main className="min-w-0 space-y-4">
        <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-500">
                Fields
              </p>
              <p className="text-sm text-slate-500">
                {selectedCount} selected. Showing {fields.length} of{" "}
                {meta?.total ?? 0} matched fields.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              {Object.entries(currentPresets).map(([label, names]) => (
                <button
                  key={label}
                  type="button"
                  onClick={() => applyPreset(names)}
                  className="rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                >
                  {label}
                </button>
              ))}
              <button
                type="button"
                onClick={() => setSelectAll((current) => !current)}
                className="rounded-lg border border-cyan-200 bg-cyan-50 px-2.5 py-1.5 text-xs font-semibold text-cyan-800"
              >
                {selectAll ? "Use selected" : "Select all"}
              </button>
            </div>
          </div>

          <div className="mt-3 grid gap-3 md:grid-cols-[minmax(0,1fr)_220px]">
            <input
              value={fieldSearch}
              onChange={(event) => setFieldSearch(event.target.value)}
              placeholder="Search 13,000+ fields: RSI, market cap, SMA..."
              className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm"
            />
            <select
              value={category}
              onChange={(event) => setCategory(event.target.value)}
              className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm"
            >
              <option value="">All categories</option>
              {(meta?.categories ?? []).map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </div>

          <div className="mt-3 grid max-h-[340px] gap-2 overflow-auto rounded-xl border border-slate-200 bg-slate-50 p-2 md:grid-cols-2 xl:grid-cols-3">
            {loadingFields ? (
              <p className="p-2 text-sm text-slate-500">Loading fields...</p>
            ) : null}
            {!loadingFields && fields.length === 0 ? (
              <p className="p-2 text-sm text-slate-500">No fields match.</p>
            ) : null}
            {fields.map((field) => {
              const checked =
                selectAll ||
                selectedFields.some((item) => item.name === field.name);
              return (
                <label
                  key={field.name}
                  className={classNames(
                    "rounded-lg border px-2.5 py-2 text-sm",
                    checked
                      ? "border-cyan-300 bg-white text-cyan-950"
                      : "border-slate-200 bg-white text-slate-700",
                  )}
                >
                  <div className="flex items-start gap-2">
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => toggleSelectedField(field)}
                      className="mt-1"
                    />
                    <span className="min-w-0">
                      <span className="block truncate font-semibold">
                        {field.label}
                      </span>
                      <span className="block truncate text-xs text-slate-500">
                        {field.name} • {field.category}
                      </span>
                    </span>
                  </div>
                </label>
              );
            })}
          </div>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_140px_120px_140px]">
            <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Sort Field
              <select
                value={sortField}
                onChange={(event) => setSortField(event.target.value)}
                className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm normal-case tracking-normal text-slate-900"
              >
                <option value="">Default sort</option>
                {fields.map((field) => (
                  <option key={field.name} value={field.name}>
                    {field.label}
                  </option>
                ))}
              </select>
            </label>
            <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Order
              <select
                value={sortOrder}
                onChange={(event) =>
                  setSortOrder(event.target.value as "asc" | "desc")
                }
                className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm normal-case tracking-normal text-slate-900"
              >
                <option value="desc">Desc</option>
                <option value="asc">Asc</option>
              </select>
            </label>
            <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Limit
              <input
                type="number"
                min={1}
                max={500}
                value={limit}
                onChange={(event) => setLimit(Number(event.target.value))}
                className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm normal-case tracking-normal text-slate-900"
              />
            </label>
            <div className="flex items-end gap-2">
              <button
                type="button"
                onClick={() => void run(false)}
                disabled={running}
                className="flex-1 rounded-xl bg-slate-950 px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-60"
              >
                {running ? "Running" : "Run"}
              </button>
              <button
                type="button"
                onClick={() => void run(true)}
                disabled={running}
                className="rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm font-semibold text-slate-700"
              >
                JSON
              </button>
            </div>
          </div>

          <p className="mt-3 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-900">
            Unofficial TradingView public screener access. Research only. Verify
            live quote, liquidity, and risk before action.
          </p>
          {error ? (
            <p className="mt-3 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
              {error}
            </p>
          ) : null}
        </section>

        {result ? (
          <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 p-4">
              <div>
                <p className="text-sm font-semibold text-slate-900">
                  {result.results.length} shown / {result.total} total
                </p>
                <p className="text-xs text-slate-500">{result.endpoint}</p>
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={exportCsv}
                  className="rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-xs font-semibold text-slate-700"
                >
                  Export CSV
                </button>
                <button
                  type="button"
                  onClick={() => setShowPayload((current) => !current)}
                  className="rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-xs font-semibold text-slate-700"
                >
                  {showPayload ? "Hide Payload" : "Show Payload"}
                </button>
              </div>
            </div>

            {showPayload ? (
              <pre className="max-h-96 overflow-auto border-b border-slate-200 bg-slate-950 p-4 text-xs text-slate-100">
                {JSON.stringify(result.request, null, 2)}
              </pre>
            ) : null}

            <div className="overflow-auto">
              <table className="min-w-full text-sm">
                <thead className="sticky top-0 bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
                  <tr>
                    <th className="whitespace-nowrap px-3 py-2 font-semibold">
                      Symbol
                    </th>
                    {result.columns.map((column) => (
                      <th
                        key={column.key}
                        className="whitespace-nowrap px-3 py-2 font-semibold"
                      >
                        {column.label}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {result.results.map((row) => (
                    <tr
                      key={row.symbol}
                      className="border-t border-slate-100 hover:bg-slate-50"
                    >
                      <td className="whitespace-nowrap px-3 py-2 font-semibold text-slate-900">
                        {row.symbol}
                      </td>
                      {result.columns.map((column) => {
                        const value = row.values[column.key];
                        return (
                          <td
                            key={`${row.symbol}-${column.key}`}
                            className={classNames(
                              "whitespace-nowrap px-3 py-2 tabular-nums",
                              isPositive(value) &&
                                column.format === "percent" &&
                                "text-emerald-700",
                              isNegative(value) &&
                                column.format === "percent" &&
                                "text-rose-700",
                            )}
                          >
                            {formatCell(value, column.format)}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {result.results.length === 0 ? (
              <p className="p-4 text-sm text-slate-500">
                No rows returned. Loosen filters or run payload preview.
              </p>
            ) : null}
          </section>
        ) : null}
      </main>
    </div>
  );
}
