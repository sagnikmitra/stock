# Strategy DSL

Typed JSON rule language for strategy and screener definitions.

## Objectives

- Deterministic evaluation from stored JSON rules.
- Explicit ambiguity/version tracking via `canonicalVersionTag`.
- Explainable condition-by-condition output.

## Core Types

### Filter condition

```json
{
  "field": "daily.close",
  "operator": ">",
  "valueRef": "daily.sma44",
  "kind": "hard",
  "label": "Close above 44 SMA"
}
```

Rules:
- `field` must be `scope.path` where scope is one of:
  - `daily`, `weekly`, `monthly`, `h4`, `derived`, `instrument`
- `operator` must be one of: `>=`, `>`, `<=`, `<`, `==`, `!=`
- exactly one of `value` or `valueRef` must be provided
- `kind` defaults to hard behavior when omitted

### Strategy DSL

```json
{
  "key": "swing_breakout",
  "family": "swing",
  "reviewFrequency": "daily",
  "primaryTimeframe": "D1",
  "canonicalVersionTag": "breakout.v1.canonical",
  "filters": [
    { "field": "daily.close", "operator": ">", "valueRef": "daily.sma44", "kind": "hard" },
    { "field": "daily.rsi14", "operator": ">=", "value": 60, "kind": "soft" }
  ],
  "entry": { "type": "confirmation_close" },
  "stopLoss": { "type": "recent_swing_low", "timeframe": "D1", "lookbackBars": 15 }
}
```

### Screener DSL

```json
{
  "key": "breakout_quality_internal",
  "canonicalVersionTag": "breakout.v1.canonical",
  "filters": [
    { "field": "daily.candle_body_pct", "operator": ">=", "value": 70, "kind": "hard" },
    { "field": "daily.volume_ratio_20", "operator": ">", "value": 1.5, "kind": "hard" }
  ],
  "sortBy": "daily.volume_ratio_20",
  "sortDir": "desc",
  "limit": 100
}
```

## Validation APIs

- `parseStrategyDSL(json)`
- `validateStrategyDSL(json)`
- `parseScreenerDSL(json)`
- `validateScreenerDSL(json)`
- legacy compatibility wrappers:
  - `parseDSL(json)`
  - `validateDSL(json)`

Validation output shape:

```ts
{
  valid: boolean;
  errors: Array<{ code: string; path: string; message: string }>;
  normalized: StrategyDSL | ScreenerDSL | null;
}
```

## Explainability Output

Each evaluated condition now includes:
- resolved field trace (`field:requested->resolved`)
- missing fields list when data unavailable
- normalized pass/fail reason string

Strategy result includes aggregate explainability:
- passed/failed counts
- hard failed count
- soft pass ratio components

## Canonical Version Mapping

Canonical tags used in this codebase include:
- `bb-monthly-breakout.v1.raw-note`
- `bb-monthly-breakout.v2.normalized-active`
- `buying-in-dips.v0.shorthand-rsi`
- `buying-in-dips.v1.canonical`
- `cross-strategy.v1.canonical`
- `abc-strategy.v1.canonical`
- `breakout.v1.canonical`
- `btst.v1.canonical`
- `mbb.v1.heuristic`
- `trend-continuation.v1.initial`
- `sma-13-34-200.v1`
- `sma-44.v1`
- `ema-9-15-supertrend-4h.v1`

