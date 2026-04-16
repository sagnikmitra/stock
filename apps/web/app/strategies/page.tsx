import { prisma } from "@ibo/db";
import { Card } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { PageHeader } from "../components/ui/page-header";
import Link from "next/link";

export const dynamic = "force-dynamic";

const familyVariant: Record<string, "investment" | "swing" | "default"> = {
  investment: "investment",
  swing: "swing",
};

export default async function StrategiesPage() {
  const strategies = await prisma.strategy.findMany({
    include: {
      versions: { where: { isActive: true }, take: 1 },
      ambiguityRecords: true,
      _count: { select: { results: true } },
    },
    orderBy: [{ family: "asc" }, { name: "asc" }],
  });

  const grouped = strategies.reduce<Record<string, typeof strategies>>((acc, s) => {
    const family = s.family;
    if (!acc[family]) acc[family] = [];
    acc[family].push(s);
    return acc;
  }, {});

  return (
    <>
      <PageHeader
        title="Strategies"
        description="All course-derived strategies with rules, confidence levels, and ambiguity tracking"
      />

      {Object.entries(grouped).map(([family, items]) => (
        <div key={family} className="mb-8">
          <h2 className="mb-3 text-lg font-semibold capitalize text-slate-800">{family.replace("_", " ")}</h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {items.map((s) => (
              <Link key={s.key} href={`/strategies/${s.key}`}>
                <Card className="h-full transition-shadow hover:shadow-md">
                  <div className="flex items-start justify-between">
                    <h3 className="font-semibold text-slate-900">{s.name}</h3>
                    <Badge variant={familyVariant[s.family] ?? "default"}>{s.family}</Badge>
                  </div>
                  <p className="mt-2 line-clamp-2 text-sm text-slate-500">{s.description}</p>
                  <div className="mt-3 flex items-center gap-2">
                    <Badge variant="muted">{s.primaryTimeframe}</Badge>
                    <Badge variant={s.confidence === "high" ? "favorable" : s.confidence === "medium" ? "mixed" : "hostile"}>
                      {s.confidence}
                    </Badge>
                    {s.ambiguityRecords.length > 0 && (
                      <Badge variant="ambiguity">{s.ambiguityRecords.length} ambiguity</Badge>
                    )}
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      ))}
    </>
  );
}
