import { readFileSync, writeFileSync } from "fs";
import { join } from "path";

const OUTPUT_DIR = join(__dirname, "output");

interface EAItem {
  content: string;
  marks: number;
  difficulty: "MEDIUM" | "HARD";
  solutionContent: string;
  subtopicSlugs: string[];
}

interface QSetFile {
  mcq: unknown[];
  shortAnswer: unknown[];
  extendedResponse: unknown[];
  extendedAnswer?: EAItem[];
}

// ─── Polynomial Functions ───────────────────────────────────────────────

const polynomialEA: EAItem[] = [
  {
    content:
      "Let $f(x) = x^3 - 3x^2 - 4x + 12$.\n\n**a.** Show that $(x - 2)$ is a factor of $f(x)$. **(1 mark)**\n\n**b.** Hence, express $f(x)$ as a product of three linear factors. **(2 marks)**\n\n**c.** State the coordinates of all axial intercepts of the graph of $y = f(x)$. **(1 mark)**",
    marks: 4,
    difficulty: "MEDIUM",
    solutionContent:
      "**a. (1 mark)**\n\n*Step 1 (1 mark):* Evaluate $f(2)$.\n\n$$f(2) = 8 - 12 - 8 + 12$$\n\n$$= 0$$\n\nSince $f(2) = 0$, $(x - 2)$ is a factor.\n\n**b. (2 marks)**\n\n*Step 1 (1 mark):* Divide $f(x)$ by $(x - 2)$.\n\n$$f(x) = (x - 2)(x^2 - x - 6)$$\n\n*Step 2 (1 mark):* Factor the quadratic.\n\n$$f(x) = (x - 2)(x - 3)(x + 2)$$\n\n**c. (1 mark)**\n\n*Step 1 (1 mark):* The $x$-intercepts are $(2, 0)$, $(3, 0)$, and $(-2, 0)$. The $y$-intercept is $(0, 12)$.",
    subtopicSlugs: ["polynomial-functions"],
  },
  {
    content:
      "Consider the polynomial $p(x) = x^3 + ax^2 + bx + 6$, where $a, b \\in R$.\n\nThe remainder when $p(x)$ is divided by $(x - 1)$ is $10$, and $(x + 1)$ is a factor of $p(x)$.\n\n**a.** Using the remainder theorem, show that $a + b = 3$. **(1 mark)**\n\n**b.** Using the factor theorem, find a second equation relating $a$ and $b$. **(1 mark)**\n\n**c.** Solve the simultaneous equations to find $a$ and $b$, and hence factorise $p(x)$ completely. **(3 marks)**",
    marks: 5,
    difficulty: "MEDIUM",
    solutionContent:
      "**a. (1 mark)**\n\n*Step 1 (1 mark):* By the remainder theorem, $p(1) = 10$.\n\n$$1 + a + b + 6 = 10$$\n\n$$a + b = 3$$\n\n**b. (1 mark)**\n\n*Step 1 (1 mark):* Since $(x + 1)$ is a factor, $p(-1) = 0$.\n\n$$-1 + a - b + 6 = 0$$\n\n$$a - b = -5$$\n\n**c. (3 marks)**\n\n*Step 1 (1 mark):* Add the two equations: $2a = -2$, so $a = -1$.\n\n*Step 2 (1 mark):* Substitute: $-1 + b = 3$, so $b = 4$.\n\n*Step 3 (1 mark):* $p(x) = x^3 - x^2 + 4x + 6$. Since $(x + 1)$ is a factor, divide:\n\n$$p(x) = (x + 1)(x^2 - 2x + 6)$$\n\nThe discriminant of $x^2 - 2x + 6$ is $4 - 24 = -20 < 0$, so $p(x) = (x + 1)(x^2 - 2x + 6)$ with $x = -1$ the only real root.",
    subtopicSlugs: ["polynomial-functions"],
  },
  {
    content:
      "The cubic polynomial $g(x) = x^3 - 6x^2 + 11x - 6$ has roots $x = 1$, $x = 2$, and $x = 3$.\n\n**a.** Verify that $x = 1$ is a root of $g(x)$. **(1 mark)**\n\n**b.** Find $g'(x)$ and determine the coordinates of the turning points of $g$. **(3 marks)**\n\n**c.** Sketch the graph of $y = g(x)$, labelling all axial intercepts and turning points. **(2 marks)**\n\n**d.** State the values of $x$ for which $g(x) > 0$. **(1 mark)**",
    marks: 7,
    difficulty: "HARD",
    solutionContent:
      "**a. (1 mark)**\n\n*Step 1 (1 mark):* Evaluate $g(1)$.\n\n$$g(1) = 1 - 6 + 11 - 6$$\n\n$$= 0$$\n\nSo $x = 1$ is a root.\n\n**b. (3 marks)**\n\n*Step 1 (1 mark):* Differentiate.\n\n$$g'(x) = 3x^2 - 12x + 11$$\n\n*Step 2 (1 mark):* Set $g'(x) = 0$ and solve using the quadratic formula.\n\n$$x = \\frac{12 \\pm \\sqrt{144 - 132}}{6}$$\n\n$$= \\frac{12 \\pm 2\\sqrt{3}}{6}$$\n\n$$= 2 \\pm \\frac{\\sqrt{3}}{3}$$\n\n*Step 3 (1 mark):* Evaluate $g$ at each.\n\nAt $x = 2 - \\dfrac{\\sqrt{3}}{3}$: local maximum.\n\n$$g\\!\\left(2 - \\frac{\\sqrt{3}}{3}\\right) = \\frac{2\\sqrt{3}}{9}$$\n\nAt $x = 2 + \\dfrac{\\sqrt{3}}{3}$: local minimum.\n\n$$g\\!\\left(2 + \\frac{\\sqrt{3}}{3}\\right) = -\\frac{2\\sqrt{3}}{9}$$\n\n**c. (2 marks)**\n\n*Step 1 (1 mark):* Plot $x$-intercepts at $(1, 0)$, $(2, 0)$, $(3, 0)$ and $y$-intercept at $(0, -6)$.\n\n*Step 2 (1 mark):* Draw a cubic increasing from bottom-left, through $(1,0)$, up to local max near $x \\approx 1.42$, down through $(2,0)$ to local min near $x \\approx 2.58$, then up through $(3,0)$ and continuing upward.\n\n**d. (1 mark)**\n\n*Step 1 (1 mark):* From the graph, $g(x) > 0$ for $x \\in (1, 2) \\cup (3, \\infty)$.",
    subtopicSlugs: ["polynomial-functions"],
  },
  {
    content:
      "Let $p(x) = x^4 - 5x^2 + 4$.\n\n**a.** By letting $u = x^2$, express $p(x)$ as a product of four linear factors. **(2 marks)**\n\n**b.** State the coordinates of the $y$-intercept of the graph of $y = p(x)$. **(1 mark)**\n\n**c.** Find the stationary points of $p(x)$ and determine their nature. **(3 marks)**\n\n**d.** Hence, state the range of $p$. **(1 mark)**\n\n**e.** State the number of solutions to $p(x) = -3$. **(1 mark)**",
    marks: 8,
    difficulty: "HARD",
    solutionContent:
      "**a. (2 marks)**\n\n*Step 1 (1 mark):* Substitute $u = x^2$.\n\n$$u^2 - 5u + 4 = (u - 1)(u - 4)$$\n\n*Step 2 (1 mark):* Replace $u$.\n\n$$p(x) = (x^2 - 1)(x^2 - 4)$$\n\n$$= (x - 1)(x + 1)(x - 2)(x + 2)$$\n\n**b. (1 mark)**\n\n*Step 1 (1 mark):* $p(0) = 4$, so the $y$-intercept is $(0, 4)$.\n\n**c. (3 marks)**\n\n*Step 1 (1 mark):* Differentiate.\n\n$$p'(x) = 4x^3 - 10x$$\n\n$$= 2x(2x^2 - 5)$$\n\n*Step 2 (1 mark):* Set $p'(x) = 0$: $x = 0$ or $x = \\pm\\sqrt{\\dfrac{5}{2}}$.\n\n*Step 3 (1 mark):* Evaluate: $p(0) = 4$ (local max). $p\\!\\left(\\pm\\sqrt{\\dfrac{5}{2}}\\right) = \\dfrac{25}{4} - \\dfrac{25}{2} + 4 = -\\dfrac{9}{4}$ (local minima).\n\n**d. (1 mark)**\n\n*Step 1 (1 mark):* Range is $\\left[-\\dfrac{9}{4}, \\infty\\right)$.\n\n**e. (1 mark)**\n\n*Step 1 (1 mark):* The line $y = -3$ is below the local minima $y = -\\dfrac{9}{4}$. Since $-3 < -\\dfrac{9}{4}$, the line intersects the quartic at $2$ points (the outer branches).",
    subtopicSlugs: ["polynomial-functions"],
  },
  {
    content:
      "Consider $f: R \\to R$, $f(x) = x^3 + 3x^2 - 9x + 5$.\n\n**a.** Show that $f(-5) = 0$ and hence express $f(x)$ as a product of linear factors. **(2 marks)**\n\n**b.** Find the coordinates of the stationary points of $f$ and determine their nature. **(3 marks)**\n\n**c.** Find the values of $k$ for which the equation $x^3 + 3x^2 - 9x + 5 = k$ has exactly one real solution. **(1 mark)**",
    marks: 6,
    difficulty: "MEDIUM",
    solutionContent:
      "**a. (2 marks)**\n\n*Step 1 (1 mark):* Evaluate $f(-5)$.\n\n$$f(-5) = -125 + 75 + 45 + 5$$\n\n$$= 0$$\n\n*Step 2 (1 mark):* Divide by $(x + 5)$.\n\n$$f(x) = (x + 5)(x^2 - 2x + 1)$$\n\n$$= (x + 5)(x - 1)^2$$\n\n**b. (3 marks)**\n\n*Step 1 (1 mark):* Differentiate.\n\n$$f'(x) = 3x^2 + 6x - 9$$\n\n$$= 3(x^2 + 2x - 3)$$\n\n$$= 3(x + 3)(x - 1)$$\n\n*Step 2 (1 mark):* Stationary points at $x = -3$ and $x = 1$.\n\n$$f(-3) = -27 + 27 + 27 + 5 = 32$$\n\n$$f(1) = 1 + 3 - 9 + 5 = 0$$\n\n*Step 3 (1 mark):* Using a sign diagram of $f'(x)$: at $x = -3$, $f'$ changes from $+$ to $-$, so $(-3, 32)$ is a local maximum. At $x = 1$, $f'$ changes from $-$ to $+$, so $(1, 0)$ is a local minimum.\n\n**c. (1 mark)**\n\n*Step 1 (1 mark):* The equation $f(x) = k$ has exactly one solution when the horizontal line $y = k$ intersects the cubic once. This occurs when $k > 32$ or $k < 0$.",
    subtopicSlugs: ["polynomial-functions"],
  },
];

// ─── Exponential Functions ──────────────────────────────────────────────

