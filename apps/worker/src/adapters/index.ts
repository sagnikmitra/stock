import type { MarketDataAdapter } from "@ibo/types";
import { NseOfficialAdapter } from "./nse-official";
import { TwelveDataAdapter } from "./twelvedata";
import { FmpAdapter } from "./fmp";
import { IndianStockMarketApiAdapter } from "./indian-stock-market-api";

const adapters: Record<string, () => MarketDataAdapter> = {
  nse_official: () => new NseOfficialAdapter(),
  indian_stock_market_api: () => new IndianStockMarketApiAdapter(),
  twelvedata: () => new TwelveDataAdapter(),
  fmp: () => new FmpAdapter(),
};

/**
 * Get adapter by provider key. Falls back through hierarchy if primary fails health check.
 */
export function getAdapter(key: string): MarketDataAdapter | null {
  const factory = adapters[key];
  return factory ? factory() : null;
}

/**
 * Return instances of every registered adapter.
 */
export function getAllAdapters(): MarketDataAdapter[] {
  return Object.values(adapters).map((f) => f());
}

/**
 * Return the list of registered adapter keys.
 */
export function getAdapterKeys(): string[] {
  return Object.keys(adapters);
}
