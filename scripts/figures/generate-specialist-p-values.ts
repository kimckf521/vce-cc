/** Specialist ext-fit: p-Values and Significance Levels. */
import * as fs from "fs";
interface MCQ { content: string; optionA: string; optionB: string; optionC: string; optionD: string; correctOption: "A"|"B"|"C"|"D"; marks: number; difficulty: "EASY"|"MEDIUM"|"HARD"; solutionContent: string; subtopicSlugs: string[]; }
interface FR { content: string; marks: number; difficulty: "EASY"|"MEDIUM"|"HARD"; solutionContent: string; subtopicSlugs: string[]; }
const P = "p-values-and-significance-levels";
const m = (c: string, o: [string,string,string,string], k: "A"|"B"|"C"|"D", d: "EASY"|"MEDIUM"|"HARD", s: string, sec: string[] = []): MCQ =>
  ({ content: c, optionA: o[0], optionB: o[1], optionC: o[2], optionD: o[3], correctOption: k, marks: 1, difficulty: d, solutionContent: s, subtopicSlugs: [P, ...sec] });
const sq = (c: string, marks: number, d: "EASY"|"MEDIUM"|"HARD", s: string, sec: string[] = []): FR =>
  ({ content: c, marks, difficulty: d, solutionContent: s, subtopicSlugs: [P, ...sec] });

const mcq: MCQ[] = [
  m("$p$-value is the probability of:", ["$H_0$ being true", "observed data or more extreme, given $H_0$", "$H_1$ being true", "the test failing"], "B", "EASY", "Definition. **Answer: B**"),
  m("Common significance level $\\alpha$:", ["$0.5$", "$0.05$", "$0.95$", "$0.005$"], "B", "EASY", "5% is standard. **Answer: B**"),
  m("If $p < \\alpha$:", ["reject $H_0$", "accept $H_0$", "no conclusion", "redo the test"], "A", "EASY", "Small $p$ → strong evidence against $H_0$. **Answer: A**"),
  m("If $p = 0.03$ and $\\alpha = 0.05$:", ["reject $H_0$", "do not reject $H_0$", "$H_0$ proved true", "inconclusive"], "A", "MEDIUM", "$0.03 < 0.05$. **Answer: A**"),
  m("If $p = 0.08$ and $\\alpha = 0.05$:", ["reject $H_0$", "do not reject $H_0$", "$H_1$ proved", "inconclusive"], "B", "MEDIUM", "$p > \\alpha$. **Answer: B**"),
  m("In a two-tailed test, $p$ is:", ["the one-tailed probability", "twice the one-tailed probability", "$1 - \\alpha$", "$0.5$"], "B", "MEDIUM", "Two-tailed: add tails. **Answer: B**"),
  m("Smaller $\\alpha$ means:", ["easier to reject $H_0$", "harder to reject $H_0$", "no effect", "larger Type II error"], "B", "HARD", "Stricter threshold. **Answer: B**"),
  m("A $p$-value of $0.001$ indicates:", ["weak evidence against $H_0$", "strong evidence against $H_0$", "$H_0$ certainly true", "data are bad"], "B", "HARD", "Very small probability under $H_0$. **Answer: B**"),
];

const shortAnswer: FR[] = [
  sq("Define $p$-value in one sentence.", 1, "EASY", "The probability, assuming $H_0$ is true, of observing data as extreme or more extreme than the sample observed."),
  sq("In a one-tailed $z$-test with $z_{\\text{obs}} = 2.1$, find $p$.", 2, "MEDIUM", "*Step 1 (1 mark):* $p = P(Z > 2.1)$.\n*Step 2 (1 mark):* From tables: $\\approx 0.0179$."),
  sq("If $z_{\\text{obs}} = -1.5$ in a two-tailed test, find $p$.", 2, "MEDIUM", "*Step 1 (1 mark):* $P(|Z| \\ge 1.5) = 2 P(Z > 1.5) = 2 \\cdot 0.0668$.\n*Step 2 (1 mark):* $p \\approx 0.134$."),
  sq("At $\\alpha = 0.01$, $p = 0.008$. State conclusion.", 2, "EASY", "*Step 1 (1 mark):* $p < \\alpha$.\n*Step 2 (1 mark):* Reject $H_0$ — sufficient evidence at 1% level."),
  sq("Why does $p < \\alpha$ NOT prove $H_1$ true, only reject $H_0$?", 2, "HARD", "*Step 1 (1 mark):* Statistical evidence is probabilistic, not deterministic.\n*Step 2 (1 mark):* $p$ small means data unlikely under $H_0$; doesn't 'prove' anything — just sufficient evidence to reject $H_0$ at chosen level. Type I error possible."),
];

const extendedAnswer: FR[] = [
  sq(`A pharmaceutical company tests a new drug. $H_0: \\mu = 100$ vs $H_1: \\mu \\ne 100$ at $\\alpha = 0.05$. Sample of 25 patients gives $\\bar x = 105$, with known $\\sigma = 8$.

**a.** Calculate the test statistic $z$. (2 marks)

**b.** Find the $p$-value. (2 marks)

**c.** State the conclusion and explain in context. (3 marks)`, 7, "MEDIUM",
    `**a. (2 marks)**
*Step 1 (1 mark):* $\\sigma_{\\bar x} = 8/\\sqrt{25} = 1.6$.
*Step 2 (1 mark):* $z = (105 - 100)/1.6 = 3.125$.

**b. (2 marks)**
*Step 1 (1 mark):* Two-tailed: $p = 2 P(Z > 3.125)$.
*Step 2 (1 mark):* $\\approx 2 \\cdot 0.00089 \\approx 0.00178$.

**c. (3 marks)**
*Step 1 (1 mark):* $p \\approx 0.0018 < 0.05$.
*Step 2 (1 mark):* Reject $H_0$.
*Step 3 (1 mark):* Strong evidence that the population mean differs from 100; the drug appears to have a statistically significant effect on this measurement.`),
];

const out = { mcq, shortAnswer, extendedAnswer, extendedResponse: [] };
fs.writeFileSync("scripts/output/qset-specialist-p-values.json", JSON.stringify(out, null, 2) + "\n");
console.log(`Wrote ${mcq.length} MCQ, ${shortAnswer.length} SHORT, ${extendedAnswer.length} EXT_ANS to scripts/output/qset-specialist-p-values.json`);
