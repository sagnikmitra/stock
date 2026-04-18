"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/cn";

const DIGEST_TABS = [
  { href: "/digest", label: "Archive" },
  { href: "/digest/pre-market", label: "Pre-Market" },
  { href: "/digest/close", label: "Post-Close" },
  { href: "/digest/weekly", label: "Weekly" },
  { href: "/digest/month-end", label: "Month-End" },
] as const;

const DATE_ROUTE_RE = /^\/digest\/\d{4}-\d{2}-\d{2}$/;

function isActive(pathname: string, href: string): boolean {
  if (href === "/digest") {
    return pathname === "/digest" || DATE_ROUTE_RE.test(pathname);
  }
  return pathname === href;
}

export function DigestTabs({ className }: { className?: string }) {
  const pathname = usePathname();

  return (
    <div className={cn("mb-4", className)} role="tablist" aria-label="Digest views">
      <div className="flex flex-wrap gap-2 rounded-lg border border-slate-200 bg-white p-2">
        {DIGEST_TABS.map((tab) => {
          const active = isActive(pathname, tab.href);
          return (
            <Link
              key={tab.href}
              href={tab.href}
              scroll={false}
              role="tab"
              aria-selected={active}
              className={cn(
                "rounded-md px-3 py-2 text-sm font-medium transition-colors",
                active
                  ? "bg-brand-50 text-brand-700 border border-brand-200"
                  : "text-slate-600 border border-transparent hover:bg-slate-50 hover:text-slate-900",
              )}
            >
              {tab.label}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
