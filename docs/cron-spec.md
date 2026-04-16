# Cron Spec

## Objective
Deterministic, idempotent cron orchestration for digest and provider jobs with explicit lock, retry, and audit behavior.

## Jobs

| Job | Route | Default Schedule (IST) | Purpose |
|---|---|---:|---|
| Pre-market | `/api/cron/pre-market` | 08:30 | Global cues + FII/DII context scoring + pre-market digest |
| Post-close | `/api/cron/post-close` | 16:30 | Indicator snapshots + strategy/screener runs + post-close digest |
| Month-end | `/api/cron/month-end` | Last calendar day, 17:00 | Investment-only month-end evaluation + month-end digest |
| Provider health | `/api/cron/provider-health` | every 30 min | Provider latency/availability checks |

## Authorization
All cron endpoints require:
- `Authorization: Bearer <CRON_SECRET>`

## Idempotency + Locking

- Lock key format: `<jobKey>:<YYYY-MM-DD>`.
- Lock acquisition writes `auditEvent(action="cron_lock_acquired")`.
- Successful completion writes `auditEvent(action="cron_completed")`.
- Failure writes `auditEvent(action="cron_failed")`.
- If a completed run already exists for the same lock key, endpoint returns `status=skipped` unless `force=1`.

## Query Controls

- `force=1`: bypass completed/active lock checks.
- `attempts=<n>`: retry attempts for retriable jobs.

## Month-End Gating

- `month-end` route is gated by `isCalendarMonthEnd(date)` unless `force=1`.
- On non-month-end days, route returns:
  - `status=skipped`
  - `reason=not_month_end`
  - `auditEvent(action="month_end_gated")`

## Degraded Mode

Pre-market digest enters degraded mode when one or more required factors are missing:
- missing global cues
- missing FII/DII flows
- missing prior context

Behavior:
- missing factors are neutralized (never guessed)
- digest summary explicitly includes `DEGRADED MODE`
- audit event includes degraded metadata (`warnings`, `missingFactors`)

## Manual Rerun

`POST /api/admin/cron/trigger`
- accepts `pipeline`, `force`, and `attempts`
- writes audit event `cron_pipeline_triggered`
- execution remains owned by cron endpoint/worker invocation

## Failure Semantics

- Partial or failed provider/context fetches are represented as warnings.
- Hard exceptions return HTTP 500 and write `cron_failed` audit event.
- Completed responses always include date-scoped metadata for traceability.
