/**
 * add-sa-algebra.ts
 *
 * Appends exactly 5 new short-answer questions to each of the 6 Algebra,
 * Number, and Structure qset JSON files. Idempotent: if a file already has
 * 15+ short-answer items, it is skipped so re-running this script never
 * duplicates work.
 *
 * Each new SA is hand-written to avoid duplicating any existing SA in the
 * same file (the existing 10 were inspected beforehand). Style, difficulty
 * mix, and mark-distributed step headers follow scripts/qset-helpers.ts.
 */
import fs from "fs";
import path from "path";

interface FR {
  content: string;
  marks: number;
  difficulty: "EASY" | "MEDIUM" | "HARD";
  solutionContent: string;
  subtopicSlugs: string[];
}

interface Qset {
  mcq: unknown[];
  shortAnswer: FR[];
  extendedResponse: unknown[];
}

const OUT = path.join(__dirname, "output");

// ───────────────────────────────────────────────────────────────────────────
// Polynomial Equations (slug: polynomial-equations)
// Existing angles: quad formula, cubic factor, factor theorem, discriminant,
// biquadratic, sum/product of roots, cubic inequality, integer roots,
// substitution 2^x, cubic given roots.
// New angles below: rational root theorem, remainder theorem application,
// word problem (volume), "given/find" with sum/product of roots,
// polynomial long division style.
// ───────────────────────────────────────────────────────────────────────────
const POLY: FR[] = [
  {
    content:
      "Factorise $p(x) = x^3 + 2x^2 - 5x - 6$ completely over the reals, given that $x = -1$ is a root.",
    marks: 2,
    difficulty: "EASY",
    solutionContent:
      "**Step 1 (1 mark):** Divide $p(x)$ by $(x + 1)$.\n\n$p(x) = (x + 1)(x^2 + x - 6)$.\n\n**Step 2 (1 mark):** Factorise the quadratic.\n\n$x^2 + x - 6 = (x + 3)(x - 2)$, so $p(x) = (x + 1)(x + 3)(x - 2)$.",
    subtopicSlugs: ["polynomial-equations"],
  },
  {
    content:
      "When $p(x) = x^3 + kx^2 - 2x + 5$ is divided by $(x - 2)$ the remainder is $9$. Find the value of $k$.",
    marks: 2,
    difficulty: "MEDIUM",
    solutionContent:
      "**Step 1 (1 mark):** Apply the remainder theorem: $p(2) = 9$.\n\n$p(2) = 8 + 4k - 4 + 5 = 9 + 4k$.\n\n**Step 2 (1 mark):** Solve for $k$.\n\n$9 + 4k = 9$\n\n$$k = 0$$",
    subtopicSlugs: ["polynomial-equations"],
  },
  {
    content:
      "An open-top rectangular box is formed by cutting squares of side $x$ cm from each corner of a $20$ cm by $12$ cm sheet of card and folding up the sides. The resulting box has volume $V(x) = x(20 - 2x)(12 - 2x)$ cm$^3$. Find all values of $x$ for which the volume is $192$ cm$^3$.",
    marks: 3,
    difficulty: "MEDIUM",
    solutionContent:
      "**Step 1 (1 mark):** Expand and form the cubic equation $V(x) = 192$.\n\n$x(240 - 64x + 4x^2) = 192$\n\n$$4x^3 - 64x^2 + 240x - 192 = 0$$\n\n$$x^3 - 16x^2 + 60x - 48 = 0$$\n\n**Step 2 (1 mark):** Test small integer values. $x = 4$: $64 - 256 + 240 - 48 = 0$ ✓. Divide by $(x - 4)$.\n\n$$x^3 - 16x^2 + 60x - 48 = (x - 4)(x^2 - 12x + 12)$$\n\n**Step 3 (1 mark):** Solve $x^2 - 12x + 12 = 0$ and keep values with $0 < x < 6$.\n\n$x = 6 \\pm 2\\sqrt{6}$, so $x = 6 - 2\\sqrt{6} \\approx 1.10$ is valid and $x = 4$ is valid ($x = 6 + 2\\sqrt{6}$ exceeds $6$ and is rejected).\n\n$$x = 4 \\text{ or } x = 6 - 2\\sqrt{6}$$",
    subtopicSlugs: ["polynomial-equations"],
  },
  {
    content:
      "Given that $\\alpha$ and $\\beta$ are the real roots of $x^2 - 6x + 4 = 0$, find the exact value of $\\alpha^2 + \\beta^2$ without solving for $\\alpha$ and $\\beta$ individually.",
    marks: 2,
    difficulty: "MEDIUM",
    solutionContent:
      "**Step 1 (1 mark):** State $\\alpha + \\beta$ and $\\alpha\\beta$ from the coefficients.\n\n$\\alpha + \\beta = 6$ and $\\alpha\\beta = 4$.\n\n**Step 2 (1 mark):** Use the identity $\\alpha^2 + \\beta^2 = (\\alpha + \\beta)^2 - 2\\alpha\\beta$.\n\n$$\\alpha^2 + \\beta^2 = 36 - 8$$\n\n$$= 28$$",
    subtopicSlugs: ["polynomial-equations"],
  },
  {
    content:
      "The polynomial $p(x) = 2x^3 - 9x^2 + 7x + 6$ has one root that is a rational number. Use the rational root theorem to find this root, then factorise $p(x)$ completely over the reals.",
    marks: 4,
    difficulty: "HARD",
    solutionContent:
      "**Step 1 (1 mark):** List rational candidates $\\tfrac{p}{q}$ with $p \\mid 6$ and $q \\mid 2$.\n\nCandidates: $\\pm 1, \\pm 2, \\pm 3, \\pm 6, \\pm \\tfrac{1}{2}, \\pm \\tfrac{3}{2}$.\n\n**Step 2 (1 mark):** Test values. $p(3) = 54 - 81 + 21 + 6 = 0$, so $x = 3$ is a root.\n\n**Step 3 (1 mark):** Divide $p(x)$ by $(x - 3)$.\n\n$$p(x) = (x - 3)(2x^2 - 3x - 2)$$\n\n**Step 4 (1 mark):** Factorise the quadratic.\n\n$2x^2 - 3x - 2 = (2x + 1)(x - 2)$.\n\n$$p(x) = (x - 3)(2x + 1)(x - 2)$$",
    subtopicSlugs: ["polynomial-equations"],
  },
];

