import { prisma } from "@ibo/db";
import { Card, CardHeader, CardTitle } from "../../components/ui/card";
import { Badge } from "../../components/ui/badge";
import { PageHeader } from "../../components/ui/page-header";
import { EducationalDisclaimer } from "../../components/ui/educational-disclaimer";

export const dynamic = "force-dynamic";

export default async function PostCloseDigestPage() {
  const digest = await prisma.digest.findFirst({
    where: { digestType: "post_close" },
    orderBy: { marketDate: "desc" },
    include: {
      sections: { orderBy: { sortOrder: "asc" } },
      mentions: { include: { instrument: { select: { symbol: true } } } },
    },
  });

  return (
    <>
      <PageHeader
        title="Post-Close Digest"
        description="End-of-day summary with strategy matches, breadth, and highlights"
      />
      <EducationalDisclaimer className="mb-4" />

      {digest ? (
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <h2 className="text-lg font-semibold text-slate-800">{digest.title}</h2>
            <Badge variant="muted">{digest.marketDate.toLocaleDateString("en-IN")}</Badge>
          </div>

          <p className="text-sm text-slate-600">{digest.summary}</p>

          {digest.sections.map((section) => (
            <Card key={section.id}>
              <CardHeader>
                <CardTitle>{section.title}</CardTitle>
              </CardHeader>
              <div className="prose prose-sm prose-slate max-w-none">
                {section.bodyMarkdown}
              </div>
            </Card>
          ))}

          {digest.mentions.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Stock Mentions</CardTitle>
              </CardHeader>
              <div className="flex flex-wrap gap-2">
                {digest.mentions.map((m) => (
                  <Badge key={m.id} variant="default">{m.instrument.symbol}</Badge>
                ))}
              </div>
            </Card>
          )}
        </div>
      ) : (
        <Card>
          <p className="text-sm text-slate-400">
            No post-close digest available. Generated after 4:00 PM IST.
          </p>
        </Card>
      )}
    </>
  );
}
