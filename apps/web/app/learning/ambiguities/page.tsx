import { prisma } from "@ibo/db";
import { Card, CardHeader, CardTitle } from "../../components/ui/card";
import { Badge } from "../../components/ui/badge";
import { PageHeader } from "../../components/ui/page-header";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function AmbiguitiesPage() {
  const ambiguities = await prisma.ambiguityRecord.findMany({
    include: { strategy: { select: { key: true, name: true } } },
    orderBy: [{ severity: "desc" }, { key: "asc" }],
  });

  return (
    <>
      <PageHeader
        title="Ambiguity Ledger"
        description="Conflicts between handwritten notes and session summaries — tracked, not hidden"
      />

      <div className="space-y-4">
        {ambiguities.map((a) => (
          <Card key={a.id}>
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-slate-900">{a.key}</h3>
                  <Badge variant={a.severity === "high" ? "hostile" : a.severity === "medium" ? "mixed" : "muted"}>
                    {a.severity}
                  </Badge>
                </div>
                {a.strategy && (
                  <Link href={`/strategies/${a.strategy.key}`} className="text-xs text-brand-600 hover:underline">
                    {a.strategy.name}
                  </Link>
                )}
              </div>
              <Badge variant="ambiguity">{a.uiBehavior.replace(/_/g, " ")}</Badge>
            </div>
            <div className="mt-3 space-y-2 text-sm">
              <div className="rounded-lg bg-red-50 p-2.5">
                <span className="font-medium text-red-700">Raw note:</span>{" "}
                <span className="text-red-600">{a.rawNote}</span>
              </div>
              <div className="rounded-lg bg-green-50 p-2.5">
                <span className="font-medium text-green-700">Normalized:</span>{" "}
                <span className="text-green-600">{a.normalizedNote}</span>
              </div>
              {a.sourcePreference && (
                <p className="text-xs text-slate-400">Preference: {a.sourcePreference}</p>
              )}
            </div>
          </Card>
        ))}
      </div>
    </>
  );
}
