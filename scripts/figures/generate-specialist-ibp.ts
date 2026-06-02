/** Specialist modelling-rich: Integration by Parts. */
import * as fs from "fs";
interface MCQ { content: string; optionA: string; optionB: string; optionC: string; optionD: string; correctOption: "A"|"B"|"C"|"D"; marks: number; difficulty: "EASY"|"MEDIUM"|"HARD"; solutionContent: string; subtopicSlugs: string[]; }
interface FR { content: string; marks: number; difficulty: "EASY"|"MEDIUM"|"HARD"; solutionContent: string; subtopicSlugs: string[]; }
const P = "integration-by-parts";
const m = (c: string, o: [string,string,string,string], k: "A"|"B"|"C"|"D", d: "EASY"|"MEDIUM"|"HARD", s: string, sec: string[] = []): MCQ =>
  ({ content: c, optionA: o[0], optionB: o[1], optionC: o[2], optionD: o[3], correctOption: k, marks: 1, difficulty: d, solutionContent: s, subtopicSlugs: [P, ...sec] });
const sq = (c: string, marks: number, d: "EASY"|"MEDIUM"|"HARD", s: string, sec: string[] = []): FR =>
  ({ content: c, marks, difficulty: d, solutionContent: s, subtopicSlugs: [P, ...sec] });

const mcq: MCQ[] = [
  m("Integration by parts states: $\\int u\\,dv =$", ["$uv - \\int v\\,du$", "$uv + \\int v\\,du$", "$u + v$", "$\\int v\\,du$"], "A", "EASY",
    "Standard formula. **Answer: A**"),
  m("For $\\int x e^x dx$, the natural choice is $u =$:", ["$x$", "$e^x$", "$dx$", "$xe^x$"], "A", "EASY",
    "LIATE: pick $u$ from L/I/A/T/E earliest type. Algebraic ($x$) before exponential. **Answer: A**"),
  m("$\\int x \\cos x \\, dx =$:", ["$x \\sin x + \\cos x + C$", "$x \\sin x - \\cos x + C$", "$-x \\sin x + \\cos x + C$", "$x \\cos x - \\sin x + C$"], "A", "MEDIUM",
    "$u = x$, $dv = \\cos x dx$: $du = dx$, $v = \\sin x$. $\\int = x \\sin x - \\int \\sin x dx = x \\sin x + \\cos x + C$. **Answer: A**"),
  m("$\\int \\ln x \\, dx =$:", ["$x \\ln x + C$", "$x \\ln x - x + C$", "$\\dfrac{1}{x} + C$", "$\\dfrac{(\\ln x)^2}{2} + C$"], "B", "MEDIUM",
    "$u = \\ln x$, $dv = dx$: $du = dx/x$, $v = x$. $\\int = x\\ln x - \\int dx = x\\ln x - x + C$. **Answer: B**"),
  m("$\\int x^2 e^x dx$ requires applying IBP:", ["once", "twice", "three times", "not at all"], "B", "MEDIUM",
    "First IBP reduces to $\\int 2x e^x dx$; second IBP completes. **Answer: B**"),
  m("$\\int_0^1 x e^{-x} dx =$:", ["$1 - 2/e$", "$1 + 1/e$", "$1 - 1/e - 1/e = 1 - 2/e$ (same as A)", "$1/e$"], "A", "HARD",
    "$u = x$, $dv = e^{-x} dx$: $du = dx$, $v = -e^{-x}$. $\\int_0^1 = [-xe^{-x}]_0^1 + \\int_0^1 e^{-x} dx = -e^{-1} + [-e^{-x}]_0^1 = -e^{-1} - e^{-1} + 1 = 1 - 2/e$. **Answer: A**"),
  m("$\\int \\sin x \\cos x dx$ done by IBP gives:", ["$\\sin^2 x - \\int \\cos x \\sin x dx$ (circular)", "$-\\cos^2 x / 2$", "$\\sin^2 x / 2$", "all of the above represent valid evaluations"], "D", "HARD",
    "IBP with $u=\\sin x, dv = \\cos x dx$ gives circular argument; substitution simpler: $\\sin^2 x/2 + C$ (or $-\\cos^2 x/2 + C'$). All valid. **Answer: D**"),
  m("$\\int e^x \\sin x dx =$:", ["$e^x \\sin x + C$", "$e^x \\cos x + C$", "$\\dfrac{e^x(\\sin x - \\cos x)}{2} + C$", "$e^x \\sin x \\cdot \\cos x + C$"], "C", "HARD",
    "Classic two-IBP loop; result $e^x(\\sin x - \\cos x)/2 + C$. **Answer: C**"),
];

