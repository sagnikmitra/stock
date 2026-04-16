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
} from "@ibo/types";
import { ProviderType, Timeframe } from "@ibo/types";

/* -------------------------------------------------------------------------- */
/*  Helpers                                                                    */
/* -------------------------------------------------------------------------- */

/** Convert a Timeframe enum value to a Twelve Data interval string. */
function toTdInterval(tf: string): string {
  const map: Record<string, string> = {
    M1: "1min",
    M5: "5min",
    M15: "15min",
    M30: "30min",
    H1: "1h",
    H4: "4h",
    D1: "1day",
    W1: "1week",
    MN1: "1month",
  };
  return map[tf] ?? "1day";
}

/** Format a date string or Date object as YYYY-MM-DD. */
function yyyymmdd(d: Date | string): string {
  const dt = typeof d === "string" ? new Date(d) : d;
  return dt.toISOString().slice(0, 10);
}

/* -------------------------------------------------------------------------- */
/*  Twelve Data Adapter                                                       */
/* -------------------------------------------------------------------------- */

/**
 * Twelve Data market data adapter.
 *
 * Free tier: 800 API credits/day, 8 requests/minute.
 * Good for historical OHLCV data and as a fallback when NSE is blocked.
 *
 * All NSE symbols are suffixed with `.NSE` per Twelve Data conventions.
 * API key is read from `process.env.TWELVEDATA_API_KEY`.
 */
export class TwelveDataAdapter extends BaseAdapter {
  readonly name = "Twelve Data";
  readonly providerType = ProviderType.MARKET_DATA_VENDOR;
  readonly supports = {
    eodCandles: true,
    intradayCandles: true,
    quotes: true,
    indices: true,
    fundamentals: false,
    fiiDii: false,
    mutualFunds: false,
    marketBreadth: false,
  };

  private baseUrl = "https://api.twelvedata.com";
  private apiKey = process.env.TWELVEDATA_API_KEY ?? "";

  constructor() {
    super();
    // Free tier: 8 requests per minute
    this.setRateLimit(8, 60_000);
  }

  /* ---- Internal fetch helper --------------------------------------------- */

  /**
   * Authenticated GET against the Twelve Data API.
   * Appends the API key and handles common error shapes.
   */
  private async tdFetch<T>(path: string, params: Record<string, string> = {}): Promise<T> {
    if (!this.apiKey) {
      throw new Error("TWELVEDATA_API_KEY is not set");
    }

    await this.waitForRateLimit();

    const url = new URL(path, this.baseUrl);
    url.searchParams.set("apikey", this.apiKey);
    for (const [k, v] of Object.entries(params)) {
      url.searchParams.set(k, v);
    }

    const res = await fetch(url.toString(), {
      method: "GET",
      headers: { Accept: "application/json" },
    });

    if (res.status === 429) {
      // Rate limited — wait and retry once.
      const retryAfter = parseInt(res.headers.get("Retry-After") ?? "10", 10);
      console.warn(`[TwelveData] Rate limited, waiting ${retryAfter}s...`);
      await new Promise((r) => setTimeout(r, retryAfter * 1000));
      return this.tdFetch<T>(path, params);
    }

    if (!res.ok) {
      const body = await res.text().catch(() => "");
      throw new Error(`TwelveData API error ${res.status}: ${body.slice(0, 200)}`);
    }

    const json = (await res.json()) as T & { status?: string; message?: string; code?: number };

    // Twelve Data returns HTTP 200 with error payloads in the body.
    if (json.status === "error") {
      throw new Error(`TwelveData API error: ${json.message ?? "unknown"} (code=${json.code})`);
    }

    return json;
  }

  /* ---- MarketDataAdapter implementation ---------------------------------- */

  /**
   * Fetch all NSE-listed common stocks from Twelve Data.
   */
  async getSymbols(): Promise<SymbolMaster[]> {
    try {
      interface TdStock {
        symbol?: string;
        name?: string;
        currency?: string;
        exchange?: string;
        mic_code?: string;
        country?: string;
        type?: string;
      }

      const data = await this.tdFetch<{ data?: TdStock[]; count?: number }>(
        "/stocks",
        { exchange: "NSE", type: "Common Stock" }
      );

      if (!data?.data || !Array.isArray(data.data)) {
        console.warn("[TwelveData] getSymbols: unexpected response");
        return [];
      }

      return data.data
        .filter((s) => s.symbol)
        .map((s) => ({
          symbol: s.symbol!,
          companyName: s.name ?? s.symbol!,
          exchange: s.exchange ?? "NSE",
        }));
    } catch (err) {
      console.error("[TwelveData] getSymbols failed:", err instanceof Error ? err.message : err);
      return [];
    }
  }