// ───────────────────────────────────────────────────────────────────────────
// Exponent and Logarithm Laws (slug: exponent-and-logarithm-laws)
// Existing angles: simplify fraction, log_3 sum, 16^(3/4)*9^(1/2), combine
// logs, given log_a 2 / log_a 5 find log_a 200, simplify expression, table,
// rectangle area, change-of-base proof, 4^x - 2^(x+1) - 3.
// New angles: simplify negative/fractional exponents, expand a log, change
// of base numeric eval, "show that" identity, word problem (decibels).
// ───────────────────────────────────────────────────────────────────────────
const EXP_LOG: FR[] = [
  {
    content:
      "Simplify $\\left(\\dfrac{27}{8}\\right)^{-2/3}$ without a calculator.",
    marks: 2,
    difficulty: "EASY",
    solutionContent:
      "**Step 1 (1 mark):** Invert the base using the negative exponent.\n\n$$\\left(\\dfrac{27}{8}\\right)^{-2/3} = \\left(\\dfrac{8}{27}\\right)^{2/3}$$\n\n**Step 2 (1 mark):** Take the cube root, then square.\n\n$\\left(\\dfrac{8}{27}\\right)^{1/3} = \\dfrac{2}{3}$, so the answer is $\\dfrac{4}{9}$.",
    subtopicSlugs: ["exponent-and-logarithm-laws"],
  },
  {
    content:
      "Expand $\\log_{10}\\!\\left(\\dfrac{100 x^3}{\\sqrt{y}}\\right)$ as a sum or difference of simpler logarithms, with each term as simple as possible.",
    marks: 3,
    difficulty: "MEDIUM",
    solutionContent:
      "**Step 1 (1 mark):** Use the quotient and product rules.\n\n$\\log_{10}(100 x^3) - \\log_{10}(\\sqrt{y}) = \\log_{10} 100 + \\log_{10} x^3 - \\log_{10} y^{1/2}$.\n\n**Step 2 (1 mark):** Apply the power rule.\n\n$= \\log_{10} 100 + 3 \\log_{10} x - \\tfrac{1}{2} \\log_{10} y$.\n\n**Step 3 (1 mark):** Evaluate $\\log_{10} 100$.\n\n$$2 + 3\\log_{10} x - \\tfrac{1}{2}\\log_{10} y$$",
    subtopicSlugs: ["exponent-and-logarithm-laws"],
  },
  {
    content:
      "Using the change-of-base formula, evaluate $\\log_4 32$ exactly.",
    marks: 2,
    difficulty: "MEDIUM",
    solutionContent:
      "**Step 1 (1 mark):** Rewrite both $4$ and $32$ as powers of $2$.\n\n$$\\log_4 32 = \\dfrac{\\log_2 32}{\\log_2 4}$$\n\n**Step 2 (1 mark):** Evaluate the two logarithms and simplify.\n\n$\\log_2 32 = 5$ and $\\log_2 4 = 2$, so $\\log_4 32 = \\dfrac{5}{2}$.",
    subtopicSlugs: ["exponent-and-logarithm-laws"],
  },
  {
    content:
      "Show that for all $x > 0$ with $x \\neq 1$, $$\\log_x 8 \\cdot \\log_2 x = 3.$$",
    marks: 3,
    difficulty: "MEDIUM",
    solutionContent:
      "**Step 1 (1 mark):** Convert $\\log_x 8$ to base $2$ using the change-of-base formula.\n\n$$\\log_x 8 = \\dfrac{\\log_2 8}{\\log_2 x}$$\n\n**Step 2 (1 mark):** Substitute into the product.\n\n$$\\log_x 8 \\cdot \\log_2 x = \\dfrac{\\log_2 8}{\\log_2 x} \\cdot \\log_2 x$$\n\n$$= \\log_2 8$$\n\n**Step 3 (1 mark):** Evaluate $\\log_2 8$.\n\n$\\log_2 8 = 3$, so $\\log_x 8 \\cdot \\log_2 x = 3$ as required.",
    subtopicSlugs: ["exponent-and-logarithm-laws"],
  },
  {
    content:
      "The loudness of a sound in decibels is given by $L = 10 \\log_{10}\\!\\left(\\dfrac{I}{I_0}\\right)$, where $I$ is the intensity and $I_0$ is a reference intensity. A whisper has loudness $30$ dB and a normal conversation has loudness $60$ dB. Use the log laws to find the exact ratio of the conversation intensity to the whisper intensity.",
    marks: 4,
    difficulty: "HARD",
    solutionContent:
      "**Step 1 (1 mark):** Express each intensity ratio using the definition.\n\n$30 = 10 \\log_{10}(I_w / I_0)$, so $\\log_{10}(I_w / I_0) = 3$.\n\n$60 = 10 \\log_{10}(I_c / I_0)$, so $\\log_{10}(I_c / I_0) = 6$.\n\n**Step 2 (1 mark):** Subtract to get $\\log_{10}$ of the ratio.\n\n$$\\log_{10}\\!\\left(\\dfrac{I_c}{I_0}\\right) - \\log_{10}\\!\\left(\\dfrac{I_w}{I_0}\\right) = 6 - 3$$\n\n$$\\log_{10}\\!\\left(\\dfrac{I_c}{I_w}\\right) = 3$$\n\n**Step 3 (1 mark):** Rewrite as an exponential.\n\n$$\\dfrac{I_c}{I_w} = 10^3$$\n\n**Step 4 (1 mark):** State the ratio.\n\nThe conversation is $1000$ times as intense as the whisper.",
    subtopicSlugs: ["exponent-and-logarithm-laws"],
  },
];