const shortAnswer: FR[] = [
  sq("Evaluate $\\int x \\sin x \\, dx$.", 3, "MEDIUM",
    "*Step 1 (1 mark):* $u = x$, $dv = \\sin x dx$: $du = dx$, $v = -\\cos x$.\n*Step 2 (1 mark):* $\\int = -x\\cos x + \\int \\cos x dx$.\n*Step 3 (1 mark):* $= -x\\cos x + \\sin x + C$."),
  sq("Evaluate $\\int_1^e \\ln x \\, dx$.", 3, "MEDIUM",
    "*Step 1 (1 mark):* From the standard result: $\\int \\ln x dx = x \\ln x - x + C$.\n*Step 2 (1 mark):* At $x = e$: $e \\cdot 1 - e = 0$. At $x = 1$: $1 \\cdot 0 - 1 = -1$.\n*Step 3 (1 mark):* Definite integral: $0 - (-1) = 1$."),
  sq("Find $\\int x e^{2x} dx$.", 3, "MEDIUM",
    "*Step 1 (1 mark):* $u = x$, $dv = e^{2x} dx$: $du = dx$, $v = e^{2x}/2$.\n*Step 2 (1 mark):* $\\int = \\dfrac{xe^{2x}}{2} - \\int \\dfrac{e^{2x}}{2} dx$.\n*Step 3 (1 mark):* $= \\dfrac{xe^{2x}}{2} - \\dfrac{e^{2x}}{4} + C$."),
  sq("Evaluate $\\int x^2 \\ln x \\, dx$.", 3, "HARD",
    "*Step 1 (1 mark):* $u = \\ln x$, $dv = x^2 dx$: $du = dx/x$, $v = x^3/3$.\n*Step 2 (1 mark):* $\\int = \\dfrac{x^3 \\ln x}{3} - \\int \\dfrac{x^3}{3} \\cdot \\dfrac{1}{x} dx = \\dfrac{x^3 \\ln x}{3} - \\dfrac{1}{3}\\int x^2 dx$.\n*Step 3 (1 mark):* $= \\dfrac{x^3 \\ln x}{3} - \\dfrac{x^3}{9} + C$."),
  sq("Evaluate $\\int_0^{\\pi/2} x \\cos x \\, dx$.", 3, "MEDIUM",
    "*Step 1 (1 mark):* From above: $\\int x\\cos x dx = x\\sin x + \\cos x + C$.\n*Step 2 (1 mark):* At $\\pi/2$: $\\frac{\\pi}{2} \\cdot 1 + 0 = \\pi/2$.\n*Step 3 (1 mark):* At $0$: $0 + 1 = 1$. Definite: $\\pi/2 - 1$."),
];

