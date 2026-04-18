import { prisma } from "@ibo/db";
import { OhlcChart } from "../../components/charts/ohlc-chart";
import { buildIndicatorSet, evaluateStrategy, type DataContext } from "@ibo/strategy-engine";
import type { Candle, StrategyDSL } from "@ibo/types";

export const revalidate = 30; // Cache for 30s — data changes only on pipeline/admin runs

export default async function BacktestReplayPage({
  searchParams,
}: {
  searchParams: Promise<{ backtestId?: string; symbol?: string }>;
}) {
  const { backtestId, symbol } = await searchParams;
  const backtests = await prisma.backtest.findMany({
    include: {
      strategyVersion: {
        include: {
          strategy: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  const selectedBacktest = backtests.find((item) => item.id === backtestId) ?? backtests[0];

  const trades = selectedBacktest
    ? await prisma.backtestTrade.findMany({
      where: {
        backtestId: selectedBacktest.id,
        instrument: symbol ? { symbol } : undefined,
      },
      include: { instrument: true },
      orderBy: { entryDate: "asc" },
      take: 200,
    })
    : [];

  const symbols = Array.from(new Set(trades.map((trade) => trade.instrument?.symbol).filter(Boolean))) as string[];
  const selectedSymbol = symbol ?? symbols[0];
  const instrument = selectedSymbol
    ? await prisma.instrument.findFirst({ where: { symbol: selectedSymbol } })
    : null;

  const candles = instrument
    ? await prisma.candle.findMany({
      where: { instrumentId: instrument.id, timeframe: "D1" },
      orderBy: { ts: "asc" },
      take: 260,
    })
    : [];

  const selectedTrades = trades.filter((trade) => trade.instrument?.symbol === selectedSymbol);
  const dsl = selectedBacktest?.strategyVersion?.normalizedDsl as unknown as StrategyDSL | undefined;
  const normalizedCandles: Candle[] = candles.map((candle) => ({
    ts: candle.ts,
    open: Number(candle.open),
    high: Number(candle.high),
    low: Number(candle.low),
    close: Number(candle.close),
    volume: Number(candle.volume ?? 0),
    deliveryPct: candle.deliveryPct ? Number(candle.deliveryPct) : undefined,
  }));

  const signalTimeline: Array<{
    id: string;
    event: "entry" | "exit";
    date: string;
    price: number | null;
    pnlPct?: number;
    rules: Array<{ key: string; passed: boolean; reason: string }>;
  }> = [];

  if (dsl && normalizedCandles.length >= 30) {
    for (const trade of selectedTrades) {
      const checkpoints = [
        { event: "entry" as const, date: trade.entryDate, price: trade.entryPrice ? Number(trade.entryPrice) : null },
        { event: "exit" as const, date: trade.exitDate, price: trade.exitPrice ? Number(trade.exitPrice) : null },
      ];

      for (const checkpoint of checkpoints) {
        if (!checkpoint.date) continue;
        const series = normalizedCandles.filter((item) => item.ts.getTime() <= checkpoint.date!.getTime());
        if (series.length < 30) continue;
        const last = series[series.length - 1];
        const indicators = buildIndicatorSet(series);
        const ctx: DataContext = {
          "daily.open": last.open,
          "daily.high": last.high,
          "daily.low": last.low,
          "daily.close": last.close,
          "daily.volume": last.volume,
          "daily.rsi14": indicators.rsi14,
          "daily.sma_13": indicators.sma13,
          "daily.sma_34": indicators.sma34,
          "daily.sma_44": indicators.sma44,
          "daily.sma_50": indicators.sma50,
          "daily.sma_200": indicators.sma200,
          "daily.ema_9": indicators.ema9,
          "daily.ema_15": indicators.ema15,
          "daily.bb_upper_20_2": indicators.bbUpper,
          "daily.bb_middle_20": indicators.bbMiddle,
          "daily.bb_lower_20_2": indicators.bbLower,
          "daily.supertrend_10_3": indicators.superTrendDir,
          "daily.atr_14": indicators.atr14,
          "daily.volume_ratio_20": indicators.relativeVolume,
        };
        const result = evaluateStrategy(
          dsl,
          selectedSymbol ?? "N/A",
          checkpoint.date.toISOString().split("T")[0],
          ctx,
        );
        signalTimeline.push({
          id: `${trade.id}-${checkpoint.event}`,
          event: checkpoint.event,
          date: checkpoint.date.toISOString().split("T")[0],
          price: checkpoint.price,
          pnlPct: trade.pnlPct ? Number(trade.pnlPct) : undefined,
          rules: result.conditions.map((condition) => ({
            key: condition.field,
            passed: condition.passed,
            reason: condition.reason,
          })),
        });
      }
    }
  }

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold">Backtest Event Replay</h1>
      <p className="text-sm text-slate-500">Signal timeline for educational replay, not execution advice.</p>
      <form className="grid gap-3 md:grid-cols-3">
        <select name="backtestId" defaultValue={selectedBacktest?.id} className="rounded-lg border border-slate-300 px-3 py-2 text-sm">
          {backtests.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
        </select>
        <select name="symbol" defaultValue={selectedSymbol} className="rounded-lg border border-slate-300 px-3 py-2 text-sm">
          {symbols.map((item) => <option key={item} value={item}>{item}</option>)}
        </select>
        <button className="rounded-lg bg-brand-600 px-3 py-2 text-sm font-medium text-white">Load Replay</button>
      </form>

      {candles.length ? (
        <div className="rounded-xl border border-slate-200 bg-white p-3 dark:border-slate-700 dark:bg-slate-800">
          <OhlcChart candles={candles.map((candle) => ({
            time: candle.ts.toISOString(),
            open: Number(candle.open),
            high: Number(candle.high),
            low: Number(candle.low),
            close: Number(candle.close),
          }))} />
        </div>
      ) : null}

      <div className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-800">
        <h2 className="mb-2 font-semibold">Signal Timeline</h2>
        <div className="space-y-2 text-sm">
          {signalTimeline
            .sort((a, b) => a.date.localeCompare(b.date))
            .map((signal) => (
              <div key={signal.id} className="rounded border border-slate-200 p-2 dark:border-slate-700">
                <p className="font-medium">
                  {signal.event.toUpperCase()} • {signal.date} • {signal.price !== null ? signal.price.toFixed(2) : "—"}
                  {signal.pnlPct !== undefined ? ` • PnL ${signal.pnlPct.toFixed(2)}%` : ""}
                </p>
                <div className="mt-2 grid gap-1">
                  {signal.rules.map((rule) => (
                    <div key={rule.key} className="flex items-center justify-between rounded bg-slate-50 px-2 py-1 text-xs dark:bg-slate-900">
                      <span>{rule.key}</span>
                      <span className={rule.passed ? "text-emerald-600" : "text-rose-600"}>
                        {rule.passed ? "PASS" : "FAIL"}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          {signalTimeline.length === 0 ? <p className="text-slate-500">No replay signals available.</p> : null}
        </div>
      </div>
    </div>
  );
}
