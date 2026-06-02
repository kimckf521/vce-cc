/**
 * VCE General Mathematics — Bivariate & Time Series cluster.
 *
 * Subtopics (9 total):
 *   - scatterplots                              (extended-fit: 17 items)
 *   - correlation-pearsons-r                    (extended-fit: 17 items)
 *   - coefficient-of-determination              (extended-fit: 17 items)
 *   - least-squares-regression                  (modelling-rich: 16 items)
 *   - residual-analysis                         (modelling-rich: 16 items)
 *   - data-transformations                      (modelling-rich: 16 items)
 *   - time-series-analysis                      (modelling-rich: 16 items)
 *   - moving-average-smoothing                  (modelling-rich: 16 items)
 *   - seasonal-indices-and-deseasonalisation    (modelling-rich: 16 items)
 *
 * Target: ~147 items.
 */
import * as fs from "fs";
import * as path from "path";
import { toDataUri, scatterPlot, timeSeriesPlot } from "./svg";

const OUT_DIR = path.resolve(__dirname, "../output");
const QUESTION_SET_ID = "cmpkc57xo0007ofk0uo58ws59";
const SUBJECT_SLUG = "vce-general";
const TOPIC_SLUG = "data-analysis-probability-and-statistics";

type Difficulty = "EASY" | "MEDIUM" | "HARD";
type Tech = "TECH_FREE" | "CAS_ALLOWED" | "CAS_REQUIRED";

interface ItemPart {
  label: string;
  marks: number;
  content: string;
  solution: string;
  subParts?: { label: string; marks: number; content: string; solution: string }[];
}

interface Item {
  type: "MCQ" | "SHORT_ANSWER" | "EXTENDED_ANSWER" | "EXTENDED_RESPONSE";
  topic_slug: string;
  subtopic_slugs: string[];
  difficulty: Difficulty;
  tech: Tech;
  marks: number;
  order: number;
  content: string;
  solutionContent: string;
  preamble: string | null;
  parts: ItemPart[] | null;
  optionA: string | null;
  optionB: string | null;
  optionC: string | null;
  optionD: string | null;
  correctOption: string | null;
}

const items: Item[] = [];
let order = 0;

const img = (s: string) => `![diagram](${toDataUri(s)})`;

let CURRENT_SUBTOPIC = "scatterplots";

const mcq = (
  content: string,
  options: [string, string, string, string],
  correct: "A" | "B" | "C" | "D",
  difficulty: Difficulty,
  solution: string,
  tech: Tech = "TECH_FREE",
) => {
  items.push({
    type: "MCQ",
    topic_slug: TOPIC_SLUG,
    subtopic_slugs: [CURRENT_SUBTOPIC],
    difficulty,
    tech,
    marks: 1,
    order: order++,
    content,
    solutionContent: solution,
    preamble: null,
    parts: null,
    optionA: options[0],
    optionB: options[1],
    optionC: options[2],
    optionD: options[3],
    correctOption: correct,
  });
};

const short = (
  content: string,
  marks: number,
  difficulty: Difficulty,
  solution: string,
  tech: Tech = "CAS_ALLOWED",
) => {
  items.push({
    type: "SHORT_ANSWER",
    topic_slug: TOPIC_SLUG,
    subtopic_slugs: [CURRENT_SUBTOPIC],
    difficulty,
    tech,
    marks,
    order: order++,
    content,
    solutionContent: solution,
    preamble: null,
    parts: null,
    optionA: null,
    optionB: null,
    optionC: null,
    optionD: null,
    correctOption: null,
  });
};

const extAns = (
  parts: ItemPart[],
  difficulty: Difficulty,
  preamble: string | null = null,
  tech: Tech = "CAS_REQUIRED",
) => {
  const marks = parts.reduce(
    (s, p) =>
      s + (p.subParts && p.subParts.length > 0 ? p.subParts.reduce((ss, sp) => ss + sp.marks, 0) : p.marks),
    0,
  );
  items.push({
    type: "EXTENDED_ANSWER",
    topic_slug: TOPIC_SLUG,
    subtopic_slugs: [CURRENT_SUBTOPIC],
    difficulty,
    tech,
    marks,
    order: order++,
    content: "",
    solutionContent: "",
    preamble,
    parts,
    optionA: null,
    optionB: null,
    optionC: null,
    optionD: null,
    correctOption: null,
  });
};

const extResp = (
  parts: ItemPart[],
  difficulty: Difficulty,
  preamble: string,
  tech: Tech = "CAS_REQUIRED",
) => {
  const marks = parts.reduce(
    (s, p) =>
      s + (p.subParts && p.subParts.length > 0 ? p.subParts.reduce((ss, sp) => ss + sp.marks, 0) : p.marks),
    0,
  );
  items.push({
    type: "EXTENDED_RESPONSE",
    topic_slug: TOPIC_SLUG,
    subtopic_slugs: [CURRENT_SUBTOPIC],
    difficulty,
    tech,
    marks,
    order: order++,
    content: "",
    solutionContent: "",
    preamble,
    parts,
    optionA: null,
    optionB: null,
    optionC: null,
    optionD: null,
    correctOption: null,
  });
};

// ─── Shared diagram fixtures ───────────────────────────────────────────

// A. Strong positive linear scatter (study hours vs test score)
const studyScoreScatter = scatterPlot({
  points: [
    { x: 2, y: 45 }, { x: 3, y: 52 }, { x: 4, y: 58 }, { x: 5, y: 64 },
    { x: 6, y: 70 }, { x: 7, y: 75 }, { x: 8, y: 82 }, { x: 9, y: 88 },
    { x: 10, y: 92 },
  ],
  xRange: [0, 11], yRange: [30, 100],
  xLabel: "study hours", yLabel: "test score",
  xTicks: [0, 2, 4, 6, 8, 10],
  yTicks: [30, 40, 50, 60, 70, 80, 90, 100],
});

// B. Strong negative linear scatter (age of car vs price)
const carPriceScatter = scatterPlot({
  points: [
    { x: 1, y: 28 }, { x: 2, y: 25 }, { x: 3, y: 22 }, { x: 4, y: 18 },
    { x: 5, y: 16 }, { x: 6, y: 13 }, { x: 7, y: 11 }, { x: 8, y: 8 },
    { x: 9, y: 6 }, { x: 10, y: 5 },
  ],
  xRange: [0, 11], yRange: [0, 32],
  xLabel: "age (years)", yLabel: "price (\\$000s)",
  xTicks: [0, 2, 4, 6, 8, 10],
  yTicks: [0, 5, 10, 15, 20, 25, 30],
});

// C. Weak positive scatter (sleep vs grade)
const weakScatter = scatterPlot({
  points: [
    { x: 5, y: 60 }, { x: 6, y: 55 }, { x: 6, y: 70 }, { x: 7, y: 62 },
    { x: 7, y: 75 }, { x: 8, y: 68 }, { x: 8, y: 78 }, { x: 9, y: 72 },
    { x: 9, y: 82 }, { x: 10, y: 80 },
  ],
  xRange: [4, 11], yRange: [50, 90],
  xLabel: "sleep (hours)", yLabel: "grade (%)",
  xTicks: [4, 5, 6, 7, 8, 9, 10, 11],
  yTicks: [50, 60, 70, 80, 90],
});

// D. Non-linear (curved up) — for transformation context
const curvedUpScatter = scatterPlot({
  points: [
    { x: 1, y: 2 }, { x: 2, y: 5 }, { x: 3, y: 10 }, { x: 4, y: 17 },
    { x: 5, y: 26 }, { x: 6, y: 37 }, { x: 7, y: 50 }, { x: 8, y: 65 },
  ],
  xRange: [0, 9], yRange: [0, 70],
  xLabel: "x", yLabel: "y",
  xTicks: [0, 2, 4, 6, 8],
  yTicks: [0, 10, 20, 30, 40, 50, 60, 70],
});

// E. Regression-line scatter (with line drawn)
const regressionScatter = scatterPlot({
  points: [
    { x: 2, y: 47 }, { x: 3, y: 50 }, { x: 4, y: 58 }, { x: 5, y: 64 },
    { x: 6, y: 68 }, { x: 7, y: 76 }, { x: 8, y: 80 }, { x: 9, y: 88 },
  ],
  xRange: [0, 11], yRange: [30, 100],
  xLabel: "study hours", yLabel: "test score",
  regressionLine: { slope: 5.7, intercept: 36, label: "y = 36 + 5.7x" },
  xTicks: [0, 2, 4, 6, 8, 10],
  yTicks: [30, 40, 50, 60, 70, 80, 90, 100],
});

// F. Residual plot — random scatter (good fit)
const goodResiduals = scatterPlot({
  points: [
    { x: 2, y: -1.5 }, { x: 3, y: 0.8 }, { x: 4, y: -0.4 }, { x: 5, y: 1.2 },
    { x: 6, y: -1.0 }, { x: 7, y: 0.5 }, { x: 8, y: -0.7 }, { x: 9, y: 1.1 },
  ],
  xRange: [0, 11], yRange: [-3, 3],
  xLabel: "x", yLabel: "residual",
  regressionLine: { slope: 0, intercept: 0, color: "#777" },
  xTicks: [0, 2, 4, 6, 8, 10],
  yTicks: [-3, -2, -1, 0, 1, 2, 3],
});

// G. Residual plot — curved pattern (bad fit)
const curvedResiduals = scatterPlot({
  points: [
    { x: 1, y: -3 }, { x: 2, y: -1.5 }, { x: 3, y: 0 }, { x: 4, y: 1.4 },
    { x: 5, y: 2 }, { x: 6, y: 1.5 }, { x: 7, y: 0.2 }, { x: 8, y: -1.8 },
    { x: 9, y: -3.2 },
  ],
  xRange: [0, 10], yRange: [-4, 3],
  xLabel: "x", yLabel: "residual",
  regressionLine: { slope: 0, intercept: 0, color: "#777" },
  xTicks: [0, 2, 4, 6, 8, 10],
  yTicks: [-4, -3, -2, -1, 0, 1, 2, 3],
});

// H. Time-series with upward trend
const trendTimeSeries = timeSeriesPlot({
  points: [
    { t: 1, y: 12 }, { t: 2, y: 14 }, { t: 3, y: 13 }, { t: 4, y: 16 },
    { t: 5, y: 18 }, { t: 6, y: 17 }, { t: 7, y: 20 }, { t: 8, y: 22 },
    { t: 9, y: 21 }, { t: 10, y: 25 },
  ],
  yRange: [10, 28],
  xLabel: "quarter", yLabel: "sales (\\$000s)",
  xTicks: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
  yTicks: [10, 14, 18, 22, 26],
  connectPoints: true,
});

// I. Time-series with seasonality (quarterly, 2-year)
const seasonalTimeSeries = timeSeriesPlot({
  points: [
    { t: 1, y: 30 }, { t: 2, y: 55 }, { t: 3, y: 80 }, { t: 4, y: 45 },
    { t: 5, y: 34 }, { t: 6, y: 60 }, { t: 7, y: 85 }, { t: 8, y: 50 },
  ],
  yRange: [20, 95],
  xLabel: "quarter (1 = Q1 yr 1)", yLabel: "ice-cream sales",
  xTicks: [1, 2, 3, 4, 5, 6, 7, 8],
  yTicks: [20, 40, 60, 80],
  connectPoints: true,
});

// ═══════════════════════════════════════════════════════════════════════
// SUBTOPIC 1: scatterplots (extended-fit: 9 MCQ + 4 SHORT + 2 EXT_ANS + 2 EXT_RESP = 17)
// ═══════════════════════════════════════════════════════════════════════
CURRENT_SUBTOPIC = "scatterplots";

mcq(
  `When describing a scatterplot, the three features that should always be reported are\n\n`,
  [
    "form, direction, and strength",
    "mean, median, and mode",
    "slope, intercept, and correlation",
    "outliers, residuals, and gaps",
  ],
  "A",
  "EASY",
  "**Answer: A**\n\nThe standard VCE description requires **form** (linear / non-linear), **direction** (positive / negative), and **strength** (weak / moderate / strong). Outliers may be mentioned in addition.",
);

mcq(
  `${img(studyScoreScatter)}\n\nThe scatterplot above is best described as\n\n`,
  [
    "non-linear, positive, weak",
    "linear, positive, strong",
    "linear, negative, strong",
    "linear, positive, weak",
  ],
  "B",
  "EASY",
  "**Answer: B**\n\nThe points lie tightly along an upward-sloping straight line — **linear**, **positive direction** (y increases with x), and **strong** (very little scatter about the line).",
);

mcq(
  `${img(carPriceScatter)}\n\nThe scatterplot of car price against age above shows a\n\n`,
  [
    "strong positive linear association",
    "strong negative linear association",
    "weak negative non-linear association",
    "weak positive linear association",
  ],
  "B",
  "EASY",
  "**Answer: B**\n\nThe price decreases consistently as the age increases, and the points lie close to a straight downward line — **strong**, **negative**, **linear**.",
);

mcq(
  `${img(weakScatter)}\n\nThe scatterplot above shows\n\n`,
  [
    "no association between the variables",
    "a moderate to weak positive linear association",
    "a strong negative linear association",
    "a strong positive linear association",
  ],
  "B",
  "MEDIUM",
  "**Answer: B**\n\nThe points trend upward but with considerable scatter — a **weak to moderate positive** linear association. Not 'no association' because the upward trend is still visible; not 'strong' because individual points deviate considerably from the trend.",
);

mcq(
  `${img(curvedUpScatter)}\n\nThe scatterplot above shows an association that is best described as\n\n`,
  [
    "linear and positive",
    "non-linear and positive",
    "linear and negative",
    "random — no clear pattern",
  ],
  "B",
  "EASY",
  "**Answer: B**\n\nThe points curve upward (steeper as x increases). The direction is positive but the form is clearly **non-linear** — a straight-line fit would be inappropriate.",
);

mcq(
  `For a scatterplot to be appropriately described as showing a **linear** association, the points should\n\n`,
  [
    "be exactly on a straight line",
    "lie approximately along a straight line, with no systematic curvature",
    "lie along a curve such as a parabola",
    "form a symmetric oval shape only",
  ],
  "B",
  "EASY",
  "**Answer: B**\n\nReal data is noisy — what matters for linearity is that the *underlying* pattern is straight (no consistent curvature), not that every point sits exactly on the line.",
);

mcq(
  `In a scatterplot, the **response (dependent) variable** is conventionally placed on the\n\n`,
  [
    "horizontal axis",
    "vertical axis",
    "either axis — it does not matter",
    "axis with the larger scale",
  ],
  "B",
  "EASY",
  "**Answer: B**\n\nConvention: explanatory (independent) variable on the **x-axis** (horizontal), response variable on the **y-axis** (vertical). This convention is critical when computing a least-squares line.",
);

mcq(
  `An association in a scatterplot is described as **negative** when\n\n`,
  [
    "the slope of any line of best fit is negative — as x increases, y decreases",
    "the value of the correlation coefficient is exactly $-1$",
    "all the y-values are negative numbers",
    "the points are below the x-axis",
  ],
  "A",
  "EASY",
  "**Answer: A**\n\nNegative association = downward trend (as x increases, y decreases). Options B-D conflate sign of association with sign of values or a specific extreme r-value.",
);

mcq(
  `Which of the following scatterplot patterns suggests an outlier should be investigated?\n\n`,
  [
    "A single point well away from the main cluster, far from the trend",
    "All points evenly spaced along a line",
    "A cluster of points near the origin",
    "Two parallel clusters of equal size",
  ],
  "A",
  "EASY",
  "**Answer: A**\n\nAn outlier is a point that does not fit the overall pattern — typically isolated from the main cluster and far from the line of best fit. Even spacing or symmetric clusters are not outliers per se.",
);

// SHORT (4)
short(
  `A small data set of $(x, y)$ values is given below:\n\n| $x$ | 1 | 2 | 3 | 4 | 5 |\n|---|---|---|---|---|---|\n| $y$ | 3 | 5 | 7 | 9 | 11 |\n\n**a.** Plot the points on a scatterplot or describe what the plot would look like. (1 mark)\n\n**b.** Describe the association in terms of form, direction and strength. (2 marks) (3 marks)`,
  3,
  "EASY",
  "**a.** Points lie exactly on the line $y = 2x + 1$: $(1,3),(2,5),(3,7),(4,9),(5,11)$.\n\n**b.** **Form**: linear. **Direction**: positive (y increases with x). **Strength**: perfect (every point on the line) — strongest possible.",
);

short(
  `${img(studyScoreScatter)}\n\nUsing the scatterplot above, describe the association between study hours and test score in terms of form, direction, and strength. (3 marks)`,
  3,
  "EASY",
  "**Form**: linear (the points lie close to a straight line, with no systematic curvature). **Direction**: positive — test score increases as study hours increase. **Strength**: strong — the points cluster tightly along the line. (1 mark each.)",
);

short(
  `A researcher records the height (cm) and arm-span (cm) of 8 students:\n\n| Height | 160 | 165 | 170 | 172 | 175 | 178 | 180 | 184 |\n|---|---|---|---|---|---|---|---|---|\n| Arm-span | 158 | 162 | 168 | 173 | 174 | 180 | 178 | 185 |\n\n**a.** Which variable is the explanatory (independent) variable in this context, and which is the response? Briefly justify. (2 marks)\n\n**b.** Describe the form, direction and strength of the association suggested by the data. (2 marks) (4 marks)`,
  4,
  "MEDIUM",
  "**a.** Either is defensible depending on context, but the standard biology convention is: **height** as the explanatory variable (the easier-to-measure structural variable), **arm-span** as the response (predicted from height). 1 mark for stating the choice, 1 mark for a coherent justification.\n\n**b.** Linear, positive, strong. As height increases, arm-span increases at roughly the same rate; the values lie close to a straight line.",
);

short(
  `${img(carPriceScatter)}\n\n**a.** Describe the association shown in the scatterplot above. (2 marks)\n\n**b.** A used-car dealer claims, based on this scatterplot, that 'price falls steadily by roughly the same amount each year'. Is the claim consistent with what the scatterplot shows? Justify. (2 marks) (4 marks)`,
  4,
  "MEDIUM",
  "**a.** Strong, negative, linear association: as the age of the car increases, the price decreases consistently.\n\n**b.** **Yes** — the linear pattern indicates a roughly constant decrease in price per year. A linear scatter is consistent with 'falls by the same amount each year'; a curved scatter would indicate the rate of fall changes over time (e.g. faster early depreciation).",
);

// EXT_ANS (2)
extAns(
  [
    {
      label: "a",
      marks: 2,
      content: `Describe the association shown in the scatterplot in terms of form, direction and strength.\n\n${img(weakScatter)}`,
      solution: "Form: linear (no clear curvature). Direction: positive (grade tends to rise with sleep). Strength: weak to moderate — there is noticeable scatter about any straight line through the points.",
    },
    {
      label: "b",
      marks: 1,
      content: `State one reason why a strong claim such as 'every extra hour of sleep raises the grade by 5%' could **not** be drawn from this scatterplot.`,
      solution: "The association is only weak to moderate; there is too much scatter for the trend to support such a precise per-hour claim. Other factors (study quality, motivation) are clearly contributing to variation in grade.",
    },
    {
      label: "c",
      marks: 2,
      content: `Suggest two further pieces of information that would help in deciding whether sleep is a useful predictor of grade.`,
      solution: "Any two of: the value of Pearson's $r$ to quantify strength; the value of $r^2$ to quantify proportion of variation explained; a residual plot to check linearity; a larger sample size to reduce sampling variability; the equation of a least-squares line for prediction. (1 mark each, max 2.)",
    },
  ],
  "MEDIUM",
  `A school counsellor records the average nightly sleep (hours) and end-of-semester grade (%) for ten Year 12 students. The scatterplot follows.`,
);

extAns(
  [
    {
      label: "a",
      marks: 2,
      content: `Describe the association between rainfall and crop yield in terms of form, direction, and strength.\n\n${img(curvedUpScatter)}`,
      solution: "Form: **non-linear** (clear upward curvature; yield rises faster at higher rainfall in this range). Direction: positive. Strength: strong (very low scatter around the curve).",
    },
    {
      label: "b",
      marks: 2,
      content: `Explain, in this context, why fitting a straight line to these data would be inappropriate.`,
      solution: "Because the relationship is curved, a straight line would systematically underestimate yield at the low and high ends and overestimate it in the middle, producing a curved residual pattern. The model would mis-state the rate of change at any point and any predictions would be biased.",
    },
    {
      label: "c",
      marks: 1,
      content: `Suggest a transformation that might linearise the data.`,
      solution: "Apply a $y' = y^{1/2}$ (square-root) or $\\log(y)$ transformation, or equivalently an $x' = x^2$ transformation — either tends to straighten data that curves upward.",
    },
  ],
  "MEDIUM",
  `Eight farms in a region recorded their rainfall (mm) over the season and their crop yield (tonnes per hectare). The scatterplot shows the result.`,
);

// EXT_RESP (2)
extResp(
  [
    {
      label: "a",
      marks: 2,
      content: `State the explanatory and response variables in this study and justify your choice.`,
      solution: "**Explanatory**: study hours (the variable the student can directly control / vary). **Response**: test score (the outcome we want to predict from study hours). 1 mark for stating, 1 mark for the justification.",
    },
    {
      label: "b",
      marks: 2,
      content: `Describe the association shown in the scatterplot in terms of form, direction, and strength.\n\n${img(studyScoreScatter)}`,
      solution: "Form: linear (no curvature). Direction: positive (more hours -> higher score). Strength: strong (very tight clustering about a straight line).",
    },
    {
      label: "c",
      marks: 2,
      content: `Approximately how much does the test score increase for each additional hour of study, based on the scatterplot? Estimate from the plot (no calculation required).`,
      solution: "From the plot, scores rise from about 45 at $x=2$ to about 92 at $x=10$: a rise of about $47$ over a run of $8$ hours, giving a rate of roughly $\\mathbf{6}$ marks per hour (any answer between 5 and 7 is acceptable).",
    },
    {
      label: "d",
      marks: 2,
      content: `Identify any students who appear to be performing unusually relative to the linear trend, and describe what 'unusual' would look like on this plot.`,
      solution: "An 'unusual' student would be one whose point lies well above or below the straight-line trend (large positive or negative residual). On the given plot there are no obvious outliers — every point sits close to the line. Award 1 mark for the criterion (a point far from the line) and 1 mark for the verdict that no clear outliers are present.",
    },
    {
      label: "e",
      marks: 2,
      content: `Even if the association is strong and linear, why is it incorrect to claim 'studying more **causes** higher test scores'?`,
      solution: "Strong correlation does not imply causation. Other lurking variables (motivation, prior ability, quality of study, sleep, anxiety levels) could be driving both variables. To support a causal claim a controlled study or randomised experiment is needed, not observational scatterplot data.",
    },
  ],
  "MEDIUM",
  `**Question — Study habits and test scores**\n\nA teacher records weekly study hours and the resulting test score for nine Year 12 students. The scatterplot is shown.`,
);

