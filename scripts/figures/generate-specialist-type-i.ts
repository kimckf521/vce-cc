/** Specialist ext-fit: Type I Errors. */
import * as fs from "fs";
interface MCQ { content: string; optionA: string; optionB: string; optionC: string; optionD: string; correctOption: "A"|"B"|"C"|"D"; marks: number; difficulty: "EASY"|"MEDIUM"|"HARD"; solutionContent: string; subtopicSlugs: string[]; }
interface FR { content: string; marks: number; difficulty: "EASY"|"MEDIUM"|"HARD"; solutionContent: string; subtopicSlugs: string[]; }
const P = "type-i-errors";
const m = (c: string, o: [string,string,string,string], k: "A"|"B"|"C"|"D", d: "EASY"|"MEDIUM"|"HARD", s: string, sec: string[] = []): MCQ =>
  ({ content: c, optionA: o[0], optionB: o[1], optionC: o[2], optionD: o[3], correctOption: k, marks: 1, difficulty: d, solutionContent: s, subtopicSlugs: [P, ...sec] });
const sq = (c: string, marks: number, d: "EASY"|"MEDIUM"|"HARD", s: string, sec: string[] = []): FR =>
  ({ content: c, marks, difficulty: d, solutionContent: s, subtopicSlugs: [P, ...sec] });

const mcq: MCQ[] = [
  m("A Type I error is:", ["rejecting a true $H_0$", "failing to reject a false $H_0$", "accepting $H_1$ when true", "not deciding"], "A", "EASY", "Definition. **Answer: A**"),
  m("$P(\\text{Type I error}) =$:", ["$\\alpha$", "$1 - \\alpha$", "$\\beta$", "$p$"], "A", "EASY", "By definition, $\\alpha$ is Type I error rate. **Answer: A**"),
  m("Decreasing $\\alpha$:", ["increases Type I error", "decreases Type I error", "increases power", "no effect"], "B", "EASY", "$\\alpha = P(\\text{Type I})$. **Answer: B**"),
  m("Type II error is:", ["rejecting true $H_0$", "failing to reject false $H_0$", "always equals Type I", "$p$-value"], "B", "MEDIUM", "Definition. **Answer: B**"),
  m("Power of a test = $1 -$:", ["$\\alpha$", "$\\beta$", "$p$", "$P(H_0)$"], "B", "MEDIUM", "Power = $1 - P(\\text{Type II})$. **Answer: B**"),
  m("If $\\alpha = 0.05$, then over many tests where $H_0$ is true:", ["5% reject $H_0$", "95% reject $H_0$", "5% accept $H_1$ correctly", "5% Type II error"], "A", "MEDIUM", "On average 5% false rejections. **Answer: A**"),
  m("Trade-off: smaller $\\alpha$ generally:", ["lowers $\\beta$", "raises $\\beta$", "no effect on $\\beta$", "always raises power"], "B", "HARD", "Inverse relationship in general (sample size fixed). **Answer: B**"),
  m("In a medical screening, calling a healthy person 'sick' is a:", ["Type I error", "Type II error", "Power", "True negative"], "A", "HARD", "Reject $H_0$=healthy when actually healthy. **Answer: A**"),
];

const shortAnswer: FR[] = [
  sq("Define Type I and Type II errors.", 2, "EASY", "*Step 1 (1 mark):* Type I: reject $H_0$ when $H_0$ is true.\n*Step 2 (1 mark):* Type II: fail to reject $H_0$ when $H_0$ is false."),
  sq("A test has $\\alpha = 0.05$. What does this tell you about Type I error probability?", 1, "EASY", "$P(\\text{Type I error}) = 0.05$ — 5% chance of incorrectly rejecting a true null."),
  sq("State the conclusion (Type I error or correct decision) for each: $H_0$ true and reject; $H_0$ false and reject.", 2, "MEDIUM", "*Step 1 (1 mark):* $H_0$ true, reject → Type I error.\n*Step 2 (1 mark):* $H_0$ false, reject → correct decision (power)."),
  sq("Why might a researcher choose $\\alpha = 0.01$ instead of $0.05$?", 2, "MEDIUM", "*Step 1 (1 mark):* To reduce probability of Type I error (false discovery).\n*Step 2 (1 mark):* Especially important when consequences of falsely rejecting $H_0$ are severe (e.g. claiming a new drug works when it doesn't)."),
  sq("In a two-tailed $z$-test at $\\alpha = 0.05$, critical values are $\\pm z^*$. Find $z^*$.", 1, "MEDIUM", "$z^* = 1.96$ (so reject $H_0$ if $|z| > 1.96$)."),
];

const extendedAnswer: FR[] = [
  sq(`A quality control engineer tests batches with $H_0: \\mu = 50$ vs $H_1: \\mu \\ne 50$ at $\\alpha = 0.05$.

**a.** Describe a Type I error in this context. (2 marks)

**b.** Describe a Type II error in this context. (2 marks)

**c.** Which error type is worse if rejecting a batch incorrectly costs more than missing a defective batch? Justify. (3 marks)`, 7, "MEDIUM",
    `**a. (2 marks)**
*Step 1 (1 mark):* Reject $H_0$ when actually $\\mu = 50$.
*Step 2 (1 mark):* Reject a good batch as defective; called a 'false alarm'.

**b. (2 marks)**
*Step 1 (1 mark):* Fail to reject $H_0$ when actually $\\mu \\ne 50$.
*Step 2 (1 mark):* Accept a defective batch as if it were good.

**c. (3 marks)**
*Step 1 (1 mark):* If false rejection (Type I) is more costly, reduce $\\alpha$.
*Step 2 (1 mark):* This makes it harder to reject $H_0$, lowering the false-rejection rate.
*Step 3 (1 mark):* Trade-off: this increases $\\beta$ (Type II), but the cost asymmetry justifies it.`),
];

const out = { mcq, shortAnswer, extendedAnswer, extendedResponse: [] };
fs.writeFileSync("scripts/output/qset-specialist-type-i.json", JSON.stringify(out, null, 2) + "\n");
console.log(`Wrote ${mcq.length} MCQ, ${shortAnswer.length} SHORT, ${extendedAnswer.length} EXT_ANS to scripts/output/qset-specialist-type-i.json`);
