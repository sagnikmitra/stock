import { NextResponse } from "next/server";
import { prisma } from "@ibo/db";
import { computeIntersection, computeConfluenceScore, type SymbolMatches } from "@ibo/strategy-engine";

type Mode = "intersection" | "union" | "difference";

function toMarketDate(dateInput?: string): Date {
  const dateStr = dateInput ?? new Date().toISOString().split("T")[0];
  return new Date(`${dateStr}T00:00:00.000Z`);
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const screenerKeysInput = body.screenerKeys as string[] | undefined;
    const singleKey = body.screenerKey as string | undefined;
    const mode = (body.mode as Mode | undefined) ?? "intersection";
    const minOverlap = body.minOverlap as number | undefined;
    const marketDate = toMarketDate(body.marketDate as string | undefined);

    const screenerKeys = screenerKeysInput?.length
      ? screenerKeysInput
      : singleKey
        ? [singleKey]
        : [];

    if (screenerKeys.length === 0) {
      return NextResponse.json(
        { error: "screenerKey or screenerKeys[] is required" },
        { status: 400 },
      );
    }

    const runs = await prisma.screenerRun.findMany({
      where: {
        screener: { key: { in: screenerKeys } },
        marketDate,
        status: "completed",
      },
      include: {
        screener: { select: { key: true, name: true, linkedStrategy: { select: { family: true } } } },
        results: {
          where: { matched: true },
          include: { instrument: { select: { symbol: true, companyName: true } } },
        },
      },
      orderBy: { runAt: "desc" },
    });

    if (runs.length === 0) {
      return NextResponse.json(
        {
          error: "No completed screener runs found for requested keys/date",
          details: {
            screenerKeys,
            marketDate: marketDate.toISOString().split("T")[0],
          },
        },
        { status: 404 },
      );
    }

    const byScreener = new Map<string, SymbolMatches[]>();
    for (const run of runs) {
      const rows: SymbolMatches[] = run.results.map((result) => ({
        symbol: result.instrument.symbol,
        companyName: result.instrument.companyName,
        matches: [
          {
            screenerKey: run.screener.key,
            screenerLabel: run.screener.name,
            family: run.screener.linkedStrategy?.family ?? "swing",
          },
        ],
      }));
      byScreener.set(run.screener.key, rows);
    }

    const resultRows = computeIntersection(
      {
        screenerKeys,
        mode,
        minOverlap,
        marketDate: marketDate.toISOString().split("T")[0],
      },
      byScreener,
    );

    const scored = resultRows.map((row) => {
      const confluence = computeConfluenceScore(row, screenerKeys.length);
      return {
        ...row,
        confluenceScore: confluence.score,
        confluenceBucket: confluence.bucket,
      };
    });

    return NextResponse.json({
      data: {
        marketDate: marketDate.toISOString().split("T")[0],
        mode,
        minOverlap: minOverlap ?? null,
        screenerKeys,
        totalCandidates: scored.length,
        results: scored,
      },
    });
  } catch (error) {
    console.error("POST /api/screeners/run error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

