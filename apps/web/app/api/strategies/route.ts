import { NextResponse } from "next/server";
import { prisma } from "@ibo/db";

export async function GET() {
  const strategies = await prisma.strategy.findMany({
    include: {
      versions: { where: { isActive: true }, take: 1 },
      ambiguityRecords: { select: { key: true, severity: true } },
      _count: { select: { results: true } },
    },
    orderBy: [{ family: "asc" }, { name: "asc" }],
  });

  const data = strategies.map((s) => ({
    key: s.key,
    name: s.name,
    family: s.family,
    status: s.status,
    confidence: s.confidence,
    reviewFrequency: s.reviewFrequency,
    primaryTimeframe: s.primaryTimeframe,
    sourceSessions: s.versions[0]?.sourceSessions?.split(",") ?? [],
    matchCount: s._count.results,
    ambiguityCount: s.ambiguityRecords.length,
  }));

  return NextResponse.json({ data });
}
