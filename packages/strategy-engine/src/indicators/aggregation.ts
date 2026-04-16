import type { Candle, ExchangeCalendar } from "@ibo/types";

/**
 * Aggregate daily candles into weekly candles.
 * Groups by ISO week (Monday-Sunday).
 */
export function aggregateToWeekly(dailyCandles: Candle[]): Candle[] {
  if (dailyCandles.length === 0) return [];
  const sorted = [...dailyCandles].sort((a, b) => a.ts.getTime() - b.ts.getTime());

  const weeks = new Map<string, Candle[]>();
  for (const c of sorted) {
    const d = new Date(c.ts);
    // ISO week key: find Monday of this week
    const day = d.getUTCDay();
    const monday = new Date(d);
    monday.setUTCDate(d.getUTCDate() - ((day + 6) % 7));
    const key = monday.toISOString().split("T")[0];
    if (!weeks.has(key)) weeks.set(key, []);
    weeks.get(key)!.push(c);
  }

  return Array.from(weeks.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, candles]) => ({
      ts: new Date(key),
      open: candles[0].open,
      high: Math.max(...candles.map((c) => c.high)),
      low: Math.min(...candles.map((c) => c.low)),
      close: candles[candles.length - 1].close,
      volume: candles.reduce((s, c) => s + c.volume, 0),
      deliveryPct: avgDelivery(candles),
    }));
}

/**
 * Aggregate daily candles into monthly candles.
 * Groups by YYYY-MM.
 */
export function aggregateToMonthly(dailyCandles: Candle[]): Candle[] {
  if (dailyCandles.length === 0) return [];
  const sorted = [...dailyCandles].sort((a, b) => a.ts.getTime() - b.ts.getTime());

  const months = new Map<string, Candle[]>();
  for (const c of sorted) {
    const d = new Date(c.ts);
    const key = `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}`;
    if (!months.has(key)) months.set(key, []);
    months.get(key)!.push(c);
  }

  return Array.from(months.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, candles]) => ({
      ts: new Date(key + "-01"),
      open: candles[0].open,
      high: Math.max(...candles.map((c) => c.high)),
      low: Math.min(...candles.map((c) => c.low)),
      close: candles[candles.length - 1].close,
      volume: candles.reduce((s, c) => s + c.volume, 0),
      deliveryPct: avgDelivery(candles),
    }));
}

/** Check if the latest candle is at or above the 52-week high */
export function is52WeekHigh(candles: Candle[]): boolean {
  if (candles.length < 2) return false;
  const lookback = candles.slice(-252); // ~252 trading days in a year
  const maxHigh = Math.max(...lookback.slice(0, -1).map((c) => c.high));
  return lookback[lookback.length - 1].high >= maxHigh;
}

/** Check if the latest candle is at or below the 52-week low */
export function is52WeekLow(candles: Candle[]): boolean {
  if (candles.length < 2) return false;
  const lookback = candles.slice(-252);
  const minLow = Math.min(...lookback.slice(0, -1).map((c) => c.low));
  return lookback[lookback.length - 1].low <= minLow;
}

/** Percentage distance below 52-week high (0 = at high, positive = below) */
export function distanceFrom52WeekHigh(candles: Candle[]): number {
  if (candles.length === 0) return 0;
  const lookback = candles.slice(-252);
  const maxHigh = Math.max(...lookback.map((c) => c.high));
  const currentClose = lookback[lookback.length - 1].close;
  if (maxHigh === 0) return 0;
  return ((maxHigh - currentClose) / maxHigh) * 100;
}

/** Check if a date is a finalized month-end candle using the exchange calendar */
export function isMonthEndCandleFinalized(
  date: Date,
  nseCalendar: ExchangeCalendar,
): boolean {
  return nseCalendar.isMonthEnd(date);
}

function avgDelivery(candles: Candle[]): number | undefined {
  const withDelivery = candles.filter((c) => c.deliveryPct != null);
  if (withDelivery.length === 0) return undefined;
  return withDelivery.reduce((s, c) => s + c.deliveryPct!, 0) / withDelivery.length;
}
