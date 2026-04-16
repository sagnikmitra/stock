import { NextResponse } from "next/server";
import { prisma } from "@ibo/db";

export async function GET(req: Request) {
  const instrumentId = new URL(req.url).searchParams.get("instrumentId");
  const notes = await prisma.note.findMany({
    where: { instrumentId: instrumentId || undefined },
    orderBy: { createdAt: "desc" },
    include: { instrument: { select: { symbol: true, companyName: true } } },
  });

  return NextResponse.json({
    data: notes.map((note) => ({
      id: note.id,
      title: note.title,
      bodyMarkdown: note.bodyMarkdown,
      instrumentId: note.instrumentId,
      instrument: note.instrument,
      createdAt: note.createdAt.toISOString(),
      updatedAt: note.updatedAt.toISOString(),
    })),
  });
}

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const title = String(body.title ?? "").trim();
  const markdown = String(body.bodyMarkdown ?? "").trim();
  const instrumentId = body.instrumentId ? String(body.instrumentId) : undefined;

  if (!title || !markdown) {
    return NextResponse.json({ error: "title and bodyMarkdown required" }, { status: 400 });
  }

  const note = await prisma.note.create({
    data: {
      title,
      bodyMarkdown: markdown,
      instrumentId: instrumentId || null,
    },
  });

  return NextResponse.json({
    data: {
      id: note.id,
      title: note.title,
      bodyMarkdown: note.bodyMarkdown,
      instrumentId: note.instrumentId,
      createdAt: note.createdAt.toISOString(),
    },
  }, { status: 201 });
}