const extendedAnswer: FR[] = [
  sq(`Evaluate the following.

**a.** $\\int x e^{-x} dx$ (3 marks)

**b.** $\\int x^2 e^x dx$ (4 marks)

**c.** State a general principle for choosing $u$ in $\\int x^n e^{ax} dx$. (1 mark)`, 8, "MEDIUM",
    `**a. (3 marks)**
*Step 1 (1 mark):* $u = x$, $dv = e^{-x} dx$: $du = dx$, $v = -e^{-x}$.
*Step 2 (1 mark):* $\\int = -xe^{-x} + \\int e^{-x} dx$.
*Step 3 (1 mark):* $= -xe^{-x} - e^{-x} + C = -(x+1)e^{-x} + C$.

**b. (4 marks)**
*Step 1 (1 mark):* First IBP: $u = x^2$, $dv = e^x dx$. $\\int = x^2 e^x - 2\\int x e^x dx$.
*Step 2 (1 mark):* Second IBP on $\\int x e^x dx$: $u = x$, $dv = e^x dx$, giving $xe^x - e^x$.
*Step 3 (1 mark):* Substitute: $\\int x^2 e^x dx = x^2 e^x - 2(xe^x - e^x) + C$.
*Step 4 (1 mark):* $= e^x(x^2 - 2x + 2) + C$.

**c. (1 mark)** Pick $u = x^n$ (algebraic) so derivative reduces the polynomial degree each step.`),

  sq(`Find $\\int e^x \\cos x \\, dx$ using integration by parts.

**a.** Apply IBP once with $u = e^x$ and $dv = \\cos x dx$. (2 marks)

**b.** Apply IBP again to the resulting integral $\\int e^x \\sin x dx$. (2 marks)

**c.** Solve the resulting equation for $\\int e^x \\cos x dx$. (3 marks)`, 7, "HARD",
    `**a. (2 marks)**
*Step 1 (1 mark):* $u = e^x$, $dv = \\cos x dx$: $du = e^x dx$, $v = \\sin x$.
*Step 2 (1 mark):* $I = \\int e^x \\cos x dx = e^x \\sin x - \\int e^x \\sin x dx$.

**b. (2 marks)**
*Step 1 (1 mark):* For $\\int e^x \\sin x dx$: $u = e^x$, $dv = \\sin x dx$: $du = e^x dx$, $v = -\\cos x$.
*Step 2 (1 mark):* $\\int e^x \\sin x dx = -e^x \\cos x + \\int e^x \\cos x dx = -e^x \\cos x + I$.

**c. (3 marks)**
*Step 1 (1 mark):* Substitute: $I = e^x \\sin x - (-e^x \\cos x + I) = e^x \\sin x + e^x \\cos x - I$.
*Step 2 (1 mark):* Solve: $2I = e^x(\\sin x + \\cos x)$.
*Step 3 (1 mark):* So $I = \\dfrac{e^x(\\sin x + \\cos x)}{2} + C$.`),
];

