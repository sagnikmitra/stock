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

function parseConfig(input: unknown): BacktestConfig {
  const body = (input ?? {}) as Record<string, unknown>;
  const now = new Date();
  const defaultStart = new Date(now);
  defaultStart.setUTCFullYear(defaultStart.getUTCFullYear() - 2);

  return {
    strategyKey: String(body.strategyKey ?? ""),
    strategyVersion: body.strategyVersion ? Number(body.strategyVersion) : undefined,
    startDate: String(body.startDate ?? defaultStart.toISOString().split("T")[0]),
    endDate: String(body.endDate ?? now.toISOString().split("T")[0]),
    universe: String(body.universe ?? "active_nse"),
    capital: Number(body.capital ?? 500000),
    riskPerTradePct: Number(body.riskPerTradePct ?? 2),
    maxOpenPositions: Number(body.maxOpenPositions ?? 10),
    slippageBps: Number(body.slippageBps ?? 5),
  };
}

export async function GET() {
  if (!isDatabaseConfigured) {
    return NextResponse.json(
      { error: getDatabaseUnavailableReason() },
      { status: 503 },
    );
  }

  const backtests = await prisma.backtest.findMany({
    include: {
      strategyVersion: { include: { strategy: true } },
      _count: { select: { trades: true } },
    },
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  return NextResponse.json({
    data: backtests.map((backtest) => ({
      id: backtest.id,
      name: backtest.name,
      status: backtest.status,
      mode: backtest.mode,
      strategyKey: backtest.strategyVersion.strategy.key,
      strategyName: backtest.strategyVersion.strategy.name,
      strategyVersion: backtest.strategyVersion.version,
      trades: backtest._count.trades,
      createdAt: backtest.createdAt.toISOString(),
      startedAt: backtest.startedAt?.toISOString() ?? null,
      finishedAt: backtest.finishedAt?.toISOString() ?? null,
      summary: backtest.summaryJson,
    })),
  });
}

export async function POST(req: Request) {
  if (!isDatabaseConfigured) {
    return NextResponse.json(
      { error: getDatabaseUnavailableReason() },
      { status: 503 },
    );
  }

  const config = parseConfig(await req.json());
  if (!config.strategyKey) {
    return NextResponse.json({ error: "strategyKey is required" }, { status: 400 });
  }

  const strategy = await prisma.strategy.findUnique({
    where: { key: config.strategyKey },
    include: {
      versions: { orderBy: { version: "desc" } },
    },
  });

  if (!strategy) {
    return NextResponse.json(
      { error: `Strategy '${config.strategyKey}' not found` },
      { status: 404 },
    );
  }

  const version =
    config.strategyVersion !== undefined
      ? strategy.versions.find((item) => item.version === config.strategyVersion)
      : strategy.versions.find((item) => item.isActive) ?? strategy.versions[0];

  if (!version) {
    return NextResponse.json(
      { error: `No strategy version available for '${config.strategyKey}'` },
      { status: 404 },
    );
  }

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
      where: config.universe === "active_nse" ? { isActive: true } : { isActive: true },
      take: 500,
    });
    const universeIds = universe.map((instrument) => instrument.id);

    const preloadStart = toUtcDate(config.startDate);
    preloadStart.setUTCDate(preloadStart.getUTCDate() - 450);
    const endDate = toUtcDate(config.endDate);

    const candlesBySymbol = new Map<string, Candle[]>();
    const instrumentIdBySymbol = new Map<string, string>();
    const candles = await prisma.candle.findMany({
      where: {
        instrumentId: { in: universeIds },
        timeframe: "D1",
        ts: {
          gte: preloadStart,
          lte: endDate,
        },
      },
      orderBy: [{ instrumentId: "asc" }, { ts: "asc" }],
    });

    const candlesByInstrumentId = new Map<string, typeof candles>();
    for (const candle of candles) {
      const bucket = candlesByInstrumentId.get(candle.instrumentId);
      if (bucket) {
        bucket.push(candle);
      } else {
        candlesByInstrumentId.set(candle.instrumentId, [candle]);
      }
    }

    for (const instrument of universe) {
      const instrumentCandles = candlesByInstrumentId.get(instrument.id) ?? [];

      if (instrumentCandles.length < 220) continue;

      const normalized: Candle[] = instrumentCandles.map((candle) => ({
        ts: candle.ts,
        open: Number(candle.open),
        high: Number(candle.high),
        low: Number(candle.low),
        close: Number(candle.close),
        volume: Number(candle.volume ?? 0),
        deliveryPct: candle.deliveryPct ? Number(candle.deliveryPct) : undefined,
      }));

      candlesBySymbol.set(instrument.symbol, normalized);
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

    const tradesToCreate: Array<{
      backtestId: string;
      instrumentId?: string | null;
      entryDate?: Date | null;
      exitDate?: Date | null;
      entryPrice?: number | null;
      exitPrice?: number | null;
      quantity?: number | null;
      pnlPct?: number | null;
      pnlAbs?: number | null;
      metaJson?: Prisma.InputJsonValue;
    }> = [];

    for (const trade of result.trades) {
      const instrumentId = instrumentIdBySymbol.get(trade.symbol);
      const quantity = trade.entryPrice > 0 ? (config.capital * (config.riskPerTradePct / 100)) / trade.entryPrice : 0;

      tradesToCreate.push({
        backtestId: backtest.id,
        instrumentId: instrumentId ?? null,
        entryDate: trade.entryDate ? toUtcDate(trade.entryDate) : null,
        exitDate: trade.exitDate ? toUtcDate(trade.exitDate) : null,
        entryPrice: trade.entryPrice,
        exitPrice: trade.exitPrice ?? null,
        quantity,
        pnlPct: trade.pnlPct ?? null,
        pnlAbs:
          trade.pnlPct !== undefined
            ? (config.capital * trade.pnlPct) / 100
            : null,
        metaJson: {
          holdDays: trade.holdDays,
          slippageBps: config.slippageBps,
        } as Prisma.InputJsonValue,
      });
    }
    if (tradesToCreate.length > 0) {
      await prisma.backtestTrade.createMany({ data: tradesToCreate });
    }

    const metrics = result.metrics;
    const metricEntries: Array<{ key: string; value: string }> = [
      { key: "total_trades", value: String(metrics.totalTrades) },
      { key: "win_rate", value: String(metrics.winRate) },
      { key: "avg_win", value: String(metrics.avgWin) },
      { key: "avg_loss", value: String(metrics.avgLoss) },
      { key: "expectancy", value: String(metrics.expectancy) },
      { key: "max_drawdown", value: String(metrics.maxDrawdown) },
      { key: "profit_factor", value: String(metrics.profitFactor) },
      { key: "avg_hold_days", value: String(metrics.avgHoldDays) },
      { key: "median_hold_days", value: String(metrics.medianHoldDays) },
    ];

    await prisma.backtestMetric.createMany({
      data: metricEntries.map((metric) => ({
        backtestId: backtest.id,
        key: metric.key,
        value: metric.value,
      })),
    });

    await prisma.auditEvent.create({
      data: {
        actor: "system",
        action: "backtest_completed",
        entityType: "Backtest",
        entityId: backtest.id,
        details: {
          strategyKey: strategy.key,
          strategyVersion: version.version,
          totalTrades: result.metrics.totalTrades,
          universeSymbols: candlesBySymbol.size,
        },
      },
    });

    return NextResponse.json({
      data: {
        backtestId: backtest.id,
        status: "completed",
        metrics: result.metrics,
      },
    });
  } catch (error) {
    await prisma.backtest.update({
      where: { id: backtest.id },
      data: {
        status: "failed",
        finishedAt: new Date(),
      },
    });

    await prisma.auditEvent.create({
      data: {
        actor: "system",
        action: "backtest_failed",
        entityType: "Backtest",
        entityId: backtest.id,
        details: {
          strategyKey: config.strategyKey,
          error: error instanceof Error ? error.message : "Unknown error",
        },
      },
    });

    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Backtest failed",
      },
      { status: 500 },
    );
  }
}
