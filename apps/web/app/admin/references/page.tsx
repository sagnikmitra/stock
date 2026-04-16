"use client";

import { useEffect, useState } from "react";
import { Card, CardHeader, CardTitle, CardDescription } from "../../components/ui/card";
import { Badge } from "../../components/ui/badge";
import { PageHeader } from "../../components/ui/page-header";

type ExternalReference = {
  id: string;
  key: string;
  title: string;
  url: string;
  category: string;
  provider: string | null;
  notes: string | null;
};

const INITIAL_FORM = {
  key: "",
  title: "",
  url: "",
  category: "user_reference",
  provider: "",
  notes: "",
};

export default function AdminReferencesPage() {
  const [references, setReferences] = useState<ExternalReference[]>([]);
  const [form, setForm] = useState(INITIAL_FORM);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const load = async () => {
    const response = await fetch("/api/admin/references");
    const payload = await response.json();
    if (!response.ok) throw new Error(payload.error ?? "Failed to load references");
    setReferences(payload.data ?? []);
  };

  useEffect(() => {
    load().catch((loadError) => setError(loadError instanceof Error ? loadError.message : "Failed to load"));
  }, []);

  const onSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await fetch("/api/admin/references", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          key: form.key.trim(),
          title: form.title.trim(),
          url: form.url.trim(),
          category: form.category.trim(),
          provider: form.provider.trim() || null,
          notes: form.notes.trim() || null,
        }),
      });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error ?? "Failed to save reference");

      await load();
      setForm(INITIAL_FORM);
      setSuccess("Reference saved.");
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Failed to save");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <PageHeader
        title="Admin: Source References"
        description="Manage external reference links used for context only"
      />

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Policy</CardTitle>
          <CardDescription>
            Keep references up to date, but do not encode strategy decision logic in external links.
          </CardDescription>
        </CardHeader>
      </Card>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Add/Update Reference</CardTitle>
        </CardHeader>

        <form className="grid gap-3 md:grid-cols-2" onSubmit={onSubmit}>
          <label className="text-sm">
            Key
            <input
              value={form.key}
              onChange={(event) => setForm((current) => ({ ...current, key: event.target.value }))}
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2"
              required
            />
          </label>
          <label className="text-sm">
            Category
            <input
              value={form.category}
              onChange={(event) => setForm((current) => ({ ...current, category: event.target.value }))}
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2"
              required
            />
          </label>
          <label className="text-sm md:col-span-2">
            Title
            <input
              value={form.title}
              onChange={(event) => setForm((current) => ({ ...current, title: event.target.value }))}
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2"
              required
            />
          </label>
          <label className="text-sm md:col-span-2">
            URL
            <input
              value={form.url}
              onChange={(event) => setForm((current) => ({ ...current, url: event.target.value }))}
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2"
              required
            />
          </label>
          <label className="text-sm">
            Provider (optional)
            <input
              value={form.provider}
              onChange={(event) => setForm((current) => ({ ...current, provider: event.target.value }))}
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2"
            />
          </label>
          <label className="text-sm">
            Notes (optional)
            <input
              value={form.notes}
              onChange={(event) => setForm((current) => ({ ...current, notes: event.target.value }))}
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2"
            />
          </label>
          <div className="md:col-span-2">
            <button
              type="submit"
              disabled={loading}
              className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700 disabled:opacity-60"
            >
              {loading ? "Saving..." : "Save Reference"}
            </button>
          </div>
        </form>

        {error ? <p className="mt-3 text-sm text-red-600">{error}</p> : null}
        {success ? <p className="mt-3 text-sm text-green-600">{success}</p> : null}
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Existing References</CardTitle>
          <CardDescription>{references.length} total</CardDescription>
        </CardHeader>

        <ul className="space-y-2">
          {references.map((entry) => (
            <li key={entry.id} className="rounded-lg border border-slate-100 p-3">
              <div className="mb-1 flex items-center gap-2">
                <p className="text-sm font-semibold text-slate-900">{entry.title}</p>
                <Badge variant="muted">{entry.key}</Badge>
                <Badge variant="default">{entry.category}</Badge>
              </div>
              <p className="text-xs text-slate-500">{entry.url}</p>
              {entry.notes ? <p className="mt-1 text-xs text-slate-500">{entry.notes}</p> : null}
            </li>
          ))}
        </ul>
      </Card>
    </>
  );
}
