import { NextResponse } from "next/server";
import { prisma } from "@ibo/db";

export const revalidate = 30;

export async function GET() {
  const strategies = await prisma.strategy.findMany({
    select: {
      key: true,
      name: true,
      family: true,
      status: true,
      confidence: true,
      reviewFrequency: true,
      primaryTimeframe: true,
      versions: { where: { isActive: true }, take: 1, select: { sourceSessions: true } },
      _count: { select: { results: true, ambiguityRecords: true } },
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
    ambiguityCount: s._count.ambiguityRecords,
  }));

  return NextResponse.json({ data });
}
