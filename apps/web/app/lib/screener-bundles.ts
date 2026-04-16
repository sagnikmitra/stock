export interface ScreenerBundleDefinition {
  key:
    | "month_end_investment"
    | "swing_daily_check"
    | "breakout_radar"
    | "btst_radar"
    | "strong_confluence_set";
  name:
    | "Month End Investment"
    | "Swing Daily Check"
    | "Breakout Radar"
    | "BTST Radar"
    | "Strong Confluence Set";
  description: string;
  screenerKeys: string[];
  defaultMode: "intersection" | "union";
  minOverlap?: number;
}

export const SCREENER_BUNDLES: ScreenerBundleDefinition[] = [
  {
    key: "month_end_investment",
    name: "Month End Investment",
    description:
      "Investment-focused month-end bundle combining BB internal, MBB candidate, and 52-week-high context.",
    screenerKeys: [
      "investment_bb_internal",
      "mbb_candidate",
      "nse_52_week_high_internal",
    ],
    defaultMode: "union",
  },
  {
    key: "swing_daily_check",
    name: "Swing Daily Check",
    description:
      "Daily swing scan with Buying-in-Dips, Cross, ABC, and Trend Continuation candidates.",
    screenerKeys: [
      "buying_in_dips_candidate",
      "cross_strategy_candidate",
      "abc_strategy_candidate",
      "trend_continuation_internal",
    ],
    defaultMode: "union",
  },
  {
    key: "breakout_radar",
    name: "Breakout Radar",
    description:
      "Breakout-heavy radar using breakout quality, 52-week highs, and RSI extension.",
    screenerKeys: [
      "breakout_quality_internal",
      "nse_52_week_high_internal",
      "rsi_above_80_internal",
    ],
    defaultMode: "intersection",
    minOverlap: 2,
  },
  {
    key: "btst_radar",
    name: "BTST Radar",
    description:
      "Short-hold BTST candidates combining top-gainer/volume-shocker behavior and breakout quality.",
    screenerKeys: [
      "btst_top_gainers_volume_shockers_internal",
      "breakout_quality_internal",
    ],
    defaultMode: "intersection",
    minOverlap: 2,
  },
  {
    key: "strong_confluence_set",
    name: "Strong Confluence Set",
    description:
      "High-confluence momentum stack across trend continuation, breakout, and MA/EMA internals.",
    screenerKeys: [
      "trend_continuation_internal",
      "breakout_quality_internal",
      "sma_13_34_internal",
      "ema_9_15_supertrend_4h_internal",
    ],
    defaultMode: "intersection",
    minOverlap: 2,
  },
];

export function getScreenerBundle(bundleKey: string): ScreenerBundleDefinition | undefined {
  return SCREENER_BUNDLES.find((bundle) => bundle.key === bundleKey);
}