extResp(
  [
    {
      label: "a",
      marks: 2,
      content: `Identify the explanatory variable and the response variable in this study, and justify briefly.\n\n${img(carPriceScatter)}`,
      solution: "Explanatory: age of the car (years). Response: price (\\$000s). Age drives price; price does not drive age, so age is the explanatory variable.",
    },
    {
      label: "b",
      marks: 2,
      content: `Describe the association in terms of form, direction and strength.`,
      solution: "Linear, negative, strong — price decreases approximately uniformly with age, and points lie close to a straight line.",
    },
    {
      label: "c",
      marks: 2,
      content: `Estimate from the scatterplot the approximate price drop per year of age.`,
      solution: "From $28k at age 1 to about $5k at age 10: a drop of \\$23k over 9 years, i.e. roughly **\\$2,500 per year** (any answer between \\$2,000 and \\$3,000 per year is acceptable).",
    },
    {
      label: "d",
      marks: 3,
      content: `A buyer uses the scatterplot to estimate the price of a 15-year-old car of the same model. Identify two reasons this prediction is unreliable.`,
      solution: "Any two of (1 + 2 = 3 marks, with one mark for stating each reason and a third for clarity / context): (i) **extrapolation** — 15 years is beyond the data range (1-10 years), so the linear pattern observed may not continue; (ii) at older ages other effects (mechanical failures, parts availability, end-of-life value) may dominate, distorting the linear relationship; (iii) the linear model could predict a **negative price** at 15 years, which is impossible; (iv) sample size is small (only 10 cars), so the line of best fit has noticeable uncertainty.",
    },
    {
      label: "e",
      marks: 2,
      content: `What scatterplot feature would alert you that linear regression on price vs age might be unsuitable, even within the observed range?`,
      solution: "**Curvature** in the scatterplot — if points bent above the line at low ages and below at middle ages (or some other systematic deviation from a straight line), a linear fit would be biased and a transformation or curved model would be needed. The presence of a single influential outlier could also distort the line and would be a second warning sign.",
    },
  ],
  "HARD",
  `**Question — Depreciation of used cars**\n\nA used-car dealer tabulates the age (years) and sale price (in thousands of dollars) of ten cars of the same model. The scatterplot is shown.`,
);

console.log(`Scatterplots complete: ${items.length} items so far.`);

// ═══════════════════════════════════════════════════════════════════════
// SUBTOPIC 2: correlation-pearsons-r (extended-fit: 9+4+2+2 = 17)
// ═══════════════════════════════════════════════════════════════════════
CURRENT_SUBTOPIC = "correlation-pearsons-r";

mcq(
  `The Pearson product-moment correlation coefficient $r$ can take values in the range\n\n`,
  ["$0 \\leq r \\leq 1$", "$-1 \\leq r \\leq 1$", "$-100 \\leq r \\leq 100$", "any real number"],
  "B",
  "EASY",
  "**Answer: B**\n\nPearson's $r$ lies in $[-1, 1]$. A common distractor is the percentage range $\\pm 100\\%$ — that range is for $r^2$ expressed as a percentage, not $r$ itself.",
);

mcq(
  `If a scatterplot shows a perfect negative linear association, the value of Pearson's $r$ is\n\n`,
  ["$-1$", "$0$", "$1$", "$-0.5$"],
  "A",
  "EASY",
  "**Answer: A**\n\n'Perfect' = every point on a line. 'Negative' = downward sloping line. So $r = -1$.",
);

mcq(
  `Pearson's correlation coefficient $r$ is an appropriate measure of the strength of association only when\n\n`,
  [
    "the data are bivariate, the association is linear, and there are no significant outliers",
    "the data values are all positive",
    "the explanatory variable is categorical",
    "the sample contains at least 100 observations",
  ],
  "A",
  "MEDIUM",
  "**Answer: A**\n\nThe three standard prerequisites for using Pearson's $r$: bivariate numerical data, linear association, and absence of major outliers (which can severely distort $r$). The data do not need to be positive, the explanatory variable must be numerical (not categorical), and no minimum sample size is required for the formula.",
);

mcq(
  `Two variables $x$ and $y$ have a correlation coefficient of $r = -0.85$. The association is best described as\n\n`,
  [
    "strong, negative, linear",
    "moderate, negative, linear",
    "weak, negative, linear",
    "strong, positive, linear",
  ],
  "A",
  "EASY",
  "**Answer: A**\n\n$|r| = 0.85$ falls in the conventional 'strong' band ($0.7 < |r| \\leq 0.9$ moderate-to-strong; many VCAA references treat $|r| > 0.75$ as strong and $> 0.9$ as very strong). The negative sign indicates direction.",
);

mcq(
  `For two variables $x$ and $y$, the value of $r$ is $0.4$. Which of the following statements is correct?\n\n`,
  [
    "$y$ tends to increase as $x$ increases, but the linear association is weak",
    "$y$ tends to decrease as $x$ increases",
    "40% of the variation in $y$ is explained by $x$",
    "The variables are not linearly associated",
  ],
  "A",
  "EASY",
  "**Answer: A**\n\nPositive $r$ means $y$ tends to rise with $x$, and $|r| = 0.4$ is weak. Option C is wrong because '40% explained' would require $r^2 = 0.40$ (here $r^2 = 0.16$). Option D is too strong — there *is* a weak linear association.",
);

mcq(
  `If a scatterplot shows a strong **non-linear** association between $x$ and $y$ (a clear curve), the value of Pearson's $r$ will be\n\n`,
  [
    "exactly $\\pm 1$ because the association is strong",
    "close to $0$ because the association is non-linear",
    "potentially small in magnitude, because $r$ measures only **linear** association — the curve may give a low $r$ despite a strong relationship",
    "always close to $0.5$",
  ],
  "C",
  "MEDIUM",
  "**Answer: C**\n\nPearson's $r$ specifically measures linear association. A strong curved relationship (e.g. parabola) may yield a low $r$ — for instance, a perfect symmetric parabola gives $r = 0$ despite a deterministic relationship between the variables.",
);

mcq(
  `Which of the following is **true** about Pearson's $r$?\n\n`,
  [
    "$r$ has units that match the response variable",
    "$r$ is dimensionless and unaffected by changing the units of $x$ or $y$",
    "$r$ depends on which variable is plotted on the horizontal axis",
    "$r$ changes sign when $x$ and $y$ are interchanged",
  ],
  "B",
  "MEDIUM",
  "**Answer: B**\n\n$r$ is dimensionless (it is standardised). Changing units (km -> m, kg -> g) does not change $r$. It is also symmetric in $x$ and $y$ (the same value whether you correlate $x$ with $y$ or $y$ with $x$), so swapping the variables does not flip the sign.",
);

mcq(
  `A correlation coefficient of $r = 0.95$ between hours studied and final grade means\n\n`,
  [
    "Studying causes higher grades",
    "There is a very strong positive linear association — but correlation does not establish causation",
    "Hours studied determines grade exactly",
    "95% of grades are above average",
  ],
  "B",
  "MEDIUM",
  "**Answer: B**\n\n$r = 0.95$ is very strong positive linear correlation but **does not** establish causation — a third variable (motivation, etc.) may drive both. Option A is the classic 'correlation is not causation' trap; options C and D misinterpret what $r$ measures.",
);

mcq(
  `If $r = -0.9$ between $x$ and $y$, then the percentage of variation in $y$ explained by $x$ is approximately\n\n`,
  ["$-90\\%$", "$-81\\%$", "$81\\%$", "$90\\%$"],
  "C",
  "MEDIUM",
  "**Answer: C**\n\n$r^2 = (-0.9)^2 = 0.81 = 81\\%$. The percentage variation explained is always a non-negative number — the sign of $r$ does not carry across to $r^2$. Option D confuses $r$ with $r^2$.",
);

// SHORT (4)
short(
  `For each of the following correlation coefficients, describe the association between $x$ and $y$ in terms of direction and strength:\n\n**a.** $r = 0.92$ (1 mark)\n\n**b.** $r = -0.3$ (1 mark)\n\n**c.** $r = 0.05$ (1 mark)\n\n**d.** $r = -0.78$ (1 mark) (4 marks)`,
  4,
  "EASY",
  "**a.** Strong (very strong) positive linear association.\n\n**b.** Weak negative linear association.\n\n**c.** No (or negligible) linear association.\n\n**d.** Moderate to strong negative linear association.\n\n(1 mark each, with reasonable boundary words accepted.)",
);

short(
  `A CAS calculator gives $r = -0.847$ for the bivariate set $\\{$car age, car price$\\}$ in a recent dataset of 12 cars.\n\n**a.** State the value of $r$ rounded to 2 decimal places, and describe the linear association in context. (2 marks)\n\n**b.** State **three** conditions that should be checked before quoting $r$ as a meaningful measure of association. (3 marks) (5 marks)`,
  5,
  "MEDIUM",
  "**a.** $r \\approx -0.85$. There is a **strong negative linear association** between the age of a car and its price — as the age increases, the price tends to decrease in a roughly linear fashion.\n\n**b.** Three conditions: (i) the data are **bivariate numerical**; (ii) the scatterplot shows a **roughly linear** pattern (no clear curvature); (iii) there are **no significant outliers** distorting the value of $r$.",
  "CAS_ALLOWED",
);

short(
  `Five $(x, y)$ data points are given:\n\n| $x$ | 1 | 2 | 3 | 4 | 5 |\n|---|---|---|---|---|---|\n| $y$ | 2 | 4 | 6 | 8 | 10 |\n\n**a.** Without computing, state the value of Pearson's $r$. Justify. (2 marks)\n\n**b.** If the $y$-values are doubled, what happens to $r$? Justify briefly. (2 marks) (4 marks)`,
  4,
  "MEDIUM",
  "**a.** $r = 1$. The points lie **exactly** on the line $y = 2x$ — a perfect positive linear relationship — so $r = +1$.\n\n**b.** $r$ is **unchanged** ($r$ remains $+1$). Pearson's $r$ is invariant under positive linear rescalings of either variable: multiplying $y$ by 2 changes the units but not the standardised correlation. (Multiplying by a *negative* constant would flip the sign.)",
);

short(
  `Two students each compute the correlation coefficient between height (cm) and weight (kg) for a sample of 30 adults. Student A obtains $r = 0.78$. Student B notices an extreme outlier — a single value of 250 kg recorded for a 165 cm person (likely a data-entry error) and recomputes $r$ without that point, getting $r = 0.86$.\n\n**a.** Explain why the value of $r$ changes when the outlier is removed. (2 marks)\n\n**b.** Which value should be reported in the final analysis and why? (2 marks) (4 marks)`,
  4,
  "MEDIUM",
  "**a.** Pearson's $r$ is **highly sensitive to outliers**. The 250 kg / 165 cm point lies far from the main cluster and from the line of best fit; including it pulls the line and inflates the deviations from the mean, weakening the apparent linear association and giving a smaller $|r|$.\n\n**b.** Report $r = 0.86$ (with the outlier excluded), **provided the outlier is identified as a data-entry error and not a genuine observation**. The report must mention that the outlier was removed and explain why. If the outlier is genuine, both values should be reported with explanation.",
);

// EXT_ANS (2)
extAns(
  [
    {
      label: "a",
      marks: 1,
      content: `State a reasonable value (to two decimal places) of $r$ for the data shown in the scatterplot.\n\n${img(studyScoreScatter)}`,
      solution: "Visually the points lie almost exactly on a straight upward line, with very little scatter. A defensible value is $r \\approx 0.99$ (any value in $0.95 \\leq r \\leq 1.00$ is acceptable).",
    },
    {
      label: "b",
      marks: 2,
      content: `For the scatterplot of weak association below, suggest a reasonable value of $r$ (to two decimal places) and explain how the appearance of the scatterplot supports your choice.\n\n${img(weakScatter)}`,
      solution: "A defensible value is $r \\approx 0.55$ to $0.70$ (any 0.4-0.7 is acceptable). The scatter shows a clear positive trend but also considerable spread above and below — too much scatter for $r$ to be close to $1$, but the trend is obvious enough that $r$ is well above $0$.",
    },
    {
      label: "c",
      marks: 2,
      content: `Explain why simply reporting $r$ for the scatterplot in part b without first inspecting the scatterplot would be poor practice.`,
      solution: "Pearson's $r$ measures only *linear* association and is heavily influenced by outliers. Reporting $r$ without first checking that the data are roughly linear and free of outliers risks: (1) reporting a low $r$ for a strong curved relationship (because $r$ misses curvature); (2) reporting a high $r$ that is purely an artefact of an outlier pulling the line. Always plot first, then compute $r$.",
    },
  ],
  "MEDIUM",
  `Look at the two scatterplots provided and answer the questions below about Pearson's $r$.`,
);

extAns(
  [
    {
      label: "a",
      marks: 2,
      content: `For each $r$ value below, state whether Pearson's $r$ is an appropriate summary, and briefly justify.\n\n(i) Scatterplot is strongly curved: $r = 0.10$\n\n(ii) Scatterplot is linear with one extreme outlier far from the cluster: $r = 0.30$`,
      solution: "(i) **Not appropriate**. The relationship is strong but non-linear — $r$ only captures linear association, so a low $r$ here understates the relationship. Better to transform the data or use a non-linear model.\n\n(ii) **Not appropriate as quoted**. The single outlier is distorting $r$. The analyst should either remove the outlier (with justification) or use a method less sensitive to outliers. Re-compute $r$ after addressing the outlier.",
    },
    {
      label: "b",
      marks: 3,
      content: `For a sample of 20 paired measurements, the correlation coefficient is $r = 0.6$.\n\n(i) Compute $r^2$ and state the percentage of variation in $y$ explained by $x$.\n\n(ii) State the percentage of variation in $y$ that is **not** explained by $x$.\n\n(iii) Explain in context what the unexplained variation might be due to.`,
      solution: "(i) $r^2 = 0.36 = 36\\%$ of the variation in $y$ is explained by the linear relationship with $x$.\n\n(ii) $100\\% - 36\\% = 64\\%$ of the variation is not explained by the linear relationship with $x$.\n\n(iii) The unexplained variation may be due to: other variables not measured (lurking variables); random / individual variability; measurement error; or non-linearity in the true relationship that the linear model cannot capture.",
    },
  ],
  "MEDIUM",
);

// EXT_RESP (2)
extResp(
  [
    {
      label: "a",
      marks: 2,
      content: `From the scatterplot, give a reasonable estimate (to 2 dp) of Pearson's $r$ and describe the association.\n\n${img(carPriceScatter)}`,
      solution: "From the scatterplot the points lie tightly along a downward line. A defensible estimate is $r \\approx -0.99$ (any $-1.00 \\leq r \\leq -0.95$ is acceptable). Description: **strong negative linear** association — price decreases with age in a near-perfect linear pattern.",
    },
    {
      label: "b",
      marks: 2,
      content: `A CAS computes the value of $r$ as $-0.987$. State $r^2$ to three decimal places and interpret in context.`,
      solution: "$r^2 = (-0.987)^2 = 0.974$ (3 dp). Interpretation: approximately **97.4% of the variation in car price** is explained by the linear relationship with age. The remaining 2.6% is due to other factors (condition, mileage, prior accidents, etc.).",
    },
    {
      label: "c",
      marks: 2,
      content: `Suppose age is converted from years to months (multiply each $x$ by 12) and price is converted from dollars to cents (multiply each $y$ by 100). What is the new value of $r$? Justify briefly.`,
      solution: "The new value of $r$ is **unchanged at $-0.987$**. Pearson's $r$ is dimensionless and invariant under any positive linear rescaling of either variable — multiplying by 12 or 100 just rescales units. (Multiplying by a negative constant would flip the sign of $r$ but not its magnitude.)",
    },
    {
      label: "d",
      marks: 3,
      content: `A car-dealer apprentice claims: 'because $r = -0.99$, increasing the age of a car causes its price to drop'. State two reasons why this causation claim is **not** supported by $r$ alone.`,
      solution: "Any two of: (i) Correlation does not imply causation — $r$ only describes the strength and direction of the linear association, not whether one variable causes the other. (ii) Lurking variables (model year, condition, mileage, market trends) could be the true causal driver of price; age is just a correlate of those. (iii) The data are observational, not experimental — a causal claim requires a designed study with controls. (iv) Even with strong evidence of causation in this dataset, generalising to all used cars requires the sample to be representative.",
    },
    {
      label: "e",
      marks: 3,
      content: `Sketch (describe in words) what the scatterplot might look like for a dataset where $r$ is large in magnitude but misleading because of a single influential outlier. Suggest one diagnostic that would flag the issue.`,
      solution: "Description: a cluster of points with little linear structure, plus a single isolated point far away that visually 'pulls' a line of best fit toward itself. The outlier creates large products of deviations from the means in the formula for $r$, inflating $|r|$ even though most of the cluster shows no clear linear pattern.\n\nDiagnostic: (any one) inspect the scatterplot for isolated points; recompute $r$ with and without each suspected outlier; examine the residual plot for one extreme residual.",
    },
  ],
  "MEDIUM",
  `**Question — Used-car depreciation and Pearson's $r$**\n\nA used-car dealer wants to summarise the strength of the price-age relationship for a sample of ten cars of the same model. Refer to the scatterplot.`,
);

extResp(
  [
    {
      label: "a",
      marks: 2,
      content: `A statistician records the following bivariate data on study hours and test scores for 6 students. Use a CAS to find the value of $r$, correct to three decimal places.\n\n| Hours | 1 | 3 | 4 | 6 | 7 | 9 |\n|---|---|---|---|---|---|---|\n| Score | 40 | 55 | 60 | 75 | 80 | 92 |`,
      solution: "Enter the data into a CAS (LinReg or correlation) function: $r \\approx 0.998$ (to 3 dp). Working: $\\bar x = 5$, $\\bar y = 67$. CAS computation gives $r \\approx 0.9980$.",
    },
    {
      label: "b",
      marks: 1,
      content: `Describe the strength and direction of the association.`,
      solution: "$r \\approx 0.998$: very strong positive linear association between study hours and test score.",
    },
    {
      label: "c",
      marks: 2,
      content: `Give the value of $r^2$ as a decimal and as a percentage. Interpret in context.`,
      solution: "$r^2 = (0.998)^2 \\approx 0.996$, or **99.6%**. Roughly 99.6% of the variation in test scores in this sample is explained by the linear relationship with study hours.",
    },
    {
      label: "d",
      marks: 3,
      content: `A new student studied for 6 hours and scored 50 marks. The teacher decides to add this point to the dataset. State (without recomputing) whether $r$ should increase, decrease, or stay roughly the same, and justify.`,
      solution: "$r$ should **decrease in magnitude**. The new point (6, 50) lies well below the linear trend (the trend predicts approximately 75 marks at 6 hours). Adding an outlier far from the line of best fit weakens the apparent linear association — the spread about the line grows relative to the spread of the data, lowering $|r|$.",
    },
    {
      label: "e",
      marks: 3,
      content: `Despite the very high $r$ in part (a), give two reasons why the teacher should not use this relationship to predict the test score of a student who studied 25 hours.`,
      solution: "Two reasons (any two of the following, 1.5 marks each, marks not to fractions): (i) **Extrapolation**: 25 hours is well outside the observed range (1-9 hours), so the linear pattern may not continue. (ii) **Diminishing returns**: physically, scores cannot exceed 100, so the linear model would predict scores above 100 for large hours — clearly impossible. (iii) **Small sample size** (n = 6): the line of best fit has substantial uncertainty for new predictions. (iv) **Other factors** (motivation, sleep, prior knowledge) likely matter, especially at extreme hours, and may dominate.",
    },
  ],
  "MEDIUM",
  `**Question — Study hours and correlation**\n\nA teacher records weekly study hours and end-of-semester test scores for six Year 12 students. The data table is provided.`,
  "CAS_REQUIRED",
);

console.log(`Correlation complete: ${items.length} items so far.`);

// ═══════════════════════════════════════════════════════════════════════
// SUBTOPIC 3: coefficient-of-determination (extended-fit: 9+4+2+2 = 17)
// ═══════════════════════════════════════════════════════════════════════
CURRENT_SUBTOPIC = "coefficient-of-determination";

mcq(
  `The coefficient of determination $r^2$ measures\n\n`,
  [
    "the slope of the regression line",
    "the percentage of variation in the response variable explained by the linear relationship with the explanatory variable",
    "the absolute value of the correlation coefficient",
    "the average distance from each point to the regression line",
  ],
  "B",
  "EASY",
  "**Answer: B**\n\nThe coefficient of determination is the proportion (or percentage) of variation in $y$ that is explained by the linear relationship with $x$. Higher $r^2$ = better linear fit.",
);

mcq(
  `If $r = 0.8$ between two variables, then $r^2$ equals\n\n`,
  ["0.4", "0.64", "0.8", "1.6"],
  "B",
  "EASY",
  "**Answer: B**\n\n$r^2 = (0.8)^2 = 0.64$. The coefficient of determination is computed by squaring $r$.",
);

mcq(
  `For a bivariate data set, $r^2 = 0.49$. The value of Pearson's $r$ could be\n\n`,
  ["$0.24$ or $-0.24$", "$0.7$ or $-0.7$", "$0.49$ or $-0.49$", "$0.7$ only"],
  "B",
  "MEDIUM",
  "**Answer: B**\n\n$r = \\pm \\sqrt{r^2} = \\pm \\sqrt{0.49} = \\pm 0.7$. Without the scatterplot we cannot determine the sign. Option D is wrong because $r$ can be negative; the data may show a downward trend with strong negative $r$.",
);

