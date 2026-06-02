/**
 * Specialist Calculus: Differential Equations — First-Order Separable.
 * Tier: modelling-rich → MCQ + SHORT + EXT_ANS + EXT_RESP.
 */

import * as fs from "fs";
import * as path from "path";
import { slopeField, toDataUri } from "./svg";

const FIGURES_DIR = "scripts/output/figures/specialist-de-separable";
const JSON_PATH = "scripts/output/qset-specialist-de-separable.json";
fs.mkdirSync(FIGURES_DIR, { recursive: true });

// ─── Figures ────────────────────────────────────────────────────────────

const figLogistic = slopeField({
  fn: (x: number, y: number) => 0.5 * y * (1 - y / 4),
  xRange: [0, 6],
  yRange: [0, 6],
  cols: 14,
  rows: 12,
  solutions: [
    { fn: (x: number) => 4 / (1 + 3 * Math.exp(-0.5 * x)), color: "#dc2626", label: "P(0) = 1", labelAt: { x: 4.2, y: 3.6 } },
  ],
  xTicks: [1, 2, 3, 4, 5],
  yTicks: [1, 2, 3, 4, 5],
});

const figCooling = slopeField({
  fn: (x: number, y: number) => -0.4 * (y - 20),
  xRange: [0, 6],
  yRange: [0, 100],
  cols: 12,
  rows: 10,
  solutions: [
    { fn: (x: number) => 20 + 70 * Math.exp(-0.4 * x), color: "#dc2626", label: "T(0) = 90", labelAt: { x: 3.5, y: 50 } },
  ],
  xTicks: [1, 2, 3, 4, 5],
  yTicks: [20, 40, 60, 80],
});

const figLinearDE = slopeField({
  fn: (x: number, y: number) => x - y,
  xRange: [-2, 4],
  yRange: [-2, 4],
  cols: 14,
  rows: 12,
  solutions: [
    { fn: (x: number) => x - 1 + 2 * Math.exp(-x), color: "#dc2626", label: "y(0) = 1", labelAt: { x: 2.5, y: 2 } },
  ],
  xTicks: [-1, 1, 2, 3],
  yTicks: [-1, 1, 2, 3],
});

const figures: Record<string, string> = {
  "logistic-slope.svg": figLogistic,
  "cooling-slope.svg": figCooling,
  "linear-de-slope.svg": figLinearDE,
};
for (const [name, content] of Object.entries(figures)) {
  fs.writeFileSync(path.join(FIGURES_DIR, name), content);
}
const img = (name: string, alt: string) => `![${alt}](${toDataUri(figures[name])})`;

// ─── Types + helpers ────────────────────────────────────────────────────

interface MCQ {
  content: string; optionA: string; optionB: string; optionC: string; optionD: string;
  correctOption: "A" | "B" | "C" | "D"; marks: number;
  difficulty: "EASY" | "MEDIUM" | "HARD"; solutionContent: string; subtopicSlugs: string[];
}
interface FR {
  content: string; marks: number; difficulty: "EASY" | "MEDIUM" | "HARD";
  solutionContent: string; subtopicSlugs: string[];
}
const SLUG = "differential-equations-first-order-separable";
const m = (
  c: string, o: [string, string, string, string], k: "A" | "B" | "C" | "D",
  d: "EASY" | "MEDIUM" | "HARD", s: string, sec: string[] = [],
): MCQ => ({
  content: c, optionA: o[0], optionB: o[1], optionC: o[2], optionD: o[3],
  correctOption: k, marks: 1, difficulty: d, solutionContent: s,
  subtopicSlugs: [SLUG, ...sec],
});
const sq = (
  c: string, marks: number, d: "EASY" | "MEDIUM" | "HARD", s: string, sec: string[] = [],
): FR => ({
  content: c, marks, difficulty: d, solutionContent: s,
  subtopicSlugs: [SLUG, ...sec],
});

