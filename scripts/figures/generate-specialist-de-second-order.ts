/**
 * Specialist Calculus: Differential Equations — Second-Order.
 * Tier: modelling-rich → MCQ + SHORT + EXT_ANS + EXT_RESP.
 * Topics: constant-coefficient homogeneous, simple harmonic motion,
 * direct double integration $d^2 y/dx^2 = f(x)$.
 */

import * as fs from "fs";
import * as path from "path";
import { functionPlot, toDataUri } from "./svg";

const FIGURES_DIR = "scripts/output/figures/specialist-de-second-order";
const JSON_PATH = "scripts/output/qset-specialist-de-second-order.json";
fs.mkdirSync(FIGURES_DIR, { recursive: true });

// ─── Figures ────────────────────────────────────────────────────────────

const figSHM = functionPlot({
  fn: (t: number) => 3 * Math.cos(2 * t),
  xRange: [0, 2 * Math.PI],
  yRange: [-4, 4],
  fnLabel: "x(t) = 3 cos(2t)",
  fnLabelAt: { x: 4.5, y: 3.5 },
  color: "#dc2626",
  xLabel: "t",
  yLabel: "x",
  xTicks: [Math.PI / 2, Math.PI, (3 * Math.PI) / 2, 2 * Math.PI],
  yTicks: [-3, -2, -1, 1, 2, 3],
});

const figDamped = functionPlot({
  fn: (t: number) => 3 * Math.exp(-0.3 * t) * Math.cos(2 * t),
  xRange: [0, 8],
  yRange: [-3.5, 3.5],
  fnLabel: "damped oscillation",
  fnLabelAt: { x: 4, y: 2.5 },
  color: "#dc2626",
  xLabel: "t",
  yLabel: "x",
  xTicks: [2, 4, 6, 8],
  yTicks: [-3, -2, -1, 1, 2, 3],
  additionalFns: [
    { fn: (t: number) => 3 * Math.exp(-0.3 * t), color: "#9ca3af", width: 1 },
    { fn: (t: number) => -3 * Math.exp(-0.3 * t), color: "#9ca3af", width: 1 },
  ],
});

const figProjectile = functionPlot({
  fn: (t: number) => 20 * t - 4.9 * t * t,
  xRange: [0, 4.2],
  yRange: [-2, 22],
  fnLabel: "y(t) = 20t - 4.9t²",
  fnLabelAt: { x: 1.5, y: 18 },
  color: "#dc2626",
  xLabel: "t (s)",
  yLabel: "y (m)",
  xTicks: [1, 2, 3, 4],
  yTicks: [5, 10, 15, 20],
});

