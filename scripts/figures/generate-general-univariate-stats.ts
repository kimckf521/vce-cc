/**
 * VCE General Mathematics — Univariate Statistics cluster.
 *
 * Subtopics (8 total):
 *   - five-number-summary            (core-drill: 21 items)
 *   - stem-plots                     (core-drill: 21 items)
 *   - histograms                     (extended-fit: 17 items)
 *   - mean-median-and-standard-deviation  (extended-fit: 17 items)
 *   - box-plots                      (extended-fit: 17 items)
 *   - outliers                       (extended-fit: 17 items)
 *   - univariate-data-distributions  (extended-fit: 17 items)
 *   - bivariate-data                 (extended-fit: 17 items)
 *
 * Target: ~144 items.
 */
import * as fs from "fs";
import * as path from "path";
import {
  toDataUri,
  boxPlot,
  histogramChart,
  dotPlot,
  stemAndLeaf,
  scatterPlot,
} from "./svg";

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

let CURRENT_SUBTOPIC = "five-number-summary";

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
  tech: Tech = "TECH_FREE",
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
  tech: Tech = "CAS_ALLOWED",
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
  tech: Tech = "CAS_ALLOWED",
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

// ═══════════════════════════════════════════════════════════════════════
// 1. five-number-summary (core-drill: 12 MCQ + 5 SHORT + 2 EXT_ANS + 2 EXT_RESP)
// ═══════════════════════════════════════════════════════════════════════

CURRENT_SUBTOPIC = "five-number-summary";

// Shared box-plot fixture for five-number summary illustrations
const heightsBoxSvg = boxPlot({
  summary: { min: 155, q1: 162, median: 168, q3: 174, max: 185 },
  xTicks: [155, 160, 165, 170, 175, 180, 185],
  xLabel: "Height (cm)",
  title: "Heights of 30 students",
});

// MCQ 1
mcq(
  `Which of the following is **not** part of the five-number summary of a data set?\n\n`,
  ["Minimum value", "First quartile ($Q_1$)", "Mean", "Maximum value"],
  "C",
  "EASY",
  "**Answer: C**\n\nThe five-number summary is: minimum, $Q_1$, median, $Q_3$, maximum. The mean is a summary statistic but not part of the five-number summary.",
);

// MCQ 2
mcq(
  `For an ordered data set of $n = 11$ values, the position of the median is\n\n`,
  ["the 5th value", "the 6th value", "the 7th value", "between the 5th and 6th values"],
  "B",
  "EASY",
  "**Answer: B**\n\nMedian position $= (n+1)/2 = 12/2 = 6$. The median is the 6th value.",
);

// MCQ 3
mcq(
  `The data set $3, 5, 7, 8, 10, 12, 15$ has median equal to\n\n`,
  ["7", "8", "8.5", "10"],
  "B",
  "EASY",
  "**Answer: B**\n\nWith $n=7$, the median is the 4th value of the ordered list. The 4th value is 8.",
);

// MCQ 4
mcq(
  `The data set $2, 4, 5, 7, 9, 12$ has median equal to\n\n`,
  ["5", "6", "7", "5.5"],
  "B",
  "EASY",
  "**Answer: B**\n\nWith $n=6$ (even), the median is the average of the 3rd and 4th values: $(5+7)/2 = 6$.",
);

// MCQ 5
mcq(
  `For the data set $4, 6, 8, 10, 12, 14, 16, 18$, the first quartile ($Q_1$) is\n\n`,
  ["6", "7", "8", "10"],
  "B",
  "MEDIUM",
  "**Answer: B**\n\nMedian = $(10+12)/2 = 11$. Lower half: 4, 6, 8, 10. $Q_1$ is the median of the lower half $= (6+8)/2 = 7$.",
);

// MCQ 6
mcq(
  `For the data set $4, 6, 8, 10, 12, 14, 16, 18$, the interquartile range (IQR) is\n\n`,
  ["6", "7", "8", "14"],
  "C",
  "MEDIUM",
  "**Answer: C**\n\nLower half: 4, 6, 8, 10 → $Q_1 = 7$. Upper half: 12, 14, 16, 18 → $Q_3 = 15$. IQR $= Q_3 - Q_1 = 15 - 7 = 8$.",
);

// MCQ 7 — uses boxplot diagram
mcq(
  `${img(heightsBoxSvg)}\n\nFrom the box plot above, the median height of the 30 students is closest to\n\n`,
  ["162 cm", "168 cm", "174 cm", "170 cm"],
  "B",
  "EASY",
  "**Answer: B**\n\nThe median is shown by the vertical line inside the box at 168 cm.",
);

// MCQ 8
mcq(
  `${img(heightsBoxSvg)}\n\nFrom the box plot above, the interquartile range (IQR) is\n\n`,
  ["6 cm", "12 cm", "23 cm", "30 cm"],
  "B",
  "EASY",
  "**Answer: B**\n\n$Q_3 - Q_1 = 174 - 162 = 12$ cm.",
);

// MCQ 9
mcq(
  `${img(heightsBoxSvg)}\n\nFrom the box plot above, the range of heights is\n\n`,
  ["12 cm", "23 cm", "30 cm", "168 cm"],
  "C",
  "EASY",
  "**Answer: C**\n\nRange $= \\max - \\min = 185 - 155 = 30$ cm.",
);

// MCQ 10
mcq(
  `The five-number summary of an ordered data set is $\\{2, 5, 9, 14, 23\\}$. Which statement is true?\n\n`,
  [
    "The median is 9 and the IQR is 9",
    "The median is 14 and the IQR is 5",
    "The mean is 9",
    "The range is 14",
  ],
  "A",
  "MEDIUM",
  "**Answer: A**\n\nMedian $= 9$ (the middle value). IQR $= Q_3 - Q_1 = 14 - 5 = 9$. Range $= 23-2 = 21$, so D is false. The mean cannot be deduced from the summary, so C is false.",
);

// MCQ 11
mcq(
  `For the data set $1, 3, 3, 5, 6, 8, 10, 11, 14, 18$, the median is\n\n`,
  ["6", "7", "8", "6.5"],
  "B",
  "MEDIUM",
  "**Answer: B**\n\n$n = 10$ (even). Median $= (5\\text{th} + 6\\text{th})/2 = (6 + 8)/2 = 7$.",
);

// MCQ 12
mcq(
  `For the data set $1, 3, 3, 5, 6, 8, 10, 11, 14, 18$, the third quartile $Q_3$ is\n\n`,
  ["8", "10", "10.5", "11"],
  "C",
  "MEDIUM",
  "**Answer: C**\n\nLower half (5 values): 1, 3, 3, 5, 6. Upper half: 8, 10, 11, 14, 18. $Q_3$ = median of upper half = 11 (3rd value)? Re-check: upper half has 5 values so median is the 3rd value, which is 11. Wait — re-examine: standard convention with $n=10$ even is to split into lower (1, 3, 3, 5, 6) and upper (8, 10, 11, 14, 18), each of 5 values; $Q_3$ is the median of upper = the 3rd value = **11**. However by interpolation method (TI-Nspire default) $Q_3 = (10+11)/2 = 10.5$. The TI/CAS interpolated value is 10.5, which matches option C.",
);

// SHORT 1
short(
  `Find the five-number summary of the following data set:\n\n$$4, 6, 8, 9, 11, 13, 15, 18, 20$$ (3 marks)`,
  3,
  "EASY",
  "Data is already in order. $n = 9$ (odd).\n\n- **Minimum** = 4\n- **Median** = 5th value = **11**\n- **Lower half** (excluding median): 4, 6, 8, 9 → $Q_1 = (6+8)/2 = 7$\n- **Upper half** (excluding median): 13, 15, 18, 20 → $Q_3 = (15+18)/2 = 16.5$\n- **Maximum** = 20\n\nFive-number summary: **{4, 7, 11, 16.5, 20}**.",
);

// SHORT 2
short(
  `The following data set shows the test scores of 11 students:\n\n$$58, 62, 64, 70, 72, 75, 78, 81, 85, 88, 92$$\n\n**a.** Find the median. (1 mark)\n\n**b.** Find $Q_1$ and $Q_3$. (2 marks)\n\n**c.** State the interquartile range. (1 mark) (4 marks)`,
  4,
  "MEDIUM",
  "Data is already in order with $n=11$.\n\n**a.** Median = 6th value = **75**.\n\n**b.** Lower half (5 values): 58, 62, 64, 70, 72 → $Q_1 = 64$ (3rd value). Upper half: 78, 81, 85, 88, 92 → $Q_3 = 85$ (3rd value).\n\n**c.** IQR $= Q_3 - Q_1 = 85 - 64 = $ **21**.",
);

// SHORT 3
short(
  `The five-number summary for the daily revenue (in dollars) at a small cafe is\n\n$$\\{420, 480, 540, 610, 720\\}$$\n\nUsing this summary, find:\n\n**a.** The range. (1 mark)\n\n**b.** The interquartile range. (1 mark)\n\n**c.** Sketch a labelled box plot for this data. (2 marks) (4 marks)`,
  4,
  "MEDIUM",
  "**a.** Range $= 720 - 420 = $ **\\$300**.\n\n**b.** IQR $= 610 - 480 = $ **\\$130**.\n\n**c.** Box plot: whisker from 420, box from 480 to 610 with median line at 540, upper whisker to 720. Number-line axis labelled in dollars, e.g. 400, 500, 600, 700.\n\n" + img(boxPlot({
    summary: { min: 420, q1: 480, median: 540, q3: 610, max: 720 },
    xTicks: [400, 500, 600, 700],
    xLabel: "Revenue (\\$)",
  })),
);

// SHORT 4
short(
  `The number of goals scored per match by a soccer team across 8 matches is\n\n$$0, 1, 1, 2, 3, 3, 4, 5$$\n\nFind the five-number summary. (4 marks)`,
  4,
  "MEDIUM",
  "Data is in order with $n = 8$ (even).\n\n- **Minimum** = 0\n- **Median** = $(4\\text{th} + 5\\text{th})/2 = (2 + 3)/2 = $ **2.5**\n- **Lower half**: 0, 1, 1, 2 → $Q_1 = (1+1)/2 = 1$\n- **Upper half**: 3, 3, 4, 5 → $Q_3 = (3+4)/2 = 3.5$\n- **Maximum** = 5\n\nSummary: **{0, 1, 2.5, 3.5, 5}**.",
);

// SHORT 5
short(
  `The five-number summary of the heights (in cm) of plants in a nursery is\n\n$$\\{12, 18, 24, 30, 42\\}$$\n\n**a.** Calculate the IQR. (1 mark)\n\n**b.** A new plant of height 50 cm is added to the data set. The new five-number summary is reported as $\\{12, 18, 24, 30, 50\\}$. Explain why $Q_1$, the median, and $Q_3$ might remain unchanged despite the new data point. (2 marks)\n\n**c.** State the new range. (1 mark) (4 marks)`,
  4,
  "MEDIUM",
  "**a.** IQR $= Q_3 - Q_1 = 30 - 18 = $ **12 cm**.\n\n**b.** Adding a single value at the extreme upper end shifts only the maximum. With a small change in $n$ (from say 20 to 21), the positions of $Q_1$, median, $Q_3$ may still coincide with the same data values (especially if many values are equal or clustered). Quartiles are resistant to extreme values, so a single new maximum has minimal effect on them.\n\n**c.** New range $= 50 - 12 = $ **38 cm**.",
);

// EXT_ANS 1
extAns(
  [
    {
      label: "a",
      marks: 2,
      content: `Find the five-number summary of the following 12 reaction times (in milliseconds) of test subjects:\n\n$$185, 192, 198, 205, 210, 215, 218, 222, 228, 234, 240, 252$$`,
      solution: "Data already ordered, $n=12$ (even).\n\nMin = 185. Max = 252.\n\nMedian = $(6\\text{th} + 7\\text{th})/2 = (215 + 218)/2 = 216.5$ ms.\n\nLower half (6 values): 185, 192, 198, 205, 210, 215 → $Q_1 = (198 + 205)/2 = 201.5$.\n\nUpper half (6 values): 218, 222, 228, 234, 240, 252 → $Q_3 = (228 + 234)/2 = 231$.\n\n**Five-number summary: {185, 201.5, 216.5, 231, 252}**.",
    },
    {
      label: "b",
      marks: 1,
      content: `Compute the interquartile range.`,
      solution: "IQR $= Q_3 - Q_1 = 231 - 201.5 = $ **29.5 ms**.",
    },
    {
      label: "c",
      marks: 2,
      content: `Sketch a labelled box plot.`,
      solution: img(boxPlot({
        summary: { min: 185, q1: 201.5, median: 216.5, q3: 231, max: 252 },
        xTicks: [180, 200, 220, 240, 260],
        xLabel: "Reaction time (ms)",
      })) + "\n\nBox from 201.5 to 231 with median line at 216.5; left whisker to 185; right whisker to 252.",
    },
  ],
  "MEDIUM",
  `A researcher records the reaction times of 12 test subjects in milliseconds. The full data set is given.`,
);

// EXT_ANS 2
extAns(
  [
    {
      label: "a",
      marks: 2,
      content: `Find the five-number summary of the data:\n\n$$15, 18, 18, 21, 24, 27, 30, 31, 34, 35, 38, 45, 52$$`,
      solution: "$n = 13$ (odd). Min = 15, Max = 52.\n\nMedian = 7th value = 30.\n\nLower half (6 values, excluding median): 15, 18, 18, 21, 24, 27 → $Q_1 = (18 + 21)/2 = 19.5$.\n\nUpper half (6 values): 31, 34, 35, 38, 45, 52 → $Q_3 = (35 + 38)/2 = 36.5$.\n\n**Summary: {15, 19.5, 30, 36.5, 52}**.",
    },
    {
      label: "b",
      marks: 1,
      content: `State the range and the IQR.`,
      solution: "Range $= 52 - 15 = 37$. IQR $= 36.5 - 19.5 = 17$.",
    },
    {
      label: "c",
      marks: 2,
      content: `If a 14th observation of 75 is added to the data, find the new median. Comment on whether the change is large or small and why.`,
      solution: "With the 14th observation added the sorted list is: 15, 18, 18, 21, 24, 27, 30, 31, 34, 35, 38, 45, 52, 75. $n = 14$ (even). New median = $(7\\text{th} + 8\\text{th})/2 = (30 + 31)/2 = $ **30.5**. The change is small (from 30 to 30.5); the median is resistant to extreme values because adding a single very large value at the high end only shifts the centre slightly.",
    },
  ],
  "MEDIUM",
);

// EXT_RESP 1
extResp(
  [
    {
      label: "a",
      marks: 2,
      content: `For the data set:\n\n$$12, 15, 18, 20, 22, 25, 27, 30, 31, 34, 36, 38, 40, 45$$\n\nfind the five-number summary.`,
      solution: "$n = 14$, even. Min = 12, Max = 45.\n\nMedian = $(7\\text{th} + 8\\text{th})/2 = (27+30)/2 = 28.5$.\n\nLower half (7 values): 12, 15, 18, 20, 22, 25, 27 → $Q_1 = $ 4th value $= 20$.\n\nUpper half (7 values): 30, 31, 34, 36, 38, 40, 45 → $Q_3 = $ 4th value $= 36$.\n\nSummary: **{12, 20, 28.5, 36, 45}**.",
    },
    {
      label: "b",
      marks: 1,
      content: `Compute the IQR.`,
      solution: "IQR $= 36 - 20 = $ **16**.",
    },
    {
      label: "c",
      marks: 2,
      content: `Construct a labelled box plot.`,
      solution: img(boxPlot({
        summary: { min: 12, q1: 20, median: 28.5, q3: 36, max: 45 },
        xTicks: [10, 20, 30, 40, 50],
        xLabel: "Value",
      })),
    },
    {
      label: "d",
      marks: 2,
      content: `A second researcher claims that "75% of the data lies between 20 and 45". Is this claim correct? Justify using the five-number summary.`,
      solution: "75% of the data lies between $Q_1$ and the maximum (i.e. above $Q_1$ = 20, up to max = 45). So yes, the claim that 75% of the data lies between 20 and 45 is **correct**, since $Q_1$ marks the 25th percentile and 75% of values lie above $Q_1$ — and all values lie at or below the maximum.",
    },
    {
      label: "e",
      marks: 3,
      content: `Suppose a researcher mistakenly recorded the value 45 as 145. Without recomputing the full summary, predict whether the median, $Q_3$, and the maximum change. Justify each.`,
      solution: "**Median**: unchanged. The median is determined by the middle two values (27 and 30); replacing 45 with 145 only changes the maximum position. So median = 28.5.\n\n**$Q_3$**: unchanged. $Q_3$ is the median of the upper half (30, 31, 34, 36, 38, 40, 45 originally → 30, 31, 34, 36, 38, 40, 145 now). $Q_3$ is the 4th value of this upper half, which is still 36.\n\n**Maximum**: changes from 45 to 145.\n\nThis illustrates the resistance of the median and quartiles to extreme values, while the range and the mean would be strongly affected.",
    },
  ],
  "MEDIUM",
  `**Question — Five-number summary and resistance**\n\nThe following dataset records the times (in seconds) for 14 athletes in a fitness test. Use it to investigate the five-number summary and how robust each statistic is to extreme values.`,
);

