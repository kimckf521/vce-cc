/**
 * Specialist: Hypothesis Testing (One-Tailed and Two-Tailed).
 * Tier: modelling-rich → MCQ + SHORT + EXT_ANS + EXT_RESP.
 * Targets: 12 MCQ + 8 SHORT + 3 EXT_ANS + 3 EXT_RESP.
 */

import * as fs from "fs";
import * as path from "path";
import { bellCurve, toDataUri } from "./svg";

const FIGURES_DIR = "scripts/output/figures/specialist-hypothesis-testing";
const JSON_PATH = "scripts/output/qset-specialist-hypothesis-testing.json";
fs.mkdirSync(FIGURES_DIR, { recursive: true });

// ─── Figures ────────────────────────────────────────────────────────────

const figRightTail = bellCurve({
  mean: 0,
  sd: 1,
  shadedFrom: 1.645,
  shadedTo: 4,
  xLabel: "Z",
  markedValues: [-3, 0, 1.645, 3],
});

const figLeftTail = bellCurve({
  mean: 0,
  sd: 1,
  shadedFrom: -4,
  shadedTo: -1.645,
  xLabel: "Z",
  markedValues: [-3, -1.645, 0, 3],
});

const figTwoTail = bellCurve({
  mean: 0,
  sd: 1,
  shadedFrom: -4,
  shadedTo: -1.96,
  xLabel: "Z",
  markedValues: [-3, -1.96, 0, 1.96, 3],
});

const figures: Record<string, string> = {
  "right-tail.svg": figRightTail,
  "left-tail.svg": figLeftTail,
  "two-tail.svg": figTwoTail,
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
  subtopicSlugs: ["hypothesis-testing-one-tailed-and-two-tailed", ...sec],
});
const sq = (
  c: string, marks: number, d: "EASY" | "MEDIUM" | "HARD", s: string, sec: string[] = [],
): FR => ({
  content: c, marks, difficulty: d, solutionContent: s,
  subtopicSlugs: ["hypothesis-testing-one-tailed-and-two-tailed", ...sec],
});

// ─── 12 MCQ ────────────────────────────────────────────────────────────

