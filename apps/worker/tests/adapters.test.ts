import test, { describe, mock, afterEach } from "node:test";
import assert from "node:assert/strict";
import { TwelveDataAdapter } from "../src/adapters/twelvedata";
import { FmpAdapter } from "../src/adapters/fmp";
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
