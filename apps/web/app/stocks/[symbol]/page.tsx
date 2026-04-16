import { prisma } from "@ibo/db";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Card, CardHeader, CardTitle, CardDescription } from "../../components/ui/card";
import { Badge } from "../../components/ui/badge";
import { PageHeader } from "../../components/ui/page-header";
import { OhlcChart } from "../../components/charts/ohlc-chart";
import { IndicatorChart } from "../../components/charts/indicator-chart";
import { WatchlistButton } from "../../components/stocks/watchlist-button";
import { NoteForm } from "../../components/stocks/note-form";

export const dynamic = "force-dynamic";

interface Props {
  params: Promise<{ symbol: string }>;
}

export default async function StockDetailPage({ params }: Props) {
  const { symbol } = await params;
  const sym = decodeURIComponent(symbol).toUpperCase();

  const instrument = await prisma.instrument.findFirst({
    where: { symbol: sym },
    include: { exchange: true },
  });
  if (!instrument) notFound();

  const [
    candles,
    latestIndicator,
    strategyMatches,
    digestMentions,
    screenerMatches,
    notes,
    watchlist,
    watchlistItem,
    learningDocs,
  ] = await Promise.all([
    prisma.candle.findMany({
      where: { instrumentId: instrument.id, timeframe: "D1" },
      orderBy: { ts: "asc" },
      take: 260,
    }),
    prisma.indicatorSnapshot.findFirst({
      where: { instrumentId: instrument.id, timeframe: "D1" },
      orderBy: { ts: "desc" },
    }),
    prisma.strategyResult.findMany({
      where: { instrumentId: instrument.id, matched: true },
      include: { strategy: true },
      orderBy: { marketDate: "desc" },
      take: 20,
    }),
    prisma.digestStockMention.findMany({
      where: { instrumentId: instrument.id },
      include: { digest: true },
      orderBy: { createdAt: "desc" },
      take: 20,
    }),
    prisma.screenerResult.findMany({
      where: { instrumentId: instrument.id, matched: true },
      include: { screenerRun: { include: { screener: true } } },
      orderBy: { marketDate: "desc" },
      take: 20,
    }),
    prisma.note.findMany({
      where: { instrumentId: instrument.id },
      orderBy: { createdAt: "desc" },
      take: 20,
    }),
    prisma.watchlist.findFirst({
      where: { kind: "manual" },
      orderBy: { updatedAt: "desc" },
    }),
    prisma.watchlistItem.findFirst({
      where: {
        watchlist: { kind: "manual" },
        instrumentId: instrument.id,
        isActive: true,
      },
      orderBy: { addedAt: "desc" },
    }),
    prisma.knowledgeDocument.findMany({
      where: {
        OR: [{ bodyMarkdown: { contains: sym } }, { summary: { contains: sym } }],
      },
      take: 10,
    }),
  ]);

  const rsiData = candles.map((candle, index) => ({
    time: candle.ts.toISOString(),
    value: index < candles.length - 1 && latestIndicator?.rsi14 ? Number(latestIndicator.rsi14) : 50,
  }));

  return (
    <div className="space-y-6">
      <PageHeader title={`${instrument.symbol} — ${instrument.companyName}`} description={[instrument.sector, instrument.industry, instrument.marketCapBucket].filter(Boolean).join(" / ")}>
        <WatchlistButton watchlistId={watchlist?.id} symbol={instrument.symbol} initiallyInWatchlist={Boolean(watchlistItem)} />
      </PageHeader>

      <Card>
        <CardHeader>
          <CardTitle>OHLC Chart</CardTitle>
          <CardDescription>Educational charting only. Do not treat as direct market advice.</CardDescription>
        </CardHeader>
        <OhlcChart candles={candles.map((c) => ({
          time: c.ts.toISOString(),
          open: Number(c.open),
          high: Number(c.high),
          low: Number(c.low),
          close: Number(c.close),
        }))} />
      </Card>

      <IndicatorChart data={rsiData} label="RSI Pane" overbought={70} oversold={30} />

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Current Strategy Matches</CardTitle>
          </CardHeader>
          <div className="space-y-2 text-sm">
            {strategyMatches.map((match) => (
              <Link key={match.id} href={`/strategies/${match.strategy.key}`} className="flex items-center justify-between rounded border border-slate-100 p-2 hover:border-brand-200 dark:border-slate-700">
                <span>{match.strategy.name}</span>
                <Badge variant={match.strategy.family === "investment" ? "investment" : "swing"}>{match.strategy.family}</Badge>
              </Link>
            ))}
            {strategyMatches.length === 0 ? <p className="text-slate-500">No matches.</p> : null}
          </div>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Technical Indicator Snapshot</CardTitle>
          </CardHeader>
          {latestIndicator ? (
            <div className="grid grid-cols-2 gap-2 text-sm">
              <p>RSI14: {latestIndicator.rsi14 ? Number(latestIndicator.rsi14).toFixed(2) : "—"}</p>
              <p>SMA50: {latestIndicator.sma50 ? Number(latestIndicator.sma50).toFixed(2) : "—"}</p>
              <p>SMA200: {latestIndicator.sma200 ? Number(latestIndicator.sma200).toFixed(2) : "—"}</p>
              <p>ST Dir: {latestIndicator.superTrendDir ?? "—"}</p>
              <p>BB U: {latestIndicator.bbUpper ? Number(latestIndicator.bbUpper).toFixed(2) : "—"}</p>
              <p>BB L: {latestIndicator.bbLower ? Number(latestIndicator.bbLower).toFixed(2) : "—"}</p>
            </div>
          ) : <p className="text-sm text-slate-500">No indicator snapshot.</p>}
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Recent Digest Mentions</CardTitle>
          </CardHeader>
          <div className="space-y-2 text-sm">
            {digestMentions.map((mention) => (
              <div key={mention.id} className="rounded border border-slate-100 p-2 dark:border-slate-700">
                <p>{mention.digest.marketDate.toISOString().split("T")[0]} • {mention.mentionType}</p>
                <Link href={`/digest/${mention.digest.marketDate.toISOString().split("T")[0]}`} className="text-xs text-brand-600 hover:underline">
                  Open digest
                </Link>
              </div>
            ))}
            {digestMentions.length === 0 ? <p className="text-slate-500">No digest mentions.</p> : null}
          </div>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Related Screener Memberships</CardTitle>
          </CardHeader>
          <div className="space-y-2 text-sm">
            {screenerMatches.map((match) => (
              <div key={match.id} className="rounded border border-slate-100 p-2 dark:border-slate-700">
                <p>{match.screenerRun.screener.name}</p>
                <p className="text-xs text-slate-500">{match.marketDate.toISOString().split("T")[0]}</p>
              </div>
            ))}
            {screenerMatches.length === 0 ? <p className="text-slate-500">No screener memberships.</p> : null}
          </div>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Notes</CardTitle>
            <CardDescription>Personal journal notes for this symbol.</CardDescription>
          </CardHeader>
          <NoteForm instrumentId={instrument.id} />
          <div className="mt-3 space-y-2">
            {notes.map((note) => (
              <div key={note.id} className="rounded border border-slate-100 p-2 text-sm dark:border-slate-700">
                <p className="font-medium">{note.title}</p>
                <p className="text-xs text-slate-500">{note.createdAt.toISOString().split("T")[0]}</p>
                <p className="mt-1 whitespace-pre-wrap">{note.bodyMarkdown}</p>
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Learning Links</CardTitle>
          </CardHeader>
          <div className="space-y-2 text-sm">
            {learningDocs.map((doc) => (
              <Link key={doc.id} href={`/learning/${doc.key}`} className="block rounded border border-slate-100 p-2 hover:border-brand-200 dark:border-slate-700">
                {doc.title}
              </Link>
            ))}
            {learningDocs.length === 0 ? <p className="text-slate-500">No linked learning notes found.</p> : null}
          </div>
        </Card>
      </div>
    </div>
  );
}