const mcq: MCQ[] = [
  m("In a hypothesis test, $H_0$ denotes the:",
    ["alternative hypothesis", "null hypothesis", "significance level", "test statistic"], "B", "EASY",
    "$H_0$ is the null hypothesis (the status-quo / no-effect assumption). **Answer: B**"),

  m("The hypotheses $H_0: \\mu = 50$ vs $H_1: \\mu > 50$ describe a:",
    ["two-tailed test", "left-tailed test", "right-tailed test", "non-parametric test"], "C", "EASY",
    "$H_1: \\mu > 50$ has the inequality pointing right — a right-tailed (upper-tailed) test. **Answer: C**"),

  m("$H_0: \\mu = 100$, $H_1: \\mu \\ne 100$ describes a:",
    ["one-tailed test", "two-tailed test", "left-tailed test", "right-tailed test"], "B", "EASY",
    "$\\ne$ in $H_1$ means rejection regions in both tails — a two-tailed test. **Answer: B**"),

  m("In a right-tailed z-test at significance level $\\alpha = 0.05$, the critical value is:",
    ["$1.282$", "$1.645$", "$1.96$", "$2.326$"], "B", "EASY",
    "Right-tail critical $z$ with $5\\%$ in upper tail: $z^* = 1.645$. **Answer: B**"),

  m("In a two-tailed z-test at significance level $\\alpha = 0.05$, the critical values are:",
    ["$\\pm 1.282$", "$\\pm 1.645$", "$\\pm 1.96$", "$\\pm 2.576$"], "C", "EASY",
    "Two-tailed $\\alpha = 0.05$ splits $2.5\\%$ in each tail: critical values $\\pm 1.96$. (Distractor: $\\pm 1.645$ corresponds to one-tailed $5\\%$.) **Answer: C**"),

  m("If a test statistic gives $z = 2.5$ in a two-tailed test, the $p$-value is approximately:",
    ["$0.006$", "$0.0062$", "$0.0124$", "$0.05$"], "C", "MEDIUM",
    "Two-tailed $p = 2 \\Pr(Z > 2.5) = 2(0.0062) = 0.0124$. (Common error: forgetting to double — $0.0062$ would be the one-tailed value.) **Answer: C**"),

  m("In a hypothesis test, we reject $H_0$ when:",
    ["$p$-value $> \\alpha$", "$p$-value $\\le \\alpha$", "sample size is small", "the test statistic is positive"], "B", "EASY",
    "$H_0$ is rejected when $p$-value $\\le \\alpha$ (evidence against $H_0$ is strong enough). **Answer: B**"),

  m("A test of $H_0: \\mu = 200$ vs $H_1: \\mu < 200$ uses $\\bar x = 195$, $\\sigma = 10$, $n = 25$. The test statistic equals:",
    ["$-0.5$", "$-2.5$", "$2.5$", "$-5$"], "B", "MEDIUM",
    "$Z = (195 - 200)/(10/\\sqrt{25}) = -5/2 = -2.5$. **Answer: B**"),

  m("A two-tailed test gives $|z| = 2.0$. The $p$-value is approximately:",
    ["$0.0228$", "$0.0455$", "$0.05$", "$0.95$"], "B", "MEDIUM",
    "Two-tailed $p = 2 \\Pr(Z > 2) = 2(0.0228) \\approx 0.0455$. **Answer: B**"),

  m("Choosing $\\alpha = 0.01$ instead of $\\alpha = 0.05$:",
    ["makes it easier to reject $H_0$", "makes it harder to reject $H_0$", "increases Type II error to zero", "has no effect on rejection rules"], "B", "MEDIUM",
    "A smaller $\\alpha$ demands stronger evidence — harder to reject $H_0$, but lower Type I risk. **Answer: B**"),

  m("In testing $H_0: \\mu = 50$ vs $H_1: \\mu > 50$, the rejection rule at $\\alpha = 0.05$ is:",
    ["reject if $z < -1.645$", "reject if $z > 1.645$", "reject if $|z| > 1.96$", "reject if $z > 1.96$"], "B", "MEDIUM",
    "Right-tailed test, $\\alpha = 0.05$: reject when $z > 1.645$. **Answer: B**"),

  m("Which scenario is BEST tested with a two-tailed test?",
    ["Has the new drug INCREASED average response time?", "Is the manufacturing process's mean DIFFERENT from spec?", "Are heights of teens LOWER than $170$ cm on average?", "Has revenue grown beyond \\$1M?"], "B", "HARD",
    "Two-tailed tests handle 'different from' (deviation in either direction). The other three are directional (one-tailed). **Answer: B**"),
];

// ─── 8 SHORT ───────────────────────────────────────────────────────────

