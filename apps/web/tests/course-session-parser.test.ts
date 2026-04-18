import test from "node:test";
import assert from "node:assert/strict";
import { parseCourseMarkdown, extractSectionBulletPoints } from "../app/lib/course-session-parser";

const markdown = `# Sample Session

## Executive Summary
- First summary point
- Second summary point

## Strategy Block
1. Confirm trend
2. Wait for pullback
- Enter on confirmation
Visit https://example.com/reference for details.
`;

test("parseCourseMarkdown splits level-2 sections and extracts references", () => {
  const parsed = parseCourseMarkdown({
    sessionKey: "session_99",
    sourceSession: "99",
    markdown,
    fallbackTitle: "Fallback",
  });

  assert.equal(parsed.key, "session_99");
  assert.equal(parsed.title, "Fallback");
  assert.ok(parsed.summary.includes("First summary point"));
  assert.ok(parsed.sections.length >= 2);
  assert.equal(parsed.references.length, 1);
  assert.equal(parsed.references[0]?.url, "https://example.com/reference");
});

test("extractSectionBulletPoints returns ordered bullets and numbered points", () => {
  const points = extractSectionBulletPoints(markdown);
  assert.deepEqual(points.slice(0, 4), [
    "First summary point",
    "Second summary point",
    "Confirm trend",
    "Wait for pullback",
  ]);
});

