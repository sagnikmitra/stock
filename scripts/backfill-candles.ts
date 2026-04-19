/**
 * Backfill NSE candles end-to-end.
 *
 * Steps:
 *   1. Discover universe via latest NSE bhavcopy (or DB if already populated).
 *   2. Backfill N years of daily candles per symbol via Yahoo Finance.
 *   3. Overlay today's bhavcopy (delivery % enrichment) if published.
 *
 * Usage:
 *   pnpm tsx scripts/backfill-candles.ts                      # 2 years, all symbols
 *   BACKFILL_YEARS=3 pnpm tsx scripts/backfill-candles.ts     # 3 years
 *   BACKFILL_LIMIT=50 pnpm tsx scripts/backfill-candles.ts    # first 50 symbols
 *   BACKFILL_SKIP_YAHOO=1 pnpm tsx scripts/backfill-candles.ts  # only bhavcopy today
 */
import { prisma } from "@ibo/db";
import { NseBhavcopyAdapter } from "../apps/worker/src/adapters/nse-bhavcopy";
import { YahooFinanceAdapter } from "../apps/worker/src/adapters/yahoo-finance";
import {
  backfillYahooSymbol,
  ensureInstrument,
  ingestBhavcopyForDate,
  writeBhavcopyCandles,
} from "../apps/worker/src/ingestion/candles";

const YEARS = Number(process.env.BACKFILL_YEARS ?? "2");
const SYMBOL_LIMIT = Number(process.env.BACKFILL_LIMIT ?? "0"); // 0 = no cap
const CONCURRENCY = Number(process.env.BACKFILL_CONCURRENCY ?? "6");
const SKIP_YAHOO = ["1", "true", "yes"].includes((process.env.BACKFILL_SKIP_YAHOO ?? "").toLowerCase());
const SKIP_BHAVCOPY = ["1", "true", "yes"].includes((process.env.BACKFILL_SKIP_BHAVCOPY ?? "").toLowerCase());

async function discoverUniverse(): Promise<string[]> {
  console.log("🔎 Discovering NSE universe from latest bhavcopy...");
  const adapter = new NseBhavcopyAdapter();
  const today = new Date().toISOString().slice(0, 10);
  const rows = await adapter.findMostRecentBhavcopy(today, 10);
  if (!rows || rows.length === 0) {
    console.warn("⚠️  No bhavcopy found; falling back to existing Instrument rows.");
    const existing = await prisma.instrument.findMany({
      where: { isActive: true },
      select: { symbol: true },
      orderBy: { symbol: "asc" },
    });
    return existing.map((i) => i.symbol);
  }

  console.log(`   found ${rows.length} rows; writing today's candles + instruments.`);
  const { written, instrumentsCreated } = await writeBhavcopyCandles(rows);
  console.log(`   wrote ${written} candles, created ${instrumentsCreated} new instruments.`);
  const symbols = Array.from(new Set(rows.map((r) => r.symbol))).sort();
  return symbols;
}

async function backfillHistory(symbols: string[]): Promise<void> {
  const yf = new YahooFinanceAdapter();
  const to = new Date();
  const from = new Date(to);
  from.setUTCFullYear(from.getUTCFullYear() - YEARS);
  const toIso = to.toISOString().slice(0, 10);
  const fromIso = from.toISOString().slice(0, 10);

  console.log(`📈 Backfilling ${symbols.length} symbols for ${YEARS}y (${fromIso} → ${toIso})`);

  let done = 0;
  let rows = 0;
  let failures = 0;

  for (let i = 0; i < symbols.length; i += CONCURRENCY) {
    const batch = symbols.slice(i, i + CONCURRENCY);
    const results = await Promise.all(
      batch.map(async (sym) => {
        try {
          await ensureInstrument(sym, sym);
          const n = await backfillYahooSymbol(sym, fromIso, toIso, yf);
          return { sym, ok: true, n };
        } catch (e) {
          return { sym, ok: false, n: 0, err: e instanceof Error ? e.message : String(e) };
        }
      }),
    );
    for (const r of results) {
      done++;
      if (r.ok) rows += r.n;
      else failures++;
    }
    const pct = Math.round((done / symbols.length) * 100);
    process.stdout.write(`\r   progress: ${done}/${symbols.length} (${pct}%)  rows=${rows}  fail=${failures}   `);
  }
  process.stdout.write("\n");
  console.log(`✅ Historical backfill complete: ${rows} rows, ${failures} failures.`);
}

async function main() {
  const universe = await discoverUniverse();
  const symbols = SYMBOL_LIMIT > 0 ? universe.slice(0, SYMBOL_LIMIT) : universe;
  console.log(`🌐 Universe size: ${symbols.length}${SYMBOL_LIMIT ? ` (capped at ${SYMBOL_LIMIT})` : ""}`);

  if (!SKIP_YAHOO) {
    await backfillHistory(symbols);
  } else {
    console.log("⏭  Skipping Yahoo historical backfill (BACKFILL_SKIP_YAHOO=1).");
  }

  if (!SKIP_BHAVCOPY) {
    const today = new Date().toISOString().slice(0, 10);
    console.log(`📥 Ingesting today's bhavcopy (${today}) for delivery % enrichment...`);
    const res = await ingestBhavcopyForDate(today);
    if (res) {
      console.log(`   wrote ${res.written} rows from bhavcopy ${res.date}.`);
    } else {
      console.log("   today's bhavcopy not yet published (404).");
    }
  }

  await prisma.$disconnect();
  console.log("🎉 Done.");
}

main().catch(async (e) => {
  console.error(e);
  await prisma.$disconnect();
  process.exit(1);
});
