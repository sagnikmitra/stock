# Investment Bible OS — Gap-Fill Prompt (100% Completion)

> **Context**: The IBO codebase is ~90% built. Monorepo compiles clean (Next.js 15 + Prisma 6 + TypeScript). 37 Prisma models, 11 enums, 13 strategies seeded, 15 screeners seeded, 36 pages, 29 API routes, full indicator engine (9 modules), strategy evaluator + DSL parser, backtest runner, worker pipelines (pre-market/post-close), provider adapters (NSE/TwelveData/FMP). This prompt covers ONLY the remaining gaps to reach 100% of the master prompt spec.
>
> **Build is clean.** `npx pnpm run build` passes. Prisma client generated. All existing code compiles.
>
> **Do not rewrite or refactor existing working code.** Only add what's missing.

---

## GAP 1 — Missing Indicator Helpers

**Location**: `packages/strategy-engine/src/indicators/`

Existing: sma.ts, ema.ts, rsi.ts, bollinger.ts, macd.ts, atr.ts, adx.ts, supertrend.ts, vwap.ts, builder.ts

**Add these files:**

### 1.1 `fibonacci.ts`
Fibonacci retracement helper. Given a swing high and swing low, compute retracement levels (23.6%, 38.2%, 50%, 61.8%, 78.6%). Input: `{ high: number, low: number }`. Output: `{ level: number, price: number }[]`. Also provide `findSwingHighLow(candles: Candle[], lookback: number)` that returns recent swing high/low from candle series.

### 1.2 `structure.ts`
Structural state markers:
- `detectHigherHighsHigherLows(candles: Candle[], lookback: number): { isUptrend: boolean, swingHighs: number[], swingLows: number[] }`
- `detectLowerHighsLowerLows(candles: Candle[], lookback: number): { isDowntrend: boolean, swingHighs: number[], swingLows: number[] }`
- `findRecentSwingHigh(candles: Candle[], lookback: number): number`
- `findRecentSwingLow(candles: Candle[], lookback: number): number`
- `candleBodyPct(candle: Candle): number` — body as % of total range
- `isBullishCandle(candle: Candle): boolean`
- `detectTrendlineBreak(candles: Candle[], direction: 'up' | 'down'): boolean`

### 1.3 `relative-volume.ts`
- `relativeVolume(candles: Candle[], period: number): number` — current volume / SMA of volume over period
- `volumeAverage(candles: Candle[], period: number): number`

### 1.4 `consolidation.ts`
Multi-year base / long consolidation detector for MBB strategy:
- `detectConsolidation(monthlyCandles: Candle[], params: { minMonths: number, maxRangePercent: number }): ConsolidationResult | null`
- Output: `{ rangeStart: Date, rangeEnd: Date, ceilingPrice: number, floorPrice: number, compressionScore: number, rangeDepthPct: number, ceilingTouches: number }`
- `isBreakoutFromBase(monthlyCandles: Candle[], consolidation: ConsolidationResult): boolean`

### 1.5 `aggregation.ts`
Timeframe aggregation helpers:
- `aggregateToWeekly(dailyCandles: Candle[]): Candle[]`
- `aggregateToMonthly(dailyCandles: Candle[]): Candle[]`
- `is52WeekHigh(candles: Candle[]): boolean`
- `is52WeekLow(candles: Candle[]): boolean`
- `distanceFrom52WeekHigh(candles: Candle[]): number` — % below 52w high
- `isMonthEndCandleFinalized(date: Date, nseCalendar: ExchangeCalendar): boolean`

### 1.6 Update `builder.ts` and `index.ts`
Export all new helpers from the package barrel. Update `buildIndicators()` in builder.ts to optionally compute relative volume if volume data is present.

