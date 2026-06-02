/** Specialist modelling-rich: z-Tests. */
import * as fs from "fs";
interface MCQ { content: string; optionA: string; optionB: string; optionC: string; optionD: string; correctOption: "A"|"B"|"C"|"D"; marks: number; difficulty: "EASY"|"MEDIUM"|"HARD"; solutionContent: string; subtopicSlugs: string[]; }
interface FR { content: string; marks: number; difficulty: "EASY"|"MEDIUM"|"HARD"; solutionContent: string; subtopicSlugs: string[]; }
const P = "z-tests";
const m = (c: string, o: [string,string,string,string], k: "A"|"B"|"C"|"D", d: "EASY"|"MEDIUM"|"HARD", s: string, sec: string[] = []): MCQ =>
  ({ content: c, optionA: o[0], optionB: o[1], optionC: o[2], optionD: o[3], correctOption: k, marks: 1, difficulty: d, solutionContent: s, subtopicSlugs: [P, ...sec] });
const sq = (c: string, marks: number, d: "EASY"|"MEDIUM"|"HARD", s: string, sec: string[] = []): FR =>
  ({ content: c, marks, difficulty: d, solutionContent: s, subtopicSlugs: [P, ...sec] });

const mcq: MCQ[] = [
  m("z-test statistic for one-sample mean:", ["$\\dfrac{\\bar x - \\mu}{\\sigma/\\sqrt n}$", "$\\dfrac{\\bar x - \\mu}{\\sigma}$", "$\\dfrac{\\bar x - \\mu}{s}$", "$\\dfrac{\\bar x}{\\sigma}$"], "A", "EASY", "Standard error formula. **Answer: A**"),
  m("z-test assumes:", ["$\\sigma$ known", "$\\sigma$ unknown, large $n$", "small sample", "non-normal data"], "A", "EASY", "z-test requires population $\\sigma$. (Otherwise use t-test.) **Answer: A**"),
  m("$n = 25$, $\\bar x = 102$, $\\mu_0 = 100$, $\\sigma = 5$. $z =$:", ["$0.4$", "$2$", "$10$", "$0.08$"], "B", "EASY", "$z = (102 - 100)/(5/5) = 2/1 = 2$. **Answer: B**"),
  m("Two-tailed critical value at $\\alpha = 0.05$:", ["$\\pm 1.645$", "$\\pm 1.96$", "$\\pm 2.33$", "$\\pm 2.58$"], "B", "MEDIUM", "Two-tailed 5% → 2.5% each tail → $\\pm 1.96$. **Answer: B**"),
  m("One-tailed (upper) critical value at $\\alpha = 0.05$:", ["$1.645$", "$1.96$", "$2.33$", "$1.282$"], "A", "MEDIUM", "5% in upper tail: $z = 1.645$. **Answer: A**"),
  m("If $z_{\\text{obs}} = 1.5$ and one-tailed test at $\\alpha = 0.05$:", ["reject $H_0$", "do not reject $H_0$", "Type I error", "indeterminate"], "B", "MEDIUM", "$1.5 < 1.645$, fail to reject. **Answer: B**"),
  m("$z$-test compares to $t$-test:", ["always equivalent", "z used when $\\sigma$ known, t when only $s$ known", "z for small $n$, t for large", "z for proportions only"], "B", "HARD", "z requires known $\\sigma$. **Answer: B**"),
  m("Doubling $n$ scales standard error by:", ["$1/2$", "$1/\\sqrt 2$", "$\\sqrt 2$", "$2$"], "B", "HARD", "$\\sigma/\\sqrt n$ scales as $1/\\sqrt n$. **Answer: B**"),
];

const shortAnswer: FR[] = [
  sq("Sample of $n = 36$, $\\bar x = 22$, $\\sigma = 6$. Test $H_0: \\mu = 20$ vs $H_1: \\mu > 20$. Find $z$.", 2, "EASY", "*Step 1 (1 mark):* SE = $6/6 = 1$.\n*Step 2 (1 mark):* $z = (22 - 20)/1 = 2$."),
  sq("At $\\alpha = 0.05$ one-tailed (upper), $z_{\\text{crit}} = 1.645$. Given $z = 2.1$, state conclusion.", 1, "EASY", "$z > z_{\\text{crit}}$, reject $H_0$ at 5% level."),
  sq("Sample $n = 100$, $\\bar x = 49.5$, $\\sigma = 4$. Test two-tailed $H_0: \\mu = 50$ at $\\alpha = 0.05$.", 3, "MEDIUM", "*Step 1 (1 mark):* SE = $4/10 = 0.4$.\n*Step 2 (1 mark):* $z = (49.5 - 50)/0.4 = -1.25$.\n*Step 3 (1 mark):* $|z| = 1.25 < 1.96$, do not reject $H_0$."),
  sq("Find $p$-value for $z = 2.5$ in one-tailed (upper) test.", 2, "MEDIUM", "*Step 1 (1 mark):* $p = P(Z > 2.5)$.\n*Step 2 (1 mark):* $\\approx 0.00621$."),
  sq("In a two-tailed test, $z = -2.2$. Find $p$-value.", 2, "MEDIUM", "*Step 1 (1 mark):* $p = 2 P(Z > 2.2) = 2(0.0139)$.\n*Step 2 (1 mark):* $\\approx 0.0278$."),
];

