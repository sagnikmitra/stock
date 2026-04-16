import { prisma } from "@ibo/db";

export const dynamic = "force-dynamic";

export default async function MarketBreadthPage() {
  const rows = await prisma.marketBreadthSnapshot.findMany({
    orderBy: { date: "desc" },
    take: 120,
  });

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold">Market Breadth</h1>
      <p className="text-sm text-slate-500">Advances/declines and 52-week extremes. Educational analytics only.</p>
      {rows.length === 0 ? (
        <div className="rounded-xl border border-slate-200 bg-white p-6 text-sm text-slate-500 dark:border-slate-700 dark:bg-slate-800">
          No breadth snapshots seeded yet. Populate market breadth snapshots from provider pipeline.
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white p-2 dark:border-slate-700 dark:bg-slate-800">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs text-slate-500">
                <th className="px-2 py-2">Date</th>
                <th className="px-2 py-2">Adv</th>
                <th className="px-2 py-2">Decl</th>
                <th className="px-2 py-2">Unch</th>
                <th className="px-2 py-2">52w Highs</th>
                <th className="px-2 py-2">52w Lows</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.id} className="border-t border-slate-100 dark:border-slate-700">
                  <td className="px-2 py-2">{row.date.toISOString().split("T")[0]}</td>
                  <td className="px-2 py-2">{row.advances ?? "—"}</td>
                  <td className="px-2 py-2">{row.declines ?? "—"}</td>
                  <td className="px-2 py-2">{row.unchanged ?? "—"}</td>
                  <td className="px-2 py-2">{row.new52WeekHighs ?? "—"}</td>
                  <td className="px-2 py-2">{row.new52WeekLows ?? "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

