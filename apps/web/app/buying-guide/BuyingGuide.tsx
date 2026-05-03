"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Ban,
  Calculator,
  CheckSquare,
  ClipboardList,
  Shield,
  Star,
  Table2,
  Target,
} from "lucide-react";
import type {
  BuyingGuide as BuyingGuideType,
  BuyingGuideFilters,
  BuyingGuideSortKey,
  BuyingGuideStock,
} from "@/types/buying-guide";
import {
  formatCurrencyINR,
  formatRange,
  getDistanceFromBuyZone,
  getRiskPerShare,
  getRewardToRisk,
  getStatusColor,
  getStocksBySymbols,
  getTradeStatus,
  normalizeLabel,
} from "@/lib/buying-guide-utils";
import { AvoidList } from "./components/AvoidList";
import { BuyingGuideTabs, type BuyingGuideTabItem } from "./components/BuyingGuideTabs";
import { ConditionalBasket } from "./components/ConditionalBasket";
import { DefensiveBasket } from "./components/DefensiveBasket";
import { ExecutionChecklist } from "./components/ExecutionChecklist";
import { MarketRegimeHeader } from "./components/MarketRegimeHeader";
import { PositionSizeCalculator } from "./components/PositionSizeCalculator";
import { RiskAlertStrip } from "./components/RiskAlertStrip";
import { RiskRewardMiniChart } from "./components/RiskRewardMiniChart";
import { TradeCard } from "./components/TradeCard";
import { TradeDetailDrawer } from "./components/TradeDetailDrawer";
import { TradeFilters } from "./components/TradeFilters";
import { TradeTable } from "./components/TradeTable";

export type BuyingGuideTab =
  | "best"
  | "watchlist"
  | "defensive"
  | "conditional"
  | "avoid"
  | "execution"
  | "calculator";

interface BuyingGuideProps {
  guide: BuyingGuideType;
  initialSymbol?: string;
  initialTab?: BuyingGuideTab;
}

const DEFAULT_FILTERS: BuyingGuideFilters = {
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
};

