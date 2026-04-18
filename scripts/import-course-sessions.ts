import fs from "node:fs/promises";
import path from "node:path";
import { prisma } from "@ibo/db";
import { parseCourseMarkdown } from "../apps/web/app/lib/course-session-parser";

type SessionInput = {
  key: string;
  sourceSession: string;
  title: string;
  file: string;
};

const sessions: SessionInput[] = [
  {
    key: "session_1",
    sourceSession: "1",
    title: "Session 1 — Market Foundations & Risk Mindset",
    file: "docs/course/sessions/session_1.md",
  },
  {
    key: "session_4",
    sourceSession: "4",
    title: "Session 4 — Price Structure, Zones, and Discipline",
    file: "docs/course/sessions/session_4.md",
  },
  {
    key: "session_5",
    sourceSession: "5",
    title: "Session 5 — Trading System Design, RSI, and Risk Model",
    file: "docs/course/sessions/session_5.md",
  },
  {
    key: "session_6",
    sourceSession: "6",
    title: "Session 6 — Investing Framework, MBB, and BB Strategy",
    file: "docs/course/sessions/session_6.md",
  },
  {
    key: "session_7",
    sourceSession: "7",
    title: "Session 7 — Buying in Dips, Cross, and Swing Discipline",
    file: "docs/course/sessions/session_7.md",
  },
  {
    key: "session_9",
    sourceSession: "9",
    title: "Session 9 — Breakout, BTST, Trend Continuation, Alpha/Beta",
    file: "docs/course/sessions/session_9.md",
  },
];

async function importSession(input: SessionInput) {
  const absPath = path.resolve(input.file);
  const markdown = await fs.readFile(absPath, "utf8");
  const parsed = parseCourseMarkdown({
    sessionKey: input.key,
    sourceSession: input.sourceSession,
    markdown,
    fallbackTitle: input.title,
  });

  const doc = await prisma.knowledgeDocument.upsert({
    where: { key: parsed.key },
    update: {
      title: parsed.title,
      sourceSession: parsed.sourceSession,
      summary: parsed.summary,
      bodyMarkdown: parsed.bodyMarkdown,
      confidence: parsed.confidence,
    },
    create: {
      key: parsed.key,
      title: parsed.title,
      sourceSession: parsed.sourceSession,
      summary: parsed.summary,
      bodyMarkdown: parsed.bodyMarkdown,
      confidence: parsed.confidence,
    },
  });

  await prisma.knowledgeSection.deleteMany({ where: { knowledgeDocumentId: doc.id } });

  if (parsed.sections.length > 0) {
    await prisma.knowledgeSection.createMany({
      data: parsed.sections.map((section) => ({
        knowledgeDocumentId: doc.id,
        key: section.key,
        title: section.title,
        bodyMarkdown: section.bodyMarkdown,
        sortOrder: section.sortOrder,
      })),
    });
  }

  return {
    key: parsed.key,
    title: parsed.title,
    sectionCount: parsed.sections.length,
    referenceCount: parsed.references.length,
  };
}

async function main() {
  const results = [];
  for (const session of sessions) {
    results.push(await importSession(session));
  }

  const classnotesFile = path.resolve("docs/course/classnotes.md");
  const classnotes = await fs.readFile(classnotesFile, "utf8");
  const classnotesParsed = parseCourseMarkdown({
    sessionKey: "classnotes_master",
    sourceSession: "master",
    markdown: classnotes,
    fallbackTitle: "Master Class Notes — Consolidated Reconstruction",
  });

  const classDoc = await prisma.knowledgeDocument.upsert({
    where: { key: classnotesParsed.key },
    update: {
      title: classnotesParsed.title,
      sourceSession: classnotesParsed.sourceSession,
      summary: classnotesParsed.summary,
      bodyMarkdown: classnotesParsed.bodyMarkdown,
      confidence: classnotesParsed.confidence,
    },
    create: {
      key: classnotesParsed.key,
      title: classnotesParsed.title,
      sourceSession: classnotesParsed.sourceSession,
      summary: classnotesParsed.summary,
      bodyMarkdown: classnotesParsed.bodyMarkdown,
      confidence: classnotesParsed.confidence,
    },
  });

  await prisma.knowledgeSection.deleteMany({ where: { knowledgeDocumentId: classDoc.id } });
  await prisma.knowledgeSection.createMany({
    data: classnotesParsed.sections.map((section) => ({
      knowledgeDocumentId: classDoc.id,
      key: section.key,
      title: section.title,
      bodyMarkdown: section.bodyMarkdown,
      sortOrder: section.sortOrder,
    })),
  });

  console.table(results);
  console.log(
    `Imported classnotes_master with ${classnotesParsed.sections.length} sections and ${classnotesParsed.references.length} references.`,
  );
}

main()
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

