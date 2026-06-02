/**
 * Specialist: Central Limit Theorem.
 * Tier: extended-fit → MCQ + SHORT + EXT_ANS.
 * Targets: 12 MCQ + 8 SHORT + 3 EXT_ANS.
 */

import * as fs from "fs";
import * as path from "path";
import { bellCurve, toDataUri } from "./svg";

const FIGURES_DIR = "scripts/output/figures/specialist-clt";
const JSON_PATH = "scripts/output/qset-specialist-clt.json";
fs.mkdirSync(FIGURES_DIR, { recursive: true });

// ─── Figures ────────────────────────────────────────────────────────────

const figSampleMean = bellCurve({
  mean: 50,
  sd: 2,
  shadedFrom: 48,
  shadedTo: 52,
  xLabel: "x̄",
  markedValues: [46, 48, 50, 52, 54],
});

const figSkewedToNormal = bellCurve({
  mean: 100,
  sd: 5,
  shadedFrom: 95,
  shadedTo: 105,
  xLabel: "x̄ (n = 36)",
  markedValues: [90, 95, 100, 105, 110],
});

const figLargeN = bellCurve({
  mean: 0,
  sd: 1,
  shadedFrom: -1.96,
  shadedTo: 1.96,
  xLabel: "Z",
  markedValues: [-3, -1.96, 0, 1.96, 3],
});

const figures: Record<string, string> = {
  "sample-mean.svg": figSampleMean,
  "skewed-to-normal.svg": figSkewedToNormal,
  "large-n.svg": figLargeN,
};
for (const [name, content] of Object.entries(figures)) {
  fs.writeFileSync(path.join(FIGURES_DIR, name), content);
}
const img = (name: string, alt: string) => `![${alt}](${toDataUri(figures[name])})`;

// ─── Types + helpers ────────────────────────────────────────────────────

interface MCQ {
  content: string; optionA: string; optionB: string; optionC: string; optionD: string;
  correctOption: "A" | "B" | "C" | "D"; marks: number;
  difficulty: "EASY" | "MEDIUM" | "HARD"; solutionContent: string; subtopicSlugs: string[];
}
interface FR {
  content: string; marks: number; difficulty: "EASY" | "MEDIUM" | "HARD";
  solutionContent: string; subtopicSlugs: string[];
}
const m = (
  c: string, o: [string, string, string, string], k: "A" | "B" | "C" | "D",
  d: "EASY" | "MEDIUM" | "HARD", s: string, sec: string[] = [],
): MCQ => ({
  content: c, optionA: o[0], optionB: o[1], optionC: o[2], optionD: o[3],
  correctOption: k, marks: 1, difficulty: d, solutionContent: s,
  subtopicSlugs: ["central-limit-theorem", ...sec],
});
const sq = (
  c: string, marks: number, d: "EASY" | "MEDIUM" | "HARD", s: string, sec: string[] = [],
): FR => ({
  content: c, marks, difficulty: d, solutionContent: s,
  subtopicSlugs: ["central-limit-theorem", ...sec],
});

// ─── 12 MCQ ────────────────────────────────────────────────────────────

