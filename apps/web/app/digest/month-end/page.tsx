import { prisma } from "@ibo/db";
import { Card, CardHeader, CardTitle } from "../../components/ui/card";
import { Badge } from "../../components/ui/badge";
import { EducationalDisclaimer } from "../../components/ui/educational-disclaimer";
import Link from "next/link";

export const revalidate = 30; // Cache for 30s — data changes only on pipeline/admin runs

export default async function MonthEndDigestPage() {
  const digest = await prisma.digest.findFirst({
    where: { digestType: "month_end" },
    orderBy: { marketDate: "desc" },
    include: { sections: { orderBy: { sortOrder: "asc" } } },
  });

  return (
    <>
      <div className="mb-4 flex items-center justify-between gap-2">
        <h2 className="text-xl font-semibold text-slate-900">Month-End Digest</h2>
        <Link
          href="/digest"
          className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50"
        >
          View Archive
        </Link>
      </div>
      <EducationalDisclaimer className="mb-4" />

      {!digest ? (
        <Card>
          <p className="text-sm text-slate-400">
            No month-end digest available. This digest is gated for month-end runs unless force rerun is used.
          </p>
        </Card>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-semibold text-slate-800">{digest.title}</h2>
            <Badge variant="ambiguity">{digest.marketDate.toISOString().split("T")[0]}</Badge>
          </div>
          <p className="text-sm text-slate-600">{digest.summary}</p>

          {digest.sections.map((section) => (
            <Card key={section.id}>
              <CardHeader>
                <CardTitle>{section.title}</CardTitle>
              </CardHeader>
              <p className="whitespace-pre-wrap text-sm text-slate-600">{section.bodyMarkdown}</p>
            </Card>
          ))}
        </div>
      )}
    </>
  );
}
