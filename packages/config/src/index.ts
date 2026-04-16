// =============================================================================
// Shared configuration — environment parsing, constants, feature flags
// =============================================================================

/** IST-oriented cron schedule constants */
export const CRON_SCHEDULES = {
  /** Pre-market digest: 8:30 AM IST (03:00 UTC) */
  PRE_MARKET: "0 3 * * 1-5",
  /** Post-close pipeline: 4:30 PM IST (11:00 UTC) */
  POST_CLOSE: "0 11 * * 1-5",
  /** Month-end investment scan: 5:00 PM IST on last business day */
  MONTH_END: "0 11 28-31 * 1-5",
  /** Provider health check: every 15 min during market hours */
  PROVIDER_HEALTH: "*/15 3-11 * * 1-5",
} as const;

/** Rate limits per provider (requests per minute) */
export const PROVIDER_RATE_LIMITS: Record<string, number> = {
  nse_official: 10,
  twelvedata: 8,
  fmp: 30,
  eodhd: 20,
  kite: 60,
  upstox: 60,
};

/** Default risk parameters */
export const RISK_DEFAULTS = {
  /** Max risk per trade as fraction of portfolio */
  riskPct: 0.02,
  /** Default R:R target multiplier */
  targetRMultiple: 3,
  /** Max open positions */
  maxOpenPositions: 10,
  /** Slippage estimate in basis points */
  slippageBps: 10,
} as const;

/** Market context scoring thresholds */
export const MARKET_CONTEXT_THRESHOLDS = {
  /** GIFT Nifty change % for favorable signal */
  giftNiftyFavorable: 0.3,
  /** FII net buy in Cr for favorable signal */
  fiiNetBuyFavorable: 500,
  /** Gold change % above which = risk-off */
  goldRiskOff: 1.0,
  /** Crude change % above which = inflationary */
  crudeInflationary: 2.0,
  /** Score >= this = favorable posture */
  favorableThreshold: 3,
  /** Score <= this = hostile posture */
  hostileThreshold: 1,
} as const;

/** Strategy review frequencies mapped to human labels */
export const REVIEW_FREQUENCY_LABELS: Record<string, string> = {
  daily: "Every trading day",
  weekly: "Weekly",
  month_end: "Last trading day of month",
  pre_market: "Before market open",
  on_demand: "Manual / on-demand",
};

/** Environment variable helpers */
export function requireEnv(key: string): string {
  const val = process.env[key];
  if (!val) throw new Error(`Missing required env var: ${key}`);
  return val;
}

export function optionalEnv(key: string, fallback: string): string {
  return process.env[key] ?? fallback;
}

export function envBool(key: string, fallback = false): boolean {
  const val = process.env[key];
  if (!val) return fallback;
  return val === "true" || val === "1";
}
