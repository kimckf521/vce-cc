/** Specialist modelling-rich: Forces and Equilibrium. */
import * as fs from "fs";
interface MCQ { content: string; optionA: string; optionB: string; optionC: string; optionD: string; correctOption: "A"|"B"|"C"|"D"; marks: number; difficulty: "EASY"|"MEDIUM"|"HARD"; solutionContent: string; subtopicSlugs: string[]; }
interface FR { content: string; marks: number; difficulty: "EASY"|"MEDIUM"|"HARD"; solutionContent: string; subtopicSlugs: string[]; }
const P = "forces-and-equilibrium";
const m = (c: string, o: [string,string,string,string], k: "A"|"B"|"C"|"D", d: "EASY"|"MEDIUM"|"HARD", s: string, sec: string[] = []): MCQ =>
  ({ content: c, optionA: o[0], optionB: o[1], optionC: o[2], optionD: o[3], correctOption: k, marks: 1, difficulty: d, solutionContent: s, subtopicSlugs: [P, ...sec] });
const sq = (c: string, marks: number, d: "EASY"|"MEDIUM"|"HARD", s: string, sec: string[] = []): FR =>
  ({ content: c, marks, difficulty: d, solutionContent: s, subtopicSlugs: [P, ...sec] });

const mcq: MCQ[] = [
  m("Equilibrium requires net force:", ["$\\ne 0$", "$= 0$", "$> 0$", "varies"], "B", "EASY", "Definition. **Answer: B**"),
  m("Weight of mass $m$ kg is:", ["$m$ N", "$mg$ N (with $g$ in m/s²)", "$g/m$", "$m/g$"], "B", "EASY", "$W = mg$. **Answer: B**"),
  m("Object in equilibrium on a smooth horizontal floor has:", ["normal force = weight", "normal = 0", "weight = 0", "no forces"], "A", "EASY", "Vertical balance. **Answer: A**"),
  m("Two forces 3 N east, 4 N north on a particle. Net magnitude:", ["$7$ N", "$1$ N", "$5$ N", "$\\sqrt 7$ N"], "C", "MEDIUM", "Resultant $\\sqrt{9 + 16} = 5$ N. **Answer: C**"),
  m("To be in equilibrium under 3 concurrent forces, they form:", ["a triangle", "a line", "a parallelogram", "always 90°"], "A", "MEDIUM", "Triangle rule (or sum = 0). **Answer: A**"),
  m("Lami's theorem applies to:", ["any 4 coplanar concurrent forces", "3 concurrent coplanar forces in equilibrium", "any system", "non-concurrent forces"], "B", "MEDIUM", "Special case. **Answer: B**"),
  m("Component of force $F$ at angle $\\theta$ to horizontal: horizontal component:", ["$F \\sin\\theta$", "$F \\cos\\theta$", "$F$", "$F \\tan\\theta$"], "B", "HARD", "Standard. **Answer: B**"),
  m("A 50 N force pulls a 5 kg mass on smooth horizontal floor. Acceleration:", ["$10$ m/s²", "$5$ m/s²", "$50$ m/s²", "$0$"], "A", "HARD", "$a = F/m = 50/5 = 10$. **Answer: A**"),
];

const shortAnswer: FR[] = [
  sq("Forces 12 N east and 5 N south act on a particle. Find resultant magnitude and direction.", 2, "EASY", "*Step 1 (1 mark):* Magnitude $\\sqrt{144 + 25} = \\sqrt{169} = 13$ N.\n*Step 2 (1 mark):* Direction: $\\arctan(5/12) \\approx 22.6°$ south of east."),
  sq("A 10 kg block sits at rest on a horizontal floor. Find normal force ($g = 9.8$).", 1, "EASY", "$N = mg = 10 \\cdot 9.8 = 98$ N (vertical balance)."),
  sq("Three forces: 6 N at 0°, 8 N at 90°, $T$ at $\\theta$ keep a particle in equilibrium. Find $T$ and $\\theta$.", 3, "MEDIUM", "*Step 1 (1 mark):* For equilibrium, third force balances first two.\n*Step 2 (1 mark):* Resultant of first two: $\\sqrt{36 + 64} = 10$ N at $\\arctan(8/6) \\approx 53.1°$ above x-axis.\n*Step 3 (1 mark):* $T = 10$ N, $\\theta = 53.1° + 180° = 233.1°$ (opposite direction)."),
  sq("Block of 4 kg suspended by two strings at $30°$ either side of vertical. Find tension in each.", 3, "MEDIUM", "*Step 1 (1 mark):* Weight $W = 4g$ downward. Each string has tension $T$ at $30°$ from vertical.\n*Step 2 (1 mark):* Vertical balance: $2T\\cos 30° = 4g$.\n*Step 3 (1 mark):* $T = 4g/(2\\cos 30°) = 2 \\cdot 9.8 / (\\sqrt 3/1) \\cdot 1 = \\dfrac{2 \\cdot 9.8}{\\sqrt 3} \\approx 11.3$ N each."),
  sq("Resolve a 100 N force at $40°$ to horizontal into components.", 2, "MEDIUM", "*Step 1 (1 mark):* Horizontal: $100 \\cos 40° \\approx 76.6$ N.\n*Step 2 (1 mark):* Vertical: $100 \\sin 40° \\approx 64.3$ N."),
];

