/** Specialist ext-fit: Trigonometric Substitution. */
import * as fs from "fs";
interface MCQ { content: string; optionA: string; optionB: string; optionC: string; optionD: string; correctOption: "A"|"B"|"C"|"D"; marks: number; difficulty: "EASY"|"MEDIUM"|"HARD"; solutionContent: string; subtopicSlugs: string[]; }
interface FR { content: string; marks: number; difficulty: "EASY"|"MEDIUM"|"HARD"; solutionContent: string; subtopicSlugs: string[]; }
const P = "trigonometric-substitution";
const m = (c: string, o: [string,string,string,string], k: "A"|"B"|"C"|"D", d: "EASY"|"MEDIUM"|"HARD", s: string, sec: string[] = []): MCQ =>
  ({ content: c, optionA: o[0], optionB: o[1], optionC: o[2], optionD: o[3], correctOption: k, marks: 1, difficulty: d, solutionContent: s, subtopicSlugs: [P, ...sec] });
const sq = (c: string, marks: number, d: "EASY"|"MEDIUM"|"HARD", s: string, sec: string[] = []): FR =>
  ({ content: c, marks, difficulty: d, solutionContent: s, subtopicSlugs: [P, ...sec] });

const mcq: MCQ[] = [
  m("For $\\int \\dfrac{dx}{\\sqrt{1 - x^2}}$, use:", ["$x = \\sin\\theta$", "$x = \\tan\\theta$", "$x = \\sec\\theta$", "$x = e^\\theta$"], "A", "EASY",
    "Sub $x = \\sin\\theta$, $\\sqrt{1 - x^2} = \\cos\\theta$. **Answer: A**"),
  m("$\\int \\dfrac{dx}{\\sqrt{1 - x^2}} =$:", ["$\\arcsin x + C$", "$\\arctan x + C$", "$\\arccos x + C$", "$\\ln x + C$"], "A", "EASY",
    "Standard antiderivative. **Answer: A**"),
  m("$\\int \\dfrac{dx}{1 + x^2} =$:", ["$\\arctan x + C$", "$\\arcsin x + C$", "$\\ln(1+x^2) + C$", "$\\arccos x + C$"], "A", "EASY",
    "Standard. **Answer: A**"),
  m("For $\\int \\sqrt{4 - x^2} dx$, use:", ["$x = 2\\sin\\theta$", "$x = 4\\sin\\theta$", "$x = 2\\tan\\theta$", "$x = \\sqrt 4$"], "A", "MEDIUM",
    "Sub $x = 2\\sin\\theta$, $\\sqrt{4 - x^2} = 2\\cos\\theta$. **Answer: A**"),
  m("$\\int \\dfrac{dx}{\\sqrt{a^2 - x^2}}$ where $a > 0$:", ["$\\arcsin(x/a) + C$", "$\\arctan(x/a) + C$", "$\\dfrac{1}{a}\\arcsin(x/a)$", "$\\ln x + C$"], "A", "MEDIUM",
    "Sub $x = a\\sin\\theta$. **Answer: A**"),
  m("$\\int_0^{1/2} \\dfrac{dx}{\\sqrt{1 - x^2}} =$:", ["$\\pi/6$", "$\\pi/4$", "$\\pi/3$", "$\\pi/2$"], "A", "MEDIUM",
    "$\\arcsin(1/2) - \\arcsin 0 = \\pi/6$. **Answer: A**"),
  m("$\\int \\dfrac{dx}{a^2 + x^2}$ where $a > 0$:", ["$\\dfrac{1}{a}\\arctan(x/a) + C$", "$\\arctan(x/a) + C$", "$\\arcsin(x/a) + C$", "$a \\arctan(x/a)$"], "A", "HARD",
    "Sub $x = a\\tan\\theta$, $dx = a\\sec^2\\theta d\\theta$, $a^2 + x^2 = a^2\\sec^2\\theta$; integral becomes $(1/a)\\theta = (1/a)\\arctan(x/a)$. **Answer: A**"),
  m("To evaluate $\\int \\dfrac{dx}{x\\sqrt{x^2 - 1}}$, use:", ["$x = \\sin\\theta$", "$x = \\sec\\theta$", "$x = \\tan\\theta$", "$x = e^\\theta$"], "B", "HARD",
    "$\\sqrt{x^2 - 1}$ pattern → $x = \\sec\\theta$. **Answer: B**"),
];

