import { prisma } from "@ibo/db";
import { Card, CardHeader, CardTitle } from "../../components/ui/card";
import { Badge } from "../../components/ui/badge";
import { PageHeader } from "../../components/ui/page-header";

export const revalidate = 30; // Cache for 30s — data changes only on pipeline/admin runs

export default async function AdminStrategiesPage() {
  const strategies = await prisma.strategy.findMany({
    include: {
      versions: { orderBy: { version: "desc" } },
      ambiguityRecords: true,
    },
    orderBy: [{ family: "asc" }, { name: "asc" }],
  });

  return (
    <>
      <PageHeader
        title="Admin: Strategies"
        description="Manage strategy versions, activate/deactivate, review DSL"
      />

      <div className="space-y-4">
        {strategies.map((s) => (
          <Card key={s.id}>
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-semibold text-slate-900">{s.name}</h3>
                <p className="text-xs text-slate-400">{s.key}</p>
              </div>
              <div className="flex gap-2">
                <Badge variant={s.status === "active" ? "favorable" : "muted"}>{s.status}</Badge>
                <Badge variant="muted">{s.family}</Badge>
              </div>
            </div>
            <div className="mt-3">
              <p className="mb-2 text-xs font-semibold uppercase text-slate-400">Versions</p>
              <div className="space-y-1">
                {s.versions.map((v) => (
                  <div key={v.id} className="flex items-center gap-3 rounded border border-slate-100 px-3 py-2 text-sm">
                    <span className="font-mono">v{v.version}</span>
                    <span className="text-slate-400">|</span>
                    <span className="text-xs text-slate-500">Sessions: {v.sourceSessions}</span>
                    {v.isActive && <Badge variant="favorable">Active</Badge>}
                    {v.implementationNotes && (
                      <span className="text-xs text-slate-400">{v.implementationNotes}</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
            {s.ambiguityRecords.length > 0 && (
              <div className="mt-2">
                <Badge variant="ambiguity">{s.ambiguityRecords.length} ambiguities</Badge>
              </div>
            )}
          </Card>
        ))}
      </div>
    </>
  );
}
