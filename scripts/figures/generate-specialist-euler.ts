/** Specialist ext-fit: Euler's Method. */
import * as fs from "fs";
interface MCQ { content: string; optionA: string; optionB: string; optionC: string; optionD: string; correctOption: "A"|"B"|"C"|"D"; marks: number; difficulty: "EASY"|"MEDIUM"|"HARD"; solutionContent: string; subtopicSlugs: string[]; }
interface FR { content: string; marks: number; difficulty: "EASY"|"MEDIUM"|"HARD"; solutionContent: string; subtopicSlugs: string[]; }
const P = "eulers-method";
const m = (c: string, o: [string,string,string,string], k: "A"|"B"|"C"|"D", d: "EASY"|"MEDIUM"|"HARD", s: string, sec: string[] = []): MCQ =>
  ({ content: c, optionA: o[0], optionB: o[1], optionC: o[2], optionD: o[3], correctOption: k, marks: 1, difficulty: d, solutionContent: s, subtopicSlugs: [P, ...sec] });
const sq = (c: string, marks: number, d: "EASY"|"MEDIUM"|"HARD", s: string, sec: string[] = []): FR =>
  ({ content: c, marks, difficulty: d, solutionContent: s, subtopicSlugs: [P, ...sec] });

const mcq: MCQ[] = [
  m("Euler's method approximation: $y_{n+1} =$:", ["$y_n + h f(x_n, y_n)$", "$y_n - h f(x_n, y_n)$", "$y_n \\cdot h$", "$f(x_n)$"], "A", "EASY",
    "Euler step: $y_{n+1} = y_n + h \\cdot \\dfrac{dy}{dx}|_{(x_n, y_n)}$. **Answer: A**"),
  m("For $\\frac{dy}{dx} = x + y$, $y(0) = 1$, $h = 0.1$, then $y(0.1) \\approx$:", ["$1$", "$1.1$", "$1.01$", "$0.9$"], "B", "EASY",
    "$y_1 = 1 + 0.1 \\cdot (0 + 1) = 1.1$. **Answer: B**"),
  m("Decreasing $h$ in Euler's method generally:", ["increases error", "decreases error", "no effect", "depends on $y$"], "B", "EASY",
    "Smaller step size → smaller local truncation error. **Answer: B**"),
  m("For $\\frac{dy}{dx} = 2x$, $y(0) = 0$, $h = 0.5$, then $y(0.5) \\approx$:", ["$0$", "$0.5$", "$0.25$", "$1$"], "A", "MEDIUM",
    "$y_1 = 0 + 0.5 \\cdot 2(0) = 0$. (Note: exact $y(0.5) = 0.25$.) **Answer: A**"),
  m("Euler's method gives exact results when the solution is:", ["quadratic", "exponential", "linear in $x$", "polynomial"], "C", "MEDIUM",
    "Euler approximates linearly between steps, exact iff solution is linear (or in some special cases). **Answer: C**"),
  m("If Euler's method underestimates the true value, the solution curve is locally:", ["concave up", "concave down", "linear", "horizontal"], "A", "MEDIUM",
    "Concave up → tangent line lies below the curve → Euler underestimates. **Answer: A**"),
  m("For $\\frac{dy}{dx} = y$, $y(0) = 1$, $h = 1$, two steps give $y(2) \\approx$:", ["$2$", "$3$", "$4$", "$e^2$"], "C", "HARD",
    "$y_1 = 1 + 1 \\cdot 1 = 2$; $y_2 = 2 + 1 \\cdot 2 = 4$. (Exact $y(2) = e^2 \\approx 7.39$.) **Answer: C**"),
  m("The global truncation error in Euler's method over a fixed interval is $O(h^k)$ where $k =$:", ["$1$", "$2$", "$3$", "$1/2$"], "A", "HARD",
    "Euler's method has global error $O(h)$. **Answer: A**"),
];

