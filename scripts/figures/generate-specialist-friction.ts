/** Specialist modelling-rich: Friction. */
import * as fs from "fs";
interface MCQ { content: string; optionA: string; optionB: string; optionC: string; optionD: string; correctOption: "A"|"B"|"C"|"D"; marks: number; difficulty: "EASY"|"MEDIUM"|"HARD"; solutionContent: string; subtopicSlugs: string[]; }
interface FR { content: string; marks: number; difficulty: "EASY"|"MEDIUM"|"HARD"; solutionContent: string; subtopicSlugs: string[]; }
const P = "friction";
const m = (c: string, o: [string,string,string,string], k: "A"|"B"|"C"|"D", d: "EASY"|"MEDIUM"|"HARD", s: string, sec: string[] = []): MCQ =>
  ({ content: c, optionA: o[0], optionB: o[1], optionC: o[2], optionD: o[3], correctOption: k, marks: 1, difficulty: d, solutionContent: s, subtopicSlugs: [P, ...sec] });
const sq = (c: string, marks: number, d: "EASY"|"MEDIUM"|"HARD", s: string, sec: string[] = []): FR =>
  ({ content: c, marks, difficulty: d, solutionContent: s, subtopicSlugs: [P, ...sec] });

const mcq: MCQ[] = [
  m("Maximum static friction $f_s =$:", ["$\\mu_s N$", "$\\mu_s mg$", "$\\mu N v$", "$mg$"], "A", "EASY", "Standard formula with $N$ = normal. **Answer: A**"),
  m("Kinetic friction $f_k =$:", ["$\\mu_k N$", "$\\mu_k v$", "$0$", "$mg$"], "A", "EASY", "Standard. **Answer: A**"),
  m("Typically $\\mu_s$ vs $\\mu_k$:", ["$\\mu_s > \\mu_k$", "$\\mu_s < \\mu_k$", "$\\mu_s = \\mu_k$", "depends on motion"], "A", "EASY", "Static usually slightly larger. **Answer: A**"),
  m("Block on horizontal surface, $m = 5$ kg, $\\mu_k = 0.2$, $g = 10$. Kinetic friction:", ["$1$ N", "$5$ N", "$10$ N", "$50$ N"], "C", "MEDIUM", "$N = 50$ N; $f_k = 0.2 \\cdot 50 = 10$ N. **Answer: C**"),
  m("$\\mu_s = 0.4$. Min force to start a 10 kg block moving on horizontal ($g = 10$):", ["$4$ N", "$40$ N", "$100$ N", "$0$"], "B", "MEDIUM", "$N = 100$; max static $= 40$ N. **Answer: B**"),
  m("Friction is independent of:", ["mass", "normal force", "contact area (approx)", "surface roughness"], "C", "MEDIUM", "Classical model assumes no area dependence. **Answer: C**"),
  m("Block accelerating on horizontal floor, $\\mu_k = 0.3$, $g = 10$. Friction force is:", ["$\\mu_k v$", "$\\mu_k mg$", "$0$", "varies with velocity"], "B", "HARD", "Kinetic friction constant (in classical model). **Answer: B**"),
  m("Max angle of incline a block sits without sliding (coefficient $\\mu_s$):", ["$\\arctan(\\mu_s)$", "$\\arcsin(\\mu_s)$", "$\\arccos(\\mu_s)$", "$\\mu_s$"], "A", "HARD", "At slip: $mg\\sin\\theta = \\mu_s mg\\cos\\theta$, so $\\tan\\theta = \\mu_s$. **Answer: A**"),
];

const shortAnswer: FR[] = [
  sq("Block of 8 kg on horizontal surface, $\\mu_k = 0.25$, $g = 9.8$. Find kinetic friction force.", 2, "EASY", "*Step 1 (1 mark):* $N = mg = 8 \\cdot 9.8 = 78.4$ N.\n*Step 2 (1 mark):* $f_k = 0.25 \\cdot 78.4 = 19.6$ N."),
  sq("$\\mu_s = 0.5$. Find max angle of incline before slipping.", 2, "MEDIUM", "*Step 1 (1 mark):* $\\tan\\theta = \\mu_s = 0.5$.\n*Step 2 (1 mark):* $\\theta = \\arctan(0.5) \\approx 26.6°$."),
  sq("$m = 4$ kg, $\\mu_k = 0.3$, pulled along floor with 30 N force. Find acceleration ($g = 10$).", 3, "MEDIUM", "*Step 1 (1 mark):* Friction: $f = 0.3 \\cdot 40 = 12$ N.\n*Step 2 (1 mark):* Net force: $30 - 12 = 18$ N.\n*Step 3 (1 mark):* $a = 18/4 = 4.5$ m/s²."),
  sq("Block 10 kg on incline $30°$, $\\mu_k = 0.2$, $g = 10$. Find acceleration down the incline.", 3, "HARD", "*Step 1 (1 mark):* Gravity component down incline: $mg\\sin 30° = 50$ N. Normal: $mg\\cos 30° = 50\\sqrt 3 \\approx 86.6$ N.\n*Step 2 (1 mark):* Kinetic friction (up incline): $f = 0.2 \\cdot 86.6 \\approx 17.3$ N.\n*Step 3 (1 mark):* Net force: $50 - 17.3 = 32.7$ N. $a = 32.7/10 = 3.27$ m/s²."),
  sq("Force 20 N pulls 5 kg block on rough surface ($\\mu_k = 0.4$). Find net force and acceleration ($g = 10$).", 3, "MEDIUM", "*Step 1 (1 mark):* Friction: $0.4 \\cdot 50 = 20$ N.\n*Step 2 (1 mark):* Net force: $20 - 20 = 0$ N.\n*Step 3 (1 mark):* Acceleration: $0$ (block moves at constant velocity or just on threshold)."),
];

