# Foundation Subtopic Generator — Agent Brief

You are generating practice items for VCE **Foundation Mathematics** (Australian
Year 11/12). This is the most applied, word-heavy of the four maths subjects:
real-world numeracy (shopping, jobs, travel, budgets, simple measurement).

## What you'll produce

For EACH subtopic in your batch:

1. **A generator script** at `scripts/figures/generate-foundation-<subtopic>.ts`
2. **Its JSON output** at `scripts/output/foundation-batch/<subtopic>.json`

The generator runs with `npx tsx scripts/figures/generate-foundation-<subtopic>.ts`
and produces a `{ items: [...] }` JSON.

## Reference (USE THIS)

A complete working pilot lives at
`scripts/figures/generate-foundation-wages-and-salaries.ts`. **Read it first**
and copy its structure exactly. Adapt only the subtopic slug and items.

## Item targets per subtopic

| Tier | MCQ | SHORT | EXT_ANS | EXT_RESP | Total |
|---|---|---|---|---|---|
| core-drill ONLY | 14 | 11 | 0 | 0 | 25 |
| core-drill + extended-fit | 14 | 11 | 3 | 0 | 28 |
| core-drill + extended-fit + modelling-rich | 14 | 11 | 3 | 2 | 30 |

Tier matrix per subtopic is given below — DO NOT generate EXT_RESP for
subtopics not marked modelling-rich. DO NOT generate EXT_ANS for subtopics
that are core-drill ONLY.

Difficulty mix per subtopic: ~50% EASY / ~40% MEDIUM / ~10% HARD.
Foundation HARD usually means "multi-step combining 2-3 concepts", not
abstract complexity.

## Critical rules

- **LaTeX**: `$...$` for inline, `$$...$$` for display. Use `\\$` for dollar
  signs in question text (e.g. `\\$45.20`).
- **Currency**: AUD, 2 decimal places, e.g. `\\$24.80` not `$24.80`.
- **Australian context**: GST is 10%; mention realistic Aussie places where
  apt (Melbourne, Sydney, Brisbane).
- **Metric units**: m, cm, kg, g, L, mL, km/h. Make units explicit.
- **MCQ solution MUST end with `**Answer: X**`** (X is A/B/C/D).
- **SHORT_ANSWER marks: 1-4**. Solutions use `**Step 1 (1 mark):**` per step.
- **EXTENDED_ANSWER marks: 4-8**, 2-5 parts, parts.marks sum to item.marks.
- **EXTENDED_RESPONSE marks: 9-21**, 3-6 parts, parts.marks sum to item.marks.
- **MCQ: marks ALWAYS 1**.
- **No thinking-out-loud** in solutions — no "wait", "recompute", "let me
  re-check", "actually", "intended answer", etc.
- **No chained equalities in display blocks** (`$$A = B = C$$`) — split with
  `\\Rightarrow` or separate `$$...$$` blocks.
- **Solutions must show working** for Foundation: spelled-out arithmetic, no
  jumping to final answers.
- **Distractors** for MCQ should be plausible mistakes: wrong-unit
  conversion, forgot GST, used perimeter instead of area, order-of-operations
  error, etc.

## Subtopic style notes

Most Foundation items have **no diagram needed** — questions describe
scenarios in prose with optional markdown tables. If a question genuinely
needs a diagram (e.g. a labelled triangle for Pythagoras), use the helpers in
`scripts/figures/svg.ts`:
- `shapeWithLabels({shape, width, height, ...})` for rectangles, triangles,
  circles, squares
- `priceTable({rows, headers, footer})` for itemised price tables (or use
  markdown tables which are simpler)
- `pieChart({slices})` for pie charts
- `budgetTable({categories, total})` for budgets
- `scaleDiagram({drawingCm, scale})` for scale drawings
- `vennTwoSet({leftLabel, centerLabel, rightLabel})` for Venn
- `categoryBarChart({bars, title})` for simple bar charts

When you DO use SVG, embed it as a markdown image with `toDataUri()`:
```ts
import { shapeWithLabels, toDataUri } from "./svg";
const fig = toDataUri(shapeWithLabels({ shape: "rectangle", width: 6, height: 4, unit: "m" }));
const content = `... \n\n![diagram](${fig})\n\n ...`;
```

But prefer markdown tables for tabular data — much simpler.

## How to call out tabular data

In `content` strings, escape newlines as `\n` and use standard markdown:

```
| Item | Price |
|---|---|
| Bread | \\$4.50 |
| Milk  | \\$3.20 |
```

## Topic slug mapping

- `algebra-number-and-structure` — all financial maths, percentages,
  ratios, scientific notation, formulas, equations, units, rounding
- `data-analysis-probability-and-statistics` — all data, statistics,
  probability subtopics
- `discrete-mathematics` — counting, flowcharts, networks, scheduling,
  sequencing, route planning
- `space-and-measurement` — area, perimeter, volume, surface area,
  Pythagoras, scale, units of measurement, bearings, similarity, etc.

## After generating

Run each generator script you create:
```bash
npx tsx scripts/figures/generate-foundation-<subtopic>.ts
```

This writes its JSON to `scripts/output/foundation-batch/`. Then verify by
running the seeder in dry-run mode (do NOT live-seed; that's centralised):
```bash
npx tsx --env-file=.env.local scripts/seed-foundation-bank.ts --dry --file <subtopic>.json
```

Fix any validation errors before declaring done.

## Done criteria

Return a concise summary: subtopic → items generated → validated yes/no.