const shortAnswer: FR[] = [
  sq("Evaluate $\\int_0^1 \\sqrt{1 - x^2} dx$.", 3, "MEDIUM",
    "*Step 1 (1 mark):* Sub $x = \\sin\\theta$, $dx = \\cos\\theta d\\theta$, limits $0 \\to \\pi/2$. $\\sqrt{1 - \\sin^2\\theta} = \\cos\\theta$.\n*Step 2 (1 mark):* $\\int_0^{\\pi/2} \\cos^2\\theta d\\theta = \\int_0^{\\pi/2} (1 + \\cos 2\\theta)/2 d\\theta$.\n*Step 3 (1 mark):* $= [\\theta/2 + \\sin 2\\theta / 4]_0^{\\pi/2} = \\pi/4 + 0 = \\pi/4$."),
  sq("Evaluate $\\int \\dfrac{dx}{\\sqrt{9 - x^2}}$.", 2, "EASY",
    "*Step 1 (1 mark):* This is the standard form $\\int dx/\\sqrt{a^2 - x^2}$ with $a = 3$.\n*Step 2 (1 mark):* $= \\arcsin(x/3) + C$."),
  sq("Evaluate $\\int_0^2 \\dfrac{dx}{4 + x^2}$.", 3, "MEDIUM",
    "*Step 1 (1 mark):* Standard: $(1/a)\\arctan(x/a)$ with $a = 2$.\n*Step 2 (1 mark):* $= [\\dfrac{1}{2}\\arctan(x/2)]_0^2$.\n*Step 3 (1 mark):* $= \\dfrac{1}{2}\\arctan(1) - 0 = \\pi/8$."),
  sq("Find $\\int \\dfrac{x dx}{\\sqrt{1 - x^2}}$.", 2, "MEDIUM",
    "*Step 1 (1 mark):* Let $u = 1 - x^2$, $du = -2x dx$. $\\int = -\\dfrac{1}{2}\\int u^{-1/2} du$.\n*Step 2 (1 mark):* $= -\\sqrt u + C = -\\sqrt{1 - x^2} + C$."),
  sq("Evaluate $\\int_0^1 x \\sqrt{1 - x^2} dx$ by substitution.", 3, "HARD",
    "*Step 1 (1 mark):* $u = 1 - x^2$, $du = -2x dx$, limits $1 \\to 0$.\n*Step 2 (1 mark):* $\\int = -\\dfrac{1}{2}\\int_1^0 \\sqrt u du = \\dfrac{1}{2}\\int_0^1 u^{1/2} du$.\n*Step 3 (1 mark):* $= \\dfrac{1}{2} \\cdot \\dfrac{2}{3} = 1/3$."),
];

const extendedAnswer: FR[] = [
  sq(`Evaluate the following definite integrals.

**a.** $\\int_0^2 \\sqrt{4 - x^2} dx$ (4 marks)

**b.** $\\int_{-1}^1 \\dfrac{dx}{1 + x^2}$ (3 marks)`, 7, "MEDIUM",
    `**a. (4 marks)**
*Step 1 (1 mark):* Sub $x = 2\\sin\\theta$, $dx = 2\\cos\\theta d\\theta$. $\\sqrt{4 - 4\\sin^2\\theta} = 2\\cos\\theta$.
*Step 2 (1 mark):* Limits: $x = 0 \\to \\theta = 0$; $x = 2 \\to \\theta = \\pi/2$.
*Step 3 (1 mark):* $\\int = \\int_0^{\\pi/2} 4\\cos^2\\theta d\\theta = 2\\int_0^{\\pi/2}(1 + \\cos 2\\theta) d\\theta$.
*Step 4 (1 mark):* $= 2[\\theta + \\sin 2\\theta/2]_0^{\\pi/2} = 2 \\cdot \\pi/2 = \\pi$.

**b. (3 marks)**
*Step 1 (1 mark):* $\\int dx/(1+x^2) = \\arctan x + C$.
*Step 2 (1 mark):* Evaluate $[-1, 1]$: $\\arctan(1) - \\arctan(-1) = \\pi/4 - (-\\pi/4)$.
*Step 3 (1 mark):* $= \\pi/2$.`),
];

const out = { mcq, shortAnswer, extendedAnswer, extendedResponse: [] };
fs.writeFileSync("scripts/output/qset-specialist-trig-sub.json", JSON.stringify(out, null, 2) + "\n");
console.log(`Wrote ${mcq.length} MCQ, ${shortAnswer.length} SHORT, ${extendedAnswer.length} EXT_ANS to scripts/output/qset-specialist-trig-sub.json`);
