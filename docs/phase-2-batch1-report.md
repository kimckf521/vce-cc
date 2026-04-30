# Phase 2 — Batch 1 (taste-test) report

**Status:** complete. 100 PENDING items inserted into `1st Generated Exam Set`.
**Default flag untouched:** new set `isDefault=false`, legacy set `isDefault=true`. Practice + Topic pages unaffected.

## Counts

```
MCQ               40   (EASY 10, MEDIUM 20, HARD 10)
SHORT_ANSWER      30   (EASY  8, MEDIUM 16, HARD  6)
EXTENDED_ANSWER   20   (MEDIUM 6, HARD 14)
EXTENDED_RESPONSE 10   (all HARD)
TOTAL            100
```

## Topic × Type distribution (primary topic)

| Topic | MCQ | SA | EA | ER |
|---|---:|---:|---:|---:|
| Algebra, Number, and Structure | 8 | 6 | 4 | 0 |
| Functions, Relations, and Graphs | 12 | 9 | 6 | 4 |
| Calculus | 12 | 9 | 6 | 4 |
| Data Analysis, Probability, and Statistics | 8 | 6 | 4 | 2 |

ER items weave subtopics across topics; primary topic shown is the one used for the topic-page FK.

## Review

Visit **`/admin/questions`**, expand `1st Generated Exam Set`. Items listed type-first (MCQ / Short Answer / Extended Answer / Extended Response), each collapsible with per-item `Approve` / `Reject` / `Mark pending`.

## Files produced

```
scripts/seed-phase2.ts                # seeder with 9 audit rules + auto-dechain
scripts/output/phase2-batch/
  mcq-{algebra,functions,calculus,probability}.json
  sa-{algebra,functions,calculus,probability}.json
  ea-{algebra,functions,calculus,probability}.json
  er-batch1.json, er-batch2.json
  .seeded                             # idempotency marker
```

Re-running `npx tsx scripts/seed-phase2.ts` is a no-op (all files marked seeded).

## What the seeder enforces before insert

1. Required fields per type; marks in valid range (MCQ=1, SA 1–3, EA 4–8, ER 9–21).
2. MCQ: 4 options, `**Answer: X**` header, stated answer matches `correctOption`.
3. EA/ER: `preamble` present, ≥2 parts, part marks sum to total, subPart marks sum to parent.
4. No thinking-out-loud phrases (wait, recompute, re-check, etc.).
5. No chained equalities in `$$...$$` — **auto-dechained** via `dechainSolution()` before validation.
6. LaTeX delimiter balance (`$`, `$$`).
7. Step-header marks sum within each solution.
8. Cross-topic subtopic references are logged and skipped (only primary-topic subtopics connect).

## Issues encountered & fixed this run

1. `mcq-calculus.json` had 6 chained-equality errors → wired `dechainSolution()` into the seeder; all passed.
2. ER JSON referenced subtopic slugs outside the primary topic → seeder now skips with an info log instead of throwing.
3. `er-batch2.json` used short topic slugs (`"functions"`, `"probability"`) → normalised in-file to full slugs.
4. Partial first-insert created 2 ER duplicates from a re-run; deduplicated by preamble match.

## Next steps (when you're ready)

- Review the 100 items in `/admin/questions`. Approve the ones that look good; reject any that don't.
- If the style is right, tell me to scale up to the full 400 / 300 / 200 / 100 — ~15–20 more hours, same workflow.
- Once enough items are approved, flip `isDefault` to the new set via `/admin/question-sets` → `Make default`.
