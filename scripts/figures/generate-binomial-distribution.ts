/** Wave 1 batch 16: Binomial Distribution ext-resp. */
import * as fs from "fs";
import * as path from "path";
import { barChart, toDataUri } from "./svg";

const DIR = "scripts/output/figures/binomial-distribution";
const OUT = "scripts/output/qset-methods-b2-binomial-distribution.json";
fs.mkdirSync(DIR, { recursive: true });

function binomPmf(n: number, p: number): number[] {
  const out: number[] = [];
  function C(n: number, k: number): number {
    if (k < 0 || k > n) return 0;
    let r = 1;
    for (let i = 0; i < k; i++) r = (r * (n - i)) / (i + 1);
    return r;
  }
  for (let k = 0; k <= n; k++) out.push(C(n, k) * Math.pow(p, k) * Math.pow(1 - p, n - k));
  return out;
}

const fig1 = barChart({
  values: binomPmf(5, 0.4),
  xLabels: ["0", "1", "2", "3", "4", "5"],
  xAxisLabel: "k",
  title: "Bin(n = 5, p = 0.4)",
});

const fig2 = barChart({
  values: binomPmf(10, 0.3),
  xLabels: Array.from({ length: 11 }, (_, i) => String(i)),
  xAxisLabel: "k",
  shadedIndices: [3],
  title: "Bin(n = 10, p = 0.3); E[X] = 3",
});

const fig3 = barChart({
  values: binomPmf(8, 0.5),
  xLabels: Array.from({ length: 9 }, (_, i) => String(i)),
  xAxisLabel: "k",
  shadedIndices: [5, 6, 7, 8],
  title: "Bin(n = 8, p = 0.5); P(X ≥ 5) shaded",
});

const fig4 = barChart({
  values: binomPmf(6, 0.25),
  xLabels: Array.from({ length: 7 }, (_, i) => String(i)),
  xAxisLabel: "k",
  title: "Bin(n = 6, p = 0.25)",
});

const figs = { "binom-5-04.svg": fig1, "binom-10-03.svg": fig2, "binom-8-05.svg": fig3, "binom-6-025.svg": fig4 };
for (const [n, c] of Object.entries(figs)) fs.writeFileSync(path.join(DIR, n), c);
const img = (n: string, a: string) => `![${a}](${toDataUri(figs[n as keyof typeof figs])})`;

