import test from "node:test";
import assert from "node:assert/strict";
import {
  buildTradingViewPayload,
  normalizeTradingViewFieldName,
  searchTvFields,
} from "../app/lib/tv-screener";
import { POST } from "../app/api/tv-screener/query/route";

type Payload = {
  filter: Array<{ left: string; operation: string; right: unknown }>;
  markets?: string[];
  range: [number, number];
  columns: string[];
};

test("TradingView field discovery exposes source metadata across screener types", () => {
  const stock = searchTvFields({
    type: "stock",
    query: "relative strength index",
    limit: 20,
  });
  const futures = searchTvFields({ type: "futures", query: "rsi", limit: 20 });

  assert.ok(
    stock.fields.some((field) => field.name === "RELATIVE_STRENGTH_INDEX_14"),
  );
  assert.ok(futures.fields.some((field) => field.name === "RSI"));
});

test("TradingView stock payload matches scanner endpoint, market and range semantics", () => {
  const built = buildTradingViewPayload({
    screenerType: "stock",
    market: "INDIA",
    fields: [{ name: "PRICE" }],
    filters: [{ field: "PRICE", operator: ">", value: "100" }],
    limit: 25,
    offset: 25,
  });
  const payload = built.payload as Payload;

  assert.equal(built.endpoint, "https://scanner.tradingview.com/global/scan");
  assert.deepEqual(payload.markets, ["india"]);
  assert.deepEqual(payload.range, [25, 50]);
  assert.deepEqual(payload.columns, ["close", "update_mode"]);
  assert.deepEqual(payload.filter, [
    { left: "close", operation: "greater", right: 100 },
  ]);
});

test("TradingView field modifiers preserve historical lookback before interval", () => {
  const built = buildTradingViewPayload({
    screenerType: "stock",
    fields: [{ name: "AWESOME_OSCILLATOR", history: 1, interval: "60" }],
    filters: [
      {
        field: "AWESOME_OSCILLATOR",
        operator: ">",
        value: 0,
        history: 1,
        interval: "60",
      },
    ],
  });
  const payload = built.payload as Payload;

  assert.ok(payload.columns.includes("AO[1]|60"));
  assert.deepEqual(payload.filter, [
    { left: "AO[1]|60", operation: "greater", right: 0 },
  ]);
  assert.equal(normalizeTradingViewFieldName("change.1W"), "change|1W");
});

test("TradingView query API dry-run returns request payload without network fetch", async () => {
  const response = await POST(
    new Request("http://localhost/api/tv-screener/query", {
      method: "POST",
      body: JSON.stringify({
        screenerType: "coin",
        fields: [{ name: "CLOSE" }, { name: "CHANGE" }],
        filters: [{ field: "CLOSE", operator: ">=", value: "1" }],
        dryRun: true,
      }),
      headers: { "Content-Type": "application/json" },
    }),
  );
  const payload = await response.json();

  assert.equal(response.status, 200);
  assert.equal(
    payload.data.endpoint,
    "https://scanner.tradingview.com/coin/scan",
  );
  assert.deepEqual(payload.data.request.price_conversion, { to_symbol: false });
  assert.deepEqual(payload.data.request.columns, [
    "close",
    "change",
    "update_mode",
  ]);
});