// ───────────────────────────────────────────────────────────────────────────
// Exponential Equations (slug: exponential-equations)
// Existing angles: 5^x=125, 2^(x+1)=8^(x-1), e^x=7 decimal, 4^x-2^(x+2)-32,
// 3^(2x-1)=5 exact, investment 1000(1.05)^t doubling, rectangle, quadratic
// in 2^x, cube volume 2^(t/3), e^(2x)+e^x-2.
// New angles: equal bases with negative exponent, sum of exponentials =
// simple form, population decay word problem, "show that" via substitution,
// table-of-values problem.
// ───────────────────────────────────────────────────────────────────────────
const EXP_EQ: FR[] = [
  {
    content: "Solve $9^{x} = \\dfrac{1}{27}$ for $x$.",
    marks: 2,
    difficulty: "EASY",
    solutionContent:
      "**Step 1 (1 mark):** Write both sides as powers of $3$.\n\n$$3^{2x} = 3^{-3}$$\n\n**Step 2 (1 mark):** Equate exponents and solve.\n\n$2x = -3$, so $x = -\\dfrac{3}{2}$.",
    subtopicSlugs: ["exponential-equations"],
  },
  {
    content: "Solve $5 \\cdot 3^{x+1} = 45$ exactly.",
    marks: 2,
    difficulty: "MEDIUM",
    solutionContent:
      "**Step 1 (1 mark):** Divide both sides by $5$.\n\n$$3^{x+1} = 9$$\n\n**Step 2 (1 mark):** Write $9 = 3^2$ and equate exponents.\n\n$x + 1 = 2$, so $x = 1$.",
    subtopicSlugs: ["exponential-equations"],
  },
  {
    content:
      "A population of bacteria decays according to $N(t) = 500 \\cdot e^{-0.2 t}$, where $t$ is measured in hours. Find the exact time at which the population first falls below $100$.",
    marks: 3,
    difficulty: "MEDIUM",
    solutionContent:
      "**Step 1 (1 mark):** Set $N(t) = 100$ and isolate the exponential.\n\n$500 e^{-0.2 t} = 100$\n\n$$e^{-0.2 t} = \\dfrac{1}{5}$$\n\n**Step 2 (1 mark):** Take natural logs of both sides.\n\n$$-0.2 t = \\ln\\!\\left(\\dfrac{1}{5}\\right) = -\\ln 5$$\n\n**Step 3 (1 mark):** Solve for $t$ and state the answer.\n\n$t = \\dfrac{\\ln 5}{0.2} = 5 \\ln 5$ hours, so the population falls below $100$ for $t > 5 \\ln 5$ hours.",
    subtopicSlugs: ["exponential-equations"],
  },
  {
    content:
      "Show that if $e^{2x} - 6 e^x + 5 = 0$, then $x = 0$ or $x = \\ln 5$.",
    marks: 3,
    difficulty: "MEDIUM",
    solutionContent:
      "**Step 1 (1 mark):** Let $u = e^x$ (so $u > 0$) to obtain a quadratic.\n\n$$u^2 - 6u + 5 = 0$$\n\n**Step 2 (1 mark):** Factorise and solve for $u$.\n\n$(u - 1)(u - 5) = 0$, so $u = 1$ or $u = 5$ (both positive).\n\n**Step 3 (1 mark):** Replace $u$ and solve for $x$.\n\n$e^x = 1 \\Rightarrow x = 0$ and $e^x = 5 \\Rightarrow x = \\ln 5$, as required.",
    subtopicSlugs: ["exponential-equations"],
  },
  {
    content:
      "The values of a function of the form $f(x) = A \\cdot b^x$ are given in the table below.\n\n| $x$ | $0$ | $1$ | $2$ | $3$ |\n|---|---|---|---|---|\n| $f(x)$ | $6$ | $12$ | $24$ | $48$ |\n\nFind $A$ and $b$, and hence solve $f(x) = 192$.",
    marks: 4,
    difficulty: "HARD",
    solutionContent:
      "**Step 1 (1 mark):** Use $f(0) = A = 6$.\n\n$A = 6$.\n\n**Step 2 (1 mark):** Use $f(1) = 6 b = 12$ to find $b$.\n\n$b = 2$, so $f(x) = 6 \\cdot 2^x$.\n\n**Step 3 (1 mark):** Set $f(x) = 192$ and isolate the exponential.\n\n$6 \\cdot 2^x = 192$\n\n$$2^x = 32$$\n\n**Step 4 (1 mark):** Solve for $x$.\n\n$2^x = 2^5$, so $x = 5$.",
    subtopicSlugs: ["exponential-equations"],
  },
];

