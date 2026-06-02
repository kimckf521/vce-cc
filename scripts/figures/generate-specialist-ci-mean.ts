/**
 * Specialist: Confidence Intervals for Population Mean.
 * Tier: modelling-rich → MCQ + SHORT + EXT_ANS + EXT_RESP.
 * Targets: 12 MCQ + 8 SHORT + 3 EXT_ANS + 3 EXT_RESP.
 */

import * as fs from "fs";
import * as path from "path";
import { bellCurve, toDataUri } from "./svg";

const FIGURES_DIR = "scripts/output/figures/specialist-ci-mean";
const JSON_PATH = "scripts/output/qset-specialist-ci-mean.json";
fs.mkdirSync(FIGURES_DIR, { recursive: true });

// ─── Figures ────────────────────────────────────────────────────────────

const figCI95 = bellCurve({
  mean: 0,
  sd: 1,
  shadedFrom: -1.96,
  shadedTo: 1.96,
  xLabel: "Z",
  markedValues: [-3, -1.96, 0, 1.96, 3],
});

const figCI90 = bellCurve({
  mean: 0,
  sd: 1,
  shadedFrom: -1.6449,
  shadedTo: 1.6449,
  xLabel: "Z",
  markedValues: [-3, -1.645, 0, 1.645, 3],
});

const figCI99 = bellCurve({
  mean: 0,
  sd: 1,
  shadedFrom: -2.5758,
  shadedTo: 2.5758,
  xLabel: "Z",
  markedValues: [-3, -2.576, 0, 2.576, 3],
});

const figures: Record<string, string> = {
  "ci-95.svg": figCI95,
  "ci-90.svg": figCI90,
  "ci-99.svg": figCI99,
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
  subtopicSlugs: ["confidence-intervals-for-population-mean", ...sec],
});
const sq = (
  c: string, marks: number, d: "EASY" | "MEDIUM" | "HARD", s: string, sec: string[] = [],
): FR => ({
  content: c, marks, difficulty: d, solutionContent: s,
  subtopicSlugs: ["confidence-intervals-for-population-mean", ...sec],
});

// ─── 12 MCQ ────────────────────────────────────────────────────────────

