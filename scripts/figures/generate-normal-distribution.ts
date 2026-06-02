/**
 * Wave 1, batch 4: Normal Distribution ext-resp questions.
 *
 * 4 extended-response questions for the Normal Distribution subtopic.
 * Output: scripts/output/qset-methods-b2-normal-distribution.json
 *
 * Usage:
 *   npx tsx scripts/figures/generate-normal-distribution.ts
 */

import * as fs from "fs";
import * as path from "path";
import { bellCurve, toDataUri } from "./svg";

const FIGURES_DIR = "scripts/output/figures/normal-distribution";
const JSON_PATH = "scripts/output/qset-methods-b2-normal-distribution.json";

fs.mkdirSync(FIGURES_DIR, { recursive: true });

// ─── Diagrams ───────────────────────────────────────────────────────────

const fig1 = bellCurve({
  mean: 50,
  sd: 0.4,
  shadedFrom: 50 - 4 * 0.4,
  shadedTo: 49,
  xLabel: "length (mm)",
  markedValues: [49, 50, 51],
});

const fig2 = bellCurve({
  mean: 65,
  sd: 12,
  shadedFrom: 80,
  shadedTo: 65 + 4 * 12,
  xLabel: "score",
  markedValues: [41, 53, 65, 77, 80, 89],
});

const fig3 = bellCurve({
  mean: 180,
  sd: 15,
  shadedFrom: 200,
  shadedTo: 180 + 4 * 15,
  xLabel: "apple weight (g)",
  markedValues: [150, 165, 180, 195, 200, 210],
});

const fig4 = bellCurve({
  mean: 2500,
  sd: 500,
  shadedFrom: 2500 - 4 * 500,
  shadedTo: 2000,
  xLabel: "lifetime (h)",
  markedValues: [1500, 2000, 2500, 3000, 3500],
});

const figures: Record<string, string> = {
  "bolts-tail.svg": fig1,
  "scores-above-80.svg": fig2,
  "apples-above-200.svg": fig3,
  "led-bulbs-below-2000.svg": fig4,
};

for (const [name, content] of Object.entries(figures)) {
  fs.writeFileSync(path.join(FIGURES_DIR, name), content);
}

const img = (name: string, alt: string): string =>
  `![${alt}](${toDataUri(figures[name])})`;

// ─── Questions ──────────────────────────────────────────────────────────