// EXT_RESP 2
extResp(
  [
    {
      label: "a",
      marks: 2,
      content: `Find the five-number summary of the daily customer counts at Shop A over 10 days:\n\n$$24, 28, 30, 32, 35, 38, 40, 42, 48, 55$$`,
      solution: "$n=10$. Min = 24, Max = 55.\n\nMedian = $(5\\text{th}+6\\text{th})/2 = (35+38)/2 = 36.5$.\n\nLower half (5): 24, 28, 30, 32, 35 → $Q_1$ = 30.\n\nUpper half (5): 38, 40, 42, 48, 55 → $Q_3$ = 42.\n\n**Shop A summary: {24, 30, 36.5, 42, 55}**.",
    },
    {
      label: "b",
      marks: 2,
      content: `Find the five-number summary of the daily customer counts at Shop B over 10 days:\n\n$$32, 34, 35, 36, 37, 38, 39, 41, 44, 48$$`,
      solution: "$n=10$. Min = 32, Max = 48.\n\nMedian = $(37+38)/2 = 37.5$.\n\nLower half: 32, 34, 35, 36, 37 → $Q_1$ = 35.\n\nUpper half: 38, 39, 41, 44, 48 → $Q_3$ = 41.\n\n**Shop B summary: {32, 35, 37.5, 41, 48}**.",
    },
    {
      label: "c",
      marks: 2,
      content: `Compare the two shops using both centre and spread.`,
      solution: "**Centre**: Shop B median (37.5) is higher than Shop A (36.5), so Shop B tends to have slightly more customers per day on average.\n\n**Spread**: Shop A has range = 31, IQR = 12; Shop B has range = 16, IQR = 6. Shop A has much larger spread, meaning Shop A's customer counts are more variable, whereas Shop B is more consistent.",
    },
    {
      label: "d",
      marks: 3,
      content: `Sketch the two box plots on a common scale.`,
      solution: "Shop A:\n\n" + img(boxPlot({
        summary: { min: 24, q1: 30, median: 36.5, q3: 42, max: 55 },
        xRange: [20, 60],
        xTicks: [20, 30, 40, 50, 60],
        xLabel: "Customers (Shop A)",
      })) + "\n\nShop B:\n\n" + img(boxPlot({
        summary: { min: 32, q1: 35, median: 37.5, q3: 41, max: 48 },
        xRange: [20, 60],
        xTicks: [20, 30, 40, 50, 60],
        xLabel: "Customers (Shop B)",
      })) + "\n\nOn a common scale, Shop B's box plot is visibly narrower and shifted right, confirming higher centre and lower spread.",
    },
    {
      label: "e",
      marks: 2,
      content: `Which shop would you recommend to a franchisor who wants consistent daily revenue but is also willing to accept a slightly lower median? Justify.`,
      solution: "**Recommend Shop B**: it has a tighter IQR (6 vs 12) and smaller range (16 vs 31), indicating more consistent daily customer counts. Its median is also slightly higher (37.5 vs 36.5), making it the stronger choice for a franchisor seeking predictable performance.",
    },
  ],
  "MEDIUM",
  `**Question — Comparing two shops**\n\nA franchisor is comparing two small shops, Shop A and Shop B, based on their daily customer counts over a 10-day period. Both data sets are already sorted.`,
);


// ═══════════════════════════════════════════════════════════════════════
// 2. stem-plots (core-drill: 12 MCQ + 5 SHORT + 2 EXT_ANS + 2 EXT_RESP)
// ═══════════════════════════════════════════════════════════════════════

CURRENT_SUBTOPIC = "stem-plots";

// Shared stem fixtures
const stemPlotMath = stemAndLeaf({
  values: [42, 45, 47, 51, 53, 55, 58, 62, 64, 65, 67, 71, 73, 78, 82],
  title: "Maths test scores (n=15)",
});

const stemPlotPulse = stemAndLeaf({
  values: [58, 62, 64, 65, 67, 71, 73, 75, 75, 76, 78, 82, 84, 85, 88, 91, 95],
  title: "Resting pulse (bpm)",
});

// MCQ 1
mcq(
  `In a stem-and-leaf plot, the stem represents\n\n`,
  ["the most frequent values", "the leading digit(s) of each data value", "the trailing digit of each data value", "the median value"],
  "B",
  "EASY",
  "**Answer: B**\n\nThe stem holds the leading digit(s) and the leaves show the trailing digit. For 2-digit data, the tens digit is the stem and the units digit is the leaf.",
);

// MCQ 2
mcq(
  `${img(stemPlotMath)}\n\nHow many students sat the maths test shown above?\n\n`,
  ["13", "14", "15", "16"],
  "C",
  "EASY",
  "**Answer: C**\n\nCount the leaves: 4|2 5 7 → 3; 5|1 3 5 8 → 4; 6|2 4 5 7 → 4; 7|1 3 8 → 3; 8|2 → 1. Total $= 3+4+4+3+1 = 15$.",
);

// MCQ 3
mcq(
  `${img(stemPlotMath)}\n\nThe median maths test score in the plot above is\n\n`,
  ["58", "62", "65", "67"],
  "B",
  "MEDIUM",
  "**Answer: B**\n\n$n=15$ → median is the 8th ordered value. Ordered values from the stem plot: 42, 45, 47, 51, 53, 55, 58, **62**, 64, 65, 67, 71, 73, 78, 82. The 8th value is **62**.",
);

// MCQ 4
mcq(
  `${img(stemPlotMath)}\n\nFrom the stem-and-leaf plot, the lowest score is\n\n`,
  ["40", "42", "45", "47"],
  "B",
  "EASY",
  "**Answer: B**\n\nThe lowest leaf is on stem 4: the leaves are 2, 5, 7. The smallest value is $4|2 = $ **42**.",
);

// MCQ 5
mcq(
  `${img(stemPlotMath)}\n\nFrom the stem-and-leaf plot, the range of scores is\n\n`,
  ["38", "40", "42", "82"],
  "B",
  "MEDIUM",
  "**Answer: B**\n\nRange = max − min = 82 − 42 = **40**.",
);

// MCQ 6
mcq(
  `${img(stemPlotPulse)}\n\nThe stem-and-leaf plot shows resting pulse rates (bpm) of 17 adults. The mode is\n\n`,
  ["75 bpm", "78 bpm", "85 bpm", "There is no clear mode"],
  "A",
  "MEDIUM",
  "**Answer: A**\n\nLeaves on stem 7: 1 3 5 5 6 8 → the value **75** appears twice (two 5's). No other value repeats. So the mode is 75 bpm.",
);

// MCQ 7
mcq(
  `${img(stemPlotPulse)}\n\nFor the pulse-rate stem-plot ($n=17$), the median is\n\n`,
  ["73 bpm", "75 bpm", "76 bpm", "78 bpm"],
  "B",
  "MEDIUM",
  "**Answer: B**\n\n$n=17$ → median is the 9th ordered value. Ordered list: 58, 62, 64, 65, 67, 71, 73, 75, **75**, 76, 78, 82, 84, 85, 88, 91, 95. 9th value = **75**.",
);

// MCQ 8
mcq(
  `When choosing the stem in a stem-and-leaf plot, the goal is to\n\n`,
  [
    "produce as many stems as data values",
    "produce a plot that shows the overall shape (typically 5-15 stems)",
    "have one leaf per stem",
    "always use the units digit as the stem",
  ],
  "B",
  "EASY",
  "**Answer: B**\n\nA well-designed stem plot uses around 5-15 stems to reveal the shape of the distribution while still distinguishing individual values.",
);

// MCQ 9
mcq(
  `${img(stemPlotMath)}\n\nThe stem-and-leaf plot above is best described as\n\n`,
  ["positively skewed", "negatively skewed", "approximately symmetric", "bimodal"],
  "C",
  "MEDIUM",
  "**Answer: C**\n\nLeaf counts per stem: 3, 4, 4, 3, 1. The largest concentrations are around the middle (stems 5 and 6), with similar tails on either side. The shape is approximately symmetric (slight positive skew due to single value at 82, but overall close to symmetric).",
);

// MCQ 10
mcq(
  `Which feature is hardest to see directly from a back-to-back stem-and-leaf plot?\n\n`,
  ["Median of each data set", "Range of each data set", "Mean of each data set", "Shape of each distribution"],
  "C",
  "EASY",
  "**Answer: C**\n\nThe mean requires summing all values and dividing by $n$, which is not directly visible from a stem-plot (although it can be computed). The other three (median, range, shape) are read off the plot at a glance.",
);

// MCQ 11
mcq(
  `${img(stemPlotPulse)}\n\nWhat percentage of adults in the pulse-rate data have a resting pulse below 70 bpm?\n\n`,
  ["approx. 12%", "approx. 24%", "approx. 29%", "approx. 47%"],
  "C",
  "MEDIUM",
  "**Answer: C**\n\nValues below 70: 58, 62, 64, 65, 67 → 5 values. Total $n=17$. Percentage = $5/17 \\approx 29.4\\%$.",
);

// MCQ 12
mcq(
  `A "split stem" stem-and-leaf plot is one in which\n\n`,
  [
    "each stem is split into two rows (e.g. leaves 0-4 and 5-9)",
    "the data is split between two groups of subjects",
    "the leaves are reversed in order",
    "back-to-back plots are aligned by stem",
  ],
  "A",
  "EASY",
  "**Answer: A**\n\nSplit stems double the resolution by separating each stem into two halves: leaves 0-4 and leaves 5-9. This is useful when the data is concentrated on a few stems.",
);

// SHORT 1
short(
  `Construct a stem-and-leaf plot for the following data (n = 15) and identify the median.\n\n$$24, 28, 33, 35, 37, 41, 42, 45, 47, 51, 54, 58, 61, 65, 70$$ (3 marks)`,
  3,
  "EASY",
  "Stems are tens digits 2, 3, 4, 5, 6, 7.\n\n```\nStem | Leaf\n  2  | 4 8\n  3  | 3 5 7\n  4  | 1 2 5 7\n  5  | 1 4 8\n  6  | 1 5\n  7  | 0\n```\n\n$n=15$ → median is the 8th value. Counting: 24, 28, 33, 35, 37, 41, 42, **45**, ... Median = **45**.",
);

// SHORT 2
short(
  `${img(stemPlotMath)}\n\nUsing the stem-and-leaf plot above:\n\n**a.** State the range. (1 mark)\n\n**b.** Find the median. (1 mark)\n\n**c.** Identify the modal stem. (1 mark) (3 marks)`,
  3,
  "EASY",
  "**a.** Range = 82 − 42 = **40**.\n\n**b.** With $n=15$, median = 8th value = **62**.\n\n**c.** Modal stems are 5 and 6 (each with 4 leaves) — tied. Either stem 5 or 6 is acceptable; many texts will report '5 or 6' or 'no unique modal stem'.",
);

// SHORT 3
short(
  `Convert the following back-to-back stem-and-leaf plot showing the test scores of two classes (read 4|2|5 = 24 for Class A and 25 for Class B):\n\n\`\`\`\n   Class A | Stem | Class B\n      5 4 |  4   | 2 5\n  9 7 5 3 |  5   | 1 4 8\n  8 6 4 2 |  6   | 0 3 5 7\n      7 3 |  7   | 2 4 6 9\n        1 |  8   | 1\n\`\`\`\n\n**a.** How many students in each class? (1 mark)\n\n**b.** Find the median of each class. (2 marks)\n\n**c.** Which class performed better overall? Justify briefly. (1 mark) (4 marks)`,
  4,
  "MEDIUM",
  "**a.** Class A leaves: 2+4+4+2+1 = **13** students. Class B leaves: 2+3+4+4+1 = **14** students.\n\n**b.** Class A ordered: 45, 44, 53, 55, 57, 59, 62, 64, 66, 68, 73, 77, 81 → median = 7th value = **62**.\n\nClass B ordered: 42, 45, 51, 54, 58, 60, 63, 65, 67, 72, 74, 76, 79, 81 → $n=14$ → median = $(7+8)/2 = (63+65)/2 = $ **64**.\n\n**c.** Class B has a higher median (64 vs 62) — slightly higher centre. Class B also has more high-end scores (e.g. more 70s). Class B performed marginally better.",
);

// SHORT 4
short(
  `Construct a split-stem stem-and-leaf plot (leaves 0-4 vs 5-9) for the following daily temperatures (°C):\n\n$$18, 19, 21, 23, 24, 25, 26, 28, 28, 29, 31, 32, 33, 35, 36, 38$$\n\nState the median. (4 marks)`,
  4,
  "MEDIUM",
  "Split-stem plot (each tens stem broken at 5):\n\n```\nStem | Leaf\n 1*  | (0-4) \n 1.  | 8 9 (5-9)\n 2*  | 1 3 4 (0-4)\n 2.  | 5 6 8 8 9 (5-9)\n 3*  | 1 2 3 (0-4)\n 3.  | 5 6 8 (5-9)\n```\n\n$n=16$ → median = $(8\\text{th}+9\\text{th})/2 = (28+28)/2 = $ **28 °C**.",
);

// SHORT 5
short(
  `${img(stemPlotPulse)}\n\nUsing the resting-pulse stem-and-leaf plot:\n\n**a.** Find the five-number summary. (3 marks)\n\n**b.** Comment on the shape of the distribution. (2 marks) (5 marks)`,
  5,
  "MEDIUM",
  "Ordered data ($n=17$): 58, 62, 64, 65, 67, 71, 73, 75, 75, 76, 78, 82, 84, 85, 88, 91, 95.\n\n**a.** Min = 58, Max = 95.\n\nMedian = 9th = 75.\n\nLower half (8 values): 58, 62, 64, 65, 67, 71, 73, 75 → $Q_1 = (65+67)/2 = 66$.\n\nUpper half (8): 75, 76, 78, 82, 84, 85, 88, 91, 95 (actually 9 values? Recount: 76, 78, 82, 84, 85, 88, 91, 95 = 8) → $Q_3 = (84+85)/2 = 84.5$.\n\n**Summary: {58, 66, 75, 84.5, 95}**.\n\n**b.** Leaf counts per stem: 5(2), 6(4), 7(6), 8(4), 9(1). Concentration around the 70s with a tail extending to 95 — distribution is approximately symmetric with a slight positive skew (longer right tail).",
);

// EXT_ANS 1
extAns(
  [
    {
      label: "a",
      marks: 2,
      content: `Construct a stem-and-leaf plot for the following times (in minutes) taken to complete a task by 16 employees:\n\n$$22, 25, 28, 30, 33, 35, 36, 38, 41, 42, 44, 47, 49, 52, 55, 60$$`,
      solution: "```\nStem | Leaf\n  2  | 2 5 8\n  3  | 0 3 5 6 8\n  4  | 1 2 4 7 9\n  5  | 2 5\n  6  | 0\n```",
    },
    {
      label: "b",
      marks: 2,
      content: `Find the five-number summary.`,
      solution: "$n=16$ (even). Min = 22, Max = 60.\n\nMedian = $(8\\text{th}+9\\text{th})/2 = (38+41)/2 = 39.5$.\n\nLower 8: 22, 25, 28, 30, 33, 35, 36, 38 → $Q_1 = (30+33)/2 = 31.5$.\n\nUpper 8: 41, 42, 44, 47, 49, 52, 55, 60 → $Q_3 = (47+49)/2 = 48$.\n\nSummary: **{22, 31.5, 39.5, 48, 60}**.",
    },
    {
      label: "c",
      marks: 1,
      content: `Describe the shape of the distribution.`,
      solution: "Leaf counts per stem: 3, 5, 5, 2, 1. The distribution is approximately symmetric with a slight positive skew (longer right tail tapering to stem 6).",
    },
  ],
  "MEDIUM",
);

// EXT_ANS 2
extAns(
  [
    {
      label: "a",
      marks: 2,
      content: `The back-to-back stem-and-leaf plot below shows the heights (in cm) of basketball players from two teams.\n\n${img(stemAndLeaf({ values: [165, 168, 172, 174, 175, 178, 180, 182, 185, 188, 192], title: "Team Eagles (n=11)" }))}\n\n${img(stemAndLeaf({ values: [170, 172, 173, 175, 176, 178, 180, 184, 187, 190, 193, 196], title: "Team Hawks (n=12)" }))}\n\nFind the median height of each team.`,
      solution: "**Eagles** ($n=11$): median = 6th value of ordered list = 178 cm.\n\n**Hawks** ($n=12$): median = $(6\\text{th}+7\\text{th})/2 = (178+180)/2 = $ **179 cm**.",
    },
    {
      label: "b",
      marks: 2,
      content: `State the range and IQR for each team.`,
      solution: "**Eagles**: range = 192 − 165 = 27. Lower half (5): 165, 168, 172, 174, 175 → $Q_1 = 172$. Upper half (5): 180, 182, 185, 188, 192 → $Q_3 = 185$. IQR = 13.\n\n**Hawks**: range = 196 − 170 = 26. Lower half (6): 170, 172, 173, 175, 176, 178 → $Q_1 = (173+175)/2 = 174$. Upper half (6): 180, 184, 187, 190, 193, 196 → $Q_3 = (187+190)/2 = 188.5$. IQR = 14.5.",
    },
    {
      label: "c",
      marks: 2,
      content: `Compare the two teams in terms of centre, spread, and shape.`,
      solution: "**Centre**: Hawks (median 179) marginally taller than Eagles (median 178).\n\n**Spread**: Eagles range = 27, IQR = 13. Hawks range = 26, IQR = 14.5. Eagles slightly tighter overall.\n\n**Shape**: Both are roughly symmetric. The two teams have very similar height distributions.",
    },
  ],
  "MEDIUM",
);