const shortAnswer: FR[] = [
  sq("Use Euler's method with $h = 0.2$ to approximate $y(0.4)$ given $\\frac{dy}{dx} = x + y$, $y(0) = 1$.", 3, "MEDIUM",
    "*Step 1 (1 mark):* $y_1 = 1 + 0.2(0 + 1) = 1.2$ at $x = 0.2$.\n*Step 2 (1 mark):* $y_2 = 1.2 + 0.2(0.2 + 1.2) = 1.2 + 0.28 = 1.48$ at $x = 0.4$.\n*Step 3 (1 mark):* So $y(0.4) \\approx 1.48$."),
  sq("For $\\frac{dy}{dx} = 1 - y$, $y(0) = 0$, $h = 0.5$, find $y(1.0)$ using Euler's method.", 3, "MEDIUM",
    "*Step 1 (1 mark):* $y_1 = 0 + 0.5(1 - 0) = 0.5$ at $x = 0.5$.\n*Step 2 (1 mark):* $y_2 = 0.5 + 0.5(1 - 0.5) = 0.75$ at $x = 1.0$.\n*Step 3 (1 mark):* $y(1.0) \\approx 0.75$ (exact: $1 - e^{-1} \\approx 0.632$)."),
  sq("Given $\\frac{dy}{dx} = xy$, $y(1) = 1$, $h = 0.1$, find $y(1.2)$.", 3, "MEDIUM",
    "*Step 1 (1 mark):* $y_1 = 1 + 0.1(1 \\cdot 1) = 1.1$ at $x = 1.1$.\n*Step 2 (1 mark):* $y_2 = 1.1 + 0.1(1.1 \\cdot 1.1) = 1.1 + 0.121 = 1.221$.\n*Step 3 (1 mark):* $y(1.2) \\approx 1.221$."),
  sq("Why does Euler's method become inaccurate for stiff ODEs (rapid changes)?", 2, "HARD",
    "*Step 1 (1 mark):* Euler uses a single slope value per step, missing rapid curvature changes.\n*Step 2 (1 mark):* Errors can grow if step size is not small relative to characteristic time scales."),
  sq("Use Euler's method ($h = 0.25$) to approximate $y(0.5)$ for $\\frac{dy}{dx} = -2y$, $y(0) = 4$.", 3, "EASY",
    "*Step 1 (1 mark):* $y_1 = 4 + 0.25(-2 \\cdot 4) = 4 - 2 = 2$ at $x = 0.25$.\n*Step 2 (1 mark):* $y_2 = 2 + 0.25(-2 \\cdot 2) = 1$.\n*Step 3 (1 mark):* $y(0.5) \\approx 1$ (exact: $4e^{-1} \\approx 1.47$)."),
];

const extendedAnswer: FR[] = [
  sq(`Consider $\\dfrac{dy}{dx} = x - y$ with $y(0) = 1$.

**a.** Use Euler's method with $h = 0.2$ to estimate $y(0.6)$. Show all working. (4 marks)

**b.** Find the exact solution to the ODE and evaluate $y(0.6)$ exactly. (3 marks)

**c.** Compare the two answers and comment on the source of the discrepancy. (2 marks)`, 9, "HARD",
    `**a. (4 marks)**
*Step 1 (1 mark):* $y_1 = 1 + 0.2(0 - 1) = 0.8$ at $x = 0.2$.
*Step 2 (1 mark):* $y_2 = 0.8 + 0.2(0.2 - 0.8) = 0.8 - 0.12 = 0.68$ at $x = 0.4$.
*Step 3 (1 mark):* $y_3 = 0.68 + 0.2(0.4 - 0.68) = 0.68 - 0.056 = 0.624$ at $x = 0.6$.
*Step 4 (1 mark):* $y(0.6) \\approx 0.624$.

**b. (3 marks)**
*Step 1 (1 mark):* The ODE $y' + y = x$ is first-order linear. Integrating factor $e^x$ gives $(y e^x)' = x e^x$.
*Step 2 (1 mark):* $\\int x e^x \\, dx = (x - 1)e^x + C$, so $y e^x = (x - 1)e^x + C$, hence $y = x - 1 + Ce^{-x}$.
*Step 3 (1 mark):* $y(0) = -1 + C = 1$ gives $C = 2$. So $y(x) = x - 1 + 2 e^{-x}$ and $y(0.6) = -0.4 + 2 e^{-0.6} \\approx -0.4 + 1.0976 \\approx 0.698$.

**c. (2 marks)**
*Step 1 (1 mark):* Euler underestimates ($0.624 < 0.698$).
*Step 2 (1 mark):* The solution is concave up near $x = 0$ (since $y' = x - y$ is increasing in $x$ but constraining $y$ down); tangent lines lie below the curve. Truncation error is $O(h)$ here.`),
];

const out = { mcq, shortAnswer, extendedAnswer, extendedResponse: [] };
fs.writeFileSync("scripts/output/qset-specialist-euler.json", JSON.stringify(out, null, 2) + "\n");
console.log(`Wrote ${mcq.length} MCQ, ${shortAnswer.length} SHORT, ${extendedAnswer.length} EXT_ANS to scripts/output/qset-specialist-euler.json`);
