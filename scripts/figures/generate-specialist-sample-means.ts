/**
 * Specialist: Distribution of Sample Means.
 * Tier: modelling-rich → MCQ + SHORT + EXT_ANS + EXT_RESP.
 * Targets: 12 MCQ + 8 SHORT + 3 EXT_ANS + 3 EXT_RESP.
 */

import * as fs from "fs";
import * as path from "path";
import { bellCurve, toDataUri } from "./svg";

const FIGURES_DIR = "scripts/output/figures/specialist-sample-means";
const JSON_PATH = "scripts/output/qset-specialist-sample-means.json";
fs.mkdirSync(FIGURES_DIR, { recursive: true });

// ─── Figures ────────────────────────────────────────────────────────────

const figXbarN16 = bellCurve({
  mean: 100,
  sd: 2.5,
  shadedFrom: 97.5,
  shadedTo: 102.5,
  xLabel: "x̄ (n = 16)",
  markedValues: [92.5, 97.5, 100, 102.5, 107.5],
});

const figXbarN64 = bellCurve({
  mean: 100,
  sd: 1.25,
  shadedFrom: 98.75,
  shadedTo: 101.25,
  xLabel: "x̄ (n = 64)",
  markedValues: [96.25, 98.75, 100, 101.25, 103.75],
});

const figUpperTail = bellCurve({
  mean: 50,
  sd: 1.5,
  shadedFrom: 52,
  shadedTo: 56,
  xLabel: "x̄",
  markedValues: [45.5, 48.5, 50, 51.5, 54.5],
});

const figures: Record<string, string> = {
  "xbar-n16.svg": figXbarN16,
  "xbar-n64.svg": figXbarN64,
  "upper-tail.svg": figUpperTail,
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
  subtopicSlugs: ["distribution-of-sample-means", ...sec],
});
const sq = (
  c: string, marks: number, d: "EASY" | "MEDIUM" | "HARD", s: string, sec: string[] = [],
): FR => ({
  content: c, marks, difficulty: d, solutionContent: s,
  subtopicSlugs: ["distribution-of-sample-means", ...sec],
});

// ─── 12 MCQ ────────────────────────────────────────────────────────────

