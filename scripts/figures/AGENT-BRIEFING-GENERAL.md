# Agent briefing — VCE General Mathematics question-bank generation

This file is referenced by parallel subagents generating clusters of the
1500-item VCE General question bank. It defines the shared schema, helpers,
and quality bar so each agent produces consistent output.

## Mission

Generate question-bank items for the QuestionSet placeholder
`cmpkc57xo0007ofk0uo58ws59` (vce-general). Each agent owns a CLUSTER
of subtopics and produces:

- A TypeScript generator at `scripts/figures/generate-general-{cluster}.ts`
- An output JSON at `scripts/output/qset-general-{cluster}.json`

After the bank is built, the main agent merges JSONs and seeds them.

## Canonical example

**Read `scripts/figures/generate-general-pilot.ts` first.** It is the working
pattern: imports, helper functions (`mcq`, `short`, `extAns`, `extResp`),
diagram embedding, JSON shape, final `writeFileSync`. Copy that scaffold and
substitute your cluster's subtopics.

## Output schema (validated by `scripts/seed-exam-set.ts`)

```ts
{
  subject_slug: "vce-general",
  question_set_id: "cmpkc57xo0007ofk0uo58ws59",
  items: ItemSpec[]
}

interface ItemSpec {
  type: "MCQ" | "SHORT_ANSWER" | "EXTENDED_ANSWER" | "EXTENDED_RESPONSE";
  topic_slug: string;            // see "Topic slugs" below
  subtopic_slugs: string[];      // primary + optional secondary cross-tags
  difficulty: "EASY" | "MEDIUM" | "HARD";
  tech: "TECH_FREE" | "CAS_ALLOWED" | "CAS_REQUIRED";
  marks: number;                 // MCQ must = 1
  order: number;                 // unique within your cluster, start at 0
  content: string;               // markdown + LaTeX; "" for multi-part items
  solutionContent: string;       // markdown + LaTeX; "" for multi-part items
  preamble: string | null;       // shared scenario for EXT_ANS / EXT_RESP only
  parts: Array<{                 // null for MCQ / SHORT_ANSWER
    label: string;               // e.g. "a", "b-i"
    marks: number;               // parts[].marks MUST sum to top-level marks
    content: string;
    solution: string;
    subParts?: Array<{ label, marks, content, solution }>;
  }> | null;
  optionA: string | null;        // MCQ only
  optionB: string | null;        // MCQ only
  optionC: string | null;        // MCQ only
  optionD: string | null;        // MCQ only
  correctOption: "A"|"B"|"C"|"D"|null;  // MCQ only
}
```

For **MCQ**: marks = 1, exactly 4 options A-D, no `parts`/`preamble`.

For **SHORT_ANSWER**: 2-5 marks typical, content holds full question text,
no `parts`/`preamble`.

For **EXTENDED_ANSWER** and **EXTENDED_RESPONSE**:
- `content` and `solutionContent` are `""`
- `preamble` holds the shared scenario (1-3 sentences for EXT_ANS, up to
  half a paragraph for EXT_RESP)
- `parts[].marks` MUST sum to top-level `marks`

EXTENDED_RESPONSE is a heavier scenario-based question (typically 10-15
marks across 4-6 parts). EXTENDED_ANSWER is shorter (5-9 marks, 2-4
parts) and more focused.

## Topic slugs (for `topic_slug`)

Use the slug for your cluster's topic — same slug for every item in your
cluster:

- `algebra-number-and-structure`
- `data-analysis-probability-and-statistics`
- `discrete-mathematics`
- `functions-relations-and-graphs`
- `space-and-measurement`

## Subtopic slugs

Use exactly these slugs (your prompt gives you the relevant ones):

**Algebra, Number, and Structure**
- `arithmetic-sequences`
- `compound-interest`
- `depreciation-flat-rate-reducing-balance-unit-cost`
- `geometric-sequences`
- `leslie-matrices`
- `linear-equations-and-inequalities`
- `loans-and-annuities`
- `matrices-and-matrix-operations`
- `matrix-inverses-and-determinants`
- `perpetuities`
- `recurrence-relations`
- `simple-interest`
- `simultaneous-linear-equations`
- `transition-matrices`

**Data Analysis, Probability, and Statistics**
- `bivariate-data`
- `box-plots`
- `coefficient-of-determination`
- `correlation-pearsons-r`
- `data-transformations`
- `five-number-summary`
- `histograms`
- `least-squares-regression`
- `mean-median-and-standard-deviation`
- `moving-average-smoothing`
- `outliers`
- `residual-analysis`
- `scatterplots`
- `seasonal-indices-and-deseasonalisation`
- `stem-plots`
- `time-series-analysis`
- `univariate-data-distributions`

**Discrete Mathematics**
- `activity-networks`
- `adjacency-matrices`
- `bipartite-graphs`
- `critical-path-analysis`
- `eulerian-trails-and-circuits`
- `flow-problems-max-flow-min-cut`
- `graphs-and-networks`
- `hamiltonian-paths-and-cycles`
- `matching-and-assignment-problems`
- `minimum-spanning-trees`
- `planar-graphs`
- `project-scheduling`
- `shortest-path-problems`
- `trees`

**Functions, Relations, and Graphs**
- `direct-and-inverse-variation`
- `joint-variation`
- `linear-functions`
- `linear-inequalities`
- `linear-modelling`
- `piecewise-linear-functions`
- `simultaneous-linear-equations-graphical`

**Space and Measurement**
- `area-and-surface-area`
- `mensuration`
- `pythagoras-theorem`
- `right-angled-trigonometry`
- `similar-triangles`
- `sine-and-cosine-rules`
- `volume`

