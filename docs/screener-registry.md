# Screener Registry

## Internal Screeners (Reference-Linked)

| Key | Purpose | Linked Strategy | Source Session |
|---|---|---|---|
| `investment_bb_internal` | Month-end BB breakout candidates | `investment_bb_monthly` | 6 |
| `mbb_candidate` | Monthly MBB dip candidates (heuristic) | `investment_mbb` | 6 |
| `trend_continuation_internal` | Continuation setups with monthly + daily context | `swing_trend_continuation` | 9 |
| `ema_9_15_supertrend_4h_internal` | Fast-swing 4H EMA + SuperTrend | `swing_ema_9_15_st_4h` | 9 |
| `sma_13_34_internal` | 13/34 crossover with long-trend filter | `swing_sma_13_34_200` | 9 |
| `sma_44_internal` | 44-SMA support/reclaim setups | `swing_sma_44` | 9 |
| `rsi_above_80_internal` | Momentum extension monitor | n/a | derived |
| `nse_52_week_high_internal` | 52-week-high internal candidate list | breakout stack | 9 |
| `breakout_quality_internal` | High-quality breakout filters | `swing_breakout` | 9 |
| `btst_top_gainers_volume_shockers_internal` | BTST overnight candidates | `swing_btst` | 9 |
| `buying_in_dips_candidate` | Canonical buying-in-dips candidates | `swing_buying_the_dips` | 7 |
| `cross_strategy_candidate` | Cross strategy candidates | `swing_cross` | 7 |
| `abc_strategy_candidate` | ABC strategy candidates | `swing_abc` | 8 |

## External Reference Screeners

- `chartink_volume_shockers` → https://chartink.com/screener/volume-shockers
- `chartink_52w_high` → https://chartink.com/screener/52-week-high-breakout

## Bundle Presets

### Month End Investment
- `investment_bb_internal`
- `mbb_candidate`
- `nse_52_week_high_internal`

### Swing Daily Check
- `buying_in_dips_candidate`
- `cross_strategy_candidate`
- `abc_strategy_candidate`
- `trend_continuation_internal`

### Breakout Radar
- `breakout_quality_internal`
- `nse_52_week_high_internal`
- `rsi_above_80_internal`

### BTST Radar
- `btst_top_gainers_volume_shockers_internal`
- `breakout_quality_internal`

### Strong Confluence Set
- `trend_continuation_internal`
- `breakout_quality_internal`
- `sma_13_34_internal`
- `ema_9_15_supertrend_4h_internal`

## APIs

- `GET /api/screeners`
  - returns screener registry + bundle definitions
- `POST /api/screeners/run`
  - evaluates saved screener run results for provided keys/date
- `POST /api/screeners`
  - saves a bundle result set as a generated watchlist
- `POST /api/screeners/intersection`
  - direct intersection/union/difference over completed screener runs

