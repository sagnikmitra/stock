"use client";

import { useState } from "react";
import { Card, CardHeader, CardTitle, CardDescription } from "../../components/ui/card";
import { PageHeader } from "../../components/ui/page-header";

export default function AdminCmsPage() {
  const [strategyKey, setStrategyKey] = useState("");
  const [strategyVersion, setStrategyVersion] = useState(1);
  const [screenerKey, setScreenerKey] = useState("");
  const [screenerVersion, setScreenerVersion] = useState(1);
  const [ambiguityKey, setAmbiguityKey] = useState("");
  const [normalizedNote, setNormalizedNote] = useState("");
  const [severity, setSeverity] = useState("medium");
  const [status, setStatus] = useState<string | null>(null);

  const activateStrategy = async () => {
    const response = await fetch(`/api/admin/strategies/${strategyKey}/activate-version`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ version: strategyVersion }),
    });
    const payload = await response.json();
    if (!response.ok) throw new Error(payload.error ?? "Failed");
    setStatus(`Activated strategy ${strategyKey} v${strategyVersion}`);
  };

  const activateScreener = async () => {
    const response = await fetch(`/api/admin/screeners/${screenerKey}/activate-version`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ version: screenerVersion }),
    });
    const payload = await response.json();
    if (!response.ok) throw new Error(payload.error ?? "Failed");
    setStatus(`Activated screener ${screenerKey} v${screenerVersion}`);
  };

  const updateAmbiguity = async () => {
    const response = await fetch("/api/admin/ambiguities", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ key: ambiguityKey, normalizedNote, severity }),
    });
    const payload = await response.json();
    if (!response.ok) throw new Error(payload.error ?? "Failed");
    setStatus(`Updated ambiguity ${ambiguityKey}`);
  };

  const invoke = async (fn: () => Promise<void>) => {
    try {
      setStatus(null);
      await fn();
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Request failed");
    }
  };

  return (
    <>
      <PageHeader
        title="Admin CMS"
        description="Control strategy/screener versions and ambiguity normalization from one place"
      />

      {status ? (
        <p className="mb-4 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700">{status}</p>
      ) : null}

      <div className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Activate Strategy Version</CardTitle>
          </CardHeader>
          <div className="grid gap-3 md:grid-cols-3">
            <input
              placeholder="strategy key"
              value={strategyKey}
              onChange={(event) => setStrategyKey(event.target.value)}
              className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
            />
            <input
              type="number"
              value={strategyVersion}
              onChange={(event) => setStrategyVersion(Number(event.target.value))}
              className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
            />
            <button
              type="button"
              onClick={() => invoke(activateStrategy)}
              className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700"
            >
              Activate
            </button>
          </div>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Activate Screener Version</CardTitle>
          </CardHeader>
          <div className="grid gap-3 md:grid-cols-3">
            <input
              placeholder="screener key"
              value={screenerKey}
              onChange={(event) => setScreenerKey(event.target.value)}
              className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
            />
            <input
              type="number"
              value={screenerVersion}
              onChange={(event) => setScreenerVersion(Number(event.target.value))}
              className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
            />
            <button
              type="button"
              onClick={() => invoke(activateScreener)}
              className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700"
            >
              Activate
            </button>
          </div>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Update Ambiguity Record</CardTitle>
            <CardDescription>
              Maintain normalization decisions without deleting raw notebook context.
            </CardDescription>
          </CardHeader>
          <div className="grid gap-3 md:grid-cols-2">
            <input
              placeholder="ambiguity key"
              value={ambiguityKey}
              onChange={(event) => setAmbiguityKey(event.target.value)}
              className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
            />
            <select
              value={severity}
              onChange={(event) => setSeverity(event.target.value)}
              className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
            >
              <option value="low">low</option>
              <option value="medium">medium</option>
              <option value="high">high</option>
            </select>
            <textarea
              placeholder="normalized note"
              value={normalizedNote}
              onChange={(event) => setNormalizedNote(event.target.value)}
              className="min-h-24 rounded-lg border border-slate-300 px-3 py-2 text-sm md:col-span-2"
            />
            <button
              type="button"
              onClick={() => invoke(updateAmbiguity)}
              className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700 md:col-span-2"
            >
              Save Ambiguity Update
            </button>
          </div>
        </Card>
      </div>
    </>
  );
}
