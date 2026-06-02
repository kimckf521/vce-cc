/**
 * VCE General Mathematics — cluster: algebra-sequences-matrices.
 *
 * Subtopics & counts:
 *   - arithmetic-sequences (extended-fit):              9 MCQ + 4 SHORT + 2 EXT_ANS + 2 EXT_RESP = 17
 *   - geometric-sequences (extended-fit):               9 MCQ + 4 SHORT + 2 EXT_ANS + 2 EXT_RESP = 17
 *   - recurrence-relations (modelling-rich):            7 MCQ + 4 SHORT + 2 EXT_ANS + 3 EXT_RESP = 16
 *   - matrices-and-matrix-operations (core-drill):     12 MCQ + 5 SHORT + 2 EXT_ANS + 2 EXT_RESP = 21
 *   - matrix-inverses-and-determinants (extended-fit):  9 MCQ + 4 SHORT + 2 EXT_ANS + 2 EXT_RESP = 17
 *
 * Target: ~88 items.
 */
import * as fs from "fs";
import * as path from "path";
import { toDataUri, matrixTable } from "./svg";

const OUT_DIR = path.resolve(__dirname, "../output");
const QUESTION_SET_ID = "cmpkc57xo0007ofk0uo58ws59";
const SUBJECT_SLUG = "vce-general";
const TOPIC_SLUG = "algebra-number-and-structure";

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

// ─── helpers ────────────────────────────────────────────────────────────

