/**
 * Append 5 new short-answer questions to each of the 9 Functions, Relations,
 * and Graphs subtopic qset JSONs. Idempotent: skips files that already have
 * 15+ short-answer items.
 *
 * Run: npx tsx scripts/add-sa-functions.ts
 */
import fs from "fs";
import path from "path";
import { dechainSolution, graphImage, FR } from "./qset-helpers";

const OUT = (slug: string) =>
  path.resolve(__dirname, "output", `qset-${slug}.json`);

type NewSA = Omit<FR, "subtopicSlugs">;

const additions: Record<string, NewSA[]> = {
  // ══════════════════════════════════════════════════════════════════════════
  // POLYNOMIAL FUNCTIONS
  // ══════════════════════════════════════════════════════════════════════════
  "polynomial-functions": [
    {
      content:
        "Use the remainder theorem to find the remainder when $p(x) = x^3 - 4x^2 + 3x + 5$ is divided by $(x - 2)$.",
      marks: 2,
      difficulty: "EASY",
      solutionContent:
        "**Step 1 (1 mark):** By the remainder theorem, the remainder equals $p(2)$.\n\n$$p(2) = 8 - 16 + 6 + 5.$$\n\n**Step 2 (1 mark):** Simplify.\n\n$$p(2) = 3.$$\n\nThe remainder is $3$.",
    },
    {
      content:
        "Solve the inequality $x^2 - x - 6 \\geq 0$, giving your answer in interval notation.",
      marks: 3,
      difficulty: "MEDIUM",
      solutionContent:
        "**Step 1 (1 mark):** Factorise the quadratic.\n\n$$x^2 - x - 6 = (x - 3)(x + 2).$$\n\n**Step 2 (1 mark):** The parabola opens upwards with zeros at $x = -2$ and $x = 3$, so the expression is non-negative outside these roots.\n\n**Step 3 (1 mark):** Write the solution set.\n\n$$x \\in (-\\infty,\\, -2] \\cup [3,\\, \\infty).$$",
    },
    {
      content:
        "A parabola has vertex $(2, -3)$ and passes through the point $(0, 5)$. Find its equation in the form $y = a(x - h)^2 + k$.",
      marks: 3,
      difficulty: "MEDIUM",
      solutionContent:
        "**Step 1 (1 mark):** Write the vertex form.\n\n$$y = a(x - 2)^2 - 3.$$\n\n**Step 2 (1 mark):** Substitute $(0, 5)$.\n\n$$5 = a(-2)^2 - 3 = 4a - 3.$$\n\n**Step 3 (1 mark):** Solve for $a$.\n\n$$4a = 8$$\n\n$$a = 2,\\quad \\text{so}\\quad y = 2(x - 2)^2 - 3.$$",
    },
    {
      content:
        "For the cubic $p(x) = x^3 - 2x^2 + ax + b$, it is given that $p(1) = 4$ and $p(-1) = 2$. Find the values of $a$ and $b$.",
      marks: 4,
      difficulty: "HARD",
      solutionContent:
        "**Step 1 (1 mark):** Apply the condition $p(1) = 4$.\n\n$$1 - 2 + a + b = 4 \\implies a + b = 5.$$\n\n**Step 2 (1 mark):** Apply the condition $p(-1) = 2$.\n\n$$-1 - 2 - a + b = 2 \\implies -a + b = 5.$$\n\n**Step 3 (1 mark):** Add the two linear equations.\n\n$$2b = 10$$\n\n$$b = 5.$$\n\n**Step 4 (1 mark):** Substitute back.\n\n$$a + 5 = 5 \\implies a = 0.$$",
    },
    {
      content:
        "For the quadratic $y = x^2 - 6x + 8$, write down the sum and product of the roots using the coefficients, then verify them by factorising.",
      marks: 3,
      difficulty: "MEDIUM",
      solutionContent:
        "**Step 1 (1 mark):** For $ax^2 + bx + c$, sum $= -b/a$ and product $= c/a$.\n\n$$\\text{Sum} = -(-6)/1 = 6,\\quad \\text{Product} = 8/1 = 8.$$\n\n**Step 2 (1 mark):** Factorise.\n\n$$x^2 - 6x + 8 = (x - 2)(x - 4).$$\n\n**Step 3 (1 mark):** Verify with the roots $x = 2$ and $x = 4$.\n\n$$2 + 4 = 6,\\quad 2 \\cdot 4 = 8. \\checkmark$$",
    },
  ],

  // ══════════════════════════════════════════════════════════════════════════
  // EXPONENTIAL FUNCTIONS
  // ══════════════════════════════════════════════════════════════════════════
  "exponential-functions": [
    {
      content: "Solve $e^{2x} = 7$ for $x$, giving your answer in exact form.",
      marks: 2,
      difficulty: "EASY",
      solutionContent:
        "**Step 1 (1 mark):** Take the natural logarithm of both sides.\n\n$$2x = \\ln 7.$$\n\n**Step 2 (1 mark):** Divide by $2$.\n\n$$x = \\dfrac{\\ln 7}{2}.$$",
    },
    {
      content:
        "A radioactive isotope decays according to $M(t) = 80 \\, e^{-kt}$ grams, where $t$ is in years. The half-life of the isotope is $5$ years.\n\na. Find the exact value of $k$. (2 marks)\n\nb. Find the mass remaining after $10$ years. (1 mark)",
      marks: 3,
      difficulty: "MEDIUM",
      solutionContent:
        "**Step 1 (1 mark):** The half-life condition gives $M(5) = 40$.\n\n$$80 \\, e^{-5k} = 40$$\n\n$$e^{-5k} = \\dfrac{1}{2}.$$\n\n**Step 2 (1 mark):** Take natural logarithms.\n\n$$-5k = \\ln\\left(\\dfrac{1}{2}\\right) = -\\ln 2$$\n\n$$k = \\dfrac{\\ln 2}{5}.$$\n\n**Step 3 (1 mark):** After $10$ years, $M(10) = 80 \\, e^{-10k} = 80 \\, e^{-2 \\ln 2} = 80 \\cdot \\dfrac{1}{4} = 20$ grams.",
    },
    {
      content: "Solve $3 e^{x + 1} = 15$ for $x$, giving your answer in exact form.",
      marks: 2,
      difficulty: "EASY",
      solutionContent:
        "**Step 1 (1 mark):** Divide both sides by $3$.\n\n$$e^{x + 1} = 5.$$\n\n**Step 2 (1 mark):** Take natural logarithms and rearrange.\n\n$$x + 1 = \\ln 5$$\n\n$$x = \\ln 5 - 1.$$",
    },
    {
      content:
        "A cup of coffee cools according to $T(t) = 20 + 70 \\, e^{-0.1 t}$, where $T$ is temperature in $^\\circ \\text{C}$ and $t$ is time in minutes.\n\na. State the initial temperature and the long-term temperature. (2 marks)\n\nb. Find the exact time (in minutes) for the temperature to reach $55^\\circ \\text{C}$. (2 marks)",
      marks: 4,
      difficulty: "HARD",
      solutionContent:
        "**Step 1 (1 mark):** Initial temperature: $T(0) = 20 + 70 \\cdot 1 = 90^\\circ \\text{C}$.\n\n**Step 2 (1 mark):** As $t \\to \\infty$, $e^{-0.1 t} \\to 0$, so $T \\to 20^\\circ \\text{C}$ (the room temperature).\n\n**Step 3 (1 mark):** Set $T(t) = 55$ and isolate the exponential.\n\n$$20 + 70 \\, e^{-0.1 t} = 55$$\n\n$$e^{-0.1 t} = \\dfrac{1}{2}.$$\n\n**Step 4 (1 mark):** Take natural logarithms and solve.\n\n$$-0.1 t = -\\ln 2$$\n\n$$t = 10 \\ln 2 \\text{ minutes}.$$",
    },
    {
      content:
        "Solve $e^{2x} - 5 e^{x} + 4 = 0$ for $x$, giving your answers in exact form.",
      marks: 3,
      difficulty: "HARD",
      solutionContent:
        "**Step 1 (1 mark):** Let $u = e^{x}$ so the equation becomes a quadratic.\n\n$$u^2 - 5u + 4 = 0.$$\n\n**Step 2 (1 mark):** Factorise.\n\n$$(u - 1)(u - 4) = 0.$$\n\nSo $u = 1$ or $u = 4$.\n\n**Step 3 (1 mark):** Revert to $x$ using $u = e^{x}$.\n\n$$e^{x} = 1 \\implies x = 0;\\quad e^{x} = 4 \\implies x = \\ln 4.$$",
    },
  ],

  // ══════════════════════════════════════════════════════════════════════════
  // LOGARITHMIC FUNCTIONS
  // ══════════════════════════════════════════════════════════════════════════
  "logarithmic-functions": [
    {
      content:
        "Solve $\\log_3(2x - 1) = 2$ for $x$.",
      marks: 2,
      difficulty: "EASY",
      solutionContent:
        "**Step 1 (1 mark):** Rewrite in exponential form.\n\n$$2x - 1 = 3^2 = 9.$$\n\n**Step 2 (1 mark):** Solve for $x$.\n\n$$2x = 10$$\n\n$$x = 5.$$",
    },
    {
      content:
        "Use the logarithm laws to express $\\log_{10}\\!\\left(\\dfrac{x^3 \\sqrt{y}}{z}\\right)$ in terms of $\\log_{10} x$, $\\log_{10} y$ and $\\log_{10} z$.",
      marks: 3,
      difficulty: "MEDIUM",
      solutionContent:
        "**Step 1 (1 mark):** Split the quotient.\n\n$$\\log_{10}\\!\\left(\\dfrac{x^3 \\sqrt{y}}{z}\\right) = \\log_{10}(x^3 \\sqrt{y}) - \\log_{10} z.$$\n\n**Step 2 (1 mark):** Split the product and rewrite $\\sqrt{y}$ as $y^{1/2}$.\n\n$$= \\log_{10}(x^3) + \\log_{10}(y^{1/2}) - \\log_{10} z.$$\n\n**Step 3 (1 mark):** Apply the power law.\n\n$$= 3 \\log_{10} x + \\dfrac{1}{2} \\log_{10} y - \\log_{10} z.$$",
    },
    {
      content:
        "Solve $\\log_2(x) + \\log_2(x - 2) = 3$ for $x$.",
      marks: 3,
      difficulty: "MEDIUM",
      solutionContent:
        "**Step 1 (1 mark):** Combine using the product law.\n\n$$\\log_2\\big(x(x - 2)\\big) = 3.$$\n\n**Step 2 (1 mark):** Rewrite in exponential form.\n\n$$x(x - 2) = 2^3 = 8.$$\n\nExpanding gives $x^2 - 2x - 8 = 0$, i.e. $(x - 4)(x + 2) = 0$.\n\n**Step 3 (1 mark):** Reject $x = -2$ (outside the domain $x > 2$). So $x = 4$.",
    },
    {
      content:
        "The magnitude of an earthquake on the Richter scale is given by $M = \\log_{10}(I / I_0)$, where $I$ is the intensity and $I_0$ is a reference intensity. Earthquake A has magnitude $6$ and earthquake B has magnitude $4$. How many times more intense is earthquake A than earthquake B?",
      marks: 3,
      difficulty: "MEDIUM",
      solutionContent:
        "**Step 1 (1 mark):** From the definition, $I_A = I_0 \\cdot 10^{6}$ and $I_B = I_0 \\cdot 10^{4}$.\n\n**Step 2 (1 mark):** Take the ratio.\n\n$$\\dfrac{I_A}{I_B} = \\dfrac{10^{6}}{10^{4}}.$$\n\n**Step 3 (1 mark):** Simplify.\n\n$$\\dfrac{I_A}{I_B} = 10^{2} = 100.$$\n\nEarthquake A is $100$ times more intense than earthquake B.",
    },
    {
      content:
        "Find the maximal domain of $f(x) = \\log_2(x^2 - 4)$.",
      marks: 3,
      difficulty: "HARD",
      solutionContent:
        "**Step 1 (1 mark):** The argument of a logarithm must be positive: $x^2 - 4 > 0$.\n\n**Step 2 (1 mark):** Factorise: $(x - 2)(x + 2) > 0$. The parabola opens upwards with zeros at $x = \\pm 2$, so the expression is positive outside these roots.\n\n**Step 3 (1 mark):** Write the domain.\n\n$$x \\in (-\\infty,\\, -2) \\cup (2,\\, \\infty).$$",
    },
  ],

  // ══════════════════════════════════════════════════════════════════════════
  // TRIGONOMETRIC FUNCTIONS
  // ══════════════════════════════════════════════════════════════════════════
  "trigonometric-functions": [
    {
      content:
        "Solve $\\tan x = 1$ for $x \\in [0, 2\\pi]$, giving exact answers.",
      marks: 2,
      difficulty: "EASY",
      solutionContent:
        "**Step 1 (1 mark):** The base angle with $\\tan \\theta = 1$ is $\\theta = \\pi/4$. Tangent is positive in the first and third quadrants.\n\n**Step 2 (1 mark):** Therefore the solutions in $[0, 2\\pi]$ are:\n\n$$x = \\dfrac{\\pi}{4},\\quad x = \\dfrac{5\\pi}{4}.$$",
    },
    {
      content:
        "Given that $\\sin \\theta = \\dfrac{3}{5}$ and $\\theta$ is in the second quadrant, find the exact values of $\\cos \\theta$ and $\\tan \\theta$.",
      marks: 3,
      difficulty: "MEDIUM",
      solutionContent:
        "**Step 1 (1 mark):** Apply the Pythagorean identity.\n\n$$\\cos^2 \\theta = 1 - \\sin^2 \\theta = 1 - \\dfrac{9}{25} = \\dfrac{16}{25}.$$\n\n**Step 2 (1 mark):** In the second quadrant $\\cos \\theta < 0$.\n\n$$\\cos \\theta = -\\dfrac{4}{5}.$$\n\n**Step 3 (1 mark):** Compute $\\tan \\theta$.\n\n$$\\tan \\theta = \\dfrac{\\sin \\theta}{\\cos \\theta} = \\dfrac{3/5}{-4/5} = -\\dfrac{3}{4}.$$",
    },
    {
      content:
        "The depth of water in a harbour is modelled by $d(t) = 5 + 2 \\cos\\!\\left(\\dfrac{\\pi t}{6}\\right)$ metres, where $t$ is the number of hours after midnight.\n\na. State the maximum and minimum depths. (1 mark)\n\nb. Find the first time after $t = 0$ when the depth is $4$ metres. (2 marks)",
      marks: 3,
      difficulty: "MEDIUM",
      solutionContent:
        "**Step 1 (1 mark):** The amplitude is $2$ and the mean level is $5$, so the maximum depth is $7$ m and the minimum depth is $3$ m.\n\n**Step 2 (1 mark):** Set $d(t) = 4$ and isolate the cosine term.\n\n$$5 + 2 \\cos\\!\\left(\\dfrac{\\pi t}{6}\\right) = 4$$\n\n$$\\cos\\!\\left(\\dfrac{\\pi t}{6}\\right) = -\\dfrac{1}{2}.$$\n\n**Step 3 (1 mark):** The first positive solution of $\\cos \\theta = -1/2$ is $\\theta = 2\\pi/3$.\n\n$$\\dfrac{\\pi t}{6} = \\dfrac{2\\pi}{3}$$\n\n$$t = 4 \\text{ hours}.$$",
    },
    {
      content:
        "Sketch one full period of $y = 2 \\sin\\!\\left(x - \\dfrac{\\pi}{2}\\right)$ for $x \\in [0, 2\\pi]$, labelling the amplitude, period, and any $x$-intercepts in this interval.",
      marks: 3,
      difficulty: "MEDIUM",
      solutionContent:
        "**Step 1 (1 mark):** Amplitude is $2$; period is $\\dfrac{2\\pi}{1} = 2\\pi$. The curve is $y = 2 \\sin x$ translated $\\pi/2$ to the right, i.e. $y = -2\\cos x$.\n\n**Step 2 (1 mark):** Solve $2 \\sin(x - \\pi/2) = 0$ in $[0, 2\\pi]$: $x - \\pi/2 = 0, \\pi, 2\\pi$, so $x = \\pi/2$ and $x = 3\\pi/2$ (with $x = 5\\pi/2$ outside the interval).\n\n**Step 3 (1 mark):** Key points over $[0, 2\\pi]$: starts at $(0, -2)$, rises through $(\\pi/2, 0)$, peaks at $(\\pi, 2)$, falls through $(3\\pi/2, 0)$, returns to $(2\\pi, -2)$.",
    },
    {
      content:
        "Solve $2 \\cos^2 x - \\cos x - 1 = 0$ for $x \\in [0, 2\\pi]$, giving exact answers.",
      marks: 4,
      difficulty: "HARD",
      solutionContent:
        "**Step 1 (1 mark):** Let $u = \\cos x$ to get a quadratic in $u$.\n\n$$2u^2 - u - 1 = 0.$$\n\n**Step 2 (1 mark):** Factorise.\n\n$$(2u + 1)(u - 1) = 0.$$\n\nSo $u = -1/2$ or $u = 1$.\n\n**Step 3 (1 mark):** Solve $\\cos x = 1$ in $[0, 2\\pi]$: $x = 0$ and $x = 2\\pi$.\n\n**Step 4 (1 mark):** Solve $\\cos x = -1/2$ in $[0, 2\\pi]$: base angle $\\pi/3$, and cosine is negative in quadrants 2 and 3, giving $x = 2\\pi/3$ and $x = 4\\pi/3$. Combined solutions: $x = 0,\\; 2\\pi/3,\\; 4\\pi/3,\\; 2\\pi$.",
    },
  ],

  // ══════════════════════════════════════════════════════════════════════════
  // RATIONAL FUNCTIONS
  // ══════════════════════════════════════════════════════════════════════════
  "rational-functions": [
    {
      content:
        "For the function $y = \\dfrac{5}{x - 1} + 2$, state the horizontal and vertical asymptotes.",
      marks: 2,
      difficulty: "EASY",
      solutionContent:
        "**Step 1 (1 mark):** The denominator is zero when $x = 1$, giving the vertical asymptote $x = 1$.\n\n**Step 2 (1 mark):** As $|x| \\to \\infty$, $\\dfrac{5}{x - 1} \\to 0$, so $y \\to 2$. The horizontal asymptote is $y = 2$.",
    },
    {
      content:
        "Solve the inequality $\\dfrac{1}{x - 2} < 0$, giving your answer as an interval.",
      marks: 2,
      difficulty: "MEDIUM",
      solutionContent:
        "**Step 1 (1 mark):** The numerator $1$ is always positive, so the fraction is negative exactly when the denominator is negative.\n\n$$x - 2 < 0 \\implies x < 2.$$\n\n**Step 2 (1 mark):** Exclude $x = 2$ (where the expression is undefined). The solution is $x \\in (-\\infty, 2)$.",
    },
    {
      content:
        "The function $y = \\dfrac{ax + 1}{x - 3}$ passes through the point $(1, -2)$. Find the value of $a$, and state the equation of the horizontal asymptote.",
      marks: 3,
      difficulty: "MEDIUM",
      solutionContent:
        "**Step 1 (1 mark):** Substitute $(1, -2)$.\n\n$$-2 = \\dfrac{a(1) + 1}{1 - 3} = \\dfrac{a + 1}{-2}.$$\n\n**Step 2 (1 mark):** Solve for $a$.\n\n$$a + 1 = 4$$\n\n$$a = 3.$$\n\n**Step 3 (1 mark):** Divide: $\\dfrac{3x + 1}{x - 3} = 3 + \\dfrac{10}{x - 3}$, so as $x \\to \\pm\\infty$, $y \\to 3$. The horizontal asymptote is $y = 3$.",
    },
    {
      content:
        "Solve $\\dfrac{2x}{x + 1} = \\dfrac{x - 1}{x + 1} + 1$ for $x$.",
      marks: 3,
      difficulty: "MEDIUM",
      solutionContent:
        "**Step 1 (1 mark):** Multiply both sides by $(x + 1)$, noting $x \\neq -1$.\n\n$$2x = (x - 1) + (x + 1).$$\n\n**Step 2 (1 mark):** Simplify the right-hand side.\n\n$$2x = 2x.$$\n\n**Step 3 (1 mark):** The equation holds for all $x$ in the domain. Solution: $x \\in \\mathbb{R} \\setminus \\{-1\\}$.",
    },
    {
      content:
        "Show that $\\dfrac{x^2 - 1}{x - 1}$ simplifies to $x + 1$ and state the domain of the original expression.",
      marks: 3,
      difficulty: "HARD",
      solutionContent:
        "**Step 1 (1 mark):** Factorise the numerator as a difference of squares.\n\n$$x^2 - 1 = (x - 1)(x + 1).$$\n\n**Step 2 (1 mark):** Cancel the common factor $(x - 1)$, valid provided $x \\neq 1$.\n\n$$\\dfrac{(x - 1)(x + 1)}{x - 1} = x + 1.$$\n\n**Step 3 (1 mark):** The original expression is undefined at $x = 1$, so its domain is $\\mathbb{R} \\setminus \\{1\\}$. The simplified form $x + 1$ agrees with the original for every value in this domain.",
    },
  ],

  // ══════════════════════════════════════════════════════════════════════════
  // DOMAIN AND RANGE
  // ══════════════════════════════════════════════════════════════════════════
  "domain-and-range": [
    {
      content:
        "Find the maximal domain of $y = \\dfrac{1}{x^2 - 9}$.",
      marks: 2,
      difficulty: "EASY",
      solutionContent:
        "**Step 1 (1 mark):** The denominator is zero when $x^2 - 9 = 0$, i.e. $x = 3$ or $x = -3$.\n\n**Step 2 (1 mark):** The maximal domain is all reals except these values.\n\n$$\\text{Domain} = \\mathbb{R} \\setminus \\{-3,\\, 3\\}.$$",
    },
    {
      content:
        "For the function $f: [0, 4] \\to \\mathbb{R}$, $f(x) = 2x - x^2$, state the range.",
      marks: 3,
      difficulty: "MEDIUM",
      solutionContent:
        "**Step 1 (1 mark):** Complete the square.\n\n$$f(x) = -(x^2 - 2x) = -(x - 1)^2 + 1.$$\n\n**Step 2 (1 mark):** On $[0, 4]$ the maximum occurs at the vertex $x = 1$, giving $f(1) = 1$.\n\n**Step 3 (1 mark):** The minimum occurs at an endpoint: $f(0) = 0$ and $f(4) = 8 - 16 = -8$. So the range is $[-8, 1]$.",
    },
    {
      content:
        "Find the range of $y = 3 - 2 e^{x}$.",
      marks: 2,
      difficulty: "MEDIUM",
      solutionContent:
        "**Step 1 (1 mark):** For all real $x$, $e^{x} > 0$, so $-2 e^{x} < 0$.\n\n**Step 2 (1 mark):** Therefore $3 - 2 e^{x} < 3$, and as $x \\to -\\infty$ the expression approaches $3$ from below. The range is $(-\\infty,\\, 3)$.",
    },
    {
      content:
        "Find the maximal domain and range of $y = |x - 2| - 3$.",
      marks: 3,
      difficulty: "MEDIUM",
      solutionContent:
        "**Step 1 (1 mark):** The modulus is defined for all real numbers, so the maximal domain is $\\mathbb{R}$.\n\n**Step 2 (1 mark):** The minimum of $|x - 2|$ is $0$, attained at $x = 2$, so the minimum of $y$ is $-3$.\n\n**Step 3 (1 mark):** As $|x - 2| \\to \\infty$ the expression grows without bound, so the range is $[-3,\\, \\infty)$.",
    },
    {
      content:
        "Find the maximal domain of $f(x) = \\ln(x^2 - x - 6)$.",
      marks: 3,
      difficulty: "HARD",
      solutionContent:
        "**Step 1 (1 mark):** The argument of the logarithm must be positive: $x^2 - x - 6 > 0$.\n\n**Step 2 (1 mark):** Factorise.\n\n$$(x - 3)(x + 2) > 0.$$\n\n**Step 3 (1 mark):** The upward parabola is positive outside its roots, giving $x \\in (-\\infty,\\, -2) \\cup (3,\\, \\infty)$.",
    },
  ],

  // ══════════════════════════════════════════════════════════════════════════
  // TRANSFORMATIONS
  // ══════════════════════════════════════════════════════════════════════════
  "transformations": [
    {
      content:
        "Write down the equation of the image of $y = x^2$ after a reflection in the $y$-axis followed by a translation $1$ unit right.",
      marks: 2,
      difficulty: "EASY",
      solutionContent:
        "**Step 1 (1 mark):** Reflection in the $y$-axis replaces $x$ with $-x$. Since $(-x)^2 = x^2$, the curve is unchanged.\n\n**Step 2 (1 mark):** Translating $1$ unit right replaces $x$ with $x - 1$, giving $y = (x - 1)^2$.",
    },
    {
      content:
        "The function $y = f(x)$ is transformed to $y = 3 f(2x) - 1$. Describe the three transformations in order and find the image of the point $(4, 5)$ on the original curve.",
      marks: 3,
      difficulty: "MEDIUM",
      solutionContent:
        "**Step 1 (1 mark):** The factor $2$ inside gives a dilation by factor $1/2$ from the $y$-axis.\n\n**Step 2 (1 mark):** The factor $3$ outside gives a dilation by factor $3$ from the $x$-axis, and the $-1$ gives a translation of $1$ unit down.\n\n**Step 3 (1 mark):** The point $(4, 5)$ maps to $\\left(\\dfrac{4}{2},\\, 3 \\cdot 5 - 1\\right) = (2,\\, 14)$.",
    },
    {
      content:
        "Find the equation of the image of $y = \\sin x$ after a dilation by factor $\\dfrac{1}{2}$ from the $y$-axis and a translation $\\pi/4$ to the right. State the period of the image.",
      marks: 3,
      difficulty: "MEDIUM",
      solutionContent:
        "**Step 1 (1 mark):** A dilation by factor $1/2$ from the $y$-axis replaces $x$ with $2x$, giving $y = \\sin(2x)$.\n\n**Step 2 (1 mark):** Translating $\\pi/4$ right replaces $x$ with $x - \\pi/4$.\n\n$$y = \\sin\\!\\big(2(x - \\pi/4)\\big) = \\sin(2x - \\pi/2).$$\n\n**Step 3 (1 mark):** The coefficient of $x$ is $2$, so the period is $\\dfrac{2\\pi}{2} = \\pi$.",
    },
    {
      content:
        "The point $(1, 4)$ lies on the graph of $y = f(x)$. A new graph is produced by applying the mapping $(x, y) \\to (-x + 3, 2y - 1)$. Find the coordinates of the image of $(1, 4)$ and verify it satisfies the new equation $y = 2 f(3 - x) - 1$.",
      marks: 4,
      difficulty: "HARD",
      solutionContent:
        "**Step 1 (1 mark):** Apply the mapping to $(1, 4)$.\n\n$$x' = -1 + 3 = 2,\\quad y' = 2 \\cdot 4 - 1 = 7.$$\n\nSo the image is $(2, 7)$.\n\n**Step 2 (1 mark):** In the new equation, substitute $x = 2$.\n\n$$y = 2 f(3 - 2) - 1 = 2 f(1) - 1.$$\n\n**Step 3 (1 mark):** Since $(1, 4)$ is on $y = f(x)$, we have $f(1) = 4$.\n\n$$y = 2 \\cdot 4 - 1 = 7.$$\n\n**Step 4 (1 mark):** This matches the image, confirming $(2, 7)$ lies on the new graph.",
    },
    {
      content:
        "Describe a sequence of transformations that maps $y = \\dfrac{1}{x}$ to $y = \\dfrac{-2}{x + 1} + 3$, and state the equations of the asymptotes of the image.",
      marks: 4,
      difficulty: "HARD",
      solutionContent:
        "**Step 1 (1 mark):** Dilation by factor $2$ from the $x$-axis gives $y = \\dfrac{2}{x}$.\n\n**Step 2 (1 mark):** Reflection in the $x$-axis gives $y = \\dfrac{-2}{x}$.\n\n**Step 3 (1 mark):** Translate $1$ unit left to get $y = \\dfrac{-2}{x + 1}$, then translate $3$ units up.\n\n$$y = \\dfrac{-2}{x + 1} + 3.$$\n\n**Step 4 (1 mark):** The vertical asymptote is $x = -1$ and the horizontal asymptote is $y = 3$.",
    },
  ],

  // ══════════════════════════════════════════════════════════════════════════
  // INVERSE FUNCTIONS
  // ══════════════════════════════════════════════════════════════════════════
  "inverse-functions": [
    {
      content:
        "Find the inverse of $f(x) = 2 \\log_2 x$, stating its domain.",
      marks: 2,
      difficulty: "EASY",
      solutionContent:
        "**Step 1 (1 mark):** Write $y = 2 \\log_2 x$, so $\\log_2 x = y/2$, hence $x = 2^{y/2}$.\n\n**Step 2 (1 mark):** Swap to get $f^{-1}(x) = 2^{x/2}$, with domain $\\mathbb{R}$.",
    },
    {
      content:
        "For $f: [2, \\infty) \\to \\mathbb{R}$, $f(x) = (x - 2)^2 + 1$, find the rule and domain of $f^{-1}$.",
      marks: 3,
      difficulty: "MEDIUM",
      solutionContent:
        "**Step 1 (1 mark):** Set $y = (x - 2)^2 + 1$ and isolate the squared term.\n\n$$(x - 2)^2 = y - 1.$$\n\n**Step 2 (1 mark):** Since $x \\geq 2$, take the non-negative square root.\n\n$$x - 2 = \\sqrt{y - 1}$$\n\n$$x = 2 + \\sqrt{y - 1}.$$\n\n**Step 3 (1 mark):** The range of $f$ is $[1, \\infty)$, which becomes the domain of $f^{-1}$. Therefore $f^{-1}(x) = 2 + \\sqrt{x - 1}$ with domain $[1, \\infty)$.",
    },
    {
      content:
        "Let $f(x) = 3x - 2$. Show that $(f^{-1} \\circ f)(x) = x$ for all real $x$.",
      marks: 3,
      difficulty: "MEDIUM",
      solutionContent:
        "**Step 1 (1 mark):** Find $f^{-1}$. If $y = 3x - 2$ then $x = \\dfrac{y + 2}{3}$, so $f^{-1}(x) = \\dfrac{x + 2}{3}$.\n\n**Step 2 (1 mark):** Form the composition.\n\n$$(f^{-1} \\circ f)(x) = f^{-1}(3x - 2) = \\dfrac{(3x - 2) + 2}{3}.$$\n\n**Step 3 (1 mark):** Simplify.\n\n$$= \\dfrac{3x}{3} = x.$$\n\nHence $(f^{-1} \\circ f)(x) = x$ for all $x \\in \\mathbb{R}$.",
    },
    {
      content:
        "State whether $f(x) = x^2 - 4$, $x \\in \\mathbb{R}$, has an inverse function. Justify your answer, and give the largest interval of the form $[a, \\infty)$ on which $f$ is invertible, with the corresponding inverse.",
      marks: 4,
      difficulty: "HARD",
      solutionContent:
        "**Step 1 (1 mark):** On $\\mathbb{R}$, $f$ is not one-to-one because, for example, $f(2) = f(-2) = 0$. Hence $f$ does not have an inverse function on $\\mathbb{R}$.\n\n**Step 2 (1 mark):** Restricting to $[0, \\infty)$ makes $f$ strictly increasing, so it is one-to-one and invertible on this interval.\n\n**Step 3 (1 mark):** Solve $y = x^2 - 4$ for $x \\geq 0$.\n\n$$x^2 = y + 4$$\n\n$$x = \\sqrt{y + 4}.$$\n\n**Step 4 (1 mark):** The range of the restricted $f$ is $[-4, \\infty)$, which is the domain of the inverse. Therefore $f^{-1}(x) = \\sqrt{x + 4}$ with domain $[-4, \\infty)$.",
    },
    {
      content:
        "Find the rule of the inverse of $f(x) = \\dfrac{2x - 1}{x + 3}$, $x \\neq -3$.",
      marks: 3,
      difficulty: "HARD",
      solutionContent:
        "**Step 1 (1 mark):** Set $y = \\dfrac{2x - 1}{x + 3}$ and clear the denominator.\n\n$$y(x + 3) = 2x - 1.$$\n\n**Step 2 (1 mark):** Collect $x$ terms on one side.\n\n$$yx - 2x = -1 - 3y$$\n\n$$x(y - 2) = -1 - 3y.$$\n\n**Step 3 (1 mark):** Solve for $x$ and swap variables.\n\n$$x = \\dfrac{-1 - 3y}{y - 2} = \\dfrac{3y + 1}{2 - y}$$\n\n$$f^{-1}(x) = \\dfrac{3x + 1}{2 - x},\\; x \\neq 2.$$",
    },
  ],

  // ══════════════════════════════════════════════════════════════════════════
  // COMPOSITE FUNCTIONS
  // ══════════════════════════════════════════════════════════════════════════
  "composite-functions": [
    {
      content:
        "Given $f(x) = 2x + 3$ and $g(x) = x^2$, evaluate $g(f(1))$.",
      marks: 2,
      difficulty: "EASY",
      solutionContent:
        "**Step 1 (1 mark):** Compute the inner value first.\n\n$$f(1) = 2(1) + 3 = 5.$$\n\n**Step 2 (1 mark):** Substitute into $g$.\n\n$$g(5) = 5^2 = 25.$$",
    },
    {
      content:
        "Let $f(x) = x - 4$ and $g(x) = \\sqrt{x}$. Solve $(g \\circ f)(x) = 3$ for $x$, stating any domain restriction.",
      marks: 3,
      difficulty: "MEDIUM",
      solutionContent:
        "**Step 1 (1 mark):** Form the composition.\n\n$$(g \\circ f)(x) = g(x - 4) = \\sqrt{x - 4}.$$\n\nDomain: $x - 4 \\geq 0$, i.e. $x \\geq 4$.\n\n**Step 2 (1 mark):** Set the composition equal to $3$ and square.\n\n$$\\sqrt{x - 4} = 3$$\n\n$$x - 4 = 9.$$\n\n**Step 3 (1 mark):** Solve.\n\n$$x = 13.$$\n\nThis lies in the domain $x \\geq 4$, so it is valid.",
    },
    {
      content:
        "Let $f(x) = e^{x}$ and $g(x) = \\ln x$. Find $(f \\circ g)(x)$ and $(g \\circ f)(x)$, state the domain of each, and comment on what the results show.",
      marks: 3,
      difficulty: "MEDIUM",
      solutionContent:
        "**Step 1 (1 mark):** $(f \\circ g)(x) = f(\\ln x) = e^{\\ln x} = x$, with domain $(0, \\infty)$ (from the inner $\\ln$).\n\n**Step 2 (1 mark):** $(g \\circ f)(x) = g(e^{x}) = \\ln(e^{x}) = x$, with domain $\\mathbb{R}$.\n\n**Step 3 (1 mark):** Both compositions return $x$ on their domains, confirming that $\\ln$ and $\\exp$ are inverse functions of one another.",
    },
    {
      content:
        "Given $f(x) = \\dfrac{1}{x}$ and $g(x) = x - 2$, find $(f \\circ g)(x)$ and $(g \\circ f)(x)$, showing that they are not equal in general.",
      marks: 3,
      difficulty: "MEDIUM",
      solutionContent:
        "**Step 1 (1 mark):** Compute $(f \\circ g)(x)$.\n\n$$(f \\circ g)(x) = f(x - 2) = \\dfrac{1}{x - 2}.$$\n\n**Step 2 (1 mark):** Compute $(g \\circ f)(x)$.\n\n$$(g \\circ f)(x) = g\\!\\left(\\dfrac{1}{x}\\right) = \\dfrac{1}{x} - 2.$$\n\n**Step 3 (1 mark):** At $x = 1$: $(f \\circ g)(1) = -1$ and $(g \\circ f)(1) = -1$ happen to agree, but at $x = 2$ the first is undefined while $(g \\circ f)(2) = -3/2$, so the compositions are not the same function.",
    },
    {
      content:
        "For $f(x) = 2x - 1$ and $g(x) = x + 3$, find the rule of $(f \\circ g)^{-1}(x)$ and verify that it equals $(g^{-1} \\circ f^{-1})(x)$.",
      marks: 4,
      difficulty: "HARD",
      solutionContent:
        "**Step 1 (1 mark):** Form the composition.\n\n$$(f \\circ g)(x) = f(x + 3) = 2(x + 3) - 1 = 2x + 5.$$\n\n**Step 2 (1 mark):** Invert. Setting $y = 2x + 5$ gives $x = \\dfrac{y - 5}{2}$.\n\n$$(f \\circ g)^{-1}(x) = \\dfrac{x - 5}{2}.$$\n\n**Step 3 (1 mark):** Find the individual inverses: $f^{-1}(x) = \\dfrac{x + 1}{2}$ and $g^{-1}(x) = x - 3$.\n\n**Step 4 (1 mark):** Compose.\n\n$$(g^{-1} \\circ f^{-1})(x) = g^{-1}\\!\\left(\\dfrac{x + 1}{2}\\right) = \\dfrac{x + 1}{2} - 3 = \\dfrac{x - 5}{2}.$$\n\nThis matches $(f \\circ g)^{-1}$, confirming the identity $(f \\circ g)^{-1} = g^{-1} \\circ f^{-1}$.",
    },
  ],
};

