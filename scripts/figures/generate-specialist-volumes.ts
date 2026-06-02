/** Specialist modelling-rich: Volumes of Revolution. */
import * as fs from "fs";
interface MCQ { content: string; optionA: string; optionB: string; optionC: string; optionD: string; correctOption: "A"|"B"|"C"|"D"; marks: number; difficulty: "EASY"|"MEDIUM"|"HARD"; solutionContent: string; subtopicSlugs: string[]; }
interface FR { content: string; marks: number; difficulty: "EASY"|"MEDIUM"|"HARD"; solutionContent: string; subtopicSlugs: string[]; }
const P = "volumes-of-revolution";
const m = (c: string, o: [string,string,string,string], k: "A"|"B"|"C"|"D", d: "EASY"|"MEDIUM"|"HARD", s: string, sec: string[] = []): MCQ =>
  ({ content: c, optionA: o[0], optionB: o[1], optionC: o[2], optionD: o[3], correctOption: k, marks: 1, difficulty: d, solutionContent: s, subtopicSlugs: [P, ...sec] });
const sq = (c: string, marks: number, d: "EASY"|"MEDIUM"|"HARD", s: string, sec: string[] = []): FR =>
  ({ content: c, marks, difficulty: d, solutionContent: s, subtopicSlugs: [P, ...sec] });

const mcq: MCQ[] = [
  m("Volume of revolution about $x$-axis is $V =$:", ["$\\pi\\int_a^b y^2 dx$", "$\\int_a^b y dx$", "$2\\pi\\int_a^b y dx$", "$\\pi\\int_a^b y dx$"], "A", "EASY",
    "Disc method: $V = \\pi \\int_a^b [f(x)]^2 dx$. **Answer: A**"),
  m("Volume about $y$-axis using shells is $V =$:", ["$\\pi\\int_a^b x^2 dy$", "$2\\pi\\int_a^b x f(x) dx$", "$\\int_a^b x dy$", "$\\pi\\int x^2 dx$"], "B", "EASY",
    "Shell method: $V = 2\\pi\\int x \\cdot f(x) dx$. **Answer: B**"),
  m("$y = \\sqrt x$ rotated about $x$-axis from $x = 0$ to $x = 4$:", ["$8\\pi$", "$4\\pi$", "$16\\pi$", "$2\\pi$"], "A", "MEDIUM",
    "$V = \\pi \\int_0^4 x dx = \\pi \\cdot 16/2 = 8\\pi$. **Answer: A**"),
  m("$y = e^x$ rotated about $x$-axis from $0$ to $1$:", ["$\\pi(e^2 - 1)/2$", "$\\pi e^2$", "$\\pi (e - 1)^2$", "$\\pi (e^2 - 1)$"], "A", "MEDIUM",
    "$V = \\pi\\int_0^1 e^{2x} dx = \\pi [e^{2x}/2]_0^1 = \\pi(e^2 - 1)/2$. **Answer: A**"),
  m("The volume of a sphere of radius $r$ via revolving $y = \\sqrt{r^2 - x^2}$:", ["$\\dfrac{4\\pi r^3}{3}$", "$\\dfrac{4\\pi r^2}{3}$", "$\\pi r^3$", "$\\dfrac{2\\pi r^3}{3}$"], "A", "MEDIUM",
    "Classic result via $\\pi\\int_{-r}^r (r^2 - x^2) dx$. **Answer: A**"),
  m("Volume of $y = x^2$ about $x$-axis, $0 \\to 1$:", ["$\\pi/5$", "$\\pi/3$", "$\\pi$", "$\\pi/2$"], "A", "MEDIUM",
    "$\\pi\\int_0^1 x^4 dx = \\pi/5$. **Answer: A**"),
  m("Volume of $y = \\sin x$, $0 \\le x \\le \\pi$, about $x$-axis:", ["$\\pi^2/2$", "$\\pi$", "$\\pi^2$", "$2\\pi$"], "A", "HARD",
    "$\\pi\\int_0^\\pi \\sin^2 x dx = \\pi \\cdot \\pi/2 = \\pi^2/2$. **Answer: A**"),
  m("Volume of $y = x$ from 0 to 2 about $y$-axis (disc method):", ["$8\\pi/3$", "$4\\pi/3$", "$8\\pi$", "$4\\pi$"], "A", "HARD",
    "Use $x = y$, range $y \\in [0, 2]$: $V = \\pi\\int_0^2 y^2 dy = 8\\pi/3$. **Answer: A**"),
];

