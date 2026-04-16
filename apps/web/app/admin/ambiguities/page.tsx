import { prisma } from "@ibo/db";
import { Card, CardHeader, CardTitle } from "../../components/ui/card";
import { Badge } from "../../components/ui/badge";
import { PageHeader } from "../../components/ui/page-header";

export const dynamic = "force-dynamic";

const severityVariant = (severity: string) => {
  switch (severity) {
    case "high":
      return "hostile" as const;
    case "medium":
      return "mixed" as const;
    case "low":
      return "muted" as const;
    default:
      return "default" as const;
  }
};

export default async function AdminAmbiguitiesPage() {
  const ambiguities = await prisma.ambiguityRecord.findMany({
    include: { strategy: true },
    orderBy: [{ severity: "desc" }, { key: "asc" }],
  });

  // Manual sort since Prisma enum ordering might not match desired priority
  const severityOrder: Record<string, number> = { high: 0, medium: 1, low: 2 };
  const sorted = [...ambiguities].sort(
    (a, b) =>
      (severityOrder[a.severity] ?? 3) - (severityOrder[b.severity] ?? 3),
  );

  return (
    <>
      <PageHeader
        title="Admin: Ambiguity Ledger"
        description="Review all ambiguous strategy rules with their normalized interpretations"
      />

      {sorted.length > 0 ? (
        <div className="space-y-4">
          {sorted.map((a) => (
            <Card key={a.id}>
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-semibold text-slate-900">{a.key}</h3>
                  {a.strategy && (
                    <p className="text-xs text-slate-400">
                      Strategy: {a.strategy.name}
                    </p>
                  )}
                </div>
                <div className="flex gap-2">
                  <Badge variant={severityVariant(a.severity)}>{a.severity}</Badge>
                  <Badge variant="muted">{a.uiBehavior.replace(/_/g, " ")}</Badge>
                </div>
              </div>

              <div className="mt-3 space-y-2">
                <div>
                  <p className="text-xs font-semibold uppercase text-slate-400">Raw Note</p>
                  <p className="mt-0.5 text-sm text-slate-700">{a.rawNote}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase text-slate-400">
                    Normalized Note
                  </p>
                  <p className="mt-0.5 text-sm text-slate-700">{a.normalizedNote}</p>
                </div>
                {a.sourcePreference && (
                  <div>
                    <p className="text-xs font-semibold uppercase text-slate-400">
                      Source Preference
                    </p>
                    <p className="mt-0.5 text-sm text-slate-700">{a.sourcePreference}</p>
                  </div>
                )}
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <p className="text-sm text-slate-400">
            No ambiguity records found. All strategy rules are clear.
          </p>
        </Card>
      )}
    </>
  );
}
