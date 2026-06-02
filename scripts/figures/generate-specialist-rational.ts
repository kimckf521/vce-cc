/** Specialist modelling-rich: Rational Functions. */
import * as fs from "fs";
interface MCQ { content: string; optionA: string; optionB: string; optionC: string; optionD: string; correctOption: "A"|"B"|"C"|"D"; marks: number; difficulty: "EASY"|"MEDIUM"|"HARD"; solutionContent: string; subtopicSlugs: string[]; }
interface FR { content: string; marks: number; difficulty: "EASY"|"MEDIUM"|"HARD"; solutionContent: string; subtopicSlugs: string[]; }
const P = "rational-functions";
const m = (c: string, o: [string,string,string,string], k: "A"|"B"|"C"|"D", d: "EASY"|"MEDIUM"|"HARD", s: string, sec: string[] = []): MCQ =>
  ({ content: c, optionA: o[0], optionB: o[1], optionC: o[2], optionD: o[3], correctOption: k, marks: 1, difficulty: d, solutionContent: s, subtopicSlugs: [P, ...sec] });
const sq = (c: string, marks: number, d: "EASY"|"MEDIUM"|"HARD", s: string, sec: string[] = []): FR =>
  ({ content: c, marks, difficulty: d, solutionContent: s, subtopicSlugs: [P, ...sec] });

const mcq: MCQ[] = [
  m("Vertical asymptote of $y = \\dfrac{1}{x - 2}$ is:", ["$x = 0$", "$x = 2$", "$y = 0$", "$y = 2$"], "B", "EASY",
    "Denominator $= 0$ at $x = 2$. **Answer: B**"),
  m("Horizontal asymptote of $y = \\dfrac{2x + 1}{x - 3}$:", ["$y = 0$", "$y = 1$", "$y = 2$", "$y = 3$"], "C", "EASY",
    "Ratio of leading coefficients. **Answer: C**"),
  m("Domain of $y = \\dfrac{x}{x^2 - 4}$:", ["$\\mathbb{R}$", "$\\mathbb{R} \\setminus \\{2\\}$", "$\\mathbb{R} \\setminus \\{\\pm 2\\}$", "$\\mathbb{R} \\setminus \\{0\\}$"], "C", "EASY",
    "Exclude where denominator zero: $x = \\pm 2$. **Answer: C**"),
  m("Oblique asymptote of $y = \\dfrac{x^2 + 1}{x}$:", ["$y = x$", "$y = 1$", "$y = 1/x$", "$y = x + 1$"], "A", "MEDIUM",
    "Polynomial divide: $x + 1/x$. As $x \\to \\infty$, $y \\to x$. **Answer: A**"),
  m("$\\lim_{x \\to \\infty} \\dfrac{3x^2 - x}{x^2 + 5}$:", ["$0$", "$1$", "$3$", "$\\infty$"], "C", "MEDIUM",
    "Ratio of leading coefficients = 3. **Answer: C**"),
  m("$y = \\dfrac{x - 1}{x^2 - 1}$ has a hole at:", ["$x = 1$", "$x = -1$", "no hole", "$x = 0$"], "A", "MEDIUM",
    "Cancel common factor $(x-1)$: $y = 1/(x+1)$ for $x \\ne 1$. Hole at $x = 1$. **Answer: A**"),
  m("Range of $y = \\dfrac{1}{x^2 + 1}$:", ["$(0, 1]$", "$[0, 1]$", "$(0, \\infty)$", "$\\mathbb{R}$"], "A", "HARD",
    "Denominator $\\ge 1$, so $y \\in (0, 1]$ (max at $x = 0$, approaches 0 as $|x| \\to \\infty$). **Answer: A**"),
  m("Horizontal asymptote of $y = \\dfrac{x^3}{x^2 + 1}$:", ["none (oblique)", "$y = 0$", "$y = 1$", "$y = x$"], "A", "HARD",
    "Degree of numerator > denominator → no horizontal asymptote (oblique exists). **Answer: A**"),
];

const shortAnswer: FR[] = [
  sq("State the asymptotes of $y = \\dfrac{2}{x + 3}$.", 2, "EASY",
    "*Step 1 (1 mark):* Vertical: $x + 3 = 0 \\Rightarrow x = -3$.\n*Step 2 (1 mark):* Horizontal: as $|x| \\to \\infty$, $y \\to 0$."),
  sq("Express $\\dfrac{x + 5}{x - 2}$ as $A + \\dfrac{B}{x - 2}$.", 2, "MEDIUM",
    "*Step 1 (1 mark):* Polynomial divide: $(x + 5) = (x - 2) + 7$.\n*Step 2 (1 mark):* So $y = 1 + \\dfrac{7}{x - 2}$, i.e. $A = 1$, $B = 7$."),
  sq("Sketch $y = \\dfrac{1}{x - 1} + 2$, marking asymptotes.", 2, "EASY",
    "*Step 1 (1 mark):* Vertical asymptote $x = 1$; horizontal asymptote $y = 2$.\n*Step 2 (1 mark):* Hyperbola shape, branches in upper-right ($x > 1$) and lower-left ($x < 1$) of the asymptote intersection $(1, 2)$."),
  sq("Find $x$-intercept and $y$-intercept of $y = \\dfrac{x - 4}{x + 2}$.", 2, "MEDIUM",
    "*Step 1 (1 mark):* $y = 0 \\Rightarrow x = 4$. $x$-intercept: $(4, 0)$.\n*Step 2 (1 mark):* $x = 0 \\Rightarrow y = -4/2 = -2$. $y$-intercept: $(0, -2)$."),
  sq("Find the oblique asymptote of $y = \\dfrac{x^2 + 2x + 3}{x - 1}$.", 3, "HARD",
    "*Step 1 (1 mark):* Long division: $x^2 + 2x + 3 = (x - 1)(x + 3) + 6$.\n*Step 2 (1 mark):* So $y = x + 3 + \\dfrac{6}{x - 1}$.\n*Step 3 (1 mark):* As $|x| \\to \\infty$, $y \\to x + 3$ — oblique asymptote $y = x + 3$."),
];