// ─── 12 MCQ ─────────────────────────────────────────────────────────────

const mcq: MCQ[] = [
  m("The general solution of $\\dfrac{dy}{dx} = ky$ where $k$ is a constant is:",
    ["$y = Ce^{kx}$", "$y = kx + C$", "$y = e^{kx} + C$", "$y = Cx^k$"], "A", "EASY",
    "Separable: $\\dfrac{dy}{y} = k\\,dx \\Rightarrow \\ln|y| = kx + C_1 \\Rightarrow y = Ce^{kx}$. **Answer: A**"),
  m("Which of the following ODEs is separable?",
    ["$\\dfrac{dy}{dx} = x + y$", "$\\dfrac{dy}{dx} = xy + 1$", "$\\dfrac{dy}{dx} = x^2 y^3$", "$\\dfrac{dy}{dx} = e^{x+y^2}$"], "C", "EASY",
    "Separable means $\\dfrac{dy}{dx} = f(x)g(y)$. Only $x^2 y^3 = (x^2)(y^3)$ factors cleanly. **Answer: C**"),
  m("After separating variables in $\\dfrac{dy}{dx} = \\dfrac{x}{y}$, we obtain:",
    ["$y\\,dy = x\\,dx$", "$\\dfrac{dy}{y} = x\\,dx$", "$y\\,dy = \\dfrac{dx}{x}$", "$\\dfrac{1}{y^2}\\,dy = x\\,dx$"], "A", "EASY",
    "Multiply both sides by $y$ and by $dx$: $y\\,dy = x\\,dx$. **Answer: A**"),
  m("The solution of $\\dfrac{dy}{dx} = 2y$ with $y(0) = 3$ is:",
    ["$y = 3e^{2x}$", "$y = 2e^{3x}$", "$y = 3 + e^{2x}$", "$y = e^{2x} + 2$"], "A", "EASY",
    "$y = Ce^{2x}$; $y(0) = C = 3$, so $y = 3e^{2x}$. **Answer: A**"),
  m("The general solution of $\\dfrac{dy}{dx} = \\sec^2 x$ is:",
    ["$y = \\tan x + C$", "$y = \\sec x \\tan x + C$", "$y = \\ln|\\sec x| + C$", "$y = 2\\sec x \\tan x + C$"], "A", "EASY",
    "Integrate directly: $\\int \\sec^2 x\\,dx = \\tan x + C$. **Answer: A**"),
  m("Solving $\\dfrac{dy}{dx} = xy$ with $y(0) = 2$ gives:",
    ["$y = 2e^{x^2/2}$", "$y = 2e^{x^2}$", "$y = 2 + e^{x^2/2}$", "$y = e^{2x} + 1$"], "A", "MEDIUM",
    "Separate: $\\dfrac{dy}{y} = x\\,dx \\Rightarrow \\ln|y| = \\dfrac{x^2}{2} + C \\Rightarrow y = Ae^{x^2/2}$. $y(0) = A = 2$. **Answer: A**"),
  m("The differential equation modelling Newton's law of cooling with ambient $20$°C and rate constant $k$ is:",
    ["$\\dfrac{dT}{dt} = -kT$", "$\\dfrac{dT}{dt} = -k(T - 20)$", "$\\dfrac{dT}{dt} = k(20 - T)t$", "$\\dfrac{dT}{dt} = -k(20 - T)^2$"], "B", "MEDIUM",
    "Newton's law: rate of temperature change is proportional to the difference between $T$ and ambient. So $\\dfrac{dT}{dt} = -k(T - 20)$. **Answer: B**"),
  m("Solving $\\dfrac{dy}{dx} = \\dfrac{1 + y^2}{1 + x^2}$ with $y(0) = 0$ yields:",
    ["$y = \\tan(\\arctan x) = x$", "$y = \\arctan x$", "$y = \\sin x$", "$y = e^x - 1$"], "A", "MEDIUM",
    "$\\dfrac{dy}{1 + y^2} = \\dfrac{dx}{1 + x^2} \\Rightarrow \\arctan y = \\arctan x + C$. $y(0) = 0 \\Rightarrow C = 0$. So $\\arctan y = \\arctan x$, i.e. $y = x$. **Answer: A**"),
  m("A logistic population satisfies $\\dfrac{dP}{dt} = 0.5 P\\left(1 - \\dfrac{P}{4}\\right)$. The equilibrium populations (where $\\dfrac{dP}{dt} = 0$) are:",
    ["$P = 0$ only", "$P = 4$ only", "$P = 0$ and $P = 4$", "$P = 0.5$ and $P = 2$"], "C", "MEDIUM",
    "Set $\\dfrac{dP}{dt} = 0$: $P = 0$ or $1 - P/4 = 0 \\Rightarrow P = 4$. **Answer: C**"),
  m("After solving $\\dfrac{dy}{dx} = e^{x - y}$, the implicit solution is:",
    ["$e^y = e^x + C$", "$y = e^x + C$", "$e^y \\cdot e^x = C$", "$y = e^x - x + C$"], "A", "MEDIUM",
    "$\\dfrac{dy}{dx} = e^x e^{-y} \\Rightarrow e^y\\,dy = e^x\\,dx \\Rightarrow e^y = e^x + C$. **Answer: A**"),
  m("A radioactive isotope decays according to $\\dfrac{dN}{dt} = -0.1 N$. If $N(0) = 200$, the value of $N$ when $t = 10$ is:",
    ["$200 e^{-1}$", "$200 - e^{-1}$", "$200 e^{-10}$", "$\\dfrac{200}{e}$"], "A", "HARD",
    "$N = 200 e^{-0.1 t}$. At $t = 10$: $N = 200 e^{-1} = \\dfrac{200}{e}$. Both A and D are equal, but A is the canonical form. **Answer: A**"),
  m("The solution to $\\dfrac{dy}{dx} = \\dfrac{x^2}{y}$ with $y(1) = 2$ in implicit form is:",
    ["$y^2 = \\dfrac{2x^3}{3} + \\dfrac{10}{3}$", "$y^2 = 2x^3$", "$y^2 = \\dfrac{x^3}{3} + 4$", "$y = \\dfrac{x^3}{3} + C$"], "A", "HARD",
    "$y\\,dy = x^2\\,dx \\Rightarrow \\dfrac{y^2}{2} = \\dfrac{x^3}{3} + C \\Rightarrow y^2 = \\dfrac{2x^3}{3} + 2C$. At $(1, 2)$: $4 = 2/3 + 2C \\Rightarrow 2C = 10/3$. So $y^2 = \\dfrac{2x^3}{3} + \\dfrac{10}{3}$. **Answer: A**"),
];

