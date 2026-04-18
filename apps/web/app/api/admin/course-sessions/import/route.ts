import { NextResponse } from "next/server";
import { prisma } from "@ibo/db";
import { parseCourseMarkdown } from "@/lib/course-session-parser";

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const sessionKey = String(body.sessionKey ?? "").trim();
  const title = String(body.title ?? "").trim();
  const bodyMarkdown = String(body.bodyMarkdown ?? "").trim();
  const concepts = Array.isArray(body.concepts)
    ? (body.concepts as string[]).map((concept) => concept.trim()).filter(Boolean)
    : [];
  const sourceSession = String(body.sourceSession ?? sessionKey.replace("session_", "")).trim();

  if (!sessionKey || !title || !bodyMarkdown) {
    return NextResponse.json(
      { error: "sessionKey, title, bodyMarkdown required" },
      { status: 400 },
    );
  }

  const parsed = parseCourseMarkdown({
    sessionKey,
    sourceSession,
    markdown: bodyMarkdown,
    fallbackTitle: title,
  });

  const document = await prisma.knowledgeDocument.upsert({
    where: { key: sessionKey },
    update: {
      title: parsed.title,
      bodyMarkdown: parsed.bodyMarkdown,
      sourceSession: parsed.sourceSession,
      summary: parsed.summary,
      confidence: parsed.confidence,
    },
    create: {
      key: sessionKey,
      title: parsed.title,
      sourceSession: parsed.sourceSession,
      bodyMarkdown: parsed.bodyMarkdown,
      summary: parsed.summary,
      confidence: parsed.confidence,
    },
  });

  await prisma.knowledgeSection.deleteMany({ where: { knowledgeDocumentId: document.id } });
  if (parsed.sections.length > 0) {
    await prisma.knowledgeSection.createMany({
      data: parsed.sections.map((section) => ({
        knowledgeDocumentId: document.id,
        key: section.key,
        title: section.title,
        bodyMarkdown: section.bodyMarkdown,
        sortOrder: section.sortOrder,
      })),
    });
  } else {
    await prisma.knowledgeSection.create({
      data: {
        knowledgeDocumentId: document.id,
        key: `${sessionKey}_body`,
        title,
        bodyMarkdown,
        sortOrder: 0,
      },
    });
  }

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
      sectionCount: parsed.sections.length,
      referenceCount: parsed.references.length,
      conceptCount: concepts.length,
    },
  }, { status: 201 });
}
