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

/** Format a Date as DD-MM-YYYY (NSE's expected format). */
function ddmmyyyy(d: Date | string): string {
  const dt = typeof d === "string" ? new Date(d) : d;
  const dd = String(dt.getDate()).padStart(2, "0");
  const mm = String(dt.getMonth() + 1).padStart(2, "0");
  const yyyy = dt.getFullYear();
  return `${dd}-${mm}-${yyyy}`;
}

/** Standard headers that NSE expects to avoid 403s. */
const BROWSER_HEADERS: Record<string, string> = {
  "User-Agent":
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
  Accept:
    "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
  "Accept-Language": "en-US,en;q=0.9",
  "Accept-Encoding": "gzip, deflate, br",
  Connection: "keep-alive",
};

/* -------------------------------------------------------------------------- */
/*  NSE Official Reports Adapter                                              */
/* -------------------------------------------------------------------------- */

/**
 * NSE Official Reports adapter.
 *
 * Fetches from nseindia.com public API endpoints. NSE requires cookie-based
 * session management: an initial GET to the homepage captures session cookies,
 * which are then forwarded on every subsequent API call.
 *
 * **Rate limiting**: enforces a 1-request-per-second cadence to stay under
 * NSE's undocumented rate limits.
 *
 * This is the primary free data source for Indian equities.
 */
export class NseOfficialAdapter extends BaseAdapter {
  readonly name = "NSE Official Reports";
  readonly providerType = ProviderType.OFFICIAL_EXCHANGE;
  readonly supports = {
    eodCandles: true,
    intradayCandles: false,
    quotes: true,
    indices: true,
    fundamentals: false,
    fiiDii: true,
    mutualFunds: false,
    marketBreadth: true,
  };

  private baseUrl = "https://www.nseindia.com";

  /** Cached session cookies (raw Set-Cookie values joined for the Cookie header). */
  private cookies: string | null = null;
  /** Timestamp of last cookie refresh. */
  private cookieTs = 0;
  /** Cookie TTL — refresh every 4 minutes (NSE sessions are short-lived). */
  private readonly cookieTtlMs = 4 * 60 * 1000;

  constructor() {
    super();
    // NSE tolerates roughly 1 request per second before blocking.
    this.setRateLimit(1, 1_100);
  }

  /* ---- Cookie management ------------------------------------------------- */

  /**
   * Fetch the NSE homepage to capture session cookies.
   * Cookies are cached and reused until they expire or a 401/403 triggers a
   * forced refresh.
   */
  private async refreshCookies(force = false): Promise<void> {
    if (!force && this.cookies && Date.now() - this.cookieTs < this.cookieTtlMs) {
      return; // Still fresh
    }

    try {
      const res = await fetch(this.baseUrl, {
        method: "GET",
        headers: BROWSER_HEADERS,
        redirect: "follow",
      });

      // Collect all Set-Cookie headers.
      const rawCookies: string[] = [];
      res.headers.forEach((value, key) => {
        if (key.toLowerCase() === "set-cookie") {
          // Keep only the cookie name=value part (strip attributes).
          const nameValue = value.split(";")[0];
          if (nameValue) rawCookies.push(nameValue);
        }
      });

      if (rawCookies.length > 0) {
        this.cookies = rawCookies.join("; ");
        this.cookieTs = Date.now();
      } else {
        // Some fetch implementations merge set-cookie.
        // Fallback: read the single "set-cookie" header.
        const single = res.headers.get("set-cookie");
        if (single) {
          this.cookies = single
            .split(",")
            .map((c) => c.split(";")[0]?.trim())
            .filter(Boolean)
            .join("; ");
          this.cookieTs = Date.now();
        }
      }
    } catch (err) {
      console.warn("[NSE] Cookie refresh failed:", err instanceof Error ? err.message : err);
    }
  }

  /**
   * Authenticated GET helper.  Handles cookie injection, rate limiting,
   * and automatic retry on 401/403 with a cookie refresh.
   */
  private async nseFetch<T>(path: string, retried = false): Promise<T> {
    await this.refreshCookies();
    await this.waitForRateLimit();

    const url = path.startsWith("http") ? path : `${this.baseUrl}${path}`;

    const res = await fetch(url, {
      method: "GET",
      headers: {
        ...BROWSER_HEADERS,
        ...(this.cookies ? { Cookie: this.cookies } : {}),
      },
      redirect: "follow",
    });

    // On auth failure, force-refresh cookies and retry once.
    if ((res.status === 401 || res.status === 403) && !retried) {
      console.warn(`[NSE] Got ${res.status} for ${path}, refreshing cookies and retrying...`);
      await this.refreshCookies(true);
      return this.nseFetch<T>(path, true);
    }

    if (!res.ok) {
      const body = await res.text().catch(() => "");
      throw new Error(`NSE API error ${res.status} for ${path}: ${body.slice(0, 200)}`);
    }

    return (await res.json()) as T;
  }