### 1.7 Types
Add to `packages/types/src/domain.ts`:
```ts
export interface ConsolidationResult {
  rangeStart: Date;
  rangeEnd: Date;
  ceilingPrice: number;
  floorPrice: number;
  compressionScore: number;
  rangeDepthPct: number;
  ceilingTouches: number;
}

export interface SwingPoint {
  index: number;
  price: number;
  date: Date;
  type: 'high' | 'low';
}

export interface FibonacciLevel {
  level: number;
  price: number;
}

export interface StructuralState {
  isUptrend: boolean;
  isDowntrend: boolean;
  swingHighs: SwingPoint[];
  swingLows: SwingPoint[];
  recentSwingHigh: number;
  recentSwingLow: number;
}
```

---

## GAP 2 — Missing API Routes

**Location**: `apps/web/app/api/`

### 2.1 `api/instruments/[symbol]/chart/route.ts`
GET — Return OHLCV candle data for charting. Query params: `timeframe` (D1/W1/MN1), `from`, `to`, `limit`. Returns `Candle[]` from DB.

### 2.2 `api/instruments/[symbol]/indicators/route.ts`
GET — Return latest IndicatorSnapshot for symbol. Query params: `timeframe`. Returns the most recent snapshot with all computed indicators.

### 2.3 `api/instruments/[symbol]/strategy-matches/route.ts`
GET — Return all StrategyResult records for this symbol. Query params: `marketDate`, `strategyKey`. Returns results with rule explanations.

### 2.4 `api/strategies/[key]/run/route.ts`
POST — Trigger an on-demand strategy run for a specific strategy. Body: `{ marketDate: string, symbolFilter?: string[] }`. Calls the strategy evaluator from `@ibo/strategy-engine`, saves results to StrategyResult, returns summary.

### 2.5 `api/strategies/[key]/backtest/route.ts`
POST — Trigger a backtest for a specific strategy. Body: `{ startDate, endDate, capital, riskPerTradePct, maxOpenPositions, slippageBps }`. Calls the backtest runner, saves to Backtest/BacktestTrade/BacktestMetric tables, returns metrics summary.

### 2.6 `api/screeners/manual-import/route.ts`
POST — Manual symbol import into a screener run. Body: `{ screenerKey: string, marketDate: string, symbols: string[] }`. Creates ScreenerRun + ScreenerResult records for manually-provided symbols. For when external screener results need to be captured internally.

### 2.7 `api/notes/route.ts`
GET — Return all notes, optionally filtered by `instrumentId`. POST — Create a note. Body: `{ title, bodyMarkdown, instrumentId? }`.

### 2.8 `api/holdings/route.ts` (stub)
GET — Return current holdings (empty array for now, returns `{ holdings: [], message: "Holdings upload coming soon" }`). POST — Stub that returns 501 Not Implemented with message about future feature.

### 2.9 `api/admin/provider-sync/route.ts`
POST — Trigger a manual provider sync/import. Body: `{ providerKey: string, action: 'sync' | 'healthcheck' }`. Calls the appropriate adapter's healthcheck or triggers a data fetch.

### 2.10 `api/admin/recompute-indicators/route.ts`
POST — Recompute indicator snapshots for specified instruments. Body: `{ symbols?: string[], timeframe: string, fromDate?: string }`. Runs the indicator builder from `@ibo/strategy-engine`.

### 2.11 `api/admin/course-sessions/import/route.ts`
POST — Import a new course session. Body: `{ sessionKey, title, bodyMarkdown, concepts?: string[] }`. Creates KnowledgeDocument + KnowledgeSections + optionally new KnowledgeConcept records.

---

## GAP 3 — Missing Pages

**Location**: `apps/web/app/`

### 3.1 `strategies/[strategyKey]/backtest/page.tsx`
Strategy-specific backtest launcher page. Shows:
- Strategy name and family
- Backtest config form (date range, capital, risk%, max positions, slippage)
- "Run Backtest" button that POSTs to `/api/strategies/[key]/backtest`
- Results display: metrics table, trade list, win/loss summary
- Link back to strategy detail

