import { prisma } from "@ibo/db";
import { notFound } from "next/navigation";
import { Card, CardHeader, CardTitle } from "../../components/ui/card";
import { Badge } from "../../components/ui/badge";
import { PageHeader } from "../../components/ui/page-header";
import { EducationalDisclaimer } from "../../components/ui/educational-disclaimer";
import { extractSectionBulletPoints } from "../../lib/course-session-parser";
import { LessonChartPanel } from "../../components/charts/lesson-chart-panel";

function sectionAnchor(title: string) {
  return title
    .toLowerCase()
    .replace(/[`*_~]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function extractReferenceLinks(markdown: string) {
  const links = Array.from(markdown.matchAll(/\[([^\]]+)\]\((https?:\/\/[^)]+)\)/g)).map((m) => ({
    label: m[1].trim(),
    href: m[2].trim(),
  }));

  const urls = Array.from(markdown.matchAll(/https?:\/\/[^\s)>\]]+/g)).map((m) => m[0].trim());
  for (const url of urls) {
    if (!links.some((l) => l.href === url)) {
      let label = url;
      try {
        label = new URL(url).hostname.replace(/^www\./, "");
      } catch {
        // keep original url label
      }
      links.push({ label, href: url });
    }
  }

  return links;
}

export const revalidate = 60; // Cache for 60s — data changes only on pipeline/admin runs

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

  const refs = Array.from(
    new Map(
      [
        ...extractReferenceLinks(doc.bodyMarkdown),
        ...doc.sections.flatMap((section) => extractReferenceLinks(section.bodyMarkdown)),
      ].map((ref) => [ref.href, ref]),
    ).values(),
  );

  return (
    <>
      <PageHeader title={doc.title}>
        <Badge variant={doc.confidence === "high" ? "favorable" : "mixed"}>
          {doc.confidence} confidence
        </Badge>
      </PageHeader>
      <EducationalDisclaimer className="mb-4" />

      {doc.summary && (
        <p className="mb-6 text-sm text-slate-600">{doc.summary}</p>
      )}

      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_280px]">
        <div className="space-y-4">
          <Card className="mb-2">
            <div className="space-y-3">
              <p className="text-xs font-semibold uppercase tracking-[0.08em] text-slate-500">
                Session Scope
              </p>
              <div className="prose prose-sm prose-slate max-w-none whitespace-pre-wrap break-words text-slate-700">
                {doc.bodyMarkdown.slice(0, 1400)}
              </div>
            </div>
          </Card>

          {doc.sections.length > 0 ? (
            <div className="space-y-4">
              {doc.sections.map((sec) => {
                const bulletPoints = extractSectionBulletPoints(sec.bodyMarkdown, 8);
                return (
                  <section key={sec.id} id={sectionAnchor(sec.title)}>
                    <Card>
                      <CardHeader>
                        <CardTitle className="break-words text-xl">{sec.title}</CardTitle>
                      </CardHeader>
                      <div className="space-y-3">
                        {bulletPoints.length > 0 ? (
                          <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                            <p className="mb-2 text-xs font-semibold uppercase tracking-[0.08em] text-slate-500">
                              Key Takeaways
                            </p>
                            <ul className="space-y-1 text-sm text-slate-700">
                              {bulletPoints.map((point) => (
                                <li key={point} className="list-disc break-words pl-1 ml-4">
                                  {point}
                                </li>
                              ))}
                            </ul>
                          </div>
                        ) : null}

                        <div className="prose prose-sm prose-slate max-w-none whitespace-pre-wrap break-words">
                          {sec.bodyMarkdown}
                        </div>
                        <LessonChartPanel sectionTitle={sec.title} sectionBody={sec.bodyMarkdown} />
                      </div>
                    </Card>
                  </section>
                );
              })}
            </div>
          ) : null}
        </div>

        <div className="space-y-4 lg:sticky lg:top-20 lg:self-start">
          <Card>
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.08em] text-slate-500">
              Session Navigation
            </p>
            <nav className="space-y-2">
              {doc.sections.map((sec) => (
                <a
                  key={sec.id}
                  href={`#${sectionAnchor(sec.title)}`}
                  className="block text-sm text-slate-700 underline-offset-2 hover:text-slate-900 hover:underline"
                >
                  {sec.title}
                </a>
              ))}
            </nav>
          </Card>

          {refs.length > 0 ? (
            <Card>
              <p className="mb-3 text-xs font-semibold uppercase tracking-[0.08em] text-slate-500">
                References
              </p>
              <div className="space-y-2 text-sm">
                {refs.map((ref) => (
                  <a
                    key={ref.href}
                    href={ref.href}
                    target="_blank"
                    rel="noreferrer"
                    className="block break-all text-slate-700 underline underline-offset-2 hover:text-slate-900"
                  >
                    {ref.label}
                  </a>
                ))}
              </div>
            </Card>
          ) : null}
        </div>
      </div>
    </>
  );
}