const extendedAnswer: FR[] = [
  sq(`A 20 kg crate hangs from two ropes attached to the ceiling. One rope makes $30°$ with the vertical, the other $45°$. Take $g = 9.8$ m/s².

**a.** Draw a force diagram. (1 mark)

**b.** Write the equilibrium equations. (3 marks)

**c.** Solve for the tensions $T_1$ and $T_2$. (4 marks)`, 8, "MEDIUM",
    `**a. (1 mark)** Force diagram: crate at junction; gravity $20g$ down; tension $T_1$ along rope at $30°$ from vertical (one side); tension $T_2$ at $45°$ from vertical (other side).

**b. (3 marks)**
*Step 1 (1 mark):* Horizontal balance: $T_1 \\sin 30° = T_2 \\sin 45°$.
*Step 2 (1 mark):* Vertical balance: $T_1 \\cos 30° + T_2 \\cos 45° = 20g$.
*Step 3 (1 mark):* Substitute values: $T_1/2 = T_2/\\sqrt 2$, i.e. $T_1 = T_2 \\cdot \\sqrt 2$.

**c. (4 marks)**
*Step 1 (1 mark):* From horizontal: $T_1 = \\sqrt 2 T_2$.
*Step 2 (1 mark):* Substitute in vertical: $\\sqrt 2 T_2 \\cdot (\\sqrt 3/2) + T_2/\\sqrt 2 = 20 \\cdot 9.8 = 196$.
*Step 3 (1 mark):* $T_2 [\\sqrt 6/2 + \\sqrt 2/2] = 196$, so $T_2 = 392/(\\sqrt 6 + \\sqrt 2) \\approx 101.5$ N.
*Step 4 (1 mark):* $T_1 = \\sqrt 2 \\cdot 101.5 \\approx 143.5$ N.`),
];

const extendedResponse: FR[] = [
  sq(`A sign of mass 30 kg hangs from a horizontal beam, supported by a strut making $40°$ with the horizontal. The strut is hinged at the wall.

**a.** Draw a clear force diagram. (2 marks)

**b.** Write down the equations of equilibrium for vertical and horizontal forces at the hinge. (3 marks)

**c.** Solve for the tension/compression in the strut and the horizontal pull on the wall. (4 marks)

**d.** What happens to the wall pull if the strut angle is reduced to $20°$? (3 marks)`, 12, "HARD",
    `**a. (2 marks)**
*Step 1 (1 mark):* Sign at end of beam: weight $30g$ down.
*Step 2 (1 mark):* Strut force $F$ along strut (compression if angle below beam); wall pull $W_h$ horizontally on hinge.

**b. (3 marks)**
*Step 1 (1 mark):* Vertical: $F\\sin 40° = 30g = 294$ N.
*Step 2 (1 mark):* Horizontal: $F\\cos 40° = W_h$ (wall pulls beam toward wall).
*Step 3 (1 mark):* Two equations, two unknowns.

**c. (4 marks)**
*Step 1 (1 mark):* From vertical: $F = 294/\\sin 40° \\approx 457$ N.
*Step 2 (1 mark):* From horizontal: $W_h = 457 \\cos 40° \\approx 350$ N.
*Step 3 (1 mark):* So strut force $\\approx 457$ N (compression).
*Step 4 (1 mark):* Wall reaction $\\approx 350$ N pulling outward.

**d. (3 marks)**
*Step 1 (1 mark):* At $20°$: $F = 294/\\sin 20° \\approx 860$ N (much larger).
*Step 2 (1 mark):* $W_h = 860 \\cos 20° \\approx 808$ N.
*Step 3 (1 mark):* Wall pull more than doubles; smaller angle means weight requires much larger strut force, with most going horizontally — physically dangerous for the wall.`),
];

const out = { mcq, shortAnswer, extendedAnswer, extendedResponse };
fs.writeFileSync("scripts/output/qset-specialist-forces.json", JSON.stringify(out, null, 2) + "\n");
console.log(`Wrote ${mcq.length} MCQ, ${shortAnswer.length} SHORT, ${extendedAnswer.length} EXT_ANS, ${extendedResponse.length} EXT_RESP to scripts/output/qset-specialist-forces.json`);
