/** Specialist modelling-rich: Vector Calculus. */
import * as fs from "fs";
interface MCQ { content: string; optionA: string; optionB: string; optionC: string; optionD: string; correctOption: "A"|"B"|"C"|"D"; marks: number; difficulty: "EASY"|"MEDIUM"|"HARD"; solutionContent: string; subtopicSlugs: string[]; }
interface FR { content: string; marks: number; difficulty: "EASY"|"MEDIUM"|"HARD"; solutionContent: string; subtopicSlugs: string[]; }
const P = "vector-calculus";
const m = (c: string, o: [string,string,string,string], k: "A"|"B"|"C"|"D", d: "EASY"|"MEDIUM"|"HARD", s: string, sec: string[] = []): MCQ =>
  ({ content: c, optionA: o[0], optionB: o[1], optionC: o[2], optionD: o[3], correctOption: k, marks: 1, difficulty: d, solutionContent: s, subtopicSlugs: [P, ...sec] });
const sq = (c: string, marks: number, d: "EASY"|"MEDIUM"|"HARD", s: string, sec: string[] = []): FR =>
  ({ content: c, marks, difficulty: d, solutionContent: s, subtopicSlugs: [P, ...sec] });

const mcq: MCQ[] = [
  m("If $\\vec r(t) = (t^2)\\hat i + t \\hat j$, $\\vec v(t) =$:", ["$2t \\hat i + \\hat j$", "$2t \\hat i$", "$t^2 \\hat i + t \\hat j$", "$\\vec r$"], "A", "EASY", "$\\vec v = d\\vec r/dt$. **Answer: A**"),
  m("$\\vec a = d\\vec v/dt$. If $\\vec v(t) = 2t \\hat i + 3\\hat j$, then $\\vec a =$:", ["$2\\hat i$", "$2 \\hat i + 3\\hat j$", "$3\\hat j$", "$0$"], "A", "EASY", "Constant in j-direction. **Answer: A**"),
  m("Speed $= |\\vec v|$. If $\\vec v = 3\\hat i + 4\\hat j$, speed:", ["$5$", "$7$", "$1$", "$25$"], "A", "EASY", "$\\sqrt{9 + 16} = 5$. **Answer: A**"),
  m("If $\\vec r(t) = R\\cos t \\hat i + R\\sin t \\hat j$, motion is on:", ["a line", "a circle of radius $R$", "a parabola", "the x-axis"], "B", "MEDIUM", "Circular motion. **Answer: B**"),
  m("For circular motion above, $\\vec v \\cdot \\vec r =$:", ["$0$", "$R^2$", "$R$", "varies"], "A", "MEDIUM", "Velocity tangent to position (perpendicular). **Answer: A**"),
  m("Tangent vector to curve $\\vec r(t)$ at $t = t_0$:", ["$\\vec r(t_0)$", "$\\vec v(t_0) = \\vec r'(t_0)$", "$\\vec a(t_0)$", "$|\\vec r|$"], "B", "MEDIUM", "Derivative is tangent. **Answer: B**"),
  m("Unit tangent $\\hat T =$:", ["$\\vec v/|\\vec v|$", "$\\vec v$", "$\\vec r$", "$\\vec a$"], "A", "HARD", "Standard. **Answer: A**"),
  m("$\\int \\vec v dt$ for $\\vec v = (t) \\hat i + (2t)\\hat j$, with $\\vec r(0) = 0$:", ["$(t^2/2)\\hat i + (t^2)\\hat j$", "$(t)\\hat i + (2t)\\hat j$", "$0$", "$(t^2)\\hat i + (t^2)\\hat j$"], "A", "HARD", "Integrate componentwise. **Answer: A**"),
];

const shortAnswer: FR[] = [
  sq("$\\vec r(t) = t^2 \\hat i + (t - 1)\\hat j$. Find $\\vec v(t)$ and $\\vec a(t)$.", 2, "EASY", "*Step 1 (1 mark):* $\\vec v = 2t\\hat i + \\hat j$.\n*Step 2 (1 mark):* $\\vec a = 2\\hat i$."),
  sq("Particle at $\\vec r = 2\\cos t \\hat i + 2\\sin t \\hat j$. Find $|\\vec v|$.", 3, "MEDIUM", "*Step 1 (1 mark):* $\\vec v = -2\\sin t \\hat i + 2\\cos t \\hat j$.\n*Step 2 (1 mark):* $|\\vec v|^2 = 4\\sin^2 t + 4\\cos^2 t = 4$.\n*Step 3 (1 mark):* $|\\vec v| = 2$ (constant — uniform circular motion)."),
  sq("If $\\vec a(t) = 3 \\hat j$ and $\\vec v(0) = 2\\hat i$, find $\\vec v(t)$.", 2, "MEDIUM", "*Step 1 (1 mark):* $\\vec v(t) = \\vec v(0) + \\int_0^t \\vec a d\\tau = 2\\hat i + 3t \\hat j$.\n*Step 2 (1 mark):* Final: $\\vec v(t) = 2\\hat i + 3t\\hat j$."),
  sq("Particle position: $\\vec r(t) = \\hat i \\sin t + \\hat j (1 - \\cos t)$. Find $\\vec r(\\pi/2)$.", 2, "EASY", "*Step 1 (1 mark):* $\\sin(\\pi/2) = 1$, $\\cos(\\pi/2) = 0$.\n*Step 2 (1 mark):* $\\vec r(\\pi/2) = \\hat i + \\hat j$."),
  sq("If $\\vec r(t) = t \\hat i + e^t \\hat j$, find the speed at $t = 0$.", 2, "MEDIUM", "*Step 1 (1 mark):* $\\vec v = \\hat i + e^t \\hat j$.\n*Step 2 (1 mark):* At $t=0$: $\\vec v = \\hat i + \\hat j$, speed $= \\sqrt 2$."),
];

