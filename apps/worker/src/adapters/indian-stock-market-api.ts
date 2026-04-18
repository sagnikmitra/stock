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

function toNumber(value: unknown): number | undefined {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string" && value.trim().length > 0) {
    const n = Number(value);
    if (Number.isFinite(n)) return n;
  }
  return undefined;
}

function parseApiTimestamp(value: unknown): Date {
  if (typeof value !== "string" || value.trim().length === 0) return new Date();
  const direct = new Date(value);
  if (!Number.isNaN(direct.getTime())) return direct;
  // API often returns "YYYY-MM-DD HH:mm:ss" in IST.
  const withTz = new Date(value.replace(" ", "T") + "+05:30");
  return Number.isNaN(withTz.getTime()) ? new Date() : withTz;
}

export class IndianStockMarketApiAdapter extends BaseAdapter {
  readonly name = "Indian Stock Market API (0xramm)";
  readonly providerType = ProviderType.MARKET_DATA_VENDOR;
  readonly supports = {
    eodCandles: false,
    intradayCandles: false,
    quotes: true,
    indices: false,
    fundamentals: false,
    fiiDii: false,
    mutualFunds: false,
    marketBreadth: false,
  };

  private baseUrl = process.env.INDIAN_STOCK_MARKET_API_BASE_URL ?? "https://nse-api-ruby.vercel.app";

  constructor() {
    super();
    // README guidance suggests 60 req/min. Keep headroom.
    this.setRateLimit(45, 60_000);
  }

  private async ismFetch<T>(path: string, params: Record<string, string> = {}): Promise<T> {
    await this.waitForRateLimit();

    const url = new URL(path, this.baseUrl.endsWith("/") ? this.baseUrl : `${this.baseUrl}/`);
    for (const [key, value] of Object.entries(params)) {
      url.searchParams.set(key, value);
    }

    const res = await fetch(url.toString(), {
      method: "GET",
      headers: { Accept: "application/json" },
    });

    if (!res.ok) {
      const body = await res.text().catch(() => "");
      throw new Error(`Indian Stock Market API error ${res.status}: ${body.slice(0, 200)}`);
    }

    return (await res.json()) as T;
  }

  async getSymbols(): Promise<SymbolMaster[]> {
    try {
      const payload = await this.ismFetch<{
        status?: string;
        symbols?: Array<{
          symbol?: string;
          nse_ticker?: string;
          bse_ticker?: string;
          search_term?: string;
        }>;
      }>("/symbols");

      const symbols = Array.isArray(payload.symbols) ? payload.symbols : [];
      const unique = new Map<string, SymbolMaster>();

      for (const row of symbols) {
        const symbol = String(row.symbol ?? "").trim().toUpperCase();
        if (!symbol) continue;
        if (!unique.has(symbol)) {
          unique.set(symbol, {
            symbol,
            companyName: row.search_term ? String(row.search_term).trim() : symbol,
            exchange: "NSE",
          });
        }
      }

      return Array.from(unique.values()).sort((a, b) => a.symbol.localeCompare(b.symbol));
    } catch (error) {
      console.warn(
        "[IndianStockMarketAPI] getSymbols failed:",
        error instanceof Error ? error.message : error,
      );
      return [];
    }
  }

  async getQuotes(symbols: string[]): Promise<QuoteSnapshot[]> {
    if (symbols.length === 0) return [];

    try {
      const batchSize = 25;
      const results: QuoteSnapshot[] = [];

      for (let i = 0; i < symbols.length; i += batchSize) {
        const batch = symbols.slice(i, i + batchSize);
        const payload = await this.ismFetch<{
          status?: string;
          timestamp?: string;
          stocks?: Array<{
            symbol?: string;
            ticker?: string;
            last_price?: number | string;
            change?: number | string;
            percent_change?: number | string;
            volume?: number | string;
            exchange?: string;
          }>;
        }>("/stock/list", {
          symbols: batch.join(","),
          res: "num",
        });

        const ts = parseApiTimestamp(payload.timestamp);
        const stocks = Array.isArray(payload.stocks) ? payload.stocks : [];
        for (const row of stocks) {
          const symbol = String(row.symbol ?? "").trim().toUpperCase();
          const ltp = toNumber(row.last_price);
          if (!symbol || ltp === undefined) continue;

          results.push({
            symbol,
            ltp,
            changePct: toNumber(row.percent_change),
            volume: toNumber(row.volume),
            ts,
          });
        }
      }

      return results;
    } catch (error) {
      console.warn(
        "[IndianStockMarketAPI] getQuotes failed:",
        error instanceof Error ? error.message : error,
      );
      return [];
    }
  }

  async getHistoricalCandles(input: CandleRequest): Promise<CandleSeries> {
    // This provider currently does not expose historical candle endpoints.
    return {
      symbol: input.symbol,
      timeframe: input.timeframe ?? Timeframe.D1,
      candles: [],
    };
  }

  async getIndexSeries(input: IndexRequest): Promise<CandleSeries> {
    return {
      symbol: input.symbol,
      timeframe: Timeframe.D1,
      candles: [],
    };
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
      await this.ismFetch<Record<string, unknown>>("/");
      return {
        provider: "indian_stock_market_api",
        healthy: true,
        latencyMs: Date.now() - start,
        lastSuccessAt: new Date().toISOString(),
      };
    } catch (error) {
      return {
        provider: "indian_stock_market_api",
        healthy: false,
        latencyMs: Date.now() - start,
        lastFailureAt: new Date().toISOString(),
        message: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }
}

