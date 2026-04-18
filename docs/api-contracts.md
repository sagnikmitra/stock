# API Contracts

## Digest + Context

- `GET /api/digest` — list digest summaries
- `GET /api/digest/[date]` — digest detail by market date
- `GET /api/market-context` — latest + historical context/fii/breadth with scoring breakdown

## Strategies

- `GET /api/strategies` — strategy summary list
- `GET /api/strategies/[key]` — strategy detail (active version, ambiguities, matches)
- `PATCH /api/admin/strategies/[key]` — update strategy status
- `POST /api/admin/strategies/[key]/activate-version` — activate strategy version

## Screeners

- `GET /api/screeners` — screener list + bundle metadata
- `POST /api/screeners` — run bundle and save watchlist
- `POST /api/screeners/run` — generic set-operation run
- `POST /api/screeners/intersection` — overlap query over completed runs
- `POST /api/admin/screeners/[key]/activate-version` — activate screener version

## Backtests

- `GET /api/backtests` — list backtest runs
- `POST /api/backtests` — execute event-replay backtest and persist metrics/trades
- `GET /api/backtests/[id]` — detailed backtest payload

## References

- `GET /api/references` — public reference list
- `GET /api/admin/references` — admin reference list
- `POST /api/admin/references` — create/upsert reference
- `PATCH /api/admin/references` — update reference metadata

## Ambiguity Ledger

- `GET /api/admin/ambiguities` — ambiguity records
- `PATCH /api/admin/ambiguities` — update normalized note/severity/ui behavior

## Cron + Jobs

- `GET /api/cron/pre-market?force=0|1&attempts=n`
- `GET /api/cron/post-close?force=0|1&attempts=n`
- `GET /api/cron/month-end?force=0|1&attempts=n`
- `GET /api/cron/provider-health?force=0|1&attempts=n`
- `POST /api/admin/cron/trigger` — manual rerun request logging
- Pre/post cron responses include `ingestion` summary when free-data sync is enabled.

## Observability

- `GET /api/admin/observability` — 24h counters + audit/provider telemetry

## Risk + Watchlists + Stocks

- `POST /api/position-size` — quantity and 3R derived values
- `GET/POST /api/watchlists`
- `GET/PATCH/DELETE /api/watchlists/[id]`
- `POST /api/watchlists/[id]/items`
- `GET /api/stocks/[symbol]`
- `GET /api/dashboard`
