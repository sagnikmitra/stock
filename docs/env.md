# Environment Variables

Canonical reference: `.env.example`.

## Required for local development

- `DATABASE_URL`
- `DIRECT_URL`
- `CRON_SECRET`

## Optional by capability

- Provider keys (`TWELVE_DATA_API_KEY`, `FMP_API_KEY`, broker credentials)
- Supabase frontend/backend keys
- Feature flag toggles
- Observability (Sentry)

## Notes

- Keep provider credentials server-side.
- Do not expose private keys in `NEXT_PUBLIC_*` variables.
- If DB vars are unset, read-only pages use fallback mode; write routes return errors.
