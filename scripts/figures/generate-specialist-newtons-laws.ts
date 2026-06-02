/** Specialist modelling-rich: Newton's Laws of Motion. */
import * as fs from "fs";
interface MCQ { content: string; optionA: string; optionB: string; optionC: string; optionD: string; correctOption: "A"|"B"|"C"|"D"; marks: number; difficulty: "EASY"|"MEDIUM"|"HARD"; solutionContent: string; subtopicSlugs: string[]; }
interface FR { content: string; marks: number; difficulty: "EASY"|"MEDIUM"|"HARD"; solutionContent: string; subtopicSlugs: string[]; }
const P = "newtons-laws-of-motion";
const m = (c: string, o: [string,string,string,string], k: "A"|"B"|"C"|"D", d: "EASY"|"MEDIUM"|"HARD", s: string, sec: string[] = []): MCQ =>
  ({ content: c, optionA: o[0], optionB: o[1], optionC: o[2], optionD: o[3], correctOption: k, marks: 1, difficulty: d, solutionContent: s, subtopicSlugs: [P, ...sec] });
const sq = (c: string, marks: number, d: "EASY"|"MEDIUM"|"HARD", s: string, sec: string[] = []): FR =>
  ({ content: c, marks, difficulty: d, solutionContent: s, subtopicSlugs: [P, ...sec] });

const mcq: MCQ[] = [
  m("Newton's 1st Law:", ["$F = ma$", "object at rest stays at rest unless acted upon", "$F_{12} = -F_{21}$", "all forces conservative"], "B", "EASY", "Inertia. **Answer: B**"),
  m("Newton's 2nd Law:", ["$F = ma$", "$F = mv$", "$F = m + a$", "$F = m/a$"], "A", "EASY", "Standard. **Answer: A**"),
  m("Newton's 3rd Law:", ["$F = ma$", "every action has equal and opposite reaction", "$E = mc^2$", "$pV = nRT$"], "B", "EASY", "Standard. **Answer: B**"),
  m("Net force 10 N on 2 kg block, $a =$:", ["$5$ m/s²", "$10$ m/s²", "$20$ m/s²", "$2$ m/s²"], "A", "EASY", "$a = F/m$. **Answer: A**"),
  m("If $a = 0$ for an object:", ["it is at rest", "constant velocity (could be zero)", "no forces", "$F = ma = 0$ but forces may balance"], "D", "MEDIUM", "$a = 0$ when net force zero, but individual forces present. **Answer: D**"),
  m("Reaction force in 3rd law acts on:", ["same object", "different object", "either", "no object"], "B", "MEDIUM", "Reaction on the OTHER body. **Answer: B**"),
  m("Block of $m$ kg in lift accelerating up at $a$. Apparent weight:", ["$mg$", "$m(g + a)$", "$m(g - a)$", "$ma$"], "B", "HARD", "Effective weight increases. **Answer: B**"),
  m("Two blocks of mass $m$ tied together pulled by force $F$ on smooth surface. Tension in cord:", ["$F$", "$F/2$", "$2F$", "$0$"], "B", "HARD", "Total $a = F/(2m)$; tension pulls only second block: $T = ma = F/2$. **Answer: B**"),
];

const shortAnswer: FR[] = [
  sq("Force 24 N on 4 kg. Find acceleration.", 1, "EASY", "$a = 24/4 = 6$ m/s²."),
  sq("Block of 5 kg accelerates at 3 m/s². Find net force.", 1, "EASY", "$F = 5 \\cdot 3 = 15$ N."),
  sq("Lift accelerates upward at 2 m/s² with 70 kg person inside. Normal force from floor on person ($g = 9.8$).", 2, "MEDIUM", "*Step 1 (1 mark):* Newton's 2nd: $N - mg = ma$.\n*Step 2 (1 mark):* $N = 70(9.8 + 2) = 826$ N."),
  sq("Force 50 N applied to 10 kg block on smooth horizontal surface. Compute work over 3 m.", 2, "EASY", "*Step 1 (1 mark):* $W = F \\cdot d = 50 \\cdot 3 = 150$ J.\n*Step 2 (1 mark):* Alternative: $a = 5$ m/s², $v^2 = 30 \\Rightarrow KE = 150$ J ✓."),
  sq("State Newton's third law and give one example.", 2, "EASY", "*Step 1 (1 mark):* Every action has an equal and opposite reaction. If body A exerts force $\\vec F$ on B, then B exerts $-\\vec F$ on A.\n*Step 2 (1 mark):* Example: Earth pulls book down with gravity, book pulls Earth up with equal force; rocket exhaust pushed down, rocket pushed up."),
];

