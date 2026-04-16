import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@ibo/db";
import { Card, CardHeader, CardTitle, CardDescription } from "../../components/ui/card";
import { Badge } from "../../components/ui/badge";
import { PageHeader } from "../../components/ui/page-header";
import { EducationalDisclaimer } from "../../components/ui/educational-disclaimer";

export const dynamic = "force-dynamic";

interface Props {
  params: Promise<{ date: string }>;
}

export default async function DigestDatePage({ params }: Props) {
  const { date } = await params;
  const marketDate = new Date(date);
  if (Number.isNaN(marketDate.getTime())) notFound();

  const digests = await prisma.digest.findMany({
    where: { marketDate },
    include: {
      sections: { orderBy: { sortOrder: "asc" } },
      mentions: { include: { instrument: { select: { symbol: true, companyName: true } } } },
    },
    orderBy: [{ digestType: "asc" }, { createdAt: "desc" }],
  });

  if (digests.length === 0) notFound();

  const digestLinks = digests.map((digest) => ({
    id: digest.id,
    title: digest.title,
    digestType: digest.digestType,
  }));

  return (
    <>
      <PageHeader
        title={`Digest — ${date}`}
        description="Date-level digest history with sections, posture, stock mentions, and context transparency"
      >
        <Link
          href="/digest"
          className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50"
        >
          Back to Archive
        </Link>
      </PageHeader>
      <EducationalDisclaimer className="mb-4" />

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Digest Types Present</CardTitle>
          <CardDescription>
            Multiple digests can exist on the same date. Use type badges to distinguish pre-market, post-close, and month-end.
          </CardDescription>
        </CardHeader>
        <div className="flex flex-wrap gap-2">
          {digestLinks.map((entry) => (
            <Badge key={entry.id} variant="muted">
              {entry.digestType.replace(/_/g, " ")}
            </Badge>
          ))}
        </div>
      </Card>

      <div className="space-y-6">
        {digests.map((digest) => (
          <Card key={digest.id}>
            <CardHeader>
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="muted">{digest.digestType.replace(/_/g, " ")}</Badge>
                {digest.posture ? (
                  <Badge
                    variant={
                      digest.posture === "favorable"
                        ? "favorable"
                        : digest.posture === "hostile"
                          ? "hostile"
                          : "mixed"
                    }
                  >
                    {digest.posture}
                  </Badge>
                ) : null}
              </div>
              <CardTitle>{digest.title}</CardTitle>
              <CardDescription>{digest.summary}</CardDescription>
            </CardHeader>

            <div className="space-y-4">
              {digest.sections.map((section) => (
                <div key={section.id} className="rounded-lg border border-slate-100 p-3">
                  <p className="text-sm font-semibold text-slate-800">{section.title}</p>
                  <p className="mt-1 whitespace-pre-wrap text-sm text-slate-600">{section.bodyMarkdown}</p>
                </div>
              ))}

              {digest.mentions.length > 0 ? (
                <div className="rounded-lg border border-slate-100 p-3">
                  <p className="mb-2 text-sm font-semibold text-slate-800">Stock Mentions</p>
                  <div className="flex flex-wrap gap-2">
                    {digest.mentions.map((mention) => (
                      <Badge key={mention.id} variant="default">
                        {mention.instrument.symbol} ({mention.mentionType})
                      </Badge>
                    ))}
                  </div>
                </div>
              ) : null}
            </div>
          </Card>
        ))}
      </div>
    </>
  );
}
