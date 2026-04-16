import { NextResponse } from "next/server";
import { prisma } from "@ibo/db";

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const sessionKey = String(body.sessionKey ?? "").trim();
  const title = String(body.title ?? "").trim();
  const bodyMarkdown = String(body.bodyMarkdown ?? "").trim();
  const concepts = Array.isArray(body.concepts)
    ? (body.concepts as string[]).map((concept) => concept.trim()).filter(Boolean)
    : [];

  if (!sessionKey || !title || !bodyMarkdown) {
    return NextResponse.json(
      { error: "sessionKey, title, bodyMarkdown required" },
      { status: 400 },
    );
  }

  const document = await prisma.knowledgeDocument.upsert({
    where: { key: sessionKey },
    update: {
      title,
      bodyMarkdown,
      sourceSession: sessionKey,
      summary: bodyMarkdown.slice(0, 400),
    },
    create: {
      key: sessionKey,
      title,
      sourceSession: sessionKey,
      bodyMarkdown,
      summary: bodyMarkdown.slice(0, 400),
      confidence: "high",
    },
  });

  await prisma.knowledgeSection.deleteMany({ where: { knowledgeDocumentId: document.id } });
  await prisma.knowledgeSection.create({
    data: {
      knowledgeDocumentId: document.id,
      key: `${sessionKey}_body`,
      title,
      bodyMarkdown,
      sortOrder: 0,
    },
  });

  for (const concept of concepts) {
    await prisma.knowledgeConcept.upsert({
      where: { key: concept.toLowerCase().replace(/\s+/g, "_") },
      create: {
        key: concept.toLowerCase().replace(/\s+/g, "_"),
        title: concept,
        category: "concept",
        definition: `${concept} imported from course session ${sessionKey}.`,
      },
      update: {},
    });
  }

  return NextResponse.json({
    data: {
      knowledgeDocumentId: document.id,
      sessionKey,
      conceptCount: concepts.length,
    },
  }, { status: 201 });
}