const extendedAnswer: FR[] = [
  sq(`A factory claims the mean weight of its product is $500$ g, with $\\sigma = 8$ g. A random sample of 40 items has $\\bar x = 503$ g. Test at $\\alpha = 0.01$ two-tailed.

**a.** State $H_0$ and $H_1$. (1 mark)

**b.** Calculate the test statistic. (2 marks)

**c.** Find the critical values and conclude. (3 marks)

**d.** Find the $p$-value and verify the same conclusion. (2 marks)`, 8, "MEDIUM",
    `**a. (1 mark)** $H_0: \\mu = 500$; $H_1: \\mu \\ne 500$.

**b. (2 marks)**
*Step 1 (1 mark):* SE = $8/\\sqrt{40} \\approx 1.265$.
*Step 2 (1 mark):* $z = (503 - 500)/1.265 \\approx 2.372$.

**c. (3 marks)**
*Step 1 (1 mark):* Critical at $\\alpha = 0.01$ two-tailed: $\\pm 2.576$.
*Step 2 (1 mark):* $|z| = 2.372 < 2.576$.
*Step 3 (1 mark):* Do not reject $H_0$ — insufficient evidence at 1% level.

**d. (2 marks)**
*Step 1 (1 mark):* $p = 2 P(Z > 2.372) \\approx 2 \\cdot 0.00887 = 0.0177$.
*Step 2 (1 mark):* $p > 0.01$, confirms do not reject $H_0$.`),
];

const extendedResponse: FR[] = [
  sq(`A coffee shop owner believes the mean daily revenue is more than \$$2000$. A random sample of 50 days gives a mean of \$$2100$, with known $\\sigma = $ \$$300$. Test at $\\alpha = 0.05$.

**a.** State $H_0$ and $H_1$. (1 mark)

**b.** Calculate the test statistic. (3 marks)

**c.** Determine the critical value and conclude. (3 marks)

**d.** Calculate and interpret the $p$-value. (2 marks)

**e.** Discuss why the owner might prefer a smaller $\\alpha$. (3 marks)`, 12, "MEDIUM",
    `**a. (1 mark)** $H_0: \\mu = 2000$; $H_1: \\mu > 2000$ (one-tailed, upper).

**b. (3 marks)**
*Step 1 (1 mark):* SE $= 300/\\sqrt{50}$.
*Step 2 (1 mark):* $\\approx 42.43$.
*Step 3 (1 mark):* $z = (2100 - 2000)/42.43 \\approx 2.357$.

**c. (3 marks)**
*Step 1 (1 mark):* One-tailed (upper) at $\\alpha = 0.05$: $z_{\\text{crit}} = 1.645$.
*Step 2 (1 mark):* $z = 2.357 > 1.645$.
*Step 3 (1 mark):* Reject $H_0$ — sufficient evidence that mean revenue exceeds \$2000.

**d. (2 marks)**
*Step 1 (1 mark):* $p = P(Z > 2.357) \\approx 0.0092$.
*Step 2 (1 mark):* Very small — strong evidence against $H_0$. (Would also reject at $\\alpha = 0.01$.)

**e. (3 marks)**
*Step 1 (1 mark):* Smaller $\\alpha$ → harder to reject $H_0$.
*Step 2 (1 mark):* Reduces Type I error rate (claiming higher revenue when in fact mean is 2000).
*Step 3 (1 mark):* If business decisions (e.g. expansion) hinge on this claim, the owner wants high certainty before acting.`),
];

const out = { mcq, shortAnswer, extendedAnswer, extendedResponse };
fs.writeFileSync("scripts/output/qset-specialist-z-tests.json", JSON.stringify(out, null, 2) + "\n");
console.log(`Wrote ${mcq.length} MCQ, ${shortAnswer.length} SHORT, ${extendedAnswer.length} EXT_ANS, ${extendedResponse.length} EXT_RESP to scripts/output/qset-specialist-z-tests.json`);
