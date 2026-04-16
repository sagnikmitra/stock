import type {
  MarketDataAdapter,
  AdapterHealth,
  SymbolMaster,
  QuoteSnapshot,
  CandleSeries,
  CandleRequest,
  IndexRequest,
  FiiDiiFlow,
  MarketBreadth,
} from "@ibo/types";

/**
 * Base adapter with common error handling, rate limiting, and health check pattern.
 * All concrete adapters extend this class.
 */
export abstract class BaseAdapter implements MarketDataAdapter {
  abstract readonly name: string;
  abstract readonly providerType: string;
  abstract readonly supports: MarketDataAdapter["supports"];

  /* -- Rate limiting -------------------------------------------------------- */

  private requestTimestamps: number[] = [];
  private rateLimitWindow = 60_000; // 1 minute window by default
  private rateLimitMax = 30; // max requests per window by default

  /**
   * Configure rate limiting parameters.
   */
  protected setRateLimit(maxRequests: number, windowMs: number): void {
    this.rateLimitMax = maxRequests;
    this.rateLimitWindow = windowMs;
  }

  /**
   * Wait until the next request is allowed under the rate limit.
   * Returns immediately if under the limit.
   */
  protected async waitForRateLimit(): Promise<void> {
    const now = Date.now();
    // Evict timestamps outside the window
    this.requestTimestamps = this.requestTimestamps.filter(
      (t) => now - t < this.rateLimitWindow
    );

    if (this.requestTimestamps.length >= this.rateLimitMax) {
      const oldest = this.requestTimestamps[0]!;
      const waitMs = this.rateLimitWindow - (now - oldest) + 50; // +50ms buffer
      if (waitMs > 0) {
        await new Promise((r) => setTimeout(r, waitMs));
      }
      // Re-evict after waiting
      const nowAfter = Date.now();
      this.requestTimestamps = this.requestTimestamps.filter(
        (t) => nowAfter - t < this.rateLimitWindow
      );
    }

    this.requestTimestamps.push(Date.now());
  }

  /* -- Abstract methods ----------------------------------------------------- */

  abstract getSymbols(): Promise<SymbolMaster[]>;
  abstract getQuotes(symbols: string[]): Promise<QuoteSnapshot[]>;
  abstract getHistoricalCandles(input: CandleRequest): Promise<CandleSeries>;
  abstract getIndexSeries(input: IndexRequest): Promise<CandleSeries>;
  abstract getFiiDiiFlows(date: string): Promise<FiiDiiFlow[]>;
  abstract getMarketBreadth(date: string): Promise<MarketBreadth | null>;

  /* -- Default health check ------------------------------------------------- */

  /**
   * Default healthcheck calls getSymbols(). Subclasses may override with a
   * lighter endpoint (e.g., HEAD request or API usage endpoint).
   */
  async healthcheck(): Promise<AdapterHealth> {
    const start = Date.now();
    try {
      await this.getSymbols();
      return {
        provider: this.providerType,
        healthy: true,
        latencyMs: Date.now() - start,
        lastSuccessAt: new Date().toISOString(),
      };
    } catch (error) {
      return {
        provider: this.providerType,
        healthy: false,
        latencyMs: Date.now() - start,
        lastFailureAt: new Date().toISOString(),
        message: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }
}