const mcq: MCQ[] = [
  m("A $95\\%$ confidence interval for the population mean has the form:",
    ["$\\bar x \\pm 1.645 \\cdot \\sigma/\\sqrt n$", "$\\bar x \\pm 1.96 \\cdot \\sigma/\\sqrt n$", "$\\bar x \\pm 2.576 \\cdot \\sigma/\\sqrt n$", "$\\bar x \\pm \\sigma$"], "B", "EASY",
    "The critical value for a $95\\%$ CI is $z^* = 1.96$. Distractor $1.645$ corresponds to $90\\%$. **Answer: B**"),

  m("The critical $z$-value used for a $90\\%$ confidence interval is approximately:",
    ["$1.282$", "$1.645$", "$1.96$", "$2.576$"], "B", "EASY",
    "$z^* = 1.645$ for $90\\%$ CI (10% in tails, 5% in each tail). **Answer: B**"),

  m("A random sample of $n = 64$ has $\\bar x = 50$ and $\\sigma = 8$. A $95\\%$ CI for $\\mu$ is approximately:",
    ["$(48.04, 51.96)$", "$(42, 58)$", "$(49, 51)$", "$(46.08, 53.92)$"], "A", "EASY",
    "$\\sigma/\\sqrt n = 8/8 = 1$. CI = $50 \\pm 1.96(1) = (48.04, 51.96)$. **Answer: A**"),

  m("Doubling the sample size (without changing $\\sigma$ or confidence level) changes the width of the CI by a factor of:",
    ["$2$", "$1/2$", "$\\sqrt 2$", "$1/\\sqrt 2$"], "D", "MEDIUM",
    "Width is $2 z^* \\sigma/\\sqrt n$. Doubling $n$ multiplies $\\sqrt n$ by $\\sqrt 2$, so width shrinks by $1/\\sqrt 2$. **Answer: D**"),

  m("A 95% CI for $\\mu$ from a sample is $(18.4, 21.6)$. The sample mean $\\bar x$ equals:",
    ["$18.4$", "$20$", "$21.6$", "$3.2$"], "B", "EASY",
    "$\\bar x$ is the midpoint: $(18.4 + 21.6)/2 = 20$. **Answer: B**"),

  m("For a $99\\%$ CI, the critical value is approximately:",
    ["$1.645$", "$1.96$", "$2.326$", "$2.576$"], "D", "EASY",
    "$z^* = 2.576$ for $99\\%$. (2.326 is for one-tailed $99\\%$ — a classic distractor.) **Answer: D**"),

  m("If $\\sigma = 10$ and we want a $95\\%$ CI for $\\mu$ with margin of error at most $1$, the minimum $n$ is:",
    ["$96$", "$100$", "$385$", "$400$"], "C", "MEDIUM",
    "Margin $= 1.96 \\cdot 10/\\sqrt n \\le 1 \\Rightarrow \\sqrt n \\ge 19.6 \\Rightarrow n \\ge 384.16$, so $n = 385$. **Answer: C**"),

  m("Which statement is the correct interpretation of a $95\\%$ CI?",
    ["The population mean lies in this interval with probability $95\\%$", "In repeated sampling, about $95\\%$ of such intervals will contain the population mean", "$95\\%$ of sample data lies in this interval", "The sample mean has a $95\\%$ chance of being in this interval"], "B", "MEDIUM",
    "Correct interpretation is in terms of long-run coverage of the unknown but FIXED $\\mu$. Option A is the common misinterpretation (the population mean is not random). **Answer: B**"),

  m("Increasing the confidence level from $90\\%$ to $99\\%$ (with $n$, $\\sigma$ unchanged) makes the CI:",
    ["narrower", "wider", "unchanged", "centred at a different value"], "B", "EASY",
    "Higher confidence requires a larger $z^*$, increasing the margin of error and thus widening the CI. **Answer: B**"),

  m("A sample of $n = 100$ yields $\\bar x = 70.5$ with known $\\sigma = 5$. The $95\\%$ CI for $\\mu$ is approximately:",
    ["$(69.5, 71.5)$", "$(65.5, 75.5)$", "$(60.7, 80.3)$", "$(70.0, 71.0)$"], "A", "MEDIUM",
    "SE $= 5/\\sqrt{100} = 0.5$. CI $= 70.5 \\pm 1.96(0.5) = (69.52, 71.48) \\approx (69.5, 71.5)$. **Answer: A**"),

  m("If $\\bar x = 25$, $\\sigma = 4$, $n = 16$, the margin of error for a $95\\%$ CI is approximately:",
    ["$0.5$", "$1.0$", "$1.96$", "$3.92$"], "C", "MEDIUM",
    "$1.96 \\cdot 4/\\sqrt{16} = 1.96 \\cdot 1 = 1.96$. **Answer: C**"),

  m("In which scenario is a CI for $\\mu$ based on $z^*$ MOST appropriate?",
    ["Small $n$, $\\sigma$ unknown", "Large $n$, $\\sigma$ known", "Population is uniform with small $n$", "We want to test a hypothesis"], "B", "HARD",
    "The z-based CI for $\\mu$ requires $\\sigma$ known and $\\bar X$ approximately normal — satisfied by large $n$ with known $\\sigma$. **Answer: B**"),
];

// ─── 8 SHORT ───────────────────────────────────────────────────────────

