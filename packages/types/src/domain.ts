// =============================================================================
// Domain Models — runtime shapes used across the entire system
// =============================================================================

import type {
  StrategyFamily,
  StrategyStatus,
  RuleKind,
  Timeframe,
  ConfidenceLevel,
  MarketPosture,
  PriorityBucket,
  AmbiguitySeverity,
  DigestType,
} from "./enums";

// ---------------------------------------------------------------------------
// Market data
// ---------------------------------------------------------------------------

export interface Candle {
  ts: Date;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  deliveryPct?: number;
}

export interface CandleSeries {
  symbol: string;
  timeframe: Timeframe;
  candles: Candle[];
}

export interface ExchangeCalendar {
  isMonthEnd(date: Date): boolean;
}

export interface QuoteSnapshot {
  symbol: string;
  ltp: number;
  open?: number;
  high?: number;
  low?: number;
  close?: number;
  changePct?: number;
  volume?: number;
  ts: Date;
}

// ---------------------------------------------------------------------------
// Indicators
// ---------------------------------------------------------------------------

export interface IndicatorSet {
  rsi14?: number;
  sma13?: number;
  sma34?: number;
  sma44?: number;
  sma50?: number;
  sma200?: number;
  ema9?: number;
  ema15?: number;
  bbUpper?: number;
  bbMiddle?: number;
  bbLower?: number;
  superTrend?: number;
  superTrendDir?: "up" | "down";
  vwap?: number;
  atr14?: number;
  relativeVolume?: number;
  deliveryPct?: number;
}

export interface StructuralState {
  isUptrend: boolean;
  isDowntrend: boolean;
  swingHighs: SwingPoint[];
  swingLows: SwingPoint[];
  recentSwingHigh: number;
  recentSwingLow: number;
}

export interface ConsolidationResult {
  rangeStart: Date;
  rangeEnd: Date;
  ceilingPrice: number;
  floorPrice: number;
  compressionScore: number;
  rangeDepthPct: number;
  ceilingTouches: number;
}

export interface SwingPoint {
  index: number;
  price: number;
  date: Date;
  type: "high" | "low";
}

export interface FibonacciLevel {
  level: number;
  price: number;
}

// ---------------------------------------------------------------------------
// Global context
// ---------------------------------------------------------------------------

export interface GlobalContext {
  date: string;
  giftNiftyChange?: number;
  dowIndexChange?: number;
  dowFuturesChange?: number;
  goldChange?: number;
  crudeChange?: number;
  posture: MarketPosture;
  score: number;
  narrative: string;
  breakdown?: MarketContextFactorBreakdown[];
}

export interface MarketContextFactorBreakdown {
  key: "gift_nifty" | "dow_futures" | "gold" | "crude" | "fii_flow";
  label: string;
  value: number | null;
  contribution: number;
  status: "favorable" | "neutral" | "hostile" | "missing";
  reason: string;
}

export interface FiiDiiFlow {
  date: string;
  fiiCashNet?: number;
  diiCashNet?: number;
  fiiIndexFuturesNet?: number;
  fiiIndexOptionsNet?: number;
  narrative?: string;
}

export interface MarketBreadth {
  date: string;
  advances?: number;
  declines?: number;
  unchanged?: number;
  new52WeekHighs?: number;
  new52WeekLows?: number;
}

// ---------------------------------------------------------------------------
// Strategy
// ---------------------------------------------------------------------------

export interface StrategySummary {
  key: string;
  name: string;
  family: StrategyFamily;
  status: StrategyStatus;
  confidence: ConfidenceLevel;
  reviewFrequency: string;
  primaryTimeframe?: Timeframe;
  sourceSessions: string[];
  matchCount?: number;
  ambiguityCount?: number;
}

export interface StrategyDetail extends StrategySummary {
  description: string;
  secondaryTimeframe?: Timeframe;
  activeVersion: StrategyVersionDetail;
  ambiguities: AmbiguityRecord[];
  liveMatches: StrategyMatchResult[];
}

export interface StrategyVersionDetail {
  version: number;
  isActive: boolean;
  sourceSessions: string;
  implementationNotes?: string;
  rules: StrategyRuleDetail[];
}

export interface StrategyRuleDetail {
  key: string;
  label: string;
  kind: RuleKind;
  description: string;
  uiHint?: string;
  ambiguity?: {
    present: boolean;
    raw: string;
    normalizedPreference: string;
  };
}

export interface StrategyMatchResult {
  symbol: string;
  companyName: string;
  marketDate: string;
  matched: boolean;
  confluenceScore?: number;
  confidence?: ConfidenceLevel;
  ruleResults: Record<string, { passed: boolean; value?: unknown; reason?: string }>;
  explanation?: string;
  ambiguityFlags?: string[];
  priorityBucket?: PriorityBucket;
}

