/** Specialist modelling-rich: Kinematics with Variable Acceleration. */
import * as fs from "fs";
interface MCQ { content: string; optionA: string; optionB: string; optionC: string; optionD: string; correctOption: "A"|"B"|"C"|"D"; marks: number; difficulty: "EASY"|"MEDIUM"|"HARD"; solutionContent: string; subtopicSlugs: string[]; }
interface FR { content: string; marks: number; difficulty: "EASY"|"MEDIUM"|"HARD"; solutionContent: string; subtopicSlugs: string[]; }
const P = "kinematics-with-variable-acceleration";
const m = (c: string, o: [string,string,string,string], k: "A"|"B"|"C"|"D", d: "EASY"|"MEDIUM"|"HARD", s: string, sec: string[] = []): MCQ =>
  ({ content: c, optionA: o[0], optionB: o[1], optionC: o[2], optionD: o[3], correctOption: k, marks: 1, difficulty: d, solutionContent: s, subtopicSlugs: [P, ...sec] });
const sq = (c: string, marks: number, d: "EASY"|"MEDIUM"|"HARD", s: string, sec: string[] = []): FR =>
  ({ content: c, marks, difficulty: d, solutionContent: s, subtopicSlugs: [P, ...sec] });

const mcq: MCQ[] = [
  m("If $x(t)$ is position, $v(t)$ velocity, $a(t)$ acceleration, then:", ["$v = dx/dt$, $a = dv/dt$", "$v = a/t$", "$x = v t$", "$a = x \\cdot v$"], "A", "EASY",
    "Standard kinematic definitions. **Answer: A**"),
  m("$a = v \\, \\dfrac{dv}{dx}$ is equivalent to:", ["$a = dv/dt$", "$\\dfrac{d(v^2/2)}{dx}$", "both A and B", "$a = v^2$"], "C", "EASY",
    "$\\dfrac{dv}{dt} = \\dfrac{dv}{dx} \\cdot \\dfrac{dx}{dt} = v\\dfrac{dv}{dx}$; and $\\dfrac{d(v^2/2)}{dx} = v \\dfrac{dv}{dx}$. **Answer: C**"),
  m("If $v(t) = 3t^2$, $x(0) = 0$, then $x(2) =$:", ["$8$", "$12$", "$4$", "$6$"], "A", "EASY",
    "$x = \\int 3t^2 dt = t^3$; $x(2) = 8$. **Answer: A**"),
  m("If $a = -g$ (constant) and $v(0) = v_0$, then $v(t) =$:", ["$v_0 - gt$", "$v_0 + gt$", "$-gt$", "$gt - v_0$"], "A", "EASY",
    "$v = v_0 + \\int a dt = v_0 - gt$. **Answer: A**"),
  m("A particle has $v = 1/(1+t)$. Initial position $x(0) = 0$. Then $x(t) =$:", ["$\\ln(1+t)$", "$1/(1+t)^2$", "$-\\ln(1+t)$", "$t \\ln t$"], "A", "MEDIUM",
    "$x = \\int dt/(1+t) = \\ln|1+t| + C$; $x(0) = 0 \\Rightarrow C = 0$. **Answer: A**"),
  m("$v(x) = 4 - x^2$. Find acceleration at $x = 1$:", ["$-2$", "$-6$", "$3$", "$0$"], "B", "MEDIUM",
    "$a = v \\dfrac{dv}{dx} = (4 - x^2)(-2x)$. At $x=1$: $a = 3(-2) = -6$. **Answer: B**"),
  m("If acceleration $a = -kv$ (k constant), starting velocity $v_0$, then $v(t) =$:", ["$v_0 e^{-kt}$", "$v_0 - kt$", "$v_0 / (1 + kt)$", "$v_0 t e^{-kt}$"], "A", "HARD",
    "$dv/dt = -kv \\Rightarrow v = v_0 e^{-kt}$. **Answer: A**"),
  m("A particle has $v^2 = 4 - x^2$. The motion is:", ["SHM about $x=0$", "uniformly accelerated", "exponential", "uniform motion"], "A", "HARD",
    "$2v \\dfrac{dv}{dx} = -2x \\Rightarrow a = -x$ — simple harmonic motion. **Answer: A**"),
];