const extendedAnswer: FR[] = [
  sq(`A 5 kg block on horizontal floor is pulled by a rope at $30°$ above horizontal with tension $T$. Coefficient of static friction $\\mu_s = 0.4$, $g = 9.8$.

**a.** Draw a force diagram. (2 marks)

**b.** Find the minimum $T$ to start the block moving. (5 marks)

**c.** Comment on why pulling at an angle reduces the required force. (2 marks)`, 9, "MEDIUM",
    `**a. (2 marks)**
*Step 1 (1 mark):* Vertical: weight $W = mg = 49$ N down, normal $N$ up, tension component $T\\sin 30°$ up.
*Step 2 (1 mark):* Horizontal: $T\\cos 30°$ forward, friction $f$ backward.

**b. (5 marks)**
*Step 1 (1 mark):* Vertical equilibrium: $N + T\\sin 30° = 49 \\Rightarrow N = 49 - T/2$.
*Step 2 (1 mark):* Max static friction: $f_s = \\mu_s N = 0.4(49 - T/2)$.
*Step 3 (1 mark):* At threshold: $T\\cos 30° = f_s$.
*Step 4 (1 mark):* $T \\cdot \\sqrt 3/2 = 0.4(49 - T/2) \\Rightarrow T(\\sqrt 3/2 + 0.2) = 19.6$.
*Step 5 (1 mark):* $T \\approx 19.6/(0.866 + 0.2) = 19.6/1.066 \\approx 18.4$ N.

**c. (2 marks)**
*Step 1 (1 mark):* Pulling at an angle reduces the normal force ($N$ decreases by $T\\sin\\theta$).
*Step 2 (1 mark):* Lower $N$ → lower max friction → less force to overcome it.`),
];

const extendedResponse: FR[] = [
  sq(`A 12 kg crate is initially at rest on a horizontal floor. The coefficient of static friction is $\\mu_s = 0.45$, kinetic friction $\\mu_k = 0.30$. Take $g = 9.8$.

**a.** Find the minimum horizontal force $F_{\\min}$ to start the crate moving. (3 marks)

**b.** Once moving, $F = 50$ N is applied. Find the resulting acceleration. (3 marks)

**c.** If the force is removed once the crate has reached $v = 4$ m/s, find the deceleration and how far the crate slides before stopping. (4 marks)

**d.** Sketch a graph of velocity vs time for the entire motion (force applied for 5 s after start, then removed). (2 marks)`, 12, "HARD",
    `**a. (3 marks)**
*Step 1 (1 mark):* $N = mg = 12 \\cdot 9.8 = 117.6$ N.
*Step 2 (1 mark):* Max static friction: $0.45 \\cdot 117.6 = 52.92$ N.
*Step 3 (1 mark):* $F_{\\min} = 52.92$ N ($\\approx 53$ N).

**b. (3 marks)**
*Step 1 (1 mark):* Kinetic friction once moving: $f_k = 0.30 \\cdot 117.6 = 35.28$ N.
*Step 2 (1 mark):* Net force: $50 - 35.28 = 14.72$ N.
*Step 3 (1 mark):* $a = 14.72/12 \\approx 1.23$ m/s².

**c. (4 marks)**
*Step 1 (1 mark):* After force removed, only kinetic friction acts (backward).
*Step 2 (1 mark):* Deceleration: $a = -35.28/12 \\approx -2.94$ m/s².
*Step 3 (1 mark):* Use $v^2 = u^2 + 2as$: $0 = 16 + 2(-2.94)s \\Rightarrow s = 16/5.88 \\approx 2.72$ m.
*Step 4 (1 mark):* Time to stop: $t = 4/2.94 \\approx 1.36$ s.

**d. (2 marks)**
*Step 1 (1 mark):* Phase 1: $v$ rises from 0 to $v_1 = 0 + 1.23 \\cdot 5 = 6.15$ m/s linearly (slope 1.23).
*Step 2 (1 mark):* Phase 2: $v$ decreases linearly from 6.15 to 0 (slope $-2.94$); time $\\approx 2.09$ s. Total time $\\approx 7.09$ s.`),
];

const out = { mcq, shortAnswer, extendedAnswer, extendedResponse };
fs.writeFileSync("scripts/output/qset-specialist-friction.json", JSON.stringify(out, null, 2) + "\n");
console.log(`Wrote ${mcq.length} MCQ, ${shortAnswer.length} SHORT, ${extendedAnswer.length} EXT_ANS, ${extendedResponse.length} EXT_RESP to scripts/output/qset-specialist-friction.json`);