const shortAnswer: FR[] = [
  sq("A random sample of $n = 49$ measurements has sample mean $\\bar x = 32$ and is drawn from a population with known $\\sigma = 7$. Calculate a $95\\%$ confidence interval for $\\mu$.", 2, "EASY",
    "*Step 1 (1 mark):* SE $= \\sigma/\\sqrt n = 7/\\sqrt{49} = 1$. CI $= 32 \\pm 1.96(1)$.\n*Step 2 (1 mark):* CI $= (30.04, 33.96)$."),

  sq("Write down the general form of a $C\\%$ confidence interval for the population mean $\\mu$, when $\\sigma$ is known. State all symbols you use.", 2, "EASY",
    "*Step 1 (1 mark):* $\\bar x \\pm z^* \\cdot \\dfrac{\\sigma}{\\sqrt n}$.\n*Step 2 (1 mark):* Here $\\bar x$ is the sample mean, $\\sigma$ the (known) population SD, $n$ the sample size, and $z^*$ the critical value with $\\Pr(-z^* < Z < z^*) = C/100$ where $Z \\sim N(0,1)$."),

  sq("Given $\\bar x = 100$, $\\sigma = 20$, $n = 100$, find a $99\\%$ confidence interval for $\\mu$. Use $z^* = 2.576$.", 3, "MEDIUM",
    "*Step 1 (1 mark):* SE $= 20/\\sqrt{100} = 2$.\n*Step 2 (1 mark):* Margin $= 2.576 \\cdot 2 = 5.152$.\n*Step 3 (1 mark):* CI $= 100 \\pm 5.152 = (94.848, 105.152)$."),

  sq("A $95\\%$ CI for the mean is reported as $(48.4, 51.6)$. Determine the sample mean $\\bar x$ and the margin of error.", 2, "EASY",
    "*Step 1 (1 mark):* $\\bar x$ is the midpoint: $(48.4 + 51.6)/2 = 50$.\n*Step 2 (1 mark):* Margin $= 51.6 - 50 = 1.6$."),

  sq("A population has $\\sigma = 12$. A $95\\%$ CI for $\\mu$ with margin of error at most $2$ is required. Determine the minimum sample size $n$.", 3, "MEDIUM",
    "*Step 1 (1 mark):* Margin $= 1.96 \\cdot 12/\\sqrt n \\le 2$.\n*Step 2 (1 mark):* $\\sqrt n \\ge 1.96 \\cdot 12/2 = 11.76$.\n*Step 3 (1 mark):* $n \\ge 138.3$, so the minimum sample size is $n = 139$."),

  sq("Interpret what a $95\\%$ confidence interval $(48.04, 51.96)$ means in context, being careful to address the common misconception that '$\\mu$ has a $95\\%$ chance of being in the interval'.", 2, "MEDIUM",
    "*Step 1 (1 mark):* The interval $(48.04, 51.96)$ is constructed by a procedure that, in repeated sampling, produces intervals containing the true mean $\\mu$ for about $95\\%$ of all samples.\n*Step 2 (1 mark):* It is incorrect to say $\\mu$ has a $95\\%$ probability of being in this specific interval — $\\mu$ is a fixed (unknown) constant, so either it is in $(48.04, 51.96)$ or it isn't. The $95\\%$ refers to the procedure's long-run coverage, not the post-data probability."),

  sq("A sample of size $n = 36$ yields $\\bar x = 75$ from a normal population with $\\sigma = 6$. Construct a $90\\%$ CI for $\\mu$ using $z^* = 1.645$.", 2, "EASY",
    "*Step 1 (1 mark):* SE $= 6/\\sqrt{36} = 1$. Margin $= 1.645 \\cdot 1 = 1.645$.\n*Step 2 (1 mark):* CI $= 75 \\pm 1.645 = (73.355, 76.645)$."),

  sq("A researcher reports a $95\\%$ CI $(11.2, 12.8)$ for the mean weight of cucumbers, in kg. Estimate the sample standard error and explain why the SE is half the width of the margin of error.", 3, "HARD",
    "*Step 1 (1 mark):* Margin of error $= (12.8 - 11.2)/2 = 0.8$.\n*Step 2 (1 mark):* Margin $= z^* \\cdot \\text{SE}$, so SE $= 0.8 / 1.96 \\approx 0.408$ kg.\n*Step 3 (1 mark):* SE = $\\sigma/\\sqrt n$ is one factor in the margin; the margin scales the SE up by $z^* \\approx 1.96$ to give the half-width."),
];

// ─── 3 EXT_ANS ─────────────────────────────────────────────────────────

