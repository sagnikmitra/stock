# Market Context Model

## Goal
Provide a transparent, deterministic, factor-level market posture score for daily pre-market decision support.

## Inputs

- `giftNiftyChangePct`
- `dowFuturesChangePct` (fallback: `dowIndexChangePct`)
- `goldChangePct` (inverse risk cue)
- `crudeChangePct` (inverse risk cue)
- `fiiNetCashCr`

## Factor Interpretation

Each factor is classified as one of:
- `favorable`
- `neutral`
- `hostile`
- `missing`

### Directional factors (GIFT Nifty, Dow)
- `>= +0.3%` => favorable
- `<= -0.3%` => hostile
- otherwise neutral

### Inverse risk factors (Gold, Crude)
- `<= -0.3%` => favorable
- `>= +0.3%` => hostile
- otherwise neutral

### FII cash flow
- `>= +1500 Cr` => favorable
- `<= -1500 Cr` => hostile
- otherwise neutral

## Scoring

Per-factor contribution:
- favorable: `+1`
- neutral: `0`
- hostile: `-1`
- missing: `0`

Raw score range: `[-5, +5]`.

Normalized posture score:
- `score = clamp(2.5 + raw/2, 0, 5)`

Posture bands:
- `favorable` if `score >= 3.4`
- `hostile` if `score <= 1.6`
- `mixed` otherwise

## Explainability Contract

`scoreMarketContext()` emits `breakdown[]` where each factor includes:
- `key`
- `label`
- `value`
- `status`
- `contribution`
- `reason`

This enables:
- digest-level transparent scoring narrative
- degraded-mode visibility for missing providers
- reproducible historical explanations

## Degraded Mode

When one or more factors are missing:
- factor status is `missing`
- contribution is `0`
- summary explicitly flags degraded mode
- no inferred or imputed values are introduced

This preserves deterministic behavior and avoids hidden assumptions.
