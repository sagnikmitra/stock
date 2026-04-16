# Testing

## Commands

- `npm test` — workspace tests (strategy-engine + web helper tests)
- `npm run build` — compile all workspaces

## Coverage focus

### Unit
- DSL schema parsing/validation (`parser.test.ts`)
- Strategy evaluator explainability + deterministic behavior (`strategy-evaluator.test.ts`)
- Market context model scoring and degraded handling (`market-context.test.ts`)
- Screener set math + confluence bucketing (`intersection.test.ts`)

### Integration-style helper tests
- Month-end gating helper (`isCalendarMonthEnd`)
- Degraded digest summary contract (`buildDigestSummary`)

### E2E smoke (Playwright)
- Route-load smoke for key screens
- Basic visibility checks for dashboard, digest, strategy, screener lab, risk calculator

## Acceptance checklist mapping

- Screener set math: covered by `intersection.test.ts`
- Month-end gating: covered by `apps/web/tests/cron-helpers.test.ts`
- Degraded digest mode: covered by `apps/web/tests/cron-helpers.test.ts` + context tests
- Deterministic strategy runs: covered by `strategy-evaluator.test.ts`
