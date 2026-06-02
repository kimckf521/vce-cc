/** Specialist modelling-rich: Inclined Planes. */
import * as fs from "fs";
interface MCQ { content: string; optionA: string; optionB: string; optionC: string; optionD: string; correctOption: "A"|"B"|"C"|"D"; marks: number; difficulty: "EASY"|"MEDIUM"|"HARD"; solutionContent: string; subtopicSlugs: string[]; }
interface FR { content: string; marks: number; difficulty: "EASY"|"MEDIUM"|"HARD"; solutionContent: string; subtopicSlugs: string[]; }
const P = "inclined-planes";
const m = (c: string, o: [string,string,string,string], k: "A"|"B"|"C"|"D", d: "EASY"|"MEDIUM"|"HARD", s: string, sec: string[] = []): MCQ =>
  ({ content: c, optionA: o[0], optionB: o[1], optionC: o[2], optionD: o[3], correctOption: k, marks: 1, difficulty: d, solutionContent: s, subtopicSlugs: [P, ...sec] });
const sq = (c: string, marks: number, d: "EASY"|"MEDIUM"|"HARD", s: string, sec: string[] = []): FR =>
  ({ content: c, marks, difficulty: d, solutionContent: s, subtopicSlugs: [P, ...sec] });

const mcq: MCQ[] = [
  m("Component of weight along an incline of angle $\\theta$:", ["$mg\\sin\\theta$", "$mg\\cos\\theta$", "$mg\\tan\\theta$", "$mg$"], "A", "EASY", "Resolve along slope. **Answer: A**"),
  m("Normal force on smooth incline:", ["$mg\\sin\\theta$", "$mg\\cos\\theta$", "$mg$", "$0$"], "B", "EASY", "Perpendicular component. **Answer: B**"),
  m("Smooth incline, $30°$, $m = 5$ kg, $g = 10$. Acceleration down:", ["$5$ m/s²", "$10$ m/s²", "$2.5$ m/s²", "$0$"], "A", "EASY", "$a = g\\sin\\theta = 5$. **Answer: A**"),
  m("Block on rough incline at $45°$, $\\mu = 1$: motion is:", ["accelerates", "static", "constant velocity", "depends on mass"], "C", "MEDIUM", "$\\tan 45° = 1 = \\mu$, so at threshold. With $\\mu_k = \\mu_s$ would slide at constant velocity. **Answer: C**"),
  m("Up the incline: gravity component is:", ["assisting motion", "opposing motion", "zero", "perpendicular"], "B", "MEDIUM", "Gravity points down slope, opposing upward motion. **Answer: B**"),
  m("Block on smooth incline at angle $\\theta$, with applied force $F$ parallel to slope (up). Acceleration:", ["$(F - mg\\sin\\theta)/m$", "$F/m$", "$(F + mg\\sin\\theta)/m$", "$g\\sin\\theta$"], "A", "MEDIUM", "Net up slope. **Answer: A**"),
  m("Time for 10 kg block to slide 5 m down smooth $30°$ incline from rest ($g = 10$):", ["$\\sqrt 2$ s", "$2$ s", "$1$ s", "$\\sqrt 5$ s"], "A", "HARD", "$a = 5$; $s = at^2/2 \\Rightarrow 5 = 2.5 t^2 \\Rightarrow t = \\sqrt 2$. **Answer: A**"),
  m("Smooth incline, mass $m$, angle $\\theta$, height $h$. Speed at bottom from rest:", ["$\\sqrt{2gh}$", "$\\sqrt{gh}$", "$gh$", "$h$"], "A", "HARD", "Energy conservation. **Answer: A**"),
];

const shortAnswer: FR[] = [
  sq("Block of 6 kg on smooth incline $25°$, $g = 9.8$. Find acceleration down.", 2, "EASY", "*Step 1 (1 mark):* $a = g\\sin\\theta$.\n*Step 2 (1 mark):* $a = 9.8 \\sin 25° \\approx 4.14$ m/s²."),
  sq("Block 4 kg on rough incline $20°$, $\\mu_k = 0.15$. Find friction force.", 2, "EASY", "*Step 1 (1 mark):* $N = mg\\cos 20° = 4 \\cdot 9.8 \\cdot 0.940 \\approx 36.8$ N.\n*Step 2 (1 mark):* $f = 0.15 \\cdot 36.8 \\approx 5.52$ N."),
  sq("Smooth incline $\\theta$, mass 2 kg, force 10 N up slope, $g = 10$. Find $\\theta$ if equilibrium.", 3, "MEDIUM", "*Step 1 (1 mark):* Equilibrium up the slope: $F = mg\\sin\\theta$.\n*Step 2 (1 mark):* $10 = 20 \\sin\\theta$.\n*Step 3 (1 mark):* $\\sin\\theta = 0.5$, $\\theta = 30°$."),
  sq("Block 5 kg on rough $30°$ incline, $\\mu_k = 0.2$, $g = 10$. Find acceleration down.", 3, "MEDIUM", "*Step 1 (1 mark):* Gravity along incline: $5 \\cdot 10 \\cdot 0.5 = 25$ N.\n*Step 2 (1 mark):* Friction (up): $0.2 \\cdot 5 \\cdot 10 \\cdot \\sqrt 3/2 \\approx 8.66$ N.\n*Step 3 (1 mark):* $a = (25 - 8.66)/5 \\approx 3.27$ m/s²."),
  sq("Block at rest on smooth $\\theta$ incline. Min force parallel to slope to push up at constant velocity (smooth = no friction).", 2, "EASY", "*Step 1 (1 mark):* Constant velocity → net force zero along incline.\n*Step 2 (1 mark):* Required force: $F = mg\\sin\\theta$."),
];

