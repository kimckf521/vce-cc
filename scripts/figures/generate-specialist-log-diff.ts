/** Specialist ext-fit: Logarithmic Differentiation. */
import * as fs from "fs";
interface MCQ { content: string; optionA: string; optionB: string; optionC: string; optionD: string; correctOption: "A"|"B"|"C"|"D"; marks: number; difficulty: "EASY"|"MEDIUM"|"HARD"; solutionContent: string; subtopicSlugs: string[]; }
interface FR { content: string; marks: number; difficulty: "EASY"|"MEDIUM"|"HARD"; solutionContent: string; subtopicSlugs: string[]; }
const P = "logarithmic-differentiation";
const m = (c: string, o: [string,string,string,string], k: "A"|"B"|"C"|"D", d: "EASY"|"MEDIUM"|"HARD", s: string, sec: string[] = []): MCQ =>
  ({ content: c, optionA: o[0], optionB: o[1], optionC: o[2], optionD: o[3], correctOption: k, marks: 1, difficulty: d, solutionContent: s, subtopicSlugs: [P, ...sec] });
const sq = (c: string, marks: number, d: "EASY"|"MEDIUM"|"HARD", s: string, sec: string[] = []): FR =>
  ({ content: c, marks, difficulty: d, solutionContent: s, subtopicSlugs: [P, ...sec] });

const mcq: MCQ[] = [
  m("$\\dfrac{d}{dx}[\\ln(f(x))] =$:", ["$\\dfrac{f'(x)}{f(x)}$", "$f'(x)$", "$\\dfrac{1}{f(x)}$", "$\\ln(f'(x))$"], "A", "EASY",
    "Chain rule. **Answer: A**"),
  m("Logarithmic differentiation is most useful for:", ["polynomials", "products of many factors / variable exponents", "trigonometric functions", "constants"], "B", "EASY",
    "Log turns products into sums, exponents into multipliers. **Answer: B**"),
  m("If $y = x^x$ for $x > 0$, taking $\\ln$: $\\ln y =$:", ["$x \\ln x$", "$\\ln x + x$", "$x^2 \\ln x$", "$\\ln(x^x)$"], "A", "MEDIUM",
    "$\\ln(x^x) = x \\ln x$. **Answer: A**"),
  m("$y = x^x$: $\\dfrac{dy}{dx} =$:", ["$x \\cdot x^{x-1}$", "$x^x \\ln x$", "$x^x (1 + \\ln x)$", "$x^x \\cdot x$"], "C", "MEDIUM",
    "$\\ln y = x\\ln x$, differentiate: $y'/y = \\ln x + 1$, so $y' = x^x(\\ln x + 1)$. **Answer: C**"),
  m("For $y = (x+1)(x-2)^3 / (x+5)^2$, log diff gives $\\dfrac{y'}{y} =$:", ["$\\dfrac{1}{x+1} + \\dfrac{3}{x-2} - \\dfrac{2}{x+5}$", "$\\dfrac{1}{x+1} + \\dfrac{3}{x-2} + \\dfrac{2}{x+5}$", "$\\dfrac{1}{(x+1)(x-2)(x+5)}$", "$0$"], "A", "MEDIUM",
    "$\\ln y = \\ln(x+1) + 3\\ln(x-2) - 2\\ln(x+5)$. Diff each term. **Answer: A**"),
  m("$y = a^x$ where $a > 0$, $a \\ne 1$: $\\dfrac{dy}{dx} =$:", ["$a^x \\ln a$", "$x a^{x-1}$", "$a^x$", "$a^x / x$"], "A", "MEDIUM",
    "$\\ln y = x \\ln a$, $y'/y = \\ln a$, $y' = a^x \\ln a$. **Answer: A**"),
  m("Derivative of $y = (\\sin x)^x$ for $x > 0$:", ["$(\\sin x)^x [\\ln(\\sin x) + x \\cot x]$", "$x(\\sin x)^{x-1}\\cos x$", "$(\\sin x)^x \\cos x$", "$x (\\sin x)^x$"], "A", "HARD",
    "$\\ln y = x \\ln(\\sin x)$, diff: $y'/y = \\ln(\\sin x) + x \\cdot \\cos x/\\sin x$. **Answer: A**"),
  m("$y = e^{f(x)}$: log diff gives $\\dfrac{y'}{y} =$:", ["$f(x)$", "$f'(x)$", "$\\ln(f'(x))$", "$1/f(x)$"], "B", "HARD",
    "$\\ln y = f(x)$, $y'/y = f'(x)$. **Answer: B**"),
];

