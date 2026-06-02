/** Specialist ext-fit: Momentum and Impulse. */
import * as fs from "fs";
interface MCQ { content: string; optionA: string; optionB: string; optionC: string; optionD: string; correctOption: "A"|"B"|"C"|"D"; marks: number; difficulty: "EASY"|"MEDIUM"|"HARD"; solutionContent: string; subtopicSlugs: string[]; }
interface FR { content: string; marks: number; difficulty: "EASY"|"MEDIUM"|"HARD"; solutionContent: string; subtopicSlugs: string[]; }
const P = "momentum-and-impulse";
const m = (c: string, o: [string,string,string,string], k: "A"|"B"|"C"|"D", d: "EASY"|"MEDIUM"|"HARD", s: string, sec: string[] = []): MCQ =>
  ({ content: c, optionA: o[0], optionB: o[1], optionC: o[2], optionD: o[3], correctOption: k, marks: 1, difficulty: d, solutionContent: s, subtopicSlugs: [P, ...sec] });
const sq = (c: string, marks: number, d: "EASY"|"MEDIUM"|"HARD", s: string, sec: string[] = []): FR =>
  ({ content: c, marks, difficulty: d, solutionContent: s, subtopicSlugs: [P, ...sec] });

const mcq: MCQ[] = [
  m("Momentum $\\vec p =$:", ["$m\\vec v$", "$mv^2$", "$\\vec v$", "$mv/2$"], "A", "EASY", "Definition. **Answer: A**"),
  m("Impulse $\\vec J = \\Delta\\vec p =$:", ["$\\vec F \\Delta t$", "$F$", "$F/t$", "$\\Delta v$"], "A", "EASY", "Impulse-momentum theorem. **Answer: A**"),
  m("Units of impulse:", ["N", "N·s", "kg·m", "J"], "B", "EASY", "$\\vec F \\Delta t$ → N·s = kg·m/s. **Answer: B**"),
  m("Conservation of momentum applies to:", ["any system", "isolated systems (no external net force)", "moving systems", "only collisions"], "B", "MEDIUM", "Conservation requires no external impulse. **Answer: B**"),
  m("5 kg moving at 4 m/s. Momentum:", ["$20$ kg·m/s", "$9$ kg·m/s", "$1$ kg·m/s", "$40$ kg·m/s"], "A", "EASY", "$mv = 20$. **Answer: A**"),
  m("Force 10 N applied for 5 s. Impulse:", ["$50$ N·s", "$2$ N·s", "$10$ N·s", "$5$ N·s"], "A", "MEDIUM", "$F\\Delta t = 50$. **Answer: A**"),
  m("2 kg at 3 m/s collides and sticks to 3 kg at rest. Final velocity:", ["$0.6$ m/s", "$1.2$ m/s", "$3$ m/s", "$5$ m/s"], "B", "HARD", "$2 \\cdot 3 = (2+3)v \\Rightarrow v = 1.2$ m/s. **Answer: B**"),
  m("Elastic collision: 1 kg moving at 5 m/s hits stationary 1 kg. Final velocities:", ["both 2.5 m/s", "first 0, second 5 m/s", "first 5, second 0", "both 5 m/s"], "B", "HARD", "Equal masses elastic exchange velocities. **Answer: B**"),
];

const shortAnswer: FR[] = [
  sq("Mass 3 kg moving at 4 m/s. Compute momentum.", 1, "EASY", "$p = mv = 3 \\cdot 4 = 12$ kg·m/s."),
  sq("Force 8 N applied for 0.5 s on 2 kg block at rest. Find final velocity.", 2, "EASY", "*Step 1 (1 mark):* Impulse $= 8 \\cdot 0.5 = 4$ N·s.\n*Step 2 (1 mark):* $\\Delta v = J/m = 4/2 = 2$ m/s. Final velocity: $2$ m/s."),
  sq("Two carts collide and stick. $m_1 = 2$ kg, $v_1 = 3$ m/s; $m_2 = 3$ kg, $v_2 = -1$ m/s. Find final velocity.", 3, "MEDIUM", "*Step 1 (1 mark):* Initial momentum: $2(3) + 3(-1) = 6 - 3 = 3$ kg·m/s.\n*Step 2 (1 mark):* Total mass: $5$ kg.\n*Step 3 (1 mark):* $v_f = 3/5 = 0.6$ m/s."),
  sq("Ball mass 0.5 kg hits wall at 6 m/s, rebounds at 4 m/s (opposite direction). Find impulse.", 2, "MEDIUM", "*Step 1 (1 mark):* $\\Delta v = -4 - 6 = -10$ m/s.\n*Step 2 (1 mark):* Impulse $= m\\Delta v = 0.5(-10) = -5$ N·s (magnitude 5 N·s)."),
  sq("Why does a long contact time reduce impact force for given $\\Delta p$?", 2, "EASY", "*Step 1 (1 mark):* From $F = \\Delta p / \\Delta t$: with $\\Delta p$ fixed, longer $\\Delta t$ means smaller force.\n*Step 2 (1 mark):* Application: car crumple zones, airbags, soft landings."),
];

const extendedAnswer: FR[] = [
  sq(`Two cars are involved in a collision. Car A (1200 kg) moves east at 20 m/s; Car B (1800 kg) moves north at 15 m/s. They collide and stick.

**a.** Find the components of total momentum before collision. (2 marks)

**b.** Find the magnitude and direction of the combined velocity after the collision. (5 marks)

**c.** Compute KE before and after — is energy conserved? (3 marks)`, 10, "MEDIUM",
    `**a. (2 marks)**
*Step 1 (1 mark):* East: $p_x = 1200 \\cdot 20 = 24000$ kg·m/s.
*Step 2 (1 mark):* North: $p_y = 1800 \\cdot 15 = 27000$ kg·m/s.

**b. (5 marks)**
*Step 1 (1 mark):* Total mass $M = 3000$ kg.
*Step 2 (1 mark):* $v_x = 24000/3000 = 8$ m/s east.
*Step 3 (1 mark):* $v_y = 27000/3000 = 9$ m/s north.
*Step 4 (1 mark):* Magnitude: $\\sqrt{64 + 81} = \\sqrt{145} \\approx 12.04$ m/s.
*Step 5 (1 mark):* Direction: $\\arctan(9/8) \\approx 48.4°$ north of east.

**c. (3 marks)**
*Step 1 (1 mark):* KE before: $\\frac{1}{2}(1200)(400) + \\frac{1}{2}(1800)(225) = 240000 + 202500 = 442500$ J.
*Step 2 (1 mark):* KE after: $\\frac{1}{2}(3000)(145) = 217500$ J.
*Step 3 (1 mark):* Not conserved — $\\approx 225000$ J lost to deformation/heat. Inelastic collision.`),
];

const out = { mcq, shortAnswer, extendedAnswer, extendedResponse: [] };
fs.writeFileSync("scripts/output/qset-specialist-momentum.json", JSON.stringify(out, null, 2) + "\n");
console.log(`Wrote ${mcq.length} MCQ, ${shortAnswer.length} SHORT, ${extendedAnswer.length} EXT_ANS to scripts/output/qset-specialist-momentum.json`);