const mcq = (
  subtopic: string,
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
    subtopic_slugs: [subtopic],
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
  subtopic: string,
  content: string,
  marks: number,
  difficulty: Difficulty,
  solution: string,
  tech: Tech = "TECH_FREE",
) => {
  items.push({
    type: "SHORT_ANSWER",
    topic_slug: TOPIC_SLUG,
    subtopic_slugs: [subtopic],
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
  subtopic: string,
  parts: ItemPart[],
  difficulty: Difficulty,
  preamble: string,
  tech: Tech = "TECH_FREE",
) => {
  const marks = parts.reduce(
    (s, p) => s + (p.subParts && p.subParts.length > 0 ? p.subParts.reduce((ss, sp) => ss + sp.marks, 0) : p.marks),
    0,
  );
  items.push({
    type: "EXTENDED_ANSWER",
    topic_slug: TOPIC_SLUG,
    subtopic_slugs: [subtopic],
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
  subtopic: string,
  parts: ItemPart[],
  difficulty: Difficulty,
  preamble: string,
  tech: Tech = "TECH_FREE",
) => {
  const marks = parts.reduce(
    (s, p) => s + (p.subParts && p.subParts.length > 0 ? p.subParts.reduce((ss, sp) => ss + sp.marks, 0) : p.marks),
    0,
  );
  items.push({
    type: "EXTENDED_RESPONSE",
    topic_slug: TOPIC_SLUG,
    subtopic_slugs: [subtopic],
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
// SUBTOPIC 1: arithmetic-sequences (extended-fit) — 17 items
// ═══════════════════════════════════════════════════════════════════════
const AS = "arithmetic-sequences";

// MCQ × 9
mcq(
  AS,
  `For the arithmetic sequence 7, 11, 15, 19, ..., the common difference is`,
  ["3", "4", "5", "7"],
  "B",
  "EASY",
  "**Answer: B**\n\nCommon difference $d = t_2 - t_1 = 11 - 7 = 4$.",
);

mcq(
  AS,
  `The first term of an arithmetic sequence is 5 and the common difference is 3. The 10th term is`,
  ["29", "30", "32", "35"],
  "C",
  "EASY",
  "**Answer: C**\n\n$t_{10} = a + (n-1)d = 5 + 9 \\times 3 = 32$.",
);

mcq(
  AS,
  `The recurrence rule $u_{n+1} = u_n + 6$, with $u_0 = 2$, generates the sequence`,
  ["2, 6, 12, 18, ...", "2, 8, 14, 20, ...", "6, 12, 18, 24, ...", "2, 12, 18, 24, ..."],
  "B",
  "EASY",
  "**Answer: B**\n\n$u_0 = 2$, $u_1 = 2+6 = 8$, $u_2 = 8+6 = 14$, $u_3 = 14+6 = 20$.",
);

mcq(
  AS,
  `An arithmetic sequence has $t_3 = 14$ and $t_7 = 30$. The common difference is`,
  ["3", "4", "5", "8"],
  "B",
  "MEDIUM",
  "**Answer: B**\n\nDifference of indices: $7 - 3 = 4$. Difference of terms: $30 - 14 = 16$. So $d = 16/4 = 4$.",
);

mcq(
  AS,
  `The arithmetic sequence with first term 50 and common difference $-3$ first becomes negative at`,
  ["$t_{17}$", "$t_{18}$", "$t_{19}$", "$t_{20}$"],
  "B",
  "MEDIUM",
  "**Answer: B**\n\n$t_n = 50 + (n-1)(-3) = 53 - 3n$. Set $53 - 3n < 0 \\Rightarrow n > 17.67$. The first integer $n$ with $t_n < 0$ is $n = 18$ (giving $t_{18} = 53 - 54 = -1$).",
);

mcq(
  AS,
  `Which of the following sequences is **not** arithmetic?`,
  ["2, 5, 8, 11, ...", "10, 7, 4, 1, ...", "1, 4, 9, 16, ...", "$-3, -1, 1, 3, ...$"],
  "C",
  "EASY",
  "**Answer: C**\n\nThe sequence 1, 4, 9, 16 has differences 3, 5, 7 — not constant. It is the squares ($1^2, 2^2, 3^2, ...$). The other three have constant differences (3, $-3$, 2).",
);

mcq(
  AS,
  `For an arithmetic sequence, $t_n = 4n - 1$. The value of $t_{12}$ is`,
  ["44", "47", "48", "51"],
  "B",
  "EASY",
  "**Answer: B**\n\n$t_{12} = 4 \\times 12 - 1 = 47$.",
);

mcq(
  AS,
  `An arithmetic sequence has first term 8. The sum of the first 4 terms equals 56. The common difference is`,
  ["3", "4", "6", "8"],
  "B",
  "MEDIUM",
  "**Answer: B**\n\nFour terms: $8, 8+d, 8+2d, 8+3d$. Sum $= 32 + 6d = 56 \\Rightarrow 6d = 24 \\Rightarrow d = 4$.",
);

mcq(
  AS,
  `A wage increases by a fixed amount each year. In year 1 the wage is \\$45,000; in year 6 it is \\$57,500. The annual increase (common difference) is`,
  ["\\$2,000", "\\$2,500", "\\$3,000", "\\$5,000"],
  "B",
  "MEDIUM",
  "**Answer: B**\n\nDifference between term 6 and term 1: $57{,}500 - 45{,}000 = 12{,}500$ over $6 - 1 = 5$ years. Annual increase $= 12{,}500 / 5 = \\$2{,}500$.",
);

// SHORT_ANSWER × 4
short(
  AS,
  `An arithmetic sequence has first term $a = 6$ and common difference $d = 4$.\n\n**a.** Write the recurrence rule defining this sequence with initial term $u_0$. (1 mark)\n\n**b.** Find $t_{15}$. (2 marks)`,
  3,
  "EASY",
  "**a.** $u_{n+1} = u_n + 4$, $u_0 = 6$.\n\n**b.** $t_{15} = a + (n-1)d = 6 + 14 \\times 4 = 6 + 56 = \\mathbf{62}$.",
);

short(
  AS,
  `An arithmetic sequence has $t_4 = 25$ and $t_{10} = 55$.\n\n**a.** Find the common difference $d$. (2 marks)\n\n**b.** Find the first term $a$. (1 mark)\n\n**c.** Find the explicit rule $t_n$. (1 mark)`,
  4,
  "MEDIUM",
  "**a.** Difference of indices = 6, difference of terms = $55-25 = 30$. So $d = 30/6 = \\mathbf{5}$.\n\n**b.** $t_4 = a + 3d \\Rightarrow 25 = a + 15 \\Rightarrow a = \\mathbf{10}$.\n\n**c.** $t_n = a + (n-1)d = 10 + 5(n-1) = \\mathbf{5n + 5}$.",
);

short(
  AS,
  `The sequence $-3, 1, 5, 9, \\ldots$ is arithmetic.\n\n**a.** State the recurrence rule with $u_0 = -3$. (1 mark)\n\n**b.** Find the smallest $n$ for which $t_n > 100$. (3 marks)`,
  4,
  "MEDIUM",
  "**a.** $u_{n+1} = u_n + 4$, $u_0 = -3$.\n\n**b.** Treating $t_1 = -3, t_2 = 1, \\ldots$ (so first term $a = -3$, $d = 4$): $t_n = -3 + (n-1)\\times 4 = 4n - 7$. Set $4n - 7 > 100 \\Rightarrow n > 26.75$. Smallest integer is $n = \\mathbf{27}$ (giving $t_{27} = 101$).",
);

short(
  AS,
  `A theatre has seats arranged in rows, with each row having 3 more seats than the row in front of it. Row 1 has 18 seats.\n\n**a.** How many seats are in row 12? (2 marks)\n\n**b.** Which row first contains at least 100 seats? (2 marks)`,
  4,
  "MEDIUM",
  "**a.** Arithmetic: $a = 18, d = 3$. $t_{12} = 18 + 11 \\times 3 = 18 + 33 = \\mathbf{51}$ seats.\n\n**b.** $t_n = 18 + 3(n-1) = 15 + 3n$. Set $15 + 3n \\geq 100 \\Rightarrow 3n \\geq 85 \\Rightarrow n \\geq 28.33$. Smallest integer is $n = \\mathbf{29}$ ($t_{29} = 102$ seats).",
);

// EXT_ANS × 2
extAns(
  AS,
  [
    {
      label: "a",
      marks: 1,
      content: `State the recurrence rule for the sequence with first term $u_0 = 12$ and common difference $5$.`,
      solution: "$u_{n+1} = u_n + 5$, $u_0 = 12$.",
    },
    {
      label: "b",
      marks: 2,
      content: `Calculate $u_1, u_2, u_3$ and $u_4$.`,
      solution: "$u_1 = 12 + 5 = 17$, $u_2 = 22$, $u_3 = 27$, $u_4 = 32$.",
    },
    {
      label: "c",
      marks: 2,
      content: `Write down a rule for $t_n$ (the $n$th term, with $t_1 = 12$) and use it to find $t_{25}$.`,
      solution: "$t_n = 12 + 5(n-1) = 5n + 7$. So $t_{25} = 5\\times 25 + 7 = \\mathbf{132}$.",
    },
  ],
  "EASY",
  `An arithmetic sequence is defined by first term $12$ and common difference $5$.`,
);

extAns(
  AS,
  [
    {
      label: "a",
      marks: 2,
      content: `Write expressions for $t_5$ and $t_{12}$ in terms of $a$ and $d$, then form two equations using the given values.`,
      solution: "$t_5 = a + 4d = 22$ and $t_{12} = a + 11d = 64$.",
    },
    {
      label: "b",
      marks: 2,
      content: `Solve the equations from part **a** to find $a$ and $d$.`,
      solution: "Subtract: $7d = 42 \\Rightarrow d = 6$. Then $a = 22 - 4(6) = \\mathbf{-2}$. So $a = -2, d = 6$.",
    },
    {
      label: "c",
      marks: 2,
      content: `Hence find the sum of the first 20 terms of the sequence. (Use $S_n = \\tfrac{n}{2}(2a + (n-1)d)$.)`,
      solution: "$S_{20} = \\tfrac{20}{2}(2(-2) + 19 \\times 6) = 10 \\times (-4 + 114) = 10 \\times 110 = \\mathbf{1100}$.",
    },
  ],
  "MEDIUM",
  `An arithmetic sequence has $t_5 = 22$ and $t_{12} = 64$.`,
);

// EXT_RESP × 2
extResp(
  AS,
  [
    {
      label: "a",
      marks: 2,
      content: `Show that Anna's monthly savings amounts form an arithmetic sequence and state the first term $a$ and common difference $d$.`,
      solution: "Each month she saves \\$30 more than the previous month, so the differences are constant ($d = 30$). First term $a = 200$.",
    },
    {
      label: "b",
      marks: 2,
      content: `Write a recurrence rule of the form $u_{n+1} = u_n + d$ for the amount saved in month $n+1$, with $u_1$ as the amount in month 1.`,
      solution: "$u_{n+1} = u_n + 30$, with $u_1 = 200$.",
    },
    {
      label: "c",
      marks: 2,
      content: `How much will Anna save in month 12?`,
      solution: "$t_{12} = a + 11d = 200 + 11 \\times 30 = 200 + 330 = \\mathbf{\\$530}$.",
    },
    {
      label: "d",
      marks: 2,
      content: `In which month will Anna first save more than \\$1000 in a single month?`,
      solution: "$t_n = 200 + 30(n-1) = 170 + 30n > 1000 \\Rightarrow 30n > 830 \\Rightarrow n > 27.67$. First integer is $n = \\mathbf{28}$ (saves \\$1010 in month 28).",
    },
    {
      label: "e",
      marks: 2,
      content: `Find the total amount Anna will have saved over the first 12 months.`,
      solution: "$S_{12} = \\tfrac{12}{2}(2\\times 200 + 11 \\times 30) = 6(400 + 330) = 6 \\times 730 = \\mathbf{\\$4380}$.",
    },
  ],
  "MEDIUM",
  `**Question — Anna's monthly savings**\n\nAnna saves \\$200 in month 1, then increases her monthly savings amount by \\$30 each subsequent month (\\$230 in month 2, \\$260 in month 3, and so on).`,
);

extResp(
  AS,
  [
    {
      label: "a",
      marks: 2,
      content: `Show that the heights form an arithmetic sequence and find the common difference.`,
      solution: "Differences: $20.4 - 19.6 = 0.8$; $21.2 - 20.4 = 0.8$; $22.0 - 21.2 = 0.8$. Common difference $d = \\mathbf{0.8}$ cm.",
    },
    {
      label: "b",
      marks: 2,
      content: `Write an explicit rule of the form $t_n = a + (n-1)d$ for the height (in cm) of the seedling at the end of week $n$. (Let $t_1 = 19.6$.)`,
      solution: "$a = 19.6, d = 0.8$. So $t_n = 19.6 + 0.8(n-1) = 0.8n + 18.8$.",
    },
    {
      label: "c",
      marks: 2,
      content: `Predict the height of the seedling at the end of week 20.`,
      solution: "$t_{20} = 0.8 \\times 20 + 18.8 = 16 + 18.8 = \\mathbf{34.8}$ cm.",
    },
    {
      label: "d",
      marks: 3,
      content: `In which week does the seedling first exceed 40 cm in height?`,
      solution: "Set $0.8n + 18.8 > 40 \\Rightarrow 0.8n > 21.2 \\Rightarrow n > 26.5$. Smallest integer is $n = \\mathbf{27}$ (height $= 0.8 \\times 27 + 18.8 = 40.4$ cm in week 27).",
    },
    {
      label: "e",
      marks: 2,
      content: `Comment briefly on whether modelling plant growth as an arithmetic sequence is reasonable beyond, say, 6 months.`,
      solution: `Arithmetic models linear growth indefinitely, but real plants do not grow linearly forever — they slow as they mature and eventually stop. The model would over-predict beyond a few months. A logistic or piecewise model would be more realistic.`,
    },
  ],
  "MEDIUM",
  `**Question — Seedling growth**\n\nA scientist measures the height of a seedling at the end of each week. The heights for the first 4 weeks (in cm) are:\n\n| Week | 1 | 2 | 3 | 4 |\n|---|---|---|---|---|\n| Height (cm) | 19.6 | 20.4 | 21.2 | 22.0 |`,
);

// ═══════════════════════════════════════════════════════════════════════
// SUBTOPIC 2: geometric-sequences (extended-fit) — 17 items
// ═══════════════════════════════════════════════════════════════════════
const GS = "geometric-sequences";

// MCQ × 9
mcq(
  GS,
  `For the geometric sequence 3, 6, 12, 24, ..., the common ratio is`,
  ["1.5", "2", "3", "4"],
  "B",
  "EASY",
  "**Answer: B**\n\nCommon ratio $r = t_2 / t_1 = 6 / 3 = 2$.",
);

mcq(
  GS,
  `The first term of a geometric sequence is 5 and the common ratio is 3. The 4th term is`,
  ["45", "75", "135", "405"],
  "C",
  "EASY",
  "**Answer: C**\n\n$t_4 = a r^{n-1} = 5 \\times 3^3 = 5 \\times 27 = 135$.",
);

mcq(
  GS,
  `Which sequence is geometric?`,
  ["2, 4, 6, 8, ...", "5, 15, 30, 60, ...", "1, 3, 9, 27, ...", "100, 90, 80, 70, ..."],
  "C",
  "EASY",
  "**Answer: C**\n\nRatios: 3/1 = 3, 9/3 = 3, 27/9 = 3 — constant. Option A is arithmetic ($d=2$); B has ratios 3, 2, 2 — not geometric; D is arithmetic.",
);

mcq(
  GS,
  `A geometric sequence has $t_2 = 12$ and $t_5 = 96$. The common ratio is`,
  ["2", "3", "4", "8"],
  "A",
  "MEDIUM",
  "**Answer: A**\n\n$t_5 / t_2 = r^3 = 96/12 = 8 \\Rightarrow r = 2$.",
);

mcq(
  GS,
  `The recurrence rule $u_{n+1} = 0.5\\,u_n$ with $u_0 = 80$ generates`,
  ["80, 40, 20, 10, ...", "80, 160, 320, 640, ...", "80, 79.5, 79, ...", "80, 0.5, 0.25, ..."],
  "A",
  "EASY",
  "**Answer: A**\n\nEach term is half the previous: $u_0 = 80, u_1 = 40, u_2 = 20, u_3 = 10$.",
);

mcq(
  GS,
  `The 6th term of a geometric sequence with $a = 2$ and $r = -3$ is`,
  ["$-486$", "$-162$", "$162$", "$486$"],
  "A",
  "MEDIUM",
  "**Answer: A**\n\n$t_6 = 2 \\times (-3)^5 = 2 \\times (-243) = -486$.",
);

mcq(
  GS,
  `A car worth \\$32,000 depreciates by 20% per year (reducing-balance). After 3 years its value is closest to`,
  ["\\$12,800", "\\$16,384", "\\$19,200", "\\$25,600"],
  "B",
  "MEDIUM",
  "**Answer: B**\n\nGeometric with $r = 0.8$. $V_3 = 32{,}000 \\times 0.8^3 = 32{,}000 \\times 0.512 = \\$16{,}384$.",
);

mcq(
  GS,
  `The first term of a geometric sequence with positive ratio is 4. The 5th term is 324. The common ratio is`,
  ["2", "3", "$\\sqrt{3}$", "$3\\sqrt{3}$"],
  "B",
  "MEDIUM",
  "**Answer: B**\n\n$t_5 = 4 r^4 = 324 \\Rightarrow r^4 = 81 \\Rightarrow r = 3$ (positive).",
);

mcq(
  GS,
  `A population of insects triples each month. If there are 50 insects at the start of month 1, the number of insects at the start of month 7 is`,
  ["1,050", "21,870", "36,450", "109,350"],
  "C",
  "MEDIUM",
  "**Answer: C**\n\nGeometric: $a = 50, r = 3$. Start of month 7 corresponds to $t_7 = 50 \\times 3^6 = 50 \\times 729 = 36{,}450$.",
  "CAS_ALLOWED",
);

// SHORT_ANSWER × 4
short(
  GS,
  `A geometric sequence has first term $a = 4$ and common ratio $r = 3$.\n\n**a.** Write the recurrence rule using $u_0 = 4$. (1 mark)\n\n**b.** Find $t_6$. (2 marks)`,
  3,
  "EASY",
  "**a.** $u_{n+1} = 3 u_n$, $u_0 = 4$.\n\n**b.** $t_6 = a r^{n-1} = 4 \\times 3^5 = 4 \\times 243 = \\mathbf{972}$.",
);

short(
  GS,
  `A geometric sequence has $t_2 = 6$ and $t_5 = 162$.\n\n**a.** Find the common ratio $r$. (2 marks)\n\n**b.** Find $a$, the first term. (1 mark)\n\n**c.** Write an explicit rule $t_n$. (1 mark)`,
  4,
  "MEDIUM",
  "**a.** $t_5/t_2 = r^3 = 162/6 = 27 \\Rightarrow r = \\mathbf{3}$.\n\n**b.** $t_2 = ar \\Rightarrow 6 = 3a \\Rightarrow a = \\mathbf{2}$.\n\n**c.** $t_n = 2 \\times 3^{n-1}$.",
);

short(
  GS,
  `A laptop is purchased for \\$2400 and depreciates at 25% per year (reducing-balance).\n\n**a.** Write a recurrence rule for $V_n$, the value at the end of year $n$, with $V_0 = 2400$. (1 mark)\n\n**b.** Find the value of the laptop at the end of year 4. (2 marks)\n\n**c.** Predict the year in which the laptop's value first falls below \\$500. (2 marks)`,
  5,
  "MEDIUM",
  "**a.** $V_{n+1} = 0.75 V_n$, $V_0 = 2400$.\n\n**b.** $V_4 = 2400 \\times 0.75^4 = 2400 \\times 0.31640625 = \\mathbf{\\$759.38}$ (to 2 dp).\n\n**c.** Solve $2400 \\times 0.75^n < 500 \\Rightarrow 0.75^n < 0.2083$. Try $n=5$: $0.75^5 = 0.2373$; $n=6$: $0.75^6 = 0.1780 < 0.2083$. First year: $n = \\mathbf{6}$ (value \\$427.25).",
  "CAS_ALLOWED",
);

short(
  GS,
  `A culture of bacteria doubles in size every 3 hours. There are initially 200 bacteria.\n\n**a.** How many bacteria are there after 15 hours? (2 marks)\n\n**b.** After how many hours will the population first exceed 100,000? (3 marks)`,
  5,
  "MEDIUM",
  "**a.** 15 hours = 5 doubling periods. $200 \\times 2^5 = 200 \\times 32 = \\mathbf{6400}$ bacteria.\n\n**b.** Let $k$ = number of 3-hour periods. $200 \\times 2^k > 100{,}000 \\Rightarrow 2^k > 500$. $2^8 = 256, 2^9 = 512$. So $k = 9$ periods = $\\mathbf{27}$ hours.",
  "CAS_ALLOWED",
);

// EXT_ANS × 2
extAns(
  GS,
  [
    {
      label: "a",
      marks: 2,
      content: `Show that the sequence 5, 15, 45, 135, ... is geometric and state its first term and common ratio.`,
      solution: "Ratios: $15/5 = 3$, $45/15 = 3$, $135/45 = 3$ — constant. First term $a = 5$, common ratio $r = 3$.",
    },
    {
      label: "b",
      marks: 2,
      content: `Find the explicit rule for $t_n$ (with $t_1 = 5$) and use it to find $t_8$.`,
      solution: "$t_n = ar^{n-1} = 5 \\times 3^{n-1}$. $t_8 = 5 \\times 3^7 = 5 \\times 2187 = \\mathbf{10{,}935}$.",
    },
    {
      label: "c",
      marks: 2,
      content: `Write a recurrence rule of the form $u_{n+1} = R u_n$ with $u_1 = 5$.`,
      solution: "$u_{n+1} = 3 u_n$, $u_1 = 5$ (or equivalently $u_0 = 5/3$).",
    },
  ],
  "EASY",
  `Consider the sequence $5, 15, 45, 135, \\ldots$`,
);

extAns(
  GS,
  [
    {
      label: "a",
      marks: 2,
      content: `The first three terms of a geometric sequence are $x, x+6, 5x-6$. Form an equation in $x$ using the property $t_2^2 = t_1 t_3$ (constant ratio).`,
      solution: "$(x+6)^2 = x(5x-6) \\Rightarrow x^2 + 12x + 36 = 5x^2 - 6x \\Rightarrow 4x^2 - 18x - 36 = 0 \\Rightarrow 2x^2 - 9x - 18 = 0$.",
    },
    {
      label: "b",
      marks: 2,
      content: `Solve the equation from **a** for $x$ and state the two possible values.`,
      solution: "Quadratic: $x = (9 \\pm \\sqrt{81 + 144})/4 = (9 \\pm 15)/4$. So $x = 6$ or $x = -1.5$.",
    },
    {
      label: "c",
      marks: 3,
      content: `For each value of $x$, list the first three terms and state the common ratio $r$.`,
      solution: "If $x = 6$: terms are 6, 12, 24 (each step $\\times 2$), so $r = 2$.\nIf $x = -1.5$: terms are $-1.5, 4.5, -13.5$ (each step $\\times (-3)$), so $r = -3$.",
    },
  ],
  "HARD",
  `The first three terms of a geometric sequence are $x$, $x + 6$ and $5x - 6$.`,
);

// EXT_RESP × 2
extResp(
  GS,
  [
    {
      label: "a",
      marks: 2,
      content: `Write a recurrence rule of the form $V_{n+1} = R V_n$ for the value of the painting at the end of year $n+1$, with $V_0 = 8000$.`,
      solution: "Yearly multiplier $R = 1.06$. $V_{n+1} = 1.06\\, V_n$, $V_0 = 8000$.",
    },
    {
      label: "b",
      marks: 2,
      content: `Predict the value of the painting at the end of year 5.`,
      solution: "$V_5 = 8000 \\times 1.06^5 = 8000 \\times 1.33823 = \\mathbf{\\$10{,}705.80}$ (to nearest cent).",
    },
    {
      label: "c",
      marks: 3,
      content: `In which year will the painting first be worth more than \\$15,000?`,
      solution: "Solve $8000 \\times 1.06^n > 15{,}000 \\Rightarrow 1.06^n > 1.875$. Trial: $n = 10$: $1.06^{10} = 1.7908$. $n = 11$: $1.06^{11} = 1.8983 > 1.875$. First year: $n = \\mathbf{11}$ (value \\$15,186.40).",
    },
    {
      label: "d",
      marks: 2,
      content: `State one limitation of using a geometric model to predict the painting's long-term value.`,
      solution: "A geometric model with $r > 1$ predicts unbounded growth indefinitely, but real artwork values fluctuate with the economy, demand, and condition. Long-term predictions become unreliable beyond about a decade.",
    },
    {
      label: "e",
      marks: 2,
      content: `If the appreciation rate fell to 4% per year from year 6 onwards, find the value of the painting at the end of year 10.`,
      solution: "Up to year 5: $V_5 = \\$10{,}705.80$. From year 6 to year 10 (5 more years at 4%): $V_{10} = 10{,}705.80 \\times 1.04^5 = 10{,}705.80 \\times 1.21665 = \\mathbf{\\$13{,}025.83}$.",
    },
  ],
  "MEDIUM",
  `**Question — Painting valuation**\n\nA collector buys a painting for \\$8000. The painting appreciates in value by 6% each year (compounded annually).`,
);

extResp(
  GS,
  [
    {
      label: "a",
      marks: 2,
      content: `Show that the bounce heights form a geometric sequence and find the common ratio.`,
      solution: "Ratios: $96/120 = 0.8$; $76.8/96 = 0.8$; $61.44/76.8 = 0.8$. Constant ratio $r = \\mathbf{0.8}$.",
    },
    {
      label: "b",
      marks: 2,
      content: `Write a recurrence rule $H_{n+1} = R H_n$ for the bounce height (with $H_1 = 120$ cm).`,
      solution: "$H_{n+1} = 0.8 H_n$, $H_1 = 120$.",
    },
    {
      label: "c",
      marks: 2,
      content: `Find the height of the 8th bounce (correct to 1 dp).`,
      solution: "$H_8 = 120 \\times 0.8^{7} = 120 \\times 0.2097 = \\mathbf{25.2}$ cm (to 1 dp).",
    },
    {
      label: "d",
      marks: 3,
      content: `On which bounce does the ball first fail to reach 10 cm in height?`,
      solution: "Solve $120 \\times 0.8^{n-1} < 10 \\Rightarrow 0.8^{n-1} < 1/12 = 0.0833$. Trial: $0.8^{11} = 0.0859$; $0.8^{12} = 0.0687 < 0.0833$. So $n - 1 = 12 \\Rightarrow n = \\mathbf{13}$. The 13th bounce is the first below 10 cm.",
    },
    {
      label: "e",
      marks: 2,
      content: `Describe in one sentence what would happen physically if the common ratio were exactly 1 instead of 0.8.`,
      solution: "If $r = 1$ the ball would rebound to exactly the same height every bounce, never losing energy — i.e. an unrealistic perfectly elastic collision (in practice friction and inelasticity always cause $r < 1$).",
    },
  ],
  "MEDIUM",
  `**Question — Bouncing ball**\n\nA rubber ball is dropped from a height and rebounds to a fraction of its previous height each time. Measured rebound heights for the first four bounces are:\n\n| Bounce | 1 | 2 | 3 | 4 |\n|---|---|---|---|---|\n| Height (cm) | 120 | 96 | 76.8 | 61.44 |`,
);

// ═══════════════════════════════════════════════════════════════════════
// SUBTOPIC 3: recurrence-relations (modelling-rich) — 16 items
// ═══════════════════════════════════════════════════════════════════════
const RR = "recurrence-relations";

// MCQ × 7
mcq(
  RR,
  `The recurrence rule $u_{n+1} = 2 u_n + 3$ with $u_0 = 1$ generates the second term ($u_2$) equal to`,
  ["5", "11", "13", "23"],
  "C",
  "EASY",
  "**Answer: C**\n\n$u_1 = 2(1) + 3 = 5$. $u_2 = 2(5) + 3 = 13$.",
);

mcq(
  RR,
  `Which recurrence rule represents an arithmetic sequence (constant addition)?`,
  ["$u_{n+1} = 3 u_n$", "$u_{n+1} = u_n + 4$", "$u_{n+1} = 0.5 u_n + 2$", "$u_{n+1} = u_n^2$"],
  "B",
  "EASY",
  "**Answer: B**\n\nArithmetic recurrence: $u_{n+1} = u_n + d$ — constant addition. Option A is geometric; Option C is a mixed (first-order linear) recurrence; D is not linear.",
);

mcq(
  RR,
  `A salt-water tank starts with 50 g of salt. Each day, 10% of the salt is removed (through filtration) and 2 g is added (top-up). The recurrence rule for the amount of salt $S_n$ on day $n$ (where $S_0 = 50$) is`,
  [
    "$S_{n+1} = 0.9 S_n + 2$",
    "$S_{n+1} = 1.1 S_n + 2$",
    "$S_{n+1} = 0.9 S_n - 2$",
    "$S_{n+1} = S_n - 10 + 2$",
  ],
  "A",
  "MEDIUM",
  "**Answer: A**\n\n10% removed means 90% remains, so multiply by 0.9; then 2 g added, so $+2$. Hence $S_{n+1} = 0.9 S_n + 2$.",
);

mcq(
  RR,
  `For the recurrence $u_{n+1} = u_n + 5$ with $u_0 = 3$, the value of $u_4$ is`,
  ["18", "20", "23", "25"],
  "C",
  "EASY",
  "**Answer: C**\n\n$u_1 = 8, u_2 = 13, u_3 = 18, u_4 = 23$. Equivalently $u_4 = u_0 + 4d = 3 + 20 = 23$.",
);

mcq(
  RR,
  `A population grows according to $P_{n+1} = 1.1 P_n - 30$ with $P_0 = 500$. The population at $n = 2$ is`,
  ["520", "535", "542", "550"],
  "C",
  "MEDIUM",
  "**Answer: C**\n\n$P_1 = 1.1 \\times 500 - 30 = 550 - 30 = 520$.\n\n$P_2 = 1.1 \\times 520 - 30 = 572 - 30 = \\mathbf{542}$.",
);

mcq(
  RR,
  `Which of the following best describes the long-term behaviour of $u_{n+1} = 0.5 u_n + 6$, $u_0 = 20$?`,
  [
    "Grows without bound",
    "Approaches a steady value (limit) of 12",
    "Approaches a steady value (limit) of 6",
    "Oscillates between two values",
  ],
  "B",
  "MEDIUM",
  "**Answer: B**\n\nSteady state $L$ satisfies $L = 0.5L + 6 \\Rightarrow 0.5L = 6 \\Rightarrow L = 12$. Since $|0.5| < 1$, the sequence converges to this fixed point.",
);

mcq(
  RR,
  `A loan with monthly recurrence $B_{n+1} = 1.005 B_n - 400$, $B_0 = 12{,}000$ represents`,
  [
    "An investment earning 0.5% per month with \\$400 deposited each month",
    "A loan with 0.5% monthly interest and a \\$400 monthly repayment",
    "A simple interest loan",
    "A perpetuity paying \\$400 per month",
  ],
  "B",
  "EASY",
  "**Answer: B**\n\nThe multiplier $1.005$ adds 0.5% interest each month, and the $-400$ is a monthly repayment that reduces the balance. The starting balance \\$12,000 is the loan amount.",
);

// SHORT_ANSWER × 4
short(
  RR,
  `Consider the recurrence relation $u_{n+1} = 0.8 u_n + 10$ with $u_0 = 50$.\n\n**a.** Calculate $u_1$ and $u_2$. (2 marks)\n\n**b.** Find the steady-state (limit) value of $u_n$ as $n \\to \\infty$. (2 marks)`,
  4,
  "MEDIUM",
  "**a.** $u_1 = 0.8 \\times 50 + 10 = 40 + 10 = 50$. $u_2 = 0.8 \\times 50 + 10 = 50$.\n\n**b.** Steady state satisfies $L = 0.8 L + 10 \\Rightarrow 0.2 L = 10 \\Rightarrow L = \\mathbf{50}$. Since $u_0$ is already at the steady state, $u_n = 50$ for all $n$.",
);

short(
  RR,
  `A small fish population is modelled by $P_{n+1} = 1.04 P_n - 50$ where $P_n$ is the population after $n$ years and $P_0 = 2000$.\n\n**a.** What is the meaning of the 1.04 and the $-50$ in the model? (2 marks)\n\n**b.** Find $P_3$. (3 marks)`,
  5,
  "MEDIUM",
  "**a.** The 1.04 represents a 4% annual natural growth rate (multiplier). The $-50$ represents 50 fish removed (e.g. by harvesting) each year.\n\n**b.** $P_1 = 1.04 \\times 2000 - 50 = 2080 - 50 = 2030$.\n$P_2 = 1.04 \\times 2030 - 50 = 2111.2 - 50 = 2061.2$.\n$P_3 = 1.04 \\times 2061.2 - 50 = 2143.65 - 50 = \\mathbf{2093.65}$ (i.e. about 2094 fish).",
  "CAS_ALLOWED",
);

short(
  RR,
  `A salt-water tank is modelled by $S_{n+1} = 0.9 S_n + 4$ where $S_n$ is the mass of salt in grams after $n$ days and $S_0 = 30$.\n\n**a.** Find $S_1$ and $S_2$. (2 marks)\n\n**b.** Find the steady-state amount of salt in the tank. (2 marks)`,
  4,
  "MEDIUM",
  "**a.** $S_1 = 0.9 \\times 30 + 4 = 27 + 4 = 31$ g. $S_2 = 0.9 \\times 31 + 4 = 27.9 + 4 = \\mathbf{31.9}$ g.\n\n**b.** Steady state $L = 0.9 L + 4 \\Rightarrow 0.1 L = 4 \\Rightarrow L = \\mathbf{40}$ g.",
);

short(
  RR,
  `Set up a recurrence relation $u_{n+1} = R u_n + d$ for each scenario below, stating the value of $u_0$:\n\n**a.** A savings account starts at \\$1000 and grows by 0.4% per month with \\$50 added at the end of each month. (2 marks)\n\n**b.** A debt of \\$5000 is charged 1.2% interest per month and is repaid at \\$200 per month. (2 marks)\n\n**c.** A population starts at 5000 and decreases by 3% per year due to emigration but gains 100 new residents per year. (1 mark)`,
  5,
  "MEDIUM",
  "**a.** $u_{n+1} = 1.004 u_n + 50$, $u_0 = 1000$.\n\n**b.** $u_{n+1} = 1.012 u_n - 200$, $u_0 = 5000$ (interest adds to balance; repayment subtracts).\n\n**c.** $u_{n+1} = 0.97 u_n + 100$, $u_0 = 5000$.",
);

// EXT_ANS × 2
extAns(
  RR,
  [
    {
      label: "a",
      marks: 2,
      content: `Calculate $u_1, u_2, u_3$ for the recurrence $u_{n+1} = 0.6 u_n + 8$, $u_0 = 30$.`,
      solution: "$u_1 = 0.6 \\times 30 + 8 = 18 + 8 = 26$.\n$u_2 = 0.6 \\times 26 + 8 = 15.6 + 8 = 23.6$.\n$u_3 = 0.6 \\times 23.6 + 8 = 14.16 + 8 = \\mathbf{22.16}$.",
    },
    {
      label: "b",
      marks: 2,
      content: `Find the long-term steady-state value of $u_n$ and describe the behaviour as $n \\to \\infty$.`,
      solution: "Steady state $L = 0.6 L + 8 \\Rightarrow 0.4 L = 8 \\Rightarrow L = 20$. Since $|0.6| < 1$, the sequence approaches 20 from above (monotonic decrease).",
    },
    {
      label: "c",
      marks: 2,
      content: `Explain why the steady-state value is independent of the initial value $u_0$.`,
      solution: "The steady-state equation $L = R L + d$ does not involve $u_0$ — it only depends on $R$ and $d$. Any starting value will converge to the same limit (provided $|R| < 1$); $u_0$ only affects how fast the convergence happens, not where the sequence ends up.",
    },
  ],
  "MEDIUM",
  `A first-order linear recurrence has the form $u_{n+1} = R u_n + d$.`,
);

extAns(
  RR,
  [
    {
      label: "a",
      marks: 2,
      content: `Write a recurrence rule of the form $D_{n+1} = R D_n + d$ for Lee's debt after $n$ months, with $D_0 = 8000$.`,
      solution: "Monthly interest rate $= 9\\%/12 = 0.75\\% = 0.0075$. Multiplier $R = 1.0075$. Repayment subtracts \\$250. So $D_{n+1} = 1.0075 D_n - 250$, $D_0 = 8000$.",
    },
    {
      label: "b",
      marks: 2,
      content: `Find Lee's debt at the end of month 3 (to nearest cent).`,
      solution: "$D_1 = 1.0075 \\times 8000 - 250 = 8060 - 250 = 7810$.\n$D_2 = 1.0075 \\times 7810 - 250 = 7868.575 - 250 = 7618.58$ (to 2 dp).\n$D_3 = 1.0075 \\times 7618.575 - 250 = 7675.71 - 250 = \\mathbf{\\$7425.71}$.",
    },
    {
      label: "c",
      marks: 3,
      content: `Use the steady-state equation to determine whether the debt will be paid off. Show working.`,
      solution: "Steady state $L = 1.0075 L - 250 \\Rightarrow -0.0075 L = -250 \\Rightarrow L = 33{,}333.33$. Since $|R| = 1.0075 > 1$, this is an **unstable** fixed point: balances above 33,333 diverge upward, balances below 33,333 diverge downward (toward zero, meaning the debt is paid off). With $D_0 = 8000 < 33{,}333$, the debt **will** be paid off in finite time.",
    },
  ],
  "HARD",
  `Lee borrows \\$8000 at 9% per annum (compounded monthly) and repays \\$250 per month.`,
);

// EXT_RESP × 3
extResp(
  RR,
  [
    {
      label: "a",
      marks: 2,
      content: `Write a recurrence relation $T_{n+1} = R T_n + d$ for the tank's tonnage of salt after $n$ hours, with $T_0 = 12$ kg.`,
      solution: "Each hour, 5% of salt is removed (so 95% remains) ⇒ $R = 0.95$. Then 0.4 kg is added each hour ⇒ $d = 0.4$. Recurrence: $T_{n+1} = 0.95 T_n + 0.4$, $T_0 = 12$.",
    },
    {
      label: "b",
      marks: 2,
      content: `Find the tank's salt content after 1, 2 and 3 hours (to 2 dp).`,
      solution: "$T_1 = 0.95 \\times 12 + 0.4 = 11.4 + 0.4 = 11.80$ kg.\n$T_2 = 0.95 \\times 11.80 + 0.4 = 11.21 + 0.4 = 11.61$ kg.\n$T_3 = 0.95 \\times 11.61 + 0.4 = 11.0295 + 0.4 = \\mathbf{11.43}$ kg.",
    },
    {
      label: "c",
      marks: 2,
      content: `Find the steady-state salt content of the tank.`,
      solution: "$L = 0.95 L + 0.4 \\Rightarrow 0.05 L = 0.4 \\Rightarrow L = \\mathbf{8}$ kg.",
    },
    {
      label: "d",
      marks: 3,
      content: `After how many hours will the tank's salt content first fall below 9 kg?`,
      solution: "Compute iteratively (or use $T_n = 8 + 4 \\times 0.95^n$ — derived from general solution).\n$T_n < 9 \\Rightarrow 4 \\times 0.95^n < 1 \\Rightarrow 0.95^n < 0.25$.\n$0.95^{27} \\approx 0.2503$; $0.95^{28} \\approx 0.2378 < 0.25$. So $n = \\mathbf{28}$ hours.",
    },
    {
      label: "e",
      marks: 2,
      content: `Without recalculating, describe how the steady-state would change if the operators doubled the rate of top-up (so 0.8 kg added per hour instead of 0.4 kg). Justify briefly.`,
      solution: "New steady state: $L = 0.95 L + 0.8 \\Rightarrow 0.05 L = 0.8 \\Rightarrow L = 16$ kg (double the original 8 kg). Doubling $d$ doubles the steady state when $R$ stays the same.",
    },
  ],
  "MEDIUM",
  `**Question — Salt tank mixing**\n\nA tank starts with 12 kg of dissolved salt. Each hour, 5% of the salt is removed (drained off) and 0.4 kg of salt is added (top-up).`,
);

extResp(
  RR,
  [
    {
      label: "a",
      marks: 2,
      content: `Write a recurrence rule $S_{n+1} = R S_n + d$ for the value of Priya's account at the end of year $n+1$, given $S_0 = 5000$.`,
      solution: "Yearly multiplier $R = 1.05$. Yearly deposit $d = 1200$. So $S_{n+1} = 1.05 S_n + 1200$, $S_0 = 5000$.",
    },
    {
      label: "b",
      marks: 3,
      content: `Find $S_1, S_2, S_3$ (to nearest cent).`,
      solution: "$S_1 = 1.05 \\times 5000 + 1200 = 5250 + 1200 = 6450$.\n$S_2 = 1.05 \\times 6450 + 1200 = 6772.50 + 1200 = 7972.50$.\n$S_3 = 1.05 \\times 7972.50 + 1200 = 8371.125 + 1200 = \\mathbf{\\$9571.13}$.",
    },
    {
      label: "c",
      marks: 2,
      content: `Find Priya's account balance at the end of year 10 (to nearest cent).`,
      solution: "Iterating from $S_3$: $S_4 = 11{,}249.68$, $S_5 = 13{,}012.17$, $S_6 = 14{,}862.77$, $S_7 = 16{,}805.91$, $S_8 = 18{,}846.21$, $S_9 = 20{,}988.52$, $S_{10} = \\mathbf{\\$23{,}237.95}$.",
    },
    {
      label: "d",
      marks: 2,
      content: `Why is there no finite steady state for this recurrence?`,
      solution: "$|R| = 1.05 > 1$, so the sequence diverges to infinity. Algebraically, $L = 1.05 L + 1200 \\Rightarrow -0.05 L = 1200 \\Rightarrow L = -24{,}000$, which is a negative 'steady state' — the sequence moves away from it (unstable), so for positive starting values the account grows without bound.",
    },
    {
      label: "e",
      marks: 2,
      content: `If Priya wants \\$50,000 by the end of some year, find the first year in which $S_n > 50{,}000$.`,
      solution: "Continuing iteration past year 10: $S_{11} \\approx 25{,}599.85$, $S_{15} \\approx 36{,}287.87$, $S_{18} \\approx 45{,}790.75$, $S_{19} \\approx 49{,}280.29$ (still $< 50{,}000$), $S_{20} \\approx 52{,}944.30$. First year balance exceeds \\$50,000 is $n = \\mathbf{20}$.",
    },
  ],
  "MEDIUM",
  `**Question — Priya's savings plan**\n\nPriya opens an account with \\$5000 earning 5% per annum (compounded annually) and adds \\$1200 at the end of each year.`,
  "CAS_ALLOWED",
);

extResp(
  RR,
  [
    {
      label: "a",
      marks: 2,
      content: `Write a recurrence relation $P_{n+1} = R P_n + d$ for the population of fish at the end of year $n+1$, with $P_0 = 4000$.`,
      solution: "Natural growth $+8\\%$ ⇒ $R = 1.08$. Harvest of 350 fish per year removed at the end of each year ⇒ $d = -350$. $P_{n+1} = 1.08 P_n - 350$, $P_0 = 4000$.",
    },
    {
      label: "b",
      marks: 3,
      content: `Find $P_1, P_2, P_3$.`,
      solution: "$P_1 = 1.08 \\times 4000 - 350 = 4320 - 350 = 3970$.\n$P_2 = 1.08 \\times 3970 - 350 = 4287.6 - 350 = 3937.6$.\n$P_3 = 1.08 \\times 3937.6 - 350 = 4252.61 - 350 = \\mathbf{3902.61}$ (so about 3903 fish).",
    },
    {
      label: "c",
      marks: 2,
      content: `Determine the steady-state population: the harvest level at which the population stays constant year on year. Interpret this value in context.`,
      solution: "Steady state $L = 1.08 L - 350 \\Rightarrow -0.08 L = -350 \\Rightarrow L = 4375$. **Interpretation**: if there were exactly 4375 fish, harvesting 350 per year would exactly balance the 8% growth (which produces $0.08 \\times 4375 = 350$ new fish), keeping the population stable.",
    },
    {
      label: "d",
      marks: 3,
      content: `The starting population is 4000 < 4375 (the unstable steady state). Without computing further iterations, describe what the long-term population will do.`,
      solution: "Since $|R| = 1.08 > 1$ the steady state at 4375 is **unstable**. Starting below the steady state ($P_0 = 4000 < 4375$) means each year the harvest exceeds the growth (in absolute terms relative to the steady state), so the population trends **downward** over time and the fishery will eventually be depleted (population $\\to 0$) unless the harvest is reduced.",
    },
    {
      label: "e",
      marks: 2,
      content: `Suggest one harvest level $d^*$ that would allow the population to be sustainable starting from 4000. Justify briefly.`,
      solution: "Set steady state to 4000: $4000 = 1.08 \\times 4000 - d^* \\Rightarrow d^* = 4320 - 4000 = 320$ fish/year. Any harvest below 320 (e.g. 300) would allow the population to grow; a harvest of exactly 320 keeps the population at 4000.",
    },
  ],
  "HARD",
  `**Question — Sustainable fisheries**\n\nA fishery contains 4000 fish. The population grows naturally at 8% per year. Each year, 350 fish are harvested at the end of the year.`,
  "CAS_ALLOWED",
);

// ═══════════════════════════════════════════════════════════════════════
// SUBTOPIC 4: matrices-and-matrix-operations (core-drill) — 21 items
// ═══════════════════════════════════════════════════════════════════════
const MM = "matrices-and-matrix-operations";

// Reusable matrix figures
const matA2x3 = matrixTable({ values: [[1, 2, 3], [4, 5, 6]], label: "A" });
const matB3x2 = matrixTable({ values: [[1, 0], [2, 1], [0, 3]], label: "B" });
const matC3x3 = matrixTable({ values: [[2, 0, 1], [0, 3, 0], [1, 0, 2]], label: "C" });
const matSum1 = matrixTable({ values: [[2, 1], [0, 3]], label: "P" });
const matSum2 = matrixTable({ values: [[1, 4], [5, 2]], label: "Q" });
const matProd1 = matrixTable({ values: [[1, 2], [3, 4]], label: "M" });
const matProd2 = matrixTable({ values: [[2, 0], [1, 5]], label: "N" });

// MCQ × 12
mcq(
  MM,
  `${img(matA2x3)}\n\nThe dimensions of matrix $A$ above are`,
  ["$2 \\times 3$", "$3 \\times 2$", "$2 \\times 2$", "$6 \\times 1$"],
  "A",
  "EASY",
  "**Answer: A**\n\n$A$ has 2 rows and 3 columns, so its dimensions are $2 \\times 3$ (rows × columns).",
);

mcq(
  MM,
  `If $A$ is a $2 \\times 3$ matrix and $B$ is a $3 \\times 4$ matrix, the dimensions of the product $AB$ are`,
  ["$2 \\times 4$", "$3 \\times 3$", "$2 \\times 3$", "$4 \\times 3$"],
  "A",
  "EASY",
  "**Answer: A**\n\nFor $AB$: $A$ has 3 columns and $B$ has 3 rows (so they conform). The product has dimensions (rows of $A$) × (columns of $B$) = $2 \\times 4$.",
);

mcq(
  MM,
  `Which of the following matrix products is **not** defined?`,
  [
    "$(3 \\times 2)(2 \\times 4)$",
    "$(2 \\times 3)(3 \\times 1)$",
    "$(4 \\times 1)(1 \\times 5)$",
    "$(2 \\times 3)(2 \\times 3)$",
  ],
  "D",
  "EASY",
  "**Answer: D**\n\nFor the product to be defined, the inner dimensions must match. $(2 \\times 3)(2 \\times 3)$ has inner dimensions $3$ and $2$ — they do not match, so the product is undefined.",
);

mcq(
  MM,
  `The identity matrix $I_3$ has`,
  [
    "All entries equal to 1",
    "All entries equal to 0",
    "1s on the main diagonal and 0s elsewhere",
    "1s on the anti-diagonal and 0s elsewhere",
  ],
  "C",
  "EASY",
  "**Answer: C**\n\nThe $3 \\times 3$ identity matrix is $I_3 = \\begin{bmatrix} 1 & 0 & 0 \\\\ 0 & 1 & 0 \\\\ 0 & 0 & 1 \\end{bmatrix}$ — 1s on the main diagonal, 0s elsewhere.",
);

mcq(
  MM,
  `For matrices $A$ and $B$, matrix addition $A + B$ is defined provided`,
  [
    "Both matrices are square",
    "Both matrices have the same dimensions",
    "The number of columns of $A$ equals the number of rows of $B$",
    "Both matrices are invertible",
  ],
  "B",
  "EASY",
  "**Answer: B**\n\nAddition requires identical dimensions so that elements can be added position by position.",
);

mcq(
  MM,
  `${img(matSum1)} ${img(matSum2)}\n\nThe sum $P + Q$ is`,
  [
    "$\\begin{bmatrix} 3 & 5 \\\\ 5 & 5 \\end{bmatrix}$",
    "$\\begin{bmatrix} 2 & 4 \\\\ 0 & 6 \\end{bmatrix}$",
    "$\\begin{bmatrix} 3 & 5 \\\\ 5 & 5 \\end{bmatrix}$",
    "$\\begin{bmatrix} 1 & -3 \\\\ -5 & 1 \\end{bmatrix}$",
  ],
  "A",
  "EASY",
  "**Answer: A**\n\n$P + Q = \\begin{bmatrix} 2+1 & 1+4 \\\\ 0+5 & 3+2 \\end{bmatrix} = \\begin{bmatrix} 3 & 5 \\\\ 5 & 5 \\end{bmatrix}$.",
);

mcq(
  MM,
  `If $A = \\begin{bmatrix} 2 & -1 \\\\ 0 & 3 \\end{bmatrix}$, then $3A$ is`,
  [
    "$\\begin{bmatrix} 5 & 2 \\\\ 3 & 6 \\end{bmatrix}$",
    "$\\begin{bmatrix} 6 & -3 \\\\ 0 & 9 \\end{bmatrix}$",
    "$\\begin{bmatrix} 6 & -1 \\\\ 0 & 9 \\end{bmatrix}$",
    "$\\begin{bmatrix} 2 & -3 \\\\ 0 & 9 \\end{bmatrix}$",
  ],
  "B",
  "EASY",
  "**Answer: B**\n\nScalar multiplication: multiply every entry by 3. $3A = \\begin{bmatrix} 6 & -3 \\\\ 0 & 9 \\end{bmatrix}$.",
);

mcq(
  MM,
  `${img(matProd1)} ${img(matProd2)}\n\nThe product $MN$ equals`,
  [
    "$\\begin{bmatrix} 4 & 10 \\\\ 10 & 20 \\end{bmatrix}$",
    "$\\begin{bmatrix} 2 & 0 \\\\ 3 & 20 \\end{bmatrix}$",
    "$\\begin{bmatrix} 4 & 10 \\\\ 10 & 20 \\end{bmatrix}$",
    "$\\begin{bmatrix} 5 & 8 \\\\ 11 & 17 \\end{bmatrix}$",
  ],
  "A",
  "MEDIUM",
  "**Answer: A**\n\n$MN = \\begin{bmatrix} 1\\cdot 2 + 2 \\cdot 1 & 1 \\cdot 0 + 2 \\cdot 5 \\\\ 3 \\cdot 2 + 4 \\cdot 1 & 3 \\cdot 0 + 4 \\cdot 5 \\end{bmatrix} = \\begin{bmatrix} 4 & 10 \\\\ 10 & 20 \\end{bmatrix}$.",
);

mcq(
  MM,
  `Two matrices $A$ and $B$ are equal if and only if`,
  [
    "They have the same dimensions",
    "All their entries are equal",
    "They have the same dimensions AND all corresponding entries are equal",
    "Their products $AB$ and $BA$ are equal",
  ],
  "C",
  "EASY",
  "**Answer: C**\n\nEquality of matrices requires both identical dimensions and identical entries position by position.",
);

mcq(
  MM,
  `Which of the following is a $1 \\times 3$ row matrix?`,
  [
    "$\\begin{bmatrix} 1 \\\\ 2 \\\\ 3 \\end{bmatrix}$",
    "$\\begin{bmatrix} 1 & 2 & 3 \\end{bmatrix}$",
    "$\\begin{bmatrix} 1 & 2 \\\\ 3 & 4 \\\\ 5 & 6 \\end{bmatrix}$",
    "$\\begin{bmatrix} 1 & 2 \\\\ 3 & 4 \\end{bmatrix}$",
  ],
  "B",
  "EASY",
  "**Answer: B**\n\nA $1 \\times 3$ row matrix has 1 row and 3 columns: $\\begin{bmatrix} 1 & 2 & 3 \\end{bmatrix}$. The first option is a $3 \\times 1$ column matrix.",
);

mcq(
  MM,
  `For matrices, the operation that is NOT generally commutative is`,
  [
    "Addition: $A + B \\neq B + A$",
    "Scalar multiplication",
    "Multiplication: $AB \\neq BA$ in general",
    "Equality",
  ],
  "C",
  "EASY",
  "**Answer: C**\n\nMatrix multiplication is not commutative in general: $AB \\neq BA$. Addition IS commutative ($A + B = B + A$). Even when both $AB$ and $BA$ are defined, they need not be equal (and often have different dimensions).",
);

mcq(
  MM,
  `The zero matrix $O_{2\\times 2}$ satisfies, for any conformable $2 \\times 2$ matrix $A$,`,
  [
    "$A + O = O$",
    "$A \\cdot O = A$",
    "$A + O = A$ and $A \\cdot O = O$",
    "$A + O = I$",
  ],
  "C",
  "EASY",
  "**Answer: C**\n\nThe zero matrix is the additive identity ($A + O = A$) and an absorbing element for multiplication ($A \\cdot O = O$).",
);

// SHORT_ANSWER × 5
short(
  MM,
  `Given $A = \\begin{bmatrix} 2 & 1 \\\\ -1 & 3 \\end{bmatrix}$ and $B = \\begin{bmatrix} 0 & 4 \\\\ 5 & -2 \\end{bmatrix}$, compute:\n\n**a.** $A + B$. (1 mark)\n\n**b.** $2A - B$. (2 marks)`,
  3,
  "EASY",
  "**a.** $A + B = \\begin{bmatrix} 2 & 5 \\\\ 4 & 1 \\end{bmatrix}$.\n\n**b.** $2A = \\begin{bmatrix} 4 & 2 \\\\ -2 & 6 \\end{bmatrix}$. $2A - B = \\begin{bmatrix} 4-0 & 2-4 \\\\ -2-5 & 6+2 \\end{bmatrix} = \\mathbf{\\begin{bmatrix} 4 & -2 \\\\ -7 & 8 \\end{bmatrix}}$.",
);

short(
  MM,
  `Let $C = \\begin{bmatrix} 1 & 2 \\\\ 3 & 4 \\end{bmatrix}$ and $D = \\begin{bmatrix} 2 & -1 \\\\ 0 & 5 \\end{bmatrix}$.\n\n**a.** Find the product $CD$. (2 marks)\n\n**b.** Find the product $DC$. (2 marks)\n\n**c.** State whether $CD = DC$. (1 mark)`,
  5,
  "MEDIUM",
  "**a.** $CD = \\begin{bmatrix} 1(2)+2(0) & 1(-1)+2(5) \\\\ 3(2)+4(0) & 3(-1)+4(5) \\end{bmatrix} = \\mathbf{\\begin{bmatrix} 2 & 9 \\\\ 6 & 17 \\end{bmatrix}}$.\n\n**b.** $DC = \\begin{bmatrix} 2(1)+(-1)(3) & 2(2)+(-1)(4) \\\\ 0(1)+5(3) & 0(2)+5(4) \\end{bmatrix} = \\mathbf{\\begin{bmatrix} -1 & 0 \\\\ 15 & 20 \\end{bmatrix}}$.\n\n**c.** $CD \\neq DC$ (different entries). Matrix multiplication is not commutative.",
);

short(
  MM,
  `Three matrices: $A$ has dimensions $3 \\times 2$, $B$ is $2 \\times 4$, $C$ is $4 \\times 3$. For each product below, state whether it is defined and (if so) give its dimensions.\n\n**a.** $AB$\n\n**b.** $BC$\n\n**c.** $CA$\n\n**d.** $A^T B$ (where $A^T$ is the transpose of $A$)\n\n(4 marks)`,
  4,
  "MEDIUM",
  "**a.** $AB$: $(3 \\times 2)(2 \\times 4)$ — inner dims match ⇒ defined, result $\\mathbf{3 \\times 4}$.\n\n**b.** $BC$: $(2 \\times 4)(4 \\times 3)$ — defined, result $\\mathbf{2 \\times 3}$.\n\n**c.** $CA$: $(4 \\times 3)(3 \\times 2)$ — defined, result $\\mathbf{4 \\times 2}$.\n\n**d.** $A^T$ is $2 \\times 3$. $A^T B$: $(2 \\times 3)(2 \\times 4)$ — inner dims 3 and 2 don't match ⇒ **not defined**.",
);

short(
  MM,
  `A canteen serves three meals: breakfast (B), lunch (L) and dinner (D). The number of meals sold on Monday and Tuesday is summarised in matrix $S$ below. The price (in dollars) of each meal type is given by matrix $P$.\n\n$S = \\begin{bmatrix} 30 & 50 & 40 \\\\ 25 & 60 & 45 \\end{bmatrix}$ (rows = Mon, Tue; columns = B, L, D)\n\n$P = \\begin{bmatrix} 8 \\\\ 12 \\\\ 15 \\end{bmatrix}$\n\n**a.** Compute $SP$ and state what its entries represent. (3 marks)\n\n**b.** What are the dimensions of $SP$? (1 mark)`,
  4,
  "MEDIUM",
  "**a.** $SP = \\begin{bmatrix} 30(8) + 50(12) + 40(15) \\\\ 25(8) + 60(12) + 45(15) \\end{bmatrix} = \\begin{bmatrix} 240 + 600 + 600 \\\\ 200 + 720 + 675 \\end{bmatrix} = \\mathbf{\\begin{bmatrix} 1440 \\\\ 1595 \\end{bmatrix}}$. Entries represent the total takings on Monday (\\$1440) and Tuesday (\\$1595).\n\n**b.** $SP$ has dimensions $\\mathbf{2 \\times 1}$ (rows of $S$ × columns of $P$).",
);

short(
  MM,
  `Solve for $x$ and $y$ given that $\\begin{bmatrix} x + 2 & 3 \\\\ 1 & y - 1 \\end{bmatrix} = \\begin{bmatrix} 7 & 3 \\\\ 1 & 5 \\end{bmatrix}$. (3 marks)`,
  3,
  "EASY",
  "Two matrices are equal iff corresponding entries match. So $x + 2 = 7 \\Rightarrow x = \\mathbf{5}$ and $y - 1 = 5 \\Rightarrow y = \\mathbf{6}$. (The 3 and 1 entries already agree.)",
);

// EXT_ANS × 2
extAns(
  MM,
  [
    {
      label: "a",
      marks: 2,
      content: `Compute $A + B$ and $A - 2B$, given $A = \\begin{bmatrix} 3 & 0 \\\\ 1 & 2 \\\\ -1 & 4 \\end{bmatrix}$ and $B = \\begin{bmatrix} 1 & 2 \\\\ 0 & -1 \\\\ 3 & 1 \\end{bmatrix}$.`,
      solution: "$A + B = \\begin{bmatrix} 4 & 2 \\\\ 1 & 1 \\\\ 2 & 5 \\end{bmatrix}$.\n\n$2B = \\begin{bmatrix} 2 & 4 \\\\ 0 & -2 \\\\ 6 & 2 \\end{bmatrix}$, so $A - 2B = \\begin{bmatrix} 1 & -4 \\\\ 1 & 4 \\\\ -7 & 2 \\end{bmatrix}$.",
    },
    {
      label: "b",
      marks: 3,
      content: `Given $C = \\begin{bmatrix} 1 & 2 & 0 \\\\ 3 & 1 & -1 \\end{bmatrix}$, compute $CA$ (if defined). Show working.`,
      solution: "$C$ is $2 \\times 3$ and $A$ is $3 \\times 2$; inner dims 3 = 3 ⇒ defined. Result is $2 \\times 2$:\n$CA = \\begin{bmatrix} 1(3)+2(1)+0(-1) & 1(0)+2(2)+0(4) \\\\ 3(3)+1(1)+(-1)(-1) & 3(0)+1(2)+(-1)(4) \\end{bmatrix}$\n$= \\begin{bmatrix} 3+2+0 & 0+4+0 \\\\ 9+1+1 & 0+2-4 \\end{bmatrix} = \\mathbf{\\begin{bmatrix} 5 & 4 \\\\ 11 & -2 \\end{bmatrix}}$.",
    },
    {
      label: "c",
      marks: 2,
      content: `State the dimensions of $AC$ (if defined) and compare with the dimensions of $CA$. What does this comparison show about matrix multiplication?`,
      solution: "$A$ is $3 \\times 2$ and $C$ is $2 \\times 3$. For $AC$: inner dims $2$ and $2$ match ⇒ defined, result $3 \\times 3$. For $CA$ (computed in part **b**): result $2 \\times 2$.\n\n$AC$ and $CA$ both exist but have **different dimensions** ($3 \\times 3$ vs $2 \\times 2$) — they cannot be equal, demonstrating that matrix multiplication is not commutative in general.",
    },
  ],
  "MEDIUM",
  `Work with several rectangular matrices and apply matrix arithmetic.`,
);

extAns(
  MM,
  [
    {
      label: "a",
      marks: 2,
      content: `Construct a $2 \\times 3$ sales matrix $S$ whose rows are weekdays Mon and Tue, and columns are apples, bananas, cherries. Mon sold (30, 50, 20); Tue sold (40, 45, 25).`,
      solution: "$S = \\begin{bmatrix} 30 & 50 & 20 \\\\ 40 & 45 & 25 \\end{bmatrix}$.",
    },
    {
      label: "b",
      marks: 2,
      content: `If the prices (in \\$) are apples 2.50, bananas 1.20, cherries 8.00, write a $3 \\times 1$ price matrix $P$ and compute the daily takings $SP$.`,
      solution: "$P = \\begin{bmatrix} 2.50 \\\\ 1.20 \\\\ 8.00 \\end{bmatrix}$. $SP = \\begin{bmatrix} 30(2.50) + 50(1.20) + 20(8.00) \\\\ 40(2.50) + 45(1.20) + 25(8.00) \\end{bmatrix} = \\begin{bmatrix} 75 + 60 + 160 \\\\ 100 + 54 + 200 \\end{bmatrix} = \\mathbf{\\begin{bmatrix} 295 \\\\ 354 \\end{bmatrix}}$. Mon takings = \\$295, Tue takings = \\$354.",
    },
    {
      label: "c",
      marks: 2,
      content: `What are the dimensions of $S$, $P$ and $SP$ respectively? Why is $PS$ undefined?`,
      solution: "$S$: $2 \\times 3$; $P$: $3 \\times 1$; $SP$: $2 \\times 1$. For $PS$: $(3 \\times 1)(2 \\times 3)$ — inner dims are 1 and 2, which don't match, so $PS$ is undefined.",
    },
    {
      label: "d",
      marks: 2,
      content: `Suppose Wednesday's sales were 35 apples, 55 bananas, 22 cherries. Add a row to $S$ to create a $3 \\times 3$ extended sales matrix and recompute the daily takings.`,
      solution: "$S' = \\begin{bmatrix} 30 & 50 & 20 \\\\ 40 & 45 & 25 \\\\ 35 & 55 & 22 \\end{bmatrix}$. $S' P = \\begin{bmatrix} 295 \\\\ 354 \\\\ 35(2.50) + 55(1.20) + 22(8.00) \\end{bmatrix} = \\begin{bmatrix} 295 \\\\ 354 \\\\ 87.5 + 66 + 176 \\end{bmatrix} = \\mathbf{\\begin{bmatrix} 295 \\\\ 354 \\\\ 329.50 \\end{bmatrix}}$.",
    },
  ],
  "MEDIUM",
  `Matrices are used to store and process two-dimensional data such as sales records.`,
);

// EXT_RESP × 2
extResp(
  MM,
  [
    {
      label: "a",
      marks: 2,
      content: `Write down a $2 \\times 3$ matrix $S$ summarising the sales for the two stores (rows = stores; columns = bread, milk, eggs):\n\n| Store | Bread | Milk | Eggs |\n|---|---|---|---|\n| North | 80 | 120 | 60 |\n| South | 95 | 100 | 70 |`,
      solution: "$S = \\begin{bmatrix} 80 & 120 & 60 \\\\ 95 & 100 & 70 \\end{bmatrix}$.",
    },
    {
      label: "b",
      marks: 2,
      content: `If the wholesale costs are \\$2 for bread, \\$3 for milk and \\$4 for eggs, write a $3 \\times 1$ price matrix $P$ and compute the matrix product $SP$.`,
      solution: "$P = \\begin{bmatrix} 2 \\\\ 3 \\\\ 4 \\end{bmatrix}$. $SP = \\begin{bmatrix} 80(2)+120(3)+60(4) \\\\ 95(2)+100(3)+70(4) \\end{bmatrix} = \\begin{bmatrix} 160 + 360 + 240 \\\\ 190 + 300 + 280 \\end{bmatrix} = \\mathbf{\\begin{bmatrix} 760 \\\\ 770 \\end{bmatrix}}$.",
    },
    {
      label: "c",
      marks: 2,
      content: `Interpret each entry of $SP$ in the real-world context.`,
      solution: "Each row gives the total wholesale cost for that store. North store's wholesale cost = \\$760, South store's wholesale cost = \\$770.",
    },
    {
      label: "d",
      marks: 2,
      content: `Suppose the wholesale prices increase by 10%. Write a new price matrix $P'$ and find the new daily wholesale cost matrix.`,
      solution: "$P' = 1.1 P = \\begin{bmatrix} 2.20 \\\\ 3.30 \\\\ 4.40 \\end{bmatrix}$. $SP' = 1.1 \\times SP = 1.1 \\times \\begin{bmatrix} 760 \\\\ 770 \\end{bmatrix} = \\mathbf{\\begin{bmatrix} 836 \\\\ 847 \\end{bmatrix}}$. North's new cost = \\$836, South's = \\$847.",
    },
    {
      label: "e",
      marks: 3,
      content: `The manager wants the daily takings for each store. The retail prices are \\$3, \\$4 and \\$6 for bread, milk and eggs respectively. Form a retail-price matrix $R$ and compute the daily takings $SR$. Determine which store has the higher daily revenue and by how much.`,
      solution: "$R = \\begin{bmatrix} 3 \\\\ 4 \\\\ 6 \\end{bmatrix}$. $SR = \\begin{bmatrix} 80(3)+120(4)+60(6) \\\\ 95(3)+100(4)+70(6) \\end{bmatrix} = \\begin{bmatrix} 240+480+360 \\\\ 285+400+420 \\end{bmatrix} = \\mathbf{\\begin{bmatrix} 1080 \\\\ 1105 \\end{bmatrix}}$. **South** store has higher revenue by $1105 - 1080 = \\$25$ per day.",
    },
  ],
  "MEDIUM",
  `**Question — Supermarket sales analysis**\n\nA chain has two stores (North and South). The number of units of three products sold yesterday is recorded below.`,
);

extResp(
  MM,
  [
    {
      label: "a",
      marks: 2,
      content: `Three companies — Alpha, Beta and Gamma — each manufacture two products $X$ and $Y$. The number of items produced per day is given by matrix $N$:\n\n$N = \\begin{bmatrix} 40 & 60 \\\\ 35 & 50 \\\\ 50 & 45 \\end{bmatrix}$ (rows: Alpha, Beta, Gamma; cols: $X$, $Y$).\n\nWrite down the dimensions of $N$ and explain what entry $N_{2,1}$ represents.`,
      solution: "Dimensions $\\mathbf{3 \\times 2}$. $N_{2,1} = 35$ represents the number of product $X$ items produced per day by Beta.",
    },
    {
      label: "b",
      marks: 3,
      content: `The cost matrix per item is $C = \\begin{bmatrix} 12 \\\\ 18 \\end{bmatrix}$. Compute $NC$ and state what each entry represents.`,
      solution: "$NC = \\begin{bmatrix} 40(12)+60(18) \\\\ 35(12)+50(18) \\\\ 50(12)+45(18) \\end{bmatrix} = \\begin{bmatrix} 480+1080 \\\\ 420+900 \\\\ 600+810 \\end{bmatrix} = \\mathbf{\\begin{bmatrix} 1560 \\\\ 1320 \\\\ 1410 \\end{bmatrix}}$.\n\nEntries: total daily production cost for Alpha (\\$1560), Beta (\\$1320) and Gamma (\\$1410).",
    },
    {
      label: "c",
      marks: 2,
      content: `Compute the matrix $5N$. What does this scalar multiplication represent in context?`,
      solution: "$5N = \\begin{bmatrix} 200 & 300 \\\\ 175 & 250 \\\\ 250 & 225 \\end{bmatrix}$. In context: production over a 5-day work week (since daily figures are multiplied by 5).",
    },
    {
      label: "d",
      marks: 3,
      content: `Suppose Delta company also enters the market, producing 25 of $X$ and 70 of $Y$ per day. Construct an expanded production matrix $N'$ ($4 \\times 2$) and the new total daily costs vector $N'C$.`,
      solution: "$N' = \\begin{bmatrix} 40 & 60 \\\\ 35 & 50 \\\\ 50 & 45 \\\\ 25 & 70 \\end{bmatrix}$. $N'C = \\begin{bmatrix} 1560 \\\\ 1320 \\\\ 1410 \\\\ 25(12)+70(18) \\end{bmatrix} = \\begin{bmatrix} 1560 \\\\ 1320 \\\\ 1410 \\\\ 300 + 1260 \\end{bmatrix} = \\mathbf{\\begin{bmatrix} 1560 \\\\ 1320 \\\\ 1410 \\\\ 1560 \\end{bmatrix}}$.",
    },
    {
      label: "e",
      marks: 2,
      content: `If the selling prices per item are \\$20 for $X$ and \\$25 for $Y$, compute the daily revenue for each of the original three companies and identify the company with the highest profit. (Use the production matrix $N$ from part **a** and the cost matrix from **b**.)`,
      solution: "Revenue matrix $R = \\begin{bmatrix} 20 \\\\ 25 \\end{bmatrix}$. $NR = \\begin{bmatrix} 40(20)+60(25) \\\\ 35(20)+50(25) \\\\ 50(20)+45(25) \\end{bmatrix} = \\begin{bmatrix} 800+1500 \\\\ 700+1250 \\\\ 1000+1125 \\end{bmatrix} = \\begin{bmatrix} 2300 \\\\ 1950 \\\\ 2125 \\end{bmatrix}$.\n\nProfits $NR - NC = \\begin{bmatrix} 2300-1560 \\\\ 1950-1320 \\\\ 2125-1410 \\end{bmatrix} = \\mathbf{\\begin{bmatrix} 740 \\\\ 630 \\\\ 715 \\end{bmatrix}}$. **Alpha** has the highest daily profit (\\$740).",
    },
  ],
  "MEDIUM",
  `**Question — Manufacturing analysis**\n\nA matrix is used to summarise the daily production figures of three companies producing two products. We apply matrix arithmetic to compute costs, revenue and profit.`,
);

// ═══════════════════════════════════════════════════════════════════════
// SUBTOPIC 5: matrix-inverses-and-determinants (extended-fit) — 17 items
// ═══════════════════════════════════════════════════════════════════════
const MI = "matrix-inverses-and-determinants";

// MCQ × 9
mcq(
  MI,
  `The determinant of $A = \\begin{bmatrix} 4 & 3 \\\\ 2 & 5 \\end{bmatrix}$ is`,
  ["6", "10", "14", "20"],
  "C",
  "EASY",
  "**Answer: C**\n\n$\\det A = ad - bc = 4 \\times 5 - 3 \\times 2 = 20 - 6 = 14$.",
);

mcq(
  MI,
  `The matrix $A = \\begin{bmatrix} 6 & 4 \\\\ 3 & 2 \\end{bmatrix}$ is`,
  [
    "Invertible with $\\det A = 0$",
    "Not invertible (singular), $\\det A = 0$",
    "Invertible with $\\det A = 12$",
    "Not invertible because $\\det A = 24$",
  ],
  "B",
  "EASY",
  "**Answer: B**\n\n$\\det A = 6 \\times 2 - 4 \\times 3 = 12 - 12 = 0$. A matrix with zero determinant is **singular** (not invertible).",
);

mcq(
  MI,
  `If $A = \\begin{bmatrix} 2 & 1 \\\\ 5 & 3 \\end{bmatrix}$, then $A^{-1}$ equals`,
  [
    "$\\begin{bmatrix} 3 & -1 \\\\ -5 & 2 \\end{bmatrix}$",
    "$\\begin{bmatrix} 2 & -1 \\\\ -5 & 3 \\end{bmatrix}$",
    "$\\begin{bmatrix} 3 & 1 \\\\ 5 & 2 \\end{bmatrix}$",
    "Does not exist",
  ],
  "A",
  "MEDIUM",
  "**Answer: A**\n\n$\\det A = 2 \\times 3 - 1 \\times 5 = 1$. $A^{-1} = \\frac{1}{1}\\begin{bmatrix} 3 & -1 \\\\ -5 & 2 \\end{bmatrix} = \\begin{bmatrix} 3 & -1 \\\\ -5 & 2 \\end{bmatrix}$.",
);

mcq(
  MI,
  `For matrices $A$ and $B$ (both invertible $n \\times n$), the inverse of $AB$ is`,
  ["$A^{-1} B^{-1}$", "$B^{-1} A^{-1}$", "$AB^{-1}$", "$(AB)$"],
  "B",
  "EASY",
  "**Answer: B**\n\n$(AB)^{-1} = B^{-1} A^{-1}$ (the order reverses). Check: $(AB)(B^{-1} A^{-1}) = A(BB^{-1})A^{-1} = A I A^{-1} = AA^{-1} = I$.",
);

mcq(
  MI,
  `The determinant of $\\begin{bmatrix} k & 2 \\\\ 3 & 4 \\end{bmatrix}$ is zero when $k$ equals`,
  ["$\\tfrac{2}{3}$", "$\\tfrac{3}{2}$", "$\\tfrac{8}{3}$", "$\\tfrac{3}{8}$"],
  "B",
  "MEDIUM",
  "**Answer: B**\n\n$\\det = 4k - 6 = 0 \\Rightarrow k = 6/4 = 3/2$.",
);

mcq(
  MI,
  `The solution of the system $\\begin{cases} 2x + 3y = 7 \\\\ x + 4y = 6 \\end{cases}$ using the matrix method $\\mathbf{x} = A^{-1}\\mathbf{b}$ gives`,
  ["$x = 1, y = 1$", "$x = 2, y = 1$", "$x = 0, y = 1.5$", "$x = -1, y = 3$"],
  "B",
  "MEDIUM",
  "**Answer: B**\n\n$A = \\begin{bmatrix} 2 & 3 \\\\ 1 & 4 \\end{bmatrix}$, $\\det A = 8 - 3 = 5$. $A^{-1} = \\tfrac{1}{5}\\begin{bmatrix} 4 & -3 \\\\ -1 & 2 \\end{bmatrix}$. $A^{-1}\\mathbf{b} = \\tfrac{1}{5}\\begin{bmatrix} 4(7) + (-3)(6) \\\\ -1(7) + 2(6) \\end{bmatrix} = \\tfrac{1}{5}\\begin{bmatrix} 10 \\\\ 5 \\end{bmatrix} = \\begin{bmatrix} 2 \\\\ 1 \\end{bmatrix}$.",
);

mcq(
  MI,
  `For which value of $a$ does the system $\\begin{cases} ax + 2y = 5 \\\\ 4x + a y = 8 \\end{cases}$ have **no unique solution**?`,
  ["$a = 2$ only", "$a = -2\\sqrt{2}$ only", "$a = \\pm 2\\sqrt{2}$", "$a = 8$"],
  "C",
  "HARD",
  "**Answer: C**\n\nNo unique solution iff coefficient matrix is singular: $\\det \\begin{bmatrix} a & 2 \\\\ 4 & a \\end{bmatrix} = a^2 - 8 = 0 \\Rightarrow a = \\pm 2\\sqrt{2}$.",
);

mcq(
  MI,
  `If $\\det A = 5$ for a $2 \\times 2$ matrix, then $\\det(2A)$ equals`,
  ["10", "20", "5", "25"],
  "B",
  "MEDIUM",
  "**Answer: B**\n\nFor $n \\times n$: $\\det(kA) = k^n \\det A$. For $n = 2$: $\\det(2A) = 2^2 \\times 5 = 20$.",
);

mcq(
  MI,
  `The inverse of the identity matrix $I_2$ is`,
  ["$O$ (zero matrix)", "$I_2$ itself", "$2I_2$", "Undefined"],
  "B",
  "EASY",
  "**Answer: B**\n\n$I \\cdot I = I$, so $I^{-1} = I$. The identity matrix is its own inverse.",
);

// SHORT_ANSWER × 4
short(
  MI,
  `Find the determinant of each matrix below and state whether it is invertible.\n\n**a.** $A = \\begin{bmatrix} 3 & 5 \\\\ 1 & 2 \\end{bmatrix}$\n\n**b.** $B = \\begin{bmatrix} 6 & 4 \\\\ 9 & 6 \\end{bmatrix}$\n\n**c.** $C = \\begin{bmatrix} 4 & -3 \\\\ -2 & 1 \\end{bmatrix}$\n\n(3 marks)`,
  3,
  "EASY",
  "**a.** $\\det A = 3(2) - 5(1) = 6 - 5 = \\mathbf{1}$ — invertible.\n\n**b.** $\\det B = 6(6) - 4(9) = 36 - 36 = \\mathbf{0}$ — **not** invertible (singular).\n\n**c.** $\\det C = 4(1) - (-3)(-2) = 4 - 6 = \\mathbf{-2}$ — invertible.",
);

short(
  MI,
  `For matrix $A = \\begin{bmatrix} 4 & 3 \\\\ 2 & 2 \\end{bmatrix}$:\n\n**a.** Find $\\det A$. (1 mark)\n\n**b.** Find $A^{-1}$ in the form $\\frac{1}{k}\\begin{bmatrix} a & b \\\\ c & d \\end{bmatrix}$. (2 marks)\n\n**c.** Verify $A A^{-1} = I$. (1 mark)`,
  4,
  "MEDIUM",
  "**a.** $\\det A = 4(2) - 3(2) = 8 - 6 = \\mathbf{2}$.\n\n**b.** $A^{-1} = \\frac{1}{2}\\begin{bmatrix} 2 & -3 \\\\ -2 & 4 \\end{bmatrix} = \\begin{bmatrix} 1 & -1.5 \\\\ -1 & 2 \\end{bmatrix}$.\n\n**c.** $A A^{-1} = \\begin{bmatrix} 4(1)+3(-1) & 4(-1.5)+3(2) \\\\ 2(1)+2(-1) & 2(-1.5)+2(2) \\end{bmatrix} = \\begin{bmatrix} 1 & 0 \\\\ 0 & 1 \\end{bmatrix} = I$. Verified.",
);

short(
  MI,
  `Use the matrix method $\\mathbf{x} = A^{-1}\\mathbf{b}$ to solve $\\begin{cases} 3x + 2y = 16 \\\\ 5x - y = 5 \\end{cases}$.\n\nShow $A$, $\\mathbf{b}$, $A^{-1}$ and the final solution. (4 marks)`,
  4,
  "MEDIUM",
  "$A = \\begin{bmatrix} 3 & 2 \\\\ 5 & -1 \\end{bmatrix}$, $\\mathbf{b} = \\begin{bmatrix} 16 \\\\ 5 \\end{bmatrix}$.\n\n$\\det A = 3(-1) - 2(5) = -3 - 10 = -13$.\n\n$A^{-1} = \\frac{1}{-13}\\begin{bmatrix} -1 & -2 \\\\ -5 & 3 \\end{bmatrix} = \\frac{1}{13}\\begin{bmatrix} 1 & 2 \\\\ 5 & -3 \\end{bmatrix}$.\n\n$\\mathbf{x} = A^{-1}\\mathbf{b} = \\frac{1}{13}\\begin{bmatrix} 1(16) + 2(5) \\\\ 5(16) + (-3)(5) \\end{bmatrix} = \\frac{1}{13}\\begin{bmatrix} 26 \\\\ 65 \\end{bmatrix} = \\mathbf{\\begin{bmatrix} 2 \\\\ 5 \\end{bmatrix}}$.\n\nSo $x = 2, y = 5$. Verify: $3(2) + 2(5) = 16$ ✓; $5(2) - 5 = 5$ ✓.",
);

short(
  MI,
  `Given $\\begin{bmatrix} 5 & 2 \\\\ k & 4 \\end{bmatrix}$ is singular (not invertible), find $k$. Justify by computing the determinant. (2 marks)`,
  2,
  "EASY",
  "Singular ⇔ determinant = 0. $\\det = 5(4) - 2(k) = 20 - 2k = 0 \\Rightarrow 2k = 20 \\Rightarrow k = \\mathbf{10}$.",
);

// EXT_ANS × 2
extAns(
  MI,
  [
    {
      label: "a",
      marks: 2,
      content: `Write the system of equations $\\begin{cases} 4x + 2y = 14 \\\\ 3x + y = 8 \\end{cases}$ in matrix form $A\\mathbf{x} = \\mathbf{b}$.`,
      solution: "$\\begin{bmatrix} 4 & 2 \\\\ 3 & 1 \\end{bmatrix} \\begin{bmatrix} x \\\\ y \\end{bmatrix} = \\begin{bmatrix} 14 \\\\ 8 \\end{bmatrix}$.",
    },
    {
      label: "b",
      marks: 2,
      content: `Compute $A^{-1}$, showing the determinant and the formula used.`,
      solution: "$\\det A = 4(1) - 2(3) = 4 - 6 = -2$.\n$A^{-1} = \\frac{1}{-2}\\begin{bmatrix} 1 & -2 \\\\ -3 & 4 \\end{bmatrix} = \\begin{bmatrix} -0.5 & 1 \\\\ 1.5 & -2 \\end{bmatrix}$.",
    },
    {
      label: "c",
      marks: 2,
      content: `Use $A^{-1}$ to solve the system and state $x$ and $y$.`,
      solution: "$\\mathbf{x} = A^{-1}\\mathbf{b} = \\begin{bmatrix} -0.5(14) + 1(8) \\\\ 1.5(14) + (-2)(8) \\end{bmatrix} = \\begin{bmatrix} -7 + 8 \\\\ 21 - 16 \\end{bmatrix} = \\mathbf{\\begin{bmatrix} 1 \\\\ 5 \\end{bmatrix}}$. So $x = 1, y = 5$.",
    },
  ],
  "MEDIUM",
  `Solve a $2 \\times 2$ linear system using matrix inverses.`,
);

extAns(
  MI,
  [
    {
      label: "a",
      marks: 2,
      content: `For $A = \\begin{bmatrix} 1 & 2 \\\\ 3 & k \\end{bmatrix}$, find the value(s) of $k$ for which $A$ is **singular**.`,
      solution: "$\\det A = 1 \\cdot k - 2 \\cdot 3 = k - 6$. Singular when $k - 6 = 0 \\Rightarrow \\mathbf{k = 6}$.",
    },
    {
      label: "b",
      marks: 2,
      content: `For $k = 4$, find $A^{-1}$.`,
      solution: "$A = \\begin{bmatrix} 1 & 2 \\\\ 3 & 4 \\end{bmatrix}$. $\\det = 4 - 6 = -2$. $A^{-1} = \\frac{1}{-2}\\begin{bmatrix} 4 & -2 \\\\ -3 & 1 \\end{bmatrix} = \\begin{bmatrix} -2 & 1 \\\\ 1.5 & -0.5 \\end{bmatrix}$.",
    },
    {
      label: "c",
      marks: 3,
      content: `For $k = 4$, use $A^{-1}$ to solve $A\\mathbf{x} = \\begin{bmatrix} 7 \\\\ 15 \\end{bmatrix}$.`,
      solution: "$\\mathbf{x} = A^{-1}\\mathbf{b} = \\begin{bmatrix} -2(7) + 1(15) \\\\ 1.5(7) + (-0.5)(15) \\end{bmatrix} = \\begin{bmatrix} -14 + 15 \\\\ 10.5 - 7.5 \\end{bmatrix} = \\mathbf{\\begin{bmatrix} 1 \\\\ 3 \\end{bmatrix}}$. So $x = 1, y = 3$.",
    },
    {
      label: "d",
      marks: 2,
      content: `For $k = 6$, what happens when you try to solve $A\\mathbf{x} = \\begin{bmatrix} 5 \\\\ 12 \\end{bmatrix}$? Justify briefly.`,
      solution: "With $k = 6$: $A = \\begin{bmatrix} 1 & 2 \\\\ 3 & 6 \\end{bmatrix}$, $\\det A = 0$ (singular), so $A^{-1}$ does not exist. The system either has no solution or infinitely many. Check: row 2 is $3 \\times$ row 1 of coefficients. The right-hand side: $12 = 3 \\times (?)$. Take $(?) = 4$. The two equations are $x + 2y = 5$ and $3x + 6y = 12$, i.e. $x + 2y = 4$. The two equations contradict each other (5 ≠ 4), so the system has **no solution** (inconsistent).",
    },
  ],
  "HARD",
  `The invertibility of a $2 \\times 2$ matrix depends on its determinant. We explore the implications for solving linear systems.`,
);

// EXT_RESP × 2
extResp(
  MI,
  [
    {
      label: "a",
      marks: 2,
      content: `Write the system $\\begin{cases} 3x + 4y = 18 \\\\ x + 2y = 8 \\end{cases}$ in matrix form $A\\mathbf{x} = \\mathbf{b}$.`,
      solution: "$\\begin{bmatrix} 3 & 4 \\\\ 1 & 2 \\end{bmatrix} \\begin{bmatrix} x \\\\ y \\end{bmatrix} = \\begin{bmatrix} 18 \\\\ 8 \\end{bmatrix}$.",
    },
    {
      label: "b",
      marks: 2,
      content: `Compute $\\det A$ and $A^{-1}$.`,
      solution: "$\\det A = 3(2) - 4(1) = 6 - 4 = 2$. $A^{-1} = \\frac{1}{2}\\begin{bmatrix} 2 & -4 \\\\ -1 & 3 \\end{bmatrix} = \\begin{bmatrix} 1 & -2 \\\\ -0.5 & 1.5 \\end{bmatrix}$.",
    },
    {
      label: "c",
      marks: 2,
      content: `Solve for $x$ and $y$ using $\\mathbf{x} = A^{-1}\\mathbf{b}$. Show working.`,
      solution: "$\\mathbf{x} = A^{-1}\\mathbf{b} = \\begin{bmatrix} 1(18) + (-2)(8) \\\\ -0.5(18) + 1.5(8) \\end{bmatrix} = \\begin{bmatrix} 18 - 16 \\\\ -9 + 12 \\end{bmatrix} = \\mathbf{\\begin{bmatrix} 2 \\\\ 3 \\end{bmatrix}}$. So $x = 2, y = 3$.",
    },
    {
      label: "d",
      marks: 2,
      content: `Verify the solution by substituting back into the original equations.`,
      solution: "Eq 1: $3(2) + 4(3) = 6 + 12 = 18$ ✓. Eq 2: $1(2) + 2(3) = 2 + 6 = 8$ ✓. Both equations satisfied.",
    },
    {
      label: "e",
      marks: 3,
      content: `Now consider the system $\\begin{cases} 3x + 4y = 18 \\\\ 6x + 8y = 36 \\end{cases}$. Compute the determinant of the coefficient matrix, then describe (using matrix concepts) why this system has infinitely many solutions.`,
      solution: "Coefficient matrix $A' = \\begin{bmatrix} 3 & 4 \\\\ 6 & 8 \\end{bmatrix}$. $\\det A' = 3(8) - 4(6) = 24 - 24 = 0$. Singular ⇒ $A'^{-1}$ doesn't exist.\n\nObserve: Equation 2 is $2 \\times$ Equation 1 — they are the same line. So **infinitely many** solutions (every point on $3x + 4y = 18$ satisfies both equations).",
    },
  ],
  "MEDIUM",
  `**Question — Solving systems via matrix inverses**\n\nWe explore the connection between determinants, matrix inverses, and the existence/uniqueness of solutions to $2 \\times 2$ linear systems.`,
);

extResp(
  MI,
  [
    {
      label: "a",
      marks: 2,
      content: `Construct two equations using the information: a fruit vendor sells apples at \\$$a$ and oranges at \\$$b$. Day 1: sells 3 apples and 4 oranges for total \\$13. Day 2: sells 5 apples and 2 oranges for total \\$17. Write the matrix equation $A\\mathbf{x} = \\mathbf{c}$ where $\\mathbf{x} = \\begin{bmatrix} a \\\\ b \\end{bmatrix}$.`,
      solution: "Day 1: $3a + 4b = 13$. Day 2: $5a + 2b = 17$. Matrix form: $\\begin{bmatrix} 3 & 4 \\\\ 5 & 2 \\end{bmatrix} \\begin{bmatrix} a \\\\ b \\end{bmatrix} = \\begin{bmatrix} 13 \\\\ 17 \\end{bmatrix}$.",
    },
    {
      label: "b",
      marks: 2,
      content: `Find $\\det A$ and $A^{-1}$.`,
      solution: "$\\det A = 3(2) - 4(5) = 6 - 20 = -14$. $A^{-1} = \\frac{1}{-14}\\begin{bmatrix} 2 & -4 \\\\ -5 & 3 \\end{bmatrix} = \\frac{1}{14}\\begin{bmatrix} -2 & 4 \\\\ 5 & -3 \\end{bmatrix}$.",
    },
    {
      label: "c",
      marks: 2,
      content: `Solve for $a$ (apple price) and $b$ (orange price).`,
      solution: "$\\mathbf{x} = A^{-1}\\mathbf{c} = \\frac{1}{14}\\begin{bmatrix} -2(13) + 4(17) \\\\ 5(13) - 3(17) \\end{bmatrix} = \\frac{1}{14}\\begin{bmatrix} -26 + 68 \\\\ 65 - 51 \\end{bmatrix} = \\frac{1}{14}\\begin{bmatrix} 42 \\\\ 14 \\end{bmatrix} = \\mathbf{\\begin{bmatrix} 3 \\\\ 1 \\end{bmatrix}}$.\n\nSo apple price $a = \\$3$, orange price $b = \\$1$. Verify: $3(3) + 4(1) = 13$ ✓; $5(3) + 2(1) = 17$ ✓.",
    },
    {
      label: "d",
      marks: 3,
      content: `On Day 3 the vendor sells 4 apples and 5 oranges. Using the prices from part **c**, find the total takings. (Hint: row matrix times column matrix.)`,
      solution: "Quantities row matrix: $\\begin{bmatrix} 4 & 5 \\end{bmatrix}$. Prices column matrix: $\\begin{bmatrix} 3 \\\\ 1 \\end{bmatrix}$.\n\nTakings $= 4 \\times 3 + 5 \\times 1 = 12 + 5 = \\mathbf{\\$17}$.",
    },
    {
      label: "e",
      marks: 3,
      content: `Suppose instead the equations were Day 1: $3a + 4b = 13$, Day 2: $6a + 8b = 25$. Show that the new coefficient matrix is singular and explain what this means in the real-world context.`,
      solution: "New coefficient matrix $A' = \\begin{bmatrix} 3 & 4 \\\\ 6 & 8 \\end{bmatrix}$. $\\det A' = 3(8) - 4(6) = 24 - 24 = 0$ ⇒ singular.\n\n**Context**: Day 2's quantities are exactly $2 \\times$ Day 1's quantities. If consistent (RHS would be $2 \\times 13 = 26$), there'd be infinitely many price combinations. But RHS is 25, not 26 — the data is **inconsistent** (no prices $a, b$ satisfy both records). Conclusion: there must be a recording error on one of the days.",
    },
  ],
  "MEDIUM",
  `**Question — Pricing problem with matrices**\n\nA fruit vendor uses matrix methods to determine the unit prices of two products from total sales data over two days. We explore the role of the determinant.`,
);

// ─── Write output ──────────────────────────────────────────────────────

const spec = {
  subject_slug: SUBJECT_SLUG,
  question_set_id: QUESTION_SET_ID,
  items,
};

const outPath = path.join(OUT_DIR, "qset-general-algebra-sequences-matrices.json");
fs.writeFileSync(outPath, JSON.stringify(spec, null, 2));
console.log(`✓ Wrote ${items.length} items to ${outPath}`);
console.log(`  MCQ:               ${items.filter((i) => i.type === "MCQ").length}`);
console.log(`  SHORT_ANSWER:      ${items.filter((i) => i.type === "SHORT_ANSWER").length}`);
console.log(`  EXTENDED_ANSWER:   ${items.filter((i) => i.type === "EXTENDED_ANSWER").length}`);
console.log(`  EXTENDED_RESPONSE: ${items.filter((i) => i.type === "EXTENDED_RESPONSE").length}`);

// Per-subtopic breakdown
const subtopics = [
  "arithmetic-sequences",
  "geometric-sequences",
  "recurrence-relations",
  "matrices-and-matrix-operations",
  "matrix-inverses-and-determinants",
];
for (const s of subtopics) {
  const sItems = items.filter((i) => i.subtopic_slugs.includes(s));
  const counts = {
    MCQ: sItems.filter((i) => i.type === "MCQ").length,
    SHORT: sItems.filter((i) => i.type === "SHORT_ANSWER").length,
    EXT_ANS: sItems.filter((i) => i.type === "EXTENDED_ANSWER").length,
    EXT_RESP: sItems.filter((i) => i.type === "EXTENDED_RESPONSE").length,
  };
  console.log(`  ${s}: ${sItems.length} (${JSON.stringify(counts)})`);
}
