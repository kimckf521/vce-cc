/** Specialist core-drill: Number Systems (Real, Rational, Irrational). */
import * as fs from "fs";

interface MCQ { content: string; optionA: string; optionB: string; optionC: string; optionD: string; correctOption: "A"|"B"|"C"|"D"; marks: number; difficulty: "EASY"|"MEDIUM"|"HARD"; solutionContent: string; subtopicSlugs: string[]; }
interface FR { content: string; marks: number; difficulty: "EASY"|"MEDIUM"|"HARD"; solutionContent: string; subtopicSlugs: string[]; }
const P = "number-systems-real-rational-irrational";
const m = (c: string, o: [string,string,string,string], k: "A"|"B"|"C"|"D", d: "EASY"|"MEDIUM"|"HARD", s: string, sec: string[] = []): MCQ =>
  ({ content: c, optionA: o[0], optionB: o[1], optionC: o[2], optionD: o[3], correctOption: k, marks: 1, difficulty: d, solutionContent: s, subtopicSlugs: [P, ...sec] });
const sq = (c: string, marks: number, d: "EASY"|"MEDIUM"|"HARD", s: string, sec: string[] = []): FR =>
  ({ content: c, marks, difficulty: d, solutionContent: s, subtopicSlugs: [P, ...sec] });

const mcq: MCQ[] = [
  m("Which of the following is irrational?", ["$\\dfrac{22}{7}$", "$0.\\overline{12}$", "$\\sqrt 5$", "$0$"], "C", "EASY",
    "$\\sqrt 5$ cannot be written as a ratio of integers. **Answer: C**"),
  m("$\\sqrt 9$ is:", ["irrational", "rational and an integer", "rational, not an integer", "not real"], "B", "EASY",
    "$\\sqrt 9 = 3$, an integer. **Answer: B**"),
  m("Which set is $\\{1, 2, 3, \\ldots\\}$?", ["$\\mathbb{R}$", "$\\mathbb{Q}$", "$\\mathbb{Z}$", "$\\mathbb{N}$"], "D", "EASY",
    "Positive integers are the natural numbers $\\mathbb{N}$. **Answer: D**"),
  m("$0.\\overline{3}$ equals which fraction?", ["$\\dfrac{3}{10}$", "$\\dfrac{1}{3}$", "$\\dfrac{3}{100}$", "irrational"], "B", "EASY",
    "Recurring decimal: $0.\\overline 3 = 1/3$. **Answer: B**"),
  m("The number $\\pi - \\pi$ equals 0, hence:", ["$\\pi - \\pi$ is irrational", "$\\pi - \\pi$ is rational", "$\\pi - \\pi$ is not real", "$\\pi$ is rational"], "B", "MEDIUM",
    "$\\pi - \\pi = 0 \\in \\mathbb{Q}$. The sum/difference of two irrationals can be rational. **Answer: B**"),
  m("The sum of a rational and an irrational number is:", ["always rational", "always irrational", "may be either", "always an integer"], "B", "MEDIUM",
    "If $r$ rational and $x$ irrational, then $r + x$ irrational (otherwise $x = (r+x) - r$ rational, contradiction). **Answer: B**"),
  m("Which of the following is a complete subset relation?", ["$\\mathbb{R} \\subset \\mathbb{Q}$", "$\\mathbb{Z} \\subset \\mathbb{N}$", "$\\mathbb{Q} \\subset \\mathbb{R}$", "$\\mathbb{N} \\subset \\mathbb{Q} \\not\\subset \\mathbb{R}$"], "C", "MEDIUM",
    "Standard hierarchy: $\\mathbb{N} \\subset \\mathbb{Z} \\subset \\mathbb{Q} \\subset \\mathbb{R}$. **Answer: C**"),
  m("$\\sqrt 2 + 3$ is:", ["rational", "irrational", "an integer", "complex"], "B", "MEDIUM",
    "Rational + irrational = irrational. **Answer: B**"),
  m("Which is NOT closed under multiplication?", ["$\\mathbb{Z}$", "$\\mathbb{Q}$", "$\\mathbb{R}$", "irrationals (\\mathbb{R}\\setminus\\mathbb{Q})"], "D", "HARD",
    "Counterexample: $\\sqrt 2 \\cdot \\sqrt 2 = 2$, which is rational. So irrationals are not closed. **Answer: D**"),
  m("$0.121121112\\ldots$ (one more 1 each time) is:", ["rational", "irrational", "an integer", "undefined"], "B", "HARD",
    "Non-recurring, non-terminating decimal → irrational. **Answer: B**"),
  m("If $a, b \\in \\mathbb{Q}$ and $\\sqrt 2 a + b = 0$ with $a \\ne 0$, then:", ["$\\sqrt 2$ is rational", "contradiction", "$b = \\sqrt 2 a$ always works", "$a = 0$ forced"], "B", "HARD",
    "$\\sqrt 2 = -b/a \\in \\mathbb{Q}$, contradicting $\\sqrt 2 \\notin \\mathbb{Q}$. **Answer: B**"),
  m("The decimal expansion of $\\dfrac{1}{7}$ has period:", ["1", "3", "6", "7"], "C", "HARD",
    "$1/7 = 0.\\overline{142857}$, period 6. **Answer: C**"),
];

