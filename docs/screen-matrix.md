# Screen Matrix

## Spec-Critical Screens

| Screen | Route | Status | Notes |
|---|---|---|---|
| Dashboard | `/` | Complete | Posture snapshot, strategy split, digest link, disclaimer |
| Digest archive | `/digest` | Complete | Pre/post/month-end cards with type badges |
| Digest detail by date | `/digest/[date]` | Complete | Multi-type date view with sections + mentions |
| Pre-market digest | `/digest/pre-market` | Complete | Posture + context section rendering |
| Post-close digest | `/digest/close` | Complete | Strategy/screener highlights |
| Month-end digest | `/digest/month-end` | Complete | Month-end investment digest view |
| Strategies list | `/strategies` | Complete | Family and confidence routing |
| Strategy detail | `/strategies/[strategyKey]` | Complete | Active/raw DSL, ambiguities, sources, matches, history, backtest link |
| Screener Lab | `/screener-lab` | Complete | Set operations + overlap view + explanation drawer |
| Screener API playground | `/screener-lab/intersections` | Complete | Request shape examples and key registry |
| Source references | `/references` | Complete | Category-grouped external links (reference only) |
| Admin references manager | `/admin/references` | Complete | CRUD-lite upsert manager |
| Risk calculator | `/tools/position-size` | Complete | 2% sizing + 3R worksheet |
| Backtest dashboard | `/backtest` | Complete | Run form + history cards |
| Backtest detail | `/backtest/[id]` | Complete | Metrics + trades |
| Admin CMS | `/admin/cms` | Complete | Strategy/screener activation + ambiguity update |
| Observability | `/admin/observability` | Complete | Cron/degraded/provider hooks |

## Accessibility/Responsive Notes

- Mobile quick-nav is available via top sticky header (`lg:hidden`) so primary routes remain reachable.
- Buttons and toggles include semantic labels/roles where interactive controls are client-side.
- Page-level disclaimer rendered globally in layout footer.