const exponentialEA: EAItem[] = [
  {
    content:
      "Let $f: R \\to R$, $f(x) = 2e^{x-1} - 4$.\n\n**a.** State the equation of the asymptote of the graph of $y = f(x)$. **(1 mark)**\n\n**b.** Find the coordinates of the axial intercepts. **(2 marks)**\n\n**c.** Sketch the graph of $y = f(x)$, labelling the asymptote and intercepts. **(1 mark)**",
    marks: 4,
    difficulty: "MEDIUM",
    solutionContent:
      "**a. (1 mark)**\n\n*Step 1 (1 mark):* As $x \\to -\\infty$, $e^{x-1} \\to 0$, so $y \\to -4$. The asymptote is $y = -4$.\n\n**b. (2 marks)**\n\n*Step 1 (1 mark):* $y$-intercept: set $x = 0$.\n\n$$f(0) = 2e^{-1} - 4$$\n\n$$= \\frac{2}{e} - 4$$\n\nSo the $y$-intercept is $\\left(0,\\, \\dfrac{2}{e} - 4\\right)$.\n\n*Step 2 (1 mark):* $x$-intercept: set $f(x) = 0$.\n\n$$2e^{x-1} = 4$$\n\n$$e^{x-1} = 2$$\n\n$$x = 1 + \\ln 2$$\n\nSo the $x$-intercept is $(1 + \\ln 2,\\, 0)$.\n\n**c. (1 mark)**\n\n*Step 1 (1 mark):* Sketch an increasing exponential curve with asymptote $y = -4$, passing through $\\left(0, \\dfrac{2}{e} - 4\\right)$ and $(1 + \\ln 2, 0)$.",
    subtopicSlugs: ["exponential-functions"],
  },
  {
    content:
      "The population of a colony of bacteria is modelled by $P(t) = 500e^{kt}$, where $t$ is the time in hours and $k$ is a positive constant.\n\nAfter $3$ hours, the population is $4000$.\n\n**a.** Show that $k = \\dfrac{\\ln 8}{3}$. **(2 marks)**\n\n**b.** Find the time at which the population reaches $16\\,000$. **(2 marks)**\n\n**c.** Find the rate of growth of the population when $t = 3$. **(2 marks)**",
    marks: 6,
    difficulty: "MEDIUM",
    solutionContent:
      "**a. (2 marks)**\n\n*Step 1 (1 mark):* Substitute $t = 3$, $P = 4000$.\n\n$$4000 = 500e^{3k}$$\n\n$$e^{3k} = 8$$\n\n*Step 2 (1 mark):* Take the natural logarithm.\n\n$$3k = \\ln 8$$\n\n$$k = \\frac{\\ln 8}{3}$$\n\n**b. (2 marks)**\n\n*Step 1 (1 mark):* Set $P(t) = 16\\,000$.\n\n$$500e^{kt} = 16\\,000$$\n\n$$e^{kt} = 32$$\n\n*Step 2 (1 mark):* Solve.\n\n$$kt = \\ln 32$$\n\n$$t = \\frac{\\ln 32}{k} = \\frac{\\ln 32}{\\frac{\\ln 8}{3}} = \\frac{3\\ln 32}{\\ln 8}$$\n\n$$= \\frac{3 \\cdot 5\\ln 2}{3\\ln 2} = 5$$\n\nThe population reaches $16\\,000$ after $5$ hours.\n\n**c. (2 marks)**\n\n*Step 1 (1 mark):* Differentiate.\n\n$$P'(t) = 500ke^{kt}$$\n\n*Step 2 (1 mark):* Substitute $t = 3$.\n\n$$P'(3) = 500 \\cdot \\frac{\\ln 8}{3} \\cdot 8$$\n\n$$= \\frac{4000\\ln 8}{3}$$",
    subtopicSlugs: ["exponential-functions"],
  },
  {
    content:
      "Let $g: R \\to R$, $g(x) = e^{2x} - 6e^x + 8$.\n\n**a.** By substituting $u = e^x$, express $g(x)$ in factored form. **(2 marks)**\n\n**b.** Hence, find the $x$-intercepts of the graph of $y = g(x)$. **(1 mark)**\n\n**c.** Find the minimum value of $g(x)$ and the value of $x$ at which it occurs. **(3 marks)**\n\n**d.** State the range of $g$. **(1 mark)**",
    marks: 7,
    difficulty: "HARD",
    solutionContent:
      "**a. (2 marks)**\n\n*Step 1 (1 mark):* Let $u = e^x$.\n\n$$g = u^2 - 6u + 8$$\n\n*Step 2 (1 mark):* Factor.\n\n$$= (u - 2)(u - 4)$$\n\n$$= (e^x - 2)(e^x - 4)$$\n\n**b. (1 mark)**\n\n*Step 1 (1 mark):* Set $g(x) = 0$: $e^x = 2$ or $e^x = 4$, giving $x = \\ln 2$ or $x = \\ln 4$.\n\n**c. (3 marks)**\n\n*Step 1 (1 mark):* Differentiate.\n\n$$g'(x) = 2e^{2x} - 6e^x$$\n\n$$= 2e^x(e^x - 3)$$\n\n*Step 2 (1 mark):* Set $g'(x) = 0$. Since $e^x > 0$, we need $e^x = 3$, so $x = \\ln 3$.\n\n*Step 3 (1 mark):* Evaluate.\n\n$$g(\\ln 3) = 9 - 18 + 8$$\n\n$$= -1$$\n\nMinimum value is $-1$ at $x = \\ln 3$.\n\n**d. (1 mark)**\n\n*Step 1 (1 mark):* Range is $[-1, \\infty)$.",
    subtopicSlugs: ["exponential-functions"],
  },
  {
    content:
      "Consider $f(x) = 3^x$ and $g(x) = 3^{2-x}$.\n\n**a.** Find the coordinates of the point of intersection of the graphs of $y = f(x)$ and $y = g(x)$. **(2 marks)**\n\n**b.** Sketch both graphs on the same set of axes, labelling the point of intersection and all $y$-intercepts. **(2 marks)**\n\n**c.** State the values of $x$ for which $3^x > 3^{2-x}$. **(1 mark)**",
    marks: 5,
    difficulty: "MEDIUM",
    solutionContent:
      "**a. (2 marks)**\n\n*Step 1 (1 mark):* Set $3^x = 3^{2-x}$.\n\n$$x = 2 - x$$\n\n$$2x = 2$$\n\n$$x = 1$$\n\n*Step 2 (1 mark):* $y = 3^1 = 3$. The point of intersection is $(1, 3)$.\n\n**b. (2 marks)**\n\n*Step 1 (1 mark):* $f(x) = 3^x$ has $y$-intercept $(0, 1)$, is increasing, with asymptote $y = 0$.\n\n*Step 2 (1 mark):* $g(x) = 3^{2-x} = 9 \\cdot 3^{-x}$ has $y$-intercept $(0, 9)$, is decreasing, with asymptote $y = 0$. Both pass through $(1, 3)$.\n\n**c. (1 mark)**\n\n*Step 1 (1 mark):* From the graph, $3^x > 3^{2-x}$ when $x > 1$.",
    subtopicSlugs: ["exponential-functions"],
  },
  {
    content:
      "The temperature $T$ (in $^\\circ$C) of a cup of coffee $t$ minutes after being poured is modelled by $T(t) = 20 + 60e^{-0.05t}$.\n\n**a.** State the initial temperature of the coffee. **(1 mark)**\n\n**b.** State the equation of the horizontal asymptote of $T(t)$ and interpret it in context. **(1 mark)**\n\n**c.** Find the exact time at which the coffee reaches $50^\\circ$C. **(2 marks)**\n\n**d.** Find the rate at which the temperature is decreasing at the time found in part (c). **(2 marks)**\n\n**e.** Explain why $T'(t) < 0$ for all $t > 0$. **(2 marks)**",
    marks: 8,
    difficulty: "HARD",
    solutionContent:
      "**a. (1 mark)**\n\n*Step 1 (1 mark):* $T(0) = 20 + 60 = 80$. The initial temperature is $80^\\circ$C.\n\n**b. (1 mark)**\n\n*Step 1 (1 mark):* As $t \\to \\infty$, $e^{-0.05t} \\to 0$, so $T \\to 20$. The asymptote is $T = 20$, representing the room temperature.\n\n**c. (2 marks)**\n\n*Step 1 (1 mark):* Set $T(t) = 50$.\n\n$$20 + 60e^{-0.05t} = 50$$\n\n$$e^{-0.05t} = \\frac{1}{2}$$\n\n*Step 2 (1 mark):* Take the natural logarithm.\n\n$$-0.05t = \\ln\\frac{1}{2}$$\n\n$$t = \\frac{\\ln 2}{0.05}$$\n\n$$= 20\\ln 2$$\n\n**d. (2 marks)**\n\n*Step 1 (1 mark):* Differentiate.\n\n$$T'(t) = -3e^{-0.05t}$$\n\n*Step 2 (1 mark):* Substitute $t = 20\\ln 2$.\n\n$$T'(20\\ln 2) = -3e^{-\\ln 2}$$\n\n$$= -3 \\cdot \\frac{1}{2}$$\n\n$$= -\\frac{3}{2}$$\n\nThe temperature is decreasing at $\\dfrac{3}{2}$ degrees per minute.\n\n**e. (2 marks)**\n\n*Step 1 (1 mark):* $T'(t) = -3e^{-0.05t}$.\n\n*Step 2 (1 mark):* Since $e^{-0.05t} > 0$ for all $t$, we have $T'(t) = -3 \\times (\\text{positive}) < 0$ for all $t > 0$.",
    subtopicSlugs: ["exponential-functions"],
  },
];

// ─── Logarithmic Functions ──────────────────────────────────────────────

