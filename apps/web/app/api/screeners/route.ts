import { NextResponse } from "next/server";
import { prisma } from "@ibo/db";
import { computeIntersection, computeConfluenceScore, type SymbolMatches } from "@ibo/strategy-engine";
import { SCREENER_BUNDLES, getScreenerBundle } from "../../lib/screener-bundles";

type Mode = "intersection" | "union" | "difference";

function parseMarketDate(input?: string): Date {
  const dateStr = input ?? new Date().toISOString().split("T")[0];
  return new Date(`${dateStr}T00:00:00.000Z`);
}

export async function GET() {
  const [screeners, bundles] = await Promise.all([
    prisma.screener.findMany({
      include: {
        linkedStrategy: { select: { key: true, name: true, family: true } },
        versions: { where: { isActive: true }, take: 1, orderBy: { version: "desc" } },
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
        linkedStrategy: screener.linkedStrategy
          ? {
              key: screener.linkedStrategy.key,
              name: screener.linkedStrategy.name,
              family: screener.linkedStrategy.family,
            }
          : null,
        activeVersion: screener.versions[0]
          ? {
              version: screener.versions[0].version,
              expressionDsl: screener.versions[0].expressionDsl,
            }
          : null,
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

    for (const row of intersection) {
      const instrumentId = instrumentIdBySymbol.get(row.symbol);
      if (!instrumentId) continue;
      await prisma.watchlistItem.upsert({
        where: {
          watchlistId_instrumentId: {
            watchlistId: watchlist.id,
            instrumentId,
          },
        },
        update: { isActive: true },
        create: {
          watchlistId: watchlist.id,
          instrumentId,
          notes: `Saved from bundle ${bundle.name}`,
        },
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