const figures: Record<string, string> = {
  "shm.svg": figSHM,
  "damped.svg": figDamped,
  "projectile.svg": figProjectile,
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
const SLUG = "differential-equations-second-order";
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
  m("The general solution of $\\dfrac{d^2 y}{dx^2} = 0$ is:",
    ["$y = C$ constant", "$y = Cx$", "$y = Ax + B$", "$y = Ax^2 + Bx + C$"], "C", "EASY",
    "Integrate twice: $\\dfrac{dy}{dx} = A$, $y = Ax + B$. **Answer: C**"),
  m("Solving $\\dfrac{d^2 y}{dx^2} = 6$ gives the general solution:",
    ["$y = 6x^2$", "$y = 3x^2 + C$", "$y = 3x^2 + Ax + B$", "$y = 6x + Ax + B$"], "C", "EASY",
    "Integrate: $\\dfrac{dy}{dx} = 6x + A$. Again: $y = 3x^2 + Ax + B$. **Answer: C**"),
  m("The function $y = \\cos(3t)$ satisfies which equation?",
    ["$\\dfrac{d^2 y}{dt^2} = 3 y$", "$\\dfrac{d^2 y}{dt^2} = -3 y$", "$\\dfrac{d^2 y}{dt^2} = 9 y$", "$\\dfrac{d^2 y}{dt^2} = -9 y$"], "D", "EASY",
    "$y'' = -9 \\cos(3t) = -9 y$. **Answer: D**"),
  m("Simple harmonic motion has $\\dfrac{d^2 x}{dt^2} = -\\omega^2 x$. The angular frequency $\\omega$ for $\\dfrac{d^2 x}{dt^2} = -25 x$ is:",
    ["$5$", "$25$", "$\\sqrt 5$", "$\\dfrac{1}{5}$"], "A", "EASY",
    "$\\omega^2 = 25 \\Rightarrow \\omega = 5$. **Answer: A**"),
  m("$\\dfrac{d^2 y}{dx^2} = e^x$ has general solution:",
    ["$y = e^x$", "$y = e^x + C$", "$y = e^x + Ax + B$", "$y = e^x + A + B$"], "C", "EASY",
    "Integrate twice: $y' = e^x + A$, $y = e^x + Ax + B$. **Answer: C**"),
  m("A particle starts at rest at $x = 2$ and satisfies $\\dfrac{d^2 x}{dt^2} = -4 x$ (SHM). Its solution is:",
    ["$x = 2\\cos(2t)$", "$x = 2\\sin(2t)$", "$x = 2\\cos(4t)$", "$x = 2e^{-2t}$"], "A", "MEDIUM",
    "$\\omega = 2$, general $x = A\\cos(2t) + B\\sin(2t)$. $x(0) = 2 \\Rightarrow A = 2$. $\\dot x = -2A\\sin + 2B\\cos$, $\\dot x(0) = 0 \\Rightarrow B = 0$. So $x = 2\\cos(2t)$. **Answer: A**"),
  m("The amplitude of the SHM $x = 3\\cos(2t) + 4\\sin(2t)$ is:",
    ["$3$", "$4$", "$7$", "$5$"], "D", "MEDIUM",
    "Amplitude $= \\sqrt{3^2 + 4^2} = 5$. **Answer: D**"),
  m("The period of the SHM $x(t) = 6\\cos(\\pi t)$ is:",
    ["$1$", "$2$", "$\\pi$", "$2\\pi$"], "B", "MEDIUM",
    "$\\omega = \\pi$, period $T = 2\\pi/\\omega = 2$. **Answer: B**"),
  m("$\\dfrac{d^2 y}{dx^2} = \\sin x$ with $y(0) = 0$ and $y'(0) = 0$ gives:",
    ["$y = -\\sin x + x$", "$y = \\sin x + x$", "$y = -\\sin x$", "$y = \\sin x - x$"], "A", "MEDIUM",
    "Integrate: $y' = -\\cos x + A$. $y'(0) = -1 + A = 0 \\Rightarrow A = 1$. So $y' = -\\cos x + 1$. Integrate: $y = -\\sin x + x + B$. $y(0) = 0 + 0 + B = 0 \\Rightarrow B = 0$. So $y = -\\sin x + x$. **Answer: A**"),
  m("The general solution of $\\dfrac{d^2 y}{dt^2} + 9 y = 0$ is:",
    ["$y = Ae^{3t} + Be^{-3t}$", "$y = A\\cos(3t) + B\\sin(3t)$", "$y = A\\cos(9t) + B\\sin(9t)$", "$y = (A + Bt)e^{3t}$"], "B", "MEDIUM",
    "Characteristic equation $\\lambda^2 + 9 = 0 \\Rightarrow \\lambda = \\pm 3i$, giving $y = A\\cos(3t) + B\\sin(3t)$. **Answer: B**"),
  m("A mass on a spring satisfies $\\dfrac{d^2 x}{dt^2} = -\\omega^2 x$. If the period is $\\pi$ seconds, then $\\omega$ equals:",
    ["$2$", "$\\pi$", "$1$", "$2\\pi$"], "A", "HARD",
    "$T = 2\\pi/\\omega = \\pi \\Rightarrow \\omega = 2$. **Answer: A**"),
  m("A particle in SHM has maximum displacement $5$ m and maximum speed $10$ m/s. The angular frequency $\\omega$ is:",
    ["$0.5$", "$\\dfrac{1}{2}$", "$2$", "$50$"], "C", "HARD",
    "For SHM, $v_{\\max} = \\omega A$. So $10 = \\omega \\cdot 5 \\Rightarrow \\omega = 2$ rad/s. **Answer: C**"),
];

