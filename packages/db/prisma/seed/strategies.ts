import type { PrismaClient } from "@prisma/client";

interface StrategySeed {
  key: string;
  name: string;
  family: "investment" | "swing" | "market_context" | "risk_foundation" | "knowledge_only";
  status: "active" | "draft" | "experimental";
  description: string;
  reviewFrequency: string;
  primaryTimeframe: "D1" | "H4" | "MN1" | "W1";
  secondaryTimeframe?: "D1" | "H4" | "MN1" | "W1";
  confidence: "low" | "medium" | "high";
  versions: {
    version: number;
    isActive: boolean;
    sourceSessions: string;
    implementationNotes?: string;
    normalizedDsl: Record<string, unknown>;
    rules: {
      key: string;
      label: string;
      kind: "hard" | "soft" | "ambiguity" | "informational";
      description: string;
      sortOrder: number;
    }[];
  }[];
}

const strategies: StrategySeed[] = [
  // =========================================================================
  // 1. BB Monthly Breakout — Session 6
  // =========================================================================
  {
    key: "investment_bb_monthly",
    name: "Monthly Bollinger Band Breakout",
    family: "investment",
    status: "active",
    description:
      "Systematic monthly investment strategy. Identifies stocks where the monthly high crosses the upper Bollinger Band with supporting price, volume, and RSI filters. Evaluate only on the last trading day of the month. Entry at 1% above trigger. Trail using Super Trend.",
    reviewFrequency: "month_end",
    primaryTimeframe: "MN1",
    secondaryTimeframe: "D1",
    confidence: "medium",
    versions: [
      {
        version: 1,
        isActive: false,
        sourceSessions: "6",
        implementationNotes: "Raw handwritten note version — thresholds may be miscopied",
        normalizedDsl: {
          key: "investment_bb_monthly",
          family: "investment",
          reviewFrequency: "month_end",
          primaryTimeframe: "MN1",
          secondaryTimeframe: "D1",
          canonicalVersionTag: "bb-monthly-breakout.v1.raw-note",
          filters: [
            { field: "daily.close", operator: ">=", value: 50, kind: "hard", label: "Price filter (raw note)" },
            { field: "daily.volume", operator: ">=", value: 100000, kind: "hard", label: "Volume filter" },
            { field: "monthly.rsi14", operator: ">=", value: 55, kind: "hard", label: "Monthly RSI (raw note)" },
            { field: "monthly.high", operator: ">", valueRef: "monthly.bbUpper", kind: "hard", label: "Monthly high > upper BB" },
          ],
          entry: { type: "buffer_above_trigger", bufferPct: 1, triggerRef: "monthly.high" },
          stopLoss: { type: "recent_swing_low", timeframe: "D1", lookbackBars: 20 },
          exit: { type: "supertrend_flip", timeframe: "D1" },
        },
        rules: [
          { key: "price_filter", label: "Price > 50 (raw)", kind: "ambiguity", description: "Handwritten note shows price > 50. Normalized version uses >= 100.", sortOrder: 1 },
          { key: "volume_filter", label: "Volume >= 1 lakh", kind: "hard", description: "Daily traded volume must exceed 1,00,000 shares to ensure liquidity.", sortOrder: 2 },
          { key: "monthly_rsi", label: "Monthly RSI > 55 (raw)", kind: "ambiguity", description: "Handwritten note shows RSI > 55. Normalized version uses >= 50.", sortOrder: 3 },
          { key: "bb_cross", label: "Monthly high crosses upper BB", kind: "hard", description: "Monthly candle high must exceed the upper Bollinger Band.", sortOrder: 4 },
        ],
      },
      {
        version: 2,
        isActive: true,
        sourceSessions: "6",
        implementationNotes: "Normalized active version based on cleaned session summary",
        normalizedDsl: {
          key: "investment_bb_monthly",
          family: "investment",
          reviewFrequency: "month_end",
          primaryTimeframe: "MN1",
          secondaryTimeframe: "D1",
          canonicalVersionTag: "bb-monthly-breakout.v2.normalized-active",
          filters: [
            { field: "daily.close", operator: ">=", value: 100, kind: "hard", label: "Price filter" },
            { field: "daily.volume", operator: ">=", value: 100000, kind: "hard", label: "Volume filter" },
            { field: "monthly.rsi14", operator: ">=", value: 50, kind: "hard", label: "Monthly RSI positive zone" },
            { field: "monthly.high", operator: ">", valueRef: "monthly.bbUpper", kind: "hard", label: "Monthly high > upper BB" },
          ],
          entry: { type: "buffer_above_trigger", bufferPct: 1, triggerRef: "monthly.high" },
          stopLoss: { type: "recent_swing_low", timeframe: "D1", lookbackBars: 20 },
          exit: { type: "supertrend_flip", timeframe: "D1" },
        },
        rules: [
          { key: "price_filter", label: "Price >= 100", kind: "hard", description: "Daily close must be at least ₹100 to eliminate penny stock noise.", sortOrder: 1 },
          { key: "volume_filter", label: "Volume >= 1 lakh", kind: "hard", description: "Daily traded volume must exceed 1,00,000 shares to ensure liquidity.", sortOrder: 2 },
          { key: "monthly_rsi", label: "Monthly RSI >= 50", kind: "hard", description: "Monthly RSI must be in positive momentum zone (>= 50).", sortOrder: 3 },
          { key: "bb_cross", label: "Monthly high crosses upper BB", kind: "hard", description: "Monthly candle high must exceed the upper Bollinger Band, signaling expansion.", sortOrder: 4 },
          { key: "month_end_eval", label: "Evaluate at month end only", kind: "hard", description: "Only evaluate after monthly candle is complete. No mid-month entries.", sortOrder: 5 },
          { key: "entry_buffer", label: "Enter 1% above trigger", kind: "hard", description: "Entry price = trigger level + 1% buffer to avoid false pokes.", sortOrder: 6 },
          { key: "stop_loss", label: "Stop at daily swing low", kind: "hard", description: "Stop-loss at recent daily swing low. Monthly defines setup, daily defines risk.", sortOrder: 7 },
          { key: "trail_supertrend", label: "Trail via Super Trend", kind: "hard", description: "Hold while Super Trend remains bullish. Exit on decisive flip.", sortOrder: 8 },
        ],
      },
    ],
  },

  // =========================================================================
  // 2. Multi-Bagger Breakout — Session 6
  // =========================================================================
  {
    key: "investment_mbb",
    name: "Multi-Bagger Breakout",
    family: "investment",
    status: "active",
    description:
      "Identifies stocks with multi-year sideways consolidation attempting a structural breakout on the monthly chart. Semi-heuristic — requires manual review. Look for long dead periods followed by range-breaking monthly closes.",
    reviewFrequency: "month_end",
    primaryTimeframe: "MN1",
    confidence: "medium",
    versions: [
      {
        version: 1,
        isActive: true,
        sourceSessions: "6",
        implementationNotes: "Heuristic strategy — automated detection is approximate. Always needs manual chart review.",
        normalizedDsl: {
          key: "investment_mbb",
          family: "investment",
          reviewFrequency: "month_end",
          primaryTimeframe: "MN1",
          canonicalVersionTag: "mbb.v1.heuristic",
          filters: [
            { field: "derived.longConsolidationDetected", operator: "==", value: true, kind: "hard", label: "Multi-year consolidation" },
            { field: "monthly.close", operator: ">", valueRef: "derived.consolidationCeiling", kind: "hard", label: "Monthly close above ceiling" },
            { field: "monthly.rsi14", operator: ">=", value: 50, kind: "soft", label: "RSI momentum support" },
          ],
          entry: { type: "confirmation_close" },
          stopLoss: { type: "structure_based" },
        },
        rules: [
          { key: "long_base", label: "Multi-year consolidation detected", kind: "hard", description: "Stock must show extended sideways/dead period (years, not weeks). IPOs 3-4 years or older that stayed in a range.", sortOrder: 1 },
          { key: "ceiling_break", label: "Monthly close above range ceiling", kind: "hard", description: "Price must close decisively above the highest point of the consolidation range on a monthly candle.", sortOrder: 2 },
          { key: "rsi_support", label: "RSI momentum confirmation", kind: "soft", description: "Monthly RSI should support the breakout direction. Not a hard gate but strengthens conviction.", sortOrder: 3 },
          { key: "manual_review", label: "Manual chart review required", kind: "informational", description: "This strategy is semi-heuristic. Automated detection surfaces candidates; human must confirm.", sortOrder: 4 },
        ],
      },
    ],
  },

  // =========================================================================
  // 3. Buying in the Dips — Session 7
  // =========================================================================
  {
    key: "swing_buying_the_dips",
    name: "Buying in the Dips",
    family: "swing",
    status: "active",
    description:
      "Buy controlled daily pullbacks in stocks with strong monthly momentum. Monthly RSI >= 60 confirms broad strength; daily chart provides the tactical dip entry. Trail via daily structure. Align with Nifty.",
    reviewFrequency: "daily",
    primaryTimeframe: "D1",
    secondaryTimeframe: "MN1",
    confidence: "high",
    versions: [
      {
        version: 0,
        isActive: false,
        sourceSessions: "7",
        implementationNotes:
          "Shorthand RSI variant from notes. Stored for ambiguity/reference; not default active profile.",
        normalizedDsl: {
          key: "swing_buying_the_dips",
          family: "swing",
          reviewFrequency: "daily",
          primaryTimeframe: "D1",
          secondaryTimeframe: "MN1",
          canonicalVersionTag: "buying-in-dips.v0.shorthand-rsi",
          filters: [
            { field: "daily.rsi14", operator: "<=", value: 40, kind: "hard", label: "Daily RSI <= 40 entry zone" },
          ],
          entry: { type: "confirmation_close" },
          stopLoss: { type: "recent_swing_low", timeframe: "D1", lookbackBars: 10 },
          exit: { type: "rsi_threshold", params: { threshold: 60, direction: "above" } },
          niftyAlignmentRequired: true,
        },
        rules: [
          { key: "rsi_entry_zone", label: "Daily RSI <= 40", kind: "ambiguity", description: "Shorthand entry interpretation in notes. Lower confidence than canonical variant.", sortOrder: 1 },
          { key: "rsi_exit_zone", label: "Daily RSI >= 60 exit", kind: "ambiguity", description: "Shorthand exit interpretation in notes. Stored as reference only.", sortOrder: 2 },
          { key: "nifty_alignment", label: "Nifty alignment required", kind: "hard", description: "Avoid longs when broader market is structurally hostile.", sortOrder: 3 },
        ],
      },
      {
        version: 1,
        isActive: true,
        sourceSessions: "7",
        implementationNotes: "Canonical version from session summary. Shorthand RSI<40/>60 variant stored separately as v0.",
        normalizedDsl: {
          key: "swing_buying_the_dips",
          family: "swing",
          reviewFrequency: "daily",
          primaryTimeframe: "D1",
          secondaryTimeframe: "MN1",
          canonicalVersionTag: "buying-in-dips.v1.canonical",
          filters: [
            { field: "monthly.rsi14", operator: ">=", value: 60, kind: "hard", label: "Monthly RSI >= 60" },
            { field: "derived.dailyDipInUptrend", operator: "==", value: true, kind: "hard", label: "Controlled dip in uptrend" },
            { field: "derived.bullishResolution", operator: "==", value: true, kind: "hard", label: "Bullish resolution of dip" },
          ],
          entry: { type: "confirmation_close" },
          stopLoss: { type: "recent_swing_low", timeframe: "D1", lookbackBars: 15 },
          niftyAlignmentRequired: true,
        },
        rules: [
          { key: "monthly_rsi", label: "Monthly RSI >= 60", kind: "hard", description: "Stock must already have strong monthly momentum. This is the higher-timeframe pre-filter.", sortOrder: 1 },
          { key: "daily_dip", label: "Visible daily dip in uptrend", kind: "hard", description: "On the daily chart, wait for a controlled pullback within the ongoing uptrend. Do not chase.", sortOrder: 2 },
          { key: "bullish_resolution", label: "Dip resolves upward", kind: "hard", description: "Enter when the dip starts reversing — bullish candle resuming the uptrend.", sortOrder: 3 },
          { key: "stop_loss", label: "Stop at daily swing low", kind: "hard", description: "Stop-loss placed at the recent daily swing low for structural risk control.", sortOrder: 4 },
          { key: "nifty_alignment", label: "Nifty must not be hostile", kind: "hard", description: "Do not force long swing trades if Nifty is trending down. Nifty = king of jungle.", sortOrder: 5 },
          { key: "trail", label: "Trail via daily structure", kind: "soft", description: "As higher lows form, trail stop-loss upward. Tolerate normal noise.", sortOrder: 6 },
        ],
      },
    ],
  },

  // =========================================================================
  // 4. Cross Strategy — Session 7
  // =========================================================================
  {
    key: "swing_cross",
    name: "Cross Strategy",
    family: "swing",
    status: "active",
    description:
      "Daily reversal-in-strength setup. Requires lower Bollinger Band touch, downward trendline break upward, VWAP reclaim, and green candle. +1% entry buffer. Not valid in primary downtrends.",
    reviewFrequency: "daily",
    primaryTimeframe: "D1",
    confidence: "high",
    versions: [
      {
        version: 1,
        isActive: true,
        sourceSessions: "7",
        normalizedDsl: {
          key: "swing_cross",
          family: "swing",
          reviewFrequency: "daily",
          primaryTimeframe: "D1",
          canonicalVersionTag: "cross-strategy.v1.canonical",
          filters: [
            { field: "derived.lowerBbTouch", operator: "==", value: true, kind: "hard", label: "Lower BB touch" },
            { field: "derived.trendlineBreakUp", operator: "==", value: true, kind: "hard", label: "Trendline break upward" },
            { field: "daily.close", operator: ">", valueRef: "daily.vwap", kind: "hard", label: "Close above VWAP" },
            { field: "daily.candleColor", operator: "==", value: "green", kind: "hard", label: "Green confirmation candle" },
            { field: "derived.primaryTrendNotBearish", operator: "==", value: true, kind: "hard", label: "Not in primary downtrend" },
          ],
          entry: { type: "buffer_above_close", bufferPct: 1 },
          stopLoss: { type: "recent_swing_low", timeframe: "D1", lookbackBars: 15 },
          niftyAlignmentRequired: true,
        },
        rules: [
          { key: "lower_bb_touch", label: "Lower Bollinger Band touch", kind: "hard", description: "Price must touch or pierce the lower BB — indicates short-term weakness.", sortOrder: 1 },
          { key: "trendline_break", label: "Downtrend line broken upward", kind: "hard", description: "A drawn downtrend line across recent lower highs must be broken upward by price.", sortOrder: 2 },
          { key: "vwap_cross", label: "Close above VWAP", kind: "hard", description: "Price must reclaim VWAP — adds confirmation that strength is returning.", sortOrder: 3 },
          { key: "green_candle", label: "Green daily candle", kind: "hard", description: "Confirming bullish candle required as part of the reversal structure.", sortOrder: 4 },
          { key: "not_downtrend", label: "Primary trend not bearish", kind: "hard", description: "Reject if the broader stock structure is clearly bearish. Lower BB should be rising or flat, not falling.", sortOrder: 5 },
          { key: "entry_buffer", label: "+1% above close", kind: "hard", description: "Enter at 1% above the trigger candle close to reduce false entries.", sortOrder: 6 },
        ],
      },
    ],
  },

  // =========================================================================
  // 5. ABC Strategy — Session 8
  // =========================================================================
  {
    key: "swing_abc",
    name: "ABC Strategy",
    family: "swing",
    status: "active",
    description:
      "Daily reversal/recovery swing setup. A = 50 SMA, B = lower Bollinger Band interaction, C = green confirmation candle. Requires market context support.",
    reviewFrequency: "daily",
    primaryTimeframe: "D1",
    confidence: "high",
    versions: [
      {
        version: 1,
        isActive: true,
        sourceSessions: "8",
        normalizedDsl: {
          key: "swing_abc",
          family: "swing",
          reviewFrequency: "daily",
          primaryTimeframe: "D1",
          canonicalVersionTag: "abc-strategy.v1.canonical",
          filters: [
            { field: "derived.nearSma50", operator: "==", value: true, kind: "hard", label: "A: Near 50 SMA" },
            { field: "derived.lowerBbInteraction", operator: "==", value: true, kind: "hard", label: "B: Lower BB touch/pierce" },
            { field: "daily.candleColor", operator: "==", value: "green", kind: "hard", label: "C: Green candle" },
          ],
          entry: { type: "buffer_above_trigger", bufferPct: 1 },
          stopLoss: { type: "recent_swing_low", timeframe: "D1" },
          exit: { type: "ma_cross_below", params: { ma: "sma50" } },
          marketContextRequired: true,
          niftyAlignmentRequired: true,
        },
        rules: [
          { key: "sma50", label: "A — 50 SMA interaction", kind: "hard", description: "Stock price interacts with the 50-day SMA. Recovery or reclaim from this level.", sortOrder: 1 },
          { key: "lower_bb", label: "B — Lower BB touch/pierce", kind: "hard", description: "Price touches or pierces the lower Bollinger Band, indicating temporary oversold pressure.", sortOrder: 2 },
          { key: "green_candle", label: "C — Green confirmation candle", kind: "hard", description: "Strong bullish daily candle that reclaims structure. This is the actual confirmation event.", sortOrder: 3 },
          { key: "entry_buffer", label: "+1% above trigger", kind: "hard", description: "Enter at 1% above the trigger candle to avoid premature entries.", sortOrder: 4 },
          { key: "context", label: "Market context support", kind: "hard", description: "Nifty should not be hostile. FII flow should not strongly contradict.", sortOrder: 5 },
          { key: "trail_sma50", label: "Trail using 50 SMA", kind: "hard", description: "Hold while price remains above 50 SMA. Exit on decisive daily close below it.", sortOrder: 6 },
        ],
      },
    ],
  },

  // =========================================================================
  // 6. Breakout Strategy — Session 9
  // =========================================================================
  {
    key: "swing_breakout",
    name: "Breakout Strategy",
    family: "swing",
    status: "active",
    description:
      "Validated daily breakout with participation confirmation. Big green candle, body >= 70%, volume expansion, delivery above threshold, close >= 1% above resistance.",
    reviewFrequency: "daily",
    primaryTimeframe: "D1",
    confidence: "high",
    versions: [
      {
        version: 1,
        isActive: true,
        sourceSessions: "9",
        normalizedDsl: {
          key: "swing_breakout",
          family: "swing",
          reviewFrequency: "daily",
          primaryTimeframe: "D1",
          canonicalVersionTag: "breakout.v1.canonical",
          filters: [
            { field: "daily.candleColor", operator: "==", value: "green", kind: "hard", label: "Big green candle" },
            { field: "derived.candleBodyPct", operator: ">=", value: 70, kind: "hard", label: "Body >= 70% of range" },
            { field: "daily.volume", operator: ">", valueRef: "derived.prevDayVolume", kind: "hard", label: "Volume > prior day" },
            { field: "daily.deliveryPct", operator: ">=", value: 35, kind: "hard", label: "Delivery >= 35%" },
            { field: "derived.closeAboveResistancePct", operator: ">=", value: 1, kind: "hard", label: "Close >= 1% above resistance" },
          ],
          entry: { type: "next_day_open" },
          stopLoss: { type: "recent_swing_low", timeframe: "D1" },
          marketContextRequired: true,
        },
        rules: [
          { key: "green_candle", label: "Big green candle", kind: "hard", description: "The breakout candle must be visibly stronger than surrounding candles.", sortOrder: 1 },
          { key: "body_pct", label: "Body >= 70% of range", kind: "hard", description: "Low wick rejection implies cleaner directional conviction.", sortOrder: 2 },
          { key: "volume", label: "Volume > previous day", kind: "hard", description: "Breakout must be supported by higher participation.", sortOrder: 3 },
          { key: "delivery", label: "Delivery % >= 35-45%", kind: "hard", description: "Separates genuine investor participation from pure intraday churn.", sortOrder: 4 },
          { key: "resistance_clear", label: "Close >= 1% above resistance", kind: "hard", description: "The +1% buffer confirms the breakout is not marginal.", sortOrder: 5 },
          { key: "market_positive", label: "Market condition positive", kind: "soft", description: "Broader market should support. Not a hard filter but improves probability.", sortOrder: 6 },
        ],
      },
    ],
  },

  // =========================================================================
  // 7. BTST — Session 9
  // =========================================================================
  {
    key: "swing_btst",
    name: "BTST (Buy Today Sell Tomorrow)",
    family: "swing",
    status: "active",
    description:
      "Shortest swing variant. Intersect top gainers and volume shockers. Delivery >= 45%. Avoid pre-holiday, pre-expiry, and Friday entries. Exit next day.",
    reviewFrequency: "daily",
    primaryTimeframe: "D1",
    confidence: "medium",
    versions: [
      {
        version: 1,
        isActive: true,
        sourceSessions: "9",
        normalizedDsl: {
          key: "swing_btst",
          family: "swing",
          reviewFrequency: "daily",
          primaryTimeframe: "D1",
          canonicalVersionTag: "btst.v1.canonical",
          filters: [
            { field: "derived.isTopGainer", operator: "==", value: true, kind: "hard", label: "Top gainer" },
            { field: "derived.isVolumeShocker", operator: "==", value: true, kind: "hard", label: "Volume shocker" },
            { field: "daily.deliveryPct", operator: ">=", value: 45, kind: "hard", label: "Delivery >= 45%" },
            { field: "derived.notPreHolidayOrExpiry", operator: "==", value: true, kind: "hard", label: "Not pre-holiday/expiry" },
          ],
          entry: { type: "manual" },
          stopLoss: { type: "manual" },
        },
        rules: [
          { key: "top_gainer", label: "In top gainers list", kind: "hard", description: "Stock must appear in Moneycontrol All Stats > Top Gainers.", sortOrder: 1 },
          { key: "volume_shocker", label: "In volume shockers list", kind: "hard", description: "Stock must also appear in Volume Shockers. Intersection is the candidate set.", sortOrder: 2 },
          { key: "delivery", label: "Delivery >= 45%", kind: "hard", description: "Higher delivery percentage indicates genuine participation, not just speculative churn.", sortOrder: 3 },
          { key: "timing", label: "Avoid bad timing windows", kind: "hard", description: "Do not enter on Friday, pre-holiday, pre-expiry days, or distorted expiry sessions.", sortOrder: 4 },
          { key: "exit_rule", label: "Exit next day", kind: "informational", description: "Exit at next-day open or first sign of strength. This is an overnight hold only.", sortOrder: 5 },
        ],
      },
    ],
  },

  // =========================================================================
  // 8. Trend Continuation — Session 9
  // =========================================================================
  {
    key: "swing_trend_continuation",
    name: "Trend Continuation Strategy",
    family: "swing",
    status: "active",
    description:
      "Lower-maintenance continuation system. Monthly RSI >= 60 for primary strength, daily close above Super Trend, green candle confirmation, +1% buffer.",
    reviewFrequency: "daily",
    primaryTimeframe: "D1",
    secondaryTimeframe: "MN1",
    confidence: "high",
    versions: [
      {
        version: 1,
        isActive: true,
        sourceSessions: "9",
        normalizedDsl: {
          key: "swing_trend_continuation",
          family: "swing",
          reviewFrequency: "daily",
          primaryTimeframe: "D1",
          secondaryTimeframe: "MN1",
          canonicalVersionTag: "trend-continuation.v1.initial",
          filters: [
            { field: "monthly.rsi14", operator: ">=", value: 60, kind: "hard", label: "Monthly RSI >= 60" },
            { field: "derived.priceAboveSuperTrend", operator: "==", value: true, kind: "hard", label: "Daily close above Super Trend" },
            { field: "daily.candleColor", operator: "==", value: "green", kind: "hard", label: "Green candle confirmation" },
          ],
          entry: { type: "buffer_above_close", bufferPct: 1 },
          stopLoss: { type: "recent_swing_low", timeframe: "D1" },
          exit: { type: "supertrend_flip", timeframe: "D1" },
        },
        rules: [
          { key: "monthly_rsi", label: "Monthly RSI >= 60", kind: "hard", description: "Same monthly strength framework used in Buying-in-the-Dips.", sortOrder: 1 },
          { key: "super_trend", label: "Daily close above Super Trend", kind: "hard", description: "Super Trend must indicate bullish structure on the daily chart.", sortOrder: 2 },
          { key: "green_candle", label: "Green candle confirmation", kind: "hard", description: "Confirming bullish candle for entry.", sortOrder: 3 },
          { key: "entry_buffer", label: "+1% buffer", kind: "hard", description: "Same confirmation buffer logic as other strategies.", sortOrder: 4 },
          { key: "trail_supertrend", label: "Trail with Super Trend", kind: "hard", description: "Hold while Super Trend is bullish. Exit on flip. Lower maintenance than manual trailing.", sortOrder: 5 },
        ],
      },
    ],
  },

  // =========================================================================
  // 9. 13/34 SMA + 200 SMA — Session 9
  // =========================================================================
  {
    key: "swing_sma_13_34_200",
    name: "13/34 SMA + 200 SMA Strategy",
    family: "swing",
    status: "active",
    description:
      "Moving-average crossover continuation inside long-term uptrend. 13 SMA crosses above 34 SMA while both are above 200 SMA. Trail with 34 SMA.",
    reviewFrequency: "daily",
    primaryTimeframe: "D1",
    confidence: "high",
    versions: [
      {
        version: 1,
        isActive: true,
        sourceSessions: "9",
        normalizedDsl: {
          key: "swing_sma_13_34_200",
          family: "swing",
          reviewFrequency: "daily",
          primaryTimeframe: "D1",
          canonicalVersionTag: "sma-13-34-200.v1",
          filters: [
            { field: "derived.sma13CrossAboveSma34", operator: "==", value: true, kind: "hard", label: "13 SMA crosses above 34 SMA" },
            { field: "daily.sma13", operator: ">", valueRef: "daily.sma200", kind: "hard", label: "13 SMA above 200 SMA" },
            { field: "daily.sma34", operator: ">", valueRef: "daily.sma200", kind: "hard", label: "34 SMA above 200 SMA" },
          ],
          entry: { type: "confirmation_close" },
          stopLoss: { type: "recent_swing_low", timeframe: "D1" },
          exit: { type: "ma_cross_below", params: { ma: "sma34" } },
        },
        rules: [
          { key: "crossover", label: "13 SMA crosses above 34 SMA", kind: "hard", description: "The fast MA crosses above the slow MA, indicating bullish resumption.", sortOrder: 1 },
          { key: "above_200", label: "Both above 200 SMA", kind: "hard", description: "200 SMA defines primary uptrend anchor. Both shorter MAs must be above it.", sortOrder: 2 },
          { key: "deep_u", label: "Look for deep-U crossover shape", kind: "soft", description: "A healthy pullback/recovery structure rather than a flat crossover in chop.", sortOrder: 3 },
          { key: "trail_34", label: "Trail with 34 SMA", kind: "hard", description: "Use 34 SMA or swing structure for trailing.", sortOrder: 4 },
        ],
      },
    ],
  },

  // =========================================================================
  // 10. 44 SMA — Session 9
  // =========================================================================
  {
    key: "swing_sma_44",
    name: "44 SMA Strategy",
    family: "swing",
    status: "active",
    description:
      "Single-MA trend-respect strategy. Stock in primary uptrend pulls back into 44 SMA and reclaims it. Straightforward trend-following pullback setup.",
    reviewFrequency: "daily",
    primaryTimeframe: "D1",
    confidence: "medium",
    versions: [
      {
        version: 1,
        isActive: true,
        sourceSessions: "9",
        normalizedDsl: {
          key: "swing_sma_44",
          family: "swing",
          reviewFrequency: "daily",
          primaryTimeframe: "D1",
          canonicalVersionTag: "sma-44.v1",
          filters: [
            { field: "derived.primaryUptrend", operator: "==", value: true, kind: "hard", label: "Primary uptrend" },
            { field: "daily.close", operator: ">", valueRef: "daily.sma44", kind: "hard", label: "Close above 44 SMA" },
            { field: "derived.reclaimAfterPullback", operator: "==", value: true, kind: "hard", label: "Reclaim after pullback" },
          ],
          entry: { type: "confirmation_close" },
          stopLoss: { type: "recent_swing_low", timeframe: "D1" },
        },
        rules: [
          { key: "uptrend", label: "Primary uptrend", kind: "hard", description: "Stock must be in a structural uptrend. 44 SMA should be trending up.", sortOrder: 1 },
          { key: "reclaim", label: "Price reclaims 44 SMA after pullback", kind: "hard", description: "After pulling back near/below the 44 SMA, price must reclaim it with a close above.", sortOrder: 2 },
          { key: "use_as_support", label: "44 SMA acts as dynamic support", kind: "informational", description: "This strategy works for stocks that consistently respect one average.", sortOrder: 3 },
        ],
      },
    ],
  },

  // =========================================================================
  // 11. 9/15 EMA + Super Trend 4H — Session 9
  // =========================================================================
  {
    key: "swing_ema_9_15_st_4h",
    name: "9/15 EMA + Super Trend (4H)",
    family: "swing",
    status: "active",
    description:
      "Faster swing or fast-swing setup on 4-hour candles. Price above both 9 and 15 EMA, Super Trend green, green confirmation candle.",
    reviewFrequency: "daily",
    primaryTimeframe: "H4",
    confidence: "medium",
    versions: [
      {
        version: 1,
        isActive: true,
        sourceSessions: "9",
        normalizedDsl: {
          key: "swing_ema_9_15_st_4h",
          family: "swing",
          reviewFrequency: "daily",
          primaryTimeframe: "H4",
          canonicalVersionTag: "ema-9-15-supertrend-4h.v1",
          filters: [
            { field: "h4.close", operator: ">", valueRef: "h4.ema9", kind: "hard", label: "Price above 9 EMA" },
            { field: "h4.close", operator: ">", valueRef: "h4.ema15", kind: "hard", label: "Price above 15 EMA" },
            { field: "h4.superTrendDir", operator: "==", value: "up", kind: "hard", label: "Super Trend green" },
            { field: "h4.candleColor", operator: "==", value: "green", kind: "hard", label: "Green candle" },
          ],
          entry: { type: "confirmation_close" },
          stopLoss: { type: "recent_swing_low", timeframe: "H4" },
        },
        rules: [
          { key: "above_ema9", label: "Price above 9 EMA", kind: "hard", description: "4H candle close must be above the 9-period EMA.", sortOrder: 1 },
          { key: "above_ema15", label: "Price above 15 EMA", kind: "hard", description: "4H candle close must be above the 15-period EMA.", sortOrder: 2 },
          { key: "supertrend_green", label: "Super Trend green on 4H", kind: "hard", description: "Super Trend indicator must show bullish (green) on the same 4H chart.", sortOrder: 3 },
          { key: "green_candle", label: "Green confirmation candle", kind: "hard", description: "All conditions must coincide on the same 4H candle.", sortOrder: 4 },
        ],
      },
    ],
  },

  // =========================================================================
  // 12. Alpha/Beta Screener Workflow — Session 9
  // =========================================================================
  {
    key: "screen_alpha_beta_largecap",
    name: "Alpha/Beta Large Cap Screener",
    family: "swing",
    status: "active",
    description:
      "Selection screener, not direct trade trigger. Filters large-cap universe by alpha >= 15% and beta 0-1. Requires manual chart validation afterward.",
    reviewFrequency: "weekly",
    primaryTimeframe: "D1",
    confidence: "medium",
    versions: [
      {
        version: 1,
        isActive: true,
        sourceSessions: "9",
        normalizedDsl: {
          key: "screen_alpha_beta_largecap",
          family: "swing",
          reviewFrequency: "weekly",
          primaryTimeframe: "D1",
          filters: [
            { field: "instrument.marketCapBucket", operator: "==", value: "large_cap", kind: "hard", label: "Large cap" },
            { field: "derived.alpha", operator: ">=", value: 15, kind: "hard", label: "Alpha >= 15%" },
            { field: "derived.beta", operator: ">=", value: 0, kind: "hard", label: "Beta >= 0" },
            { field: "derived.beta", operator: "<=", value: 1, kind: "hard", label: "Beta <= 1" },
          ],
        },
        rules: [
          { key: "large_cap", label: "Large cap universe", kind: "hard", description: "Start with large caps for safety. Then do fundamental analysis.", sortOrder: 1 },
          { key: "alpha", label: "Alpha >= 15%", kind: "hard", description: "Stock return minus market return should show 15% or more outperformance.", sortOrder: 2 },
          { key: "beta", label: "Beta between 0 and 1", kind: "hard", description: "Controlled volatility relative to market. Better performance without excessive instability.", sortOrder: 3 },
          { key: "manual_chart", label: "Manual chart validation", kind: "informational", description: "This is a selection screener. Always validate chart structure before adding to watchlist.", sortOrder: 4 },
        ],
      },
    ],
  },

  // =========================================================================
  // 13a. Sideways Support Reversal — drr-screener gap
  // =========================================================================
  {
    key: "swing_sideways_support_reversal",
    name: "Sideways Support Reversal",
    family: "swing",
    status: "active",
    description:
      "Support-area reversal within sideways regime. Delivery % >= 45, volume > 20D avg, close above 5D EMA, entry at support + 15% of support-resistance band. NOT a breakout — confirmation-on-reclaim style entry.",
    reviewFrequency: "daily",
    primaryTimeframe: "D1",
    confidence: "medium",
    versions: [
      {
        version: 1,
        isActive: true,
        sourceSessions: "drr-screener",
        normalizedDsl: {
          key: "swing_sideways_support_reversal",
          family: "swing",
          reviewFrequency: "daily",
          primaryTimeframe: "D1",
          canonicalVersionTag: "sideways-support-reversal.v1.canonical",
          filters: [
            { field: "derived.regimeIsSideways", operator: "==", value: true, kind: "hard", label: "Sideways regime" },
            { field: "derived.nearSupport", operator: "==", value: true, kind: "hard", label: "At support zone" },
            { field: "daily.deliveryPct", operator: ">=", value: 45, kind: "hard", label: "Delivery >= 45%" },
            { field: "daily.volume", operator: ">", valueRef: "daily.volumeSma20", kind: "hard", label: "Volume > 20D avg" },
            { field: "daily.close", operator: ">", valueRef: "daily.ema5", kind: "hard", label: "Close above 5 EMA" },
          ],
          entry: { type: "support_plus_band_pct", bandPct: 15 },
          stopLoss: { type: "below_support", timeframe: "D1" },
        },
        rules: [
          { key: "sideways_regime", label: "Sideways regime", kind: "hard", description: "Stock must be in sideways/range regime — not trending. Breakout rules do not apply.", sortOrder: 1 },
          { key: "at_support", label: "At support zone", kind: "hard", description: "Price action interacting with identified horizontal support.", sortOrder: 2 },
          { key: "delivery_strong", label: "Delivery >= 45%", kind: "hard", description: "Delivery ratio confirms genuine accumulation not intraday noise.", sortOrder: 3 },
          { key: "volume_above_avg", label: "Volume above 20D avg", kind: "hard", description: "Above-average volume shows demand at support.", sortOrder: 4 },
          { key: "close_above_5ema", label: "Close above 5 EMA", kind: "hard", description: "Very short-term momentum turning up.", sortOrder: 5 },
          { key: "entry_support_plus_15pct_band", label: "Entry: support + 15% of band", kind: "hard", description: "Enter at support + 15% of the support-to-resistance band height. NOT the same as breakout +1% entry.", sortOrder: 6 },
        ],
      },
    ],
  },

  // =========================================================================
  // 13b. 20-Day Channel Breakout — drr-screener gap
  // =========================================================================
  {
    key: "swing_twenty_day_channel_breakout",
    name: "20-Day Channel Breakout",
    family: "swing",
    status: "active",
    description:
      "True Donchian-style 20-day channel breakout. Close above 20-day highest high, with breakout-quality gates: body >= 65% of range, volume >= 1.5x 20D avg, delivery >= 35%, close >= 1% above resistance.",
    reviewFrequency: "daily",
    primaryTimeframe: "D1",
    confidence: "medium",
    versions: [
      {
        version: 1,
        isActive: true,
        sourceSessions: "drr-screener",
        normalizedDsl: {
          key: "swing_twenty_day_channel_breakout",
          family: "swing",
          reviewFrequency: "daily",
          primaryTimeframe: "D1",
          canonicalVersionTag: "twenty-day-channel-breakout.v1.canonical",
          filters: [
            { field: "daily.close", operator: ">", valueRef: "derived.donchianHigh20", kind: "hard", label: "Close > 20D highest high" },
            { field: "daily.candleBodyPct", operator: ">=", value: 65, kind: "hard", label: "Body >= 65%" },
            { field: "daily.relativeVolume20", operator: ">=", value: 1.5, kind: "hard", label: "Volume >= 1.5x 20D" },
            { field: "daily.deliveryPct", operator: ">=", value: 35, kind: "hard", label: "Delivery >= 35%" },
            { field: "derived.closeAboveResistancePct", operator: ">=", value: 1, kind: "hard", label: ">=1% above resistance" },
          ],
          entry: { type: "confirmation_close_above_resistance_pct", pct: 1 },
          stopLoss: { type: "recent_swing_low", timeframe: "D1" },
        },
        rules: [
          { key: "donchian_high20", label: "Close above 20-day high", kind: "hard", description: "Today's close exceeds the highest close of the prior 20 trading days.", sortOrder: 1 },
          { key: "body_quality", label: "Candle body >= 65% of range", kind: "hard", description: "Strong-bodied candle, not a doji wick.", sortOrder: 2 },
          { key: "rel_volume", label: "Volume >= 1.5x 20D avg", kind: "hard", description: "Meaningful participation on breakout.", sortOrder: 3 },
          { key: "delivery_relaxed", label: "Delivery >= 35% (relaxed variant)", kind: "hard", description: "Uses relaxed canonical delivery threshold. Strict variant uses 45%.", sortOrder: 4 },
          { key: "above_resistance_pct", label: "Close >= 1% above resistance", kind: "hard", description: "Distinguishes true breakout from intrabar tag. NOT the same as support-reversal entry.", sortOrder: 5 },
        ],
      },
    ],
  },

  // =========================================================================
  // 14. Market Context Engine — Session 8
  // =========================================================================
  {
    key: "market_context_engine",
    name: "Pre-Market Context Engine",
    family: "market_context",
    status: "active",
    description:
      "Non-trading support engine. Reads GIFT Nifty, Dow, Dow Futures (YM1!), Gold, Crude Oil, and FII/FPI flows to produce a daily market posture assessment. Not a trade trigger — used as context layer.",
    reviewFrequency: "pre_market",
    primaryTimeframe: "D1",
    confidence: "high",
    versions: [
      {
        version: 1,
        isActive: true,
        sourceSessions: "8",
        normalizedDsl: {
          key: "market_context_engine",
          family: "market_context",
          reviewFrequency: "pre_market",
          primaryTimeframe: "D1",
          filters: [],
        },
        rules: [
          { key: "gift_nifty", label: "GIFT Nifty", kind: "informational", description: "Offshore reference for Indian market sentiment. Replaced SGX Nifty.", sortOrder: 1 },
          { key: "dow_futures", label: "Dow Futures (YM1!)", kind: "informational", description: "Direct correlation with GIFT Nifty. Green overnight = bullish support.", sortOrder: 2 },
          { key: "gold", label: "Gold price", kind: "informational", description: "Inverse/negative correlation with equities. Sharp gold rise = risk-off.", sortOrder: 3 },
          { key: "crude", label: "Crude oil", kind: "informational", description: "Rising crude = pressure on equities. Calm crude supports bullish environment.", sortOrder: 4 },
          { key: "fii_fpi", label: "FII/FPI flow", kind: "informational", description: "Net buyers = bullish confirmation. Net sellers = reduced confidence. Confluence, not trigger.", sortOrder: 5 },
        ],
      },
    ],
  },
];