// ───────────────────────────────────────────────────────────────────────────
// Logarithmic Equations (slug: logarithmic-equations)
// Existing angles: log_3(x-1)=2, log_10 x + log_10(x-3)=1, 2 ln x = ln(3x+4),
// log_2(x+2)=log_2 x + 3, log_3 x + log_3(x-6)=3, (log_3 x)^2=log_3 x^4,
// rectangle area, ln(x^2-1)-ln(x-1)=ln4, log_3(x+3)+log_3(x-3)=log_3 7,
// half-life M_0/5.
// New angles: simple ln equation, change-of-base equation, pH word problem,
// system of log equations, given info find unknown.
// ───────────────────────────────────────────────────────────────────────────
const LOG_EQ: FR[] = [
  {
    content: "Solve $\\ln(2x + 1) = 3$ exactly for $x$.",
    marks: 2,
    difficulty: "EASY",
    solutionContent:
      "**Step 1 (1 mark):** Rewrite in exponential form.\n\n$$2x + 1 = e^3$$\n\n**Step 2 (1 mark):** Solve for $x$.\n\n$x = \\dfrac{e^3 - 1}{2}$.",
    subtopicSlugs: ["logarithmic-equations"],
  },
  {
    content: "Solve $\\log_x 64 = 3$ for the real base $x > 0$, $x \\neq 1$.",
    marks: 2,
    difficulty: "MEDIUM",
    solutionContent:
      "**Step 1 (1 mark):** Rewrite in exponential form.\n\n$$x^3 = 64$$\n\n**Step 2 (1 mark):** Take the real cube root.\n\n$x = 4$ (only positive base is permitted).",
    subtopicSlugs: ["logarithmic-equations"],
  },
  {
    content:
      "The pH of a solution is defined by $\\text{pH} = -\\log_{10}[\\text{H}^+]$, where $[\\text{H}^+]$ is the hydrogen ion concentration in mol/L. A certain lake water has pH $5.5$. Find the exact hydrogen ion concentration $[\\text{H}^+]$.",
    marks: 3,
    difficulty: "MEDIUM",
    solutionContent:
      "**Step 1 (1 mark):** Substitute the given pH into the formula.\n\n$$5.5 = -\\log_{10}[\\text{H}^+]$$\n\n**Step 2 (1 mark):** Rearrange to isolate the logarithm.\n\n$$\\log_{10}[\\text{H}^+] = -5.5$$\n\n**Step 3 (1 mark):** Rewrite as an exponential and state the exact value.\n\n$[\\text{H}^+] = 10^{-5.5}$ mol/L, which can also be written as $\\dfrac{1}{10^{5.5}}$ mol/L.",
    subtopicSlugs: ["logarithmic-equations"],
  },
  {
    content:
      "Solve the simultaneous equations $\\log_2 x + \\log_2 y = 5$ and $x - y = 4$ for real $x, y > 0$.",
    marks: 3,
    difficulty: "MEDIUM",
    solutionContent:
      "**Step 1 (1 mark):** Combine the first equation using the product rule.\n\n$\\log_2(xy) = 5$, so $xy = 32$.\n\n**Step 2 (1 mark):** Substitute $x = y + 4$ into $xy = 32$.\n\n$(y + 4) y = 32$\n\n$$y^2 + 4y - 32 = 0$$\n\n**Step 3 (1 mark):** Factorise and reject the negative value.\n\n$(y + 8)(y - 4) = 0$. Since $y > 0$, $y = 4$ and $x = 8$.",
    subtopicSlugs: ["logarithmic-equations"],
  },
  {
    content:
      "The graph of $y = \\log_3 x$ passes through the point $(a, 2)$ and the graph of $y = \\log_3(x - 4)$ passes through the point $(a, b)$. Find the exact values of $a$ and $b$.",
    marks: 4,
    difficulty: "HARD",
    solutionContent:
      "**Step 1 (1 mark):** Use $\\log_3 a = 2$ to find $a$.\n\n$a = 3^2 = 9$.\n\n**Step 2 (1 mark):** Substitute $x = 9$ into $y = \\log_3(x - 4)$.\n\n$$b = \\log_3(9 - 4)$$\n\n$$= \\log_3 5$$\n\n**Step 3 (1 mark):** State $a$ and $b$.\n\n$a = 9$ and $b = \\log_3 5$ (exact form).\n\n**Step 4 (1 mark):** Verify $x - 4 > 0$ at $x = a$.\n\n$a - 4 = 5 > 0$, so $(a, b)$ lies in the domain of $y = \\log_3(x - 4)$ as required.",
    subtopicSlugs: ["logarithmic-equations"],
  },
];

