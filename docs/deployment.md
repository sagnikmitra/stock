# Deployment

## Runtime

- Node.js 20+
- PostgreSQL (Supabase-compatible)
- Next.js app (`apps/web`)
- Optional worker (`apps/worker`) for pipeline execution

## Environment

1. Copy `.env.example` to `.env` (local) or platform secrets.
2. Set required values:
   - `DATABASE_URL`
   - `DIRECT_URL`
   - `CRON_SECRET`
3. Configure provider keys only for adapters you enable.

## Database bootstrap

1. `npm run db:generate`
2. `npm run db:push`
3. `npm run db:seed`

## Build + Run

- `npm run build`
- `npm run dev` (local)
- `npm run start` (production runtime)

## Cron wiring

Set external scheduler hits (with auth):
- `/api/cron/pre-market`
- `/api/cron/post-close`
- `/api/cron/month-end`
- `/api/cron/provider-health`

Header:
- `Authorization: Bearer <CRON_SECRET>`

## Safety controls

- Idempotent lock key: `<job>:<marketDate>`
- `force=1` for manual override
- `attempts=n` for retry tuning
- Audit event trail for trigger/complete/fail/degraded