const logarithmicEA: EAItem[] = [
  {
    content:
      "Let $f: (0, \\infty) \\to R$, $f(x) = \\ln(2x) - 1$.\n\n**a.** Find the $x$-intercept of the graph of $y = f(x)$. **(2 marks)**\n\n**b.** State the equation of the vertical asymptote. **(1 mark)**\n\n**c.** Sketch the graph of $y = f(x)$, labelling the intercept and asymptote. **(1 mark)**",
    marks: 4,
    difficulty: "MEDIUM",
    solutionContent:
      "**a. (2 marks)**\n\n*Step 1 (1 mark):* Set $f(x) = 0$.\n\n$$\\ln(2x) = 1$$\n\n*Step 2 (1 mark):* Solve.\n\n$$2x = e$$\n\n$$x = \\frac{e}{2}$$\n\nThe $x$-intercept is $\\left(\\dfrac{e}{2}, 0\\right)$.\n\n**b. (1 mark)**\n\n*Step 1 (1 mark):* The argument $2x > 0$ requires $x > 0$. The vertical asymptote is $x = 0$.\n\n**c. (1 mark)**\n\n*Step 1 (1 mark):* Draw a logarithmic curve with asymptote $x = 0$, passing through $\\left(\\dfrac{e}{2}, 0\\right)$, increasing for all $x > 0$.",
    subtopicSlugs: ["logarithmic-functions"],
  },
  {
    content:
      "Consider $g(x) = \\log_e(x + 3) - \\log_e(x - 1)$ for $x > 1$.\n\n**a.** Express $g(x)$ as a single logarithm. **(1 mark)**\n\n**b.** Find the value of $x$ for which $g(x) = \\ln 2$. **(2 marks)**\n\n**c.** Find the equation of the horizontal asymptote of $g(x)$ as $x \\to \\infty$. **(2 marks)**",
    marks: 5,
    difficulty: "MEDIUM",
    solutionContent:
      "**a. (1 mark)**\n\n*Step 1 (1 mark):* Using the log law $\\ln a - \\ln b = \\ln\\dfrac{a}{b}$:\n\n$$g(x) = \\ln\\!\\left(\\frac{x + 3}{x - 1}\\right)$$\n\n**b. (2 marks)**\n\n*Step 1 (1 mark):* Set $g(x) = \\ln 2$.\n\n$$\\ln\\!\\left(\\frac{x + 3}{x - 1}\\right) = \\ln 2$$\n\n$$\\frac{x + 3}{x - 1} = 2$$\n\n*Step 2 (1 mark):* Solve.\n\n$$x + 3 = 2(x - 1)$$\n\n$$x + 3 = 2x - 2$$\n\n$$x = 5$$\n\n**c. (2 marks)**\n\n*Step 1 (1 mark):* As $x \\to \\infty$:\n\n$$\\frac{x + 3}{x - 1} = \\frac{1 + 3/x}{1 - 1/x} \\to 1$$\n\n*Step 2 (1 mark):* Therefore $g(x) \\to \\ln 1 = 0$. The horizontal asymptote is $y = 0$.",
    subtopicSlugs: ["logarithmic-functions"],
  },
  {
    content:
      "Let $h: (0, \\infty) \\to R$, $h(x) = (\\ln x)^2 - 4\\ln x + 3$.\n\n**a.** By letting $u = \\ln x$, show that $h(x) = 0$ when $x = e$ or $x = e^3$. **(2 marks)**\n\n**b.** Find the value of $x$ at which $h(x)$ has a minimum, and state this minimum value. **(3 marks)**\n\n**c.** State the range of $h$. **(1 mark)**\n\n**d.** Find the number of solutions to $(\\ln x)^2 - 4\\ln x + 3 = -1$. **(1 mark)**",
    marks: 7,
    difficulty: "HARD",
    solutionContent:
      "**a. (2 marks)**\n\n*Step 1 (1 mark):* Let $u = \\ln x$. Then $h = u^2 - 4u + 3 = (u - 1)(u - 3)$.\n\n*Step 2 (1 mark):* $h = 0$ when $u = 1$ (i.e. $x = e$) or $u = 3$ (i.e. $x = e^3$).\n\n**b. (3 marks)**\n\n*Step 1 (1 mark):* Differentiate with respect to $x$.\n\n$$h'(x) = \\frac{2\\ln x - 4}{x}$$\n\n*Step 2 (1 mark):* Set $h'(x) = 0$: $2\\ln x - 4 = 0$, so $\\ln x = 2$, giving $x = e^2$.\n\n*Step 3 (1 mark):* Evaluate $h(e^2) = 4 - 8 + 3 = -1$. The minimum value is $-1$.\n\n**c. (1 mark)**\n\n*Step 1 (1 mark):* Range is $[-1, \\infty)$.\n\n**d. (1 mark)**\n\n*Step 1 (1 mark):* The equation $h(x) = -1$ asks when $h$ equals its minimum. This occurs at exactly one point, $x = e^2$. So there is $1$ solution.",
    subtopicSlugs: ["logarithmic-functions"],
  },
  {
    content:
      "Consider $f: (2, \\infty) \\to R$, $f(x) = 3\\ln(x - 2) + 1$.\n\n**a.** Describe a sequence of transformations that maps $y = \\ln x$ to $y = f(x)$. **(2 marks)**\n\n**b.** Find the exact coordinates of the $x$-intercept of the graph of $y = f(x)$. **(2 marks)**\n\n**c.** Find $f'(x)$ and evaluate $f'(3)$. **(2 marks)**",
    marks: 6,
    difficulty: "MEDIUM",
    solutionContent:
      "**a. (2 marks)**\n\n*Step 1 (1 mark):* Dilation by a factor of $3$ from the $x$-axis (in the $y$-direction).\n\n*Step 2 (1 mark):* Translation $2$ units to the right and $1$ unit up.\n\n**b. (2 marks)**\n\n*Step 1 (1 mark):* Set $f(x) = 0$.\n\n$$3\\ln(x - 2) = -1$$\n\n$$\\ln(x - 2) = -\\frac{1}{3}$$\n\n*Step 2 (1 mark):* Solve.\n\n$$x - 2 = e^{-1/3}$$\n\n$$x = 2 + e^{-1/3}$$\n\nThe $x$-intercept is $\\left(2 + e^{-1/3},\\, 0\\right)$.\n\n**c. (2 marks)**\n\n*Step 1 (1 mark):* Differentiate.\n\n$$f'(x) = \\frac{3}{x - 2}$$\n\n*Step 2 (1 mark):* Evaluate.\n\n$$f'(3) = \\frac{3}{1} = 3$$",
    subtopicSlugs: ["logarithmic-functions"],
  },
  {
    content:
      "Let $f(x) = \\ln(x^2 - 4)$ with maximal domain.\n\n**a.** State the maximal domain of $f$. **(2 marks)**\n\n**b.** Find the equations of the vertical asymptotes of the graph of $y = f(x)$. **(1 mark)**\n\n**c.** Find the $x$-intercepts of the graph of $y = f(x)$. **(2 marks)**\n\n**d.** Show that $f(x) = f(-x)$ and state what this tells us about the graph. **(1 mark)**\n\n**e.** Find $f'(x)$ and show that $f$ has no stationary points. **(2 marks)**",
    marks: 8,
    difficulty: "HARD",
    solutionContent:
      "**a. (2 marks)**\n\n*Step 1 (1 mark):* We need $x^2 - 4 > 0$, so $x^2 > 4$.\n\n*Step 2 (1 mark):* This gives $x > 2$ or $x < -2$. Domain: $(-\\infty, -2) \\cup (2, \\infty)$.\n\n**b. (1 mark)**\n\n*Step 1 (1 mark):* Vertical asymptotes where $x^2 - 4 = 0$: $x = 2$ and $x = -2$.\n\n**c. (2 marks)**\n\n*Step 1 (1 mark):* Set $\\ln(x^2 - 4) = 0$.\n\n$$x^2 - 4 = 1$$\n\n$$x^2 = 5$$\n\n*Step 2 (1 mark):* $x = \\pm\\sqrt{5}$. The $x$-intercepts are $(\\sqrt{5}, 0)$ and $(-\\sqrt{5}, 0)$.\n\n**d. (1 mark)**\n\n*Step 1 (1 mark):* $f(-x) = \\ln((-x)^2 - 4) = \\ln(x^2 - 4) = f(x)$. The graph is symmetric about the $y$-axis (even function).\n\n**e. (2 marks)**\n\n*Step 1 (1 mark):* Differentiate.\n\n$$f'(x) = \\frac{2x}{x^2 - 4}$$\n\n*Step 2 (1 mark):* Setting $f'(x) = 0$ gives $x = 0$, but $x = 0$ is not in the domain. Therefore $f$ has no stationary points.",
    subtopicSlugs: ["logarithmic-functions"],
  },
];

// ─── Trigonometric Functions ────────────────────────────────────────────

