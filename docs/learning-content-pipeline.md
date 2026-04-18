# Learning Content Pipeline

## Goal
Replace shallow session summaries with full course notes so lesson pages render with:

- structured section hierarchy
- key takeaways blocks
- reference links
- chart-backed visual companions for indicator/strategy topics

## Source Corpus

- `docs/course/sessions/session_1.md`
- `docs/course/sessions/session_4.md`
- `docs/course/sessions/session_5.md`
- `docs/course/sessions/session_6.md`
- `docs/course/sessions/session_7.md`
- `docs/course/sessions/session_9.md`
- `docs/course/classnotes.md`

## Import Command

```bash
pnpm db:import:course
```

This command:

1. Parses each markdown file into ordered `##` sections.
2. Extracts executive summary text and external references.
3. Upserts `KnowledgeDocument`.
4. Rebuilds `KnowledgeSection` rows for deterministic section order.
5. Imports `classnotes_master` as a deep master reference document.

## API Import Behavior

`POST /api/admin/course-sessions/import` now auto-parses markdown input using the same parser.

Required fields:

- `sessionKey`
- `title`
- `bodyMarkdown`

Optional fields:

- `sourceSession`
- `concepts`

Response includes:

- `knowledgeDocumentId`
- `sessionKey`
- `sectionCount`
- `referenceCount`
- `conceptCount`

## UI Rendering Notes

`/learning/[slug]` now renders:

- sticky session navigation (section anchors)
- key takeaways extracted from bullet/numbered lines
- references card with deduplicated URLs
- visual companion charts for RSI/SMA/EMA/Bollinger/SuperTrend-related sections

Chart panels are educational/illustrative and intentionally deterministic.

