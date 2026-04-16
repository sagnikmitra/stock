import { prisma } from "@ibo/db";
import { notFound } from "next/navigation";
import { Card, CardHeader, CardTitle, CardDescription } from "../../components/ui/card";
import { Badge } from "../../components/ui/badge";
import { PageHeader } from "../../components/ui/page-header";
import Link from "next/link";

export const dynamic = "force-dynamic";

interface Props {
  params: Promise<{ symbol: string }>;
}

export default async function StockDetailPage({ params }: Props) {
  const { symbol } = await params;
  const decodedSymbol = decodeURIComponent(symbol).toUpperCase();

  const instrument = await prisma.instrument.findFirst({
    where: { symbol: decodedSymbol },
    include: { exchange: true },
  });

  if (!instrument) notFound();

  const [latestQuote, latestIndicator, recentCandles, strategyMatches, screenerMatches] =
    await Promise.all([
      prisma.quoteSnapshot.findFirst({
        where: { instrumentId: instrument.id },
        orderBy: { ts: "desc" },
      }),
      prisma.indicatorSnapshot.findFirst({
        where: { instrumentId: instrument.id, timeframe: "D1" },
        orderBy: { ts: "desc" },
      }),
      prisma.candle.findMany({
        where: { instrumentId: instrument.id, timeframe: "D1" },
        orderBy: { ts: "desc" },
        take: 10,
      }),
      prisma.strategyResult.findMany({
        where: { instrumentId: instrument.id, matched: true },
        orderBy: { marketDate: "desc" },
        take: 10,
        include: { strategy: true },
      }),
      prisma.screenerResult.findMany({
        where: { instrumentId: instrument.id, matched: true },
        orderBy: { marketDate: "desc" },
        take: 10,
        include: { screenerRun: { include: { screener: true } } },
      }),
    ]);

  const changePct = latestQuote?.changePct ? Number(latestQuote.changePct) : null;
  const isPositive = changePct !== null && changePct >= 0;

  return (
    <>
      <PageHeader
        title={`${instrument.symbol} — ${instrument.companyName}`}
        description={[instrument.sector, instrument.industry, instrument.marketCapBucket]
          .filter(Boolean)
          .join(" / ")}
      >
        <a
          href={`https://www.tradingview.com/chart/?symbol=NSE:${instrument.symbol}`}
          target="_blank"
          rel="noopener noreferrer"
          className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700"
        >
          TradingView Chart
        </a>
      </PageHeader>

      {/* Quote + Indicators row */}
      <div className="mb-6 grid gap-4 md:grid-cols-2">
        {/* Latest Quote */}
        <Card>
          <CardHeader>
            <CardTitle>Latest Quote</CardTitle>
          </CardHeader>
          {latestQuote ? (
            <div className="grid grid-cols-3 gap-4 text-sm">
              <div>
                <p className="text-slate-400">LTP</p>
                <p className="text-lg font-semibold text-slate-900">
                  {Number(latestQuote.ltp).toFixed(2)}
                </p>
              </div>
              <div>
                <p className="text-slate-400">Change %</p>
                <p
                  className={`text-lg font-semibold ${isPositive ? "text-green-600" : "text-red-600"}`}
                >
                  {changePct !== null ? `${isPositive ? "+" : ""}${changePct.toFixed(2)}%` : "—"}
                </p>
              </div>
              <div>
                <p className="text-slate-400">Volume</p>
                <p className="text-lg font-semibold text-slate-900">
                  {latestQuote.volume !== null
                    ? Number(latestQuote.volume).toLocaleString()
                    : "—"}
                </p>
              </div>
            </div>
          ) : (
            <p className="text-sm text-slate-400">No quote data available.</p>
          )}
        </Card>

        {/* Indicator Snapshot */}
        <Card>
          <CardHeader>
            <CardTitle>Indicator Snapshot</CardTitle>
            <CardDescription>Daily timeframe</CardDescription>
          </CardHeader>
          {latestIndicator ? (
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-500">RSI (14)</span>
                <span className="font-semibold">
                  {latestIndicator.rsi14 !== null ? Number(latestIndicator.rsi14).toFixed(2) : "—"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">SMA 200</span>
                <span className="font-semibold">
                  {latestIndicator.sma200 !== null
                    ? Number(latestIndicator.sma200).toFixed(2)
                    : "—"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">BB Position</span>
                <span className="font-semibold">
                  {latestIndicator.bbUpper !== null && latestIndicator.bbLower !== null
                    ? `${Number(latestIndicator.bbLower).toFixed(0)} — ${Number(latestIndicator.bbUpper).toFixed(0)}`
                    : "—"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">SuperTrend</span>
                <Badge
                  variant={
                    latestIndicator.superTrendDir === "up"
                      ? "favorable"
                      : latestIndicator.superTrendDir === "down"
                        ? "hostile"
                        : "muted"
                  }
                >
                  {latestIndicator.superTrendDir ?? "—"}
                </Badge>
              </div>
            </div>
          ) : (
            <p className="text-sm text-slate-400">No indicator data available.</p>
          )}
        </Card>
      </div>

      {/* Recent Candles */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Recent Candles (D1)</CardTitle>
          <CardDescription>Last 10 trading days</CardDescription>
        </CardHeader>
        {recentCandles.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 text-left text-xs font-semibold uppercase text-slate-400">
                  <th className="px-3 py-2">Date</th>
                  <th className="px-3 py-2 text-right">Open</th>
                  <th className="px-3 py-2 text-right">High</th>
                  <th className="px-3 py-2 text-right">Low</th>
                  <th className="px-3 py-2 text-right">Close</th>
                  <th className="px-3 py-2 text-right">Volume</th>
                </tr>
              </thead>
              <tbody>
                {recentCandles.map((c) => (
                  <tr key={c.id} className="border-b border-slate-50 hover:bg-slate-50">
                    <td className="px-3 py-2 text-slate-600">
                      {c.ts.toISOString().split("T")[0]}
                    </td>
                    <td className="px-3 py-2 text-right font-mono">
                      {Number(c.open).toFixed(2)}
                    </td>
                    <td className="px-3 py-2 text-right font-mono">
                      {Number(c.high).toFixed(2)}
                    </td>
                    <td className="px-3 py-2 text-right font-mono">
                      {Number(c.low).toFixed(2)}
                    </td>
                    <td className="px-3 py-2 text-right font-mono">
                      {Number(c.close).toFixed(2)}
                    </td>
                    <td className="px-3 py-2 text-right font-mono">
                      {c.volume !== null ? Number(c.volume).toLocaleString() : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-sm text-slate-400">No candle data available.</p>
        )}
      </Card>

      {/* Strategy Matches */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Strategy Matches</CardTitle>
          <CardDescription>Strategies this stock currently matches</CardDescription>
        </CardHeader>
        {strategyMatches.length > 0 ? (
          <div className="space-y-2">
            {strategyMatches.map((sr) => (
              <Link
                key={sr.id}
                href={`/strategies/${sr.strategy.key}`}
                className="flex items-center justify-between rounded-lg px-3 py-2 text-sm hover:bg-slate-50"
              >
                <span className="font-medium text-slate-700">{sr.strategy.name}</span>
                <div className="flex items-center gap-2">
                  <Badge variant={sr.strategy.family === "investment" ? "investment" : "swing"}>
                    {sr.strategy.family}
                  </Badge>
                  <span className="text-xs text-slate-400">
                    {sr.marketDate.toISOString().split("T")[0]}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <p className="text-sm text-slate-400">No strategy matches found.</p>
        )}
      </Card>

      {/* Related Screeners */}
      <Card>
        <CardHeader>
          <CardTitle>Related Screeners</CardTitle>
          <CardDescription>Screeners that include this stock</CardDescription>
        </CardHeader>
        {screenerMatches.length > 0 ? (
          <div className="space-y-2">
            {screenerMatches.map((sr) => (
              <div
                key={sr.id}
                className="flex items-center justify-between rounded-lg px-3 py-2 text-sm"
              >
                <span className="font-medium text-slate-700">
                  {sr.screenerRun.screener.name}
                </span>
                <span className="text-xs text-slate-400">
                  {sr.marketDate.toISOString().split("T")[0]}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-slate-400">No screener matches found.</p>
        )}
      </Card>
    </>
  );
}
