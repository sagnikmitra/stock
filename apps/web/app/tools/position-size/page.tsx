"use client";

import { useMemo, useState } from "react";
import { Card, CardHeader, CardTitle, CardDescription } from "../../components/ui/card";
import { PageHeader } from "../../components/ui/page-header";

export default function PositionSizePage() {
  const [portfolio, setPortfolio] = useState(500000);
  const [entry, setEntry] = useState(250);
  const [stopLoss, setStopLoss] = useState(235);
  const [riskPct, setRiskPct] = useState(2);
  const [plannedExit, setPlannedExit] = useState(295);

  const model = useMemo(() => {
    const riskAmount = (riskPct / 100) * portfolio;
    const perShareRisk = entry - stopLoss;
    const quantity = perShareRisk > 0 ? Math.floor(riskAmount / perShareRisk) : 0;
    const targetAt1R = perShareRisk > 0 ? entry + perShareRisk : 0;
    const targetAt2R = perShareRisk > 0 ? entry + 2 * perShareRisk : 0;
    const targetAt3R = perShareRisk > 0 ? entry + 3 * perShareRisk : 0;
    const totalCapitalRequired = quantity * entry;
    const realizedR = perShareRisk > 0 ? (plannedExit - entry) / perShareRisk : 0;
    const projectedPnl = quantity * (plannedExit - entry);

    return {
      riskAmount,
      perShareRisk,
      quantity,
      targetAt1R,
      targetAt2R,
      targetAt3R,
      totalCapitalRequired,
      realizedR,
      projectedPnl,
    };
  }, [entry, plannedExit, portfolio, riskPct, stopLoss]);

  const invalid = model.perShareRisk <= 0;

  return (
    <>
      <PageHeader
        title="Risk Calculator"
        description="2% rule position sizing + 3R worksheet for planning exits"
      />

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Rule Reminder</CardTitle>
          <CardDescription>
            Formula: quantity = (riskPct × portfolio) / (entry − stop-loss). Educational planning tool only.
          </CardDescription>
        </CardHeader>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Inputs</CardTitle>
          </CardHeader>
          <div className="space-y-4">
            <Field label="Portfolio Size (₹)" value={portfolio} onChange={setPortfolio} />
            <Field label="Entry Price (₹)" value={entry} onChange={setEntry} step={0.05} />
            <Field label="Stop-Loss Price (₹)" value={stopLoss} onChange={setStopLoss} step={0.05} />
            <Field label="Risk %" value={riskPct} onChange={setRiskPct} step={0.25} max={10} />
            <Field label="Planned Exit (₹)" value={plannedExit} onChange={setPlannedExit} step={0.05} />
          </div>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Position Result</CardTitle>
          </CardHeader>
          {invalid ? (
            <p className="text-sm text-red-500">Stop-loss must be below entry price.</p>
          ) : (
            <div className="space-y-3 text-sm">
              <Row label="Risk Amount" value={`₹${model.riskAmount.toLocaleString("en-IN")}`} />
              <Row label="Per-Share Risk" value={`₹${model.perShareRisk.toFixed(2)}`} />
              <div className="rounded-lg bg-brand-50 p-3">
                <Row label="Quantity" value={`${model.quantity} shares`} bold />
              </div>
              <Row label="Capital Required" value={`₹${model.totalCapitalRequired.toLocaleString("en-IN")}`} />
              <Row label="1R Target" value={`₹${model.targetAt1R.toFixed(2)}`} />
              <Row label="2R Target" value={`₹${model.targetAt2R.toFixed(2)}`} />
              <Row label="3R Target" value={`₹${model.targetAt3R.toFixed(2)}`} />
            </div>
          )}
        </Card>
      </div>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>3R Worksheet</CardTitle>
          <CardDescription>
            Use this to plan whether the current exit idea aligns with reward-to-risk discipline.
          </CardDescription>
        </CardHeader>

        {invalid ? (
          <p className="text-sm text-slate-500">Set a valid entry/stop-loss to compute worksheet values.</p>
        ) : (
          <div className="grid gap-3 text-sm md:grid-cols-2">
            <Row label="Planned Exit" value={`₹${plannedExit.toFixed(2)}`} />
            <Row label="Projected P&L" value={`₹${model.projectedPnl.toLocaleString("en-IN")}`} />
            <Row label="Realized R" value={`${model.realizedR.toFixed(2)}R`} />
            <Row
              label="Discipline Check"
              value={model.realizedR >= 3 ? "Meets >=3R" : "Below 3R"}
              positive={model.realizedR >= 3}
            />
          </div>
        )}
      </Card>
    </>
  );
}

function Field({
  label,
  value,
  onChange,
  step = 1,
  max,
}: {
  label: string;
  value: number;
  onChange: (value: number) => void;
  step?: number;
  max?: number;
}) {
  return (
    <div>
      <label className="mb-1 block text-sm font-medium text-slate-700">{label}</label>
      <input
        type="number"
        value={value}
        step={step}
        max={max}
        onChange={(event) => onChange(Number(event.target.value))}
        className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
      />
    </div>
  );
}

function Row({
  label,
  value,
  bold,
  positive,
}: {
  label: string;
  value: string;
  bold?: boolean;
  positive?: boolean;
}) {
  return (
    <div className="flex justify-between gap-4">
      <span className="text-slate-500">{label}</span>
      <span
        className={
          bold
            ? "text-lg font-bold text-brand-700"
            : positive === true
              ? "font-medium text-green-700"
              : positive === false
                ? "font-medium text-red-700"
                : "font-medium text-slate-900"
        }
      >
        {value}
      </span>
    </div>
  );
}