const trigonometricEA: EAItem[] = [
  {
    content:
      "Let $f: [0, 2\\pi] \\to R$, $f(x) = 2\\sin(x) + 1$.\n\n**a.** State the range of $f$. **(1 mark)**\n\n**b.** Find the values of $x$ for which $f(x) = 0$. **(2 marks)**\n\n**c.** Sketch the graph of $y = f(x)$ on the given domain, labelling all intercepts. **(1 mark)**",
    marks: 4,
    difficulty: "MEDIUM",
    solutionContent:
      "**a. (1 mark)**\n\n*Step 1 (1 mark):* Since $-1 \\le \\sin(x) \\le 1$, we have $-2 + 1 \\le f(x) \\le 2 + 1$. Range: $[-1, 3]$.\n\n**b. (2 marks)**\n\n*Step 1 (1 mark):* Set $2\\sin(x) + 1 = 0$, so $\\sin(x) = -\\dfrac{1}{2}$.\n\n*Step 2 (1 mark):* On $[0, 2\\pi]$: $x = \\dfrac{7\\pi}{6}$ or $x = \\dfrac{11\\pi}{6}$.\n\n**c. (1 mark)**\n\n*Step 1 (1 mark):* Sketch a sine curve with amplitude $2$, shifted up $1$ unit, on $[0, 2\\pi]$, with $y$-intercept $(0, 1)$, $x$-intercepts at $\\left(\\dfrac{7\\pi}{6}, 0\\right)$ and $\\left(\\dfrac{11\\pi}{6}, 0\\right)$.",
    subtopicSlugs: ["trigonometric-functions"],
  },
  {
    content:
      "Consider $g(x) = \\cos(2x) + \\cos(x)$ for $x \\in [0, 2\\pi]$.\n\n**a.** Using the double angle formula, show that $g(x) = 2\\cos^2(x) + \\cos(x) - 1$. **(1 mark)**\n\n**b.** Hence, by letting $u = \\cos(x)$, solve $g(x) = 0$ for $x \\in [0, 2\\pi]$. **(3 marks)**\n\n**c.** State the number of turning points of $g$ on $[0, 2\\pi]$. **(1 mark)**",
    marks: 5,
    difficulty: "MEDIUM",
    solutionContent:
      "**a. (1 mark)**\n\n*Step 1 (1 mark):* $\\cos(2x) = 2\\cos^2(x) - 1$, so:\n\n$$g(x) = 2\\cos^2(x) - 1 + \\cos(x)$$\n\n$$= 2\\cos^2(x) + \\cos(x) - 1$$\n\n**b. (3 marks)**\n\n*Step 1 (1 mark):* Let $u = \\cos(x)$: $2u^2 + u - 1 = 0$, so $(2u - 1)(u + 1) = 0$.\n\n*Step 2 (1 mark):* $u = \\dfrac{1}{2}$ or $u = -1$.\n\n*Step 3 (1 mark):* $\\cos(x) = \\dfrac{1}{2}$: $x = \\dfrac{\\pi}{3}$ or $x = \\dfrac{5\\pi}{3}$. $\\cos(x) = -1$: $x = \\pi$.\n\nSolutions: $x = \\dfrac{\\pi}{3},\\, \\pi,\\, \\dfrac{5\\pi}{3}$.\n\n**c. (1 mark)**\n\n*Step 1 (1 mark):* $g'(x) = -2\\sin(2x) - \\sin(x)$. Setting $g'(x) = 0$ and analysing, there are $4$ turning points on $[0, 2\\pi]$.",
    subtopicSlugs: ["trigonometric-functions"],
  },
  {
    content:
      "Let $f(x) = a\\sin(bx) + c$ where $a > 0$.\n\nThe graph of $y = f(x)$ has a maximum value of $5$, a minimum value of $-1$, and a period of $\\pi$.\n\n**a.** Find the values of $a$, $b$, and $c$. **(3 marks)**\n\n**b.** Find all values of $x \\in [0, 2\\pi]$ for which $f(x) = 5$. **(2 marks)**\n\n**c.** Hence, find the area enclosed between $y = f(x)$ and $y = 5$ over one period. **(2 marks)**",
    marks: 7,
    difficulty: "HARD",
    solutionContent:
      "**a. (3 marks)**\n\n*Step 1 (1 mark):* Amplitude: $a = \\dfrac{5 - (-1)}{2} = 3$.\n\n*Step 2 (1 mark):* Vertical shift: $c = \\dfrac{5 + (-1)}{2} = 2$.\n\n*Step 3 (1 mark):* Period $= \\dfrac{2\\pi}{b} = \\pi$, so $b = 2$.\n\n**b. (2 marks)**\n\n*Step 1 (1 mark):* Set $3\\sin(2x) + 2 = 5$, so $\\sin(2x) = 1$.\n\n*Step 2 (1 mark):* $2x = \\dfrac{\\pi}{2}$ or $2x = \\dfrac{5\\pi}{2}$, giving $x = \\dfrac{\\pi}{4}$ or $x = \\dfrac{5\\pi}{4}$.\n\n**c. (2 marks)**\n\n*Step 1 (1 mark):* Over one period $[0, \\pi]$:\n\n$$\\text{Area} = \\int_0^{\\pi} \\left(5 - (3\\sin(2x) + 2)\\right) dx$$\n\n$$= \\int_0^{\\pi} (3 - 3\\sin(2x))\\, dx$$\n\n*Step 2 (1 mark):* Evaluate.\n\n$$= \\left[3x + \\frac{3}{2}\\cos(2x)\\right]_0^{\\pi}$$\n\n$$= \\left(3\\pi + \\frac{3}{2}\\right) - \\left(0 + \\frac{3}{2}\\right)$$\n\n$$= 3\\pi$$",
    subtopicSlugs: ["trigonometric-functions"],
  },
  {
    content:
      "Consider $h: \\left[-\\dfrac{\\pi}{2},\\, \\dfrac{\\pi}{2}\\right] \\to R$, $h(x) = \\tan(x)$.\n\n**a.** State the range of $h$. **(1 mark)**\n\n**b.** Explain why $h$ has an inverse function on this domain. **(1 mark)**\n\n**c.** Find $h'(x)$ and evaluate $h'\\!\\left(\\dfrac{\\pi}{4}\\right)$. **(2 marks)**\n\n**d.** Find the equation of the tangent to $y = \\tan(x)$ at $x = \\dfrac{\\pi}{4}$. **(2 marks)**",
    marks: 6,
    difficulty: "MEDIUM",
    solutionContent:
      "**a. (1 mark)**\n\n*Step 1 (1 mark):* On $\\left(-\\dfrac{\\pi}{2}, \\dfrac{\\pi}{2}\\right)$, $\\tan(x)$ takes all real values. Range: $R$.\n\n**b. (1 mark)**\n\n*Step 1 (1 mark):* On this domain, $h$ is strictly increasing (one-to-one), so an inverse exists.\n\n**c. (2 marks)**\n\n*Step 1 (1 mark):* $h'(x) = \\sec^2(x) = \\dfrac{1}{\\cos^2(x)}$.\n\n*Step 2 (1 mark):* $h'\\!\\left(\\dfrac{\\pi}{4}\\right) = \\dfrac{1}{\\cos^2(\\pi/4)} = \\dfrac{1}{(1/\\sqrt{2})^2} = 2$.\n\n**d. (2 marks)**\n\n*Step 1 (1 mark):* At $x = \\dfrac{\\pi}{4}$: $y = \\tan\\!\\left(\\dfrac{\\pi}{4}\\right) = 1$, gradient $= 2$.\n\n*Step 2 (1 mark):* Equation: $y - 1 = 2\\!\\left(x - \\dfrac{\\pi}{4}\\right)$, i.e. $y = 2x - \\dfrac{\\pi}{2} + 1$.",
    subtopicSlugs: ["trigonometric-functions"],
  },
  {
    content:
      "A Ferris wheel has radius $10$ m and its centre is $12$ m above the ground. The height $h$ (in metres) of a rider above the ground after $t$ seconds is\n$$h(t) = 12 - 10\\cos\\!\\left(\\frac{\\pi t}{30}\\right)$$\n\n**a.** State the maximum and minimum heights of the rider. **(1 mark)**\n\n**b.** Find the period of the function and interpret it in context. **(1 mark)**\n\n**c.** Find the exact time at which the rider first reaches a height of $17$ m. **(3 marks)**\n\n**d.** Find the rate of change of height at this time. **(2 marks)**\n\n**e.** Explain why the rider is moving upward at this time. **(1 mark)**",
    marks: 8,
    difficulty: "HARD",
    solutionContent:
      "**a. (1 mark)**\n\n*Step 1 (1 mark):* Max: $12 + 10 = 22$ m. Min: $12 - 10 = 2$ m.\n\n**b. (1 mark)**\n\n*Step 1 (1 mark):* Period $= \\dfrac{2\\pi}{\\pi/30} = 60$ seconds. One full revolution takes $60$ seconds.\n\n**c. (3 marks)**\n\n*Step 1 (1 mark):* Set $h(t) = 17$.\n\n$$12 - 10\\cos\\!\\left(\\frac{\\pi t}{30}\\right) = 17$$\n\n$$\\cos\\!\\left(\\frac{\\pi t}{30}\\right) = -\\frac{1}{2}$$\n\n*Step 2 (1 mark):* The first positive solution of $\\cos(\\theta) = -\\dfrac{1}{2}$ is $\\theta = \\dfrac{2\\pi}{3}$.\n\n*Step 3 (1 mark):* $\\dfrac{\\pi t}{30} = \\dfrac{2\\pi}{3}$, so $t = 20$.\n\n**d. (2 marks)**\n\n*Step 1 (1 mark):* Differentiate.\n\n$$h'(t) = \\frac{10\\pi}{30}\\sin\\!\\left(\\frac{\\pi t}{30}\\right)$$\n\n$$= \\frac{\\pi}{3}\\sin\\!\\left(\\frac{\\pi t}{30}\\right)$$\n\n*Step 2 (1 mark):* At $t = 20$:\n\n$$h'(20) = \\frac{\\pi}{3}\\sin\\!\\left(\\frac{2\\pi}{3}\\right)$$\n\n$$= \\frac{\\pi}{3} \\cdot \\frac{\\sqrt{3}}{2}$$\n\n$$= \\frac{\\pi\\sqrt{3}}{6}$$\n\n**e. (1 mark)**\n\n*Step 1 (1 mark):* Since $h'(20) = \\dfrac{\\pi\\sqrt{3}}{6} > 0$, the height is increasing, so the rider is moving upward.",
    subtopicSlugs: ["trigonometric-functions"],
  },
];

// ─── Rational Functions ─────────────────────────────────────────────────

const rationalEA: EAItem[] = [
  {
    content:
      "Let $f: R \\setminus \\{2\\} \\to R$, $f(x) = \\dfrac{3}{x - 2} + 1$.\n\n**a.** State the equations of the asymptotes of the graph of $y = f(x)$. **(1 mark)**\n\n**b.** Find the coordinates of the axial intercepts. **(2 marks)**\n\n**c.** Sketch the graph of $y = f(x)$, labelling all asymptotes and intercepts. **(1 mark)**",
    marks: 4,
    difficulty: "MEDIUM",
    solutionContent:
      "**a. (1 mark)**\n\n*Step 1 (1 mark):* Vertical asymptote: $x = 2$. Horizontal asymptote: $y = 1$.\n\n**b. (2 marks)**\n\n*Step 1 (1 mark):* $y$-intercept: $f(0) = \\dfrac{3}{-2} + 1 = -\\dfrac{1}{2}$. So $\\left(0, -\\dfrac{1}{2}\\right)$.\n\n*Step 2 (1 mark):* $x$-intercept: set $f(x) = 0$. $\\dfrac{3}{x - 2} = -1$, so $x - 2 = -3$, giving $x = -1$. So $(-1, 0)$.\n\n**c. (1 mark)**\n\n*Step 1 (1 mark):* Sketch two branches of a hyperbola with asymptotes $x = 2$ and $y = 1$, passing through $(-1, 0)$ and $\\left(0, -\\dfrac{1}{2}\\right)$.",
    subtopicSlugs: ["rational-functions"],
  },
  {
    content:
      "Consider $g(x) = \\dfrac{x + 1}{x - 3}$ for $x \\ne 3$.\n\n**a.** Express $g(x)$ in the form $a + \\dfrac{b}{x - 3}$ where $a, b \\in R$. **(2 marks)**\n\n**b.** Hence, describe the transformations that map $y = \\dfrac{1}{x}$ to $y = g(x)$. **(2 marks)**\n\n**c.** Find the values of $x$ for which $g(x) \\ge 2$. **(2 marks)**",
    marks: 6,
    difficulty: "MEDIUM",
    solutionContent:
      "**a. (2 marks)**\n\n*Step 1 (1 mark):* Perform polynomial long division.\n\n$$\\frac{x + 1}{x - 3} = 1 + \\frac{4}{x - 3}$$\n\n*Step 2 (1 mark):* So $a = 1$ and $b = 4$.\n\n**b. (2 marks)**\n\n*Step 1 (1 mark):* Dilation by a factor of $4$ from the $x$-axis.\n\n*Step 2 (1 mark):* Translation $3$ units to the right and $1$ unit up.\n\n**c. (2 marks)**\n\n*Step 1 (1 mark):* Solve $g(x) \\ge 2$:\n\n$$1 + \\frac{4}{x - 3} \\ge 2$$\n\n$$\\frac{4}{x - 3} \\ge 1$$\n\n*Step 2 (1 mark):* For $x > 3$: $4 \\ge x - 3$, so $x \\le 7$. For $x < 3$: $4 \\le x - 3$ gives $x \\ge 7$, impossible.\n\nSolution: $x \\in (3, 7]$.",
    subtopicSlugs: ["rational-functions"],
  },
  {
    content:
      "Let $f: R \\setminus \\{-1\\} \\to R$, $f(x) = \\dfrac{x^2 - 4}{x + 1}$.\n\n**a.** Show that $f(x) = x - 1 - \\dfrac{3}{x + 1}$. **(2 marks)**\n\n**b.** State the equations of the asymptotes of the graph of $y = f(x)$. **(1 mark)**\n\n**c.** Find $f'(x)$ and determine the coordinates of any stationary points. **(3 marks)**\n\n**d.** Determine the nature of each stationary point. **(1 mark)**",
    marks: 7,
    difficulty: "HARD",
    solutionContent:
      "**a. (2 marks)**\n\n*Step 1 (1 mark):* Perform long division of $x^2 - 4$ by $x + 1$.\n\n$$x^2 - 4 = (x + 1)(x - 1) - 3$$\n\n*Step 2 (1 mark):* Therefore:\n\n$$f(x) = \\frac{(x + 1)(x - 1) - 3}{x + 1} = x - 1 - \\frac{3}{x + 1}$$\n\n**b. (1 mark)**\n\n*Step 1 (1 mark):* Vertical asymptote: $x = -1$. Oblique asymptote: $y = x - 1$.\n\n**c. (3 marks)**\n\n*Step 1 (1 mark):* Differentiate.\n\n$$f'(x) = 1 + \\frac{3}{(x + 1)^2}$$\n\n*Step 2 (1 mark):* Set $f'(x) = 0$.\n\n$$1 + \\frac{3}{(x + 1)^2} = 0$$\n\n$$(x + 1)^2 = -3$$\n\n*Step 3 (1 mark):* This has no real solutions. Therefore $f$ has no stationary points.\n\n**d. (1 mark)**\n\n*Step 1 (1 mark):* Since $f'(x) > 0$ for all $x$ in the domain, $f$ is strictly increasing on each branch (no stationary points to classify).",
    subtopicSlugs: ["rational-functions"],
  },
  {
    content:
      "Consider $h(x) = \\dfrac{2x}{x^2 + 1}$.\n\n**a.** Show that $h(-x) = -h(x)$ and state what this implies about the graph. **(1 mark)**\n\n**b.** Find $h'(x)$. **(2 marks)**\n\n**c.** Find the coordinates of the stationary points and determine their nature. **(2 marks)**",
    marks: 5,
    difficulty: "MEDIUM",
    solutionContent:
      "**a. (1 mark)**\n\n*Step 1 (1 mark):* $h(-x) = \\dfrac{-2x}{x^2 + 1} = -h(x)$. The graph has point symmetry about the origin (odd function).\n\n**b. (2 marks)**\n\n*Step 1 (1 mark):* Using the quotient rule with $u = 2x$ and $v = x^2 + 1$:\n\n$$h'(x) = \\frac{2(x^2 + 1) - 2x \\cdot 2x}{(x^2 + 1)^2}$$\n\n*Step 2 (1 mark):* Simplify.\n\n$$h'(x) = \\frac{2 - 2x^2}{(x^2 + 1)^2}$$\n\n$$= \\frac{2(1 - x^2)}{(x^2 + 1)^2}$$\n\n**c. (2 marks)**\n\n*Step 1 (1 mark):* Set $h'(x) = 0$: $1 - x^2 = 0$, so $x = 1$ or $x = -1$.\n\n*Step 2 (1 mark):* $h(1) = 1$ and $h(-1) = -1$. Since $h'$ changes from $+$ to $-$ at $x = 1$: local maximum $(1, 1)$. By symmetry, $(-1, -1)$ is a local minimum.",
    subtopicSlugs: ["rational-functions"],
  },
  {
    content:
      "Let $f: R \\setminus \\{1, -1\\} \\to R$, $f(x) = \\dfrac{x}{x^2 - 1}$.\n\n**a.** State the equations of all asymptotes of the graph of $y = f(x)$. **(2 marks)**\n\n**b.** Find $f'(x)$ and show that $f$ has no stationary points. **(2 marks)**\n\n**c.** Sketch the graph of $y = f(x)$, showing the behaviour near each asymptote. **(2 marks)**\n\n**d.** State the range of $f$. **(2 marks)**",
    marks: 8,
    difficulty: "HARD",
    solutionContent:
      "**a. (2 marks)**\n\n*Step 1 (1 mark):* Vertical asymptotes at $x = 1$ and $x = -1$ (where $x^2 - 1 = 0$).\n\n*Step 2 (1 mark):* Horizontal asymptote: as $x \\to \\pm\\infty$, $f(x) \\to 0$. So $y = 0$.\n\n**b. (2 marks)**\n\n*Step 1 (1 mark):* Quotient rule:\n\n$$f'(x) = \\frac{(x^2 - 1) - x(2x)}{(x^2 - 1)^2}$$\n\n$$= \\frac{-x^2 - 1}{(x^2 - 1)^2}$$\n\n*Step 2 (1 mark):* Since $-x^2 - 1 < 0$ for all $x$ and $(x^2 - 1)^2 > 0$ in the domain, $f'(x) < 0$ for all $x$ in the domain. No stationary points.\n\n**c. (2 marks)**\n\n*Step 1 (1 mark):* Three branches: for $x < -1$, the function approaches $0$ from below as $x \\to -\\infty$ and $-\\infty$ as $x \\to -1^-$. Between $-1$ and $1$, it goes from $+\\infty$ to $-\\infty$.\n\n*Step 2 (1 mark):* For $x > 1$, it approaches $+\\infty$ as $x \\to 1^+$ and $0$ from above as $x \\to +\\infty$. The graph passes through the origin.\n\n**d. (2 marks)**\n\n*Step 1 (1 mark):* On the interval $(-1, 1)$, $f$ is continuous and decreasing, with $f(x) \\to +\\infty$ as $x \\to -1^+$ and $f(x) \\to -\\infty$ as $x \\to 1^-$. So all of $R$ is achieved on this interval.\n\n*Step 2 (1 mark):* Range: $R$.",
    subtopicSlugs: ["rational-functions"],
  },
];

