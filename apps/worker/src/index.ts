import { prisma } from "@ibo/db";
import {
  runPreMarketPipelineCore,
  runPostClosePipelineCore,
  runMonthEndPipelineCore,
  runWeeklySummaryPipelineCore,
} from "@ibo/pipelines";
import { getAllAdapters } from "./adapters";
import { isFreeDataSyncEnabled, runFreePostCloseSync, runFreePreMarketSync } from "./ingestion/free-mode";

/**
 * Worker CLI entry point.
 *
 * Usage:
 *   tsx src/index.ts <pipeline>
 *
 * Pipelines:
 *   pre-market      — Global cues fetch, FII/DII, market context scoring, digest (8:30 AM IST)
 *   post-close      — EOD candles, indicators, strategy eval, screener eval, confluence, digest (4:30 PM IST)
 *   month-end       — Monthly BB scan, MBB opportunities, investment digest (last trading day 5:00 PM IST)
 *   weekly         — Weekly summary digest generation
 *   provider-health — Health check all enabled data providers
 *   all             — Run pre-market + post-close + month-end + weekly sequentially
 *
 * Examples:
 *   tsx src/index.ts pre-market
 *   tsx src/index.ts post-close
 *   tsx src/index.ts month-end
 *   tsx src/index.ts all
 */

const VALID_PIPELINES = ["pre-market", "post-close", "month-end", "weekly", "provider-health", "all"] as const;
type PipelineName = (typeof VALID_PIPELINES)[number];

