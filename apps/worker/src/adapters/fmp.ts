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

/** Format a date string or Date object as YYYY-MM-DD. */
function yyyymmdd(d: Date | string): string {
  const dt = typeof d === "string" ? new Date(d) : d;
  return dt.toISOString().slice(0, 10);
}

/* -------------------------------------------------------------------------- */
/*  Financial Modeling Prep Adapter                                           */
/* -------------------------------------------------------------------------- */

/**
 * Financial Modeling Prep (FMP) market data adapter.
 *
 * Provides historical candles and real-time quotes for NSE-listed equities.
 * FMP uses the `.NS` suffix for NSE symbols (e.g., `RELIANCE.NS`).
 *
 * Free tier: 250 requests/day. API key read from `process.env.FMP_API_KEY`.
 *
 * FMP does not provide FII/DII flows or market breadth data, so those methods
 * return empty results.
 */
export class FmpAdapter extends BaseAdapter {
  readonly name = "Financial Modeling Prep";
  readonly providerType = ProviderType.MARKET_DATA_VENDOR;
  readonly supports = {
    eodCandles: true,
    intradayCandles: false,
    quotes: true,
    indices: false,
    fundamentals: true,
    fiiDii: false,
    mutualFunds: false,
    marketBreadth: false,
  };

  private baseUrl = "https://financialmodelingprep.com/api/v3";
  private apiKey = process.env.FMP_API_KEY ?? "";

  constructor() {
    super();
    // Free tier: ~250 requests/day. Conservative rate limit: 4 req/min.
    this.setRateLimit(4, 60_000);
  }

  /* ---- Internal fetch helper --------------------------------------------- */

  /**
   * Authenticated GET against the FMP API.
   * Appends the API key and handles error responses.
   */
  private async fmpFetch<T>(path: string, params: Record<string, string> = {}): Promise<T> {
    if (!this.apiKey) {
      throw new Error("FMP_API_KEY is not set");
    }

    await this.waitForRateLimit();

    const url = new URL(path, this.baseUrl + "/");
    url.searchParams.set("apikey", this.apiKey);
    for (const [k, v] of Object.entries(params)) {
      url.searchParams.set(k, v);
    }

    const res = await fetch(url.toString(), {
      method: "GET",
      headers: { Accept: "application/json" },
    });

    if (res.status === 429) {
      console.warn("[FMP] Rate limited, waiting 15s...");
      await new Promise((r) => setTimeout(r, 15_000));
      return this.fmpFetch<T>(path, params);
    }

    if (!res.ok) {
      const body = await res.text().catch(() => "");
      throw new Error(`FMP API error ${res.status}: ${body.slice(0, 200)}`);
    }

    const json = (await res.json()) as T;

    // FMP sometimes returns { "Error Message": "..." } with HTTP 200.
    if (
      json &&
      typeof json === "object" &&
      "Error Message" in json
    ) {
      throw new Error(`FMP API error: ${(json as Record<string, string>)["Error Message"]}`);
    }

    return json;
  }

  /**
   * Build the FMP symbol string for an NSE equity (append `.NS`).
   */
  private fmpSymbol(symbol: string): string {
    return symbol.includes(".") ? symbol : `${symbol}.NS`;
  }

  /* ---- MarketDataAdapter implementation ---------------------------------- */

  /**
   * Fetch available NSE stocks from FMP's stock list.
   * FMP does not have a dedicated NSE symbol list, so we filter their global
   * list by exchange.
   */
  async getSymbols(): Promise<SymbolMaster[]> {
    try {
      interface FmpStock {
        symbol?: string;
        name?: string;
        exchange?: string;
        exchangeShortName?: string;
        type?: string;
      }

      const data = await this.fmpFetch<FmpStock[]>(
        `${this.baseUrl}/stock/list`
      );

      if (!Array.isArray(data)) {
        console.warn("[FMP] getSymbols: unexpected response");
        return [];
      }

      return data
        .filter(
          (s) =>
            s.symbol &&
            (s.exchangeShortName === "NSE" ||
              s.exchange === "NSE" ||
              s.symbol.endsWith(".NS"))
        )
        .map((s) => {
          // Strip the .NS suffix for our canonical symbol
          const cleanSymbol = s.symbol!.replace(/\.NS$/, "");
          return {
            symbol: cleanSymbol,
            companyName: s.name ?? cleanSymbol,
            exchange: "NSE",
          };
        });
    } catch (err) {
      console.error("[FMP] getSymbols failed:", err instanceof Error ? err.message : err);
      return [];
    }
  }