const mcq: MCQ[] = [
  m("If $X \\sim N(50, 16)$ and $\\bar X$ is the mean of a random sample of $n = 4$, then $\\bar X$ has distribution:",
    ["$N(50, 16)$", "$N(50, 4)$", "$N(50, 2)$", "$N(50, 64)$"], "B", "EASY",
    "$\\bar X \\sim N(\\mu, \\sigma^2/n) = N(50, 16/4) = N(50, 4)$. **Answer: B**"),

  m("Which is the correct formula for the standard deviation of $\\bar X$?",
    ["$\\sigma$", "$\\sigma/n$", "$\\sigma/\\sqrt n$", "$\\sigma^2/n$"], "C", "EASY",
    "$\\sigma_{\\bar X} = \\sigma/\\sqrt n$. (Distractor $\\sigma/n$ forgets the square root; $\\sigma^2/n$ is the variance.) **Answer: C**"),

  m("For a population with $\\mu = 80$, $\\sigma = 12$, and samples of $n = 36$, $\\sigma_{\\bar X}$ equals:",
    ["$12$", "$6$", "$2$", "$0.33$"], "C", "EASY",
    "$\\sigma_{\\bar X} = 12/\\sqrt{36} = 12/6 = 2$. **Answer: C**"),

  m("If $X \\sim N(20, 9)$ and $n = 25$, then $\\Pr(\\bar X > 21)$ equals:",
    ["$\\Pr(Z > 1/3)$", "$\\Pr(Z > 5/3)$", "$\\Pr(Z > 1)$", "$\\Pr(Z > 25)$"], "B", "MEDIUM",
    "$\\sigma_{\\bar X} = 3/\\sqrt{25} = 0.6$. $Z = (21 - 20)/0.6 = 5/3$. **Answer: B**"),

  m("As the sample size $n$ increases, the distribution of $\\bar X$ becomes:",
    ["wider with no change to mean", "narrower with same mean $\\mu$", "shifted to the right", "no change"], "B", "EASY",
    "Mean stays $\\mu$, SD = $\\sigma/\\sqrt n$ shrinks as $n$ grows, so the distribution becomes narrower. **Answer: B**"),

  m("If samples of size $n$ are drawn from $N(40, 25)$, and $\\Pr(\\bar X > 42) = 0.0228$, then $n$ equals:",
    ["$5$", "$10$", "$25$", "$100$"], "C", "HARD",
    "$\\Pr(Z > 2) \\approx 0.0228$, so $(42 - 40)/(5/\\sqrt n) = 2 \\Rightarrow 5/\\sqrt n = 1 \\Rightarrow \\sqrt n = 5 \\Rightarrow n = 25$. **Answer: C**"),

  m("Which of the following is true for the distribution of $\\bar X$ for samples from a NORMAL population?",
    ["It is exactly normal only for $n \\ge 30$", "It is exactly normal for any $n \\ge 1$", "It is uniform for small $n$", "It depends on the sample"], "B", "MEDIUM",
    "For a normal parent, $\\bar X$ is EXACTLY normal for any $n \\ge 1$ — no CLT needed. **Answer: B**"),

  m("A random sample of $n = 9$ from $N(100, 81)$ has $\\bar X$ with SD equal to:",
    ["$81$", "$9$", "$3$", "$1$"], "C", "EASY",
    "$\\sigma = \\sqrt{81} = 9$, $\\sigma_{\\bar X} = 9/\\sqrt 9 = 3$. **Answer: C**"),

  m("If $X_1, X_2, \\ldots, X_n$ are i.i.d. with $X \\sim N(\\mu, \\sigma^2)$, the sum $S = X_1 + \\cdots + X_n$ has distribution:",
    ["$N(\\mu, n\\sigma^2)$", "$N(n\\mu, \\sigma^2)$", "$N(n\\mu, n\\sigma^2)$", "$N(\\mu, \\sigma^2/n)$"], "C", "MEDIUM",
    "Sum of $n$ i.i.d. normals has mean $n\\mu$ and variance $n\\sigma^2$, so $S \\sim N(n\\mu, n\\sigma^2)$. **Answer: C**"),

  m("Given $X \\sim N(0, 4)$ and a random sample of size $n = 16$, $\\Pr(-0.5 < \\bar X < 0.5)$ equals:",
    ["$\\Pr(-1 < Z < 1)$", "$\\Pr(-0.5 < Z < 0.5)$", "$\\Pr(-2 < Z < 2)$", "$\\Pr(-4 < Z < 4)$"], "A", "MEDIUM",
    "$\\sigma_{\\bar X} = 2/\\sqrt{16} = 0.5$. $Z = \\pm 0.5/0.5 = \\pm 1$. **Answer: A**"),

  m("A population has $\\sigma = 20$. For the SD of $\\bar X$ to equal $4$, the sample size must be:",
    ["$5$", "$10$", "$25$", "$80$"], "C", "MEDIUM",
    "$20/\\sqrt n = 4 \\Rightarrow \\sqrt n = 5 \\Rightarrow n = 25$. **Answer: C**"),

  m("If $X$ has $\\mu = 30$, $\\sigma = 6$, then the distribution of $\\bar X$ for $n = 36$ has the property:",
    ["mean 30, variance 36", "mean 30, variance 1", "mean 5, variance 6", "mean 5, variance 1"], "B", "MEDIUM",
    "$E(\\bar X) = 30$, $\\text{Var}(\\bar X) = 36/36 = 1$. **Answer: B**"),
];

// ─── 8 SHORT ───────────────────────────────────────────────────────────