### 3.2 `strategies/[strategyKey]/history/page.tsx`
Strategy historical matches page. Shows:
- Table of past StrategyResult records for this strategy
- Columns: marketDate, symbol, matched (bool), confluenceScore, confidence
- Filter by date range
- Click row to see full rule results JSON rendered as pass/fail cards

### 3.3 `screener-lab/presets/page.tsx`
Preset screener bundles page. Shows the predefined bundles from `lib/screener-bundles.ts`:
- Month End Investment, Swing Daily Check, Breakout Radar, BTST Radar, Strong Confluence Set
- Each bundle card shows: included screener keys, description, "Run Bundle" button
- Run triggers intersection API with the bundle's screener keys

### 3.4 `screener-lab/builder/page.tsx`
Custom screener builder page. Client component with:
- Indicator dropdowns (RSI, SMA, EMA, BB, volume, price, delivery%)
- Operator selects (>=, <=, >, <, ==, crosses_above)
- Value inputs
- Add/remove condition rows
- "Run Custom Screener" button that POSTs to `/api/screeners/run`
- Results table below

### 3.5 `screener-lab/saved/page.tsx`
Saved screener combinations. Shows user-created bundles (stored in Watchlist model with kind='screener_bundle' or similar). For now: list saved bundles, delete/edit, run again.

### 3.6 `market-context/breadth/page.tsx`
Market breadth page. Shows:
- MarketBreadthSnapshot data: advances, declines, unchanged, 52w highs/lows
- Historical trend of breadth metrics
- Empty state if no data seeded yet

### 3.7 `market-context/52-week/page.tsx`
52-week high/low page. Shows:
- Instruments at or near 52-week high
- Instruments at or near 52-week low
- Fetched from Candle data using the `is52WeekHigh` helper
- Empty state with explanation of where data comes from

### 3.8 `backtest/compare/page.tsx`
Backtest comparison page. Shows:
- Select 2 backtest runs to compare side-by-side
- Metrics table: win rate, drawdown, profit factor, expectancy
- Highlight which is better per metric
- Useful for comparing strategy versions

### 3.9 `backtest/replay/page.tsx`
Event replay page for a specific backtest. Shows:
- Select a backtest run and symbol
- Chronological signal timeline: entry, exit, stop-loss events
- Rule pass/fail at each signal point
- Trade outcome for each signal

---

## GAP 4 — Auth System

**Location**: `apps/web/`

Implement simple admin-gated auth. Not a full multi-user auth system — just protect admin routes and provide a login gate.

### 4.1 `middleware.ts`
Next.js middleware at `apps/web/middleware.ts`:
- Check for session cookie (e.g., `ibo-session`) on `/admin/*` routes
- If no valid session, redirect to `/login`
- Public routes (dashboard, digest, strategies, stocks, learning, tools) remain open
- Use `AUTH_SECRET` from env for cookie signing

### 4.2 `app/login/page.tsx`
Simple login page:
- Email + password form
- Validates against `ADMIN_EMAIL` and `ADMIN_PASSWORD` from env
- Sets signed session cookie on success
- Redirects to `/admin/strategies`

### 4.3 `api/auth/login/route.ts`
POST — Validates credentials, sets cookie, returns success/failure.

### 4.4 `api/auth/logout/route.ts`
POST — Clears session cookie, redirects to `/`.

### 4.5 Role model
Add to schema or use env-based approach for MVP:
- `owner` role (ADMIN_EMAIL) can access all admin routes
- Future: `viewer`, `analyst` roles via DB User model

---

## GAP 5 — Charting Library

**Location**: `apps/web/`

### 5.1 Install lightweight-charts
Add `lightweight-charts` to `apps/web/package.json` dependencies. This is TradingView's open-source charting library — lightweight, performant, OHLC-native.