mcq(
  `Two variables have a correlation coefficient of $r = -0.6$. The percentage of variation in $y$ explained by the linear relationship with $x$ is\n\n`,
  ["$-60\\%$", "$36\\%$", "$-36\\%$", "$60\\%$"],
  "B",
  "EASY",
  "**Answer: B**\n\n$r^2 = (-0.6)^2 = 0.36 = 36\\%$. The percentage of explained variation is always non-negative — the sign of $r$ does not carry to $r^2$. Option D confuses $r$ with $r^2$.",
);

mcq(
  `In a study of heights and ages, $r^2 = 0.78$. This means that\n\n`,
  [
    "78% of changes in age are caused by changes in height",
    "78% of the variation in height is explained by the linear relationship with age",
    "78% of the sample is correctly classified",
    "the correlation is 0.78",
  ],
  "B",
  "EASY",
  "**Answer: B**\n\nProper $r^2$ language: '$X\\%$ of the variation in [response] is explained by the linear relationship with [explanatory]'. Option A is the causation trap; Option C is unrelated; Option D conflates $r$ with $r^2$.",
);

mcq(
  `Suppose $r^2 = 0.05$ between two variables. The best description of the linear relationship is\n\n`,
  [
    "very strong — only 5% of variation is unexplained",
    "very weak — only 5% of variation is explained, and 95% of the variation in the response is due to other factors or noise",
    "perfect — every data point lies on the regression line",
    "the variables are negatively correlated",
  ],
  "B",
  "EASY",
  "**Answer: B**\n\n$r^2 = 0.05$ is very low — the linear model explains only 5% of the variation in $y$, so most variation is due to other factors or randomness. We cannot determine direction from $r^2$ alone.",
);

mcq(
  `For two variables $x$ and $y$, the coefficient of determination $r^2 = 0.81$ and the scatterplot shows a downward (negative) trend. The value of Pearson's $r$ is\n\n`,
  ["$0.9$", "$-0.9$", "$0.81$", "$-0.81$"],
  "B",
  "MEDIUM",
  "**Answer: B**\n\n$|r| = \\sqrt{0.81} = 0.9$, and the scatterplot is downward sloping, so $r = -0.9$. Option C and D conflate $r$ with $r^2$ — they are different quantities.",
);

mcq(
  `Two scatterplots are compared. Plot A has $r^2 = 0.96$ and plot B has $r^2 = 0.36$. Which statement is correct?\n\n`,
  [
    "Plot A's linear relationship explains a much larger proportion of variation than plot B's",
    "Plot A has 96 observations and plot B has 36",
    "The slopes of the regression lines must differ by a factor of $\\frac{0.96}{0.36}$",
    "Plot A has positive correlation and plot B has negative correlation",
  ],
  "A",
  "MEDIUM",
  "**Answer: A**\n\nA larger $r^2$ means a larger fraction of variation in the response is explained by the linear model — 96% in A versus 36% in B. $r^2$ does not say anything about sample size, slope magnitude, or sign of correlation.",
);

mcq(
  `If $r^2 = 0$ exactly, then\n\n`,
  [
    "the variables have no linear association",
    "the variables have a perfect non-linear relationship",
    "the variables must be independent",
    "the regression line is undefined",
  ],
  "A",
  "MEDIUM",
  "**Answer: A**\n\n$r^2 = 0$ means there is **no linear** association. A non-linear association may still exist (and would not be captured by $r$). The variables may or may not be independent — independence is a stronger property than zero linear correlation.",
);

// SHORT (4)
short(
  `For each correlation coefficient below, compute the coefficient of determination as a decimal and as a percentage, and interpret in context (variables: study hours and test score).\n\n**a.** $r = 0.6$ (2 marks)\n\n**b.** $r = -0.9$ (2 marks) (4 marks)`,
  4,
  "EASY",
  "**a.** $r^2 = 0.36 = 36\\%$. About 36% of the variation in test scores is explained by the linear relationship with study hours; the remaining 64% is due to other factors.\n\n**b.** $r^2 = 0.81 = 81\\%$. About 81% of the variation in test scores is explained by the linear relationship with study hours. The sign of $r$ is lost when squaring — $r^2$ alone does not tell us the trend is negative.",
);

short(
  `A study finds $r^2 = 0.72$ between the height of a tomato plant (cm) and the weight of tomatoes harvested (kg). The scatterplot shows a positive linear trend.\n\n**a.** State the value of $r$ to two decimal places. (2 marks)\n\n**b.** Write a one-sentence interpretation of $r^2$ in this context. (2 marks) (4 marks)`,
  4,
  "MEDIUM",
  "**a.** $r = +\\sqrt{0.72} \\approx +0.85$ (positive because the scatterplot shows a positive trend).\n\n**b.** Approximately 72% of the variation in tomato weight is explained by the linear relationship with plant height (the remaining 28% is due to other factors such as soil, sunlight, water, or random variation).",
);

short(
  `A statistician reports: '$r^2 = 0.49$ for daily temperature versus ice-cream sales — the temperature explains 49% of sales'.\n\n**a.** State **two** issues with the statistician's interpretation. (3 marks)\n\n**b.** Reword the conclusion in a more careful and statistically accurate way. (2 marks) (5 marks)`,
  5,
  "MEDIUM",
  "**a.** Two issues:\n(i) The statement omits the qualifier 'the **linear relationship** with' — $r^2$ measures variation explained by the linear model, not by temperature in general (a non-linear relationship might explain more).\n(ii) The statement implies a causal claim ('temperature explains sales'). Correlation does not establish causation; lurking variables (weekend versus weekday, school holidays) could drive both.\n\n**b.** 'Approximately 49% of the variation in ice-cream sales is explained by the linear relationship with temperature. The remaining 51% is due to other factors. This does not by itself prove that temperature causes the change in sales.'",
);

short(
  `A linear regression of weight $W$ (kg) on age $A$ (years) for 50 children gives $r = 0.92$.\n\n**a.** Compute the coefficient of determination as a percentage. (1 mark)\n\n**b.** Interpret $r^2$ in this context. (2 marks)\n\n**c.** A doctor claims that since $r^2 \\approx 85\\%$, age is a perfect predictor of weight in children. Comment on the claim. (2 marks) (5 marks)`,
  5,
  "MEDIUM",
  "**a.** $r^2 = (0.92)^2 \\approx 0.846 \\approx 84.6\\%$ (or rounded to $85\\%$).\n\n**b.** About 85% of the variation in children's weight is explained by the linear relationship with age. About 15% of the variation is due to other factors (genetics, diet, activity level, individual differences).\n\n**c.** The claim is wrong. $r^2 = 85\\%$ does **not** mean perfect prediction — 'perfect' would require $r^2 = 100\\%$. There is still 15% unexplained variation, and individual children can differ substantially from the age-predicted weight. Furthermore, $r^2 = 0.85$ does not establish causation; age is correlated with weight but does not 'cause' it (growth depends on many factors).",
);

// EXT_ANS (2)
extAns(
  [
    {
      label: "a",
      marks: 2,
      content: `For each of the following correlations, compute $r^2$ to 3 decimal places and as a percentage:\n\n(i) $r = 0.74$\n\n(ii) $r = -0.42$\n\n(iii) $r = 0.99$`,
      solution: "(i) $r^2 = 0.548 = 54.8\\%$. (ii) $r^2 = 0.176 = 17.6\\%$. (iii) $r^2 = 0.980 = 98.0\\%$. (2 marks for all three correct, 1 mark for at least one correct.)",
    },
    {
      label: "b",
      marks: 3,
      content: `For the following scatterplot of test scores against study hours, the CAS reports $r = 0.987$.\n\n${img(studyScoreScatter)}\n\nCompute $r^2$, interpret in context, and explain why $r^2$ is preferred to $r$ for interpretation in this scenario.`,
      solution: "$r^2 = (0.987)^2 \\approx 0.974$ or **97.4%**. Interpretation: roughly 97.4% of the variation in test scores in this sample is explained by the linear relationship with study hours. **Preferred over $r$**: $r^2$ has a direct interpretation as a percentage of variation explained (a more intuitive measure for non-statisticians), whereas $r$ itself measures only the strength and direction of the association in standardised units.",
    },
  ],
  "MEDIUM",
);

extAns(
  [
    {
      label: "a",
      marks: 2,
      content: `Two researchers separately model the same data: heights of fathers and sons.\n\n- Researcher P fits a linear model and reports $r^2 = 0.36$.\n- Researcher Q fits a more flexible curved model and reports a higher $r^2 = 0.48$.\n\nExplain why Q's $r^2$ might be higher even though both worked from the same data.`,
      solution: "$r^2$ as defined for **linear** regression measures variation explained by a *linear* model. If the true relationship is mildly curved, a flexible non-linear model can explain more of the variation, hence Q's $r^2 = 0.48 > 0.36$. (Strictly, $r^2$ in the non-linear case is more usually called the *coefficient of determination of the fitted model*, $R^2$, but the comparison is informative.)",
    },
    {
      label: "b",
      marks: 1,
      content: `Even at $r^2 = 0.48$, considerable variation in sons' heights is not explained. List two plausible sources of unexplained variation.`,
      solution: "Any two of: mother's height; nutrition and health during childhood; genetic factors other than the father's height alone; environmental factors; measurement error. (0.5 marks each, max 1.)",
    },
    {
      label: "c",
      marks: 2,
      content: `A new analyst writes 'because $r^2 = 0.36$, the father's height **causes** the son's height — and explains 36% of it'. Discuss two flaws in this statement.`,
      solution: "Two flaws (1 mark each): (i) **Causation flaw**: $r^2$ does not establish causation. Although biologically there is a causal connection via genetics, the bare statistic does not prove cause — a third (lurking) variable such as shared environment could also explain part of the correlation. (ii) **Interpretation flaw**: '$36\\%$ of it' is loose. $r^2$ measures the proportion of *variation* in son's height (across the sample) that the linear relationship explains, not '36% of each son's height comes from his father'.",
    },
  ],
  "MEDIUM",
);

// EXT_RESP (2)
extResp(
  [
    {
      label: "a",
      marks: 2,
      content: `A CAS gives $r = 0.96$ for the bivariate data on study hours and test scores. Compute $r^2$ as a percentage to 1 dp and state in context what proportion of variation is explained.`,
      solution: "$r^2 = (0.96)^2 = 0.9216 \\approx 92.2\\%$. Approximately 92.2% of the variation in test scores is explained by the linear relationship with study hours.",
    },
    {
      label: "b",
      marks: 2,
      content: `Identify (state and justify) what fraction of variation in test scores is **not** explained, and suggest two reasons why.`,
      solution: "Unexplained variation = $100\\% - 92.2\\% = 7.8\\%$ (approximately). Possible reasons (any two): (i) other variables such as motivation, prior ability, sleep quality, or test anxiety contribute to score variation; (ii) random / individual variability not captured by hours alone; (iii) non-linearity that the linear model misses; (iv) measurement error in scores or in self-reported hours.",
    },
    {
      label: "c",
      marks: 2,
      content: `If $r^2$ for a different sample of students were $0.36$, what does this tell us about that sample compared to the first sample?`,
      solution: "In the second sample, only **36%** of the variation in test scores is explained by the linear relationship with study hours — much less than the 92.2% in the first sample. In the second sample, the linear relationship between hours and score is **weaker**, and other factors (or non-linearity) account for the majority of the variation in test scores.",
    },
    {
      label: "d",
      marks: 3,
      content: `Even though the first sample has $r^2 = 92.2\\%$, explain why we cannot conclude that 'increasing study hours **causes** a 92.2% improvement in test scores'.`,
      solution: "Three issues (any two for full marks, 1.5 marks each): (i) **Correlation $\\neq$ causation**: $r^2$ describes how well the linear model fits the data, not whether one variable causes the other; a lurking variable (motivation) could drive both. (ii) **Misinterpretation of '92.2%'**: $r^2$ is the proportion of *variation* explained across the sample, not a percentage gain in scores. Doubling study hours does not lift any single student's score by 92.2%. (iii) The data are observational — a controlled experiment would be required for a causal claim.",
    },
    {
      label: "e",
      marks: 2,
      content: `Suppose an outlier is added that lies far above the regression line. State whether $r^2$ would increase, decrease, or stay the same. Justify briefly.`,
      solution: "$r^2$ would **decrease**. Adding a point far above the line raises the residual sum of squares relative to the total sum of squares about the mean, so a smaller fraction of total variation is explained by the linear model. Visually, the scatter widens and the linear pattern looks less tight.",
    },
  ],
  "MEDIUM",
  `**Question — Interpreting the coefficient of determination**\n\nA teacher fits a linear regression of test scores against study hours for a sample of students. The CAS reports correlation and other summary statistics. The teacher needs to interpret these for an end-of-term report to parents.`,
  "CAS_ALLOWED",
);

extResp(
  [
    {
      label: "a",
      marks: 2,
      content: `In two studies (A and B), bivariate data give the following:\n\n- Study A: $r = -0.84$\n- Study B: $r = 0.55$\n\nFor each, compute $r^2$ to 3 decimal places and as a percentage.`,
      solution: "Study A: $r^2 = (-0.84)^2 = 0.706 = 70.6\\%$. Study B: $r^2 = (0.55)^2 = 0.303 = 30.3\\%$.",
    },
    {
      label: "b",
      marks: 2,
      content: `In Study A the response variable is 'fuel consumption per 100 km' and the explanatory variable is 'engine displacement (L)'. Interpret the $r^2$ value in context.`,
      solution: "Approximately 70.6% of the variation in fuel consumption (per 100 km) across the sampled cars is explained by the linear relationship with engine displacement. The remaining 29.4% is due to other factors such as vehicle weight, driving conditions, or tyre pressure.",
    },
    {
      label: "c",
      marks: 2,
      content: `Comparing studies A and B, which study has the **stronger** linear relationship between the two variables? Justify.`,
      solution: "**Study A**. The magnitude of $|r|$ is larger (0.84 vs 0.55) and $r^2$ is larger (70.6% vs 30.3%), so the linear relationship explains a much larger fraction of the variation in the response variable for Study A.",
    },
    {
      label: "d",
      marks: 3,
      content: `A junior analyst in Study A claims: 'since $r^2 = 70.6\\%$, displacement explains 70.6% of fuel consumption'. Identify two specific issues with this wording and provide a corrected sentence.`,
      solution: "Two issues (1 mark each, 1 mark for correction): (i) Omits 'linear relationship' — $r^2$ measures the variation explained by the *linear* model with displacement, not by displacement in general. (ii) Says 'fuel consumption' rather than 'variation in fuel consumption' — $r^2$ is about variation across the sample, not a single car's fuel use. **Corrected**: 'Approximately 70.6% of the **variation** in fuel consumption across the sample is explained by the **linear relationship** with engine displacement.'",
    },
    {
      label: "e",
      marks: 3,
      content: `Study A's $r$ is negative. Explain whether this affects the interpretation of $r^2$ in part (b) above. Also state how $r^2$ changes if all $y$-values are multiplied by $-1$.`,
      solution: "The negative sign of $r$ tells us the direction of the linear association (larger displacement → lower fuel efficiency, equivalently higher consumption per 100 km depending on which way it's defined). It does **not** affect the value of $r^2$: $r^2$ is always non-negative and only measures strength.\n\nMultiplying all $y$-values by $-1$ flips the sign of $r$ (from $-0.84$ to $+0.84$) but $r^2$ is **unchanged** at $0.706$. The strength of the linear association is unaffected.",
    },
  ],
  "HARD",
  `**Question — Comparing two studies via $r^2$**\n\nTwo independent studies report correlation coefficients between an explanatory and a response variable. The CAS computations of correlation are given.`,
);

console.log(`r^2 complete: ${items.length} items so far.`);

// ═══════════════════════════════════════════════════════════════════════
// SUBTOPIC 4: least-squares-regression (modelling-rich: 7+4+2+3 = 16)
// ═══════════════════════════════════════════════════════════════════════
CURRENT_SUBTOPIC = "least-squares-regression";

mcq(
  `The least-squares regression line of $y$ on $x$ is the line that\n\n`,
  [
    "passes through every data point",
    "minimises the sum of squared **vertical** distances (residuals) from the data points to the line",
    "minimises the sum of perpendicular distances from the data points to the line",
    "minimises the sum of absolute residuals",
  ],
  "B",
  "EASY",
  "**Answer: B**\n\nLeast-squares regression minimises the **sum of squared vertical (y-direction) residuals** — that is, $\\sum (y_i - \\hat y_i)^2$. Not perpendicular distances (that is total-least-squares) and not absolute residuals (that is median regression).",
);

mcq(
  `The least-squares regression equation of $y$ on $x$ is $y = 12 + 3x$. The predicted value of $y$ when $x = 5$ is\n\n`,
  ["8", "17", "27", "60"],
  "C",
  "EASY",
  "**Answer: C**\n\n$y = 12 + 3 \\times 5 = 12 + 15 = 27$. Substitute and evaluate.",
);

mcq(
  `${img(regressionScatter)}\n\nThe regression line of test score on study hours is $y = 36 + 5.7x$. Using this line, the **predicted** score for a student who studies for 6 hours is\n\n`,
  ["57.2", "70.2", "75.7", "84.0"],
  "B",
  "MEDIUM",
  "**Answer: B**\n\n$\\hat y = 36 + 5.7 \\times 6 = 36 + 34.2 = 70.2$ marks.",
);

mcq(
  `For the regression line $\\hat y = 36 + 5.7x$ (test score on study hours), the slope means\n\n`,
  [
    "the test score is 5.7 when no studying is done",
    "for each additional hour of study, the predicted test score increases by 5.7 marks",
    "5.7% of the variation in test scores is explained",
    "study hours and test scores are perfectly correlated",
  ],
  "B",
  "EASY",
  "**Answer: B**\n\nIn $\\hat y = a + bx$, the slope $b$ gives the predicted **change in $y$ per unit change in $x$**. Option A confuses slope with intercept. Option C confuses slope with $r^2$.",
);

mcq(
  `For the regression line $\\hat y = 36 + 5.7x$ (test score on study hours), the $y$-intercept ($a = 36$) is interpreted as\n\n`,
  [
    "the predicted test score for a student who does no studying (0 hours)",
    "the gradient of the line",
    "the average score across all students",
    "the proportion of variation explained",
  ],
  "A",
  "EASY",
  "**Answer: A**\n\nThe intercept $a$ is the value of $\\hat y$ when $x = 0$. Note that this interpretation may not be physically meaningful if $x = 0$ is outside the data range or makes no sense in context — but the algebraic meaning is the predicted $y$ at $x = 0$.",
);

mcq(
  `A regression of weight (kg) on height (cm) is fitted to data for adults aged 18-30 with heights ranging 150-200 cm. Predicting the weight of an 80 cm-tall toddler using this line is an example of\n\n`,
  [
    "interpolation",
    "extrapolation",
    "residual analysis",
    "transformation",
  ],
  "B",
  "MEDIUM",
  "**Answer: B**\n\n80 cm is outside the observed range (150-200 cm), so using the line there is **extrapolation** — unreliable because the linear pattern may not hold outside the data range. Interpolation is prediction *within* the range.",
);

mcq(
  `If the equation of the least-squares regression line is $\\hat y = a + bx$, then the line always passes through the point\n\n`,
  ["$(0, 0)$", "$(\\bar x, \\bar y)$", "the median of the data", "the modal point"],
  "B",
  "MEDIUM",
  "**Answer: B**\n\nA defining property of the least-squares line is that it passes through $(\\bar x, \\bar y)$, the mean of the data. The origin is only on the line if $a = 0$.",
);

// SHORT (4)
short(
  `The regression line of fuel consumption ($y$, L/100 km) on engine size ($x$, litres) is $\\hat y = 4.2 + 3.1x$.\n\n**a.** Predict the fuel consumption of a 2.5 L engine. (1 mark)\n\n**b.** Interpret the slope $b = 3.1$ in context. (2 marks)\n\n**c.** Interpret the y-intercept $a = 4.2$ in context. State whether the interpretation is physically meaningful. (2 marks) (5 marks)`,
  5,
  "EASY",
  "**a.** $\\hat y = 4.2 + 3.1 \\times 2.5 = 4.2 + 7.75 = \\mathbf{11.95}$ L/100 km.\n\n**b.** Each additional litre of engine displacement is associated with a predicted increase of 3.1 L/100 km in fuel consumption.\n\n**c.** The y-intercept predicts fuel consumption of 4.2 L/100 km for an engine of size 0 L. This is **not physically meaningful** — a car with no engine cannot consume fuel — but mathematically it is just the value of $\\hat y$ when $x = 0$.",
);

short(
  `${img(regressionScatter)}\n\nFor the regression line $\\hat y = 36 + 5.7x$:\n\n**a.** Predict the test score of a student who studies for 4 hours. (1 mark)\n\n**b.** A student studies for 4 hours and actually scores 65. Compute the residual for this student and interpret. (2 marks)\n\n**c.** A teacher uses the line to predict the score of a student who studies for 25 hours. Explain why this prediction is unreliable. (2 marks) (5 marks)`,
  5,
  "MEDIUM",
  "**a.** $\\hat y = 36 + 5.7 \\times 4 = 36 + 22.8 = \\mathbf{58.8}$ marks.\n\n**b.** Residual = observed − predicted = $65 - 58.8 = +6.2$ marks. Interpretation: the student scored **6.2 marks higher** than the line predicts — a positive residual.\n\n**c.** 25 hours is well outside the observed range (about 2-10 hours), so using the line for prediction is **extrapolation**. The linear pattern may not continue (e.g. scores capped at 100, diminishing returns, exhaustion). The line predicts $36 + 5.7 \\times 25 = 178.5$ — impossible since scores are capped at 100.",
);

