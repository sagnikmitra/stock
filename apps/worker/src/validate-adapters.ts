import { getAllAdapters } from "./adapters";
import { Timeframe } from "@ibo/types";

/**
 * Validates that all registered adapters are functioning correctly
 * using live credentials. Intended to be run manually:
 * `npx tsx apps/worker/src/validate-adapters.ts`
 */
async function main() {
  console.log("=========================================");
  console.log(" Starting Adapter Validation");
  console.log("=========================================\n");

  const adapters = getAllAdapters();
  if (adapters.length === 0) {
    console.error("No adapters registered.");
    process.exit(1);
  }

  const testSymbols = ["RELIANCE", "TCS"];
  const testIndex = "NIFTY 50";
  // One month ago
  const fromDate = new Date();
  fromDate.setMonth(fromDate.getMonth() - 1);
  const toDate = new Date();

  for (const adapter of adapters) {
    console.log(`\n--- Testing Adapter: ${adapter.name} (${adapter.providerType}) ---`);
    try {
      // 1. Healthcheck
      console.log(`[1/5] Running healthcheck...`);
      const health = await adapter.healthcheck();
      console.log(`      Healthy: ${health.healthy} (${health.latencyMs}ms)`);
      if (health.message) console.log(`      Message: ${health.message}`);

      if (!health.healthy) {
        console.log(`      Skipping further tests for ${adapter.name} due to failing healthcheck.`);
        continue;
      }

      // 2. getSymbols
      console.log(`[2/5] Fetching symbols...`);
      const symbols = await adapter.getSymbols();
      console.log(`      Result: returned ${symbols.length} symbols.`);
      if (symbols.length > 0) {
        console.log(`      Sample: ${symbols[0]?.symbol} - ${symbols[0]?.companyName}`);
      }

      // 3. getQuotes
      if (adapter.supports.quotes) {
        console.log(`[3/5] Fetching quotes for [${testSymbols.join(", ")}]...`);
        const quotes = await adapter.getQuotes(testSymbols);
        console.log(`      Result: returned ${quotes.length} quotes.`);
        if (quotes.length > 0) {
          console.log(`      Sample: ${quotes[0]?.symbol} LTP: ${quotes[0]?.ltp}`);
        }
      } else {
        console.log(`[3/5] Skipping quotes (not supported).`);
      }

      // 4. getHistoricalCandles
      if (adapter.supports.eodCandles) {
        console.log(`[4/5] Fetching daily candles for ${testSymbols[0]}...`);
        const candles = await adapter.getHistoricalCandles({
          symbol: testSymbols[0],
          timeframe: Timeframe.D1,
          from: fromDate,
          to: toDate,
        });
        console.log(`      Result: returned ${candles.candles.length} candles.`);
        if (candles.candles.length > 0) {
          const last = candles.candles[candles.candles.length - 1];
          console.log(`      Sample (last): ${last?.ts.toISOString().split("T")[0]} C:${last?.close} Vol:${last?.volume}`);
        }
      } else {
        console.log(`[4/5] Skipping historical candles (not supported).`);
      }

      // 5. getIndexSeries
      if (adapter.supports.indices) {
        console.log(`[5/5] Fetching index series for ${testIndex}...`);
        const indexCandles = await adapter.getIndexSeries({
          symbol: testIndex,
          from: fromDate,
          to: toDate,
        });
        console.log(`      Result: returned ${indexCandles.candles.length} candles.`);
        if (indexCandles.candles.length > 0) {
          const last = indexCandles.candles[indexCandles.candles.length - 1];
          console.log(`      Sample (last): ${last?.ts.toISOString().split("T")[0]} C:${last?.close}`);
        }
      } else {
        console.log(`[5/5] Skipping index series (not supported).`);
      }

    } catch (err) {
      console.error(`\x1b[31m[ERROR]\x1b[0m Exception running tests for ${adapter.name}:`);
      console.error(err);
    }
  }

  console.log("\n=========================================");
  console.log(" Adapter Validation Complete");
  console.log("=========================================\n");
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