const shortAnswer: FR[] = [
  sq("State $H_0$ and $H_1$ for testing whether the population mean weight of a bag of sugar differs from $1000$ g.", 2, "EASY",
    "*Step 1 (1 mark):* $H_0: \\mu = 1000$ (the population mean equals the labelled value).\n*Step 2 (1 mark):* $H_1: \\mu \\ne 1000$ (the population mean differs from the labelled value — two-tailed)."),

  sq("A random sample of $n = 25$ yields $\\bar x = 51.5$ from a normal population with known $\\sigma = 5$. Test $H_0: \\mu = 50$ vs $H_1: \\mu > 50$ at $\\alpha = 0.05$, computing the test statistic and stating the conclusion.", 3, "MEDIUM",
    "*Step 1 (1 mark):* $Z = (51.5 - 50)/(5/\\sqrt{25}) = 1.5/1 = 1.5$.\n*Step 2 (1 mark):* Critical value for right-tailed test at $\\alpha = 0.05$ is $z^* = 1.645$. Since $1.5 < 1.645$, do NOT reject $H_0$.\n*Step 3 (1 mark):* There is insufficient evidence (at the $5\\%$ level) to conclude that $\\mu > 50$."),

  sq("Calculate the $p$-value for a two-tailed z-test that yields $z = -2.0$, and state the conclusion at $\\alpha = 0.05$.", 3, "MEDIUM",
    "*Step 1 (1 mark):* $p$-value $= 2 \\Pr(Z < -2) = 2(0.0228) = 0.0456$.\n*Step 2 (1 mark):* Compare to $\\alpha = 0.05$: $p = 0.0456 < 0.05$.\n*Step 3 (1 mark):* Reject $H_0$ — there is evidence at the $5\\%$ level that $\\mu$ differs from the null value."),

  sq("Explain the difference between a one-tailed and a two-tailed test in terms of $H_1$ and the placement of the rejection region.", 2, "EASY",
    "*Step 1 (1 mark):* One-tailed: $H_1$ uses $<$ or $>$, and the rejection region lies entirely in one tail of the sampling distribution.\n*Step 2 (1 mark):* Two-tailed: $H_1$ uses $\\ne$, and the rejection region is split equally between both tails."),

  sq("A car manufacturer claims their average mileage is at least $40$ mpg. A sample of $n = 36$ gives $\\bar x = 38.5$ with $\\sigma = 3$. State $H_0$ and $H_1$, then compute the test statistic.", 3, "MEDIUM",
    "*Step 1 (1 mark):* $H_0: \\mu = 40$, $H_1: \\mu < 40$ (left-tailed, since the manufacturer's claim is undermined when the true mean is smaller).\n*Step 2 (1 mark):* SE $= 3/\\sqrt{36} = 0.5$.\n*Step 3 (1 mark):* $Z = (38.5 - 40)/0.5 = -3$."),

  sq("A drug-trial claims a mean reduction in blood pressure of $\\mu = 8$ mmHg. A sample of $n = 100$ gives $\\bar x = 9.2$ mmHg, $\\sigma = 4$. Test at $\\alpha = 0.05$ whether the true mean reduction exceeds 8.", 3, "MEDIUM",
    "*Step 1 (1 mark):* $H_0: \\mu = 8$, $H_1: \\mu > 8$. SE $= 4/\\sqrt{100} = 0.4$.\n*Step 2 (1 mark):* $Z = (9.2 - 8)/0.4 = 3.0$, which exceeds the right-tailed critical value $1.645$.\n*Step 3 (1 mark):* Reject $H_0$. There is strong evidence ($p \\approx 0.0013$) that the true mean reduction is greater than 8 mmHg."),

  sq("A sample mean is in the rejection region of a two-tailed test at $\\alpha = 0.05$. State what conclusion follows, and what statement we would make in plain English about the parameter.", 2, "EASY",
    "*Step 1 (1 mark):* Reject $H_0$ at the $5\\%$ significance level.\n*Step 2 (1 mark):* In plain English: the data provides evidence that the population mean differs from the hypothesised value; this difference is unlikely to be due to random sampling alone."),

  sq("Why is it never correct to 'accept $H_0$' even if we fail to reject it? Frame your answer in terms of evidence.", 2, "HARD",
    "*Step 1 (1 mark):* Failing to reject $H_0$ does not provide POSITIVE evidence that $H_0$ is true — it only means the data are insufficient to refute $H_0$ at the chosen level.\n*Step 2 (1 mark):* Many parameter values besides the hypothesised one are also consistent with the data; we say 'we do not reject $H_0$' rather than 'we accept $H_0$' to keep this nuance explicit."),
];

// ─── 3 EXT_ANS ─────────────────────────────────────────────────────────