  /* ---- MarketDataAdapter implementation ---------------------------------- */

  /**
   * Fetch NSE symbol universe.
   *
   * Primary source: pre-open ALL endpoint (broad NSE equity universe).
   * Fallback source: F&O constituents endpoint.
   *
   * Returns SymbolMaster objects with best-effort metadata.
   */
  async getSymbols(): Promise<SymbolMaster[]> {
    interface NsePreOpenRow {
      metadata?: {
        symbol?: string;
        identifier?: string;
        series?: string;
      };
    }

    try {
      const preOpen = await this.nseFetch<{ data?: NsePreOpenRow[] }>(
        "/api/market-data-pre-open?key=ALL"
      );

      if (Array.isArray(preOpen?.data)) {
        const unique = new Map<string, SymbolMaster>();

        for (const row of preOpen.data) {
          const symbol = String(row.metadata?.symbol ?? "").trim().toUpperCase();
          if (!symbol) continue;

          unique.set(symbol, {
            symbol,
            companyName: symbol,
            exchange: "NSE",
          });
        }

        if (unique.size > 0) {
          return Array.from(unique.values()).sort((a, b) => a.symbol.localeCompare(b.symbol));
        }
      }

      console.warn("[NSE] getSymbols: pre-open ALL returned no rows, falling back to F&O list");
    } catch (err) {
      console.warn(
        "[NSE] getSymbols: pre-open ALL failed, falling back to F&O list:",
        err instanceof Error ? err.message : err
      );
    }

    try {
      interface NseStockRow {
        symbol?: string;
        identifier?: string;
        meta?: { companyName?: string; isin?: string; industry?: string; sector?: string };
        // Some endpoints put company name at top level
        companyName?: string;
        isin?: string;
        industry?: string;
        series?: string;
      }

      const data = await this.nseFetch<{ data?: NseStockRow[] }>(
        "/api/equity-stockIndices?index=SECURITIES%20IN%20F%26O"
      );

      if (!data?.data || !Array.isArray(data.data)) {
        console.warn("[NSE] getSymbols: unexpected response shape");
        return [];
      }

      return data.data
        .filter((row) => row.symbol && row.symbol !== "NIFTY 50")
        .map((row) => ({
          symbol: row.symbol!,
          companyName:
            row.meta?.companyName ?? row.companyName ?? row.symbol!,
          isin: row.meta?.isin ?? row.isin,
          exchange: "NSE",
          sector: row.meta?.sector,
          industry: row.meta?.industry ?? row.industry,
        }));
    } catch (err) {
      console.error("[NSE] getSymbols failed:", err instanceof Error ? err.message : err);
      return [];
    }
  }

  /**
   * Fetch live quotes for the given symbols from NSE.
   * Each symbol requires a separate API call due to NSE endpoint design.
   */
  async getQuotes(symbols: string[]): Promise<QuoteSnapshot[]> {
    const results: QuoteSnapshot[] = [];

    for (const sym of symbols) {
      try {
        interface NseQuoteData {
          priceInfo?: {
            lastPrice?: number;
            open?: number;
            intraDayHighLow?: { min?: number; max?: number };
            close?: number;
            previousClose?: number;
            pChange?: number;
            change?: number;
          };
          preOpenMarket?: { IEP?: number };
          securityInfo?: { tradedVolume?: number };
          metadata?: { lastUpdateTime?: string };
        }

        const data = await this.nseFetch<NseQuoteData>(
          `/api/quote-equity?symbol=${encodeURIComponent(sym)}`
        );

        const pi = data?.priceInfo;
        if (!pi?.lastPrice) {
          console.warn(`[NSE] No quote data for ${sym}`);
          continue;
        }

        results.push({
          symbol: sym,
          ltp: pi.lastPrice,
          open: pi.open,
          high: pi.intraDayHighLow?.max,
          low: pi.intraDayHighLow?.min,
          close: pi.close ?? pi.previousClose,
          changePct: pi.pChange,
          volume: data.securityInfo?.tradedVolume,
          ts: data.metadata?.lastUpdateTime
            ? new Date(data.metadata.lastUpdateTime)
            : new Date(),
        });
      } catch (err) {
        console.warn(`[NSE] getQuotes failed for ${sym}:`, err instanceof Error ? err.message : err);
      }
    }

    return results;
  }

