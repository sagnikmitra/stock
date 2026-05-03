import type { LucideIcon } from "lucide-react";

export interface BuyingGuideTabItem<T extends string> {
  id: T;
  label: string;
  icon: LucideIcon;
  count?: number;
}

interface BuyingGuideTabsProps<T extends string> {
  tabs: BuyingGuideTabItem<T>[];
  activeTab: T;
  onChange: (tab: T) => void;
}

export function BuyingGuideTabs<T extends string>({ tabs, activeTab, onChange }: BuyingGuideTabsProps<T>) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white/90 p-2 shadow-[0_8px_24px_rgba(15,23,42,0.06)]">
      <div role="tablist" aria-label="Buying guide sections" className="flex gap-2 overflow-x-auto">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const active = tab.id === activeTab;
          return (
            <button
              key={tab.id}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => onChange(tab.id)}
              className={`inline-flex min-h-11 shrink-0 items-center gap-2 rounded-xl border px-3 py-2 text-sm font-bold transition ${
                active
                  ? "border-slate-950 bg-slate-950 text-white shadow-[0_10px_20px_rgba(15,23,42,0.16)]"
                  : "border-slate-200 bg-white text-slate-600 hover:border-cyan-200 hover:bg-cyan-50"
              }`}
            >
              <Icon className="h-4 w-4" />
              <span>{tab.label}</span>
              {tab.count !== undefined ? (
                <span className={`rounded-md px-1.5 py-0.5 text-xs ${active ? "bg-white/20 text-white" : "bg-slate-100 text-slate-500"}`}>
                  {tab.count}
                </span>
              ) : null}
            </button>
          );
        })}
      </div>
    </div>
  );
}
