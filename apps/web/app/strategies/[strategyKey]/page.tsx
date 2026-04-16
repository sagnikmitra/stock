import { prisma } from "@ibo/db";
import { notFound } from "next/navigation";
import { Card, CardHeader, CardTitle, CardDescription } from "../../components/ui/card";
import { Badge } from "../../components/ui/badge";
import { PageHeader } from "../../components/ui/page-header";
import Link from "next/link";
import { OhlcChart } from "../../components/charts/ohlc-chart";

export const dynamic = "force-dynamic";

interface Props {
  params: Promise<{ strategyKey: string }>;
}

function stringifyJson(value: unknown): string {
  try {
    return JSON.stringify(value, null, 2);
  } catch {
    return "{}";
  }
}

export default async function StrategyDetailPage({ params }: Props) {
  const { strategyKey } = await params;

  const strategy = await prisma.strategy.findUnique({
    where: { key: strategyKey },
    include: {
      versions: { orderBy: { version: "desc" } },
      ambiguityRecords: true,
      results: {
        orderBy: { marketDate: "desc" },
        include: { instrument: { select: { symbol: true, companyName: true } } },
        take: 50,
      },
    },
  });

  if (!strategy) notFound();

  const activeVersion = strategy.versions.find((v) => v.isActive);
  const rules = activeVersion
    ? await prisma.strategyRule.findMany({
        where: { strategyVersionId: activeVersion.id },
        orderBy: { sortOrder: "asc" },
      })
    : [];

  const sourceResources = await prisma.externalResource.findMany({
    where: { category: { in: ["official", "screener", "user_reference"] } },
    take: 8,
    orderBy: { category: "asc" },
  });

  const matchesByDate = new Map<string, number>();
  for (const match of strategy.results) {
    const key = match.marketDate.toISOString().split("T")[0];
    matchesByDate.set(key, (matchesByDate.get(key) ?? 0) + 1);
  }

  const relatedScreeners = await prisma.screener.findMany({
    where: { linkedStrategyId: strategy.id },
    orderBy: { name: "asc" },
  });

  const learningNote = await prisma.knowledgeDocument.findFirst({
    where: { OR: [{ key: { contains: strategy.key } }, { bodyMarkdown: { contains: strategy.name } }] },
    orderBy: { updatedAt: "desc" },
  });

  const sampleMatch = strategy.results[0];
  const sourceSessionKeys = (activeVersion?.sourceSessions ?? "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
  const latestRuleResults = (sampleMatch?.ruleResults ?? {}) as Record<string, { passed?: boolean; reason?: string }>;
  const sampleCandles = sampleMatch
    ? await prisma.candle.findMany({
      where: { instrumentId: sampleMatch.instrumentId, timeframe: "D1" },
      orderBy: { ts: "asc" },
      take: 200,
    })
    : [];

  return (
    <>
      <PageHeader title={strategy.name} description={strategy.description}>
        <div className="flex flex-wrap gap-2">
          <Link
            href={`/strategies/${strategy.key}/backtest`}
            className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700"
          >
            Run Backtest
          </Link>
          <Link
            href={`/strategies/${strategy.key}/history`}
            className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            View History
          </Link>
          <Link
            href="/learning/ambiguities"
            className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            Ambiguity Ledger
          </Link>
        </div>
      </PageHeader>

      <div className="mb-4 flex flex-wrap gap-2">
        <Badge variant={strategy.family === "investment" ? "investment" : "swing"}>{strategy.family}</Badge>
        <Badge variant={strategy.confidence === "high" ? "favorable" : strategy.confidence === "medium" ? "mixed" : "hostile"}>
          {strategy.confidence} confidence
        </Badge>
        <Badge variant="muted">Review: {strategy.reviewFrequency ?? "n/a"}</Badge>
        {strategy.primaryTimeframe ? <Badge variant="muted">{strategy.primaryTimeframe}</Badge> : null}
        {strategy.secondaryTimeframe ? <Badge variant="muted">{strategy.secondaryTimeframe}</Badge> : null}
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Active vs Raw Strategy Source</CardTitle>
          <CardDescription>
            Ambiguity is preserved. Raw note context is shown next to the active normalized DSL.
          </CardDescription>
        </CardHeader>

        {activeVersion ? (
          <div className="grid gap-4 lg:grid-cols-2">
            <div className="rounded-lg border border-orange-200 bg-orange-50 p-3">
              <p className="mb-2 text-sm font-semibold text-orange-900">Raw Source Context</p>
              <p className="whitespace-pre-wrap text-sm text-orange-800">
                {activeVersion.sourceSummary ??
                  "No raw summary captured for this version. Refer to ambiguity ledger entries for shorthand conflicts."}
              </p>
            </div>
            <div className="rounded-lg border border-slate-200 bg-slate-900 p-3">
              <p className="mb-2 text-sm font-semibold text-slate-100">Normalized Active DSL</p>
              <pre className="max-h-80 overflow-auto text-xs text-slate-200">
                {stringifyJson(activeVersion.normalizedDsl)}
              </pre>
            </div>
          </div>
        ) : (
          <p className="text-sm text-slate-400">No active version assigned.</p>
        )}
      </Card>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Rule Breakdown</CardTitle>
          <CardDescription>
            Hard/soft/ambiguity-labeled rule list from the active version.
          </CardDescription>
        </CardHeader>
        <div className="mb-3 grid gap-2 rounded-lg border border-slate-200 p-3 text-sm md:grid-cols-3 dark:border-slate-700">
          <div>
            <p className="text-xs text-slate-500">When to run</p>
            <p>{strategy.reviewFrequency ?? "daily"}</p>
          </div>
          <div>
            <p className="text-xs text-slate-500">What timeframe</p>
            <p>{strategy.primaryTimeframe ?? "D1"}{strategy.secondaryTimeframe ? ` / ${strategy.secondaryTimeframe}` : ""}</p>
          </div>
          <div>
            <p className="text-xs text-slate-500">Do not confuse with</p>
            <p>Other family setups without matching hard-rule structure.</p>
          </div>
        </div>
        {rules.length > 0 ? (
          <div className="space-y-3">
            {rules.map((rule) => (
              <div key={rule.id} className="flex items-start gap-3 rounded-lg border border-slate-100 p-3">
                <Badge
                  variant={
                    rule.kind === "hard" ? "hostile" : rule.kind === "ambiguity" ? "ambiguity" : "muted"
                  }
                >
                  {rule.kind}
                </Badge>
                <div>
                  <p className="text-sm font-medium text-slate-800">{rule.label}</p>
                  <p className="text-sm text-slate-500">{rule.description}</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-slate-400">No rules defined for active version.</p>
        )}
      </Card>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Source Sessions</CardTitle>
          <CardDescription>Primary course sessions linked to this normalized strategy.</CardDescription>
        </CardHeader>
        {sourceSessionKeys.length > 0 ? (
          <div className="flex flex-wrap gap-2 text-sm">
            {sourceSessionKeys.map((session) => (
              <Link key={session} href={`/learning/sessions`} className="rounded border border-slate-200 px-2 py-1 hover:border-brand-300">
                {session}
              </Link>
            ))}
          </div>
        ) : (
          <p className="text-sm text-slate-500">No source session links available.</p>
        )}
      </Card>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Latest Hard Rule Status</CardTitle>
          <CardDescription>Pass/fail view from most recent strategy result for quick manual review.</CardDescription>
        </CardHeader>
        {rules.filter((rule) => rule.kind === "hard").length > 0 ? (
          <div className="grid gap-2">
            {rules
              .filter((rule) => rule.kind === "hard")
              .map((rule) => {
                const status = latestRuleResults[rule.key];
                return (
                  <div key={rule.key} className="flex items-center justify-between rounded border border-slate-200 p-2 text-sm dark:border-slate-700">
                    <span>{rule.label}</span>
                    <span className={`rounded px-2 py-0.5 text-xs ${status?.passed ? "bg-emerald-100 text-emerald-700" : "bg-rose-100 text-rose-700"}`}>
                      {status?.passed ? "PASS" : "FAIL"}
                    </span>
                  </div>
                );
              })}
          </div>
        ) : (
          <p className="text-sm text-slate-500">No hard rules configured.</p>
        )}
      </Card>

      {strategy.ambiguityRecords.length > 0 ? (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Ambiguity Details</CardTitle>
            <CardDescription>Conflicts are tracked explicitly and not silently overridden.</CardDescription>
          </CardHeader>
          <div className="space-y-3">
            {strategy.ambiguityRecords.map((ambiguity) => (
              <div key={ambiguity.id} className="rounded-lg border border-orange-200 bg-orange-50 p-3">
                <div className="mb-1 flex items-center gap-2">
                  <Badge variant="ambiguity">{ambiguity.severity}</Badge>
                  <span className="text-sm font-medium text-orange-900">{ambiguity.key}</span>
                </div>
                <p className="text-sm text-orange-800">Raw: {ambiguity.rawNote}</p>
                <p className="text-sm text-orange-700">Normalized: {ambiguity.normalizedNote}</p>
                {ambiguity.sourcePreference ? (
                  <p className="mt-1 text-xs text-orange-700">Preference: {ambiguity.sourcePreference}</p>
                ) : null}
              </div>
            ))}
          </div>
        </Card>
      ) : null}

      <div className="mb-6 grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Recent Matches</CardTitle>
            <CardDescription>Latest rule matches produced by deterministic strategy runs.</CardDescription>
          </CardHeader>
          {strategy.results.length > 0 ? (
            <div className="space-y-2">
              {strategy.results.slice(0, 10).map((match) => (
                <div key={match.id} className="flex items-center justify-between rounded-lg border border-slate-100 p-2 text-sm">
                  <div>
                    <p className="font-medium text-slate-800">{match.instrument.symbol}</p>
                    <p className="text-xs text-slate-500">{match.instrument.companyName}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-slate-500">{match.marketDate.toISOString().split("T")[0]}</p>
                    <Badge variant={match.matched ? "favorable" : "muted"}>{match.matched ? "matched" : "not matched"}</Badge>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-slate-400">No match history available.</p>
          )}
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Match History by Date</CardTitle>
            <CardDescription>Date-level counts for quick stability checks.</CardDescription>
          </CardHeader>
          {matchesByDate.size > 0 ? (
            <div className="space-y-2 text-sm">
              {Array.from(matchesByDate.entries())
                .slice(0, 12)
                .map(([dateKey, count]) => (
                  <div key={dateKey} className="flex items-center justify-between rounded-lg border border-slate-100 p-2">
                    <span className="text-slate-600">{dateKey}</span>
                    <span className="font-semibold text-slate-900">{count}</span>
                  </div>
                ))}
            </div>
          ) : (
            <p className="text-sm text-slate-400">No historical run data.</p>
          )}
        </Card>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Entry / Stop-Loss / Exit Logic</CardTitle>
          <CardDescription>From normalized strategy DSL (educational simulation only).</CardDescription>
        </CardHeader>
        <div className="grid gap-3 md:grid-cols-3 text-sm">
          <div className="rounded-lg border border-slate-200 p-3 dark:border-slate-700">
            <p className="text-xs text-slate-500">Entry</p>
            <pre className="mt-1 overflow-auto text-xs">{stringifyJson((activeVersion?.normalizedDsl as any)?.entry ?? {})}</pre>
          </div>
          <div className="rounded-lg border border-slate-200 p-3 dark:border-slate-700">
            <p className="text-xs text-slate-500">Stop Loss</p>
            <pre className="mt-1 overflow-auto text-xs">{stringifyJson((activeVersion?.normalizedDsl as any)?.stopLoss ?? {})}</pre>
          </div>
          <div className="rounded-lg border border-slate-200 p-3 dark:border-slate-700">
            <p className="text-xs text-slate-500">Exit</p>
            <pre className="mt-1 overflow-auto text-xs">{stringifyJson((activeVersion?.normalizedDsl as any)?.exit ?? {})}</pre>
          </div>
        </div>
      </Card>

      {sampleCandles.length ? (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Sample Match Chart</CardTitle>
            <CardDescription>{sampleMatch?.instrument.symbol} recent candles</CardDescription>
          </CardHeader>
          <OhlcChart candles={sampleCandles.map((candle) => ({
            time: candle.ts.toISOString(),
            open: Number(candle.open),
            high: Number(candle.high),
            low: Number(candle.low),
            close: Number(candle.close),
          }))} />
        </Card>
      ) : null}

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Related Screeners</CardTitle>
        </CardHeader>
        <div className="space-y-2 text-sm">
          {relatedScreeners.map((screener) => (
            <div key={screener.id} className="rounded-lg border border-slate-100 p-2 dark:border-slate-700">
              <p className="font-medium">{screener.name}</p>
              <p className="text-xs text-slate-500">{screener.key}</p>
            </div>
          ))}
          {relatedScreeners.length === 0 ? <p className="text-slate-500">No linked screeners.</p> : null}
        </div>
      </Card>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Learning Note</CardTitle>
        </CardHeader>
        {learningNote ? (
          <div className="text-sm">
            <p className="font-medium">{learningNote.title}</p>
            <p className="mt-1 text-slate-500">{learningNote.summary ?? "No summary"}</p>
            <Link className="mt-2 inline-block text-brand-600 hover:underline" href={`/learning/${learningNote.key}`}>Open learning document</Link>
          </div>
        ) : <p className="text-sm text-slate-500">No linked learning note.</p>}
      </Card>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Source References</CardTitle>
          <CardDescription>
            External links are reference aids only. Internal deterministic rules remain primary.
          </CardDescription>
        </CardHeader>
        <ul className="space-y-2 text-sm">
          {sourceResources.map((resource) => (
            <li key={resource.id} className="rounded-lg border border-slate-100 p-2">
              <a href={resource.url} target="_blank" rel="noreferrer" className="font-medium text-brand-600 hover:underline">
                {resource.title}
              </a>
              <p className="text-xs text-slate-500">{resource.category}{resource.provider ? ` • ${resource.provider}` : ""}</p>
            </li>
          ))}
        </ul>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Version History</CardTitle>
          <CardDescription>Active/raw ambiguity context is versioned, not overwritten.</CardDescription>
        </CardHeader>
        <div className="space-y-2">
          {strategy.versions.map((version) => (
            <div key={version.id} className="flex items-center justify-between rounded-lg border border-slate-100 p-3">
              <div>
                <p className="text-sm font-medium text-slate-900">v{version.version}</p>
                <p className="text-xs text-slate-500">Sessions: {version.sourceSessions}</p>
                {version.implementationNotes ? (
                  <p className="text-xs text-slate-400">{version.implementationNotes}</p>
                ) : null}
              </div>
              {version.isActive ? <Badge variant="favorable">Active</Badge> : <Badge variant="muted">Inactive</Badge>}
            </div>
          ))}
        </div>
      </Card>
    </>
  );
}
