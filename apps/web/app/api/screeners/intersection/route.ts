import { NextResponse } from "next/server";
import { prisma } from "@ibo/db";

export async function POST(req: Request) {
  const body = await req.json();
  const { screenerKeys, mode = "intersection", minOverlap, marketDate } = body;

  if (!screenerKeys?.length || !marketDate) {
    return NextResponse.json({ error: "screenerKeys and marketDate required" }, { status: 400 });
  }

  // Fetch latest completed run results per screener
  const runs = await prisma.screenerRun.findMany({
    where: {
      screener: { key: { in: screenerKeys } },
      marketDate: new Date(marketDate),
      status: "completed",
    },
    include: {
      screener: { select: { key: true, name: true, linkedStrategyId: true } },
      results: {
        where: { matched: true },
        include: { instrument: { select: { id: true, symbol: true, companyName: true } } },
      },
    },
    orderBy: { runAt: "desc" },
  });

  // Build per-instrument overlap
  const instMap = new Map<
    string,
    { symbol: string; companyName: string; screeners: Set<string>; details: { key: string; label: string }[] }
  >();

  for (const run of runs) {
    for (const result of run.results) {
      const instId = result.instrumentId;
      const existing = instMap.get(instId);
      if (existing) {
        existing.screeners.add(run.screener.key);
        existing.details.push({ key: run.screener.key, label: run.screener.name });
      } else {
        instMap.set(instId, {
          symbol: result.instrument.symbol,
          companyName: result.instrument.companyName,
          screeners: new Set([run.screener.key]),
          details: [{ key: run.screener.key, label: run.screener.name }],
        });
      }
    }
  }

  const totalScreeners = screenerKeys.length;
  const threshold = minOverlap ?? (mode === "intersection" ? totalScreeners : 1);

  const results = Array.from(instMap.values())
    .filter((data) => {
      if (mode === "intersection") return data.screeners.size >= threshold;
      if (mode === "difference") return data.screeners.size < totalScreeners;
      return true;
    })
    .map((data) => ({
      symbol: data.symbol,
      companyName: data.companyName,
      overlapCount: data.screeners.size,
      weightedScore: data.screeners.size / totalScreeners,
      matchedBy: data.details,
      familyMix: {},
      explanation: `${data.symbol} matched ${data.screeners.size}/${totalScreeners} screeners`,
    }))
    .sort((a, b) => b.overlapCount - a.overlapCount);

  return NextResponse.json({ data: results });
}
