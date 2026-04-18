import { NextResponse } from "next/server";
import { prisma } from "@ibo/db";

export const revalidate = 30;

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const type = searchParams.get("type");
  const limit = Number(searchParams.get("limit") ?? 30);

  const digests = await prisma.digest.findMany({
    where: type ? { digestType: type as never } : undefined,
    orderBy: [{ marketDate: "desc" }, { createdAt: "desc" }],
    take: Number.isFinite(limit) ? Math.max(1, Math.min(limit, 100)) : 30,
    select: {
      id: true,
      digestType: true,
      marketDate: true,
      title: true,
      summary: true,
      posture: true,
      createdAt: true,
      _count: { select: { sections: true, mentions: true } },
    },
  });

  return NextResponse.json({
    data: digests.map((digest) => ({
      id: digest.id,
      digestType: digest.digestType,
      marketDate: digest.marketDate.toISOString().split("T")[0],
      title: digest.title,
      summary: digest.summary,
      posture: digest.posture,
      sectionsCount: digest._count.sections,
      mentionsCount: digest._count.mentions,
      createdAt: digest.createdAt.toISOString(),
    })),
  });
}