  /**
   * Fetch historical EOD candles for a single symbol from NSE.
   * NSE limits historical data to roughly 2 years.
   */
  async getHistoricalCandles(input: CandleRequest): Promise<CandleSeries> {
    const empty: CandleSeries = {
      symbol: input.symbol,
      timeframe: input.timeframe ?? Timeframe.D1,
      candles: [],
    };

    try {
      interface NseHistRow {
        CH_TIMESTAMP?: string;
        CH_OPENING_PRICE?: number;
        CH_TRADE_HIGH_PRICE?: number;
        CH_TRADE_LOW_PRICE?: number;
        CH_CLOSING_PRICE?: number;
        CH_TOT_TRADED_QTY?: number;
        COP_DELIV_PERC?: number;
        // Alternate field names on some endpoints
        TIMESTAMP?: string;
        OPEN?: number;
        HIGH?: number;
        LOW?: number;
        CLOSE?: number;
        VOLUME?: number;
        mTIMESTAMP?: string;
      }

      const from = ddmmyyyy(input.from);
      const to = ddmmyyyy(input.to);

      const data = await this.nseFetch<{ data?: NseHistRow[] }>(
        `/api/historical/cm/equity?symbol=${encodeURIComponent(input.symbol)}&series=[%22EQ%22]&from=${from}&to=${to}`
      );

      if (!data?.data || !Array.isArray(data.data)) {
        console.warn(`[NSE] getHistoricalCandles: no data for ${input.symbol}`);
        return empty;
      }

      empty.candles = data.data
        .map((row) => {
          const tsStr = row.CH_TIMESTAMP ?? row.TIMESTAMP ?? row.mTIMESTAMP;
          if (!tsStr) return null;

          return {
            ts: new Date(tsStr),
            open: row.CH_OPENING_PRICE ?? row.OPEN ?? 0,
            high: row.CH_TRADE_HIGH_PRICE ?? row.HIGH ?? 0,
            low: row.CH_TRADE_LOW_PRICE ?? row.LOW ?? 0,
            close: row.CH_CLOSING_PRICE ?? row.CLOSE ?? 0,
            volume: row.CH_TOT_TRADED_QTY ?? row.VOLUME ?? 0,
            deliveryPct: row.COP_DELIV_PERC,
          };
        })
        .filter((c): c is NonNullable<typeof c> => c !== null)
        .sort((a, b) => a.ts.getTime() - b.ts.getTime());

      return empty;
    } catch (err) {
      console.error(
        `[NSE] getHistoricalCandles failed for ${input.symbol}:`,
        err instanceof Error ? err.message : err
      );
      return empty;
    }
  }

  /**
   * Fetch index OHLC series from NSE (e.g., NIFTY 50, NIFTY BANK).
   * Uses the indices historical API.
   */
  async getIndexSeries(input: IndexRequest): Promise<CandleSeries> {
    const empty: CandleSeries = {
      symbol: input.symbol,
      timeframe: Timeframe.D1,
      candles: [],
    };

    try {
      interface NseIndexRow {
        TIMESTAMP?: string;
        HistoricalDate?: string;
        OPEN?: number;
        HIGH?: number;
        LOW?: number;
        CLOSE?: number;
        VOLUME?: string | number;
      }

      const from = ddmmyyyy(input.from);
      const to = ddmmyyyy(input.to);

      const data = await this.nseFetch<{ data?: { indexCloseOnlineRecords?: NseIndexRow[]; indexTurnoverRecords?: NseIndexRow[] } }>(
        `/api/historical/indicesHistory?indexType=${encodeURIComponent(input.symbol)}&from=${from}&to=${to}`
      );

      const rows =
        data?.data?.indexCloseOnlineRecords ?? data?.data?.indexTurnoverRecords ?? [];

      empty.candles = rows
        .map((row) => {
          const tsStr = row.TIMESTAMP ?? row.HistoricalDate;
          if (!tsStr) return null;
          return {
            ts: new Date(tsStr),
            open: row.OPEN ?? 0,
            high: row.HIGH ?? 0,
            low: row.LOW ?? 0,
            close: row.CLOSE ?? 0,
            volume: typeof row.VOLUME === "string" ? parseFloat(row.VOLUME.replace(/,/g, "")) || 0 : (row.VOLUME ?? 0),
          };
        })
        .filter((c): c is NonNullable<typeof c> => c !== null)
        .sort((a, b) => a.ts.getTime() - b.ts.getTime());

      return empty;
    } catch (err) {
      console.error(
        `[NSE] getIndexSeries failed for ${input.symbol}:`,
        err instanceof Error ? err.message : err
      );
      return empty;
    }
  }

