/** Specialist modelling-rich: Mathematical Induction. */
import * as fs from "fs";
interface MCQ { content: string; optionA: string; optionB: string; optionC: string; optionD: string; correctOption: "A"|"B"|"C"|"D"; marks: number; difficulty: "EASY"|"MEDIUM"|"HARD"; solutionContent: string; subtopicSlugs: string[]; }
interface FR { content: string; marks: number; difficulty: "EASY"|"MEDIUM"|"HARD"; solutionContent: string; subtopicSlugs: string[]; }
const P = "mathematical-induction";
const m = (c: string, o: [string,string,string,string], k: "A"|"B"|"C"|"D", d: "EASY"|"MEDIUM"|"HARD", s: string, sec: string[] = []): MCQ =>
  ({ content: c, optionA: o[0], optionB: o[1], optionC: o[2], optionD: o[3], correctOption: k, marks: 1, difficulty: d, solutionContent: s, subtopicSlugs: [P, ...sec] });
const sq = (c: string, marks: number, d: "EASY"|"MEDIUM"|"HARD", s: string, sec: string[] = []): FR =>
  ({ content: c, marks, difficulty: d, solutionContent: s, subtopicSlugs: [P, ...sec] });

const mcq: MCQ[] = [
  m("Mathematical induction proves statements indexed by:", ["real numbers", "natural numbers", "complex numbers", "integers only"], "B", "EASY", "$n \\in \\mathbb{N}$. **Answer: B**"),
  m("Steps of induction:", ["base + step", "base + induction hypothesis + induction step", "step + base", "hypothesis only"], "B", "EASY", "Three parts. **Answer: B**"),
  m("For $\\sum_{k=1}^n k = n(n+1)/2$, base case $n = 1$ gives:", ["$1 = 1$", "$1 = 2$", "$0 = 0$", "$1 = 1/2$"], "A", "EASY", "LHS = 1, RHS = $1 \\cdot 2/2 = 1$. **Answer: A**"),
  m("Inductive hypothesis: assume true for $n = k$, then prove:", ["$n = k-1$", "$n = k+1$", "$n = 0$", "for all $n$"], "B", "MEDIUM", "Show implication $P(k) \\Rightarrow P(k+1)$. **Answer: B**"),
  m("To prove $2^n > n^2$ for $n \\ge 5$, base case is:", ["$n = 1$", "$n = 5$", "$n = 0$", "$n = 4$"], "B", "MEDIUM", "Start at smallest valid value. **Answer: B**"),
  m("If induction step works but base case fails, can statement still be true?", ["yes for all $n$", "no, statement false for base", "depends", "always yes"], "B", "MEDIUM", "Without base, induction proves nothing. **Answer: B**"),
  m("Strong induction differs from regular induction in:", ["base case", "assumes $P(1), \\ldots, P(k)$ all true", "uses $\\mathbb{Z}$ not $\\mathbb{N}$", "no induction step"], "B", "HARD", "Strong induction assumes all preceding cases. **Answer: B**"),
  m("To prove '$3^n - 1$ divisible by 2', the induction step uses:", ["$3^{k+1} - 1 = 3(3^k - 1) + 2$", "$3^{k+1} - 1 = 3^k - 1$", "no algebra", "contradiction"], "A", "HARD", "Algebraic manipulation linking $P(k)$ to $P(k+1)$. **Answer: A**"),
];

