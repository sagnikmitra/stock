import { BaseAdapter } from "./base";
import type {
  SymbolMaster,
  QuoteSnapshot,
  CandleSeries,
  CandleRequest,
  IndexRequest,
  FiiDiiFlow,
  MarketBreadth,
  AdapterHealth,
  Candle,
} from "@ibo/types";
import { ProviderType, Timeframe } from "@ibo/types";
import YahooFinance from "yahoo-finance2";

const yahooFinance = new YahooFinance();

function tfToYahooInterval(tf: string): "1d" | "1wk" | "1mo" | "1h" | "5m" | "15m" | "30m" | "60m" | "90m" {
  switch (tf) {
    case "D1": return "1d";
    case "W1": return "1wk";
    case "MN1": return "1mo";
    case "H1": return "60m";
    case "H4": return "60m";
    case "M5": return "5m";
    case "M15": return "15m";
    case "M30": return "30m";
    default: return "1d";
  }
}

function nseSuffix(sym: string): string {
  return sym.includes(".") ? sym : `${sym}.NS`;
}

export class YahooFinanceAdapter extends BaseAdapter {
  readonly name = "Yahoo Finance";
  readonly providerType = ProviderType.MARKET_DATA_VENDOR;
  readonly supports = {
    eodCandles: true,
    intradayCandles: false,
    quotes: true,
    indices: true,
    fundamentals: false,
    fiiDii: false,
    mutualFunds: false,
    marketBreadth: false,
  };

  constructor() {
    super();
    this.setRateLimit(30, 60_000);
    // Silence yahoo-finance2 noisy deprecation and survey notices.
    try {
      (yahooFinance as unknown as { suppressNotices?: (keys: string[]) => void }).suppressNotices?.([
        "yahooSurvey",
        "ripHistorical",
      ]);
    } catch {
      // optional
    }
  }

  async getSymbols(): Promise<SymbolMaster[]> {
    return [];
  }

  async getQuotes(symbols: string[]): Promise<QuoteSnapshot[]> {
    const out: QuoteSnapshot[] = [];
    const batches = chunk(symbols.map(nseSuffix), 20);
    for (const batch of batches) {
      await this.waitForRateLimit();
      try {
        const res = await yahooFinance.quote(batch);
        const arr = Array.isArray(res) ? res : [res];
        for (const q of arr) {
          const anyQ = q as unknown as Record<string, unknown>;
          const rawSym = String(anyQ.symbol ?? "");
          const bareSym = rawSym.replace(/\.NS$|\.BO$/i, "");
          const px = Number(anyQ.regularMarketPrice ?? anyQ.postMarketPrice ?? anyQ.preMarketPrice);
          if (!Number.isFinite(px) || !bareSym) continue;
          out.push({
            symbol: bareSym,
            ltp: px,
            dayOpen: numeric(anyQ.regularMarketOpen),
            dayHigh: numeric(anyQ.regularMarketDayHigh),
            dayLow: numeric(anyQ.regularMarketDayLow),
            prevClose: numeric(anyQ.regularMarketPreviousClose),
            volume: numeric(anyQ.regularMarketVolume),
            asOf: new Date().toISOString(),
          });
        }
      } catch {
        // batch failure: continue to next batch
      }
    }
    return out;
  }

  async getHistoricalCandles(input: CandleRequest): Promise<CandleSeries> {
    await this.waitForRateLimit();
    const interval = tfToYahooInterval(input.timeframe);
    const sym = nseSuffix(input.symbol);
    const result = await yahooFinance.chart(sym, {
      period1: input.from,
      period2: input.to,
      interval,
    });
    const quotes = (result?.quotes ?? []) as Array<{
      date: Date;
      open: number | null;
      high: number | null;
      low: number | null;
      close: number | null;
      volume: number | null;
    }>;
    const candles: Candle[] = [];
    for (const q of quotes) {
      if (q.close == null || q.open == null || q.high == null || q.low == null) continue;
      candles.push({
        ts: q.date,
        open: Number(q.open),
        high: Number(q.high),
        low: Number(q.low),
        close: Number(q.close),
        volume: Number(q.volume ?? 0),
      });
    }
    return { symbol: input.symbol, timeframe: input.timeframe, candles };
  }

  async getIndexSeries(input: IndexRequest): Promise<CandleSeries> {
    return this.getHistoricalCandles({
      symbol: input.symbol,
      timeframe: input.timeframe ?? Timeframe.D1,
      from: input.from,
      to: input.to,
    });
  }

  async getFiiDiiFlows(_date: string): Promise<FiiDiiFlow[]> {
    return [];
  }

  async getMarketBreadth(_date: string): Promise<MarketBreadth | null> {
    return null;
  }

  async healthcheck(): Promise<AdapterHealth> {
    const start = Date.now();
    try {
      const q = await yahooFinance.quote("RELIANCE.NS");
      return {
        provider: this.name,
        healthy: !!q,
        latencyMs: Date.now() - start,
        lastSuccessAt: new Date().toISOString(),
      };
    } catch (e) {
      return {
        provider: this.name,
        healthy: false,
        latencyMs: Date.now() - start,
        lastFailureAt: new Date().toISOString(),
        message: e instanceof Error ? e.message : String(e),
      };
    }
  }
}

function chunk<T>(arr: T[], size: number): T[][] {
  const out: T[][] = [];
  for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size));
  return out;
}

function numeric(v: unknown): number | undefined {
  const n = Number(v);
  return Number.isFinite(n) ? n : undefined;
}
