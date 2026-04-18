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
- Playwright smoke execution inside sandboxed CI/runtime (Chromium launch permissions)
- Provider adapters for production data ingestion and trading-calendar month-end gating

### Recently Completed
- Digest archive/detail/month-end screens and API list endpoints
- Strategy detail enhancements (active/raw DSL view, ambiguity display, source references, match history)
- Screener Lab overlap UI with set operations + explanation drawer
- Source references page + admin reference manager
- Risk calculator 2% sizing + 3R worksheet
- Cron helper framework: month-end gating, retries, degraded digest summary semantics
- Transparent market context scoring model with factor-level breakdown
- Backtest execution APIs and run-from-UI flow
- Admin CMS controls for strategy/screener activation + ambiguity updates
- Observability page and API over audit/provider run telemetry
- Expanded docs: API contracts, deployment, testing, cron spec, market context model, screen matrix, env guide
- Free-data sync layer for pre-market/post-close cron and worker CLI (provider fallback + persisted quote/FII/breadth/candle snapshots)

## Docs

Implementation audit and roadmap live under [`docs/implementation`](docs/implementation).
Free setup guide for personal use: [`docs/free-data-setup.md`](docs/free-data-setup.md).