// ─── Domain and Range ───────────────────────────────────────────────────

const domainRangeEA: EAItem[] = [
  {
    content:
      "Let $f: [-2, 4] \\to R$, $f(x) = x^2 - 2x - 3$.\n\n**a.** Find the coordinates of the turning point of $f$. **(1 mark)**\n\n**b.** Evaluate $f(-2)$ and $f(4)$. **(1 mark)**\n\n**c.** Hence, state the range of $f$. **(1 mark)**\n\n**d.** Find the largest domain $D \\subseteq [-2, 4]$ containing $x = 4$ for which $f$ is one-to-one. **(1 mark)**",
    marks: 4,
    difficulty: "MEDIUM",
    solutionContent:
      "**a. (1 mark)**\n\n*Step 1 (1 mark):* $f(x) = (x - 1)^2 - 4$. Turning point: $(1, -4)$.\n\n**b. (1 mark)**\n\n*Step 1 (1 mark):* $f(-2) = 4 + 4 - 3 = 5$. $f(4) = 16 - 8 - 3 = 5$.\n\n**c. (1 mark)**\n\n*Step 1 (1 mark):* Minimum at $(1, -4)$, maximum at endpoints $f(-2) = f(4) = 5$. Range: $[-4, 5]$.\n\n**d. (1 mark)**\n\n*Step 1 (1 mark):* $f$ is increasing for $x \\ge 1$. The largest such domain containing $x = 4$ is $[1, 4]$.",
    subtopicSlugs: ["domain-and-range"],
  },
  {
    content:
      "Consider $g: D \\to R$, $g(x) = \\sqrt{4 - x^2}$.\n\n**a.** Find the maximal domain $D$ of $g$. **(2 marks)**\n\n**b.** Find the range of $g$. **(2 marks)**\n\n**c.** Describe the graph of $y = g(x)$ geometrically. **(1 mark)**\n\n**d.** Sketch the graph of $y = g(x)$. **(1 mark)**",
    marks: 6,
    difficulty: "MEDIUM",
    solutionContent:
      "**a. (2 marks)**\n\n*Step 1 (1 mark):* We need $4 - x^2 \\ge 0$, so $x^2 \\le 4$.\n\n*Step 2 (1 mark):* $-2 \\le x \\le 2$. Maximal domain: $[-2, 2]$.\n\n**b. (2 marks)**\n\n*Step 1 (1 mark):* Minimum: $g(\\pm 2) = 0$. Maximum: $g(0) = 2$.\n\n*Step 2 (1 mark):* Range: $[0, 2]$.\n\n**c. (1 mark)**\n\n*Step 1 (1 mark):* $y = \\sqrt{4 - x^2}$ gives $x^2 + y^2 = 4$ with $y \\ge 0$. This is the upper half of a circle with centre $(0,0)$ and radius $2$.\n\n**d. (1 mark)**\n\n*Step 1 (1 mark):* Sketch a semicircle from $(-2, 0)$ to $(2, 0)$ with maximum point at $(0, 2)$.",
    subtopicSlugs: ["domain-and-range"],
  },
  {
    content:
      "Let $f: (a, \\infty) \\to R$, $f(x) = \\dfrac{1}{(x-1)^2} + 3$ where $a > 1$.\n\n**a.** Explain why $a$ must satisfy $a > 1$ for $f$ to be defined. **(1 mark)**\n\n**b.** Show that $f$ is strictly decreasing on $(1, \\infty)$. **(2 marks)**\n\n**c.** State the range of $f$ when $a = 1$. **(1 mark)**\n\n**d.** If $a = 2$, find the range of $f$. **(1 mark)**\n\n**e.** Find the value of $a$ for which the range of $f$ is $(3, 4]$. **(2 marks)**",
    marks: 7,
    difficulty: "HARD",
    solutionContent:
      "**a. (1 mark)**\n\n*Step 1 (1 mark):* The denominator $(x - 1)^2 = 0$ when $x = 1$, so $x = 1$ must be excluded. For $a > 1$, the domain $(a, \\infty)$ avoids $x = 1$.\n\n**b. (2 marks)**\n\n*Step 1 (1 mark):* Differentiate: $f'(x) = -\\dfrac{2}{(x-1)^3}$.\n\n*Step 2 (1 mark):* For $x > 1$: $(x-1)^3 > 0$, so $f'(x) < 0$. Hence $f$ is strictly decreasing.\n\n**c. (1 mark)**\n\n*Step 1 (1 mark):* As $x \\to 1^+$, $f(x) \\to \\infty$. As $x \\to \\infty$, $f(x) \\to 3$. Range: $(3, \\infty)$.\n\n**d. (1 mark)**\n\n*Step 1 (1 mark):* $f(2) = 1 + 3 = 4$. As $x \\to \\infty$, $f \\to 3$. Range: $(3, 4)$.\n\n**e. (2 marks)**\n\n*Step 1 (1 mark):* We need $f(a) = 4$ (the maximum, included).\n\n$$\\frac{1}{(a - 1)^2} + 3 = 4$$\n\n$$(a - 1)^2 = 1$$\n\n*Step 2 (1 mark):* Since $a > 1$: $a - 1 = 1$, so $a = 2$.",
    subtopicSlugs: ["domain-and-range"],
  },
  {
    content:
      "Let $f(x) = \\dfrac{2x + 3}{x - 1}$ with maximal domain.\n\n**a.** State the maximal domain of $f$. **(1 mark)**\n\n**b.** Express $f(x)$ in the form $p + \\dfrac{q}{x - 1}$ and hence state the range of $f$. **(2 marks)**\n\n**c.** Verify that $f(3) = \\dfrac{9}{2}$ and $f(-1) = -\\dfrac{1}{2}$. **(1 mark)**\n\n**d.** Find the values of $x$ for which $f(x) > 3$. **(2 marks)**",
    marks: 6,
    difficulty: "MEDIUM",
    solutionContent:
      "**a. (1 mark)**\n\n*Step 1 (1 mark):* Domain: $R \\setminus \\{1\\}$.\n\n**b. (2 marks)**\n\n*Step 1 (1 mark):* Divide: $f(x) = 2 + \\dfrac{5}{x - 1}$.\n\n*Step 2 (1 mark):* As $x \\to \\pm\\infty$, $f(x) \\to 2$, but $f(x) \\ne 2$ for any $x$. Range: $R \\setminus \\{2\\}$.\n\n**c. (1 mark)**\n\n*Step 1 (1 mark):* $f(3) = \\dfrac{6 + 3}{3 - 1} = \\dfrac{9}{2}$. $f(-1) = \\dfrac{-2 + 3}{-1 - 1} = \\dfrac{1}{-2} = -\\dfrac{1}{2}$.\n\n**d. (2 marks)**\n\n*Step 1 (1 mark):* $2 + \\dfrac{5}{x - 1} > 3$, so $\\dfrac{5}{x - 1} > 1$.\n\n*Step 2 (1 mark):* For $x > 1$: $5 > x - 1$, so $x < 6$. For $x < 1$: $5 < x - 1$, impossible. Solution: $x \\in (1, 6)$.",
    subtopicSlugs: ["domain-and-range"],
  },
  {
    content:
      "Let $f: [0, 2\\pi] \\to R$, $f(x) = 2\\cos(x) + 1$ and $g: [-3, 1] \\to R$, $g(x) = x^2 + 2x$.\n\n**a.** Find the range of $f$. **(1 mark)**\n\n**b.** Find the range of $g$ by completing the square. **(2 marks)**\n\n**c.** Determine whether the range of $f$ is a subset of the domain of $g$. **(2 marks)**\n\n**d.** If so, state the domain and range of $g \\circ f$. **(1 mark)**\n\n**e.** Find the maximum value of $g(f(x))$. **(2 marks)**",
    marks: 8,
    difficulty: "HARD",
    solutionContent:
      "**a. (1 mark)**\n\n*Step 1 (1 mark):* $-1 \\le \\cos(x) \\le 1$, so $-1 \\le f(x) \\le 3$. Range of $f$: $[-1, 3]$.\n\n**b. (2 marks)**\n\n*Step 1 (1 mark):* $g(x) = (x + 1)^2 - 1$. Turning point at $(-1, -1)$.\n\n*Step 2 (1 mark):* $g(-3) = 9 - 6 = 3$, $g(1) = 1 + 2 = 3$. Range of $g$: $[-1, 3]$.\n\n**c. (2 marks)**\n\n*Step 1 (1 mark):* Range of $f = [-1, 3]$. Domain of $g = [-3, 1]$.\n\n*Step 2 (1 mark):* $[-1, 3] \\not\\subseteq [-3, 1]$ since $3 \\notin [-3, 1]$. The range of $f$ is NOT a subset of the domain of $g$. So $g \\circ f$ is not defined on all of $[0, 2\\pi]$.\n\n**d. (1 mark)**\n\n*Step 1 (1 mark):* $g \\circ f$ requires $f(x) \\in [-3, 1]$, i.e. $2\\cos(x) + 1 \\le 1$, so $\\cos(x) \\le 0$. On $[0, 2\\pi]$, this gives $x \\in \\left[\\dfrac{\\pi}{2}, \\dfrac{3\\pi}{2}\\right]$. Domain of $g \\circ f$: $\\left[\\dfrac{\\pi}{2}, \\dfrac{3\\pi}{2}\\right]$. On this domain, $f(x) \\in [-1, 1]$, so range of $g \\circ f$: $[-1, 3]$.\n\n**e. (2 marks)**\n\n*Step 1 (1 mark):* We need the max of $g(t)$ for $t \\in [-1, 1]$. $g(-1) = -1$, $g(1) = 3$.\n\n*Step 2 (1 mark):* Maximum of $g(f(x))$ is $3$, occurring when $f(x) = 1$, i.e. $\\cos(x) = 0$, i.e. $x = \\dfrac{\\pi}{2}$ or $x = \\dfrac{3\\pi}{2}$.",
    subtopicSlugs: ["domain-and-range"],
  },
];

