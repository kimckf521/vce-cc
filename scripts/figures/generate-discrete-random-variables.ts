/** Wave 1 batch 15: Discrete Random Variables ext-resp. */
import * as fs from "fs";
import * as path from "path";
import { barChart, toDataUri } from "./svg";

const DIR = "scripts/output/figures/discrete-random-variables";
const OUT = "scripts/output/qset-methods-b2-discrete-random-variables.json";
fs.mkdirSync(DIR, { recursive: true });

const fig1 = barChart({
  values: [0.1, 0.3, 0.4, 0.15, 0.05],
  xLabels: ["0", "1", "2", "3", "4"],
  xAxisLabel: "x",
  title: "pmf of X",
});

const fig2 = barChart({
  values: [0.2, 0.3, 0.3, 0.2],
  xLabels: ["1", "2", "3", "4"],
  xAxisLabel: "x",
  shadedIndices: [1, 2],
  title: "pmf of X (mean ≈ 2.5)",
});

const fig3 = barChart({
  values: [1/16, 4/16, 6/16, 4/16, 1/16],
  xLabels: ["0", "1", "2", "3", "4"],
  xAxisLabel: "x",
  title: "pmf of X (k = 1/16)",
});

const fig4 = barChart({
  values: [0, 1, 4, 9, 16].map(v => v * 0.2),
  xLabels: ["0", "1", "2", "3", "4"],
  xAxisLabel: "x",
  yAxisLabel: "x² · P(X = x)",
  title: "Contribution to E[X²]",
});

const figs = { "pmf-table.svg": fig1, "pmf-symmetric.svg": fig2, "binom-style-pmf.svg": fig3, "x-squared-contribution.svg": fig4 };
for (const [n, c] of Object.entries(figs)) fs.writeFileSync(path.join(DIR, n), c);
const img = (n: string, a: string) => `![${a}](${toDataUri(figs[n as keyof typeof figs])})`;

