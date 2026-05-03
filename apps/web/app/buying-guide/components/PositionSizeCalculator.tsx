"use client";

import { useEffect, useMemo, useState } from "react";
import { Calculator, Info } from "lucide-react";
import type { BuyingGuide, BuyingGuideStock } from "@/types/buying-guide";
import { formatCurrencyINR, getEntryReference } from "@/lib/buying-guide-utils";

interface PositionSizeCalculatorProps {
  guide: BuyingGuide;
  selectedStock?: BuyingGuideStock;
  onSelectStock?: (stock: BuyingGuideStock) => void;
  compact?: boolean;
}

export function PositionSizeCalculator({ guide, selectedStock, onSelectStock, compact }: PositionSizeCalculatorProps) {
  const stocks = guide.final_watchlist ?? [];
  const defaultStock = selectedStock ?? stocks[0];
  const [symbol, setSymbol] = useState(defaultStock?.symbol ?? "");
  const stock = stocks.find((item) => item.symbol === symbol) ?? defaultStock;
  const [capital, setCapital] = useState(200000);
  const [riskPercent, setRiskPercent] = useState(0.75);
  const [entry, setEntry] = useState(stock ? getEntryReference(stock) : 0);
  const [stopLoss, setStopLoss] = useState(stock?.stop_loss?.hard_sl ?? 0);
  const [buffer, setBuffer] = useState(0);
  const [maxPositions, setMaxPositions] = useState(guide.market_regime?.position_sizing_rules?.max_open_positions ?? 4);

  useEffect(() => {
    const stored = window.localStorage.getItem("buying-guide-calculator");
    if (!stored) return;
    try {
      const parsed = JSON.parse(stored) as { capital?: number; riskPercent?: number; maxPositions?: number };
      if (typeof parsed.capital === "number") setCapital(parsed.capital);
      if (typeof parsed.riskPercent === "number") setRiskPercent(parsed.riskPercent);
      if (typeof parsed.maxPositions === "number") setMaxPositions(parsed.maxPositions);
    } catch {
      window.localStorage.removeItem("buying-guide-calculator");
    }
  }, []);

  useEffect(() => {
    window.localStorage.setItem("buying-guide-calculator", JSON.stringify({ capital, riskPercent, maxPositions }));
  }, [capital, riskPercent, maxPositions]);

  useEffect(() => {
    if (!selectedStock) return;
    setSymbol(selectedStock.symbol);
    setEntry(getEntryReference(selectedStock));
    setStopLoss(selectedStock.stop_loss?.hard_sl ?? 0);
  }, [selectedStock]);

  const model = useMemo(() => {
    const maxRisk = capital * (riskPercent / 100);
    const riskPerShare = Math.abs(entry - stopLoss) + Math.max(0, buffer);
    const invalidStop = stopLoss >= entry;
    const riskQuantity = riskPerShare > 0 && !invalidStop ? Math.floor(maxRisk / riskPerShare) : 0;
    const capitalQuantity = entry > 0 ? Math.floor(capital / entry) : 0;
    const quantity = Math.max(0, Math.min(riskQuantity, capitalQuantity));
    const deployedCapital = quantity * entry;
    const target1 = stock?.targets?.target_1;
    const target2 = stock?.targets?.target_2;
    const target3 = stock?.targets?.target_3;
    const profitAtTarget1 = target1 ? quantity * (target1 - entry) : 0;
    const profitAtTarget2 = target2 ? quantity * (target2 - entry) : 0;
    const profitAtTarget3 = target3 ? quantity * (target3 - entry) : 0;
    const portfolioRiskPercent = riskPercent * maxPositions;
    const maxTotalRisk = guide.market_regime?.position_sizing_rules?.max_total_portfolio_risk_percent ?? 3;

    return {
      maxRisk,
      riskPerShare,
      riskQuantity,
      capitalQuantity,
      quantity,
      deployedCapital,
      profitAtTarget1,
      profitAtTarget2,
      profitAtTarget3,
      portfolioRiskPercent,
      maxTotalRisk,
      invalidStop,
      cappedByCapital: capitalQuantity < riskQuantity,
    };
  }, [buffer, capital, entry, guide.market_regime?.position_sizing_rules?.max_total_portfolio_risk_percent, maxPositions, riskPercent, stock?.targets, stopLoss]);

  const handleSymbolChange = (nextSymbol: string) => {
    setSymbol(nextSymbol);
    const nextStock = stocks.find((item) => item.symbol === nextSymbol);
    if (!nextStock) return;
    setEntry(getEntryReference(nextStock));
    setStopLoss(nextStock.stop_loss?.hard_sl ?? 0);
    onSelectStock?.(nextStock);
  };

  if (!stock) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white/90 p-6 text-sm text-slate-500">
        Add final_watchlist stocks before using the position size calculator.
      </div>
    );
  }

  return (
    <section className={`rounded-2xl border border-slate-200 bg-white/92 p-4 shadow-[0_8px_24px_rgba(15,23,42,0.06)] ${compact ? "space-y-3" : "space-y-5"}`}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="flex items-center gap-2 text-sm font-bold uppercase tracking-wide text-slate-500">
            <Calculator className="h-4 w-4" />
            Position Size Calculator
          </p>
          <h2 className="mt-1 text-xl font-bold text-slate-950">{stock.symbol}</h2>
          <p className="text-sm text-slate-500">{stock.stock}</p>
        </div>
        <span className="rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-bold text-slate-600">
          Weekly plan
        </span>
      </div>

      <div className={`grid gap-3 ${compact ? "grid-cols-1" : "md:grid-cols-2 xl:grid-cols-3"}`}>
        <label className="block">
          <span className="mb-1 block text-xs font-bold uppercase tracking-wide text-slate-500">Selected stock</span>
          <select
            aria-label="Selected stock"
            value={symbol}
            onChange={(event) => handleSymbolChange(event.target.value)}
            className="h-10 w-full rounded-xl border border-slate-300 bg-white px-3 text-sm font-semibold text-slate-700"
          >
            {stocks.map((item) => (
              <option key={item.symbol} value={item.symbol}>{item.symbol} - {item.stock}</option>
            ))}
          </select>
        </label>
        <NumberField label="Trading capital" value={capital} onChange={setCapital} min={0} />
        <NumberField label="Risk per trade %" value={riskPercent} onChange={setRiskPercent} min={0} step={0.05} />
        <NumberField label="Entry price" value={entry} onChange={setEntry} min={0} step={0.05} />
        <NumberField label="Stop loss" value={stopLoss} onChange={setStopLoss} min={0} step={0.05} />
        <NumberField label="Brokerage/slippage buffer" value={buffer} onChange={setBuffer} min={0} step={0.05} />
        <NumberField label="Max allowed positions" value={maxPositions} onChange={setMaxPositions} min={1} step={1} />
      </div>

      {model.invalidStop ? (
        <Warning message="Stop loss must be below entry for a long swing trade." />
      ) : model.riskPerShare === 0 ? (
        <Warning message="Risk per share is zero. Set a valid entry and stop-loss." />
      ) : model.quantity === 0 ? (
        <Warning message="Suggested quantity is zero. Capital or risk percentage is too low for this trade." />
      ) : null}

      {model.portfolioRiskPercent > model.maxTotalRisk ? (
        <Warning message={`Portfolio risk would be ${model.portfolioRiskPercent.toFixed(2)}%, above allowed ${model.maxTotalRisk.toFixed(2)}%. Reduce positions or risk percent.`} />
      ) : null}

      {model.cappedByCapital ? (
        <div className="rounded-xl border border-cyan-200 bg-cyan-50 p-3 text-sm font-semibold text-cyan-900">
          Quantity capped by available capital.
        </div>
      ) : null}

      <div className={`grid gap-3 ${compact ? "grid-cols-1" : "md:grid-cols-2 xl:grid-cols-4"}`}>
        <Result label="Max rupee risk" value={formatCurrencyINR(model.maxRisk)} />
        <Result label="Risk per share" value={formatCurrencyINR(model.riskPerShare)} />
        <Result label="Suggested quantity" value={`${model.quantity} shares`} strong />
        <Result label="Deployed capital" value={formatCurrencyINR(model.deployedCapital)} />
        <Result label="Profit at T1" value={formatCurrencyINR(model.profitAtTarget1)} positive={model.profitAtTarget1 > 0} />
        <Result label="Profit at T2" value={formatCurrencyINR(model.profitAtTarget2)} positive={model.profitAtTarget2 > 0} />
        <Result label="Profit at T3" value={formatCurrencyINR(model.profitAtTarget3)} positive={model.profitAtTarget3 > 0} />
        <Result label="Portfolio risk" value={`${model.portfolioRiskPercent.toFixed(2)}%`} positive={model.portfolioRiskPercent <= model.maxTotalRisk} />
      </div>

      <p className="flex items-start gap-2 rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs leading-5 text-slate-600">
        <Info className="mt-0.5 h-4 w-4 shrink-0" />
        Formula: quantity = max rupee risk / abs(entry - stop loss). Calculator is for research and planning only.
      </p>
    </section>
  );
}

