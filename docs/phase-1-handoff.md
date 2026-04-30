# Phase 1 handoff — Exam-Style content refactor

This doc is the clean handoff for the new session that will run Phase 2 (content generation). Phase 1 is fully complete and verified in the running dev server.

## What got done

### 1. Schema (`prisma/schema.prisma`)

```prisma
model QuestionSet {
  id        String  @id @default(cuid())
  name      String
  isDefault Boolean @default(false)    // NEW — exactly one row is true
  // ...existing fields
  @@index([isDefault])
}

model QuestionSetItem {
  // ...existing fields
  status   QuestionSetItemStatus @default(PENDING)   // NEW
  preamble String?                                    // NEW — shared scenario
  parts    Json?                                      // NEW — [{label, marks, content, solution, subParts?}]
  @@index([status])
}

enum QuestionSetItemStatus { PENDING APPROVED REJECTED }  // NEW
```

Pushed via `npx prisma db push`. Prisma client regenerated.

### 2. Two question sets in the DB

```sql
SELECT name, isDefault FROM "QuestionSet" ORDER BY createdAt;
--   1st Generated Question Set  | true   ← Topic page + current Practice default
--   1st Generated Exam Set      | false  ← Empty, populate via /admin/questions
```

All 1,575 existing items backfilled to `status = APPROVED`.

### 3. Split resolver (`lib/question-set-groups.ts`)

- `getGeneratedQuestionSetId()` → **Topic page** — always resolves the legacy named set, ignores `isDefault`.
- `getPracticeQuestionSetId()` → **Practice page** — resolves `isDefault = true`, falls back to the legacy named set.
- `approvedItemsFilter(setId)` → central helper returning `{ questionSetId, status: "APPROVED" }`. Used in every `findMany` that serves items to users. **Rule: every query that reads questions for display MUST use this filter.**

### 4. Rendering path refactor (`app/(app)/practice/session/page.tsx`)