const shortAnswer: FR[] = [
  sq("A particle has $v(t) = 6t - 3t^2$ m/s, $x(0) = 0$. Find $x(t)$.", 2, "EASY",
    "*Step 1 (1 mark):* $x(t) = \\int (6t - 3t^2) dt = 3t^2 - t^3 + C$.\n*Step 2 (1 mark):* $x(0) = 0 \\Rightarrow C = 0$. So $x(t) = 3t^2 - t^3$."),
  sq("If $a(t) = 6t - 4$, $v(0) = 2$, find $v(t)$.", 2, "EASY",
    "*Step 1 (1 mark):* $v(t) = \\int (6t - 4) dt = 3t^2 - 4t + C$.\n*Step 2 (1 mark):* $v(0) = 2 \\Rightarrow C = 2$. So $v(t) = 3t^2 - 4t + 2$."),
  sq("A body falls under $a = -g + v$ (drag model). Solve the DE.", 3, "HARD",
    "*Step 1 (1 mark):* $dv/dt = v - g$ is first-order linear.\n*Step 2 (1 mark):* Solution: $v = g + Ce^t$.\n*Step 3 (1 mark):* Terminal velocity $g$ as $t \\to -\\infty$; physically unrealistic; correct sign is usually $a = -g - kv$."),
  sq("A particle has $v(x) = \\sqrt{9 - x^2}$, $-3 \\le x \\le 3$. Find the time to travel from $x = 0$ to $x = 3$.", 3, "HARD",
    "*Step 1 (1 mark):* $dx/dt = \\sqrt{9 - x^2}$, so $dt = dx/\\sqrt{9 - x^2}$.\n*Step 2 (1 mark):* $t = \\int_0^3 dx/\\sqrt{9 - x^2} = [\\arcsin(x/3)]_0^3$.\n*Step 3 (1 mark):* $= \\arcsin(1) - 0 = \\pi/2$ seconds."),
  sq("Given $a(x) = -4x$ and $v(0) = 0$ at $x = 1$, find $v$ as a function of $x$.", 3, "MEDIUM",
    "*Step 1 (1 mark):* $v \\dfrac{dv}{dx} = -4x$, so $\\int v dv = \\int -4x dx$.\n*Step 2 (1 mark):* $v^2/2 = -2x^2 + C$. At $x=1$, $v=0$: $0 = -2 + C \\Rightarrow C = 2$.\n*Step 3 (1 mark):* $v^2 = 4 - 4x^2$, so $v = \\pm 2\\sqrt{1 - x^2}$ on $|x| \\le 1$."),
];

const extendedAnswer: FR[] = [
  sq(`A particle moves with velocity $v(t) = 4 - t^2$ m/s for $0 \\le t \\le 3$ seconds. Initial position is $x(0) = 5$ m.

**a.** Find the time(s) when the particle is momentarily at rest. (1 mark)

**b.** Find an expression for $x(t)$. (3 marks)

**c.** Find the displacement and distance travelled in $0 \\le t \\le 3$. (4 marks)`, 8, "MEDIUM",
    `**a. (1 mark)** $v(t) = 0$ at $4 - t^2 = 0 \\Rightarrow t = 2$ (taking $t \\ge 0$).

**b. (3 marks)**
*Step 1 (1 mark):* $x(t) = x(0) + \\int_0^t (4 - \\tau^2) d\\tau$.
*Step 2 (1 mark):* $= 5 + [4\\tau - \\tau^3/3]_0^t$.
*Step 3 (1 mark):* $= 5 + 4t - t^3/3$.

**c. (4 marks)**
*Step 1 (1 mark):* Displacement: $x(3) - x(0) = (5 + 12 - 9) - 5 = 3$ m.
*Step 2 (1 mark):* For distance, split at $t = 2$ where $v$ changes sign.
*Step 3 (1 mark):* $|x(2) - x(0)| = |(5 + 8 - 8/3) - 5| = 16/3$.
*Step 4 (1 mark):* $|x(3) - x(2)| = |3 - 8/3| = 7/3$. Total distance $= 16/3 + 7/3 = 23/3 \\approx 7.67$ m.`),

  sq(`A particle moves so that its acceleration at distance $x$ from the origin is $a = -16x$.

**a.** Show that the motion is simple harmonic. (2 marks)

**b.** If the particle has velocity 8 m/s when $x = 0$, find an expression for $v$ in terms of $x$. (3 marks)

**c.** Find the amplitude of the motion. (2 marks)`, 7, "MEDIUM",
    `**a. (2 marks)**
*Step 1 (1 mark):* SHM defined by $a = -\\omega^2 x$.
*Step 2 (1 mark):* Here $\\omega^2 = 16$, so $\\omega = 4$ rad/s; motion is SHM about $x = 0$.

**b. (3 marks)**
*Step 1 (1 mark):* $v \\dfrac{dv}{dx} = -16x \\Rightarrow \\int v dv = -16 \\int x dx$.
*Step 2 (1 mark):* $v^2/2 = -8x^2 + C$. At $x=0$, $v=8$: $32 = C$.
*Step 3 (1 mark):* $v^2 = 64 - 16 x^2$, so $v = \\pm 4\\sqrt{4 - x^2}$.

**c. (2 marks)**
*Step 1 (1 mark):* Amplitude: max $|x|$ when $v = 0$.
*Step 2 (1 mark):* $4 - x^2 = 0 \\Rightarrow x = \\pm 2$. Amplitude $= 2$ m.`),
];