const extendedAnswer: FR[] = [
  sq(`A particle moves with position $\\vec r(t) = (3t)\\hat i + (t^2 - 4t)\\hat j$ for $t \\ge 0$ in metres and seconds.

**a.** Find $\\vec v(t)$ and $\\vec a(t)$. (3 marks)

**b.** Find when the velocity is purely in the $\\hat i$ direction. (2 marks)

**c.** Find the speed at $t = 3$. (3 marks)`, 8, "MEDIUM",
    `**a. (3 marks)**
*Step 1 (1 mark):* $\\vec v(t) = 3\\hat i + (2t - 4)\\hat j$.
*Step 2 (1 mark):* $\\vec a(t) = 2\\hat j$.
*Step 3 (1 mark):* Acceleration constant in $\\hat j$.

**b. (2 marks)**
*Step 1 (1 mark):* Purely $\\hat i$: $\\hat j$-component zero, i.e. $2t - 4 = 0$.
*Step 2 (1 mark):* $t = 2$ seconds.

**c. (3 marks)**
*Step 1 (1 mark):* At $t = 3$: $\\vec v = 3\\hat i + 2\\hat j$.
*Step 2 (1 mark):* $|\\vec v|^2 = 9 + 4 = 13$.
*Step 3 (1 mark):* Speed $\\sqrt{13} \\approx 3.61$ m/s.`),
];

const extendedResponse: FR[] = [
  sq(`A projectile is launched from the origin with initial velocity $\\vec v_0 = 20\\hat i + 25\\hat j$ m/s. Gravity is $\\vec g = -9.8\\hat j$ m/s².

**a.** Find $\\vec v(t)$ and $\\vec r(t)$. (3 marks)

**b.** Find the time at which the projectile reaches maximum height. (2 marks)

**c.** Find the maximum height reached. (3 marks)

**d.** Find the horizontal range (where $\\hat j$-component of $\\vec r$ returns to 0). (2 marks)

**e.** Find the velocity at impact. (2 marks)`, 12, "MEDIUM",
    `**a. (3 marks)**
*Step 1 (1 mark):* $\\vec v(t) = \\vec v_0 + \\int_0^t \\vec g d\\tau = 20\\hat i + (25 - 9.8 t)\\hat j$.
*Step 2 (1 mark):* $\\vec r(t) = \\int_0^t \\vec v d\\tau = 20t \\hat i + (25t - 4.9 t^2)\\hat j$.
*Step 3 (1 mark):* So $\\vec r(t) = 20t \\hat i + (25t - 4.9 t^2)\\hat j$ m.

**b. (2 marks)**
*Step 1 (1 mark):* Max height: vertical velocity zero, $25 - 9.8 t = 0$.
*Step 2 (1 mark):* $t \\approx 2.55$ s.

**c. (3 marks)**
*Step 1 (1 mark):* Height at $t = 2.55$: $25(2.55) - 4.9(2.55)^2$.
*Step 2 (1 mark):* $= 63.78 - 31.87 = 31.91$.
*Step 3 (1 mark):* Maximum height $\\approx 31.9$ m.

**d. (2 marks)**
*Step 1 (1 mark):* Return to $y = 0$: $25t - 4.9t^2 = 0 \\Rightarrow t(25 - 4.9 t) = 0$. Non-trivial: $t = 5.10$ s.
*Step 2 (1 mark):* Range: $x = 20 \\cdot 5.10 \\approx 102$ m.

**e. (2 marks)**
*Step 1 (1 mark):* At $t = 5.10$: $\\vec v = 20\\hat i + (25 - 9.8(5.10))\\hat j = 20\\hat i - 25\\hat j$ m/s.
*Step 2 (1 mark):* Magnitude $\\sqrt{400 + 625} = \\sqrt{1025} \\approx 32.0$ m/s.`),
];

const out = { mcq, shortAnswer, extendedAnswer, extendedResponse };
fs.writeFileSync("scripts/output/qset-specialist-vector-calc.json", JSON.stringify(out, null, 2) + "\n");
console.log(`Wrote ${mcq.length} MCQ, ${shortAnswer.length} SHORT, ${extendedAnswer.length} EXT_ANS, ${extendedResponse.length} EXT_RESP to scripts/output/qset-specialist-vector-calc.json`);
