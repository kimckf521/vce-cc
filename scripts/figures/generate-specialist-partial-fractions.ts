/** Specialist ext-fit: Integration by Partial Fractions. */
import * as fs from "fs";
interface MCQ { content: string; optionA: string; optionB: string; optionC: string; optionD: string; correctOption: "A"|"B"|"C"|"D"; marks: number; difficulty: "EASY"|"MEDIUM"|"HARD"; solutionContent: string; subtopicSlugs: string[]; }
interface FR { content: string; marks: number; difficulty: "EASY"|"MEDIUM"|"HARD"; solutionContent: string; subtopicSlugs: string[]; }
const P = "integration-by-partial-fractions";
const m = (c: string, o: [string,string,string,string], k: "A"|"B"|"C"|"D", d: "EASY"|"MEDIUM"|"HARD", s: string, sec: string[] = []): MCQ =>
  ({ content: c, optionA: o[0], optionB: o[1], optionC: o[2], optionD: o[3], correctOption: k, marks: 1, difficulty: d, solutionContent: s, subtopicSlugs: [P, ...sec] });
const sq = (c: string, marks: number, d: "EASY"|"MEDIUM"|"HARD", s: string, sec: string[] = []): FR =>
  ({ content: c, marks, difficulty: d, solutionContent: s, subtopicSlugs: [P, ...sec] });

const mcq: MCQ[] = [
  m("$\\dfrac{1}{(x-1)(x-2)}$ decomposes into:", ["$\\dfrac{1}{x-1} - \\dfrac{1}{x-2}$", "$\\dfrac{1}{x-2} - \\dfrac{1}{x-1}$", "$\\dfrac{1}{x-1} + \\dfrac{1}{x-2}$", "$\\dfrac{1}{2(x-1)(x-2)}$"], "B", "MEDIUM",
    "$\\dfrac{1}{(x-1)(x-2)} = \\dfrac{A}{x-1} + \\dfrac{B}{x-2}$; $1 = A(x-2) + B(x-1)$. At $x=1$: $A=-1$; at $x=2$: $B = 1$. **Answer: B**"),
  m("$\\int \\dfrac{1}{x(x+1)} dx =$:", ["$\\ln|x(x+1)| + C$", "$\\ln\\left|\\dfrac{x}{x+1}\\right| + C$", "$\\dfrac{1}{2}\\ln|x^2 + x| + C$", "$\\ln|x| - \\ln|x+1| + C$"], "B", "MEDIUM",
    "$\\dfrac{1}{x(x+1)} = \\dfrac{1}{x} - \\dfrac{1}{x+1}$, so integral is $\\ln|x| - \\ln|x+1| + C = \\ln\\left|\\dfrac{x}{x+1}\\right| + C$. **Answer: B**"),
  m("The decomposition of $\\dfrac{x+1}{x^2 - 4}$ over $\\mathbb{R}$ has:", ["1 linear term", "2 linear terms", "1 quadratic term", "no real decomposition"], "B", "EASY",
    "$x^2 - 4 = (x-2)(x+2)$, two distinct linear factors. **Answer: B**"),
  m("For $\\dfrac{1}{x^2 + 1}$, the integral is:", ["$\\ln(x^2 + 1) + C$", "$\\arctan x + C$", "$\\dfrac{1}{2}\\ln(x^2+1) + C$", "$\\dfrac{1}{x^2+1} + C$"], "B", "EASY",
    "Standard: $\\int dx/(x^2 + 1) = \\arctan x + C$. (No partial-fraction expansion possible over $\\mathbb{R}$.) **Answer: B**"),
  m("$\\dfrac{1}{(x+1)^2}$ has antiderivative:", ["$\\ln(x+1)^2$", "$-\\dfrac{1}{x+1}$", "$\\dfrac{1}{x+1}$", "$-2(x+1)^{-3}$"], "B", "MEDIUM",
    "$\\int (x+1)^{-2} dx = -(x+1)^{-1} + C$. **Answer: B**"),
  m("Partial-fraction form of $\\dfrac{1}{(x-1)^2(x+1)}$:", ["$\\dfrac{A}{x-1} + \\dfrac{B}{x+1}$", "$\\dfrac{A}{x-1} + \\dfrac{B}{(x-1)^2} + \\dfrac{C}{x+1}$", "$\\dfrac{Ax+B}{(x-1)^2} + \\dfrac{C}{x+1}$", "$\\dfrac{1}{x^2-1}$"], "B", "HARD",
    "Repeated linear factor requires $A/(x-1) + B/(x-1)^2$. **Answer: B**"),
  m("$\\int_0^1 \\dfrac{dx}{(x+1)(x+2)} =$:", ["$\\ln(4/3)$", "$\\ln(3/4)$", "$\\ln 2$", "$\\ln(2/3) + \\ln 1$"], "A", "HARD",
    "$\\dfrac{1}{(x+1)(x+2)} = \\dfrac{1}{x+1} - \\dfrac{1}{x+2}$. $\\int = \\ln|x+1| - \\ln|x+2|$ evaluated $[0,1]$: $(\\ln 2 - \\ln 3) - (\\ln 1 - \\ln 2) = 2\\ln 2 - \\ln 3 = \\ln(4/3)$. **Answer: A**"),
  m("If $\\dfrac{2x}{x^2 + 1}$ is integrated, the result is:", ["$\\arctan x$", "$\\ln(x^2 + 1)$", "$2x \\arctan x$", "$x^2 + 1$"], "B", "EASY",
    "Numerator is derivative of denominator: $\\int \\dfrac{2x}{x^2 + 1} dx = \\ln(x^2 + 1) + C$. **Answer: B**"),
];