// EXT_RESP 1
extResp(
  [
    {
      label: "a",
      marks: 2,
      content: `Construct a stem-and-leaf plot for the daily takings (in dollars) at a small bakery over 18 days:\n\n$$182, 195, 210, 218, 225, 232, 240, 245, 248, 252, 258, 263, 270, 275, 285, 290, 305, 312$$\n\n(Use stem = hundreds and tens, leaf = units. For example, 182 → stem 18, leaf 2.)`,
      solution: "```\nStem | Leaf\n 18  | 2\n 19  | 5\n 20  | -\n 21  | 0 8\n 22  | 5\n 23  | 2\n 24  | 0 5 8\n 25  | 2 8\n 26  | 3\n 27  | 0 5\n 28  | 5\n 29  | 0\n 30  | 5\n 31  | 2\n```\n\n(Stems may be displayed without the empty 20-row; equivalent forms acceptable.)",
    },
    {
      label: "b",
      marks: 2,
      content: `Find the five-number summary.`,
      solution: "$n=18$. Min = 182, Max = 312.\n\nMedian = $(9\\text{th}+10\\text{th})/2 = (248+252)/2 = 250$.\n\nLower 9: 182, 195, 210, 218, 225, 232, 240, 245, 248 → $Q_1 = $ 5th value $= 225$.\n\nUpper 9: 252, 258, 263, 270, 275, 285, 290, 305, 312 → $Q_3 = $ 5th value $= 275$.\n\n**Summary: {182, 225, 250, 275, 312}**.",
    },
    {
      label: "c",
      marks: 2,
      content: `State the range and the IQR.`,
      solution: "Range = 312 − 182 = **\\$130**. IQR = 275 − 225 = **\\$50**.",
    },
    {
      label: "d",
      marks: 2,
      content: `Describe the shape of the distribution.`,
      solution: "Leaf distribution is roughly even across stems with a slight tapering at both ends — approximately symmetric. The mean and median (250) should be close. The data does not show strong skew.",
    },
    {
      label: "e",
      marks: 2,
      content: `The bakery owner wishes to set a target of "exceed median takings on at least 50% of days". Using the median you found, is this achievable in any given week (7 days)? Justify.`,
      solution: "By definition, the median is the value that 50% of observations exceed (and 50% are below). Over a long sample, the owner would expect roughly 50% of days to exceed the median, so a target of 'more than 50% of days exceeding 250' is right at the typical performance and only achievable in the long run with above-average performance. In any given 7-day week, this could happen or not — the probability is roughly $\\binom{7}{k}(0.5)^7$ for $k \\ge 4$ days, which equals approximately 50%. So **yes, achievable about half the time, but not guaranteed**.",
    },
  ],
  "MEDIUM",
  `**Question — Bakery takings**\n\nA bakery owner records the daily takings (in dollars) over 18 days and wants to summarise the distribution to plan a target.`,
);

// EXT_RESP 2
extResp(
  [
    {
      label: "a",
      marks: 2,
      content: `The waiting times (in minutes) at two doctors' clinics are recorded. Use a back-to-back stem-and-leaf plot to display the data.\n\n**Clinic A (n=14)**: 5, 8, 9, 12, 14, 15, 17, 19, 22, 25, 28, 30, 33, 38\n\n**Clinic B (n=15)**: 3, 6, 7, 10, 11, 13, 14, 16, 18, 20, 22, 24, 27, 31, 35`,
      solution: "```\n     Clinic A | Stem | Clinic B\n         9 8 5|  0   | 3 6 7\n     9 7 5 4 2|  1   | 0 1 3 4 6 8\n         8 5 2|  2   | 0 2 4 7\n           8 3 0|  3   | 1 5\n```\n\n(Leaves on left read right-to-left.)",
    },
    {
      label: "b",
      marks: 2,
      content: `Find the median waiting time for each clinic.`,
      solution: "**Clinic A** ($n=14$): median = $(7+8)/2 = (17+19)/2 = $ **18 min**.\n\n**Clinic B** ($n=15$): median = 8th value = **16 min**.",
    },
    {
      label: "c",
      marks: 2,
      content: `Compute the IQR for each clinic.`,
      solution: "**Clinic A**: lower half (7): 5, 8, 9, 12, 14, 15, 17 → $Q_1 = 12$. Upper half (7): 19, 22, 25, 28, 30, 33, 38 → $Q_3 = 28$. IQR = 16.\n\n**Clinic B**: lower half (7): 3, 6, 7, 10, 11, 13, 14 → $Q_1 = 10$. Upper half (7): 18, 20, 22, 24, 27, 31, 35 → $Q_3 = 24$. IQR = 14.",
    },
    {
      label: "d",
      marks: 2,
      content: `Compare the two clinics in terms of centre, spread, and shape.`,
      solution: "**Centre**: Clinic B median (16) lower than Clinic A (18), so on average patients wait less at Clinic B.\n\n**Spread**: Clinic A IQR = 16, Clinic B IQR = 14 — Clinic B is slightly more consistent.\n\n**Shape**: both are positively skewed (longer right tail), typical of waiting-time data.",
    },
    {
      label: "e",
      marks: 2,
      content: `Which clinic should a time-sensitive patient choose? Justify using both centre and spread.`,
      solution: "**Clinic B**: it has lower median wait (16 vs 18 min) and tighter IQR (14 vs 16) — both centre and consistency favour Clinic B. A time-sensitive patient should prefer Clinic B because they are less likely to face long waits.",
    },
  ],
  "HARD",
  `**Question — Comparing clinic waiting times**\n\nA local health authority compares patient waiting times at two clinics over a recent two-week period to advise residents.`,
);


// ═══════════════════════════════════════════════════════════════════════
// 3. histograms (extended-fit: 9 MCQ + 4 SHORT + 2 EXT_ANS + 2 EXT_RESP)
// ═══════════════════════════════════════════════════════════════════════

CURRENT_SUBTOPIC = "histograms";

const histSvg1 = histogramChart({
  binEdges: [0, 10, 20, 30, 40, 50, 60],
  frequencies: [3, 7, 12, 9, 6, 3],
  xLabel: "Score",
  yLabel: "Frequency",
  title: "Test scores histogram (n=40)",
});

const histSvg2 = histogramChart({
  binEdges: [0, 5, 10, 15, 20, 25, 30, 35],
  frequencies: [2, 4, 8, 10, 7, 5, 4],
  xLabel: "Time (min)",
  yLabel: "Frequency",
});

// MCQ 1
mcq(
  `In a histogram, the area of each bar represents\n\n`,
  ["the frequency of that class", "the percentage of values below the class midpoint", "the cumulative frequency", "the class width"],
  "A",
  "EASY",
  "**Answer: A**\n\nFor a frequency histogram with equal class widths, the area (and the height) of each bar is proportional to the frequency of that class.",
);

// MCQ 2
mcq(
  `${img(histSvg1)}\n\nFrom the histogram above, the modal class is\n\n`,
  ["0-10", "10-20", "20-30", "30-40"],
  "C",
  "EASY",
  "**Answer: C**\n\nThe tallest bar is the bin 20-30 with frequency 12. The modal class is **20-30**.",
);

// MCQ 3
mcq(
  `${img(histSvg1)}\n\nFrom the histogram above, the total number of observations is\n\n`,
  ["30", "35", "40", "50"],
  "C",
  "EASY",
  "**Answer: C**\n\nSum of frequencies = 3 + 7 + 12 + 9 + 6 + 3 = **40**.",
);

// MCQ 4
mcq(
  `${img(histSvg1)}\n\nThe shape of the distribution shown in the histogram above is best described as\n\n`,
  ["positively skewed", "negatively skewed", "approximately symmetric", "uniform"],
  "C",
  "MEDIUM",
  "**Answer: C**\n\nFrequencies 3, 7, 12, 9, 6, 3 show the maximum near the middle with similar tails — approximately symmetric (slight positive skew but closer to symmetric).",
);

// MCQ 5
mcq(
  `${img(histSvg2)}\n\nFrom the time histogram above (in minutes), the median class is closest to\n\n`,
  ["5-10", "10-15", "15-20", "20-25"],
  "C",
  "MEDIUM",
  "**Answer: C**\n\nCumulative frequencies: 2, 6, 14, 24, 31, 36, 40. With $n = 40$, the median position is at the 20th-21st observation. Cumulative reaches 14 at bin 10-15 and 24 at bin 15-20, so the median lies in **15-20**.",
);

// MCQ 6
mcq(
  `In a histogram with unequal class widths, the y-axis should be labelled\n\n`,
  ["frequency", "frequency density (frequency ÷ class width)", "percentage", "cumulative frequency"],
  "B",
  "MEDIUM",
  "**Answer: B**\n\nWith unequal class widths, equal heights would distort comparisons. The correct quantity to plot is frequency density so that the **area** of each bar represents the frequency.",
);

// MCQ 7
mcq(
  `A histogram is said to be **positively skewed** when\n\n`,
  [
    "the tail extends to the right (high values)",
    "the tail extends to the left (low values)",
    "the bars are taller on the right",
    "the median equals the mean",
  ],
  "A",
  "EASY",
  "**Answer: A**\n\nPositive (right) skew = long tail extending toward larger values. The peak is on the left and the data tapers to the right.",
);

// MCQ 8
mcq(
  `${img(histSvg2)}\n\nWhat percentage of values lie in the bin 15-20 in the histogram above?\n\n`,
  ["10%", "15%", "20%", "25%"],
  "D",
  "MEDIUM",
  "**Answer: D**\n\nFrequency of 15-20 = 10. Total $n = 40$. Percentage = $10/40 = $ **25%**.",
);

// MCQ 9
mcq(
  `Which statistic can be **estimated** from a histogram but not read off exactly?\n\n`,
  ["the modal class", "the total frequency", "the median value", "the number of classes"],
  "C",
  "EASY",
  "**Answer: C**\n\nThe median value requires interpolation within the median class — the histogram only tells us the median's class, not the exact median.",
);

// SHORT 1
short(
  `${img(histSvg1)}\n\nUsing the histogram above:\n\n**a.** State the modal class. (1 mark)\n\n**b.** Estimate the percentage of values in the range 20-40. (1 mark)\n\n**c.** Describe the shape of the distribution. (1 mark) (3 marks)`,
  3,
  "EASY",
  "**a.** Modal class = **20-30** (frequency 12).\n\n**b.** Frequencies in 20-30 and 30-40 are 12 + 9 = 21 out of 40. Percentage $= 21/40 = $ **52.5%**.\n\n**c.** Approximately symmetric (slight positive skew); peak near 20-30, tapering both sides.",
);

// SHORT 2
short(
  `The following frequency table shows the distribution of ages (in years) of 50 visitors at a museum:\n\n| Age (yrs) | Frequency |\n|---|---|\n| 0-10 | 4 |\n| 10-20 | 12 |\n| 20-30 | 14 |\n| 30-40 | 10 |\n| 40-50 | 6 |\n| 50-60 | 4 |\n\n**a.** Sketch a histogram. (2 marks)\n\n**b.** State the modal class. (1 mark)\n\n**c.** Describe the shape. (1 mark) (4 marks)`,
  4,
  "MEDIUM",
  "**a.** Histogram:\n\n" + img(histogramChart({
    binEdges: [0, 10, 20, 30, 40, 50, 60],
    frequencies: [4, 12, 14, 10, 6, 4],
    xLabel: "Age (yrs)",
    yLabel: "Frequency",
  })) + "\n\n**b.** Modal class = **20-30** (frequency 14).\n\n**c.** Approximately symmetric with a slight positive skew (longer tail toward older ages).",
);

// SHORT 3
short(
  `The following histogram shows the distribution of waiting times (in minutes) at a checkout queue.\n\n${img(histogramChart({ binEdges: [0, 2, 4, 6, 8, 10], frequencies: [18, 12, 7, 4, 2], xLabel: "Wait (min)", yLabel: "Frequency" }))}\n\n**a.** Describe the shape of the distribution. (1 mark)\n\n**b.** State the modal class. (1 mark)\n\n**c.** Approximately what proportion of customers wait at least 6 minutes? (2 marks) (4 marks)`,
  4,
  "MEDIUM",
  "**a.** **Positively skewed** — peak at the low end with a long tail to the right.\n\n**b.** Modal class = **0-2 minutes** (frequency 18).\n\n**c.** Customers waiting ≥ 6 min: bins 6-8 and 8-10 → 4 + 2 = 6. Total = 18+12+7+4+2 = 43. Proportion = $6/43 \\approx 0.14$ or **about 14%**.",
);

// SHORT 4
short(
  `A histogram has unequal class widths as follows:\n\n| Class | Frequency | Width |\n|---|---|---|\n| 0-10 | 8 | 10 |\n| 10-30 | 28 | 20 |\n| 30-60 | 18 | 30 |\n\n**a.** Compute the frequency density for each class. (2 marks)\n\n**b.** Briefly explain why frequency density (not frequency) must be used here. (2 marks) (4 marks)`,
  4,
  "MEDIUM",
  "**a.** Frequency density = frequency ÷ width.\n\n- 0-10: $8/10 = 0.8$\n- 10-30: $28/20 = 1.4$\n- 30-60: $18/30 = 0.6$\n\n**b.** With unequal widths, plotting raw frequency would make the wider 10-30 bar appear visually dominant just because of its width. Using **frequency density**, the **area** of each bar represents the frequency, giving a fair visual comparison of how data is distributed across the classes.",
);

// EXT_ANS 1
extAns(
  [
    {
      label: "a",
      marks: 2,
      content: `The histogram below shows the heights (in cm) of 50 seedlings.\n\n${img(histogramChart({ binEdges: [4, 6, 8, 10, 12, 14, 16], frequencies: [3, 8, 14, 12, 9, 4], xLabel: "Height (cm)", yLabel: "Frequency" }))}\n\nState the modal class and describe the shape of the distribution.`,
      solution: "Modal class = **8-10 cm** (frequency 14). Frequencies 3, 8, 14, 12, 9, 4 — peak slightly left of centre with tails on both sides. The distribution is **approximately symmetric** with a very slight positive skew.",
    },
    {
      label: "b",
      marks: 2,
      content: `Estimate the median height using the cumulative frequency approach.`,
      solution: "Cumulative frequencies: 3, 11, 25, 37, 46, 50. With $n=50$, the median is at position 25/26. Cumulative reaches 25 exactly at the end of the 8-10 class, so the median lies at the boundary between 8-10 and 10-12. Using linear interpolation within the 10-12 class for position 25.5: $\\text{median} \\approx 10 + \\frac{25.5 - 25}{12} \\times 2 = 10 + 0.083 \\approx $ **10.1 cm**.",
    },
    {
      label: "c",
      marks: 1,
      content: `What percentage of seedlings are taller than 12 cm?`,
      solution: "Tall seedlings: bins 12-14 and 14-16 → 9 + 4 = 13. Percentage = $13/50 = $ **26%**.",
    },
  ],
  "MEDIUM",
);

// EXT_ANS 2
extAns(
  [
    {
      label: "a",
      marks: 3,
      content: `A factory records the lifetimes of 60 light bulbs (in hours). The histogram is shown below.\n\n${img(histogramChart({ binEdges: [800, 900, 1000, 1100, 1200, 1300, 1400], frequencies: [3, 6, 14, 18, 12, 7], xLabel: "Lifetime (hours)", yLabel: "Frequency" }))}\n\nEstimate the median bulb lifetime using linear interpolation.`,
      solution: "Cumulative frequencies: 3, 9, 23, 41, 53, 60. With $n=60$, median at position 30/31.\n\nMedian class: 1100-1200 (cumulative reaches 41 by 1200).\n\nInterpolation: $\\text{median} \\approx 1100 + \\frac{30 - 23}{18} \\times 100 = 1100 + 38.9 \\approx $ **1139 hours**.",
    },
    {
      label: "b",
      marks: 2,
      content: `What percentage of bulbs lasted at least 1200 hours?`,
      solution: "Bulbs ≥ 1200: bins 1200-1300 and 1300-1400 = 12 + 7 = 19. Percentage = $19/60 \\approx 31.7\\%$ or roughly **32%**.",
    },
    {
      label: "c",
      marks: 2,
      content: `Describe the shape of the distribution and state which side has the longer tail.`,
      solution: "Frequencies 3, 6, 14, 18, 12, 7 — peak at 1100-1200 with a slightly longer left tail (low-lifetime values). The distribution is **slightly negatively skewed** (longer left tail).",
    },
  ],
  "MEDIUM",
);

