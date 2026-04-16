"use client";

import { useState } from "react";

export function WatchlistButton({
  watchlistId,
  symbol,
  initiallyInWatchlist = false,
}: {
  watchlistId?: string;
  symbol: string;
  initiallyInWatchlist?: boolean;
}) {
  const [status, setStatus] = useState<string | null>(null);
  const [inWatchlist, setInWatchlist] = useState<boolean>(initiallyInWatchlist);

  async function toggleWatchlist() {
    if (!watchlistId) {
      setStatus("No watchlist configured");
      return;
    }
    setStatus(inWatchlist ? "Removing..." : "Adding...");
    const response = await fetch(`/api/watchlists/${watchlistId}/items`, {
      method: inWatchlist ? "DELETE" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ symbol }),
    });
    const payload = await response.json();
    if (response.ok) {
      setInWatchlist(!inWatchlist);
      setStatus(inWatchlist ? "Removed" : "Added");
      return;
    }
    setStatus(payload.error ?? "Failed");
  }

  return (
    <div className="flex items-center gap-2">
      <button type="button" onClick={toggleWatchlist} className="rounded-lg border border-slate-300 px-3 py-2 text-sm">
        {inWatchlist ? "Remove from Watchlist" : "Add to Watchlist"}
      </button>
      {status ? <span className="text-xs text-slate-500">{status}</span> : null}
    </div>
  );
}