// ───────────────────────────────────────────────────────────────────────────
// Trigonometric Equations (slug: trigonometric-equations)
// Existing angles: cos x=1/2, sin x+1=0, tan x=sqrt3, 2sinx+sqrt3=0,
// sin 2x=sqrt3/2, 2cos^2 x-1=0, 2sinxcosx=sinx, 2sin^2 x+sinx-1=0, right
// triangle area, cos 2x+cos x=0.
// New angles: tan x=-1 on restricted domain, solve with phase shift
// (sin(x-pi/3)), given cos value find exact sin via identity, word problem
// (ferris wheel), sec/csc style or squared identity.
// ───────────────────────────────────────────────────────────────────────────
const TRIG_EQ: FR[] = [
  {
    content: "Solve $\\tan x = -1$ for $x \\in [0, 2\\pi]$.",
    marks: 2,
    difficulty: "EASY",
    solutionContent:
      "**Step 1 (1 mark):** Identify the reference angle.\n\nThe reference angle is $\\dfrac{\\pi}{4}$ and $\\tan$ is negative in the second and fourth quadrants.\n\n**Step 2 (1 mark):** Give both solutions in $[0, 2\\pi]$.\n\n$x = \\pi - \\dfrac{\\pi}{4} = \\dfrac{3\\pi}{4}$ or $x = 2\\pi - \\dfrac{\\pi}{4} = \\dfrac{7\\pi}{4}$.",
    subtopicSlugs: ["trigonometric-equations"],
  },
  {
    content:
      "Solve $2\\sin\\!\\left(x - \\dfrac{\\pi}{3}\\right) = 1$ for $x \\in [0, 2\\pi]$.",
    marks: 3,
    difficulty: "MEDIUM",
    solutionContent:
      "**Step 1 (1 mark):** Isolate the sine.\n\n$$\\sin\\!\\left(x - \\dfrac{\\pi}{3}\\right) = \\dfrac{1}{2}$$\n\n**Step 2 (1 mark):** Write $u = x - \\dfrac{\\pi}{3}$ with $u \\in \\left[-\\dfrac{\\pi}{3},\\, \\dfrac{5\\pi}{3}\\right]$ and solve $\\sin u = \\dfrac{1}{2}$.\n\n$u = \\dfrac{\\pi}{6}$ or $u = \\dfrac{5\\pi}{6}$.\n\n**Step 3 (1 mark):** Add $\\dfrac{\\pi}{3}$ back to obtain $x$.\n\n$x = \\dfrac{\\pi}{6} + \\dfrac{\\pi}{3} = \\dfrac{\\pi}{2}$ or $x = \\dfrac{5\\pi}{6} + \\dfrac{\\pi}{3} = \\dfrac{7\\pi}{6}$.",
    subtopicSlugs: ["trigonometric-equations"],
  },
  {
    content:
      "Given that $\\cos \\theta = -\\dfrac{3}{5}$ and $\\theta \\in \\left(\\dfrac{\\pi}{2},\\, \\pi\\right)$, find the exact values of $\\sin \\theta$ and $\\tan \\theta$.",
    marks: 2,
    difficulty: "MEDIUM",
    solutionContent:
      "**Step 1 (1 mark):** Use $\\sin^2\\theta + \\cos^2\\theta = 1$ to find $\\sin\\theta$.\n\n$\\sin^2\\theta = 1 - \\dfrac{9}{25} = \\dfrac{16}{25}$. Since $\\theta$ is in the second quadrant, $\\sin\\theta > 0$, so $\\sin\\theta = \\dfrac{4}{5}$.\n\n**Step 2 (1 mark):** Compute $\\tan\\theta = \\dfrac{\\sin\\theta}{\\cos\\theta}$.\n\n$\\tan\\theta = \\dfrac{4/5}{-3/5} = -\\dfrac{4}{3}$.",
    subtopicSlugs: ["trigonometric-equations"],
  },
  {
    content:
      "The height above ground (in metres) of a point on a ferris wheel after $t$ seconds is given by $h(t) = 12 - 10 \\cos\\!\\left(\\dfrac{\\pi t}{30}\\right)$. Find the first time $t > 0$ at which $h(t) = 17$ m.",
    marks: 3,
    difficulty: "MEDIUM",
    solutionContent:
      "**Step 1 (1 mark):** Set $h(t) = 17$ and isolate the cosine.\n\n$12 - 10\\cos\\!\\left(\\dfrac{\\pi t}{30}\\right) = 17$\n\n$$\\cos\\!\\left(\\dfrac{\\pi t}{30}\\right) = -\\dfrac{1}{2}$$\n\n**Step 2 (1 mark):** Solve for $\\dfrac{\\pi t}{30}$ (the first positive solution).\n\nThe smallest positive angle with $\\cos = -\\tfrac{1}{2}$ is $\\dfrac{2\\pi}{3}$, so $\\dfrac{\\pi t}{30} = \\dfrac{2\\pi}{3}$.\n\n**Step 3 (1 mark):** Solve for $t$.\n\n$t = 30 \\cdot \\dfrac{2}{3} = 20$ seconds.",
    subtopicSlugs: ["trigonometric-equations"],
  },
  {
    content:
      "Solve $2 \\cos^2 x + 3 \\sin x - 3 = 0$ for $x \\in [0, 2\\pi]$.",
    marks: 4,
    difficulty: "HARD",
    solutionContent:
      "**Step 1 (1 mark):** Use $\\cos^2 x = 1 - \\sin^2 x$ to write a quadratic in $\\sin x$.\n\n$2(1 - \\sin^2 x) + 3\\sin x - 3 = 0$\n\n$$-2\\sin^2 x + 3 \\sin x - 1 = 0$$\n\n**Step 2 (1 mark):** Multiply by $-1$ and factorise.\n\n$2\\sin^2 x - 3\\sin x + 1 = 0$, so $(2\\sin x - 1)(\\sin x - 1) = 0$.\n\n**Step 3 (1 mark):** Solve $\\sin x = \\dfrac{1}{2}$ on $[0, 2\\pi]$.\n\n$x = \\dfrac{\\pi}{6}$ or $x = \\dfrac{5\\pi}{6}$.\n\n**Step 4 (1 mark):** Solve $\\sin x = 1$ on $[0, 2\\pi]$ and collect all solutions.\n\n$x = \\dfrac{\\pi}{2}$. Complete solution set: $x \\in \\left\\{\\dfrac{\\pi}{6},\\, \\dfrac{\\pi}{2},\\, \\dfrac{5\\pi}{6}\\right\\}$.",
    subtopicSlugs: ["trigonometric-equations"],
  },
];