export async function seedStrategies(prisma: PrismaClient) {
  console.log("  📈 Seeding strategies...");

  for (const s of strategies) {
    const strategy = await prisma.strategy.upsert({
      where: { key: s.key },
      update: {
        name: s.name,
        family: s.family,
        status: s.status,
        description: s.description,
        reviewFrequency: s.reviewFrequency,
        primaryTimeframe: s.primaryTimeframe,
        secondaryTimeframe: s.secondaryTimeframe,
        confidence: s.confidence,
      },
      create: {
        key: s.key,
        name: s.name,
        family: s.family,
        status: s.status,
        description: s.description,
        reviewFrequency: s.reviewFrequency,
        primaryTimeframe: s.primaryTimeframe,
        secondaryTimeframe: s.secondaryTimeframe,
        confidence: s.confidence,
      },
    });

    for (const v of s.versions) {
      const sv = await prisma.strategyVersion.upsert({
        where: { strategyId_version: { strategyId: strategy.id, version: v.version } },
        update: {
          isActive: v.isActive,
          sourceSessions: v.sourceSessions,
          implementationNotes: v.implementationNotes,
          normalizedDsl: v.normalizedDsl,
        },
        create: {
          strategyId: strategy.id,
          version: v.version,
          isActive: v.isActive,
          sourceSessions: v.sourceSessions,
          implementationNotes: v.implementationNotes,
          normalizedDsl: v.normalizedDsl,
        },
      });

      // Delete existing rules for this version then recreate
      await prisma.strategyRule.deleteMany({ where: { strategyVersionId: sv.id } });
      for (const r of v.rules) {
        await prisma.strategyRule.create({
          data: {
            strategyVersionId: sv.id,
            key: r.key,
            label: r.label,
            kind: r.kind,
            description: r.description,
            sortOrder: r.sortOrder,
          },
        });
      }
    }
  }
}