const shortAnswer: FR[] = [
  sq("A normal population has $\\mu = 50$ and $\\sigma = 8$. Write down the distribution of $\\bar X$ for samples of size $n = 16$.", 2, "EASY",
    "*Step 1 (1 mark):* $E(\\bar X) = 50$, $\\text{Var}(\\bar X) = 8^2/16 = 4$, so $\\sigma_{\\bar X} = 2$.\n*Step 2 (1 mark):* $\\bar X \\sim N(50, 4)$ (i.e. mean 50, variance 4, SD 2)."),

  sq("If $X \\sim N(60, 36)$ and $n = 9$, find $\\Pr(\\bar X > 62)$.", 2, "EASY",
    "*Step 1 (1 mark):* $\\sigma_{\\bar X} = 6/\\sqrt 9 = 2$, so $\\bar X \\sim N(60, 4)$.\n*Step 2 (1 mark):* $Z = (62 - 60)/2 = 1$. $\\Pr(\\bar X > 62) = \\Pr(Z > 1) \\approx 0.1587$."),

  sq("A normal population has $\\mu = 25$ and $\\sigma = 4$. For a sample of $n = 16$, find $\\Pr(24 < \\bar X < 26)$.", 3, "MEDIUM",
    "*Step 1 (1 mark):* $\\sigma_{\\bar X} = 4/\\sqrt{16} = 1$.\n*Step 2 (1 mark):* $Z_1 = (24 - 25)/1 = -1$, $Z_2 = (26 - 25)/1 = 1$.\n*Step 3 (1 mark):* $\\Pr(-1 < Z < 1) = 2\\Phi(1) - 1 \\approx 0.6826$."),

  sq("State the mean and variance of $\\bar X$ in terms of $\\mu$, $\\sigma$, and $n$, and explain why $\\bar X$ is centred at $\\mu$.", 2, "EASY",
    "*Step 1 (1 mark):* $E(\\bar X) = \\mu$, $\\text{Var}(\\bar X) = \\sigma^2/n$.\n*Step 2 (1 mark):* $\\bar X$ is an unbiased estimator of $\\mu$: $E(\\bar X) = E((X_1 + \\cdots + X_n)/n) = \\mu$ by linearity. Hence its distribution is centred at $\\mu$ regardless of $n$."),

  sq("A normal population has $\\sigma = 10$. Find $n$ so that $\\Pr(\\mu - 2 < \\bar X < \\mu + 2) = 0.95$.", 3, "MEDIUM",
    "*Step 1 (1 mark):* $\\Pr(-1.96 < Z < 1.96) = 0.95$, so we need $2 = 1.96 \\cdot 10/\\sqrt n$.\n*Step 2 (1 mark):* $\\sqrt n = 9.8$.\n*Step 3 (1 mark):* $n = 96.04$, round up to $n = 97$."),

  sq("Sketch and label the distribution of $\\bar X$ when $X \\sim N(100, 25)$ and $n = 25$. Identify the mean and SD on your sketch.", 2, "EASY",
    "*Step 1 (1 mark):* $\\bar X$ is normal, centred at $100$ with $\\sigma_{\\bar X} = 5/\\sqrt{25} = 1$. So $\\bar X \\sim N(100, 1)$.\n*Step 2 (1 mark):* Sketch a bell curve centred at $\\bar x = 100$, marking $99$ and $101$ as the $\\pm 1\\sigma$ points and $98$ and $102$ as $\\pm 2\\sigma$."),

  sq("A normal population has $\\mu = 0$ and $\\sigma = 1$. Find the value of $k$ such that $\\Pr(-k < \\bar X < k) = 0.95$ when $n = 100$.", 3, "MEDIUM",
    "*Step 1 (1 mark):* $\\sigma_{\\bar X} = 1/\\sqrt{100} = 0.1$.\n*Step 2 (1 mark):* Require $k/0.1 = 1.96$.\n*Step 3 (1 mark):* $k = 0.196$."),

  sq("If $X \\sim N(\\mu, \\sigma^2)$ and $\\bar X$ is based on a sample of size $n$, show that $Z = (\\bar X - \\mu)/(\\sigma/\\sqrt n)$ has standard normal distribution. Justify each step.", 3, "HARD",
    "*Step 1 (1 mark):* Since $X$ is normal, $\\bar X$ is also normal (linear combination of independent normals).\n*Step 2 (1 mark):* $E(\\bar X) = \\mu$ and $\\text{SD}(\\bar X) = \\sigma/\\sqrt n$, so $\\bar X \\sim N(\\mu, \\sigma^2/n)$.\n*Step 3 (1 mark):* Standardising, $Z = (\\bar X - \\mu)/(\\sigma/\\sqrt n) \\sim N(0, 1)$."),
];

