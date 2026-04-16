import { NextResponse } from "next/server";
import { prisma } from "@ibo/db";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  const backtest = await prisma.backtest.findUnique({
    where: { id },
    include: {
      strategyVersion: {
        include: {
          strategy: true,
        },
      },
      trades: {
        include: {
          instrument: { select: { symbol: true } },
        },
        orderBy: { entryDate: "desc" },
        take: 200,
      },
      metrics: true,
    },
  });

  if (!backtest) {
    return NextResponse.json({ error: "Backtest not found" }, { status: 404 });
  }

  const wins = backtest.trades.filter((trade) => Number(trade.pnlPct ?? 0) > 0).length;
  const losses = backtest.trades.filter((trade) => Number(trade.pnlPct ?? 0) <= 0).length;

  return NextResponse.json({
    data: {
      id: backtest.id,
      name: backtest.name,
      status: backtest.status,
      strategy: {
        key: backtest.strategyVersion.strategy.key,
        name: backtest.strategyVersion.strategy.name,
        family: backtest.strategyVersion.strategy.family,
      },
      summary: backtest.summaryJson,
      winLoss: {
        wins,
        losses,
      },
      trades: backtest.trades.map((trade) => ({
        id: trade.id,
        symbol: trade.instrument?.symbol ?? "N/A",
        entryDate: trade.entryDate?.toISOString().split("T")[0] ?? null,
        exitDate: trade.exitDate?.toISOString().split("T")[0] ?? null,
        entryPrice: trade.entryPrice ? Number(trade.entryPrice) : null,
        exitPrice: trade.exitPrice ? Number(trade.exitPrice) : null,
        pnlPct: trade.pnlPct ? Number(trade.pnlPct) : 0,
      })),
      metrics: backtest.metrics.map((metric) => ({ key: metric.key, value: metric.value })),
    },
  });
}