short(
  `A linear regression of marathon time $y$ (minutes) on weekly training distance $x$ (km) gives $\\hat y = 360 - 1.8x$. The data range is $40 \\leq x \\leq 100$.\n\n**a.** State and interpret the slope in context. (2 marks)\n\n**b.** Predict the marathon time for a runner training 60 km per week. (1 mark)\n\n**c.** Comment on the appropriateness of using the line to predict the marathon time of a runner training 150 km per week. (2 marks) (5 marks)`,
  5,
  "MEDIUM",
  "**a.** Slope = $-1.8$ minutes per km. Interpretation: each additional km of weekly training is associated with a predicted decrease of 1.8 minutes in marathon time.\n\n**b.** $\\hat y = 360 - 1.8 \\times 60 = 360 - 108 = \\mathbf{252}$ minutes (4 hours 12 minutes).\n\n**c.** 150 km/week is outside the data range (40-100 km), so prediction is **extrapolation**. The linear pattern may not continue — at very high training loads injury and burnout effects may reverse the relationship, and physiological limits cap improvement. The line would also predict $360 - 270 = 90$ minutes, a world-record-pace time — implausible.",
);

short(
  `For a data set $(x, y)$, the sample means and standard deviations are $\\bar x = 5$, $\\bar y = 40$, $s_x = 2$, $s_y = 8$, and the correlation is $r = 0.75$.\n\n**a.** Compute the slope $b = r \\cdot \\dfrac{s_y}{s_x}$ of the least-squares regression line of $y$ on $x$. (2 marks)\n\n**b.** Compute the intercept $a = \\bar y - b \\bar x$. (2 marks)\n\n**c.** Write the equation of the line. (1 mark) (5 marks)`,
  5,
  "MEDIUM",
  "**a.** $b = r \\cdot \\dfrac{s_y}{s_x} = 0.75 \\times \\dfrac{8}{2} = 0.75 \\times 4 = \\mathbf{3}$.\n\n**b.** $a = \\bar y - b \\bar x = 40 - 3 \\times 5 = 40 - 15 = \\mathbf{25}$.\n\n**c.** $\\hat y = 25 + 3x$.",
);

// EXT_ANS (2)
extAns(
  [
    {
      label: "a",
      marks: 2,
      content: `${img(regressionScatter)}\n\nUsing the regression line $\\hat y = 36 + 5.7x$ for test score on study hours, predict the test score for students studying 3, 5 and 8 hours.`,
      solution: "$\\hat y(3) = 36 + 5.7 \\times 3 = 36 + 17.1 = 53.1$. $\\hat y(5) = 36 + 5.7 \\times 5 = 36 + 28.5 = 64.5$. $\\hat y(8) = 36 + 5.7 \\times 8 = 36 + 45.6 = 81.6$.",
    },
    {
      label: "b",
      marks: 2,
      content: `Interpret the slope and y-intercept of the regression line in context.`,
      solution: "**Slope (5.7)**: for each additional hour of study, the predicted test score increases by 5.7 marks. **Intercept (36)**: a student who does no studying is predicted to score 36 marks. (The intercept is at the edge of the data range and may not be physically meaningful — students who never study are unusual.)",
    },
    {
      label: "c",
      marks: 2,
      content: `For a student who studied 7 hours and actually scored 70, compute the residual. State whether the line over- or under-predicts for this student.`,
      solution: "$\\hat y(7) = 36 + 5.7 \\times 7 = 36 + 39.9 = 75.9$. Residual = $70 - 75.9 = -5.9$. The student scored **5.9 marks below** the predicted value, so the line **over-predicts** their score (negative residual).",
    },
  ],
  "MEDIUM",
);

extAns(
  [
    {
      label: "a",
      marks: 2,
      content: `A data set has $\\bar x = 10$, $\\bar y = 100$, $s_x = 4$, $s_y = 24$, $r = -0.65$.\n\nCompute the slope of the least-squares regression line of $y$ on $x$ correct to 2 decimal places.`,
      solution: "Slope $b = r \\cdot \\dfrac{s_y}{s_x} = -0.65 \\times \\dfrac{24}{4} = -0.65 \\times 6 = -3.90$.",
    },
    {
      label: "b",
      marks: 2,
      content: `Compute the y-intercept of the line.`,
      solution: "$a = \\bar y - b \\bar x = 100 - (-3.90)(10) = 100 + 39 = 139$.",
    },
    {
      label: "c",
      marks: 2,
      content: `Write the equation of the line and predict $y$ when $x = 15$.`,
      solution: "$\\hat y = 139 - 3.90 x$. At $x = 15$: $\\hat y = 139 - 3.90 \\times 15 = 139 - 58.5 = \\mathbf{80.5}$.",
    },
    {
      label: "d",
      marks: 2,
      content: `Compute $r^2$ and interpret in context (the data are weekly hours of TV watched ($x$) and grade point average ($y$) for 30 students).`,
      solution: "$r^2 = (-0.65)^2 = 0.4225 \\approx \\mathbf{42.3\\%}$. About 42.3% of the variation in students' GPA is explained by the linear relationship with weekly TV hours. The remaining 57.7% is due to other factors.",
    },
  ],
  "MEDIUM",
);

// EXT_RESP (3)
extResp(
  [
    {
      label: "a",
      marks: 2,
      content: `The CAS reports the regression line of test score on study hours as $\\hat y = 38.5 + 5.4x$. Predict the score for students who study 2, 5, and 9 hours.\n\n${img(studyScoreScatter)}`,
      solution: "$\\hat y(2) = 38.5 + 5.4 \\times 2 = 49.3$. $\\hat y(5) = 38.5 + 5.4 \\times 5 = 65.5$. $\\hat y(9) = 38.5 + 5.4 \\times 9 = 87.1$.",
    },
    {
      label: "b",
      marks: 2,
      content: `Interpret the slope and the y-intercept in context. State whether each interpretation is meaningful for this dataset.`,
      solution: "**Slope (5.4)**: each additional hour of study is associated with a predicted increase of 5.4 marks. Meaningful and useful for students.\n**Intercept (38.5)**: the predicted score for 0 hours of study. The data range starts at 2 hours, so this is a small extrapolation; the figure is informally interpretable as 'baseline score with no studying' but should be used cautiously.",
    },
    {
      label: "c",
      marks: 2,
      content: `For a student who studied 6 hours and scored 65, compute the residual and interpret.`,
      solution: "$\\hat y(6) = 38.5 + 5.4 \\times 6 = 38.5 + 32.4 = 70.9$. Residual = $65 - 70.9 = -5.9$ marks. The student scored **5.9 marks below** the line's prediction — a negative residual; the line over-predicts for this student.",
    },
    {
      label: "d",
      marks: 3,
      content: `A teacher uses the line to give parents predicted scores. Comment on the appropriateness of using the line for the following students:\n\n(i) A student who studies 7 hours (within the data range).\n\n(ii) A student who studies 0 hours.\n\n(iii) A student who studies 30 hours per week.`,
      solution: "(i) **Appropriate** — 7 hours is within the observed range (interpolation). $\\hat y(7) = 38.5 + 5.4 \\times 7 = 76.3$ marks.\n\n(ii) **Marginal extrapolation** — 0 hours is outside the data range (2-10 hours). The line predicts 38.5; this should be used cautiously as the linear pattern may not extend to zero study.\n\n(iii) **Inappropriate (gross extrapolation)** — 30 hours/week is far outside the range. The line predicts $38.5 + 5.4 \\times 30 = 200.5$ marks, which is impossible (scores capped at 100). The linear model breaks down at such large values.",
    },
    {
      label: "e",
      marks: 3,
      content: `If the data are recorded in *minutes* of study rather than *hours* (multiply each $x$ by 60), how would the slope and intercept change?`,
      solution: "**Slope** would be divided by 60: $b' = 5.4 / 60 = 0.09$ marks per minute (since the change in $y$ per unit increase in $x$ scales inversely with the unit change in $x$).\n\n**Intercept** would be **unchanged** at 38.5 (the value of $\\hat y$ when $x = 0$ is the same whether $x$ is in hours or minutes — 0 hours = 0 minutes).\n\nNew equation: $\\hat y = 38.5 + 0.09 m$ where $m$ is study time in minutes.",
    },
  ],
  "MEDIUM",
  `**Question — Predicting test scores from study hours**\n\nA teacher uses a least-squares regression of test scores against weekly study hours to give predictions for upcoming exams. The data and regression line are shown.`,
);

extResp(
  [
    {
      label: "a",
      marks: 2,
      content: `For the data below, use a CAS to find the equation of the least-squares regression line of weight $W$ (kg) on age $A$ (years).\n\n| Age | 5 | 7 | 9 | 11 | 13 | 15 |\n|---|---|---|---|---|---|---|\n| Weight | 18 | 24 | 30 | 38 | 46 | 55 |`,
      solution: "Entering data into CAS LinReg: $\\bar A = 10$, $\\bar W \\approx 35.17$. Slope $b \\approx 3.66$, intercept $a \\approx -1.45$. **Equation**: $\\hat W = -1.45 + 3.66 A$. (Use of CAS or formulas $b = r s_y / s_x$ with $a = \\bar y - b \\bar x$; minor rounding acceptable, e.g. $\\hat W \\approx -1.4 + 3.7 A$.)",
    },
    {
      label: "b",
      marks: 2,
      content: `Interpret the slope of the regression line in context.`,
      solution: "Each additional year of age is associated with a predicted increase of about 3.7 kg in weight. This is a per-year growth rate averaged across the sampled children.",
    },
    {
      label: "c",
      marks: 2,
      content: `Use the line to predict the weight of a 10-year-old child. State whether this is interpolation or extrapolation.`,
      solution: "$\\hat W(10) = -1.45 + 3.66 \\times 10 \\approx 35.15$ kg. 10 is within the data range (5-15), so this is **interpolation** — a reliable use of the line.",
    },
    {
      label: "d",
      marks: 3,
      content: `A nurse uses the line to predict the weight of a 25-year-old adult and a 1-year-old infant.\n\n(i) Compute both predictions.\n\n(ii) Explain why **both** are unreliable.`,
      solution: "(i) Adult (25 yrs): $\\hat W = -1.45 + 3.66 \\times 25 = 89.85$ kg. Infant (1 yr): $\\hat W = -1.45 + 3.66 \\times 1 = 2.21$ kg.\n\n(ii) Both are **extrapolations** (outside the data range of 5-15 years). The linear pattern is unrealistic at both ends: at 25 the rate of growth slows and weight is dominated by diet/lifestyle, not age; at 1 year an infant typically weighs around 9-10 kg, far higher than 2.21 kg, so the linear model gives a nonsensical prediction.",
    },
    {
      label: "e",
      marks: 3,
      content: `The data give $r \\approx 0.998$. Compute and interpret $r^2$ in context, and explain why this very high $r^2$ does **not** by itself justify using the line outside the data range.`,
      solution: "$r^2 = (0.998)^2 \\approx 0.996 = 99.6\\%$ — roughly 99.6% of the variation in weight is explained by the linear relationship with age in this sample.\n\n**Why high $r^2$ does not justify extrapolation**: $r^2$ measures fit **within** the observed data range; it does not guarantee that the linear pattern continues outside that range. Growth curves are linear over short age ranges but flatten in adulthood, so extrapolating to 25 years (or 1 year) ignores the underlying biology. A high $r^2$ is necessary but not sufficient for reliable extrapolation.",
    },
  ],
  "HARD",
  `**Question — Children's weight and age**\n\nA paediatric clinic records the age and weight of six children aged 5-15 years to model typical growth.`,
);

extResp(
  [
    {
      label: "a",
      marks: 3,
      content: `A retailer wishes to predict daily ice-cream sales (\\$) from daily maximum temperature (°C). For 10 days of data:\n\n$\\bar x = 28$, $\\bar y = 240$, $s_x = 4$, $s_y = 80$, $r = 0.90$.\n\nCompute the slope and y-intercept of the least-squares regression line of $y$ on $x$. Write the equation.`,
      solution: "Slope: $b = r \\cdot \\dfrac{s_y}{s_x} = 0.90 \\times \\dfrac{80}{4} = 0.90 \\times 20 = 18$.\nIntercept: $a = \\bar y - b \\bar x = 240 - 18 \\times 28 = 240 - 504 = -264$.\n**Equation**: $\\hat y = -264 + 18x$.",
    },
    {
      label: "b",
      marks: 2,
      content: `Interpret the slope and y-intercept in context. Comment on whether the y-intercept is meaningful here.`,
      solution: "**Slope (18)**: each additional °C of temperature is associated with a predicted increase of \\$18 in daily ice-cream sales.\n**Intercept ($-264$)**: at 0 °C the line predicts $-\\$264$ — a negative dollar amount, which is meaningless (sales cannot be negative). The intercept is **not meaningful** because 0 °C is well outside the observed range; the line's algebra extrapolates absurdly.",
    },
    {
      label: "c",
      marks: 2,
      content: `Use the line to predict sales when the daily maximum temperature is 30 °C.`,
      solution: "$\\hat y(30) = -264 + 18 \\times 30 = -264 + 540 = \\$276$.",
    },
    {
      label: "d",
      marks: 3,
      content: `Compute $r^2$ and interpret in context. The retailer claims 'temperature explains 81% of the variation in sales'. Comment on this claim.`,
      solution: "$r^2 = (0.90)^2 = 0.81 = 81\\%$. Interpretation: about 81% of the variation in daily ice-cream sales is explained by the **linear relationship** with daily maximum temperature.\n\n**Comment on claim**: largely correct in spirit but a careful wording must include 'linear relationship with' temperature. The remaining 19% is due to other factors (day of week, promotions, school holidays, weather conditions other than temperature). Also: correlation $\\neq$ causation — temperature is correlated with sales but the retailer should be cautious about generalising.",
    },
    {
      label: "e",
      marks: 2,
      content: `A new data point is added at temperature 32 °C with sales \\$400. Without recomputing the line, state how the slope and $r^2$ are likely to change. Justify briefly.`,
      solution: "Predicted sales at 32 °C from current line: $\\hat y = -264 + 18 \\times 32 = 312$. Observed = \\$400, residual = $+88$ (well above the line).\n\n**Slope**: likely to increase slightly (the new point lies above the line at the upper end of the data, pulling the slope up).\n\n**$r^2$**: likely to **decrease** slightly — the new point is a positive outlier above the line, increasing the residual sum of squares; the linear pattern is less tight, so the fraction of variation explained falls.",
    },
  ],
  "MEDIUM",
  `**Question — Temperature and ice-cream sales**\n\nA retailer hopes to predict daily ice-cream sales from the daily maximum temperature using least-squares regression.`,
);

console.log(`Regression complete: ${items.length} items so far.`);

// ═══════════════════════════════════════════════════════════════════════
// SUBTOPIC 5: residual-analysis (modelling-rich: 7+4+2+3 = 16)
// ═══════════════════════════════════════════════════════════════════════
CURRENT_SUBTOPIC = "residual-analysis";

mcq(
  `For a least-squares regression line $\\hat y = a + bx$, the residual at the point $(x_i, y_i)$ is defined as\n\n`,
  ["$\\hat y_i - y_i$", "$y_i - \\hat y_i$", "$|y_i - \\hat y_i|$", "$(y_i - \\hat y_i)^2$"],
  "B",
  "EASY",
  "**Answer: B**\n\nResidual = observed − predicted = $y_i - \\hat y_i$. The sign matters: positive = point above the line; negative = point below.",
);

mcq(
  `A linear regression line gives $\\hat y(5) = 22$ at $x = 5$. The actual observed $y$ at $x = 5$ is 28. The residual is\n\n`,
  ["$-6$", "$+6$", "$+50$", "$+22$"],
  "B",
  "EASY",
  "**Answer: B**\n\nResidual = observed − predicted = $28 - 22 = +6$. Positive residual = point lies above the line.",
);

mcq(
  `${img(goodResiduals)}\n\nThe residual plot above shows residuals scattered randomly around zero with no clear pattern. This indicates\n\n`,
  [
    "the linear model is appropriate for the data",
    "the data are non-linear and a transformation is needed",
    "the explanatory variable is the wrong one",
    "the correlation is exactly zero",
  ],
  "A",
  "MEDIUM",
  "**Answer: A**\n\nA random scatter of residuals about zero (with no curve, no trend, no funnel) is the hallmark of a good linear fit. The linear model captures the structure, and what remains is random noise.",
);

mcq(
  `${img(curvedResiduals)}\n\nThe residual plot above shows a clear **curved pattern** (parabolic shape). This indicates\n\n`,
  [
    "the linear model is appropriate",
    "the linear model is **not** appropriate — the underlying relationship is non-linear",
    "the data contain an outlier",
    "the explanatory variable has been measured incorrectly",
  ],
  "B",
  "MEDIUM",
  "**Answer: B**\n\nA systematic pattern in a residual plot (curve, funnel, trend) is evidence that the linear model is mis-specified — the underlying relationship is **non-linear**. The remedy is to transform the data (or use a non-linear model).",
);

mcq(
  `A residual plot is used to\n\n`,
  [
    "show the predicted values against the observed values",
    "check whether a linear model is an appropriate fit for the data",
    "compute the correlation coefficient $r$",
    "fit a regression line to the data",
  ],
  "B",
  "MEDIUM",
  "**Answer: B**\n\nResidual plots are a **diagnostic** tool — they reveal whether the linear assumption holds. A random scatter supports the model; a pattern signals trouble.",
);

mcq(
  `The sum of the residuals from a least-squares regression line is\n\n`,
  ["always positive", "always negative", "always zero", "equal to the slope"],
  "C",
  "MEDIUM",
  "**Answer: C**\n\nA property of least-squares: $\\sum (y_i - \\hat y_i) = 0$ (positive and negative residuals cancel). This is because the line passes through $(\\bar x, \\bar y)$ and is fitted to minimise the squared residuals.",
);

mcq(
  `A residual plot shows residuals fanning out (a 'funnel' shape — small near the left, growing larger toward the right). This indicates\n\n`,
  [
    "the linear model is perfect",
    "the variance of the residuals is not constant (heteroscedasticity) — a linear fit may still be reasonable on average but predictions at higher $x$ are less reliable",
    "the data have been swapped between $x$ and $y$",
    "an outlier needs removal",
  ],
  "B",
  "MEDIUM",
  "**Answer: B**\n\nA funnel-shape residual plot signals **heteroscedasticity** — non-constant residual variance. The linear trend may be unbiased but the precision of predictions worsens where residuals are larger.",
);

// SHORT (4)
short(
  `A regression of grade $G$ (%) on weekly study hours $H$ gives $\\hat G = 40 + 5H$.\n\nThree students had the following observed $(H, G)$ values: $(4, 65)$, $(6, 68)$, $(8, 85)$.\n\nCompute the residual for each student and state whether the line over- or under-predicts. (5 marks)`,
  5,
  "EASY",
  "**Student 1** $(4, 65)$: $\\hat G = 40 + 5 \\times 4 = 60$. Residual = $65 - 60 = +5$. Line **under-predicts** (student scored above predicted).\n\n**Student 2** $(6, 68)$: $\\hat G = 40 + 5 \\times 6 = 70$. Residual = $68 - 70 = -2$. Line **over-predicts** (student scored below predicted).\n\n**Student 3** $(8, 85)$: $\\hat G = 40 + 5 \\times 8 = 80$. Residual = $85 - 80 = +5$. Line **under-predicts**.\n\n(2 marks for any one fully correct; 4 marks for two; 5 for all three.)",
);

short(
  `${img(goodResiduals)}\n\n**a.** State, with justification, whether a linear model is appropriate for the data on which this residual plot is based. (2 marks)\n\n**b.** Describe what kind of residual plot would indicate that a linear model is **not** appropriate, and what the next step would be. (3 marks) (5 marks)`,
  5,
  "MEDIUM",
  "**a.** Yes, a linear model is appropriate. The residuals scatter randomly above and below zero, with no clear pattern (curve, trend, funnel). This indicates the linear model has captured the structure of the data and what remains is random noise.\n\n**b.** A residual plot indicating non-appropriateness would show a **systematic pattern**: a curve (parabolic, U-shape, inverted-U) suggests non-linearity; a funnel suggests heteroscedasticity; a trend (residuals increasing or decreasing with $x$) suggests model bias. **Next step**: apply a data transformation (e.g. $\\log y$, $y^2$, $1/y$, $\\log x$, $x^2$) and re-fit the regression to see whether the residual plot improves.",
);

short(
  `For the regression line $\\hat y = 12 + 2.5x$:\n\n**a.** Compute the residual for the observed point $(8, 30)$. (1 mark)\n\n**b.** A teacher plots all the residuals against $x$ and observes that they form a clear inverted-U (parabolic) pattern. What does this imply about the linear model, and what should the teacher try next? (3 marks)\n\n**c.** Explain why a single large residual is **not** sufficient on its own to conclude the linear model is inappropriate. (1 mark) (5 marks)`,
  5,
  "MEDIUM",
  "**a.** $\\hat y(8) = 12 + 2.5 \\times 8 = 12 + 20 = 32$. Residual = $30 - 32 = -2$.\n\n**b.** A parabolic pattern in residuals indicates the underlying relationship is **non-linear** (curved). The linear model is mis-specified. The teacher should apply a data **transformation** — for example $y' = y^2$, $y' = \\sqrt{y}$, or $x' = x^2$, $x' = \\log(x)$ — and then re-fit a linear regression on the transformed data. The choice depends on the direction of curvature.\n\n**c.** A single large residual is just an **outlier**; the rest of the residuals may still be random scatter. Only a **systematic pattern** across many residuals (curve, trend, funnel) indicates the linear model itself is inappropriate.",
);

short(
  `The data set below shows the regression line $\\hat y = 2 + 3x$ fitted to five points. Compute the residual for each point and the sum of the residuals.\n\n| $x$ | 1 | 2 | 3 | 4 | 5 |\n|---|---|---|---|---|---|\n| $y$ | 6 | 9 | 10 | 13 | 17 |\n\n(5 marks)`,
  5,
  "MEDIUM",
  "Predicted values: $\\hat y(1) = 5, \\hat y(2) = 8, \\hat y(3) = 11, \\hat y(4) = 14, \\hat y(5) = 17$.\n\n**Residuals**: $6 - 5 = 1$; $9 - 8 = 1$; $10 - 11 = -1$; $13 - 14 = -1$; $17 - 17 = 0$.\n\n**Sum of residuals** = $1 + 1 - 1 - 1 + 0 = 0$.\n\n(2 marks for predictions, 2 marks for residuals, 1 mark for sum = 0. Note that the sum should be zero for a properly fitted least-squares line — this verifies the fit, but for an *arbitrarily* given line not necessarily so. Here the line happens to be the least-squares line, hence sum = 0.)",
);

