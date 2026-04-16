# Remaining Roadmap (Execution Order)

## Batch 2 — Strategy + Screener DSL Hardening
- Implement strict typed validators for strategy and screener DSL payloads.
- Add normalized canonical strategy version registry mapping.
- Improve evaluator explainability with deterministic condition traces.
- Add `docs/strategy-dsl.md` + unit tests.

Exit criteria:
- Invalid DSL rejected with field-level error list.
- Canonical versions visible in code and docs.
- Unit tests pass for parser/validator/evaluator.

## Batch 3 — Internal Screeners + Bundles
- Normalize screener keys to requested internal names.
- Implement screener list/run API contracts.
- Add screener bundle presets and save workflow.
- Add `docs/screener-registry.md` + tests for intersection/set math.

Exit criteria:
- All requested screener keys resolvable.
- Bundle payloads available for:
  - Month End Investment
  - Swing Daily Check
  - Breakout Radar
  - BTST Radar
  - Strong Confluence Set

## Batch 4 — Digest + Context + Jobs
- Add transparent context breakdown model.
- Add cron lock/idempotency/retry/audit wrappers.
- Harden degraded mode digest rendering when provider data is missing.
- Add `docs/cron-spec.md` and `docs/market-context-model.md`.
- Add integration tests for month-end gating + degraded mode.

Exit criteria:
- Repeated same-day cron calls no-op unless force rerun.
- Retry behavior logged.
- Digest routes return deterministic degraded payload.

## Batch 5 — UI Completion
- Complete `/digest`, `/digest/[date]`, `/digest/month-end`.
- Upgrade strategy detail, screener lab, source references/admin manager, risk calculator.
- Add disclaimer + accessibility checks + responsive polish.
- Add `docs/screen-matrix.md` + Playwright smoke tests.

Exit criteria:
- All spec-critical screens render with data fallback.
- Core route smoke tests pass.

## Batch 6 — Backtest + Admin CMS + Hardening
- Implement backtest APIs and trigger/run contract.
- Add admin CMS editing for strategy/screener versions + ambiguity ledger actions.
- Add provider health/observability surfaces.
- Final docs: `api-contracts`, `deployment`, `testing`, env cleanup.
- Acceptance tests:
  - Screener set math
  - Month-end gating
  - Degraded digest mode
  - Deterministic strategy runs

Exit criteria:
- API/docs/tests aligned with shipped behavior.
- Final risk register explicitly documented.

