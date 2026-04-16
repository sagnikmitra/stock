import { NextResponse } from "next/server";
import { prisma } from "@ibo/db";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ date: string }> },
) {
  const { date } = await params;

  const digest = await prisma.digest.findFirst({
    where: { marketDate: new Date(date) },
    include: {
      sections: { orderBy: { sortOrder: "asc" } },
      mentions: {
        include: { instrument: { select: { symbol: true } } },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  if (!digest) {
    return NextResponse.json({ error: "Digest not found" }, { status: 404 });
  }

  return NextResponse.json({
    data: {
      id: digest.id,
      digestType: digest.digestType,
      marketDate: digest.marketDate.toISOString().split("T")[0],
      title: digest.title,
      summary: digest.summary,
      posture: digest.posture,
      sections: digest.sections.map((s) => ({
        key: s.key,
        title: s.title,
        bodyMarkdown: s.bodyMarkdown,
        sortOrder: s.sortOrder,
      })),
      stockMentions: digest.mentions.map((m) => ({
        symbol: m.instrument.symbol,
        mentionType: m.mentionType,
        context: m.contextJson,
      })),
    },
  });
}