export function BuyingGuide({ guide, initialSymbol, initialTab }: BuyingGuideProps) {
  const watchlist = useMemo(() => [...(guide.final_watchlist ?? [])].sort((a, b) => a.rank - b.rank), [guide.final_watchlist]);
  const initialStock = watchlist.find((stock) => stock.symbol === initialSymbol) ?? watchlist[0];
  const [activeTab, setActiveTab] = useState<BuyingGuideTab>(initialTab ?? "best");
  const [selectedStock, setSelectedStock] = useState<BuyingGuideStock | undefined>(initialStock);
  const [drawerStock, setDrawerStock] = useState<BuyingGuideStock | undefined>();
  const [filters, setFilters] = useState<BuyingGuideFilters>(DEFAULT_FILTERS);
  const [sortKey, setSortKey] = useState<BuyingGuideSortKey>("rank");
  const [viewMode, setViewMode] = useState<"cards" | "table">("cards");

  useEffect(() => {
    const storedTab = window.localStorage.getItem("buying-guide-active-tab") as BuyingGuideTab | null;
    const storedView = window.localStorage.getItem("buying-guide-view-mode") as "cards" | "table" | null;
    if (!initialTab && storedTab) setActiveTab(storedTab);
    if (storedView === "cards" || storedView === "table") setViewMode(storedView);
  }, [initialTab]);

  useEffect(() => {
    if (!initialSymbol) return;
    const next = watchlist.find((stock) => stock.symbol === initialSymbol);
    if (next) {
      setSelectedStock(next);
      setActiveTab(initialTab ?? "watchlist");
    }
  }, [initialSymbol, initialTab, watchlist]);

  const bestStocks = useMemo(() => {
    const fromBasket = getStocksBySymbols(guide, guide.highest_conviction_basket?.stocks);
    return fromBasket.length > 0 ? fromBasket : watchlist.slice(0, 5);
  }, [guide, watchlist]);

  const filteredStocks = useMemo(() => {
    const filtered = watchlist.filter((stock) => {
      const status = getTradeStatus(stock);
      if (filters.sector !== "All" && stock.sector !== filters.sector) return false;
      if (filters.riskGrade !== "All" && stock.risk_grade !== filters.riskGrade) return false;
      if (filters.strategy !== "All" && stock.primary_strategy !== filters.strategy) return false;
      if (filters.verdict !== "All" && stock.verdict !== filters.verdict) return false;
      if (filters.status !== "All" && status !== filters.status) return false;
      if (stock.setup_score_out_of_100 < filters.minScore) return false;
      if (filters.nearBuyZoneOnly && status !== "Near Buy Zone") return false;
      if (filters.topFiveOnly && stock.rank > 5) return false;
      if (filters.hideInvalidated && status === "Invalidated") return false;
      if (filters.hideEventRisk && isEventRisk(stock)) return false;
      return true;
    });

    return filtered.sort((a, b) => compareStocks(a, b, sortKey));
  }, [filters, sortKey, watchlist]);

  const tabs: Array<BuyingGuideTabItem<BuyingGuideTab>> = [
    { id: "best", label: "Best Trades", icon: Star, count: bestStocks.length },
    { id: "watchlist", label: "Watchlist", icon: Table2, count: watchlist.length },
    { id: "defensive", label: "Defensive", icon: Shield, count: guide.defensive_basket?.stocks.length },
    { id: "conditional", label: "Conditional", icon: Target, count: guide.conditional_basket?.stocks.length },
    { id: "avoid", label: "Avoid", icon: Ban, count: guide.excluded_or_low_priority?.length },
    { id: "execution", label: "Execution Plan", icon: CheckSquare },
    { id: "calculator", label: "Position Size", icon: Calculator },
  ];

  const setTab = (tab: BuyingGuideTab) => {
    setActiveTab(tab);
    window.localStorage.setItem("buying-guide-active-tab", tab);
  };

  const setPreferredViewMode = (mode: "cards" | "table") => {
    setViewMode(mode);
    window.localStorage.setItem("buying-guide-view-mode", mode);
  };

  const selectStock = (stock: BuyingGuideStock) => setSelectedStock(stock);
  const openDetails = (stock: BuyingGuideStock) => {
    setSelectedStock(stock);
    setDrawerStock(stock);
  };

  if (watchlist.length === 0) {
    return (
      <div className="rounded-2xl border border-amber-200 bg-amber-50 p-6 text-sm text-amber-900">
        No final_watchlist found. Paste a weekly buying-guide JSON with stocks before using this page.
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <MarketRegimeHeader guide={guide} />
      <RiskAlertStrip risks={guide.market_regime?.macro_risks} />
      <div className="rounded-2xl border border-slate-200 bg-white/90 p-4 text-sm leading-6 text-slate-600">
        <strong className="text-slate-950">Research cockpit only.</strong> {guide.disclaimer}
      </div>

      <BuyingGuideTabs tabs={tabs} activeTab={activeTab} onChange={setTab} />

      <div className="grid gap-5 xl:grid-cols-12">
        <main className="space-y-4 xl:col-span-8">
          {activeTab === "best" ? (
            <Section
              title="Highest Conviction Basket"
              description={guide.highest_conviction_basket?.reason ?? "Top-ranked stocks from this weekly guide."}
            >
              <div className="space-y-4">
                {bestStocks.map((stock) => (
                  <TradeCard
                    key={stock.symbol}
                    stock={stock}
                    selected={selectedStock?.symbol === stock.symbol}
                    onSelect={selectStock}
                    onOpenDetails={openDetails}
                  />
                ))}
              </div>
            </Section>
          ) : null}

          {activeTab === "watchlist" ? (
            <Section title="Full Watchlist" description="Filter, sort, and compare every stock in the weekly JSON.">
              <div className="space-y-4">
                <TradeFilters
                  stocks={watchlist}
                  filters={filters}
                  sortKey={sortKey}
                  onFiltersChange={setFilters}
                  onSortChange={setSortKey}
                  viewMode={viewMode}
                  onViewModeChange={setPreferredViewMode}
                />
                {viewMode === "cards" ? (
                  filteredStocks.length === 0 ? (
                    <EmptyFilters />
                  ) : (
                    <div className="space-y-4">
                      {filteredStocks.map((stock) => (
                        <TradeCard
                          key={stock.symbol}
                          stock={stock}
                          selected={selectedStock?.symbol === stock.symbol}
                          onSelect={selectStock}
                          onOpenDetails={openDetails}
                        />
                      ))}
                    </div>
                  )
                ) : (
                  <TradeTable
                    stocks={filteredStocks}
                    selectedSymbol={selectedStock?.symbol}
                    onSelect={selectStock}
                    onOpenDetails={openDetails}
                  />
                )}
              </div>
            </Section>
          ) : null}

          {activeTab === "defensive" ? (
            <DefensiveBasket guide={guide} selectedSymbol={selectedStock?.symbol} onSelect={selectStock} onOpenDetails={openDetails} />
          ) : null}

          {activeTab === "conditional" ? (
            <ConditionalBasket guide={guide} selectedSymbol={selectedStock?.symbol} onSelect={selectStock} onOpenDetails={openDetails} />
          ) : null}

          {activeTab === "avoid" ? <AvoidList items={guide.excluded_or_low_priority} /> : null}

          {activeTab === "execution" ? (
            <ExecutionChecklist
              protocol={guide.execution_protocol}
              guideAsOf={guide.as_of}
              dangerZone={guide.market_regime?.index_levels?.nifty_50?.danger_zone_below}
            />
          ) : null}

          {activeTab === "calculator" ? (
            <PositionSizeCalculator guide={guide} selectedStock={selectedStock} onSelectStock={selectStock} />
          ) : null}
        </main>

        <aside className="space-y-4 xl:col-span-4">
          <div className="xl:sticky xl:top-40 xl:space-y-4">
            <SelectedStockPanel stock={selectedStock} onOpenDetails={openDetails} />
            <PositionSizeCalculator guide={guide} selectedStock={selectedStock} onSelectStock={selectStock} compact />
            <ExecutionWarnings guide={guide} />
          </div>
        </aside>
      </div>

      <TradeDetailDrawer stock={drawerStock} open={Boolean(drawerStock)} onClose={() => setDrawerStock(undefined)} />
    </div>
  );
}

function Section({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <section className="space-y-4">
      <div>
        <h2 className="text-xl font-bold tracking-tight text-slate-950">{title}</h2>
        <p className="mt-1 text-sm leading-6 text-slate-600">{description}</p>
      </div>
      {children}
    </section>
  );
}

function SelectedStockPanel({
  stock,
  onOpenDetails,
}: {
  stock?: BuyingGuideStock;
  onOpenDetails: (stock: BuyingGuideStock) => void;
}) {
  if (!stock) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white/90 p-4 text-sm text-slate-500">
        Select a stock to see quick summary.
      </div>
    );
  }

  const status = getTradeStatus(stock);
  return (
    <div className="rounded-2xl border border-slate-200 bg-white/92 p-4 shadow-[0_8px_24px_rgba(15,23,42,0.06)]">
      <div className="mb-3 flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-bold uppercase tracking-wide text-slate-500">Selected Trade</p>
          <h3 className="mt-1 text-xl font-bold text-slate-950">{stock.symbol}</h3>
          <p className="text-sm text-slate-500">{stock.stock}</p>
        </div>
        <span className={`rounded-lg border px-2 py-1 text-xs font-bold ${getStatusColor(status)}`}>{status}</span>
      </div>
      <div className="grid grid-cols-2 gap-2 text-sm">
        <SmallMetric label="Buy" value={formatRange(stock.limit_buy_zone)} />
        <SmallMetric label="SL" value={formatCurrencyINR(stock.stop_loss?.hard_sl)} danger />
        <SmallMetric label="T2" value={formatCurrencyINR(stock.targets?.target_2)} />
        <SmallMetric label="Risk/share" value={formatCurrencyINR(stock.risk_reward_from_mid_entry?.risk_per_share ?? getRiskPerShare(stock))} danger />
      </div>
      <div className="mt-3">
        <RiskRewardMiniChart stock={stock} />
      </div>
      <button
        type="button"
        onClick={() => onOpenDetails(stock)}
        className="mt-4 w-full rounded-xl bg-slate-950 px-3 py-2 text-sm font-bold text-white hover:bg-slate-800"
      >
        Open Full Detail
      </button>
    </div>
  );
}

