import { NextResponse } from "next/server";
import {
  prisma,
  isDatabaseConfigured,
  getDatabaseUnavailableReason,
} from "@ibo/db";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!isDatabaseConfigured) {
    return NextResponse.json(
      { error: getDatabaseUnavailableReason() },
      { status: 503 },
    );
  }

  const { id } = await params;

  const backtest = await prisma.backtest.findUnique({
    where: { id },
    include: {
      strategyVersion: { include: { strategy: true } },
      trades: {
        include: { instrument: { select: { symbol: true, companyName: true } } },
        orderBy: { entryDate: "desc" },
      },
      metrics: true,
    },
  });

  if (!backtest) {
    return NextResponse.json({ error: "Backtest not found" }, { status: 404 });
  }

  return NextResponse.json({
    data: {
      id: backtest.id,
      name: backtest.name,
      status: backtest.status,
      mode: backtest.mode,
      strategy: {
        key: backtest.strategyVersion.strategy.key,
        name: backtest.strategyVersion.strategy.name,
        version: backtest.strategyVersion.version,
      },
      config: backtest.configJson,
      summary: backtest.summaryJson,
      metrics: backtest.metrics,
      trades: backtest.trades.map((trade) => ({
        id: trade.id,
        symbol: trade.instrument?.symbol,
        companyName: trade.instrument?.companyName,
        entryDate: trade.entryDate?.toISOString().split("T")[0] ?? null,
        exitDate: trade.exitDate?.toISOString().split("T")[0] ?? null,
        entryPrice: trade.entryPrice ? Number(trade.entryPrice) : null,
        exitPrice: trade.exitPrice ? Number(trade.exitPrice) : null,
        pnlPct: trade.pnlPct ? Number(trade.pnlPct) : null,
        pnlAbs: trade.pnlAbs ? Number(trade.pnlAbs) : null,
      })),
      createdAt: backtest.createdAt.toISOString(),
      startedAt: backtest.startedAt?.toISOString() ?? null,
      finishedAt: backtest.finishedAt?.toISOString() ?? null,
    },
  });
}
