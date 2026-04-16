import type { PrismaClient } from "@prisma/client";

const resources = [
  // =========================================================================
  // Official Exchange
  // =========================================================================
  { key: "nse_market_data", title: "NSE India — Live Market Data", url: "https://www.nseindia.com/market-data/live-equity-market", category: "official", provider: "nse_official" },
  { key: "nse_52w_high_low", title: "NSE 52-Week High/Low", url: "https://www.nseindia.com/market-data/live-market-action/new-high-low", category: "official", provider: "nse_official" },
  { key: "nse_fii_dii", title: "NSE FII/DII Activity", url: "https://www.nseindia.com/reports/fii-dii", category: "official", provider: "nse_official" },
  { key: "nse_bulk_deals", title: "NSE Bulk & Block Deals", url: "https://www.nseindia.com/market-data/bulk-deal-data", category: "official", provider: "nse_official" },
  { key: "nse_corporate_actions", title: "NSE Corporate Actions", url: "https://www.nseindia.com/companies-listing/corporate-filings-actions", category: "official", provider: "nse_official" },
  { key: "bse_india", title: "BSE India", url: "https://www.bseindia.com", category: "official", provider: null },

  // =========================================================================
  // Broker Platforms
  // =========================================================================
  { key: "kite_web", title: "Zerodha Kite", url: "https://kite.zerodha.com", category: "broker", provider: "kite" },
  { key: "kite_api_docs", title: "Kite Connect API Docs", url: "https://kite.trade/docs/connect/v3/", category: "product_docs", provider: "kite" },
  { key: "upstox_web", title: "Upstox Pro", url: "https://pro.upstox.com", category: "broker", provider: "upstox" },
  { key: "upstox_api_docs", title: "Upstox API v2 Docs", url: "https://upstox.com/developer/api-documentation/", category: "product_docs", provider: "upstox" },

  // =========================================================================
  // Screener / Chart Tools
  // =========================================================================
  { key: "chartink_home", title: "Chartink — Stock Screener", url: "https://chartink.com", category: "screener", provider: null },
  { key: "chartink_volume_shockers", title: "Chartink Volume Shockers", url: "https://chartink.com/screener/volume-shockers", category: "screener", provider: null },
  { key: "chartink_52w_breakout", title: "Chartink 52W High Breakout", url: "https://chartink.com/screener/52-week-high-breakout", category: "screener", provider: null },
  { key: "tradingview", title: "TradingView", url: "https://www.tradingview.com", category: "screener", provider: null, notes: "Use for manual chart analysis, drawing trendlines, and verifying structural patterns" },

  // =========================================================================
  // Data Vendors
  // =========================================================================
  { key: "twelvedata_docs", title: "Twelve Data API Docs", url: "https://twelvedata.com/docs", category: "product_docs", provider: "twelvedata" },
  { key: "fmp_docs", title: "FMP API Docs", url: "https://site.financialmodelingprep.com/developer/docs", category: "product_docs", provider: "fmp" },
  { key: "eodhd_docs", title: "EODHD API Docs", url: "https://eodhd.com/financial-apis", category: "product_docs", provider: "eodhd" },

  // =========================================================================
  // Global Cues
  // =========================================================================
  { key: "investing_gift_nifty", title: "Investing.com — GIFT Nifty", url: "https://www.investing.com/indices/gift-nifty", category: "user_reference", provider: null, notes: "Pre-market gap indicator. Check before 9:00 AM IST." },
  { key: "investing_dow_futures", title: "Investing.com — Dow Futures (YM1!)", url: "https://www.investing.com/indices/us-30-futures", category: "user_reference", provider: null },
  { key: "investing_gold", title: "Investing.com — Gold Futures", url: "https://www.investing.com/commodities/gold", category: "user_reference", provider: null },
  { key: "investing_crude", title: "Investing.com — Crude Oil", url: "https://www.investing.com/commodities/crude-oil", category: "user_reference", provider: null },

  // =========================================================================
  // Learning / Course
  // =========================================================================
  { key: "witharin_course", title: "WithArin — Stock Market Course", url: "https://www.witharin.com", category: "user_reference", provider: null, notes: "29th Batch. Primary course source for all strategies and rules." },
  { key: "moneycontrol_home", title: "Moneycontrol", url: "https://www.moneycontrol.com", category: "user_reference", provider: null },
  { key: "screener_in", title: "Screener.in — Fundamental Data", url: "https://www.screener.in", category: "screener", provider: null, notes: "Fundamental screening. Useful for checking PE, ROE, debt ratios." },
  { key: "tickertape", title: "Tickertape", url: "https://www.tickertape.in", category: "screener", provider: null, notes: "Stock overview, mutual fund comparison, screener" },

  // =========================================================================
  // Calculators
  // =========================================================================
  { key: "position_size_calc", title: "Position Size Calculator (Internal)", url: "/tools/position-size", category: "calculator", provider: null, notes: "Formula: qty = (0.02 × portfolio) / (entry − stop_loss)" },
];

export async function seedExternalResources(prisma: PrismaClient) {
  console.log("  🔗 Seeding external resources...");

  for (const r of resources) {
    await prisma.externalResource.upsert({
      where: { key: r.key },
      update: { title: r.title, url: r.url, category: r.category },
      create: {
        key: r.key,
        title: r.title,
        url: r.url,
        category: r.category,
        provider: r.provider ?? undefined,
        notes: r.notes ?? undefined,
      },
    });
  }
}
