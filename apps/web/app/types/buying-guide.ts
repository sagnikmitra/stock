export type PriceRange = [number, number];

export type TradeStatus =
  | "Near Buy Zone"
  | "Wait"
  | "Breakout Watch"
  | "Do Not Chase"
  | "Invalidated"
  | "Below Buy Zone";

export interface BuyingGuideRisk {
  risk: string;
  impact: string;
  evidence?: string;
}

export interface BuyingGuideIndexLevels {
  nifty_50?: {
    close: number;
    immediate_support_zone: PriceRange;
    danger_zone_below: number;
    first_reclaim_zone: PriceRange;
    safer_bullish_reclaim?: number;
    trade_rule: string;
    evidence?: string;
  };
  bank_nifty?: {
    support_zone: PriceRange;
    secondary_support?: number;
    major_support?: number;
    resistance_zone?: PriceRange;
    trade_rule: string;
    evidence?: string;
  };
}

export interface PositionSizingRules {
  risk_per_trade_percent?: {
    conservative?: number;
    standard?: number;
    maximum?: number;
  };
  max_open_positions?: number;
  max_total_portfolio_risk_percent?: number;
  entry_split?: {
    first_entry?: string;
    second_entry?: string;
  };
  quantity_formula?: string;
  hard_rule?: string;
}

export interface BuyingGuideMarketRegime {
  bias: string;
  regime_score_out_of_100: number;
  summary: string;
  macro_risks?: BuyingGuideRisk[];
  index_levels?: BuyingGuideIndexLevels;
  position_sizing_rules?: PositionSizingRules;
}

export interface BuyingGuideStrategy {
  name: string;
  definition: string;
  best_for?: string[];
  condition?: string;
  warning?: string;
  reason?: string;
}

export interface BuyingGuideStock {
  rank: number;
  symbol: string;
  stock: string;
  sector: string;
  latest_price: number;
  day_range?: PriceRange;
  fifty_two_week_range?: PriceRange;
  source?: string;
  setup_score_out_of_100: number;
  risk_grade: string;
  primary_strategy: string;
  secondary_strategies?: string[];
  why_selected: string;
  limit_buy_zone: PriceRange;
  ideal_entry_zone?: PriceRange;
  breakout_entry_above?: number;
  avoid_chasing_above?: number;
  stop_loss?: {
    hard_sl: number;
    closing_basis_sl?: number;
    reason: string;
  };
  targets?: {
    target_1: number;
    target_2: number;
    target_3?: number;
  };
  risk_reward_from_mid_entry?: {
    mid_entry: number;
    risk_per_share: number;
    r_to_t1: number;
    r_to_t2: number;
    r_to_t3?: number;
  };
  trade_management?: {
    book_at_t1?: string;
    trail_after_t2?: string;
    invalid_if?: string;
    special_rule?: string;
  };
  verdict: string;
}

export interface BuyingGuideBasket {
  max_positions?: number;
  stocks: string[];
  reason: string;
}

export interface AvoidedTrade {
  stock_or_sector: string;
  reason: string;
}

export interface ExecutionProtocol {
  before_market_open?: string[];
  first_30_minutes?: string[];
  entry_rules?: string[];
  exit_rules?: string[];
  capital_example?: Record<string, unknown>;
}

export interface BuyingGuide {
  as_of: string;
  cadence?: "weekly" | "daily" | string;
  week_label?: string;
  intent: string;
  disclaimer: string;
  market_regime?: BuyingGuideMarketRegime;
  strategy_framework_considered?: {
    enabled_strategies?: BuyingGuideStrategy[];
    disabled_strategies?: BuyingGuideStrategy[];
  };
  final_watchlist?: BuyingGuideStock[];
  highest_conviction_basket?: BuyingGuideBasket;
  defensive_basket?: BuyingGuideBasket;
  conditional_basket?: BuyingGuideBasket;
  excluded_or_low_priority?: AvoidedTrade[];
  execution_protocol?: ExecutionProtocol;
  final_verdict?: {
    best_8_to_10_watchlist?: string[];
    best_5_for_actual_execution?: string[];
    market_condition?: string;
    brutal_rule?: string;
  };
}

export interface BuyingGuideFilters {
  sector: string;
  riskGrade: string;
  strategy: string;
  verdict: string;
  status: string;
  minScore: number;
  nearBuyZoneOnly: boolean;
  topFiveOnly: boolean;
  hideInvalidated: boolean;
  hideEventRisk: boolean;
}

export type BuyingGuideSortKey =
  | "rank"
  | "setupScore"
  | "rewardRiskT2"
  | "distanceFromBuyZone"
  | "riskPerShare"
  | "latestPrice"
  | "sector";