  /**
   * Fetch real-time quotes for the given symbols.
   * Twelve Data's `/quote` endpoint accepts a single symbol per call.
   */
  async getQuotes(symbols: string[]): Promise<QuoteSnapshot[]> {
    const results: QuoteSnapshot[] = [];

    for (const sym of symbols) {
      try {
        interface TdQuote {
          symbol?: string;
          name?: string;
          close?: string;
          open?: string;
          high?: string;
          low?: string;
          previous_close?: string;
          change?: string;
          percent_change?: string;
          volume?: string;
          datetime?: string;
          timestamp?: number;
        }

        const quote = await this.tdFetch<TdQuote>("/quote", {
          symbol: `${sym}.NSE`,
        });

        if (!quote?.close) {
          console.warn(`[TwelveData] No quote for ${sym}`);
          continue;
        }

        results.push({
          symbol: sym,
          ltp: parseFloat(quote.close),
          open: quote.open ? parseFloat(quote.open) : undefined,
          high: quote.high ? parseFloat(quote.high) : undefined,
          low: quote.low ? parseFloat(quote.low) : undefined,
          close: quote.previous_close ? parseFloat(quote.previous_close) : undefined,
          changePct: quote.percent_change ? parseFloat(quote.percent_change) : undefined,
          volume: quote.volume ? parseInt(quote.volume, 10) : undefined,
          ts: quote.timestamp
            ? new Date(quote.timestamp * 1000)
            : quote.datetime
              ? new Date(quote.datetime)
              : new Date(),
        });
      } catch (err) {
        console.warn(
          `[TwelveData] getQuotes failed for ${sym}:`,
          err instanceof Error ? err.message : err
        );
      }
    }

    return results;
  }

  /**
   * Fetch historical OHLCV candles for a single symbol.
   */
  async getHistoricalCandles(input: CandleRequest): Promise<CandleSeries> {
    const empty: CandleSeries = {
      symbol: input.symbol,
      timeframe: input.timeframe ?? Timeframe.D1,
      candles: [],
    };

    try {
      interface TdCandle {
        datetime?: string;
        open?: string;
        high?: string;
        low?: string;
        close?: string;
        volume?: string;
      }

      const data = await this.tdFetch<{
        values?: TdCandle[];
        meta?: { symbol?: string };
      }>("/time_series", {
        symbol: `${input.symbol}.NSE`,
        interval: toTdInterval(input.timeframe),
        start_date: yyyymmdd(input.from),
        end_date: yyyymmdd(input.to),
        order: "ASC",
      });

      if (!data?.values || !Array.isArray(data.values)) {
        console.warn(`[TwelveData] No candle data for ${input.symbol}`);
        return empty;
      }

      empty.candles = data.values
        .filter((v) => v.datetime)
        .map((v) => ({
          ts: new Date(v.datetime!),
          open: parseFloat(v.open ?? "0"),
          high: parseFloat(v.high ?? "0"),
          low: parseFloat(v.low ?? "0"),
          close: parseFloat(v.close ?? "0"),
          volume: parseInt(v.volume ?? "0", 10),
        }));

      return empty;
    } catch (err) {
      console.error(
        `[TwelveData] getHistoricalCandles failed for ${input.symbol}:`,
        err instanceof Error ? err.message : err
      );
      return empty;
    }
  }

  /**
   * Fetch index time series (e.g., NIFTY 50, NIFTY BANK) as daily candles.
   */
  async getIndexSeries(input: IndexRequest): Promise<CandleSeries> {
    const empty: CandleSeries = {
      symbol: input.symbol,
      timeframe: Timeframe.D1,
      candles: [],
    };

    try {
      interface TdCandle {
        datetime?: string;
        open?: string;
        high?: string;
        low?: string;
        close?: string;
        volume?: string;
      }

      // Twelve Data uses the index name directly (e.g., "NIFTY 50").
      const data = await this.tdFetch<{
        values?: TdCandle[];
        meta?: { symbol?: string };
      }>("/time_series", {
        symbol: input.symbol,
        interval: "1day",
        start_date: yyyymmdd(input.from),
        end_date: yyyymmdd(input.to),
        order: "ASC",
      });

      if (!data?.values || !Array.isArray(data.values)) {
        console.warn(`[TwelveData] No index data for ${input.symbol}`);
        return empty;
      }

      empty.candles = data.values
        .filter((v) => v.datetime)
        .map((v) => ({
          ts: new Date(v.datetime!),
          open: parseFloat(v.open ?? "0"),
          high: parseFloat(v.high ?? "0"),
          low: parseFloat(v.low ?? "0"),
          close: parseFloat(v.close ?? "0"),
          volume: parseInt(v.volume ?? "0", 10),
        }));

      return empty;
    } catch (err) {
      console.error(
        `[TwelveData] getIndexSeries failed for ${input.symbol}:`,
        err instanceof Error ? err.message : err
      );
      return empty;
    }
  }

  /**
   * FII/DII flows are not available from Twelve Data.
   * Returns an empty array.
   */
  async getFiiDiiFlows(_date: string): Promise<FiiDiiFlow[]> {
    return [];
  }

  /**
   * Market breadth is not available from Twelve Data.
   * Returns null.
   */
  async getMarketBreadth(_date: string): Promise<MarketBreadth | null> {
    return null;
  }

  /**
   * Lightweight health check using the `/api_usage` endpoint.
   * Also reports remaining daily quota.
   */
  async healthcheck(): Promise<AdapterHealth> {
    const start = Date.now();
    try {
      interface TdUsage {
        timestamp?: string;
        current_usage?: number;
        plan_limit?: number;
      }

      const usage = await this.tdFetch<TdUsage>("/api_usage");

      const remaining =
        usage.plan_limit !== undefined && usage.current_usage !== undefined
          ? usage.plan_limit - usage.current_usage
          : undefined;

      return {
        provider: this.providerType,
        healthy: true,
        latencyMs: Date.now() - start,
        lastSuccessAt: new Date().toISOString(),
        quotaRemaining: remaining,
      };
    } catch (err) {
      return {
        provider: this.providerType,
        healthy: false,
        latencyMs: Date.now() - start,
        lastFailureAt: new Date().toISOString(),
        message: err instanceof Error ? err.message : "Unknown error",
      };
    }
  }
}