const extendedAnswer: FR[] = [
  sq(`A juice manufacturer claims the mean volume of juice in their cartons is $250$ mL. A random sample of $n = 100$ cartons yields $\\bar x = 248.5$ mL. Assume $\\sigma = 5$ mL is known.

**a.** Construct a $95\\%$ CI for the population mean volume $\\mu$. (3 marks)

**b.** Does the CI in part **a** support the manufacturer's claim of $\\mu = 250$ mL? Justify your answer. (2 marks)

**c.** Construct a $99\\%$ CI for $\\mu$, and comment on whether the manufacturer's claim is now contained in it. (3 marks)

${img("ci-95.svg", "Standard normal distribution showing central 95% region between -1.96 and 1.96")}`,
    8, "MEDIUM",
    `**a. (3 marks)**
*Step 1 (1 mark):* SE $= 5/\\sqrt{100} = 0.5$.
*Step 2 (1 mark):* Margin $= 1.96 \\cdot 0.5 = 0.98$.
*Step 3 (1 mark):* $95\\%$ CI $= 248.5 \\pm 0.98 = (247.52, 249.48)$.

**b. (2 marks)**
*Step 1 (1 mark):* The claimed mean $\\mu = 250$ lies OUTSIDE the $95\\%$ CI $(247.52, 249.48)$.
*Step 2 (1 mark):* So at the $5\\%$ significance level, the sample provides evidence against the manufacturer's claim — the true mean appears to be less than 250 mL.

**c. (3 marks)**
*Step 1 (1 mark):* Margin $= 2.576 \\cdot 0.5 = 1.288$.
*Step 2 (1 mark):* $99\\%$ CI $= 248.5 \\pm 1.288 = (247.21, 249.79)$.
*Step 3 (1 mark):* The value $250$ is still NOT in the $99\\%$ CI $(247.21, 249.79)$, providing strong evidence against the manufacturer's claim even at the $1\\%$ significance level.`),

  sq(`A pharmaceutical company measures the dissolution time of tablets in seconds. From a random sample of $n = 25$ tablets, the sample mean is $\\bar x = 42.0$. The population SD is known to be $\\sigma = 5$.

**a.** Construct a $95\\%$ confidence interval for the population mean dissolution time. (3 marks)

**b.** Determine the minimum sample size required so that the margin of error of a $95\\%$ CI is at most $1$ second. (2 marks)

**c.** Suppose the company instead reports a $90\\%$ CI from the same sample. Will it be narrower or wider than the $95\\%$ CI? Compute it and explain. (3 marks)`,
    8, "MEDIUM",
    `**a. (3 marks)**
*Step 1 (1 mark):* SE $= 5/\\sqrt{25} = 1$.
*Step 2 (1 mark):* Margin $= 1.96 \\cdot 1 = 1.96$.
*Step 3 (1 mark):* $95\\%$ CI $= 42.0 \\pm 1.96 = (40.04, 43.96)$.

**b. (2 marks)**
*Step 1 (1 mark):* Require $1.96 \\cdot 5/\\sqrt n \\le 1 \\Rightarrow \\sqrt n \\ge 9.8$.
*Step 2 (1 mark):* $n \\ge 96.04$, so minimum $n = 97$.

**c. (3 marks)**
*Step 1 (1 mark):* A $90\\%$ CI uses $z^* = 1.645 < 1.96$, so it is NARROWER.
*Step 2 (1 mark):* Margin $= 1.645 \\cdot 1 = 1.645$.
*Step 3 (1 mark):* $90\\%$ CI $= 42.0 \\pm 1.645 = (40.355, 43.645)$. Narrower interval gives less confidence: we're $90\\%$ (not $95\\%$) confident the procedure captures $\\mu$.`),

  sq(`A random sample of $n = 144$ measurements from a normal population with known $\\sigma = 18$ produces $\\bar x = 65.5$.

**a.** Construct $90\\%$, $95\\%$ and $99\\%$ confidence intervals for $\\mu$. (4 marks)

**b.** Express the relationship between the three interval widths. (1 mark)

**c.** Without further calculation, explain how the widths would change if $\\sigma$ were $9$ instead of $18$. (2 marks)

${img("ci-99.svg", "Standard normal distribution showing central 99% region between -2.576 and 2.576")}`,
    7, "HARD",
    `**a. (4 marks)**
*Step 1 (1 mark):* SE $= 18/\\sqrt{144} = 1.5$.
*Step 2 (1 mark):* $90\\%$ CI: $65.5 \\pm 1.645(1.5) = 65.5 \\pm 2.4675 = (63.03, 67.97)$.
*Step 3 (1 mark):* $95\\%$ CI: $65.5 \\pm 1.96(1.5) = 65.5 \\pm 2.94 = (62.56, 68.44)$.
*Step 4 (1 mark):* $99\\%$ CI: $65.5 \\pm 2.576(1.5) = 65.5 \\pm 3.864 = (61.64, 69.36)$.

**b. (1 mark)**
Width$_{90} <$ Width$_{95} <$ Width$_{99}$ — higher confidence level corresponds to a wider interval.

**c. (2 marks)**
*Step 1 (1 mark):* Halving $\\sigma$ halves the SE, since SE $= \\sigma/\\sqrt n$ is proportional to $\\sigma$.
*Step 2 (1 mark):* Margin $= z^* \\cdot \\text{SE}$ also halves, so all three CIs become half as wide.`),
];