const shortAnswer: FR[] = [
  sq("Use logarithmic differentiation to find $\\dfrac{dy}{dx}$ for $y = x^{\\ln x}$ ($x > 0$).", 3, "MEDIUM",
    "*Step 1 (1 mark):* $\\ln y = \\ln x \\cdot \\ln x = (\\ln x)^2$.\n*Step 2 (1 mark):* $\\dfrac{y'}{y} = 2 \\ln x / x$.\n*Step 3 (1 mark):* $y' = x^{\\ln x} \\cdot \\dfrac{2\\ln x}{x}$."),
  sq("Find $\\dfrac{dy}{dx}$ when $y = (2x+1)^3 (3x-2)^2$ using log diff.", 3, "MEDIUM",
    "*Step 1 (1 mark):* $\\ln y = 3\\ln(2x+1) + 2\\ln(3x-2)$.\n*Step 2 (1 mark):* $\\dfrac{y'}{y} = \\dfrac{6}{2x+1} + \\dfrac{6}{3x-2}$.\n*Step 3 (1 mark):* $y' = (2x+1)^3 (3x-2)^2 \\left[\\dfrac{6}{2x+1} + \\dfrac{6}{3x-2}\\right]$."),
  sq("Differentiate $y = x^{\\sin x}$ ($x > 0$).", 3, "MEDIUM",
    "*Step 1 (1 mark):* $\\ln y = \\sin x \\cdot \\ln x$.\n*Step 2 (1 mark):* $\\dfrac{y'}{y} = \\cos x \\ln x + \\dfrac{\\sin x}{x}$.\n*Step 3 (1 mark):* $y' = x^{\\sin x}\\left[\\cos x \\ln x + \\sin x / x\\right]$."),
  sq("Find $\\dfrac{dy}{dx}$ for $y = \\dfrac{x^2 \\sqrt{x+1}}{(x-2)^3}$ at $x = 1$.", 3, "HARD",
    "*Step 1 (1 mark):* $\\ln y = 2\\ln x + \\dfrac{1}{2}\\ln(x+1) - 3\\ln(x-2)$.\n*Step 2 (1 mark):* $\\dfrac{y'}{y} = \\dfrac{2}{x} + \\dfrac{1}{2(x+1)} - \\dfrac{3}{x-2}$.\n*Step 3 (1 mark):* At $x=1$: $y = 1 \\cdot \\sqrt 2 / (-1)^3 = -\\sqrt 2$; bracket: $2 + 1/4 - 3/(-1) = 2 + 0.25 + 3 = 5.25$. So $y'(1) = -\\sqrt 2 \\cdot 5.25 = -5.25\\sqrt 2$."),
  sq("Differentiate $y = 5^{x^2}$.", 2, "MEDIUM",
    "*Step 1 (1 mark):* $\\ln y = x^2 \\ln 5$, so $y'/y = 2x\\ln 5$.\n*Step 2 (1 mark):* $y' = 2x \\ln 5 \\cdot 5^{x^2}$."),
];

const extendedAnswer: FR[] = [
  sq(`Let $y = \\dfrac{(x+1)^2 (x-3)^3}{(x+2)^4}$.

**a.** Take logs: write $\\ln y$ as a sum of logarithms. (1 mark)

**b.** Differentiate to find $\\dfrac{dy}{dx}$ in terms of $x$ and $y$. (3 marks)

**c.** Evaluate $\\dfrac{dy}{dx}$ at $x = 0$. (3 marks)`, 7, "MEDIUM",
    `**a. (1 mark)** $\\ln y = 2\\ln(x+1) + 3\\ln(x-3) - 4\\ln(x+2)$.

**b. (3 marks)**
*Step 1 (1 mark):* $\\dfrac{y'}{y} = \\dfrac{2}{x+1} + \\dfrac{3}{x-3} - \\dfrac{4}{x+2}$.
*Step 2 (1 mark):* $y' = y \\cdot \\left[\\dfrac{2}{x+1} + \\dfrac{3}{x-3} - \\dfrac{4}{x+2}\\right]$.
*Step 3 (1 mark):* $= \\dfrac{(x+1)^2 (x-3)^3}{(x+2)^4} \\cdot \\left[\\dfrac{2}{x+1} + \\dfrac{3}{x-3} - \\dfrac{4}{x+2}\\right]$.

**c. (3 marks)**
*Step 1 (1 mark):* At $x=0$: $y(0) = 1 \\cdot (-27)/16 = -27/16$.
*Step 2 (1 mark):* Bracket at $x=0$: $2 - 1 - 2 = -1$.
*Step 3 (1 mark):* $y'(0) = (-27/16)(-1) = 27/16$.`),
];

const out = { mcq, shortAnswer, extendedAnswer, extendedResponse: [] };
fs.writeFileSync("scripts/output/qset-specialist-log-diff.json", JSON.stringify(out, null, 2) + "\n");
console.log(`Wrote ${mcq.length} MCQ, ${shortAnswer.length} SHORT, ${extendedAnswer.length} EXT_ANS to scripts/output/qset-specialist-log-diff.json`);