// ─── 3 EXT_ANS ─────────────────────────────────────────────────────────

const extendedAnswer: FR[] = [
  sq(`A normal population has mean $\\mu = 100$ and SD $\\sigma = 10$. Random samples of size $n$ are taken.

**a.** For $n = 16$, write down the distribution of $\\bar X$. (2 marks)

**b.** For $n = 16$, find $\\Pr(\\bar X > 102.5)$. (2 marks)

**c.** For $n = 64$, find $\\Pr(\\bar X > 102.5)$ and compare your answer to part b. (3 marks)

${img("xbar-n16.svg", "Distribution of x̄ with mean 100 and standard error 2.5 for sample size 16")}
${img("xbar-n64.svg", "Distribution of x̄ with mean 100 and standard error 1.25 for sample size 64")}`,
    7, "MEDIUM",
    `**a. (2 marks)**
*Step 1 (1 mark):* $\\sigma_{\\bar X} = 10/\\sqrt{16} = 2.5$.
*Step 2 (1 mark):* $\\bar X \\sim N(100, 6.25)$ (SD $= 2.5$).

**b. (2 marks)**
*Step 1 (1 mark):* $Z = (102.5 - 100)/2.5 = 1$.
*Step 2 (1 mark):* $\\Pr(\\bar X > 102.5) = \\Pr(Z > 1) \\approx 0.1587$.

**c. (3 marks)**
*Step 1 (1 mark):* For $n = 64$: $\\sigma_{\\bar X} = 10/8 = 1.25$.
*Step 2 (1 mark):* $Z = (102.5 - 100)/1.25 = 2$, so $\\Pr(\\bar X > 102.5) = \\Pr(Z > 2) \\approx 0.0228$.
*Step 3 (1 mark):* The probability dropped from $\\approx 0.16$ to $\\approx 0.02$. Larger $n$ concentrates $\\bar X$ near $\\mu$, so extremes become less likely.`),

  sq(`Let $X \\sim N(80, 25)$ and let $\\bar X$ be the mean of a random sample of size $n$.

**a.** For $n = 25$, find $\\Pr(78 < \\bar X < 82)$. (3 marks)

**b.** Determine the smallest $n$ for which $\\Pr(|\\bar X - 80| < 1) \\ge 0.95$. (3 marks)

**c.** Verify your answer in **b** by computing $\\Pr(|\\bar X - 80| < 1)$ for that $n$. (2 marks)`,
    8, "MEDIUM",
    `**a. (3 marks)**
*Step 1 (1 mark):* $\\sigma_{\\bar X} = 5/\\sqrt{25} = 1$.
*Step 2 (1 mark):* $Z_1 = (78 - 80)/1 = -2$, $Z_2 = (82 - 80)/1 = 2$.
*Step 3 (1 mark):* $\\Pr(-2 < Z < 2) = 2\\Phi(2) - 1 \\approx 0.9544$.

**b. (3 marks)**
*Step 1 (1 mark):* Require $\\Pr(-1 < \\bar X - 80 < 1) = \\Pr(-1/(\\sigma_{\\bar X}) < Z < 1/(\\sigma_{\\bar X})) \\ge 0.95$.
*Step 2 (1 mark):* Need $1/\\sigma_{\\bar X} \\ge 1.96$, i.e. $\\sigma_{\\bar X} \\le 1/1.96 \\approx 0.5102$, so $5/\\sqrt n \\le 0.5102 \\Rightarrow \\sqrt n \\ge 9.8$.
*Step 3 (1 mark):* $n \\ge 96.04$, so minimum $n = 97$.

**c. (2 marks)**
*Step 1 (1 mark):* With $n = 97$: $\\sigma_{\\bar X} = 5/\\sqrt{97} \\approx 0.5077$.
*Step 2 (1 mark):* $\\Pr(|Z| < 1/0.5077) = \\Pr(|Z| < 1.97) \\approx 0.951 \\ge 0.95$ ✓.`),

  sq(`A random variable $X$ has population mean $\\mu = 65$ and SD $\\sigma = 12$, and is approximately normally distributed. Let $\\bar X$ be the sample mean from a random sample of size $n$.

**a.** For $n = 36$, find $\\Pr(\\bar X > 67)$ and $\\Pr(\\bar X < 63)$. (3 marks)

**b.** Hence find $\\Pr(63 \\le \\bar X \\le 67)$. (2 marks)

**c.** For what value of $c > 0$ is $\\Pr(65 - c \\le \\bar X \\le 65 + c) = 0.99$? (3 marks)

${img("upper-tail.svg", "Bell curve of x̄ with mean 50 and standard error 1.5 with the upper tail shaded")}`,
    8, "HARD",
    `**a. (3 marks)**
*Step 1 (1 mark):* $\\sigma_{\\bar X} = 12/\\sqrt{36} = 2$.
*Step 2 (1 mark):* $Z = (67 - 65)/2 = 1$, so $\\Pr(\\bar X > 67) = \\Pr(Z > 1) \\approx 0.1587$.
*Step 3 (1 mark):* By symmetry, $\\Pr(\\bar X < 63) = \\Pr(Z < -1) \\approx 0.1587$.

**b. (2 marks)**
*Step 1 (1 mark):* $\\Pr(63 \\le \\bar X \\le 67) = 1 - \\Pr(\\bar X > 67) - \\Pr(\\bar X < 63)$.
*Step 2 (1 mark):* $= 1 - 0.1587 - 0.1587 = 0.6826$.

**c. (3 marks)**
*Step 1 (1 mark):* Require $\\Pr(|\\bar X - 65| \\le c) = 0.99 \\Rightarrow \\Pr(|Z| \\le c/2) = 0.99$.
*Step 2 (1 mark):* $c/2 = 2.576$.
*Step 3 (1 mark):* $c = 5.152$.`),
];

