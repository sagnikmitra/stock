# Screener Source Matrix

Mapping requested internal screener set to current seeded keys and normalization actions.

| Requested Internal Key | Current Seed Key | Status | Linked Strategy | Source Session(s) | Normalization Action |
|---|---|---|---|---|---|
| `investment_bb_internal` | `investment_bb_internal` | seeded | `investment_bb_monthly` | 6 | canonical internal key |
| `trend_continuation_internal` | `trend_continuation_internal` | seeded | `swing_trend_continuation` | 9 | canonical internal key |
| `ema_9_15_supertrend_4h_internal` | `ema_9_15_supertrend_4h_internal` | seeded | `swing_ema_9_15_st_4h` | 9 | canonical internal key |
| `sma_13_34_internal` | `sma_13_34_internal` | seeded | `swing_sma_13_34_200` | 9 | canonical internal key |
| `sma_44_internal` | `sma_44_internal` | seeded | `swing_sma_44` | 9 | canonical internal key |
| `rsi_above_80_internal` | `rsi_above_80_internal` | seeded | n/a | 5/9 context | canonical internal key |
| `nse_52_week_high_internal` | `nse_52_week_high_internal` | seeded | breakout stack | 9 | internal reference-linked source |
| `breakout_quality_internal` | `breakout_quality_internal` | seeded | `swing_breakout` | 9 | canonical internal key |
| `btst_top_gainers_volume_shockers_internal` | `btst_top_gainers_volume_shockers_internal` | seeded | `swing_btst` | 9 | canonical internal key |
| `buying_in_dips_candidate` | `buying_in_dips_candidate` | seeded | `swing_buying_the_dips` | 7 | canonical internal key |
| `cross_strategy_candidate` | `cross_strategy_candidate` | seeded | `swing_cross` | 7 | added explicit screener DSL |
| `abc_strategy_candidate` | `abc_strategy_candidate` | seeded | `swing_abc` | 8 | canonical internal key |
| `mbb_candidate` | `mbb_candidate` | seeded | `investment_mbb` | 6 | canonical internal key |

## Bundle Targets

Bundles to expose via screener API:

- `month_end_investment`: `investment_bb_internal`, `mbb_candidate`, `nse_52_week_high_internal`
- `swing_daily_check`: `buying_in_dips_candidate`, `cross_strategy_candidate`, `abc_strategy_candidate`, `trend_continuation_internal`
- `breakout_radar`: `breakout_quality_internal`, `nse_52_week_high_internal`, `rsi_above_80_internal`
- `btst_radar`: `btst_top_gainers_volume_shockers_internal`, `breakout_quality_internal`
- `strong_confluence_set`: `trend_continuation_internal`, `breakout_quality_internal`, `sma_13_34_internal`, `ema_9_15_supertrend_4h_internal`
