import { prisma } from "@ibo/db";
import { notFound } from "next/navigation";
import { Card, CardHeader, CardTitle } from "../../components/ui/card";
import { Badge } from "../../components/ui/badge";
import { PageHeader } from "../../components/ui/page-header";

export const dynamic = "force-dynamic";

interface Props {
  params: Promise<{ slug: string }>;
}

export default async function KnowledgeDocPage({ params }: Props) {
  const { slug } = await params;

  const doc = await prisma.knowledgeDocument.findUnique({
    where: { key: slug },
    include: { sections: { orderBy: { sortOrder: "asc" } } },
  });

  if (!doc) notFound();

  return (
    <>
      <PageHeader title={doc.title}>
        <Badge variant={doc.confidence === "high" ? "favorable" : "mixed"}>
          {doc.confidence} confidence
        </Badge>
      </PageHeader>

      {doc.summary && (
        <p className="mb-6 text-sm text-slate-600">{doc.summary}</p>
      )}

      <Card className="mb-6">
        <div className="prose prose-sm prose-slate max-w-none whitespace-pre-line">
          {doc.bodyMarkdown}
        </div>
      </Card>

      {doc.sections.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-slate-800">Sections</h2>
          {doc.sections.map((sec) => (
            <Card key={sec.id}>
              <CardHeader>
                <CardTitle>{sec.title}</CardTitle>
              </CardHeader>
              <div className="prose prose-sm prose-slate max-w-none whitespace-pre-line">
                {sec.bodyMarkdown}
              </div>
            </Card>
          ))}
        </div>
      )}
    </>
  );
}
