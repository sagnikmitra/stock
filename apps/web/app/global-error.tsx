"use client";

import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Global UI error:", error);
  }, [error]);

  return (
    <html>
      <body className="bg-slate-50 p-8 text-slate-900">
        <div className="mx-auto max-w-xl rounded-xl border border-slate-200 bg-white p-6">
          <h2 className="text-xl font-semibold">Something went wrong</h2>
          <p className="mt-2 text-sm text-slate-600">
            Please retry. If the problem persists, refresh the page.
          </p>
          <button
            onClick={() => reset()}
            className="mt-4 rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white"
          >
            Try again
          </button>
        </div>
      </body>
    </html>
  );
}
