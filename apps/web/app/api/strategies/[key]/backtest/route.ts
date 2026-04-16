import { NextResponse } from "next/server";
import {
  prisma,
  isDatabaseConfigured,
  getDatabaseUnavailableReason,
} from "@ibo/db";
import type { Prisma } from "@ibo/db";
import type { BacktestConfig, Candle, StrategyDSL } from "@ibo/types";
import { runBacktest } from "@ibo/strategy-engine";

function toUtcDate(value: string): Date {
  return new Date(`${value}T00:00:00.000Z`);
}

function parseConfig(strategyKey: string, input: unknown): BacktestConfig {
  const body = (input ?? {}) as Record<string, unknown>;
  const now = new Date();
  const defaultStart = new Date(now);
  defaultStart.setUTCFullYear(defaultStart.getUTCFullYear() - 2);

  return {
    strategyKey,
    startDate: String(body.startDate ?? defaultStart.toISOString().split("T")[0]),
    endDate: String(body.endDate ?? now.toISOString().split("T")[0]),
    universe: "active_nse",
    capital: Number(body.capital ?? 500000),
    riskPerTradePct: Number(body.riskPerTradePct ?? 2),
    maxOpenPositions: Number(body.maxOpenPositions ?? 10),
    slippageBps: Number(body.slippageBps ?? 5),
  };
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ key: string }> },
) {
  if (!isDatabaseConfigured) {
    return NextResponse.json(
      { error: getDatabaseUnavailableReason() },
      { status: 503 },
    );
  }

  const { key } = await params;
  const config = parseConfig(key, await req.json());
  const strategy = await prisma.strategy.findUnique({
    where: { key },
    include: { versions: { orderBy: { version: "desc" } } },
  });
  if (!strategy) return NextResponse.json({ error: "Strategy not found" }, { status: 404 });

  const version = strategy.versions.find((item) => item.isActive) ?? strategy.versions[0];
  if (!version) return NextResponse.json({ error: "No strategy version found" }, { status: 404 });

  const backtest = await prisma.backtest.create({
    data: {
      strategyVersionId: version.id,
      name: `${strategy.name} — ${config.startDate} to ${config.endDate}`,
      mode: "event_replay",
      configJson: config as unknown as Prisma.InputJsonValue,
      status: "running",
      startedAt: new Date(),
    },
  });

  try {
    const universe = await prisma.instrument.findMany({
      where: { isActive: true },
      take: 500,
    });
    const preloadStart = toUtcDate(config.startDate);
    preloadStart.setUTCDate(preloadStart.getUTCDate() - 450);

    const candlesBySymbol = new Map<string, Candle[]>();
    const instrumentIdBySymbol = new Map<string, string>();
    for (const instrument of universe) {
      const rows = await prisma.candle.findMany({
        where: {
          instrumentId: instrument.id,
          timeframe: "D1",
          ts: { gte: preloadStart, lte: toUtcDate(config.endDate) },
        },
        orderBy: { ts: "asc" },
      });
      if (rows.length < 220) continue;
      candlesBySymbol.set(
        instrument.symbol,
        rows.map((c) => ({
          ts: c.ts,
          open: Number(c.open),
          high: Number(c.high),
          low: Number(c.low),
          close: Number(c.close),
          volume: Number(c.volume ?? 0),
          deliveryPct: c.deliveryPct ? Number(c.deliveryPct) : undefined,
        })),
      );
      instrumentIdBySymbol.set(instrument.symbol, instrument.id);
    }

    const dsl = version.normalizedDsl as unknown as StrategyDSL;
    const result = runBacktest(config, dsl, candlesBySymbol);

    await prisma.backtest.update({
      where: { id: backtest.id },
      data: {
        status: "completed",
        finishedAt: new Date(),
        summaryJson: result.metrics as unknown as Prisma.InputJsonValue,
      },
    });

    for (const trade of result.trades) {
      await prisma.backtestTrade.create({
        data: {
          backtestId: backtest.id,
          instrumentId: instrumentIdBySymbol.get(trade.symbol),
          entryDate: trade.entryDate ? toUtcDate(trade.entryDate) : null,
          exitDate: trade.exitDate ? toUtcDate(trade.exitDate) : null,
          entryPrice: trade.entryPrice,
          exitPrice: trade.exitPrice ?? null,
          quantity: trade.entryPrice > 0 ? (config.capital * (config.riskPerTradePct / 100)) / trade.entryPrice : 0,
          pnlPct: trade.pnlPct ?? null,
          pnlAbs: trade.pnlPct !== undefined ? (config.capital * trade.pnlPct) / 100 : null,
          metaJson: { holdDays: trade.holdDays } as Prisma.InputJsonValue,
        },
      });
    }

    const entries: Array<{ key: string; value: string }> = [
      { key: "total_trades", value: String(result.metrics.totalTrades) },
      { key: "win_rate", value: String(result.metrics.winRate) },
      { key: "max_drawdown", value: String(result.metrics.maxDrawdown) },
      { key: "profit_factor", value: String(result.metrics.profitFactor) },
      { key: "expectancy", value: String(result.metrics.expectancy) },
    ];
    for (const entry of entries) {
      await prisma.backtestMetric.create({ data: { backtestId: backtest.id, key: entry.key, value: entry.value } });
    }

    return NextResponse.json({
      data: {
        backtestId: backtest.id,
        strategyKey: key,
        metrics: result.metrics,
      },
    });
  } catch (error) {
    await prisma.backtest.update({
      where: { id: backtest.id },
      data: { status: "failed", finishedAt: new Date() },
    });
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Backtest failed" },
      { status: 500 },
    );
  }
}

