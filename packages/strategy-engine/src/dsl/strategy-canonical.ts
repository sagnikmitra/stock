export interface CanonicalStrategyVersion {
  canonicalVersionTag: string;
  strategyKey: string;
  version: number;
  status: "active" | "inactive" | "reference";
  notes?: string;
}

export const CANONICAL_STRATEGY_VERSIONS: CanonicalStrategyVersion[] = [
  {
    canonicalVersionTag: "bb-monthly-breakout.v1.raw-note",
    strategyKey: "investment_bb_monthly",
    version: 1,
    status: "inactive",
  },
  {
    canonicalVersionTag: "bb-monthly-breakout.v2.normalized-active",
    strategyKey: "investment_bb_monthly",
    version: 2,
    status: "active",
  },
  {
    canonicalVersionTag: "buying-in-dips.v1.canonical",
    strategyKey: "swing_buying_the_dips",
    version: 1,
    status: "active",
  },
  {
    canonicalVersionTag: "buying-in-dips.v0.shorthand-rsi",
    strategyKey: "swing_buying_the_dips",
    version: 0,
    status: "inactive",
    notes: "Stored as shorthand reference; not default active version.",
  },
  {
    canonicalVersionTag: "cross-strategy.v1.canonical",
    strategyKey: "swing_cross",
    version: 1,
    status: "active",
  },
  {
    canonicalVersionTag: "abc-strategy.v1.canonical",
    strategyKey: "swing_abc",
    version: 1,
    status: "active",
  },
  {
    canonicalVersionTag: "breakout.v1.canonical",
    strategyKey: "swing_breakout",
    version: 1,
    status: "active",
  },
  {
    canonicalVersionTag: "btst.v1.canonical",
    strategyKey: "swing_btst",
    version: 1,
    status: "active",
  },
  {
    canonicalVersionTag: "mbb.v1.heuristic",
    strategyKey: "investment_mbb",
    version: 1,
    status: "active",
  },
  {
    canonicalVersionTag: "trend-continuation.v1.initial",
    strategyKey: "swing_trend_continuation",
    version: 1,
    status: "active",
  },
  {
    canonicalVersionTag: "sma-13-34-200.v1",
    strategyKey: "swing_sma_13_34_200",
    version: 1,
    status: "active",
  },
  {
    canonicalVersionTag: "sma-44.v1",
    strategyKey: "swing_sma_44",
    version: 1,
    status: "active",
  },
  {
    canonicalVersionTag: "ema-9-15-supertrend-4h.v1",
    strategyKey: "swing_ema_9_15_st_4h",
    version: 1,
    status: "active",
  },
];

export function getCanonicalStrategyVersion(
  tag: string,
): CanonicalStrategyVersion | undefined {
  return CANONICAL_STRATEGY_VERSIONS.find((version) => version.canonicalVersionTag === tag);
}

