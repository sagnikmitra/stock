import { NextResponse } from "next/server";
import { getDatabaseUnavailableReason, isDatabaseConfigured, prisma } from "@ibo/db";

export const revalidate = 15;

export async function GET() {
  if (!isDatabaseConfigured) {
    return NextResponse.json({
      data: {
        marketDate: new Date().toISOString().split("T")[0],
        lastUpdatedAt: new Date().toISOString(),
        marketPosture: { label: "mixed", score: 0, explanation: "No market data available" },
        strategyCounts: [],
        topConfluence: [],
        digestHighlights: [],
        dataFreshnessWarnings: [getDatabaseUnavailableReason()],
        enabledFeatures: [],
      },
    });
  }

  try {
    const [strategies, latestContext, topConfluence, recentDigest, flags] = await Promise.all([
      prisma.strategy.findMany({
        where: { status: "active" },
        select: { key: true, name: true, family: true },
      }),
      prisma.globalContextSnapshot.findFirst({ orderBy: { date: "desc" } }),
      prisma.confluenceResult.findMany({
        orderBy: { weightedScore: "desc" },
        take: 10,
        include: { instrument: { select: { symbol: true, companyName: true } } },
      }),
      prisma.digest.findFirst({
        orderBy: { marketDate: "desc" },
        select: { title: true },
      }),
      prisma.featureFlag.findMany({ where: { isEnabled: true }, select: { key: true } }),
    ]);

    const strategyCounts = strategies.reduce<Record<string, number>>((acc, s) => {
      acc[s.family] = (acc[s.family] ?? 0) + 1;
      return acc;
    }, {});

    return NextResponse.json({
      data: {
        marketDate: new Date().toISOString().split("T")[0],
        lastUpdatedAt: new Date().toISOString(),
        marketPosture: latestContext
          ? { label: latestContext.marketPosture ?? "mixed", score: Number(latestContext.postureScore ?? 0), explanation: latestContext.narrative ?? "" }
          : { label: "mixed", score: 0, explanation: "No market data available" },
        strategyCounts: Object.entries(strategyCounts).map(([key, count]) => ({ key, name: key, count })),
        topConfluence: topConfluence.map((c) => ({
          symbol: c.instrument.symbol,
          companyName: c.instrument.companyName,
          overlapCount: c.overlapCount,
          weightedScore: Number(c.weightedScore),
          matchedBy: [],
          familyMix: c.familyMix as Record<string, number>,
          explanation: c.explanation ?? "",
        })),
        digestHighlights: recentDigest ? [recentDigest.title] : [],
        dataFreshnessWarnings: [],
        enabledFeatures: flags.map((f) => f.key),
      },
    });
  } catch (error) {
    return NextResponse.json({
      data: {
        marketDate: new Date().toISOString().split("T")[0],
        lastUpdatedAt: new Date().toISOString(),
        marketPosture: { label: "mixed", score: 0, explanation: "No market data available" },
        strategyCounts: [],
        topConfluence: [],
        digestHighlights: [],
        dataFreshnessWarnings: [getDatabaseUnavailableReason(error)],
        enabledFeatures: [],
      },
    });
  }
}