// ───────────────────────────────────────────────────────────────────────────
// Simultaneous Equations (slug: simultaneous-equations)
// Existing angles: linear 2x2, linear/quadratic x+y=5,x^2+y^2=13, y=x^2
// vs y=x+2, rectangle perim/area, k for infinite solutions, sum=20 prod=91,
// 3x3 linear, line through 2 points, line/circle, sum 12 sum-of-squares 74.
// New angles: elimination with fractions, parametric 'find k so unique',
// money/mixture word problem, line/parabola tangency discriminant, 3-equation
// word problem.
// ───────────────────────────────────────────────────────────────────────────
const SIMUL: FR[] = [
  {
    content:
      "Solve the system $\\begin{cases} 2x + 3y = 13 \\\\ 5x - 2y = 4 \\end{cases}$.",
    marks: 2,
    difficulty: "EASY",
    solutionContent:
      "**Step 1 (1 mark):** Eliminate $y$: multiply the first equation by $2$ and the second by $3$, then add.\n\n$4x + 6y = 26$ and $15x - 6y = 12$, so $19x = 38$, giving $x = 2$.\n\n**Step 2 (1 mark):** Substitute back to find $y$.\n\n$2(2) + 3y = 13$, so $3y = 9$ and $y = 3$.",
    subtopicSlugs: ["simultaneous-equations"],
  },
  {
    content:
      "For what value(s) of $k$ does the system $\\begin{cases} kx + 2y = 4 \\\\ 3x + (k+1) y = 5 \\end{cases}$ have a unique solution? State the condition clearly.",
    marks: 3,
    difficulty: "MEDIUM",
    solutionContent:
      "**Step 1 (1 mark):** A $2 \\times 2$ linear system has a unique solution iff the determinant of the coefficient matrix is non-zero.\n\n$$\\det = k(k+1) - 6$$\n\n**Step 2 (1 mark):** Set the determinant equal to zero to find the exceptional values.\n\n$k^2 + k - 6 = 0$\n\n$(k + 3)(k - 2) = 0$, so $k = -3$ or $k = 2$.\n\n**Step 3 (1 mark):** State the condition.\n\nThe system has a unique solution for all $k \\in \\mathbb{R} \\setminus \\{-3, 2\\}$.",
    subtopicSlugs: ["simultaneous-equations"],
  },
  {
    content:
      "A cinema sells adult tickets at \\$15 and child tickets at \\$9. On one evening $120$ tickets were sold for a total of \\$1500. How many of each ticket type were sold?",
    marks: 3,
    difficulty: "MEDIUM",
    solutionContent:
      "**Step 1 (1 mark):** Let $a$ and $c$ be the numbers of adult and child tickets and form the system.\n\n$$a + c = 120$$\n\n$$15 a + 9 c = 1500$$\n\n**Step 2 (1 mark):** Substitute $c = 120 - a$ into the second equation.\n\n$15 a + 9(120 - a) = 1500$\n\n$15 a + 1080 - 9 a = 1500$\n\n$$6 a = 420$$\n\n**Step 3 (1 mark):** Solve and state both values.\n\n$a = 70$ adult tickets and $c = 50$ child tickets.",
    subtopicSlugs: ["simultaneous-equations"],
  },
  {
    content:
      "Find the value of $c$ for which the line $y = 2x + c$ is a tangent to the parabola $y = x^2 + 3$.",
    marks: 3,
    difficulty: "MEDIUM",
    solutionContent:
      "**Step 1 (1 mark):** Set the two expressions for $y$ equal and rearrange.\n\n$x^2 + 3 = 2x + c$\n\n$$x^2 - 2x + (3 - c) = 0$$\n\n**Step 2 (1 mark):** For tangency the discriminant must be zero.\n\n$\\Delta = (-2)^2 - 4(1)(3 - c) = 0$\n\n$$4 - 12 + 4c = 0$$\n\n**Step 3 (1 mark):** Solve for $c$.\n\n$4c = 8$, so $c = 2$.",
    subtopicSlugs: ["simultaneous-equations"],
  },
  {
    content:
      "A coffee shop sells three blends A, B, and C. One morning the shop sold a total of $60$ bags, with twice as many bags of blend A as blend C, and the number of blend B bags equalled the number of A and C bags combined. Let $a$, $b$, $c$ be the number of bags of each blend sold. Set up a system of three linear equations and find $a$, $b$, and $c$.",
    marks: 4,
    difficulty: "HARD",
    solutionContent:
      "**Step 1 (1 mark):** Translate each condition into an equation.\n\n$$a + b + c = 60$$\n\n$$a = 2c$$\n\n$$b = a + c$$\n\n**Step 2 (1 mark):** Substitute $a = 2c$ into $b = a + c$.\n\n$b = 2c + c = 3c$.\n\n**Step 3 (1 mark):** Substitute both expressions into the total.\n\n$2c + 3c + c = 60$\n\n$$6c = 60$$\n\n**Step 4 (1 mark):** Solve for $c$ and back-substitute for $a$ and $b$.\n\n$c = 10$, so $a = 2(10) = 20$ and $b = 3(10) = 30$.",
    subtopicSlugs: ["simultaneous-equations"],
  },
];

