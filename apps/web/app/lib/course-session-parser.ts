export type ParsedSection = {
  key: string;
  title: string;
  bodyMarkdown: string;
  sortOrder: number;
};

export type ParsedCourseDocument = {
  key: string;
  title: string;
  sourceSession: string;
  summary: string;
  bodyMarkdown: string;
  confidence: "low" | "medium" | "high";
  sections: ParsedSection[];
  references: { label: string; url: string }[];
};

function slugify(input: string) {
  return input
    .toLowerCase()
    .replace(/[`*_~]/g, "")
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");
}

function trimSectionBody(body: string) {
  return body.replace(/\n{3,}/g, "\n\n").trim();
}

function extractReferences(markdown: string) {
  const urls = Array.from(markdown.matchAll(/https?:\/\/[^\s)>\]]+/g)).map((m) =>
    m[0].trim().replace(/[.,;:]+$/, ""),
  );
  const unique = Array.from(new Set(urls));
  return unique.map((url) => {
    try {
      const host = new URL(url).hostname.replace(/^www\./, "");
      return { label: host, url };
    } catch {
      return { label: "reference", url };
    }
  });
}

function extractSummary(markdown: string) {
  const summaryMatch = markdown.match(
    /##\s+Executive Summary\s*([\s\S]*?)(?=\n##\s+|\n#\s+|$)/i,
  );
  const source = summaryMatch ? summaryMatch[1] : markdown;
  const lines = source
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .filter((line) => !line.startsWith("---"))
    .slice(0, 6);
  const text = lines
    .join(" ")
    .replace(/[*_`#>-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  return text.slice(0, 420);
}

function inferConfidence(markdown: string): "low" | "medium" | "high" {
  const lower = markdown.toLowerCase();
  if (lower.includes("source reliability: medium")) return "medium";
  if (lower.includes("reliability") && lower.includes("approximate")) return "medium";
  return "high";
}

export function parseCourseMarkdown(input: {
  sessionKey: string;
  sourceSession: string;
  markdown: string;
  fallbackTitle: string;
}): ParsedCourseDocument {
  const lines = input.markdown.split("\n");
  const firstHeading = lines.find((line) => /^#\s+/.test(line));
  const title = firstHeading ? firstHeading.replace(/^#\s+/, "").trim() : input.fallbackTitle;

  const sections: ParsedSection[] = [];
  let currentTitle = "Session Overview";
  let currentLines: string[] = [];
  let sortOrder = 0;

  const pushSection = () => {
    const body = trimSectionBody(currentLines.join("\n"));
    if (!body) return;
    sections.push({
      key: `${input.sessionKey}_${slugify(currentTitle || `section_${sortOrder + 1}`)}`,
      title: currentTitle.trim(),
      bodyMarkdown: body,
      sortOrder,
    });
    sortOrder += 1;
  };

  for (const line of lines) {
    const h2 = line.match(/^##\s+(.+)\s*$/);
    if (h2) {
      pushSection();
      currentTitle = h2[1].trim();
      currentLines = [];
      continue;
    }
    currentLines.push(line);
  }
  pushSection();

  const references = extractReferences(input.markdown);
  if (references.length > 0) {
    sections.push({
      key: `${input.sessionKey}_references`,
      title: "References",
      bodyMarkdown: references.map((ref) => `- [${ref.label}](${ref.url})`).join("\n"),
      sortOrder: sortOrder + 1,
    });
  }

  return {
    key: input.sessionKey,
    title: input.fallbackTitle || title,
    sourceSession: input.sourceSession,
    summary: extractSummary(input.markdown),
    bodyMarkdown: trimSectionBody(input.markdown),
    confidence: inferConfidence(input.markdown),
    sections,
    references,
  };
}

export function extractSectionBulletPoints(markdown: string, limit = 8) {
  return markdown
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => /^[-*]\s+/.test(line) || /^\d+\.\s+/.test(line))
    .map((line) => line.replace(/^[-*]\s+/, "").replace(/^\d+\.\s+/, "").trim())
    .slice(0, limit);
}

