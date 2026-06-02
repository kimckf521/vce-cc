/** Specialist modelling-rich: Linear Combinations of Random Variables. */
import * as fs from "fs";
interface MCQ { content: string; optionA: string; optionB: string; optionC: string; optionD: string; correctOption: "A"|"B"|"C"|"D"; marks: number; difficulty: "EASY"|"MEDIUM"|"HARD"; solutionContent: string; subtopicSlugs: string[]; }
interface FR { content: string; marks: number; difficulty: "EASY"|"MEDIUM"|"HARD"; solutionContent: string; subtopicSlugs: string[]; }
const P = "linear-combinations-of-random-variables";
const m = (c: string, o: [string,string,string,string], k: "A"|"B"|"C"|"D", d: "EASY"|"MEDIUM"|"HARD", s: string, sec: string[] = []): MCQ =>
  ({ content: c, optionA: o[0], optionB: o[1], optionC: o[2], optionD: o[3], correctOption: k, marks: 1, difficulty: d, solutionContent: s, subtopicSlugs: [P, ...sec] });
const sq = (c: string, marks: number, d: "EASY"|"MEDIUM"|"HARD", s: string, sec: string[] = []): FR =>
  ({ content: c, marks, difficulty: d, solutionContent: s, subtopicSlugs: [P, ...sec] });

const mcq: MCQ[] = [
  m("$E(aX + b) =$:", ["$aE(X) + b$", "$aE(X)$", "$E(X) + b$", "$ab E(X)$"], "A", "EASY", "Linearity of expectation. **Answer: A**"),
  m("$\\text{Var}(aX + b) =$:", ["$a^2\\text{Var}(X) + b^2$", "$a^2 \\text{Var}(X)$", "$a \\text{Var}(X) + b$", "$\\text{Var}(X)$"], "B", "EASY", "Constants shift mean only, scaling affects variance by $a^2$. **Answer: B**"),
  m("If $X, Y$ independent: $E(X + Y) =$:", ["$E(X) + E(Y)$", "$E(X) E(Y)$", "$E(X) - E(Y)$", "depends on correlation"], "A", "EASY", "Linearity. **Answer: A**"),
  m("If $X, Y$ independent: $\\text{Var}(X + Y) =$:", ["$\\text{Var}(X) + \\text{Var}(Y)$", "$\\text{Var}(X) - \\text{Var}(Y)$", "$0$", "$\\text{Var}(X)\\text{Var}(Y)$"], "A", "EASY", "Var of sum = sum of Var (independence). **Answer: A**"),
  m("$\\text{Var}(X - Y)$ for independent $X, Y$:", ["$\\text{Var}(X) - \\text{Var}(Y)$", "$\\text{Var}(X) + \\text{Var}(Y)$", "$0$", "$\\text{Var}(X)\\text{Var}(Y)$"], "B", "MEDIUM", "$\\text{Var}(-Y) = (-1)^2\\text{Var}(Y) = \\text{Var}(Y)$. **Answer: B**"),
  m("$X \\sim N(5, 4)$, $Y \\sim N(3, 9)$ independent. $X + Y \\sim$:", ["$N(8, 13)$", "$N(8, 5)$", "$N(8, 36)$", "$N(15, 13)$"], "A", "MEDIUM", "Means add: $5+3=8$; variances add (independent): $4+9=13$. **Answer: A**"),
  m("If $X \\sim N(\\mu_1, \\sigma_1^2)$, $Y \\sim N(\\mu_2, \\sigma_2^2)$ independent: $X - Y \\sim$:", ["$N(\\mu_1 - \\mu_2, \\sigma_1^2 - \\sigma_2^2)$", "$N(\\mu_1 - \\mu_2, \\sigma_1^2 + \\sigma_2^2)$", "$N(0, \\sigma_1^2)$", "$N(\\mu_1, \\sigma_1^2)$"], "B", "HARD", "Variances always add. **Answer: B**"),
  m("$X \\sim N(0, 1)$. $2X \\sim$:", ["$N(0, 2)$", "$N(0, 4)$", "$N(0, 1)$", "$N(2, 1)$"], "B", "HARD", "$\\text{Var}(2X) = 4 \\cdot 1 = 4$. **Answer: B**"),
];

