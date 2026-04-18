import { prisma } from "@ibo/db";
import { Card, CardHeader, CardTitle } from "../../components/ui/card";
import { Badge } from "../../components/ui/badge";
import { PageHeader } from "../../components/ui/page-header";

export const revalidate = 30; // Cache for 30s — data changes only on pipeline/admin runs

export default async function AdminScreenersPage() {
  const screeners = await prisma.screener.findMany({
    include: {
      linkedStrategy: true,
      _count: { select: { versions: true, runs: true } },
    },
    orderBy: { name: "asc" },
  });

  return (
    <>
      <PageHeader
        title="Admin: Screeners"
        description="Manage screener definitions, linked strategies, and version history"
      />

      {screeners.length > 0 ? (
        <div className="space-y-4">
          {screeners.map((s) => {
            const tags = (s.tags as string[] | null) ?? [];

            return (
              <Card key={s.id}>
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-semibold text-slate-900">{s.name}</h3>
                    <p className="text-xs text-slate-400">{s.key}</p>
                  </div>
                  <div className="flex gap-2">
                    {s.isExternalReference && (
                      <Badge variant="mixed">External</Badge>
                    )}
                    <Badge variant="muted">
                      {s._count.versions} {s._count.versions === 1 ? "version" : "versions"}
                    </Badge>
                  </div>
                </div>

                <p className="mt-2 text-sm text-slate-600">{s.description}</p>

                <div className="mt-3 flex flex-wrap items-center gap-3 text-sm">
                  {s.linkedStrategy && (
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs text-slate-400">Strategy:</span>
                      <Badge
                        variant={
                          s.linkedStrategy.family === "investment"
                            ? "investment"
                            : "swing"
                        }
                      >
                        {s.linkedStrategy.name}
                      </Badge>
                    </div>
                  )}

                  {tags.length > 0 && (
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs text-slate-400">Tags:</span>
                      {tags.map((tag) => (
                        <Badge key={tag} variant="muted">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>

                {s.isExternalReference && s.externalUrl && (
                  <p className="mt-2 text-xs text-slate-400">URL: {s.externalUrl}</p>
                )}

                <div className="mt-3 grid grid-cols-2 gap-2 text-center text-xs">
                  <div>
                    <p className="text-slate-400">Versions</p>
                    <p className="font-semibold">{s._count.versions}</p>
                  </div>
                  <div>
                    <p className="text-slate-400">Runs</p>
                    <p className="font-semibold">{s._count.runs}</p>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      ) : (
        <Card>
          <p className="text-sm text-slate-400">No screeners found.</p>
        </Card>
      )}
    </>
  );
}
