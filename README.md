# Investment Bible OS (`stock`)

Course-informed market operating system for Indian equity cash workflows.

## Current Status

### Completed Core
- Monorepo scaffold and shared packages (`@ibo/types`, `@ibo/strategy-engine`, `@ibo/db`, `@ibo/web`, `@ibo/worker`)
- Prisma schema covering strategies, screeners, digests, backtests, provider jobs, ambiguities, and audit events
- Seed data for strategy catalog, screener catalog, provider registry, ambiguity ledger, and external references
- Worker pipelines for pre-market, post-close, and month-end digest generation
- Strategy/screener evaluation engine, indicator builder, intersection, confluence, and position sizing utilities
- Base dashboard, strategies, screener lab, backtest, learning, watchlists, and admin pages

### In Progress / Partial
- DSL schema hardening and canonical strategy version normalization tags
- Internal screener key normalization to requested internal naming set
- Digest API/UI unification (`/digest`, `/digest/[date]`, pre/close/month-end consistency)
- Cron idempotency/lock/retry/audit + manual rerun behavior
- Backtest API completion and admin CMS editing workflows

### Missing Before Final Acceptance
- Full docs set (`api-contracts`, `deployment`, `testing`, cron/model specs, screen matrix)
- Deterministic unit/integration/e2e test coverage across DSL, screener math, month-end gating, degraded digest mode
- Source reference management UI/API pair
- Playwright smoke suite for spec-critical routes

## Docs

Implementation audit and roadmap live under [`docs/implementation`](docs/implementation).

