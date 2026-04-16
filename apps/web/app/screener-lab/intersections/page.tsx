import Link from "next/link";
import { prisma } from "@ibo/db";
import { Card, CardHeader, CardTitle, CardDescription } from "../../components/ui/card";
import { PageHeader } from "../../components/ui/page-header";

export const dynamic = "force-dynamic";

export default async function ScreenerIntersectionsPage() {
  const screeners = await prisma.screener.findMany({
    select: {
      key: true,
      name: true,
      description: true,
    },
    where: { isExternalReference: false },
    orderBy: { name: "asc" },
    take: 100,
  });

  return (
    <>
      <PageHeader
        title="Screener Intersections"
        description="Use multiple screener keys with /api/screeners/intersection to compute overlap sets"
      >
        <Link
          href="/screener-lab"
          className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
        >
          Back to Screener Lab
        </Link>
      </PageHeader>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>How To Run</CardTitle>
          <CardDescription>
            POST JSON to <code>/api/screeners/intersection</code> with <code>screenerKeys</code> and{" "}
            <code>marketDate</code>.
          </CardDescription>
        </CardHeader>
        <pre className="overflow-x-auto rounded-lg bg-slate-900 p-4 text-xs text-slate-100">
{`{
  "screenerKeys": ["abc_strategy", "breakout_5_cond"],
  "marketDate": "2026-04-16",
  "mode": "intersection"
}`}
        </pre>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Available Internal Screeners</CardTitle>
          <CardDescription>Pick keys from this list for intersection requests.</CardDescription>
        </CardHeader>
        {screeners.length > 0 ? (
          <ul className="space-y-3">
            {screeners.map((screener) => (
              <li key={screener.key} className="rounded-lg border border-slate-200 p-3">
                <p className="font-mono text-sm font-semibold text-slate-800">{screener.key}</p>
                <p className="text-sm text-slate-700">{screener.name}</p>
                {screener.description ? (
                  <p className="mt-1 text-xs text-slate-500">{screener.description}</p>
                ) : null}
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-slate-400">No screeners found. Seed strategy data first.</p>
        )}
      </Card>
    </>
  );
}