## Tier-based item counts per subtopic

Use these targets unless you can produce more high-quality items:

| Tier             | MCQ | SHORT | EXT_ANS | EXT_RESP | Per-subtopic |
|------------------|-----|-------|---------|----------|--------------|
| core-drill       | 12  | 5     | 2       | 2        | 21           |
| extended-fit     | 9   | 4     | 2       | 2        | 17           |
| modelling-rich   | 7   | 4     | 2       | 3        | 16           |

Tier classifications are in `scripts/figures/TIER-MATRIX-GENERAL.md` — your
prompt lists your cluster's classifications too.

## SVG figures (via `scripts/figures/svg.ts`)

Embed SVG as a data URI in markdown image syntax:

```ts
import { svg, toDataUri, scatterPlot, boxPlot, histogramChart, dotPlot,
         stemAndLeaf, timeSeriesPlot, matrixTable, networkGraph,
         weightedNetworkPath, transitionDiagram, criticalPathDiagram,
         functionPlot, shapeWithLabels } from "./svg";

const fig = networkGraph({
  nodes: [{id:"A", x:0, y:0}, {id:"B", x:2, y:1}, ...],
  edges: [{from:"A", to:"B", weight:5}, ...],
});
const md = `![diagram](${toDataUri(fig)})`;
// then content = `Stem text. ${md}\n\nQuestion text.`
```

Read `scripts/figures/svg.ts` for full helper signatures. Key helpers per
subtopic family:

- **Univariate stats**: `dotPlot`, `stemAndLeaf`, `boxPlot`, `histogramChart`
- **Bivariate/regression**: `scatterPlot` (with `regressionLine`, `residualLines`)
- **Time series**: `timeSeriesPlot` (with `smoothedLine`, `trendLine`)
- **Matrices/transition**: `matrixTable`, `transitionDiagram`
- **Networks**: `networkGraph`, `weightedNetworkPath`, `criticalPathDiagram`
- **Linear functions**: `functionPlot` (line equations)
- **Space/measurement**: `shapeWithLabels` (geometry diagrams)

Compose figures **before the question text** for modelling-rich items.

## Quality guardrails

- **NO calculus.** General Mathematics has no derivatives, integrals,
  limits, or transcendental functions in calculus context. If you reach for
  $\frac{d}{dx}$ or $\int$, stop — you're in the wrong subject.
- **LaTeX for math symbols only.** Examples: $\bar x$, $\sigma$ (sd), $r$
  (correlation), $r^2$, $u_{n+1} = R u_n + d$ (recurrence), \$ for currency,
  matrices in `\begin{bmatrix}...\end{bmatrix}` (or use `matrixTable` SVG).
- **MCQs**: 4 plausible options. Distractors target genuine misconceptions
  (sign errors, off-by-one, wrong formula, deseasonalise direction wrong,
  Hamiltonian↔Eulerian confusion, treating r as r², etc.). No silly options.
- **Modelling-rich items**: stem should reference a TABLE or DIAGRAM. Embed
  SVG figures via `toDataUri`. The question style mirrors VCAA Exam 2 —
  multi-part scenarios with a concrete context (Olympic heights, factory
  shifts, ferry timetables, road networks, etc.).
- **Verify numerics independently.** Compound-interest formulas, seasonal
  index calculations, regression line predictions, transition-matrix
  steady states — all easy to compute wrong. Double-check with a fresh
  calculation per item.
- **Marks consistency**: for multi-part items, `parts[].marks` MUST sum
  EXACTLY to top-level `marks`. The seeder rejects mismatches.
- **Order field**: start at 0, increment per item within your cluster.
  Order doesn't need to be globally unique — only within the spec file.

## Subject-specific style notes

- **Statistics**: cite Pearson's *r* with correct sign + magnitude (-1 to
  +1, not -100% to +100%). $r^2$ is "coefficient of determination",
  expressed as decimal OR percentage but be consistent.
- **Financial**: use `\$` for currency (escape the dollar). Always show
  2 dp for money. Compound interest: $A = P(1 + r/n)^{nt}$ or use the
  recurrence form $V_{n+1} = R V_n$ with $R = 1 + r/n$.
- **Recurrence**: state in form $u_{n+1} = R u_n + d$ with explicit $u_0$
  initial condition.
- **Matrices**: use square brackets. Always state dimensions clearly in
  multi-part items. For transition matrices, columns sum to 1 (column-
  stochastic convention used in VCAA).
- **Networks**: nodes labelled A, B, C... or by context (Town 1, Site 2).
  Weighted edges labelled with the weight; specify what the weight
  represents (distance/time/capacity).
- **Time series**: $t$ = period number, $y$ = value. Centred moving
  average for even periods. Deseasonalised value = value ÷ seasonal index.

## Self-validation before reporting back

After writing your generator:

1. **Run it**: `npx tsx scripts/figures/generate-general-{cluster}.ts`
   — should print item counts.
2. **Validate**: `npx tsx --env-file=.env.local scripts/seed-exam-set.ts scripts/output/qset-general-{cluster}.json --dry`
   — should print "Schema valid" and "All topic + subtopic slugs resolved."
3. **Fix any validation errors** before reporting.

Do NOT seed for real. The main agent merges all clusters into one final
seed transaction.

## Report format

When done, report:
- Cluster slug
- Total items written
- Type breakdown (MCQ / SHORT / EXT_ANS / EXT_RESP)
- Validation status (passed --dry?)
- Any subtopics that fell short of target counts and why