const mcq: MCQ[] = [
  m("According to the Central Limit Theorem, as the sample size $n$ increases, the distribution of $\\bar X$ approaches a:",
    ["uniform distribution", "binomial distribution", "normal distribution", "Poisson distribution"], "C", "EASY",
    "The CLT states that the sampling distribution of the sample mean approaches a normal distribution as $n$ grows large, regardless of the population shape. **Answer: C**"),

  m("If a population has mean $\\mu = 20$ and standard deviation $\\sigma = 6$, then for samples of size $n = 36$, $E(\\bar X)$ equals:",
    ["$6$", "$20$", "$20/36$", "$36$"], "B", "EASY",
    "$E(\\bar X) = \\mu = 20$ for any sample size. **Answer: B**"),

  m("For a population with $\\sigma = 12$ and samples of size $n = 9$, the standard deviation of $\\bar X$ equals:",
    ["$12$", "$4$", "$1.33$", "$144$"], "B", "EASY",
    "$\\sigma_{\\bar X} = \\sigma/\\sqrt n = 12/\\sqrt 9 = 12/3 = 4$. **Answer: B**"),

  m("Which of the following is NOT a requirement for the CLT to apply for the sample mean?",
    ["Independent observations", "Identically distributed observations", "The population must be normal", "Sample size sufficiently large"], "C", "EASY",
    "The CLT works for ANY population distribution provided $n$ is large enough — that's the whole point. **Answer: C**"),

  m("A population has $\\sigma = 10$. For the standard error $\\sigma/\\sqrt n$ to be $2$, $n$ must equal:",
    ["$5$", "$20$", "$25$", "$100$"], "C", "MEDIUM",
    "$10/\\sqrt n = 2 \\Rightarrow \\sqrt n = 5 \\Rightarrow n = 25$. **Answer: C**"),

  m("A common rule of thumb says the CLT gives a good normal approximation when $n$ is at least:",
    ["$5$", "$10$", "$30$", "$300$"], "C", "EASY",
    "$n \\ge 30$ is the standard rule of thumb for the CLT to give a good normal approximation for moderately skewed populations. **Answer: C**"),

  m("If $X$ has mean $\\mu$ and variance $\\sigma^2$, then $\\bar X$ for samples of size $n$ has variance:",
    ["$\\sigma^2$", "$\\sigma^2/n$", "$\\sigma/\\sqrt n$", "$n\\sigma^2$"], "B", "MEDIUM",
    "Variance of the sample mean is $\\text{Var}(\\bar X) = \\sigma^2/n$. (Note: $\\sigma/\\sqrt n$ is the standard deviation, not variance — that's a common distractor.) **Answer: B**"),

  m("A bottling machine fills bottles with mean $500$ mL and SD $5$ mL. For a random sample of $n = 25$ bottles, $\\Pr(\\bar X > 502)$ is approximately:",
    ["$0.023$", "$0.345$", "$0.158$", "$0.500$"], "A", "MEDIUM",
    "$\\sigma_{\\bar X} = 5/\\sqrt{25} = 1$. $Z = (502 - 500)/1 = 2$. $\\Pr(Z > 2) \\approx 0.0228$. **Answer: A**"),

  m("If the underlying population is already normal $N(\\mu, \\sigma^2)$, the sampling distribution of $\\bar X$ is:",
    ["only approximately normal for large $n$", "exactly $N(\\mu, \\sigma^2/n)$ for any $n \\ge 1$", "exactly $N(\\mu, \\sigma^2)$", "uniform"], "B", "MEDIUM",
    "For a normal parent population, $\\bar X \\sim N(\\mu, \\sigma^2/n)$ exactly — no large-$n$ requirement. **Answer: B**"),

  m("Doubling the sample size from $n$ to $2n$ changes the standard error of $\\bar X$ by a factor of:",
    ["$2$", "$1/2$", "$\\sqrt 2$", "$1/\\sqrt 2$"], "D", "MEDIUM",
    "$\\sigma_{\\bar X} = \\sigma/\\sqrt n$. Replacing $n$ by $2n$ multiplies the denominator by $\\sqrt 2$, i.e. the SE shrinks by factor $1/\\sqrt 2$. **Answer: D**"),

  m("A population has $\\mu = 80$, $\\sigma = 15$. For a sample of size $n = 100$, $\\Pr(\\bar X < 77)$ is approximately:",
    ["$0.023$", "$0.421$", "$0.158$", "$0.500$"], "A", "HARD",
    "$\\sigma_{\\bar X} = 15/\\sqrt{100} = 1.5$. $Z = (77 - 80)/1.5 = -2$. $\\Pr(Z < -2) \\approx 0.0228$. **Answer: A**"),

  m("To halve the standard error of $\\bar X$, the sample size $n$ must be:",
    ["doubled", "halved", "quadrupled", "squared"], "C", "HARD",
    "SE $= \\sigma/\\sqrt n$. Halving SE means $\\sqrt n$ doubles, so $n$ must be multiplied by $4$ (quadrupled). **Answer: C**"),
];

// ─── 8 SHORT ───────────────────────────────────────────────────────────