// ─── 8 SHORT ───────────────────────────────────────────────────────────

const shortAnswer: FR[] = [
  sq("Find the general solution of $\\dfrac{d^2 y}{dx^2} = 12 x$.", 2, "EASY",
    "*Step 1 (1 mark):* Integrate once: $\\dfrac{dy}{dx} = 6x^2 + A$.\n*Step 2 (1 mark):* Integrate again: $y = 2x^3 + Ax + B$."),
  sq("Solve $\\dfrac{d^2 y}{dx^2} = \\cos x$ with $y(0) = 1$ and $y'(0) = 2$.", 3, "MEDIUM",
    "*Step 1 (1 mark):* Integrate: $\\dfrac{dy}{dx} = \\sin x + A$. $y'(0) = 0 + A = 2 \\Rightarrow A = 2$.\n*Step 2 (1 mark):* Integrate again: $y = -\\cos x + 2x + B$.\n*Step 3 (1 mark):* $y(0) = -1 + 0 + B = 1 \\Rightarrow B = 2$. So $y = -\\cos x + 2x + 2$."),
  sq("Verify that $y = e^{2x}$ satisfies $\\dfrac{d^2 y}{dx^2} - 4y = 0$, and write down the general solution.", 3, "MEDIUM",
    "*Step 1 (1 mark):* $\\dfrac{dy}{dx} = 2 e^{2x}$, $\\dfrac{d^2 y}{dx^2} = 4 e^{2x}$.\n*Step 2 (1 mark):* Substitute: $4 e^{2x} - 4 e^{2x} = 0$ ✓.\n*Step 3 (1 mark):* The characteristic equation $\\lambda^2 - 4 = 0$ gives $\\lambda = \\pm 2$, so the general solution is $y = Ae^{2x} + Be^{-2x}$."),
  sq("A particle moves on a line with displacement $x(t)$ satisfying $\\ddot x = -16 x$. At $t = 0$, $x = 3$ and $\\dot x = 0$. Find $x(t)$.", 3, "MEDIUM",
    "*Step 1 (1 mark):* $\\omega^2 = 16 \\Rightarrow \\omega = 4$. General solution: $x = A\\cos(4t) + B\\sin(4t)$.\n*Step 2 (1 mark):* $x(0) = 3 \\Rightarrow A = 3$.\n*Step 3 (1 mark):* $\\dot x(t) = -12\\sin(4t) + 4B\\cos(4t)$. $\\dot x(0) = 4B = 0 \\Rightarrow B = 0$. So $x(t) = 3\\cos(4t)$."),
  sq("Find the amplitude and period of the SHM $x(t) = 5\\cos(3t) + 12\\sin(3t)$.", 3, "MEDIUM",
    "*Step 1 (1 mark):* Amplitude $A = \\sqrt{5^2 + 12^2} = 13$.\n*Step 2 (1 mark):* $\\omega = 3$, so period $T = \\dfrac{2\\pi}{3}$.\n*Step 3 (1 mark):* Can write $x = 13\\cos(3t - \\phi)$ where $\\tan\\phi = 12/5$, but amplitude and period are 13 and $2\\pi/3$."),
  sq("Show that if $x = A\\cos(\\omega t) + B\\sin(\\omega t)$, then $\\ddot x + \\omega^2 x = 0$.", 2, "MEDIUM",
    "*Step 1 (1 mark):* $\\dot x = -A\\omega\\sin(\\omega t) + B\\omega\\cos(\\omega t)$, $\\ddot x = -A\\omega^2\\cos(\\omega t) - B\\omega^2\\sin(\\omega t) = -\\omega^2 x$.\n*Step 2 (1 mark):* Therefore $\\ddot x + \\omega^2 x = 0$. ✓"),
  sq("A particle moves so that $\\ddot x = -9.8$ (gravity acting downward) with $x(0) = 0$ and $\\dot x(0) = 20$ m/s upward. Find $x(t)$ and the time at which $\\dot x = 0$ (maximum height).", 3, "MEDIUM",
    "*Step 1 (1 mark):* Integrate: $\\dot x = -9.8 t + 20$.\n*Step 2 (1 mark):* Integrate again: $x = -4.9 t^2 + 20 t$ (using $x(0) = 0$).\n*Step 3 (1 mark):* $\\dot x = 0 \\Rightarrow t = \\dfrac{20}{9.8} \\approx 2.04$ seconds."),
  sq("The general solution of $\\ddot x + 4\\dot x + 4 x = 0$ involves a repeated root. Find $\\lambda$ and write down the general solution.", 3, "HARD",
    "*Step 1 (1 mark):* Characteristic equation: $\\lambda^2 + 4\\lambda + 4 = 0 \\Rightarrow (\\lambda + 2)^2 = 0$.\n*Step 2 (1 mark):* Repeated root $\\lambda = -2$.\n*Step 3 (1 mark):* General solution: $x(t) = (A + Bt) e^{-2t}$."),
];