  /**
   * Fetch FII/DII cash market activity for a given date.
   * Returns net buy/sell figures for both FII and DII segments.
   */
  async getFiiDiiFlows(date: string): Promise<FiiDiiFlow[]> {
    try {
      interface NseFiiDiiRow {
        category?: string;
        date?: string;
        buyValue?: string | number;
        sellValue?: string | number;
        netValue?: string | number;
      }

      const data = await this.nseFetch<NseFiiDiiRow[] | { data?: NseFiiDiiRow[] }>(
        "/api/fiidiiActivity"
      );

      const rows: NseFiiDiiRow[] = Array.isArray(data) ? data : (data?.data ?? []);

      let fiiCashNet: number | undefined;
      let diiCashNet: number | undefined;

      for (const row of rows) {
        const net =
          typeof row.netValue === "string"
            ? parseFloat(row.netValue.replace(/,/g, ""))
            : row.netValue;

        const cat = (row.category ?? "").toUpperCase();
        if (cat.includes("FII") || cat.includes("FPI")) {
          fiiCashNet = net;
        } else if (cat.includes("DII")) {
          diiCashNet = net;
        }
      }

      if (fiiCashNet === undefined && diiCashNet === undefined) {
        return [];
      }

      return [
        {
          date,
          fiiCashNet,
          diiCashNet,
        },
      ];
    } catch (err) {
      console.warn("[NSE] getFiiDiiFlows failed:", err instanceof Error ? err.message : err);
      return [];
    }
  }

  /**
   * Derive market breadth (advances/declines) from the NIFTY 50 stock index data.
   * Each constituent's `pChange` field determines whether it advanced or declined.
   */
  async getMarketBreadth(date: string): Promise<MarketBreadth | null> {
    try {
      interface NseBreadthRow {
        symbol?: string;
        pChange?: number;
        change?: number;
        yearHigh?: number;
        yearLow?: number;
        lastPrice?: number;
        open?: number;
      }

      const data = await this.nseFetch<{ data?: NseBreadthRow[] }>(
        "/api/equity-stockIndices?index=NIFTY%2050"
      );

      const rows = data?.data;
      if (!rows || !Array.isArray(rows)) {
        return null;
      }

      // First row is often the index itself; filter it out.
      const stocks = rows.filter((r) => r.symbol && r.symbol !== "NIFTY 50");

      let advances = 0;
      let declines = 0;
      let unchanged = 0;
      let new52WeekHighs = 0;
      let new52WeekLows = 0;

      for (const row of stocks) {
        const chg = row.pChange ?? row.change ?? 0;
        if (chg > 0) advances++;
        else if (chg < 0) declines++;
        else unchanged++;

        // Detect 52-week highs/lows
        if (row.lastPrice && row.yearHigh && row.lastPrice >= row.yearHigh) {
          new52WeekHighs++;
        }
        if (row.lastPrice && row.yearLow && row.lastPrice <= row.yearLow) {
          new52WeekLows++;
        }
      }

      return {
        date,
        advances,
        declines,
        unchanged,
        new52WeekHighs,
        new52WeekLows,
      };
    } catch (err) {
      console.warn("[NSE] getMarketBreadth failed:", err instanceof Error ? err.message : err);
      return null;
    }
  }

  /**
   * Lightweight health check using a HEAD request to nseindia.com.
   * Avoids the heavier getSymbols() default from BaseAdapter.
   */
  async healthcheck(): Promise<AdapterHealth> {
    const start = Date.now();
    try {
      await this.refreshCookies(true);

      const res = await fetch(this.baseUrl, {
        method: "HEAD",
        headers: BROWSER_HEADERS,
      });

      return {
        provider: this.providerType,
        healthy: res.ok,
        latencyMs: Date.now() - start,
        lastSuccessAt: res.ok ? new Date().toISOString() : undefined,
        lastFailureAt: res.ok ? undefined : new Date().toISOString(),
        message: res.ok ? undefined : `HEAD returned ${res.status}`,
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