const shortAnswer: FR[] = [
  sq("A population has standard deviation $\\sigma = 8$. Find the standard error of $\\bar X$ for samples of size $n = 16$.", 2, "EASY",
    "*Step 1 (1 mark):* Standard error of sample mean is $\\sigma_{\\bar X} = \\sigma/\\sqrt n$.\n*Step 2 (1 mark):* $\\sigma_{\\bar X} = 8/\\sqrt{16} = 8/4 = 2$."),

  sq("State the conclusion of the Central Limit Theorem in your own words, then write down the limiting distribution of $\\bar X$ as $n \\to \\infty$ in terms of $\\mu$ and $\\sigma$.", 2, "EASY",
    "*Step 1 (1 mark):* As the sample size $n$ grows large, the distribution of the sample mean $\\bar X$ becomes approximately normal, regardless of the underlying population's shape.\n*Step 2 (1 mark):* $\\bar X \\sim N(\\mu, \\sigma^2/n)$ approximately, with mean $\\mu$ and standard deviation $\\sigma/\\sqrt n$."),

  sq("A factory produces light bulbs with lifetime mean $\\mu = 1200$ hours and standard deviation $\\sigma = 100$ hours. For a random sample of $n = 25$ bulbs, find $E(\\bar X)$ and $\\sigma_{\\bar X}$.", 2, "EASY",
    "*Step 1 (1 mark):* $E(\\bar X) = \\mu = 1200$ hours.\n*Step 2 (1 mark):* $\\sigma_{\\bar X} = 100/\\sqrt{25} = 20$ hours."),

  sq("A population is highly skewed with $\\mu = 50$ and $\\sigma = 12$. For samples of size $n = 64$, find $\\Pr(\\bar X > 52)$, using the normal approximation.", 3, "MEDIUM",
    "*Step 1 (1 mark):* By CLT (n = 64 is large), $\\bar X \\approx N(50, 12^2/64) = N(50, 2.25)$, so $\\sigma_{\\bar X} = 12/8 = 1.5$.\n*Step 2 (1 mark):* $Z = (52 - 50)/1.5 = 4/3 \\approx 1.333$.\n*Step 3 (1 mark):* $\\Pr(\\bar X > 52) = \\Pr(Z > 1.333) \\approx 0.0912$."),

  sq("A population has $\\mu = 100$ and $\\sigma = 20$. What sample size $n$ is required so that the standard error of $\\bar X$ is at most $2$?", 2, "MEDIUM",
    "*Step 1 (1 mark):* Require $\\sigma/\\sqrt n \\le 2$, i.e. $20/\\sqrt n \\le 2 \\Rightarrow \\sqrt n \\ge 10$.\n*Step 2 (1 mark):* So $n \\ge 100$. The minimum sample size is $n = 100$."),

  sq("Explain why the CLT does NOT need to be invoked when the underlying population is normal. State the exact distribution of $\\bar X$ in that case.", 2, "MEDIUM",
    "*Step 1 (1 mark):* When the population is normal, a linear combination of independent normal random variables (such as $\\bar X = (X_1 + \\cdots + X_n)/n$) is itself exactly normal. No large-$n$ approximation is needed.\n*Step 2 (1 mark):* $\\bar X \\sim N(\\mu, \\sigma^2/n)$ exactly, for any $n \\ge 1$."),

  sq("A factory's daily production has mean $\\mu = 500$ units and standard deviation $\\sigma = 30$ units. Use the CLT to estimate the probability that the average daily output over a sample of $n = 36$ days exceeds $510$.", 3, "MEDIUM",
    "*Step 1 (1 mark):* By CLT, $\\bar X \\approx N(500, 30^2/36) = N(500, 25)$, so $\\sigma_{\\bar X} = 30/6 = 5$.\n*Step 2 (1 mark):* $Z = (510 - 500)/5 = 2$.\n*Step 3 (1 mark):* $\\Pr(\\bar X > 510) = \\Pr(Z > 2) \\approx 0.0228$."),

  sq("Suppose $X$ has finite mean $\\mu$ and variance $\\sigma^2$. Show that $E(\\bar X) = \\mu$ and $\\text{Var}(\\bar X) = \\sigma^2/n$ for a random sample of size $n$.", 3, "HARD",
    "*Step 1 (1 mark):* $\\bar X = (X_1 + X_2 + \\cdots + X_n)/n$, where the $X_i$ are i.i.d. copies of $X$.\n*Step 2 (1 mark):* By linearity, $E(\\bar X) = \\frac{1}{n}(E(X_1) + \\cdots + E(X_n)) = \\frac{1}{n} \\cdot n\\mu = \\mu$.\n*Step 3 (1 mark):* By independence, $\\text{Var}(\\bar X) = \\frac{1}{n^2}(\\text{Var}(X_1) + \\cdots + \\text{Var}(X_n)) = \\frac{1}{n^2} \\cdot n\\sigma^2 = \\sigma^2/n$."),
];

// ─── 3 EXT_ANS ─────────────────────────────────────────────────────────