const shortAnswer: FR[] = [
  sq("$X \\sim N(10, 4)$. Find $E(3X + 2)$ and $\\text{Var}(3X + 2)$.", 2, "EASY", "*Step 1 (1 mark):* $E = 3(10) + 2 = 32$.\n*Step 2 (1 mark):* $\\text{Var} = 9(4) = 36$."),
  sq("$X \\sim N(5, 4)$ and $Y \\sim N(7, 9)$ are independent. Find the distribution of $X + Y$.", 2, "EASY", "*Step 1 (1 mark):* Mean: $5 + 7 = 12$.\n*Step 2 (1 mark):* Variance: $4 + 9 = 13$. So $X + Y \\sim N(12, 13)$."),
  sq("$X_1, X_2, X_3$ iid $N(10, 4)$. Find the distribution of $X_1 + X_2 + X_3$.", 2, "MEDIUM", "*Step 1 (1 mark):* Mean: $3 \\cdot 10 = 30$.\n*Step 2 (1 mark):* Variance: $3 \\cdot 4 = 12$. So $\\sum X_i \\sim N(30, 12)$."),
  sq("$X \\sim N(50, 25)$, $Y \\sim N(40, 16)$ indep. Find $P(X > Y)$.", 3, "MEDIUM", "*Step 1 (1 mark):* $X - Y \\sim N(10, 41)$.\n*Step 2 (1 mark):* $P(X > Y) = P(X - Y > 0)$.\n*Step 3 (1 mark):* Standardise: $z = (0 - 10)/\\sqrt{41} \\approx -1.562$. $P(Z > -1.562) \\approx 0.941$."),
  sq("$X \\sim N(\\mu, \\sigma^2)$. Compute $E(2X - 3)$ and $\\text{Var}(2X - 3)$ in terms of $\\mu, \\sigma$.", 2, "MEDIUM", "*Step 1 (1 mark):* $E(2X - 3) = 2\\mu - 3$.\n*Step 2 (1 mark):* $\\text{Var}(2X - 3) = 4\\sigma^2$."),
];

const extendedAnswer: FR[] = [
  sq(`Three machines produce items independently. Their masses $X_1, X_2, X_3$ are normally distributed with means $\\mu_i$ and variances $\\sigma_i^2$ as follows: $X_1 \\sim N(10, 4)$, $X_2 \\sim N(20, 9)$, $X_3 \\sim N(15, 16)$.

**a.** Find the distribution of $T = X_1 + X_2 + X_3$. (3 marks)

**b.** Find $P(T > 50)$. (3 marks)

**c.** Find the distribution of $\\bar X = T/3$. (2 marks)`, 8, "MEDIUM",
    `**a. (3 marks)**
*Step 1 (1 mark):* Mean: $10 + 20 + 15 = 45$.
*Step 2 (1 mark):* Variance (sum of independent): $4 + 9 + 16 = 29$.
*Step 3 (1 mark):* $T \\sim N(45, 29)$.

**b. (3 marks)**
*Step 1 (1 mark):* SD: $\\sigma_T = \\sqrt{29} \\approx 5.385$.
*Step 2 (1 mark):* $z = (50 - 45)/5.385 \\approx 0.928$.
*Step 3 (1 mark):* $P(T > 50) = P(Z > 0.928) \\approx 0.177$.

**c. (2 marks)**
*Step 1 (1 mark):* $E(T/3) = 45/3 = 15$.
*Step 2 (1 mark):* $\\text{Var}(T/3) = 29/9$. So $\\bar X \\sim N(15, 29/9)$.`),
];

const extendedResponse: FR[] = [
  sq(`In a factory packaging cereal, the mass of an individual box is $X \\sim N(500, 25)$ grams.

**a.** A carton contains 12 boxes, with masses independent of each other. Let $T$ be the total mass of the boxes. Find the distribution of $T$. (3 marks)

**b.** The carton box itself has mass $C \\sim N(200, 16)$, independent of the boxes. Find the distribution of total carton mass $W = T + C$. (3 marks)

**c.** A truck delivers 5 cartons, with $W_1, \\ldots, W_5$ independent. Find the distribution of total truck mass $S = \\sum W_i$. (3 marks)

**d.** The truck's maximum safe load is 35 kg. Find the probability that $S$ exceeds this. (3 marks)`, 12, "HARD",
    `**a. (3 marks)**
*Step 1 (1 mark):* $T = \\sum_{i=1}^{12} X_i$.
*Step 2 (1 mark):* Mean: $12 \\cdot 500 = 6000$. Variance: $12 \\cdot 25 = 300$.
*Step 3 (1 mark):* $T \\sim N(6000, 300)$.

**b. (3 marks)**
*Step 1 (1 mark):* $W = T + C$, with $T \\perp C$.
*Step 2 (1 mark):* Mean: $6000 + 200 = 6200$. Variance: $300 + 16 = 316$.
*Step 3 (1 mark):* $W \\sim N(6200, 316)$ grams.

**c. (3 marks)**
*Step 1 (1 mark):* $S = \\sum_{i=1}^5 W_i$.
*Step 2 (1 mark):* Mean: $5 \\cdot 6200 = 31000$. Variance: $5 \\cdot 316 = 1580$.
*Step 3 (1 mark):* $S \\sim N(31000, 1580)$ grams.

**d. (3 marks)**
*Step 1 (1 mark):* $35$ kg $= 35000$ g.
*Step 2 (1 mark):* SD: $\\sqrt{1580} \\approx 39.75$. $z = (35000 - 31000)/39.75 \\approx 100.6$.
*Step 3 (1 mark):* $P(S > 35000) = P(Z > 100.6) \\approx 0$ (essentially zero — truck is safe).`),
];

const out = { mcq, shortAnswer, extendedAnswer, extendedResponse };
fs.writeFileSync("scripts/output/qset-specialist-linear-comb.json", JSON.stringify(out, null, 2) + "\n");
console.log(`Wrote ${mcq.length} MCQ, ${shortAnswer.length} SHORT, ${extendedAnswer.length} EXT_ANS, ${extendedResponse.length} EXT_RESP to scripts/output/qset-specialist-linear-comb.json`);
