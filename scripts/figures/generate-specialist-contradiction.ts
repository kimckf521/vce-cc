/** Specialist ext-fit: Proof by Contradiction. */
import * as fs from "fs";
interface MCQ { content: string; optionA: string; optionB: string; optionC: string; optionD: string; correctOption: "A"|"B"|"C"|"D"; marks: number; difficulty: "EASY"|"MEDIUM"|"HARD"; solutionContent: string; subtopicSlugs: string[]; }
interface FR { content: string; marks: number; difficulty: "EASY"|"MEDIUM"|"HARD"; solutionContent: string; subtopicSlugs: string[]; }
const P = "proof-by-contradiction";
const m = (c: string, o: [string,string,string,string], k: "A"|"B"|"C"|"D", d: "EASY"|"MEDIUM"|"HARD", s: string, sec: string[] = []): MCQ =>
  ({ content: c, optionA: o[0], optionB: o[1], optionC: o[2], optionD: o[3], correctOption: k, marks: 1, difficulty: d, solutionContent: s, subtopicSlugs: [P, ...sec] });
const sq = (c: string, marks: number, d: "EASY"|"MEDIUM"|"HARD", s: string, sec: string[] = []): FR =>
  ({ content: c, marks, difficulty: d, solutionContent: s, subtopicSlugs: [P, ...sec] });

const mcq: MCQ[] = [
  m("In proof by contradiction, we assume:", ["$P$ true", "$P$ false (negation)", "nothing", "$P$ undefined"], "B", "EASY", "Assume $\\neg P$ and derive contradiction. **Answer: B**"),
  m("Goal: prove $P$. Assume $\\neg P$, derive contradiction. This proves:", ["$\\neg P$", "$P$", "neither", "both"], "B", "EASY", "Contradiction → original assumption false. **Answer: B**"),
  m("A contradiction has the form:", ["$Q \\land \\neg Q$", "$Q \\lor \\neg Q$", "$Q \\Rightarrow Q$", "always false"], "A", "EASY", "Both Q and $\\neg Q$. **Answer: A**"),
  m("'There is no largest natural number' is usually proved by:", ["direct", "induction", "contradiction (suppose $N$ largest, then $N+1$ larger)", "contrapositive"], "C", "MEDIUM", "Classic example. **Answer: C**"),
  m("$\\sqrt 2$ irrational is proved by contradiction starting from:", ["$\\sqrt 2$ irrational", "$\\sqrt 2 = p/q$ rational, gcd 1", "$\\sqrt 2 = 1$", "$\\sqrt 2 > 0$"], "B", "MEDIUM", "Assume rational form. **Answer: B**"),
  m("Negation of '$\\forall x, P(x)$' is:", ["$\\forall x, \\neg P(x)$", "$\\exists x, \\neg P(x)$", "$\\forall x, P(x)$", "true"], "B", "MEDIUM", "Standard quantifier negation. **Answer: B**"),
  m("Proof by contradiction is sometimes called:", ["reductio ad absurdum", "contrapositive", "induction", "deduction"], "A", "HARD", "Latin term. **Answer: A**"),
  m("Why does contradiction work logically?", ["true statements never imply false", "axioms allow it", "$P$ vs $\\neg P$ is tautology", "all of the above"], "D", "HARD", "All true. **Answer: D**"),
];

const shortAnswer: FR[] = [
  sq("Negate the statement: 'For all integers $n$, $n^2 \\ge 0$'.", 1, "EASY", "There exists an integer $n$ such that $n^2 < 0$."),
  sq("Prove by contradiction: there is no smallest positive rational number.", 3, "MEDIUM", "*Step 1 (1 mark):* Suppose $q > 0$ is the smallest positive rational.\n*Step 2 (1 mark):* Then $q/2$ is also positive rational and $q/2 < q$.\n*Step 3 (1 mark):* Contradicts the minimality of $q$. Hence no smallest exists."),
  sq("Prove by contradiction: if $n^2$ is even, then $n$ is even.", 3, "MEDIUM", "*Step 1 (1 mark):* Suppose $n$ is odd, write $n = 2k + 1$.\n*Step 2 (1 mark):* Then $n^2 = 4k^2 + 4k + 1 = 2(2k^2 + 2k) + 1$ is odd.\n*Step 3 (1 mark):* Contradicts $n^2$ even. Hence $n$ even."),
  sq("Show by contradiction that $\\log_2 3$ is irrational.", 3, "HARD", "*Step 1 (1 mark):* Suppose $\\log_2 3 = p/q$, $p, q \\in \\mathbb{Z}^+$.\n*Step 2 (1 mark):* Then $2^{p/q} = 3$, so $2^p = 3^q$.\n*Step 3 (1 mark):* But $2^p$ even (for $p \\ge 1$), $3^q$ odd. Contradiction. So $\\log_2 3$ irrational."),
  sq("Negate: 'There exists an integer $n$ such that $n > 100$'.", 1, "EASY", "For all integers $n$, $n \\le 100$."),
];

const extendedAnswer: FR[] = [
  sq(`Prove by contradiction that $\\sqrt 2$ is irrational.

**a.** State the negation of the claim. (1 mark)

**b.** Set up the form $\\sqrt 2 = p/q$ with $\\gcd(p, q) = 1$. (1 mark)

**c.** Derive $p^2 = 2q^2$ and conclude $p$ is even. (2 marks)

**d.** Conclude $q$ is also even and derive the contradiction. (3 marks)`, 7, "MEDIUM",
    `**a. (1 mark)** Assume for contradiction that $\\sqrt 2$ is rational.

**b. (1 mark)** Then $\\sqrt 2 = p/q$ for some integers $p, q$ with $q \\ne 0$ and $\\gcd(p, q) = 1$ (lowest terms).

**c. (2 marks)**
*Step 1 (1 mark):* Squaring: $2 = p^2/q^2 \\Rightarrow p^2 = 2q^2$.
*Step 2 (1 mark):* So $p^2$ is even. Hence $p$ is even (proved separately by contradiction or direct contrapositive).

**d. (3 marks)**
*Step 1 (1 mark):* Write $p = 2k$. Then $(2k)^2 = 2q^2 \\Rightarrow 4k^2 = 2q^2 \\Rightarrow q^2 = 2k^2$.
*Step 2 (1 mark):* So $q^2$ is even, hence $q$ is even.
*Step 3 (1 mark):* But then both $p$ and $q$ are even, contradicting $\\gcd(p, q) = 1$. Hence $\\sqrt 2$ is irrational.`),
];

const out = { mcq, shortAnswer, extendedAnswer, extendedResponse: [] };
fs.writeFileSync("scripts/output/qset-specialist-contradiction.json", JSON.stringify(out, null, 2) + "\n");
console.log(`Wrote ${mcq.length} MCQ, ${shortAnswer.length} SHORT, ${extendedAnswer.length} EXT_ANS to scripts/output/qset-specialist-contradiction.json`);