const extendedAnswer: FR[] = [
  sq(`Let $f(x) = \\dfrac{x^2 + x - 6}{x - 1}$.

**a.** Show $f(x) = x + 2 - \\dfrac{4}{x - 1}$. (2 marks)

**b.** State all asymptotes of $f$. (2 marks)

**c.** Find $x$- and $y$-intercepts. (2 marks)

**d.** Sketch the graph of $f$. (2 marks)`, 8, "MEDIUM",
    `**a. (2 marks)**
*Step 1 (1 mark):* Long division: $x^2 + x - 6 = (x - 1)(x + 2) - 4$.
*Step 2 (1 mark):* So $f(x) = (x + 2) - \\dfrac{4}{x - 1}$. ✓

**b. (2 marks)**
*Step 1 (1 mark):* Vertical: $x = 1$.
*Step 2 (1 mark):* Oblique: $y = x + 2$ (from part a, as $|x| \\to \\infty$).

**c. (2 marks)**
*Step 1 (1 mark):* $f(0) = -6/-1 = 6$, so $y$-intercept $(0, 6)$.
*Step 2 (1 mark):* $f(x) = 0$: $x^2 + x - 6 = 0 \\Rightarrow (x - 2)(x + 3) = 0$, so $x = 2$ or $x = -3$.

**d. (2 marks)**
*Step 1 (1 mark):* Two branches separated by $x = 1$.
*Step 2 (1 mark):* Left branch passes through $(-3, 0)$ and $(0, 6)$; right branch through $(2, 0)$, approaching $y = x + 2$ for large $|x|$.`),
];

const extendedResponse: FR[] = [
  sq(`Let $f(x) = \\dfrac{x^2 - 4}{x^2 - 1}$.

**a.** Find the domain of $f$. (1 mark)

**b.** Determine all asymptotes (vertical and horizontal). (3 marks)

**c.** Find $x$- and $y$-intercepts. (3 marks)

**d.** Show that $f$ is even, i.e. $f(-x) = f(x)$. (2 marks)

**e.** Sketch the graph of $f$, marking all key features. (3 marks)`, 12, "MEDIUM",
    `**a. (1 mark)** Denominator $x^2 - 1 = 0$ at $x = \\pm 1$. Domain: $\\mathbb{R} \\setminus \\{-1, 1\\}$.

**b. (3 marks)**
*Step 1 (1 mark):* Vertical asymptotes at $x = \\pm 1$ (numerator not zero there).
*Step 2 (1 mark):* As $|x| \\to \\infty$, $f(x) \\to (x^2/x^2) = 1$.
*Step 3 (1 mark):* Horizontal asymptote: $y = 1$.

**c. (3 marks)**
*Step 1 (1 mark):* $y$-intercept: $f(0) = -4/-1 = 4$, so $(0, 4)$.
*Step 2 (1 mark):* $x$-intercepts where numerator $= 0$: $x^2 = 4 \\Rightarrow x = \\pm 2$.
*Step 3 (1 mark):* So $(\\pm 2, 0)$.

**d. (2 marks)**
*Step 1 (1 mark):* $f(-x) = \\dfrac{(-x)^2 - 4}{(-x)^2 - 1} = \\dfrac{x^2 - 4}{x^2 - 1}$.
*Step 2 (1 mark):* $= f(x)$. ✓ Even.

**e. (3 marks)**
*Step 1 (1 mark):* Symmetric about $y$-axis.
*Step 2 (1 mark):* Three regions: $|x| > 2$: $f > 1$, approaching 1; $1 < |x| < 2$: $f < 0$ rising from $-\\infty$ to 0; $|x| < 1$: $f > 4/1 \\to \\infty$ near vertical asymptotes, reaches 4 at origin.
*Step 3 (1 mark):* Graph has 3 branches with the described shape, intercepts marked, symmetric about $y$-axis.`),
];

const out = { mcq, shortAnswer, extendedAnswer, extendedResponse };
fs.writeFileSync("scripts/output/qset-specialist-rational.json", JSON.stringify(out, null, 2) + "\n");
console.log(`Wrote ${mcq.length} MCQ, ${shortAnswer.length} SHORT, ${extendedAnswer.length} EXT_ANS, ${extendedResponse.length} EXT_RESP to scripts/output/qset-specialist-rational.json`);