// ─── Transformations ────────────────────────────────────────────────────

const transformationsEA: EAItem[] = [
  {
    content:
      "The graph of $y = f(x)$ is transformed to give $y = 2f(x - 3) + 1$.\n\nThe point $(4, -2)$ lies on the graph of $y = f(x)$.\n\n**a.** Find the coordinates of the image of $(4, -2)$ under this transformation. **(2 marks)**\n\n**b.** Describe the sequence of transformations applied. **(2 marks)**",
    marks: 4,
    difficulty: "MEDIUM",
    solutionContent:
      "**a. (2 marks)**\n\n*Step 1 (1 mark):* The transformation $x \\to x - 3$ translates $3$ right, so $x$-coordinate: $4 + 3 = 7$.\n\n*Step 2 (1 mark):* The $y$-value is $2(-2) + 1 = -3$. Image: $(7, -3)$.\n\n**b. (2 marks)**\n\n*Step 1 (1 mark):* Dilation by a factor of $2$ from the $x$-axis (in the $y$-direction).\n\n*Step 2 (1 mark):* Translation $3$ units to the right and $1$ unit up.",
    subtopicSlugs: ["transformations"],
  },
  {
    content:
      "Let $f(x) = x^2$. The graph of $y = f(x)$ is dilated by a factor of $\\dfrac{1}{2}$ from the $y$-axis and then translated $1$ unit to the left and $3$ units down.\n\n**a.** Find the equation of the transformed graph. **(2 marks)**\n\n**b.** Find the $x$-intercepts of the transformed graph. **(2 marks)**\n\n**c.** Sketch the transformed graph, labelling the turning point and $x$-intercepts. **(1 mark)**\n\n**d.** Find the area enclosed between the transformed graph and the $x$-axis. **(1 mark)**",
    marks: 6,
    difficulty: "MEDIUM",
    solutionContent:
      "**a. (2 marks)**\n\n*Step 1 (1 mark):* Dilation by factor $\\dfrac{1}{2}$ from the $y$-axis: replace $x$ with $2x$. $y = (2x)^2 = 4x^2$.\n\n*Step 2 (1 mark):* Translate $1$ left, $3$ down: replace $x$ with $x + 1$, subtract $3$.\n\n$$y = 4(x + 1)^2 - 3$$\n\n**b. (2 marks)**\n\n*Step 1 (1 mark):* Set $y = 0$: $4(x + 1)^2 = 3$, so $(x + 1)^2 = \\dfrac{3}{4}$.\n\n*Step 2 (1 mark):* $x + 1 = \\pm\\dfrac{\\sqrt{3}}{2}$, so $x = -1 \\pm \\dfrac{\\sqrt{3}}{2}$.\n\n**c. (1 mark)**\n\n*Step 1 (1 mark):* Sketch an upward parabola with vertex $(-1, -3)$ and $x$-intercepts at $\\left(-1 - \\dfrac{\\sqrt{3}}{2}, 0\\right)$ and $\\left(-1 + \\dfrac{\\sqrt{3}}{2}, 0\\right)$.\n\n**d. (1 mark)**\n\n*Step 1 (1 mark):* Area $= \\displaystyle\\int_{-1-\\frac{\\sqrt{3}}{2}}^{-1+\\frac{\\sqrt{3}}{2}} \\left(3 - 4(x+1)^2\\right) dx = 2\\int_0^{\\frac{\\sqrt{3}}{2}} (3 - 4u^2)\\, du = 2\\left[3u - \\dfrac{4u^3}{3}\\right]_0^{\\frac{\\sqrt{3}}{2}} = 2\\left(\\dfrac{3\\sqrt{3}}{2} - \\dfrac{\\sqrt{3}}{2}\\right) = 2\\sqrt{3}$.",
    subtopicSlugs: ["transformations"],
  },
  {
    content:
      "Let $f: R \\to R$, $f(x) = e^x$. The graph of $y = f(x)$ undergoes the following transformations in sequence: reflection in the $y$-axis, then dilation by a factor of $3$ from the $x$-axis, then translation $2$ units up.\n\n**a.** Write down the equation of the resulting graph. **(2 marks)**\n\n**b.** Find the $x$-intercept of the resulting graph in exact form. **(2 marks)**\n\n**c.** State the equation of the horizontal asymptote of the resulting graph. **(1 mark)**\n\n**d.** Hence, sketch the resulting graph. **(1 mark)**\n\n**e.** Write the transformation as a single mapping $(x, y) \\mapsto (?, ?)$. **(1 mark)**",
    marks: 7,
    difficulty: "HARD",
    solutionContent:
      "**a. (2 marks)**\n\n*Step 1 (1 mark):* Reflection in $y$-axis: $y = e^{-x}$.\n\n*Step 2 (1 mark):* Dilation factor $3$ from $x$-axis: $y = 3e^{-x}$. Translate $2$ up: $y = 3e^{-x} + 2$.\n\n**b. (2 marks)**\n\n*Step 1 (1 mark):* Set $y = 0$: $3e^{-x} + 2 = 0$, so $e^{-x} = -\\dfrac{2}{3}$.\n\n*Step 2 (1 mark):* Since $e^{-x} > 0$ for all $x$, there is no $x$-intercept.\n\n**c. (1 mark)**\n\n*Step 1 (1 mark):* As $x \\to \\infty$, $3e^{-x} \\to 0$, so $y \\to 2$. Horizontal asymptote: $y = 2$.\n\n**d. (1 mark)**\n\n*Step 1 (1 mark):* Sketch a decreasing exponential curve with asymptote $y = 2$, $y$-intercept at $(0, 5)$, lying entirely above $y = 2$.\n\n**e. (1 mark)**\n\n*Step 1 (1 mark):* $(x, y) \\mapsto (-x,\\, 3y + 2)$.",
    subtopicSlugs: ["transformations"],
  },
  {
    content:
      "The graph of $y = \\sin(x)$ is transformed to produce the graph of $y = -\\sin(2x - \\pi) + 1$.\n\n**a.** Express $-\\sin(2x - \\pi) + 1$ in the form $-\\sin\\!\\left(2\\left(x - \\dfrac{\\pi}{2}\\right)\\right) + 1$. **(1 mark)**\n\n**b.** Describe the sequence of transformations. **(2 marks)**\n\n**c.** State the period, amplitude, and range of the transformed function. **(2 marks)**",
    marks: 5,
    difficulty: "MEDIUM",
    solutionContent:
      "**a. (1 mark)**\n\n*Step 1 (1 mark):* $-\\sin(2x - \\pi) = -\\sin\\!\\left(2\\!\\left(x - \\dfrac{\\pi}{2}\\right)\\right)$. Confirmed.\n\n**b. (2 marks)**\n\n*Step 1 (1 mark):* Dilation by factor $\\dfrac{1}{2}$ from the $y$-axis (period halved), then reflection in the $x$-axis.\n\n*Step 2 (1 mark):* Translation $\\dfrac{\\pi}{2}$ units to the right and $1$ unit up.\n\n**c. (2 marks)**\n\n*Step 1 (1 mark):* Period $= \\dfrac{2\\pi}{2} = \\pi$. Amplitude $= 1$.\n\n*Step 2 (1 mark):* Range: $[1 - 1, 1 + 1] = [0, 2]$.",
    subtopicSlugs: ["transformations"],
  },
  {
    content:
      "The graph of $y = \\ln(x)$ is reflected in the line $y = x$ to obtain the graph of $y = h(x)$.\n\n**a.** State the equation of $h(x)$. **(1 mark)**\n\n**b.** The graph of $y = h(x)$ is then dilated by a factor of $2$ from the $x$-axis and translated $3$ units down. Write the equation of the final graph. **(1 mark)**\n\n**c.** Find the $x$-intercept of the final graph. **(2 marks)**\n\n**d.** State the equation of the asymptote of the final graph. **(1 mark)**\n\n**e.** Find the area between the final graph and the $x$-axis for $x \\in [0, \\ln 6]$, giving your answer in exact form. **(3 marks)**",
    marks: 8,
    difficulty: "HARD",
    solutionContent:
      "**a. (1 mark)**\n\n*Step 1 (1 mark):* Reflection of $y = \\ln(x)$ in $y = x$ gives the inverse: $h(x) = e^x$.\n\n**b. (1 mark)**\n\n*Step 1 (1 mark):* Dilation factor $2$ from $x$-axis: $y = 2e^x$. Translate $3$ down: $y = 2e^x - 3$.\n\n**c. (2 marks)**\n\n*Step 1 (1 mark):* Set $2e^x - 3 = 0$: $e^x = \\dfrac{3}{2}$.\n\n*Step 2 (1 mark):* $x = \\ln\\dfrac{3}{2}$. The $x$-intercept is $\\left(\\ln\\dfrac{3}{2},\\, 0\\right)$.\n\n**d. (1 mark)**\n\n*Step 1 (1 mark):* As $x \\to -\\infty$, $2e^x \\to 0$, so $y \\to -3$. Asymptote: $y = -3$.\n\n**e. (3 marks)**\n\n*Step 1 (1 mark):* The function is negative on $\\left[0, \\ln\\dfrac{3}{2}\\right)$ and positive on $\\left(\\ln\\dfrac{3}{2}, \\ln 6\\right]$.\n\nNote: $2e^0 - 3 = -1 < 0$, confirming the sign change.\n\n*Step 2 (1 mark):* Area $= \\left|\\displaystyle\\int_0^{\\ln(3/2)} (2e^x - 3)\\, dx\\right| + \\int_{\\ln(3/2)}^{\\ln 6} (2e^x - 3)\\, dx$.\n\n$\\displaystyle\\int (2e^x - 3)\\, dx = 2e^x - 3x + C$.\n\n*Step 3 (1 mark):* First part: $\\left[2e^x - 3x\\right]_0^{\\ln(3/2)} = (3 - 3\\ln\\tfrac{3}{2}) - 2 = 1 - 3\\ln\\tfrac{3}{2}$. Since this is negative, absolute value gives $3\\ln\\tfrac{3}{2} - 1$.\n\nSecond part: $\\left[2e^x - 3x\\right]_{\\ln(3/2)}^{\\ln 6} = (12 - 3\\ln 6) - (3 - 3\\ln\\tfrac{3}{2}) = 9 - 3\\ln 6 + 3\\ln\\tfrac{3}{2} = 9 - 3\\ln 4$.\n\nTotal area $= 3\\ln\\dfrac{3}{2} - 1 + 9 - 3\\ln 4 = 8 + 3\\ln\\dfrac{3}{8}$.",
    subtopicSlugs: ["transformations"],
  },
];