const shortAnswer: FR[] = [
  sq("Express $\\dfrac{3}{(x-1)(x+2)}$ in partial fractions.", 2, "EASY",
    "*Step 1 (1 mark):* $\\dfrac{3}{(x-1)(x+2)} = \\dfrac{A}{x-1} + \\dfrac{B}{x+2}$; $3 = A(x+2) + B(x-1)$.\n*Step 2 (1 mark):* $x=1$: $3 = 3A \\Rightarrow A = 1$. $x=-2$: $3 = -3B \\Rightarrow B = -1$. So $\\dfrac{1}{x-1} - \\dfrac{1}{x+2}$."),
  sq("Evaluate $\\int \\dfrac{1}{x^2 - 1} dx$.", 3, "MEDIUM",
    "*Step 1 (1 mark):* $\\dfrac{1}{(x-1)(x+1)} = \\dfrac{1/2}{x-1} - \\dfrac{1/2}{x+1}$.\n*Step 2 (1 mark):* $\\int = \\dfrac{1}{2}\\ln|x-1| - \\dfrac{1}{2}\\ln|x+1| + C$.\n*Step 3 (1 mark):* $= \\dfrac{1}{2}\\ln\\left|\\dfrac{x-1}{x+1}\\right| + C$."),
  sq("Find $\\int \\dfrac{x+5}{x^2+x-6} dx$.", 3, "MEDIUM",
    "*Step 1 (1 mark):* Factor: $x^2 + x - 6 = (x+3)(x-2)$. Decompose: $\\dfrac{x+5}{(x+3)(x-2)} = \\dfrac{A}{x+3} + \\dfrac{B}{x-2}$.\n*Step 2 (1 mark):* $x = -3$: $2 = -5A \\Rightarrow A = -2/5$. $x = 2$: $7 = 5B \\Rightarrow B = 7/5$.\n*Step 3 (1 mark):* Integral: $-\\dfrac{2}{5}\\ln|x+3| + \\dfrac{7}{5}\\ln|x-2| + C$."),
  sq("Express $\\dfrac{x^2 + 1}{(x-1)^2 (x+1)}$ in partial fractions.", 3, "HARD",
    "*Step 1 (1 mark):* Set up $\\dfrac{A}{x-1} + \\dfrac{B}{(x-1)^2} + \\dfrac{C}{x+1}$.\n*Step 2 (1 mark):* Multiply: $x^2 + 1 = A(x-1)(x+1) + B(x+1) + C(x-1)^2$. $x = 1$: $2 = 2B \\Rightarrow B = 1$. $x = -1$: $2 = 4C \\Rightarrow C = 1/2$.\n*Step 3 (1 mark):* Coefficient of $x^2$: $1 = A + C \\Rightarrow A = 1 - 1/2 = 1/2$. Answer: $\\dfrac{1/2}{x-1} + \\dfrac{1}{(x-1)^2} + \\dfrac{1/2}{x+1}$."),
  sq("Evaluate $\\int_0^1 \\dfrac{dx}{x^2 + 5x + 6}$.", 3, "MEDIUM",
    "*Step 1 (1 mark):* $x^2 + 5x + 6 = (x+2)(x+3)$. $\\dfrac{1}{(x+2)(x+3)} = \\dfrac{1}{x+2} - \\dfrac{1}{x+3}$.\n*Step 2 (1 mark):* Antiderivative: $\\ln|x+2| - \\ln|x+3|$.\n*Step 3 (1 mark):* $[\\ln 3 - \\ln 4] - [\\ln 2 - \\ln 3] = 2\\ln 3 - \\ln 4 - \\ln 2 = \\ln(9) - \\ln 8 = \\ln(9/8)$."),
];

