import { prisma } from "@ibo/db";

export const revalidate = 30; // Cache for 30s — data changes only on pipeline/admin runs

type MetricKey = "winRate" | "maxDrawdown" | "profitFactor" | "expectancy";

function metricValue(summary: unknown, key: MetricKey): number {
  const data = (summary ?? {}) as Record<string, unknown>;
  const value = data[key];
  return typeof value === "number" ? value : 0;
}

export default async function BacktestComparePage({
  searchParams,
}: {
  searchParams: Promise<{ a?: string; b?: string }>;
}) {
  const { a, b } = await searchParams;
  const all = await prisma.backtest.findMany({
    include: { strategyVersion: { include: { strategy: true } } },
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  const left = all.find((item) => item.id === a) ?? all[0];
  const right = all.find((item) => item.id === b) ?? all[1];

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold">Backtest Compare</h1>
      <p className="text-sm text-slate-500">Educational comparison only.</p>

      <form className="grid gap-3 md:grid-cols-3">
        <select name="a" defaultValue={left?.id} className="rounded-lg border border-slate-300 px-3 py-2 text-sm">
          {all.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
        </select>
        <select name="b" defaultValue={right?.id} className="rounded-lg border border-slate-300 px-3 py-2 text-sm">
          {all.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
        </select>
        <button type="submit" className="rounded-lg bg-brand-600 px-3 py-2 text-sm font-medium text-white">Compare</button>
      </form>

      {left && right ? (
        <table className="w-full rounded-xl border border-slate-200 bg-white text-sm dark:border-slate-700 dark:bg-slate-800">
          <thead>
            <tr className="text-left text-xs text-slate-500">
              <th className="px-3 py-2">Metric</th>
              <th className="px-3 py-2">{left.name}</th>
              <th className="px-3 py-2">{right.name}</th>
              <th className="px-3 py-2">Better</th>
            </tr>
          </thead>
          <tbody>
            {(["winRate", "maxDrawdown", "profitFactor", "expectancy"] as MetricKey[]).map((key) => {
              const lv = metricValue(left.summaryJson, key);
              const rv = metricValue(right.summaryJson, key);
              const better = key === "maxDrawdown" ? (lv < rv ? "A" : "B") : (lv > rv ? "A" : "B");
              return (
                <tr key={key} className="border-t border-slate-100 dark:border-slate-700">
                  <td className="px-3 py-2">{key}</td>
                  <td className="px-3 py-2">{lv.toFixed(4)}</td>
                  <td className="px-3 py-2">{rv.toFixed(4)}</td>
                  <td className="px-3 py-2 font-medium text-brand-600">{better}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      ) : <p className="text-sm text-slate-500">Need at least two backtests.</p>}
    </div>
  );
}

