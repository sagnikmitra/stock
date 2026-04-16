import { prisma } from "@ibo/db";
import { Card, CardHeader, CardTitle, CardDescription } from "../../components/ui/card";
import { Badge } from "../../components/ui/badge";
import { PageHeader } from "../../components/ui/page-header";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function IndicatorReferencePage() {
  const indicators = await prisma.knowledgeConcept.findMany({
    where: { category: "indicator" },
    orderBy: { title: "asc" },
  });

  return (
    <>
      <PageHeader
        title="Indicator Reference"
        description="Technical indicators used across strategies with definitions and linked strategies"
      />

      {indicators.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {indicators.map((ind) => {
            const linkedKeys = (ind.linkedStrategyKeys as string[] | null) ?? [];

            return (
              <Card key={ind.id}>
                <CardHeader>
                  <CardTitle>{ind.title}</CardTitle>
                  <CardDescription>{ind.key}</CardDescription>
                </CardHeader>

                <p className="mb-3 text-sm text-slate-600">{ind.definition}</p>

                {ind.notes && (
                  <p className="mb-3 text-xs text-slate-400 italic">{ind.notes}</p>
                )}

                {linkedKeys.length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {linkedKeys.map((key) => (
                      <Link key={key} href={`/strategies/${key}`}>
                        <Badge variant="investment" className="cursor-pointer hover:opacity-80">
                          {key}
                        </Badge>
                      </Link>
                    ))}
                  </div>
                )}

                {linkedKeys.length === 0 && (
                  <p className="text-xs text-slate-400">No linked strategies</p>
                )}
              </Card>
            );
          })}
        </div>
      ) : (
        <Card>
          <p className="text-sm text-slate-400">
            No indicator concepts found. Add KnowledgeConcepts with category "indicator" to populate
            this page.
          </p>
        </Card>
      )}
    </>
  );
}
