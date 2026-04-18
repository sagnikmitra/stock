# UI Design Audit — Visual Hierarchy, Responsiveness, and Overflow

Date: 2026-04-17
Base URL audited: `http://localhost:3000`

## Scope
- Full linked-route audit from dashboard crawl + forced core routes.
- 30 routes audited across 5 viewports each:
  - Desktop `1440x900`
  - Laptop `1024x768`
  - Tablet `768x1024`
  - Mobile large `430x932`
  - Mobile small `360x740`
- Total checks: 150

## Route Coverage
- `/`
- `/admin/cms`
- `/admin/observability`
- `/admin/references`
- `/admin/strategies`
- `/backtest`
- `/digest`
- `/digest/close`
- `/digest/month-end`
- `/digest/pre-market`
- `/digest/weekly`
- `/learning/ambiguities`
- `/learning/concepts`
- `/learning/sessions`
- `/market-context/global-cues`
- `/references`
- `/screener-lab`
- `/stocks`
- `/strategies`
- `/strategies/investment_bb_monthly`
- `/strategies/investment_mbb`
- `/strategies/swing_abc`
- `/strategies/swing_breakout`
- `/strategies/swing_btst`
- `/strategies/swing_buying_the_dips`
- `/strategies/swing_cross`
- `/strategies/swing_sma_13_34_200`
- `/strategies/swing_trend_continuation`
- `/tools/position-size`
- `/watchlists`

## Baseline vs Current
- Baseline (before fixes in this audit cycle):
  - Critical: 0
  - Major: 5
  - Moderate: 115
  - OK: 30
- Current (after fixes):
  - Critical: 0
  - Major: 0
  - Moderate: 105
  - OK: 45

## Fixes Applied During Audit
1. Added missing page-level heading structure on weekly digest route.
   - File: `apps/web/app/digest/weekly/page.tsx`
   - Change: added `PageHeader` with `h1` semantics.
2. Increased mobile top quick-link chip tap size.
   - File: `apps/web/app/components/nav/sidebar.tsx`
   - Change: mobile quick nav chips now render at 40px height with larger label padding.
3. Added Material UI App Router cache provider to eliminate hydration class-name mismatch warnings.
   - File: `apps/web/app/providers.tsx`
   - Change: wrapped theme tree with `AppRouterCacheProvider`.

## Findings

### 1) Global Horizontal Overflow
- Status: PASS
- Result: no document-level horizontal overflow detected on any route/viewport.
- Max `overflowX`: `0px`.

### 2) Component-Level Overflow/Clipping
- Status: LOW RISK
- Horizontal scroll is intentional on mobile quick-link strips and no longer treated as a defect.
- `/strategies` uses intentional text clamping (`line-clamp-2`) for card summary text; this is a design decision, not a rendering failure.

### 3) Visual Hierarchy (Heading Order)
- Status: NEEDS CLEANUP
- 20/30 routes show heading-level jumps (example pattern: `h1` then `h3/h4` without `h2`).
- This affects semantic hierarchy and assistive navigation.
- Most of this comes from card/section title component choices rather than layout breakage.

### 4) Mobile Tap Target Density
- Status: NEEDS IMPROVEMENT
- Highest-density routes still include many sub-40px clickable controls:
  - `/screener-lab` (up to 15)
  - `/references` (up to 15)
  - Strategy detail pages (up to 13)
  - `/tools/position-size` (up to 11)
- Main source is compact chip/link rows and utility actions.

### 5) Responsive Layout Behavior
- Status: STABLE (with UX pressure points)
- No hard overflow breaks observed.
- Content stacks correctly on tablet/mobile.
- UX pressure point: mobile information density is high on screener/strategy/detail screens, reducing scan speed and increasing accidental-tap risk.

### 6) Runtime/Console Observations
- Current final sweep status: PASS (0 console warnings/errors captured across all 150 checks).
- Earlier hydration warning noise was removed after wiring `AppRouterCacheProvider`.

## Priority Remediation Plan
1. Normalize heading semantics app-wide:
   - enforce one `h1` per page
   - move section/card titles to consistent `h2/h3` progression
2. Raise minimum interactive size on mobile utility controls:
   - target `>= 40px`, ideally `44px` for high-frequency actions
3. Simplify high-density mobile screens:
   - reduce simultaneous controls visible above fold on `/screener-lab`, `/references`, strategy detail pages
4. Continue reducing dense mobile control clusters (`/screener-lab`, `/references`, strategy detail pages).

## Artifacts
- Detailed markdown report:
  - `apps/web/test-results/ui-audit/audit-report.md`
- Raw machine-readable results:
  - `apps/web/test-results/ui-audit/audit-results.json`
- Per-route screenshots:
  - `apps/web/test-results/ui-audit/*.png`