// ─── 3 EXT_ANS ──────────────────────────────────────────────────────────

const extendedAnswer: FR[] = [
  sq(`A particle moves in a straight line so that its acceleration satisfies $\\ddot x = -4 x$, where $x$ is the displacement from a fixed point. Initially, $x(0) = 0$ and $\\dot x(0) = 6$ m/s.

**a.** Show that $x(t) = 3\\sin(2t)$ satisfies the differential equation and the initial conditions. (3 marks)

**b.** Find the period and amplitude of the motion. (2 marks)

**c.** Determine the times in $[0, \\pi]$ at which the particle is momentarily at rest. (2 marks)

${img("shm.svg", "Graph of SHM with x(t) = 3 cos(2t) showing periodic oscillation")}`,
    7, "MEDIUM",
    `**a. (3 marks)**
*Step 1 (1 mark):* $\\dot x = 6\\cos(2t)$, $\\ddot x = -12\\sin(2t) = -4 \\cdot 3\\sin(2t) = -4 x$ ✓.
*Step 2 (1 mark):* $x(0) = 3\\sin 0 = 0$ ✓.
*Step 3 (1 mark):* $\\dot x(0) = 6\\cos 0 = 6$ ✓.

**b. (2 marks)**
*Step 1 (1 mark):* Period $T = \\dfrac{2\\pi}{\\omega} = \\dfrac{2\\pi}{2} = \\pi$.
*Step 2 (1 mark):* Amplitude $= 3$.

**c. (2 marks)**
*Step 1 (1 mark):* At rest means $\\dot x = 0 \\Rightarrow \\cos(2t) = 0 \\Rightarrow 2t = \\dfrac{\\pi}{2}, \\dfrac{3\\pi}{2}$.
*Step 2 (1 mark):* So $t = \\dfrac{\\pi}{4}, \\dfrac{3\\pi}{4}$ in $[0, \\pi]$.`),

  sq(`Consider the second-order ODE $\\ddot y - 5\\dot y + 6 y = 0$.

**a.** Write down the characteristic equation and find its roots. (2 marks)

**b.** Hence write down the general solution. (2 marks)

**c.** Find the particular solution with $y(0) = 1$ and $\\dot y(0) = 0$. (3 marks)`,
    7, "MEDIUM",
    `**a. (2 marks)**
*Step 1 (1 mark):* Characteristic equation: $\\lambda^2 - 5\\lambda + 6 = 0$.
*Step 2 (1 mark):* Factor: $(\\lambda - 2)(\\lambda - 3) = 0 \\Rightarrow \\lambda = 2, 3$.

**b. (2 marks)**
*Step 1 (1 mark):* Distinct real roots, so general solution is $y(t) = A e^{2t} + B e^{3t}$.
*Step 2 (1 mark):* (Each independent exponential basis function comes from one root.)

**c. (3 marks)**
*Step 1 (1 mark):* $y(0) = A + B = 1$.
*Step 2 (1 mark):* $\\dot y = 2 A e^{2t} + 3 B e^{3t}$; $\\dot y(0) = 2A + 3B = 0 \\Rightarrow B = -\\dfrac{2}{3} A$.
*Step 3 (1 mark):* Substituting: $A - \\dfrac{2}{3} A = 1 \\Rightarrow A = 3$, $B = -2$. So $y(t) = 3 e^{2t} - 2 e^{3t}$.`),

  sq(`A projectile launched vertically upward from ground level satisfies $\\ddot y = -g$ where $g = 9.8$ m/s² is the acceleration due to gravity. The initial velocity is $u$ m/s (upward).

**a.** Integrate twice to find $y(t)$ in terms of $u$, $g$, and $t$. (3 marks)

**b.** Show that the maximum height is reached at $t = u/g$, and find that maximum height in terms of $u$ and $g$. (3 marks)

**c.** For $u = 20$ m/s, find the time of flight (the time at which $y = 0$ again) and the maximum height to one decimal place. (2 marks)

${img("projectile.svg", "Parabolic projectile trajectory y(t) = 20t - 4.9t² showing the height vs time")}`,
    8, "MEDIUM",
    `**a. (3 marks)**
*Step 1 (1 mark):* $\\dot y = -gt + u$ (using $\\dot y(0) = u$).
*Step 2 (1 mark):* Integrate: $y = -\\dfrac{1}{2} g t^2 + u t + C$.
*Step 3 (1 mark):* $y(0) = 0 \\Rightarrow C = 0$, so $y(t) = u t - \\dfrac{1}{2} g t^2$.

**b. (3 marks)**
*Step 1 (1 mark):* Maximum height when $\\dot y = 0$: $-g t + u = 0 \\Rightarrow t = u/g$.
*Step 2 (1 mark):* Substitute into $y$: $y_{\\max} = u(u/g) - \\dfrac{1}{2} g (u/g)^2$.
*Step 3 (1 mark):* $= \\dfrac{u^2}{g} - \\dfrac{u^2}{2g} = \\dfrac{u^2}{2g}$.

**c. (2 marks)**
*Step 1 (1 mark):* Time of flight: $y = 0 \\Rightarrow t(u - \\dfrac{1}{2} g t) = 0$, so $t = 0$ or $t = \\dfrac{2u}{g} = \\dfrac{40}{9.8} \\approx 4.1$ s.
*Step 2 (1 mark):* Maximum height: $y_{\\max} = \\dfrac{u^2}{2g} = \\dfrac{400}{19.6} \\approx 20.4$ m.`),
];