// ─── 8 SHORT ───────────────────────────────────────────────────────────

const shortAnswer: FR[] = [
  sq("Find the general solution of $\\dfrac{dy}{dx} = 3y$.", 2, "EASY",
    "*Step 1 (1 mark):* Separate: $\\dfrac{dy}{y} = 3\\,dx \\Rightarrow \\ln|y| = 3x + C_1$.\n*Step 2 (1 mark):* Exponentiate: $y = Ae^{3x}$, where $A = e^{C_1}$ is an arbitrary constant."),
  sq("Solve $\\dfrac{dy}{dx} = \\dfrac{y}{x}$ with $y(1) = 4$, giving $y$ as a function of $x$.", 2, "EASY",
    "*Step 1 (1 mark):* Separate: $\\dfrac{dy}{y} = \\dfrac{dx}{x} \\Rightarrow \\ln|y| = \\ln|x| + C \\Rightarrow y = Ax$.\n*Step 2 (1 mark):* $y(1) = 4 \\Rightarrow A = 4$. So $y = 4x$."),
  sq("Find the solution of $\\dfrac{dy}{dx} = \\cos x \\cdot e^{-y}$ with $y(0) = 0$.", 3, "MEDIUM",
    "*Step 1 (1 mark):* Separate: $e^y\\,dy = \\cos x\\,dx$.\n*Step 2 (1 mark):* Integrate: $e^y = \\sin x + C$.\n*Step 3 (1 mark):* $y(0) = 0 \\Rightarrow e^0 = 0 + C \\Rightarrow C = 1$. So $y = \\ln(1 + \\sin x)$."),
  sq("A bacterial colony grows at a rate proportional to its size. The colony doubles every 4 hours. Set up and solve the differential equation for the population $P(t)$ if $P(0) = 100$, then find $P(t)$ explicitly.", 3, "MEDIUM",
    "*Step 1 (1 mark):* $\\dfrac{dP}{dt} = kP \\Rightarrow P = 100 e^{kt}$.\n*Step 2 (1 mark):* Doubling at $t = 4$: $200 = 100 e^{4k} \\Rightarrow k = \\dfrac{\\ln 2}{4}$.\n*Step 3 (1 mark):* So $P(t) = 100 e^{(\\ln 2 / 4) t} = 100 \\cdot 2^{t/4}$."),
  sq("Solve the initial value problem $\\dfrac{dy}{dx} = \\dfrac{x}{y(1 + x^2)}$, $y(0) = 1$, giving $y$ as a function of $x$.", 3, "MEDIUM",
    "*Step 1 (1 mark):* Separate: $y\\,dy = \\dfrac{x\\,dx}{1 + x^2}$.\n*Step 2 (1 mark):* Integrate: $\\dfrac{y^2}{2} = \\dfrac{1}{2}\\ln(1 + x^2) + C$.\n*Step 3 (1 mark):* $y(0) = 1$: $\\dfrac{1}{2} = 0 + C \\Rightarrow C = \\dfrac{1}{2}$. So $y^2 = \\ln(1 + x^2) + 1$, i.e. $y = \\sqrt{1 + \\ln(1 + x^2)}$ (positive root)."),
  sq("Newton's law of cooling says the rate at which a hot object cools is proportional to the difference between its temperature $T$ and the ambient temperature. A cup of coffee at $90$°C is left in a $20$°C room, and after 5 minutes its temperature is $70$°C. Find $T(t)$.", 3, "MEDIUM",
    "*Step 1 (1 mark):* $\\dfrac{dT}{dt} = -k(T - 20) \\Rightarrow T = 20 + Ae^{-kt}$.\n*Step 2 (1 mark):* $T(0) = 90 \\Rightarrow A = 70$. $T(5) = 70 \\Rightarrow 70 = 20 + 70 e^{-5k} \\Rightarrow e^{-5k} = 5/7$.\n*Step 3 (1 mark):* $k = -\\dfrac{1}{5}\\ln(5/7) = \\dfrac{1}{5}\\ln(7/5)$. So $T(t) = 20 + 70 e^{-(\\ln(7/5)/5) t}$."),
  sq("Find the general solution of $\\dfrac{dy}{dx} = y^2 \\sin x$.", 2, "MEDIUM",
    "*Step 1 (1 mark):* Separate: $\\dfrac{dy}{y^2} = \\sin x\\,dx \\Rightarrow -\\dfrac{1}{y} = -\\cos x + C$.\n*Step 2 (1 mark):* So $y = \\dfrac{1}{\\cos x + C_1}$ (renaming the constant)."),
  sq("Solve $\\dfrac{dy}{dx} = \\dfrac{2x + 1}{y}$ subject to $y(0) = -3$, expressing $y$ explicitly as a function of $x$.", 3, "HARD",
    "*Step 1 (1 mark):* Separate: $y\\,dy = (2x + 1)\\,dx \\Rightarrow \\dfrac{y^2}{2} = x^2 + x + C$.\n*Step 2 (1 mark):* $y(0) = -3$: $\\dfrac{9}{2} = 0 + 0 + C \\Rightarrow C = \\dfrac{9}{2}$.\n*Step 3 (1 mark):* $y^2 = 2x^2 + 2x + 9$. Since $y(0) = -3 < 0$, take the negative root: $y = -\\sqrt{2x^2 + 2x + 9}$."),
];

