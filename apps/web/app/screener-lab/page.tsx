import { prisma } from "@ibo/db";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
} from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { PageHeader } from "../components/ui/page-header";
import Link from "next/link";
import { ScreenerLabClient } from "./screener-lab-client";

// Screeners change only on seed/admin updates — cache for 30s
export const revalidate = 30;

export default async function ScreenerLabPage() {
  const screeners = await prisma.screener.findMany({
    select: {
      key: true,
      name: true,
      description: true,
      isExternalReference: true,
      externalUrl: true,
      tags: true,
      linkedStrategy: { select: { key: true, name: true } },
    },
    orderBy: { name: "asc" },
  });

  const internal = screeners.filter((s) => !s.isExternalReference);
  const external = screeners.filter((s) => s.isExternalReference);

  return (
    <>
      <PageHeader
        title="Screener Lab"
        description="Build deterministic overlap sets, inspect explanation trails, and save high-confluence watchlists."
      >
        <div className="flex flex-wrap gap-2">
          <Link
            href="/screener-lab/intersections"
            className="rounded-xl border border-slate-200 bg-white/85 px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm hover:border-cyan-200 hover:bg-cyan-50/60"
          >
            API Playground
          </Link>
          <Link
            href="/screener-lab/presets"
            className="rounded-xl border border-slate-200 bg-white/85 px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm hover:border-cyan-200 hover:bg-cyan-50/60"
          >
            Presets
          </Link>
          <Link
            href="/screener-lab/tradingview"
            className="rounded-xl border border-cyan-200 bg-cyan-50/80 px-4 py-2 text-sm font-semibold text-cyan-800 shadow-sm hover:border-cyan-300 hover:bg-cyan-100/70"
          >
            TradingView Screener
          </Link>
          <Link
            href="/screener-lab/builder"
            className="rounded-xl border border-slate-200 bg-white/85 px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm hover:border-cyan-200 hover:bg-cyan-50/60"
          >
            Builder
          </Link>
          <Link
            href="/screener-lab/saved"
            className="rounded-xl border border-slate-200 bg-white/85 px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm hover:border-cyan-200 hover:bg-cyan-50/60"
          >
            Saved
          </Link>
        </div>
      </PageHeader>

      <Card className="mb-6 bg-gradient-to-r from-white/90 to-cyan-50/55">
        <CardHeader>
          <CardTitle>Disclaimer</CardTitle>
          <CardDescription>
            Screeners are deterministic filters, not execution advice. Always
            separate investment and swing logic when reviewing overlap sets.
          </CardDescription>
        </CardHeader>
      </Card>

      <ScreenerLabClient
        screeners={screeners.map((screener) => ({
          key: screener.key,
          name: screener.name,
          isExternalReference: screener.isExternalReference,
        }))}
      />

      <h2 className="mb-3 mt-6 text-lg font-semibold tracking-tight text-slate-900">
        Reference-Linked External Screeners
      </h2>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {external.map((screener) => (
          <Card
            key={screener.key}
            className="h-full border-slate-200/70 bg-white/82"
          >
            <CardHeader>
              <CardTitle>{screener.name}</CardTitle>
              <CardDescription>{screener.description}</CardDescription>
            </CardHeader>
            {screener.externalUrl ? (
              <a
                href={screener.externalUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-2 inline-block rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-xs font-semibold text-brand-700 hover:bg-brand-50"
              >
                Open external screener
              </a>
            ) : null}
          </Card>
        ))}
      </div>

      <h2 className="mb-3 mt-6 text-lg font-semibold tracking-tight text-slate-900">
        Internal Screener Registry
      </h2>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {internal.map((screener) => (
          <Card
            key={screener.key}
            className="h-full border-slate-200/70 bg-white/82"
          >
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
                Linked:{" "}
                <Link
                  href={`/strategies/${screener.linkedStrategy.key}`}
                  className="text-brand-600 hover:underline"
                >
                  {screener.linkedStrategy.name}
                </Link>
              </p>
            ) : null}
          </Card>
        ))}
      </div>
    </>
  );
}