const extendedAnswer: FR[] = [
  sq(`Consider $I = \\int \\dfrac{x^2 + 1}{x^3 - x} dx$ for $x > 1$.

**a.** Factorise $x^3 - x$. (1 mark)

**b.** Decompose $\\dfrac{x^2 + 1}{x^3 - x}$ into partial fractions. (4 marks)

**c.** Hence evaluate $I$, giving your answer in simplified logarithmic form. (3 marks)`, 8, "MEDIUM",
    `**a. (1 mark)** $x^3 - x = x(x-1)(x+1)$.

**b. (4 marks)**
*Step 1 (1 mark):* $\\dfrac{x^2 + 1}{x(x-1)(x+1)} = \\dfrac{A}{x} + \\dfrac{B}{x-1} + \\dfrac{C}{x+1}$.
*Step 2 (1 mark):* Multiply: $x^2 + 1 = A(x-1)(x+1) + Bx(x+1) + Cx(x-1)$.
*Step 3 (1 mark):* $x = 0$: $1 = -A \\Rightarrow A = -1$. $x = 1$: $2 = 2B \\Rightarrow B = 1$. $x = -1$: $2 = 2C \\Rightarrow C = 1$.
*Step 4 (1 mark):* So $\\dfrac{x^2 + 1}{x^3 - x} = -\\dfrac{1}{x} + \\dfrac{1}{x-1} + \\dfrac{1}{x+1}$.

**c. (3 marks)**
*Step 1 (1 mark):* Integrate term by term: $I = -\\ln|x| + \\ln|x-1| + \\ln|x+1| + C$.
*Step 2 (1 mark):* For $x > 1$: $I = \\ln(x-1) + \\ln(x+1) - \\ln x + C$.
*Step 3 (1 mark):* $= \\ln\\dfrac{(x-1)(x+1)}{x} + C = \\ln\\dfrac{x^2 - 1}{x} + C$.`),
];

const out = { mcq, shortAnswer, extendedAnswer, extendedResponse: [] };
fs.writeFileSync("scripts/output/qset-specialist-partial-fractions.json", JSON.stringify(out, null, 2) + "\n");
console.log(`Wrote ${mcq.length} MCQ, ${shortAnswer.length} SHORT, ${extendedAnswer.length} EXT_ANS to scripts/output/qset-specialist-partial-fractions.json`);