// ---------------------------------------------------------------------------
// Screener
// ---------------------------------------------------------------------------

export interface ScreenerSummary {
  key: string;
  name: string;
  description: string;
  linkedStrategyKey?: string;
  isExternalReference: boolean;
  externalUrl?: string;
  lastRunMatchCount?: number;
}

export interface IntersectionRequest {
  screenerKeys: string[];
  mode: "intersection" | "union" | "difference";
  minOverlap?: number;
  marketDate: string;
  filters?: {
    minPrice?: number;
    minVolume?: number;
    sectorIn?: string[];
    excludeSymbols?: string[];
  };
}

export interface IntersectionResult {
  symbol: string;
  companyName: string;
  overlapCount: number;
  weightedScore: number;
  matchedBy: { key: string; label: string }[];
  familyMix: Record<string, number>;
  explanation: string;
  priorityBucket?: PriorityBucket;
}

// ---------------------------------------------------------------------------
// Confluence
// ---------------------------------------------------------------------------

export interface ConfluenceRecord {
  symbol: string;
  marketDate: string;
  overlapCount: number;
  overlapKeys: string[];
  weightedScore: number;
  familyMix: Record<string, number>;
  explanation: string;
}

// ---------------------------------------------------------------------------
// Digest
// ---------------------------------------------------------------------------

export interface DigestSummary {
  id: string;
  digestType: DigestType;
  marketDate: string;
  title: string;
  summary: string;
  posture?: MarketPosture;
}

export interface DigestDetail extends DigestSummary {
  sections: DigestSection[];
  stockMentions: DigestStockMention[];
}

export interface DigestSection {
  key: string;
  title: string;
  bodyMarkdown: string;
  sortOrder: number;
}

export interface DigestStockMention {
  symbol: string;
  mentionType: string;
  context?: Record<string, unknown>;
}

// ---------------------------------------------------------------------------
// Ambiguity
// ---------------------------------------------------------------------------

export interface AmbiguityRecord {
  key: string;
  strategyKey?: string;
  rawNote: string;
  normalizedNote: string;
  sourcePreference?: string;
  severity: AmbiguitySeverity;
  uiBehavior: string;
}

// ---------------------------------------------------------------------------
// Knowledge
// ---------------------------------------------------------------------------

export interface KnowledgeConcept {
  key: string;
  title: string;
  category: string;
  definition: string;
  notes?: string;
  linkedStrategyKeys?: string[];
}

export interface CourseSession {
  key: string;
  sessionNumber: number;
  title: string;
  summary: string;
  strategiesCovered: string[];
  conceptsCovered: string[];
}

// ---------------------------------------------------------------------------
// Backtest
// ---------------------------------------------------------------------------

export interface BacktestConfig {
  strategyKey: string;
  strategyVersion?: number;
  startDate: string;
  endDate: string;
  universe: string;
  capital: number;
  riskPerTradePct: number;
  maxOpenPositions: number;
  slippageBps: number;
}

export interface BacktestMetrics {
  totalTrades: number;
  winRate: number;
  avgWin: number;
  avgLoss: number;
  expectancy: number;
  maxDrawdown: number;
  profitFactor: number;
  avgHoldDays: number;
  medianHoldDays: number;
  falseBreakoutRate?: number;
}

// ---------------------------------------------------------------------------
// Dashboard
// ---------------------------------------------------------------------------

export interface DashboardData {
  marketDate: string;
  lastUpdatedAt: string;
  marketPosture: {
    label: MarketPosture;
    score: number;
    explanation: string;
  };
  strategyCounts: { key: string; name: string; count: number }[];
  topConfluence: IntersectionResult[];
  watchlistChanges: {
    added: number;
    invalidated: number;
    strengthened: number;
  };
  digestHighlights: string[];
  dataFreshnessWarnings: string[];
}

// ---------------------------------------------------------------------------
// External resources
// ---------------------------------------------------------------------------

export interface ExternalResource {
  key: string;
  title: string;
  url: string;
  category: string;
  provider?: string;
  notes?: string;
}

// ---------------------------------------------------------------------------
// Risk calculator
// ---------------------------------------------------------------------------

export interface PositionSizeInput {
  portfolioSize: number;
  entryPrice: number;
  stopLossPrice: number;
  riskPct?: number; // defaults to 2%
}

export interface PositionSizeResult {
  riskAmount: number;
  perShareRisk: number;
  quantity: number;
  targetAt3R: number;
  explanation: string;
}