  /**
   * Fetch real-time quotes for the given symbols.
   * FMP supports batch quotes via comma-separated symbols.
   */
  async getQuotes(symbols: string[]): Promise<QuoteSnapshot[]> {
    if (symbols.length === 0) return [];

    try {
      interface FmpQuote {
        symbol?: string;
        name?: string;
        price?: number;
        open?: number;
        dayHigh?: number;
        dayLow?: number;
        previousClose?: number;
        changesPercentage?: number;
        change?: number;
        volume?: number;
        timestamp?: number;
      }

      // FMP accepts a comma-separated list of symbols (max ~50 at a time).
      const batchSize = 50;
      const results: QuoteSnapshot[] = [];

      for (let i = 0; i < symbols.length; i += batchSize) {
        const batch = symbols.slice(i, i + batchSize);
        const fmpSymbols = batch.map((s) => this.fmpSymbol(s)).join(",");

        const data = await this.fmpFetch<FmpQuote[]>(
          `${this.baseUrl}/quote/${encodeURIComponent(fmpSymbols)}`
        );

        if (!Array.isArray(data)) {
          console.warn("[FMP] getQuotes: unexpected response");
          continue;
        }

        for (const q of data) {
          if (!q.symbol || q.price === undefined) continue;

          const cleanSymbol = q.symbol.replace(/\.NS$/, "");

          results.push({
            symbol: cleanSymbol,
            ltp: q.price,
            open: q.open,
            high: q.dayHigh,
            low: q.dayLow,
            close: q.previousClose,
            changePct: q.changesPercentage,
            volume: q.volume,
            ts: q.timestamp ? new Date(q.timestamp * 1000) : new Date(),
          });
        }
      }

      return results;
    } catch (err) {
      console.error("[FMP] getQuotes failed:", err instanceof Error ? err.message : err);
      return [];
    }
  }

  /**
   * Fetch historical daily candles for a single symbol from FMP.
   * Uses the `/historical-price-full` endpoint.
   */
  async getHistoricalCandles(input: CandleRequest): Promise<CandleSeries> {
    const empty: CandleSeries = {
      symbol: input.symbol,
      timeframe: input.timeframe ?? Timeframe.D1,
      candles: [],
    };

    try {
      interface FmpHistCandle {
        date?: string;
        open?: number;
        high?: number;
        low?: number;
        close?: number;
        adjClose?: number;
        volume?: number;
        unadjustedVolume?: number;
        change?: number;
        changePercent?: number;
      }

      const sym = this.fmpSymbol(input.symbol);

      const data = await this.fmpFetch<{
        symbol?: string;
        historical?: FmpHistCandle[];
      }>(`${this.baseUrl}/historical-price-full/${encodeURIComponent(sym)}`, {
        from: yyyymmdd(input.from),
        to: yyyymmdd(input.to),
      });

      if (!data?.historical || !Array.isArray(data.historical)) {
        console.warn(`[FMP] No historical data for ${input.symbol}`);
        return empty;
      }

      empty.candles = data.historical
        .filter((c) => c.date)
        .map((c) => ({
          ts: new Date(c.date!),
          open: c.open ?? 0,
          high: c.high ?? 0,
          low: c.low ?? 0,
          close: c.close ?? 0,
          volume: c.volume ?? 0,
        }))
        // FMP returns most-recent-first; sort ascending.
        .sort((a, b) => a.ts.getTime() - b.ts.getTime());

      return empty;
    } catch (err) {
      console.error(
        `[FMP] getHistoricalCandles failed for ${input.symbol}:`,
        err instanceof Error ? err.message : err
      );
      return empty;
    }
  }

  /**
   * Index series is not well supported on FMP free tier for Indian indices.
   * Returns an empty series.
   */
  async getIndexSeries(input: IndexRequest): Promise<CandleSeries> {
    const empty: CandleSeries = {
      symbol: input.symbol,
      timeframe: Timeframe.D1,
      candles: [],
    };

    try {
      // FMP uses ^NSEI for Nifty 50, ^NSEBANK for Bank Nifty.
      // Attempt the fetch — will gracefully fail if symbol is not found.
      interface FmpHistCandle {
        date?: string;
        open?: number;
        high?: number;
        low?: number;
        close?: number;
        volume?: number;
      }

      const data = await this.fmpFetch<{
        symbol?: string;
        historical?: FmpHistCandle[];
      }>(`${this.baseUrl}/historical-price-full/${encodeURIComponent(input.symbol)}`, {
        from: yyyymmdd(input.from),
        to: yyyymmdd(input.to),
      });

      if (!data?.historical || !Array.isArray(data.historical)) {
        return empty;
      }

      empty.candles = data.historical
        .filter((c) => c.date)
        .map((c) => ({
          ts: new Date(c.date!),
          open: c.open ?? 0,
          high: c.high ?? 0,
          low: c.low ?? 0,
          close: c.close ?? 0,
          volume: c.volume ?? 0,
        }))
        .sort((a, b) => a.ts.getTime() - b.ts.getTime());

      return empty;
    } catch (err) {
      console.warn(
        `[FMP] getIndexSeries failed for ${input.symbol}:`,
        err instanceof Error ? err.message : err
      );
      return empty;
    }
  }

  /**
   * FII/DII flows are not available from FMP.
   */
  async getFiiDiiFlows(_date: string): Promise<FiiDiiFlow[]> {
    return [];
  }

  /**
   * Market breadth is not available from FMP.
   */
  async getMarketBreadth(_date: string): Promise<MarketBreadth | null> {
    return null;
  }

  /**
   * Health check: attempt a single quote fetch for a known liquid stock.
   * Lighter than the full symbol list.
   */
  async healthcheck(): Promise<AdapterHealth> {
    const start = Date.now();
    try {
      const data = await this.fmpFetch<unknown[]>(
        `${this.baseUrl}/quote/RELIANCE.NS`
      );

      const ok = Array.isArray(data) && data.length > 0;

      return {
        provider: this.providerType,
        healthy: ok,
        latencyMs: Date.now() - start,
        lastSuccessAt: ok ? new Date().toISOString() : undefined,
        lastFailureAt: ok ? undefined : new Date().toISOString(),
        message: ok ? undefined : "Health check returned empty data",
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