// ─── Inverse Functions ──────────────────────────────────────────────────

const inverseEA: EAItem[] = [
  {
    content:
      "Let $f: [0, \\infty) \\to R$, $f(x) = (x + 1)^2 - 4$.\n\n**a.** State the range of $f$. **(1 mark)**\n\n**b.** Find the rule for $f^{-1}(x)$. **(2 marks)**\n\n**c.** State the domain of $f^{-1}$. **(1 mark)**",
    marks: 4,
    difficulty: "MEDIUM",
    solutionContent:
      "**a. (1 mark)**\n\n*Step 1 (1 mark):* At $x = 0$: $f(0) = 1 - 4 = -3$. As $x \\to \\infty$, $f \\to \\infty$. Range: $[-3, \\infty)$.\n\n**b. (2 marks)**\n\n*Step 1 (1 mark):* Set $y = (x+1)^2 - 4$ and swap: $x = (y+1)^2 - 4$.\n\n$$(y+1)^2 = x + 4$$\n\n*Step 2 (1 mark):* Since the domain of $f$ is $[0, \\infty)$, we have $y \\ge 0$, so $y + 1 > 0$.\n\n$$y = \\sqrt{x + 4} - 1$$\n\nSo $f^{-1}(x) = \\sqrt{x + 4} - 1$.\n\n**c. (1 mark)**\n\n*Step 1 (1 mark):* Domain of $f^{-1}$ = range of $f$ = $[-3, \\infty)$.",
    subtopicSlugs: ["inverse-functions"],
  },
  {
    content:
      "Consider $g: (-\\infty, 2] \\to R$, $g(x) = 4 - (x - 2)^2$.\n\n**a.** Show that $g$ is a one-to-one function on this domain. **(1 mark)**\n\n**b.** Find the rule and domain for $g^{-1}$. **(3 marks)**\n\n**c.** Find the point(s) of intersection of $y = g(x)$ and $y = g^{-1}(x)$. **(2 marks)**",
    marks: 6,
    difficulty: "MEDIUM",
    solutionContent:
      "**a. (1 mark)**\n\n*Step 1 (1 mark):* $g'(x) = -2(x - 2)$. For $x < 2$, $g'(x) > 0$, so $g$ is strictly increasing on $(-\\infty, 2]$. Therefore $g$ is one-to-one.\n\n**b. (3 marks)**\n\n*Step 1 (1 mark):* Range of $g$: $g(2) = 4$, as $x \\to -\\infty$, $g \\to -\\infty$. Range: $(-\\infty, 4]$.\n\n*Step 2 (1 mark):* Set $y = 4 - (x - 2)^2$: $(x - 2)^2 = 4 - y$, so $x - 2 = -\\sqrt{4 - y}$ (negative root since $x \\le 2$).\n\n*Step 3 (1 mark):* $g^{-1}(x) = 2 - \\sqrt{4 - x}$, domain $(-\\infty, 4]$.\n\n**c. (2 marks)**\n\n*Step 1 (1 mark):* Points of intersection of $y = g(x)$ and $y = g^{-1}(x)$ lie on the line $y = x$.\n\nSet $g(x) = x$: $4 - (x-2)^2 = x$.\n\n$$4 - x^2 + 4x - 4 = x$$\n\n$$-x^2 + 3x = 0$$\n\n$$x(3 - x) = 0$$\n\n*Step 2 (1 mark):* $x = 0$ or $x = 3$. But $x \\le 2$, so $x = 0$ only. Point: $(0, 0)$.\n\nVerify: $g(0) = 4 - 4 = 0$. Confirmed.",
    subtopicSlugs: ["inverse-functions"],
  },
  {
    content:
      "Let $f: [0, \\pi] \\to R$, $f(x) = \\cos(x)$.\n\n**a.** State the range of $f$ and explain why $f$ has an inverse on $[0, \\pi]$. **(2 marks)**\n\n**b.** Write down the rule, domain, and range of $f^{-1}$. **(2 marks)**\n\n**c.** Find the gradient of the graph of $y = f^{-1}(x)$ at the point where $x = \\dfrac{1}{2}$. **(2 marks)**\n\n**d.** Find the equation of the tangent to $y = f^{-1}(x)$ at $x = \\dfrac{1}{2}$. **(1 mark)**",
    marks: 7,
    difficulty: "HARD",
    solutionContent:
      "**a. (2 marks)**\n\n*Step 1 (1 mark):* Range: $[-1, 1]$.\n\n*Step 2 (1 mark):* On $[0, \\pi]$, $\\cos(x)$ is strictly decreasing, so it is one-to-one and has an inverse.\n\n**b. (2 marks)**\n\n*Step 1 (1 mark):* $f^{-1}(x) = \\cos^{-1}(x)$ (or $\\arccos(x)$).\n\n*Step 2 (1 mark):* Domain: $[-1, 1]$. Range: $[0, \\pi]$.\n\n**c. (2 marks)**\n\n*Step 1 (1 mark):* The derivative of $\\cos^{-1}(x)$ is $\\dfrac{-1}{\\sqrt{1 - x^2}}$.\n\n*Step 2 (1 mark):* At $x = \\dfrac{1}{2}$:\n\n$$\\frac{-1}{\\sqrt{1 - 1/4}} = \\frac{-1}{\\sqrt{3/4}} = \\frac{-2}{\\sqrt{3}} = \\frac{-2\\sqrt{3}}{3}$$\n\n**d. (1 mark)**\n\n*Step 1 (1 mark):* At $x = \\dfrac{1}{2}$: $y = \\cos^{-1}\\!\\left(\\dfrac{1}{2}\\right) = \\dfrac{\\pi}{3}$.\n\nTangent: $y - \\dfrac{\\pi}{3} = -\\dfrac{2\\sqrt{3}}{3}\\!\\left(x - \\dfrac{1}{2}\\right)$.",
    subtopicSlugs: ["inverse-functions"],
  },
  {
    content:
      "Let $f: R^+ \\to R$, $f(x) = \\ln(3x)$.\n\n**a.** Find $f^{-1}(x)$. **(2 marks)**\n\n**b.** Find the point of intersection of $y = f(x)$ and $y = f^{-1}(x)$ by solving $f(x) = x$. Give your answer correct to the point where the intersection condition is established. **(1 mark)**\n\n**c.** State the domain and range of $f^{-1}$. **(2 marks)**",
    marks: 5,
    difficulty: "MEDIUM",
    solutionContent:
      "**a. (2 marks)**\n\n*Step 1 (1 mark):* Set $y = \\ln(3x)$: $e^y = 3x$, so $x = \\dfrac{e^y}{3}$.\n\n*Step 2 (1 mark):* $f^{-1}(x) = \\dfrac{e^x}{3}$.\n\n**b. (1 mark)**\n\n*Step 1 (1 mark):* Intersection of $y = f(x)$ and $y = f^{-1}(x)$ lies on $y = x$. Set $\\ln(3x) = x$. This transcendental equation cannot be solved algebraically. The intersection occurs where $\\ln(3x) = x$, confirming that the graphs meet on the line $y = x$.\n\n**c. (2 marks)**\n\n*Step 1 (1 mark):* Domain of $f^{-1}$ = range of $f = R$.\n\n*Step 2 (1 mark):* Range of $f^{-1}$ = domain of $f = (0, \\infty)$.",
    subtopicSlugs: ["inverse-functions"],
  },
  {
    content:
      "Let $f: (-\\infty, 0] \\to R$, $f(x) = e^{-x} - 1$.\n\n**a.** Show that $f$ is one-to-one on this domain. **(1 mark)**\n\n**b.** Find the rule for $f^{-1}(x)$ and state its domain. **(2 marks)**\n\n**c.** Sketch the graphs of $y = f(x)$ and $y = f^{-1}(x)$ on the same set of axes, labelling the line of symmetry and all endpoints and intercepts. **(3 marks)**\n\n**d.** Find the exact area enclosed between $y = f(x)$ and $y = f^{-1}(x)$ and the line $y = x$ from $x = 0$ to $x = e - 1$. **(2 marks)**",
    marks: 8,
    difficulty: "HARD",
    solutionContent:
      "**a. (1 mark)**\n\n*Step 1 (1 mark):* $f'(x) = -e^{-x}$. For $x \\le 0$, $e^{-x} \\ge 1 > 0$, so $f'(x) < 0$. $f$ is strictly decreasing, hence one-to-one.\n\n**b. (2 marks)**\n\n*Step 1 (1 mark):* Set $y = e^{-x} - 1$: $e^{-x} = y + 1$, so $-x = \\ln(y + 1)$.\n\n*Step 2 (1 mark):* $f^{-1}(x) = -\\ln(x + 1)$. Domain: range of $f$. Since $f(0) = 0$ and $f(x) \\to \\infty$ as $x \\to -\\infty$, domain of $f^{-1}$: $[0, \\infty)$.\n\n**c. (3 marks)**\n\n*Step 1 (1 mark):* $y = f(x)$: decreasing curve from upper-left, through $(0, 0)$, with asymptote $y = -1$. Endpoint at $(0, 0)$.\n\n*Step 2 (1 mark):* $y = f^{-1}(x)$: reflection in $y = x$. Decreasing curve from $(0, 0)$, with asymptote $x = -1$.\n\n*Step 3 (1 mark):* Line of symmetry: $y = x$. Both curves pass through $(0, 0)$.\n\n**d. (2 marks)**\n\n*Step 1 (1 mark):* By symmetry about $y = x$, the enclosed area equals $2\\displaystyle\\int_0^{e-1} (x - f^{-1}(x))\\, dx = 2\\int_0^{e-1} (x + \\ln(x+1))\\, dx$.\n\n*Step 2 (1 mark):* $\\displaystyle\\int_0^{e-1} x\\, dx = \\frac{(e-1)^2}{2}$.\n\n$\\displaystyle\\int_0^{e-1} \\ln(x+1)\\, dx = \\left[(x+1)\\ln(x+1) - (x+1)\\right]_0^{e-1} = (e \\cdot 1 - e) - (0 - 1) = 1$.\n\nTotal area $= 2\\left(\\dfrac{(e-1)^2}{2} + 1\\right) = (e-1)^2 + 2 = e^2 - 2e + 3$.",
    subtopicSlugs: ["inverse-functions"],
  },
];

