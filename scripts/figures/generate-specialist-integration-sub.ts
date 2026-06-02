/** Specialist ext-fit: Integration by Substitution. */
import * as fs from "fs";
interface MCQ { content: string; optionA: string; optionB: string; optionC: string; optionD: string; correctOption: "A"|"B"|"C"|"D"; marks: number; difficulty: "EASY"|"MEDIUM"|"HARD"; solutionContent: string; subtopicSlugs: string[]; }
interface FR { content: string; marks: number; difficulty: "EASY"|"MEDIUM"|"HARD"; solutionContent: string; subtopicSlugs: string[]; }
const P = "integration-by-substitution";
const m = (c: string, o: [string,string,string,string], k: "A"|"B"|"C"|"D", d: "EASY"|"MEDIUM"|"HARD", s: string, sec: string[] = []): MCQ =>
  ({ content: c, optionA: o[0], optionB: o[1], optionC: o[2], optionD: o[3], correctOption: k, marks: 1, difficulty: d, solutionContent: s, subtopicSlugs: [P, ...sec] });
const sq = (c: string, marks: number, d: "EASY"|"MEDIUM"|"HARD", s: string, sec: string[] = []): FR =>
  ({ content: c, marks, difficulty: d, solutionContent: s, subtopicSlugs: [P, ...sec] });

const mcq: MCQ[] = [
  m("$\\int 2x(x^2 + 1)^5 dx$ via $u = x^2 + 1$ becomes:", ["$\\int u^5 du$", "$\\int 2 u^5 du$", "$\\int u^5 \\cdot 2u du$", "$\\int x u^5 du$"], "A", "EASY",
    "$du = 2x dx$, so $2x dx = du$. **Answer: A**"),
  m("$\\int \\sin x \\cos x dx$ with $u = \\sin x$ gives:", ["$\\sin^2 x / 2 + C$", "$\\cos^2 x / 2 + C$", "$\\sin x \\cos x + C$", "$-\\cos x + C$"], "A", "EASY",
    "$du = \\cos x dx$; $\\int u du = u^2/2 = \\sin^2 x / 2 + C$. **Answer: A**"),
  m("Suitable substitution for $\\int \\dfrac{x}{\\sqrt{x^2 + 1}} dx$ is:", ["$u = x$", "$u = x^2 + 1$", "$u = \\sqrt{x}$", "$u = 1/x$"], "B", "EASY",
    "$du = 2x dx$ matches numerator. **Answer: B**"),
  m("$\\int e^{2x} dx$ via $u = 2x$:", ["$\\int e^u du / 2$", "$\\int e^u du$", "$2 \\int e^u du$", "$\\int e^u du \\cdot 2$"], "A", "MEDIUM",
    "$du = 2 dx \\Rightarrow dx = du/2$, so $\\int e^{2x} dx = \\int e^u du/2 = e^u/2 = e^{2x}/2 + C$. **Answer: A**"),
  m("For $\\int_0^1 x e^{x^2} dx$, $u = x^2$, the new limits are:", ["$0 \\to 1$", "$0 \\to 2$", "same as old", "$1 \\to 2$"], "A", "MEDIUM",
    "$u(0) = 0$, $u(1) = 1$. **Answer: A**"),
  m("$\\int \\dfrac{(\\ln x)^2}{x} dx$ with $u = \\ln x$:", ["$\\int u du$", "$\\int u^2 du$", "$\\int u^{-2} du$", "$\\int 1/u du$"], "B", "MEDIUM",
    "$du = dx/x$; integral becomes $\\int u^2 du = u^3/3 = (\\ln x)^3/3 + C$. **Answer: B**"),
  m("$\\int \\tan x dx$ via $u = \\cos x$:", ["$-\\ln|\\cos x| + C$", "$\\ln|\\sec x| + C$", "$\\ln|\\sin x| + C$", "$-\\cos x + C$"], "A", "HARD",
    "$du = -\\sin x dx$; $\\int \\sin x/\\cos x dx = -\\int du/u = -\\ln|u| = -\\ln|\\cos x| + C$. **Answer: A**"),
  m("Suitable substitution for $\\int \\sqrt{1 - x^2} dx$:", ["$u = x^2$", "$u = 1 - x^2$", "$x = \\sin\\theta$", "$x = \\tan\\theta$"], "C", "HARD",
    "Trig substitution $x = \\sin\\theta$ simplifies the square root. **Answer: C**"),
];