const extendedAnswer: FR[] = [
  sq(`Two masses connected by a light string over a frictionless pulley (Atwood machine): $m_1 = 4$ kg, $m_2 = 6$ kg. $g = 9.8$.

**a.** Find the acceleration of the system. (4 marks)

**b.** Find the tension in the string. (3 marks)

**c.** Find the tension on a 7 kg vs 3 kg system. (2 marks)`, 9, "MEDIUM",
    `**a. (4 marks)**
*Step 1 (1 mark):* For $m_1$ rising: $T - m_1 g = m_1 a$.
*Step 2 (1 mark):* For $m_2$ falling: $m_2 g - T = m_2 a$.
*Step 3 (1 mark):* Adding: $(m_2 - m_1)g = (m_1 + m_2)a$.
*Step 4 (1 mark):* $a = (6 - 4)(9.8)/(10) = 1.96$ m/s².

**b. (3 marks)**
*Step 1 (1 mark):* From $T = m_1(g + a) = 4(9.8 + 1.96)$.
*Step 2 (1 mark):* $T = 4 \\cdot 11.76 = 47.04$ N.
*Step 3 (1 mark):* Verify: $T = m_2(g - a) = 6(9.8 - 1.96) = 47.04$ ✓.

**c. (2 marks)**
*Step 1 (1 mark):* $a = (7 - 3)(9.8)/10 = 3.92$ m/s².
*Step 2 (1 mark):* $T = m_1(g+a) = 3(9.8 + 3.92) = 41.16$ N.`),
];

const extendedResponse: FR[] = [
  sq(`A block of 5 kg sits on a horizontal table connected by a string over a pulley to another block of 3 kg hanging vertically. The table is rough with $\\mu_k = 0.2$. $g = 9.8$.

**a.** Draw a force diagram for each block. (2 marks)

**b.** Write down Newton's 2nd law for each block. (3 marks)

**c.** Solve for the acceleration of the system. (4 marks)

**d.** Find the tension in the string. (3 marks)`, 12, "HARD",
    `**a. (2 marks)**
*Step 1 (1 mark):* 5 kg block: weight $5g$ down, normal $N$ up, tension $T$ toward pulley (horizontal), friction $f = \\mu_k N$ opposing motion (horizontal).
*Step 2 (1 mark):* 3 kg block: weight $3g$ down, tension $T$ up.

**b. (3 marks)**
*Step 1 (1 mark):* Vertical (5 kg): $N = 5g$.
*Step 2 (1 mark):* Horizontal (5 kg): $T - \\mu_k N = 5a$, i.e. $T - 0.2 \\cdot 49 = 5a \\Rightarrow T - 9.8 = 5a$.
*Step 3 (1 mark):* Vertical (3 kg, taking down as positive): $3g - T = 3a \\Rightarrow 29.4 - T = 3a$.

**c. (4 marks)**
*Step 1 (1 mark):* Add: $(29.4 - 9.8) = 8a$.
*Step 2 (1 mark):* $19.6 = 8a$.
*Step 3 (1 mark):* $a = 2.45$ m/s².
*Step 4 (1 mark):* (Both blocks accelerate at the same magnitude due to inextensible string.)

**d. (3 marks)**
*Step 1 (1 mark):* From $T = 5a + 9.8$.
*Step 2 (1 mark):* $T = 5(2.45) + 9.8$.
*Step 3 (1 mark):* $T = 22.05$ N.`),

  sq(`A rocket of mass 1000 kg (including fuel) burns fuel at a rate of 5 kg/s, ejecting exhaust at 1500 m/s relative to the rocket. The rocket is moving straight up under gravity.

**a.** Use the rocket equation (or Newton's 2nd law) to find the thrust force. (3 marks)

**b.** Calculate the net force on the rocket at $t = 0$ (with full fuel). $g = 9.8$. (3 marks)

**c.** Determine initial acceleration. (2 marks)

**d.** Discuss qualitatively how acceleration changes as fuel is consumed. (3 marks)`, 11, "HARD",
    `**a. (3 marks)**
*Step 1 (1 mark):* Thrust = (mass rate of exhaust)(exhaust velocity).
*Step 2 (1 mark):* $T = \\dot m v_{\\text{ex}} = 5 \\cdot 1500$.
*Step 3 (1 mark):* $T = 7500$ N.

**b. (3 marks)**
*Step 1 (1 mark):* Weight at $t = 0$: $W = mg = 1000 \\cdot 9.8 = 9800$ N.
*Step 2 (1 mark):* Net force: $F_{\\text{net}} = T - W = 7500 - 9800$.
*Step 3 (1 mark):* $= -2300$ N (rocket cannot lift off with these numbers — exam scenario).

**c. (2 marks)**
*Step 1 (1 mark):* $a = F_{\\text{net}}/m = -2300/1000$.
*Step 2 (1 mark):* $a = -2.3$ m/s² — actually decelerates if moving up; rocket fails to lift if at rest.

**d. (3 marks)**
*Step 1 (1 mark):* As fuel burns, mass decreases. Weight decreases proportionally.
*Step 2 (1 mark):* Once mass drops below $7500/9.8 \\approx 765$ kg, weight < thrust → net upward force.
*Step 3 (1 mark):* Acceleration increases over time; eventually rocket lifts off and accelerates faster as remaining mass shrinks (Tsiolkovsky equation behaviour).`),
];

const out = { mcq, shortAnswer, extendedAnswer, extendedResponse };
fs.writeFileSync("scripts/output/qset-specialist-newtons-laws.json", JSON.stringify(out, null, 2) + "\n");
console.log(`Wrote ${mcq.length} MCQ, ${shortAnswer.length} SHORT, ${extendedAnswer.length} EXT_ANS, ${extendedResponse.length} EXT_RESP to scripts/output/qset-specialist-newtons-laws.json`);