const shortAnswer: FR[] = [
  sq("Find the volume when $y = 2x$ for $0 \\le x \\le 3$ is revolved about the $x$-axis.", 2, "EASY",
    "*Step 1 (1 mark):* $V = \\pi\\int_0^3 (2x)^2 dx = 4\\pi\\int_0^3 x^2 dx$.\n*Step 2 (1 mark):* $= 4\\pi[x^3/3]_0^3 = 36\\pi$."),
  sq("Find the volume when $y = x^2$ for $0 \\le x \\le 1$ is revolved about the $x$-axis.", 2, "EASY",
    "*Step 1 (1 mark):* $V = \\pi\\int_0^1 x^4 dx$.\n*Step 2 (1 mark):* $= \\pi/5$."),
  sq("Find the volume when $y = \\sqrt{4 - x^2}$, $-2 \\le x \\le 2$ is revolved about the $x$-axis.", 3, "MEDIUM",
    "*Step 1 (1 mark):* $V = \\pi\\int_{-2}^2 (4 - x^2) dx$.\n*Step 2 (1 mark):* By symmetry $= 2\\pi\\int_0^2 (4 - x^2) dx = 2\\pi[4x - x^3/3]_0^2$.\n*Step 3 (1 mark):* $= 2\\pi(8 - 8/3) = 32\\pi/3$ (sphere volume with $r=2$ ✓)."),
  sq("Region under $y = e^x$, $0 \\le x \\le 1$, revolved about $x$-axis. Find volume.", 3, "MEDIUM",
    "*Step 1 (1 mark):* $V = \\pi\\int_0^1 e^{2x} dx$.\n*Step 2 (1 mark):* $= \\pi[e^{2x}/2]_0^1$.\n*Step 3 (1 mark):* $= \\pi(e^2 - 1)/2$."),
  sq("Volume when $y = \\ln x$, $1 \\le x \\le e$, is revolved about the $y$-axis (shell method).", 3, "HARD",
    "*Step 1 (1 mark):* $V = 2\\pi\\int_1^e x \\ln x dx$.\n*Step 2 (1 mark):* IBP: $u = \\ln x$, $dv = x dx$; $\\int x \\ln x dx = x^2\\ln x/2 - x^2/4$.\n*Step 3 (1 mark):* $V = 2\\pi[x^2\\ln x/2 - x^2/4]_1^e = 2\\pi[(e^2/2 - e^2/4) - (0 - 1/4)] = 2\\pi[e^2/4 + 1/4] = \\pi(e^2 + 1)/2$."),
];

const extendedAnswer: FR[] = [
  sq(`The region $R$ is bounded by $y = x^2$, $y = 0$, and $x = 2$.

**a.** Sketch the region $R$. (1 mark)

**b.** Find the volume of the solid formed by revolving $R$ about the $x$-axis. (3 marks)

**c.** Find the volume of the solid formed by revolving $R$ about the $y$-axis. (4 marks)`, 8, "MEDIUM",
    `**a. (1 mark)** Sketch shows a parabolic region in the first quadrant, vertex at origin, capped by the vertical line $x = 2$ and $y$-axis on the left.

**b. (3 marks)**
*Step 1 (1 mark):* $V = \\pi\\int_0^2 (x^2)^2 dx$.
*Step 2 (1 mark):* $= \\pi\\int_0^2 x^4 dx$.
*Step 3 (1 mark):* $= \\pi[x^5/5]_0^2 = 32\\pi/5$.

**c. (4 marks)**
*Step 1 (1 mark):* Use shell method: $V = 2\\pi\\int_0^2 x \\cdot x^2 dx$.
*Step 2 (1 mark):* $= 2\\pi\\int_0^2 x^3 dx$.
*Step 3 (1 mark):* $= 2\\pi[x^4/4]_0^2 = 8\\pi$.
*Step 4 (1 mark):* (Verify via disc-with-hole: $V = \\pi\\int_0^4 (4 - y) dy = \\pi[4y - y^2/2]_0^4 = \\pi(16 - 8) = 8\\pi$ ✓.)`),
];

const extendedResponse: FR[] = [
  sq(`A vase is formed by rotating the curve $y = \\sqrt{x}$ for $0 \\le x \\le 9$ about the $x$-axis. Distances are in cm.

**a.** Sketch the curve and the resulting solid. (1 mark)

**b.** Find the volume of the vase. (3 marks)

**c.** Water is poured into the vase. The water level reaches height $y = 2$ when the depth (measured along the $x$-axis from the closed end at $x = 0$) is $x = 4$. Show that this is consistent. (2 marks)

**d.** Find the volume of water when the depth is $x = a$ cm, $0 \\le a \\le 9$. (3 marks)

**e.** If water is poured at a constant rate of $5$ cm³/s, find the rate at which the depth $x$ increases when $x = 4$. (3 marks)`, 12, "HARD",
    `**a. (1 mark)** Sketch shows a horizontal "paraboloid" — solid of revolution opening up along the $x$-axis, narrow at $x = 0$ and widening to $y = 3$ at $x = 9$.

**b. (3 marks)**
*Step 1 (1 mark):* $V = \\pi\\int_0^9 (\\sqrt x)^2 dx = \\pi\\int_0^9 x dx$.
*Step 2 (1 mark):* $= \\pi[x^2/2]_0^9$.
*Step 3 (1 mark):* $= 81\\pi/2$ cm³ $\\approx 127.2$ cm³.

**c. (2 marks)**
*Step 1 (1 mark):* Curve: $y = \\sqrt x$, so $y = 2$ when $x = 4$.
*Step 2 (1 mark):* Consistent with the curve equation.

**d. (3 marks)**
*Step 1 (1 mark):* $V(a) = \\pi\\int_0^a x dx$.
*Step 2 (1 mark):* $= \\pi a^2 / 2$.
*Step 3 (1 mark):* $V(a) = \\dfrac{\\pi a^2}{2}$ cm³.

**e. (3 marks)**
*Step 1 (1 mark):* $\\dfrac{dV}{dt} = 5$ cm³/s. From (d): $V = \\pi x^2/2$, so $\\dfrac{dV}{dx} = \\pi x$.
*Step 2 (1 mark):* $\\dfrac{dx}{dt} = \\dfrac{dV/dt}{dV/dx} = \\dfrac{5}{\\pi x}$.
*Step 3 (1 mark):* At $x = 4$: $\\dfrac{dx}{dt} = \\dfrac{5}{4\\pi} \\approx 0.398$ cm/s.`),
];

const out = { mcq, shortAnswer, extendedAnswer, extendedResponse };
fs.writeFileSync("scripts/output/qset-specialist-volumes.json", JSON.stringify(out, null, 2) + "\n");
console.log(`Wrote ${mcq.length} MCQ, ${shortAnswer.length} SHORT, ${extendedAnswer.length} EXT_ANS, ${extendedResponse.length} EXT_RESP to scripts/output/qset-specialist-volumes.json`);