// EXT_ANS (2)
extAns(
  [
    {
      label: "a",
      marks: 2,
      content: `The least-squares regression line of $y$ on $x$ for a dataset is $\\hat y = 5 + 2x$. The data and predicted values for three points are tabulated:\n\n| $x$ | $y$ (observed) |\n|---|---|\n| 2 | 8 |\n| 4 | 16 |\n| 6 | 18 |\n\nCompute the residual for each of the three points.`,
      solution: "Predicted: $\\hat y(2) = 5 + 4 = 9$; $\\hat y(4) = 5 + 8 = 13$; $\\hat y(6) = 5 + 12 = 17$.\n\nResiduals: $8 - 9 = -1$; $16 - 13 = +3$; $18 - 17 = +1$. (Sum = +3, not zero — but only three points; for the full dataset the sum would be zero.)",
    },
    {
      label: "b",
      marks: 2,
      content: `Sketch (in words) what the residual plot would look like if a linear fit is appropriate, and what it would look like if the data were better fitted by a quadratic ($y = ax^2 + bx + c$).`,
      solution: "**Linear-appropriate**: residuals scatter randomly above and below zero, with no pattern. **Quadratic data fitted by linear**: residuals show a clear curved pattern — e.g. positive at the ends and negative in the middle (or vice versa), forming a smile or frown shape. The presence of a systematic pattern is the diagnostic.",
    },
    {
      label: "c",
      marks: 2,
      content: `${img(curvedResiduals)}\n\nFor the residual plot above, state what the pattern is and what action a statistician should take.`,
      solution: "The plot shows a **curved (parabolic) pattern**: residuals are negative at the extremes and positive in the middle. This indicates the linear model is mis-specified — the true relationship has curvature. **Action**: apply a transformation (e.g. $y^2$, $\\log y$, $1/y$, $\\sqrt y$, or an $x$-side transformation) and re-fit linear regression on the transformed data, then check the new residual plot.",
    },
  ],
  "MEDIUM",
);

extAns(
  [
    {
      label: "a",
      marks: 2,
      content: `For the regression line $\\hat y = 100 - 4x$ applied to the data points $(5, 90)$, $(10, 65)$, $(15, 30)$, compute the residual for each point.`,
      solution: "Predicted: $\\hat y(5) = 100 - 20 = 80$; $\\hat y(10) = 100 - 40 = 60$; $\\hat y(15) = 100 - 60 = 40$.\n\nResiduals: $90 - 80 = +10$; $65 - 60 = +5$; $30 - 40 = -10$.",
    },
    {
      label: "b",
      marks: 2,
      content: `Plot (or describe in words) these three residuals against $x$. What pattern do they show?`,
      solution: "Residuals at $x = 5, 10, 15$ are $+10, +5, -10$ — a clear **decreasing trend** (from positive to negative as $x$ grows). This is **not random scatter**; the residuals decrease systematically.",
    },
    {
      label: "c",
      marks: 3,
      content: `What does this pattern suggest about the fit of the line $\\hat y = 100 - 4x$ to the original data, and what should the next step be?`,
      solution: "The decreasing-trend residual pattern suggests the line is **mis-fitted**: it over-predicts at large $x$ and under-predicts at small $x$ (or vice versa). This could mean the slope is wrong, or the relationship is non-linear (perhaps the true relationship has slightly more curvature than a straight line).\n\n**Next step**: refit a least-squares line using **all** the data via CAS (the three points above may not have produced a properly fitted least-squares line, since the residuals do not sum to zero). If the trend persists in the refitted residual plot, try a transformation to address curvature.",
    },
  ],
  "MEDIUM",
);

// EXT_RESP (3)
extResp(
  [
    {
      label: "a",
      marks: 2,
      content: `${img(curvedUpScatter)}\n\nA student fits a least-squares line to the data shown and obtains $\\hat y = -15 + 9x$. Without computing, describe what the residual plot is likely to look like and what this implies about the linear model.`,
      solution: "The scatterplot is clearly curved (upward concave). Fitting a straight line will produce residuals that are **positive at low $x$, negative in the middle, and positive at high $x$** (or similar U-shape) — a clear curved pattern in the residual plot. This implies a linear model is **not appropriate**; the relationship is non-linear, and a transformation or non-linear model is needed.",
    },
    {
      label: "b",
      marks: 2,
      content: `Compute the residual for the observed point $(4, 17)$ using the line $\\hat y = -15 + 9x$.`,
      solution: "$\\hat y(4) = -15 + 9 \\times 4 = -15 + 36 = 21$. Residual = $17 - 21 = -4$.",
    },
    {
      label: "c",
      marks: 2,
      content: `Compute the residuals for the points $(1, 2)$, $(5, 26)$, $(8, 65)$. Plot (describe) the pattern.`,
      solution: "$\\hat y(1) = -15 + 9 = -6$; residual = $2 - (-6) = +8$.\n$\\hat y(5) = -15 + 45 = 30$; residual = $26 - 30 = -4$.\n$\\hat y(8) = -15 + 72 = 57$; residual = $65 - 57 = +8$.\n\nPattern: positive at $x = 1$, negative at $x = 5$, positive at $x = 8$ — a **U-shape** (parabolic). The linear fit systematically over-predicts in the middle and under-predicts at the extremes.",
    },
    {
      label: "d",
      marks: 3,
      content: `Identify the type of transformation that would help linearise these data and justify your choice.`,
      solution: "The data curve upward (concave up). Effective transformations include:\n- **$y' = \\sqrt y$** or **$y' = \\log y$**: compresses large $y$-values, straightening upward-curving data.\n- **$x' = x^2$**: stretches the $x$-axis at large $x$, balancing the visual curve.\n\nThe choice depends on the exact curvature shape; a CAS can fit each option and choose the one whose residual plot looks most random. Any one of the above with a coherent justification is acceptable.",
    },
    {
      label: "e",
      marks: 3,
      content: `After applying a $y' = \\sqrt y$ transformation and refitting, the new residual plot shows a random scatter about zero. State your conclusion about the data and explain how you would use the transformed model to make predictions.`,
      solution: "**Conclusion**: the underlying relationship between $x$ and $y$ is approximately quadratic in $x$ (since $\\sqrt y \\propto x$ means $y \\propto x^2$). The transformed model gives a good linear fit, with random residuals indicating no remaining structure.\n\n**Using the model**: given a value of $x$, first compute $\\hat y' = a + bx$ using the transformed line, then 'untransform' by squaring: $\\hat y = (\\hat y')^2$. So if $\\hat y' = 2 + 0.6x$ and $x = 6$, then $\\hat y' = 5.6$ and $\\hat y = 5.6^2 \\approx 31.4$. Always check that predictions stay within (or near) the data range and that residual diagnostics remain clean.",
    },
  ],
  "MEDIUM",
  `**Question — Residual analysis and model fit**\n\nA student fits a linear regression to a dataset that visibly curves on the scatterplot. The student wants to assess whether the linear model is appropriate using residual analysis.`,
);

extResp(
  [
    {
      label: "a",
      marks: 2,
      content: `${img(studyScoreScatter)}\n\nA CAS reports the regression line $\\hat y = 38.5 + 5.4x$ and lists the residuals at each observed $x$:\n\n| $x$ | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 |\n|---|---|---|---|---|---|---|---|---|---|\n| residual | $-4.3$ | $-2.9$ | $-2.1$ | $+0.1$ | $+0.5$ | $-0.7$ | $+1.7$ | $+3.1$ | $+4.6$ |\n\nDescribe the pattern (if any) in the residuals.`,
      solution: "The residuals show a **clear monotonic trend**: negative at small $x$, increasing through zero around the middle, positive at large $x$. They appear to rise as $x$ increases — this is **not** a random scatter.",
    },
    {
      label: "b",
      marks: 2,
      content: `What does the pattern in (a) suggest about the linear model? Suggest what the underlying relationship might look like.`,
      solution: "The pattern suggests the linear model **systematically under-predicts** at low and high $x$ and slightly over-predicts in the middle (or similar). This is consistent with a **non-linear** underlying relationship that has slight curvature — perhaps quadratic, exponential, or logarithmic — which the straight line cannot capture.",
    },
    {
      label: "c",
      marks: 3,
      content: `Suggest two transformations that might address the issue and justify each briefly.`,
      solution: "(i) **$y' = y^2$**: stretches large $y$-values further; useful if the data curve gently upward (concave up) — squaring may straighten the relationship.\n(ii) **$x' = \\log x$**: compresses larger $x$-values; useful when the response variable grows fast for small $x$ and slower for large $x$, or vice versa.\n(iii) **$y' = \\log y$**: useful if the response grows exponentially with $x$.\n\n(Any two with reasoning, 1.5 marks each.)",
    },
    {
      label: "d",
      marks: 3,
      content: `Suppose after applying the transformation $y' = y^2$ and refitting, the new residuals appear to be:\n\n| $x$ | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 |\n|---|---|---|---|---|---|---|---|---|---|\n| residual | $-0.2$ | $+0.4$ | $-0.3$ | $+0.1$ | $-0.5$ | $+0.3$ | $-0.1$ | $+0.2$ | $+0.1$ |\n\nState whether the transformation has improved the fit and justify.`,
      solution: "**Yes — the transformation has improved the fit**. The new residuals are small in magnitude (range about $\\pm 0.5$ versus $\\pm 4.6$ before) and show **no systematic pattern** — they alternate between positive and negative apparently at random. The transformation has captured the curvature in the original data, and the linear model on $y'$ is now appropriate.",
    },
    {
      label: "e",
      marks: 2,
      content: `Suggest one limitation of using residual plots alone to choose a transformation.`,
      solution: "Residual plots only **detect** patterns; they do not **uniquely** specify which transformation to use. Multiple transformations may produce similarly random-looking residual plots, and the choice may depend on physical / contextual reasoning. Additionally, residual plots can be misleading with very small datasets (apparent patterns due to chance) or when outliers dominate the plot. A sensible workflow is to try several transformations and pick the one whose residuals are smallest in magnitude and most clearly random.",
    },
  ],
  "HARD",
  `**Question — Diagnosing model fit with residuals**\n\nA teacher fits a least-squares line to data on study hours and test scores. The CAS provides the residuals at each observed point.`,
  "CAS_REQUIRED",
);

extResp(
  [
    {
      label: "a",
      marks: 2,
      content: `${img(carPriceScatter)}\n\nA CAS reports $\\hat y = 28.1 - 2.6x$ for the price (\\$000s) of cars against age (years). Verify by computing the predicted price at age 5 and computing the residual if the observed price at age 5 is $\\$16k$.`,
      solution: "$\\hat y(5) = 28.1 - 2.6 \\times 5 = 28.1 - 13 = 15.1$ ($\\$15.1k$).\nResidual = $16 - 15.1 = +0.9$ ($\\$900$). The 5-year-old car sold for \\$900 more than the line predicts.",
    },
    {
      label: "b",
      marks: 2,
      content: `Compute the residuals at ages 1, 5, and 10 using the observed values \\$28k, \\$16k, \\$5k respectively.`,
      solution: "$\\hat y(1) = 28.1 - 2.6 = 25.5$. Residual = $28 - 25.5 = +2.5$.\n$\\hat y(5) = 15.1$. Residual = $16 - 15.1 = +0.9$ (from part a).\n$\\hat y(10) = 28.1 - 26 = 2.1$. Residual = $5 - 2.1 = +2.9$.",
    },
    {
      label: "c",
      marks: 2,
      content: `Plot the three residuals on a residual plot (describe). What does the pattern suggest?`,
      solution: "Residuals at $x = 1, 5, 10$ are $+2.5, +0.9, +2.9$ — all positive. This is **suspicious**: a properly fitted least-squares line should have residuals that sum to zero. The all-positive residuals here likely indicate sampling artefacts from selecting only three of the ten data points, or that the line coefficients are slightly off.\n\nMore importantly, the residual at age 10 is **larger** than at age 5 — a possible **funnel pattern** (heteroscedasticity) at the older end, suggesting variance grows with age.",
    },
    {
      label: "d",
      marks: 3,
      content: `Discuss two diagnostic checks a statistician should perform before concluding that the linear model is appropriate.`,
      solution: "Two checks (1.5 marks each): (i) **Plot all residuals** against $x$ (or against $\\hat y$) and look for systematic patterns (curves, trends, funnels). A linear fit is appropriate only when residuals scatter randomly about zero. (ii) **Check the magnitude** of residuals relative to the range of $y$ — large residuals indicate the model has substantial unexplained variation. (iii) Optionally, check $r^2$ for overall fit and look for **outliers** (residuals more than about 2 standard deviations from zero) that may be distorting the line.",
    },
    {
      label: "e",
      marks: 3,
      content: `Suppose the residual plot for the full dataset shows a clear **curved (U-shape) pattern**, with positive residuals at low and high ages and negative residuals in the middle. State your conclusion about the linear model and recommend a next step.`,
      solution: "**Conclusion**: the linear model is **not appropriate**. The U-shape indicates the true relationship between car age and price is curved — possibly an exponential decay (price falls fast in the first few years, slower later) rather than linear.\n\n**Next step**: apply a transformation. For an exponential-decay shape, try $y' = \\log y$ (logarithm of price) — this typically straightens exponential decay. Re-fit a linear regression on $(\\log y, x)$ and check the new residual plot. The transformed model $\\log y = a + bx$ corresponds to $y = e^a \\cdot e^{bx}$ — exponential decay if $b < 0$.",
    },
  ],
  "MEDIUM",
  `**Question — Used cars and residual diagnostics**\n\nA used-car dealer fits a least-squares line to price (\\$000s) versus age (years) for ten cars. The dealer wants to check whether the linear model is appropriate using residual analysis.`,
);

console.log(`Residual complete: ${items.length} items so far.`);

// ═══════════════════════════════════════════════════════════════════════
// SUBTOPIC 6: data-transformations (modelling-rich: 7+4+2+3 = 16)
// ═══════════════════════════════════════════════════════════════════════
CURRENT_SUBTOPIC = "data-transformations";

mcq(
  `If a scatterplot of $y$ against $x$ bends **upward** (concave up), a transformation that may linearise the data is\n\n`,
  ["$y' = y^2$", "$y' = \\sqrt y$", "$x' = e^x$", "neither — leave data unchanged"],
  "B",
  "MEDIUM",
  "**Answer: B**\n\nFor data curving **upward**, common linearising transformations include $y' = \\sqrt y$ or $y' = \\log y$ (which compress large $y$-values) or $x' = x^2$ (stretches large $x$). Squaring $y$ would make the upward curve **worse**.",
);

mcq(
  `For data curving **downward** (concave down, decreasing slope), a useful linearising transformation is\n\n`,
  ["$y' = y^2$", "$x' = \\log x$", "$y' = 1/y$", "no transformation can help"],
  "B",
  "MEDIUM",
  "**Answer: B**\n\nFor downward-curving (concave-down) data, $x' = \\log x$ compresses larger $x$-values and tends to linearise. $y' = y^2$ stretches large $y$ — useful for concave-down data too. The ladder of transformations gives several options.",
);

mcq(
  `After applying the transformation $y' = \\log y$, the linear regression is $\\hat y' = 1.2 + 0.5x$. The implicit model for $y$ in terms of $x$ is\n\n`,
  ["$y = 1.2 + 0.5x$", "$y = 10^{1.2 + 0.5x}$", "$y = e^{1.2} + e^{0.5x}$", "$y = 1.2 \\times 0.5^x$"],
  "B",
  "MEDIUM",
  "**Answer: B**\n\nIf $\\log y = a + bx$ (where $\\log$ is base 10), then $y = 10^{a + bx}$. So $y = 10^{1.2 + 0.5x}$. Option A is wrong (forgets to invert the log); D scrambles the constants.",
);

mcq(
  `For a quantity $y$ that grows exponentially with $x$ (e.g. bacteria population), the most natural linearising transformation is\n\n`,
  ["$y' = y^2$", "$y' = \\log y$", "$x' = x^2$", "$x' = 1/x$"],
  "B",
  "MEDIUM",
  "**Answer: B**\n\nExponential growth $y = A \\cdot b^x$ becomes linear under a logarithmic transformation: $\\log y = \\log A + x \\log b$. So $y' = \\log y$ converts the exponential into a straight line.",
);

mcq(
  `If a transformation linearises a scatterplot, then on the **transformed** data we expect\n\n`,
  [
    "$r^2$ to decrease compared with the original data",
    "$r^2$ to increase compared with the original data",
    "$r^2$ to be unchanged",
    "no relationship",
  ],
  "B",
  "MEDIUM",
  "**Answer: B**\n\nA successful transformation removes curvature and creates a stronger linear relationship — $r^2$ on the transformed data will be higher than $r^2$ on the original (curved) data.",
);

mcq(
  `Pairs of $(x, y)$ data have a clear non-linear pattern. A student tries three transformations: $y' = y^2$, $y' = \\log y$, $y' = 1/y$. The student should choose the transformation that\n\n`,
  [
    "gives the highest $r^2$ value on the transformed data",
    "gives the most random-looking residual plot on the transformed data",
    "is most physically interpretable in the context",
    "all of the above — these criteria are complementary and should be considered together",
  ],
  "D",
  "MEDIUM",
  "**Answer: D**\n\nA good transformation produces (i) a higher $r^2$, (ii) a random-looking residual plot (no remaining pattern), and (iii) is interpretable in the application context (e.g. log y for exponential growth). All three criteria are complementary.",
);

mcq(
  `A scatterplot of population $y$ (millions) against year $x$ is curved (population grows faster over time). After applying $y' = \\log y$, the data appear linear with regression line $\\hat y' = -0.1 + 0.05x$. The predicted population in year $x = 10$ is\n\n`,
  ["$0.4$ million", "$\\log(0.4)$ million", "$10^{0.4} \\approx 2.5$ million", "$2.5$ thousand"],
  "C",
  "HARD",
  "**Answer: C**\n\nAt $x = 10$: $\\hat y' = -0.1 + 0.05 \\times 10 = 0.4$. Since $\\hat y' = \\log y$, the predicted population is $\\hat y = 10^{0.4} \\approx 2.51$ million. Inverting the log is essential — option A forgets the inversion.",
);

// SHORT (4)
short(
  `Bivariate data $(x, y)$ show a strongly curved pattern with $y$ growing faster than linearly. After applying $y' = \\log y$ (base 10), the new scatterplot is linear with line $\\hat y' = 0.5 + 0.3x$ and $r^2 = 0.99$.\n\n**a.** Write down the implicit model relating $y$ to $x$. (2 marks)\n\n**b.** Use the transformed model to predict $y$ when $x = 4$. (2 marks) (4 marks)`,
  4,
  "MEDIUM",
  "**a.** $\\log y = 0.5 + 0.3x$, so $y = 10^{0.5 + 0.3x}$ (equivalent forms: $y = 10^{0.5} \\cdot 10^{0.3x}$ or $y \\approx 3.16 \\times 10^{0.3x}$).\n\n**b.** $\\hat y'(4) = 0.5 + 0.3 \\times 4 = 0.5 + 1.2 = 1.7$. So $\\hat y = 10^{1.7} \\approx \\mathbf{50.1}$.",
);

short(
  `A scatterplot of yield $y$ (tonnes) against rainfall $x$ (mm) curves **upward**. A student applies $y' = \\sqrt y$, the residual plot becomes random, and the regression line on the transformed data is $\\hat y' = 1.0 + 0.4x$.\n\n**a.** Use the transformed model to predict $\\hat y$ when $x = 5$. (2 marks)\n\n**b.** Explain in one sentence why squaring the result is necessary. (1 mark)\n\n**c.** State the implicit non-linear relationship between $y$ and $x$. (1 mark) (4 marks)`,
  4,
  "MEDIUM",
  "**a.** $\\hat y'(5) = 1.0 + 0.4 \\times 5 = 3.0$. Since $\\hat y' = \\sqrt{\\hat y}$, $\\hat y = 3.0^2 = \\mathbf{9}$ tonnes.\n\n**b.** Squaring undoes the square-root transformation, returning the prediction to the original scale of $y$.\n\n**c.** Implicit relationship: $\\sqrt y = 1.0 + 0.4 x$, equivalently $y = (1 + 0.4x)^2$ — a quadratic function of $x$.",
);

short(
  `Use the following transformation rules:\n- Concave **up** data: try $y' = \\log y$ or $y' = \\sqrt y$, or $x' = x^2$.\n- Concave **down** data: try $y' = y^2$ or $x' = \\log x$ or $x' = \\sqrt x$.\n- Sharp asymptotic / hyperbolic data: try $y' = 1/y$ or $x' = 1/x$.\n\nFor each scenario below, suggest a transformation:\n\n**a.** Population growth (rises faster over time). (1 mark)\n\n**b.** Radioactive decay (drops fast at first, then slowly). (1 mark)\n\n**c.** Diminishing returns (yield rises but flattens off). (1 mark)\n\n**d.** Hyperbolic pricing (price tends to a non-zero asymptote as quantity grows). (1 mark) (4 marks)`,
  4,
  "MEDIUM",
  "**a.** $y' = \\log y$ (exponential growth — log linearises it).\n\n**b.** $y' = \\log y$ also works (exponential decay), or $x' = \\log x$ if the curve flattens.\n\n**c.** $y' = y^2$ or $x' = \\log x$ (concave-down growth — both stretch the right tail or compress the explanatory axis to straighten).\n\n**d.** $y' = 1/y$ or $x' = 1/x$ (reciprocal transformations linearise hyperbolic relationships).",
);

short(
  `A botanist records the diameter $d$ (cm) and weight $W$ (g) of tomatoes. The scatterplot of $W$ vs $d$ curves upward (heavier tomatoes have larger diameters, faster than linear). She applies $W' = W^{1/3}$ and re-fits a linear regression, obtaining $\\hat W' = 0.2 + 0.4 d$ with $r^2 = 0.96$.\n\n**a.** Predict the diameter at which $\\hat W = 100$ g. (3 marks)\n\n**b.** Predict the weight when $d = 7$ cm. (2 marks) (5 marks)`,
  5,
  "HARD",
  "**a.** $W' = W^{1/3}$ means $\\hat W' = 100^{1/3} \\approx 4.642$. Solve $4.642 = 0.2 + 0.4 d \\Rightarrow 0.4 d = 4.442 \\Rightarrow d \\approx \\mathbf{11.1}$ cm.\n\n**b.** $\\hat W'(7) = 0.2 + 0.4 \\times 7 = 3.0$. $\\hat W = (3.0)^3 = \\mathbf{27}$ g.\n\n(The implicit model: $W^{1/3} = 0.2 + 0.4 d$, i.e. $W = (0.2 + 0.4 d)^3$ — consistent with weight $\\sim$ volume $\\sim d^3$ in physical terms.)",
);