const shortAnswer: FR[] = [
  sq("Verify base case for $\\sum_{k=1}^n k^2 = \\dfrac{n(n+1)(2n+1)}{6}$ when $n = 1$.", 1, "EASY", "LHS = $1$. RHS = $1 \\cdot 2 \\cdot 3/6 = 1$. Equal. ✓"),
  sq("State the three steps of proof by induction.", 2, "EASY", "*Step 1 (1 mark):* Base case: verify $P(1)$ (or smallest applicable $n$).\n*Step 2 (1 mark):* Inductive step: assume $P(k)$, prove $P(k+1)$."),
  sq("Express the inductive hypothesis for proving $1 + 2 + \\ldots + n = n(n+1)/2$.", 1, "EASY", "Assume $1 + 2 + \\ldots + k = k(k+1)/2$ holds for some $k \\ge 1$."),
  sq("If $P(k)$ holds: $5^k - 1$ divisible by 4, show $P(k+1)$ holds.", 3, "MEDIUM", "*Step 1 (1 mark):* $5^{k+1} - 1 = 5 \\cdot 5^k - 1 = 5(5^k - 1) + 4$.\n*Step 2 (1 mark):* By hypothesis $5^k - 1 = 4m$ for some integer $m$.\n*Step 3 (1 mark):* So $5^{k+1} - 1 = 5(4m) + 4 = 4(5m + 1)$, divisible by 4 ✓."),
  sq("Prove the base case for '$n! > 2^n$ when $n \\ge 4$'.", 2, "MEDIUM", "*Step 1 (1 mark):* $n = 4$: LHS $= 4! = 24$.\n*Step 2 (1 mark):* RHS $= 2^4 = 16$. $24 > 16$ ✓."),
];

const extendedAnswer: FR[] = [
  sq(`Prove by induction that $1 + 3 + 5 + \\ldots + (2n - 1) = n^2$ for all $n \\ge 1$.

**a.** Base case. (1 mark)

**b.** State the inductive hypothesis. (1 mark)

**c.** Prove the inductive step. (4 marks)

**d.** Conclude. (1 mark)`, 7, "MEDIUM",
    `**a. (1 mark)** $n = 1$: LHS $= 1 = 1^2$ = RHS. ✓

**b. (1 mark)** Assume $1 + 3 + \\ldots + (2k - 1) = k^2$ for some $k \\ge 1$.

**c. (4 marks)**
*Step 1 (1 mark):* Want to show $1 + 3 + \\ldots + (2k - 1) + (2(k+1) - 1) = (k+1)^2$.
*Step 2 (1 mark):* LHS $= k^2 + (2k + 1)$ (using hypothesis).
*Step 3 (1 mark):* $= k^2 + 2k + 1$.
*Step 4 (1 mark):* $= (k+1)^2$ ✓.

**d. (1 mark)** By induction, the result holds for all $n \\ge 1$.`),

  sq(`Prove by induction that $7^n - 1$ is divisible by 6 for all $n \\ge 1$.

**a.** Base case. (1 mark)

**b.** Inductive hypothesis. (1 mark)

**c.** Inductive step. (4 marks)

**d.** Conclusion. (1 mark)`, 7, "MEDIUM",
    `**a. (1 mark)** $n = 1$: $7 - 1 = 6$, divisible by 6. ✓

**b. (1 mark)** Assume $7^k - 1 = 6m$ for some integer $m$.

**c. (4 marks)**
*Step 1 (1 mark):* Consider $7^{k+1} - 1$.
*Step 2 (1 mark):* $= 7 \\cdot 7^k - 1 = 7(7^k - 1) + 6$.
*Step 3 (1 mark):* $= 7(6m) + 6$ (using hypothesis).
*Step 4 (1 mark):* $= 6(7m + 1)$, divisible by 6.

**d. (1 mark)** Hence by induction, $7^n - 1$ is divisible by 6 for all $n \\ge 1$.`),
];

