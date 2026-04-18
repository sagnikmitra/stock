import { prisma } from "@ibo/db";
import { Card } from "../../components/ui/card";
import { Badge } from "../../components/ui/badge";
import { PageHeader } from "../../components/ui/page-header";

export const revalidate = 30; // Cache for 30s — data changes only on pipeline/admin runs

export default async function AdminProvidersPage() {
  const providers = await prisma.provider.findMany({
    include: {
      _count: { select: { jobRuns: true, candles: true, quotes: true } },
    },
    orderBy: { name: "asc" },
  });

  return (
    <>
      <PageHeader
        title="Admin: Data Providers"
        description="Manage provider connections, view health and job history"
      />

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {providers.map((p) => (
          <Card key={p.id}>
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-semibold text-slate-900">{p.name}</h3>
                <p className="text-xs text-slate-400">{p.key} — {p.type}</p>
              </div>
              <Badge variant={p.isEnabled ? "favorable" : "hostile"}>
                {p.isEnabled ? "Enabled" : "Disabled"}
              </Badge>
            </div>
            {p.baseUrl && <p className="mt-2 text-xs text-slate-400">{p.baseUrl}</p>}
            <div className="mt-3 grid grid-cols-3 gap-2 text-center text-xs">
              <div>
                <p className="text-slate-400">Jobs</p>
                <p className="font-semibold">{p._count.jobRuns}</p>
              </div>
              <div>
                <p className="text-slate-400">Candles</p>
                <p className="font-semibold">{p._count.candles}</p>
              </div>
              <div>
                <p className="text-slate-400">Quotes</p>
                <p className="font-semibold">{p._count.quotes}</p>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </>
  );
}