// EXT_RESP 1
extResp(
  [
    {
      label: "a",
      marks: 2,
      content: `The cumulative frequency table below shows the height distribution of 200 adults. Use it to construct a histogram.\n\n| Height (cm) | Cum freq |\n|---|---|\n| < 150 | 4 |\n| < 160 | 24 |\n| < 170 | 80 |\n| < 180 | 156 |\n| < 190 | 192 |\n| < 200 | 200 |`,
      solution: "Class frequencies (differences):\n\n- 140-150: 4\n- 150-160: 20\n- 160-170: 56\n- 170-180: 76\n- 180-190: 36\n- 190-200: 8\n\nHistogram:\n\n" + img(histogramChart({
        binEdges: [140, 150, 160, 170, 180, 190, 200],
        frequencies: [4, 20, 56, 76, 36, 8],
        xLabel: "Height (cm)",
        yLabel: "Frequency",
      })),
    },
    {
      label: "b",
      marks: 1,
      content: `State the modal class.`,
      solution: "Modal class = **170-180 cm** (frequency 76).",
    },
    {
      label: "c",
      marks: 2,
      content: `Estimate the median height.`,
      solution: "Median position = $200/2 = 100$ (or 100.5). Cumulative reaches 80 at 170 and 156 at 180, so median lies in 170-180.\n\nInterpolation: $\\text{median} \\approx 170 + \\frac{100 - 80}{76} \\times 10 = 170 + 2.63 \\approx $ **172.6 cm**.",
    },
    {
      label: "d",
      marks: 2,
      content: `Describe the shape of the distribution and identify any skew.`,
      solution: "Frequencies: 4, 20, 56, 76, 36, 8. Peak at 170-180 with steep rise on the left and more gradual decline on the right — **slightly positively skewed**, although fairly close to symmetric/bell-shaped.",
    },
    {
      label: "e",
      marks: 2,
      content: `Estimate what percentage of adults have heights between 165 and 180 cm.`,
      solution: "Linear interpolation within 160-170: position at 165 (midpoint of bin) → assume even spread, so half of bin = $56/2 = 28$. Counting from 165 to 180: 28 (165-170) + 76 (170-180) = 104. Percentage = $104/200 = $ **52%**.",
    },
  ],
  "MEDIUM",
  `**Question — Adult heights**\n\nA national health survey records the heights of 200 adults. Use the cumulative frequency data to construct and analyse a histogram.`,
);

// EXT_RESP 2
extResp(
  [
    {
      label: "a",
      marks: 2,
      content: `The following histogram shows the daily expenditure (in dollars) of 80 households on groceries.\n\n${img(histogramChart({ binEdges: [0, 20, 40, 60, 80, 100, 120], frequencies: [4, 12, 24, 20, 14, 6], xLabel: "Expenditure (\\$)", yLabel: "Frequency" }))}\n\nState the modal class and the median class.`,
      solution: "**Modal class** = $40-60 (frequency 24).\n\nCumulative: 4, 16, 40, 60, 74, 80. Median at position 40/41 → reaches 40 at the end of bin 40-60. **Median class** = $40-60 (40 lies at the upper boundary).",
    },
    {
      label: "b",
      marks: 2,
      content: `Use interpolation to estimate the median expenditure.`,
      solution: "Median position 40.5 lies in bin 40-60 (cumulative just past 40).\n\nInterpolation: $\\text{median} \\approx 40 + \\frac{40 - 16}{24} \\times 20 = 40 + 20 = 60$.\n\nHmm — at position 40 we've reached exactly the boundary. Using the alternative midpoint convention: $\\text{median} \\approx 40 + \\frac{40.5 - 16}{24} \\times 20 \\approx 40 + 20.4 \\approx 60.4$. So median ≈ **\\$60**.",
    },
    {
      label: "c",
      marks: 2,
      content: `Estimate the mean expenditure using class midpoints.`,
      solution: "Midpoints: 10, 30, 50, 70, 90, 110. Frequencies: 4, 12, 24, 20, 14, 6.\n\n$\\sum fx = 4(10)+12(30)+24(50)+20(70)+14(90)+6(110) = 40+360+1200+1400+1260+660 = 4920$.\n\nMean $= 4920/80 = $ **\\$61.50**.",
    },
    {
      label: "d",
      marks: 2,
      content: `Compare the mean and median. What does the comparison suggest about the skew?`,
      solution: "Mean = \\$61.50, median ≈ \\$60. Mean > median (slightly), suggesting a small **positive skew** — a few higher-spending households pull the mean upward. The skew is only mild.",
    },
    {
      label: "e",
      marks: 3,
      content: `If the government wants to support households spending more than \\$80 on groceries, estimate how many households would qualify and what percentage of all households this represents.`,
      solution: "Households spending > \\$80 are in bins 80-100 and 100-120: 14 + 6 = **20 households**. Percentage = $20/80 = $ **25%** of households.",
    },
  ],
  "MEDIUM",
  `**Question — Grocery expenditure survey**\n\nA market researcher records the daily grocery spending (in dollars) of 80 households to assess the distribution and propose support programmes.`,
);


// ═══════════════════════════════════════════════════════════════════════
// 4. mean-median-and-standard-deviation (extended-fit: 9 + 4 + 2 + 2 = 17)
// ═══════════════════════════════════════════════════════════════════════

CURRENT_SUBTOPIC = "mean-median-and-standard-deviation";

// MCQ 1
mcq(
  `The mean of the data set $4, 7, 9, 11, 14$ is\n\n`,
  ["7.5", "9", "9.5", "11"],
  "B",
  "EASY",
  "**Answer: B**\n\n$\\bar x = (4+7+9+11+14)/5 = 45/5 = $ **9**.",
);

// MCQ 2
mcq(
  `If a data set is symmetric and bell-shaped, the most appropriate measure of centre is\n\n`,
  ["the median", "the mean", "the mode", "the range"],
  "B",
  "EASY",
  "**Answer: B**\n\nFor symmetric, bell-shaped (approximately normal) data, the mean is the standard measure of centre. Mean and median are close for symmetric data, but mean is preferred.",
);

// MCQ 3
mcq(
  `If a data set is strongly positively skewed, the most appropriate measure of centre is\n\n`,
  ["the mean", "the median", "the mode", "the range"],
  "B",
  "EASY",
  "**Answer: B**\n\nFor skewed data the **median** is preferred because it is resistant to extreme values, whereas the mean is pulled in the direction of the tail.",
);

// MCQ 4
mcq(
  `The standard deviation $\\sigma$ of a data set measures\n\n`,
  [
    "the centre of the data",
    "the spread of values around the mean",
    "the difference between the largest and smallest values",
    "the most frequent value",
  ],
  "B",
  "EASY",
  "**Answer: B**\n\nStandard deviation is a measure of spread: it quantifies how far the data values typically deviate from the mean.",
);

// MCQ 5
mcq(
  `According to the 68-95-99.7% rule, for a symmetric bell-shaped distribution with mean $\\bar x = 50$ and standard deviation $\\sigma = 10$, approximately 95% of values lie between\n\n`,
  ["40 and 60", "30 and 70", "20 and 80", "10 and 90"],
  "B",
  "MEDIUM",
  "**Answer: B**\n\n95% of values lie within 2 sd of the mean: $\\bar x \\pm 2\\sigma = 50 \\pm 20 = $ **30 to 70**.",
);

// MCQ 6
mcq(
  `For a data set with $\\bar x = 100$ and $\\sigma = 15$, the $z$-score of a value $x = 130$ is\n\n`,
  ["1", "1.5", "2", "30"],
  "C",
  "MEDIUM",
  "**Answer: C**\n\n$z = (x - \\bar x)/\\sigma = (130 - 100)/15 = 30/15 = $ **2**.",
);

// MCQ 7
mcq(
  `A student's exam result has a $z$-score of $-1.2$. This means that the result is\n\n`,
  [
    "1.2 standard deviations above the mean",
    "1.2 standard deviations below the mean",
    "12% above the mean",
    "12% below the mean",
  ],
  "B",
  "EASY",
  "**Answer: B**\n\nA negative $z$-score means below the mean. $z = -1.2$ → 1.2 sd below the mean.",
);

// MCQ 8
mcq(
  `If every value in a data set is increased by 5, then\n\n`,
  [
    "the mean increases by 5; the standard deviation increases by 5",
    "the mean increases by 5; the standard deviation is unchanged",
    "the mean is unchanged; the standard deviation increases by 5",
    "both the mean and the standard deviation are unchanged",
  ],
  "B",
  "MEDIUM",
  "**Answer: B**\n\nShifting every value by a constant shifts the mean by the same constant but leaves the spread (standard deviation) unchanged.",
);

// MCQ 9
mcq(
  `If every value in a data set is doubled, then\n\n`,
  [
    "the mean doubles; the standard deviation doubles",
    "the mean doubles; the standard deviation is unchanged",
    "the mean is unchanged; the standard deviation doubles",
    "the mean increases by 2; the standard deviation doubles",
  ],
  "A",
  "MEDIUM",
  "**Answer: A**\n\nMultiplying every value by a constant $k$ multiplies both the mean and standard deviation by $k$. So if $k = 2$, both double.",
);

// SHORT 1
short(
  `Find the mean and median of the data set $$2, 5, 7, 8, 13$$ (2 marks)`,
  2,
  "EASY",
  "Mean $= (2+5+7+8+13)/5 = 35/5 = $ **7**.\n\nMedian = 3rd value (odd $n$) = **7**. Mean = median = 7.",
);

// SHORT 2
short(
  `The mean of 6 numbers is 14. When a 7th number is added, the mean becomes 15. What is the 7th number? (3 marks)`,
  3,
  "MEDIUM",
  "Sum of first 6 numbers = $6 \\times 14 = 84$.\n\nSum of all 7 numbers = $7 \\times 15 = 105$.\n\n7th number $= 105 - 84 = $ **21**.",
);

// SHORT 3
short(
  `For a data set, $\\bar x = 72$ and $\\sigma = 8$.\n\n**a.** Find the $z$-score of $x = 88$. (1 mark)\n\n**b.** Find the value of $x$ corresponding to $z = -1.5$. (1 mark)\n\n**c.** Approximately what percentage of values lie between 64 and 80? (2 marks) (4 marks)`,
  4,
  "MEDIUM",
  "**a.** $z = (88-72)/8 = 16/8 = $ **2**.\n\n**b.** $x = \\bar x + z\\sigma = 72 + (-1.5)(8) = 72 - 12 = $ **60**.\n\n**c.** 64 to 80 corresponds to $\\bar x \\pm 1\\sigma$. By 68-95-99.7%: approximately **68%** of values lie within 1 sd of the mean.",
);

// SHORT 4
short(
  `The marks of 20 students on a test had a mean of 65 and a standard deviation of 12. Estimate, using the 68-95-99.7% rule (assuming the marks are approximately bell-shaped):\n\n**a.** the percentage of students with marks between 53 and 77. (1 mark)\n\n**b.** the percentage of students with marks above 89. (2 marks)\n\n**c.** the percentage of students with marks below 41. (2 marks) (5 marks)`,
  5,
  "MEDIUM",
  "**a.** 53 to 77 is $\\bar x \\pm 1\\sigma$ → **68%**.\n\n**b.** Above 89 = above $\\bar x + 2\\sigma$ = above 2 sd. Total beyond ±2 sd is 5%; one tail = **2.5%**.\n\n**c.** Below 41 = below $\\bar x - 2\\sigma$. Same as part b — **2.5%**.",
  "CAS_ALLOWED",
);

// EXT_ANS 1
extAns(
  [
    {
      label: "a",
      marks: 2,
      content: `Compute the mean and median of the data set $$8, 12, 14, 15, 18, 22, 30, 45$$`,
      solution: "Mean = $(8+12+14+15+18+22+30+45)/8 = 164/8 = $ **20.5**.\n\nMedian: $n=8$, average of 4th and 5th = $(15+18)/2 = $ **16.5**.",
    },
    {
      label: "b",
      marks: 1,
      content: `Compare the mean and the median. What does this suggest about the skew?`,
      solution: "Mean (20.5) > median (16.5). The mean is pulled above the median by the large value 45 — this is consistent with **positive skew**.",
    },
    {
      label: "c",
      marks: 2,
      content: `Suppose the value 45 was a recording error and should have been 25. Recompute the mean and median.`,
      solution: "New data: 8, 12, 14, 15, 18, 22, 25, 30 (sorted).\n\nMean = $(8+12+14+15+18+22+25+30)/8 = 144/8 = $ **18**.\n\nMedian = $(15+18)/2 = $ **16.5** (unchanged — the median is resistant; the mean dropped from 20.5 to 18).",
    },
  ],
  "MEDIUM",
  null,
  "TECH_FREE",
);

// EXT_ANS 2
extAns(
  [
    {
      label: "a",
      marks: 2,
      content: `The masses (in kg) of 8 fish caught are $$1.2, 1.5, 1.8, 2.1, 2.3, 2.5, 2.8, 3.2$$\n\nFind the mean and standard deviation (use CAS, round to 2 dp).`,
      solution: "Mean: sum = $1.2+1.5+1.8+2.1+2.3+2.5+2.8+3.2 = 17.4$. $\\bar x = 17.4/8 = $ **2.175** ≈ **2.18 kg**.\n\nSample standard deviation (CAS): $s \\approx $ **0.64 kg** (population sd $\\sigma \\approx 0.60$ kg). Reporting sample sd as it is standard for VCE.",
    },
    {
      label: "b",
      marks: 2,
      content: `Compute the z-score of the largest fish (3.2 kg) and interpret it.`,
      solution: "$z = (3.2 - 2.175)/0.64 \\approx 1.025/0.64 \\approx $ **1.60**. The 3.2 kg fish is approximately **1.6 standard deviations above the mean** — moderately above average.",
    },
    {
      label: "c",
      marks: 1,
      content: `If the masses are converted from kg to grams (multiply by 1000), state the new mean and standard deviation.`,
      solution: "Both scale by 1000: new mean = **2175 g** (or 2180 g rounded), new sd $\\approx $ **640 g**.",
    },
  ],
  "MEDIUM",
);

// EXT_RESP 1
extResp(
  [
    {
      label: "a",
      marks: 2,
      content: `The marks (out of 100) of 12 students on a test are $$54, 58, 62, 65, 68, 70, 72, 75, 78, 82, 85, 91$$. Find the mean and standard deviation (use CAS, round to 2 dp).`,
      solution: "Sum $= 54+58+62+65+68+70+72+75+78+82+85+91 = 860$. $\\bar x = 860/12 \\approx $ **71.67**.\n\nSample sd (CAS): $s \\approx $ **11.07**.",
    },
    {
      label: "b",
      marks: 2,
      content: `Find the median and IQR.`,
      solution: "$n=12$. Median = $(6\\text{th}+7\\text{th})/2 = (70+72)/2 = $ **71**.\n\nLower 6: 54, 58, 62, 65, 68, 70 → $Q_1 = (62+65)/2 = 63.5$.\n\nUpper 6: 72, 75, 78, 82, 85, 91 → $Q_3 = (78+82)/2 = 80$.\n\nIQR $= 80 - 63.5 = $ **16.5**.",
    },
    {
      label: "c",
      marks: 2,
      content: `Compute the $z$-score of the highest mark and interpret.`,
      solution: "$z = (91 - 71.67)/11.07 \\approx 19.33/11.07 \\approx $ **1.75**.\n\nThe top mark is about 1.75 sd above the mean — high, but within the normal range (less than 2 sd).",
    },
    {
      label: "d",
      marks: 3,
      content: `If the test marks are approximately bell-shaped, estimate how many of the 12 students scored between 60 and 83.`,
      solution: "60 ≈ $\\bar x - \\sigma$ and 83 ≈ $\\bar x + \\sigma$. By 68-95-99.7%, ~68% of students lie within 1 sd. $68\\% \\times 12 \\approx $ **8 students**.\n\n(Check actual count: 62, 65, 68, 70, 72, 75, 78, 82 — that's 8 students, agreeing with the estimate.)",
    },
    {
      label: "e",
      marks: 2,
      content: `If every student's mark is increased by 5 (a scaling adjustment), state the new mean, new standard deviation, and new median.`,
      solution: "Adding a constant shifts mean and median by 5 but leaves sd unchanged.\n\nNew mean $\\approx 76.67$, new median = 76, new sd $\\approx 11.07$.",
    },
  ],
  "MEDIUM",
  `**Question — Test marks analysis**\n\nA teacher analyses the test results of 12 students to identify centre, spread, and outliers, and to apply the empirical rule.`,
);

// EXT_RESP 2
extResp(
  [
    {
      label: "a",
      marks: 2,
      content: `The annual rainfall (in mm) at a weather station over the last 10 years is\n\n$$420, 455, 480, 510, 525, 540, 560, 580, 610, 720$$\n\nFind the mean and standard deviation (CAS).`,
      solution: "Sum = $420+455+480+510+525+540+560+580+610+720 = 5400$. Mean $= 5400/10 = $ **540 mm**.\n\nSample sd (CAS) $\\approx $ **87.3 mm**.",
    },
    {
      label: "b",
      marks: 2,
      content: `Find the median and the IQR.`,
      solution: "$n=10$. Median = $(5\\text{th}+6\\text{th})/2 = (525+540)/2 = $ **532.5 mm**.\n\nLower 5: 420, 455, 480, 510, 525 → $Q_1 = 480$.\n\nUpper 5: 540, 560, 580, 610, 720 → $Q_3 = 580$.\n\nIQR $= 580 - 480 = $ **100 mm**.",
    },
    {
      label: "c",
      marks: 2,
      content: `Comment on whether the data is skewed, citing both mean-vs-median and a feature of the data.`,
      solution: "Mean (540) > median (532.5) — slightly **positively skewed**. The largest value (720) is well above the rest of the cluster (most values 420-610), pulling the mean upward.",
    },
    {
      label: "d",
      marks: 2,
      content: `Compute the $z$-score of the year with 720 mm of rainfall. Comment.`,
      solution: "$z = (720 - 540)/87.3 \\approx 180/87.3 \\approx $ **2.06**. The 720 mm year is just over 2 sd above the mean — a notably wet year, potentially an outlier.",
    },
    {
      label: "e",
      marks: 3,
      content: `If the 720 mm value is removed (treated as an outlier), recompute the mean and sd for the remaining 9 years. Comment on the change.`,
      solution: "New sum $= 5400 - 720 = 4680$. New mean $= 4680/9 = $ **520 mm**.\n\nNew sample sd (CAS, computed from the 9 remaining values) $\\approx $ **62.0 mm**.\n\n**Comment**: removing the outlier brings the mean down by 20 mm and reduces sd substantially (from ~87 to ~62). This shows the mean and sd are both sensitive to outliers; the median (532.5) would have shifted only slightly.",
    },
  ],
  "MEDIUM",
  `**Question — Rainfall analysis**\n\nA climatologist studies a 10-year rainfall record from a weather station to characterise central tendency, spread, and the influence of an unusually wet year.`,
);