const extendedAnswer: FR[] = [
  sq(`A bakery claims its loaves of bread weigh, on average, $\\mu = 500$ g, with population SD $\\sigma = 8$ g. A consumer auditor weighs $n = 64$ loaves and obtains $\\bar x = 497$ g.

**a.** State the null and alternative hypotheses for a two-tailed test. (2 marks)

**b.** Compute the z-test statistic. (2 marks)

**c.** At significance level $\\alpha = 0.05$, what is the conclusion of the test? (3 marks)

${img("two-tail.svg", "Standard normal distribution showing two-tailed rejection region beyond ±1.96")}`,
    7, "MEDIUM",
    `**a. (2 marks)**
*Step 1 (1 mark):* $H_0: \\mu = 500$ (bakery's claim).
*Step 2 (1 mark):* $H_1: \\mu \\ne 500$ (auditor is testing for any deviation).

**b. (2 marks)**
*Step 1 (1 mark):* SE $= 8/\\sqrt{64} = 1$.
*Step 2 (1 mark):* $Z = (497 - 500)/1 = -3$.

**c. (3 marks)**
*Step 1 (1 mark):* Two-tailed critical values at $\\alpha = 0.05$ are $\\pm 1.96$.
*Step 2 (1 mark):* Since $|-3| = 3 > 1.96$, reject $H_0$.
*Step 3 (1 mark):* At the $5\\%$ level, there is strong evidence ($p \\approx 0.0027$) that the population mean weight differs from $500$ g; the bakery's claim is not supported.`),

  sq(`A pharmaceutical company is testing a new fever-reducing drug. Standard treatment reduces fever by $\\mu_0 = 1.5\\,^\\circ$C on average. The company claims the new drug performs better. A trial with $n = 49$ patients records $\\bar x = 1.7\\,^\\circ$C with assumed $\\sigma = 0.7\\,^\\circ$C.

**a.** State $H_0$ and $H_1$ and explain why a one-tailed test is appropriate. (2 marks)

**b.** Compute the test statistic and the corresponding $p$-value. (3 marks)

**c.** At $\\alpha = 0.05$, do the data support the company's claim? Justify carefully. (3 marks)

${img("right-tail.svg", "Standard normal distribution showing the right-tailed rejection region beyond 1.645")}`,
    8, "MEDIUM",
    `**a. (2 marks)**
*Step 1 (1 mark):* $H_0: \\mu = 1.5$, $H_1: \\mu > 1.5$.
*Step 2 (1 mark):* The company's claim is directional ('better' = larger reduction), so a right-tailed test is appropriate.

**b. (3 marks)**
*Step 1 (1 mark):* SE $= 0.7/\\sqrt{49} = 0.1$.
*Step 2 (1 mark):* $Z = (1.7 - 1.5)/0.1 = 2.0$.
*Step 3 (1 mark):* $p$-value $= \\Pr(Z > 2.0) \\approx 0.0228$.

**c. (3 marks)**
*Step 1 (1 mark):* Compare: $p = 0.0228 < 0.05 = \\alpha$.
*Step 2 (1 mark):* Reject $H_0$.
*Step 3 (1 mark):* At the $5\\%$ level, the data DO support the company's claim that the new drug produces a larger mean fever reduction than the standard treatment.`),

  sq(`A factory's bolt-cutting machine should produce bolts of length $\\mu = 50.0$ mm. The factory's QC department samples $n = 100$ bolts and finds $\\bar x = 50.05$ mm with $\\sigma = 0.2$ mm. They want to detect deviations from $50.0$ mm in either direction.

**a.** Set up a two-tailed test. State $H_0$, $H_1$, and the critical values at $\\alpha = 0.01$. (3 marks)

**b.** Compute the test statistic and the $p$-value. (3 marks)

**c.** State the conclusion at $\\alpha = 0.01$, and contrast it with the conclusion at $\\alpha = 0.05$. (3 marks)`,
    9, "HARD",
    `**a. (3 marks)**
*Step 1 (1 mark):* $H_0: \\mu = 50.0$.
*Step 2 (1 mark):* $H_1: \\mu \\ne 50.0$.
*Step 3 (1 mark):* Two-tailed critical values at $\\alpha = 0.01$: $\\pm 2.576$.

**b. (3 marks)**
*Step 1 (1 mark):* SE $= 0.2/\\sqrt{100} = 0.02$.
*Step 2 (1 mark):* $Z = (50.05 - 50.0)/0.02 = 2.5$.
*Step 3 (1 mark):* $p$-value $= 2 \\Pr(Z > 2.5) \\approx 2(0.0062) = 0.0124$.

**c. (3 marks)**
*Step 1 (1 mark):* At $\\alpha = 0.01$: $p = 0.0124 > 0.01$, so do NOT reject $H_0$. There is insufficient evidence to conclude $\\mu \\ne 50.0$.
*Step 2 (1 mark):* At $\\alpha = 0.05$: $p = 0.0124 < 0.05$, so reject $H_0$ — evidence that $\\mu \\ne 50.0$.
*Step 3 (1 mark):* This illustrates how the conclusion depends on $\\alpha$: lowering $\\alpha$ demands stronger evidence to reject $H_0$. The data are 'borderline' between the two thresholds.`),
];

// ─── 3 EXT_RESP ────────────────────────────────────────────────────────

