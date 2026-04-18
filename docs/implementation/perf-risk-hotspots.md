# Performance Risk Hotspots (Deep Trace Pass)

Date: 2026-04-17
Scope: Deep static trace + route/pipeline query-path inspection.
Artifacts used: `graphify-out/full_trace_deepest.json`, `graphify-out/FULL_TRACE_DEEPEST.md`.

## Executive Summary

- Import-graph cycles detected: **0** (good).
- Runtime latency risk is not from cyc dependency structure; it is mostly from **N+1 DB query patterns** and **serial writes in loops**.
- Prisma itself is not the root issue; current **query shape and loop design** are the main drivers.

## Hotspot Ranking

### H0 — Post-close pipeline (high impact)
File: `packages/pipelines/src/index.ts`

Risk:
- Per-instrument candle fetch in a loop (up to 500 instruments).
- Per-instrument indicator upsert in the same loop.
- Per-strategy and per-screener result inserts in nested loops.

Why this is slow:
- Query count grows roughly with `instruments + strategies*instruments + screeners*instruments`.
- Significant sequential `await prisma.*` calls in loops create long wall-clock time.

Primary remediation:
1. Batch candle reads by instrument IDs and timeframe/day windows.
2. Replace per-row writes with `createMany` in chunks.
3. Use bounded concurrency (`p-limit`) for unavoidable per-instrument compute.
4. Persist precomputed context snapshot to avoid recomputing the same derived fields in multiple paths.

### H0 — Custom screener run path (high impact)
File: `apps/web/app/api/screeners/run/route.ts`

Risk:
- `runCustomConditions` fetches candles with one query per instrument.
- For active universe size growth, endpoint latency grows linearly and sharply.

Why this is slow:
- N+1 read pattern (`instrument.findMany` then `candle.findMany` per instrument).

Primary remediation:
1. Use precomputed indicator snapshots where possible.
2. For candle requirements, fetch only latest window per symbol using one SQL path (raw SQL CTE/window) or batched grouped fetch.
3. Evaluate conditions in memory after one batched read.

### H1 — Screener bundle save path (medium impact)
File: `apps/web/app/api/screeners/route.ts`

Risk:
- `watchlistItem.upsert` inside loop for each candidate.

Why this is slow:
- Serial write round-trips for large candidate sets.

Primary remediation:
1. Build candidate rows and insert with `createMany({ skipDuplicates: true })`.
2. Follow with one `updateMany` for stale inactive rows if needed.
3. Wrap save + audit in transaction.

### H1 — Digest rendering data path (medium)
Files:
- `apps/web/app/api/digest/route.ts`
- `apps/web/app/api/digest/[date]/route.ts`

Risk:
- Generally acceptable today; may degrade if digest count and mention/section payload grow.

Primary remediation:
1. Keep list endpoint using compact select (already done).
2. Ensure date filters always normalized to `@db.Date` boundaries.
3. Add paging guards in consumers.

### H1 — Market context API (already improved, low-medium residual)
File: `apps/web/app/api/market-context/route.ts`

What is already good:
- Parallel DB reads.
- In-memory materialized latest payload with stale-while-refresh behavior.
- Timeout + degraded response mode.

Residual risk:
- Cold-start path still does DB + projection work once.
- No DB-level precomputed “latest” table/snapshot row yet.

Primary remediation:
1. Optional: store latest precomputed breakdown snapshot at pipeline write-time.
2. Serve `/api/market-context?limit=1` from that snapshot directly.

## Fan-in / Fan-out Structural Hotspots (from deep trace)

Top fan-out:
- `packages/strategy-engine/src/indicators/index.ts` (15)
- `packages/db/prisma/seed/index.ts` (9)
- `packages/strategy-engine/src/indicators/builder.ts` (7)

Top fan-in:
- `apps/worker/src/adapters/base.ts` (4)
- `packages/strategy-engine/src/evaluators/condition-evaluator.ts` (4)
- `packages/types/src/enums.ts` (4)

Interpretation:
- Shared-core files are expected central nodes, but not immediate latency bottlenecks.
- Runtime delays align more with DB access loops in pipelines/routes.

## Index Coverage Quick Check

Existing schema has many useful indexes (candle/instrument/date, strategy/screener result date paths).
Main missing optimization opportunity:
- Composite indexes for hot filtered joins in run lookups, e.g. `ScreenerRun(screenerId, marketDate, status, runAt)` pattern.

## Recommended Execution Order (Practical)

1. **Custom screener path first** (`/api/screeners/run`) — fastest user-visible gain.
2. **Screener bundle save write batching** (`/api/screeners` POST).
3. **Post-close pipeline batching** (`packages/pipelines/src/index.ts`) — biggest total compute reduction.
4. Optional: **market-context snapshot table/row** for even lower p95 on cold starts.

## Risk Register

- If free-source upstream data is delayed/missing, degraded mode still returns partial outputs; this is expected behavior.
- Aggressive batching may increase memory pressure if chunking is not enforced.
- `createMany` paths need careful idempotency and dedupe semantics to preserve current behavior.

## Bottom Line

- This is primarily a **query-shape/per-loop execution** problem, not a “Prisma is inherently slow” problem.
- With batching + bounded concurrency + precompute reuse, current critical paths should materially improve without architecture rewrite.
