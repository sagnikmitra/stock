import { prisma } from "@ibo/db";
import { Card, CardHeader, CardTitle, CardDescription } from "../../components/ui/card";
import { Badge } from "../../components/ui/badge";
import { PageHeader } from "../../components/ui/page-header";
import Link from "next/link";

export const dynamic = "force-dynamic";

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

      <div className="space-y-4">
        {docs.map((doc) => (
          <Link key={doc.key} href={`/learning/${doc.key}`}>
            <Card className="transition-shadow hover:shadow-md">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <CardTitle>{doc.title}</CardTitle>
                  <Badge variant={doc.confidence === "high" ? "favorable" : "mixed"}>
                    {doc.confidence}
                  </Badge>
                </div>
                {doc.summary && <CardDescription>{doc.summary}</CardDescription>}
              </CardHeader>
              <div className="flex flex-wrap gap-1.5">
                {doc.sections.map((sec) => (
                  <Badge key={sec.id} variant="muted">{sec.title}</Badge>
                ))}
              </div>
            </Card>
          </Link>
        ))}
      </div>
    </>
  );
}