### 5.2 `app/components/charts/ohlc-chart.tsx`
Client component wrapping lightweight-charts:
- Props: `candles: { time: string, open: number, high: number, low: number, close: number }[]`, `indicators?: { sma50?: number[], bb?: { upper: number[], middle: number[], lower: number[] }, superTrend?: number[] }`, `height?: number`
- Renders candlestick series
- Overlays indicator lines when provided
- Responsive container
- Supports dark/light theme

### 5.3 `app/components/charts/indicator-chart.tsx`
Separate pane chart for RSI or other oscillators:
- Props: `data: { time: string, value: number }[]`, `label: string`, `overbought?: number`, `oversold?: number`
- Renders line series with horizontal threshold lines

### 5.4 Integration points
- Use OHLC chart on `stocks/[symbol]` page
- Use OHLC chart on `strategies/[strategyKey]` page for sample matches
- Use on `backtest/replay` page for trade visualization
- Fetch candle data from `/api/instruments/[symbol]/chart`

---

## GAP 6 — Dark Mode Toggle

**Location**: `apps/web/app/`

`tailwind.config.ts` already has `darkMode: "class"`. Add:

### 6.1 `app/components/theme-toggle.tsx`
Client component:
- Toggle button with sun/moon icon (lucide-react)
- Reads/writes `localStorage` key `ibo-theme`
- Toggles `dark` class on `<html>` element
- Defaults to system preference via `prefers-color-scheme`

### 6.2 Update `layout.tsx`
- Add ThemeToggle to header area
- Add `suppressHydrationWarning` to `<html>` tag
- Add inline script to prevent flash of wrong theme

### 6.3 Update `globals.css`
Ensure dark variants exist for key surfaces:
- `dark:bg-slate-900`, `dark:text-slate-100` on body
- `dark:bg-slate-800` on cards
- `dark:border-slate-700` on borders
- Brand colors should work on dark backgrounds

---

## GAP 7 — Sentry Integration

### 7.1 Install
Add `@sentry/nextjs` to `apps/web/package.json`.

### 7.2 Config files
Create:
- `apps/web/sentry.client.config.ts` — `Sentry.init({ dsn: process.env.NEXT_PUBLIC_SENTRY_DSN, environment: process.env.NEXT_PUBLIC_APP_ENV })`
- `apps/web/sentry.server.config.ts` — same pattern
- `apps/web/sentry.edge.config.ts` — same pattern

### 7.3 `next.config.ts` update
Wrap with `withSentryConfig()`. Use `SENTRY_AUTH_TOKEN`, `SENTRY_ORG`, `SENTRY_PROJECT` from env. Skip if DSN not set (graceful no-op for dev).

### 7.4 `app/global-error.tsx`
Next.js global error boundary that reports to Sentry and shows user-friendly error page.

---

## GAP 8 — Test Suite

**Location**: Create tests alongside source code.

### 8.1 Strategy engine tests — `packages/strategy-engine/tests/`

#### `indicators.test.ts`
Test each indicator with known inputs/outputs:
- SMA(5) of [1,2,3,4,5,6,7] should produce known values
- RSI(14) of a known series
- Bollinger Bands bounds check
- SuperTrend direction flip detection

#### `evaluator.test.ts`
Test strategy evaluator:
- BB strategy with mock candle data that should pass
- BB strategy with mock data that should fail (RSI too low)
- Cross strategy with/without VWAP reclaim
- Ambiguity rules produce correct explanations

#### `confluence.test.ts`
Test confluence scoring:
- 3 overlapping screener results → correct score
- Empty intersection → score 0
- Family mix detection (investment + swing)

#### `backtest.test.ts`
Test backtest runner:
- Single trade lifecycle (entry → exit → PnL calculation)
- Stop-loss trigger
- Position sizing from 2% rule

### 8.2 Indicator helper tests — `packages/strategy-engine/tests/`

#### `structure.test.ts`
- Higher highs/lows detection on synthetic uptrend data
- Swing high/low finding
- Candle body percentage calculation

#### `consolidation.test.ts`
- Multi-year base detection on synthetic flat data
- Breakout detection after consolidation

