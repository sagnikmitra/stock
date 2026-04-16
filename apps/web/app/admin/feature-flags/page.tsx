"use client";

import { useCallback, useEffect, useState } from "react";
import { Card } from "../../components/ui/card";
import { Badge } from "../../components/ui/badge";
import { PageHeader } from "../../components/ui/page-header";

interface FeatureFlag {
  id: string;
  key: string;
  name: string;
  isEnabled: boolean;
  notes: string | null;
}

type ToastState = {
  message: string;
  variant: "success" | "error";
} | null;

export default function AdminFeatureFlagsPage() {
  const [flags, setFlags] = useState<FeatureFlag[]>([]);
  const [loading, setLoading] = useState(true);
  const [togglingKeys, setTogglingKeys] = useState<Set<string>>(new Set());
  const [toast, setToast] = useState<ToastState>(null);

  // Auto-dismiss toast after 3 seconds
  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(null), 3000);
    return () => clearTimeout(timer);
  }, [toast]);

  // Fetch flags on mount
  useEffect(() => {
    async function fetchFlags() {
      try {
        const res = await fetch("/api/admin/feature-flags");
        if (!res.ok) throw new Error("Failed to fetch feature flags");
        const json = await res.json();
        setFlags(json.data);
      } catch {
        setToast({ message: "Failed to load feature flags", variant: "error" });
      } finally {
        setLoading(false);
      }
    }
    fetchFlags();
  }, []);

  const handleToggle = useCallback(
    async (key: string, currentEnabled: boolean) => {
      const newEnabled = !currentEnabled;

      // Optimistic update
      setFlags((prev) =>
        prev.map((f) => (f.key === key ? { ...f, isEnabled: newEnabled } : f)),
      );
      setTogglingKeys((prev) => new Set(prev).add(key));

      try {
        const res = await fetch("/api/admin/feature-flags", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ key, isEnabled: newEnabled }),
        });

        if (!res.ok) {
          const json = await res.json();
          throw new Error(json.error || "Toggle failed");
        }

        setToast({
          message: `${key} ${newEnabled ? "enabled" : "disabled"}`,
          variant: "success",
        });
      } catch (error) {
        // Rollback optimistic update
        setFlags((prev) =>
          prev.map((f) =>
            f.key === key ? { ...f, isEnabled: currentEnabled } : f,
          ),
        );
        setToast({
          message:
            error instanceof Error ? error.message : "Failed to toggle flag",
          variant: "error",
        });
      } finally {
        setTogglingKeys((prev) => {
          const next = new Set(prev);
          next.delete(key);
          return next;
        });
      }
    },
    [],
  );

  return (
    <>
      <PageHeader
        title="Admin: Feature Flags"
        description="Enable/disable system capabilities"
      />

      {/* Toast notification */}
      {toast && (
        <div
          className={`mb-4 rounded-lg px-4 py-3 text-sm font-medium ${
            toast.variant === "success"
              ? "bg-green-50 text-green-800"
              : "bg-red-50 text-red-800"
          }`}
        >
          {toast.message}
        </div>
      )}

      <Card>
        {loading ? (
          <div className="py-8 text-center text-sm text-slate-400">
            Loading feature flags...
          </div>
        ) : flags.length === 0 ? (
          <div className="py-8 text-center text-sm text-slate-400">
            No feature flags configured.
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {flags.map((f) => {
              const isToggling = togglingKeys.has(f.key);

              return (
                <div
                  key={f.id}
                  className="flex items-center justify-between px-3 py-3"
                >
                  <div>
                    <p className="text-sm font-medium text-slate-900">
                      {f.name}
                    </p>
                    <p className="text-xs text-slate-400">{f.key}</p>
                    {f.notes && (
                      <p className="mt-0.5 text-xs text-slate-500">
                        {f.notes}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge variant={f.isEnabled ? "favorable" : "muted"}>
                      {f.isEnabled ? "ON" : "OFF"}
                    </Badge>
                    <button
                      type="button"
                      disabled={isToggling}
                      onClick={() => handleToggle(f.key, f.isEnabled)}
                      className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-wait disabled:opacity-60 ${
                        f.isEnabled ? "bg-green-500" : "bg-slate-200"
                      }`}
                      role="switch"
                      aria-checked={f.isEnabled}
                      aria-label={`Toggle ${f.name}`}
                    >
                      <span
                        className={`pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                          f.isEnabled ? "translate-x-5" : "translate-x-0"
                        }`}
                      />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Card>
    </>
  );
}