const extendedAnswer: FR[] = [
  sq(`A 10 kg block slides down a rough incline of $35°$. Coefficient of kinetic friction $\\mu_k = 0.25$. $g = 9.8$.

**a.** Find normal force and friction force. (3 marks)

**b.** Find the acceleration down the slope. (3 marks)

**c.** Starting at rest, find velocity after sliding 4 m. (2 marks)`, 8, "MEDIUM",
    `**a. (3 marks)**
*Step 1 (1 mark):* $N = mg\\cos 35° = 10 \\cdot 9.8 \\cdot 0.819 \\approx 80.3$ N.
*Step 2 (1 mark):* Friction up slope: $f = \\mu_k N \\approx 0.25 \\cdot 80.3 = 20.1$ N.
*Step 3 (1 mark):* Gravity along slope: $mg\\sin 35° \\approx 56.2$ N down.

**b. (3 marks)**
*Step 1 (1 mark):* Net force: $56.2 - 20.1 = 36.1$ N.
*Step 2 (1 mark):* $a = 36.1/10 = 3.61$ m/s².
*Step 3 (1 mark):* Direction: down the slope.

**c. (2 marks)**
*Step 1 (1 mark):* $v^2 = u^2 + 2as = 0 + 2 \\cdot 3.61 \\cdot 4 = 28.9$.
*Step 2 (1 mark):* $v \\approx 5.37$ m/s.`),
];

const extendedResponse: FR[] = [
  sq(`A skier of mass 70 kg starts from rest at the top of a $20°$ slope of length 200 m. Snow has $\\mu_k = 0.10$. Take $g = 9.8$.

**a.** Calculate net force along the slope. (3 marks)

**b.** Find the acceleration. (2 marks)

**c.** Find the time to reach the bottom and the speed there. (4 marks)

**d.** Air resistance becomes significant at higher speeds. Discuss how this would modify the motion qualitatively. (3 marks)`, 12, "HARD",
    `**a. (3 marks)**
*Step 1 (1 mark):* Gravity along slope: $70 \\cdot 9.8 \\cdot \\sin 20° \\approx 234.7$ N.
*Step 2 (1 mark):* Normal: $70 \\cdot 9.8 \\cdot \\cos 20° \\approx 644.7$ N. Friction: $0.1 \\cdot 644.7 \\approx 64.5$ N.
*Step 3 (1 mark):* Net: $234.7 - 64.5 \\approx 170.2$ N down slope.

**b. (2 marks)**
*Step 1 (1 mark):* $a = F_{\\text{net}}/m = 170.2/70$.
*Step 2 (1 mark):* $\\approx 2.43$ m/s².

**c. (4 marks)**
*Step 1 (1 mark):* $s = \\frac{1}{2} a t^2 \\Rightarrow 200 = 1.215 t^2$.
*Step 2 (1 mark):* $t^2 = 164.6 \\Rightarrow t \\approx 12.83$ s.
*Step 3 (1 mark):* $v = at \\approx 2.43 \\cdot 12.83 \\approx 31.2$ m/s.
*Step 4 (1 mark):* (Or: $v^2 = 2as = 972 \\Rightarrow v \\approx 31.2$ m/s ✓.)

**d. (3 marks)**
*Step 1 (1 mark):* Air resistance proportional to $v$ (or $v^2$) opposing motion.
*Step 2 (1 mark):* Net force decreases as $v$ rises; acceleration decreases.
*Step 3 (1 mark):* Skier approaches a terminal velocity where gravity component is balanced by friction + drag. Final speed is less than 31.2 m/s; time to descend may be longer.`),
];

const out = { mcq, shortAnswer, extendedAnswer, extendedResponse };
fs.writeFileSync("scripts/output/qset-specialist-inclined.json", JSON.stringify(out, null, 2) + "\n");
console.log(`Wrote ${mcq.length} MCQ, ${shortAnswer.length} SHORT, ${extendedAnswer.length} EXT_ANS, ${extendedResponse.length} EXT_RESP to scripts/output/qset-specialist-inclined.json`);