// ─── Composite Functions ────────────────────────────────────────────────

const compositeEA: EAItem[] = [
  {
    content:
      "Let $f(x) = 2x + 1$ and $g(x) = x^2$.\n\n**a.** Find the rules for $f(g(x))$ and $g(f(x))$. **(2 marks)**\n\n**b.** Show that $f(g(x)) \\ne g(f(x))$ in general. **(1 mark)**\n\n**c.** Find the value(s) of $x$ for which $f(g(x)) = g(f(x))$. **(1 mark)**",
    marks: 4,
    difficulty: "MEDIUM",
    solutionContent:
      "**a. (2 marks)**\n\n*Step 1 (1 mark):* $f(g(x)) = f(x^2) = 2x^2 + 1$.\n\n*Step 2 (1 mark):* $g(f(x)) = g(2x + 1) = (2x + 1)^2 = 4x^2 + 4x + 1$.\n\n**b. (1 mark)**\n\n*Step 1 (1 mark):* $2x^2 + 1 \\ne 4x^2 + 4x + 1$ in general (e.g. at $x = 1$: $3 \\ne 9$).\n\n**c. (1 mark)**\n\n*Step 1 (1 mark):* Set $2x^2 + 1 = 4x^2 + 4x + 1$: $0 = 2x^2 + 4x = 2x(x + 2)$. So $x = 0$ or $x = -2$.",
    subtopicSlugs: ["composite-functions"],
  },
  {
    content:
      "Let $f: R^+ \\to R$, $f(x) = \\ln(x)$ and $g: R \\to R$, $g(x) = x^2 + 1$.\n\n**a.** Explain why $f \\circ g$ exists and state the maximal domain. **(2 marks)**\n\n**b.** Find the rule for $(f \\circ g)(x)$. **(1 mark)**\n\n**c.** Find $(f \\circ g)'(x)$ and determine the coordinates of any stationary points. **(2 marks)**\n\n**d.** State the range of $f \\circ g$. **(1 mark)**",
    marks: 6,
    difficulty: "MEDIUM",
    solutionContent:
      "**a. (2 marks)**\n\n*Step 1 (1 mark):* $f \\circ g$ exists when the range of $g$ is a subset of the domain of $f$. Domain of $f$ is $(0, \\infty)$.\n\n*Step 2 (1 mark):* $g(x) = x^2 + 1 \\ge 1 > 0$ for all $x$, so range of $g \\subseteq (0, \\infty)$. The maximal domain is $R$.\n\n**b. (1 mark)**\n\n*Step 1 (1 mark):* $(f \\circ g)(x) = \\ln(x^2 + 1)$.\n\n**c. (2 marks)**\n\n*Step 1 (1 mark):* By the chain rule: $(f \\circ g)'(x) = \\dfrac{2x}{x^2 + 1}$.\n\n*Step 2 (1 mark):* Set $(f \\circ g)'(x) = 0$: $2x = 0$, so $x = 0$. Since $(f \\circ g)'$ changes from negative to positive at $x = 0$, there is a local minimum at $(0, \\ln 1) = (0, 0)$.\n\n**d. (1 mark)**\n\n*Step 1 (1 mark):* Minimum value is $0$ at $x = 0$, and $(f \\circ g)(x) \\to \\infty$ as $x \\to \\pm\\infty$. Range: $[0, \\infty)$.",
    subtopicSlugs: ["composite-functions"],
  },
  {
    content:
      "Let $f: [0, \\infty) \\to R$, $f(x) = \\sqrt{x}$ and $g: R \\to R$, $g(x) = 4 - x^2$.\n\n**a.** Find the maximal domain of $f \\circ g$. **(2 marks)**\n\n**b.** Find the rule for $(f \\circ g)(x)$ and state its range. **(2 marks)**\n\n**c.** Find the rule for $(g \\circ f)(x)$ and state its domain. **(1 mark)**\n\n**d.** Find the value(s) of $x$ for which $(f \\circ g)(x) = (g \\circ f)(x)$. **(2 marks)**",
    marks: 7,
    difficulty: "HARD",
    solutionContent:
      "**a. (2 marks)**\n\n*Step 1 (1 mark):* $f \\circ g$ requires $g(x) \\ge 0$, i.e. $4 - x^2 \\ge 0$.\n\n*Step 2 (1 mark):* $x^2 \\le 4$, so $-2 \\le x \\le 2$. Maximal domain: $[-2, 2]$.\n\n**b. (2 marks)**\n\n*Step 1 (1 mark):* $(f \\circ g)(x) = \\sqrt{4 - x^2}$.\n\n*Step 2 (1 mark):* Maximum at $x = 0$: $\\sqrt{4} = 2$. Minimum at $x = \\pm 2$: $0$. Range: $[0, 2]$.\n\n**c. (1 mark)**\n\n*Step 1 (1 mark):* $(g \\circ f)(x) = g(\\sqrt{x}) = 4 - x$. Domain: $[0, \\infty)$.\n\n**d. (2 marks)**\n\n*Step 1 (1 mark):* Set $\\sqrt{4 - x^2} = 4 - x$ (valid for $x \\in [-2, 2]$ and $4 - x \\ge 0$, i.e. $x \\le 4$).\n\nSquare both sides: $4 - x^2 = (4 - x)^2 = 16 - 8x + x^2$.\n\n$$4 - x^2 = 16 - 8x + x^2$$\n\n$$2x^2 - 8x + 12 = 0$$\n\n$$x^2 - 4x + 6 = 0$$\n\n*Step 2 (1 mark):* Discriminant: $16 - 24 = -8 < 0$. No real solutions. The composites never agree.",
    subtopicSlugs: ["composite-functions"],
  },
  {
    content:
      "Let $f(x) = e^x$ and $g(x) = 2x - 1$.\n\n**a.** Find $(f \\circ g)(x)$ and $(g \\circ f)(x)$. **(2 marks)**\n\n**b.** Solve $(f \\circ g)(x) = e^3$. **(1 mark)**\n\n**c.** Solve $(g \\circ f)(x) = 5$. **(2 marks)**",
    marks: 5,
    difficulty: "MEDIUM",
    solutionContent:
      "**a. (2 marks)**\n\n*Step 1 (1 mark):* $(f \\circ g)(x) = f(2x - 1) = e^{2x - 1}$.\n\n*Step 2 (1 mark):* $(g \\circ f)(x) = g(e^x) = 2e^x - 1$.\n\n**b. (1 mark)**\n\n*Step 1 (1 mark):* $e^{2x-1} = e^3$, so $2x - 1 = 3$, giving $x = 2$.\n\n**c. (2 marks)**\n\n*Step 1 (1 mark):* $2e^x - 1 = 5$, so $e^x = 3$.\n\n*Step 2 (1 mark):* $x = \\ln 3$.",
    subtopicSlugs: ["composite-functions"],
  },
  {
    content:
      "Let $f: \\left[-\\dfrac{\\pi}{2},\\, \\dfrac{\\pi}{2}\\right] \\to R$, $f(x) = \\sin(x)$ and $g: [-1, 1] \\to R$, $g(x) = x^2 - 1$.\n\n**a.** Show that both $g \\circ f$ and $f \\circ g$ are defined on their respective domains. **(2 marks)**\n\n**b.** Find the rule for $(g \\circ f)(x)$ and simplify using a trigonometric identity. **(2 marks)**\n\n**c.** Find the range of $g \\circ f$. **(2 marks)**\n\n**d.** Find the values of $x$ in the domain of $g \\circ f$ for which $(g \\circ f)(x) = -\\dfrac{1}{2}$. **(2 marks)**",
    marks: 8,
    difficulty: "HARD",
    solutionContent:
      "**a. (2 marks)**\n\n*Step 1 (1 mark):* For $g \\circ f$: range of $f$ is $[-1, 1]$ = domain of $g$. So $g \\circ f$ is defined.\n\n*Step 2 (1 mark):* For $f \\circ g$: $g(x) = x^2 - 1$ on $[-1, 1]$ has range $[-1, 0]$. Since $[-1, 0] \\subseteq \\left[-\\dfrac{\\pi}{2}, \\dfrac{\\pi}{2}\\right]$, $f \\circ g$ is defined.\n\n**b. (2 marks)**\n\n*Step 1 (1 mark):* $(g \\circ f)(x) = (\\sin x)^2 - 1 = \\sin^2(x) - 1$.\n\n*Step 2 (1 mark):* Using $\\sin^2(x) = 1 - \\cos^2(x)$:\n\n$$\\sin^2(x) - 1 = -\\cos^2(x)$$\n\nOr using $\\cos(2x) = 1 - 2\\sin^2(x)$: $\\sin^2(x) = \\dfrac{1 - \\cos(2x)}{2}$, so $(g \\circ f)(x) = -\\dfrac{1 + \\cos(2x)}{2}$.\n\n**c. (2 marks)**\n\n*Step 1 (1 mark):* $(g \\circ f)(x) = -\\cos^2(x)$. Since $\\cos^2(x) \\in [0, 1]$ on $\\left[-\\dfrac{\\pi}{2}, \\dfrac{\\pi}{2}\\right]$.\n\n*Step 2 (1 mark):* Range of $-\\cos^2(x)$: $[-1, 0]$.\n\n**d. (2 marks)**\n\n*Step 1 (1 mark):* $-\\cos^2(x) = -\\dfrac{1}{2}$, so $\\cos^2(x) = \\dfrac{1}{2}$.\n\n$$\\cos(x) = \\pm\\frac{1}{\\sqrt{2}}$$\n\n*Step 2 (1 mark):* On $\\left[-\\dfrac{\\pi}{2}, \\dfrac{\\pi}{2}\\right]$: $x = \\pm\\dfrac{\\pi}{4}$.",
    subtopicSlugs: ["composite-functions"],
  },
];

// ─── File map ───────────────────────────────────────────────────────────

const fileMap: Record<string, EAItem[]> = {
  "qset-polynomial-functions.json": polynomialEA,
  "qset-exponential-functions.json": exponentialEA,
  "qset-logarithmic-functions.json": logarithmicEA,
  "qset-trigonometric-functions.json": trigonometricEA,
  "qset-rational-functions.json": rationalEA,
  "qset-domain-and-range.json": domainRangeEA,
  "qset-transformations.json": transformationsEA,
  "qset-inverse-functions.json": inverseEA,
  "qset-composite-functions.json": compositeEA,
};

// ─── Main ───────────────────────────────────────────────────────────────

let modified = 0;
let skipped = 0;

for (const [filename, items] of Object.entries(fileMap)) {
  const filepath = join(OUTPUT_DIR, filename);
  const raw = readFileSync(filepath, "utf-8");
  const data: QSetFile = JSON.parse(raw);

  if (data.extendedAnswer && data.extendedAnswer.length >= 5) {
    console.log(`SKIP  ${filename} (already has ${data.extendedAnswer.length} extendedAnswer items)`);
    skipped++;
    continue;
  }

  data.extendedAnswer = items;
  writeFileSync(filepath, JSON.stringify(data, null, 2) + "\n", "utf-8");
  console.log(`WRITE ${filename} — added ${items.length} extendedAnswer items`);
  modified++;
}

console.log(`\nDone. Modified: ${modified}, Skipped: ${skipped}`);
