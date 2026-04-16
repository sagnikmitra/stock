"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Newspaper,
  Target,
  Search,
  Globe,
  BookOpen,
  Settings,
  TrendingUp,
  List,
  FlaskConical,
  Eye,
  Calculator,
  Link2,
} from "lucide-react";
import { cn } from "@/lib/cn";

const NAV_SECTIONS = [
  {
    label: "Core",
    items: [
      { href: "/", label: "Dashboard", icon: LayoutDashboard },
      { href: "/digest", label: "Digest Archive", icon: Newspaper },
      { href: "/digest/pre-market", label: "Pre-Market", icon: Newspaper },
      { href: "/digest/close", label: "Post-Close", icon: Newspaper },
      { href: "/digest/weekly", label: "Weekly Summary", icon: Newspaper },
      { href: "/digest/month-end", label: "Month-End", icon: Newspaper },
    ],
  },
  {
    label: "Strategies",
    items: [
      { href: "/strategies", label: "All Strategies", icon: Target },
      { href: "/screener-lab", label: "Screener Lab", icon: Search },
      { href: "/market-context/global-cues", label: "Market Context", icon: Globe },
      { href: "/references", label: "References", icon: Link2 },
    ],
  },
  {
    label: "Research",
    items: [
      { href: "/stocks", label: "Stocks", icon: TrendingUp },
      { href: "/watchlists", label: "Watchlists", icon: List },
      { href: "/backtest", label: "Backtester", icon: FlaskConical },
    ],
  },
  {
    label: "Learn",
    items: [
      { href: "/learning/sessions", label: "Sessions", icon: BookOpen },
      { href: "/learning/concepts", label: "Concepts", icon: BookOpen },
      { href: "/learning/ambiguities", label: "Ambiguities", icon: Eye },
    ],
  },
  {
    label: "Tools",
    items: [
      { href: "/tools/position-size", label: "Risk Calculator", icon: Calculator },
      { href: "/admin/strategies", label: "Admin", icon: Settings },
      { href: "/admin/cms", label: "Admin CMS", icon: Settings },
      { href: "/admin/observability", label: "Observability", icon: Eye },
      { href: "/admin/references", label: "Admin References", icon: Link2 },
    ],
  },
];

const MOBILE_QUICK_LINKS = [
  { href: "/", label: "Dashboard" },
  { href: "/digest", label: "Digests" },
  { href: "/strategies", label: "Strategies" },
  { href: "/screener-lab", label: "Screeners" },
  { href: "/tools/position-size", label: "Risk" },
  { href: "/admin/strategies", label: "Admin" },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <>
      <header className="sticky top-0 z-30 border-b border-slate-200 bg-white px-3 py-2 lg:hidden">
        <div className="mb-2 flex items-center justify-between">
          <Link href="/" className="text-sm font-bold text-brand-700">
            Investment Bible OS
          </Link>
          <span className="text-[11px] text-slate-500">Educational use</span>
        </div>
        <nav className="custom-scrollbar flex gap-2 overflow-x-auto pb-1" aria-label="Mobile navigation">
          {MOBILE_QUICK_LINKS.map((item) => {
            const active = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "whitespace-nowrap rounded-full px-3 py-1.5 text-xs font-medium",
                  active ? "bg-brand-50 text-brand-700" : "bg-slate-100 text-slate-700",
                )}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
      </header>

      <aside className="hidden w-64 shrink-0 border-r border-slate-200 bg-white lg:block">
        <div className="flex h-14 items-center border-b border-slate-200 px-5">
          <Link href="/" className="text-lg font-bold text-brand-700">
            IBO
          </Link>
          <span className="ml-2 text-xs text-slate-400">Investment Bible OS</span>
        </div>

        <nav className="space-y-6 p-4" aria-label="Desktop navigation">
          {NAV_SECTIONS.map((section) => (
            <div key={section.label}>
              <p className="mb-1.5 px-2 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                {section.label}
              </p>
              <ul className="space-y-0.5">
                {section.items.map((item) => {
                  const isActive = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));
                  return (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        className={cn(
                          "flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm transition-colors",
                          isActive
                            ? "bg-brand-50 font-medium text-brand-700"
                            : "text-slate-600 hover:bg-slate-50 hover:text-slate-900",
                        )}
                      >
                        <item.icon className="h-4 w-4 shrink-0" />
                        {item.label}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </nav>
      </aside>
    </>
  );
}
