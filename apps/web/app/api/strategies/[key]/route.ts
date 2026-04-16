import { NextResponse } from "next/server";
import { prisma } from "@ibo/db";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ key: string }> },
) {
  const { key } = await params;

  const strategy = await prisma.strategy.findUnique({
    where: { key },
    include: {
      versions: {
        orderBy: { version: "desc" },
        include: { rules: { orderBy: { sortOrder: "asc" } } },
      },
      ambiguityRecords: true,
      results: {
        orderBy: { marketDate: "desc" },
        take: 20,
        include: { instrument: { select: { symbol: true, companyName: true } } },
      },
    },
  });

  if (!strategy) {
    return NextResponse.json({ error: "Strategy not found" }, { status: 404 });
  }

  const activeVersion = strategy.versions.find((v) => v.isActive);

  return NextResponse.json({
    data: {
      key: strategy.key,
      name: strategy.name,
      family: strategy.family,
      status: strategy.status,
      description: strategy.description,
      confidence: strategy.confidence,
      reviewFrequency: strategy.reviewFrequency,
      primaryTimeframe: strategy.primaryTimeframe,
      secondaryTimeframe: strategy.secondaryTimeframe,
      activeVersion: activeVersion
        ? {
            version: activeVersion.version,
            isActive: true,
            sourceSessions: activeVersion.sourceSessions,
            implementationNotes: activeVersion.implementationNotes,
            rules: activeVersion.rules.map((r) => ({
              key: r.key,
              label: r.label,
              kind: r.kind,
              description: r.description,
            })),
          }
        : null,
      ambiguities: strategy.ambiguityRecords.map((a) => ({
        key: a.key,
        rawNote: a.rawNote,
        normalizedNote: a.normalizedNote,
        severity: a.severity,
        uiBehavior: a.uiBehavior,
      })),
      liveMatches: strategy.results.map((r) => ({
        symbol: r.instrument.symbol,
        companyName: r.instrument.companyName,
        marketDate: r.marketDate.toISOString().split("T")[0],
        matched: r.matched,
        confluenceScore: r.confluenceScore ? Number(r.confluenceScore) : undefined,
        explanation: r.explanation,
      })),
    },
  });
}