const shortAnswer: FR[] = [
  sq("Use the substitution $u = x^2 + 1$ to evaluate $\\int 2x(x^2 + 1)^3 dx$.", 2, "EASY",
    "*Step 1 (1 mark):* $du = 2x dx$, so $\\int = \\int u^3 du = u^4/4$.\n*Step 2 (1 mark):* $= (x^2 + 1)^4 / 4 + C$."),
  sq("Evaluate $\\int_0^1 x \\sqrt{1 + x^2} dx$.", 3, "MEDIUM",
    "*Step 1 (1 mark):* $u = 1 + x^2$, $du = 2x dx$, limits $1 \\to 2$.\n*Step 2 (1 mark):* $\\int = \\int_1^2 \\dfrac{1}{2}\\sqrt u du = \\dfrac{1}{3} u^{3/2}|_1^2$.\n*Step 3 (1 mark):* $= (2\\sqrt 2 - 1)/3$."),
  sq("Find $\\int \\dfrac{1}{x \\ln x} dx$.", 2, "MEDIUM",
    "*Step 1 (1 mark):* $u = \\ln x$, $du = dx/x$. Integral becomes $\\int du/u$.\n*Step 2 (1 mark):* $= \\ln|u| + C = \\ln|\\ln x| + C$."),
  sq("Evaluate $\\int_0^{\\pi/2} \\sin^3 x \\cos x dx$.", 3, "MEDIUM",
    "*Step 1 (1 mark):* $u = \\sin x$, $du = \\cos x dx$, limits $0 \\to 1$.\n*Step 2 (1 mark):* $\\int = \\int_0^1 u^3 du = u^4/4|_0^1$.\n*Step 3 (1 mark):* $= 1/4$."),
  sq("Evaluate $\\int \\dfrac{\\cos x}{(1 + \\sin x)^2} dx$.", 3, "HARD",
    "*Step 1 (1 mark):* $u = 1 + \\sin x$, $du = \\cos x dx$.\n*Step 2 (1 mark):* $\\int = \\int u^{-2} du = -u^{-1}$.\n*Step 3 (1 mark):* $= -\\dfrac{1}{1 + \\sin x} + C$."),
];

const extendedAnswer: FR[] = [
  sq(`Evaluate the following definite integrals using substitution.

**a.** $\\int_0^1 x e^{x^2} dx$ (3 marks)

**b.** $\\int_1^e \\dfrac{(\\ln x)^2}{x} dx$ (3 marks)

**c.** $\\int_0^{\\pi/4} \\tan x \\sec^2 x dx$ (3 marks)`, 9, "MEDIUM",
    `**a. (3 marks)**
*Step 1 (1 mark):* $u = x^2$, $du = 2x dx$, limits $0 \\to 1$.
*Step 2 (1 mark):* $\\int = \\dfrac{1}{2}\\int_0^1 e^u du = \\dfrac{1}{2}[e^u]_0^1$.
*Step 3 (1 mark):* $= \\dfrac{e - 1}{2}$.

**b. (3 marks)**
*Step 1 (1 mark):* $u = \\ln x$, $du = dx/x$, limits $0 \\to 1$.
*Step 2 (1 mark):* $\\int = \\int_0^1 u^2 du = u^3/3|_0^1$.
*Step 3 (1 mark):* $= 1/3$.

**c. (3 marks)**
*Step 1 (1 mark):* $u = \\tan x$, $du = \\sec^2 x dx$, limits $0 \\to 1$.
*Step 2 (1 mark):* $\\int = \\int_0^1 u du = u^2/2|_0^1$.
*Step 3 (1 mark):* $= 1/2$.`),
];

const out = { mcq, shortAnswer, extendedAnswer, extendedResponse: [] };
fs.writeFileSync("scripts/output/qset-specialist-integration-sub.json", JSON.stringify(out, null, 2) + "\n");
console.log(`Wrote ${mcq.length} MCQ, ${shortAnswer.length} SHORT, ${extendedAnswer.length} EXT_ANS to scripts/output/qset-specialist-integration-sub.json`);