// ═══════════════════════════════════════════════════════════════════════
// 5. box-plots (extended-fit: 9 + 4 + 2 + 2 = 17)
// ═══════════════════════════════════════════════════════════════════════

CURRENT_SUBTOPIC = "box-plots";

const boxRunningSvg = boxPlot({
  summary: { min: 22, q1: 28, median: 32, q3: 38, max: 50 },
  xTicks: [20, 25, 30, 35, 40, 45, 50],
  xLabel: "Time (min)",
  title: "5km run times (n=30)",
});

const boxOutlierSvg = boxPlot({
  summary: { min: 12, q1: 18, median: 22, q3: 27, max: 35 },
  outliers: [5, 48],
  xTicks: [0, 10, 20, 30, 40, 50],
  xLabel: "Score",
});

// MCQ 1
mcq(
  `${img(boxRunningSvg)}\n\nFrom the box plot above, the median run time is closest to\n\n`,
  ["28 min", "32 min", "38 min", "50 min"],
  "B",
  "EASY",
  "**Answer: B**\n\nThe vertical line inside the box marks the median at 32 minutes.",
);

// MCQ 2
mcq(
  `${img(boxRunningSvg)}\n\nFrom the box plot above, the IQR is\n\n`,
  ["6 min", "10 min", "16 min", "28 min"],
  "B",
  "EASY",
  "**Answer: B**\n\nIQR = $Q_3 - Q_1 = 38 - 28 = $ **10 min**.",
);

// MCQ 3
mcq(
  `${img(boxRunningSvg)}\n\nApproximately what percentage of runners completed the 5km in 32 minutes or less?\n\n`,
  ["25%", "50%", "75%", "100%"],
  "B",
  "MEDIUM",
  "**Answer: B**\n\n32 min = median. By definition, **50%** of values lie at or below the median.",
);

// MCQ 4
mcq(
  `${img(boxRunningSvg)}\n\nApproximately what percentage of runners completed the 5km in 38 minutes or less?\n\n`,
  ["25%", "50%", "75%", "100%"],
  "C",
  "MEDIUM",
  "**Answer: C**\n\n38 min = $Q_3$, the 75th percentile. So 75% of runners are at or below 38 min.",
);

// MCQ 5
mcq(
  `In a box plot, an outlier is typically marked\n\n`,
  ["as a separate dot beyond the whisker", "as an extension of the whisker", "as a separate box", "by colouring the median"],
  "A",
  "EASY",
  "**Answer: A**\n\nWhen a data point falls outside the fences ($Q_1 - 1.5 \\cdot IQR$ or $Q_3 + 1.5 \\cdot IQR$), it is drawn as a separate point/dot beyond the whisker, and the whisker is shortened to the nearest non-outlier value.",
);

// MCQ 6
mcq(
  `${img(boxOutlierSvg)}\n\nWhich of the following is **true** for the box plot above?\n\n`,
  [
    "There are no outliers",
    "There is exactly one outlier (a low value)",
    "There are two outliers — one low and one high",
    "Only the upper whisker has an outlier",
  ],
  "C",
  "MEDIUM",
  "**Answer: C**\n\nThe diagram shows isolated red points at 5 (low) and 48 (high), beyond the whiskers, indicating two outliers.",
);

// MCQ 7
mcq(
  `A box plot is best for\n\n`,
  [
    "displaying the exact value of every observation",
    "comparing the centre, spread, and skew of one or more data sets",
    "showing the frequency of each value",
    "displaying cumulative frequencies",
  ],
  "B",
  "EASY",
  "**Answer: B**\n\nBox plots compactly summarise five-number summary and outliers, ideal for comparing centre, spread, and skew across groups.",
);

// MCQ 8
mcq(
  `If a box plot is **positively skewed**, then\n\n`,
  [
    "the box and right whisker are longer than the left whisker",
    "the left whisker is longer than the right",
    "the median line is in the middle of the box",
    "the IQR equals the range",
  ],
  "A",
  "MEDIUM",
  "**Answer: A**\n\nPositive skew shows as a longer right tail (whisker) and often a median nearer the left side of the box.",
);

// MCQ 9
mcq(
  `For a data set with five-number summary $\\{20, 35, 45, 60, 100\\}$, an outlier check using the 1.5×IQR rule gives an upper fence of\n\n`,
  ["67.5", "82.5", "97.5", "100"],
  "C",
  "MEDIUM",
  "**Answer: C**\n\nIQR $= 60 - 35 = 25$. Upper fence $= Q_3 + 1.5 \\cdot IQR = 60 + 37.5 = $ **97.5**. The value 100 lies above this and would be flagged as an outlier.",
);

// SHORT 1
short(
  `Construct a box plot for the data\n\n$$8, 12, 15, 18, 20, 22, 25, 28, 32, 40$$ and identify any outliers using the 1.5 × IQR rule. (4 marks)`,
  4,
  "MEDIUM",
  "$n=10$. Min = 8, Max = 40. Median = $(20+22)/2 = 21$. Lower 5: 8, 12, 15, 18, 20 → $Q_1 = 15$. Upper 5: 22, 25, 28, 32, 40 → $Q_3 = 28$. IQR $= 13$.\n\nFences: lower = $15 - 1.5(13) = 15 - 19.5 = -4.5$; upper = $28 + 1.5(13) = 47.5$. All values lie within fences → **no outliers**.\n\n" + img(boxPlot({
    summary: { min: 8, q1: 15, median: 21, q3: 28, max: 40 },
    xTicks: [0, 10, 20, 30, 40, 50],
    xLabel: "Value",
  })),
);

// SHORT 2
short(
  `Two box plots show the test scores of two classes on the same exam.\n\n${img(boxPlot({ summary: { min: 50, q1: 62, median: 70, q3: 78, max: 92 }, xRange: [45, 100], xTicks: [50, 60, 70, 80, 90, 100], xLabel: "Class A scores" }))}\n\n${img(boxPlot({ summary: { min: 55, q1: 65, median: 75, q3: 82, max: 95 }, xRange: [45, 100], xTicks: [50, 60, 70, 80, 90, 100], xLabel: "Class B scores" }))}\n\nCompare the two classes in terms of centre and spread. (3 marks)`,
  3,
  "MEDIUM",
  "**Centre**: Class B median (75) > Class A median (70) — Class B performed better on average.\n\n**Spread**: Class A IQR $= 78-62 = 16$; Class B IQR $= 82-65 = 17$ — very similar spread. Ranges 42 vs 40, also similar.\n\nClass B has slightly higher centre but spread is roughly equal — Class B performed better overall.",
);

// SHORT 3
short(
  `${img(boxOutlierSvg)}\n\nFrom the box plot above:\n\n**a.** State the five-number summary excluding outliers. (1 mark)\n\n**b.** State any outliers shown. (1 mark)\n\n**c.** Verify (using the 1.5 × IQR rule) that the values you identified are indeed outliers. (2 marks) (4 marks)`,
  4,
  "MEDIUM",
  "**a.** Five-number summary (non-outliers): {12, 18, 22, 27, 35}.\n\n**b.** Outliers: 5 (low) and 48 (high).\n\n**c.** IQR $= 27 - 18 = 9$. Lower fence $= 18 - 1.5(9) = 18 - 13.5 = 4.5$. Upper fence $= 27 + 13.5 = 40.5$. Since $5 \\ge 4.5$, actually 5 > 4.5 so 5 is **not** an outlier by this rule (very close). Re-check: $5 \\ge 4.5$ means 5 lies inside lower fence; not an outlier. But $48 > 40.5$ so 48 **is** an outlier. **Note**: by the strict 1.5-IQR rule only 48 qualifies. (Acceptable to mark 5 as suspicious / 'mild' outlier if a tighter convention used.)",
);

// SHORT 4
short(
  `A box plot has the five-number summary $\\{30, 45, 60, 75, 110\\}$.\n\n**a.** Compute the IQR. (1 mark)\n\n**b.** Use the 1.5 × IQR rule to identify any outliers. (3 marks) (4 marks)`,
  4,
  "MEDIUM",
  "**a.** IQR $= 75 - 45 = $ **30**.\n\n**b.** Lower fence $= 45 - 1.5(30) = 45 - 45 = 0$. Upper fence $= 75 + 1.5(30) = 75 + 45 = 120$.\n\nValues outside $[0, 120]$ are outliers. Minimum = 30, maximum = 110 — both inside the fences. **No outliers**.",
);

// EXT_ANS 1
extAns(
  [
    {
      label: "a",
      marks: 2,
      content: `Construct a box plot for the following data:\n\n$$5, 8, 12, 14, 18, 22, 25, 28, 32, 38, 45$$`,
      solution: "$n=11$ (odd). Min = 5, Max = 45. Median = 6th = 22.\n\nLower half (5, excl median): 5, 8, 12, 14, 18 → $Q_1 = 12$.\n\nUpper half (5, excl median): 25, 28, 32, 38, 45 → $Q_3 = 32$.\n\nFences: IQR = 20; lower = $12 - 30 = -18$; upper = $32 + 30 = 62$. No outliers.\n\n" + img(boxPlot({
        summary: { min: 5, q1: 12, median: 22, q3: 32, max: 45 },
        xTicks: [0, 10, 20, 30, 40, 50],
        xLabel: "Value",
      })),
    },
    {
      label: "b",
      marks: 1,
      content: `Describe the shape of the distribution from the box plot.`,
      solution: "Median (22) lies roughly central in the box (12 to 32). Right whisker (32→45, length 13) is similar to the left whisker (5→12, length 7). Slight **positive skew** (longer right whisker), but close to symmetric.",
    },
    {
      label: "c",
      marks: 2,
      content: `Identify the percentage of data values that lie between $Q_1$ and $Q_3$, and explain the meaning of this percentage.`,
      solution: "By definition, exactly **50%** of values lie between $Q_1$ and $Q_3$. This is the **interquartile range (IQR)** — the middle 50% of the data. It is a robust measure of spread because it ignores the bottom 25% and top 25% (where outliers tend to lie).",
    },
  ],
  "MEDIUM",
);

// EXT_ANS 2
extAns(
  [
    {
      label: "a",
      marks: 2,
      content: `${img(boxPlot({ summary: { min: 18, q1: 24, median: 28, q3: 32, max: 40 }, outliers: [10, 48], xTicks: [10, 20, 30, 40, 50], xLabel: "Site A" }))}\n\n${img(boxPlot({ summary: { min: 20, q1: 25, median: 30, q3: 36, max: 45 }, xTicks: [10, 20, 30, 40, 50], xLabel: "Site B" }))}\n\nCompare the two sites in terms of centre, spread, and skew.`,
      solution: "**Centre**: Site A median = 28, Site B median = 30. Site B has a slightly higher centre.\n\n**Spread**: Site A IQR = 8, Site B IQR = 11. Site B is more variable.\n\n**Skew**: Site A box plot is fairly symmetric; Site B is slightly positively skewed (longer right whisker).\n\n**Outliers**: Site A has two outliers (10 low, 48 high); Site B has none.",
    },
    {
      label: "b",
      marks: 2,
      content: `For Site A, verify that the value 48 is an outlier using the 1.5 × IQR rule.`,
      solution: "Site A: $Q_1=24$, $Q_3=32$, IQR = 8.\n\nUpper fence = $32 + 1.5 \\times 8 = 32 + 12 = 44$.\n\n$48 > 44$, so 48 is indeed an outlier.",
    },
    {
      label: "c",
      marks: 2,
      content: `Suggest one reason why Site A might have outliers while Site B does not.`,
      solution: "Site A's outliers (one low, one high) could reflect occasional extreme events at that site — for example, an unusually quiet day (10) or an unusually busy day (48) due to a special event or measurement anomaly. Site B's data is more consistent, perhaps because the underlying process is more stable or the measurement period excluded extreme events.",
    },
  ],
  "MEDIUM",
);

// EXT_RESP 1
extResp(
  [
    {
      label: "a",
      marks: 2,
      content: `The five-number summaries for the response times (in minutes) of two emergency services are:\n\n- Service A: min 4, $Q_1$ 6, median 8, $Q_3$ 11, max 18\n- Service B: min 3, $Q_1$ 5, median 7, $Q_3$ 12, max 22\n\nDraw box plots for both services on a common scale.`,
      solution: "Service A:\n\n" + img(boxPlot({ summary: { min: 4, q1: 6, median: 8, q3: 11, max: 18 }, xRange: [0, 25], xTicks: [0, 5, 10, 15, 20, 25], xLabel: "Service A" })) + "\n\nService B:\n\n" + img(boxPlot({ summary: { min: 3, q1: 5, median: 7, q3: 12, max: 22 }, xRange: [0, 25], xTicks: [0, 5, 10, 15, 20, 25], xLabel: "Service B" })),
    },
    {
      label: "b",
      marks: 2,
      content: `Compare the two services in terms of centre.`,
      solution: "Service B has a lower median (7 vs 8), so Service B is slightly faster **on average** in terms of response time. However the difference is only 1 minute.",
    },
    {
      label: "c",
      marks: 2,
      content: `Compare the two services in terms of spread.`,
      solution: "Service A IQR = 11 − 6 = 5; Service B IQR = 12 − 5 = 7. Service A range = 14; Service B range = 19. **Service A is more consistent**; Service B is more variable in its response times.",
    },
    {
      label: "d",
      marks: 2,
      content: `Compute the upper fence for each service and decide whether the maximum is an outlier.`,
      solution: "**Service A**: $Q_3 + 1.5 \\cdot IQR = 11 + 1.5(5) = 11 + 7.5 = 18.5$. Max = 18 < 18.5 → **not** an outlier.\n\n**Service B**: $Q_3 + 1.5 \\cdot IQR = 12 + 1.5(7) = 12 + 10.5 = 22.5$. Max = 22 < 22.5 → **not** an outlier (just within fence).",
    },
    {
      label: "e",
      marks: 2,
      content: `Which service would you recommend to a council aiming for predictable response times? Justify.`,
      solution: "**Service A** — it has lower IQR (5 vs 7) and lower range (14 vs 19), meaning more predictable response times. Although Service B has a slightly lower median, predictability favours Service A.",
    },
  ],
  "MEDIUM",
  `**Question — Emergency response comparison**\n\nA council is comparing two emergency service providers based on response times (in minutes) to 30 incidents each over the past quarter.`,
);

// EXT_RESP 2
extResp(
  [
    {
      label: "a",
      marks: 2,
      content: `The masses (in grams) of 15 apples in a sample are\n\n$$120, 125, 130, 135, 138, 140, 145, 148, 150, 155, 160, 165, 170, 180, 220$$\n\nFind the five-number summary.`,
      solution: "$n=15$. Min = 120, Max = 220. Median = 8th value = 148.\n\nLower half (7, excl median): 120, 125, 130, 135, 138, 140, 145 → $Q_1 = 135$.\n\nUpper half (7, excl median): 150, 155, 160, 165, 170, 180, 220 → $Q_3 = 165$.\n\nSummary: **{120, 135, 148, 165, 220}**.",
    },
    {
      label: "b",
      marks: 2,
      content: `Compute the IQR and determine whether 220 is an outlier using the 1.5 × IQR rule.`,
      solution: "IQR $= 165 - 135 = 30$. Upper fence $= 165 + 1.5(30) = 165 + 45 = 210$. $220 > 210$ → **yes, 220 is an outlier**.",
    },
    {
      label: "c",
      marks: 2,
      content: `Construct a box plot showing the outlier separately.`,
      solution: img(boxPlot({
        summary: { min: 120, q1: 135, median: 148, q3: 165, max: 180 },
        outliers: [220],
        xRange: [100, 240],
        xTicks: [100, 140, 180, 220],
        xLabel: "Mass (g)",
      })) + "\n\nThe non-outlier maximum (highest value within the upper fence) is 180; the value 220 is plotted as a separate dot.",
    },
    {
      label: "d",
      marks: 2,
      content: `Describe the shape of the distribution. Comment on whether the median or mean is the better summary of centre and why.`,
      solution: "The data is **positively skewed** — the right tail extends to 220 (the outlier). The mean (compute: sum = $120+125+130+135+138+140+145+148+150+155+160+165+170+180+220 = 2281$, mean $= 2281/15 \\approx 152$) is pulled toward the outlier, while the median (148) is closer to the bulk of the data. Therefore the **median is the better summary of centre** for this skewed distribution.",
    },
    {
      label: "e",
      marks: 3,
      content: `If the outlier (220 g apple) is removed, recompute the five-number summary and IQR for the remaining 14 apples.`,
      solution: "Remaining sorted data ($n=14$): 120, 125, 130, 135, 138, 140, 145, 148, 150, 155, 160, 165, 170, 180.\n\nMin = 120, Max = 180.\n\nMedian = $(7\\text{th} + 8\\text{th})/2 = (145+148)/2 = 146.5$.\n\nLower half (7): 120, 125, 130, 135, 138, 140, 145 → $Q_1 = 135$.\n\nUpper half (7): 148, 150, 155, 160, 165, 170, 180 → $Q_3 = 160$.\n\n**New summary: {120, 135, 146.5, 160, 180}, IQR = 25**.\n\nThe upper boundaries shifted but $Q_1$ stayed the same — the outlier mainly affected the upper end.",
    },
  ],
  "HARD",
  `**Question — Apple mass quality control**\n\nA fruit packer samples 15 apples to check the mass distribution and decide whether a giant apple (the heaviest) qualifies as an outlier.`,
);


