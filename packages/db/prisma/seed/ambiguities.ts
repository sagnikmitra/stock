import type { PrismaClient } from "@prisma/client";

const ambiguities = [
  {
    key: "bb_monthly_price_threshold",
    strategyKey: "investment_bb_monthly",
    rawNote: "Price > 50 in handwritten notes (Session 6 raw note)",
    normalizedNote: "Price >= 100 in session summary / normalized version. Using >= 100 as active threshold.",
    sourcePreference: "session_summary",
    severity: "high" as const,
    uiBehavior: "show_warning_badge",
  },
  {
    key: "bb_monthly_rsi_threshold",
    strategyKey: "investment_bb_monthly",
    rawNote: "RSI > 55 in handwritten notes",
    normalizedNote: "RSI >= 50 in session summary / normalized version. Using >= 50 as active threshold.",
    sourcePreference: "session_summary",
    severity: "high" as const,
    uiBehavior: "show_warning_badge",
  },
  {
    key: "swing_rsi_shorthand",
    strategyKey: null,
    rawNote: "Some notes reference 'RSI strong' or 'RSI supportive' without exact threshold",
    normalizedNote: "Normalized to RSI > 55 for swing strategies (Session 5 context). RSI > 50 for investment strategies.",
    sourcePreference: "derived_from_session_context",
    severity: "medium" as const,
    uiBehavior: "show_info_badge",
  },
  {
    key: "sma_44_exact_touch",
    strategyKey: "swing_sma_44",
    rawNote: "Notes say 'price at 44 SMA' — unclear if exact touch or within a zone",
    normalizedNote: "Normalized as low <= SMA 44 AND close >= SMA 44 (wick touch with close above). Treating as zone within 1-2% tolerance.",
    sourcePreference: "derived_from_session_context",
    severity: "low" as const,
    uiBehavior: "show_info_badge",
  },
  {
    key: "breakout_volume_multiplier",
    strategyKey: "swing_breakout",
    rawNote: "Session 7 notes say 'volume spike' without exact threshold",
    normalizedNote: "Normalized to volume > 1.5x 20-day average based on Arindam's general guidance. Some instances suggest 2x.",
    sourcePreference: "session_summary",
    severity: "medium" as const,
    uiBehavior: "show_info_badge",
  },
  {
    key: "abc_fib_level",
    strategyKey: "swing_abc",
    rawNote: "Notes reference Fibonacci support without specifying exact level for C-wave completion",
    normalizedNote: "Normalized to 61.8% retracement as primary, 50% as secondary. Based on classical ABC correction theory mentioned in Session 7.",
    sourcePreference: "derived_from_session_context",
    severity: "medium" as const,
    uiBehavior: "show_info_badge",
  },
  {
    key: "btst_sell_timing",
    strategyKey: "swing_btst",
    rawNote: "BTST exit: 'sell next day' — at open? first 15 min? or anytime next day?",
    normalizedNote: "Normalized to: sell at next day open or within first 15-minute candle high. Do not hold beyond T+1 close.",
    sourcePreference: "session_summary",
    severity: "medium" as const,
    uiBehavior: "show_warning_badge",
  },
  {
    key: "market_context_fii_threshold",
    strategyKey: "market_context_engine",
    rawNote: "FII net buy threshold: notes mention both 'positive' and '500 Cr' as favorable",
    normalizedNote: "Using FII net buy > ₹500 Cr as favorable threshold. Net positive but < ₹500 Cr = neutral contribution to score.",
    sourcePreference: "session_summary",
    severity: "low" as const,
    uiBehavior: "show_info_badge",
  },
];

export async function seedAmbiguities(prisma: PrismaClient) {
  console.log("  ⚠️  Seeding ambiguities...");

  for (const a of ambiguities) {
    const strategy = a.strategyKey
      ? await prisma.strategy.findUnique({ where: { key: a.strategyKey } })
      : null;

    await prisma.ambiguityRecord.upsert({
      where: { key: a.key },
      update: {
        rawNote: a.rawNote,
        normalizedNote: a.normalizedNote,
        severity: a.severity,
        uiBehavior: a.uiBehavior,
      },
      create: {
        key: a.key,
        strategyId: strategy?.id ?? null,
        rawNote: a.rawNote,
        normalizedNote: a.normalizedNote,
        sourcePreference: a.sourcePreference,
        severity: a.severity,
        uiBehavior: a.uiBehavior,
      },
    });
  }
}