- `fetchAllGrouped` now reads `preamble` + `parts` JSON directly. Multi-part items (EXTENDED_ANSWER / EXTENDED_RESPONSE) render each `part` / `subPart` as its own row with a synthetic `${itemId}::${label}` id, no markdown parsing.
- Exam 1 mode now fetches `["SHORT_ANSWER", "EXTENDED_ANSWER"]` and returns items as-is — no in-code compounding.
- Deleted: `groupIntoCompounds`, `makeCompound`, all wiring of `splitExtendedResponse` / `parseShortAnswerSubparts` in the session page.
- The parser files (`lib/extended-response-parser.ts`, `lib/short-answer-parser.ts`) are still present because `app/(app)/history/[id]/page.tsx` uses them for rendering old session history (legacy data only; new sessions won't touch them).

### 5. Admin UI

- **`/admin/questions`** — now branches on set name:
  - `"1st Generated Exam Set"` → **type-first** layout: 4 cards (MCQ / Short / Ext-Ans / Ext-Resp), each collapsible, showing pending/approved/rejected counts. Each item row has `Approve` / `Reject` / `Mark pending` buttons. Preamble + parts render natively (bordered sub-cards per part/sub-part).
  - `"1st Generated Question Set"` → existing topic-first layout (unchanged, still works for 1,575 legacy items).
- **`/admin/question-sets`** (NEW) — lists both sets with status badges and a `Make default` button that calls `POST /api/admin/question-sets/default { setId }`. The endpoint transactionally unsets the current default and sets the new one.
- **`PATCH /api/admin/question-sets`** — now accepts `status`, `preamble`, `parts` fields in addition to `content` / `solutionContent`.

### 6. Verification run this session

- ✅ Toggled `isDefault` from old set → new set → back, each transaction returned exactly one row with `isDefault = true`.
- ✅ Flipped one MCQ to `PENDING`, confirmed `approvedItemsFilter(setId)` excludes it, flipped back.
- ✅ Topic page (`/topics/algebra-number-and-structure`) loads cleanly with 270 items from the legacy set.
- ✅ Practice page (`/practice/session?mode=exam1&version=exam`) renders: **13 questions · 40 marks · No calculator** — picker still hits the target.
- ✅ `npx tsc --noEmit` — no type errors in the refactored files.

## Phase 2 starting instructions (for the new session)

### Policy

- **No Anthropic API.** Use Claude Code itself — direct edits + Agent subagents spawned by Claude Code.
- Generate questions **by type, not by topic**. The admin UI groups by type. Topic coverage is a tag on each item, not the organising principle.
- **Cover all 4 main topics** (Algebra, Functions, Calculus, Probability) roughly matching VCAA weightings ~20/30/30/20 across all subtopics.
- Items land as **`status = "PENDING"`**. The user approves them via `/admin/questions` before they hit the Practice picker.

### Target volumes

```
MCQ               400–600  (Exam 2 Section A style, 1 mark each)
SHORT_ANSWER      300–400  (Exam 1 Q1–Q5, 1–3 marks, single-part, no calculator)
EXTENDED_ANSWER   150–250  (Exam 1 Q6–Q9, 4–8 marks, 2–4 parts, "hence" flow, no calculator)
EXTENDED_RESPONSE 80–150   (Exam 2 Section B, 10–15 marks, 4–6 parts, cross-topic integrated, CAS allowed)
```

The user may override these numbers — confirm with them before starting generation.

### Real-VCAA style rules (memorised from the 2020-2025 comparison review)

For **Extended-Response** especially:

1. **Cross-topic integration** is the signature of Section B. Every ER should weave 2-3 topics (e.g. polynomial → integration → binomial in one question).
2. **7-10 parts** per question (real VCAA ERs have this, my previous single-topic ERs had only 5-6).
3. **Multi-phase storytelling** — redefine variables mid-question, introduce new models, compare scenarios.
4. **Hybrid/piecewise functions** should appear occasionally (temperature model, tide depth, etc.).
5. **Specific language** — "show that", "express in the form $A \cdot 2^{bx}$", "describe a sequence of three transformations", "correct to two decimal places".
6. **Surprise connections** — a later part reuses an earlier expression in an unexpected way.

For **Extended-Answer** (Exam 1):

- 2-4 parts, "hence"/"using part (a)" flow, typically within a single topic.
- No calculator means all by hand — avoid computations that require numeric log / trig lookup unless standard values.

### Required schema for each type

```ts
// MCQ — single-part, `parts = null`, `preamble = null`
{
  type: "MCQ", status: "PENDING", marks: 1,
  content: "...",
  optionA, optionB, optionC, optionD, correctOption,
  solutionContent,
  topicId, subtopicSlugs, difficulty,
}

// SHORT_ANSWER — single-part, `parts = null`, `preamble = null`
{
  type: "SHORT_ANSWER", status: "PENDING", marks: 1|2|3,
  content, solutionContent,
  topicId, subtopicSlugs, difficulty,
}

// EXTENDED_ANSWER — multi-part, `preamble` + `parts` JSON
{
  type: "EXTENDED_ANSWER", status: "PENDING", marks: 4–8,
  preamble: "Let f(x) = ...",
  parts: [
    { label: "a", marks: 1, content: "Find f'(x).", solution: "..." },
    { label: "b", marks: 3, content: "Hence find the stationary points.", solution: "..." },
    { label: "c", marks: 2, content: "Classify each using the second derivative.", solution: "..." },
  ],
  content: "",                     // legacy fallback — leave empty for native items
  solutionContent: null,           // legacy fallback
  difficulty, topicId, subtopicSlugs,
}

// EXTENDED_RESPONSE — multi-part, `preamble` + `parts` JSON, sub-parts allowed
{
  type: "EXTENDED_RESPONSE", status: "PENDING", marks: 9–15,
  preamble: "The function f : R → R ...",
  parts: [
    { label: "a", marks: 2, content: "...", solution: "..." },
    { label: "b", marks: 3, content: "...", solution: "...",
      subParts: [
        { label: "i", marks: 1, content: "...", solution: "..." },
        { label: "ii", marks: 2, content: "...", solution: "..." },
      ],
    },
    // ... 4–6 top-level parts
  ],
  content: "", solutionContent: null,
  difficulty: "HARD", topicId, subtopicSlugs,
}
```

### Hard audit rules (enforce before writing to DB)

Run `scripts/audit-qsets.ts` or equivalent after every batch. Must return **0 real issues**:

1. **No AI thinking-out-loud** in solutions: "Wait", "recompute", "re-check", "re-examine", "hmm", "actually", "intended answer", "(Assume corrected)", "Let me re-check", etc. If a mistake appears mid-solution, DELETE and rewrite cleanly.
2. **No chained equalities** in display math: `$$A = B = C$$` is WRONG. Use separate blocks.
3. **Marks sum correctly**: `parts[].marks.sum() === totalMarks` for multi-part items. Each `subPart` marks also sum to parent part marks.
4. **MCQ has 4 options + valid `correctOption ∈ {A,B,C,D}`**.
5. **Multi-part types have preamble + ≥2 parts**.
6. **MCQ solutions end with `**Answer: X**`** on its own line.
7. **LaTeX delimiters balance** (`$...$` inline, `$$...$$` block).
8. **Difficulty label matches effort** (EASY = 1 step, MEDIUM = 2-3, HARD = multi-concept).

### Cutover (do at end of Phase 2)

Once enough items are approved:

1. Visit `/admin/question-sets`.
2. Click `Make default` on **1st Generated Exam Set**.
3. That's it. Practice page now reads from the new set on the next request. No deploy, no restart. Topic page stays on the legacy set.

To roll back: click `Make default` on **1st Generated Question Set** — same atomic flip.

## Files touched this session

| File | Change |
|---|---|
| `prisma/schema.prisma` | Added `isDefault`, `status`, `preamble`, `parts`, enum |
| `lib/question-set-groups.ts` | Split resolvers, added `approvedItemsFilter` |
| `app/(app)/practice/session/page.tsx` | Native `parts` rendering, deleted synthesis, exam1 picks SA+EA |
| `app/(app)/admin/questions/page.tsx` | Type-first view for new set + approve/reject controls |
| `app/(app)/admin/question-sets/page.tsx` | NEW — list sets, Make default button |
| `app/api/admin/question-sets/route.ts` | PATCH accepts `status`, `preamble`, `parts` |
| `app/api/admin/question-sets/default/route.ts` | NEW — transactional default toggle |

## Verification checklist run this session

```
✅ SELECT name, isDefault FROM "QuestionSet" — both rows present, old=true, new=false
✅ SELECT status, COUNT(*) FROM "QuestionSetItem" GROUP BY status — 1575 APPROVED, 0 PENDING, 0 REJECTED
✅ Default-toggle transaction: old→new→back, exactly one row true at all times
✅ approvedItemsFilter excludes PENDING items (tested with a round-trip flip)
✅ Topic page /topics/algebra-number-and-structure renders 270 items from legacy set
✅ Practice page /practice/session?mode=exam1&version=exam renders "13 questions · 40 marks · No calculator"
✅ splitExtendedResponse / groupIntoCompounds / makeCompound / parseShortAnswerSubparts — all wiring deleted from session page
```

Phase 1 is **complete**. Start Phase 2 in the new session.