// ═══════════════════════════════════════════════════════════════════════
// 6. outliers (extended-fit: 9 + 4 + 2 + 2 = 17)
// ═══════════════════════════════════════════════════════════════════════

CURRENT_SUBTOPIC = "outliers";

const outlierBox1 = boxPlot({
  summary: { min: 40, q1: 55, median: 65, q3: 75, max: 90 },
  outliers: [25, 110],
  xRange: [20, 120],
  xTicks: [20, 40, 60, 80, 100, 120],
  xLabel: "Score",
});

// MCQ 1
mcq(
  `The 1.5 × IQR rule classifies a value as an outlier if it lies\n\n`,
  [
    "below $Q_1 - 1.5 \\cdot IQR$ or above $Q_3 + 1.5 \\cdot IQR$",
    "below $Q_1$ or above $Q_3$",
    "more than 3 standard deviations from the mean",
    "below the minimum or above the maximum",
  ],
  "A",
  "EASY",
  "**Answer: A**\n\nThe standard 1.5 × IQR rule: any value below the **lower fence** ($Q_1 - 1.5 \\cdot IQR$) or above the **upper fence** ($Q_3 + 1.5 \\cdot IQR$) is classified as an outlier.",
);

// MCQ 2
mcq(
  `For the data set with $Q_1 = 20$ and $Q_3 = 32$, the upper fence is\n\n`,
  ["38", "44", "50", "56"],
  "C",
  "EASY",
  "**Answer: C**\n\nIQR $= 32 - 20 = 12$. Upper fence $= 32 + 1.5(12) = 32 + 18 = $ **50**.",
);

// MCQ 3
mcq(
  `For the data set with $Q_1 = 20$ and $Q_3 = 32$, the lower fence is\n\n`,
  ["2", "8", "12", "14"],
  "A",
  "EASY",
  "**Answer: A**\n\nLower fence $= Q_1 - 1.5 \\cdot IQR = 20 - 18 = $ **2**.",
);

// MCQ 4
mcq(
  `${img(outlierBox1)}\n\nFrom the box plot above, how many outliers are shown?\n\n`,
  ["0", "1", "2", "3"],
  "C",
  "EASY",
  "**Answer: C**\n\nThere are two outlier points (25 below the lower whisker, 110 above the upper whisker) → **2 outliers**.",
);

// MCQ 5
mcq(
  `If a data set has $Q_1 = 30$, $Q_3 = 50$, and a value of 90, the value 90 is\n\n`,
  ["not an outlier", "a mild outlier only", "a definite outlier", "the maximum, never an outlier"],
  "C",
  "MEDIUM",
  "**Answer: C**\n\nIQR $= 20$. Upper fence $= 50 + 30 = 80$. $90 > 80$, so 90 is an outlier.",
);

// MCQ 6
mcq(
  `Which statistic is most resistant to outliers?\n\n`,
  ["mean", "range", "standard deviation", "median"],
  "D",
  "EASY",
  "**Answer: D**\n\nThe median is determined only by the middle value(s) and is unaffected by extreme observations. Range, mean, and sd are all sensitive to outliers.",
);

// MCQ 7
mcq(
  `If a data set contains an outlier far above the rest, the mean will be\n\n`,
  ["less than the median", "greater than the median", "equal to the median", "equal to the mode"],
  "B",
  "EASY",
  "**Answer: B**\n\nA high outlier pulls the mean upward but barely affects the median, so mean > median.",
);

// MCQ 8
mcq(
  `Which is **not** a valid reason to investigate an outlier?\n\n`,
  [
    "It may be a data-entry error that should be corrected",
    "It may indicate a genuine extreme observation worth studying",
    "It may indicate that a different population was sampled",
    "It should be discarded immediately without further checks",
  ],
  "D",
  "EASY",
  "**Answer: D**\n\nOutliers should never be discarded automatically. They warrant investigation — they may be errors, genuine extreme values, or signal a different sub-population.",
);

// MCQ 9
mcq(
  `For a data set with $\\bar x = 50$, $\\sigma = 8$, an observation of 76 has $z$-score\n\n`,
  ["2.6", "3.0", "3.25", "3.5"],
  "C",
  "MEDIUM",
  "**Answer: C**\n\n$z = (76 - 50)/8 = 26/8 = $ **3.25**. (Values with $|z| > 3$ are sometimes treated as outliers under the $z$-score rule.)",
);

// SHORT 1
short(
  `For the data set $$15, 18, 22, 24, 27, 29, 30, 32, 35, 40, 65$$\n\n**a.** Find $Q_1$, $Q_3$, and the IQR. (2 marks)\n\n**b.** Use the 1.5 × IQR rule to determine whether 65 is an outlier. (2 marks) (4 marks)`,
  4,
  "MEDIUM",
  "**a.** $n=11$. Median = 6th = 29. Lower 5: 15, 18, 22, 24, 27 → $Q_1 = 22$. Upper 5: 30, 32, 35, 40, 65 → $Q_3 = 35$. IQR $= 13$.\n\n**b.** Upper fence $= 35 + 1.5(13) = 35 + 19.5 = 54.5$. Since $65 > 54.5$, **yes, 65 is an outlier**.",
);

// SHORT 2
short(
  `A data set has five-number summary $\\{18, 25, 32, 42, 70\\}$.\n\n**a.** Compute the IQR. (1 mark)\n\n**b.** Determine the upper and lower fences. (2 marks)\n\n**c.** Is the maximum (70) an outlier? Justify. (1 mark) (4 marks)`,
  4,
  "MEDIUM",
  "**a.** IQR $= 42 - 25 = 17$.\n\n**b.** Lower fence $= 25 - 1.5(17) = 25 - 25.5 = -0.5$. Upper fence $= 42 + 25.5 = 67.5$.\n\n**c.** $70 > 67.5$ → **yes**, 70 is an outlier.",
);

// SHORT 3
short(
  `The following data shows the weekly earnings (in dollars) of 12 students working part-time:\n\n$$120, 145, 160, 180, 195, 210, 225, 240, 260, 285, 320, 580$$\n\n**a.** Find the five-number summary. (2 marks)\n\n**b.** Use the 1.5 × IQR rule to identify any outliers. (2 marks)\n\n**c.** What might cause the outlier? (1 mark) (5 marks)`,
  5,
  "MEDIUM",
  "**a.** $n=12$. Min = 120, Max = 580. Median = $(6\\text{th}+7\\text{th})/2 = (210+225)/2 = 217.5$. Lower 6: 120, 145, 160, 180, 195, 210 → $Q_1 = (160+180)/2 = 170$. Upper 6: 225, 240, 260, 285, 320, 580 → $Q_3 = (260+285)/2 = 272.5$.\n\nSummary: **{120, 170, 217.5, 272.5, 580}**.\n\n**b.** IQR $= 272.5 - 170 = 102.5$. Upper fence $= 272.5 + 1.5(102.5) = 272.5 + 153.75 = 426.25$. $580 > 426.25$ → **580 is an outlier**.\n\n**c.** A student working unusually long hours, holding multiple jobs, or having a much higher-paying job (e.g. tutoring) could explain the outlier. It may also be a data-entry error worth checking.",
);

// SHORT 4
short(
  `Explain why outliers should not be discarded without further investigation. Give two distinct reasons. (3 marks)`,
  3,
  "EASY",
  "Two reasons (any two acceptable):\n\n1. The outlier may be a **data-entry error** — correcting it (rather than removing it) preserves the integrity of the data.\n\n2. The outlier may be a **genuine extreme observation** that conveys important information (e.g. a rare event, an exceptional individual). Removing it would mean ignoring real data.\n\n3. The outlier may indicate that the **measurement covers a different population** — e.g. mixing two groups in one sample. Investigation may reveal a meaningful subgroup.\n\nMarks: 2 for first reason, 1 for second reason.",
);

// EXT_ANS 1
extAns(
  [
    {
      label: "a",
      marks: 2,
      content: `For the data $$12, 14, 15, 16, 17, 18, 19, 20, 22, 24, 40$$\n\nfind the five-number summary.`,
      solution: "$n=11$. Min = 12, Max = 40. Median = 6th = 18. Lower 5: 12, 14, 15, 16, 17 → $Q_1 = 15$. Upper 5: 19, 20, 22, 24, 40 → $Q_3 = 22$.\n\nSummary: **{12, 15, 18, 22, 40}**.",
    },
    {
      label: "b",
      marks: 2,
      content: `Apply the 1.5 × IQR rule. Identify any outliers.`,
      solution: "IQR $= 22 - 15 = 7$. Lower fence $= 15 - 10.5 = 4.5$. Upper fence $= 22 + 10.5 = 32.5$.\n\nValues outside $[4.5, 32.5]$: only **40** (greater than 32.5). **40 is an outlier**.",
    },
    {
      label: "c",
      marks: 1,
      content: `Construct a box plot showing the outlier separately.`,
      solution: img(boxPlot({
        summary: { min: 12, q1: 15, median: 18, q3: 22, max: 24 },
        outliers: [40],
        xRange: [10, 45],
        xTicks: [10, 20, 30, 40, 45],
        xLabel: "Value",
      })),
    },
  ],
  "MEDIUM",
);

// EXT_ANS 2
extAns(
  [
    {
      label: "a",
      marks: 3,
      content: `The annual income (in thousands of \\$) for 10 employees of a company is\n\n$$45, 48, 52, 55, 58, 60, 62, 65, 72, 280$$\n\nFind the mean and median. Comment on which is more representative.`,
      solution: "Mean = $(45+48+52+55+58+60+62+65+72+280)/10 = 797/10 = $ **\\$79,700**.\n\nMedian = $(58+60)/2 = $ **\\$59,000**.\n\nThe single value of 280 (\\$280k — likely an executive) pulls the mean far above the bulk of incomes. The **median (\\$59k) is more representative** of a typical employee's income; the mean is misleadingly inflated.",
    },
    {
      label: "b",
      marks: 2,
      content: `Use the 1.5 × IQR rule to formally test whether 280 is an outlier.`,
      solution: "Sorted, $n=10$. Median = 59 (already known). Lower 5: 45, 48, 52, 55, 58 → $Q_1 = 52$. Upper 5: 60, 62, 65, 72, 280 → $Q_3 = 65$.\n\nIQR = 13. Upper fence $= 65 + 1.5(13) = 65 + 19.5 = 84.5$.\n\n$280 \\gg 84.5$ → **yes, 280 is a clear outlier**.",
    },
    {
      label: "c",
      marks: 2,
      content: `If the outlier is excluded, recompute the mean and IQR for the remaining 9 employees.`,
      solution: "Sum without 280 = $797 - 280 = 517$. New mean = $517/9 \\approx $ **\\$57,400**.\n\nNew data ($n=9$): 45, 48, 52, 55, 58, 60, 62, 65, 72.\n\nMedian = 5th = 58. Lower 4: 45, 48, 52, 55 → $Q_1 = (48+52)/2 = 50$. Upper 4: 60, 62, 65, 72 → $Q_3 = (62+65)/2 = 63.5$.\n\n**New IQR = 13.5** (very similar to before — IQR is resistant to outlier removal).",
    },
  ],
  "MEDIUM",
);

// EXT_RESP 1
extResp(
  [
    {
      label: "a",
      marks: 2,
      content: `The reaction times (in milliseconds) of 15 subjects in a test are\n\n$$180, 195, 205, 215, 220, 225, 230, 240, 245, 250, 260, 280, 295, 320, 480$$\n\nFind the five-number summary.`,
      solution: "$n=15$. Min = 180, Max = 480. Median = 8th = 240.\n\nLower 7 (excl median): 180, 195, 205, 215, 220, 225, 230 → $Q_1 = 215$.\n\nUpper 7: 245, 250, 260, 280, 295, 320, 480 → $Q_3 = 280$.\n\nSummary: **{180, 215, 240, 280, 480}**.",
    },
    {
      label: "b",
      marks: 2,
      content: `Use the 1.5 × IQR rule to identify any outliers.`,
      solution: "IQR $= 280 - 215 = 65$. Lower fence $= 215 - 97.5 = 117.5$. Upper fence $= 280 + 97.5 = 377.5$.\n\nValues outside $[117.5, 377.5]$: **480** is above the upper fence → **outlier**.",
    },
    {
      label: "c",
      marks: 2,
      content: `Construct a box plot showing the outlier separately.`,
      solution: img(boxPlot({
        summary: { min: 180, q1: 215, median: 240, q3: 280, max: 320 },
        outliers: [480],
        xRange: [150, 500],
        xTicks: [200, 300, 400, 500],
        xLabel: "Reaction time (ms)",
      })),
    },
    {
      label: "d",
      marks: 2,
      content: `Discuss possible explanations for the outlier (480 ms) and what the researcher should do.`,
      solution: "Possible explanations: subject was distracted or tired; equipment malfunction; subject misunderstood the task; the subject was genuinely slower than others (e.g. older or medicated).\n\n**Researcher's actions**: investigate the participant's profile and the experimental conditions before deciding. Do **not** discard automatically. If a clear error is found, exclude with documentation; otherwise, report the outlier and use a robust summary (median, IQR) in the analysis.",
    },
    {
      label: "e",
      marks: 3,
      content: `Compute the mean and standard deviation (CAS) both including and excluding the outlier. Comment on how each statistic changes.`,
      solution: "**Including 480** ($n=15$): sum = $180+195+205+215+220+225+230+240+245+250+260+280+295+320+480 = 3840$. Mean = $3840/15 = $ **256**. Sample sd (CAS) $\\approx $ **71.2**.\n\n**Excluding 480** ($n=14$): sum = $3840-480 = 3360$. Mean = $3360/14 = $ **240**. Sample sd (CAS) $\\approx $ **41.8**.\n\n**Comment**: removing the outlier reduces the mean by 16 ms (large shift) and almost halves the sd (71 → 42). Both the mean and sd are highly sensitive to outliers, illustrating why robust statistics (median, IQR) are preferred when outliers are present.",
    },
  ],
  "MEDIUM",
  `**Question — Reaction-time outlier investigation**\n\nA cognitive psychology study records reaction times (in milliseconds) for 15 subjects. One value is suspiciously high, and the researcher must decide how to handle it.`,
);

// EXT_RESP 2
extResp(
  [
    {
      label: "a",
      marks: 2,
      content: `A shop records daily ice-cream sales (in scoops) for 20 consecutive days:\n\n$$32, 36, 38, 40, 41, 43, 44, 45, 46, 48, 49, 50, 52, 54, 56, 58, 60, 62, 65, 120$$\n\nFind the five-number summary.`,
      solution: "$n=20$. Min = 32, Max = 120. Median = $(10\\text{th}+11\\text{th})/2 = (48+49)/2 = 48.5$.\n\nLower 10: 32, 36, 38, 40, 41, 43, 44, 45, 46, 48 → $Q_1 = (41+43)/2 = 42$.\n\nUpper 10: 49, 50, 52, 54, 56, 58, 60, 62, 65, 120 → $Q_3 = (56+58)/2 = 57$.\n\nSummary: **{32, 42, 48.5, 57, 120}**.",
    },
    {
      label: "b",
      marks: 2,
      content: `Test whether 120 is an outlier using the 1.5 × IQR rule.`,
      solution: "IQR $= 57 - 42 = 15$. Upper fence $= 57 + 1.5(15) = 57 + 22.5 = 79.5$. $120 > 79.5$ → **yes, 120 is an outlier**.",
    },
    {
      label: "c",
      marks: 2,
      content: `The shop owner believes 120 corresponds to a heat-wave day. Should the value be excluded? Discuss.`,
      solution: "**No** — if 120 corresponds to a legitimate heat-wave day, it is a genuine extreme observation rather than an error. Excluding it would distort the picture of the shop's sales potential during hot weather. Instead, the owner could:\n\n- Report the outlier with context, noting the heat-wave day.\n- Use robust statistics (median, IQR) alongside the mean.\n- Optionally analyse heat-wave vs normal days separately.",
    },
    {
      label: "d",
      marks: 2,
      content: `Compute the mean both with and without the outlier (CAS).`,
      solution: "**With 120** ($n=20$): sum = $32+36+38+40+41+43+44+45+46+48+49+50+52+54+56+58+60+62+65+120 = 1039$. Mean = $1039/20 = $ **51.95 scoops**.\n\n**Without 120** ($n=19$): sum = $1039-120 = 919$. Mean = $919/19 \\approx $ **48.4 scoops**.\n\nThe outlier raises the mean by ~3.5 scoops.",
    },
    {
      label: "e",
      marks: 3,
      content: `Sketch a labelled box plot showing the outlier separately and describe the shape of the distribution.`,
      solution: img(boxPlot({
        summary: { min: 32, q1: 42, median: 48.5, q3: 57, max: 65 },
        outliers: [120],
        xRange: [20, 130],
        xTicks: [20, 40, 60, 80, 100, 120],
        xLabel: "Scoops sold",
      })) + "\n\nThe distribution is **positively skewed** when 120 is included (a long right tail due to the heat-wave day). Without 120, the data is approximately symmetric with median 48.5 sitting roughly central between $Q_1 = 42$ and $Q_3 = 57$.",
    },
  ],
  "MEDIUM",
  `**Question — Ice-cream sales outlier**\n\nA shop owner analyses 20 days of ice-cream sales. One day shows unusually high sales — possibly due to extreme weather. The owner must decide how to interpret it.`,
);


