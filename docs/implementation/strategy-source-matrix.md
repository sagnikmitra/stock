# Strategy Source Matrix

Canonical mapping of requested strategy version labels to seeded strategy keys/versions.

| Requested Canonical Label | Strategy Key | Version | Current State | Source Session(s) | Notes |
|---|---|---:|---|---|---|
| `bb-monthly-breakout.v1.raw-note` | `investment_bb_monthly` | 1 | seeded (inactive) | 6 | raw-note thresholds preserved |
| `bb-monthly-breakout.v2.normalized-active` | `investment_bb_monthly` | 2 | seeded (active) | 6 | normalized active rule-set |
| `buying-in-dips.v1.canonical` | `swing_buying_the_dips` | 1 | seeded (active) | 7 | canonical monthly RSI + daily dip |
| `buying-in-dips.v0.shorthand-rsi` | `swing_buying_the_dips` | 0 | pending explicit seed entry | 7 + shorthand notes | to be stored as non-active shorthand |
| `cross-strategy.v1.canonical` | `swing_cross` | 1 | seeded (active) | 7 | BB + trendline + VWAP + green candle |
| `abc-strategy.v1.canonical` | `swing_abc` | 1 | seeded (active) | 8 | A/B/C pattern with context |
| `breakout.v1.canonical` | `swing_breakout` | 1 | seeded (active) | 9 | 5-condition breakout logic |
| `btst.v1.canonical` | `swing_btst` | 1 | seeded (active) | 9 | top gainer + volume shocker + timing gate |
| `mbb.v1.heuristic` | `investment_mbb` | 1 | seeded (active) | 6 | heuristic/manual-review required |
| `trend-continuation.v1.initial` | `swing_trend_continuation` | 1 | seeded (active) | 9 | monthly RSI + supertrend continuation |
| `sma-13-34-200.v1` | `swing_sma_13_34_200` | 1 | seeded (active) | 9 | MA crossover with 200 trend filter |
| `sma-44.v1` | `swing_sma_44` | 1 | seeded (active) | 9 | reclaim + support use of 44 SMA |
| `ema-9-15-supertrend-4h.v1` | `swing_ema_9_15_st_4h` | 1 | seeded (active) | 9 | fast swing 4H template |

## Ambiguity Notes

- BB monthly thresholds (`price`, `RSI`) already represented in ambiguity ledger.
- Buying-in-dips shorthand variant exists in notes but not as explicit version row yet.
- MBB remains explicitly heuristic and requires manual confirmation in workflow.

