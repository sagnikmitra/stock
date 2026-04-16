import test from "node:test";
import assert from "node:assert/strict";
import { detectConsolidation, isBreakoutFromBase } from "../src/indicators/consolidation";
import type { Candle } from "@ibo/types";

function monthlyFlatSeries(): Candle[] {
  const rows: Candle[] = [];
  for (let i = 0; i < 36; i++) {
    const base = 100 + Math.sin(i / 5) * 2;
    rows.push({
      ts: new Date(Date.UTC(2021 + Math.floor(i / 12), i % 12, 1)),
      open: base,
      high: base + 4,
      low: base - 4,
      close: base + 1,
      volume: 1000,
    });
  }
  return rows;
}

test("Detect consolidation base on synthetic flat monthly data", () => {
  const rows = monthlyFlatSeries();
  const result = detectConsolidation(rows, { minMonths: 12, maxRangePercent: 20 });
  assert.ok(result !== null);
});

test("Breakout from consolidation detection", () => {
  const rows = monthlyFlatSeries();
  const consolidation = detectConsolidation(rows.slice(0, 30), { minMonths: 12, maxRangePercent: 20 });
  assert.ok(consolidation);
  if (!consolidation) return;
  const breakoutRows = [...rows.slice(0, 30), { ...rows[30], close: consolidation.ceilingPrice * 1.05 }];
  assert.equal(isBreakoutFromBase(breakoutRows, consolidation), true);
});

