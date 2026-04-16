"use client";

import { useState } from "react";

export function NoteForm({ instrumentId }: { instrumentId?: string }) {
  const [title, setTitle] = useState("");
  const [bodyMarkdown, setBodyMarkdown] = useState("");
  const [status, setStatus] = useState<string | null>(null);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("Saving...");
    const response = await fetch("/api/notes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, bodyMarkdown, instrumentId }),
    });
    const payload = await response.json();
    if (!response.ok) {
      setStatus(payload.error ?? "Failed to save");
      return;
    }
    setTitle("");
    setBodyMarkdown("");
    setStatus("Saved");
  }

  return (
    <form onSubmit={submit} className="space-y-2">
      <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Note title" className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" />
      <textarea value={bodyMarkdown} onChange={(e) => setBodyMarkdown(e.target.value)} placeholder="Markdown note" rows={4} className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" />
      <div className="flex items-center gap-2">
        <button type="submit" className="rounded-lg bg-brand-600 px-3 py-2 text-sm font-medium text-white">Add Note</button>
        {status ? <span className="text-xs text-slate-500">{status}</span> : null}
      </div>
    </form>
  );
}