const questions = [
  {
    content: `A multiple-choice quiz has $5$ questions, each with $5$ options of which exactly one is correct. A student guesses every answer. Let $X$ be the number of correct answers.

**a.** State the distribution of $X$, including parameters. (2 marks)

**b.** Find $P(X = 2)$, correct to 4 decimal places. (3 marks)

**c.** Find $P(X \\geq 1)$, correct to 4 decimal places. (3 marks)

**d.** Find $E[X]$ and $\\text{Var}(X)$. (2 marks)

${img("binom-5-04.svg", "Binomial pmf bar chart for n = 5, p = 0.4")}`,
    marks: 10,
    difficulty: "MEDIUM",
    solutionContent: `**a. (2 marks)**
*Step 1 (1 mark):* Each question is an independent Bernoulli trial with success probability $p = 0.2$.
*Step 2 (1 mark):* $X \\sim \\text{Bin}(n = 5, p = 0.2)$.

**b. (3 marks)**
*Step 1 (1 mark):* $P(X = 2) = \\binom{5}{2}(0.2)^2 (0.8)^3$.
*Step 2 (1 mark):* $= 10 \\cdot 0.04 \\cdot 0.512$.
*Step 3 (1 mark):* $\\approx 0.2048$.

**c. (3 marks)**
*Step 1 (1 mark):* $P(X \\geq 1) = 1 - P(X = 0)$.
*Step 2 (1 mark):* $P(X = 0) = (0.8)^5 = 0.32768$.
*Step 3 (1 mark):* $P(X \\geq 1) \\approx 0.6723$.

**d. (2 marks)**
*Step 1 (1 mark):* $E[X] = n p = 5 \\times 0.2 = 1$.
*Step 2 (1 mark):* $\\text{Var}(X) = n p (1 - p) = 5 \\times 0.2 \\times 0.8 = 0.8$.`,
    subtopicSlugs: ["binomial-distribution", "discrete-random-variables"],
  },
  {
    content: `A factory produces light bulbs and $30\\%$ are defective. A random sample of $10$ bulbs is taken. Let $X$ be the number of defective bulbs in the sample.

**a.** State the distribution of $X$. (1 mark)

**b.** Find $E[X]$ and the standard deviation, correct to 3 decimal places. (3 marks)

**c.** Find $P(X = 3)$, correct to 4 decimal places. (2 marks)

**d.** Find $P(X \\leq 2)$, correct to 4 decimal places. (3 marks)

**e.** Find $P(X = 3 \\mid X \\geq 2)$, correct to 4 decimal places. (2 marks)

${img("binom-10-03.svg", "Binomial pmf bar chart for n = 10, p = 0.3 with the bar at k = 3 (the expected value) highlighted")}`,
    marks: 11,
    difficulty: "MEDIUM",
    solutionContent: `**a. (1 mark)** $X \\sim \\text{Bin}(10, 0.3)$.

**b. (3 marks)**
*Step 1 (1 mark):* $E[X] = n p = 3$.
*Step 2 (1 mark):* $\\text{Var}(X) = n p (1 - p) = 2.1$.
*Step 3 (1 mark):* $\\sigma = \\sqrt{2.1} \\approx 1.449$.

**c. (2 marks)**
*Step 1 (1 mark):* $P(X = 3) = \\binom{10}{3}(0.3)^3(0.7)^7 = 120 \\cdot 0.027 \\cdot 0.0823543$.
*Step 2 (1 mark):* $\\approx 0.2668$.

**d. (3 marks)**
*Step 1 (1 mark):* $P(X = 0) = (0.7)^{10} \\approx 0.0282$.
*Step 2 (1 mark):* $P(X = 1) = 10(0.3)(0.7)^9 \\approx 0.1211$; $P(X = 2) = 45(0.09)(0.7)^8 \\approx 0.2335$.
*Step 3 (1 mark):* $P(X \\leq 2) \\approx 0.0282 + 0.1211 + 0.2335 = 0.3828$.

**e. (2 marks)**
*Step 1 (1 mark):* $P(X \\geq 2) = 1 - P(X = 0) - P(X = 1) \\approx 1 - 0.0282 - 0.1211 = 0.8507$.
*Step 2 (1 mark):* $P(X = 3 \\mid X \\geq 2) = \\dfrac{0.2668}{0.8507} \\approx 0.3136$.`,
    subtopicSlugs: ["binomial-distribution", "conditional-probability"],
  },
  {
    content: `A coin is biased so $P(\\text{heads}) = 0.5$ but loaded such that we model it as fair. Let $X$ be the number of heads in $8$ tosses. Assume tosses are independent.

**a.** State the distribution of $X$. (1 mark)

**b.** Find $P(X = 4)$. (2 marks)

**c.** Find $P(X \\geq 5)$. (3 marks)

**d.** Use symmetry to find $P(X \\leq 3)$. (2 marks)

**e.** Find the smallest $n$ such that $P(\\text{at least 1 head in } n \\text{ tosses}) > 0.999$. (4 marks)

${img("binom-8-05.svg", "Binomial pmf bar chart for n = 8, p = 0.5, symmetric around the centre, with bars for k = 5, 6, 7, 8 highlighted to indicate P(X ≥ 5)")}`,
    marks: 12,
    difficulty: "HARD",
    solutionContent: `**a. (1 mark)** $X \\sim \\text{Bin}(8, 0.5)$.

**b. (2 marks)**
*Step 1 (1 mark):* $P(X = 4) = \\binom{8}{4}(0.5)^8$.
*Step 2 (1 mark):* $= 70 / 256 = 0.2734$.

**c. (3 marks)**
*Step 1 (1 mark):* $P(X \\geq 5) = P(X = 5) + P(X = 6) + P(X = 7) + P(X = 8)$.
*Step 2 (1 mark):* $\\binom{8}{5} = 56$, $\\binom{8}{6} = 28$, $\\binom{8}{7} = 8$, $\\binom{8}{8} = 1$. Total: $93$.
*Step 3 (1 mark):* $P = 93 / 256 \\approx 0.3633$.

**d. (2 marks)**
*Step 1 (1 mark):* By symmetry $P(X \\leq 3) = P(X \\geq 5)$.
*Step 2 (1 mark):* $\\approx 0.3633$.

**e. (4 marks)**
*Step 1 (1 mark):* $P(\\text{at least 1 head}) = 1 - (0.5)^n > 0.999$.
*Step 2 (1 mark):* $(0.5)^n < 0.001$.
*Step 3 (1 mark):* $n > \\log_{0.5}(0.001) = -\\log_2(0.001) \\approx 9.97$.
*Step 4 (1 mark):* Smallest integer $n = 10$.`,
    subtopicSlugs: ["binomial-distribution"],
  },
  {
    content: `An archer hits the bullseye with probability $p = 0.25$ on each shot. Let $X$ be the number of bullseyes in $n = 6$ shots, assumed independent.

**a.** Find $P(X = 0)$, $P(X = 1)$, and $P(X = 2)$, each correct to 4 decimal places. (4 marks)

**b.** Find $E[X]$ and $\\text{Var}(X)$. (2 marks)

**c.** Find $P(X \\geq 1)$, correct to 4 decimal places. (3 marks)

**d.** Suppose the archer shoots $n$ shots and wants $P(\\text{at least one bullseye}) \\geq 0.95$. Find the smallest such $n$. (3 marks)

${img("binom-6-025.svg", "Binomial pmf bar chart for n = 6, p = 0.25, showing the right-skewed distribution")}`,
    marks: 12,
    difficulty: "HARD",
    solutionContent: `**a. (4 marks)**
*Step 1 (1 mark):* $P(X = 0) = (0.75)^6 \\approx 0.1780$.
*Step 2 (1 mark):* $P(X = 1) = 6(0.25)(0.75)^5 \\approx 0.3560$.
*Step 3 (1 mark):* $P(X = 2) = 15(0.0625)(0.75)^4 \\approx 0.2966$.
*Step 4 (1 mark):* All to 4 dp as shown.

**b. (2 marks)**
*Step 1 (1 mark):* $E[X] = 6 \\times 0.25 = 1.5$.
*Step 2 (1 mark):* $\\text{Var}(X) = 6 \\times 0.25 \\times 0.75 = 1.125$.

**c. (3 marks)**
*Step 1 (1 mark):* $P(X \\geq 1) = 1 - P(X = 0)$.
*Step 2 (1 mark):* $= 1 - 0.1780$.
*Step 3 (1 mark):* $\\approx 0.8220$.

**d. (3 marks)**
*Step 1 (1 mark):* $1 - (0.75)^n \\geq 0.95 \\Rightarrow (0.75)^n \\leq 0.05$.
*Step 2 (1 mark):* $n \\geq \\dfrac{\\ln 0.05}{\\ln 0.75} \\approx \\dfrac{-3}{-0.2877} \\approx 10.4$.
*Step 3 (1 mark):* Smallest integer $n = 11$.`,
    subtopicSlugs: ["binomial-distribution"],
  },
];

const output = { mcq: [], shortAnswer: [], extendedAnswer: [], extendedResponse: questions };
fs.writeFileSync(OUT, JSON.stringify(output, null, 2) + "\n");
console.log(`${OUT}: ${questions.length} questions, ${questions.reduce((s, q) => s + q.marks, 0)} marks`);
