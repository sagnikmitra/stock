import test, { describe, mock, afterEach } from "node:test";
import assert from "node:assert/strict";
import { TwelveDataAdapter } from "../src/adapters/twelvedata";
import { FmpAdapter } from "../src/adapters/fmp";
import { IndianStockMarketApiAdapter } from "../src/adapters/indian-stock-market-api";
import { NseOfficialAdapter } from "../src/adapters/nse-official";
import { Timeframe } from "@ibo/types";

describe("十二 Data Adapter Contracts", () => {
  afterEach(() => {
    mock.restoreAll();
  });

  test("getQuotes gracefully maps API payload to QuoteSnapshot", async () => {
    process.env.TWELVEDATA_API_KEY = "test_key";
    const adapter = new TwelveDataAdapter();

    mock.method(global, "fetch", async () => {
      return {
        ok: true,
        json: async () => ({
          symbol: "RELIANCE",
          name: "Reliance Industries",
          close: "2950.00",
          open: "2900.00",
          high: "2980.00",
          low: "2890.00",
          previous_close: "2895.00",
          change: "55.00",
          percent_change: "1.89",
          volume: "12345678",
          datetime: "2026-04-16",
        }),
      };
    });

    const quotes = await adapter.getQuotes(["RELIANCE"]);

    assert.equal(quotes.length, 1);
    const q = quotes[0];
    assert.equal(q.symbol, "RELIANCE");
    assert.equal(q.ltp, 2950);
    assert.equal(q.changePct, 1.89);
    assert.equal(q.volume, 12345678);
  });

  test("getHistoricalCandles processes standard API response", async () => {
    process.env.TWELVEDATA_API_KEY = "test_key";
    const adapter = new TwelveDataAdapter();

    mock.method(global, "fetch", async () => {
      return {
        ok: true,
        json: async () => ({
          meta: { symbol: "TCS" },
          values: [
            {
              datetime: "2026-04-15",
              open: "4000.0",
              high: "4050.0",
              low: "3990.0",
              close: "4020.0",
              volume: "2000000",
            },
          ],
        }),
      };
    });

    const series = await adapter.getHistoricalCandles({
      symbol: "TCS",
      timeframe: Timeframe.D1,
      from: new Date("2026-04-10"),
      to: new Date("2026-04-16"),
    });

    assert.equal(series.candles.length, 1);
    const c = series.candles[0];
    assert.equal(c.open, 4000);
    assert.equal(c.close, 4020);
    assert.equal(c.volume, 2000000);
  });
});

describe("FMP Adapter Contracts", () => {
  afterEach(() => {
    mock.restoreAll();
  });

  test("getSymbols filters and strips .NS suffix", async () => {
    process.env.FMP_API_KEY = "test_key";
    const adapter = new FmpAdapter();

    mock.method(global, "fetch", async () => {
      return {
        ok: true,
        json: async () => [
          { symbol: "RELIANCE.NS", name: "Reliance", exchangeShortName: "NSE" },
          { symbol: "AAPL", name: "Apple", exchangeShortName: "NASDAQ" },
        ],
      };
    });

    const symbols = await adapter.getSymbols();
    assert.equal(symbols.length, 1);
    assert.equal(symbols[0].symbol, "RELIANCE"); // Suffix stripped
    assert.equal(symbols[0].exchange, "NSE");
  });

  test("getQuotes processes comma separated batch safely", async () => {
    process.env.FMP_API_KEY = "test_key";
    const adapter = new FmpAdapter();

    let fetchedUrl = "";
    mock.method(global, "fetch", async (url: string) => {
      fetchedUrl = url;
      return {
        ok: true,
        json: async () => [
          {
            symbol: "TCS.NS",
            price: 4000,
            open: 3950,
            dayHigh: 4010,
            dayLow: 3900,
            previousClose: 3940,
            changesPercentage: 1.52,
            volume: 5000000,
            timestamp: 1618585200,
          },
        ],
      };
    });

    const quotes = await adapter.getQuotes(["TCS"]);
    assert.ok(fetchedUrl.includes("TCS.NS")); // Assert .NS was appended for fetch
    
    assert.equal(quotes.length, 1);
    assert.equal(quotes[0].symbol, "TCS");
    assert.equal(quotes[0].ltp, 4000);
  });
});