// EXT_ANS (2)
extAns(
  [
    {
      label: "a",
      marks: 2,
      content: `${img(curvedUpScatter)}\n\nA student fits a linear regression to the curved data above and obtains $\\hat y = -8 + 8x$ with $r^2 = 0.93$. Without computing residuals, explain why this $r^2$ is misleading.`,
      solution: "The scatterplot is clearly curved, so a linear model is mis-specified — even if $r^2$ appears high (here 93%), the residual plot would show a clear curved pattern, revealing that the line systematically over-predicts in the middle and under-predicts at the extremes (or vice versa). A high $r^2$ on curved data is a numerical accident, not a sign of a good fit; the residual plot is the more reliable diagnostic.",
    },
    {
      label: "b",
      marks: 2,
      content: `Suggest two transformations that may linearise the data, with reasons.`,
      solution: "(i) **$y' = \\sqrt y$**: compresses large $y$-values; useful for upward-curving data. Implicit model: $y = (\\text{linear in } x)^2$ — sensible if $y$ scales like $x^2$.\n(ii) **$y' = \\log y$**: also compresses large $y$; useful if the relationship is exponential. Implicit model: $y = A \\cdot b^x$.\n(iii) **$x' = x^2$**: stretches large $x$; effective if the response increases polynomially in $x$.",
    },
    {
      label: "c",
      marks: 2,
      content: `After applying $y' = \\sqrt y$, the regression is $\\hat y' = 0.5 + 1.0 x$ with $r^2 = 0.99$ and the residual plot is random. Predict the value of $y$ when $x = 6$.`,
      solution: "$\\hat y'(6) = 0.5 + 1.0 \\times 6 = 6.5$. $\\hat y = (6.5)^2 = \\mathbf{42.25}$.",
    },
  ],
  "MEDIUM",
);

extAns(
  [
    {
      label: "a",
      marks: 2,
      content: `Bacteria population $N$ (thousands) doubles approximately every hour. After 0, 1, 2, 3, 4 hours the counts are 1, 2, 4, 8, 16. Plot (describe) the scatterplot of $N$ vs time $t$.`,
      solution: "The scatterplot shows $N$ rising **exponentially** with $t$: $N = 1, 2, 4, 8, 16$ — a curve that gets steeper and steeper. Definitely **not** linear.",
    },
    {
      label: "b",
      marks: 2,
      content: `Apply $N' = \\log_{10} N$ to the data. Tabulate the transformed data.`,
      solution: "$\\log_{10}(1) = 0$; $\\log_{10}(2) \\approx 0.301$; $\\log_{10}(4) \\approx 0.602$; $\\log_{10}(8) \\approx 0.903$; $\\log_{10}(16) \\approx 1.204$.\n\nTransformed data:\n| $t$ | 0 | 1 | 2 | 3 | 4 |\n|---|---|---|---|---|---|\n| $N' = \\log N$ | 0 | 0.301 | 0.602 | 0.903 | 1.204 |",
    },
    {
      label: "c",
      marks: 3,
      content: `By inspection (or CAS), state the equation of the linear regression on the transformed data $(t, N')$ to 3 dp, and write the implicit exponential model for $N$ in terms of $t$.`,
      solution: "The transformed points lie exactly on a straight line: $\\hat N' = 0.301 t$ (slope = $0.301$, intercept = $0$).\n\nImplicit model: $\\log_{10} N = 0.301 t$, so $N = 10^{0.301 t} = (10^{0.301})^t \\approx 2^t$. This recovers the doubling-every-hour pattern from the original data: $N = 2^t$.",
    },
  ],
  "MEDIUM",
  `A microbiologist counts bacteria in a culture each hour for 4 hours. The data show approximately exponential growth.`,
);

// EXT_RESP (3)
extResp(
  [
    {
      label: "a",
      marks: 2,
      content: `A scatterplot of company revenue $R$ (\\$ million) against years since founding $t$ shows a clear upward-bending (concave-up) shape. The student tries fitting a linear regression and obtains $r^2 = 0.85$ — but the residual plot shows a clear U-shape. Explain why the linear model is inappropriate despite $r^2 = 0.85$.`,
      solution: "A high $r^2$ alone does **not** guarantee a good fit when the underlying relationship is non-linear. The residual plot's U-shape shows that the linear model **systematically** mis-predicts: positive residuals at the extremes and negative in the middle (or vice versa). This is a sure sign of model mis-specification. The 85% of variation 'explained' is mostly the up-down sweep of the curve, but the linear model's structural error is hidden in residuals.",
    },
    {
      label: "b",
      marks: 3,
      content: `The student applies $R' = \\log_{10} R$ and obtains $\\hat R' = 1.0 + 0.2 t$ with $r^2 = 0.99$ and a random residual plot.\n\n(i) Write down the implicit model for $R$ in terms of $t$.\n\n(ii) State the value of $r^2$ on the transformed data and explain what this implies.`,
      solution: "(i) $\\log_{10} R = 1.0 + 0.2 t$, so $R = 10^{1 + 0.2 t} = 10 \\cdot 10^{0.2 t}$ — exponential growth with base $10^{0.2} \\approx 1.585$ per year.\n\n(ii) $r^2 = 0.99$ on the transformed data means 99% of the variation in $\\log R$ is explained by the linear relationship with $t$. The transformation has captured the exponential growth pattern, and the linear model on $(t, \\log R)$ is now an excellent fit.",
    },
    {
      label: "c",
      marks: 2,
      content: `Predict the company's revenue at $t = 5$ years.`,
      solution: "$\\hat R'(5) = 1.0 + 0.2 \\times 5 = 2.0$. $\\hat R = 10^{2.0} = \\mathbf{\\$100}$ million.",
    },
    {
      label: "d",
      marks: 2,
      content: `Use the implicit model to predict the year in which revenue is forecast to reach \\$1 billion (\\$1000 million).`,
      solution: "$R = 1000$ ⇒ $\\log_{10} R = 3$. Set $3 = 1.0 + 0.2 t$ ⇒ $0.2 t = 2 \\Rightarrow t = 10$ years. So the company is predicted to reach \\$1 billion in revenue around **10 years** after founding (note: this is an extrapolation if the data only ran for, say, 5-6 years).",
    },
    {
      label: "e",
      marks: 3,
      content: `Comment on the risks of using the exponential model to predict revenue at $t = 25$ years.`,
      solution: "**Extrapolation risk**: 25 is well beyond the data range; the exponential pattern likely breaks down at large $t$ as the company hits market saturation, competition, or economic limits.\n\n**Predicted value**: $\\hat R'(25) = 1 + 5 = 6 \\Rightarrow \\hat R = 10^6 = \\$1$ million-million = \\$1 trillion — implausible for any single company.\n\n**Lesson**: Exponential models are reliable only over a limited range. Predictions far outside that range should be treated with extreme caution, ideally checked against domain knowledge and supplemented with sub-models (logistic growth, S-curves) that capture saturation.",
    },
  ],
  "MEDIUM",
  `**Question — Exponential growth and log-linear regression**\n\nA student investigates a company's revenue $R$ (in \\$ million) against years since founding $t$.`,
  "CAS_REQUIRED",
);

extResp(
  [
    {
      label: "a",
      marks: 2,
      content: `Distance $d$ (m) versus time $t$ (s) for a falling object shows a curve. A student tries fitting a line and gets $\\hat d = -10 + 8t$ with poor residuals. Suggest a transformation and justify physically.`,
      solution: "For a freely-falling object, $d = \\frac{1}{2} g t^2$ — a quadratic, not linear, relationship. Apply $t' = t^2$ (or equivalently $d' = \\sqrt d$). The transformation $d$ vs $t^2$ should be linear with slope $\\frac{1}{2} g \\approx 4.9$ m/s².",
    },
    {
      label: "b",
      marks: 2,
      content: `After applying $t' = t^2$, the CAS reports $\\hat d = 0.1 + 4.9 t'$ with $r^2 = 0.999$ and random residuals. Predict the distance fallen at $t = 3$ s.`,
      solution: "$t' = 3^2 = 9$. $\\hat d = 0.1 + 4.9 \\times 9 = 0.1 + 44.1 = \\mathbf{44.2}$ m.\n\n(Physical check: $d = \\frac{1}{2}(9.8)(3)^2 = 44.1$ m — excellent agreement.)",
    },
    {
      label: "c",
      marks: 2,
      content: `Predict the time taken to fall 100 m.`,
      solution: "$100 = 0.1 + 4.9 t'$ ⇒ $t' = 99.9 / 4.9 \\approx 20.39$. $t = \\sqrt{20.39} \\approx \\mathbf{4.52}$ s.\n\n(Physical check: $t = \\sqrt{2d/g} = \\sqrt{200/9.8} \\approx 4.52$ s — agreement.)",
    },
    {
      label: "d",
      marks: 3,
      content: `Explain why the intercept $0.1$ in $\\hat d = 0.1 + 4.9 t'$ is essentially negligible and physically interpretable.`,
      solution: "Physically, at $t = 0$ the object has not fallen at all, so $d$ should be $0$. The fitted intercept of $0.1$ m is **essentially zero** within measurement / rounding error — the line passes very nearly through the origin, as the physics demands. The $0.1$ m can be attributed to small measurement uncertainties (initial position, timing precision, air resistance), not to any structural offset. A statistician would report 'intercept approximately zero, consistent with the physical model'.",
    },
    {
      label: "e",
      marks: 3,
      content: `If a different student fitted $d$ on $t$ directly (no transformation) and obtained $r^2 = 0.95$, comment on whether $r^2 = 0.95$ is enough to justify the linear model. Explain why the transformed model ($r^2 = 0.999$) is preferred.`,
      solution: "$r^2 = 0.95$ on $(t, d)$ would still leave a clearly curved residual plot — the linear model would systematically mis-predict. A high $r^2$ alone is insufficient; the **residual plot** is the deciding diagnostic.\n\nThe transformed model ($r^2 = 0.999$) is preferred because: (i) it has a higher $r^2$, (ii) its residuals are random, (iii) it is physically interpretable (matches the known $d = \\frac{1}{2}gt^2$ law), and (iv) its predictions are accurate across the data range and consistent with extrapolation that respects physics. A model that aligns with theory and gives random residuals is a far better choice than one that is merely 'numerically close' on linear $r^2$.",
    },
  ],
  "HARD",
  `**Question — Transformation and physical interpretation**\n\nA student measures the distance an object has fallen at various times during a free-fall experiment. The data clearly curve.`,
  "CAS_REQUIRED",
);

extResp(
  [
    {
      label: "a",
      marks: 2,
      content: `An economist plots the cost per unit $C$ (\\$) against the number of units produced $n$ for a factory. The scatterplot shows that costs **fall steeply** at first, then flatten out — a hyperbolic shape with a non-zero asymptote. A linear fit produces clearly curved residuals. Suggest a transformation and justify.`,
      solution: "For hyperbolic data approaching an asymptote, $C = a + b/n$ — equivalently, plotting $C$ against $x' = 1/n$ should give a straight line. So apply $\\boxed{x' = 1/n}$ (reciprocal of $n$). This linearises the hyperbola and the slope captures the rate of decrease.",
    },
    {
      label: "b",
      marks: 2,
      content: `After applying $x' = 1/n$, the CAS gives $\\hat C = 5 + 50 \\cdot (1/n)$ with $r^2 = 0.98$ and random residuals. Predict the cost per unit when 10 units are produced.`,
      solution: "$1/n = 1/10 = 0.1$. $\\hat C = 5 + 50 \\times 0.1 = 5 + 5 = \\mathbf{\\$10}$ per unit.",
    },
    {
      label: "c",
      marks: 2,
      content: `Predict the cost per unit when 100 units are produced.`,
      solution: "$1/n = 0.01$. $\\hat C = 5 + 50 \\times 0.01 = 5 + 0.5 = \\mathbf{\\$5.50}$ per unit.",
    },
    {
      label: "d",
      marks: 3,
      content: `Interpret the intercept ($5$) and slope ($50$) in context.`,
      solution: "**Intercept (5)**: as $n \\to \\infty$, $1/n \\to 0$ and $\\hat C \\to \\$5$ — this is the **asymptotic minimum cost per unit** that the factory can achieve at very large production volumes (the marginal cost floor, perhaps materials).\n\n**Slope (50)**: this is the coefficient of $1/n$. At $n = 1$ (very low production), the extra cost above the asymptote is \\$50; at $n = 10$, extra cost is \\$5; etc. It captures the fixed overhead that gets spread across units.",
    },
    {
      label: "e",
      marks: 3,
      content: `An accountant proposes using the transformed model to predict the cost at $n = 1000$ units and at $n = 0.5$ (a fractional / non-physical input). Comment on the validity of each prediction.`,
      solution: "**$n = 1000$**: predicted $\\hat C = 5 + 50 \\times 0.001 = \\$5.05$. This is plausible (asymptotic) **provided** $n = 1000$ is within the data range used to fit the model. If not, it is an extrapolation — likely robust because the model asymptotes correctly, but should be flagged.\n\n**$n = 0.5$**: nonsensical — you cannot produce half a unit. The model would predict $\\hat C = 5 + 100 = \\$105$ per unit, but the prediction is structurally meaningless. The reciprocal transformation assumes $n > 0$ but also that $n$ is in a sensible operational range. The model is undefined or invalid for $n \\leq 0$, and even for $n < 1$ is not physically meaningful.",
    },
  ],
  "HARD",
  `**Question — Cost per unit and the reciprocal transformation**\n\nA factory's accountant studies the cost per unit produced as production volume varies. The scatterplot is hyperbolic.`,
);

console.log(`Transformations complete: ${items.length} items so far.`);

// ═══════════════════════════════════════════════════════════════════════
// SUBTOPIC: time-series-analysis (modelling-rich: 7+4+2+3 = 16)
// ═══════════════════════════════════════════════════════════════════════
CURRENT_SUBTOPIC = "time-series-analysis";

const monthlyRetail = timeSeriesPlot({
  points: [
    { t: 1, y: 120 }, { t: 2, y: 135 }, { t: 3, y: 150 }, { t: 4, y: 165 },
    { t: 5, y: 178 }, { t: 6, y: 190 }, { t: 7, y: 210 }, { t: 8, y: 222 },
    { t: 9, y: 235 }, { t: 10, y: 250 }, { t: 11, y: 263 }, { t: 12, y: 280 },
  ],
  xLabel: "month", yLabel: "sales (\\$000s)",
  xTicks: [1, 3, 6, 9, 12], yTicks: [100, 150, 200, 250, 300],
  connectPoints: true, title: "Monthly retail sales",
});

const quarterlyIceCream = timeSeriesPlot({
  points: [
    { t: 1, y: 80 }, { t: 2, y: 140 }, { t: 3, y: 120 }, { t: 4, y: 60 },
    { t: 5, y: 90 }, { t: 6, y: 160 }, { t: 7, y: 130 }, { t: 8, y: 70 },
    { t: 9, y: 100 }, { t: 10, y: 175 }, { t: 11, y: 145 }, { t: 12, y: 80 },
  ],
  xLabel: "quarter", yLabel: "ice-cream sales (\\$000s)",
  xTicks: [1, 4, 8, 12], yTicks: [50, 100, 150, 200],
  connectPoints: true, title: "Quarterly ice-cream sales",
});

mcq(
  `${img(monthlyRetail)}\n\nThe time series above is best described as showing\n\n`,
  ["seasonality only", "an increasing trend with no seasonality", "a decreasing trend", "no trend and no seasonality"],
  "B",
  "EASY",
  "**Answer: B**\n\nThe data climbs steadily from 120 to 280 over 12 months without repeating up-and-down patterns within a year — that is a clear increasing trend with no observable seasonal effect.",
);

mcq(
  `${img(quarterlyIceCream)}\n\nThe time series above shows ice-cream sales by quarter over three years. The pattern is best described as\n\n`,
  ["no trend, seasonal", "increasing trend, seasonal", "decreasing trend, seasonal", "increasing trend, no seasonality"],
  "B",
  "EASY",
  "**Answer: B**\n\nThe peak in Q2 of each year (140, 160, 175) increases each year — so there is an increasing trend. The within-year pattern (low Q1, peak Q2, drop Q3, lowest Q4) repeats — clear seasonality.",
);

mcq(
  `Which of the following is a component of a typical time series decomposition?\n\n`,
  ["only trend", "trend and seasonality", "trend, seasonality, and irregular components", "trend, seasonality, regression, and irregular"],
  "C",
  "EASY",
  "**Answer: C**\n\nThe three classical components of a time series are trend, seasonality, and irregular (random) components.",
);

mcq(
  `A time series shows daily website visits over a calendar year. A peak every 7 days corresponding to weekends suggests a\n\n`,
  ["seasonal cycle with period 7", "linear trend", "random walk pattern", "long-term cyclical component"],
  "A",
  "EASY",
  "**Answer: A**\n\nA recurring 7-day pattern is the definition of seasonality with period 7 days.",
);

mcq(
  `A long-term cyclical component differs from a seasonal component in that\n\n`,
  [
    "cyclical patterns have a fixed period; seasonal don't",
    "cyclical patterns have varying period (often years) while seasonal patterns repeat over fixed shorter periods (e.g. quarter, month, day-of-week)",
    "cyclical patterns are irregular while seasonal are regular",
    "they are interchangeable terms",
  ],
  "B",
  "MEDIUM",
  "**Answer: B**\n\nSeasonal patterns have FIXED periods (every quarter, every month, every day-of-week). Cyclical patterns (e.g. business cycles) have variable, often multi-year, periods and are harder to forecast.",
);

mcq(
  `For a time series that has a clear increasing trend, the appropriate method to identify the seasonal effect is\n\n`,
  [
    "Compute the seasonal index by dividing each value by the trend (or moving average), and average across cycles",
    "Compute the seasonal index by subtracting the average from each value",
    "Use Pearson's r between value and time",
    "Use the residual of a linear regression",
  ],
  "A",
  "MEDIUM",
  "**Answer: A**\n\nWith a trend, the seasonal index is computed multiplicatively: value ÷ trend (centred MA). These ratios are then averaged across cycles to give the seasonal index for each period.",
);

mcq(
  `If a time series has trend = 100 and seasonal index for Q2 = 1.25, the forecasted value for Q2 (without irregular component) is\n\n`,
  ["75", "100", "125", "150"],
  "C",
  "MEDIUM",
  "**Answer: C**\n\nForecast = trend × seasonal index = 100 × 1.25 = **125**.",
);

short(
  `Distinguish between **trend**, **seasonality**, and **irregular** components of a time series. Provide one short example of each. (3 marks)`,
  3,
  "EASY",
  "**Trend** = long-term direction (e.g. global temperatures rising over decades).\n\n**Seasonality** = a regular, periodic up-and-down pattern within each cycle (e.g. ice-cream sales peaking each summer).\n\n**Irregular** = random fluctuation not explained by trend or seasonality (e.g. one-off effect of a storm on retail sales).",
);

short(
  `${img(quarterlyIceCream)}\n\nFrom the time series of ice-cream sales above:\n\n**a.** Identify the trend direction. (1 mark)\n\n**b.** State the seasonal pattern (which quarter is the peak). (1 mark)\n\n**c.** Estimate by how much sales increased on average from year 1 to year 3 in Q2. (2 marks) (4 marks)`,
  4,
  "MEDIUM",
  "**a.** Increasing trend across the three years.\n\n**b.** Peak in Q2 of each year (Q1 low, Q2 high, Q3 medium-high, Q4 lowest).\n\n**c.** Q2 values: year 1 = 140, year 3 = 175. Increase = 175 − 140 = **35** (\\$35,000). Average per year = 17.5 (\\$17,500/year).",
);

short(
  `A small business records daily sales for 14 days and identifies a strong weekly cycle. The owner wants to forecast next week's sales. Explain why a moving-average decomposition, rather than a linear regression on time, would be more appropriate. (3 marks)`,
  3,
  "MEDIUM",
  "Linear regression on time would only capture the **trend** but would ignore the strong **weekly seasonal pattern**. A moving-average decomposition can separate the trend from the seasonal effect, allowing each component to be estimated and then recombined for forecasting. Without seasonal adjustment, the regression-based forecast for any single day would be systematically biased (over- or under-estimated depending on which day of the week).",
);

short(
  `A time series of 24 months shows clear seasonality but no trend. State which of the following would be most appropriate to summarise this time series and forecast a future month, and justify your answer:\n\n(i) linear regression of value on time,\n\n(ii) seasonal indices computed from monthly averages,\n\n(iii) 12-month centred moving average. (3 marks)`,
  3,
  "MEDIUM",
  "**(ii) Seasonal indices** is the best choice. A 12-month centred MA (iii) is designed to smooth out seasonality and reveal the underlying trend — useful, but the trend here is flat, so the MA would just give a near-constant value. Forecasting requires combining trend (constant here) with seasonal indices (12 monthly ratios). Linear regression (i) misses seasonality entirely.\n\nMethod: compute average for each month across years (24/12 = 2 years); the ratio of each month's average to overall average is the seasonal index. Forecast for month X = overall average × seasonal index of X.",
);

extAns(
  [
    {
      label: "a",
      marks: 2,
      content: `Describe the three main components of the time series shown.\n\n${img(quarterlyIceCream)}`,
      solution: "**Trend**: increasing — peaks rise from 140 → 160 → 175 across the three years.\n**Seasonality**: clear quarterly pattern — low Q1, peak Q2, decline Q3, lowest Q4. Period = 4 quarters.\n**Irregular**: minor random fluctuations around the trend + seasonal expectation.",
    },
    {
      label: "b",
      marks: 3,
      content: `Estimate the average quarterly increase in trend using the Q2 values from each year. State your assumption.`,
      solution: "Q2 values: 140 (yr 1), 160 (yr 2), 175 (yr 3). Average increase Q2 to Q2: (160−140) + (175−160) = 20 + 15 = 35 over 2 years (8 quarters). Average per quarter ≈ 35/8 ≈ **4.4 (\\$4,400/quarter)**.\n\n**Assumption**: trend is approximately linear and Q2 values are roughly on the trend line. (More accurate would be to fit a centred MA, but this gives a reasonable estimate.)",
    },
  ],
  "MEDIUM",
);

