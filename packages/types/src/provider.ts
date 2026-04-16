// =============================================================================
// Provider Adapter Interface — all data providers implement this contract
// =============================================================================

import type { Candle, QuoteSnapshot, CandleSeries, FiiDiiFlow, MarketBreadth } from "./domain";
import type { Timeframe } from "./enums";

export interface SymbolMaster {
  symbol: string;
  tradingSymbol?: string;
  companyName: string;
  isin?: string;
  exchange: string;
  sector?: string;
  industry?: string;
  marketCapBucket?: string;
  listingDate?: string;
}

export interface CandleRequest {
  symbol: string;
  timeframe: Timeframe;
  from: string;
  to: string;
}

export interface IndexRequest {
  symbol: string;
  from: string;
  to: string;
}

export interface AdapterHealth {
  provider: string;
  healthy: boolean;
  latencyMs?: number;
  lastSuccessAt?: string;
  lastFailureAt?: string;
  quotaRemaining?: number;
  message?: string;
}

export interface MarketDataAdapter {
  name: string;
  providerType: string;
  supports: {
    eodCandles: boolean;
    intradayCandles: boolean;
    quotes: boolean;
    indices: boolean;
    fundamentals: boolean;
    fiiDii: boolean;
    mutualFunds: boolean;
    marketBreadth: boolean;
  };

  getSymbols(): Promise<SymbolMaster[]>;
  getQuotes(symbols: string[]): Promise<QuoteSnapshot[]>;
  getHistoricalCandles(input: CandleRequest): Promise<CandleSeries>;
  getIndexSeries(input: IndexRequest): Promise<CandleSeries>;
  getFiiDiiFlows(date: string): Promise<FiiDiiFlow[]>;
  getMarketBreadth(date: string): Promise<MarketBreadth | null>;
  healthcheck(): Promise<AdapterHealth>;
}
