import { prisma } from "@ibo/db";
import { Card, CardHeader, CardTitle, CardDescription } from "../../components/ui/card";
import { Badge } from "../../components/ui/badge";
import { PageHeader } from "../../components/ui/page-header";

export const revalidate = 30; // Cache for 30s — data changes only on pipeline/admin runs

export default async function AdminKnowledgePage() {
  const [documents, concepts] = await Promise.all([
    prisma.knowledgeDocument.findMany({
      include: { _count: { select: { sections: true } } },
      orderBy: { key: "asc" },
    }),
    prisma.knowledgeConcept.findMany({
      orderBy: { title: "asc" },
    }),
  ]);

  return (
    <>
      <PageHeader
        title="Admin: Knowledge Base"
        description="Manage knowledge documents, sections, and concept definitions"
      />

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Knowledge Documents */}
        <div>
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-slate-400">
            Documents ({documents.length})
          </h2>
          {documents.length > 0 ? (
            <div className="space-y-3">
              {documents.map((doc) => (
                <Card key={doc.id}>
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-semibold text-slate-900">{doc.title}</h3>
                      <p className="text-xs text-slate-400">{doc.key}</p>
                    </div>
                    <div className="flex gap-2">
                      <Badge
                        variant={
                          doc.confidence === "high"
                            ? "favorable"
                            : doc.confidence === "medium"
                              ? "mixed"
                              : "muted"
                        }
                      >
                        {doc.confidence}
                      </Badge>
                    </div>
                  </div>
                  {doc.summary && <p className="mt-2 text-sm text-slate-600">{doc.summary}</p>}
                  <div className="mt-2 flex items-center gap-3 text-xs text-slate-400">
                    <span>{doc._count.sections} sections</span>
                    {doc.sourceSession && <span>Source: {doc.sourceSession}</span>}
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <p className="text-sm text-slate-400">No knowledge documents found.</p>
            </Card>
          )}
        </div>

        {/* Knowledge Concepts */}
        <div>
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-slate-400">
            Concepts ({concepts.length})
          </h2>
          {concepts.length > 0 ? (
            <div className="space-y-3">
              {concepts.map((concept) => {
                const linkedKeys = (concept.linkedStrategyKeys as string[] | null) ?? [];

                return (
                  <Card key={concept.id}>
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-semibold text-slate-900">{concept.title}</h3>
                        <p className="text-xs text-slate-400">{concept.key}</p>
                      </div>
                      <Badge variant="muted">{concept.category}</Badge>
                    </div>
                    <p className="mt-2 text-sm text-slate-600">{concept.definition}</p>
                    {linkedKeys.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-1">
                        <span className="text-xs text-slate-400">Linked strategies:</span>
                        {linkedKeys.map((key) => (
                          <Badge key={key} variant="investment">
                            {key}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </Card>
                );
              })}
            </div>
          ) : (
            <Card>
              <p className="text-sm text-slate-400">No knowledge concepts found.</p>
            </Card>
          )}
        </div>
      </div>
    </>
  );
}