extAns(
  [
    {
      label: "a",
      marks: 2,
      content: `A monthly retail sales time series over 2 years shows trend = constant and a strong yearly cycle. Sketch what such a series might look like (describe in words: how high the peak, what month it's in, etc.).`,
      solution: "A series oscillating around a constant value (say, mean = 100). Peak might be in December (e.g. 140 — 40% above mean), trough in February (e.g. 75 — 25% below mean). The same pattern repeats over the second year, virtually identical to year 1.",
    },
    {
      label: "b",
      marks: 3,
      content: `Explain what the seasonal indices would look like in this scenario and how you would compute them from 24 monthly observations.`,
      solution: "Seasonal indices for each of 12 months. With no trend, the SI for month X is simply (average of month X across both years) ÷ (overall average across all 24 observations). The 12 SIs sum to 12 (one per month). E.g. SI(Dec) might be 1.40, SI(Feb) might be 0.75. For forecasting month X in year 3: forecast = overall average × SI(X).",
    },
  ],
  "MEDIUM",
);

extResp(
  [
    {
      label: "a",
      marks: 3,
      content: `Describe the trend, seasonality, and any irregular features evident in the time series.\n\n${img(quarterlyIceCream)}`,
      solution: "**Trend**: increasing — Q2 peaks grow from 140 (yr 1) to 160 (yr 2) to 175 (yr 3), suggesting overall sales are growing each year.\n\n**Seasonality**: 4-quarter cycle. Within each year: Q1 low, Q2 peak, Q3 moderate-high, Q4 lowest. Pattern repeats across all three years.\n\n**Irregular**: minor variations around the trend × seasonal expectation; nothing exceptional.",
    },
    {
      label: "b",
      marks: 3,
      content: `Compute the average sales for each year and use these to estimate the year-on-year trend growth.`,
      solution: "Year 1: (80+140+120+60)/4 = 400/4 = **100**.\nYear 2: (90+160+130+70)/4 = 450/4 = **112.5**.\nYear 3: (100+175+145+80)/4 = 500/4 = **125**.\n\nYear-on-year growth: 100 → 112.5 → 125. Increase of \\$12,500/year. Approximately linear trend.",
    },
    {
      label: "c",
      marks: 3,
      content: `Estimate the seasonal index for Q2 using the data and your trend estimate.`,
      solution: "Average yearly trend ≈ 112.5 (or use year-2 mean as an estimate of overall trend).\n\nQ2 values: 140, 160, 175. Average of Q2 = (140+160+175)/3 = 158.33.\n\nSeasonal index Q2 = 158.33 / 112.5 ≈ **1.41** — Q2 sales are about 41% above the trend (yearly average) value.",
    },
    {
      label: "d",
      marks: 3,
      content: `Predict Q1 sales in year 4 assuming the trend continues linearly and the Q1 seasonal index = 0.74.`,
      solution: "Year-4 trend (extrapolated): 100, 112.5, 125, **137.5**.\n\nForecast Q1 yr 4 = trend × SI(Q1) = 137.5 × 0.74 = **101.75 → \\$101,750**.",
    },
  ],
  "MEDIUM",
  `**Question — Quarterly ice-cream sales**\n\nA business owner wants to use 3 years of quarterly ice-cream sales data to understand trend and seasonal patterns and to forecast next year's Q1 sales.`,
);

extResp(
  [
    {
      label: "a",
      marks: 2,
      content: `${img(monthlyRetail)}\n\nDescribe the trend in the retail sales time series.`,
      solution: "Clear **increasing linear trend**, rising from approximately 120 in month 1 to 280 in month 12. Increase of about \\$160,000 over 12 months ≈ \\$13–14 thousand per month.",
    },
    {
      label: "b",
      marks: 2,
      content: `Estimate the linear trend equation by fitting a line through the first and last data points.`,
      solution: "Two-point linear fit: $(1, 120)$ and $(12, 280)$.\n\nSlope = (280−120)/(12−1) = 160/11 ≈ 14.55.\nIntercept (at month 0): $y = 120 - 14.55 = 105.45$.\n\nEquation: $\\text{sales} = 105.45 + 14.55 \\times \\text{month}$.",
    },
    {
      label: "c",
      marks: 3,
      content: `Predict the sales in month 18.`,
      solution: "$\\text{sales}(18) = 105.45 + 14.55 \\times 18 = 105.45 + 261.9 = 367.35$ (\\$367,350).\n\n**Caveat**: this is an extrapolation beyond the data range — assumes the trend continues linearly, which may not hold (saturation, market changes).",
    },
    {
      label: "d",
      marks: 3,
      content: `If a seasonal index of 1.18 applies to December (month 12), recompute the forecast for December year 2 (month 24).`,
      solution: "Trend at month 24: $105.45 + 14.55 \\times 24 = 105.45 + 349.2 = 454.65$.\n\nDecember adjustment: $454.65 \\times 1.18 ≈ 536.5$ (\\$536,500).\n\nThe trend-only model would have under-predicted December because it ignores the seasonal lift.",
    },
    {
      label: "e",
      marks: 3,
      content: `Explain why combining a linear trend model with seasonal indices is generally more reliable than using only one of the two components.`,
      solution: "Trend captures the long-term direction (overall growth/decline). Seasonality captures the predictable within-year fluctuation. Using only a linear trend would forecast too low for peak periods and too high for trough periods, systematically biased. Using only seasonality (no trend) would assume the same average level every year, missing growth. **Combined: forecast = trend × SI** provides both the level (trend) and the periodic adjustment (SI), giving more accurate forecasts.",
    },
  ],
  "HARD",
  `**Question — Monthly retail sales**\n\nA retail manager wants to use the past 12 months of sales data to forecast next year's December sales.`,
);

extResp(
  [
    {
      label: "a",
      marks: 3,
      content: `Define a **time series** and list the four classical components of a time series decomposition.`,
      solution: "A **time series** is a sequence of observations of a variable taken at regular intervals over time (e.g. monthly sales, daily temperature, quarterly profits).\n\n**Four components**:\n1. **Trend (T)** — long-term direction (linear, curved, growth, decline).\n2. **Seasonality (S)** — regular, fixed-period within-cycle pattern.\n3. **Cyclical (C)** — irregular long-term wave (often multi-year, e.g. business cycles).\n4. **Irregular (I)** — random fluctuations not explained by the above.",
    },
    {
      label: "b",
      marks: 3,
      content: `For each of the following situations, identify which components would likely be present and why:\n\n(i) Monthly home gas usage in Victoria over 5 years.\n\n(ii) Daily stock-market index over 1 month.\n\n(iii) Quarterly tax receipts of an established business over 3 years.`,
      solution: "**(i) Home gas usage**: trend (slight, due to efficiency improvements) + strong seasonality (winter high, summer low) + small irregular.\n\n**(ii) Daily stock index over 1 month**: mostly irregular (random walk), possibly weak weekly cycle.\n\n**(iii) Quarterly tax receipts**: trend (business growth) + seasonal (Q4 typically higher due to year-end) + small irregular.",
    },
    {
      label: "c",
      marks: 4,
      content: `Explain the difference between **additive** and **multiplicative** decomposition of a time series. When would you use each?`,
      solution: "**Additive model**: $Y_t = T_t + S_t + I_t$. The seasonal effect is a fixed amount added (or subtracted) from the trend at each period. Use when the seasonal swing is **constant in magnitude** regardless of trend level (e.g. monthly temperature anomalies always ±5°C from the mean).\n\n**Multiplicative model**: $Y_t = T_t \\times S_t \\times I_t$. The seasonal effect is a percentage scaling of the trend. Use when the seasonal swing **grows with trend** (e.g. December sales are always 40% above average — the absolute lift grows as the average grows). This is more common for sales/business data.",
    },
    {
      label: "d",
      marks: 3,
      content: `A small business has trend $T_t = 50 + 4t$ (with $t$ in months) and quarterly seasonal indices SI = [0.85, 0.95, 1.10, 1.10] (Q1, Q2, Q3, Q4). Forecast the sales for month 14 (Q2 of year 2).`,
      solution: "Trend at month 14: $T_{14} = 50 + 4 \\times 14 = 50 + 56 = 106$.\n\nQ2 seasonal index: SI(Q2) = 0.95.\n\nForecast (multiplicative): $T \\times SI = 106 \\times 0.95 = 100.7$ — approximately **101** units.\n\n(Adjustment compared to trend alone: down 5%.)",
    },
  ],
  "HARD",
  `**Question — Time series components and decomposition**\n\nThis question probes the conceptual framework of time series analysis.`,
);

console.log(`Time series complete: ${items.length} items so far.`);

// ═══════════════════════════════════════════════════════════════════════
// SUBTOPIC: moving-average-smoothing (modelling-rich: 7+4+2+3 = 16)
// ═══════════════════════════════════════════════════════════════════════
CURRENT_SUBTOPIC = "moving-average-smoothing";

mcq(
  `A 3-period moving average for a time series at period $t$ is the average of values at periods\n\n`,
  ["$t-1, t, t+1$", "$t, t+1, t+2$", "$t-2, t-1, t$", "$t-3, t-2, t-1$"],
  "A",
  "EASY",
  "**Answer: A**\n\nThe 3-period (centred) MA at $t$ averages the value at $t$ together with the immediate predecessor and successor.",
);

mcq(
  `Which of the following statements about even-period moving averages (e.g. 4-MA, 6-MA) is correct?\n\n`,
  [
    "They can be plotted directly at the original observation times",
    "They require centring before being plotted at the original observation times",
    "They are not used for time series with seasonality",
    "They have the same period as odd-period MAs",
  ],
  "B",
  "MEDIUM",
  "**Answer: B**\n\nAn even-period MA falls between two observation times. To align with the original times, take the average of two consecutive even-period MAs (this is 'centring').",
);

mcq(
  `For a time series with strong seasonality of period $k$, the moving average that best removes seasonality is\n\n`,
  ["$k$-period MA", "$(k-1)$-period MA", "$(k+1)$-period MA", "$2k$-period MA"],
  "A",
  "MEDIUM",
  "**Answer: A**\n\nA MA over exactly one full cycle averages out the seasonal high and low contributions, leaving the trend. For quarterly data (k=4), a 4-MA does this.",
);

mcq(
  `A 5-period MA is being computed for a time series of 10 values. How many MA values can be plotted?\n\n`,
  ["10", "8", "6", "4"],
  "C",
  "MEDIUM",
  "**Answer: C**\n\nA 5-MA cannot be computed for the first 2 or last 2 periods (no full window). So 10 − 4 = **6** MA values.",
);

mcq(
  `The purpose of moving-average smoothing in a time series is primarily to\n\n`,
  [
    "remove the trend so seasonality is more visible",
    "amplify short-term irregular variation",
    "reveal the underlying trend by averaging out short-term and seasonal variation",
    "compute the long-run mean",
  ],
  "C",
  "EASY",
  "**Answer: C**\n\nMA smoothing dampens noise and seasonality, leaving the longer-term trend visible.",
);

mcq(
  `If a time series has values 10, 12, 11, 14, 15, 18, the 3-period MA centred at the third observation is\n\n`,
  ["10", "11", "12", "13"],
  "B",
  "EASY",
  "**Answer: B**\n\n3-MA at $t=3$ = (10 + 12 + 11) / 3 = 33/3 = **11**.",
);

mcq(
  `For monthly data, the 12-period MA gives values that are\n\n`,
  ["seasonally adjusted (deseasonalised)", "trend estimates", "annual totals", "irregular components only"],
  "B",
  "MEDIUM",
  "**Answer: B**\n\nA 12-MA on monthly data averages out the seasonal pattern, leaving a smoothed trend estimate.",
);

short(
  `For the time series values 5, 7, 6, 9, 8, 11, 10:\n\n**a.** Compute the 3-period MA for $t = 2, 3, 4, 5, 6$. (3 marks)\n\n**b.** State why the MA cannot be computed at $t = 1$ or $t = 7$. (1 mark) (4 marks)`,
  4,
  "EASY",
  "**a.** 3-MA values:\n- $t=2$: (5+7+6)/3 = 6.00\n- $t=3$: (7+6+9)/3 = 7.33\n- $t=4$: (6+9+8)/3 = 7.67\n- $t=5$: (9+8+11)/3 = 9.33\n- $t=6$: (8+11+10)/3 = 9.67\n\n**b.** The 3-MA requires one value on each side; $t=1$ has no $t=0$ and $t=7$ has no $t=8$ — incomplete windows.",
);

short(
  `Quarterly data: 100, 80, 120, 100, 110, 90, 130, 110.\n\n**a.** Compute the 4-period MA at $t = 2.5$. (1 mark)\n\n**b.** Compute the 4-period MA at $t = 3.5$. (1 mark)\n\n**c.** Compute the centred 4-MA at $t = 3$. (2 marks) (4 marks)`,
  4,
  "MEDIUM",
  "**a.** 4-MA at $t = 2.5$ = (100 + 80 + 120 + 100)/4 = 400/4 = **100**.\n\n**b.** 4-MA at $t = 3.5$ = (80 + 120 + 100 + 110)/4 = 410/4 = **102.5**.\n\n**c.** Centred 4-MA at $t = 3$ = average of the two: (100 + 102.5)/2 = **101.25**.",
);

short(
  `Time series of monthly sales: Jan 100, Feb 110, Mar 120, Apr 130, May 140, Jun 150, Jul 145.\n\n**a.** Compute the 3-period MA at March, April, May, June. (3 marks)\n\n**b.** Describe the trend evident from the smoothed series. (1 mark) (4 marks)`,
  4,
  "MEDIUM",
  "**a.**\n- Mar: (100+110+120)/3 = 110.00\n- Apr: (110+120+130)/3 = 120.00\n- May: (120+130+140)/3 = 130.00\n- Jun: (130+140+150)/3 = 140.00\n\n**b.** Smoothed values 110, 120, 130, 140 show a **clear linear increasing trend** of approximately 10 per month.",
);

short(
  `Quarterly data has values 50, 65, 70, 55, 55, 70, 75, 60. Use 4-MA centred smoothing to:\n\n**a.** Calculate the smoothed values at quarters 3 and 4. (2 marks)\n\n**b.** Comment on what these smoothed values reveal about the underlying trend. (1 mark) (3 marks)`,
  3,
  "MEDIUM",
  "**a.** 4-MA at $t=2.5$ = (50+65+70+55)/4 = 60. 4-MA at $t=3.5$ = (65+70+55+55)/4 = 61.25. 4-MA at $t=4.5$ = (70+55+55+70)/4 = 62.5. 4-MA at $t=5.5$ = (55+55+70+75)/4 = 63.75.\n\nCentred at $t=3$: (60 + 61.25)/2 = **60.625**.\nCentred at $t=4$: (61.25 + 62.5)/2 = **61.875**.\n\n**b.** Smoothed values 60.625 → 61.875 — slight increasing trend (~+1.25 per quarter), much subdued compared to the noisy raw data swings.",
);

extAns(
  [
    {
      label: "a",
      marks: 3,
      content: `Given values $v_1=85, v_2=92, v_3=88, v_4=96, v_5=90, v_6=98, v_7=94$ for a series, compute the 5-period MA values that can be plotted.`,
      solution: "5-MA can be computed for $t = 3, 4, 5$:\n- $t=3$: (85+92+88+96+90)/5 = 451/5 = **90.2**\n- $t=4$: (92+88+96+90+98)/5 = 464/5 = **92.8**\n- $t=5$: (88+96+90+98+94)/5 = 466/5 = **93.2**",
    },
    {
      label: "b",
      marks: 2,
      content: `Describe what these smoothed values reveal about the original series.`,
      solution: "The 5-MA smooths the up-down oscillation: from 90.2 → 92.8 → 93.2, the trend is **mild upward**, much less noisy than the raw values (which oscillate by ±5 between consecutive points).",
    },
  ],
  "MEDIUM",
);

extAns(
  [
    {
      label: "a",
      marks: 3,
      content: `A quarterly time series has values: 200, 180, 220, 240, 210, 190, 230, 250. Compute the centred 4-period MA values at $t = 3, 4, 5, 6$.`,
      solution: "4-MA at $t=2.5$ = (200+180+220+240)/4 = 210.\n4-MA at $t=3.5$ = (180+220+240+210)/4 = 212.5.\n4-MA at $t=4.5$ = (220+240+210+190)/4 = 215.\n4-MA at $t=5.5$ = (240+210+190+230)/4 = 217.5.\n4-MA at $t=6.5$ = (210+190+230+250)/4 = 220.\n\nCentred:\n- $t=3$: (210+212.5)/2 = **211.25**\n- $t=4$: (212.5+215)/2 = **213.75**\n- $t=5$: (215+217.5)/2 = **216.25**\n- $t=6$: (217.5+220)/2 = **218.75**",
    },
    {
      label: "b",
      marks: 2,
      content: `Comment on the trend implied by these smoothed values.`,
      solution: "The smoothed values 211.25, 213.75, 216.25, 218.75 increase by 2.5 each quarter — a steady **upward trend** of approximately +2.5 per quarter (~+10/year). The raw data was heavily seasonal; the centred 4-MA has effectively removed the seasonal swing.",
    },
  ],
  "MEDIUM",
);

extResp(
  [
    {
      label: "a",
      marks: 2,
      content: `A monthly time series gives: 50, 55, 70, 80, 65, 60, 72, 85, 90, 75, 70, 85. Compute the 3-period MA at months 2-11.`,
      solution: "Smoothed values (3-MA centred):\n- Month 2: (50+55+70)/3 = 58.33\n- Month 3: (55+70+80)/3 = 68.33\n- Month 4: (70+80+65)/3 = 71.67\n- Month 5: (80+65+60)/3 = 68.33\n- Month 6: (65+60+72)/3 = 65.67\n- Month 7: (60+72+85)/3 = 72.33\n- Month 8: (72+85+90)/3 = 82.33\n- Month 9: (85+90+75)/3 = 83.33\n- Month 10: (90+75+70)/3 = 78.33\n- Month 11: (75+70+85)/3 = 76.67",
    },
    {
      label: "b",
      marks: 3,
      content: `Describe how the 3-MA smoothing has changed the appearance of the data.`,
      solution: "The raw series has erratic jumps (e.g. 70→80→65) that obscure the trend. The 3-MA smoothes these out: 58.33, 68.33, 71.67, 68.33, 65.67, 72.33, 82.33, 83.33, 78.33, 76.67. The smoothed values still oscillate but with **smaller amplitude**, and an underlying **rising trend** through the middle of the series followed by a slight decline at the end is now visible.",
    },
    {
      label: "c",
      marks: 3,
      content: `Repeat the smoothing with a 5-period MA, computing values at months 3 through 10. Compare these with the 3-MA values from part (a).`,
      solution: "5-MA values:\n- Month 3: (50+55+70+80+65)/5 = 64\n- Month 4: (55+70+80+65+60)/5 = 66\n- Month 5: (70+80+65+60+72)/5 = 69.4\n- Month 6: (80+65+60+72+85)/5 = 72.4\n- Month 7: (65+60+72+85+90)/5 = 74.4\n- Month 8: (60+72+85+90+75)/5 = 76.4\n- Month 9: (72+85+90+75+70)/5 = 78.4\n- Month 10: (85+90+75+70+85)/5 = 81\n\nThe 5-MA smooths more aggressively — values change more gradually. The underlying upward trend (64 → 81 over 8 months ≈ +2.1/month) is clearer than in the 3-MA which still showed local peaks.",
    },
    {
      label: "d",
      marks: 4,
      content: `Discuss the trade-off between using a smaller MA window (e.g. 3-MA) and a larger MA window (e.g. 7-MA) in this context.`,
      solution: "**Smaller window (3-MA)**: Responds more quickly to genuine changes in the underlying signal, but retains more noise. Useful when the trend changes direction quickly.\n\n**Larger window (7-MA)**: Smooths heavily, revealing slow trends clearly. But it loses sensitivity to short-term genuine shifts and cannot be plotted for the first and last 3 observations (more lost values).\n\nFor this 12-month series, the 3-MA loses 2 values (start + end), the 5-MA loses 4. A 7-MA would lose 6 — half the data — leaving only 6 plottable points. The choice depends on how much short-term variability is real vs noise; here the 5-MA seems a reasonable compromise.",
    },
  ],
  "MEDIUM",
  `**Question — Sales data smoothing**\n\nA business analyses 12 months of sales to evaluate different smoothing strategies.`,
);

extResp(
  [
    {
      label: "a",
      marks: 3,
      content: `For quarterly data with values 110, 100, 115, 95, 105, 90, 110, 100, 115, 95 (period $t = 1, 2, \\ldots, 10$), explain why a 4-period MA is the appropriate smoothing choice and describe the centring procedure.`,
      solution: "The 4-period MA matches the seasonal period (quarterly data → 4 quarters per year). Averaging over one full cycle removes the seasonal swing, isolating the trend.\n\n**Centring**: a 4-MA falls between two observation times. Compute MA at $t = 2.5$ and $t = 3.5$; their average (the centred 4-MA at $t = 3$) is aligned with the original observation time.",
    },
    {
      label: "b",
      marks: 3,
      content: `Compute the centred 4-MA at $t = 3, 4, 5, 6, 7, 8$.`,
      solution: "First the 4-MAs at half-integer points:\n- $t=2.5$: (110+100+115+95)/4 = 105\n- $t=3.5$: (100+115+95+105)/4 = 103.75\n- $t=4.5$: (115+95+105+90)/4 = 101.25\n- $t=5.5$: (95+105+90+110)/4 = 100\n- $t=6.5$: (105+90+110+100)/4 = 101.25\n- $t=7.5$: (90+110+100+115)/4 = 103.75\n- $t=8.5$: (110+100+115+95)/4 = 105\n\nCentred 4-MAs:\n- $t=3$: (105+103.75)/2 = **104.375**\n- $t=4$: (103.75+101.25)/2 = **102.5**\n- $t=5$: (101.25+100)/2 = **100.625**\n- $t=6$: (100+101.25)/2 = **100.625**\n- $t=7$: (101.25+103.75)/2 = **102.5**\n- $t=8$: (103.75+105)/2 = **104.375**",
    },
    {
      label: "c",
      marks: 3,
      content: `Describe the trend evident in the centred 4-MA values.`,
      solution: "Smoothed values: 104.375, 102.5, 100.625, 100.625, 102.5, 104.375.\n\nClear **U-shape**: declining from 104.375 to ~100.625 around $t=5-6$, then rising back to 104.375. The underlying trend has a minimum around the middle of the series. The raw data had hidden this U because of the quarterly seasonal swing.",
    },
    {
      label: "d",
      marks: 3,
      content: `Compare the centred 4-MA approach (used here) with a simple 4-MA without centring. Why is the centring step important?`,
      solution: "**Simple 4-MA without centring**: gives values at half-integer points ($t = 2.5, 3.5, \\ldots$). These don't align with the original observation times.\n\n**Centred 4-MA**: averages two consecutive simple 4-MAs to land back on integer $t$. This makes the smoothed series directly comparable to the raw data — both at the same $t$ values — allowing straightforward residual analysis (raw − smoothed) for the seasonal component.\n\nWithout centring, plotting the smoothed series against the original would be visually misleading and arithmetic comparison would be hard.",
    },
  ],
  "HARD",
  `**Question — Quarterly trend smoothing**\n\nA company analyses 10 quarters of revenue and wants to remove seasonality to identify the underlying trend.`,
);