// ─── 3 EXT_RESP ────────────────────────────────────────────────────────

const extendedResponse: FR[] = [
  sq(`A coffee company sells bags of beans labelled $1000$ g each. A quality-control engineer suspects the actual filling mean has drifted from the target. To investigate, she samples $n = 64$ bags at random and finds $\\bar x = 992.5$ g. The filling machine has a known long-run SD of $\\sigma = 12$ g.

**a.** Construct a $95\\%$ CI for the true mean weight $\\mu$. Show all working. (3 marks)

**b.** Does the labelled value $\\mu = 1000$ lie in the $95\\%$ CI? What does this suggest about the labelling claim? (3 marks)

**c.** The engineer wishes to reduce the margin of error to at most $1$ g in a future audit. What is the minimum sample size required? (3 marks)

**d.** Interpret the CI from part **a** in plain English, including a careful statement of what the "$95\\%$" refers to. (3 marks)

${img("ci-95.svg", "Standard normal distribution showing 95% central confidence region")}`,
    12, "MEDIUM",
    `**a. (3 marks)**
*Step 1 (1 mark):* SE $= 12/\\sqrt{64} = 1.5$.
*Step 2 (1 mark):* Margin $= 1.96 \\cdot 1.5 = 2.94$.
*Step 3 (1 mark):* $95\\%$ CI $= 992.5 \\pm 2.94 = (989.56, 995.44)$.

**b. (3 marks)**
*Step 1 (1 mark):* Check: is $1000$ in $(989.56, 995.44)$? No — $1000$ is above the upper limit.
*Step 2 (1 mark):* This means the $95\\%$ CI does NOT cover the labelled value.
*Step 3 (1 mark):* So at the $5\\%$ significance level, there is evidence that the true mean weight is less than $1000$ g — the bags are under-filled on average.

**c. (3 marks)**
*Step 1 (1 mark):* Require $1.96 \\cdot 12/\\sqrt n \\le 1$.
*Step 2 (1 mark):* $\\sqrt n \\ge 23.52$, so $n \\ge 553.2$.
*Step 3 (1 mark):* Minimum sample size: $n = 554$.

**d. (3 marks)**
*Step 1 (1 mark):* The interval $(989.56, 995.44)$ is our best estimate, from this sample, of where the true average weight of all bags lies.
*Step 2 (1 mark):* It is NOT the case that there is a "$95\\%$ probability" that $\\mu$ is in this specific interval — $\\mu$ is fixed and unknown.
*Step 3 (1 mark):* What "$95\\%$" means: if the same sampling procedure were repeated many times, about $95\\%$ of the resulting CIs would contain $\\mu$. We are confident in the long-run reliability of the method.`),

  sq(`A medical researcher wishes to estimate the mean systolic blood pressure of a population of adults aged 30–50. She knows from prior studies that $\\sigma = 14$ mmHg.

**a.** From a pilot sample of $n = 49$, she records $\\bar x = 124$ mmHg. Construct a $95\\%$ CI for the population mean $\\mu$. (3 marks)

**b.** A government report claims that the population mean is $\\mu = 120$. Comment on this claim using the CI. (2 marks)

**c.** The researcher proposes a follow-up study aimed at a $95\\%$ CI of half-width at most $2$ mmHg. Compute the required sample size. (3 marks)

**d.** Suppose in the follow-up study she actually collects $n = 200$ patients and finds $\\bar x = 122.5$. Construct the new $95\\%$ CI and compare its width to the pilot CI in **a**. (4 marks)

${img("ci-95.svg", "Standard normal distribution showing the central 95% confidence region")}`,
    12, "HARD",
    `**a. (3 marks)**
*Step 1 (1 mark):* SE $= 14/\\sqrt{49} = 2$.
*Step 2 (1 mark):* Margin $= 1.96 \\cdot 2 = 3.92$.
*Step 3 (1 mark):* $95\\%$ CI $= 124 \\pm 3.92 = (120.08, 127.92)$.

**b. (2 marks)**
*Step 1 (1 mark):* The claim $\\mu = 120$ falls just OUTSIDE the CI $(120.08, 127.92)$ (by a hair).
*Step 2 (1 mark):* At the $5\\%$ level, the sample provides marginal evidence that the population mean exceeds 120 mmHg. The claim is not supported, though the margin is small.

**c. (3 marks)**
*Step 1 (1 mark):* Require $1.96 \\cdot 14/\\sqrt n \\le 2$.
*Step 2 (1 mark):* $\\sqrt n \\ge 13.72$, so $n \\ge 188.2$.
*Step 3 (1 mark):* Minimum sample size: $n = 189$.

**d. (4 marks)**
*Step 1 (1 mark):* New SE $= 14/\\sqrt{200} \\approx 0.99$.
*Step 2 (1 mark):* Margin $= 1.96 \\cdot 0.99 \\approx 1.94$.
*Step 3 (1 mark):* $95\\%$ CI $= 122.5 \\pm 1.94 = (120.56, 124.44)$.
*Step 4 (1 mark):* The new CI is narrower (width $\\approx 3.88$ vs $7.84$) — the larger sample halves the width approximately, since SE shrinks by factor $\\sqrt{49/200} \\approx 0.495$.`),

  sq(`A survey-based market research firm wants to estimate the mean weekly grocery spend of households in a city. From a random sample of $n = 81$ households, the sample mean is $\\bar x = \\$185$. Assume a known population SD of $\\sigma = \\$27$.

**a.** Construct a $95\\%$ CI for the mean weekly grocery spend $\\mu$. (3 marks)

**b.** Construct a $99\\%$ CI for $\\mu$, and explain which CI you would prefer to report and why. (3 marks)

**c.** A competitor claims their data shows $\\mu = \\$200$. Does the $95\\%$ CI support or refute this claim? (2 marks)

**d.** Discuss two assumptions or conditions that underlie the validity of the CI in part **a**. State whether each is reasonable in this survey context. (4 marks)

${img("ci-99.svg", "Standard normal distribution showing the central 99% confidence region")}`,
    12, "MEDIUM",
    `**a. (3 marks)**
*Step 1 (1 mark):* SE $= 27/\\sqrt{81} = 3$.
*Step 2 (1 mark):* Margin $= 1.96 \\cdot 3 = 5.88$.
*Step 3 (1 mark):* $95\\%$ CI $= 185 \\pm 5.88 = (\\$179.12, \\$190.88)$.

**b. (3 marks)**
*Step 1 (1 mark):* $99\\%$ Margin $= 2.576 \\cdot 3 = 7.728$.
*Step 2 (1 mark):* $99\\%$ CI $= 185 \\pm 7.728 = (\\$177.27, \\$192.73)$.
*Step 3 (1 mark):* Trade-off: $99\\%$ gives higher coverage probability (better long-run guarantee) at the cost of a wider, less informative interval. For typical reporting, $95\\%$ is conventional and informative; choose $99\\%$ when stakes of missing $\\mu$ are higher (e.g. for safety/financial reserves).

**c. (2 marks)**
*Step 1 (1 mark):* The claim $\\mu = \\$200$ is OUTSIDE the $95\\%$ CI $(\\$179.12, \\$190.88)$.
*Step 2 (1 mark):* At the $5\\%$ level, the sample provides evidence that the true mean is LESS than $\\$200$, refuting the competitor's claim.

**d. (4 marks)**
*Step 1 (1 mark):* Assumption 1: the sample is a random (simple random) sample of the population of households — required so that $\\bar X$ targets $\\mu$ without bias.
*Step 2 (1 mark):* In a properly designed survey, this is reasonable IF respondents are sampled at random; non-response or self-selection would violate it.
*Step 3 (1 mark):* Assumption 2: $\\bar X$ is approximately normally distributed — guaranteed by the CLT for $n = 81$, which is large.
*Step 4 (1 mark):* This is reasonable, given the large sample size, even though grocery spend may itself be skewed in the population.`),
];

// ─── Output JSON ────────────────────────────────────────────────────────

const output = { mcq, shortAnswer, extendedAnswer, extendedResponse };
fs.writeFileSync(JSON_PATH, JSON.stringify(output, null, 2) + "\n");

console.log(
  `Wrote ${mcq.length} MCQ, ${shortAnswer.length} SHORT, ${extendedAnswer.length} EXT_ANS, ${extendedResponse.length} EXT_RESP to ${JSON_PATH}\n` +
    `Wrote ${Object.keys(figures).length} SVG files to ${FIGURES_DIR}/`,
);
