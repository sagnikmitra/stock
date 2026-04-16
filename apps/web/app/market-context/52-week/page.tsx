import { prisma } from "@ibo/db";
import { distanceFrom52WeekHigh, is52WeekHigh, is52WeekLow } from "@ibo/strategy-engine";
import type { Candle } from "@ibo/types";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function FiftyTwoWeekPage() {
  const instruments = await prisma.instrument.findMany({
    where: { isActive: true },
    select: { id: true, symbol: true, companyName: true },
    take: 300,
  });

  const highs: Array<{ symbol: string; companyName: string; distance: number }> = [];
  const lows: Array<{ symbol: string; companyName: string }> = [];

  for (const instrument of instruments) {
    const rows = await prisma.candle.findMany({
      where: { instrumentId: instrument.id, timeframe: "D1" },
      orderBy: { ts: "asc" },
      take: 260,
    });
    if (rows.length < 100) continue;
    const candles: Candle[] = rows.map((row) => ({
      ts: row.ts,
      open: Number(row.open),
      high: Number(row.high),
      low: Number(row.low),
      close: Number(row.close),
      volume: Number(row.volume ?? 0),
      deliveryPct: row.deliveryPct ? Number(row.deliveryPct) : undefined,
    }));

    if (is52WeekHigh(candles)) highs.push({ symbol: instrument.symbol, companyName: instrument.companyName, distance: distanceFrom52WeekHigh(candles) });
    if (is52WeekLow(candles)) lows.push({ symbol: instrument.symbol, companyName: instrument.companyName });
  }

  highs.sort((a, b) => a.distance - b.distance);

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold">52-Week High/Low Monitor</h1>
      <p className="text-sm text-slate-500">Derived from stored D1 candle series. Educational insights only.</p>
      <div className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-800">
          <h2 className="mb-2 font-semibold">At/Near 52-Week High</h2>
          {highs.length ? highs.slice(0, 50).map((item) => (
            <Link key={item.symbol} href={`/stocks/${item.symbol}`} className="flex items-center justify-between py-1 text-sm hover:text-brand-600">
              <span>{item.symbol}</span>
              <span className="text-xs text-slate-500">{item.distance.toFixed(2)}% below peak</span>
            </Link>
          )) : <p className="text-sm text-slate-500">No candidates yet.</p>}
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-800">
          <h2 className="mb-2 font-semibold">At 52-Week Low</h2>
          {lows.length ? lows.slice(0, 50).map((item) => (
            <Link key={item.symbol} href={`/stocks/${item.symbol}`} className="block py-1 text-sm hover:text-brand-600">
              {item.symbol}
            </Link>
          )) : <p className="text-sm text-slate-500">No candidates yet.</p>}
        </div>
      </div>
    </div>
  );
}

