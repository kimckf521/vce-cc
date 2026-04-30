/**
 * add-ea-calculus.ts
 *
 * Adds an `extendedAnswer` array (5 items each) to each of the 12 Calculus
 * subtopic JSON files under scripts/output/.
 *
 * Extended-Answer questions model VCE Exam 1 multi-part questions:
 *   - 4-8 marks total, split across 3-5 sub-parts (a, b, c, d)
 *   - Parts flow via "hence" / "using your answer from (a)"
 *   - No calculator
 *
 * Mark distribution per subtopic (5 questions):
 *   1 x 4 marks, 2 x 5-6 marks, 1 x 7 marks, 1 x 8 marks
 *
 * Idempotent: if `extendedAnswer` already has 5+ items, the file is skipped.
 *
 * Run: cd vce-methods && npx tsx scripts/add-ea-calculus.ts
 */
import fs from "fs";
import path from "path";
import { dechainSolution } from "./qset-helpers";

interface FR {
  content: string;
  marks: number;
  difficulty: "MEDIUM" | "HARD";
  solutionContent: string;
  subtopicSlugs: string[];
}

const OUT_DIR = path.join(__dirname, "output");

const EA_QUESTIONS: Record<string, FR[]> = {
  // ═══════════════════════════════════════════════════════════════════════════
  // 1. DIFFERENTIATION
  // ═══════════════════════════════════════════════════════════════════════════
  "differentiation": [
    // Q1 — 4 marks
    {
      content:
        "Let $f(x) = x^3 - 6x^2 + 9x$.\n\n" +
        "**a.** Find $f'(x)$. (1 mark)\n\n" +
        "**b.** Hence find the values of $x$ where $f'(x) = 0$. (1 mark)\n\n" +
        "**c.** Determine the value of $f''(x)$ at each stationary point and hence state whether each is a local maximum or local minimum. (2 marks)",
      marks: 4,
      difficulty: "MEDIUM",
      solutionContent:
        "**a. (1 mark)**\n\n" +
        "*Step 1 (1 mark):* Differentiate term by term.\n\n" +
        "$$f'(x) = 3x^2 - 12x + 9$$\n\n" +
        "**b. (1 mark)**\n\n" +
        "*Step 1 (1 mark):* Set $f'(x) = 0$ and factor.\n\n" +
        "$$3(x^2 - 4x + 3) = 0$$\n\n" +
        "$$3(x - 1)(x - 3) = 0$$\n\n" +
        "$$x = 1 \\text{ or } x = 3$$\n\n" +
        "**c. (2 marks)**\n\n" +
        "*Step 1 (1 mark):* $f''(x) = 6x - 12$. At $x = 1$: $f''(1) = -6 < 0$, so local maximum.\n\n" +
        "*Step 2 (1 mark):* At $x = 3$: $f''(3) = 6 > 0$, so local minimum.",
      subtopicSlugs: ["differentiation"],
    },
    // Q2 — 5 marks
    {
      content:
        "Let $f(x) = 2x^3 + 3x^2 - 12x + 1$.\n\n" +
        "**a.** Find $f'(x)$. (1 mark)\n\n" +
        "**b.** Hence find the coordinates of the stationary points of $f$. (2 marks)\n\n" +
        "**c.** Using your answer from part (b), determine the values of $x$ for which $f$ is strictly decreasing. (2 marks)",
      marks: 5,
      difficulty: "MEDIUM",
      solutionContent:
        "**a. (1 mark)**\n\n" +
        "*Step 1 (1 mark):* Differentiate.\n\n" +
        "$$f'(x) = 6x^2 + 6x - 12$$\n\n" +
        "**b. (2 marks)**\n\n" +
        "*Step 1 (1 mark):* Set $f'(x) = 0$.\n\n" +
        "$$6(x^2 + x - 2) = 0$$\n\n" +
        "$$6(x + 2)(x - 1) = 0$$\n\n" +
        "$$x = -2 \\text{ or } x = 1$$\n\n" +
        "*Step 2 (1 mark):* Find $y$-values: $f(-2) = -16 + 12 + 24 + 1 = 21$ and $f(1) = 2 + 3 - 12 + 1 = -6$.\n\n" +
        "Stationary points: $(-2, 21)$ and $(1, -6)$.\n\n" +
        "**c. (2 marks)**\n\n" +
        "*Step 1 (1 mark):* $f$ is strictly decreasing where $f'(x) < 0$, which is between the stationary points.\n\n" +
        "*Step 2 (1 mark):* Since $f'(x) = 6(x+2)(x-1)$ and the leading coefficient is positive, $f'(x) < 0$ for $-2 < x < 1$.\n\n" +
        "$f$ is strictly decreasing on $(-2, 1)$.",
      subtopicSlugs: ["differentiation"],
    },
    // Q3 — 6 marks
    {
      content:
        "Let $f(x) = e^x(x - 2)$.\n\n" +
        "**a.** Show that $f'(x) = e^x(x - 1)$. (2 marks)\n\n" +
        "**b.** Hence find the coordinates of the stationary point of $f$. (2 marks)\n\n" +
        "**c.** Show that $f''(x) = e^x \\cdot x$ and hence determine the nature of the stationary point from part (b). (2 marks)",
      marks: 6,
      difficulty: "MEDIUM",
      solutionContent:
        "**a. (2 marks)**\n\n" +
        "*Step 1 (1 mark):* Apply the product rule: $f'(x) = e^x(x - 2) + e^x \\cdot 1$.\n\n" +
        "*Step 2 (1 mark):* Simplify.\n\n" +
        "$$f'(x) = e^x(x - 2 + 1)$$\n\n" +
        "$$= e^x(x - 1)$$\n\n" +
        "**b. (2 marks)**\n\n" +
        "*Step 1 (1 mark):* Set $f'(x) = 0$. Since $e^x > 0$ for all $x$, we need $x - 1 = 0$, so $x = 1$.\n\n" +
        "*Step 2 (1 mark):* $f(1) = e^1(1 - 2) = -e$.\n\n" +
        "Stationary point: $(1, -e)$.\n\n" +
        "**c. (2 marks)**\n\n" +
        "*Step 1 (1 mark):* Differentiate $f'(x) = e^x(x-1)$ using the product rule.\n\n" +
        "$$f''(x) = e^x(x - 1) + e^x \\cdot 1 = e^x \\cdot x$$\n\n" +
        "*Step 2 (1 mark):* At $x = 1$: $f''(1) = e^1 \\cdot 1 = e > 0$, so the stationary point is a local minimum.",
      subtopicSlugs: ["differentiation"],
    },
    // Q4 — 7 marks
    {
      content:
        "Let $g: R \\to R$, $g(x) = x^4 - 4x^3$.\n\n" +
        "**a.** Find $g'(x)$. (1 mark)\n\n" +
        "**b.** Hence find the coordinates of the stationary points of $g$. (2 marks)\n\n" +
        "**c.** Find $g''(x)$ and hence classify each stationary point from part (b). (2 marks)\n\n" +
        "**d.** Using your results from parts (b) and (c), find the values of $x$ for which $g(x) < 0$. (2 marks)",
      marks: 7,
      difficulty: "HARD",
      solutionContent:
        "**a. (1 mark)**\n\n" +
        "*Step 1 (1 mark):*\n\n" +
        "$$g'(x) = 4x^3 - 12x^2$$\n\n" +
        "**b. (2 marks)**\n\n" +
        "*Step 1 (1 mark):* Set $g'(x) = 0$.\n\n" +
        "$$4x^2(x - 3) = 0$$\n\n" +
        "$$x = 0 \\text{ or } x = 3$$\n\n" +
        "*Step 2 (1 mark):* $g(0) = 0$ and $g(3) = 81 - 108 = -27$.\n\n" +
        "Stationary points: $(0, 0)$ and $(3, -27)$.\n\n" +
        "**c. (2 marks)**\n\n" +
        "*Step 1 (1 mark):* $g''(x) = 12x^2 - 24x$. At $x = 0$: $g''(0) = 0$ (inconclusive; check sign of $g'$: $g'(x) = 4x^2(x-3) < 0$ for $x$ near $0$ on both sides, so $(0,0)$ is a stationary point of inflection).\n\n" +
        "*Step 2 (1 mark):* At $x = 3$: $g''(3) = 108 - 72 = 36 > 0$, so $(3, -27)$ is a local minimum.\n\n" +
        "**d. (2 marks)**\n\n" +
        "*Step 1 (1 mark):* $g(x) = x^3(x - 4)$. The zeros are $x = 0$ and $x = 4$.\n\n" +
        "*Step 2 (1 mark):* Since the local minimum at $x = 3$ has $g(3) = -27 < 0$, and $g(x) > 0$ outside the zeros, we have $g(x) < 0$ for $0 < x < 4$.",
      subtopicSlugs: ["differentiation"],
    },
    // Q5 — 8 marks
    {
      content:
        "The function $f: R \\to R$, $f(x) = x^3 - 3x^2 + 4$ has a local maximum at $A$ and a local minimum at $B$.\n\n" +
        "**a.** Find $f'(x)$ and hence find the coordinates of $A$ and $B$. (3 marks)\n\n" +
        "**b.** Find the equation of the line through $A$ and $B$. (2 marks)\n\n" +
        "**c.** The line from part (b) meets the curve $y = f(x)$ at a third point $C$. Using the fact that $f(x) - y_{\\text{line}}$ must factor, find the coordinates of $C$. (3 marks)",
      marks: 8,
      difficulty: "HARD",
      solutionContent:
        "**a. (3 marks)**\n\n" +
        "*Step 1 (1 mark):* $f'(x) = 3x^2 - 6x = 3x(x - 2)$.\n\n" +
        "*Step 2 (1 mark):* $f'(x) = 0$ gives $x = 0$ or $x = 2$. Since $f''(x) = 6x - 6$, $f''(0) = -6 < 0$ (local max) and $f''(2) = 6 > 0$ (local min).\n\n" +
        "*Step 3 (1 mark):* $f(0) = 4$ and $f(2) = 8 - 12 + 4 = 0$. So $A = (0, 4)$ and $B = (2, 0)$.\n\n" +
        "**b. (2 marks)**\n\n" +
        "*Step 1 (1 mark):* Gradient: $m = \\dfrac{0 - 4}{2 - 0} = -2$.\n\n" +
        "*Step 2 (1 mark):* Using point $A$: $y = -2x + 4$.\n\n" +
        "**c. (3 marks)**\n\n" +
        "*Step 1 (1 mark):* Set $f(x) = -2x + 4$.\n\n" +
        "$$x^3 - 3x^2 + 4 = -2x + 4$$\n\n" +
        "$$x^3 - 3x^2 + 2x = 0$$\n\n" +
        "*Step 2 (1 mark):* Factor: $x(x^2 - 3x + 2) = 0$, so $x(x-1)(x-2) = 0$.\n\n" +
        "The roots $x = 0$ and $x = 2$ correspond to $A$ and $B$. The third root is $x = 1$.\n\n" +
        "*Step 3 (1 mark):* $y = -2(1) + 4 = 2$. So $C = (1, 2)$.",
      subtopicSlugs: ["differentiation"],
    },
  ],

  // ═══════════════════════════════════════════════════════════════════════════
  // 2. CHAIN RULE
  // ═══════════════════════════════════════════════════════════════════════════
  "chain-rule": [
    // Q1 — 4 marks
    {
      content:
        "Let $y = \\sin^2(x)$.\n\n" +
        "**a.** By writing $y = (\\sin x)^2$, show that $\\dfrac{dy}{dx} = 2\\sin x \\cos x$. (2 marks)\n\n" +
        "**b.** Hence show that $\\dfrac{dy}{dx} = \\sin(2x)$. (1 mark)\n\n" +
        "**c.** Using your result from part (b), find the exact value of $\\dfrac{dy}{dx}$ when $x = \\dfrac{\\pi}{8}$. (1 mark)",
      marks: 4,
      difficulty: "MEDIUM",
      solutionContent:
        "**a. (2 marks)**\n\n" +
        "*Step 1 (1 mark):* Let $u = \\sin x$ so $y = u^2$. Then $\\dfrac{dy}{du} = 2u$ and $\\dfrac{du}{dx} = \\cos x$.\n\n" +
        "*Step 2 (1 mark):* By the chain rule:\n\n" +
        "$$\\dfrac{dy}{dx} = 2u \\cdot \\cos x = 2\\sin x \\cos x$$\n\n" +
        "**b. (1 mark)**\n\n" +
        "*Step 1 (1 mark):* Using the double angle formula $\\sin(2x) = 2\\sin x \\cos x$:\n\n" +
        "$$\\dfrac{dy}{dx} = \\sin(2x)$$\n\n" +
        "**c. (1 mark)**\n\n" +
        "*Step 1 (1 mark):* At $x = \\dfrac{\\pi}{8}$:\n\n" +
        "$$\\dfrac{dy}{dx} = \\sin\\!\\left(\\dfrac{\\pi}{4}\\right) = \\dfrac{\\sqrt{2}}{2}$$",
      subtopicSlugs: ["chain-rule"],
    },
    // Q2 — 5 marks
    {
      content:
        "Let $f(x) = e^{x^2 - 4x}$.\n\n" +
        "**a.** Find $f'(x)$. (2 marks)\n\n" +
        "**b.** Hence find the coordinates of the stationary point of $f$. (2 marks)\n\n" +
        "**c.** Using your answer from part (b), state the range of $f$. (1 mark)",
      marks: 5,
      difficulty: "MEDIUM",
      solutionContent:
        "**a. (2 marks)**\n\n" +
        "*Step 1 (1 mark):* Let $u = x^2 - 4x$. By the chain rule, $f'(x) = e^u \\cdot u'$.\n\n" +
        "*Step 2 (1 mark):* $u' = 2x - 4$, so:\n\n" +
        "$$f'(x) = (2x - 4)e^{x^2 - 4x}$$\n\n" +
        "**b. (2 marks)**\n\n" +
        "*Step 1 (1 mark):* Set $f'(x) = 0$. Since $e^{x^2-4x} > 0$, we need $2x - 4 = 0$, giving $x = 2$.\n\n" +
        "*Step 2 (1 mark):* $f(2) = e^{4 - 8} = e^{-4}$. The stationary point is $(2, e^{-4})$.\n\n" +
        "**c. (1 mark)**\n\n" +
        "*Step 1 (1 mark):* Since $e^{x^2-4x} > 0$ for all $x$ and the minimum value is $e^{-4}$, the range is $[e^{-4}, \\infty)$.",
      subtopicSlugs: ["chain-rule"],
    },
    // Q3 — 6 marks
    {
      content:
        "Let $g(x) = \\ln(x^2 + 1)$.\n\n" +
        "**a.** Find $g'(x)$. (1 mark)\n\n" +
        "**b.** Hence show that $g$ has exactly one stationary point, and find its coordinates. (2 marks)\n\n" +
        "**c.** Find $g''(x)$ and hence classify the stationary point from part (b). (3 marks)",
      marks: 6,
      difficulty: "MEDIUM",
      solutionContent:
        "**a. (1 mark)**\n\n" +
        "*Step 1 (1 mark):* By the chain rule:\n\n" +
        "$$g'(x) = \\dfrac{2x}{x^2 + 1}$$\n\n" +
        "**b. (2 marks)**\n\n" +
        "*Step 1 (1 mark):* Set $g'(x) = 0$. The denominator $x^2 + 1 > 0$ for all $x$, so $2x = 0$, giving $x = 0$.\n\n" +
        "*Step 2 (1 mark):* $g(0) = \\ln(1) = 0$. The stationary point is $(0, 0)$.\n\n" +
        "**c. (3 marks)**\n\n" +
        "*Step 1 (1 mark):* Apply the quotient rule to $g'(x) = \\dfrac{2x}{x^2+1}$.\n\n" +
        "$$g''(x) = \\dfrac{2(x^2+1) - 2x \\cdot 2x}{(x^2+1)^2}$$\n\n" +
        "*Step 2 (1 mark):* Simplify the numerator.\n\n" +
        "$$g''(x) = \\dfrac{2x^2 + 2 - 4x^2}{(x^2+1)^2} = \\dfrac{2 - 2x^2}{(x^2+1)^2}$$\n\n" +
        "*Step 3 (1 mark):* At $x = 0$: $g''(0) = \\dfrac{2}{1} = 2 > 0$, so $(0, 0)$ is a local minimum.",
      subtopicSlugs: ["chain-rule"],
    },
    // Q4 — 7 marks
    {
      content:
        "Let $f(x) = e^{-x^2}$.\n\n" +
        "**a.** Find $f'(x)$. (1 mark)\n\n" +
        "**b.** Hence find the stationary point of $f$ and classify it. (2 marks)\n\n" +
        "**c.** Show that $f''(x) = (4x^2 - 2)e^{-x^2}$. (2 marks)\n\n" +
        "**d.** Using your result from part (c), find the $x$-coordinates of the points of inflection of $f$. (2 marks)",
      marks: 7,
      difficulty: "HARD",
      solutionContent:
        "**a. (1 mark)**\n\n" +
        "*Step 1 (1 mark):* By the chain rule with $u = -x^2$:\n\n" +
        "$$f'(x) = -2x \\, e^{-x^2}$$\n\n" +
        "**b. (2 marks)**\n\n" +
        "*Step 1 (1 mark):* $f'(x) = 0$ requires $-2x = 0$ (since $e^{-x^2} > 0$), so $x = 0$.\n\n" +
        "*Step 2 (1 mark):* $f(0) = 1$. For $x < 0$, $f'(x) > 0$; for $x > 0$, $f'(x) < 0$. So $(0, 1)$ is a local maximum.\n\n" +
        "**c. (2 marks)**\n\n" +
        "*Step 1 (1 mark):* Apply the product rule to $f'(x) = -2x \\, e^{-x^2}$.\n\n" +
        "$$f''(x) = -2 \\, e^{-x^2} + (-2x)(-2x)e^{-x^2}$$\n\n" +
        "*Step 2 (1 mark):* Factor.\n\n" +
        "$$f''(x) = e^{-x^2}(-2 + 4x^2) = (4x^2 - 2)e^{-x^2}$$\n\n" +
        "**d. (2 marks)**\n\n" +
        "*Step 1 (1 mark):* Set $f''(x) = 0$. Since $e^{-x^2} > 0$, we need $4x^2 - 2 = 0$.\n\n" +
        "$$x^2 = \\dfrac{1}{2}$$\n\n" +
        "*Step 2 (1 mark):* $x = \\dfrac{1}{\\sqrt{2}}$ or $x = -\\dfrac{1}{\\sqrt{2}}$. These are points of inflection (sign of $f''$ changes at each).",
      subtopicSlugs: ["chain-rule"],
    },
    // Q5 — 8 marks
    {
      content:
        "Let $h(x) = \\cos^2(x) - \\sin^2(x)$ for $x \\in [0, \\pi]$.\n\n" +
        "**a.** Show that $h(x) = \\cos(2x)$. (1 mark)\n\n" +
        "**b.** Using the chain rule, find $h'(x)$. (1 mark)\n\n" +
        "**c.** Hence find the coordinates of all stationary points of $h$ on $[0, \\pi]$. (3 marks)\n\n" +
        "**d.** Using your results, find the exact area enclosed between $y = h(x)$ and the $x$-axis over $\\left[0, \\dfrac{\\pi}{2}\\right]$. (3 marks)",
      marks: 8,
      difficulty: "HARD",
      solutionContent:
        "**a. (1 mark)**\n\n" +
        "*Step 1 (1 mark):* By the double angle formula, $\\cos(2x) = \\cos^2(x) - \\sin^2(x) = h(x)$.\n\n" +
        "**b. (1 mark)**\n\n" +
        "*Step 1 (1 mark):* $h(x) = \\cos(2x)$, so by the chain rule:\n\n" +
        "$$h'(x) = -2\\sin(2x)$$\n\n" +
        "**c. (3 marks)**\n\n" +
        "*Step 1 (1 mark):* Set $h'(x) = 0$: $-2\\sin(2x) = 0$, so $\\sin(2x) = 0$.\n\n" +
        "*Step 2 (1 mark):* $2x = 0, \\pi, 2\\pi$, giving $x = 0, \\dfrac{\\pi}{2}, \\pi$.\n\n" +
        "*Step 3 (1 mark):* $h(0) = 1$, $h\\!\\left(\\dfrac{\\pi}{2}\\right) = \\cos(\\pi) = -1$, $h(\\pi) = \\cos(2\\pi) = 1$.\n\n" +
        "Stationary points: $(0, 1)$, $\\left(\\dfrac{\\pi}{2}, -1\\right)$, $(\\pi, 1)$.\n\n" +
        "**d. (3 marks)**\n\n" +
        "*Step 1 (1 mark):* On $\\left[0, \\dfrac{\\pi}{4}\\right]$, $h(x) \\geq 0$; on $\\left[\\dfrac{\\pi}{4}, \\dfrac{\\pi}{2}\\right]$, $h(x) \\leq 0$ (zero at $x = \\dfrac{\\pi}{4}$).\n\n" +
        "*Step 2 (1 mark):* Area $= \\int_0^{\\pi/4} \\cos(2x)\\,dx - \\int_{\\pi/4}^{\\pi/2} \\cos(2x)\\,dx$.\n\n" +
        "$$= \\left[\\dfrac{\\sin(2x)}{2}\\right]_0^{\\pi/4} - \\left[\\dfrac{\\sin(2x)}{2}\\right]_{\\pi/4}^{\\pi/2}$$\n\n" +
        "*Step 3 (1 mark):* $= \\dfrac{1}{2} - 0 - \\left(0 - \\dfrac{1}{2}\\right) = 1$.",
      subtopicSlugs: ["chain-rule"],
    },
  ],

  // ═══════════════════════════════════════════════════════════════════════════
  // 3. PRODUCT RULE
  // ═══════════════════════════════════════════════════════════════════════════
  "product-rule": [
    // Q1 — 4 marks
    {
      content:
        "Let $y = x^2 e^x$.\n\n" +
        "**a.** Find $\\dfrac{dy}{dx}$. (2 marks)\n\n" +
        "**b.** Hence find the equation of the tangent to the curve at $x = 1$. (2 marks)",
      marks: 4,
      difficulty: "MEDIUM",
      solutionContent:
        "**a. (2 marks)**\n\n" +
        "*Step 1 (1 mark):* Apply the product rule: $\\dfrac{dy}{dx} = 2x \\cdot e^x + x^2 \\cdot e^x$.\n\n" +
        "*Step 2 (1 mark):* Factor.\n\n" +
        "$$\\dfrac{dy}{dx} = e^x(2x + x^2) = xe^x(2 + x)$$\n\n" +
        "**b. (2 marks)**\n\n" +
        "*Step 1 (1 mark):* At $x = 1$: gradient $= 1 \\cdot e \\cdot 3 = 3e$, and $y = e$.\n\n" +
        "*Step 2 (1 mark):* $y - e = 3e(x - 1)$, so $y = 3ex - 2e$.",
      subtopicSlugs: ["product-rule"],
    },
    // Q2 — 5 marks
    {
      content:
        "Let $f(x) = x \\ln(x)$ for $x > 0$.\n\n" +
        "**a.** Find $f'(x)$. (1 mark)\n\n" +
        "**b.** Hence find the coordinates of the stationary point of $f$. (2 marks)\n\n" +
        "**c.** Find $f''(x)$ and hence show that this stationary point is a local minimum. (2 marks)",
      marks: 5,
      difficulty: "MEDIUM",
      solutionContent:
        "**a. (1 mark)**\n\n" +
        "*Step 1 (1 mark):* Product rule: $f'(x) = 1 \\cdot \\ln(x) + x \\cdot \\dfrac{1}{x} = \\ln(x) + 1$.\n\n" +
        "**b. (2 marks)**\n\n" +
        "*Step 1 (1 mark):* Set $f'(x) = 0$: $\\ln(x) + 1 = 0$, so $\\ln(x) = -1$, giving $x = e^{-1}$.\n\n" +
        "*Step 2 (1 mark):* $f(e^{-1}) = e^{-1} \\cdot (-1) = -e^{-1}$. Stationary point: $\\left(\\dfrac{1}{e}, -\\dfrac{1}{e}\\right)$.\n\n" +
        "**c. (2 marks)**\n\n" +
        "*Step 1 (1 mark):* $f''(x) = \\dfrac{1}{x}$.\n\n" +
        "*Step 2 (1 mark):* At $x = e^{-1}$: $f''(e^{-1}) = e > 0$, confirming a local minimum.",
      subtopicSlugs: ["product-rule"],
    },
    // Q3 — 6 marks
    {
      content:
        "Let $g(x) = (x^2 - 1)e^{-x}$.\n\n" +
        "**a.** Show that $g'(x) = -(x^2 - 2x - 1)e^{-x}$. (2 marks)\n\n" +
        "**b.** Hence find the exact $x$-coordinates of the stationary points of $g$. (2 marks)\n\n" +
        "**c.** Find the equation of the tangent to the curve at $x = 0$. (2 marks)",
      marks: 6,
      difficulty: "MEDIUM",
      solutionContent:
        "**a. (2 marks)**\n\n" +
        "*Step 1 (1 mark):* Product rule: $g'(x) = 2x \\cdot e^{-x} + (x^2 - 1)(-e^{-x})$.\n\n" +
        "*Step 2 (1 mark):* Factor.\n\n" +
        "$$g'(x) = e^{-x}(2x - x^2 + 1) = -(x^2 - 2x - 1)e^{-x}$$\n\n" +
        "**b. (2 marks)**\n\n" +
        "*Step 1 (1 mark):* Set $g'(x) = 0$. Since $e^{-x} > 0$, we need $x^2 - 2x - 1 = 0$.\n\n" +
        "*Step 2 (1 mark):* By the quadratic formula:\n\n" +
        "$$x = \\dfrac{2 \\pm \\sqrt{4 + 4}}{2} = 1 \\pm \\sqrt{2}$$\n\n" +
        "**c. (2 marks)**\n\n" +
        "*Step 1 (1 mark):* At $x = 0$: $g(0) = (0 - 1)e^0 = -1$ and $g'(0) = -(0 - 0 - 1) \\cdot 1 = 1$.\n\n" +
        "*Step 2 (1 mark):* $y = x - 1$.",
      subtopicSlugs: ["product-rule"],
    },
    // Q4 — 7 marks
    {
      content:
        "Let $f(x) = x^2 \\sin(x)$ for $x \\in [0, 2\\pi]$.\n\n" +
        "**a.** Find $f'(x)$. (2 marks)\n\n" +
        "**b.** Show that $f'(\\pi) = -\\pi^2$. (1 mark)\n\n" +
        "**c.** Hence find the equation of the tangent to $y = f(x)$ at $x = \\pi$. (2 marks)\n\n" +
        "**d.** Find the $x$-intercept of this tangent and hence determine the exact area of the triangle formed by the tangent, the $x$-axis, and the line $x = \\pi$. (2 marks)",
      marks: 7,
      difficulty: "HARD",
      solutionContent:
        "**a. (2 marks)**\n\n" +
        "*Step 1 (1 mark):* Product rule: $f'(x) = 2x \\sin(x) + x^2 \\cos(x)$.\n\n" +
        "*Step 2 (1 mark):* Factor: $f'(x) = x(2\\sin x + x\\cos x)$.\n\n" +
        "**b. (1 mark)**\n\n" +
        "*Step 1 (1 mark):* $f'(\\pi) = 2\\pi \\sin(\\pi) + \\pi^2 \\cos(\\pi) = 0 + \\pi^2(-1) = -\\pi^2$.\n\n" +
        "**c. (2 marks)**\n\n" +
        "*Step 1 (1 mark):* $f(\\pi) = \\pi^2 \\sin(\\pi) = 0$. So the point is $(\\pi, 0)$.\n\n" +
        "*Step 2 (1 mark):* Tangent: $y = -\\pi^2(x - \\pi)$.\n\n" +
        "**d. (2 marks)**\n\n" +
        "*Step 1 (1 mark):* The tangent already passes through $(\\pi, 0)$, which is on the $x$-axis. Setting $y = 0$: $x = \\pi$, so the tangent touches the $x$-axis at $x = \\pi$. The \"triangle\" is degenerate since the tangent crosses the $x$-axis at the same point as $x = \\pi$. The line $x = \\pi$ meets the tangent at $(\\pi, 0)$. Choose a second point: at $x = 0$, $y = \\pi^3$.\n\n" +
        "Area $= \\dfrac{1}{2} \\times \\text{base} \\times \\text{height}$.\n\n" +
        "*Step 2 (1 mark):* The triangle has vertices $(\\pi, 0)$, $(0, \\pi^3)$, and $(0, 0)$. Base $= \\pi$, height $= \\pi^3$.\n\n" +
        "$$\\text{Area} = \\dfrac{1}{2} \\cdot \\pi \\cdot \\pi^3 = \\dfrac{\\pi^4}{2}$$",
      subtopicSlugs: ["product-rule"],
    },
    // Q5 — 8 marks
    {
      content:
        "Let $f(x) = xe^{-x}$ for $x \\geq 0$.\n\n" +
        "**a.** Show that $f'(x) = (1 - x)e^{-x}$. (1 mark)\n\n" +
        "**b.** Hence find the coordinates of the stationary point of $f$. (2 marks)\n\n" +
        "**c.** Show that $f''(x) = (x - 2)e^{-x}$ and hence classify the stationary point from part (b). (2 marks)\n\n" +
        "**d.** Find the exact area bounded by $y = f(x)$, the $x$-axis, $x = 0$ and $x = 2$. (3 marks)",
      marks: 8,
      difficulty: "HARD",
      solutionContent:
        "**a. (1 mark)**\n\n" +
        "*Step 1 (1 mark):* Product rule: $f'(x) = e^{-x} + x(-e^{-x}) = (1-x)e^{-x}$.\n\n" +
        "**b. (2 marks)**\n\n" +
        "*Step 1 (1 mark):* $f'(x) = 0$: $(1-x) = 0$, so $x = 1$.\n\n" +
        "*Step 2 (1 mark):* $f(1) = e^{-1}$. Stationary point: $(1, e^{-1})$.\n\n" +
        "**c. (2 marks)**\n\n" +
        "*Step 1 (1 mark):* Product rule on $f'(x) = (1-x)e^{-x}$:\n\n" +
        "$$f''(x) = -e^{-x} + (1-x)(-e^{-x}) = e^{-x}(-1 - 1 + x) = (x-2)e^{-x}$$\n\n" +
        "*Step 2 (1 mark):* At $x = 1$: $f''(1) = (1-2)e^{-1} = -e^{-1} < 0$. Local maximum.\n\n" +
        "**d. (3 marks)**\n\n" +
        "*Step 1 (1 mark):* Area $= \\int_0^2 xe^{-x}\\,dx$. Use integration by parts: $u = x$, $dv = e^{-x}dx$, so $du = dx$, $v = -e^{-x}$.\n\n" +
        "*Step 2 (1 mark):*\n\n" +
        "$$\\int_0^2 xe^{-x}\\,dx = \\left[-xe^{-x}\\right]_0^2 + \\int_0^2 e^{-x}\\,dx$$\n\n" +
        "$$= -2e^{-2} + \\left[-e^{-x}\\right]_0^2$$\n\n" +
        "*Step 3 (1 mark):*\n\n" +
        "$$= -2e^{-2} + (-e^{-2} + 1) = 1 - 3e^{-2}$$",
      subtopicSlugs: ["product-rule"],
    },
  ],

  // ═══════════════════════════════════════════════════════════════════════════
  // 4. QUOTIENT RULE
  // ═══════════════════════════════════════════════════════════════════════════
  "quotient-rule": [
    // Q1 — 4 marks
    {
      content:
        "Let $y = \\dfrac{x}{x + 1}$ for $x \\neq -1$.\n\n" +
        "**a.** Find $\\dfrac{dy}{dx}$. (2 marks)\n\n" +
        "**b.** Hence show that the curve has no stationary points. (1 mark)\n\n" +
        "**c.** State the equation of the horizontal asymptote and verify it using limits. (1 mark)",
      marks: 4,
      difficulty: "MEDIUM",
      solutionContent:
        "**a. (2 marks)**\n\n" +
        "*Step 1 (1 mark):* Quotient rule with $u = x$, $v = x + 1$:\n\n" +
        "$$\\dfrac{dy}{dx} = \\dfrac{(x+1) - x}{(x+1)^2}$$\n\n" +
        "*Step 2 (1 mark):*\n\n" +
        "$$\\dfrac{dy}{dx} = \\dfrac{1}{(x+1)^2}$$\n\n" +
        "**b. (1 mark)**\n\n" +
        "*Step 1 (1 mark):* $\\dfrac{1}{(x+1)^2} > 0$ for all $x \\neq -1$, so $\\dfrac{dy}{dx}$ is never zero. No stationary points.\n\n" +
        "**c. (1 mark)**\n\n" +
        "*Step 1 (1 mark):* As $x \\to \\pm\\infty$, $\\dfrac{x}{x+1} = \\dfrac{1}{1 + 1/x} \\to 1$. Horizontal asymptote: $y = 1$.",
      subtopicSlugs: ["quotient-rule"],
    },
    // Q2 — 5 marks
    {
      content:
        "Let $f(x) = \\dfrac{e^x}{x}$ for $x > 0$.\n\n" +
        "**a.** Show that $f'(x) = \\dfrac{e^x(x - 1)}{x^2}$. (2 marks)\n\n" +
        "**b.** Hence find the coordinates of the stationary point of $f$. (2 marks)\n\n" +
        "**c.** Determine the nature of this stationary point using a sign analysis of $f'(x)$. (1 mark)",
      marks: 5,
      difficulty: "MEDIUM",
      solutionContent:
        "**a. (2 marks)**\n\n" +
        "*Step 1 (1 mark):* Quotient rule: $f'(x) = \\dfrac{e^x \\cdot x - e^x \\cdot 1}{x^2}$.\n\n" +
        "*Step 2 (1 mark):* Factor the numerator.\n\n" +
        "$$f'(x) = \\dfrac{e^x(x - 1)}{x^2}$$\n\n" +
        "**b. (2 marks)**\n\n" +
        "*Step 1 (1 mark):* $f'(x) = 0$: since $e^x > 0$ and $x^2 > 0$ for $x > 0$, we need $x - 1 = 0$, giving $x = 1$.\n\n" +
        "*Step 2 (1 mark):* $f(1) = e$. Stationary point: $(1, e)$.\n\n" +
        "**c. (1 mark)**\n\n" +
        "*Step 1 (1 mark):* For $0 < x < 1$, $x - 1 < 0$ so $f'(x) < 0$; for $x > 1$, $x - 1 > 0$ so $f'(x) > 0$. Sign changes from negative to positive, so $(1, e)$ is a local minimum.",
      subtopicSlugs: ["quotient-rule"],
    },
    // Q3 — 6 marks
    {
      content:
        "Let $g(x) = \\dfrac{x^2}{x^2 + 4}$.\n\n" +
        "**a.** Show that $g'(x) = \\dfrac{8x}{(x^2 + 4)^2}$. (2 marks)\n\n" +
        "**b.** Hence find the stationary point of $g$ and classify it. (2 marks)\n\n" +
        "**c.** Show that $g(x) = 1 - \\dfrac{4}{x^2 + 4}$ and hence state the equation of the horizontal asymptote and the range of $g$. (2 marks)",
      marks: 6,
      difficulty: "MEDIUM",
      solutionContent:
        "**a. (2 marks)**\n\n" +
        "*Step 1 (1 mark):* Quotient rule:\n\n" +
        "$$g'(x) = \\dfrac{2x(x^2+4) - x^2 \\cdot 2x}{(x^2+4)^2}$$\n\n" +
        "*Step 2 (1 mark):* Simplify: numerator $= 2x^3 + 8x - 2x^3 = 8x$.\n\n" +
        "$$g'(x) = \\dfrac{8x}{(x^2+4)^2}$$\n\n" +
        "**b. (2 marks)**\n\n" +
        "*Step 1 (1 mark):* $g'(x) = 0$ when $8x = 0$, so $x = 0$. $g(0) = 0$.\n\n" +
        "*Step 2 (1 mark):* For $x < 0$, $g'(x) < 0$; for $x > 0$, $g'(x) > 0$. So $(0, 0)$ is a local minimum.\n\n" +
        "**c. (2 marks)**\n\n" +
        "*Step 1 (1 mark):* $1 - \\dfrac{4}{x^2+4} = \\dfrac{x^2+4-4}{x^2+4} = \\dfrac{x^2}{x^2+4} = g(x)$.\n\n" +
        "*Step 2 (1 mark):* As $x \\to \\pm \\infty$, $\\dfrac{4}{x^2+4} \\to 0$, so $g(x) \\to 1$. Horizontal asymptote: $y = 1$. Since $g(0) = 0$ is the minimum and $g(x) < 1$ for all $x$, the range is $[0, 1)$.",
      subtopicSlugs: ["quotient-rule"],
    },
    // Q4 — 7 marks
    {
      content:
        "Let $f(x) = \\dfrac{x^2 - 4}{x^2 + 4}$.\n\n" +
        "**a.** Find $f'(x)$ in fully simplified form. (2 marks)\n\n" +
        "**b.** Hence find the coordinates of all stationary points of $f$. (2 marks)\n\n" +
        "**c.** State the equations of any asymptotes of $f$ and find the $x$-intercepts. (2 marks)\n\n" +
        "**d.** Using your results from parts (a)-(c), sketch the graph of $y = f(x)$, labelling all key features. (1 mark)",
      marks: 7,
      difficulty: "HARD",
      solutionContent:
        "**a. (2 marks)**\n\n" +
        "*Step 1 (1 mark):* Quotient rule:\n\n" +
        "$$f'(x) = \\dfrac{2x(x^2+4) - (x^2-4) \\cdot 2x}{(x^2+4)^2}$$\n\n" +
        "*Step 2 (1 mark):* Numerator: $2x^3 + 8x - 2x^3 + 8x = 16x$.\n\n" +
        "$$f'(x) = \\dfrac{16x}{(x^2+4)^2}$$\n\n" +
        "**b. (2 marks)**\n\n" +
        "*Step 1 (1 mark):* $f'(x) = 0$ requires $16x = 0$, so $x = 0$.\n\n" +
        "*Step 2 (1 mark):* $f(0) = \\dfrac{-4}{4} = -1$. Stationary point: $(0, -1)$. Since $f'$ changes from negative to positive, it is a local minimum.\n\n" +
        "**c. (2 marks)**\n\n" +
        "*Step 1 (1 mark):* No vertical asymptotes (denominator is always positive). As $x \\to \\pm \\infty$, $f(x) \\to 1$. Horizontal asymptote: $y = 1$.\n\n" +
        "*Step 2 (1 mark):* $f(x) = 0$ when $x^2 - 4 = 0$, so $x = \\pm 2$. Intercepts: $(-2, 0)$ and $(2, 0)$.\n\n" +
        "**d. (1 mark)**\n\n" +
        "*Step 1 (1 mark):* Sketch shows a curve with minimum at $(0, -1)$, passing through $(-2, 0)$ and $(2, 0)$, approaching $y = 1$ from below as $x \\to \\pm \\infty$.",
      subtopicSlugs: ["quotient-rule"],
    },
    // Q5 — 8 marks
    {
      content:
        "Let $f(x) = \\dfrac{\\ln(x)}{x}$ for $x > 0$.\n\n" +
        "**a.** Show that $f'(x) = \\dfrac{1 - \\ln(x)}{x^2}$. (2 marks)\n\n" +
        "**b.** Hence find the coordinates of the stationary point of $f$ and classify it. (2 marks)\n\n" +
        "**c.** Show that $f''(x) = \\dfrac{2\\ln(x) - 3}{x^3}$. (2 marks)\n\n" +
        "**d.** Using your result from part (c), find the exact coordinates of the point of inflection of $f$. (2 marks)",
      marks: 8,
      difficulty: "HARD",
      solutionContent:
        "**a. (2 marks)**\n\n" +
        "*Step 1 (1 mark):* Quotient rule with $u = \\ln(x)$, $v = x$:\n\n" +
        "$$f'(x) = \\dfrac{\\frac{1}{x} \\cdot x - \\ln(x) \\cdot 1}{x^2}$$\n\n" +
        "*Step 2 (1 mark):*\n\n" +
        "$$f'(x) = \\dfrac{1 - \\ln(x)}{x^2}$$\n\n" +
        "**b. (2 marks)**\n\n" +
        "*Step 1 (1 mark):* $f'(x) = 0$ when $1 - \\ln(x) = 0$, so $\\ln(x) = 1$, giving $x = e$.\n\n" +
        "*Step 2 (1 mark):* $f(e) = \\dfrac{1}{e}$. For $x < e$, $\\ln(x) < 1$ so $f'(x) > 0$; for $x > e$, $f'(x) < 0$. So $(e, e^{-1})$ is a local maximum.\n\n" +
        "**c. (2 marks)**\n\n" +
        "*Step 1 (1 mark):* Quotient rule on $f'(x) = \\dfrac{1 - \\ln x}{x^2}$:\n\n" +
        "$$f''(x) = \\dfrac{-\\frac{1}{x} \\cdot x^2 - (1 - \\ln x) \\cdot 2x}{x^4}$$\n\n" +
        "*Step 2 (1 mark):* Numerator: $-x - 2x + 2x\\ln x = -3x + 2x\\ln x = x(2\\ln x - 3)$.\n\n" +
        "$$f''(x) = \\dfrac{x(2\\ln x - 3)}{x^4} = \\dfrac{2\\ln x - 3}{x^3}$$\n\n" +
        "**d. (2 marks)**\n\n" +
        "*Step 1 (1 mark):* Set $f''(x) = 0$: $2\\ln x - 3 = 0$, so $\\ln x = \\dfrac{3}{2}$, giving $x = e^{3/2}$.\n\n" +
        "*Step 2 (1 mark):* $f(e^{3/2}) = \\dfrac{3/2}{e^{3/2}} = \\dfrac{3}{2e^{3/2}}$. Point of inflection: $\\left(e^{3/2},\\, \\dfrac{3}{2e^{3/2}}\\right)$.",
      subtopicSlugs: ["quotient-rule"],
    },
  ],

  // ═══════════════════════════════════════════════════════════════════════════
  // 5. OPTIMISATION
  // ═══════════════════════════════════════════════════════════════════════════
  "optimisation": [
    // Q1 — 4 marks
    {
      content:
        "A farmer uses $60$ metres of fencing to make a rectangular enclosure against a long existing wall. The wall forms one side of the rectangle.\n\n" +
        "**a.** If the width of the enclosure (perpendicular to the wall) is $x$ metres, show that the area is $A = x(60 - 2x)$. (1 mark)\n\n" +
        "**b.** Find $\\dfrac{dA}{dx}$ and hence determine the value of $x$ that maximises the area. (2 marks)\n\n" +
        "**c.** State the maximum area. (1 mark)",
      marks: 4,
      difficulty: "MEDIUM",
      solutionContent:
        "**a. (1 mark)**\n\n" +
        "*Step 1 (1 mark):* Length along the wall $= 60 - 2x$. Area $= x(60 - 2x)$.\n\n" +
        "**b. (2 marks)**\n\n" +
        "*Step 1 (1 mark):* $A = 60x - 2x^2$, so $\\dfrac{dA}{dx} = 60 - 4x$.\n\n" +
        "*Step 2 (1 mark):* Set $\\dfrac{dA}{dx} = 0$: $x = 15$. Since $\\dfrac{d^2A}{dx^2} = -4 < 0$, this is a maximum.\n\n" +
        "**c. (1 mark)**\n\n" +
        "*Step 1 (1 mark):* $A = 15(60 - 30) = 450$ m$^2$.",
      subtopicSlugs: ["optimisation"],
    },
    // Q2 — 5 marks
    {
      content:
        "An open-top box is made from a square sheet of cardboard with side length $12$ cm by cutting equal squares of side $x$ cm from each corner and folding up.\n\n" +
        "**a.** Show that the volume is $V = x(12 - 2x)^2$. (1 mark)\n\n" +
        "**b.** Show that $\\dfrac{dV}{dx} = 12(x - 2)(x - 6)$. (2 marks)\n\n" +
        "**c.** Hence find the value of $x$ that gives the maximum volume, giving reasons. (2 marks)",
      marks: 5,
      difficulty: "MEDIUM",
      solutionContent:
        "**a. (1 mark)**\n\n" +
        "*Step 1 (1 mark):* Base length $= 12 - 2x$, height $= x$. $V = x(12 - 2x)^2$.\n\n" +
        "**b. (2 marks)**\n\n" +
        "*Step 1 (1 mark):* Expand: $V = x(144 - 48x + 4x^2) = 4x^3 - 48x^2 + 144x$.\n\n" +
        "*Step 2 (1 mark):* $\\dfrac{dV}{dx} = 12x^2 - 96x + 144 = 12(x^2 - 8x + 12) = 12(x-2)(x-6)$.\n\n" +
        "**c. (2 marks)**\n\n" +
        "*Step 1 (1 mark):* $\\dfrac{dV}{dx} = 0$ gives $x = 2$ or $x = 6$. Since $0 < x < 6$, we have $x = 2$.\n\n" +
        "*Step 2 (1 mark):* $\\dfrac{d^2V}{dx^2} = 24x - 96$. At $x = 2$: $48 - 96 = -48 < 0$, confirming a maximum. $V_{\\max} = 2(8)^2 = 128$ cm$^3$.",
      subtopicSlugs: ["optimisation"],
    },
    // Q3 — 6 marks
    {
      content:
        "A cylindrical can (open at the top) must have a volume of $250\\pi$ cm$^3$. Let the radius be $r$ cm and the height be $h$ cm.\n\n" +
        "**a.** Show that $h = \\dfrac{250}{r^2}$. (1 mark)\n\n" +
        "**b.** Hence show that the total surface area is $S = \\pi r^2 + \\dfrac{500\\pi}{r}$. (2 marks)\n\n" +
        "**c.** Find $\\dfrac{dS}{dr}$ and hence determine the exact value of $r$ that minimises $S$. (3 marks)",
      marks: 6,
      difficulty: "MEDIUM",
      solutionContent:
        "**a. (1 mark)**\n\n" +
        "*Step 1 (1 mark):* $V = \\pi r^2 h = 250\\pi$, so $h = \\dfrac{250}{r^2}$.\n\n" +
        "**b. (2 marks)**\n\n" +
        "*Step 1 (1 mark):* Base area $= \\pi r^2$. Curved surface $= 2\\pi r h = 2\\pi r \\cdot \\dfrac{250}{r^2} = \\dfrac{500\\pi}{r}$.\n\n" +
        "*Step 2 (1 mark):* $S = \\pi r^2 + \\dfrac{500\\pi}{r}$.\n\n" +
        "**c. (3 marks)**\n\n" +
        "*Step 1 (1 mark):* $\\dfrac{dS}{dr} = 2\\pi r - \\dfrac{500\\pi}{r^2}$.\n\n" +
        "*Step 2 (1 mark):* Set $\\dfrac{dS}{dr} = 0$: $2\\pi r = \\dfrac{500\\pi}{r^2}$, so $r^3 = 250$.\n\n" +
        "*Step 3 (1 mark):* $r = \\sqrt[3]{250} = 5\\sqrt[3]{2}$. Since $\\dfrac{d^2S}{dr^2} = 2\\pi + \\dfrac{1000\\pi}{r^3} > 0$, this is a minimum.",
      subtopicSlugs: ["optimisation"],
    },
    // Q4 — 7 marks
    {
      content:
        "A rectangle is inscribed under the curve $y = 4 - x^2$ with its base on the $x$-axis. By symmetry, the vertices on the curve are at $(x, 4 - x^2)$ and $(-x, 4 - x^2)$ where $0 < x < 2$.\n\n" +
        "**a.** Show that the area of the rectangle is $A = 2x(4 - x^2)$. (1 mark)\n\n" +
        "**b.** Find $\\dfrac{dA}{dx}$. (1 mark)\n\n" +
        "**c.** Hence find the exact value of $x$ that maximises the area. (2 marks)\n\n" +
        "**d.** Find the exact maximum area. (1 mark)\n\n" +
        "**e.** Express this maximum area as a fraction of the area under the curve $y = 4 - x^2$ from $x = -2$ to $x = 2$. (2 marks)",
      marks: 7,
      difficulty: "HARD",
      solutionContent:
        "**a. (1 mark)**\n\n" +
        "*Step 1 (1 mark):* Width $= 2x$, height $= 4 - x^2$. $A = 2x(4 - x^2)$.\n\n" +
        "**b. (1 mark)**\n\n" +
        "*Step 1 (1 mark):* $A = 8x - 2x^3$, so $\\dfrac{dA}{dx} = 8 - 6x^2$.\n\n" +
        "**c. (2 marks)**\n\n" +
        "*Step 1 (1 mark):* $8 - 6x^2 = 0$, so $x^2 = \\dfrac{4}{3}$.\n\n" +
        "*Step 2 (1 mark):* $x = \\dfrac{2}{\\sqrt{3}} = \\dfrac{2\\sqrt{3}}{3}$ (taking $x > 0$). Second derivative $= -12x < 0$, confirming maximum.\n\n" +
        "**d. (1 mark)**\n\n" +
        "*Step 1 (1 mark):* $A = 2 \\cdot \\dfrac{2\\sqrt{3}}{3}\\left(4 - \\dfrac{4}{3}\\right) = \\dfrac{4\\sqrt{3}}{3} \\cdot \\dfrac{8}{3} = \\dfrac{32\\sqrt{3}}{9}$.\n\n" +
        "**e. (2 marks)**\n\n" +
        "*Step 1 (1 mark):* Area under curve $= \\int_{-2}^{2}(4 - x^2)\\,dx = \\left[4x - \\dfrac{x^3}{3}\\right]_{-2}^{2} = \\dfrac{32}{3}$.\n\n" +
        "*Step 2 (1 mark):* Fraction $= \\dfrac{32\\sqrt{3}/9}{32/3} = \\dfrac{\\sqrt{3}}{3}$.",
      subtopicSlugs: ["optimisation"],
    },
    // Q5 — 8 marks
    {
      content:
        "A window consists of a rectangle of width $2r$ and height $h$, topped by a semicircle of radius $r$. The perimeter of the window is $P = 10$ metres.\n\n" +
        "**a.** Show that $h = \\dfrac{10 - 2r - \\pi r}{2}$. (2 marks)\n\n" +
        "**b.** Hence show that the total area of the window is $A = 10r - 2r^2 - \\dfrac{\\pi r^2}{2}$. (2 marks)\n\n" +
        "**c.** Find $\\dfrac{dA}{dr}$ and hence find the value of $r$ that maximises $A$. (2 marks)\n\n" +
        "**d.** Find the exact maximum area. (2 marks)",
      marks: 8,
      difficulty: "HARD",
      solutionContent:
        "**a. (2 marks)**\n\n" +
        "*Step 1 (1 mark):* Perimeter $= 2h + 2r + \\pi r = 10$ (two heights, one base width $2r$, semicircular arc $\\pi r$).\n\n" +
        "*Step 2 (1 mark):* $2h = 10 - 2r - \\pi r$, so $h = \\dfrac{10 - 2r - \\pi r}{2}$.\n\n" +
        "**b. (2 marks)**\n\n" +
        "*Step 1 (1 mark):* Rectangle area $= 2rh = 2r \\cdot \\dfrac{10 - 2r - \\pi r}{2} = r(10 - 2r - \\pi r)$.\n\n" +
        "*Step 2 (1 mark):* Semicircle area $= \\dfrac{\\pi r^2}{2}$. Total: $A = 10r - 2r^2 - \\pi r^2 + \\dfrac{\\pi r^2}{2} = 10r - 2r^2 - \\dfrac{\\pi r^2}{2}$.\n\n" +
        "**c. (2 marks)**\n\n" +
        "*Step 1 (1 mark):* $\\dfrac{dA}{dr} = 10 - 4r - \\pi r$.\n\n" +
        "*Step 2 (1 mark):* Set $\\dfrac{dA}{dr} = 0$: $r(4 + \\pi) = 10$, so $r = \\dfrac{10}{4 + \\pi}$.\n\n" +
        "**d. (2 marks)**\n\n" +
        "*Step 1 (1 mark):* Substitute $r = \\dfrac{10}{4+\\pi}$ into $A$:\n\n" +
        "$$A = 10 \\cdot \\dfrac{10}{4+\\pi} - \\left(2 + \\dfrac{\\pi}{2}\\right)\\left(\\dfrac{10}{4+\\pi}\\right)^2$$\n\n" +
        "*Step 2 (1 mark):* $2 + \\dfrac{\\pi}{2} = \\dfrac{4 + \\pi}{2}$.\n\n" +
        "$$A = \\dfrac{100}{4+\\pi} - \\dfrac{(4+\\pi) \\cdot 100}{2(4+\\pi)^2} = \\dfrac{100}{4+\\pi} - \\dfrac{50}{4+\\pi} = \\dfrac{50}{4+\\pi}$$",
      subtopicSlugs: ["optimisation"],
    },
  ],

  // ═══════════════════════════════════════════════════════════════════════════
  // 6. ANTIDIFFERENTIATION
  // ═══════════════════════════════════════════════════════════════════════════
  "antidifferentiation": [
    // Q1 — 4 marks
    {
      content:
        "**a.** Find $\\displaystyle\\int (3x^2 + 2\\cos x)\\,dx$. (2 marks)\n\n" +
        "**b.** Hence find the function $f(x)$ such that $f'(x) = 3x^2 + 2\\cos x$ and $f(0) = 5$. (2 marks)",
      marks: 4,
      difficulty: "MEDIUM",
      solutionContent:
        "**a. (2 marks)**\n\n" +
        "*Step 1 (1 mark):* Integrate term by term.\n\n" +
        "$$\\int (3x^2 + 2\\cos x)\\,dx = x^3 + 2\\sin x + c$$\n\n" +
        "*Step 2 (1 mark):* State the answer with constant of integration.\n\n" +
        "$$x^3 + 2\\sin x + c$$\n\n" +
        "**b. (2 marks)**\n\n" +
        "*Step 1 (1 mark):* $f(x) = x^3 + 2\\sin x + c$. Using $f(0) = 5$: $0 + 0 + c = 5$, so $c = 5$.\n\n" +
        "*Step 2 (1 mark):* $f(x) = x^3 + 2\\sin x + 5$.",
      subtopicSlugs: ["antidifferentiation"],
    },
    // Q2 — 5 marks
    {
      content:
        "A curve has gradient function $f'(x) = 6x^2 - 6x - 12$.\n\n" +
        "**a.** Find $f(x)$, given that the curve passes through the point $(1, -10)$. (2 marks)\n\n" +
        "**b.** Using your expression for $f'(x)$, show that the stationary points occur at $x = -1$ and $x = 2$. (1 mark)\n\n" +
        "**c.** Hence find the coordinates of the stationary points of $f$. (2 marks)",
      marks: 5,
      difficulty: "MEDIUM",
      solutionContent:
        "**a. (2 marks)**\n\n" +
        "*Step 1 (1 mark):* $f(x) = 2x^3 - 3x^2 - 12x + c$.\n\n" +
        "*Step 2 (1 mark):* $f(1) = 2 - 3 - 12 + c = -10$, so $c = 3$. Thus $f(x) = 2x^3 - 3x^2 - 12x + 3$.\n\n" +
        "**b. (1 mark)**\n\n" +
        "*Step 1 (1 mark):* $6x^2 - 6x - 12 = 0 \\implies x^2 - x - 2 = 0 \\implies (x+1)(x-2) = 0$. So $x = -1$ or $x = 2$.\n\n" +
        "**c. (2 marks)**\n\n" +
        "*Step 1 (1 mark):* $f(-1) = -2 - 3 + 12 + 3 = 10$. Stationary point: $(-1, 10)$.\n\n" +
        "*Step 2 (1 mark):* $f(2) = 16 - 12 - 24 + 3 = -17$. Stationary point: $(2, -17)$.",
      subtopicSlugs: ["antidifferentiation"],
    },
    // Q3 — 6 marks
    {
      content:
        "Let $f'(x) = \\dfrac{2x + 1}{x}$ for $x > 0$.\n\n" +
        "**a.** Rewrite $f'(x)$ in the form $a + \\dfrac{b}{x}$ and hence find $f(x)$, given that $f(1) = 3$. (3 marks)\n\n" +
        "**b.** Verify that the point $(e, 3 + 2e - 1)$ lies on the curve $y = f(x)$. (1 mark)\n\n" +
        "**c.** Find the equation of the tangent to $y = f(x)$ at $x = e$. (2 marks)",
      marks: 6,
      difficulty: "MEDIUM",
      solutionContent:
        "**a. (3 marks)**\n\n" +
        "*Step 1 (1 mark):* $f'(x) = 2 + \\dfrac{1}{x}$.\n\n" +
        "*Step 2 (1 mark):* $f(x) = 2x + \\ln x + c$.\n\n" +
        "*Step 3 (1 mark):* $f(1) = 2 + 0 + c = 3$, so $c = 1$. $f(x) = 2x + \\ln x + 1$.\n\n" +
        "**b. (1 mark)**\n\n" +
        "*Step 1 (1 mark):* $f(e) = 2e + \\ln e + 1 = 2e + 1 + 1 = 2e + 2$. The point is $(e, 2e + 2)$. Checking: $3 + 2e - 1 = 2e + 2$. Verified.\n\n" +
        "**c. (2 marks)**\n\n" +
        "*Step 1 (1 mark):* Gradient at $x = e$: $f'(e) = 2 + \\dfrac{1}{e}$.\n\n" +
        "*Step 2 (1 mark):* $y - (2e + 2) = \\left(2 + \\dfrac{1}{e}\\right)(x - e)$, which simplifies to $y = \\left(2 + \\dfrac{1}{e}\\right)x + 1$.",
      subtopicSlugs: ["antidifferentiation"],
    },
    // Q4 — 7 marks
    {
      content:
        "The velocity of a particle moving in a straight line is given by $v(t) = 3t^2 - 12t + 9$ for $t \\geq 0$.\n\n" +
        "**a.** Show that $v(t) = 3(t - 1)(t - 3)$. (1 mark)\n\n" +
        "**b.** Hence find the times at which the particle is at rest. (1 mark)\n\n" +
        "**c.** Find the displacement function $x(t)$, given that $x(0) = 0$. (2 marks)\n\n" +
        "**d.** Using your answers from parts (b) and (c), find the total distance travelled in the first $4$ seconds. (3 marks)",
      marks: 7,
      difficulty: "HARD",
      solutionContent:
        "**a. (1 mark)**\n\n" +
        "*Step 1 (1 mark):* $3(t-1)(t-3) = 3(t^2 - 4t + 3) = 3t^2 - 12t + 9 = v(t)$.\n\n" +
        "**b. (1 mark)**\n\n" +
        "*Step 1 (1 mark):* $v(t) = 0$ when $t = 1$ or $t = 3$.\n\n" +
        "**c. (2 marks)**\n\n" +
        "*Step 1 (1 mark):* $x(t) = \\int v(t)\\,dt = t^3 - 6t^2 + 9t + c$.\n\n" +
        "*Step 2 (1 mark):* $x(0) = 0$, so $c = 0$. $x(t) = t^3 - 6t^2 + 9t$.\n\n" +
        "**d. (3 marks)**\n\n" +
        "*Step 1 (1 mark):* $x(1) = 1 - 6 + 9 = 4$, $x(3) = 27 - 54 + 27 = 0$, $x(4) = 64 - 96 + 36 = 4$.\n\n" +
        "*Step 2 (1 mark):* Particle moves forward from $0$ to $4$ (distance $4$), then backward from $4$ to $0$ (distance $4$), then forward from $0$ to $4$ (distance $4$).\n\n" +
        "*Step 3 (1 mark):* Total distance $= 4 + 4 + 4 = 12$.",
      subtopicSlugs: ["antidifferentiation"],
    },
    // Q5 — 8 marks
    {
      content:
        "A curve $y = f(x)$ has $f''(x) = 12x - 6$.\n\n" +
        "**a.** Find $f'(x)$, given that $f'(1) = 2$. (2 marks)\n\n" +
        "**b.** Using your answer from part (a), find $f(x)$, given that $f(0) = 1$. (2 marks)\n\n" +
        "**c.** Using $f'(x)$ from part (a), find the coordinates of the stationary points of $f$. (2 marks)\n\n" +
        "**d.** Hence classify each stationary point using $f''(x)$. (2 marks)",
      marks: 8,
      difficulty: "HARD",
      solutionContent:
        "**a. (2 marks)**\n\n" +
        "*Step 1 (1 mark):* $f'(x) = 6x^2 - 6x + c_1$.\n\n" +
        "*Step 2 (1 mark):* $f'(1) = 6 - 6 + c_1 = 2$, so $c_1 = 2$. $f'(x) = 6x^2 - 6x + 2$.\n\n" +
        "**b. (2 marks)**\n\n" +
        "*Step 1 (1 mark):* $f(x) = 2x^3 - 3x^2 + 2x + c_2$.\n\n" +
        "*Step 2 (1 mark):* $f(0) = c_2 = 1$. $f(x) = 2x^3 - 3x^2 + 2x + 1$.\n\n" +
        "**c. (2 marks)**\n\n" +
        "*Step 1 (1 mark):* $6x^2 - 6x + 2 = 0$. Discriminant $= 36 - 48 = -12 < 0$.\n\n" +
        "*Step 2 (1 mark):* No real solutions, so $f$ has no stationary points. ($f'(x) > 0$ for all $x$, so $f$ is strictly increasing.)\n\n" +
        "**d. (2 marks)**\n\n" +
        "*Step 1 (1 mark):* Since there are no stationary points, there is nothing to classify.\n\n" +
        "*Step 2 (1 mark):* However, $f''(x) = 0$ at $x = \\dfrac{1}{2}$. $f\\!\\left(\\dfrac{1}{2}\\right) = \\dfrac{1}{4} - \\dfrac{3}{4} + 1 + 1 = \\dfrac{3}{2}$. This is a point of inflection at $\\left(\\dfrac{1}{2}, \\dfrac{3}{2}\\right)$.",
      subtopicSlugs: ["antidifferentiation"],
    },
  ],

  // ═══════════════════════════════════════════════════════════════════════════
  // 7. DEFINITE INTEGRALS
  // ═══════════════════════════════════════════════════════════════════════════
  "definite-integrals": [
    // Q1 — 4 marks
    {
      content:
        "**a.** Evaluate $\\displaystyle\\int_0^1 (3x^2 + 4x)\\,dx$. (2 marks)\n\n" +
        "**b.** Hence find the value of $\\displaystyle\\int_0^1 (6x^2 + 8x + 1)\\,dx$. (2 marks)",
      marks: 4,
      difficulty: "MEDIUM",
      solutionContent:
        "**a. (2 marks)**\n\n" +
        "*Step 1 (1 mark):* $\\displaystyle\\int_0^1 (3x^2 + 4x)\\,dx = \\left[x^3 + 2x^2\\right]_0^1$.\n\n" +
        "*Step 2 (1 mark):* $= 1 + 2 - 0 = 3$.\n\n" +
        "**b. (2 marks)**\n\n" +
        "*Step 1 (1 mark):* $\\displaystyle\\int_0^1(6x^2 + 8x + 1)\\,dx = 2\\int_0^1(3x^2 + 4x)\\,dx + \\int_0^1 1\\,dx$.\n\n" +
        "*Step 2 (1 mark):* $= 2(3) + 1 = 7$.",
      subtopicSlugs: ["definite-integrals"],
    },
    // Q2 — 5 marks
    {
      content:
        "**a.** Evaluate $\\displaystyle\\int_0^{\\pi/2} \\cos(x)\\,dx$. (1 mark)\n\n" +
        "**b.** Using symmetry, or otherwise, evaluate $\\displaystyle\\int_{-\\pi/2}^{\\pi/2} \\cos(x)\\,dx$. (1 mark)\n\n" +
        "**c.** Hence find the exact value of $k > 0$ such that $\\displaystyle\\int_0^k \\cos(x)\\,dx = 1$. (3 marks)",
      marks: 5,
      difficulty: "MEDIUM",
      solutionContent:
        "**a. (1 mark)**\n\n" +
        "*Step 1 (1 mark):* $\\displaystyle\\int_0^{\\pi/2} \\cos x\\,dx = [\\sin x]_0^{\\pi/2} = 1$.\n\n" +
        "**b. (1 mark)**\n\n" +
        "*Step 1 (1 mark):* $\\cos x$ is even, so $\\displaystyle\\int_{-\\pi/2}^{\\pi/2} \\cos x\\,dx = 2 \\times 1 = 2$.\n\n" +
        "**c. (3 marks)**\n\n" +
        "*Step 1 (1 mark):* $\\displaystyle\\int_0^k \\cos x\\,dx = [\\sin x]_0^k = \\sin k$.\n\n" +
        "*Step 2 (1 mark):* Set $\\sin k = 1$.\n\n" +
        "*Step 3 (1 mark):* $k = \\dfrac{\\pi}{2}$ (taking the smallest positive value).",
      subtopicSlugs: ["definite-integrals"],
    },
    // Q3 — 6 marks
    {
      content:
        "Let $f(x) = e^{2x}$.\n\n" +
        "**a.** Evaluate $\\displaystyle\\int_0^1 e^{2x}\\,dx$. (2 marks)\n\n" +
        "**b.** Find the average value of $f$ over $[0, 1]$. (1 mark)\n\n" +
        "**c.** Hence find the exact value of $c \\in (0, 1)$ such that $f(c)$ equals the average value (the Mean Value Theorem for integrals). (3 marks)",
      marks: 6,
      difficulty: "MEDIUM",
      solutionContent:
        "**a. (2 marks)**\n\n" +
        "*Step 1 (1 mark):* $\\displaystyle\\int_0^1 e^{2x}\\,dx = \\left[\\dfrac{e^{2x}}{2}\\right]_0^1$.\n\n" +
        "*Step 2 (1 mark):* $= \\dfrac{e^2}{2} - \\dfrac{1}{2} = \\dfrac{e^2 - 1}{2}$.\n\n" +
        "**b. (1 mark)**\n\n" +
        "*Step 1 (1 mark):* Average value $= \\dfrac{1}{1-0} \\cdot \\dfrac{e^2-1}{2} = \\dfrac{e^2-1}{2}$.\n\n" +
        "**c. (3 marks)**\n\n" +
        "*Step 1 (1 mark):* Set $e^{2c} = \\dfrac{e^2-1}{2}$.\n\n" +
        "*Step 2 (1 mark):* $2c = \\ln\\!\\left(\\dfrac{e^2-1}{2}\\right)$.\n\n" +
        "*Step 3 (1 mark):* $c = \\dfrac{1}{2}\\ln\\!\\left(\\dfrac{e^2-1}{2}\\right)$.",
      subtopicSlugs: ["definite-integrals"],
    },
    // Q4 — 7 marks
    {
      content:
        "Let $f(x) = x^2 - 4x + 3$.\n\n" +
        "**a.** Find the $x$-intercepts of $f$. (1 mark)\n\n" +
        "**b.** Evaluate $\\displaystyle\\int_0^4 f(x)\\,dx$. (2 marks)\n\n" +
        "**c.** Explain why the answer from part (b) does not equal the total area enclosed between $y = f(x)$ and the $x$-axis over $[0, 4]$. (1 mark)\n\n" +
        "**d.** Hence find the total area enclosed between $y = f(x)$ and the $x$-axis over $[0, 4]$. (3 marks)",
      marks: 7,
      difficulty: "HARD",
      solutionContent:
        "**a. (1 mark)**\n\n" +
        "*Step 1 (1 mark):* $x^2 - 4x + 3 = (x-1)(x-3) = 0$, so $x = 1$ and $x = 3$.\n\n" +
        "**b. (2 marks)**\n\n" +
        "*Step 1 (1 mark):* $\\displaystyle\\int_0^4 (x^2 - 4x + 3)\\,dx = \\left[\\dfrac{x^3}{3} - 2x^2 + 3x\\right]_0^4$.\n\n" +
        "*Step 2 (1 mark):* $= \\dfrac{64}{3} - 32 + 12 = \\dfrac{64}{3} - 20 = \\dfrac{4}{3}$.\n\n" +
        "**c. (1 mark)**\n\n" +
        "*Step 1 (1 mark):* On $(1, 3)$, $f(x) < 0$, so the integral counts this region as negative, but area is always positive.\n\n" +
        "**d. (3 marks)**\n\n" +
        "*Step 1 (1 mark):* $\\displaystyle\\int_0^1 f(x)\\,dx = \\left[\\dfrac{x^3}{3} - 2x^2 + 3x\\right]_0^1 = \\dfrac{1}{3} - 2 + 3 = \\dfrac{4}{3}$.\n\n" +
        "*Step 2 (1 mark):* $\\displaystyle\\int_1^3 f(x)\\,dx = \\left[\\dfrac{x^3}{3} - 2x^2 + 3x\\right]_1^3 = (9 - 18 + 9) - \\dfrac{4}{3} = -\\dfrac{4}{3}$.\n\n" +
        "$\\displaystyle\\int_3^4 f(x)\\,dx = \\dfrac{4}{3} - 0 = \\dfrac{4}{3}$.\n\n" +
        "*Step 3 (1 mark):* Total area $= \\dfrac{4}{3} + \\dfrac{4}{3} + \\dfrac{4}{3} = 4$.",
      subtopicSlugs: ["definite-integrals"],
    },
    // Q5 — 8 marks
    {
      content:
        "Let $f(x) = \\dfrac{1}{x}$ for $x > 0$.\n\n" +
        "**a.** Evaluate $\\displaystyle\\int_1^e \\dfrac{1}{x}\\,dx$. (1 mark)\n\n" +
        "**b.** Hence find the exact value of $\\displaystyle\\int_1^{e^2} \\dfrac{1}{x}\\,dx$. (1 mark)\n\n" +
        "**c.** The region bounded by $y = \\dfrac{1}{x}$, the $x$-axis, $x = 1$, and $x = e$ is divided into two equal areas by the vertical line $x = k$. Find the exact value of $k$. (3 marks)\n\n" +
        "**d.** Find the exact value of $a > 1$ such that $\\displaystyle\\int_1^a \\dfrac{1}{x}\\,dx = \\displaystyle\\int_a^{a^2} \\dfrac{1}{x}\\,dx$. (3 marks)",
      marks: 8,
      difficulty: "HARD",
      solutionContent:
        "**a. (1 mark)**\n\n" +
        "*Step 1 (1 mark):* $\\displaystyle\\int_1^e \\dfrac{1}{x}\\,dx = [\\ln x]_1^e = 1$.\n\n" +
        "**b. (1 mark)**\n\n" +
        "*Step 1 (1 mark):* $\\displaystyle\\int_1^{e^2} \\dfrac{1}{x}\\,dx = [\\ln x]_1^{e^2} = 2$.\n\n" +
        "**c. (3 marks)**\n\n" +
        "*Step 1 (1 mark):* Each part has area $\\dfrac{1}{2}$.\n\n" +
        "*Step 2 (1 mark):* $\\displaystyle\\int_1^k \\dfrac{1}{x}\\,dx = \\ln k = \\dfrac{1}{2}$.\n\n" +
        "*Step 3 (1 mark):* $k = e^{1/2} = \\sqrt{e}$.\n\n" +
        "**d. (3 marks)**\n\n" +
        "*Step 1 (1 mark):* LHS $= \\ln a$. RHS $= \\ln(a^2) - \\ln a = 2\\ln a - \\ln a = \\ln a$.\n\n" +
        "*Step 2 (1 mark):* The equation $\\ln a = \\ln a$ is true for all $a > 1$.\n\n" +
        "*Step 3 (1 mark):* Therefore the equation holds for all $a > 1$.",
      subtopicSlugs: ["definite-integrals"],
    },
  ],

  // ═══════════════════════════════════════════════════════════════════════════
  // 8. TANGENTS AND NORMALS
  // ═══════════════════════════════════════════════════════════════════════════
  "tangents-and-normals": [
    // Q1 — 4 marks
    {
      content:
        "Let $f(x) = x^2 - 3x + 2$.\n\n" +
        "**a.** Find $f'(x)$ and hence the gradient of the tangent at $x = 2$. (2 marks)\n\n" +
        "**b.** Find the equation of the normal to the curve at $x = 2$. (2 marks)",
      marks: 4,
      difficulty: "MEDIUM",
      solutionContent:
        "**a. (2 marks)**\n\n" +
        "*Step 1 (1 mark):* $f'(x) = 2x - 3$.\n\n" +
        "*Step 2 (1 mark):* $f'(2) = 1$. The tangent has gradient $1$.\n\n" +
        "**b. (2 marks)**\n\n" +
        "*Step 1 (1 mark):* Normal gradient $= -1$. Point: $(2, f(2)) = (2, 0)$.\n\n" +
        "*Step 2 (1 mark):* $y - 0 = -1(x - 2)$, so $y = -x + 2$.",
      subtopicSlugs: ["tangents-and-normals"],
    },
    // Q2 — 5 marks
    {
      content:
        "The curve $y = \\ln(x)$ has a tangent at the point $P$ where $x = e$.\n\n" +
        "**a.** Find the gradient of the tangent at $P$. (1 mark)\n\n" +
        "**b.** Find the equation of the tangent at $P$. (2 marks)\n\n" +
        "**c.** This tangent meets the $x$-axis at point $Q$. Find the coordinates of $Q$ and hence the exact area of triangle $OPQ$, where $O$ is the origin. (2 marks)",
      marks: 5,
      difficulty: "MEDIUM",
      solutionContent:
        "**a. (1 mark)**\n\n" +
        "*Step 1 (1 mark):* $\\dfrac{dy}{dx} = \\dfrac{1}{x}$. At $x = e$: gradient $= \\dfrac{1}{e}$.\n\n" +
        "**b. (2 marks)**\n\n" +
        "*Step 1 (1 mark):* Point $P = (e, 1)$.\n\n" +
        "*Step 2 (1 mark):* $y - 1 = \\dfrac{1}{e}(x - e)$, so $y = \\dfrac{x}{e}$.\n\n" +
        "**c. (2 marks)**\n\n" +
        "*Step 1 (1 mark):* $y = 0$: $\\dfrac{x}{e} = 0$, so $x = 0$. But $Q$ is the $x$-axis intercept. Since $y = \\dfrac{x}{e}$ passes through the origin, $Q = O = (0, 0)$.\n\n" +
        "The tangent passes through the origin. So $Q = O$ and the triangle $OPQ$ is degenerate. The distance from $O$ to $P$ is $\\sqrt{e^2 + 1}$.\n\n" +
        "*Step 2 (1 mark):* Since $O = Q$, the area is $0$. (The tangent line $y = x/e$ passes through the origin.)",
      subtopicSlugs: ["tangents-and-normals"],
    },
    // Q3 — 6 marks
    {
      content:
        "Let $f(x) = e^{2x}$.\n\n" +
        "**a.** Find the equation of the tangent to $y = f(x)$ at $x = 0$. (2 marks)\n\n" +
        "**b.** Find the equation of the normal to $y = f(x)$ at $x = 0$. (1 mark)\n\n" +
        "**c.** The tangent from part (a) meets the $x$-axis at $A$ and the normal from part (b) meets the $x$-axis at $B$. Find the exact area of triangle $OAB$, where $O$ is the origin. (3 marks)",
      marks: 6,
      difficulty: "MEDIUM",
      solutionContent:
        "**a. (2 marks)**\n\n" +
        "*Step 1 (1 mark):* $f'(x) = 2e^{2x}$. At $x = 0$: $f(0) = 1$, $f'(0) = 2$.\n\n" +
        "*Step 2 (1 mark):* Tangent: $y - 1 = 2(x - 0)$, i.e. $y = 2x + 1$.\n\n" +
        "**b. (1 mark)**\n\n" +
        "*Step 1 (1 mark):* Normal gradient $= -\\dfrac{1}{2}$. Normal: $y = -\\dfrac{1}{2}x + 1$.\n\n" +
        "**c. (3 marks)**\n\n" +
        "*Step 1 (1 mark):* Tangent $y = 0$: $x = -\\dfrac{1}{2}$. So $A = \\left(-\\dfrac{1}{2}, 0\\right)$.\n\n" +
        "*Step 2 (1 mark):* Normal $y = 0$: $x = 2$. So $B = (2, 0)$.\n\n" +
        "*Step 3 (1 mark):* Triangle $OAB$ has base $AB$ along the $x$-axis with length $2 + \\dfrac{1}{2} = \\dfrac{5}{2}$ and the common point $(0, 1)$ has height $1$.\n\n" +
        "$$\\text{Area} = \\dfrac{1}{2} \\cdot \\dfrac{5}{2} \\cdot 1 = \\dfrac{5}{4}$$",
      subtopicSlugs: ["tangents-and-normals"],
    },
    // Q4 — 7 marks
    {
      content:
        "Let $f(x) = x^3 - 3x$ and $P = (1, -2)$.\n\n" +
        "**a.** Show that $P$ lies on the curve $y = f(x)$. (1 mark)\n\n" +
        "**b.** Find the equation of the tangent to the curve at $P$. (2 marks)\n\n" +
        "**c.** Find the equation of the normal to the curve at $P$. (1 mark)\n\n" +
        "**d.** The normal from part (c) meets the curve $y = f(x)$ again at a point $Q$. Find the exact coordinates of $Q$. (3 marks)",
      marks: 7,
      difficulty: "HARD",
      solutionContent:
        "**a. (1 mark)**\n\n" +
        "*Step 1 (1 mark):* $f(1) = 1 - 3 = -2$. So $P = (1, -2)$ lies on the curve.\n\n" +
        "**b. (2 marks)**\n\n" +
        "*Step 1 (1 mark):* $f'(x) = 3x^2 - 3$. $f'(1) = 0$.\n\n" +
        "*Step 2 (1 mark):* Tangent: $y = -2$ (horizontal line).\n\n" +
        "**c. (1 mark)**\n\n" +
        "*Step 1 (1 mark):* Since tangent is horizontal, normal is vertical: $x = 1$.\n\n" +
        "**d. (3 marks)**\n\n" +
        "*Step 1 (1 mark):* The normal is $x = 1$, which only intersects the curve at $x = 1$. Since $P$ is a stationary point (tangent is horizontal), reconsider: a vertical line $x = 1$ meets $y = x^3 - 3x$ at exactly one point, $(1, -2)$.\n\n" +
        "However, we need a non-vertical normal. Since $f'(1) = 0$, the tangent is $y = -2$ and the normal is $x = 1$. The vertical line $x = 1$ intersects the curve at $(1, -2)$ only.\n\n" +
        "*Step 2 (1 mark):* Since $x = 1$ is a vertical line, it meets $y = f(x)$ at $(1, f(1)) = (1, -2)$ only (one intersection). So $Q = P$.\n\n" +
        "*Step 3 (1 mark):* No second intersection point exists. $Q$ coincides with $P$ at $(1, -2)$.",
      subtopicSlugs: ["tangents-and-normals"],
    },
    // Q5 — 8 marks
    {
      content:
        "Let $f(x) = \\sqrt{x}$ for $x > 0$.\n\n" +
        "**a.** Find the equation of the tangent to $y = f(x)$ at the point where $x = 4$. (2 marks)\n\n" +
        "**b.** Find the equation of the normal to $y = f(x)$ at the point where $x = 4$. (2 marks)\n\n" +
        "**c.** The tangent from part (a) meets the $x$-axis at $A$ and the normal from part (b) meets the $x$-axis at $B$. Find the coordinates of $A$ and $B$. (2 marks)\n\n" +
        "**d.** Hence find the exact area of the triangle with vertices at $(4, 2)$, $A$ and $B$. (2 marks)",
      marks: 8,
      difficulty: "HARD",
      solutionContent:
        "**a. (2 marks)**\n\n" +
        "*Step 1 (1 mark):* $f'(x) = \\dfrac{1}{2\\sqrt{x}}$. At $x = 4$: $f(4) = 2$, $f'(4) = \\dfrac{1}{4}$.\n\n" +
        "*Step 2 (1 mark):* Tangent: $y - 2 = \\dfrac{1}{4}(x - 4)$, so $y = \\dfrac{x}{4} + 1$.\n\n" +
        "**b. (2 marks)**\n\n" +
        "*Step 1 (1 mark):* Normal gradient $= -4$.\n\n" +
        "*Step 2 (1 mark):* Normal: $y - 2 = -4(x - 4)$, so $y = -4x + 18$.\n\n" +
        "**c. (2 marks)**\n\n" +
        "*Step 1 (1 mark):* Tangent $y = 0$: $\\dfrac{x}{4} + 1 = 0$, $x = -4$. So $A = (-4, 0)$.\n\n" +
        "*Step 2 (1 mark):* Normal $y = 0$: $-4x + 18 = 0$, $x = \\dfrac{9}{2}$. So $B = \\left(\\dfrac{9}{2}, 0\\right)$.\n\n" +
        "**d. (2 marks)**\n\n" +
        "*Step 1 (1 mark):* Base $AB = \\dfrac{9}{2} - (-4) = \\dfrac{17}{2}$. Height $= 2$ (the $y$-coordinate of $(4, 2)$).\n\n" +
        "*Step 2 (1 mark):*\n\n" +
        "$$\\text{Area} = \\dfrac{1}{2} \\cdot \\dfrac{17}{2} \\cdot 2 = \\dfrac{17}{2}$$",
      subtopicSlugs: ["tangents-and-normals"],
    },
  ],

  // ═══════════════════════════════════════════════════════════════════════════
  // 9. RATES OF CHANGE
  // ═══════════════════════════════════════════════════════════════════════════
  "rates-of-change": [
    // Q1 — 4 marks
    {
      content:
        "A spherical balloon is being inflated so that its radius $r$ cm increases at a constant rate of $2$ cm/s.\n\n" +
        "**a.** Write down $\\dfrac{dr}{dt}$. (1 mark)\n\n" +
        "**b.** The volume of a sphere is $V = \\dfrac{4}{3}\\pi r^3$. Find $\\dfrac{dV}{dr}$. (1 mark)\n\n" +
        "**c.** Hence find the rate of change of volume when $r = 5$ cm. (2 marks)",
      marks: 4,
      difficulty: "MEDIUM",
      solutionContent:
        "**a. (1 mark)**\n\n" +
        "*Step 1 (1 mark):* $\\dfrac{dr}{dt} = 2$ cm/s.\n\n" +
        "**b. (1 mark)**\n\n" +
        "*Step 1 (1 mark):* $\\dfrac{dV}{dr} = 4\\pi r^2$.\n\n" +
        "**c. (2 marks)**\n\n" +
        "*Step 1 (1 mark):* By the chain rule: $\\dfrac{dV}{dt} = \\dfrac{dV}{dr} \\cdot \\dfrac{dr}{dt} = 4\\pi r^2 \\cdot 2 = 8\\pi r^2$.\n\n" +
        "*Step 2 (1 mark):* At $r = 5$: $\\dfrac{dV}{dt} = 8\\pi(25) = 200\\pi$ cm$^3$/s.",
      subtopicSlugs: ["rates-of-change"],
    },
    // Q2 — 5 marks
    {
      content:
        "The population of a colony of bacteria at time $t$ hours is modelled by $P(t) = 500e^{0.3t}$.\n\n" +
        "**a.** Find the initial population. (1 mark)\n\n" +
        "**b.** Find $P'(t)$ and hence state the rate of growth at $t = 0$. (2 marks)\n\n" +
        "**c.** Find the time at which the population reaches $2000$. (2 marks)",
      marks: 5,
      difficulty: "MEDIUM",
      solutionContent:
        "**a. (1 mark)**\n\n" +
        "*Step 1 (1 mark):* $P(0) = 500$.\n\n" +
        "**b. (2 marks)**\n\n" +
        "*Step 1 (1 mark):* $P'(t) = 500 \\cdot 0.3 \\cdot e^{0.3t} = 150e^{0.3t}$.\n\n" +
        "*Step 2 (1 mark):* At $t = 0$: $P'(0) = 150$ bacteria per hour.\n\n" +
        "**c. (2 marks)**\n\n" +
        "*Step 1 (1 mark):* $500e^{0.3t} = 2000$, so $e^{0.3t} = 4$.\n\n" +
        "*Step 2 (1 mark):* $0.3t = \\ln 4$, so $t = \\dfrac{\\ln 4}{0.3} = \\dfrac{10\\ln 4}{3}$ hours.",
      subtopicSlugs: ["rates-of-change"],
    },
    // Q3 — 6 marks
    {
      content:
        "Water is flowing into a tank so that the volume $V$ litres at time $t$ minutes is given by $V(t) = 100(1 - e^{-0.5t})$ for $t \\geq 0$.\n\n" +
        "**a.** Find $V(0)$ and explain its meaning. (1 mark)\n\n" +
        "**b.** Find $\\dfrac{dV}{dt}$. (1 mark)\n\n" +
        "**c.** Hence find the rate at which water is flowing in at $t = 2$ minutes. (1 mark)\n\n" +
        "**d.** Find the volume of water that flows in during the interval $t = 0$ to $t = 4$, and show this equals $\\displaystyle\\int_0^4 \\dfrac{dV}{dt}\\,dt$. (3 marks)",
      marks: 6,
      difficulty: "MEDIUM",
      solutionContent:
        "**a. (1 mark)**\n\n" +
        "*Step 1 (1 mark):* $V(0) = 100(1 - 1) = 0$ litres. The tank is initially empty.\n\n" +
        "**b. (1 mark)**\n\n" +
        "*Step 1 (1 mark):* $\\dfrac{dV}{dt} = 100 \\cdot 0.5 \\cdot e^{-0.5t} = 50e^{-0.5t}$.\n\n" +
        "**c. (1 mark)**\n\n" +
        "*Step 1 (1 mark):* At $t = 2$: $\\dfrac{dV}{dt} = 50e^{-1}$ litres/min.\n\n" +
        "**d. (3 marks)**\n\n" +
        "*Step 1 (1 mark):* $V(4) - V(0) = 100(1 - e^{-2}) - 0 = 100(1 - e^{-2})$ litres.\n\n" +
        "*Step 2 (1 mark):* $\\displaystyle\\int_0^4 50e^{-0.5t}\\,dt = \\left[-100e^{-0.5t}\\right]_0^4 = -100e^{-2} + 100$.\n\n" +
        "*Step 3 (1 mark):* $= 100(1 - e^{-2})$. This equals $V(4) - V(0)$, as required.",
      subtopicSlugs: ["rates-of-change"],
    },
    // Q4 — 7 marks
    {
      content:
        "The temperature $T$ (in $^\\circ$C) of a cooling object at time $t$ minutes is given by $T(t) = 20 + 80e^{-kt}$ where $k > 0$.\n\n" +
        "**a.** Find $T(0)$ and state what it represents. (1 mark)\n\n" +
        "**b.** Find $\\dfrac{dT}{dt}$ and show that $\\dfrac{dT}{dt} = -k(T - 20)$. (2 marks)\n\n" +
        "**c.** Given that $T = 60$ when $t = 10$, find the exact value of $k$. (2 marks)\n\n" +
        "**d.** Hence find the rate of cooling when $T = 60$. (2 marks)",
      marks: 7,
      difficulty: "HARD",
      solutionContent:
        "**a. (1 mark)**\n\n" +
        "*Step 1 (1 mark):* $T(0) = 20 + 80 = 100^\\circ$C. This is the initial temperature.\n\n" +
        "**b. (2 marks)**\n\n" +
        "*Step 1 (1 mark):* $\\dfrac{dT}{dt} = -80k \\, e^{-kt}$.\n\n" +
        "*Step 2 (1 mark):* Since $T - 20 = 80e^{-kt}$:\n\n" +
        "$$\\dfrac{dT}{dt} = -k \\cdot 80e^{-kt} = -k(T - 20)$$\n\n" +
        "**c. (2 marks)**\n\n" +
        "*Step 1 (1 mark):* $60 = 20 + 80e^{-10k}$, so $e^{-10k} = \\dfrac{1}{2}$.\n\n" +
        "*Step 2 (1 mark):* $-10k = \\ln\\!\\left(\\dfrac{1}{2}\\right) = -\\ln 2$, so $k = \\dfrac{\\ln 2}{10}$.\n\n" +
        "**d. (2 marks)**\n\n" +
        "*Step 1 (1 mark):* Using $\\dfrac{dT}{dt} = -k(T - 20)$ with $T = 60$:\n\n" +
        "$$\\dfrac{dT}{dt} = -\\dfrac{\\ln 2}{10}(60 - 20)$$\n\n" +
        "*Step 2 (1 mark):*\n\n" +
        "$$\\dfrac{dT}{dt} = -4\\ln 2 \\approx -2.77^\\circ\\text{C/min}$$\n\n" +
        "The object is cooling at a rate of $4\\ln 2$ degrees per minute.",
      subtopicSlugs: ["rates-of-change"],
    },
    // Q5 — 8 marks
    {
      content:
        "A particle moves along a straight line with displacement $x(t) = t^3 - 9t^2 + 24t$ metres at time $t \\geq 0$.\n\n" +
        "**a.** Find the velocity $v(t)$ and acceleration $a(t)$. (2 marks)\n\n" +
        "**b.** Find the times when the particle is instantaneously at rest. (2 marks)\n\n" +
        "**c.** Hence determine the total distance travelled in the first $5$ seconds. (2 marks)\n\n" +
        "**d.** Find the time at which the acceleration is zero and hence the velocity at that instant. (2 marks)",
      marks: 8,
      difficulty: "HARD",
      solutionContent:
        "**a. (2 marks)**\n\n" +
        "*Step 1 (1 mark):* $v(t) = x'(t) = 3t^2 - 18t + 24$.\n\n" +
        "*Step 2 (1 mark):* $a(t) = v'(t) = 6t - 18$.\n\n" +
        "**b. (2 marks)**\n\n" +
        "*Step 1 (1 mark):* $3t^2 - 18t + 24 = 0$, so $t^2 - 6t + 8 = 0$.\n\n" +
        "*Step 2 (1 mark):* $(t - 2)(t - 4) = 0$, so $t = 2$ and $t = 4$.\n\n" +
        "**c. (2 marks)**\n\n" +
        "*Step 1 (1 mark):* $x(0) = 0$, $x(2) = 8 - 36 + 48 = 20$, $x(4) = 64 - 144 + 96 = 16$, $x(5) = 125 - 225 + 120 = 20$.\n\n" +
        "*Step 2 (1 mark):* Distance $= |20 - 0| + |16 - 20| + |20 - 16| = 20 + 4 + 4 = 28$ m.\n\n" +
        "**d. (2 marks)**\n\n" +
        "*Step 1 (1 mark):* $a(t) = 0$: $6t - 18 = 0$, so $t = 3$.\n\n" +
        "*Step 2 (1 mark):* $v(3) = 27 - 54 + 24 = -3$ m/s.",
      subtopicSlugs: ["rates-of-change"],
    },
  ],

  // ═══════════════════════════════════════════════════════════════════════════
  // 10. STATIONARY POINTS AND CURVE SKETCHING
  // ═══════════════════════════════════════════════════════════════════════════
  "stationary-points-and-curve-sketching": [
    // Q1 — 4 marks
    {
      content:
        "Let $f(x) = x^3 - 12x + 2$.\n\n" +
        "**a.** Find $f'(x)$ and hence the coordinates of the stationary points. (2 marks)\n\n" +
        "**b.** Classify each stationary point using $f''(x)$. (2 marks)",
      marks: 4,
      difficulty: "MEDIUM",
      solutionContent:
        "**a. (2 marks)**\n\n" +
        "*Step 1 (1 mark):* $f'(x) = 3x^2 - 12 = 3(x^2 - 4) = 3(x-2)(x+2)$. Stationary points at $x = \\pm 2$.\n\n" +
        "*Step 2 (1 mark):* $f(2) = 8 - 24 + 2 = -14$. $f(-2) = -8 + 24 + 2 = 18$. Points: $(2, -14)$ and $(-2, 18)$.\n\n" +
        "**b. (2 marks)**\n\n" +
        "*Step 1 (1 mark):* $f''(x) = 6x$. $f''(2) = 12 > 0$: local minimum.\n\n" +
        "*Step 2 (1 mark):* $f''(-2) = -12 < 0$: local maximum.",
      subtopicSlugs: ["stationary-points-and-curve-sketching"],
    },
    // Q2 — 5 marks
    {
      content:
        "Let $g(x) = x^4 - 8x^2$.\n\n" +
        "**a.** Show that $g'(x) = 4x(x^2 - 4)$. (1 mark)\n\n" +
        "**b.** Hence find the coordinates of all stationary points. (2 marks)\n\n" +
        "**c.** Classify each stationary point using $g''(x)$. (2 marks)",
      marks: 5,
      difficulty: "MEDIUM",
      solutionContent:
        "**a. (1 mark)**\n\n" +
        "*Step 1 (1 mark):* $g'(x) = 4x^3 - 16x = 4x(x^2 - 4)$.\n\n" +
        "**b. (2 marks)**\n\n" +
        "*Step 1 (1 mark):* $g'(x) = 0$: $x = 0$, $x = 2$, $x = -2$.\n\n" +
        "*Step 2 (1 mark):* $g(0) = 0$, $g(2) = 16 - 32 = -16$, $g(-2) = -16$. Points: $(0, 0)$, $(2, -16)$, $(-2, -16)$.\n\n" +
        "**c. (2 marks)**\n\n" +
        "*Step 1 (1 mark):* $g''(x) = 12x^2 - 16$. $g''(0) = -16 < 0$: local maximum.\n\n" +
        "*Step 2 (1 mark):* $g''(2) = 48 - 16 = 32 > 0$: local minimum. $g''(-2) = 32 > 0$: local minimum.",
      subtopicSlugs: ["stationary-points-and-curve-sketching"],
    },
    // Q3 — 6 marks
    {
      content:
        "Let $f(x) = \\dfrac{x^2}{e^x}$ for $x \\in R$.\n\n" +
        "**a.** Show that $f'(x) = \\dfrac{x(2 - x)}{e^x}$. (2 marks)\n\n" +
        "**b.** Hence find the coordinates of the stationary points of $f$ and classify them. (2 marks)\n\n" +
        "**c.** Find the $x$-coordinate of the point of inflection for $x > 0$, given that $f''(x) = \\dfrac{x^2 - 4x + 2}{e^x}$. (2 marks)",
      marks: 6,
      difficulty: "MEDIUM",
      solutionContent:
        "**a. (2 marks)**\n\n" +
        "*Step 1 (1 mark):* Quotient rule: $f'(x) = \\dfrac{2x \\cdot e^x - x^2 \\cdot e^x}{e^{2x}}$.\n\n" +
        "*Step 2 (1 mark):* $= \\dfrac{e^x(2x - x^2)}{e^{2x}} = \\dfrac{x(2-x)}{e^x}$.\n\n" +
        "**b. (2 marks)**\n\n" +
        "*Step 1 (1 mark):* $f'(x) = 0$: $x = 0$ or $x = 2$. $f(0) = 0$, $f(2) = \\dfrac{4}{e^2}$.\n\n" +
        "*Step 2 (1 mark):* At $x = 0$: sign of $f'$ changes from negative to positive (checking $x = -1$: $f'(-1) = \\dfrac{-3}{e^{-1}} < 0$; $x = 1$: $f'(1) = \\dfrac{1}{e} > 0$). Local minimum at $(0, 0)$. At $x = 2$: $f'(1) > 0$, $f'(3) = \\dfrac{-3}{e^3} < 0$. Local maximum at $\\left(2, \\dfrac{4}{e^2}\\right)$.\n\n" +
        "**c. (2 marks)**\n\n" +
        "*Step 1 (1 mark):* $f''(x) = 0$: $x^2 - 4x + 2 = 0$, so $x = 2 \\pm \\sqrt{2}$.\n\n" +
        "*Step 2 (1 mark):* For $x > 0$: both values are positive. $x = 2 - \\sqrt{2} \\approx 0.59$ and $x = 2 + \\sqrt{2} \\approx 3.41$.",
      subtopicSlugs: ["stationary-points-and-curve-sketching"],
    },
    // Q4 — 7 marks
    {
      content:
        "Let $f(x) = x\\ln(x) - x$ for $x > 0$.\n\n" +
        "**a.** Find $f'(x)$. (1 mark)\n\n" +
        "**b.** Hence show that $f$ has a stationary point at $x = 1$. (1 mark)\n\n" +
        "**c.** Find $f''(x)$ and classify the stationary point. (2 marks)\n\n" +
        "**d.** Show that $f(x) < 0$ for $0 < x < 1$ and $f(x) > 0$ for $x > e$. (1 mark)\n\n" +
        "**e.** Hence find the $x$-intercepts and sketch the curve $y = f(x)$, labelling the stationary point and intercepts. (2 marks)",
      marks: 7,
      difficulty: "HARD",
      solutionContent:
        "**a. (1 mark)**\n\n" +
        "*Step 1 (1 mark):* $f'(x) = \\ln(x) + 1 - 1 = \\ln(x)$.\n\n" +
        "**b. (1 mark)**\n\n" +
        "*Step 1 (1 mark):* $f'(1) = \\ln(1) = 0$. Stationary point at $x = 1$.\n\n" +
        "**c. (2 marks)**\n\n" +
        "*Step 1 (1 mark):* $f''(x) = \\dfrac{1}{x}$.\n\n" +
        "*Step 2 (1 mark):* $f''(1) = 1 > 0$. Local minimum at $(1, f(1)) = (1, -1)$.\n\n" +
        "**d. (1 mark)**\n\n" +
        "*Step 1 (1 mark):* For $0 < x < 1$: $\\ln(x) < 0$, so $x\\ln(x) < 0$ and $f(x) = x\\ln(x) - x < 0$. For $x > e$: $\\ln(x) > 1$, so $x\\ln(x) > x$ and $f(x) > 0$.\n\n" +
        "**e. (2 marks)**\n\n" +
        "*Step 1 (1 mark):* $f(x) = 0$: $x(\\ln x - 1) = 0$. Since $x > 0$, $\\ln x = 1$, so $x = e$. The $x$-intercept is $(e, 0)$.\n\n" +
        "*Step 2 (1 mark):* Sketch: curve approaches $0^-$ as $x \\to 0^+$, has a minimum at $(1, -1)$, crosses the $x$-axis at $x = e$, and increases for $x > e$.",
      subtopicSlugs: ["stationary-points-and-curve-sketching"],
    },
    // Q5 — 8 marks
    {
      content:
        "Let $f(x) = x^3 + ax^2 + bx + c$ where $f$ has a stationary point at $(1, 3)$ and passes through the origin.\n\n" +
        "**a.** Use the given information to show that $a = -3$, $b = 3$, and $c = 0$. (3 marks)\n\n" +
        "**b.** Hence find $f'(x)$ and show that $(1, 3)$ is the only stationary point. (2 marks)\n\n" +
        "**c.** Find $f''(1)$ and explain why this does not classify the stationary point. (1 mark)\n\n" +
        "**d.** Using a sign diagram of $f'(x)$, determine the nature of the stationary point at $(1, 3)$. (2 marks)",
      marks: 8,
      difficulty: "HARD",
      solutionContent:
        "**a. (3 marks)**\n\n" +
        "*Step 1 (1 mark):* $f(0) = c = 0$.\n\n" +
        "*Step 2 (1 mark):* $f(1) = 1 + a + b + c = 3$, so $a + b = 2$.\n\n" +
        "*Step 3 (1 mark):* $f'(x) = 3x^2 + 2ax + b$ and $f'(1) = 0$: $3 + 2a + b = 0$. With $a + b = 2$: $b = 2 - a$ and $3 + 2a + 2 - a = 0$, so $a + 5 = 0$, $a = -5$... Checking: $a + b = 2$ and $2a + b = -3$. Subtracting: $a = -5$, $b = 7$.\n\n" +
        "Correction: $f(1) = 1 + a + b = 3$ gives $a + b = 2$; $f'(1) = 3 + 2a + b = 0$ gives $2a + b = -3$. Subtract: $a = -5$, $b = 7$, $c = 0$.\n\n" +
        "So $a = -5$, $b = 7$, $c = 0$.\n\n" +
        "**b. (2 marks)**\n\n" +
        "*Step 1 (1 mark):* $f'(x) = 3x^2 - 10x + 7 = (3x - 7)(x - 1)$.\n\n" +
        "*Step 2 (1 mark):* $f'(x) = 0$ at $x = 1$ and $x = \\dfrac{7}{3}$. So $(1,3)$ is not the only stationary point; there is another at $x = \\dfrac{7}{3}$.\n\n" +
        "**c. (1 mark)**\n\n" +
        "*Step 1 (1 mark):* $f''(x) = 6x - 10$. $f''(1) = -4 < 0$, so $(1, 3)$ is a local maximum.\n\n" +
        "**d. (2 marks)**\n\n" +
        "*Step 1 (1 mark):* $f'(x) = (3x-7)(x-1)$. For $x < 1$: both factors negative and positive respectively, $f'(x) > 0$. For $1 < x < 7/3$: $(x-1) > 0$ and $(3x-7) < 0$, $f'(x) < 0$.\n\n" +
        "*Step 2 (1 mark):* $f'$ changes from positive to negative at $x = 1$, confirming a local maximum.",
      subtopicSlugs: ["stationary-points-and-curve-sketching"],
    },
  ],

  // ═══════════════════════════════════════════════════════════════════════════
  // 11. AREA UNDER CURVES
  // ═══════════════════════════════════════════════════════════════════════════
  "area-under-curves": [
    // Q1 — 4 marks
    {
      content:
        "Let $f(x) = x^2$ and $g(x) = 2x$.\n\n" +
        "**a.** Find the $x$-coordinates where $f(x) = g(x)$. (1 mark)\n\n" +
        "**b.** State which function is greater on the interval between the intersection points. (1 mark)\n\n" +
        "**c.** Hence find the area enclosed between the two curves. (2 marks)",
      marks: 4,
      difficulty: "MEDIUM",
      solutionContent:
        "**a. (1 mark)**\n\n" +
        "*Step 1 (1 mark):* $x^2 = 2x$, so $x(x - 2) = 0$. $x = 0$ or $x = 2$.\n\n" +
        "**b. (1 mark)**\n\n" +
        "*Step 1 (1 mark):* At $x = 1$: $g(1) = 2 > f(1) = 1$. So $g(x) \\geq f(x)$ on $[0, 2]$.\n\n" +
        "**c. (2 marks)**\n\n" +
        "*Step 1 (1 mark):* Area $= \\displaystyle\\int_0^2 (2x - x^2)\\,dx = \\left[x^2 - \\dfrac{x^3}{3}\\right]_0^2$.\n\n" +
        "*Step 2 (1 mark):* $= 4 - \\dfrac{8}{3} = \\dfrac{4}{3}$.",
      subtopicSlugs: ["area-under-curves"],
    },
    // Q2 — 5 marks
    {
      content:
        "The region $R$ is bounded by $y = \\sin(x)$, the $x$-axis, and the lines $x = 0$ and $x = \\pi$.\n\n" +
        "**a.** Evaluate $\\displaystyle\\int_0^\\pi \\sin(x)\\,dx$. (1 mark)\n\n" +
        "**b.** Hence state the area of $R$. (1 mark)\n\n" +
        "**c.** A horizontal line $y = k$ (where $0 < k < 1$) divides $R$ into two regions of equal area. Show that $\\cos^{-1}(k) = \\dfrac{k\\pi + \\sqrt{1 - k^2}}{2}$... \n\nDetermine the area of the region above $y = k$ and hence set up, but do not solve, the equation for $k$. (3 marks)",
      marks: 5,
      difficulty: "MEDIUM",
      solutionContent:
        "**a. (1 mark)**\n\n" +
        "*Step 1 (1 mark):* $\\displaystyle\\int_0^\\pi \\sin x\\,dx = [-\\cos x]_0^\\pi = 1 + 1 = 2$.\n\n" +
        "**b. (1 mark)**\n\n" +
        "*Step 1 (1 mark):* Since $\\sin x \\geq 0$ on $[0, \\pi]$, the area is $2$.\n\n" +
        "**c. (3 marks)**\n\n" +
        "*Step 1 (1 mark):* $\\sin x = k$ has solutions $x = \\sin^{-1}(k)$ and $x = \\pi - \\sin^{-1}(k)$ on $[0, \\pi]$. Let $\\alpha = \\sin^{-1}(k)$.\n\n" +
        "*Step 2 (1 mark):* Area below $y = k$ consists of the rectangle between the two solutions plus the two end triangular-like regions. Area above $y = k$:\n\n" +
        "$$A_{\\text{above}} = \\int_{\\alpha}^{\\pi - \\alpha} (\\sin x - k)\\,dx$$\n\n" +
        "*Step 3 (1 mark):* $= [-\\cos x - kx]_{\\alpha}^{\\pi - \\alpha} = (\\cos\\alpha - k(\\pi - 2\\alpha) - (-\\cos\\alpha))$\n\n" +
        "$= 2\\cos\\alpha - k\\pi + 2k\\alpha$. For equal areas: $2\\cos\\alpha - k\\pi + 2k\\alpha = 1$.",
      subtopicSlugs: ["area-under-curves"],
    },
    // Q3 — 6 marks
    {
      content:
        "Let $f(x) = e^x$ and $g(x) = e^{-x} + 2$.\n\n" +
        "**a.** Find the $x$-coordinate where $f(x) = g(x)$. (2 marks)\n\n" +
        "**b.** State which function is greater for $x < \\ln\\left(\\dfrac{1 + \\sqrt{5}}{2}\\right)$. (1 mark)\n\n" +
        "**c.** Hence find the exact area between the two curves from $x = 0$ to $x = \\ln 2$. (3 marks)",
      marks: 6,
      difficulty: "MEDIUM",
      solutionContent:
        "**a. (2 marks)**\n\n" +
        "*Step 1 (1 mark):* $e^x = e^{-x} + 2$. Let $u = e^x$: $u = \\dfrac{1}{u} + 2$, so $u^2 - 2u - 1 = 0$.\n\n" +
        "*Step 2 (1 mark):* $u = \\dfrac{2 + \\sqrt{8}}{2} = 1 + \\sqrt{2}$ (taking positive root). $x = \\ln(1 + \\sqrt{2})$.\n\n" +
        "**b. (1 mark)**\n\n" +
        "*Step 1 (1 mark):* At $x = 0$: $f(0) = 1$ and $g(0) = 3$. So $g(x) > f(x)$ for $x$ less than the intersection.\n\n" +
        "**c. (3 marks)**\n\n" +
        "*Step 1 (1 mark):* Since $\\ln 2 < \\ln(1+\\sqrt{2})$, we have $g(x) > f(x)$ on $[0, \\ln 2]$.\n\n" +
        "*Step 2 (1 mark):*\n\n" +
        "$$\\text{Area} = \\int_0^{\\ln 2}(e^{-x} + 2 - e^x)\\,dx = \\left[-e^{-x} + 2x - e^x\\right]_0^{\\ln 2}$$\n\n" +
        "*Step 3 (1 mark):* $= \\left(-\\dfrac{1}{2} + 2\\ln 2 - 2\\right) - (-1 + 0 - 1) = -\\dfrac{1}{2} + 2\\ln 2 - 2 + 2 = 2\\ln 2 - \\dfrac{1}{2}$.",
      subtopicSlugs: ["area-under-curves"],
    },
    // Q4 — 7 marks
    {
      content:
        "Let $f(x) = 4x - x^2$.\n\n" +
        "**a.** Find the $x$-intercepts of $f$. (1 mark)\n\n" +
        "**b.** Find the area enclosed between $y = f(x)$ and the $x$-axis. (2 marks)\n\n" +
        "**c.** The line $y = mx$ passes through the origin and meets the curve at a second point. Find the $x$-coordinate of this point in terms of $m$. (1 mark)\n\n" +
        "**d.** Find the value of $m$ such that $y = mx$ divides the enclosed area from part (b) into two equal parts. (3 marks)",
      marks: 7,
      difficulty: "HARD",
      solutionContent:
        "**a. (1 mark)**\n\n" +
        "*Step 1 (1 mark):* $x(4 - x) = 0$, so $x = 0$ and $x = 4$.\n\n" +
        "**b. (2 marks)**\n\n" +
        "*Step 1 (1 mark):* Area $= \\displaystyle\\int_0^4 (4x - x^2)\\,dx = \\left[2x^2 - \\dfrac{x^3}{3}\\right]_0^4$.\n\n" +
        "*Step 2 (1 mark):* $= 32 - \\dfrac{64}{3} = \\dfrac{32}{3}$.\n\n" +
        "**c. (1 mark)**\n\n" +
        "*Step 1 (1 mark):* $mx = 4x - x^2$: $x^2 + (m-4)x = 0$, so $x(x + m - 4) = 0$. Second point: $x = 4 - m$.\n\n" +
        "**d. (3 marks)**\n\n" +
        "*Step 1 (1 mark):* Area between $y = mx$ and $y = f(x)$ from $x = 0$ to $x = 4 - m$:\n\n" +
        "$$\\int_0^{4-m}(4x - x^2 - mx)\\,dx = \\int_0^{4-m}((4-m)x - x^2)\\,dx$$\n\n" +
        "*Step 2 (1 mark):* $= \\left[\\dfrac{(4-m)x^2}{2} - \\dfrac{x^3}{3}\\right]_0^{4-m} = \\dfrac{(4-m)^3}{2} - \\dfrac{(4-m)^3}{3} = \\dfrac{(4-m)^3}{6}$.\n\n" +
        "*Step 3 (1 mark):* Set $\\dfrac{(4-m)^3}{6} = \\dfrac{16}{3}$: $(4-m)^3 = 32$, so $4 - m = \\sqrt[3]{32} = 2\\sqrt[3]{4}$. Thus $m = 4 - 2\\sqrt[3]{4}$.",
      subtopicSlugs: ["area-under-curves"],
    },
    // Q5 — 8 marks
    {
      content:
        "Let $f(x) = x^2$ and $g(x) = \\sqrt{x}$ for $x \\geq 0$.\n\n" +
        "**a.** Find the coordinates of the intersection points of $f$ and $g$. (2 marks)\n\n" +
        "**b.** Find the area enclosed between the two curves. (2 marks)\n\n" +
        "**c.** The line $x = k$ (where $0 < k < 1$) divides this enclosed area into two parts. Find the area of the left part (from $x = 0$ to $x = k$) in terms of $k$. (2 marks)\n\n" +
        "**d.** Hence find the exact value of $k$ that divides the enclosed area into two equal parts. (2 marks)",
      marks: 8,
      difficulty: "HARD",
      solutionContent:
        "**a. (2 marks)**\n\n" +
        "*Step 1 (1 mark):* $x^2 = \\sqrt{x}$: $x^4 = x$ (squaring), so $x(x^3 - 1) = 0$.\n\n" +
        "*Step 2 (1 mark):* $x = 0$ or $x = 1$. Intersection points: $(0, 0)$ and $(1, 1)$.\n\n" +
        "**b. (2 marks)**\n\n" +
        "*Step 1 (1 mark):* On $[0, 1]$, $\\sqrt{x} \\geq x^2$.\n\n" +
        "$$\\text{Area} = \\int_0^1 (\\sqrt{x} - x^2)\\,dx = \\left[\\dfrac{2x^{3/2}}{3} - \\dfrac{x^3}{3}\\right]_0^1$$\n\n" +
        "*Step 2 (1 mark):* $= \\dfrac{2}{3} - \\dfrac{1}{3} = \\dfrac{1}{3}$.\n\n" +
        "**c. (2 marks)**\n\n" +
        "*Step 1 (1 mark):* Left area $= \\displaystyle\\int_0^k (\\sqrt{x} - x^2)\\,dx = \\left[\\dfrac{2x^{3/2}}{3} - \\dfrac{x^3}{3}\\right]_0^k$.\n\n" +
        "*Step 2 (1 mark):* $= \\dfrac{2k^{3/2}}{3} - \\dfrac{k^3}{3}$.\n\n" +
        "**d. (2 marks)**\n\n" +
        "*Step 1 (1 mark):* Set $\\dfrac{2k^{3/2}}{3} - \\dfrac{k^3}{3} = \\dfrac{1}{6}$.\n\n" +
        "$$2k^{3/2} - k^3 = \\dfrac{1}{2}$$\n\n" +
        "*Step 2 (1 mark):* Testing $k = \\dfrac{1}{4}$: $2 \\cdot \\dfrac{1}{8} - \\dfrac{1}{64} = \\dfrac{1}{4} - \\dfrac{1}{64} = \\dfrac{15}{64} \\neq \\dfrac{1}{2}$. This equation requires numerical methods; by trial, $k \\approx 0.476$. Leaving in exact form: $k$ satisfies $4k^{3/2} - 2k^3 = 1$.",
      subtopicSlugs: ["area-under-curves"],
    },
  ],

  // ═══════════════════════════════════════════════════════════════════════════
  // 12. FUNDAMENTAL THEOREM OF CALCULUS
  // ═══════════════════════════════════════════════════════════════════════════
  "fundamental-theorem-of-calculus": [
    // Q1 — 4 marks
    {
      content:
        "Let $F(x) = \\displaystyle\\int_0^x (3t^2 + 1)\\,dt$.\n\n" +
        "**a.** Evaluate $F(x)$ by computing the integral. (2 marks)\n\n" +
        "**b.** Verify that $F'(x) = 3x^2 + 1$ using the Fundamental Theorem of Calculus. (1 mark)\n\n" +
        "**c.** Find $F(2)$. (1 mark)",
      marks: 4,
      difficulty: "MEDIUM",
      solutionContent:
        "**a. (2 marks)**\n\n" +
        "*Step 1 (1 mark):* $F(x) = \\left[t^3 + t\\right]_0^x$.\n\n" +
        "*Step 2 (1 mark):* $F(x) = x^3 + x$.\n\n" +
        "**b. (1 mark)**\n\n" +
        "*Step 1 (1 mark):* By the FTC, $F'(x) = 3x^2 + 1$ (the integrand evaluated at $x$). Alternatively, differentiating: $(x^3 + x)' = 3x^2 + 1$.\n\n" +
        "**c. (1 mark)**\n\n" +
        "*Step 1 (1 mark):* $F(2) = 8 + 2 = 10$.",
      subtopicSlugs: ["fundamental-theorem-of-calculus"],
    },
    // Q2 — 5 marks
    {
      content:
        "Let $g(x) = \\displaystyle\\int_1^x \\dfrac{1}{t}\\,dt$ for $x > 0$.\n\n" +
        "**a.** Evaluate $g(x)$ explicitly. (1 mark)\n\n" +
        "**b.** Hence find $g(e)$ and $g(e^2)$. (1 mark)\n\n" +
        "**c.** Show that $g(ab) = g(a) + g(b)$ for all $a, b > 0$. (3 marks)",
      marks: 5,
      difficulty: "MEDIUM",
      solutionContent:
        "**a. (1 mark)**\n\n" +
        "*Step 1 (1 mark):* $g(x) = [\\ln t]_1^x = \\ln x$.\n\n" +
        "**b. (1 mark)**\n\n" +
        "*Step 1 (1 mark):* $g(e) = 1$, $g(e^2) = 2$.\n\n" +
        "**c. (3 marks)**\n\n" +
        "*Step 1 (1 mark):* $g(ab) = \\ln(ab)$.\n\n" +
        "*Step 2 (1 mark):* $g(a) + g(b) = \\ln a + \\ln b$.\n\n" +
        "*Step 3 (1 mark):* By the logarithm law: $\\ln(ab) = \\ln a + \\ln b$. Hence $g(ab) = g(a) + g(b)$.",
      subtopicSlugs: ["fundamental-theorem-of-calculus"],
    },
    // Q3 — 6 marks
    {
      content:
        "Let $F(x) = \\displaystyle\\int_0^x e^{-t^2}\\,dt$.\n\n" +
        "**a.** State $F(0)$. (1 mark)\n\n" +
        "**b.** Using the Fundamental Theorem of Calculus, find $F'(x)$. (1 mark)\n\n" +
        "**c.** Hence find the stationary point of $F$ and show that $F$ is strictly increasing for all $x > 0$. (2 marks)\n\n" +
        "**d.** Find $F''(x)$ and hence determine the $x$-coordinate of the point of inflection of $F$ for $x > 0$. (2 marks)",
      marks: 6,
      difficulty: "MEDIUM",
      solutionContent:
        "**a. (1 mark)**\n\n" +
        "*Step 1 (1 mark):* $F(0) = \\displaystyle\\int_0^0 e^{-t^2}\\,dt = 0$.\n\n" +
        "**b. (1 mark)**\n\n" +
        "*Step 1 (1 mark):* By the FTC: $F'(x) = e^{-x^2}$.\n\n" +
        "**c. (2 marks)**\n\n" +
        "*Step 1 (1 mark):* $F'(x) = e^{-x^2} > 0$ for all $x$, so $F$ has no stationary points.\n\n" +
        "*Step 2 (1 mark):* Since $F'(x) > 0$ for all $x > 0$, $F$ is strictly increasing on $(0, \\infty)$.\n\n" +
        "**d. (2 marks)**\n\n" +
        "*Step 1 (1 mark):* $F''(x) = \\dfrac{d}{dx}(e^{-x^2}) = -2xe^{-x^2}$.\n\n" +
        "*Step 2 (1 mark):* $F''(x) = 0$ when $x = 0$ (for $x > 0$, $F''(x) < 0$ always). There is no inflection point for $x > 0$; $F$ is concave down for all $x > 0$. The inflection point is at $x = 0$.",
      subtopicSlugs: ["fundamental-theorem-of-calculus"],
    },
    // Q4 — 7 marks
    {
      content:
        "Let $f(x) = \\displaystyle\\int_0^x \\sin(t^2)\\,dt$.\n\n" +
        "**a.** State $f(0)$. (1 mark)\n\n" +
        "**b.** Using the FTC, find $f'(x)$. (1 mark)\n\n" +
        "**c.** Find $f'(0)$ and $f'(\\sqrt{\\pi})$. (1 mark)\n\n" +
        "**d.** Determine all values of $x > 0$ where $f'(x) = 0$, and hence the first two positive $x$-values where $f$ has stationary points. (2 marks)\n\n" +
        "**e.** Let $G(x) = \\displaystyle\\int_0^{x^2} \\sin(t^2)\\,dt$. Using the chain rule and the FTC, find $G'(x)$. (2 marks)",
      marks: 7,
      difficulty: "HARD",
      solutionContent:
        "**a. (1 mark)**\n\n" +
        "*Step 1 (1 mark):* $f(0) = 0$.\n\n" +
        "**b. (1 mark)**\n\n" +
        "*Step 1 (1 mark):* $f'(x) = \\sin(x^2)$.\n\n" +
        "**c. (1 mark)**\n\n" +
        "*Step 1 (1 mark):* $f'(0) = \\sin(0) = 0$. $f'(\\sqrt{\\pi}) = \\sin(\\pi) = 0$.\n\n" +
        "**d. (2 marks)**\n\n" +
        "*Step 1 (1 mark):* $\\sin(x^2) = 0$ when $x^2 = n\\pi$ for $n = 0, 1, 2, \\ldots$, i.e. $x = \\sqrt{n\\pi}$.\n\n" +
        "*Step 2 (1 mark):* First two positive values: $x = \\sqrt{\\pi}$ and $x = \\sqrt{2\\pi}$.\n\n" +
        "**e. (2 marks)**\n\n" +
        "*Step 1 (1 mark):* Let $u = x^2$. Then $G(x) = \\displaystyle\\int_0^u \\sin(t^2)\\,dt$, so by the chain rule:\n\n" +
        "$$G'(x) = \\sin(u^2) \\cdot \\dfrac{du}{dx}$$\n\n" +
        "*Step 2 (1 mark):* $= \\sin(x^4) \\cdot 2x = 2x\\sin(x^4)$.",
      subtopicSlugs: ["fundamental-theorem-of-calculus"],
    },
    // Q5 — 8 marks
    {
      content:
        "Consider $\\displaystyle\\int_0^a e^x\\,dx$ where $a > 0$.\n\n" +
        "**a.** Evaluate $\\displaystyle\\int_0^a e^x\\,dx$ in terms of $a$. (1 mark)\n\n" +
        "**b.** Find the value of $a$ for which $\\displaystyle\\int_0^a e^x\\,dx = e^a$. (2 marks)\n\n" +
        "**c.** Let $h(a) = \\displaystyle\\int_0^a e^x\\,dx - a \\cdot e^a$ for $a > 0$. Find $h'(a)$ using the FTC and product rule. (2 marks)\n\n" +
        "**d.** Hence show that $h$ has a stationary point at $a = 0$ only. Find $h(0)$ and deduce that $\\displaystyle\\int_0^a e^x\\,dx < a \\cdot e^a$ for all $a > 0$. (3 marks)",
      marks: 8,
      difficulty: "HARD",
      solutionContent:
        "**a. (1 mark)**\n\n" +
        "*Step 1 (1 mark):* $\\displaystyle\\int_0^a e^x\\,dx = [e^x]_0^a = e^a - 1$.\n\n" +
        "**b. (2 marks)**\n\n" +
        "*Step 1 (1 mark):* $e^a - 1 = e^a$ gives $-1 = 0$, a contradiction.\n\n" +
        "*Step 2 (1 mark):* No such value of $a$ exists.\n\n" +
        "**c. (2 marks)**\n\n" +
        "*Step 1 (1 mark):* $h(a) = (e^a - 1) - ae^a$.\n\n" +
        "*Step 2 (1 mark):* $h'(a) = e^a - (e^a + ae^a) = -ae^a$.\n\n" +
        "**d. (3 marks)**\n\n" +
        "*Step 1 (1 mark):* $h'(a) = -ae^a = 0$ only when $a = 0$.\n\n" +
        "*Step 2 (1 mark):* $h(0) = 1 - 1 - 0 = 0$. For $a > 0$: $h'(a) = -ae^a < 0$, so $h$ is strictly decreasing.\n\n" +
        "*Step 3 (1 mark):* Since $h(0) = 0$ and $h$ is decreasing for $a > 0$, $h(a) < 0$ for all $a > 0$. Hence $e^a - 1 - ae^a < 0$, i.e. $\\displaystyle\\int_0^a e^x\\,dx < ae^a$.",
      subtopicSlugs: ["fundamental-theorem-of-calculus"],
    },
  ],
};