const questions = [
  {
    content: `A factory produces bolts whose lengths $X$ (in mm) are normally distributed with mean $\\mu = 50$ mm and standard deviation $\\sigma = 0.4$ mm. Bolts are rejected if their length is less than $49$ mm or greater than $51$ mm.

**a.** State the probability that a randomly chosen bolt has length greater than $50$ mm. (1 mark)

**b.** Find $P(X < 49)$, correct to 4 decimal places. (3 marks)

**c.** Find the probability that a randomly chosen bolt is rejected, correct to 4 decimal places. (3 marks)

**d.** The factory produces $5000$ bolts per day. How many are expected to be rejected per day? Round to the nearest integer. (3 marks)

${img("bolts-tail.svg", "Normal distribution curve for bolt lengths with mean 50 mm and standard deviation 0.4 mm, with the tail region below 49 mm shaded to indicate the lower rejection region")}`,
    marks: 10,
    difficulty: "MEDIUM",
    solutionContent: `**a. (1 mark)** Since $50$ is the mean, $P(X > 50) = 0.5$ by symmetry.

**b. (3 marks)**
*Step 1 (1 mark):* Standardise: $Z = \\dfrac{X - 50}{0.4}$, so $P(X < 49) = P\\left(Z < \\dfrac{49 - 50}{0.4}\\right) = P(Z < -2.5)$.
*Step 2 (1 mark):* From tables or CAS, $P(Z < -2.5) \\approx 0.00621$.
*Step 3 (1 mark):* $P(X < 49) \\approx 0.0062$.

**c. (3 marks)**
*Step 1 (1 mark):* By symmetry about the mean, $P(X > 51) = P(X < 49)$.
*Step 2 (1 mark):* $P(\\text{reject}) = P(X < 49) + P(X > 51) = 2 \\cdot 0.00621$.
*Step 3 (1 mark):* $\\approx 0.0124$.

**d. (3 marks)**
*Step 1 (1 mark):* Expected rejects $= 5000 \\times P(\\text{reject})$.
*Step 2 (1 mark):* $= 5000 \\times 0.01242$.
*Step 3 (1 mark):* $\\approx 62$ bolts per day.`,
    subtopicSlugs: ["normal-distribution", "continuous-random-variables"],
  },

  {
    content: `Test scores in a class are normally distributed with mean $65$ and standard deviation $12$. Let $X$ denote the test score of a randomly selected student.

**a.** Find $P(X > 80)$, correct to 4 decimal places. (3 marks)

**b.** Find $P(60 < X < 75)$, correct to 4 decimal places. (3 marks)

**c.** The top $10\\%$ of students receive an "A" grade. Find the minimum score required for an "A", correct to 1 decimal place. (3 marks)

**d.** If $200$ students sat the test, how many would be expected to score below $50$? Round to the nearest integer. (2 marks)

${img("scores-above-80.svg", "Normal distribution curve for test scores with mean 65 and standard deviation 12, with the right tail above 80 shaded to indicate the probability of scoring above 80")}`,
    marks: 11,
    difficulty: "MEDIUM",
    solutionContent: `**a. (3 marks)**
*Step 1 (1 mark):* $Z = \\dfrac{X - 65}{12}$, so $P(X > 80) = P\\left(Z > \\dfrac{80 - 65}{12}\\right) = P(Z > 1.25)$.
*Step 2 (1 mark):* $P(Z > 1.25) = 1 - \\Phi(1.25) \\approx 1 - 0.8944 = 0.1056$.
*Step 3 (1 mark):* $P(X > 80) \\approx 0.1056$.

**b. (3 marks)**
*Step 1 (1 mark):* Standardise both endpoints: $z_1 = \\dfrac{60 - 65}{12} \\approx -0.4167$, $z_2 = \\dfrac{75 - 65}{12} \\approx 0.8333$.
*Step 2 (1 mark):* $P(z_1 < Z < z_2) = \\Phi(0.8333) - \\Phi(-0.4167) \\approx 0.7977 - 0.3385$.
*Step 3 (1 mark):* $\\approx 0.4592$.

**c. (3 marks)**
*Step 1 (1 mark):* Need $c$ with $P(X > c) = 0.10$, i.e. $P(Z > z) = 0.10$, so $z = \\Phi^{-1}(0.90) \\approx 1.2816$.
*Step 2 (1 mark):* $c = 65 + 1.2816 \\times 12$.
*Step 3 (1 mark):* $\\approx 65 + 15.38 \\approx 80.4$.

**d. (2 marks)**
*Step 1 (1 mark):* $P(X < 50) = P\\left(Z < \\dfrac{50 - 65}{12}\\right) = P(Z < -1.25) \\approx 0.1056$.
*Step 2 (1 mark):* Expected $= 200 \\times 0.1056 \\approx 21$ students.`,
    subtopicSlugs: ["normal-distribution", "continuous-random-variables"],
  },

  {
    content: `In an orchard, apple weights $A$ are normally distributed with mean $180$ g and standard deviation $15$ g, while orange weights $O$ are normally distributed with mean $200$ g and standard deviation $20$ g.

**a.** Find $P(A > 200)$, correct to 4 decimal places. (2 marks)

**b.** Find $P(O < 180)$, correct to 4 decimal places. (2 marks)

**c.** An apple and an orange are selected independently at random. Find the probability that both weigh more than $190$ g, correct to 4 decimal places. (3 marks)

**d.** Find the weight $w_A$ (in g) such that $95\\%$ of apples weigh more than $w_A$, correct to 1 decimal place. (3 marks)

**e.** Find the corresponding weight $w_O$ for oranges, and briefly compare $w_A$ with $w_O$. (2 marks)

${img("apples-above-200.svg", "Normal distribution curve for apple weights with mean 180 g and standard deviation 15 g, with the right tail above 200 g shaded to indicate the probability of an apple weighing more than 200 g")}`,
    marks: 12,
    difficulty: "HARD",
    solutionContent: `**a. (2 marks)**
*Step 1 (1 mark):* $P(A > 200) = P\\left(Z > \\dfrac{200 - 180}{15}\\right) = P\\left(Z > \\dfrac{4}{3}\\right)$.
*Step 2 (1 mark):* $\\approx 1 - 0.9088 = 0.0912$.

**b. (2 marks)**
*Step 1 (1 mark):* $P(O < 180) = P\\left(Z < \\dfrac{180 - 200}{20}\\right) = P(Z < -1)$.
*Step 2 (1 mark):* $\\approx 0.1587$.

**c. (3 marks)**
*Step 1 (1 mark):* $P(A > 190) = P\\left(Z > \\dfrac{10}{15}\\right) = P(Z > 0.667) \\approx 0.2525$.
*Step 2 (1 mark):* $P(O > 190) = P\\left(Z > \\dfrac{-10}{20}\\right) = P(Z > -0.5) \\approx 0.6915$.
*Step 3 (1 mark):* By independence, $P(\\text{both} > 190) = 0.2525 \\times 0.6915 \\approx 0.1746$.

**d. (3 marks)**
*Step 1 (1 mark):* $P(A > w_A) = 0.95 \\Rightarrow P(Z > z) = 0.95 \\Rightarrow z = \\Phi^{-1}(0.05) \\approx -1.6449$.
*Step 2 (1 mark):* $w_A = 180 + (-1.6449)(15)$.
*Step 3 (1 mark):* $\\approx 180 - 24.67 \\approx 155.3$ g.

**e. (2 marks)**
*Step 1 (1 mark):* Same method for oranges: $w_O = 200 + (-1.6449)(20) \\approx 200 - 32.90 \\approx 167.1$ g.
*Step 2 (1 mark):* $w_O > w_A$: oranges have a higher $95$th-percentile floor because the higher mean dominates the larger spread.`,
    subtopicSlugs: ["normal-distribution", "continuous-random-variables", "conditional-probability"],
  },

  {
    content: `The lifetime $X$ (in hours) of a brand of LED bulbs is normally distributed with mean $\\mu$ and standard deviation $\\sigma$. It is known that $16\\%$ of bulbs last less than $2000$ hours, and $50\\%$ last less than $2500$ hours.

**a.** Use the given information to determine $\\mu$ and $\\sigma$. Take $16\\% \\approx P(Z < -1)$. (5 marks)

**b.** Using these values, find $P(X > 3000)$, correct to 4 decimal places. (3 marks)

**c.** The manufacturer offers a warranty refund for any bulb that fails before $1800$ hours. Find the proportion of bulbs that require a refund, correct to 4 decimal places. (2 marks)

**d.** If $10{,}000$ bulbs are sold, how many refunds are expected? Round to the nearest integer. (2 marks)

${img("led-bulbs-below-2000.svg", "Normal distribution curve for LED bulb lifetimes with mean 2500 hours and standard deviation 500 hours, with the left tail below 2000 hours shaded to indicate the 16 percent of bulbs lasting less than 2000 hours")}`,
    marks: 12,
    difficulty: "HARD",
    solutionContent: `**a. (5 marks)**
*Step 1 (1 mark):* For a normal distribution, the median equals the mean, so $P(X < \\mu) = 0.5$. Given $P(X < 2500) = 0.5$, $\\mu = 2500$ hours.
*Step 2 (1 mark):* Standardise the $16\\%$ condition: $P\\left(Z < \\dfrac{2000 - 2500}{\\sigma}\\right) = 0.16$.
*Step 3 (1 mark):* Using $P(Z < -1) \\approx 0.1587 \\approx 0.16$, we have $\\dfrac{-500}{\\sigma} = -1$.
*Step 4 (1 mark):* Solving: $\\sigma = 500$ hours.
*Step 5 (1 mark):* So $\\mu = 2500$ h and $\\sigma = 500$ h.

**b. (3 marks)**
*Step 1 (1 mark):* $P(X > 3000) = P\\left(Z > \\dfrac{3000 - 2500}{500}\\right) = P(Z > 1)$.
*Step 2 (1 mark):* $P(Z > 1) \\approx 1 - 0.8413 = 0.1587$.
*Step 3 (1 mark):* $\\approx 0.1587$.

**c. (2 marks)**
*Step 1 (1 mark):* $P(X < 1800) = P\\left(Z < \\dfrac{1800 - 2500}{500}\\right) = P(Z < -1.4)$.
*Step 2 (1 mark):* $\\approx 0.0808$.

**d. (2 marks)**
*Step 1 (1 mark):* Expected refunds $= 10000 \\times 0.0808$.
*Step 2 (1 mark):* $\\approx 808$ bulbs.`,
    subtopicSlugs: ["normal-distribution", "continuous-random-variables"],
  },
];

// ─── Output JSON ────────────────────────────────────────────────────────

const output = {
  mcq: [],
  shortAnswer: [],
  extendedAnswer: [],
  extendedResponse: questions,
};

fs.writeFileSync(JSON_PATH, JSON.stringify(output, null, 2) + "\n");

const totalMarks = questions.reduce((s, q) => s + q.marks, 0);
const diffCounts = questions.reduce(
  (acc: Record<string, number>, q) => {
    acc[q.difficulty] = (acc[q.difficulty] || 0) + 1;
    return acc;
  },
  { EASY: 0, MEDIUM: 0, HARD: 0 },
);
console.log(
  `Wrote ${questions.length} ext-resp questions to ${JSON_PATH}\n` +
  `Wrote ${Object.keys(figures).length} SVG files to ${FIGURES_DIR}/\n` +
  `Total marks: ${totalMarks} | Difficulty: ${JSON.stringify(diffCounts)}`,
);
