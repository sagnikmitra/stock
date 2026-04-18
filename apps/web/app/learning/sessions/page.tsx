import { prisma } from "@ibo/db";
import { Card, CardHeader, CardTitle, CardDescription } from "../../components/ui/card";
import { Badge } from "../../components/ui/badge";
import { PageHeader } from "../../components/ui/page-header";
import { EducationalDisclaimer } from "../../components/ui/educational-disclaimer";
import Link from "next/link";

export const revalidate = 60; // Cache for 60s — data changes only on pipeline/admin runs

export default async function SessionsPage() {
  const docs = await prisma.knowledgeDocument.findMany({
    where: { key: { startsWith: "session_" } },
    include: { sections: { orderBy: { sortOrder: "asc" } } },
    orderBy: { key: "asc" },
  });

  return (
    <>
      <PageHeader
        title="Course Sessions"
        description="WithArin 29th Batch — session-by-session knowledge base"
      />
      <EducationalDisclaimer className="mb-4" />

      <div className="space-y-4">
        {docs.map((doc) => (
          <Link key={doc.key} href={`/learning/${doc.key}`} className="block">
            <Card className="transition-shadow hover:shadow-md">
              <CardHeader>
                <div className="flex flex-wrap items-center gap-2">
                  <CardTitle className="min-w-0">{doc.title}</CardTitle>
                  <Badge variant={doc.confidence === "high" ? "favorable" : "mixed"}>
                    {doc.confidence}
                  </Badge>
                </div>
                {doc.summary && <CardDescription>{doc.summary}</CardDescription>}
              </CardHeader>
              <div className="flex flex-wrap gap-1.5">
                <Badge variant="default">Session {doc.sourceSession ?? "N/A"}</Badge>
                <Badge variant="muted">{doc.sections.length} sections</Badge>
                {doc.sections.slice(0, 6).map((sec) => (
                  <Badge key={sec.id} variant="muted">{sec.title}</Badge>
                ))}
                {doc.sections.length > 6 ? (
                  <Badge variant="muted">+{doc.sections.length - 6} more</Badge>
                ) : null}
              </div>
            </Card>
          </Link>
        ))}
      </div>
    </>
  );
}