### 8.3 Web app tests — `apps/web/tests/`

#### `api-strategies.test.ts`
Integration test for `/api/strategies` route — mock prisma, verify response shape.

#### `api-screeners.test.ts`
Integration test for `/api/screeners/intersection` — verify set operations.

### 8.4 Test infrastructure
- Add `vitest` to root devDependencies (or use existing `tsx --test` pattern)
- Add test scripts to relevant `package.json` files
- Ensure `npx pnpm run test` runs all tests from root

---

## GAP 9 — Weekly Digest Pipeline

**Location**: `apps/worker/src/pipelines/`

### 9.1 `weekly-summary.ts`
Weekly digest pipeline (runs Saturday 09:00 IST):
- Aggregate strategy match counts for the week
- Aggregate screener hit counts
- Compute top confluence candidates of the week
- Summarize watchlist additions/removals
- Provider health summary for the week
- Create Digest record with type `week_end`
- Create DigestSections for each summary block

### 9.2 `apps/web/app/api/cron/weekly/route.ts`
Cron trigger route for weekly digest. Same pattern as pre-market/post-close routes. Validates CRON_SECRET.

### 9.3 Add to sidebar
Add "Weekly Summary" link under Core → Digest section in sidebar nav.

---

## GAP 10 — Seed Data Gaps

### 10.1 Glossary terms seed — `packages/db/prisma/seed/glossary.ts`
Seed KnowledgeConcept records for ALL terms from prompt section 70:
- RSI, SMA, EMA, Bollinger Bands, VWAP, Super Trend, divergence, support/resistance, order blocks, demand/supply zones, month-end review, scanner discipline, 2% risk rule, 3R expectation, alpha, beta, FII/FPI, GIFT Nifty, delivery percentage, liquidity, volatility, DBR/RBR/RBD/DBD, position sizing, stop-loss hunting, trailing stop, candle anatomy, MACD, ATR, ADX, Fibonacci retracement

Each concept should have: `key`, `title`, `category` (indicator/concept/strategy_element/market_data), `definition` (2-3 sentences from course context), `linkedStrategyKeys` where applicable.

### 10.2 Update seed index
Import and call glossary seed from `packages/db/prisma/seed/index.ts`.

---

## GAP 11 — Missing Strategy Sub-Pages Content

### 11.1 Enrich `strategies/[strategyKey]/page.tsx`
The existing strategy detail page should display (verify these blocks exist, add if missing):
- Family badge (investment/swing)
- Source session links
- Hard rules table with pass/fail indicators
- Soft rules / heuristics section
- Ambiguity notes with raw vs normalized display
- Entry/stop-loss/exit logic cards
- "When to run" / "What timeframe" / "What NOT to confuse with" section
- Link to backtest page
- Link to history page
- Current matches preview (latest StrategyResult records)
- Related screener links
- Learning note from KnowledgeDocument

---

## GAP 12 — Screener Lab Interactive Features

### 12.1 Screener intersection UI enhancement
The existing `screener-lab/page.tsx` currently shows screeners. Enhance to add:
- Multi-select checkboxes for screener keys
- Mode toggle: intersection / union / difference
- "Run Intersection" button that POSTs to `/api/screeners/intersection`
- Results table below with: symbol, overlap count, matched screener badges, explanation
- Click row to expand explanation drawer
- Export CSV button

### 12.2 `screener-lab/intersections/page.tsx` upgrade
Current page is documentation-only. Upgrade to include:
- Interactive form (multi-select screeners + date + mode)
- Live results below the documentation
- Venn-style overlap count summary (e.g., "A∩B: 5 stocks, A∩C: 3 stocks, A∩B∩C: 2 stocks")

---

## GAP 13 — Stock Detail Page Enhancement

### 13.1 Upgrade `stocks/[symbol]/page.tsx`
Current page is basic. Add these sections:
- OHLC chart component (from Gap 5)
- Current strategy matches for this symbol
- Recent digest mentions (DigestStockMention records)
- Technical indicator snapshot (latest IndicatorSnapshot)
- Watchlist add/remove button
- Notes section with add note form
- Related screener memberships
- Learning links for matched strategies