const questions = [
  {
    content: `A discrete random variable $X$ has the following probability distribution:

| $x$ | 0 | 1 | 2 | 3 | 4 |
|---|---|---|---|---|---|
| $P(X = x)$ | 0.10 | 0.30 | 0.40 | 0.15 | 0.05 |

**a.** Verify that this is a valid probability distribution. (2 marks)

**b.** Find $P(X \\geq 2)$. (2 marks)

**c.** Find $E[X]$. (3 marks)

**d.** Find $P(X = 2 \\mid X \\geq 1)$, correct to 4 decimal places. (3 marks)

${img("pmf-table.svg", "Bar chart showing the pmf of X with bars at x = 0, 1, 2, 3, 4 with respective probabilities 0.10, 0.30, 0.40, 0.15, 0.05")}`,
    marks: 10,
    difficulty: "MEDIUM",
    solutionContent: `**a. (2 marks)**
*Step 1 (1 mark):* All probabilities are non-negative.
*Step 2 (1 mark):* Sum: $0.10 + 0.30 + 0.40 + 0.15 + 0.05 = 1$. ✓

**b. (2 marks)**
*Step 1 (1 mark):* $P(X \\geq 2) = P(2) + P(3) + P(4)$.
*Step 2 (1 mark):* $= 0.40 + 0.15 + 0.05 = 0.60$.

**c. (3 marks)**
*Step 1 (1 mark):* $E[X] = \\sum x P(X = x) = 0(0.10) + 1(0.30) + 2(0.40) + 3(0.15) + 4(0.05)$.
*Step 2 (1 mark):* $= 0 + 0.30 + 0.80 + 0.45 + 0.20$.
*Step 3 (1 mark):* $= 1.75$.

**d. (3 marks)**
*Step 1 (1 mark):* $P(X = 2 \\mid X \\geq 1) = \\dfrac{P(X = 2 \\cap X \\geq 1)}{P(X \\geq 1)} = \\dfrac{P(X = 2)}{P(X \\geq 1)}$.
*Step 2 (1 mark):* $P(X \\geq 1) = 1 - P(X = 0) = 0.90$.
*Step 3 (1 mark):* $\\dfrac{0.40}{0.90} \\approx 0.4444$.`,
    subtopicSlugs: ["discrete-random-variables", "conditional-probability"],
  },
  {
    content: `Let $X$ be a discrete random variable taking values $1, 2, 3, 4$ with $P(X = 1) = 0.2$, $P(X = 2) = 0.3$, $P(X = 3) = 0.3$, $P(X = 4) = 0.2$.

**a.** Find $E[X]$. (3 marks)

**b.** Find $E[X^2]$. (3 marks)

**c.** Find $\\text{Var}(X)$. (2 marks)

**d.** Find the standard deviation of $X$, correct to 4 decimal places. (1 mark)

**e.** Let $Y = 2X + 3$. Find $E[Y]$ and $\\text{Var}(Y)$. (2 marks)

${img("pmf-symmetric.svg", "Bar chart showing the symmetric pmf of X taking values 1, 2, 3, 4 with probabilities 0.2, 0.3, 0.3, 0.2; the middle two values are highlighted to emphasise the mean of 2.5")}`,
    marks: 11,
    difficulty: "MEDIUM",
    solutionContent: `**a. (3 marks)**
*Step 1 (1 mark):* $E[X] = 1(0.2) + 2(0.3) + 3(0.3) + 4(0.2)$.
*Step 2 (1 mark):* $= 0.2 + 0.6 + 0.9 + 0.8$.
*Step 3 (1 mark):* $= 2.5$.

**b. (3 marks)**
*Step 1 (1 mark):* $E[X^2] = 1(0.2) + 4(0.3) + 9(0.3) + 16(0.2)$.
*Step 2 (1 mark):* $= 0.2 + 1.2 + 2.7 + 3.2$.
*Step 3 (1 mark):* $= 7.3$.

**c. (2 marks)**
*Step 1 (1 mark):* $\\text{Var}(X) = E[X^2] - (E[X])^2 = 7.3 - 6.25$.
*Step 2 (1 mark):* $= 1.05$.

**d. (1 mark)** $\\sigma = \\sqrt{1.05} \\approx 1.0247$.

**e. (2 marks)**
*Step 1 (1 mark):* $E[Y] = 2 E[X] + 3 = 2(2.5) + 3 = 8$.
*Step 2 (1 mark):* $\\text{Var}(Y) = 4 \\text{Var}(X) = 4(1.05) = 4.20$.`,
    subtopicSlugs: ["discrete-random-variables"],
  },
  {
    content: `A discrete random variable $X$ takes values $0, 1, 2, 3, 4$ with probabilities given by $P(X = x) = \\binom{4}{x} k$, where $k$ is a constant.

**a.** Find $k$. (3 marks)

**b.** Write out the full probability distribution of $X$. (3 marks)

**c.** Find $E[X]$. (3 marks)

**d.** Find $P(X \\geq 3)$. (2 marks)

**e.** Find $P(X = 4 \\mid X \\geq 3)$. (1 mark)

${img("binom-style-pmf.svg", "Bar chart showing the pmf P(X = x) = C(4, x) k for x = 0, 1, 2, 3, 4, with k = 1/16, giving probabilities 1/16, 4/16, 6/16, 4/16, 1/16")}`,
    marks: 12,
    difficulty: "HARD",
    solutionContent: `**a. (3 marks)**
*Step 1 (1 mark):* $\\sum_x P(X = x) = k \\sum_x \\binom{4}{x} = k \\cdot 2^4 = 16 k$.
*Step 2 (1 mark):* Set $16 k = 1$.
*Step 3 (1 mark):* $k = \\dfrac{1}{16}$.

**b. (3 marks)**
*Step 1 (1 mark):* $P(X = 0) = \\dfrac{1}{16}$, $P(X = 1) = \\dfrac{4}{16}$.
*Step 2 (1 mark):* $P(X = 2) = \\dfrac{6}{16}$, $P(X = 3) = \\dfrac{4}{16}$.
*Step 3 (1 mark):* $P(X = 4) = \\dfrac{1}{16}$. (Note: $X \\sim \\text{Bin}(4, 0.5)$.)

**c. (3 marks)**
*Step 1 (1 mark):* By symmetry, $E[X] = 2$.
*Step 2 (1 mark):* Or compute: $\\dfrac{1}{16}(0 \\cdot 1 + 1 \\cdot 4 + 2 \\cdot 6 + 3 \\cdot 4 + 4 \\cdot 1)$.
*Step 3 (1 mark):* $= \\dfrac{1}{16}(0 + 4 + 12 + 12 + 4) = \\dfrac{32}{16} = 2$.

**d. (2 marks)**
*Step 1 (1 mark):* $P(X \\geq 3) = P(X = 3) + P(X = 4)$.
*Step 2 (1 mark):* $= \\dfrac{4}{16} + \\dfrac{1}{16} = \\dfrac{5}{16}$.

**e. (1 mark)** $P(X = 4 \\mid X \\geq 3) = \\dfrac{1/16}{5/16} = \\dfrac{1}{5}$.`,
    subtopicSlugs: ["discrete-random-variables", "binomial-distribution"],
  },
  {
    content: `A fair four-sided die (faces labelled 0, 1, 2, 3, 4) is rolled once. Let $X$ be the number shown. Each outcome is equally likely.

Wait — a four-sided die has 4 faces. Suppose instead the spinner has 5 equally-likely outcomes labelled $0, 1, 2, 3, 4$, and $X$ is the outcome.

**a.** State the pmf of $X$. (1 mark)

**b.** Find $E[X]$ and $\\text{Var}(X)$. (4 marks)

**c.** Let $Y = X^2$. Find the pmf of $Y$. (3 marks)

**d.** Find $E[Y]$ in two ways: (i) directly from the pmf of $Y$, and (ii) using $E[Y] = E[X^2]$. (4 marks)

${img("x-squared-contribution.svg", "Bar chart showing x squared times P(X = x) for x = 0, 1, 2, 3, 4, with each bar of height x squared times 0.2, illustrating the contributions to E[X squared]")}`,
    marks: 12,
    difficulty: "HARD",
    solutionContent: `**a. (1 mark)** $P(X = x) = \\dfrac{1}{5}$ for $x = 0, 1, 2, 3, 4$.

**b. (4 marks)**
*Step 1 (1 mark):* $E[X] = \\dfrac{1}{5}(0 + 1 + 2 + 3 + 4) = \\dfrac{10}{5} = 2$.
*Step 2 (1 mark):* $E[X^2] = \\dfrac{1}{5}(0 + 1 + 4 + 9 + 16) = \\dfrac{30}{5} = 6$.
*Step 3 (1 mark):* $\\text{Var}(X) = E[X^2] - (E[X])^2 = 6 - 4 = 2$.
*Step 4 (1 mark):* (Standard deviation $= \\sqrt 2$.)

**c. (3 marks)**
*Step 1 (1 mark):* $Y = X^2$ takes values $0, 1, 4, 9, 16$.
*Step 2 (1 mark):* Since $X \\mapsto X^2$ is one-to-one on $\\{0, 1, 2, 3, 4\\}$, each value of $Y$ has probability $\\dfrac{1}{5}$.
*Step 3 (1 mark):* $P(Y = y) = \\dfrac{1}{5}$ for $y \\in \\{0, 1, 4, 9, 16\\}$.

**d. (4 marks)**
*Step 1 (1 mark):* Directly: $E[Y] = \\dfrac{1}{5}(0 + 1 + 4 + 9 + 16)$.
*Step 2 (1 mark):* $= \\dfrac{30}{5} = 6$.
*Step 3 (1 mark):* Via $E[X^2]$: same calculation, $E[X^2] = 6$.
*Step 4 (1 mark):* Both methods agree, as expected.`,
    subtopicSlugs: ["discrete-random-variables"],
  },
];

const output = { mcq: [], shortAnswer: [], extendedAnswer: [], extendedResponse: questions };
fs.writeFileSync(OUT, JSON.stringify(output, null, 2) + "\n");
console.log(`${OUT}: ${questions.length} questions, ${questions.reduce((s, q) => s + q.marks, 0)} marks`);
