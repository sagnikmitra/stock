import { prisma } from "@ibo/db";
import { Card, CardHeader, CardTitle, CardDescription } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { PageHeader } from "../components/ui/page-header";
import Link from "next/link";
import { ScreenerLabClient } from "./screener-lab-client";

export const dynamic = "force-dynamic";

export default async function ScreenerLabPage() {
  const screeners = await prisma.screener.findMany({
    include: { linkedStrategy: { select: { key: true, name: true } } },
    orderBy: { name: "asc" },
  });

  const internal = screeners.filter((s) => !s.isExternalReference);
  const external = screeners.filter((s) => s.isExternalReference);

  return (
    <>
      <PageHeader
        title="Screener Lab"
        description="Set operations, overlap analysis, and explanation-first candidate review"
      >
        <Link
          href="/screener-lab/intersections"
          className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
        >
          API Playground
        </Link>
      </PageHeader>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Disclaimer</CardTitle>
          <CardDescription>
            Screeners are deterministic filters, not execution advice. Always separate investment and swing logic when reviewing overlap sets.
          </CardDescription>
        </CardHeader>
      </Card>

      <ScreenerLabClient
        screeners={screeners.map((screener) => ({
          key: screener.key,
          name: screener.name,
          description: screener.description,
          isExternalReference: screener.isExternalReference,
        }))}
      />

      <h2 className="mb-3 mt-6 text-lg font-semibold text-slate-800">Reference-Linked External Screeners</h2>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {external.map((screener) => (
          <Card key={screener.key} className="h-full">
            <CardHeader>
              <CardTitle>{screener.name}</CardTitle>
              <CardDescription>{screener.description}</CardDescription>
            </CardHeader>
            {screener.externalUrl ? (
              <a
                href={screener.externalUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-2 inline-block text-sm text-brand-600 hover:underline"
              >
                Open external screener
              </a>
            ) : null}
          </Card>
        ))}
      </div>

      <h2 className="mb-3 mt-6 text-lg font-semibold text-slate-800">Internal Screener Registry</h2>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {internal.map((screener) => (
          <Card key={screener.key} className="h-full">
            <CardHeader>
              <CardTitle>{screener.name}</CardTitle>
              <CardDescription>{screener.description}</CardDescription>
            </CardHeader>
            <div className="flex flex-wrap gap-1.5">
              {(screener.tags as string[] | null)?.map((tag) => (
                <Badge key={tag} variant="muted">
                  {tag}
                </Badge>
              ))}
            </div>
            {screener.linkedStrategy ? (
              <p className="mt-3 text-xs text-slate-400">
                Linked: <Link href={`/strategies/${screener.linkedStrategy.key}`} className="text-brand-600 hover:underline">{screener.linkedStrategy.name}</Link>
              </p>
            ) : null}
          </Card>
        ))}
      </div>
    </>
  );
}
