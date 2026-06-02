/** Specialist ext-fit: Reciprocal Circular Functions (sec, csc, cot). */
import * as fs from "fs";
interface MCQ { content: string; optionA: string; optionB: string; optionC: string; optionD: string; correctOption: "A"|"B"|"C"|"D"; marks: number; difficulty: "EASY"|"MEDIUM"|"HARD"; solutionContent: string; subtopicSlugs: string[]; }
interface FR { content: string; marks: number; difficulty: "EASY"|"MEDIUM"|"HARD"; solutionContent: string; subtopicSlugs: string[]; }
const P = "reciprocal-circular-functions-sec-cosec-cot";
const m = (c: string, o: [string,string,string,string], k: "A"|"B"|"C"|"D", d: "EASY"|"MEDIUM"|"HARD", s: string, sec: string[] = []): MCQ =>
  ({ content: c, optionA: o[0], optionB: o[1], optionC: o[2], optionD: o[3], correctOption: k, marks: 1, difficulty: d, solutionContent: s, subtopicSlugs: [P, ...sec] });
const sq = (c: string, marks: number, d: "EASY"|"MEDIUM"|"HARD", s: string, sec: string[] = []): FR =>
  ({ content: c, marks, difficulty: d, solutionContent: s, subtopicSlugs: [P, ...sec] });

const mcq: MCQ[] = [
  m("$\\sec\\theta =$:", ["$1/\\cos\\theta$", "$1/\\sin\\theta$", "$\\cos\\theta$", "$\\tan\\theta$"], "A", "EASY", "Definition. **Answer: A**"),
  m("$\\csc\\theta =$:", ["$1/\\sin\\theta$", "$1/\\cos\\theta$", "$\\cos\\theta$", "$\\sin\\theta$"], "A", "EASY", "Definition. **Answer: A**"),
  m("$\\cot\\theta =$:", ["$\\cos\\theta/\\sin\\theta$", "$1/\\tan\\theta$", "both", "neither"], "C", "EASY", "Both representations. **Answer: C**"),
  m("$\\sec^2\\theta - \\tan^2\\theta =$:", ["$1$", "$0$", "$2$", "$\\sin^2\\theta$"], "A", "MEDIUM", "Pythagorean: $\\sec^2 = 1 + \\tan^2$. **Answer: A**"),
  m("Period of $\\sec(x)$:", ["$\\pi$", "$2\\pi$", "$\\pi/2$", "$4\\pi$"], "B", "MEDIUM", "Same as $\\cos x$. **Answer: B**"),
  m("Range of $\\csc x$:", ["$\\mathbb{R}$", "$(-\\infty, -1] \\cup [1, \\infty)$", "$[-1, 1]$", "$(0, \\infty)$"], "B", "MEDIUM", "$|\\csc x| \\ge 1$. **Answer: B**"),
  m("$\\dfrac{d}{dx}\\sec x =$:", ["$\\sec x \\tan x$", "$-\\sec x$", "$\\sec^2 x$", "$\\csc x \\cot x$"], "A", "HARD", "Standard. **Answer: A**"),
  m("$\\int \\sec^2 x dx =$:", ["$\\tan x + C$", "$\\sec x + C$", "$-\\cot x + C$", "$\\sec x \\tan x + C$"], "A", "HARD", "Standard. **Answer: A**"),
];

const shortAnswer: FR[] = [
  sq("Find $\\sec(\\pi/3)$, $\\csc(\\pi/4)$, $\\cot(\\pi/6)$.", 2, "EASY", "*Step 1 (1 mark):* $\\sec(\\pi/3) = 1/\\cos(\\pi/3) = 1/(1/2) = 2$. $\\csc(\\pi/4) = 1/(\\sqrt 2/2) = \\sqrt 2$.\n*Step 2 (1 mark):* $\\cot(\\pi/6) = \\cos(\\pi/6)/\\sin(\\pi/6) = (\\sqrt 3/2)/(1/2) = \\sqrt 3$."),
  sq("Prove the identity $\\tan^2\\theta + 1 = \\sec^2\\theta$.", 2, "MEDIUM", "*Step 1 (1 mark):* Start with $\\sin^2 + \\cos^2 = 1$.\n*Step 2 (1 mark):* Divide by $\\cos^2\\theta$: $\\tan^2 + 1 = \\sec^2\\theta$ ✓."),
  sq("If $\\sec\\theta = 5/3$ and $\\theta$ in first quadrant, find $\\sin\\theta$.", 3, "MEDIUM", "*Step 1 (1 mark):* $\\cos\\theta = 3/5$.\n*Step 2 (1 mark):* $\\sin^2\\theta = 1 - 9/25 = 16/25$.\n*Step 3 (1 mark):* $\\sin\\theta = 4/5$ (positive in Q1)."),
  sq("Find $\\dfrac{d}{dx}[\\csc x]$ from first principles or by quotient rule on $1/\\sin x$.", 2, "MEDIUM", "*Step 1 (1 mark):* $\\dfrac{d}{dx}\\left(\\dfrac{1}{\\sin x}\\right) = -\\dfrac{\\cos x}{\\sin^2 x}$.\n*Step 2 (1 mark):* $= -\\csc x \\cot x$."),
  sq("Solve $\\sec x = 2$ for $0 \\le x \\le 2\\pi$.", 2, "MEDIUM", "*Step 1 (1 mark):* $\\cos x = 1/2$.\n*Step 2 (1 mark):* $x = \\pi/3$ or $x = 5\\pi/3$."),
];

const extendedAnswer: FR[] = [
  sq(`**a.** Sketch the graph of $y = \\sec x$ for $-\\pi \\le x \\le \\pi$, identifying asymptotes. (3 marks)

**b.** Solve $\\sec x = -\\sqrt 2$ for $0 \\le x \\le 2\\pi$. (2 marks)

**c.** Verify the identity $\\dfrac{\\sec^2 x - 1}{\\sec^2 x} = \\sin^2 x$. (2 marks)`, 7, "MEDIUM",
    `**a. (3 marks)**
*Step 1 (1 mark):* Asymptotes where $\\cos x = 0$: $x = \\pm \\pi/2$.
*Step 2 (1 mark):* Branches in $-\\pi \\le x < -\\pi/2$ ($y \\le -1$), $-\\pi/2 < x < \\pi/2$ ($y \\ge 1$), $\\pi/2 < x \\le \\pi$ ($y \\le -1$).
*Step 3 (1 mark):* Minimum/maximum: $y(\\pm \\pi) = -1$, $y(0) = 1$.

**b. (2 marks)**
*Step 1 (1 mark):* $\\cos x = -1/\\sqrt 2$.
*Step 2 (1 mark):* $x = 3\\pi/4$ or $5\\pi/4$.

**c. (2 marks)**
*Step 1 (1 mark):* $\\sec^2 x - 1 = \\tan^2 x$ (Pythagorean).
*Step 2 (1 mark):* $\\dfrac{\\tan^2 x}{\\sec^2 x} = \\dfrac{\\sin^2 x/\\cos^2 x}{1/\\cos^2 x} = \\sin^2 x$ ✓.`),
];

const out = { mcq, shortAnswer, extendedAnswer, extendedResponse: [] };
fs.writeFileSync("scripts/output/qset-specialist-reciprocal-circular.json", JSON.stringify(out, null, 2) + "\n");
console.log(`Wrote ${mcq.length} MCQ, ${shortAnswer.length} SHORT, ${extendedAnswer.length} EXT_ANS to scripts/output/qset-specialist-reciprocal-circular.json`);