// ─── 3 EXT_RESP ─────────────────────────────────────────────────────────

const extendedResponse: FR[] = [
  sq(`A mass of $0.5$ kg is attached to a horizontal spring of stiffness $k = 2$ N/m on a smooth surface. The mass is displaced $x_0 = 0.3$ m from equilibrium and released from rest at $t = 0$.

**a.** Show that the equation of motion is $\\ddot x = -4 x$ (with $x$ in metres, $t$ in seconds). (2 marks)

**b.** Solve the equation subject to the initial conditions to find $x(t)$. (3 marks)

**c.** Find the period $T$, amplitude $A$, and maximum speed of the mass. (3 marks)

**d.** At what times $t \\in [0, \\pi]$ is the mass at $x = 0$? Describe what is happening physically. (2 marks)

**e.** Now suppose damping is added so that $\\ddot x + 0.6 \\dot x + 4 x = 0$. Without solving, describe qualitatively how the motion changes from the undamped case, and sketch a typical solution. (2 marks)

${img("damped.svg", "Damped oscillation x(t) = 3 e^(-0.3t) cos(2t) showing amplitude decay envelope")}`,
    12, "MEDIUM",
    `**a. (2 marks)**
*Step 1 (1 mark):* Newton's 2nd law: $m\\ddot x = -k x$ for a Hookean spring.
*Step 2 (1 mark):* So $0.5 \\ddot x = -2 x \\Rightarrow \\ddot x = -4 x$, with $\\omega^2 = 4$.

**b. (3 marks)**
*Step 1 (1 mark):* General solution: $x(t) = A \\cos(2t) + B \\sin(2t)$.
*Step 2 (1 mark):* $x(0) = 0.3 \\Rightarrow A = 0.3$.
*Step 3 (1 mark):* $\\dot x(0) = 0 \\Rightarrow 2B = 0 \\Rightarrow B = 0$. So $x(t) = 0.3 \\cos(2t)$.

**c. (3 marks)**
*Step 1 (1 mark):* Period $T = \\dfrac{2\\pi}{\\omega} = \\pi$ seconds.
*Step 2 (1 mark):* Amplitude = $0.3$ m.
*Step 3 (1 mark):* Maximum speed $= A\\omega = 0.3 \\cdot 2 = 0.6$ m/s.

**d. (2 marks)**
*Step 1 (1 mark):* $0.3 \\cos(2t) = 0 \\Rightarrow 2t = \\pi/2, 3\\pi/2 \\Rightarrow t = \\pi/4, 3\\pi/4$.
*Step 2 (1 mark):* At these times the mass is passing through equilibrium with maximum speed (kinetic energy is largest there).

**e. (2 marks)**
*Step 1 (1 mark):* The damping term $0.6\\dot x$ removes energy from the system; the amplitude decreases exponentially over time.
*Step 2 (1 mark):* Roots: $\\lambda = \\dfrac{-0.6 \\pm \\sqrt{0.36 - 16}}{2} = -0.3 \\pm i\\sqrt{3.91}$ — complex with negative real part, so $x(t) = e^{-0.3 t}(A\\cos(\\sqrt{3.91}\\,t) + B\\sin(\\sqrt{3.91}\\,t))$: damped oscillation with envelope $\\propto e^{-0.3 t}$.`),

  sq(`A vertical pole of unit cross-section is rotating with constant angular speed $\\omega$ rad/s about its axis. A small bead of mass $m$ slides without friction along a horizontal rod attached perpendicular to the pole, at a distance $x$ from the axis. The bead's equation of motion (in the rotating frame) is
$$\\ddot x = \\omega^2 x$$ (centrifugal force only).

**a.** Identify the type of ODE and write down its general solution. (2 marks)

**b.** If $\\omega = 3$ rad/s, the bead is released from rest at $x_0 = 0.1$ m at $t = 0$. Solve for $x(t)$. (3 marks)

**c.** Find the time $t^*$ at which the bead reaches $x = 0.5$ m, giving an exact answer. (3 marks)

**d.** Compute $\\dot x(t^*)$, the speed at that moment. (2 marks)

**e.** Explain why this motion is qualitatively different from the simple harmonic motion of a mass on a spring, given the sign of the coefficient of $x$ in the ODE. (2 marks)`,
    12, "HARD",
    `**a. (2 marks)**
*Step 1 (1 mark):* This is a linear second-order ODE with characteristic equation $\\lambda^2 - \\omega^2 = 0$, giving $\\lambda = \\pm \\omega$.
*Step 2 (1 mark):* General solution: $x(t) = A e^{\\omega t} + B e^{-\\omega t}$. Equivalently, $x(t) = C\\cosh(\\omega t) + D\\sinh(\\omega t)$.

**b. (3 marks)**
*Step 1 (1 mark):* With $\\omega = 3$: $x(t) = A e^{3t} + B e^{-3t}$, or equivalently $x(t) = C\\cosh(3t) + D\\sinh(3t)$.
*Step 2 (1 mark):* $x(0) = 0.1 \\Rightarrow C = 0.1$.
*Step 3 (1 mark):* $\\dot x(0) = 3D = 0 \\Rightarrow D = 0$. So $x(t) = 0.1 \\cosh(3t)$.

**c. (3 marks)**
*Step 1 (1 mark):* $0.1 \\cosh(3 t^*) = 0.5 \\Rightarrow \\cosh(3 t^*) = 5$.
*Step 2 (1 mark):* $3 t^* = \\cosh^{-1}(5) = \\ln(5 + \\sqrt{24}) = \\ln(5 + 2\\sqrt 6)$.
*Step 3 (1 mark):* $t^* = \\dfrac{\\ln(5 + 2\\sqrt 6)}{3}$.

**d. (2 marks)**
*Step 1 (1 mark):* $\\dot x(t) = 0.3\\sinh(3t)$. At $t^*$, $\\cosh(3t^*) = 5$, so $\\sinh(3t^*) = \\sqrt{25 - 1} = \\sqrt{24} = 2\\sqrt 6$.
*Step 2 (1 mark):* $\\dot x(t^*) = 0.3 \\cdot 2\\sqrt 6 = 0.6\\sqrt 6 \\approx 1.47$ m/s.

**e. (2 marks)**
*Step 1 (1 mark):* The SHM equation has the form $\\ddot x = -\\omega^2 x$ (negative coefficient — a restoring force).
*Step 2 (1 mark):* Here $\\ddot x = +\\omega^2 x$ (positive coefficient — a repelling force away from the axis), giving exponential growth ($\\cosh, \\sinh$) rather than oscillation. The bead moves outward indefinitely (until reaching the end of the rod).`),

  sq(`A car suspension is modelled by the second-order linear ODE
$$\\ddot x + 2c\\,\\dot x + \\omega_0^2\\,x = 0,$$
where $x$ is vertical displacement, $\\omega_0 = 5$ rad/s and $c \\ge 0$ is the damping coefficient (per kg-mass).

**a.** Find the discriminant of the characteristic equation in terms of $c$ and $\\omega_0$. State the condition on $c$ that gives **underdamped** behaviour. (2 marks)

**b.** When $c = 3$ (so $c^2 < \\omega_0^2$, underdamped), find the characteristic roots in the form $-c \\pm i\\nu$ for some $\\nu > 0$. (2 marks)

**c.** Hence write down the general underdamped solution. Specify the *damping envelope* and the *damped angular frequency*. (3 marks)

**d.** For $c = 5$, find the critical-damping repeated root, and write down the corresponding general solution. (2 marks)

**e.** For $c = 7$ (overdamped), find both real characteristic roots and write down the general solution. (3 marks)`,
    12, "HARD",
    `**a. (2 marks)**
*Step 1 (1 mark):* Characteristic: $\\lambda^2 + 2c\\lambda + \\omega_0^2 = 0 \\Rightarrow \\lambda = -c \\pm \\sqrt{c^2 - \\omega_0^2}$. Discriminant = $4(c^2 - \\omega_0^2)$.
*Step 2 (1 mark):* Underdamped when $c^2 < \\omega_0^2$, i.e. $0 \\le c < \\omega_0 = 5$.

**b. (2 marks)**
*Step 1 (1 mark):* $c = 3$: $\\sqrt{c^2 - \\omega_0^2} = \\sqrt{9 - 25} = \\sqrt{-16} = 4i$.
*Step 2 (1 mark):* So $\\lambda = -3 \\pm 4i$ (i.e. $\\nu = 4$).

**c. (3 marks)**
*Step 1 (1 mark):* General solution: $x(t) = e^{-3t}(A\\cos(4t) + B\\sin(4t))$.
*Step 2 (1 mark):* Damping envelope: $e^{-3t}$ (amplitude decays exponentially with time constant $1/3$).
*Step 3 (1 mark):* Damped angular frequency: $\\nu = 4$ rad/s.

**d. (2 marks)**
*Step 1 (1 mark):* $c = 5$: $\\lambda = -5$ (repeated root).
*Step 2 (1 mark):* General solution: $x(t) = (A + Bt) e^{-5t}$.

**e. (3 marks)**
*Step 1 (1 mark):* $c = 7$: $\\sqrt{49 - 25} = \\sqrt{24} = 2\\sqrt 6$.
*Step 2 (1 mark):* $\\lambda = -7 \\pm 2\\sqrt 6 \\approx -2.10$ or $-11.90$.
*Step 3 (1 mark):* General solution: $x(t) = A e^{(-7 + 2\\sqrt 6) t} + B e^{(-7 - 2\\sqrt 6) t}$ — no oscillation, both modes decay.`),
];

// ─── Output JSON ────────────────────────────────────────────────────────

const output = { mcq, shortAnswer, extendedAnswer, extendedResponse };
fs.writeFileSync(JSON_PATH, JSON.stringify(output, null, 2) + "\n");

console.log(
  `Wrote ${mcq.length} MCQ, ${shortAnswer.length} SHORT, ${extendedAnswer.length} EXT_ANS, ${extendedResponse.length} EXT_RESP to ${JSON_PATH}\n` +
    `Wrote ${Object.keys(figures).length} SVG files to ${FIGURES_DIR}/`,
);