const extendedResponse: FR[] = [
  sq(`A particle of mass 0.5 kg moves along a straight line. Its velocity $v$ m/s at position $x$ m is given by $v = \\dfrac{2}{\\sqrt{x + 1}}$ for $x \\ge 0$, with $x = 0$ when $t = 0$.

**a.** Find the acceleration $a$ as a function of $x$. (3 marks)

**b.** Find the time $t$ in terms of $x$. (4 marks)

**c.** When the particle reaches $x = 3$, what is its velocity? (1 mark)

**d.** Find the kinetic energy at $x = 3$ m. (2 marks)

**e.** Describe what happens to the particle's velocity as $x \\to \\infty$. (2 marks)`, 12, "HARD",
    `**a. (3 marks)**
*Step 1 (1 mark):* $\\dfrac{dv}{dx} = -(x+1)^{-3/2}$.
*Step 2 (1 mark):* $a = v\\dfrac{dv}{dx} = \\dfrac{2}{\\sqrt{x+1}} \\cdot \\left(-(x+1)^{-3/2}\\right)$.
*Step 3 (1 mark):* $a = -\\dfrac{2}{(x+1)^2}$ m/s².

**b. (4 marks)**
*Step 1 (1 mark):* $\\dfrac{dx}{dt} = \\dfrac{2}{\\sqrt{x+1}}$, separate: $\\sqrt{x+1} dx = 2 dt$.
*Step 2 (1 mark):* Integrate: $\\dfrac{2}{3}(x+1)^{3/2} = 2t + C$.
*Step 3 (1 mark):* At $t=0, x=0$: $\\dfrac{2}{3} = C$.
*Step 4 (1 mark):* $t = \\dfrac{(x+1)^{3/2} - 1}{3}$.

**c. (1 mark)** $v(3) = 2/\\sqrt 4 = 1$ m/s.

**d. (2 marks)**
*Step 1 (1 mark):* $\\text{KE} = \\dfrac{1}{2}mv^2 = \\dfrac{1}{2}(0.5)(1)^2$.
*Step 2 (1 mark):* $= 0.25$ J.

**e. (2 marks)**
*Step 1 (1 mark):* As $x \\to \\infty$, $\\sqrt{x+1} \\to \\infty$.
*Step 2 (1 mark):* So $v \\to 0$; particle decelerates indefinitely, never stopping but approaching rest.`),

  sq(`A car of mass 1500 kg accelerates from rest along a straight road. The driving force is $F = 5000 - 50v$ N, where $v$ is velocity in m/s. Air resistance and ground friction are included in this force model.

**a.** Write Newton's second law $F = ma$ in terms of $v$ and $\\dfrac{dv}{dt}$. (2 marks)

**b.** Solve the differential equation to find $v(t)$. (4 marks)

**c.** Find the terminal velocity of the car. (2 marks)

**d.** How long does it take to reach 80% of terminal velocity? (3 marks)`, 11, "HARD",
    `**a. (2 marks)**
*Step 1 (1 mark):* $F = m \\dfrac{dv}{dt}$.
*Step 2 (1 mark):* $1500 \\dfrac{dv}{dt} = 5000 - 50v$.

**b. (4 marks)**
*Step 1 (1 mark):* Simplify: $\\dfrac{dv}{dt} = \\dfrac{1}{30}(100 - v)$.
*Step 2 (1 mark):* Separate: $\\dfrac{dv}{100 - v} = \\dfrac{dt}{30}$.
*Step 3 (1 mark):* Integrate: $-\\ln|100 - v| = t/30 + C$. Initial $v(0) = 0$: $C = -\\ln 100$.
*Step 4 (1 mark):* $\\ln\\dfrac{100}{100 - v} = t/30$, so $v(t) = 100(1 - e^{-t/30})$ m/s.

**c. (2 marks)**
*Step 1 (1 mark):* Terminal velocity occurs when $a = 0$, i.e. $F = 0$: $5000 - 50v = 0$.
*Step 2 (1 mark):* $v_{\\text{terminal}} = 100$ m/s.

**d. (3 marks)**
*Step 1 (1 mark):* 80% of 100 = 80 m/s.
*Step 2 (1 mark):* $80 = 100(1 - e^{-t/30}) \\Rightarrow e^{-t/30} = 0.2$.
*Step 3 (1 mark):* $t = -30\\ln(0.2) = 30 \\ln 5 \\approx 48.3$ seconds.`),
];

const out = { mcq, shortAnswer, extendedAnswer, extendedResponse };
fs.writeFileSync("scripts/output/qset-specialist-kinematics.json", JSON.stringify(out, null, 2) + "\n");
console.log(`Wrote ${mcq.length} MCQ, ${shortAnswer.length} SHORT, ${extendedAnswer.length} EXT_ANS, ${extendedResponse.length} EXT_RESP to scripts/output/qset-specialist-kinematics.json`);