---

## GAP 14 — Dashboard Enrichment

### 14.1 Verify dashboard has these sections (add if missing):
- Last refresh time / data freshness warning
- Provider health summary badge
- Intersection spotlight (top overlap candidates today)
- Watchlist delta (added/removed/invalidated counts)
- "Manual review needed" queue (symbols with ambiguity flags or incomplete data)
- Month-end reminder banner (if within 3 trading days of month end)

---

## GAP 15 — Cron Logic Consolidation

### 15.1 Deduplicate cron logic
`apps/web/app/api/cron/` routes and `apps/worker/src/pipelines/` contain overlapping logic. Consolidate:
- Move shared pipeline logic to `packages/strategy-engine/src/pipelines/` or a new `packages/pipelines/` package
- Web cron routes become thin wrappers that import from the shared package
- Worker pipelines import from the same shared package
- This prevents logic drift between the two entry points

---

## GAP 16 — Prisma Generate in Build Pipeline

### 16.1 Add postinstall script to `packages/db/package.json`:
```json
"scripts": {
  "postinstall": "prisma generate --schema=./prisma/schema.prisma",
  "db:generate": "prisma generate --schema=./prisma/schema.prisma",
  "db:push": "prisma db push --schema=./prisma/schema.prisma",
  "db:seed": "tsx prisma/seed/index.ts"
}
```

### 16.2 Ensure turbo pipeline runs prisma generate before web build
Update `turbo.json` to add `@ibo/db#generate` as a dependency of `@ibo/web#build`.

---

## Execution Priority

1. **Gap 1** (Indicator helpers) — Unblocks MBB strategy, structural analysis, 52-week detection
2. **Gap 2** (API routes) — Completes the API surface spec
3. **Gap 3** (Missing pages) — Fills navigation dead-ends
4. **Gap 5** (Charts) — Makes stock/strategy pages visually useful
5. **Gap 8** (Tests) — Validates correctness of strategy engine
6. **Gap 4** (Auth) — Protects admin routes
7. **Gap 6** (Dark mode) — UX polish
8. **Gap 7** (Sentry) — Observability
9. **Gap 9** (Weekly digest) — Completes digest types
10. **Gap 10** (Glossary seed) — Completes knowledge base
11. **Gap 12** (Screener Lab interactive) — Core product feature
12. **Gap 13** (Stock detail) — Per-symbol deep dive
13. **Gap 14** (Dashboard) — Home page enrichment
14. **Gap 15** (Cron consolidation) — Architecture hygiene
15. **Gap 16** (Build pipeline) — Developer experience
16. **Gap 11** (Strategy sub-pages) — Content completeness

---

## What NOT to touch

- Do not modify `packages/db/prisma/schema.prisma` — schema is complete
- Do not modify existing indicator implementations (sma, ema, rsi, etc.) — they work
- Do not modify existing seed files unless adding imports
- Do not modify existing strategy evaluator or DSL parser — they work
- Do not modify existing worker pipelines — they work
- Do not change the design system or UI component library
- Do not add dependencies beyond what's specified (no heavy frameworks, no ORMs, no state management libraries)

---

## Technical Constraints

- **Next.js 15.1.0** — App Router, server components default, "use client" only where needed
- **Prisma 6.x** — Do NOT use Prisma 7 (breaking changes with datasource config)
- **pnpm workspaces** — All package references use `workspace:*`
- **TypeScript strict** — No implicit any, no ts-ignore
- **Tailwind CSS** — All styling via Tailwind classes, use existing `cn()` utility for merges
- **No external API calls without adapter** — All market data flows through provider adapters
- **Timezone**: All dates UTC in DB, IST for display and cron scheduling
- **Educational disclaimers** on every page that shows market data or strategy results