function NumberField({
  label,
  value,
  onChange,
  min,
  step = 1,
}: {
  label: string;
  value: number;
  onChange: (value: number) => void;
  min?: number;
  step?: number;
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-bold uppercase tracking-wide text-slate-500">{label}</span>
      <input
        aria-label={label}
        type="number"
        value={Number.isFinite(value) ? value : 0}
        min={min}
        step={step}
        onChange={(event) => onChange(Number(event.target.value))}
        className="h-10 w-full rounded-xl border border-slate-300 bg-white px-3 text-sm font-semibold text-slate-800 focus:border-slate-950 focus:outline-none"
      />
    </label>
  );
}

function Result({
  label,
  value,
  strong,
  positive,
}: {
  label: string;
  value: string;
  strong?: boolean;
  positive?: boolean;
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
      <p className="text-xs font-bold uppercase tracking-wide text-slate-500">{label}</p>
      <p className={`mt-1 font-bold tabular-nums ${strong ? "text-xl text-slate-950" : positive === true ? "text-emerald-800" : positive === false ? "text-rose-800" : "text-slate-950"}`}>
        {value}
      </p>
    </div>
  );
}

function Warning({ message }: { message: string }) {
  return (
    <div className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm font-semibold text-rose-900">
      {message}
    </div>
  );
}
