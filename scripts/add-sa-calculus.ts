/**
 * add-sa-calculus.ts
 *
 * Appends 5 new short-answer questions to each of the 12 Calculus subtopic
 * JSON files under scripts/output/. Idempotent: files already at 15+
 * shortAnswer items are skipped.
 *
 * Run: npx tsx scripts/add-sa-calculus.ts
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

const OUT_DIR = path.join(__dirname, "output");

const NEW_QUESTIONS: Record<string, FR[]> = {
  // ─── 1. Differentiation ────────────────────────────────────────────────────
  "differentiation": [
    {
      content: "Find $\\dfrac{dy}{dx}$ if $y = 5x^3 - \\dfrac{2}{x} + \\sqrt{x}$ (for $x > 0$).",
      marks: 2,
      difficulty: "EASY",
      solutionContent:
        "**Step 1 (1 mark):** Rewrite with negative and fractional exponents.\n\n$$y = 5x^3 - 2x^{-1} + x^{1/2}$$\n\n**Step 2 (1 mark):** Apply the power rule term by term.\n\n$$\\dfrac{dy}{dx} = 15x^2 + 2x^{-2} + \\dfrac{1}{2}x^{-1/2}$$",
      subtopicSlugs: ["differentiation"],
    },
    {
      content: "Let $f(x) = 2e^x + 3\\sin x$. Find $f'(0)$.",
      marks: 2,
      difficulty: "EASY",
      solutionContent:
        "**Step 1 (1 mark):** Differentiate term by term.\n\n$$f'(x) = 2e^x + 3\\cos x$$\n\n**Step 2 (1 mark):** Substitute $x = 0$.\n\n$$f'(0) = 2 \\cdot 1 + 3 \\cdot 1 = 5$$",
      subtopicSlugs: ["differentiation"],
    },
    {
      content: "Find the $x$-values where the curve $y = x^3 - 3x^2 - 9x + 5$ has a horizontal tangent.",
      marks: 3,
      difficulty: "MEDIUM",
      solutionContent:
        "**Step 1 (1 mark):** Differentiate.\n\n$$\\dfrac{dy}{dx} = 3x^2 - 6x - 9$$\n\n**Step 2 (1 mark):** Set the derivative equal to zero.\n\n$$3x^2 - 6x - 9 = 0$$\n\n$$x^2 - 2x - 3 = 0$$\n\n**Step 3 (1 mark):** Factor and solve.\n\n$$(x - 3)(x + 1) = 0$$\n\n$$x = 3 \\text{ or } x = -1$$",
      subtopicSlugs: ["differentiation"],
    },
    {
      content: "Show that $y = e^{2x}$ satisfies the differential equation $y'' - 4y = 0$.",
      marks: 3,
      difficulty: "MEDIUM",
      solutionContent:
        "**Step 1 (1 mark):** Find the first derivative.\n\n$$y' = 2e^{2x}$$\n\n**Step 2 (1 mark):** Find the second derivative.\n\n$$y'' = 4e^{2x}$$\n\n**Step 3 (1 mark):** Substitute into $y'' - 4y$.\n\n$$y'' - 4y = 4e^{2x} - 4e^{2x} = 0$$\n\nHence $y = e^{2x}$ satisfies $y'' - 4y = 0$.",
      subtopicSlugs: ["differentiation"],
    },
    {
      content: "Use first principles to find the derivative of $f(x) = x^3 + 2x$.",
      marks: 4,
      difficulty: "HARD",
      solutionContent:
        "**Step 1 (1 mark):** Write the definition.\n\n$$f'(x) = \\lim_{h \\to 0} \\dfrac{f(x + h) - f(x)}{h}$$\n\n**Step 2 (1 mark):** Expand $f(x + h)$.\n\n$$f(x + h) = (x + h)^3 + 2(x + h)$$\n\n$$= x^3 + 3x^2 h + 3x h^2 + h^3 + 2x + 2h$$\n\n**Step 3 (1 mark):** Form the difference quotient.\n\n$$\\dfrac{f(x + h) - f(x)}{h} = \\dfrac{3x^2 h + 3x h^2 + h^3 + 2h}{h}$$\n\n$$= 3x^2 + 3x h + h^2 + 2$$\n\n**Step 4 (1 mark):** Take the limit as $h \\to 0$.\n\n$$f'(x) = 3x^2 + 2$$",
      subtopicSlugs: ["differentiation"],
    },
  ],

  // ─── 2. Chain rule ─────────────────────────────────────────────────────────
  "chain-rule": [
    {
      content: "Differentiate $y = (x^2 + 5)^6$ with respect to $x$.",
      marks: 2,
      difficulty: "EASY",
      solutionContent:
        "**Step 1 (1 mark):** Identify the outer and inner functions and apply the chain rule.\n\n$$\\dfrac{dy}{dx} = 6(x^2 + 5)^5 \\cdot 2x$$\n\n**Step 2 (1 mark):** Simplify.\n\n$$\\dfrac{dy}{dx} = 12x(x^2 + 5)^5$$",
      subtopicSlugs: ["chain-rule"],
    },
    {
      content: "Find $f'(x)$ if $f(x) = \\tan(5x)$.",
      marks: 2,
      difficulty: "EASY",
      solutionContent:
        "**Step 1 (1 mark):** Apply the chain rule using $\\dfrac{d}{dx}\\tan u = \\sec^2 u \\cdot u'$.\n\n$$f'(x) = \\sec^2(5x) \\cdot 5$$\n\n**Step 2 (1 mark):** State the result.\n\n$$f'(x) = 5\\sec^2(5x)$$",
      subtopicSlugs: ["chain-rule"],
    },
    {
      content: "Find the gradient of $y = \\ln(x^2 + 4)$ at $x = 2$.",
      marks: 3,
      difficulty: "MEDIUM",
      solutionContent:
        "**Step 1 (1 mark):** Apply the chain rule.\n\n$$\\dfrac{dy}{dx} = \\dfrac{1}{x^2 + 4} \\cdot 2x$$\n\n**Step 2 (1 mark):** Simplify.\n\n$$\\dfrac{dy}{dx} = \\dfrac{2x}{x^2 + 4}$$\n\n**Step 3 (1 mark):** Substitute $x = 2$.\n\n$$\\left.\\dfrac{dy}{dx}\\right|_{x=2} = \\dfrac{4}{8} = \\dfrac{1}{2}$$",
      subtopicSlugs: ["chain-rule"],
    },
    {
      content: "Differentiate $y = \\sin(2x^2 + 1)$.",
      marks: 3,
      difficulty: "MEDIUM",
      solutionContent:
        "**Step 1 (1 mark):** Identify inner $u = 2x^2 + 1$, outer $\\sin u$.\n\n$$\\dfrac{du}{dx} = 4x$$\n\n**Step 2 (1 mark):** Apply the chain rule.\n\n$$\\dfrac{dy}{dx} = \\cos(u) \\cdot \\dfrac{du}{dx}$$\n\n**Step 3 (1 mark):** Substitute back.\n\n$$\\dfrac{dy}{dx} = 4x\\cos(2x^2 + 1)$$",
      subtopicSlugs: ["chain-rule"],
    },
    {
      content: "Let $f(x) = \\left(e^x + 1\\right)^3$. Find $f'(0)$.",
      marks: 4,
      difficulty: "HARD",
      solutionContent:
        "**Step 1 (1 mark):** Let $u = e^x + 1$, so $y = u^3$.\n\n$$\\dfrac{du}{dx} = e^x$$\n\n**Step 2 (1 mark):** Apply the chain rule.\n\n$$f'(x) = 3u^2 \\cdot e^x$$\n\n**Step 3 (1 mark):** Substitute back for $u$.\n\n$$f'(x) = 3(e^x + 1)^2 e^x$$\n\n**Step 4 (1 mark):** Evaluate at $x = 0$.\n\n$$f'(0) = 3(1 + 1)^2 \\cdot 1 = 12$$",
      subtopicSlugs: ["chain-rule"],
    },
  ],

  // ─── 3. Product rule ───────────────────────────────────────────────────────
  "product-rule": [
    {
      content: "Differentiate $y = (x + 2)e^{3x}$.",
      marks: 2,
      difficulty: "EASY",
      solutionContent:
        "**Step 1 (1 mark):** Let $u = x + 2$, $v = e^{3x}$ so $u' = 1$, $v' = 3e^{3x}$.\n\n$$\\dfrac{dy}{dx} = u'v + uv'$$\n\n**Step 2 (1 mark):** Substitute and simplify.\n\n$$\\dfrac{dy}{dx} = e^{3x} + 3(x + 2)e^{3x}$$\n\n$$= e^{3x}(3x + 7)$$",
      subtopicSlugs: ["product-rule"],
    },
    {
      content: "Find $f'(x)$ when $f(x) = (2x - 1)(x^2 + 3)$ using the product rule.",
      marks: 2,
      difficulty: "EASY",
      solutionContent:
        "**Step 1 (1 mark):** Let $u = 2x - 1$, $v = x^2 + 3$, so $u' = 2$, $v' = 2x$.\n\n$$f'(x) = 2(x^2 + 3) + (2x - 1)(2x)$$\n\n**Step 2 (1 mark):** Expand and simplify.\n\n$$f'(x) = 2x^2 + 6 + 4x^2 - 2x$$\n\n$$f'(x) = 6x^2 - 2x + 6$$",
      subtopicSlugs: ["product-rule"],
    },
    {
      content: "Find the gradient of $y = x\\sin x$ at $x = \\pi$.",
      marks: 3,
      difficulty: "MEDIUM",
      solutionContent:
        "**Step 1 (1 mark):** Let $u = x$, $v = \\sin x$, so $u' = 1$, $v' = \\cos x$.\n\n$$\\dfrac{dy}{dx} = \\sin x + x\\cos x$$\n\n**Step 2 (1 mark):** Substitute $x = \\pi$.\n\n$$\\left.\\dfrac{dy}{dx}\\right|_{x=\\pi} = \\sin\\pi + \\pi\\cos\\pi$$\n\n**Step 3 (1 mark):** Evaluate.\n\n$$= 0 + \\pi(-1) = -\\pi$$",
      subtopicSlugs: ["product-rule"],
    },
    {
      content: "Show that if $f(x) = xe^{-x}$, then $f'(x) = (1 - x)e^{-x}$.",
      marks: 3,
      difficulty: "MEDIUM",
      solutionContent:
        "**Step 1 (1 mark):** Let $u = x$, $v = e^{-x}$, so $u' = 1$, $v' = -e^{-x}$.\n\n**Step 2 (1 mark):** Apply the product rule.\n\n$$f'(x) = 1 \\cdot e^{-x} + x \\cdot (-e^{-x})$$\n\n**Step 3 (1 mark):** Factor.\n\n$$f'(x) = e^{-x}(1 - x) = (1 - x)e^{-x}$$",
      subtopicSlugs: ["product-rule"],
    },
    {
      content: "Let $f(x) = (x^2 + 1)\\ln x$ for $x > 0$. Find $f'(x)$.",
      marks: 4,
      difficulty: "HARD",
      solutionContent:
        "**Step 1 (1 mark):** Identify $u = x^2 + 1$ and $v = \\ln x$.\n\n$$u' = 2x$$\n\n**Step 2 (1 mark):** Find $v'$.\n\n$$v' = \\dfrac{1}{x}$$\n\n**Step 3 (1 mark):** Apply the product rule.\n\n$$f'(x) = 2x \\cdot \\ln x + (x^2 + 1) \\cdot \\dfrac{1}{x}$$\n\n**Step 4 (1 mark):** Simplify.\n\n$$f'(x) = 2x\\ln x + x + \\dfrac{1}{x}$$",
      subtopicSlugs: ["product-rule"],
    },
  ],

  // ─── 4. Quotient rule ──────────────────────────────────────────────────────
  "quotient-rule": [
    {
      content: "Differentiate $y = \\dfrac{3x - 2}{x + 4}$.",
      marks: 2,
      difficulty: "EASY",
      solutionContent:
        "**Step 1 (1 mark):** Let $u = 3x - 2$, $v = x + 4$, so $u' = 3$, $v' = 1$.\n\n$$\\dfrac{dy}{dx} = \\dfrac{u'v - uv'}{v^2} = \\dfrac{3(x + 4) - (3x - 2)(1)}{(x + 4)^2}$$\n\n**Step 2 (1 mark):** Simplify the numerator.\n\n$$\\dfrac{dy}{dx} = \\dfrac{14}{(x + 4)^2}$$",
      subtopicSlugs: ["quotient-rule"],
    },
    {
      content: "Find $f'(x)$ when $f(x) = \\dfrac{e^x}{x}$ for $x \\neq 0$.",
      marks: 2,
      difficulty: "EASY",
      solutionContent:
        "**Step 1 (1 mark):** Apply the quotient rule with $u = e^x$, $v = x$.\n\n$$f'(x) = \\dfrac{e^x \\cdot x - e^x \\cdot 1}{x^2}$$\n\n**Step 2 (1 mark):** Simplify.\n\n$$f'(x) = \\dfrac{e^x(x - 1)}{x^2}$$",
      subtopicSlugs: ["quotient-rule"],
    },
    {
      content: "Find the gradient of $y = \\dfrac{x^2 - 1}{x^2 + 1}$ at $x = 1$.",
      marks: 3,
      difficulty: "MEDIUM",
      solutionContent:
        "**Step 1 (1 mark):** Let $u = x^2 - 1$, $v = x^2 + 1$, so $u' = 2x$, $v' = 2x$.\n\n$$\\dfrac{dy}{dx} = \\dfrac{2x(x^2 + 1) - (x^2 - 1)(2x)}{(x^2 + 1)^2}$$\n\n**Step 2 (1 mark):** Simplify the numerator.\n\n$$\\dfrac{dy}{dx} = \\dfrac{2x[(x^2 + 1) - (x^2 - 1)]}{(x^2 + 1)^2} = \\dfrac{4x}{(x^2 + 1)^2}$$\n\n**Step 3 (1 mark):** Substitute $x = 1$.\n\n$$\\left.\\dfrac{dy}{dx}\\right|_{x=1} = \\dfrac{4}{4} = 1$$",
      subtopicSlugs: ["quotient-rule"],
    },
    {
      content: "Differentiate $y = \\dfrac{\\sin x}{x^2}$ for $x \\neq 0$.",
      marks: 3,
      difficulty: "MEDIUM",
      solutionContent:
        "**Step 1 (1 mark):** Identify $u = \\sin x$, $v = x^2$, so $u' = \\cos x$, $v' = 2x$.\n\n**Step 2 (1 mark):** Apply the quotient rule.\n\n$$\\dfrac{dy}{dx} = \\dfrac{\\cos x \\cdot x^2 - \\sin x \\cdot 2x}{x^4}$$\n\n**Step 3 (1 mark):** Factor $x$ from the numerator.\n\n$$\\dfrac{dy}{dx} = \\dfrac{x\\cos x - 2\\sin x}{x^3}$$",
      subtopicSlugs: ["quotient-rule"],
    },
    {
      content: "Let $f(x) = \\dfrac{x + 1}{e^x}$. Find the $x$-coordinate of the stationary point.",
      marks: 4,
      difficulty: "HARD",
      solutionContent:
        "**Step 1 (1 mark):** Let $u = x + 1$, $v = e^x$, so $u' = 1$, $v' = e^x$.\n\n$$f'(x) = \\dfrac{1 \\cdot e^x - (x + 1)e^x}{(e^x)^2}$$\n\n**Step 2 (1 mark):** Simplify the numerator by factoring $e^x$.\n\n$$f'(x) = \\dfrac{e^x(1 - (x + 1))}{e^{2x}} = \\dfrac{-x}{e^x}$$\n\n**Step 3 (1 mark):** Set $f'(x) = 0$.\n\n$$\\dfrac{-x}{e^x} = 0$$\n\n**Step 4 (1 mark):** Since $e^x \\neq 0$, solve.\n\n$$x = 0$$",
      subtopicSlugs: ["quotient-rule"],
    },
  ],

  // ─── 5. Optimisation ───────────────────────────────────────────────────────
  "optimisation": [
    {
      content: "Find the maximum value of $f(x) = 6x - x^2$ on the interval $[0, 5]$.",
      marks: 2,
      difficulty: "EASY",
      solutionContent:
        "**Step 1 (1 mark):** Differentiate and solve $f'(x) = 0$.\n\n$$f'(x) = 6 - 2x = 0 \\Rightarrow x = 3$$\n\n**Step 2 (1 mark):** Evaluate $f$ at $x = 3$ (an interior maximum since $f'' = -2 < 0$).\n\n$$f(3) = 18 - 9 = 9$$",
      subtopicSlugs: ["optimisation"],
    },
    {
      content: "A cylinder has fixed volume $V = 54\\pi$ cm$^3$. Show that its surface area $S = 2\\pi r^2 + \\dfrac{108\\pi}{r}$ and find the radius that minimises $S$.",
      marks: 4,
      difficulty: "MEDIUM",
      solutionContent:
        "**Step 1 (1 mark):** From $V = \\pi r^2 h = 54\\pi$, obtain $h = \\dfrac{54}{r^2}$.\n\n**Step 2 (1 mark):** Substitute into $S = 2\\pi r^2 + 2\\pi r h$.\n\n$$S = 2\\pi r^2 + 2\\pi r \\cdot \\dfrac{54}{r^2} = 2\\pi r^2 + \\dfrac{108\\pi}{r}$$\n\n**Step 3 (1 mark):** Differentiate and solve $\\dfrac{dS}{dr} = 0$.\n\n$$\\dfrac{dS}{dr} = 4\\pi r - \\dfrac{108\\pi}{r^2} = 0$$\n\n$$4\\pi r^3 = 108\\pi \\Rightarrow r^3 = 27$$\n\n**Step 4 (1 mark):** Solve and confirm it is a minimum.\n\n$$r = 3 \\text{ cm}$$\n\nThe second derivative $\\dfrac{d^2S}{dr^2} = 4\\pi + \\dfrac{216\\pi}{r^3} > 0$, so this is a minimum.",
      subtopicSlugs: ["optimisation"],
    },
    {
      content: "Find two positive numbers whose sum is $20$ and whose product of one with the square of the other is a maximum.",
      marks: 3,
      difficulty: "MEDIUM",
      solutionContent:
        "**Step 1 (1 mark):** Let the numbers be $x$ and $20 - x$. Maximise $P(x) = x(20 - x)^2$ for $0 < x < 20$.\n\n**Step 2 (1 mark):** Differentiate using the product rule.\n\n$$P'(x) = (20 - x)^2 + x \\cdot 2(20 - x)(-1)$$\n\n$$P'(x) = (20 - x)[(20 - x) - 2x] = (20 - x)(20 - 3x)$$\n\n**Step 3 (1 mark):** Set $P'(x) = 0$ and select the interior critical point.\n\n$$20 - 3x = 0 \\Rightarrow x = \\dfrac{20}{3}$$\n\nThe numbers are $\\dfrac{20}{3}$ and $\\dfrac{40}{3}$.",
      subtopicSlugs: ["optimisation"],
    },
    {
      content: "A box with a square base and open top has volume $32$ m$^3$. Find the dimensions that minimise the surface area.",
      marks: 4,
      difficulty: "HARD",
      solutionContent:
        "**Step 1 (1 mark):** Let the base side be $x$ m and height $h$ m. From $V = x^2 h = 32$, obtain $h = \\dfrac{32}{x^2}$.\n\n**Step 2 (1 mark):** Surface area (base plus four sides).\n\n$$S = x^2 + 4xh = x^2 + \\dfrac{128}{x}$$\n\n**Step 3 (1 mark):** Differentiate and set to zero.\n\n$$\\dfrac{dS}{dx} = 2x - \\dfrac{128}{x^2} = 0$$\n\n$$2x^3 = 128 \\Rightarrow x^3 = 64 \\Rightarrow x = 4$$\n\n**Step 4 (1 mark):** Find $h$ and verify it is a minimum.\n\n$$h = \\dfrac{32}{16} = 2 \\text{ m}$$\n\nDimensions: base $4 \\times 4$ m, height $2$ m.",
      subtopicSlugs: ["optimisation"],
    },
    {
      content: "Find the point on the line $y = 2x - 1$ closest to the origin.",
      marks: 3,
      difficulty: "MEDIUM",
      solutionContent:
        "**Step 1 (1 mark):** Minimise the squared distance $D(x) = x^2 + (2x - 1)^2$.\n\n$$D(x) = x^2 + 4x^2 - 4x + 1 = 5x^2 - 4x + 1$$\n\n**Step 2 (1 mark):** Differentiate and solve.\n\n$$D'(x) = 10x - 4 = 0 \\Rightarrow x = \\dfrac{2}{5}$$\n\n**Step 3 (1 mark):** Compute $y$.\n\n$$y = 2\\left(\\dfrac{2}{5}\\right) - 1 = -\\dfrac{1}{5}$$\n\nThe closest point is $\\left(\\dfrac{2}{5}, -\\dfrac{1}{5}\\right)$.",
      subtopicSlugs: ["optimisation"],
    },
  ],

  // ─── 6. Antidifferentiation ────────────────────────────────────────────────
  "antidifferentiation": [
    {
      content: "Find $\\int (6x^2 - 4x + 5)\\, dx$.",
      marks: 2,
      difficulty: "EASY",
      solutionContent:
        "**Step 1 (1 mark):** Antidifferentiate term by term using the power rule.\n\n$$\\int (6x^2 - 4x + 5)\\, dx = 2x^3 - 2x^2 + 5x + C$$\n\n**Step 2 (1 mark):** State the final answer with the constant of integration $C$.\n\n$$= 2x^3 - 2x^2 + 5x + C$$",
      subtopicSlugs: ["antidifferentiation"],
    },
    {
      content: "Find $\\int \\cos(3x)\\, dx$.",
      marks: 2,
      difficulty: "EASY",
      solutionContent:
        "**Step 1 (1 mark):** Use $\\int \\cos(ax)\\, dx = \\dfrac{1}{a}\\sin(ax) + C$.\n\n$$\\int \\cos(3x)\\, dx = \\dfrac{1}{3}\\sin(3x) + C$$\n\n**Step 2 (1 mark):** Confirm the answer is fully simplified.\n\n$$= \\dfrac{\\sin(3x)}{3} + C$$",
      subtopicSlugs: ["antidifferentiation"],
    },
    {
      content: "Find $f(x)$ given that $f'(x) = 4x - e^x$ and $f(0) = 5$.",
      marks: 3,
      difficulty: "MEDIUM",
      solutionContent:
        "**Step 1 (1 mark):** Antidifferentiate.\n\n$$f(x) = 2x^2 - e^x + C$$\n\n**Step 2 (1 mark):** Apply the initial condition $f(0) = 5$.\n\n$$2(0)^2 - e^0 + C = 5 \\Rightarrow -1 + C = 5$$\n\n**Step 3 (1 mark):** Solve for $C$ and write the final answer.\n\n$$C = 6$$\n\n$$f(x) = 2x^2 - e^x + 6$$",
      subtopicSlugs: ["antidifferentiation"],
    },
    {
      content: "A particle has velocity $v(t) = 3t^2 - 6t$ m/s, and is at $s = 4$ m when $t = 0$. Find its position $s(t)$.",
      marks: 3,
      difficulty: "MEDIUM",
      solutionContent:
        "**Step 1 (1 mark):** Antidifferentiate the velocity.\n\n$$s(t) = t^3 - 3t^2 + C$$\n\n**Step 2 (1 mark):** Apply $s(0) = 4$.\n\n$$0 - 0 + C = 4 \\Rightarrow C = 4$$\n\n**Step 3 (1 mark):** State $s(t)$.\n\n$$s(t) = t^3 - 3t^2 + 4$$",
      subtopicSlugs: ["antidifferentiation"],
    },
    {
      content: "Find $\\int \\dfrac{3}{2x + 1}\\, dx$ for $x > -\\dfrac{1}{2}$.",
      marks: 4,
      difficulty: "HARD",
      solutionContent:
        "**Step 1 (1 mark):** Factor the constant from the integral.\n\n$$\\int \\dfrac{3}{2x + 1}\\, dx = 3\\int \\dfrac{1}{2x + 1}\\, dx$$\n\n**Step 2 (1 mark):** Use $\\int \\dfrac{1}{ax + b}\\, dx = \\dfrac{1}{a}\\ln|ax + b| + C$ with $a = 2$.\n\n$$3 \\cdot \\dfrac{1}{2}\\ln|2x + 1| + C$$\n\n**Step 3 (1 mark):** Simplify.\n\n$$= \\dfrac{3}{2}\\ln(2x + 1) + C$$\n\n**Step 4 (1 mark):** State the final answer, noting the domain.\n\n$$\\int \\dfrac{3}{2x + 1}\\, dx = \\dfrac{3}{2}\\ln(2x + 1) + C, \\quad x > -\\dfrac{1}{2}$$",
      subtopicSlugs: ["antidifferentiation"],
    },
  ],

  // ─── 7. Definite integrals ─────────────────────────────────────────────────
  "definite-integrals": [
    {
      content: "Evaluate $\\int_0^2 (3x^2 + 2)\\, dx$.",
      marks: 2,
      difficulty: "EASY",
      solutionContent:
        "**Step 1 (1 mark):** Find an antiderivative.\n\n$$F(x) = x^3 + 2x$$\n\n**Step 2 (1 mark):** Apply the Fundamental Theorem.\n\n$$F(2) - F(0) = (8 + 4) - 0 = 12$$",
      subtopicSlugs: ["definite-integrals"],
    },
    {
      content: "Evaluate $\\int_0^{\\pi/4} \\sec^2 x\\, dx$.",
      marks: 2,
      difficulty: "EASY",
      solutionContent:
        "**Step 1 (1 mark):** An antiderivative of $\\sec^2 x$ is $\\tan x$.\n\n$$\\int_0^{\\pi/4} \\sec^2 x\\, dx = [\\tan x]_0^{\\pi/4}$$\n\n**Step 2 (1 mark):** Evaluate at the bounds.\n\n$$= \\tan(\\pi/4) - \\tan 0 = 1 - 0 = 1$$",
      subtopicSlugs: ["definite-integrals"],
    },
    {
      content: "Evaluate $\\int_1^e \\dfrac{\\ln x}{x}\\, dx$, given that $\\dfrac{d}{dx}\\left[\\dfrac{1}{2}(\\ln x)^2\\right] = \\dfrac{\\ln x}{x}$.",
      marks: 3,
      difficulty: "MEDIUM",
      solutionContent:
        "**Step 1 (1 mark):** Recognise the antiderivative from the given hint.\n\n$$F(x) = \\dfrac{1}{2}(\\ln x)^2$$\n\n**Step 2 (1 mark):** Apply the Fundamental Theorem.\n\n$$\\int_1^e \\dfrac{\\ln x}{x}\\, dx = \\dfrac{1}{2}(\\ln e)^2 - \\dfrac{1}{2}(\\ln 1)^2$$\n\n**Step 3 (1 mark):** Simplify.\n\n$$= \\dfrac{1}{2}(1)^2 - \\dfrac{1}{2}(0)^2 = \\dfrac{1}{2}$$",
      subtopicSlugs: ["definite-integrals"],
    },
    {
      content: "Given $\\int_0^2 f(x)\\, dx = 5$ and $\\int_2^5 f(x)\\, dx = -2$, find $\\int_0^5 (f(x) + 3)\\, dx$.",
      marks: 3,
      difficulty: "MEDIUM",
      solutionContent:
        "**Step 1 (1 mark):** Use the additivity property.\n\n$$\\int_0^5 f(x)\\, dx = 5 + (-2) = 3$$\n\n**Step 2 (1 mark):** Split the integral using linearity.\n\n$$\\int_0^5 (f(x) + 3)\\, dx = \\int_0^5 f(x)\\, dx + \\int_0^5 3\\, dx$$\n\n**Step 3 (1 mark):** Evaluate.\n\n$$= 3 + 3(5 - 0) = 3 + 15 = 18$$",
      subtopicSlugs: ["definite-integrals"],
    },
    {
      content: "Find $a > 0$ such that $\\int_0^a (2x + 1)\\, dx = 12$.",
      marks: 4,
      difficulty: "HARD",
      solutionContent:
        "**Step 1 (1 mark):** Antidifferentiate.\n\n$$F(x) = x^2 + x$$\n\n**Step 2 (1 mark):** Apply the Fundamental Theorem.\n\n$$\\int_0^a (2x + 1)\\, dx = a^2 + a - 0 = a^2 + a$$\n\n**Step 3 (1 mark):** Set equal to $12$ and rearrange.\n\n$$a^2 + a - 12 = 0$$\n\n$$(a + 4)(a - 3) = 0$$\n\n**Step 4 (1 mark):** Select the positive root.\n\n$$a = 3$$",
      subtopicSlugs: ["definite-integrals"],
    },
  ],

  // ─── 8. Tangents and normals ───────────────────────────────────────────────
  "tangents-and-normals": [
    {
      content: "Find the equation of the tangent to $y = 4\\sqrt{x}$ at $x = 4$.",
      marks: 2,
      difficulty: "EASY",
      solutionContent:
        "**Step 1 (1 mark):** Find $\\dfrac{dy}{dx}$ and the point. $y = 4x^{1/2}$, so $\\dfrac{dy}{dx} = 2x^{-1/2}$. At $x = 4$: gradient $= 2/2 = 1$; $y = 4 \\cdot 2 = 8$.\n\n**Step 2 (1 mark):** Write the tangent using $y - y_0 = m(x - x_0)$.\n\n$$y - 8 = 1(x - 4)$$\n\n$$y = x + 4$$",
      subtopicSlugs: ["tangents-and-normals"],
    },
    {
      content: "Find the equation of the normal to $y = \\cos x$ at $x = 0$.",
      marks: 3,
      difficulty: "EASY",
      solutionContent:
        "**Step 1 (1 mark):** At $x = 0$, $y = 1$, so the point is $(0, 1)$.\n\n**Step 2 (1 mark):** $\\dfrac{dy}{dx} = -\\sin x$, so at $x = 0$ the tangent gradient is $0$.\n\n**Step 3 (1 mark):** Since the tangent is horizontal, the normal is vertical.\n\n$$x = 0$$",
      subtopicSlugs: ["tangents-and-normals"],
    },
    {
      content: "Find the values of $x$ at which the tangent to $y = x^3 - 12x + 5$ is parallel to the $x$-axis.",
      marks: 3,
      difficulty: "MEDIUM",
      solutionContent:
        "**Step 1 (1 mark):** Tangents parallel to the $x$-axis have gradient zero, so solve $\\dfrac{dy}{dx} = 0$.\n\n$$\\dfrac{dy}{dx} = 3x^2 - 12$$\n\n**Step 2 (1 mark):** Set equal to zero.\n\n$$3x^2 - 12 = 0$$\n\n$$x^2 = 4$$\n\n**Step 3 (1 mark):** Solve.\n\n$$x = 2 \\text{ or } x = -2$$",
      subtopicSlugs: ["tangents-and-normals"],
    },
    {
      content: "Find the equation of the tangent to $y = e^{2x}$ at $x = \\ln 2$.",
      marks: 3,
      difficulty: "MEDIUM",
      solutionContent:
        "**Step 1 (1 mark):** Compute the $y$-coordinate at $x = \\ln 2$.\n\n$$y = e^{2\\ln 2} = e^{\\ln 4} = 4$$\n\n**Step 2 (1 mark):** Compute the gradient.\n\n$$\\dfrac{dy}{dx} = 2e^{2x}$$\n\nAt $x = \\ln 2$: gradient $= 2 \\cdot 4 = 8$.\n\n**Step 3 (1 mark):** Write the tangent equation.\n\n$$y - 4 = 8(x - \\ln 2)$$\n\n$$y = 8x - 8\\ln 2 + 4$$",
      subtopicSlugs: ["tangents-and-normals"],
    },
    {
      content: "The tangent to $y = x^2$ at the point $(a, a^2)$ passes through $(1, 0)$. Find the possible values of $a$.",
      marks: 4,
      difficulty: "HARD",
      solutionContent:
        "**Step 1 (1 mark):** Find the gradient at $x = a$.\n\n$$\\dfrac{dy}{dx} = 2x \\Rightarrow \\text{gradient} = 2a$$\n\n**Step 2 (1 mark):** Write the tangent line through $(a, a^2)$.\n\n$$y - a^2 = 2a(x - a)$$\n\n**Step 3 (1 mark):** Substitute $(1, 0)$.\n\n$$0 - a^2 = 2a(1 - a)$$\n\n$$-a^2 = 2a - 2a^2$$\n\n**Step 4 (1 mark):** Solve the quadratic.\n\n$$a^2 - 2a = 0$$\n\n$$a(a - 2) = 0 \\Rightarrow a = 0 \\text{ or } a = 2$$",
      subtopicSlugs: ["tangents-and-normals"],
    },
  ],

  // ─── 9. Rates of change ────────────────────────────────────────────────────
  "rates-of-change": [
    {
      content: "The volume of a cube of side $x$ cm is $V = x^3$. Find $\\dfrac{dV}{dx}$ when $x = 5$ cm.",
      marks: 2,
      difficulty: "EASY",
      solutionContent:
        "**Step 1 (1 mark):** Differentiate the volume function.\n\n$$\\dfrac{dV}{dx} = 3x^2$$\n\n**Step 2 (1 mark):** Evaluate at $x = 5$.\n\n$$\\left.\\dfrac{dV}{dx}\\right|_{x=5} = 3(25) = 75 \\text{ cm}^2$$",
      subtopicSlugs: ["rates-of-change"],
    },
    {
      content: "A particle moves such that $s(t) = 2t^3 - 9t^2 + 12t$ metres for $t \\geq 0$ seconds. Find the time(s) when the particle is momentarily at rest.",
      marks: 3,
      difficulty: "MEDIUM",
      solutionContent:
        "**Step 1 (1 mark):** Velocity is the derivative of position.\n\n$$v(t) = 6t^2 - 18t + 12$$\n\n**Step 2 (1 mark):** Set $v(t) = 0$.\n\n$$6(t^2 - 3t + 2) = 0$$\n\n$$t^2 - 3t + 2 = 0$$\n\n**Step 3 (1 mark):** Factor and solve.\n\n$$(t - 1)(t - 2) = 0 \\Rightarrow t = 1 \\text{ or } t = 2 \\text{ seconds}$$",
      subtopicSlugs: ["rates-of-change"],
    },
    {
      content: "The side length of a square is increasing at $0.5$ cm/s. Find the rate at which the area is increasing when the side length is $8$ cm.",
      marks: 3,
      difficulty: "MEDIUM",
      solutionContent:
        "**Step 1 (1 mark):** Let $A = x^2$. Differentiate with respect to $t$.\n\n$$\\dfrac{dA}{dt} = 2x \\cdot \\dfrac{dx}{dt}$$\n\n**Step 2 (1 mark):** Substitute $x = 8$ and $\\dfrac{dx}{dt} = 0.5$.\n\n$$\\dfrac{dA}{dt} = 2(8)(0.5)$$\n\n**Step 3 (1 mark):** Evaluate.\n\n$$\\dfrac{dA}{dt} = 8 \\text{ cm}^2\\text{/s}$$",
      subtopicSlugs: ["rates-of-change"],
    },
    {
      content: "The temperature (in $^\\circ$C) of a cooling body is $T(t) = 20 + 60 e^{-0.1 t}$ where $t$ is in minutes. Find the rate of change of temperature when $t = 10$.",
      marks: 3,
      difficulty: "MEDIUM",
      solutionContent:
        "**Step 1 (1 mark):** Differentiate using the chain rule.\n\n$$T'(t) = 60 \\cdot (-0.1) e^{-0.1 t}$$\n\n**Step 2 (1 mark):** Simplify.\n\n$$T'(t) = -6 e^{-0.1 t}$$\n\n**Step 3 (1 mark):** Substitute $t = 10$.\n\n$$T'(10) = -6 e^{-1} = -\\dfrac{6}{e} \\; ^\\circ\\text{C/min}$$",
      subtopicSlugs: ["rates-of-change"],
    },
    {
      content: "A spherical balloon is inflated so its volume increases at $100$ cm$^3$/s. Find the rate at which the radius is increasing when $r = 5$ cm. (Use $V = \\dfrac{4}{3}\\pi r^3$.)",
      marks: 4,
      difficulty: "HARD",
      solutionContent:
        "**Step 1 (1 mark):** Differentiate $V = \\dfrac{4}{3}\\pi r^3$ with respect to $t$.\n\n$$\\dfrac{dV}{dt} = 4\\pi r^2 \\cdot \\dfrac{dr}{dt}$$\n\n**Step 2 (1 mark):** Rearrange for $\\dfrac{dr}{dt}$.\n\n$$\\dfrac{dr}{dt} = \\dfrac{1}{4\\pi r^2} \\cdot \\dfrac{dV}{dt}$$\n\n**Step 3 (1 mark):** Substitute $r = 5$ and $\\dfrac{dV}{dt} = 100$.\n\n$$\\dfrac{dr}{dt} = \\dfrac{100}{4\\pi (25)}$$\n\n**Step 4 (1 mark):** Simplify.\n\n$$\\dfrac{dr}{dt} = \\dfrac{1}{\\pi} \\text{ cm/s}$$",
      subtopicSlugs: ["rates-of-change"],
    },
  ],

  // ─── 10. Stationary points and curve sketching ────────────────────────────
  "stationary-points-and-curve-sketching": [
    {
      content: "Find the coordinates of the turning point of $y = x^2 + 8x + 3$.",
      marks: 2,
      difficulty: "EASY",
      solutionContent:
        "**Step 1 (1 mark):** Set the derivative to zero.\n\n$$\\dfrac{dy}{dx} = 2x + 8 = 0 \\Rightarrow x = -4$$\n\n**Step 2 (1 mark):** Find the $y$-coordinate.\n\n$$y = (-4)^2 + 8(-4) + 3 = 16 - 32 + 3 = -13$$\n\nTurning point: $(-4, -13)$.",
      subtopicSlugs: ["stationary-points-and-curve-sketching"],
    },
    {
      content: "Find the stationary points of $f(x) = 2x^3 - 9x^2 + 12x - 1$ and classify each using the second derivative test.",
      marks: 4,
      difficulty: "MEDIUM",
      solutionContent:
        "**Step 1 (1 mark):** Compute $f'(x)$ and set to zero.\n\n$$f'(x) = 6x^2 - 18x + 12 = 6(x - 1)(x - 2)$$\n\nStationary points at $x = 1$ and $x = 2$.\n\n**Step 2 (1 mark):** Compute $f(1)$ and $f(2)$.\n\n$$f(1) = 2 - 9 + 12 - 1 = 4$$\n\n$$f(2) = 16 - 36 + 24 - 1 = 3$$\n\n**Step 3 (1 mark):** Compute $f''(x) = 12x - 18$ and test at each point.\n\n$$f''(1) = -6 < 0 \\Rightarrow \\text{local maximum at } (1, 4)$$\n\n**Step 4 (1 mark):** Classify the second point.\n\n$$f''(2) = 6 > 0 \\Rightarrow \\text{local minimum at } (2, 3)$$",
      subtopicSlugs: ["stationary-points-and-curve-sketching"],
    },
    {
      content: "Determine the intervals on which $f(x) = x^3 - 12x$ is decreasing.",
      marks: 3,
      difficulty: "MEDIUM",
      solutionContent:
        "**Step 1 (1 mark):** Find $f'(x)$ and set to zero.\n\n$$f'(x) = 3x^2 - 12 = 3(x - 2)(x + 2)$$\n\n**Step 2 (1 mark):** Identify the sign of $f'(x)$ between the critical points $x = -2$ and $x = 2$.\n\nAt $x = 0$: $f'(0) = -12 < 0$.\n\n**Step 3 (1 mark):** State the interval.\n\n$f$ is decreasing on $(-2, 2)$.",
      subtopicSlugs: ["stationary-points-and-curve-sketching"],
    },
    {
      content: "Find the coordinates of the point of inflection of $f(x) = x^3 + 3x^2 + 1$.",
      marks: 3,
      difficulty: "MEDIUM",
      solutionContent:
        "**Step 1 (1 mark):** Find the second derivative.\n\n$$f'(x) = 3x^2 + 6x$$\n\n$$f''(x) = 6x + 6$$\n\n**Step 2 (1 mark):** Solve $f''(x) = 0$.\n\n$$6x + 6 = 0 \\Rightarrow x = -1$$\n\nSince $f''$ changes sign at $x = -1$ (from negative to positive), it is a point of inflection.\n\n**Step 3 (1 mark):** Compute the $y$-coordinate.\n\n$$f(-1) = -1 + 3 + 1 = 3$$\n\nPoint of inflection: $(-1, 3)$.",
      subtopicSlugs: ["stationary-points-and-curve-sketching"],
    },
    {
      content: "For $f(x) = x^4 - 2x^2$, find all stationary points and determine which are local maxima and which are local minima.",
      marks: 4,
      difficulty: "HARD",
      solutionContent:
        "**Step 1 (1 mark):** Differentiate and factor.\n\n$$f'(x) = 4x^3 - 4x = 4x(x^2 - 1) = 4x(x - 1)(x + 1)$$\n\n**Step 2 (1 mark):** Solve $f'(x) = 0$.\n\n$$x = -1, \\; 0, \\; 1$$\n\n**Step 3 (1 mark):** Use the second derivative $f''(x) = 12x^2 - 4$ to classify each.\n\n$$f''(-1) = 8 > 0, \\quad f''(0) = -4 < 0, \\quad f''(1) = 8 > 0$$\n\n**Step 4 (1 mark):** State the results using $f(-1) = -1$, $f(0) = 0$, $f(1) = -1$.\n\nLocal minima at $(-1, -1)$ and $(1, -1)$; local maximum at $(0, 0)$.",
      subtopicSlugs: ["stationary-points-and-curve-sketching"],
    },
  ],

  // ─── 11. Area under curves ─────────────────────────────────────────────────
  "area-under-curves": [
    {
      content: "Find the area bounded by $y = 4x - x^2$ and the $x$-axis.",
      marks: 2,
      difficulty: "EASY",
      solutionContent:
        "**Step 1 (1 mark):** Find the $x$-intercepts.\n\n$$4x - x^2 = 0 \\Rightarrow x(4 - x) = 0$$\n\nIntercepts at $x = 0$ and $x = 4$. The parabola is above the $x$-axis between them.\n\n**Step 2 (1 mark):** Evaluate the definite integral.\n\n$$A = \\int_0^4 (4x - x^2)\\, dx = \\left[2x^2 - \\dfrac{x^3}{3}\\right]_0^4 = 32 - \\dfrac{64}{3} = \\dfrac{32}{3}$$",
      subtopicSlugs: ["area-under-curves"],
    },
    {
      content: "Find the area under $y = \\dfrac{1}{x}$ from $x = 1$ to $x = e^2$.",
      marks: 2,
      difficulty: "EASY",
      solutionContent:
        "**Step 1 (1 mark):** An antiderivative is $\\ln x$.\n\n$$A = \\int_1^{e^2} \\dfrac{1}{x}\\, dx = [\\ln x]_1^{e^2}$$\n\n**Step 2 (1 mark):** Evaluate.\n\n$$A = \\ln(e^2) - \\ln 1 = 2 - 0 = 2$$",
      subtopicSlugs: ["area-under-curves"],
    },
    {
      content: "Find the area of the region bounded by $y = x^2$, $y = 9$, and the $y$-axis in the first quadrant.",
      marks: 3,
      difficulty: "MEDIUM",
      solutionContent:
        "**Step 1 (1 mark):** The curves meet at $x = 3$ (since $x^2 = 9$) in the first quadrant, and the region is bounded on the left by $x = 0$.\n\n**Step 2 (1 mark):** Set up the integral between the top ($y = 9$) and bottom ($y = x^2$) curves.\n\n$$A = \\int_0^3 (9 - x^2)\\, dx$$\n\n**Step 3 (1 mark):** Evaluate.\n\n$$A = \\left[9x - \\dfrac{x^3}{3}\\right]_0^3 = 27 - 9 = 18$$",
      subtopicSlugs: ["area-under-curves"],
    },
    {
      content: "Find the exact area between $y = \\cos x$ and the $x$-axis from $x = 0$ to $x = \\pi$.",
      marks: 3,
      difficulty: "MEDIUM",
      solutionContent:
        "**Step 1 (1 mark):** Note that $\\cos x \\geq 0$ on $[0, \\pi/2]$ and $\\cos x \\leq 0$ on $[\\pi/2, \\pi]$.\n\n**Step 2 (1 mark):** Split the integral and take the absolute value on the negative piece.\n\n$$A = \\int_0^{\\pi/2} \\cos x\\, dx + \\left|\\int_{\\pi/2}^{\\pi} \\cos x\\, dx\\right|$$\n\n**Step 3 (1 mark):** Evaluate each piece.\n\n$$A = [\\sin x]_0^{\\pi/2} + |[\\sin x]_{\\pi/2}^{\\pi}| = 1 + |0 - 1| = 2$$",
      subtopicSlugs: ["area-under-curves"],
    },
    {
      content: "Find the area enclosed between $y = x + 2$ and $y = x^2$.",
      marks: 4,
      difficulty: "HARD",
      solutionContent:
        "**Step 1 (1 mark):** Find intersections by solving $x + 2 = x^2$.\n\n$$x^2 - x - 2 = 0 \\Rightarrow (x - 2)(x + 1) = 0$$\n\nIntersections at $x = -1$ and $x = 2$.\n\n**Step 2 (1 mark):** Determine which curve is on top on $(-1, 2)$.\n\nAt $x = 0$: line gives $2$, parabola gives $0$, so $y = x + 2$ is above.\n\n**Step 3 (1 mark):** Set up the definite integral.\n\n$$A = \\int_{-1}^{2} \\left[(x + 2) - x^2\\right] dx$$\n\n**Step 4 (1 mark):** Evaluate.\n\n$$A = \\left[\\dfrac{x^2}{2} + 2x - \\dfrac{x^3}{3}\\right]_{-1}^{2}$$\n\n$$= \\left(2 + 4 - \\dfrac{8}{3}\\right) - \\left(\\dfrac{1}{2} - 2 + \\dfrac{1}{3}\\right) = \\dfrac{10}{3} - \\left(-\\dfrac{7}{6}\\right) = \\dfrac{9}{2}$$",
      subtopicSlugs: ["area-under-curves"],
    },
  ],

  // ─── 12. Fundamental theorem of calculus ───────────────────────────────────
  "fundamental-theorem-of-calculus": [
    {
      content: "Let $F(x) = \\int_2^x (3t^2 + 1)\\, dt$. Find $F'(x)$.",
      marks: 2,
      difficulty: "EASY",
      solutionContent:
        "**Step 1 (1 mark):** By Part 1 of the Fundamental Theorem of Calculus, if $F(x) = \\int_a^x f(t)\\, dt$, then $F'(x) = f(x)$.\n\n**Step 2 (1 mark):** Apply with $f(t) = 3t^2 + 1$.\n\n$$F'(x) = 3x^2 + 1$$",
      subtopicSlugs: ["fundamental-theorem-of-calculus"],
    },
    {
      content: "Use the Fundamental Theorem of Calculus to evaluate $\\int_1^4 (2x - 3)\\, dx$.",
      marks: 2,
      difficulty: "EASY",
      solutionContent:
        "**Step 1 (1 mark):** Find an antiderivative $F(x) = x^2 - 3x$.\n\n**Step 2 (1 mark):** Apply $\\int_1^4 f(x)\\, dx = F(4) - F(1)$.\n\n$$F(4) - F(1) = (16 - 12) - (1 - 3) = 4 - (-2) = 6$$",
      subtopicSlugs: ["fundamental-theorem-of-calculus"],
    },
    {
      content: "Let $G(x) = \\int_0^x \\sin(t^2)\\, dt$. Find $G'(x)$ and state $G'(0)$.",
      marks: 3,
      difficulty: "MEDIUM",
      solutionContent:
        "**Step 1 (1 mark):** By Part 1 of the FTC, $G'(x)$ equals the integrand evaluated at the upper limit.\n\n$$G'(x) = \\sin(x^2)$$\n\n**Step 2 (1 mark):** Evaluate at $x = 0$.\n\n$$G'(0) = \\sin 0$$\n\n**Step 3 (1 mark):** Simplify.\n\n$$G'(0) = 0$$",
      subtopicSlugs: ["fundamental-theorem-of-calculus"],
    },
    {
      content: "If $H(x) = \\int_1^{3x} \\dfrac{1}{t}\\, dt$ for $x > 0$, find $H'(x)$ using the chain rule form of the FTC.",
      marks: 3,
      difficulty: "MEDIUM",
      solutionContent:
        "**Step 1 (1 mark):** Let $u = 3x$, so $H(x) = \\int_1^u \\dfrac{1}{t}\\, dt$ and $\\dfrac{du}{dx} = 3$.\n\n**Step 2 (1 mark):** Apply the chain-rule form: $H'(x) = \\dfrac{1}{u} \\cdot \\dfrac{du}{dx}$.\n\n$$H'(x) = \\dfrac{1}{3x} \\cdot 3$$\n\n**Step 3 (1 mark):** Simplify.\n\n$$H'(x) = \\dfrac{1}{x}$$",
      subtopicSlugs: ["fundamental-theorem-of-calculus"],
    },
    {
      content: "The velocity of a particle is $v(t) = 4 - t^2$ m/s for $0 \\leq t \\leq 3$. Find the total displacement from $t = 0$ to $t = 3$ using the FTC.",
      marks: 4,
      difficulty: "HARD",
      solutionContent:
        "**Step 1 (1 mark):** Displacement equals $\\int_0^3 v(t)\\, dt$.\n\n$$\\Delta s = \\int_0^3 (4 - t^2)\\, dt$$\n\n**Step 2 (1 mark):** Find an antiderivative.\n\n$$F(t) = 4t - \\dfrac{t^3}{3}$$\n\n**Step 3 (1 mark):** Apply the Fundamental Theorem.\n\n$$\\Delta s = F(3) - F(0) = \\left(12 - 9\\right) - 0$$\n\n**Step 4 (1 mark):** Simplify.\n\n$$\\Delta s = 3 \\text{ m}$$",
      subtopicSlugs: ["fundamental-theorem-of-calculus"],
    },
  ],
};

function main(): void {
  const slugs = Object.keys(NEW_QUESTIONS);
  for (const slug of slugs) {
    const filePath = path.join(OUT_DIR, `qset-${slug}.json`);
    if (!fs.existsSync(filePath)) {
      console.warn(`⚠️  ${filePath}: not found, skipping.`);
      continue;
    }
    const raw = fs.readFileSync(filePath, "utf-8");
    const data = JSON.parse(raw);
    if (!Array.isArray(data.shortAnswer)) {
      console.warn(`⚠️  ${filePath}: shortAnswer is not an array, skipping.`);
      continue;
    }
    if (data.shortAnswer.length >= 15) {
      console.log(
        `↷  ${slug}: already has ${data.shortAnswer.length} SAs, skipping.`
      );
      continue;
    }
    const additions = NEW_QUESTIONS[slug];
    // Validate mark totals in solution step headers equal the declared marks.
    for (const q of additions) {
      const markMatches = [...q.solutionContent.matchAll(/\*\*Step \d+ \((\d+) marks?\):\*\*/g)];
      const sum = markMatches.reduce((acc, m) => acc + Number(m[1]), 0);
      if (sum !== q.marks) {
        throw new Error(
          `[${slug}] Mark mismatch: declared ${q.marks}, step headers sum to ${sum}. Content: ${q.content.slice(0, 80)}`
        );
      }
    }
    data.shortAnswer.push(...additions);
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), "utf-8");
    console.log(
      `✅  ${slug}: appended ${additions.length} SAs → ${data.shortAnswer.length} total.`
    );
  }
}

main();
