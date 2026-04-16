import { NextResponse } from "next/server";
import { prisma } from "@ibo/db";

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const screenerKey = String(body.screenerKey ?? "");
  const marketDateRaw = String(body.marketDate ?? "");
  const symbols = Array.isArray(body.symbols)
    ? (body.symbols as string[]).map((symbol) => symbol.toUpperCase())
    : [];

  if (!screenerKey || !marketDateRaw || symbols.length === 0) {
    return NextResponse.json({ error: "screenerKey, marketDate, symbols[] required" }, { status: 400 });
  }

  const screener = await prisma.screener.findUnique({ where: { key: screenerKey } });
  if (!screener) return NextResponse.json({ error: "Screener not found" }, { status: 404 });

  const marketDate = new Date(`${marketDateRaw}T00:00:00.000Z`);
  const run = await prisma.screenerRun.create({
    data: {
      screenerId: screener.id,
      runAt: new Date(),
      marketDate,
      scope: "manual_import",
      status: "running",
    },
  });

  const instruments = await prisma.instrument.findMany({
    where: { symbol: { in: symbols } },
    select: { id: true, symbol: true },
  });

  for (const instrument of instruments) {
    await prisma.screenerResult.create({
      data: {
        screenerRunId: run.id,
        instrumentId: instrument.id,
        marketDate,
        matched: true,
        explanation: "Manually imported screener hit",
      },
    });
  }

  await prisma.screenerRun.update({
    where: { id: run.id },
    data: {
      status: "completed",
      summaryJson: {
        importedCount: instruments.length,
        requestedSymbols: symbols.length,
      },
    },
  });

  return NextResponse.json({
    data: {
      screenerRunId: run.id,
      importedCount: instruments.length,
      missingSymbols: symbols.filter((symbol) => !instruments.some((inst) => inst.symbol === symbol)),
    },
  });
}

