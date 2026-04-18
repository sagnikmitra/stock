import { prisma } from "@ibo/db";
import { Card } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { PageHeader } from "../components/ui/page-header";
import { EducationalDisclaimer } from "../components/ui/educational-disclaimer";
import Link from "next/link";

// Strategies change only on seed/admin updates — cache for 30s instead of re-querying on every click
export const revalidate = 30;

const familyVariant: Record<string, "investment" | "swing" | "default"> = {
  investment: "investment",
  swing: "swing",
};

export default async function StrategiesPage() {
  const strategies = await prisma.strategy.findMany({
    select: {
      key: true,
      name: true,
      family: true,
      description: true,
      primaryTimeframe: true,
      confidence: true,
      versions: { where: { isActive: true }, take: 1 },
      _count: { select: { ambiguityRecords: true, results: true } },
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
        description="Canonical strategy registry with active confidence, timeframe, and ambiguity signals."
      />
      <EducationalDisclaimer className="mb-4" />

      <div className="mb-6 grid gap-4 md:grid-cols-3">
        <Card className="bg-gradient-to-r from-white/92 to-cyan-50/55">
          <p className="text-xs uppercase tracking-wide text-slate-500">Total Strategies</p>
          <p className="mt-1 text-2xl font-bold tracking-tight text-slate-900">{strategies.length}</p>
        </Card>
        <Card className="bg-gradient-to-r from-white/92 to-teal-50/55">
          <p className="text-xs uppercase tracking-wide text-slate-500">Investment</p>
          <p className="mt-1 text-2xl font-bold tracking-tight text-slate-900">{strategies.filter((s) => s.family === "investment").length}</p>
        </Card>
        <Card className="bg-gradient-to-r from-white/92 to-amber-50/55">
          <p className="text-xs uppercase tracking-wide text-slate-500">Swing</p>
          <p className="mt-1 text-2xl font-bold tracking-tight text-slate-900">{strategies.filter((s) => s.family === "swing").length}</p>
        </Card>
      </div>

      {Object.entries(grouped).map(([family, items]) => (
        <div key={family} className="mb-8">
          <h2 className="mb-3 text-lg font-semibold capitalize tracking-tight text-slate-900">{family.replace("_", " ")}</h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {items.map((s) => (
              <Link key={s.key} href={`/strategies/${s.key}`}>
                <Card className="h-full border-slate-200/70 bg-white/86">
                  <div className="flex items-start justify-between">
                    <h3 className="font-semibold text-slate-900">{s.name}</h3>
                    <Badge variant={familyVariant[s.family] ?? "default"}>{s.family}</Badge>
                  </div>
                  <p className="mt-2 text-sm text-slate-500">{s.description}</p>
                  <div className="mt-3 flex items-center gap-2">
                    <Badge variant="muted">{s.primaryTimeframe}</Badge>
                    <Badge variant={s.confidence === "high" ? "favorable" : s.confidence === "medium" ? "mixed" : "hostile"}>
                      {s.confidence}
                    </Badge>
                    {s._count.ambiguityRecords > 0 && (
                      <Badge variant="ambiguity">{s._count.ambiguityRecords} ambiguity</Badge>
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