// ── Main ────────────────────────────────────────────────────────────────────

function buildAdditions(slug: string): FR[] {
  const items = additions[slug];
  if (!items) throw new Error(`No additions defined for slug '${slug}'`);
  return items.map((q) => ({
    ...q,
    solutionContent: dechainSolution(q.solutionContent),
    subtopicSlugs: [slug],
  }));
}

function main(): void {
  const slugs = Object.keys(additions);
  for (const slug of slugs) {
    const filePath = OUT(slug);
    const raw = fs.readFileSync(filePath, "utf-8");
    const data = JSON.parse(raw);
    if (!Array.isArray(data.shortAnswer)) {
      throw new Error(`${filePath}: shortAnswer is not an array`);
    }
    if (data.shortAnswer.length >= 15) {
      console.log(`⏭  ${slug}: already has ${data.shortAnswer.length} SA items, skipping`);
      continue;
    }
    const newItems = buildAdditions(slug);
    const expected = data.shortAnswer.length + newItems.length;
    data.shortAnswer.push(...newItems);
    if (data.shortAnswer.length !== expected) {
      throw new Error(
        `${slug}: expected ${expected} SA items after push, got ${data.shortAnswer.length}`
      );
    }
    // Validate mark-distributed step headers sum to marks for each new item.
    for (const q of newItems) {
      const steps = [...q.solutionContent.matchAll(/\*\*Step \d+ \((\d+) marks?\):\*\*/g)];
      const total = steps.reduce((s, m) => s + parseInt(m[1], 10), 0);
      if (total !== q.marks) {
        throw new Error(
          `${slug}: Step headers sum to ${total} but marks = ${q.marks}\n  Question: ${q.content.slice(0, 80)}`
        );
      }
    }
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), "utf-8");
    console.log(`✅ ${slug}: ${data.shortAnswer.length} SA items`);
  }
}

main();
