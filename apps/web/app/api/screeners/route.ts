import { NextResponse } from "next/server";
import { prisma } from "@ibo/db";
import { computeIntersection, computeConfluenceScore, type SymbolMatches } from "@ibo/strategy-engine";
import { SCREENER_BUNDLES, getScreenerBundle } from "../../lib/screener-bundles";

export const revalidate = 30;

type Mode = "intersection" | "union" | "difference";

function parseMarketDate(input?: string): Date {
  const dateStr = input ?? new Date().toISOString().split("T")[0];
  return new Date(`${dateStr}T00:00:00.000Z`);
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const full = searchParams.get("full") === "1";

  if (!full) {
    const [screeners, bundles] = await Promise.all([
      prisma.screener.findMany({
        select: {
          key: true,
          name: true,
        },
        orderBy: [{ isExternalReference: "asc" }, { name: "asc" }],
      }),
      Promise.resolve(SCREENER_BUNDLES),
    ]);

    return NextResponse.json({
      data: {
        screeners,
        bundles,
      },
    });
  }

  const [screeners, bundles] = await Promise.all([
    prisma.screener.findMany({
      select: {
        key: true,
        name: true,
        description: true,
        isExternalReference: true,
        externalUrl: true,
        tags: true,
        linkedStrategy: { select: { key: true, name: true, family: true } },
      },
      orderBy: [{ isExternalReference: "asc" }, { name: "asc" }],
    }),
    Promise.resolve(SCREENER_BUNDLES),
  ]);

  return NextResponse.json({
    data: {
      screeners: screeners.map((screener) => ({
        key: screener.key,
        name: screener.name,
        description: screener.description,
        isExternalReference: screener.isExternalReference,
        externalUrl: screener.externalUrl,
        tags: (screener.tags as string[] | null) ?? [],
        linkedStrategy: screener.linkedStrategy ?? null,
        activeVersion: null,
      })),
      bundles,
    },
  });
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const bundleKey = body.bundleKey as string | undefined;
    const mode = (body.mode as Mode | undefined) ?? "union";
    const minOverlap = body.minOverlap as number | undefined;
    const marketDateInput = body.marketDate as string | undefined;
    const watchlistName = body.watchlistName as string | undefined;

    if (!bundleKey) {
      return NextResponse.json({ error: "bundleKey is required" }, { status: 400 });
    }

    const bundle = getScreenerBundle(bundleKey);
    if (!bundle) {
      return NextResponse.json({ error: `Unknown bundleKey '${bundleKey}'` }, { status: 404 });
    }

    const marketDate = parseMarketDate(marketDateInput);
    const effectiveMode: Mode = body.mode ?? bundle.defaultMode;
    const effectiveMinOverlap = minOverlap ?? bundle.minOverlap;

    const runs = await prisma.screenerRun.findMany({
      where: {
        screener: { key: { in: bundle.screenerKeys } },
        marketDate,
        status: "completed",
      },
      include: {
        screener: { select: { key: true, name: true, linkedStrategy: { select: { family: true } } } },
        results: {
          where: { matched: true },
          include: { instrument: { select: { symbol: true, companyName: true, id: true } } },
        },
      },
      orderBy: { runAt: "desc" },
    });

    if (runs.length === 0) {
      return NextResponse.json(
        {
          error: "No completed screener runs available for this bundle/date",
          details: {
            bundleKey,
            marketDate: marketDate.toISOString().split("T")[0],
          },
        },
        { status: 404 },
      );
    }

    const byScreener = new Map<string, SymbolMatches[]>();
    const instrumentIdBySymbol = new Map<string, string>();

    for (const run of runs) {
      const entries = run.results.map((result) => {
        instrumentIdBySymbol.set(result.instrument.symbol, result.instrument.id);
        return {
          symbol: result.instrument.symbol,
          companyName: result.instrument.companyName,
          matches: [
            {
              screenerKey: run.screener.key,
              screenerLabel: run.screener.name,
              family: run.screener.linkedStrategy?.family ?? "swing",
            },
          ],
        };
      });

      byScreener.set(run.screener.key, entries);
    }

    const intersection = computeIntersection(
      {
        screenerKeys: bundle.screenerKeys,
        mode: effectiveMode,
        minOverlap: effectiveMinOverlap,
        marketDate: marketDate.toISOString().split("T")[0],
      },
      byScreener,
    );

    const watchlist = await prisma.watchlist.create({
      data: {
        name:
          watchlistName ??
          `${bundle.name} — ${marketDate.toISOString().split("T")[0]}`,
        description: `Saved screener bundle: ${bundle.name}`,
        kind: "strategy_generated",
      },
    });

    const candidateInstrumentIds = intersection
      .map((row) => instrumentIdBySymbol.get(row.symbol))
      .filter((id): id is string => Boolean(id));

    if (candidateInstrumentIds.length > 0) {
      await prisma.watchlistItem.updateMany({
        where: {
          watchlistId: watchlist.id,
          instrumentId: { in: candidateInstrumentIds },
        },
        data: { isActive: true },
      });

      await prisma.watchlistItem.createMany({
        data: candidateInstrumentIds.map((instrumentId) => ({
          watchlistId: watchlist.id,
          instrumentId,
          notes: `Saved from bundle ${bundle.name}`,
          isActive: true,
        })),
        skipDuplicates: true,
      });
    }

    await prisma.auditEvent.create({
      data: {
        actor: "admin",
        action: "screener_bundle_saved",
        entityType: "ScreenerBundle",
        entityId: bundle.key,
        details: {
          bundleKey: bundle.key,
          bundleName: bundle.name,
          marketDate: marketDate.toISOString().split("T")[0],
          mode: effectiveMode,
          minOverlap: effectiveMinOverlap ?? null,
          savedCandidates: intersection.length,
          watchlistId: watchlist.id,
        },
      },
    });

    return NextResponse.json({
      data: {
        bundleKey: bundle.key,
        bundleName: bundle.name,
        mode: effectiveMode,
        marketDate: marketDate.toISOString().split("T")[0],
        watchlistId: watchlist.id,
        candidates: intersection.map((item) => {
          const confluence = computeConfluenceScore(item, bundle.screenerKeys.length);
          return {
            ...item,
            confluenceScore: confluence.score,
            confluenceBucket: confluence.bucket,
          };
        }),
      },
    });
  } catch (error) {
    console.error("POST /api/screeners error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
