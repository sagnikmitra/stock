import { prisma } from "@ibo/db";
import Link from "next/link";
import { Card, CardHeader, CardTitle, CardDescription } from "../../components/ui/card";

export const revalidate = 30; // Cache for 30s — data changes only on pipeline/admin runs

export default async function WeeklyDigestPage() {
  const digests = await prisma.digest.findMany({
    where: { digestType: "week_end" },
    orderBy: { marketDate: "desc" },
    take: 52,
  });

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold text-slate-900">Weekly Summary Digest</h2>

      <Card>
        <CardHeader>
          <CardTitle>Weekly Summary Digest</CardTitle>
          <CardDescription>Weekly roll-up of strategy/screener/confluence activity. Educational only.</CardDescription>
        </CardHeader>
      </Card>

      <div className="space-y-2">
        {digests.map((digest) => {
          const date = digest.marketDate.toISOString().split("T")[0];
          return (
            <Link key={digest.id} href={`/digest/${date}`} className="block rounded-xl border border-slate-200 bg-white p-4 hover:border-brand-200 dark:border-slate-700 dark:bg-slate-800">
              <p className="font-medium">{digest.title}</p>
              <p className="text-sm text-slate-500">{digest.summary}</p>
            </Link>
          );
        })}
        {digests.length === 0 ? <p className="text-sm text-slate-500">No weekly summaries yet.</p> : null}
      </div>
    </div>
  );
}