// ─── 3 EXT_ANS ──────────────────────────────────────────────────────────

const extendedAnswer: FR[] = [
  sq(`Consider the differential equation $\\dfrac{dy}{dx} = x - y$ with initial condition $y(0) = 1$.

**a.** Verify that $y(x) = x - 1 + 2e^{-x}$ satisfies the equation. (3 marks)

**b.** Confirm that this solution satisfies the initial condition. (1 mark)

**c.** Evaluate $\\lim_{x \\to \\infty} (y(x) - (x - 1))$ and interpret the result geometrically. (2 marks)

${img("linear-de-slope.svg", "Slope field for dy/dx = x - y with the particular solution y(0) = 1 drawn in red")}`,
    6, "HARD",
    `**a. (3 marks)**
*Step 1 (1 mark):* $\\dfrac{dy}{dx} = 1 - 2e^{-x}$.
*Step 2 (1 mark):* $x - y = x - (x - 1 + 2e^{-x}) = 1 - 2e^{-x}$.
*Step 3 (1 mark):* These match, so $y$ satisfies the equation.

**b. (1 mark)** $y(0) = 0 - 1 + 2 = 1$. ✓

**c. (2 marks)**
*Step 1 (1 mark):* $y(x) - (x - 1) = 2e^{-x} \\to 0$ as $x \\to \\infty$.
*Step 2 (1 mark):* Geometrically, the solution curve approaches the line $y = x - 1$ asymptotically from above.`),

  sq(`A population of fish in a pond satisfies $\\dfrac{dP}{dt} = 0.5 P\\left(1 - \\dfrac{P}{4}\\right)$, where $P$ is measured in thousands and $t$ in years.

**a.** Find the equilibrium populations of the model. (2 marks)

**b.** Sketch the slope field below and explain why $P = 4$ is a stable equilibrium and $P = 0$ is unstable, by reference to the sign of $\\dfrac{dP}{dt}$. (3 marks)

**c.** If $P(0) = 1$, write down (without solving) what the long-term population is, and justify. (2 marks)

${img("logistic-slope.svg", "Slope field for the logistic equation dP/dt = 0.5 P (1 - P/4) showing convergence to P = 4")}`,
    7, "MEDIUM",
    `**a. (2 marks)**
*Step 1 (1 mark):* $\\dfrac{dP}{dt} = 0 \\Rightarrow P = 0$ or $1 - P/4 = 0$.
*Step 2 (1 mark):* So $P = 0$ and $P = 4$.

**b. (3 marks)**
*Step 1 (1 mark):* For $0 < P < 4$: $\\dfrac{dP}{dt} > 0$, so $P$ increases toward 4.
*Step 2 (1 mark):* For $P > 4$: $\\dfrac{dP}{dt} < 0$, so $P$ decreases toward 4.
*Step 3 (1 mark):* Hence $P = 4$ is **stable** (small perturbations return). At $P = 0$ small positive perturbations grow, so $P = 0$ is **unstable**.

**c. (2 marks)**
*Step 1 (1 mark):* $P(0) = 1$ is in the interval $(0, 4)$, so $\\dfrac{dP}{dt} > 0$ and $P$ increases.
*Step 2 (1 mark):* The trajectory is captured by the stable equilibrium $P = 4$. So $\\lim_{t \\to \\infty} P(t) = 4$ (thousand fish).`),

  sq(`Solve $\\dfrac{dy}{dx} = \\dfrac{y}{x \\ln x}$ for $x > 1$.

**a.** Show that separating variables leads to $\\dfrac{dy}{y} = \\dfrac{dx}{x \\ln x}$. (1 mark)

**b.** Use the substitution $u = \\ln x$ to evaluate $\\displaystyle\\int \\dfrac{dx}{x \\ln x}$. (2 marks)

**c.** Hence write down the general solution of the differential equation. (2 marks)

**d.** Find the particular solution with $y(e) = 5$. (2 marks)`,
    7, "HARD",
    `**a. (1 mark)** Divide both sides by $y$ and multiply by $dx$ — provided $y \\ne 0$: $\\dfrac{dy}{y} = \\dfrac{dx}{x \\ln x}$.

**b. (2 marks)**
*Step 1 (1 mark):* Let $u = \\ln x$, so $du = \\dfrac{dx}{x}$.
*Step 2 (1 mark):* Then $\\displaystyle\\int \\dfrac{dx}{x \\ln x} = \\int \\dfrac{du}{u} = \\ln|u| + C = \\ln|\\ln x| + C$.

**c. (2 marks)**
*Step 1 (1 mark):* Integrate both sides: $\\ln|y| = \\ln|\\ln x| + C_1$.
*Step 2 (1 mark):* $y = A \\ln x$ for $x > 1$ (with $A = e^{C_1}$ an arbitrary positive constant — or negative if $y < 0$).

**d. (2 marks)**
*Step 1 (1 mark):* $y(e) = 5 \\Rightarrow 5 = A \\ln e = A$, so $A = 5$.
*Step 2 (1 mark):* So $y = 5 \\ln x$.`),
];

