import { prisma } from "@ibo/db";
import Link from "next/link";
import { Card, CardHeader, CardTitle, CardDescription } from "../../../components/ui/card";
import { PageHeader } from "../../../components/ui/page-header";

interface Props {
  params: Promise<{ strategyKey: string }>;
  searchParams: Promise<{ from?: string; to?: string }>;
}

export const revalidate = 30; // Cache for 30s — data changes only on pipeline/admin runs

export default async function StrategyHistoryPage({ params, searchParams }: Props) {
  const { strategyKey } = await params;
  const { from, to } = await searchParams;
  const fromDate = from ? new Date(`${from}T00:00:00.000Z`) : undefined;
  const toDate = to ? new Date(`${to}T00:00:00.000Z`) : undefined;

  const strategy = await prisma.strategy.findUnique({ where: { key: strategyKey } });
  if (!strategy) {
    return <p className="text-sm text-slate-500">Strategy not found.</p>;
  }

  const rows = await prisma.strategyResult.findMany({
    where: {
      strategyId: strategy.id,
      marketDate: { gte: fromDate, lte: toDate },
    },
    include: { instrument: { select: { symbol: true } } },
    orderBy: [{ marketDate: "desc" }, { createdAt: "desc" }],
    take: 500,
  });

  return (
    <div className="space-y-4">
      <PageHeader
        title={`${strategy.name} History`}
        description="Historical strategy matches and rule context for review."
      />

      <Card>
        <CardHeader>
          <CardTitle>{strategy.name} History</CardTitle>
          <CardDescription>Educational analytics only. Review full context before action.</CardDescription>
        </CardHeader>
      </Card>

      <form className="grid gap-3 rounded-xl border border-slate-200 bg-white p-4 md:grid-cols-3 dark:border-slate-700 dark:bg-slate-800">
        <input name="from" type="date" defaultValue={from} className="rounded-lg border border-slate-300 px-3 py-2 text-sm" />
        <input name="to" type="date" defaultValue={to} className="rounded-lg border border-slate-300 px-3 py-2 text-sm" />
        <button type="submit" className="rounded-lg bg-brand-600 px-3 py-2 text-sm font-medium text-white">Filter</button>
      </form>

      <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white p-2 dark:border-slate-700 dark:bg-slate-800">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-xs text-slate-500">
              <th className="px-2 py-2">Date</th>
              <th className="px-2 py-2">Symbol</th>
              <th className="px-2 py-2">Matched</th>
              <th className="px-2 py-2">Confluence</th>
              <th className="px-2 py-2">Confidence</th>
              <th className="px-2 py-2">Rule Results</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.id} className="border-t border-slate-100 align-top dark:border-slate-700">
                <td className="px-2 py-2">{row.marketDate.toISOString().split("T")[0]}</td>
                <td className="px-2 py-2">{row.instrument.symbol}</td>
                <td className="px-2 py-2">{row.matched ? "true" : "false"}</td>
                <td className="px-2 py-2">{row.confluenceScore ? Number(row.confluenceScore).toFixed(2) : "—"}</td>
                <td className="px-2 py-2">{row.confidence ?? "—"}</td>
                <td className="px-2 py-2">
                  <details>
                    <summary className="cursor-pointer text-brand-600">View</summary>
                    <div className="mt-2 grid gap-2">
                      {Object.entries((row.ruleResults ?? {}) as Record<string, { passed?: boolean; value?: unknown; reason?: string }>).map(([key, result]) => (
                        <div key={key} className="rounded border border-slate-200 bg-slate-50 p-2 text-xs dark:border-slate-700 dark:bg-slate-900">
                          <div className="flex items-center justify-between">
                            <p className="font-medium text-slate-700 dark:text-slate-200">{key}</p>
                            <span className={`rounded px-2 py-0.5 text-[10px] ${result?.passed ? "bg-emerald-100 text-emerald-700" : "bg-rose-100 text-rose-700"}`}>
                              {result?.passed ? "PASS" : "FAIL"}
                            </span>
                          </div>
                          {result?.reason ? <p className="mt-1 text-slate-500">{result.reason}</p> : null}
                        </div>
                      ))}
                    </div>
                  </details>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Link href={`/strategies/${strategyKey}`} className="text-sm text-brand-600 hover:underline">Back to strategy</Link>
    </div>
  );
}
