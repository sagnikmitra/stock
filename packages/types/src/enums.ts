// =============================================================================
// Canonical Enums — must match Prisma schema enums exactly
// =============================================================================

export const StrategyFamily = {
  INVESTMENT: "investment",
  SWING: "swing",
  MARKET_CONTEXT: "market_context",
  RISK_FOUNDATION: "risk_foundation",
  KNOWLEDGE_ONLY: "knowledge_only",
  INTRADAY_FUTURE: "intraday_future",
} as const;
export type StrategyFamily = (typeof StrategyFamily)[keyof typeof StrategyFamily];

export const StrategyStatus = {
  DRAFT: "draft",
  ACTIVE: "active",
  EXPERIMENTAL: "experimental",
  DEPRECATED: "deprecated",
  ARCHIVED: "archived",
} as const;
export type StrategyStatus = (typeof StrategyStatus)[keyof typeof StrategyStatus];

export const RuleKind = {
  HARD: "hard",
  SOFT: "soft",
  AMBIGUITY: "ambiguity",
  DERIVED: "derived",
  INFORMATIONAL: "informational",
} as const;
export type RuleKind = (typeof RuleKind)[keyof typeof RuleKind];

export const Timeframe = {
  M1: "M1",
  M5: "M5",
  M15: "M15",
  M30: "M30",
  H1: "H1",
  H4: "H4",
  D1: "D1",
  W1: "W1",
  MN1: "MN1",
} as const;
export type Timeframe = (typeof Timeframe)[keyof typeof Timeframe];

export const DigestType = {
  PRE_MARKET: "pre_market",
  POST_CLOSE: "post_close",
  STRATEGY: "strategy",
  WEEK_END: "week_end",
  MONTH_END: "month_end",
  AD_HOC: "ad_hoc",
} as const;
export type DigestType = (typeof DigestType)[keyof typeof DigestType];

export const ProviderType = {
  OFFICIAL_EXCHANGE: "official_exchange_reports",
  BROKER_API: "broker_api",
  MARKET_DATA_VENDOR: "market_data_vendor",
  EXTERNAL_REFERENCE: "external_reference_page",
  MANUAL_IMPORT: "manual_import",
} as const;
export type ProviderType = (typeof ProviderType)[keyof typeof ProviderType];

export const ConfidenceLevel = {
  LOW: "low",
  MEDIUM: "medium",
  HIGH: "high",
} as const;
export type ConfidenceLevel = (typeof ConfidenceLevel)[keyof typeof ConfidenceLevel];

export const MarketPosture = {
  FAVORABLE: "favorable",
  MIXED: "mixed",
  HOSTILE: "hostile",
} as const;
export type MarketPosture = (typeof MarketPosture)[keyof typeof MarketPosture];

export const BacktestMode = {
  EVENT_REPLAY: "event_replay",
  BATCH_HISTORICAL: "batch_historical",
  ROLLING_WINDOW: "rolling_window",
  MANUAL_REVIEW: "manual_review",
} as const;
export type BacktestMode = (typeof BacktestMode)[keyof typeof BacktestMode];

export const RunStatus = {
  PENDING: "pending",
  RUNNING: "running",
  COMPLETED: "completed",
  FAILED: "failed",
  PARTIAL: "partial",
} as const;
export type RunStatus = (typeof RunStatus)[keyof typeof RunStatus];

export const PriorityBucket = {
  REVIEW_NOW: "review_now",
  WATCH_CLOSELY: "watch_closely",
  MONTH_END_ONLY: "month_end_only",
  CONTEXTUAL_ONLY: "contextual_only",
  INVALIDATED: "invalidated",
  NEEDS_MANUAL_CHART_REVIEW: "needs_manual_chart_review",
  NEEDS_FUNDAMENTAL_REVIEW: "needs_fundamental_review",
} as const;
export type PriorityBucket = (typeof PriorityBucket)[keyof typeof PriorityBucket];

export const AmbiguitySeverity = {
  LOW: "low",
  MEDIUM: "medium",
  HIGH: "high",
} as const;
export type AmbiguitySeverity = (typeof AmbiguitySeverity)[keyof typeof AmbiguitySeverity];

export const ResourceCategory = {
  OFFICIAL: "official",
  BROKER: "broker",
  VENDOR: "vendor",
  USER_REFERENCE: "user_reference",
  CALCULATOR: "calculator",
  SCREENER: "screener",
  MANUAL_SOURCE: "manual_source",
  PRODUCT_DOCS: "product_docs",
} as const;
export type ResourceCategory = (typeof ResourceCategory)[keyof typeof ResourceCategory];
