# Gap Audit (Batch 1)

Date: 2026-04-16

## Scope

Audit performed against `prompt.md` + Session notes (`S1`, `S4`–`S9`) + `classnotes.md` + current repository implementation.

## Summary

Current repo already includes major architecture blocks (DB schema, strategy engine, worker pipelines, and baseline web/admin routes). Largest gaps are consistency/hardening gaps, not greenfield absence.

## Subsystem Audit

### Strategy / DSL
- Implemented:
  - Strategy DSL types and parser (`packages/types/src/strategy-dsl.ts`, `packages/strategy-engine/src/dsl/parser.ts`)
  - Strategy evaluation + explanation (`packages/strategy-engine/src/evaluators/*`, `packages/strategy-engine/src/explainers/*`)
  - Seeded strategy families from sessions 6–9 (`packages/db/prisma/seed/strategies.ts`)
- Gaps:
  - Validation is permissive and not screener-aware.
  - Canonical version labels requested in execution brief are not formalized as first-class registry metadata.
  - Explainability exists but lacks standardized structured trace output.

### Screeners
- Implemented:
  - Screener entities and versions in DB schema.
  - Screener evaluator + intersection engine + confluence scoring.
  - Seed screener set with internal and external references.
- Gaps:
  - Requested internal screener key naming (`*_internal`, explicit candidate names) not fully aligned.
  - `/api/screeners` and `/api/screeners/run` contracts not implemented.
  - Bundle save/workflow not present as explicit API contract.

### Digest + Jobs
- Implemented:
  - Worker pipelines for pre-market, post-close, month-end digests.
  - Global context scoring model and persisted snapshots.
  - Admin jobs page backed by `ProviderJobRun`.
- Gaps:
  - Cron API routes duplicate simplified logic and are not lock/retry hardened.
  - Idempotency + lock semantics not explicit.
  - Manual rerun exists as audit acknowledgement only; no robust force-rerun semantics.
  - Degraded mode behavior inconsistent across digest views/routes.

### UI (Spec-Critical)
- Implemented:
  - Dashboard (`/`)
  - Strategy pages, screener lab, watchlists, learning, backtest views
  - Pre-market and post-close digest pages
  - Admin pages for strategies/screeners/ambiguities/providers/jobs/flags
  - Position size calculator
- Gaps:
  - `/digest`, `/digest/[date]`, `/digest/month-end` files missing.
  - Strategy detail lacks explicit source-reference block and ambiguity resolution UX.
  - Screener lab lacks integrated set-ops drawer and overlap explanation panel.
  - Source references page and admin source manager missing.
  - Disclaimer placement/accessibility consistency needs hardening.

### Backtest + Admin CMS + Observability
- Implemented:
  - Backtest engine (`runBacktest`) and backtest pages.
  - Admin strategy status/version activation APIs.
  - Provider health cron endpoint.
- Gaps:
  - Backtest API surfaces in `apps/web/app/api/backtests*` directories are missing.
  - Admin CMS editing for screener versions and ambiguity records not implemented.
  - Observability hooks/counters are minimal and not exposed in unified dashboard.

### Tests
- Implemented:
  - No runnable test tasks currently configured in packages.
- Gaps:
  - Unit, integration, and e2e coverage expected by acceptance criteria missing.
  - Playwright smoke suite missing.

## Highest-Risk Items

1. Cron path divergence (worker vs web route logic) causing non-deterministic behavior.
2. Missing deterministic test harness for strategy/screener evaluation.
3. API contract drift versus expected endpoint set in `prompt.md`.
4. Missing explicit degraded mode guarantees when provider data is unavailable.

