# Environment Variables

Canonical reference: `.env.example`.

## Required for local development

- `DATABASE_URL`
- `DIRECT_URL`
- `CRON_SECRET`

## Optional by capability

- Provider keys (`TWELVEDATA_API_KEY`, `FMP_API_KEY`, broker credentials)
- Supabase frontend/backend keys
- Feature flag toggles
- Observability (Sentry)
- Free-data sync tuning:
  - `FREE_DATA_SYNC_ENABLED` (`true` by default)
  - `FREE_QUOTES_PROVIDER_PRIORITY`
  - `FREE_CONTEXT_PROVIDER_PRIORITY`
  - `FREE_CANDLE_PROVIDER_PRIORITY`
  - `FREE_DATA_PREMARKET_SYMBOL_LIMIT`
  - `FREE_DATA_POSTCLOSE_SYMBOL_LIMIT`
  - `FREE_DATA_BOOTSTRAP_DAYS`
  - `FREE_DATA_SYMBOL_UNIVERSE_LIMIT` (`0`/unset = uncapped sync)
- No-key quote fallback:
  - `INDIAN_STOCK_MARKET_API_BASE_URL` (defaults to `https://nse-api-ruby.vercel.app`)

## Notes

- Keep provider credentials server-side.
- Do not expose private keys in `NEXT_PUBLIC_*` variables.
- If DB vars are unset, read-only pages use fallback mode; write routes return errors.
- For free-only personal usage, keep `nse_official` enabled, use `indian_stock_market_api` as quote fallback, and add vendor keys only for deeper fallback.
