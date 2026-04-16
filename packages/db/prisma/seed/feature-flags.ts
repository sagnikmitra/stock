import type { PrismaClient } from "@prisma/client";

const flags = [
  { key: "backtest_engine", name: "Backtest Engine", isEnabled: false, notes: "Event replay and batch historical backtesting. Enable after strategy-engine is production-ready." },
  { key: "alerts", name: "Alert Rules & Notifications", isEnabled: false, notes: "Price/indicator alert system. Requires provider integration for real-time data." },
  { key: "holdings_tracker", name: "Holdings Tracker", isEnabled: false, notes: "Track buy/sell entries, current holdings, PnL. Depends on broker API integration." },
  { key: "mutual_fund_discovery", name: "Mutual Fund Discovery", isEnabled: false, notes: "Overlap analysis with holdings. Show which MFs hold stocks you're tracking." },
  { key: "admin_rule_editor", name: "Admin Rule Editor", isEnabled: false, notes: "Visual DSL editor for strategy and screener rules. Complex UI — build after core is stable." },
  { key: "digest_pre_market", name: "Pre-Market Digest", isEnabled: true, notes: "Daily pre-market digest with GIFT Nifty, global cues, FII/DII. Core feature." },
  { key: "digest_post_close", name: "Post-Close Digest", isEnabled: true, notes: "Daily post-close summary with strategy matches and market breadth." },
  { key: "digest_month_end", name: "Month-End Digest", isEnabled: true, notes: "Monthly BB screener run and investment review." },
  { key: "screener_intersection", name: "Screener Intersection Engine", isEnabled: true, notes: "Confluence scoring across multiple screeners. Core feature." },
  { key: "knowledge_hub", name: "Knowledge Hub / Learning", isEnabled: true, notes: "Course sessions, concepts, indicators, glossary. Read-only reference." },
  { key: "market_context_scoring", name: "Market Context Scoring", isEnabled: true, notes: "Global cues scoring engine. Favorable / Mixed / Hostile posture." },
  { key: "position_size_calculator", name: "Position Size Calculator", isEnabled: true, notes: "2% risk rule calculator. Pure computation, no external dependencies." },
  { key: "journal", name: "Trade Journal", isEnabled: false, notes: "Personal trade journaling with screenshot attachments and reflection prompts." },
  { key: "watchlist", name: "Watchlists", isEnabled: true, notes: "Custom watchlists with tagging. No provider dependency." },
];

export async function seedFeatureFlags(prisma: PrismaClient) {
  console.log("  🚩 Seeding feature flags...");

  for (const f of flags) {
    await prisma.featureFlag.upsert({
      where: { key: f.key },
      update: { name: f.name, isEnabled: f.isEnabled, notes: f.notes },
      create: f,
    });
  }
}