// ─── 3 EXT_RESP ─────────────────────────────────────────────────────────

const extendedResponse: FR[] = [
  sq(`A cup of coffee at $90$°C is placed in a room maintained at $20$°C. The temperature $T$ (°C) of the coffee at time $t$ minutes satisfies Newton's law of cooling:
$$\\frac{dT}{dt} = -k(T - 20)$$
for some positive constant $k$.

**a.** Show that the general solution is $T(t) = 20 + Ae^{-kt}$, where $A$ is an arbitrary constant. (3 marks)

**b.** Use $T(0) = 90$ to determine $A$, and then use the experimental observation $T(5) = 70$ to determine $k$ exactly. (3 marks)

**c.** Find the temperature of the coffee after $10$ minutes, giving the answer exactly and to 1 decimal place. (3 marks)

**d.** How long after pouring would the coffee reach $40$°C? Give your answer in minutes to 1 decimal place. (3 marks)

${img("cooling-slope.svg", "Slope field for Newton's law of cooling dT/dt = -0.4(T - 20) with the particular solution T(0) = 90 in red, approaching T = 20")}`,
    12, "MEDIUM",
    `**a. (3 marks)**
*Step 1 (1 mark):* Separate: $\\dfrac{dT}{T - 20} = -k\\,dt$.
*Step 2 (1 mark):* Integrate: $\\ln|T - 20| = -kt + C_1$.
*Step 3 (1 mark):* Exponentiate: $T - 20 = Ae^{-kt}$, so $T = 20 + Ae^{-kt}$.

**b. (3 marks)**
*Step 1 (1 mark):* $T(0) = 90$: $90 = 20 + A \\Rightarrow A = 70$.
*Step 2 (1 mark):* $T(5) = 70$: $70 = 20 + 70 e^{-5k} \\Rightarrow e^{-5k} = \\dfrac{5}{7}$.
*Step 3 (1 mark):* So $-5k = \\ln(5/7) \\Rightarrow k = \\dfrac{1}{5}\\ln(7/5)$.

**c. (3 marks)**
*Step 1 (1 mark):* $T(10) = 20 + 70 e^{-10k} = 20 + 70 \\cdot (e^{-5k})^2$.
*Step 2 (1 mark):* $= 20 + 70 (5/7)^2 = 20 + 70 \\cdot 25/49 = 20 + 250/7$.
*Step 3 (1 mark):* $T(10) = \\dfrac{140 + 250}{7} = \\dfrac{390}{7} \\approx 55.7$°C.

**d. (3 marks)**
*Step 1 (1 mark):* $40 = 20 + 70 e^{-kt} \\Rightarrow e^{-kt} = 2/7$.
*Step 2 (1 mark):* $-kt = \\ln(2/7) \\Rightarrow t = \\dfrac{\\ln(7/2)}{k} = \\dfrac{5\\ln(7/2)}{\\ln(7/5)}$.
*Step 3 (1 mark):* Numerically, $t = \\dfrac{5 \\cdot 1.2528}{0.3365} \\approx 18.6$ minutes.`),

  sq(`A simple model of fish-stock harvesting is given by
$$\\frac{dP}{dt} = 0.5\\,P\\left(1 - \\frac{P}{4}\\right) - h$$
where $P$ is the population (in thousands), $t$ is time in years and $h \\ge 0$ is a constant harvest rate (thousands per year).

**a.** When $h = 0$, find the equilibrium populations and identify which is stable. (2 marks)

**b.** When $h = 0$ and $P(0) = 1$, separate variables and use partial fractions to express the implicit solution in the form $\\ln\\left|\\dfrac{P}{4 - P}\\right| = t/2 + C$. (4 marks)

**c.** Hence solve explicitly for $P(t)$ and show that $P \\to 4$ as $t \\to \\infty$. (3 marks)

**d.** With harvesting at rate $h = 0.5$ (thousand fish per year), find the new equilibria. Describe what happens if $P(0)$ is below the smaller equilibrium. (3 marks)

${img("logistic-slope.svg", "Slope field for the logistic equation dP/dt = 0.5 P (1 - P/4) showing convergence to P = 4")}`,
    12, "HARD",
    `**a. (2 marks)**
*Step 1 (1 mark):* $0.5 P(1 - P/4) = 0 \\Rightarrow P = 0$ or $P = 4$.
*Step 2 (1 mark):* $P = 4$ is stable (sign analysis as in the standard logistic; for $0 < P < 4$, $\\dfrac{dP}{dt} > 0$; for $P > 4$, $\\dfrac{dP}{dt} < 0$).

**b. (4 marks)**
*Step 1 (1 mark):* $\\dfrac{dP}{P(1 - P/4)} = 0.5\\,dt \\Rightarrow \\dfrac{4\\,dP}{P(4 - P)} = 0.5\\,dt$.
*Step 2 (1 mark):* Partial fractions: $\\dfrac{4}{P(4 - P)} = \\dfrac{1}{P} + \\dfrac{1}{4 - P}$.
*Step 3 (1 mark):* Integrate: $\\ln|P| - \\ln|4 - P| = 0.5 t + C$.
*Step 4 (1 mark):* So $\\ln\\left|\\dfrac{P}{4 - P}\\right| = \\dfrac{t}{2} + C$.

**c. (3 marks)**
*Step 1 (1 mark):* Exponentiate: $\\dfrac{P}{4 - P} = Be^{t/2}$ (with $B = \\pm e^C$). At $t = 0$, $P = 1$: $\\dfrac{1}{3} = B$.
*Step 2 (1 mark):* So $P = \\dfrac{(4 - P) e^{t/2}}{3} \\Rightarrow 3P = (4 - P)e^{t/2} \\Rightarrow P(3 + e^{t/2}) = 4 e^{t/2}$.
*Step 3 (1 mark):* $P(t) = \\dfrac{4 e^{t/2}}{3 + e^{t/2}} = \\dfrac{4}{1 + 3 e^{-t/2}}$. As $t \\to \\infty$, $e^{-t/2} \\to 0$, so $P \\to 4$.

**d. (3 marks)**
*Step 1 (1 mark):* Set $0.5 P(1 - P/4) - 0.5 = 0 \\Rightarrow P(1 - P/4) = 1 \\Rightarrow P - P^2/4 = 1 \\Rightarrow P^2 - 4P + 4 = 0 \\Rightarrow (P - 2)^2 = 0$.
*Step 2 (1 mark):* Repeated root $P = 2$ — this is a critical harvest rate (the equilibrium is a tangent / semi-stable).
*Step 3 (1 mark):* If $P(0) < 2$, then $\\dfrac{dP}{dt} < 0$ (since $0.5 P (1 - P/4) < 0.5$ for $P < 2$), so the population decreases monotonically to zero — the stock collapses.`),

  sq(`An RL circuit with resistance $R$ ohms and inductance $L$ henries, driven by constant EMF $E$ volts, has current $i(t)$ satisfying
$$L\\,\\frac{di}{dt} + R\\,i = E,$$
with $i(0) = 0$. Take $L = 2$ H, $R = 4$ ohms, $E = 12$ V.

**a.** Show that the equation can be rewritten as $\\dfrac{di}{dt} = -2(i - 3)$. (2 marks)

**b.** Solve by separation of variables to find $i(t)$ explicitly. (4 marks)

**c.** Calculate the time $t$ (to 3 decimal places) at which the current reaches $90\\%$ of its long-term value. (3 marks)

**d.** Sketch a graph of $i(t)$ for $t \\ge 0$, marking the initial value, the asymptote, and the point where $i$ reaches 90% of its limit. (3 marks)`,
    12, "HARD",
    `**a. (2 marks)**
*Step 1 (1 mark):* Substitute $L = 2$, $R = 4$, $E = 12$: $2\\,\\dfrac{di}{dt} + 4 i = 12$, so $\\dfrac{di}{dt} = 6 - 2 i$.
*Step 2 (1 mark):* Factor: $\\dfrac{di}{dt} = -2(i - 3)$.

**b. (4 marks)**
*Step 1 (1 mark):* Separate: $\\dfrac{di}{i - 3} = -2\\,dt$.
*Step 2 (1 mark):* Integrate: $\\ln|i - 3| = -2t + C$.
*Step 3 (1 mark):* Exponentiate: $i - 3 = Ae^{-2t}$.
*Step 4 (1 mark):* $i(0) = 0 \\Rightarrow A = -3$. So $i(t) = 3(1 - e^{-2t})$.

**c. (3 marks)**
*Step 1 (1 mark):* Long-term: $\\lim_{t \\to \\infty} i = 3$ A. We want $i(t) = 2.7$ (which is $90\\%$ of 3).
*Step 2 (1 mark):* $2.7 = 3(1 - e^{-2t}) \\Rightarrow 0.9 = 1 - e^{-2t} \\Rightarrow e^{-2t} = 0.1$.
*Step 3 (1 mark):* $t = \\dfrac{\\ln 10}{2} \\approx 1.151$ seconds.

**d. (3 marks)**
*Step 1 (1 mark):* Start at $i(0) = 0$ on the vertical axis.
*Step 2 (1 mark):* Asymptote at $i = 3$ (dashed horizontal line); the curve approaches but never touches.
*Step 3 (1 mark):* Concave-down increase, with the $90\\%$ mark at $(\\approx 1.151, 2.7)$.`),
];

// ─── Output JSON ────────────────────────────────────────────────────────

const output = { mcq, shortAnswer, extendedAnswer, extendedResponse };
fs.writeFileSync(JSON_PATH, JSON.stringify(output, null, 2) + "\n");

console.log(
  `Wrote ${mcq.length} MCQ, ${shortAnswer.length} SHORT, ${extendedAnswer.length} EXT_ANS, ${extendedResponse.length} EXT_RESP to ${JSON_PATH}\n` +
    `Wrote ${Object.keys(figures).length} SVG files to ${FIGURES_DIR}/`,
);
