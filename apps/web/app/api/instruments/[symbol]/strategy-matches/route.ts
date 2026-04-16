import { NextResponse } from "next/server";
import { prisma } from "@ibo/db";

function parseDate(raw: string | null): Date | undefined {
  if (!raw) return undefined;
  const dt = new Date(raw);
  return Number.isNaN(dt.getTime()) ? undefined : new Date(`${raw}T00:00:00.000Z`);
}

export async function GET(
  req: Request,
  { params }: { params: Promise<{ symbol: string }> },
) {
  const { symbol } = await params;
  const sym = symbol.toUpperCase();
  const { searchParams } = new URL(req.url);
  const marketDate = parseDate(searchParams.get("marketDate"));
  const strategyKey = searchParams.get("strategyKey");

  const instrument = await prisma.instrument.findFirst({ where: { symbol: sym } });
  if (!instrument) return NextResponse.json({ error: "Symbol not found" }, { status: 404 });

  const results = await prisma.strategyResult.findMany({
    where: {
      instrumentId: instrument.id,
      marketDate,
      strategy: strategyKey ? { key: strategyKey } : undefined,
    },
    include: {
      strategy: { select: { key: true, name: true, family: true } },
    },
    orderBy: [{ marketDate: "desc" }, { createdAt: "desc" }],
  });

  return NextResponse.json({
    data: results.map((result) => ({
      id: result.id,
      marketDate: result.marketDate.toISOString().split("T")[0],
      matched: result.matched,
      confluenceScore: result.confluenceScore ? Number(result.confluenceScore) : null,
      confidence: result.confidence,
      explanation: result.explanation,
      ruleResults: result.ruleResults,
      strategy: result.strategy,
    })),
  });
}