describe("Indian Stock Market API Adapter Contracts", () => {
  afterEach(() => {
    mock.restoreAll();
  });

  test("getSymbols maps /symbols payload and deduplicates", async () => {
    const adapter = new IndianStockMarketApiAdapter();

    mock.method(global, "fetch", async () => {
      return {
        ok: true,
        json: async () => ({
          status: "success",
          symbols: [
            { symbol: "ITC", search_term: "itc limited" },
            { symbol: "ITC", search_term: "itc" },
            { symbol: "TCS", search_term: "tata consultancy services" },
          ],
        }),
      };
    });

    const symbols = await adapter.getSymbols();
    assert.equal(symbols.length, 2);
    assert.equal(symbols[0].symbol, "ITC");
    assert.equal(symbols[1].symbol, "TCS");
  });

  test("getQuotes maps /stock/list numeric payload", async () => {
    const adapter = new IndianStockMarketApiAdapter();
    let fetchedUrl = "";

    mock.method(global, "fetch", async (url: string) => {
      fetchedUrl = url;
      return {
        ok: true,
        json: async () => ({
          status: "success",
          timestamp: "2026-04-16 18:13:23",
          stocks: [
            {
              symbol: "ITC",
              exchange: "NSE",
              ticker: "ITC.NS",
              last_price: 303.4,
              percent_change: 0.45,
              volume: 16511139,
            },
          ],
        }),
      };
    });

    const quotes = await adapter.getQuotes(["ITC", "TCS"]);
    assert.ok(fetchedUrl.includes("/stock/list"));
    assert.equal(quotes.length, 1);
    assert.equal(quotes[0].symbol, "ITC");
    assert.equal(quotes[0].ltp, 303.4);
    assert.equal(quotes[0].changePct, 0.45);
    assert.equal(quotes[0].volume, 16511139);
  });

  test("getHistoricalCandles returns empty by design", async () => {
    const adapter = new IndianStockMarketApiAdapter();
    const series = await adapter.getHistoricalCandles({
      symbol: "ITC",
      timeframe: Timeframe.D1,
      from: new Date("2026-04-01"),
      to: new Date("2026-04-16"),
    });
    assert.equal(series.candles.length, 0);
  });
});

describe("NSE Official Adapter Contracts", () => {
  afterEach(() => {
    mock.restoreAll();
  });

  test("getSymbols uses pre-open ALL as primary universe and deduplicates", async () => {
    const adapter = new NseOfficialAdapter();
    let calls = 0;

    mock.method(global, "fetch", async (url: string) => {
      calls += 1;
      if (url === "https://www.nseindia.com") {
        return {
          ok: true,
          status: 200,
          headers: {
            forEach: (cb: (value: string, key: string) => void) => cb("nsit=abc; Path=/", "set-cookie"),
            get: () => null,
          },
        };
      }
      if (url.includes("/api/market-data-pre-open?key=ALL")) {
        return {
          ok: true,
          status: 200,
          headers: { forEach: () => undefined, get: () => null },
          json: async () => ({
            data: [
              { metadata: { symbol: "TCS" } },
              { metadata: { symbol: "ITC" } },
              { metadata: { symbol: "TCS" } },
            ],
          }),
        };
      }

      throw new Error(`Unexpected fetch url ${url}`);
    });

    const symbols = await adapter.getSymbols();
    assert.equal(symbols.length, 2);
    assert.equal(symbols[0].symbol, "ITC");
    assert.equal(symbols[1].symbol, "TCS");
    assert.equal(calls, 2);
  });

  test("getSymbols falls back to F&O endpoint when pre-open ALL fails", async () => {
    const adapter = new NseOfficialAdapter();

    mock.method(global, "fetch", async (url: string) => {
      if (url === "https://www.nseindia.com") {
        return {
          ok: true,
          status: 200,
          headers: {
            forEach: (cb: (value: string, key: string) => void) => cb("nsit=abc; Path=/", "set-cookie"),
            get: () => null,
          },
        };
      }

      if (url.includes("/api/market-data-pre-open?key=ALL")) {
        return {
          ok: false,
          status: 503,
          headers: { forEach: () => undefined, get: () => null },
          text: async () => "service unavailable",
        };
      }

      if (url.includes("/api/equity-stockIndices?index=SECURITIES%20IN%20F%26O")) {
        return {
          ok: true,
          status: 200,
          headers: { forEach: () => undefined, get: () => null },
          json: async () => ({
            data: [
              {
                symbol: "RELIANCE",
                meta: { companyName: "Reliance Industries", isin: "INE002A01018" },
              },
            ],
          }),
        };
      }

      throw new Error(`Unexpected fetch url ${url}`);
    });

    const symbols = await adapter.getSymbols();
    assert.equal(symbols.length, 1);
    assert.equal(symbols[0].symbol, "RELIANCE");
    assert.equal(symbols[0].companyName, "Reliance Industries");
  });
});
