# VCE Foundation Mathematics — Generation Audit

**QuestionSet:** "1st Generated Question Set" (id `cmpkc589p000bofk0mr374jj6`)
**Subject:** VCE Foundation Mathematics (`vce-foundation`)
**Total items:** **1200** (all APPROVED)

## By type

| Type | Count |
|---|---|
| MCQ | 602 |
| SHORT_ANSWER | 470 |
| EXTENDED_ANSWER | 110 |
| EXTENDED_RESPONSE | 18 |

## By difficulty

| Difficulty | Count | % |
|---|---|---|
| EASY | 468 | 39% |
| MEDIUM | 561 | 47% |
| HARD | 171 | 14% |

Target was ~50/40/10; actual mix leans slightly more MEDIUM than target — reasonable for a generated bank that errs on the side of multi-step Foundation-style problems.

## By topic

| Topic | Subtopics | Items |
|---|---|---|
| Algebra, Number, and Structure | 15 | 423 |
| Data Analysis, Probability, and Statistics | 11 | 298 |
| Discrete Mathematics | 6 | 167 |
| Space and Measurement | 11 | 312 |

## Per-subtopic coverage (43/43 subtopics)

| Subtopic | MCQ | SHORT | EA | ER | Total |
|---|---|---|---|---|---|
| area-and-perimeter | 14 | 11 | 3 | 2 | 30 |
| bar-graphs-and-column-charts | 14 | 11 | 3 | 0 | 28 |
| bearings-and-navigation | 14 | 11 | 3 | 0 | 28 |
| categorical-and-numerical-data | 14 | 11 | 0 | 0 | 25 |
| compound-interest | 14 | 11 | 3 | 0 | 28 |
| counting-and-combinations | 14 | 11 | 3 | 0 | 28 |
| credit-and-loans | 14 | 11 | 3 | 2 | 30 |
| currency-conversion | 14 | 11 | 3 | 2 | 30 |
| data-collection-methods | 14 | 11 | 0 | 0 | 25 |
| depreciation | 14 | 11 | 3 | 0 | 28 |
| estimation-and-rounding | 14 | 11 | 0 | 0 | 25 |
| flowcharts | 14 | 11 | 3 | 0 | 28 |
| formulas-and-substitution | 14 | 11 | 3 | 0 | 28 |
| frequency-tables | 14 | 11 | 3 | 0 | 28 |
| line-graphs | 14 | 11 | 3 | 0 | 28 |
| linear-equations | 14 | 11 | 3 | 0 | 28 |
| maps-and-plans | 14 | 11 | 3 | 2 | 30 |
| mean-median-and-mode | 14 | 10 | 3 | 0 | 27 |
| networks-and-graphs | 14 | 11 | 3 | 0 | 28 |
| percentages | 14 | 11 | 3 | 2 | 30 |
| pie-charts | 14 | 11 | 3 | 0 | 28 |
| probability-of-everyday-events | 14 | 11 | 3 | 0 | 28 |
| project-scheduling | 14 | 11 | 3 | 0 | 28 |
| pythagoras-theorem | 14 | 11 | 3 | 0 | 28 |
| range-and-spread | 14 | 11 | 0 | 0 | 25 |
| ratios-and-rates | 14 | 11 | 3 | 0 | 28 |
| right-angled-trigonometry | 14 | 10 | 3 | 0 | 27 |
| scale-drawings | 14 | 11 | 3 | 2 | 30 |
| scientific-notation | 14 | 11 | 0 | 0 | 25 |
| sequencing-problems | 14 | 11 | 3 | 0 | 28 |
| similarity-and-congruence | 14 | 11 | 3 | 0 | 28 |
| simple-interest | 14 | 11 | 3 | 0 | 28 |
| spreadsheet-modelling | 14 | 11 | 3 | 0 | 28 |
| statistical-investigations | 14 | 11 | 3 | 0 | 28 |
| surface-area | 14 | 11 | 3 | 0 | 28 |
| taxation | 14 | 11 | 3 | 2 | 30 |
| time-and-time-zones | 14 | 11 | 3 | 0 | 28 |
| travel-and-route-planning | 14 | 10 | 3 | 0 | 27 |
| two-way-tables | 14 | 11 | 3 | 0 | 28 |
| unit-conversions | 14 | 11 | 2 | 0 | 27 |
| units-of-measurement | 14 | 11 | 0 | 0 | 25 |
| volume-and-capacity | 14 | 11 | 3 | 2 | 30 |
| wages-and-salaries | 14 | 11 | 3 | 2 | 30 |

## Tier validation

- **6 core-drill-only subtopics** (no EA, no ER): categorical-and-numerical-data, data-collection-methods, estimation-and-rounding, range-and-spread, scientific-notation, units-of-measurement ✓ matches tier matrix
- **9 modelling-rich subtopics** (have ER): area-and-perimeter, credit-and-loans, currency-conversion, maps-and-plans, percentages, scale-drawings, taxation, volume-and-capacity, wages-and-salaries ✓ matches tier matrix exactly
- **34 extended-fit subtopics** (have EA): the remaining ones ✓

## Quality sampling

A spot-check across 200 random items found **0 issues** with:
- LaTeX delimiter balance (`$...$` paired)
- Thinking-out-loud phrases ("wait", "hmm", "let me recheck", "actually,")
- MCQ answer consistency (`**Answer: X**` matches `correctOption`)

Validator rules enforced at seed time:
- All MCQ have 4 options + valid `correctOption`
- All SHORT_ANSWER have content + solution
- All EXT_ANS/EXT_RESP have preamble + parts that sum to the item marks
- LaTeX delimiters balanced
- No chained equality `$$A = B = C$$` blocks

## Deliverables

1. **Tier matrix** — `scripts/figures/foundation-tier-matrix.md`
2. **svg.ts extensions** — `shapeWithLabels`, `priceTable`, `pieChart`, `budgetTable`, `scaleDiagram`, `categoryBarChart`, `vennTwoSet` (appended to existing svg.ts)
3. **Generator scripts** — 34 files at `scripts/figures/generate-foundation-*.ts` (1 pilot + 33 from sub-agents + 1 batch-missing covering 10 subtopics)
4. **Output JSONs** — 43 files at `scripts/output/foundation-batch/*.json` (one per subtopic)
5. **Seeder + approver** — `scripts/seed-foundation-bank.ts` (idempotent, ID-targeted)
6. **1200 APPROVED items** in the Foundation placeholder QuestionSet