const extendedAnswer: FR[] = [
  sq(`A snack-bar company packages chips into bags with mean weight $\\mu = 50$ g and standard deviation $\\sigma = 3$ g. A quality-control auditor samples $n = 36$ bags at random.

**a.** State the approximate distribution of $\\bar X$, the sample mean weight. (2 marks)

**b.** Find $\\Pr(\\bar X < 49)$. (2 marks)

**c.** Find $\\Pr(49 < \\bar X < 51)$. (3 marks)

${img("sample-mean.svg", "Bell curve of x̄ with mean 50 and standard error 0.5, region 48 to 52 shaded")}`,
    7, "MEDIUM",
    `**a. (2 marks)**
*Step 1 (1 mark):* $E(\\bar X) = \\mu = 50$, $\\sigma_{\\bar X} = 3/\\sqrt{36} = 0.5$.
*Step 2 (1 mark):* By CLT, $\\bar X \\approx N(50, 0.25)$ (i.e. SD = 0.5).

**b. (2 marks)**
*Step 1 (1 mark):* $Z = (49 - 50)/0.5 = -2$.
*Step 2 (1 mark):* $\\Pr(\\bar X < 49) = \\Pr(Z < -2) \\approx 0.0228$.

**c. (3 marks)**
*Step 1 (1 mark):* Standardise both bounds: $Z_1 = (49 - 50)/0.5 = -2$, $Z_2 = (51 - 50)/0.5 = 2$.
*Step 2 (1 mark):* $\\Pr(49 < \\bar X < 51) = \\Pr(-2 < Z < 2)$.
*Step 3 (1 mark):* $= 2 \\Phi(2) - 1 \\approx 0.9544$.`),

  sq(`A random variable $X$ has population mean $\\mu = 80$ and standard deviation $\\sigma = 15$. A researcher takes a random sample of size $n$ and computes the sample mean $\\bar X$.

**a.** If $n = 25$, find $\\Pr(78 \\le \\bar X \\le 82)$. (3 marks)

**b.** What is the smallest sample size $n$ for which $\\sigma_{\\bar X} \\le 1$? (2 marks)

**c.** Using the value of $n$ from part b, find $\\Pr(\\bar X > 81)$. (2 marks)`,
    7, "MEDIUM",
    `**a. (3 marks)**
*Step 1 (1 mark):* $\\sigma_{\\bar X} = 15/\\sqrt{25} = 3$, so $\\bar X \\approx N(80, 9)$.
*Step 2 (1 mark):* $Z_1 = (78 - 80)/3 = -2/3$, $Z_2 = (82 - 80)/3 = 2/3$.
*Step 3 (1 mark):* $\\Pr(-2/3 \\le Z \\le 2/3) = 2 \\Phi(2/3) - 1 \\approx 2(0.7475) - 1 = 0.4950$.

**b. (2 marks)**
*Step 1 (1 mark):* Require $15/\\sqrt n \\le 1$, i.e. $\\sqrt n \\ge 15$.
*Step 2 (1 mark):* So $n \\ge 225$. Minimum is $n = 225$.

**c. (2 marks)**
*Step 1 (1 mark):* With $n = 225$, $\\sigma_{\\bar X} = 1$. $Z = (81 - 80)/1 = 1$.
*Step 2 (1 mark):* $\\Pr(\\bar X > 81) = \\Pr(Z > 1) \\approx 0.1587$.`),

  sq(`Let $X_1, X_2, \\ldots, X_n$ be i.i.d. random variables with $E(X_i) = \\mu$ and $\\text{Var}(X_i) = \\sigma^2$, and let $\\bar X = \\frac{1}{n}\\sum_{i=1}^n X_i$ be the sample mean.

**a.** Show that $E(\\bar X) = \\mu$. (2 marks)

**b.** Show that $\\text{Var}(\\bar X) = \\sigma^2/n$. (2 marks)

**c.** Hence state the approximate distribution of $\\bar X$ for large $n$, and identify the standardised variable $Z$ that follows the standard normal distribution. (3 marks)

${img("large-n.svg", "Standard normal Z distribution with central 95% region shaded between -1.96 and 1.96")}`,
    7, "HARD",
    `**a. (2 marks)**
*Step 1 (1 mark):* $E(\\bar X) = E\\!\\left(\\frac{1}{n}\\sum_{i=1}^n X_i\\right) = \\frac{1}{n}\\sum_{i=1}^n E(X_i)$ by linearity.
*Step 2 (1 mark):* $= \\frac{1}{n} \\cdot n \\mu = \\mu$.

**b. (2 marks)**
*Step 1 (1 mark):* By independence, $\\text{Var}(\\bar X) = \\frac{1}{n^2}\\sum_{i=1}^n \\text{Var}(X_i)$.
*Step 2 (1 mark):* $= \\frac{1}{n^2} \\cdot n\\sigma^2 = \\sigma^2/n$.

**c. (3 marks)**
*Step 1 (1 mark):* By the Central Limit Theorem, for large $n$, $\\bar X \\approx N(\\mu, \\sigma^2/n)$.
*Step 2 (1 mark):* The standard error is $\\sigma_{\\bar X} = \\sigma/\\sqrt n$.
*Step 3 (1 mark):* The standardised statistic $Z = \\dfrac{\\bar X - \\mu}{\\sigma/\\sqrt n}$ approaches the standard normal $N(0,1)$ as $n \\to \\infty$.`),
];

// ─── Output JSON ────────────────────────────────────────────────────────

const output = { mcq, shortAnswer, extendedAnswer };
fs.writeFileSync(JSON_PATH, JSON.stringify(output, null, 2) + "\n");

console.log(
  `Wrote ${mcq.length} MCQ, ${shortAnswer.length} SHORT, ${extendedAnswer.length} EXT_ANS to ${JSON_PATH}\n` +
    `Wrote ${Object.keys(figures).length} SVG files to ${FIGURES_DIR}/`,
);