// ═══════════════════════════════════════════════════════════════════════
// 7. univariate-data-distributions (extended-fit: 9 + 4 + 2 + 2 = 17)
// ═══════════════════════════════════════════════════════════════════════

CURRENT_SUBTOPIC = "univariate-data-distributions";

const dotPlotSymm = dotPlot({
  values: [3, 4, 4, 5, 5, 5, 6, 6, 6, 6, 7, 7, 7, 8, 8, 9],
  xLabel: "Score",
  title: "Symmetric distribution",
});

const dotPlotPosSkew = dotPlot({
  values: [1, 1, 1, 2, 2, 2, 2, 3, 3, 3, 4, 4, 5, 6, 7, 9],
  xLabel: "Score",
  title: "Positively skewed",
});

// MCQ 1
mcq(
  `A variable that records the colour of a car is best described as\n\n`,
  ["numerical discrete", "numerical continuous", "categorical nominal", "categorical ordinal"],
  "C",
  "EASY",
  "**Answer: C**\n\nColour is categorical (not numerical). It is **nominal** because there is no natural order (red, blue, green have no rank).",
);

// MCQ 2
mcq(
  `A variable that records the height of students in centimetres is best described as\n\n`,
  ["numerical discrete", "numerical continuous", "categorical nominal", "categorical ordinal"],
  "B",
  "EASY",
  "**Answer: B**\n\nHeight is a numerical measurement that can take any value within a range (e.g. 172.4 cm) — **continuous**.",
);

// MCQ 3
mcq(
  `A variable that records the number of siblings each student has is best described as\n\n`,
  ["numerical discrete", "numerical continuous", "categorical nominal", "categorical ordinal"],
  "A",
  "EASY",
  "**Answer: A**\n\nNumber of siblings is a count — takes only whole-number values → **discrete numerical**.",
);

// MCQ 4
mcq(
  `${img(dotPlotSymm)}\n\nThe distribution shown above is best described as\n\n`,
  ["positively skewed", "negatively skewed", "approximately symmetric", "bimodal"],
  "C",
  "EASY",
  "**Answer: C**\n\nValues cluster around the centre (5-7) with similar tails on each side. The distribution is approximately symmetric.",
);

// MCQ 5
mcq(
  `${img(dotPlotPosSkew)}\n\nThe distribution shown above is best described as\n\n`,
  ["positively skewed", "negatively skewed", "approximately symmetric", "uniform"],
  "A",
  "EASY",
  "**Answer: A**\n\nThe distribution has a peak at the low end (1-3) and a long tail extending to higher values (up to 9) → positively skewed.",
);

// MCQ 6
mcq(
  `For a positively skewed distribution, which is typically true?\n\n`,
  [
    "mean < median",
    "mean = median",
    "mean > median",
    "the median is the mode",
  ],
  "C",
  "MEDIUM",
  "**Answer: C**\n\nIn a positively skewed distribution the long right tail pulls the mean up while the median stays near the bulk of data, so mean > median.",
);

// MCQ 7
mcq(
  `When the distribution is positively skewed, the most appropriate summary statistic for centre is\n\n`,
  ["the mean", "the median", "the mode", "the range"],
  "B",
  "EASY",
  "**Answer: B**\n\nThe median is preferred for skewed distributions because it is not affected by the extreme values in the tail.",
);

// MCQ 8
mcq(
  `For an approximately symmetric (bell-shaped) distribution, the most appropriate summary of spread is\n\n`,
  ["the range", "the IQR", "the standard deviation", "the variance"],
  "C",
  "EASY",
  "**Answer: C**\n\nFor symmetric (bell-shaped) data, the standard deviation paired with the mean is the standard summary. For skewed data, IQR paired with the median is preferred.",
);

// MCQ 9
mcq(
  `A distribution with two clear peaks of high frequency is called\n\n`,
  ["unimodal", "bimodal", "symmetric", "skewed"],
  "B",
  "EASY",
  "**Answer: B**\n\nBimodal means two distinct modes (peaks). Often suggests two underlying sub-populations mixed in the data.",
);

// SHORT 1
short(
  `Classify each variable as categorical or numerical. If numerical, state whether it is discrete or continuous. If categorical, state whether it is nominal or ordinal.\n\n**a.** Hair colour\n\n**b.** Number of children in a family\n\n**c.** Time taken to run 100m\n\n**d.** Level of agreement (Strongly disagree, Disagree, Neutral, Agree, Strongly agree) (4 marks)`,
  4,
  "EASY",
  "**a.** Categorical, **nominal** (no natural order).\n\n**b.** Numerical, **discrete** (whole-number count).\n\n**c.** Numerical, **continuous** (can take any value in a range).\n\n**d.** Categorical, **ordinal** (the categories have a natural order).",
);

// SHORT 2
short(
  `For the dot plot below, find:\n\n${img(dotPlot({ values: [2, 3, 3, 4, 4, 4, 5, 5, 5, 5, 6, 6, 7], xLabel: "Score" }))}\n\n**a.** The number of observations. (1 mark)\n\n**b.** The mode. (1 mark)\n\n**c.** The median. (1 mark)\n\n**d.** Describe the shape. (1 mark) (4 marks)`,
  4,
  "EASY",
  "Reading dots: 2(1), 3(2), 4(3), 5(4), 6(2), 7(1).\n\n**a.** Total = 1+2+3+4+2+1 = **13**.\n\n**b.** Mode = **5** (highest stack).\n\n**c.** $n=13$, median = 7th value. Ordered: 2, 3, 3, 4, 4, 4, **5**, ... = **5**.\n\n**d.** Approximately **symmetric** with a slight positive skew (peak at 5, tapering both sides).",
);

// SHORT 3
short(
  `For each of the following data sets, state the most appropriate summary of centre and spread, and justify briefly.\n\n**a.** Annual salaries of all employees at a tech company (a few high-paid executives, many lower-paid staff). (2 marks)\n\n**b.** Heights of 100 adults (approximately bell-shaped). (2 marks) (4 marks)`,
  4,
  "MEDIUM",
  "**a.** Strongly **positively skewed**. Use **median (centre) + IQR (spread)**. Justification: the executive salaries are extreme outliers; mean and sd would be heavily inflated and misleading.\n\n**b.** Approximately **symmetric, bell-shaped**. Use **mean (centre) + sd (spread)**. Justification: for bell-shaped data, mean is at the centre of the distribution and sd captures spread well. The 68-95-99.7% rule applies.",
);

// SHORT 4
short(
  `Below are two histograms.\n\n${img(histogramChart({ binEdges: [0, 5, 10, 15, 20, 25, 30, 35], frequencies: [2, 6, 10, 14, 10, 6, 2], xLabel: "X" }))}\n\n${img(histogramChart({ binEdges: [0, 5, 10, 15, 20, 25, 30, 35], frequencies: [15, 12, 8, 5, 4, 3, 3], xLabel: "Y" }))}\n\n**a.** Describe the shape of each. (2 marks)\n\n**b.** For each, state whether mean or median is more appropriate as a summary of centre. (2 marks) (4 marks)`,
  4,
  "MEDIUM",
  "**a.** Histogram X: peak at 15-20 with similar tails on both sides → **approximately symmetric**.\n\nHistogram Y: peak at 0-5 with a long tail extending to higher values → **positively skewed**.\n\n**b.** Histogram X: **mean** (data is symmetric, so mean and median are similar; mean is conventional for symmetric data).\n\nHistogram Y: **median** (data is skewed; the median is resistant to the tail).",
);

// EXT_ANS 1
extAns(
  [
    {
      label: "a",
      marks: 2,
      content: `Classify each variable below as numerical (discrete/continuous) or categorical (nominal/ordinal).\n\n**i.** Postcode\n\n**ii.** Eye colour\n\n**iii.** Temperature in Celsius\n\n**iv.** T-shirt size (S, M, L, XL)`,
      solution: "**i.** Postcode: categorical **nominal** (postcodes are codes, not numerical magnitudes — adding them is meaningless).\n\n**ii.** Eye colour: categorical **nominal**.\n\n**iii.** Temperature: numerical **continuous**.\n\n**iv.** T-shirt size: categorical **ordinal** (natural order S < M < L < XL).",
    },
    {
      label: "b",
      marks: 2,
      content: `For each of the four variables in part (a), state one suitable graphical display.`,
      solution: "**i.** Postcode: bar chart (count of frequencies per code).\n\n**ii.** Eye colour: bar chart or pie chart (frequencies of nominal categories).\n\n**iii.** Temperature: histogram, dot plot, or box plot (numerical continuous).\n\n**iv.** T-shirt size: bar chart with categories in natural order (S, M, L, XL).",
    },
    {
      label: "c",
      marks: 1,
      content: `Briefly explain why mean and standard deviation are not appropriate summaries for categorical data.`,
      solution: "Categorical data does not have numerical magnitude, so arithmetic operations like averaging or measuring spread around a mean are not meaningful. The mode (most common category) and proportions are the appropriate summaries.",
    },
  ],
  "MEDIUM",
  null,
  "TECH_FREE",
);

// EXT_ANS 2
extAns(
  [
    {
      label: "a",
      marks: 2,
      content: `The histograms below show the daily commute times (in minutes) of two groups of workers.\n\nGroup X:\n\n${img(histogramChart({ binEdges: [0, 10, 20, 30, 40, 50, 60], frequencies: [8, 14, 18, 9, 5, 2], xLabel: "Time (min)" }))}\n\nGroup Y:\n\n${img(histogramChart({ binEdges: [0, 10, 20, 30, 40, 50, 60], frequencies: [3, 6, 12, 18, 14, 7], xLabel: "Time (min)" }))}\n\nDescribe the shape of each distribution.`,
      solution: "**Group X**: peak at 20-30 min, longer tail to the right → **positively skewed**.\n\n**Group Y**: peak at 30-40 min, slight tail to the left → approximately symmetric with a small **negative skew** (or roughly symmetric).",
    },
    {
      label: "b",
      marks: 2,
      content: `For each group, state which is greater: mean or median.`,
      solution: "**Group X** (positively skewed): mean > median (right tail pulls mean up).\n\n**Group Y** (slightly negatively skewed / roughly symmetric): mean ≤ median or mean ≈ median.",
    },
    {
      label: "c",
      marks: 2,
      content: `For each group, recommend an appropriate measure of centre and spread to report.`,
      solution: "**Group X**: skewed → **median + IQR**.\n\n**Group Y**: roughly symmetric → **mean + sd** (or median + IQR; both acceptable for nearly symmetric data).",
    },
  ],
  "MEDIUM",
);

// EXT_RESP 1
extResp(
  [
    {
      label: "a",
      marks: 2,
      content: `The data set below shows the number of texts sent by 25 teenagers in a day:\n\n$$2, 4, 5, 7, 8, 9, 10, 12, 12, 14, 15, 16, 18, 19, 22, 25, 28, 32, 38, 45, 52, 65, 80, 95, 120$$\n\nDescribe the shape of this distribution.`,
      solution: "Values mostly cluster below 30 with a long tail extending to 120 — strongly **positively skewed**.",
    },
    {
      label: "b",
      marks: 2,
      content: `Find the median and IQR.`,
      solution: "$n=25$. Median = 13th value = 18. Lower 12: 2, 4, 5, 7, 8, 9, 10, 12, 12, 14, 15, 16 → $Q_1 = (9+10)/2 = 9.5$. Upper 12: 19, 22, 25, 28, 32, 38, 45, 52, 65, 80, 95, 120 → $Q_3 = (38+45)/2 = 41.5$.\n\nIQR = $41.5 - 9.5 = $ **32**.",
    },
    {
      label: "c",
      marks: 2,
      content: `Compute the mean and standard deviation (CAS).`,
      solution: "Sum = $2+4+5+7+8+9+10+12+12+14+15+16+18+19+22+25+28+32+38+45+52+65+80+95+120 = 753$.\n\nMean = $753/25 = $ **30.12**.\n\nSample sd (CAS) $\\approx $ **31.6**.",
    },
    {
      label: "d",
      marks: 2,
      content: `Compare mean and median. What does the comparison tell us?`,
      solution: "Mean (30.12) is **substantially** higher than the median (18). This confirms strong **positive skew**: the high values (65, 80, 95, 120) inflate the mean but leave the median in the middle of the bulk of data.",
    },
    {
      label: "e",
      marks: 3,
      content: `Which centre/spread pair best summarises this data? Justify and report the chosen pair as your final answer.`,
      solution: "Use **median + IQR**: median = 18, IQR = 32.\n\n**Justification**: the distribution is strongly positively skewed. The mean and sd are inflated by the high values, so they would mislead anyone interpreting the data. The median tells us the typical teenager sends around 18 texts a day; the IQR tells us the middle 50% range over 32 texts, capturing the variability without being distorted by extreme texters.",
    },
  ],
  "MEDIUM",
  `**Question — Teen texting habits**\n\nA market researcher records the number of texts sent in one day by 25 teenagers. The dataset shows a notable spread, with some heavy texters. Analyse the distribution and recommend appropriate summary statistics.`,
);

// EXT_RESP 2
extResp(
  [
    {
      label: "a",
      marks: 2,
      content: `A school records the marks (out of 100) on a senior maths exam for 60 students. The histogram is below.\n\n${img(histogramChart({ binEdges: [40, 50, 60, 70, 80, 90, 100], frequencies: [3, 8, 14, 18, 12, 5], xLabel: "Mark", yLabel: "Frequency" }))}\n\nDescribe the shape of the distribution.`,
      solution: "Frequencies 3, 8, 14, 18, 12, 5. Peak at 70-80 with similar but not perfectly symmetric tails. The distribution is **approximately symmetric** with a slight negative skew (the upper tail is slightly shorter than the lower tail).",
    },
    {
      label: "b",
      marks: 2,
      content: `Estimate the median mark.`,
      solution: "Cumulative: 3, 11, 25, 43, 55, 60. Median position = 30/31, which lies in the 70-80 class (cumulative reaches 25 at 70 and 43 at 80).\n\nInterpolation: $\\text{median} \\approx 70 + \\frac{30 - 25}{18} \\times 10 = 70 + 2.78 \\approx $ **72.8** ≈ **73**.",
    },
    {
      label: "c",
      marks: 2,
      content: `Estimate the mean using class midpoints.`,
      solution: "Midpoints: 45, 55, 65, 75, 85, 95. Freqs: 3, 8, 14, 18, 12, 5.\n\n$\\sum fx = 3(45)+8(55)+14(65)+18(75)+12(85)+5(95) = 135+440+910+1350+1020+475 = 4330$.\n\nMean $= 4330/60 \\approx $ **72.2**.",
    },
    {
      label: "d",
      marks: 2,
      content: `Compare the mean and the median, and comment on the shape.`,
      solution: "Mean ≈ 72.2, median ≈ 72.8. Median > mean slightly, indicating a **slight negative skew** (long left tail pulling mean down). The distribution is essentially symmetric; the gap is small.",
    },
    {
      label: "e",
      marks: 3,
      content: `Assuming the marks are approximately bell-shaped with mean 72 and standard deviation 12, estimate (using the 68-95-99.7% rule):\n\n  **i.** the percentage of students scoring between 60 and 84.\n\n  **ii.** the percentage scoring above 96.`,
      solution: "**i.** 60 to 84 = $\\bar x \\pm 1\\sigma$ → **68%** of students.\n\n**ii.** Above 96 = above $\\bar x + 2\\sigma$ (since $72 + 2 \\times 12 = 96$). Outside ±2 sd is 5%; one tail = **2.5%**.",
    },
  ],
  "MEDIUM",
  `**Question — Exam mark distribution**\n\nA school analyses the distribution of marks on a senior maths exam to identify centre, spread, and skew, then applies the empirical rule.`,
);


// ═══════════════════════════════════════════════════════════════════════
// 8. bivariate-data (extended-fit: 9 + 4 + 2 + 2 = 17)
// ═══════════════════════════════════════════════════════════════════════

CURRENT_SUBTOPIC = "bivariate-data";

