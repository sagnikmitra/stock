# Free Data Setup (NSE-first)

Use this when you want a zero-paid setup for personal analysis and daily digests.

## 1. Environment

Start from `.env.example` and keep these values:

- `FREE_DATA_SYNC_ENABLED=true`
- `FREE_QUOTES_PROVIDER_PRIORITY=nse_official,indian_stock_market_api,twelvedata,fmp`
- `FREE_CONTEXT_PROVIDER_PRIORITY=nse_official,twelvedata,fmp`
- `FREE_CANDLE_PROVIDER_PRIORITY=nse_official,twelvedata,fmp`

Optional tuning:

- `FREE_DATA_PREMARKET_SYMBOL_LIMIT=80`
- `FREE_DATA_POSTCLOSE_SYMBOL_LIMIT=140`
- `FREE_DATA_BOOTSTRAP_DAYS=420`
- `FREE_DATA_SYMBOL_UNIVERSE_LIMIT=0` (`0`/unset = uncapped NSE symbol sync)

Notes:

- Pure free mode works with `nse_official`; `indian_stock_market_api` can be enabled as quote fallback.
- Keep `TWELVEDATA_API_KEY`/`FMP_API_KEY` empty unless you want free-tier fallback.

## 2. Provider Registry

Seed DB and ensure provider flags:

- `nse_official` -> `isEnabled=true`
- `indian_stock_market_api` -> `isEnabled=true` (quote/search fallback; no candle history endpoint)
- `twelvedata` / `fmp` -> optional fallback (`isEnabled=true` only if key configured)

## 3. Daily Run Order

- Pre-market: `GET /api/cron/pre-market`
- Post-close: `GET /api/cron/post-close`

Both routes now execute free-data ingestion before digest generation.
On first run, if no active instruments exist, free-sync auto-bootstraps NSE symbols.

### One-time bootstrap (recommended for first setup)

Run:

- `npm run bootstrap:personal`

This performs:

- free pre-market sync
- free post-close sync
- synthetic candle seeding fallback when providers return no historical candles
- pre-market + post-close digest generation
- a 1-week swing backtest run

## 4. What Gets Stored

- `QuoteSnapshot` (live quote snapshots)
- `FiiDiiSnapshot` (if source supports)
- `MarketBreadthSnapshot` (if source supports)
- `Candle` (`D1`, with bootstrap + incremental overlap)

## 5. Validation

Inspect latest data in UI:

- `/market-context/global-cues`
- `/market-context/fii-dii`
- `/market-context/breadth`
- `/digest/pre-market`
- `/digest/close`
- `/screener-lab`

## 6. Troubleshooting

- If NSE blocks requests temporarily, warnings will appear in `ingestion.warnings` on cron responses.
- If no data is returned, reduce symbol limits and rerun cron with `force=1`.
- Use `GET /api/cron/provider-health` to verify provider reachability.