// ─── 3 EXT_RESP ────────────────────────────────────────────────────────

const extendedResponse: FR[] = [
  sq(`A car-tyre manufacturer measures the tread-depth (mm) of brand-new tyres straight off the production line. Tread depth $X$ is approximately normally distributed with $\\mu = 8.0$ mm and $\\sigma = 0.4$ mm. A quality-control inspector takes random samples of $n$ tyres from each shift.

**a.** For $n = 25$, state the exact distribution of $\\bar X$ and compute $\\Pr(\\bar X < 7.85)$. (4 marks)

**b.** The factory rejects a shift if $\\bar X < 7.85$ mm. For $n = 25$, what is the probability of falsely rejecting a shift that is operating normally? (2 marks)

**c.** Suppose the inspector increases the sample size to $n = 100$. Compute $\\Pr(\\bar X < 7.85)$ under the same normal-operation conditions, and explain how the false-rejection probability changes. (3 marks)

**d.** A subsequent shift, however, is producing tread depths with mean $\\mu = 7.7$ mm and $\\sigma = 0.4$ mm unchanged. For $n = 25$, compute the probability that the QC inspector correctly rejects this faulty shift (i.e. $\\bar X < 7.85$). (3 marks)

${img("xbar-n16.svg", "Distribution of x̄ centred at population mean with narrower spread for larger n")}`,
    12, "HARD",
    `**a. (4 marks)**
*Step 1 (1 mark):* $\\sigma_{\\bar X} = 0.4/\\sqrt{25} = 0.08$.
*Step 2 (1 mark):* $\\bar X \\sim N(8.0, 0.0064)$ (i.e. SD $= 0.08$).
*Step 3 (1 mark):* $Z = (7.85 - 8.0)/0.08 = -1.875$.
*Step 4 (1 mark):* $\\Pr(\\bar X < 7.85) = \\Pr(Z < -1.875) \\approx 0.0304$.

**b. (2 marks)**
*Step 1 (1 mark):* The false-rejection probability is exactly $\\Pr(\\bar X < 7.85)$ when the shift IS operating normally.
*Step 2 (1 mark):* From part **a**, this is approximately $0.0304$, i.e. about $3.0\\%$.

**c. (3 marks)**
*Step 1 (1 mark):* For $n = 100$: $\\sigma_{\\bar X} = 0.4/10 = 0.04$.
*Step 2 (1 mark):* $Z = (7.85 - 8.0)/0.04 = -3.75$, so $\\Pr(\\bar X < 7.85) \\approx 0.0001$.
*Step 3 (1 mark):* The false-rejection probability drops dramatically — larger $n$ makes $\\bar X$ closer to $\\mu = 8.0$, so the chance of crossing the $7.85$ threshold by random sampling alone is very small.

**d. (3 marks)**
*Step 1 (1 mark):* Now $\\bar X \\sim N(7.7, 0.0064)$, so $\\sigma_{\\bar X} = 0.08$.
*Step 2 (1 mark):* $Z = (7.85 - 7.7)/0.08 = 1.875$.
*Step 3 (1 mark):* $\\Pr(\\bar X < 7.85) = \\Pr(Z < 1.875) \\approx 0.9696$ — almost certain to be flagged.`),

  sq(`A psychometrician measures reaction times (in seconds) of adults to a particular cognitive task. The population distribution is approximately normal with $\\mu = 0.50$ s and $\\sigma = 0.08$ s.

**a.** A random sample of $n = 16$ adults is selected. State the distribution of $\\bar X$ and find $\\Pr(\\bar X > 0.54)$. (3 marks)

**b.** For the same $n = 16$, find $\\Pr(0.47 < \\bar X < 0.53)$. (3 marks)

**c.** The researcher wishes to design an experiment where the probability that $\\bar X$ falls within $0.01$ s of $\\mu$ is at least $0.95$. Determine the minimum required sample size $n$. (3 marks)

**d.** A second experimental condition is introduced where $\\sigma$ doubles to $0.16$ s (more variable reactions). For the same sample size you found in **c**, recompute the probability that $\\bar X$ falls within $0.01$ s of $\\mu$. Comment on the impact. (3 marks)`,
    12, "HARD",
    `**a. (3 marks)**
*Step 1 (1 mark):* $\\sigma_{\\bar X} = 0.08/\\sqrt{16} = 0.02$, so $\\bar X \\sim N(0.50, 0.02^2)$.
*Step 2 (1 mark):* $Z = (0.54 - 0.50)/0.02 = 2$.
*Step 3 (1 mark):* $\\Pr(\\bar X > 0.54) = \\Pr(Z > 2) \\approx 0.0228$.

**b. (3 marks)**
*Step 1 (1 mark):* $Z_1 = (0.47 - 0.50)/0.02 = -1.5$.
*Step 2 (1 mark):* $Z_2 = (0.53 - 0.50)/0.02 = 1.5$.
*Step 3 (1 mark):* $\\Pr(-1.5 < Z < 1.5) = 2\\Phi(1.5) - 1 \\approx 0.8664$.

**c. (3 marks)**
*Step 1 (1 mark):* Require $\\Pr(|\\bar X - 0.50| < 0.01) \\ge 0.95 \\Rightarrow 0.01/\\sigma_{\\bar X} \\ge 1.96$, i.e. $\\sigma_{\\bar X} \\le 0.01/1.96 \\approx 0.005102$.
*Step 2 (1 mark):* So $0.08/\\sqrt n \\le 0.005102 \\Rightarrow \\sqrt n \\ge 15.68$.
*Step 3 (1 mark):* $n \\ge 245.86$, so minimum $n = 246$.

**d. (3 marks)**
*Step 1 (1 mark):* With $\\sigma = 0.16$ and $n = 246$: $\\sigma_{\\bar X} = 0.16/\\sqrt{246} \\approx 0.0102$.
*Step 2 (1 mark):* $\\Pr(|\\bar X - 0.50| < 0.01) = \\Pr(|Z| < 0.01/0.0102) \\approx \\Pr(|Z| < 0.98) \\approx 0.673$.
*Step 3 (1 mark):* Doubling $\\sigma$ reduces the success probability from $0.95$ to about $0.67$ — the experimenter would need roughly $4\\times$ the sample size to recover the same precision (since SE scales as $\\sigma/\\sqrt n$).`),

  sq(`A coffee shop measures the volume of espresso shots ($X$, in mL) pulled by a barista. The population distribution of single shots is approximately normal with $\\mu = 30$ mL and $\\sigma = 1.2$ mL. A daily quality check averages $n$ shots.

**a.** For $n = 9$, write the distribution of $\\bar X$ and calculate $\\Pr(\\bar X > 30.4)$. (3 marks)

**b.** For $n = 36$, calculate $\\Pr(\\bar X > 30.4)$, and contrast with the value in part **a**. (3 marks)

**c.** Find the value of $c$ such that $\\Pr(30 - c \\le \\bar X \\le 30 + c) = 0.90$ for $n = 36$. (3 marks)

**d.** Quality-control wants to flag a daily reading whenever $|\\bar X - 30| > 0.5$ mL. For $n = 36$, what is the probability of flagging on a normal-operation day (i.e. when the population truly has $\\mu = 30$)? (3 marks)

${img("upper-tail.svg", "Bell curve showing upper tail of x̄ distribution shaded")}`,
    12, "MEDIUM",
    `**a. (3 marks)**
*Step 1 (1 mark):* $\\sigma_{\\bar X} = 1.2/\\sqrt 9 = 0.4$, so $\\bar X \\sim N(30, 0.16)$.
*Step 2 (1 mark):* $Z = (30.4 - 30)/0.4 = 1$.
*Step 3 (1 mark):* $\\Pr(\\bar X > 30.4) = \\Pr(Z > 1) \\approx 0.1587$.

**b. (3 marks)**
*Step 1 (1 mark):* For $n = 36$: $\\sigma_{\\bar X} = 1.2/6 = 0.2$.
*Step 2 (1 mark):* $Z = (30.4 - 30)/0.2 = 2$, so $\\Pr(\\bar X > 30.4) = \\Pr(Z > 2) \\approx 0.0228$.
*Step 3 (1 mark):* Increasing $n$ from $9$ to $36$ reduced the tail probability from $0.16$ to $0.02$ — a larger sample makes $\\bar X$ track $\\mu$ more tightly.

**c. (3 marks)**
*Step 1 (1 mark):* $\\Pr(-c/0.2 \\le Z \\le c/0.2) = 0.90 \\Rightarrow c/0.2 = 1.645$.
*Step 2 (1 mark):* $c = 0.329$ mL.
*Step 3 (1 mark):* So a $90\\%$ probability interval for $\\bar X$ is $(29.671, 30.329)$.

**d. (3 marks)**
*Step 1 (1 mark):* $|Z| > 0.5/0.2 = 2.5$ corresponds to $|\\bar X - 30| > 0.5$.
*Step 2 (1 mark):* $\\Pr(|Z| > 2.5) = 2(1 - \\Phi(2.5)) \\approx 2(1 - 0.9938) = 0.0124$.
*Step 3 (1 mark):* So flagging occurs on about $1.2\\%$ of normal-operation days — the false-flag rate.`),
];

// ─── Output JSON ────────────────────────────────────────────────────────

const output = { mcq, shortAnswer, extendedAnswer, extendedResponse };
fs.writeFileSync(JSON_PATH, JSON.stringify(output, null, 2) + "\n");

console.log(
  `Wrote ${mcq.length} MCQ, ${shortAnswer.length} SHORT, ${extendedAnswer.length} EXT_ANS, ${extendedResponse.length} EXT_RESP to ${JSON_PATH}\n` +
    `Wrote ${Object.keys(figures).length} SVG files to ${FIGURES_DIR}/`,
);
