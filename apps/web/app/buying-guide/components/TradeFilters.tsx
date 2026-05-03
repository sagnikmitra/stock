import type { BuyingGuideFilters, BuyingGuideSortKey, BuyingGuideStock } from "@/types/buying-guide";
import { getTradeStatus, normalizeLabel } from "@/lib/buying-guide-utils";

interface TradeFiltersProps {
  stocks: BuyingGuideStock[];
  filters: BuyingGuideFilters;
  sortKey: BuyingGuideSortKey;
  onFiltersChange: (filters: BuyingGuideFilters) => void;
  onSortChange: (sortKey: BuyingGuideSortKey) => void;
  viewMode: "cards" | "table";
  onViewModeChange: (mode: "cards" | "table") => void;
}

const SORT_OPTIONS: Array<{ value: BuyingGuideSortKey; label: string }> = [
  { value: "rank", label: "Rank" },
  { value: "setupScore", label: "Setup score" },
  { value: "rewardRiskT2", label: "R:R to T2" },
  { value: "distanceFromBuyZone", label: "Distance from buy zone" },
  { value: "riskPerShare", label: "Risk per share" },
  { value: "latestPrice", label: "Latest price" },
  { value: "sector", label: "Sector" },
];

export function TradeFilters({
  stocks,
  filters,
  sortKey,
  onFiltersChange,
  onSortChange,
  viewMode,
  onViewModeChange,
}: TradeFiltersProps) {
  const sectors = unique(stocks.map((stock) => stock.sector));
  const riskGrades = unique(stocks.map((stock) => stock.risk_grade));
  const strategies = unique(stocks.map((stock) => stock.primary_strategy));
  const verdicts = unique(stocks.map((stock) => stock.verdict));
  const statuses = unique(stocks.map((stock) => getTradeStatus(stock)));

  const update = <K extends keyof BuyingGuideFilters>(key: K, value: BuyingGuideFilters[K]) => {
    onFiltersChange({ ...filters, [key]: value });
  };

  return (
    <section className="rounded-2xl border border-slate-200 bg-white/90 p-4 shadow-[0_8px_24px_rgba(15,23,42,0.06)]">
      <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-base font-bold text-slate-950">Watchlist Filters</h2>
          <p className="text-xs text-slate-500">Fast scan by status, risk, strategy, and setup score.</p>
        </div>
        <div className="inline-flex rounded-xl border border-slate-200 bg-slate-50 p-1">
          {(["cards", "table"] as const).map((mode) => (
            <button
              key={mode}
              type="button"
              onClick={() => onViewModeChange(mode)}
              className={`rounded-lg px-3 py-1.5 text-xs font-bold ${viewMode === mode ? "bg-slate-950 text-white" : "text-slate-600 hover:bg-white"}`}
            >
              {mode === "cards" ? "Cards" : "Table"}
            </button>
          ))}
        </div>
      </div>

      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        <Select label="Sector" value={filters.sector} onChange={(value) => update("sector", value)} options={sectors} />
        <Select label="Risk grade" value={filters.riskGrade} onChange={(value) => update("riskGrade", value)} options={riskGrades} />
        <Select label="Strategy" value={filters.strategy} onChange={(value) => update("strategy", value)} options={strategies} />
        <Select label="Verdict" value={filters.verdict} onChange={(value) => update("verdict", value)} options={verdicts} />
        <Select label="Status" value={filters.status} onChange={(value) => update("status", value)} options={statuses} />
        <label className="block">
          <span className="mb-1 block text-xs font-bold uppercase tracking-wide text-slate-500">Sort by</span>
          <select
            value={sortKey}
            onChange={(event) => onSortChange(event.target.value as BuyingGuideSortKey)}
            className="h-10 w-full rounded-xl border border-slate-300 bg-white px-3 text-sm font-semibold text-slate-700"
          >
            {SORT_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>{option.label}</option>
            ))}
          </select>
        </label>
        <label className="block">
          <span className="mb-1 block text-xs font-bold uppercase tracking-wide text-slate-500">Min setup score</span>
          <input
            type="range"
            min={0}
            max={100}
            value={filters.minScore}
            onChange={(event) => update("minScore", Number(event.target.value))}
            className="mt-3 w-full accent-slate-950"
          />
          <span className="text-xs font-bold text-slate-600">{filters.minScore}+</span>
        </label>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        <Toggle label="Near buy zone only" checked={filters.nearBuyZoneOnly} onChange={(checked) => update("nearBuyZoneOnly", checked)} />
        <Toggle label="Only top 5" checked={filters.topFiveOnly} onChange={(checked) => update("topFiveOnly", checked)} />
        <Toggle label="Hide invalidated" checked={filters.hideInvalidated} onChange={(checked) => update("hideInvalidated", checked)} />
        <Toggle label="Hide event-risk trades" checked={filters.hideEventRisk} onChange={(checked) => update("hideEventRisk", checked)} />
        <button
          type="button"
          onClick={() =>
            onFiltersChange({
              sector: "All",
              riskGrade: "All",
              strategy: "All",
              verdict: "All",
              status: "All",
              minScore: 0,
              nearBuyZoneOnly: false,
              topFiveOnly: false,
              hideInvalidated: true,
              hideEventRisk: false,
            })
          }
          className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-bold text-slate-700 hover:border-slate-950"
        >
          Reset
        </button>
      </div>
    </section>
  );
}

function Select({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: string[];
  onChange: (value: string) => void;
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-bold uppercase tracking-wide text-slate-500">{label}</span>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="h-10 w-full rounded-xl border border-slate-300 bg-white px-3 text-sm font-semibold text-slate-700"
      >
        <option value="All">All</option>
        {options.map((option) => (
          <option key={option} value={option}>{normalizeLabel(option)}</option>
        ))}
      </select>
    </label>
  );
}

function Toggle({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <label className={`inline-flex cursor-pointer items-center gap-2 rounded-lg border px-3 py-2 text-xs font-bold ${checked ? "border-slate-950 bg-slate-950 text-white" : "border-slate-200 bg-white text-slate-600"}`}>
      <input
        type="checkbox"
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
        className="sr-only"
      />
      <span className={`h-3 w-3 rounded-sm border ${checked ? "border-white bg-white" : "border-slate-400 bg-white"}`} />
      {label}
    </label>
  );
}

function unique(values: string[]): string[] {
  return Array.from(new Set(values.filter(Boolean))).sort((a, b) => a.localeCompare(b));
}