const extendedResponse: FR[] = [
  sq(`A particle moves so that its velocity at time $t \\ge 0$ seconds is $v(t) = t e^{-t/2}$ metres per second.

**a.** Use integration by parts to find the position function $x(t)$, given $x(0) = 0$. (5 marks)

**b.** Find the position of the particle at $t = 2$ seconds. (2 marks)

**c.** Show that as $t \\to \\infty$, $v(t) \\to 0$ and find the limiting position $x(t) \\to L$. (3 marks)

**d.** Sketch the graph of $v(t)$ for $t \\ge 0$, marking the maximum velocity. (2 marks)`, 12, "HARD",
    `**a. (5 marks)**
*Step 1 (1 mark):* $x(t) = \\int_0^t \\tau e^{-\\tau/2} d\\tau$.
*Step 2 (1 mark):* IBP with $u = \\tau$, $dv = e^{-\\tau/2} d\\tau$: $du = d\\tau$, $v = -2 e^{-\\tau/2}$.
*Step 3 (1 mark):* $\\int = -2\\tau e^{-\\tau/2} + 2 \\int e^{-\\tau/2} d\\tau$.
*Step 4 (1 mark):* $= -2\\tau e^{-\\tau/2} - 4 e^{-\\tau/2} + C$.
*Step 5 (1 mark):* Evaluate $[0, t]$: $x(t) = -2t e^{-t/2} - 4 e^{-t/2} - (0 - 4) = 4 - (2t + 4)e^{-t/2}$.

**b. (2 marks)**
*Step 1 (1 mark):* $x(2) = 4 - (4 + 4)e^{-1} = 4 - 8/e$.
*Step 2 (1 mark):* Numerically $\\approx 4 - 2.943 \\approx 1.06$ m.

**c. (3 marks)**
*Step 1 (1 mark):* As $t \\to \\infty$, exponential decay dominates linear growth: $t e^{-t/2} \\to 0$.
*Step 2 (1 mark):* Hence $v(t) \\to 0$.
*Step 3 (1 mark):* Limit of position: $L = \\lim_{t\\to\\infty} [4 - (2t + 4)e^{-t/2}] = 4 - 0 = 4$ m.

**d. (2 marks)**
*Step 1 (1 mark):* $v'(t) = e^{-t/2}(1 - t/2) = 0 \\Rightarrow t = 2$, giving max $v(2) = 2 e^{-1} = 2/e \\approx 0.736$ m s$^{-1}$.
*Step 2 (1 mark):* Sketch shows $v$ rising from 0, peaking at $(2, 2/e)$, then decaying asymptotically to 0.`),

  sq(`Consider $I_n = \\int_0^1 x^n e^{-x} dx$ for non-negative integers $n$.

**a.** Use IBP to show $I_n = -e^{-1} + n I_{n-1}$ for $n \\ge 1$. (4 marks)

**b.** Use the recurrence with $I_0 = 1 - e^{-1}$ to find $I_1$, $I_2$ and $I_3$. (4 marks)

**c.** Find a general closed form for $I_n$. (2 marks)`, 10, "HARD",
    `**a. (4 marks)**
*Step 1 (1 mark):* $u = x^n$, $dv = e^{-x} dx$: $du = n x^{n-1} dx$, $v = -e^{-x}$.
*Step 2 (1 mark):* $I_n = [-x^n e^{-x}]_0^1 + n \\int_0^1 x^{n-1} e^{-x} dx$.
*Step 3 (1 mark):* Boundary: $-1 \\cdot e^{-1} - 0 = -e^{-1}$.
*Step 4 (1 mark):* So $I_n = -e^{-1} + n I_{n-1}$. ✓

**b. (4 marks)**
*Step 1 (1 mark):* $I_0 = 1 - e^{-1}$.
*Step 2 (1 mark):* $I_1 = -e^{-1} + 1 \\cdot (1 - e^{-1}) = 1 - 2 e^{-1}$.
*Step 3 (1 mark):* $I_2 = -e^{-1} + 2(1 - 2e^{-1}) = 2 - 5 e^{-1}$.
*Step 4 (1 mark):* $I_3 = -e^{-1} + 3(2 - 5e^{-1}) = 6 - 16 e^{-1}$.

**c. (2 marks)**
*Step 1 (1 mark):* By induction, $I_n = n! - e^{-1} (n! + n!/1! + n!/2! + \\ldots + n!/(n-1)! + n!/n!)$... Actually $I_n = n! - n! \\sum_{k=0}^{n} 1/k! \\cdot e^{-1}$.
*Step 2 (1 mark):* Simplest closed form: $I_n = n! - e^{-1} \\sum_{k=0}^{n} \\dfrac{n!}{k!}$.`),
];

const out = { mcq, shortAnswer, extendedAnswer, extendedResponse };
fs.writeFileSync("scripts/output/qset-specialist-ibp.json", JSON.stringify(out, null, 2) + "\n");
console.log(`Wrote ${mcq.length} MCQ, ${shortAnswer.length} SHORT, ${extendedAnswer.length} EXT_ANS, ${extendedResponse.length} EXT_RESP to scripts/output/qset-specialist-ibp.json`);