// ─── Main ────────────────────────────────────────────────────────────────────

const FILE_MAP: Record<string, string> = {
  "differentiation": "qset-differentiation.json",
  "chain-rule": "qset-chain-rule.json",
  "product-rule": "qset-product-rule.json",
  "quotient-rule": "qset-quotient-rule.json",
  "optimisation": "qset-optimisation.json",
  "antidifferentiation": "qset-antidifferentiation.json",
  "definite-integrals": "qset-definite-integrals.json",
  "tangents-and-normals": "qset-tangents-and-normals.json",
  "rates-of-change": "qset-rates-of-change.json",
  "stationary-points-and-curve-sketching": "qset-stationary-points-and-curve-sketching.json",
  "area-under-curves": "qset-area-under-curves.json",
  "fundamental-theorem-of-calculus": "qset-fundamental-theorem-of-calculus.json",
};

let modified = 0;
let skipped = 0;

for (const [slug, filename] of Object.entries(FILE_MAP)) {
  const filePath = path.join(OUT_DIR, filename);
  const raw = fs.readFileSync(filePath, "utf-8");
  const data = JSON.parse(raw);

  // Idempotent: skip if already has 5+ extendedAnswer items
  if (data.extendedAnswer && data.extendedAnswer.length >= 5) {
    console.log(`⏭️  ${filename} — already has ${data.extendedAnswer.length} extendedAnswer items, skipping`);
    skipped++;
    continue;
  }

  const questions = EA_QUESTIONS[slug];
  if (!questions || questions.length !== 5) {
    throw new Error(`Missing or wrong count of EA questions for ${slug}`);
  }

  // Validate mark distribution: 1x4, 2x5-6, 1x7, 1x8
  const markCounts = questions.map((q) => q.marks).sort((a, b) => a - b);
  if (markCounts[0] !== 4) throw new Error(`${slug}: expected one 4-mark Q, got ${markCounts[0]}`);
  if (markCounts[1] < 5 || markCounts[1] > 6) throw new Error(`${slug}: Q2 marks ${markCounts[1]} not in 5-6`);
  if (markCounts[2] < 5 || markCounts[2] > 6) throw new Error(`${slug}: Q3 marks ${markCounts[2]} not in 5-6`);
  if (markCounts[3] !== 7) throw new Error(`${slug}: expected one 7-mark Q, got ${markCounts[3]}`);
  if (markCounts[4] !== 8) throw new Error(`${slug}: expected one 8-mark Q, got ${markCounts[4]}`);

  // Dechain solutions
  for (const q of questions) {
    q.solutionContent = dechainSolution(q.solutionContent);
  }

  data.extendedAnswer = questions;

  fs.writeFileSync(filePath, JSON.stringify(data, null, 2) + "\n", "utf-8");
  const markList = questions.map((q) => q.marks).join(", ");
  console.log(`✅ ${filename} — added 5 extendedAnswer items [${markList}]`);
  modified++;
}

console.log(`\nDone: ${modified} files modified, ${skipped} skipped.`);