const shortAnswer: FR[] = [
  sq("Classify each: $\\sqrt{16}$, $\\dfrac{5}{2}$, $\\sqrt 3$, $\\pi$. (rational/irrational/integer)", 2, "EASY",
    "*Step 1 (1 mark):* $\\sqrt{16} = 4$ integer (and rational); $\\dfrac{5}{2}$ rational, not integer.\n*Step 2 (1 mark):* $\\sqrt 3$ irrational (non-square); $\\pi$ irrational."),
  sq("Express $0.\\overline{45}$ as a fraction in lowest terms.", 2, "MEDIUM",
    "*Step 1 (1 mark):* Let $x = 0.\\overline{45}$, then $100x = 45.\\overline{45}$, so $99x = 45$.\n*Step 2 (1 mark):* $x = \\dfrac{45}{99} = \\dfrac{5}{11}$."),
  sq("Prove $\\sqrt 2$ is irrational.", 3, "HARD",
    "*Step 1 (1 mark):* Suppose $\\sqrt 2 = p/q$ with $\\gcd(p,q) = 1$. Then $p^2 = 2q^2$, so $p^2$ even, hence $p$ even.\n*Step 2 (1 mark):* Write $p = 2k$: $4k^2 = 2q^2 \\Rightarrow q^2 = 2k^2$, so $q$ even.\n*Step 3 (1 mark):* But $p, q$ both even contradicts $\\gcd(p,q)=1$. Hence $\\sqrt 2 \\notin \\mathbb{Q}$."),
  sq("Show that $3\\sqrt 2 + 1$ is irrational, given $\\sqrt 2$ is irrational.", 2, "MEDIUM",
    "*Step 1 (1 mark):* Suppose $3\\sqrt 2 + 1 = r \\in \\mathbb{Q}$. Then $\\sqrt 2 = (r-1)/3$.\n*Step 2 (1 mark):* RHS is rational, contradicting $\\sqrt 2 \\notin \\mathbb{Q}$."),
  sq("Show by example that the product of two irrational numbers may be rational.", 2, "MEDIUM",
    "*Step 1 (1 mark):* Take $\\sqrt 2$ and $\\sqrt 2$, both irrational.\n*Step 2 (1 mark):* Product $= 2 \\in \\mathbb{Q}$. So irrationals are not closed under multiplication."),
  sq("Express $0.5\\overline{3}$ as a fraction.", 2, "HARD",
    "*Step 1 (1 mark):* Let $x = 0.5\\overline 3$. Then $10x = 5.\\overline 3$ and $100x = 53.\\overline 3$, so $90 x = 48$.\n*Step 2 (1 mark):* $x = 48/90 = 8/15$."),
  sq("Give a rational number between $\\sqrt 2$ and $\\sqrt 3$.", 2, "MEDIUM",
    "*Step 1 (1 mark):* Approximate: $\\sqrt 2 \\approx 1.414$, $\\sqrt 3 \\approx 1.732$.\n*Step 2 (1 mark):* Take $\\dfrac{3}{2} = 1.5$. Then $1.414 < 1.5 < 1.732$ ✓."),
  sq("State whether the following is closed under addition: the set of irrational numbers. Justify.", 2, "HARD",
    "*Step 1 (1 mark):* NOT closed.\n*Step 2 (1 mark):* Counter: $\\sqrt 2 + (-\\sqrt 2) = 0 \\in \\mathbb{Q}$. Both summands irrational but sum rational."),
];

const out = { mcq, shortAnswer, extendedAnswer: [], extendedResponse: [] };
fs.writeFileSync("scripts/output/qset-specialist-number-systems.json", JSON.stringify(out, null, 2) + "\n");
console.log(`Wrote ${mcq.length} MCQ, ${shortAnswer.length} SHORT to scripts/output/qset-specialist-number-systems.json`);