const extendedResponse: FR[] = [
  sq(`A pharmaceutical company is testing whether a new dosing schedule for an anti-anxiety drug reduces patients' anxiety scores. Under the standard schedule, mean reduction is $\\mu_0 = 6.0$ points on a standardised scale, with population SD $\\sigma = 2.4$ points. A trial of $n = 64$ patients on the new schedule yields $\\bar x = 6.6$ points.

**a.** Identify whether a one-tailed or two-tailed test is appropriate and state $H_0$ and $H_1$. (3 marks)

**b.** Compute the test statistic. (2 marks)

**c.** Compute the $p$-value, and decide at $\\alpha = 0.05$ whether the data support the new schedule. (3 marks)

**d.** Repeat the decision at $\\alpha = 0.01$. Comment on what changes. (2 marks)

**e.** Provide a plain-English interpretation of the conclusion, taking care to address the meaning of '$\\alpha = 0.05$'. (2 marks)

${img("right-tail.svg", "Standard normal distribution showing right-tail rejection region beyond z = 1.645")}`,
    12, "MEDIUM",
    `**a. (3 marks)**
*Step 1 (1 mark):* The company is testing whether the new schedule produces a LARGER reduction than the standard — one-tailed (right).
*Step 2 (1 mark):* $H_0: \\mu = 6.0$ (no improvement over standard).
*Step 3 (1 mark):* $H_1: \\mu > 6.0$ (new schedule improves reduction).

**b. (2 marks)**
*Step 1 (1 mark):* SE $= 2.4/\\sqrt{64} = 0.3$.
*Step 2 (1 mark):* $Z = (6.6 - 6.0)/0.3 = 2.0$.

**c. (3 marks)**
*Step 1 (1 mark):* $p$-value $= \\Pr(Z > 2.0) \\approx 0.0228$.
*Step 2 (1 mark):* Compare: $p = 0.0228 < 0.05 = \\alpha$.
*Step 3 (1 mark):* Reject $H_0$ — at the $5\\%$ level, data support the new schedule.

**d. (2 marks)**
*Step 1 (1 mark):* At $\\alpha = 0.01$: $p = 0.0228 > 0.01$, so do NOT reject $H_0$.
*Step 2 (1 mark):* The conclusion REVERSES — at $1\\%$, the evidence is no longer strong enough. The decision is sensitive to the chosen $\\alpha$.

**e. (2 marks)**
*Step 1 (1 mark):* At the $5\\%$ level, if the standard schedule's mean really were $6.0$, the chance of seeing a sample mean as extreme as $6.6$ purely by random sampling is only about $2.3\\%$ — small enough that we conclude the schedule difference is real.
*Step 2 (1 mark):* '$\\alpha = 0.05$' means: in the long run, even if $H_0$ is true, we accept up to a $5\\%$ chance of falsely rejecting $H_0$ (Type I error).`),

  sq(`A car assembly plant uses an automated paint sprayer set to deposit paint at a target thickness of $\\mu_0 = 200$ μm. Population SD is $\\sigma = 12$ μm. The QC engineer samples $n = 36$ panels at random each shift; if the mean thickness $\\bar X$ shows the process has drifted, she recalibrates.

**a.** Why is a two-tailed test appropriate here? State $H_0$, $H_1$. (2 marks)

**b.** A particular shift yields $\\bar x = 196.5$ μm. Compute the test statistic and $p$-value. (3 marks)

**c.** Make a decision at $\\alpha = 0.05$ and at $\\alpha = 0.01$. Explain which decisions trigger a recalibration. (3 marks)

**d.** The engineer wishes the test to be sensitive enough to detect a drift to $\\mu = 197$ μm with probability at least $0.90$, while keeping $\\alpha = 0.05$. Without computing exactly, explain how she could improve sensitivity (power), naming two adjustments. (2 marks)

**e.** Interpret the final two-tailed decision in part **c** in the context of paint manufacturing. (2 marks)

${img("two-tail.svg", "Standard normal distribution showing both tails shaded beyond ±1.96")}`,
    12, "HARD",
    `**a. (2 marks)**
*Step 1 (1 mark):* The engineer is testing for ANY drift (too thick OR too thin), so two tails are relevant.
*Step 2 (1 mark):* $H_0: \\mu = 200$, $H_1: \\mu \\ne 200$.

**b. (3 marks)**
*Step 1 (1 mark):* SE $= 12/\\sqrt{36} = 2$.
*Step 2 (1 mark):* $Z = (196.5 - 200)/2 = -1.75$.
*Step 3 (1 mark):* $p$-value $= 2\\Pr(Z < -1.75) = 2(0.0401) = 0.0802$.

**c. (3 marks)**
*Step 1 (1 mark):* At $\\alpha = 0.05$: $p = 0.0802 > 0.05$, so do NOT reject $H_0$. No recalibration triggered.
*Step 2 (1 mark):* At $\\alpha = 0.01$: $p = 0.0802 > 0.01$, again do NOT reject $H_0$. No recalibration.
*Step 3 (1 mark):* Both decisions agree: the deviation observed is not yet large enough to be flagged as a drift.

**d. (2 marks)**
*Step 1 (1 mark):* Increase the sample size $n$ to shrink the SE and tighten the rejection region around the alternative.
*Step 2 (1 mark):* Alternatively, use a one-tailed test if a SPECIFIC direction of drift is the concern, which puts the full $5\\%$ rejection mass in the relevant tail and increases power against alternatives on that side.

**e. (2 marks)**
*Step 1 (1 mark):* In this shift's data, the observed mean thickness of $196.5$ μm is consistent with the target of $200$ μm under random sampling — there is no statistically significant drift detected.
*Step 2 (1 mark):* The engineer continues operating normally; she would NOT recalibrate based on this evidence alone. (If multiple consecutive shifts show similar tendencies, however, she might investigate.)`),

  sq(`A coffee company sells $250$ mL espresso cans. A consumer agency suspects under-filling. From a random sample of $n = 81$ cans, $\\bar x = 248.5$ mL. The known population SD is $\\sigma = 4.5$ mL.

**a.** Set up the test: state $H_0$ and $H_1$, justifying why this is a one-tailed (left) test. (3 marks)

**b.** Calculate the test statistic. (2 marks)

**c.** Determine the $p$-value, and decide at $\\alpha = 0.05$. (3 marks)

**d.** The company responds that, on the same data, a TWO-tailed test would also reject $H_0$. Compute the two-tailed $p$-value and verify their claim. (2 marks)

**e.** Briefly explain why a one-tailed test is more powerful against the specific alternative $\\mu < 250$ than a two-tailed test, given the same data. (2 marks)

${img("left-tail.svg", "Standard normal distribution showing left-tail rejection region beyond z = -1.645")}`,
    12, "HARD",
    `**a. (3 marks)**
*Step 1 (1 mark):* $H_0: \\mu = 250$ (cans hold their stated mean volume).
*Step 2 (1 mark):* $H_1: \\mu < 250$ (under-filling is the agency's specific concern).
*Step 3 (1 mark):* One-tailed (left) is appropriate because the consumer agency cares only about under-filling, not over-filling — the directional concern fixes the rejection region to the left tail.

**b. (2 marks)**
*Step 1 (1 mark):* SE $= 4.5/\\sqrt{81} = 0.5$.
*Step 2 (1 mark):* $Z = (248.5 - 250)/0.5 = -3.0$.

**c. (3 marks)**
*Step 1 (1 mark):* $p$-value (one-tailed) $= \\Pr(Z < -3.0) \\approx 0.00135$.
*Step 2 (1 mark):* Compare: $p \\approx 0.00135 < 0.05$.
*Step 3 (1 mark):* Reject $H_0$. There is strong evidence at the $5\\%$ level that the population mean is less than $250$ mL — the cans are under-filled.

**d. (2 marks)**
*Step 1 (1 mark):* Two-tailed $p$-value $= 2 \\Pr(Z < -3.0) \\approx 2(0.00135) = 0.0027$.
*Step 2 (1 mark):* Both tests reject at $\\alpha = 0.05$ (and even at $\\alpha = 0.01$); the company's claim that both tests would reject $H_0$ here is true.

**e. (2 marks)**
*Step 1 (1 mark):* For a fixed total $\\alpha$, a one-tailed test concentrates the entire rejection mass in the relevant tail (the cutoff is $-1.645$, not $-1.96$).
*Step 2 (1 mark):* This makes the test MORE LIKELY to reject $H_0$ when the true mean is on the specific side anticipated — so the one-tailed test has higher power against $\\mu < 250$.`),
];

// ─── Output JSON ────────────────────────────────────────────────────────

const output = { mcq, shortAnswer, extendedAnswer, extendedResponse };
fs.writeFileSync(JSON_PATH, JSON.stringify(output, null, 2) + "\n");

console.log(
  `Wrote ${mcq.length} MCQ, ${shortAnswer.length} SHORT, ${extendedAnswer.length} EXT_ANS, ${extendedResponse.length} EXT_RESP to ${JSON_PATH}\n` +
    `Wrote ${Object.keys(figures).length} SVG files to ${FIGURES_DIR}/`,
);
