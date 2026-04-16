// =============================================================================
// API Request/Response contracts
// =============================================================================

import type {
  DashboardData,
  DigestDetail,
  DigestSummary,
  StrategyDetail,
  StrategySummary,
  ScreenerSummary,
  IntersectionRequest,
  IntersectionResult,
  GlobalContext,
  FiiDiiFlow,
  MarketBreadth,
  BacktestConfig,
  BacktestMetrics,
  PositionSizeInput,
  PositionSizeResult,
  ExternalResource,
  KnowledgeConcept,
  CourseSession,
  AmbiguityRecord,
} from "./domain";

// ---------------------------------------------------------------------------
// Generic API wrapper
// ---------------------------------------------------------------------------

export interface ApiResponse<T> {
  data: T;
  meta?: {
    timestamp: string;
    freshness?: string;
    warnings?: string[];
  };
}

export interface ApiError {
  error: string;
  code: string;
  details?: string;
}

// ---------------------------------------------------------------------------
// Dashboard
// ---------------------------------------------------------------------------

export type DashboardResponse = ApiResponse<DashboardData>;

// ---------------------------------------------------------------------------
// Digest
// ---------------------------------------------------------------------------

export type DigestListResponse = ApiResponse<DigestSummary[]>;
export type DigestDetailResponse = ApiResponse<DigestDetail>;

// ---------------------------------------------------------------------------
// Strategies
// ---------------------------------------------------------------------------

export type StrategyListResponse = ApiResponse<StrategySummary[]>;
export type StrategyDetailResponse = ApiResponse<StrategyDetail>;

export interface StrategyRunRequest {
  strategyKey: string;
  marketDate?: string;
  universe?: string;
}

// ---------------------------------------------------------------------------
// Screeners
// ---------------------------------------------------------------------------

export type ScreenerListResponse = ApiResponse<ScreenerSummary[]>;

export interface ScreenerRunRequest {
  screenerKey: string;
  marketDate?: string;
}

export type IntersectionResponse = ApiResponse<{
  marketDate: string;
  mode: string;
  totalCandidates: number;
  results: IntersectionResult[];
}>;

// ---------------------------------------------------------------------------
// Market context
// ---------------------------------------------------------------------------

export type MarketContextResponse = ApiResponse<{
  globalContext: GlobalContext;
  fiiDii: FiiDiiFlow;
  breadth: MarketBreadth;
}>;

// ---------------------------------------------------------------------------
// Stock
// ---------------------------------------------------------------------------

export interface StockDetailResponse {
  symbol: string;
  companyName: string;
  sector?: string;
  industry?: string;
  marketCapBucket?: string;
  latestQuote?: {
    ltp: number;
    changePct: number;
    volume: number;
  };
  strategyMatches: {
    key: string;
    name: string;
    matched: boolean;
    family: string;
  }[];
  screenerMemberships: string[];
  watchlistMemberships: string[];
}

// ---------------------------------------------------------------------------
// Backtest
// ---------------------------------------------------------------------------

export interface BacktestRunRequest extends BacktestConfig {}

export type BacktestRunResponse = ApiResponse<{
  backtestId: string;
  status: string;
  metrics?: BacktestMetrics;
}>;

// ---------------------------------------------------------------------------
// Risk calculator
// ---------------------------------------------------------------------------

export type PositionSizeRequest = PositionSizeInput;
export type PositionSizeResponse = ApiResponse<PositionSizeResult>;

// ---------------------------------------------------------------------------
// Admin
// ---------------------------------------------------------------------------

export interface AdminProviderSyncRequest {
  providerKey: string;
  jobType?: string;
}

export interface AdminStrategyVersionRequest {
  strategyKey: string;
  version: number;
  activate?: boolean;
}

// ---------------------------------------------------------------------------
// Knowledge
// ---------------------------------------------------------------------------

export type ConceptListResponse = ApiResponse<KnowledgeConcept[]>;
export type SessionListResponse = ApiResponse<CourseSession[]>;
export type AmbiguityListResponse = ApiResponse<AmbiguityRecord[]>;
export type ResourceListResponse = ApiResponse<ExternalResource[]>;