async function main() {
  const args = process.argv.slice(2);
  const pipeline = args[0] as PipelineName | undefined;
  const isWatchDev =
    process.env.WORKER_DEV_KEEPALIVE === "1" ||
    process.env.TSX_WATCH === "true" ||
    process.env.TSX_WATCH === "1";

  if (!pipeline || !VALID_PIPELINES.includes(pipeline)) {
    console.log("IBO Worker — Pipeline Runner\n");
    console.log("Usage: tsx src/index.ts <pipeline>\n");
    console.log("Available pipelines:");
    console.log("  pre-market      Global cues + FII/DII + market context + pre-market digest");
    console.log("  post-close      EOD candles + indicators + strategy/screener eval + digest");
    console.log("  month-end       Monthly BB scan + MBB + investment strategy eval + digest");
    console.log("  weekly          Weekly summary digest (week-end)");
    console.log("  provider-health Health check all configured data providers");
    console.log("  all             Run all pipelines sequentially");
    console.log("\nExamples:");
    console.log("  tsx src/index.ts post-close");
    console.log("  tsx src/index.ts all");

    if (pipeline && !VALID_PIPELINES.includes(pipeline)) {
      console.error(`\nError: Unknown pipeline "${pipeline}".`);
      process.exit(1);
    }

    if (isWatchDev && !pipeline) {
      console.log(
        "\n[worker:dev] No pipeline argument provided. Keeping worker alive for monorepo dev.\n" +
          "Run a pipeline manually when needed, e.g.:\n" +
          "  pnpm --filter @ibo/worker start post-close\n",
      );
      await new Promise(() => undefined);
      return;
    }

    process.exit(0);
  }

  const startTime = Date.now();
  console.log(`\n${"=".repeat(60)}`);
  console.log(`IBO Worker — ${pipeline.toUpperCase()}`);
  console.log(`Started: ${new Date().toISOString()}`);
  console.log(`${"=".repeat(60)}\n`);

  try {
    switch (pipeline) {
      case "pre-market":
        if (isFreeDataSyncEnabled()) {
          console.log("[pre-market] Running free data sync...");
          const sync = await runFreePreMarketSync();
          console.log(
            `[pre-market] free sync done: quotes=${sync.counts.quoteSnapshots}, fiiDii=${sync.counts.fiiDiiRows}, breadth=${sync.counts.breadthRows}, warnings=${sync.warnings.length}`,
          );
        }
        await runPreMarketPipelineCore();
        break;

      case "post-close":
        if (isFreeDataSyncEnabled()) {
          console.log("[post-close] Running free data sync...");
          const sync = await runFreePostCloseSync();
          console.log(
            `[post-close] free sync done: quotes=${sync.counts.quoteSnapshots}, candles=${sync.counts.candleRows}, covered=${sync.counts.candleSymbolsCovered}, missing=${sync.counts.candleSymbolsMissing}, warnings=${sync.warnings.length}`,
          );
        }
        await runPostClosePipelineCore();
        break;

      case "month-end":
        await runMonthEndPipelineCore();
        break;

      case "weekly":
        await runWeeklySummaryPipelineCore();
        break;

      case "provider-health":
        await runProviderHealthCheck();
        break;

      case "all":
        console.log("[all] Running all pipelines sequentially...\n");
        console.log("--- PRE-MARKET ---");
        if (isFreeDataSyncEnabled()) {
          const preSync = await runFreePreMarketSync();
          console.log(
            `[all] pre-market free sync: quotes=${preSync.counts.quoteSnapshots}, warnings=${preSync.warnings.length}`,
          );
        }
        await runPreMarketPipelineCore();
        console.log("\n--- POST-CLOSE ---");
        if (isFreeDataSyncEnabled()) {
          const postSync = await runFreePostCloseSync();
          console.log(
            `[all] post-close free sync: candles=${postSync.counts.candleRows}, covered=${postSync.counts.candleSymbolsCovered}, missing=${postSync.counts.candleSymbolsMissing}, warnings=${postSync.warnings.length}`,
          );
        }
        await runPostClosePipelineCore();
        console.log("\n--- MONTH-END ---");
        await runMonthEndPipelineCore();
        console.log("\n--- WEEKLY ---");
        await runWeeklySummaryPipelineCore();
        console.log("\n[all] All pipelines complete.");
        break;
    }

    const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
    console.log(`\n${"=".repeat(60)}`);
    console.log(`Pipeline "${pipeline}" completed in ${elapsed}s`);
    console.log(`${"=".repeat(60)}\n`);
  } catch (err) {
    const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
    console.error(`\n${"=".repeat(60)}`);
    console.error(`Pipeline "${pipeline}" FAILED after ${elapsed}s`);
    console.error(err instanceof Error ? err.message : err);
    if (err instanceof Error && err.stack) {
      console.error(err.stack);
    }
    console.error(`${"=".repeat(60)}\n`);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

/**
 * Health check all configured data providers.
 */
async function runProviderHealthCheck() {
  console.log("[provider-health] Checking all adapters...\n");

  const adapters = getAllAdapters();

  if (adapters.length === 0) {
    console.warn("[provider-health] No adapters configured.");
    return;
  }

  const results = await Promise.allSettled(
    adapters.map(async (adapter) => {
      const name = (adapter as { name?: string }).name ?? "unknown";
      const key = (adapter as { key?: string }).key ?? "unknown";
      console.log(`  Checking ${name} (${key})...`);

      try {
        const health = await adapter.healthcheck();
        return { key, name, ...health };
      } catch (err) {
        return {
          key,
          name,
          healthy: false,
          latencyMs: 0,
          lastChecked: new Date(),
          error: err instanceof Error ? err.message : "Unknown error",
        };
      }
    }),
  );

  console.log("\n--- Health Check Results ---\n");

  for (const result of results) {
    if (result.status === "fulfilled") {
      const r = result.value;
      const status = r.healthy ? "OK" : "FAIL";
      const latency = r.latencyMs ? `${r.latencyMs}ms` : "N/A";
      console.log(`  [${status}] ${r.name} (${r.key}) — ${latency}`);
      if (!r.healthy && r.error) {
        console.log(`         Error: ${r.error}`);
      }
    } else {
      console.log(`  [ERROR] Check failed: ${result.reason}`);
    }
  }

  const healthyCount = results.filter(
    (r) => r.status === "fulfilled" && r.value.healthy,
  ).length;

  console.log(
    `\n${healthyCount}/${results.length} providers healthy.`,
  );
}

// Run
main();