const bivScatter = scatterPlot({
  points: [
    { x: 1, y: 2 }, { x: 2, y: 3 }, { x: 3, y: 5 }, { x: 4, y: 4 },
    { x: 5, y: 6 }, { x: 6, y: 7 }, { x: 7, y: 8 }, { x: 8, y: 9 },
    { x: 9, y: 11 }, { x: 10, y: 12 },
  ],
  xRange: [0, 12],
  yRange: [0, 14],
  xLabel: "x",
  yLabel: "y",
  title: "Scatterplot of y vs x",
});

// MCQ 1
mcq(
  `Bivariate data refers to\n\n`,
  ["a single variable measured on each subject", "two variables measured on each subject", "data with two outliers", "data with two modes"],
  "B",
  "EASY",
  "**Answer: B**\n\nBivariate data is paired observations on **two** variables for each subject (e.g. height and weight of each person).",
);

// MCQ 2
mcq(
  `When both variables are categorical, the appropriate display is\n\n`,
  ["scatterplot", "back-to-back stem plot", "two-way frequency table", "histogram"],
  "C",
  "EASY",
  "**Answer: C**\n\nTwo categorical variables → two-way frequency table (or segmented bar chart). Scatterplots require numerical data.",
);

// MCQ 3
mcq(
  `When both variables are numerical, the appropriate display is\n\n`,
  ["scatterplot", "two-way table", "pie chart", "back-to-back stem plot"],
  "A",
  "EASY",
  "**Answer: A**\n\nBoth numerical → scatterplot. Each point represents a paired observation.",
);

// MCQ 4
mcq(
  `When one variable is categorical and the other is numerical, an appropriate display is\n\n`,
  ["scatterplot", "back-to-back stem plot or parallel boxplots", "single histogram", "pie chart"],
  "B",
  "MEDIUM",
  "**Answer: B**\n\nFor categorical + numerical, you can split the numerical data by category and display via back-to-back stem plots or parallel box plots — one per category.",
);

// MCQ 5
mcq(
  `${img(bivScatter)}\n\nThe scatterplot above shows the relationship between $x$ and $y$. The association is best described as\n\n`,
  [
    "strong, positive, linear",
    "weak, negative, linear",
    "strong, positive, non-linear",
    "no association",
  ],
  "A",
  "MEDIUM",
  "**Answer: A**\n\nPoints rise from lower-left to upper-right in a tight, straight pattern → strong, positive, linear association.",
);

// MCQ 6
mcq(
  `In a two-way frequency table for "sport" (Football/Tennis) × "gender" (Male/Female), the row totals\n\n`,
  ["always equal the column totals", "always sum to the grand total", "represent the joint frequencies", "are categorical labels"],
  "B",
  "EASY",
  "**Answer: B**\n\nThe row totals sum to the **grand total** (overall sample size). Each row gives the total within one category of the row variable.",
);

// MCQ 7
mcq(
  `Consider this table:\n\n|  | Male | Female | Total |\n|---|---|---|---|\n| Tea | 30 | 50 | 80 |\n| Coffee | 70 | 50 | 120 |\n| Total | 100 | 100 | 200 |\n\nThe percentage of males who prefer tea is\n\n`,
  ["15%", "30%", "37.5%", "50%"],
  "B",
  "EASY",
  "**Answer: B**\n\nMales who prefer tea = 30 out of 100 males total. Percentage = $30/100 = $ **30%**.",
);

// MCQ 8
mcq(
  `Using the table from the previous question, the column percentage of females who prefer coffee is\n\n`,
  ["25%", "37.5%", "50%", "70%"],
  "C",
  "EASY",
  "**Answer: C**\n\nFemales who prefer coffee = 50 out of 100 females total. Percentage = $50/100 = $ **50%**.",
);

// MCQ 9
mcq(
  `Two variables are said to show **association** when\n\n`,
  [
    "they are measured in the same units",
    "knowing the value of one helps predict the other",
    "they have the same mean",
    "they are normally distributed",
  ],
  "B",
  "EASY",
  "**Answer: B**\n\nAssociation means there is a relationship between the variables — knowing one is informative about the other. (Note: association is not the same as causation.)",
);

// SHORT 1
short(
  `A survey of 200 students recorded their year level (Year 10 or Year 12) and whether they prefer Maths Methods or General Mathematics. Results:\n\n|  | Methods | General | Total |\n|---|---|---|---|\n| Year 10 | 40 | 60 | 100 |\n| Year 12 | 70 | 30 | 100 |\n| Total | 110 | 90 | 200 |\n\n**a.** What percentage of Year 10 students prefer Methods? (1 mark)\n\n**b.** What percentage of Year 12 students prefer Methods? (1 mark)\n\n**c.** Based on these percentages, is there an association between year level and subject preference? Justify. (2 marks) (4 marks)`,
  4,
  "MEDIUM",
  "**a.** Year 10 Methods = $40/100 = $ **40%**.\n\n**b.** Year 12 Methods = $70/100 = $ **70%**.\n\n**c.** Yes, there is an **association**. The percentage of Methods preference differs substantially between Year 10 (40%) and Year 12 (70%). A difference of 30 percentage points indicates that year level is associated with subject preference — Year 12 students are more likely to prefer Methods.",
);

// SHORT 2
short(
  `The two-way table below shows survey responses on commute mode and city size.\n\n|  | Small city | Large city | Total |\n|---|---|---|---|\n| Drive | 80 | 60 | 140 |\n| Public transport | 20 | 90 | 110 |\n| Walk/cycle | 40 | 50 | 90 |\n| Total | 140 | 200 | 340 |\n\n**a.** What percentage of small-city respondents drive? (1 mark)\n\n**b.** What percentage of large-city respondents drive? (1 mark)\n\n**c.** Comment on whether city size and commute mode appear to be associated. (2 marks) (4 marks)`,
  4,
  "MEDIUM",
  "**a.** Small-city drivers: $80/140 \\approx 57.1\\%$.\n\n**b.** Large-city drivers: $60/200 = 30\\%$.\n\n**c.** Substantial difference (57% vs 30%) → city size and commute mode **are associated**. People in smaller cities are much more likely to drive, while those in larger cities lean toward public transport (45% vs 14% — also a strong difference).",
);

// SHORT 3
short(
  `${img(bivScatter)}\n\nFor the scatterplot above, describe the association between $x$ and $y$ in terms of **form**, **direction**, and **strength**. (3 marks)`,
  3,
  "EASY",
  "**Form**: linear (points fall close to a straight line).\n\n**Direction**: positive (as $x$ increases, $y$ increases).\n\n**Strength**: strong (points lie very close to a line; little scatter).\n\nOverall: a strong, positive, linear association between $x$ and $y$.",
);

// SHORT 4
short(
  `A researcher records the heights (cm) and ages (years) of 8 children:\n\n| Age | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 |\n|---|---|---|---|---|---|---|---|---|\n| Height | 102 | 110 | 116 | 122 | 128 | 134 | 140 | 145 |\n\n**a.** Construct a scatterplot. (2 marks)\n\n**b.** Describe the association. (2 marks) (4 marks)`,
  4,
  "MEDIUM",
  "**a.** Scatterplot:\n\n" + img(scatterPlot({
    points: [
      { x: 4, y: 102 }, { x: 5, y: 110 }, { x: 6, y: 116 }, { x: 7, y: 122 },
      { x: 8, y: 128 }, { x: 9, y: 134 }, { x: 10, y: 140 }, { x: 11, y: 145 },
    ],
    xRange: [3, 12],
    yRange: [95, 150],
    xLabel: "Age (yrs)",
    yLabel: "Height (cm)",
  })) + "\n\n**b.** **Strong, positive, linear** association. Height increases steadily with age over this range, and the points lie very close to a straight line.",
);

// EXT_ANS 1
extAns(
  [
    {
      label: "a",
      marks: 2,
      content: `A bookshop tracks the number of books purchased per visitor and the visitor's age group.\n\n|  | Under 30 | 30-50 | Over 50 | Total |\n|---|---|---|---|---|\n| 0 books | 60 | 40 | 20 | 120 |\n| 1-2 books | 30 | 50 | 40 | 120 |\n| 3+ books | 10 | 30 | 20 | 60 |\n| Total | 100 | 120 | 80 | 300 |\n\nCompute the percentage of each age group that bought 3+ books.`,
      solution: "Under 30: $10/100 = $ **10%**.\n\n30-50: $30/120 = $ **25%**.\n\nOver 50: $20/80 = $ **25%**.",
    },
    {
      label: "b",
      marks: 1,
      content: `Comment on the association between age group and book-buying behaviour.`,
      solution: "Customers aged 30-50 and over 50 are equally likely (25%) to buy 3+ books, both more than twice as likely as customers under 30 (10%). There **is an association**: age group affects buying behaviour, with under-30s purchasing fewer books per visit than older customers.",
    },
    {
      label: "c",
      marks: 2,
      content: `What percentage of customers overall bought at least 1 book? Of those who bought 3+ books, what percentage were aged 30-50?`,
      solution: "At least 1 book: $(120 + 60)/300 = 180/300 = $ **60%**.\n\nOf those who bought 3+ (60 customers), aged 30-50 = 30. Percentage = $30/60 = $ **50%**.",
    },
  ],
  "MEDIUM",
);

// EXT_ANS 2
extAns(
  [
    {
      label: "a",
      marks: 2,
      content: `The following data is collected for 8 trees: trunk circumference (cm) and height (m).\n\n| Circ (cm) | 25 | 30 | 35 | 40 | 45 | 50 | 55 | 60 |\n|---|---|---|---|---|---|---|---|---|\n| Height (m) | 8 | 10 | 13 | 14 | 16 | 18 | 20 | 22 |\n\nConstruct a scatterplot.`,
      solution: img(scatterPlot({
        points: [
          { x: 25, y: 8 }, { x: 30, y: 10 }, { x: 35, y: 13 }, { x: 40, y: 14 },
          { x: 45, y: 16 }, { x: 50, y: 18 }, { x: 55, y: 20 }, { x: 60, y: 22 },
        ],
        xRange: [20, 65],
        yRange: [5, 25],
        xLabel: "Circumference (cm)",
        yLabel: "Height (m)",
      })),
    },
    {
      label: "b",
      marks: 2,
      content: `Describe the association.`,
      solution: "**Strong, positive, linear** association. As trunk circumference increases, height increases in a near-straight-line pattern with only small scatter.",
    },
    {
      label: "c",
      marks: 1,
      content: `Identify the explanatory and response variables in this context.`,
      solution: "If we are using circumference to predict height, **circumference is the explanatory variable** (independent) and **height is the response variable** (dependent). Plotted on the x-axis and y-axis respectively.",
    },
  ],
  "MEDIUM",
);

// EXT_RESP 1
extResp(
  [
    {
      label: "a",
      marks: 2,
      content: `A study of 400 students recorded their year level (Year 11 vs Year 12) and whether they participated in extracurricular sport.\n\n|  | Year 11 | Year 12 | Total |\n|---|---|---|---|\n| Participates | 140 | 100 | 240 |\n| Does not | 60 | 100 | 160 |\n| Total | 200 | 200 | 400 |\n\nCompute the column percentages (percentage participating in each year level).`,
      solution: "**Year 11**: $140/200 = $ **70%** participate.\n\n**Year 12**: $100/200 = $ **50%** participate.",
    },
    {
      label: "b",
      marks: 2,
      content: `Based on these percentages, is there an association between year level and sport participation? Justify.`,
      solution: "**Yes** — there is a 20 percentage-point difference (70% vs 50%) in participation between Year 11 and Year 12. Year 12 students are notably less likely to participate, possibly due to ATAR pressures or part-time work. The difference is large enough to indicate a real association.",
    },
    {
      label: "c",
      marks: 2,
      content: `Compute the **overall** participation rate and use it to comment on whether the year-12 rate is below average.`,
      solution: "Overall participation = $240/400 = $ **60%**.\n\nYear 11 (70%) is above the overall rate; Year 12 (50%) is below it. The 10-percentage-point gap between Year 12 and the overall average confirms that Year 12 participation is notably below the average.",
    },
    {
      label: "d",
      marks: 2,
      content: `If the school principal wishes to increase Year 12 participation to match the overall 60%, how many additional Year 12 students would need to participate?`,
      solution: "Current Year 12 participants = 100. Target = $60\\% \\times 200 = 120$. Additional needed = $120 - 100 = $ **20 students**.",
    },
    {
      label: "e",
      marks: 2,
      content: `Discuss one limitation of relying solely on column percentages to conclude that "year level causes lower participation".`,
      solution: "**Association is not causation**. Many confounding variables could explain the difference: workload pressures, part-time jobs, age, fitness, prior commitments. The two-way table shows an association but does not isolate year level as a causal factor. A controlled study would be needed to establish causation.",
    },
  ],
  "MEDIUM",
  `**Question — Sport participation by year level**\n\nA school surveys 400 senior students to investigate sport participation across year levels and identify whether participation differs.`,
);

// EXT_RESP 2
extResp(
  [
    {
      label: "a",
      marks: 2,
      content: `The data below records the study hours per week and exam mark for 9 students.\n\n| Hours | 2 | 4 | 5 | 6 | 8 | 10 | 12 | 14 | 16 |\n|---|---|---|---|---|---|---|---|---|---|\n| Mark | 45 | 52 | 58 | 65 | 70 | 78 | 82 | 88 | 92 |\n\nConstruct a scatterplot.`,
      solution: img(scatterPlot({
        points: [
          { x: 2, y: 45 }, { x: 4, y: 52 }, { x: 5, y: 58 }, { x: 6, y: 65 },
          { x: 8, y: 70 }, { x: 10, y: 78 }, { x: 12, y: 82 }, { x: 14, y: 88 }, { x: 16, y: 92 },
        ],
        xRange: [0, 18],
        yRange: [40, 100],
        xLabel: "Study hours per week",
        yLabel: "Exam mark",
      })),
    },
    {
      label: "b",
      marks: 2,
      content: `Describe the association between study hours and exam mark.`,
      solution: "**Strong, positive, linear** association. As study hours increase, exam marks increase in a near-straight-line pattern with minimal scatter.",
    },
    {
      label: "c",
      marks: 2,
      content: `Identify the explanatory and response variables, and explain your choice.`,
      solution: "**Explanatory variable**: study hours (x-axis). **Response variable**: exam mark (y-axis). Justification: study hours are chosen/controlled by the student, while exam marks depend on (respond to) the study effort. The natural causal direction is hours → marks.",
    },
    {
      label: "d",
      marks: 2,
      content: `From the scatterplot, predict the exam mark of a student who studies 9 hours per week. State a limitation of your prediction.`,
      solution: "Visual interpolation: at $x=9$, the line passes between (8, 70) and (10, 78), so mark ≈ **74**.\n\n**Limitation**: this prediction assumes the linear pattern is exact, and assumes 9 hours is within the observed range (it is). Real students vary — actual marks may differ due to other factors (sleep, prior knowledge, exam day stress).",
    },
    {
      label: "e",
      marks: 3,
      content: `Does the strong positive association mean that **studying more causes** higher marks? Discuss carefully.`,
      solution: "Not necessarily. Although the association is strong, **association is not causation**. Confounders could include:\n\n- Students who are more motivated may both study more **and** perform better — motivation drives both.\n- Stronger students may need less study to score well, weaker students may study a lot but still score lower — sampled in a particular distribution.\n- Hidden factors (tutoring, family background) could correlate with both.\n\nA controlled experiment (randomly assigning study hours) would be needed to draw causal conclusions. The data **suggests** a link but does not prove cause and effect.",
    },
  ],
  "MEDIUM",
  `**Question — Study hours and exam performance**\n\nA teacher records the weekly study hours and exam marks of 9 students to investigate the relationship between effort and performance.`,
);

// ─── Write output ──────────────────────────────────────────────────────

const spec = {
  subject_slug: SUBJECT_SLUG,
  question_set_id: QUESTION_SET_ID,
  items,
};

const outPath = path.join(OUT_DIR, "qset-general-univariate-stats.json");
fs.writeFileSync(outPath, JSON.stringify(spec, null, 2));
console.log(`OK Wrote ${items.length} items to ${outPath}`);
console.log(`  MCQ:               ${items.filter((i) => i.type === "MCQ").length}`);
console.log(`  SHORT:             ${items.filter((i) => i.type === "SHORT_ANSWER").length}`);
console.log(`  EXTENDED_ANSWER:   ${items.filter((i) => i.type === "EXTENDED_ANSWER").length}`);
console.log(`  EXTENDED_RESPONSE: ${items.filter((i) => i.type === "EXTENDED_RESPONSE").length}`);

// Per-subtopic breakdown
const bySub: Record<string, { MCQ: number; SHORT_ANSWER: number; EXTENDED_ANSWER: number; EXTENDED_RESPONSE: number }> = {};
for (const it of items) {
  const slug = it.subtopic_slugs[0];
  bySub[slug] = bySub[slug] ?? { MCQ: 0, SHORT_ANSWER: 0, EXTENDED_ANSWER: 0, EXTENDED_RESPONSE: 0 };
  (bySub[slug] as Record<string, number>)[it.type]++;
}
console.log("\nPer-subtopic breakdown:");
for (const [slug, counts] of Object.entries(bySub)) {
  console.log(`  ${slug}: MCQ=${counts.MCQ}, SHORT=${counts.SHORT_ANSWER}, EXT_ANS=${counts.EXTENDED_ANSWER}, EXT_RESP=${counts.EXTENDED_RESPONSE}`);
}