function SmallMetric({ label, value, danger }: { label: string; value: string; danger?: boolean }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
      <p className="text-xs font-bold uppercase tracking-wide text-slate-500">{label}</p>
      <p className={`mt-1 font-bold tabular-nums ${danger ? "text-rose-800" : "text-slate-950"}`}>{value}</p>
    </div>
  );
}

function ExecutionWarnings({ guide }: { guide: BuyingGuideType }) {
  const rule = guide.final_verdict?.brutal_rule;
  const nifty = guide.market_regime?.index_levels?.nifty_50;
  const sizing = guide.market_regime?.position_sizing_rules;
  return (
    <div className="rounded-2xl border border-amber-200 bg-amber-50/70 p-4 text-sm leading-6 text-amber-950">
      <p className="mb-2 flex items-center gap-2 font-bold">
        <ClipboardList className="h-4 w-4" />
        Execution Warnings
      </p>
      <ul className="space-y-2">
        {rule ? <li>{rule}</li> : null}
        {nifty?.trade_rule ? <li>{nifty.trade_rule}</li> : null}
        {sizing?.max_open_positions ? <li>Max open positions: {sizing.max_open_positions}.</li> : null}
        {sizing?.max_total_portfolio_risk_percent ? <li>Total portfolio risk cap: {sizing.max_total_portfolio_risk_percent}%.</li> : null}
      </ul>
    </div>
  );
}

function EmptyFilters() {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white/90 p-8 text-center">
      <p className="text-sm font-semibold text-slate-700">No trades match current filters.</p>
      <p className="mt-1 text-sm text-slate-500">Try disabling near buy zone only or lowering the setup score.</p>
    </div>
  );
}

function compareStocks(a: BuyingGuideStock, b: BuyingGuideStock, sortKey: BuyingGuideSortKey): number {
  switch (sortKey) {
    case "setupScore":
      return b.setup_score_out_of_100 - a.setup_score_out_of_100;
    case "rewardRiskT2":
      return getRewardToRisk(b, b.targets?.target_2) - getRewardToRisk(a, a.targets?.target_2);
    case "distanceFromBuyZone":
      return getDistanceFromBuyZone(a) - getDistanceFromBuyZone(b);
    case "riskPerShare":
      return getRiskPerShare(a) - getRiskPerShare(b);
    case "latestPrice":
      return b.latest_price - a.latest_price;
    case "sector":
      return a.sector.localeCompare(b.sector) || a.rank - b.rank;
    case "rank":
    default:
      return a.rank - b.rank;
  }
}

function isEventRisk(stock: BuyingGuideStock): boolean {
  const text = `${stock.risk_grade} ${stock.verdict} ${stock.trade_management?.special_rule ?? ""} ${stock.source ?? ""}`.toLowerCase();
  return text.includes("event") || text.includes("result") || text.includes("earnings");
}