extResp(
  [
    {
      label: "a",
      marks: 2,
      content: `Explain the difference between a 3-period and a 5-period MA. Which would react more quickly to a sudden change in the trend?`,
      solution: "A 3-period MA averages 3 consecutive values; a 5-period MA averages 5. The 3-MA puts more weight on each point (1/3 vs 1/5) and so will reflect sudden changes more strongly. **3-MA reacts more quickly**; 5-MA gives a smoother, more lagged response.",
    },
    {
      label: "b",
      marks: 3,
      content: `For monthly data with a clear yearly cycle, would you use a 5-MA, 7-MA, 12-MA, or 13-MA? Justify.`,
      solution: "**12-MA** — the seasonal period is 12 months. A 12-MA exactly removes the yearly cycle, leaving only the trend. 5-MA or 7-MA leave residual seasonality. 13-MA over-smooths and is not aligned with the cycle.\n\n(Note: 12 is even, so centring is required to align with monthly observation times.)",
    },
    {
      label: "c",
      marks: 3,
      content: `Suppose the monthly data has values $y_1, y_2, \\ldots, y_{24}$. Describe how to compute the centred 12-MA at month 7.`,
      solution: "Compute 12-MA at $t = 6.5$: $(y_1 + y_2 + \\ldots + y_{12})/12$.\n\nCompute 12-MA at $t = 7.5$: $(y_2 + y_3 + \\ldots + y_{13})/12$.\n\nCentred 12-MA at $t = 7$ = average of the two: $[\\text{12-MA}(6.5) + \\text{12-MA}(7.5)]/2$.",
    },
    {
      label: "d",
      marks: 3,
      content: `What is the maximum number of centred 12-MA values that can be computed from 24 monthly observations?`,
      solution: "Centred 12-MA requires data from $t-6$ to $t+6$, i.e. 13 consecutive observations centred at $t$.\n\nWith 24 observations indexed 1 to 24, $t-6 \\geq 1 \\Rightarrow t \\geq 7$ and $t+6 \\leq 24 \\Rightarrow t \\leq 18$. So $t \\in \\{7, 8, \\ldots, 18\\}$ — **12 centred 12-MA values**.",
    },
    {
      label: "e",
      marks: 2,
      content: `Explain why the centred 12-MA series is shorter than the original 24-month series and why the lost values matter.`,
      solution: "We lose 6 values at each end because the 12-MA centred at $t$ needs 6 observations before and 6 after. With 24 months, we get 12 smoothed values (months 7-18).\n\n**Why it matters**: forecasting the current/most-recent period is impossible from centred MAs — by the time you're at the latest observation, you can't centre. This is a known limitation; alternatives include one-sided MAs or other smoothing methods (e.g. exponential smoothing).",
    },
  ],
  "MEDIUM",
  `**Question — Moving averages in context**\n\nThis question explores when and how to use various MA window sizes for time series with different characteristics.`,
);

console.log(`Moving averages complete: ${items.length} items so far.`);

// ═══════════════════════════════════════════════════════════════════════
// SUBTOPIC: seasonal-indices-and-deseasonalisation (modelling-rich: 7+4+2+3 = 16)
// ═══════════════════════════════════════════════════════════════════════
CURRENT_SUBTOPIC = "seasonal-indices-and-deseasonalisation";

mcq(
  `For a quarterly time series, the four seasonal indices must sum to\n\n`,
  ["1", "4", "12", "100"],
  "B",
  "EASY",
  "**Answer: B**\n\nThere are 4 quarters → 4 indices that sum to 4 (each averages to 1.0). Equivalently in percentage, they sum to 400% with average 100%.",
);

mcq(
  `If Q1 has a seasonal index of 0.75, this means Q1 sales are\n\n`,
  ["75% above average", "75% below average", "25% above average", "25% below average"],
  "D",
  "EASY",
  "**Answer: D**\n\nSI = 0.75 means Q1 is **25% below** the yearly average (1.0 = average).",
);

mcq(
  `If the trend value for a period is 200 and the seasonal index is 1.30, the forecasted (seasonalised) value is\n\n`,
  ["154", "200", "230", "260"],
  "D",
  "EASY",
  "**Answer: D**\n\nSeasonalised forecast = trend × SI = 200 × 1.30 = **260**.",
);

mcq(
  `To **deseasonalise** an observation, you should\n\n`,
  ["multiply by the seasonal index", "divide by the seasonal index", "subtract the seasonal index from the value", "add the seasonal index to the value"],
  "B",
  "EASY",
  "**Answer: B**\n\nDeseasonalised value = value ÷ SI (removing the seasonal effect to reveal the trend component).",
);

mcq(
  `If a Q2 sales value is 240 and the Q2 seasonal index is 1.20, the deseasonalised value is\n\n`,
  ["200", "212", "240", "288"],
  "A",
  "MEDIUM",
  "**Answer: A**\n\nDeseasonalised = 240 / 1.20 = **200**.",
);

mcq(
  `A monthly time series has 12 seasonal indices. If 11 of them sum to 11.4, the 12th index must be\n\n`,
  ["0.6", "1.0", "0.4", "12"],
  "A",
  "MEDIUM",
  "**Answer: A**\n\nAll 12 indices sum to 12. So the 12th = 12 − 11.4 = **0.6**.",
);

mcq(
  `Seasonal indices are typically computed by\n\n`,
  [
    "averaging the raw observation values for each period",
    "for each observation, computing observation ÷ trend (centred MA), then averaging across cycles per period",
    "subtracting the trend from each observation",
    "computing the residual of a regression",
  ],
  "B",
  "MEDIUM",
  "**Answer: B**\n\nThe standard method: for each period (e.g. Q1, Q2, Q3, Q4), compute the ratio of observed value to trend estimate (centred MA) at that point, then average those ratios across all years to get the seasonal index for that period.",
);

short(
  `A business has these monthly seasonal indices: Jan 0.8, Feb 0.7, Mar 0.9, ..., Dec 1.5 (the rest sum to 7.0). Suppose the trend for December 2025 is forecast to be \\$80,000.\n\n**a.** Confirm that the 12 monthly seasonal indices sum to 12 by computing the sum from the values given. (2 marks)\n\n**b.** Compute the forecast (seasonalised) sales for December 2025. (2 marks) (4 marks)`,
  4,
  "EASY",
  "**a.** Sum given: 0.8 + 0.7 + 0.9 + (sum of remaining 9, i.e. Apr-Nov) + 1.5 = ?\n\nThe problem states 'the rest' (i.e. excluding Jan, Feb, Mar, Dec) sum to 7.0. So those 8 months sum to 7.0. Total sum = 0.8 + 0.7 + 0.9 + 7.0 + 1.5 = **10.9**. \n\nThis does NOT sum to 12 ⇒ the seasonal indices as given are inconsistent. (A real answer would scale the indices: multiply each by 12/10.9 to renormalise.)\n\n**b.** Using SI(Dec) = 1.5 and trend \\$80,000: forecast = 80,000 × 1.5 = **\\$120,000**.",
);

short(
  `Quarterly sales data for two years: Y1 = (80, 130, 110, 90), Y2 = (90, 140, 120, 100).\n\n**a.** Compute the average for each quarter across the two years. (2 marks)\n\n**b.** Compute the overall mean of all 8 observations. (1 mark)\n\n**c.** Compute the seasonal index for each quarter. (2 marks) (5 marks)`,
  5,
  "MEDIUM",
  "**a.** Q1 avg = (80+90)/2 = 85. Q2 avg = (130+140)/2 = 135. Q3 avg = (110+120)/2 = 115. Q4 avg = (90+100)/2 = 95.\n\n**b.** Overall mean = (85+135+115+95)/4 = 430/4 = 107.5.\n\n**c.** SI(Q1) = 85/107.5 = 0.791. SI(Q2) = 135/107.5 = 1.256. SI(Q3) = 115/107.5 = 1.070. SI(Q4) = 95/107.5 = 0.884.\n\nCheck: 0.791 + 1.256 + 1.070 + 0.884 = 4.001 ≈ 4 ✓.",
);

short(
  `An observation in a time series is 156 with SI = 1.30.\n\n**a.** Compute the deseasonalised value. (2 marks)\n\n**b.** Interpret the deseasonalised value in plain English. (1 mark) (3 marks)`,
  3,
  "EASY",
  "**a.** Deseasonalised = 156 / 1.30 = **120**.\n\n**b.** The deseasonalised value (120) represents what the observation would have been if there were no seasonal effect — i.e. it is the underlying trend value, with the typical seasonal lift (30%) removed.",
);

short(
  `Monthly tourist arrivals have seasonal indices summing to 12 with SI(Aug) = 1.6 (peak), SI(Jan) = 0.4 (trough). A August observation is 28,800 arrivals.\n\n**a.** Compute the deseasonalised value. (1 mark)\n\n**b.** Suppose the trend for January 2026 is estimated at 18,000 arrivals. Forecast (seasonalise) the actual January 2026 arrivals. (2 marks)\n\n**c.** Interpret what the SI(Jan) = 0.4 tells us about the typical January. (1 mark) (4 marks)`,
  4,
  "MEDIUM",
  "**a.** 28,800 / 1.6 = **18,000** arrivals (trend value).\n\n**b.** Forecast Jan 2026 = 18,000 × 0.4 = **7,200** arrivals.\n\n**c.** SI(Jan) = 0.4 means January typically has only **40% of the annual average** monthly arrivals — i.e. 60% below trend. January is the trough.",
);

extAns(
  [
    {
      label: "a",
      marks: 3,
      content: `Quarterly sales (in \\$000s) over 3 years are: Year 1 = (100, 140, 130, 90), Year 2 = (110, 150, 140, 100), Year 3 = (120, 160, 150, 110). Compute the seasonal index for each quarter using the period-averages-vs-overall-mean method.`,
      solution: "Quarterly averages:\n- Q1: (100+110+120)/3 = 110\n- Q2: (140+150+160)/3 = 150\n- Q3: (130+140+150)/3 = 140\n- Q4: (90+100+110)/3 = 100\n\nOverall mean: (110+150+140+100)/4 = 500/4 = 125.\n\nSI(Q1) = 110/125 = 0.880.\nSI(Q2) = 150/125 = 1.200.\nSI(Q3) = 140/125 = 1.120.\nSI(Q4) = 100/125 = 0.800.\n\nCheck: sum = 0.88 + 1.20 + 1.12 + 0.80 = 4.00 ✓.",
    },
    {
      label: "b",
      marks: 2,
      content: `Forecast the Q2 value for Year 4 if the trend continues linearly (estimate trend for Year 4 first).`,
      solution: "Year-4 trend (extrapolating Year 1, 2, 3 averages 117.5 → 125 → 132.5, i.e. +7.5/year): Year-4 trend ≈ 140.\n\nForecast Q2 yr 4 = 140 × SI(Q2) = 140 × 1.20 = **168** (\\$168,000).",
    },
  ],
  "MEDIUM",
);

extAns(
  [
    {
      label: "a",
      marks: 2,
      content: `Monthly time series: deseasonalise the value 240 observed in May, given SI(May) = 1.20.`,
      solution: "Deseasonalised value = 240 / 1.20 = **200**.",
    },
    {
      label: "b",
      marks: 3,
      content: `The same business has monthly SI values: Jun 0.8, Jul 0.7, Aug 0.6, Sep 0.9, Oct 1.0, Nov 1.1, Dec 1.4 (and Jan-May, summing to 5.5). Find SI(Jan-May) sum constraint and verify total.`,
      solution: "Constraint: 12 monthly SIs must sum to 12. Given Jun-Dec sum: 0.8 + 0.7 + 0.6 + 0.9 + 1.0 + 1.1 + 1.4 = 6.5. So Jan-May sum = 12 − 6.5 = 5.5 ✓.\n\nThe stated sum of 5.5 is consistent — total is 5.5 + 6.5 = 12 ✓.",
    },
  ],
  "MEDIUM",
);

extResp(
  [
    {
      label: "a",
      marks: 3,
      content: `Calculate the seasonal indices for the following quarterly sales (in thousands): Y1 = (50, 70, 60, 40), Y2 = (60, 80, 70, 50), Y3 = (70, 90, 80, 60).`,
      solution: "Quarterly averages: Q1: (50+60+70)/3 = 60. Q2: (70+80+90)/3 = 80. Q3: (60+70+80)/3 = 70. Q4: (40+50+60)/3 = 50.\n\nOverall mean: (60+80+70+50)/4 = 65.\n\nSI(Q1) = 60/65 = 0.923. SI(Q2) = 80/65 = 1.231. SI(Q3) = 70/65 = 1.077. SI(Q4) = 50/65 = 0.769.\n\nCheck: sum = 0.923 + 1.231 + 1.077 + 0.769 = 4.000 ✓.",
    },
    {
      label: "b",
      marks: 3,
      content: `Deseasonalise the Year 2 quarterly observations using the SIs you computed.`,
      solution: "Year 2 raw = (60, 80, 70, 50). Deseasonalise:\n- Q1: 60 / 0.923 = 65.0\n- Q2: 80 / 1.231 = 65.0\n- Q3: 70 / 1.077 = 65.0\n- Q4: 50 / 0.769 = 65.0\n\nAll deseasonalised values are approximately **65** — confirming year-2 is roughly the overall mean. (Small rounding effects.)",
    },
    {
      label: "c",
      marks: 3,
      content: `Comment on what these deseasonalised values reveal about the trend across years 1, 2, and 3.`,
      solution: "Year 1 deseasonalised: each quarter ÷ SI gives approximately 54-55.\nYear 2 deseasonalised: approximately 65.\nYear 3 deseasonalised: approximately 75.\n\nClear **linear trend** of +10/year in the underlying trend. The seasonal indices have successfully separated the trend from the seasonal pattern, revealing a steady growth that was previously masked by the quarterly fluctuations.",
    },
    {
      label: "d",
      marks: 3,
      content: `Forecast Year 4 Q2 sales by combining a linear trend extrapolation with the seasonal index.`,
      solution: "Year-4 trend (linear): 55 → 65 → 75 → **85**.\n\nForecast Q2 yr 4 = trend × SI(Q2) = 85 × 1.231 = **104.6** (\\$104,600).",
    },
  ],
  "MEDIUM",
  `**Question — Seasonal indices for sales forecasting**\n\nA retailer with 3 years of quarterly sales data wants to use seasonal indices to understand the structure and forecast Year 4.`,
);

extResp(
  [
    {
      label: "a",
      marks: 3,
      content: `Define **seasonal index** for a time series period. Explain what a value of 1.0 means and what values above/below 1.0 indicate.`,
      solution: "**Seasonal index (SI)** for a period = the ratio of that period's average value to the overall mean across one complete cycle. It quantifies the relative seasonal effect for that period.\n\n- SI = 1.0: that period equals the average — no seasonal effect.\n- SI > 1.0: that period is above average (peak season).\n- SI < 1.0: that period is below average (trough season).\n\nE.g. SI(Dec) = 1.5 means December sales are typically 50% above the yearly average.",
    },
    {
      label: "b",
      marks: 3,
      content: `Why must the seasonal indices for a cycle sum to the number of periods (e.g. 4 for quarterly, 12 for monthly)?`,
      solution: "Each SI is the ratio (period mean / overall mean). The sum of period means over one cycle equals (number of periods) × overall mean. Dividing by overall mean: $\\sum SI = $ (number of periods).\n\nE.g. quarterly: $(Q1_{\\text{avg}} + Q2_{\\text{avg}} + Q3_{\\text{avg}} + Q4_{\\text{avg}}) / \\text{overall mean} = 4$.\n\nThis ensures the seasonal effect averages out to 1.0 (no net seasonal bias) over a full cycle.",
    },
    {
      label: "c",
      marks: 3,
      content: `Given SI(Q1) = 0.80, SI(Q2) = 1.30, SI(Q3) = 1.10, observation Q1 = 480, observation Q2 = 780, observation Q3 = 605: deseasonalise each.`,
      solution: "Deseasonalised:\n- Q1: 480 / 0.80 = **600**\n- Q2: 780 / 1.30 = **600**\n- Q3: 605 / 1.10 = **550**\n\nThe deseasonalised values reveal the underlying trend level (without seasonal effect): Q1 and Q2 are at trend level 600, Q3 dropped to 550.",
    },
    {
      label: "d",
      marks: 4,
      content: `Suppose a manager looks at raw Q1 sales of 480 and Q2 sales of 780 and concludes "Q2 sales are 62.5% higher than Q1, so the business is growing fast". Comment critically on this conclusion using your deseasonalised values.`,
      solution: "The manager's conclusion is **misleading**. The raw Q2 number is higher than Q1 mostly because of the **seasonal effect** (SI(Q2) = 1.30 vs SI(Q1) = 0.80 — Q2 is a peak season and Q1 is a low season).\n\nDeseasonalised, both Q1 and Q2 are at trend level 600. The underlying business has not grown at all between Q1 and Q2 — the apparent 62.5% increase is **entirely seasonal**.\n\nTo accurately judge growth, the manager should compare deseasonalised values, not raw observations. A Q2-this-year vs Q2-last-year comparison would also be valid (same season).",
    },
  ],
  "HARD",
  `**Question — Seasonal indices: definition and interpretation**\n\nThis question explores the concept of seasonal indices, their normalisation, deseasonalisation, and interpretation in business contexts.`,
);

extResp(
  [
    {
      label: "a",
      marks: 2,
      content: `A monthly time series has 11 of the 12 seasonal indices given as: Jan 0.6, Feb 0.7, Mar 0.8, Apr 0.9, May 1.0, Jun 1.1, Jul 1.2, Aug 1.3, Sep 1.4, Oct 1.2, Nov 1.0. Find the missing December SI.`,
      solution: "Sum of 11 given: 0.6 + 0.7 + 0.8 + 0.9 + 1.0 + 1.1 + 1.2 + 1.3 + 1.4 + 1.2 + 1.0 = 11.2.\n\nTotal sum must be 12 (one per month). So SI(Dec) = 12 − 11.2 = **0.8**.",
    },
    {
      label: "b",
      marks: 3,
      content: `Given trend = 100 + 5t (with $t$ = month number from start), forecast (seasonalised) sales for month 15 (March of year 2).`,
      solution: "Trend at $t = 15$: $100 + 5 \\times 15 = 175$.\n\nMonth 15 is March of year 2 → SI(Mar) = 0.8.\n\nForecast = trend × SI = 175 × 0.8 = **140**.",
    },
    {
      label: "c",
      marks: 3,
      content: `In month 9 (September of year 1), the actual sales were 200. Deseasonalise and compare to the trend at that point.`,
      solution: "SI(Sep) = 1.4.\n\nDeseasonalised value: 200 / 1.4 = 142.86.\n\nTrend at $t = 9$: $100 + 5 \\times 9 = 145$.\n\nDeseasonalised value (142.86) is **slightly below trend** (145) by about 2.14 — small irregular fluctuation. The observed value of 200 was high mainly because September is a high-seasonal month.",
    },
    {
      label: "d",
      marks: 3,
      content: `Identify which months are peak vs trough seasons in this business, with justification using the seasonal indices.`,
      solution: "**Peak**: Sep (SI=1.4), Aug (SI=1.3), Jul (SI=1.2), Oct (SI=1.2) — months with SI well above 1.0 (sales > 20% above trend).\n\n**Trough**: Jan (SI=0.6), Feb (SI=0.7), Mar (SI=0.8), Dec (SI=0.8) — months with SI well below 1.0.\n\nThe peak season is **August-October** (likely back-to-school or autumn promotional period). The trough season is **December-March** (winter slowdown). The pattern suggests this might be a back-to-school retail business or similar autumn-peak product line.",
    },
  ],
  "MEDIUM",
  `**Question — Monthly seasonal indices and forecasting**\n\nA business has 11 of 12 monthly seasonal indices and wants to use them with a linear trend to forecast and interpret sales.`,
);

console.log(`Seasonal indices complete: ${items.length} items so far.`);

// ─── Write output ──────────────────────────────────────────────────────

const spec = {
  subject_slug: SUBJECT_SLUG,
  question_set_id: QUESTION_SET_ID,
  items,
};

const outPath = path.join(OUT_DIR, "qset-general-bivariate-timeseries.json");
fs.writeFileSync(outPath, JSON.stringify(spec, null, 2));
console.log(`\n✓ Wrote ${items.length} items to ${outPath}`);
console.log(`  MCQ:               ${items.filter((i) => i.type === "MCQ").length}`);
console.log(`  SHORT:             ${items.filter((i) => i.type === "SHORT_ANSWER").length}`);
console.log(`  EXTENDED_ANSWER:   ${items.filter((i) => i.type === "EXTENDED_ANSWER").length}`);
console.log(`  EXTENDED_RESPONSE: ${items.filter((i) => i.type === "EXTENDED_RESPONSE").length}`);