// ───────────────────────────────────────────────────────────────────────────
// Main: append 5 to each file idempotently
// ───────────────────────────────────────────────────────────────────────────

interface Job {
  file: string;
  newItems: FR[];
}

const jobs: Job[] = [
  { file: "qset-polynomial-equations.json", newItems: POLY },
  { file: "qset-exponent-and-logarithm-laws.json", newItems: EXP_LOG },
  { file: "qset-exponential-equations.json", newItems: EXP_EQ },
  { file: "qset-logarithmic-equations.json", newItems: LOG_EQ },
  { file: "qset-trigonometric-equations.json", newItems: TRIG_EQ },
  { file: "qset-simultaneous-equations.json", newItems: SIMUL },
];

function validateStepMarks(item: FR): void {
  // Extract Step headers of the form **Step N (M mark[s]):**
  const stepRe = /\*\*Step\s+\d+\s*\((\d+)\s*marks?\)\s*:\*\*/g;
  let match: RegExpExecArray | null;
  let sum = 0;
  while ((match = stepRe.exec(item.solutionContent)) !== null) {
    sum += Number(match[1]);
  }
  if (sum !== item.marks) {
    throw new Error(
      `Step marks (${sum}) do not match question marks (${item.marks}) for: ${item.content.slice(0, 60)}...`
    );
  }
}

function run(): void {
  for (const job of jobs) {
    if (job.newItems.length !== 5) {
      throw new Error(`${job.file}: expected 5 new items, got ${job.newItems.length}`);
    }
    for (const item of job.newItems) validateStepMarks(item);

    const p = path.join(OUT, job.file);
    const raw = fs.readFileSync(p, "utf-8");
    const data = JSON.parse(raw) as Qset;

    if (data.shortAnswer.length >= 15) {
      console.log(`SKIP ${job.file}: already has ${data.shortAnswer.length} SAs`);
      continue;
    }
    if (data.shortAnswer.length !== 10) {
      throw new Error(
        `${job.file}: expected exactly 10 SAs before append, got ${data.shortAnswer.length}`
      );
    }

    data.shortAnswer.push(...job.newItems);

    if (data.shortAnswer.length !== 15) {
      throw new Error(
        `${job.file}: after append should have 15 SAs, got ${data.shortAnswer.length}`
      );
    }

    fs.writeFileSync(p, JSON.stringify(data, null, 2), "utf-8");
    console.log(`OK   ${job.file}: ${data.shortAnswer.length} SAs`);
  }
}

run();
