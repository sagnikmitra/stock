# Screener Source Matrix

Mapping requested internal screener set to current seeded keys and normalization actions.

| Requested Internal Key | Current Seed Key | Status | Linked Strategy | Source Session(s) | Normalization Action |
|---|---|---|---|---|---|
| `investment_bb_internal` | `investment_bb_reference` | partial | `investment_bb_monthly` | 6 | rename + keep alias |
| `trend_continuation_internal` | `trend_continuation` | partial | `swing_trend_continuation` | 9 | rename + keep alias |
| `ema_9_15_supertrend_4h_internal` | `ema_9_15_supertrend_4h` | partial | `swing_ema_9_15_st_4h` | 9 | rename + keep alias |
| `sma_13_34_internal` | `sma_13_34` | partial | `swing_sma_13_34_200` | 9 | rename + keep alias |
| `sma_44_internal` | `sma_44` | partial | `swing_sma_44` | 9 | rename + keep alias |
| `rsi_above_80_internal` | `rsi_above_80` | partial | n/a | 5/9 context | rename + keep alias |
| `nse_52_week_high_internal` | `nse_52_week_high` | partial | breakout stack | 9 | rename + mark source linked |
| `breakout_quality_internal` | `breakout_quality` | partial | `swing_breakout` | 9 | rename + keep alias |
| `btst_top_gainers_volume_shockers_internal` | `btst_candidate` | partial | `swing_btst` | 9 | rename + add explicit top-gainer wording |
| `buying_in_dips_candidate` | `buying_the_dips` | partial | `swing_buying_the_dips` | 7 | rename + keep alias |
| `cross_strategy_candidate` | (missing explicit) | missing | `swing_cross` | 7 | add new screener DSL |
| `abc_strategy_candidate` | `abc_correction` | partial | `swing_abc` | 8 | rename + retain correction subfilter |
| `mbb_candidate` | `investment_mbb` | partial | `investment_mbb` | 6 | rename + keep alias |

## Bundle Targets

Bundles to expose via screener API:

- `month_end_investment`: `investment_bb_internal`, `mbb_candidate`, `nse_52_week_high_internal`
- `swing_daily_check`: `buying_in_dips_candidate`, `cross_strategy_candidate`, `abc_strategy_candidate`, `trend_continuation_internal`
- `breakout_radar`: `breakout_quality_internal`, `nse_52_week_high_internal`, `rsi_above_80_internal`
- `btst_radar`: `btst_top_gainers_volume_shockers_internal`, `breakout_quality_internal`
- `strong_confluence_set`: `trend_continuation_internal`, `breakout_quality_internal`, `sma_13_34_internal`, `ema_9_15_supertrend_4h_internal`