const extendedResponse: FR[] = [
  sq(`**a.** Prove by induction that $\\sum_{k=1}^n k^3 = \\left[\\dfrac{n(n+1)}{2}\\right]^2$ for all positive integers $n$. Set out base case, inductive hypothesis, inductive step, conclusion clearly. (8 marks)

**b.** Use the result to find $1^3 + 2^3 + \\ldots + 10^3$. (1 mark)

**c.** State the relationship between $\\sum k^3$ and $\\sum k$. (1 mark)`, 10, "HARD",
    `**a. (8 marks)**

*Base case (1 mark):* $n = 1$: LHS $= 1$. RHS $= (1 \\cdot 2/2)^2 = 1$. ✓

*Hypothesis (1 mark):* Assume $\\sum_{k=1}^m k^3 = \\left[m(m+1)/2\\right]^2$ for some $m \\ge 1$.

*Step (5 marks):*
*Step 1 (1 mark):* Want $\\sum_{k=1}^{m+1} k^3 = \\left[(m+1)(m+2)/2\\right]^2$.
*Step 2 (1 mark):* LHS $= \\sum_{k=1}^m k^3 + (m+1)^3 = \\left[m(m+1)/2\\right]^2 + (m+1)^3$ (by hypothesis).
*Step 3 (1 mark):* Factor $(m+1)^2$: $(m+1)^2 \\left[m^2/4 + (m+1)\\right]$.
*Step 4 (1 mark):* Inside brackets: $\\dfrac{m^2 + 4m + 4}{4} = \\dfrac{(m+2)^2}{4}$.
*Step 5 (1 mark):* So LHS $= (m+1)^2 \\cdot (m+2)^2/4 = \\left[(m+1)(m+2)/2\\right]^2$ = RHS. ✓

*Conclusion (1 mark):* By induction, $\\sum_{k=1}^n k^3 = [n(n+1)/2]^2$ for all $n \\ge 1$.

**b. (1 mark)** $\\sum_{k=1}^{10} k^3 = (10 \\cdot 11/2)^2 = 55^2 = 3025$.

**c. (1 mark)** $\\sum k^3 = \\left(\\sum k\\right)^2$ — the sum of cubes equals the square of the sum of integers.`),

  sq(`Prove by induction that $2^n > n^2$ for all integers $n \\ge 5$.

**a.** Base case. (1 mark)

**b.** Inductive hypothesis. (1 mark)

**c.** Inductive step (use $2^{k+1} = 2 \\cdot 2^k$ and the bound $k^2 > 2k + 1$ for $k \\ge 5$). (6 marks)

**d.** Conclusion. (1 mark)

**e.** Why is the base case $n = 5$ rather than $n = 1$? (2 marks)`, 11, "HARD",
    `**a. (1 mark)** $n = 5$: $2^5 = 32 > 25 = 5^2$. ✓

**b. (1 mark)** Assume $2^k > k^2$ for some $k \\ge 5$.

**c. (6 marks)**
*Step 1 (1 mark):* Want to show $2^{k+1} > (k+1)^2$.
*Step 2 (1 mark):* $(k+1)^2 = k^2 + 2k + 1$.
*Step 3 (1 mark):* $2^{k+1} = 2 \\cdot 2^k > 2 k^2$ (using hypothesis).
*Step 4 (1 mark):* So enough to show $2k^2 \\ge k^2 + 2k + 1$, i.e. $k^2 \\ge 2k + 1$.
*Step 5 (1 mark):* For $k \\ge 5$: $k^2 - 2k - 1 = (k-1)^2 - 2 \\ge 16 - 2 = 14 > 0$. ✓
*Step 6 (1 mark):* Hence $2^{k+1} > 2k^2 \\ge k^2 + 2k + 1 = (k+1)^2$.

**d. (1 mark)** By induction, $2^n > n^2$ for all $n \\ge 5$.

**e. (2 marks)**
*Step 1 (1 mark):* At $n = 2$: $4 = 4$, not strictly greater; at $n = 3$: $8 < 9$, fails; at $n = 4$: $16 = 16$, fails.
*Step 2 (1 mark):* The inequality first holds at $n = 5$ and continues for $n \\ge 5$.`),
];

const out = { mcq, shortAnswer, extendedAnswer, extendedResponse };
fs.writeFileSync("scripts/output/qset-specialist-induction.json", JSON.stringify(out, null, 2) + "\n");
console.log(`Wrote ${mcq.length} MCQ, ${shortAnswer.length} SHORT, ${extendedAnswer.length} EXT_ANS, ${extendedResponse.length} EXT_RESP to scripts/output/qset-specialist-induction.json`);
