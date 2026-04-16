import { prisma } from "@ibo/db";
import { Card } from "../../components/ui/card";
import { Badge } from "../../components/ui/badge";
import { PageHeader } from "../../components/ui/page-header";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function ConceptsPage() {
  const concepts = await prisma.knowledgeConcept.findMany({
    orderBy: [{ category: "asc" }, { title: "asc" }],
  });

  const grouped = concepts.reduce<Record<string, typeof concepts>>((acc, c) => {
    if (!acc[c.category]) acc[c.category] = [];
    acc[c.category].push(c);
    return acc;
  }, {});

  return (
    <>
      <PageHeader
        title="Concepts"
        description="Indicators, patterns, principles, and rules from the course"
      />

      {Object.entries(grouped).map(([category, items]) => (
        <div key={category} className="mb-8">
          <h2 className="mb-3 text-lg font-semibold capitalize text-slate-800">{category}s</h2>
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
            {items.map((c) => (
              <Card key={c.key} className="h-full">
                <h3 className="font-semibold text-slate-900">{c.title}</h3>
                <p className="mt-1 text-sm text-slate-500">{c.definition}</p>
                {(c.linkedStrategyKeys as string[] | null)?.length ? (
                  <div className="mt-3 flex flex-wrap gap-1">
                    {(c.linkedStrategyKeys as string[]).map((sk) => (
                      <Link key={sk} href={`/strategies/${sk}`}>
                        <Badge variant="muted">{sk}</Badge>
                      </Link>
                    ))}
                  </div>
                ) : null}
              </Card>
            ))}
          </div>
        </div>
      ))}
    </>
  );
}
