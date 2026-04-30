/**
 * add-ea-algebra.ts
 *
 * Adds exactly 5 new Extended-Answer questions (Exam 1, Q6-Q9 style) to each
 * of the 6 Algebra, Number, and Structure qset JSON files. Idempotent: if a
 * file already has 5+ extendedAnswer items, it is skipped.
 *
 * Mark distribution per subtopic: 4, 5, 6, 7, 8 marks.
 * All questions are no-calculator, multi-part, with parts building on each
 * other ("hence" / "using your answer from (a)").
 */
import fs from "fs";
import path from "path";

interface EA {
  content: string;
  marks: number;
  difficulty: "MEDIUM" | "HARD";
  solutionContent: string;
  subtopicSlugs: string[];
}

interface Qset {
  mcq: unknown[];
  shortAnswer: unknown[];
  extendedResponse: unknown[];
  extendedAnswer?: EA[];
}

const OUT = path.join(__dirname, "output");

// ───────────────────────────────────────────────────────────────────────────
// 1. Polynomial Equations
// ───────────────────────────────────────────────────────────────────────────
const POLY: EA[] = [
  // Q1: 4 marks (1+2+1)
  {
    content:
      "Let $p(x) = x^3 - 3x^2 - 10x + 24$.\n\n**a.** Show that $(x - 2)$ is a factor of $p(x)$. (1 mark)\n\n**b.** Hence factorise $p(x)$ completely. (2 marks)\n\n**c.** Using your answer from part (b), solve $p(x) > 0$. (1 mark)",
    marks: 4,
    difficulty: "MEDIUM",
    solutionContent:
      "**a. (1 mark)**\n\n*Step 1 (1 mark):* Evaluate $p(2)$.\n\n$$p(2) = 8 - 12 - 20 + 24$$\n\n$$= 0$$\n\nSince $p(2) = 0$, $(x - 2)$ is a factor of $p(x)$.\n\n**b. (2 marks)**\n\n*Step 1 (1 mark):* Divide $p(x)$ by $(x - 2)$.\n\n$$p(x) = (x - 2)(x^2 - x - 12)$$\n\n*Step 2 (1 mark):* Factorise the quadratic.\n\n$$x^2 - x - 12 = (x - 4)(x + 3)$$\n\nSo $p(x) = (x - 2)(x - 4)(x + 3)$.\n\n**c. (1 mark)**\n\n*Step 1 (1 mark):* The zeros are $x = -3, 2, 4$. Since the leading coefficient is positive, a sign analysis gives:\n\n$$p(x) > 0 \\text{ for } x \\in (-3, 2) \\cup (4, \\infty)$$",
    subtopicSlugs: ["polynomial-equations"],
  },
  // Q2: 5 marks (1+2+2)
  {
    content:
      "The polynomial $q(x) = 2x^3 + ax^2 - 7x + b$ has $(x + 1)$ as a factor and gives remainder $18$ when divided by $(x - 2)$.\n\n**a.** Write down two equations relating $a$ and $b$. (1 mark)\n\n**b.** Hence find the values of $a$ and $b$. (2 marks)\n\n**c.** Using your values from part (b), factorise $q(x)$ completely. (2 marks)",
    marks: 5,
    difficulty: "MEDIUM",
    solutionContent:
      "**a. (1 mark)**\n\n*Step 1 (1 mark):* Since $(x + 1)$ is a factor, $q(-1) = 0$:\n\n$$-2 + a + 7 + b = 0$$\n\n$$a + b = -5 \\quad \\cdots (1)$$\n\nBy the remainder theorem, $q(2) = 18$:\n\n$$16 + 4a - 14 + b = 18$$\n\n$$4a + b = 16 \\quad \\cdots (2)$$\n\n**b. (2 marks)**\n\n*Step 1 (1 mark):* Subtract (1) from (2).\n\n$$3a = 21$$\n\n$$a = 7$$\n\n*Step 2 (1 mark):* Substitute into (1).\n\n$$b = -5 - 7$$\n\n$$= -12$$\n\n**c. (2 marks)**\n\n*Step 1 (1 mark):* With $a = 7, b = -12$, divide $q(x) = 2x^3 + 7x^2 - 7x - 12$ by $(x + 1)$.\n\n$$q(x) = (x + 1)(2x^2 + 5x - 12)$$\n\n*Step 2 (1 mark):* Factorise the quadratic.\n\n$$2x^2 + 5x - 12 = (2x - 3)(x + 4)$$\n\nSo $q(x) = (x + 1)(2x - 3)(x + 4)$.",
    subtopicSlugs: ["polynomial-equations"],
  },
  // Q3: 6 marks (1+2+1+2)
  {
    content:
      "Consider $f(x) = x^3 - 6x^2 + 11x - 6$.\n\n**a.** Verify that $x = 1$ is a root of $f(x) = 0$. (1 mark)\n\n**b.** Hence express $f(x)$ as a product of three linear factors. (2 marks)\n\n**c.** Find $f'(x)$. (1 mark)\n\n**d.** Using your answer from part (c), find the exact coordinates of the stationary points of $y = f(x)$. (2 marks)",
    marks: 6,
    difficulty: "MEDIUM",
    solutionContent:
      "**a. (1 mark)**\n\n*Step 1 (1 mark):* Evaluate $f(1)$.\n\n$$f(1) = 1 - 6 + 11 - 6$$\n\n$$= 0$$\n\nSo $x = 1$ is a root.\n\n**b. (2 marks)**\n\n*Step 1 (1 mark):* Divide $f(x)$ by $(x - 1)$.\n\n$$f(x) = (x - 1)(x^2 - 5x + 6)$$\n\n*Step 2 (1 mark):* Factorise the quadratic.\n\n$$x^2 - 5x + 6 = (x - 2)(x - 3)$$\n\nSo $f(x) = (x - 1)(x - 2)(x - 3)$.\n\n**c. (1 mark)**\n\n*Step 1 (1 mark):* Differentiate.\n\n$$f'(x) = 3x^2 - 12x + 11$$\n\n**d. (2 marks)**\n\n*Step 1 (1 mark):* Set $f'(x) = 0$.\n\n$$3x^2 - 12x + 11 = 0$$\n\nUsing the quadratic formula:\n\n$$x = \\dfrac{12 \\pm \\sqrt{144 - 132}}{6}$$\n\n$$= \\dfrac{6 \\pm \\sqrt{3}}{3}$$\n\n*Step 2 (1 mark):* Substitute to find $y$-coordinates.\n\nAt $x = \\dfrac{6 - \\sqrt{3}}{3}$: $f\\!\\left(\\dfrac{6 - \\sqrt{3}}{3}\\right) = \\dfrac{2\\sqrt{3}}{9}$\n\nAt $x = \\dfrac{6 + \\sqrt{3}}{3}$: $f\\!\\left(\\dfrac{6 + \\sqrt{3}}{3}\\right) = -\\dfrac{2\\sqrt{3}}{9}$\n\nThe stationary points are $\\left(\\dfrac{6 - \\sqrt{3}}{3},\\, \\dfrac{2\\sqrt{3}}{9}\\right)$ and $\\left(\\dfrac{6 + \\sqrt{3}}{3},\\, -\\dfrac{2\\sqrt{3}}{9}\\right)$.",
    subtopicSlugs: ["polynomial-equations"],
  },
  // Q4: 7 marks (1+2+2+2)
  {
    content:
      "Let $p(x) = x^4 - 5x^2 + 4$.\n\n**a.** By letting $u = x^2$, write $p(x)$ as a quadratic expression in $u$. (1 mark)\n\n**b.** Hence factorise $p(x)$ completely over the reals. (2 marks)\n\n**c.** Solve $p(x) \\leq 0$. (2 marks)\n\n**d.** The graph of $y = p(x)$ is reflected in the $x$-axis and then translated $5$ units up. Write down the equation of the resulting curve and find its $x$-intercepts in exact form. (2 marks)",
    marks: 7,
    difficulty: "HARD",
    solutionContent:
      "**a. (1 mark)**\n\n*Step 1 (1 mark):* Substitute $u = x^2$.\n\n$$p = u^2 - 5u + 4$$\n\n**b. (2 marks)**\n\n*Step 1 (1 mark):* Factorise in $u$.\n\n$$u^2 - 5u + 4 = (u - 1)(u - 4)$$\n\n*Step 2 (1 mark):* Replace $u = x^2$ and factor further.\n\n$$p(x) = (x^2 - 1)(x^2 - 4)$$\n\n$$= (x - 1)(x + 1)(x - 2)(x + 2)$$\n\n**c. (2 marks)**\n\n*Step 1 (1 mark):* The zeros are $x = -2, -1, 1, 2$. Since the leading coefficient of $x^4$ is positive, $p(x) \\to +\\infty$ as $x \\to \\pm\\infty$.\n\n*Step 2 (1 mark):* By sign analysis, $p(x) \\leq 0$ between the pairs of roots:\n\n$$x \\in [-2, -1] \\cup [1, 2]$$\n\n**d. (2 marks)**\n\n*Step 1 (1 mark):* Reflect in the $x$-axis: $y = -p(x)$. Translate $5$ up:\n\n$$y = -x^4 + 5x^2 - 4 + 5$$\n\n$$= -x^4 + 5x^2 + 1$$\n\n*Step 2 (1 mark):* For $x$-intercepts, set $-x^4 + 5x^2 + 1 = 0$, i.e. $x^4 - 5x^2 - 1 = 0$. Let $u = x^2$:\n\n$$u = \\dfrac{5 \\pm \\sqrt{25 + 4}}{2}$$\n\n$$= \\dfrac{5 \\pm \\sqrt{29}}{2}$$\n\nSince $u = x^2 \\geq 0$ and $\\dfrac{5 - \\sqrt{29}}{2} < 0$, only $u = \\dfrac{5 + \\sqrt{29}}{2}$ is valid.\n\n$$x = \\pm\\sqrt{\\dfrac{5 + \\sqrt{29}}{2}}$$",
    subtopicSlugs: ["polynomial-equations"],
  },
  // Q5: 8 marks (1+2+2+3)
  {
    content:
      "Let $h(x) = x^3 - 2x^2 - 5x + 6$.\n\n**a.** Show that $(x + 2)$ is a factor of $h(x)$. (1 mark)\n\n**b.** Hence factorise $h(x)$ completely and find its $x$-intercepts. (2 marks)\n\n**c.** Find the exact coordinates of the turning points of $y = h(x)$. (2 marks)\n\n**d.** Find the values of $m$ for which $h(x) = m$ has exactly two real solutions. (3 marks)",
    marks: 8,
    difficulty: "HARD",
    solutionContent:
      "**a. (1 mark)**\n\n*Step 1 (1 mark):* Evaluate $h(-2)$.\n\n$$h(-2) = -8 - 8 + 10 + 6$$\n\n$$= 0$$\n\nSo $(x + 2)$ is a factor.\n\n**b. (2 marks)**\n\n*Step 1 (1 mark):* Divide $h(x)$ by $(x + 2)$.\n\n$$h(x) = (x + 2)(x^2 - 4x + 3)$$\n\n*Step 2 (1 mark):* Factorise the quadratic.\n\n$$x^2 - 4x + 3 = (x - 1)(x - 3)$$\n\nSo $h(x) = (x + 2)(x - 1)(x - 3)$ and the $x$-intercepts are $x = -2, 1, 3$.\n\n**c. (2 marks)**\n\n*Step 1 (1 mark):* Differentiate.\n\n$$h'(x) = 3x^2 - 4x - 5$$\n\nSet $h'(x) = 0$:\n\n$$x = \\dfrac{4 \\pm \\sqrt{16 + 60}}{6}$$\n\n$$= \\dfrac{4 \\pm \\sqrt{76}}{6}$$\n\n$$= \\dfrac{2 \\pm \\sqrt{19}}{3}$$\n\n*Step 2 (1 mark):* Evaluate $h$ at each turning point.\n\nAt $x = \\dfrac{2 - \\sqrt{19}}{3}$ (local max): $h\\!\\left(\\dfrac{2 - \\sqrt{19}}{3}\\right) = \\dfrac{20 + 38\\sqrt{19}}{27}$\n\nAt $x = \\dfrac{2 + \\sqrt{19}}{3}$ (local min): $h\\!\\left(\\dfrac{2 + \\sqrt{19}}{3}\\right) = \\dfrac{20 - 38\\sqrt{19}}{27}$\n\n**d. (3 marks)**\n\n*Step 1 (1 mark):* The equation $h(x) = m$ has exactly two real solutions when the horizontal line $y = m$ is tangent to $y = h(x)$ at a turning point.\n\n*Step 2 (1 mark):* This occurs when $m$ equals the local maximum or local minimum value.\n\n*Step 3 (1 mark):* Therefore:\n\n$$m = \\dfrac{20 + 38\\sqrt{19}}{27} \\quad \\text{or} \\quad m = \\dfrac{20 - 38\\sqrt{19}}{27}$$",
    subtopicSlugs: ["polynomial-equations"],
  },
];

// ───────────────────────────────────────────────────────────────────────────
// 2. Exponent and Logarithm Laws
// ───────────────────────────────────────────────────────────────────────────
const EXP_LOG_LAWS: EA[] = [
  // Q1: 4 marks (1+1+2)
  {
    content:
      "**a.** Simplify $\\dfrac{2^{3n+1} \\times 4^n}{8^n}$, expressing your answer as a power of $2$. (1 mark)\n\n**b.** Hence simplify $\\log_2\\!\\left(\\dfrac{2^{3n+1} \\times 4^n}{8^n}\\right)$. (1 mark)\n\n**c.** Solve $\\dfrac{2^{3n+1} \\times 4^n}{8^n} = 32$ for $n$. (2 marks)",
    marks: 4,
    difficulty: "MEDIUM",
    solutionContent:
      "**a. (1 mark)**\n\n*Step 1 (1 mark):* Express all terms as powers of $2$.\n\n$$\\dfrac{2^{3n+1} \\times (2^2)^n}{(2^3)^n} = \\dfrac{2^{3n+1} \\times 2^{2n}}{2^{3n}}$$\n\n$$= 2^{3n+1+2n-3n}$$\n\n$$= 2^{2n+1}$$\n\n**b. (1 mark)**\n\n*Step 1 (1 mark):* Apply the log law.\n\n$$\\log_2(2^{2n+1}) = 2n + 1$$\n\n**c. (2 marks)**\n\n*Step 1 (1 mark):* Using the result from part (a):\n\n$$2^{2n+1} = 32$$\n\n$$2^{2n+1} = 2^5$$\n\n*Step 2 (1 mark):* Equate exponents.\n\n$$2n + 1 = 5$$\n\n$$n = 2$$",
    subtopicSlugs: ["exponent-and-logarithm-laws"],
  },
  // Q2: 5 marks (1+2+2)
  {
    content:
      "Let $a = \\log_3 2$.\n\n**a.** Express $\\log_3 8$ in terms of $a$. (1 mark)\n\n**b.** Express $\\log_3 \\dfrac{9}{4}$ in terms of $a$. (2 marks)\n\n**c.** Hence solve $3^x = \\dfrac{9}{4}$, expressing your answer in terms of $a$. (2 marks)",
    marks: 5,
    difficulty: "MEDIUM",
    solutionContent:
      "**a. (1 mark)**\n\n*Step 1 (1 mark):* Since $8 = 2^3$:\n\n$$\\log_3 8 = \\log_3 2^3$$\n\n$$= 3\\log_3 2$$\n\n$$= 3a$$\n\n**b. (2 marks)**\n\n*Step 1 (1 mark):* Use the quotient law.\n\n$$\\log_3 \\dfrac{9}{4} = \\log_3 9 - \\log_3 4$$\n\n*Step 2 (1 mark):* Simplify each term.\n\n$$= 2 - \\log_3 2^2$$\n\n$$= 2 - 2a$$\n\n**c. (2 marks)**\n\n*Step 1 (1 mark):* Take $\\log_3$ of both sides.\n\n$$x = \\log_3 \\dfrac{9}{4}$$\n\n*Step 2 (1 mark):* Using part (b):\n\n$$x = 2 - 2a$$",
    subtopicSlugs: ["exponent-and-logarithm-laws"],
  },
  // Q3: 6 marks (1+2+1+2)
  {
    content:
      "**a.** Show that $\\log_{10} 5 = 1 - \\log_{10} 2$. (1 mark)\n\n**b.** Express $\\log_{10} 500$ in terms of $\\log_{10} 2$. (2 marks)\n\n**c.** Given that $\\log_{10} 2 \\approx 0.301$, find $\\log_{10} 500$. (1 mark)\n\n**d.** Hence find the number of digits in $500^{20}$. (2 marks)",
    marks: 6,
    difficulty: "MEDIUM",
    solutionContent:
      "**a. (1 mark)**\n\n*Step 1 (1 mark):* Since $5 = \\dfrac{10}{2}$:\n\n$$\\log_{10} 5 = \\log_{10} \\dfrac{10}{2}$$\n\n$$= \\log_{10} 10 - \\log_{10} 2$$\n\n$$= 1 - \\log_{10} 2$$\n\n**b. (2 marks)**\n\n*Step 1 (1 mark):* Write $500 = 5 \\times 100 = 5 \\times 10^2$.\n\n$$\\log_{10} 500 = \\log_{10} 5 + \\log_{10} 10^2$$\n\n*Step 2 (1 mark):* Substitute the result from part (a).\n\n$$= (1 - \\log_{10} 2) + 2$$\n\n$$= 3 - \\log_{10} 2$$\n\n**c. (1 mark)**\n\n*Step 1 (1 mark):* Substitute the given value.\n\n$$\\log_{10} 500 = 3 - 0.301$$\n\n$$= 2.699$$\n\n**d. (2 marks)**\n\n*Step 1 (1 mark):* Find $\\log_{10}(500^{20})$.\n\n$$\\log_{10}(500^{20}) = 20 \\times \\log_{10} 500$$\n\n$$= 20 \\times 2.699$$\n\n$$= 53.98$$\n\n*Step 2 (1 mark):* A positive integer $N$ has $d$ digits where $d = \\lfloor\\log_{10} N\\rfloor + 1$.\n\n$$d = \\lfloor 53.98 \\rfloor + 1$$\n\n$$= 54$$\n\nSo $500^{20}$ has $54$ digits.",
    subtopicSlugs: ["exponent-and-logarithm-laws"],
  },
  // Q4: 7 marks (2+2+1+2)
  {
    content:
      "**a.** Simplify $\\dfrac{9^{x+1} \\times 3^{2x}}{27^x}$, expressing your answer in the form $a \\cdot 3^{bx}$ where $a$ and $b$ are positive integers. (2 marks)\n\n**b.** Hence solve $\\dfrac{9^{x+1} \\times 3^{2x}}{27^x} = \\dfrac{1}{3}$ for $x$. (2 marks)\n\n**c.** Evaluate $\\log_3\\!\\left(\\dfrac{9^{x+1} \\times 3^{2x}}{27^x}\\right)$ when $x = 5$. (1 mark)\n\n**d.** Find the values of $x$ for which $\\log_3\\!\\left(\\dfrac{9^{x+1} \\times 3^{2x}}{27^x}\\right) \\leq 4$. (2 marks)",
    marks: 7,
    difficulty: "HARD",
    solutionContent:
      "**a. (2 marks)**\n\n*Step 1 (1 mark):* Express all terms as powers of $3$.\n\n$$\\dfrac{(3^2)^{x+1} \\times 3^{2x}}{(3^3)^x} = \\dfrac{3^{2x+2} \\times 3^{2x}}{3^{3x}}$$\n\n*Step 2 (1 mark):* Simplify the exponent.\n\n$$= 3^{2x+2+2x-3x}$$\n\n$$= 3^{x+2}$$\n\n$$= 9 \\cdot 3^x$$\n\nSo $a = 9$ and $b = 1$.\n\n**b. (2 marks)**\n\n*Step 1 (1 mark):* Using part (a), $9 \\cdot 3^x = \\dfrac{1}{3}$.\n\n$$3^x = \\dfrac{1}{27}$$\n\n*Step 2 (1 mark):* Solve.\n\n$$3^x = 3^{-3}$$\n\n$$x = -3$$\n\n**c. (1 mark)**\n\n*Step 1 (1 mark):* From part (a), the expression equals $3^{x+2}$, so $\\log_3(3^{x+2}) = x + 2$.\n\nWhen $x = 5$: $5 + 2 = 7$.\n\n**d. (2 marks)**\n\n*Step 1 (1 mark):* Using part (c)'s general result, the inequality becomes:\n\n$$x + 2 \\leq 4$$\n\n*Step 2 (1 mark):* Solve.\n\n$$x \\leq 2$$",
    subtopicSlugs: ["exponent-and-logarithm-laws"],
  },
  // Q5: 8 marks (2+2+2+2)
  {
    content:
      "Let $p = \\log_2 3$.\n\n**a.** Express $\\log_2 12$ and $\\log_2 \\dfrac{3}{8}$ each in terms of $p$. (2 marks)\n\n**b.** Show that $\\log_4 3 = \\dfrac{p}{2}$. (2 marks)\n\n**c.** Express $\\log_8 9$ in terms of $p$. (2 marks)\n\n**d.** Solve $4^x = 3 \\cdot 2^{x+1}$ for $x$, expressing your answer in terms of $p$. (2 marks)",
    marks: 8,
    difficulty: "HARD",
    solutionContent:
      "**a. (2 marks)**\n\n*Step 1 (1 mark):* $\\log_2 12 = \\log_2(4 \\times 3) = \\log_2 4 + \\log_2 3 = 2 + p$.\n\n*Step 2 (1 mark):* $\\log_2 \\dfrac{3}{8} = \\log_2 3 - \\log_2 8 = p - 3$.\n\n**b. (2 marks)**\n\n*Step 1 (1 mark):* Use the change of base formula.\n\n$$\\log_4 3 = \\dfrac{\\log_2 3}{\\log_2 4}$$\n\n*Step 2 (1 mark):* Simplify.\n\n$$= \\dfrac{p}{2}$$\n\n**c. (2 marks)**\n\n*Step 1 (1 mark):* Use the change of base formula.\n\n$$\\log_8 9 = \\dfrac{\\log_2 9}{\\log_2 8}$$\n\n*Step 2 (1 mark):* Since $9 = 3^2$ and $8 = 2^3$:\n\n$$= \\dfrac{2\\log_2 3}{3}$$\n\n$$= \\dfrac{2p}{3}$$\n\n**d. (2 marks)**\n\n*Step 1 (1 mark):* Rewrite the equation.\n\n$$2^{2x} = 3 \\cdot 2^{x+1}$$\n\n$$2^{2x} = 3 \\cdot 2 \\cdot 2^x$$\n\n$$\\dfrac{2^{2x}}{2^x} = 6$$\n\n$$2^x = 6$$\n\n*Step 2 (1 mark):* Take $\\log_2$ of both sides.\n\n$$x = \\log_2 6$$\n\n$$= \\log_2 2 + \\log_2 3$$\n\n$$= 1 + p$$",
    subtopicSlugs: ["exponent-and-logarithm-laws"],
  },
];

// ───────────────────────────────────────────────────────────────────────────
// 3. Exponential Equations
// ───────────────────────────────────────────────────────────────────────────
const EXP_EQN: EA[] = [
  // Q1: 4 marks (1+1+2)
  {
    content:
      "Consider the equation $e^{2x} - 5e^x + 6 = 0$.\n\n**a.** By letting $u = e^x$, show that the equation becomes $u^2 - 5u + 6 = 0$. (1 mark)\n\n**b.** Solve for $u$. (1 mark)\n\n**c.** Hence find the exact values of $x$. (2 marks)",
    marks: 4,
    difficulty: "MEDIUM",
    solutionContent:
      "**a. (1 mark)**\n\n*Step 1 (1 mark):* Since $u = e^x$, we have $e^{2x} = (e^x)^2 = u^2$. Substituting:\n\n$$u^2 - 5u + 6 = 0$$\n\n**b. (1 mark)**\n\n*Step 1 (1 mark):* Factorise.\n\n$$(u - 2)(u - 3) = 0$$\n\n$$u = 2 \\text{ or } u = 3$$\n\n**c. (2 marks)**\n\n*Step 1 (1 mark):* Since $u = e^x = 2$:\n\n$$x = \\ln 2$$\n\n*Step 2 (1 mark):* Since $u = e^x = 3$:\n\n$$x = \\ln 3$$",
    subtopicSlugs: ["exponential-equations"],
  },
  // Q2: 5 marks (1+2+2)
  {
    content:
      "Solve $4^x - 3 \\cdot 2^x - 4 = 0$ for $x$.\n\n**a.** By writing $4^x$ as $(2^x)^2$ and letting $u = 2^x$, show that $u^2 - 3u - 4 = 0$. (1 mark)\n\n**b.** Solve for $u$ and explain why one solution must be rejected. (2 marks)\n\n**c.** Hence find the exact value of $x$. (2 marks)",
    marks: 5,
    difficulty: "MEDIUM",
    solutionContent:
      "**a. (1 mark)**\n\n*Step 1 (1 mark):* Since $4^x = (2^2)^x = (2^x)^2 = u^2$, the equation becomes:\n\n$$u^2 - 3u - 4 = 0$$\n\n**b. (2 marks)**\n\n*Step 1 (1 mark):* Factorise.\n\n$$(u - 4)(u + 1) = 0$$\n\n$$u = 4 \\text{ or } u = -1$$\n\n*Step 2 (1 mark):* Since $u = 2^x > 0$ for all real $x$, the solution $u = -1$ is rejected.\n\n**c. (2 marks)**\n\n*Step 1 (1 mark):* From $2^x = 4$:\n\n$$2^x = 2^2$$\n\n*Step 2 (1 mark):* Equate exponents.\n\n$$x = 2$$",
    subtopicSlugs: ["exponential-equations"],
  },
  // Q3: 6 marks (1+2+1+2)
  {
    content:
      "Consider the equation $9^x - 4 \\cdot 3^x + 3 = 0$.\n\n**a.** Using a suitable substitution, write this equation as a quadratic. (1 mark)\n\n**b.** Solve the quadratic to find the exact values of $x$. (2 marks)\n\n**c.** Verify that both solutions satisfy the original equation. (1 mark)\n\n**d.** Solve $9^x - 4 \\cdot 3^x + 3 < 0$. (2 marks)",
    marks: 6,
    difficulty: "MEDIUM",
    solutionContent:
      "**a. (1 mark)**\n\n*Step 1 (1 mark):* Let $u = 3^x$, so $9^x = (3^x)^2 = u^2$. The equation becomes:\n\n$$u^2 - 4u + 3 = 0$$\n\n**b. (2 marks)**\n\n*Step 1 (1 mark):* Factorise.\n\n$$(u - 1)(u - 3) = 0$$\n\n$$u = 1 \\text{ or } u = 3$$\n\n*Step 2 (1 mark):* Convert back.\n\n$$3^x = 1 \\Rightarrow x = 0$$\n\n$$3^x = 3 \\Rightarrow x = 1$$\n\n**c. (1 mark)**\n\n*Step 1 (1 mark):* Check $x = 0$: $9^0 - 4 \\cdot 3^0 + 3 = 1 - 4 + 3 = 0$. Correct.\n\nCheck $x = 1$: $9^1 - 4 \\cdot 3^1 + 3 = 9 - 12 + 3 = 0$. Correct.\n\n**d. (2 marks)**\n\n*Step 1 (1 mark):* From part (a), the inequality becomes $(u - 1)(u - 3) < 0$ where $u = 3^x > 0$.\n\nThis holds when $1 < u < 3$.\n\n*Step 2 (1 mark):* Convert back to $x$.\n\n$$1 < 3^x < 3$$\n\n$$0 < x < 1$$",
    subtopicSlugs: ["exponential-equations"],
  },
  // Q4: 7 marks (1+2+2+2)
  {
    content:
      "Let $f(x) = 2e^{2x} - 9e^x + 4$.\n\n**a.** Show that $f(x) = 0$ can be written as $2u^2 - 9u + 4 = 0$, where $u = e^x$. (1 mark)\n\n**b.** Solve for $u$ and hence find the exact values of $x$ for which $f(x) = 0$. (2 marks)\n\n**c.** Find $f'(x)$ and determine the exact coordinates of the stationary point of $y = f(x)$. (2 marks)\n\n**d.** Using your answers from parts (b) and (c), determine the set of values of $x$ for which $f(x) < 0$. (2 marks)",
    marks: 7,
    difficulty: "HARD",
    solutionContent:
      "**a. (1 mark)**\n\n*Step 1 (1 mark):* Since $u = e^x$, we have $e^{2x} = u^2$. Substituting:\n\n$$2u^2 - 9u + 4 = 0$$\n\n**b. (2 marks)**\n\n*Step 1 (1 mark):* Factorise.\n\n$$(2u - 1)(u - 4) = 0$$\n\n$$u = \\dfrac{1}{2} \\text{ or } u = 4$$\n\n*Step 2 (1 mark):* Since $u = e^x$:\n\n$$e^x = \\dfrac{1}{2} \\Rightarrow x = \\ln \\dfrac{1}{2} = -\\ln 2$$\n\n$$e^x = 4 \\Rightarrow x = \\ln 4 = 2\\ln 2$$\n\n**c. (2 marks)**\n\n*Step 1 (1 mark):* Differentiate.\n\n$$f'(x) = 4e^{2x} - 9e^x$$\n\nSet $f'(x) = 0$: $e^x(4e^x - 9) = 0$. Since $e^x > 0$:\n\n$$4e^x = 9$$\n\n$$e^x = \\dfrac{9}{4}$$\n\n$$x = \\ln \\dfrac{9}{4}$$\n\n*Step 2 (1 mark):* Find the $y$-coordinate.\n\n$$f\\!\\left(\\ln \\dfrac{9}{4}\\right) = 2 \\cdot \\dfrac{81}{16} - 9 \\cdot \\dfrac{9}{4} + 4$$\n\n$$= \\dfrac{162}{16} - \\dfrac{324}{16} + \\dfrac{64}{16}$$\n\n$$= -\\dfrac{98}{16}$$\n\n$$= -\\dfrac{49}{8}$$\n\nThe stationary point is $\\left(\\ln \\dfrac{9}{4},\\, -\\dfrac{49}{8}\\right)$.\n\n**d. (2 marks)**\n\n*Step 1 (1 mark):* From part (b), $f(x) = 0$ at $x = -\\ln 2$ and $x = 2\\ln 2$. From part (c), $f(x)$ has a minimum between these zeros.\n\n*Step 2 (1 mark):* Since $f(x) \\to +\\infty$ as $x \\to \\pm\\infty$ and the minimum lies between the roots:\n\n$$f(x) < 0 \\text{ for } x \\in (-\\ln 2,\\, 2\\ln 2)$$",
    subtopicSlugs: ["exponential-equations"],
  },
  // Q5: 8 marks (1+2+2+3)
  {
    content:
      "Consider the equation $e^{2x} + e^{-2x} = k$, where $k$ is a positive real constant.\n\n**a.** By letting $u = e^{2x}$, show that the equation can be written as $u^2 - ku + 1 = 0$. (1 mark)\n\n**b.** Using the discriminant, show that the equation has real solutions only when $k \\geq 2$. (2 marks)\n\n**c.** Find the exact solutions for $x$ when $k = 5$. (2 marks)\n\n**d.** Show that when $k = 2$, the only solution is $x = 0$, and find the exact two solutions when $k = 3$. (3 marks)",
    marks: 8,
    difficulty: "HARD",
    solutionContent:
      "**a. (1 mark)**\n\n*Step 1 (1 mark):* Since $u = e^{2x}$, we have $e^{-2x} = \\dfrac{1}{u}$. Substituting:\n\n$$u + \\dfrac{1}{u} = k$$\n\nMultiply through by $u$ (noting $u > 0$):\n\n$$u^2 - ku + 1 = 0$$\n\n**b. (2 marks)**\n\n*Step 1 (1 mark):* The discriminant of $u^2 - ku + 1 = 0$ is:\n\n$$\\Delta = k^2 - 4$$\n\n*Step 2 (1 mark):* For real solutions in $u$, we need $\\Delta \\geq 0$, so $k^2 \\geq 4$. Since $k > 0$, this gives $k \\geq 2$. Additionally, by Vieta's formulas, the product of roots is $1 > 0$ and the sum is $k > 0$, so both roots are positive when they exist. Therefore real solutions for $x$ exist when $k \\geq 2$.\n\n**c. (2 marks)**\n\n*Step 1 (1 mark):* With $k = 5$: $u^2 - 5u + 1 = 0$.\n\n$$u = \\dfrac{5 \\pm \\sqrt{25 - 4}}{2}$$\n\n$$= \\dfrac{5 \\pm \\sqrt{21}}{2}$$\n\n*Step 2 (1 mark):* Since $u = e^{2x}$:\n\n$$x = \\dfrac{1}{2}\\ln\\!\\left(\\dfrac{5 + \\sqrt{21}}{2}\\right) \\quad \\text{or} \\quad x = \\dfrac{1}{2}\\ln\\!\\left(\\dfrac{5 - \\sqrt{21}}{2}\\right)$$\n\n**d. (3 marks)**\n\n*Step 1 (1 mark):* When $k = 2$: $u^2 - 2u + 1 = 0$, so $(u - 1)^2 = 0$, giving $u = 1$.\n\n$$e^{2x} = 1$$\n\n$$x = 0$$\n\n*Step 2 (1 mark):* When $k = 3$: $u^2 - 3u + 1 = 0$.\n\n$$u = \\dfrac{3 \\pm \\sqrt{5}}{2}$$\n\n*Step 3 (1 mark):* Therefore:\n\n$$x = \\dfrac{1}{2}\\ln\\!\\left(\\dfrac{3 + \\sqrt{5}}{2}\\right) \\quad \\text{or} \\quad x = \\dfrac{1}{2}\\ln\\!\\left(\\dfrac{3 - \\sqrt{5}}{2}\\right)$$",
    subtopicSlugs: ["exponential-equations"],
  },
];

// ───────────────────────────────────────────────────────────────────────────
// 4. Logarithmic Equations
// ───────────────────────────────────────────────────────────────────────────
const LOG_EQN: EA[] = [
  // Q1: 4 marks (1+1+2)
  {
    content:
      "Consider the equation $\\log_2(x - 1) + \\log_2(x + 3) = 5$.\n\n**a.** Using logarithm laws, show that the equation can be written as $(x - 1)(x + 3) = 32$. (1 mark)\n\n**b.** Expand and rearrange to obtain a quadratic equation. (1 mark)\n\n**c.** Solve the quadratic and hence find the value of $x$, justifying why one solution is rejected. (2 marks)",
    marks: 4,
    difficulty: "MEDIUM",
    solutionContent:
      "**a. (1 mark)**\n\n*Step 1 (1 mark):* Using the product rule for logarithms:\n\n$$\\log_2\\big((x-1)(x+3)\\big) = 5$$\n\nConverting to exponential form:\n\n$$(x-1)(x+3) = 2^5$$\n\n$$= 32$$\n\n**b. (1 mark)**\n\n*Step 1 (1 mark):* Expand.\n\n$$x^2 + 2x - 3 = 32$$\n\n$$x^2 + 2x - 35 = 0$$\n\n**c. (2 marks)**\n\n*Step 1 (1 mark):* Factorise.\n\n$$(x + 7)(x - 5) = 0$$\n\n$$x = -7 \\text{ or } x = 5$$\n\n*Step 2 (1 mark):* Check domain: $\\log_2(x - 1)$ requires $x > 1$ and $\\log_2(x + 3)$ requires $x > -3$. Since $x = -7 < 1$, it is rejected.\n\n$$x = 5$$",
    subtopicSlugs: ["logarithmic-equations"],
  },
  // Q2: 5 marks (1+2+2)
  {
    content:
      "**a.** Express $\\log_3(9x)$ in the form $a + \\log_3 x$, where $a$ is an integer. (1 mark)\n\n**b.** Hence solve $\\log_3(9x) + \\log_3 x = 6$. (2 marks)\n\n**c.** Solve $\\log_3(9x) - \\log_3 x = 6$. (2 marks)",
    marks: 5,
    difficulty: "MEDIUM",
    solutionContent:
      "**a. (1 mark)**\n\n*Step 1 (1 mark):* Apply the product rule.\n\n$$\\log_3(9x) = \\log_3 9 + \\log_3 x$$\n\n$$= 2 + \\log_3 x$$\n\n**b. (2 marks)**\n\n*Step 1 (1 mark):* Substitute the result from part (a).\n\n$$(2 + \\log_3 x) + \\log_3 x = 6$$\n\n$$2\\log_3 x = 4$$\n\n$$\\log_3 x = 2$$\n\n*Step 2 (1 mark):* Solve.\n\n$$x = 3^2$$\n\n$$= 9$$\n\n**c. (2 marks)**\n\n*Step 1 (1 mark):* Using the quotient rule:\n\n$$\\log_3 \\dfrac{9x}{x} = 6$$\n\n$$\\log_3 9 = 6$$\n\n$$2 = 6$$\n\n*Step 2 (1 mark):* This is a contradiction, so the equation has no solution.",
    subtopicSlugs: ["logarithmic-equations"],
  },
  // Q3: 6 marks (1+2+1+2)
  {
    content:
      "Consider the equation $2\\log_5(x) = \\log_5(2x + 3)$.\n\n**a.** Using logarithm laws, write the left-hand side as a single logarithm. (1 mark)\n\n**b.** Hence show that $x^2 - 2x - 3 = 0$. (2 marks)\n\n**c.** Solve for $x$, giving reasons for rejecting any invalid solutions. (1 mark)\n\n**d.** Verify your answer by substituting back into the original equation. (2 marks)",
    marks: 6,
    difficulty: "MEDIUM",
    solutionContent:
      "**a. (1 mark)**\n\n*Step 1 (1 mark):* Apply the power rule.\n\n$$2\\log_5 x = \\log_5 x^2$$\n\n**b. (2 marks)**\n\n*Step 1 (1 mark):* Using part (a), the equation becomes:\n\n$$\\log_5 x^2 = \\log_5(2x + 3)$$\n\nSince $\\log_5$ is one-to-one:\n\n$$x^2 = 2x + 3$$\n\n*Step 2 (1 mark):* Rearrange.\n\n$$x^2 - 2x - 3 = 0$$\n\n**c. (1 mark)**\n\n*Step 1 (1 mark):* Factorise: $(x - 3)(x + 1) = 0$, so $x = 3$ or $x = -1$. The original equation has $\\log_5(x)$, which requires $x > 0$. Since $x = -1 < 0$, it is rejected.\n\n$$x = 3$$\n\n**d. (2 marks)**\n\n*Step 1 (1 mark):* LHS: $2\\log_5 3$.\n\n*Step 2 (1 mark):* RHS: $\\log_5(2 \\times 3 + 3) = \\log_5 9 = \\log_5 3^2 = 2\\log_5 3$.\n\nLHS $=$ RHS, confirming $x = 3$ is correct.",
    subtopicSlugs: ["logarithmic-equations"],
  },
  // Q4: 7 marks (1+2+2+2)
  {
    content:
      "Let $f(x) = \\ln(x + 4)$ and $g(x) = \\ln(6 - x)$.\n\n**a.** State the domain of $f$ and the domain of $g$. (1 mark)\n\n**b.** Solve $f(x) = g(x)$. (2 marks)\n\n**c.** Solve $f(x) + g(x) = \\ln 9 + \\ln 2$. (2 marks)\n\n**d.** Find the values of $x$ for which $f(x) > g(x)$. (2 marks)",
    marks: 7,
    difficulty: "HARD",
    solutionContent:
      "**a. (1 mark)**\n\n*Step 1 (1 mark):* For $f$: $x + 4 > 0$, so $x > -4$. For $g$: $6 - x > 0$, so $x < 6$.\n\nDomain of $f$: $(-4, \\infty)$. Domain of $g$: $(-\\infty, 6)$.\n\n**b. (2 marks)**\n\n*Step 1 (1 mark):* Set $\\ln(x + 4) = \\ln(6 - x)$.\n\n$$x + 4 = 6 - x$$\n\n*Step 2 (1 mark):* Solve.\n\n$$2x = 2$$\n\n$$x = 1$$\n\n**c. (2 marks)**\n\n*Step 1 (1 mark):* Combine the left side using the product rule.\n\n$$\\ln\\big((x+4)(6-x)\\big) = \\ln 18$$\n\n$$(x+4)(6-x) = 18$$\n\n$$-x^2 + 2x + 24 = 18$$\n\n$$x^2 - 2x - 6 = 0$$\n\n*Step 2 (1 mark):* Solve using the quadratic formula.\n\n$$x = \\dfrac{2 \\pm \\sqrt{4 + 24}}{2}$$\n\n$$= 1 \\pm \\sqrt{7}$$\n\nBoth values lie in $(-4, 6)$, so both are valid.\n\n**d. (2 marks)**\n\n*Step 1 (1 mark):* $f(x) > g(x)$ means $\\ln(x+4) > \\ln(6-x)$. Since $\\ln$ is increasing:\n\n$$x + 4 > 6 - x$$\n\n$$2x > 2$$\n\n$$x > 1$$\n\n*Step 2 (1 mark):* Combined with the common domain $(-4, 6)$:\n\n$$x \\in (1, 6)$$",
    subtopicSlugs: ["logarithmic-equations"],
  },
  // Q5: 8 marks (1+2+2+3)
  {
    content:
      "Consider the equation $\\log_2(x) + \\log_4(x) = 6$.\n\n**a.** Using the change of base formula, show that $\\log_4(x) = \\dfrac{\\log_2(x)}{2}$. (1 mark)\n\n**b.** Hence solve $\\log_2(x) + \\log_4(x) = 6$ for $x$. (2 marks)\n\n**c.** Solve $\\log_2(x) \\cdot \\log_4(x) = 8$ for $x$. (2 marks)\n\n**d.** Find the exact values of $x$ satisfying $\\log_2(x) - \\log_4(x) = 1$, and verify each answer. (3 marks)",
    marks: 8,
    difficulty: "HARD",
    solutionContent:
      "**a. (1 mark)**\n\n*Step 1 (1 mark):* Change of base:\n\n$$\\log_4 x = \\dfrac{\\log_2 x}{\\log_2 4}$$\n\n$$= \\dfrac{\\log_2 x}{2}$$\n\n**b. (2 marks)**\n\n*Step 1 (1 mark):* Let $t = \\log_2 x$. Using part (a):\n\n$$t + \\dfrac{t}{2} = 6$$\n\n$$\\dfrac{3t}{2} = 6$$\n\n$$t = 4$$\n\n*Step 2 (1 mark):* So $\\log_2 x = 4$, giving:\n\n$$x = 2^4$$\n\n$$= 16$$\n\n**c. (2 marks)**\n\n*Step 1 (1 mark):* Using part (a), let $t = \\log_2 x$:\n\n$$t \\cdot \\dfrac{t}{2} = 8$$\n\n$$t^2 = 16$$\n\n$$t = 4 \\text{ or } t = -4$$\n\n*Step 2 (1 mark):* So $x = 2^4 = 16$ or $x = 2^{-4} = \\dfrac{1}{16}$.\n\n**d. (3 marks)**\n\n*Step 1 (1 mark):* Using part (a), let $t = \\log_2 x$:\n\n$$t - \\dfrac{t}{2} = 1$$\n\n$$\\dfrac{t}{2} = 1$$\n\n$$t = 2$$\n\n*Step 2 (1 mark):* So $\\log_2 x = 2$, giving $x = 4$.\n\n*Step 3 (1 mark):* Verify: $\\log_2 4 = 2$ and $\\log_4 4 = 1$, so $2 - 1 = 1$. Correct.",
    subtopicSlugs: ["logarithmic-equations"],
  },
];

// ───────────────────────────────────────────────────────────────────────────
// 5. Trigonometric Equations
// ───────────────────────────────────────────────────────────────────────────
const TRIG_EQN: EA[] = [
  // Q1: 4 marks (1+1+2)
  {
    content:
      "Consider the equation $2\\cos^2(x) - 3\\cos(x) + 1 = 0$ for $x \\in [0, 2\\pi]$.\n\n**a.** By letting $u = \\cos(x)$, factorise the quadratic. (1 mark)\n\n**b.** Solve for $u$. (1 mark)\n\n**c.** Hence find all values of $x$ in $[0, 2\\pi]$. (2 marks)",
    marks: 4,
    difficulty: "MEDIUM",
    solutionContent:
      "**a. (1 mark)**\n\n*Step 1 (1 mark):* With $u = \\cos x$:\n\n$$2u^2 - 3u + 1 = (2u - 1)(u - 1)$$\n\n**b. (1 mark)**\n\n*Step 1 (1 mark):* Set each factor to zero.\n\n$$u = \\dfrac{1}{2} \\text{ or } u = 1$$\n\n**c. (2 marks)**\n\n*Step 1 (1 mark):* $\\cos x = 1$ gives $x = 0$.\n\n*Step 2 (1 mark):* $\\cos x = \\dfrac{1}{2}$ gives:\n\n$$x = \\dfrac{\\pi}{3} \\text{ or } x = \\dfrac{5\\pi}{3}$$\n\nAll solutions: $x \\in \\left\\{0,\\, \\dfrac{\\pi}{3},\\, \\dfrac{5\\pi}{3}\\right\\}$.",
    subtopicSlugs: ["trigonometric-equations"],
  },
  // Q2: 5 marks (1+2+2)
  {
    content:
      "**a.** Show that the equation $\\sin(2x) = \\cos(x)$ can be written as $\\cos(x)(2\\sin(x) - 1) = 0$. (1 mark)\n\n**b.** Hence find all solutions in $[0, 2\\pi]$. (2 marks)\n\n**c.** Determine which of these solutions also satisfy $\\sin(x) > 0$. (2 marks)",
    marks: 5,
    difficulty: "MEDIUM",
    solutionContent:
      "**a. (1 mark)**\n\n*Step 1 (1 mark):* Use the double angle formula $\\sin(2x) = 2\\sin(x)\\cos(x)$.\n\n$$2\\sin(x)\\cos(x) = \\cos(x)$$\n\n$$2\\sin(x)\\cos(x) - \\cos(x) = 0$$\n\n$$\\cos(x)(2\\sin(x) - 1) = 0$$\n\n**b. (2 marks)**\n\n*Step 1 (1 mark):* $\\cos(x) = 0$ gives:\n\n$$x = \\dfrac{\\pi}{2} \\text{ or } x = \\dfrac{3\\pi}{2}$$\n\n*Step 2 (1 mark):* $\\sin(x) = \\dfrac{1}{2}$ gives:\n\n$$x = \\dfrac{\\pi}{6} \\text{ or } x = \\dfrac{5\\pi}{6}$$\n\nAll solutions: $x \\in \\left\\{\\dfrac{\\pi}{6},\\, \\dfrac{\\pi}{2},\\, \\dfrac{5\\pi}{6},\\, \\dfrac{3\\pi}{2}\\right\\}$.\n\n**c. (2 marks)**\n\n*Step 1 (1 mark):* $\\sin(x) > 0$ when $x \\in (0, \\pi)$.\n\n*Step 2 (1 mark):* From the solutions in part (b), those in $(0, \\pi)$ are:\n\n$$x \\in \\left\\{\\dfrac{\\pi}{6},\\, \\dfrac{\\pi}{2},\\, \\dfrac{5\\pi}{6}\\right\\}$$",
    subtopicSlugs: ["trigonometric-equations"],
  },
  // Q3: 6 marks (1+2+1+2)
  {
    content:
      "Let $f(x) = 2\\sin^2(x) + \\sin(x) - 1$ for $x \\in [0, 2\\pi]$.\n\n**a.** By letting $u = \\sin(x)$, factorise $f(x)$ as a product of two linear factors in $u$. (1 mark)\n\n**b.** Solve $f(x) = 0$ for $x \\in [0, 2\\pi]$. (2 marks)\n\n**c.** Using the identity $\\sin^2(x) = \\dfrac{1 - \\cos(2x)}{2}$, show that $f(x) = -\\cos(2x) + \\sin(x)$. (1 mark)\n\n**d.** Hence, or otherwise, find the values of $x \\in [0, 2\\pi]$ for which $f(x) \\geq 0$. (2 marks)",
    marks: 6,
    difficulty: "MEDIUM",
    solutionContent:
      "**a. (1 mark)**\n\n*Step 1 (1 mark):* With $u = \\sin x$:\n\n$$2u^2 + u - 1 = (2u - 1)(u + 1)$$\n\n**b. (2 marks)**\n\n*Step 1 (1 mark):* $(2u - 1)(u + 1) = 0$ gives $u = \\dfrac{1}{2}$ or $u = -1$.\n\n$\\sin x = \\dfrac{1}{2}$:\n\n$$x = \\dfrac{\\pi}{6} \\text{ or } x = \\dfrac{5\\pi}{6}$$\n\n*Step 2 (1 mark):* $\\sin x = -1$:\n\n$$x = \\dfrac{3\\pi}{2}$$\n\nAll solutions: $x \\in \\left\\{\\dfrac{\\pi}{6},\\, \\dfrac{5\\pi}{6},\\, \\dfrac{3\\pi}{2}\\right\\}$.\n\n**c. (1 mark)**\n\n*Step 1 (1 mark):* Substitute $\\sin^2(x) = \\dfrac{1 - \\cos(2x)}{2}$.\n\n$$f(x) = 2 \\cdot \\dfrac{1 - \\cos(2x)}{2} + \\sin(x) - 1$$\n\n$$= 1 - \\cos(2x) + \\sin(x) - 1$$\n\n$$= -\\cos(2x) + \\sin(x)$$\n\n**d. (2 marks)**\n\n*Step 1 (1 mark):* From part (a), $f(x) = (2\\sin x - 1)(\\sin x + 1)$. Note that $\\sin x + 1 \\geq 0$ for all $x$ (equality at $x = \\dfrac{3\\pi}{2}$).\n\n*Step 2 (1 mark):* So $f(x) \\geq 0$ when $2\\sin x - 1 \\geq 0$ or $\\sin x + 1 = 0$. That is, $\\sin x \\geq \\dfrac{1}{2}$ or $x = \\dfrac{3\\pi}{2}$.\n\n$$x \\in \\left[\\dfrac{\\pi}{6},\\, \\dfrac{5\\pi}{6}\\right] \\cup \\left\\{\\dfrac{3\\pi}{2}\\right\\}$$",
    subtopicSlugs: ["trigonometric-equations"],
  },
  // Q4: 7 marks (1+2+2+2)
  {
    content:
      "Consider $\\cos(2x) + 3\\cos(x) + 2 = 0$ for $x \\in [0, 2\\pi]$.\n\n**a.** Using the double angle formula $\\cos(2x) = 2\\cos^2(x) - 1$, show that the equation can be written as $2\\cos^2(x) + 3\\cos(x) + 1 = 0$. (1 mark)\n\n**b.** Factorise and solve for $\\cos(x)$. (2 marks)\n\n**c.** Hence find all solutions in $[0, 2\\pi]$. (2 marks)\n\n**d.** Find the number of solutions to $\\cos(2x) + 3\\cos(x) + 2 = 0$ in $[0, 6\\pi]$. (2 marks)",
    marks: 7,
    difficulty: "HARD",
    solutionContent:
      "**a. (1 mark)**\n\n*Step 1 (1 mark):* Substitute $\\cos(2x) = 2\\cos^2(x) - 1$.\n\n$$2\\cos^2(x) - 1 + 3\\cos(x) + 2 = 0$$\n\n$$2\\cos^2(x) + 3\\cos(x) + 1 = 0$$\n\n**b. (2 marks)**\n\n*Step 1 (1 mark):* Factorise.\n\n$$(2\\cos x + 1)(\\cos x + 1) = 0$$\n\n*Step 2 (1 mark):* Solve.\n\n$$\\cos x = -\\dfrac{1}{2} \\text{ or } \\cos x = -1$$\n\n**c. (2 marks)**\n\n*Step 1 (1 mark):* $\\cos x = -\\dfrac{1}{2}$:\n\n$$x = \\dfrac{2\\pi}{3} \\text{ or } x = \\dfrac{4\\pi}{3}$$\n\n*Step 2 (1 mark):* $\\cos x = -1$:\n\n$$x = \\pi$$\n\nAll solutions in $[0, 2\\pi]$: $x \\in \\left\\{\\dfrac{2\\pi}{3},\\, \\pi,\\, \\dfrac{4\\pi}{3}\\right\\}$.\n\n**d. (2 marks)**\n\n*Step 1 (1 mark):* The interval $[0, 6\\pi]$ covers $3$ full periods of $\\cos(x)$.\n\n*Step 2 (1 mark):* In each period $[0, 2\\pi]$ there are $3$ solutions. Over $3$ periods this gives $3 \\times 3 = 9$ solutions. Since none of the solutions occur at $x = 0$ or $x = 2\\pi$ (the boundary values), there are no overlaps between periods.\n\n$$\\text{Number of solutions} = 9$$",
    subtopicSlugs: ["trigonometric-equations"],
  },
  // Q5: 8 marks (1+2+2+3)
  {
    content:
      "Consider the equation $2\\sin^2(x) - 5\\sin(x) + 2 = 0$ for $x \\in [0, 2\\pi]$.\n\n**a.** By letting $u = \\sin(x)$, factorise the left-hand side. (1 mark)\n\n**b.** Solve for $u$ and explain why one value is rejected. (2 marks)\n\n**c.** Hence find all solutions in $[0, 2\\pi]$. (2 marks)\n\n**d.** The graph of $y = 2\\sin^2(x) - 5\\sin(x) + 2$ intersects the $x$-axis at the points found in part (c). Find the exact area enclosed between this curve and the $x$-axis over the interval $\\left[\\dfrac{\\pi}{6},\\, \\dfrac{5\\pi}{6}\\right]$. (3 marks)",
    marks: 8,
    difficulty: "HARD",
    solutionContent:
      "**a. (1 mark)**\n\n*Step 1 (1 mark):* With $u = \\sin x$:\n\n$$2u^2 - 5u + 2 = (2u - 1)(u - 2)$$\n\n**b. (2 marks)**\n\n*Step 1 (1 mark):* $(2u - 1)(u - 2) = 0$ gives:\n\n$$u = \\dfrac{1}{2} \\text{ or } u = 2$$\n\n*Step 2 (1 mark):* Since $-1 \\leq \\sin x \\leq 1$, the value $u = 2$ is outside the range and is rejected.\n\n**c. (2 marks)**\n\n*Step 1 (1 mark):* $\\sin x = \\dfrac{1}{2}$ in $[0, 2\\pi]$:\n\n$$x = \\dfrac{\\pi}{6}$$\n\n*Step 2 (1 mark):* The second solution:\n\n$$x = \\pi - \\dfrac{\\pi}{6} = \\dfrac{5\\pi}{6}$$\n\n**d. (3 marks)**\n\n*Step 1 (1 mark):* Let $h(x) = 2\\sin^2(x) - 5\\sin(x) + 2$. On $\\left[\\dfrac{\\pi}{6}, \\dfrac{5\\pi}{6}\\right]$, $\\sin x \\geq \\dfrac{1}{2}$, so $u \\geq \\dfrac{1}{2}$ and $(2u-1) \\geq 0$ while $(u-2) < 0$. Thus $h(x) \\leq 0$ on this interval.\n\n*Step 2 (1 mark):* The area is:\n\n$$A = -\\int_{\\pi/6}^{5\\pi/6} h(x)\\, dx$$\n\nUsing $\\sin^2 x = \\dfrac{1 - \\cos(2x)}{2}$:\n\n$$h(x) = 1 - \\cos(2x) - 5\\sin x + 2 = 3 - \\cos(2x) - 5\\sin x$$\n\n$$A = -\\left[3x - \\dfrac{\\sin(2x)}{2} + 5\\cos(x)\\right]_{\\pi/6}^{5\\pi/6}$$\n\n*Step 3 (1 mark):* Evaluate.\n\nAt $x = \\dfrac{5\\pi}{6}$: $3 \\cdot \\dfrac{5\\pi}{6} - \\dfrac{\\sin(5\\pi/3)}{2} + 5\\cos\\dfrac{5\\pi}{6} = \\dfrac{5\\pi}{2} + \\dfrac{\\sqrt{3}}{4} - \\dfrac{5\\sqrt{3}}{2}$\n\nAt $x = \\dfrac{\\pi}{6}$: $3 \\cdot \\dfrac{\\pi}{6} - \\dfrac{\\sin(\\pi/3)}{2} + 5\\cos\\dfrac{\\pi}{6} = \\dfrac{\\pi}{2} - \\dfrac{\\sqrt{3}}{4} + \\dfrac{5\\sqrt{3}}{2}$\n\nDifference: $\\left(\\dfrac{5\\pi}{2} + \\dfrac{\\sqrt{3}}{4} - \\dfrac{5\\sqrt{3}}{2}\\right) - \\left(\\dfrac{\\pi}{2} - \\dfrac{\\sqrt{3}}{4} + \\dfrac{5\\sqrt{3}}{2}\\right) = 2\\pi + \\dfrac{\\sqrt{3}}{2} - 5\\sqrt{3} = 2\\pi - \\dfrac{9\\sqrt{3}}{2}$\n\n$$A = -(2\\pi - \\tfrac{9\\sqrt{3}}{2}) = \\dfrac{9\\sqrt{3}}{2} - 2\\pi$$",
    subtopicSlugs: ["trigonometric-equations"],
  },
];

// ───────────────────────────────────────────────────────────────────────────
// 6. Simultaneous Equations
// ───────────────────────────────────────────────────────────────────────────
const SIMUL_EQN: EA[] = [
  // Q1: 4 marks (1+1+2)
  {
    content:
      "Consider the simultaneous equations $x + 2y = 7$ and $x^2 + y^2 = 25$.\n\n**a.** From the linear equation, express $x$ in terms of $y$. (1 mark)\n\n**b.** Substitute into the second equation to obtain a quadratic in $y$. (1 mark)\n\n**c.** Solve the quadratic and hence find both pairs $(x, y)$. (2 marks)",
    marks: 4,
    difficulty: "MEDIUM",
    solutionContent:
      "**a. (1 mark)**\n\n*Step 1 (1 mark):* Rearrange.\n\n$$x = 7 - 2y$$\n\n**b. (1 mark)**\n\n*Step 1 (1 mark):* Substitute into $x^2 + y^2 = 25$.\n\n$$(7 - 2y)^2 + y^2 = 25$$\n\n$$49 - 28y + 4y^2 + y^2 = 25$$\n\n$$5y^2 - 28y + 24 = 0$$\n\n**c. (2 marks)**\n\n*Step 1 (1 mark):* Using the quadratic formula:\n\n$$y = \\dfrac{28 \\pm \\sqrt{784 - 480}}{10}$$\n\n$$= \\dfrac{28 \\pm \\sqrt{304}}{10}$$\n\n$$= \\dfrac{28 \\pm 4\\sqrt{19}}{10}$$\n\n$$= \\dfrac{14 \\pm 2\\sqrt{19}}{5}$$\n\n*Step 2 (1 mark):* Find corresponding $x$ values using $x = 7 - 2y$.\n\nWhen $y = \\dfrac{14 + 2\\sqrt{19}}{5}$: $x = \\dfrac{7 - 4\\sqrt{19}}{5}$\n\nWhen $y = \\dfrac{14 - 2\\sqrt{19}}{5}$: $x = \\dfrac{7 + 4\\sqrt{19}}{5}$",
    subtopicSlugs: ["simultaneous-equations"],
  },
  // Q2: 5 marks (1+2+2)
  {
    content:
      "The system of linear equations\n$$2x - y = 5$$\n$$kx + 3y = 1$$\nhas a unique solution for most values of $k$.\n\n**a.** Find the value of $k$ for which the system has no unique solution. (1 mark)\n\n**b.** For $k = 1$, solve the system simultaneously. (2 marks)\n\n**c.** For the value of $k$ found in part (a), determine whether the system has no solution or infinitely many solutions. Justify your answer. (2 marks)",
    marks: 5,
    difficulty: "MEDIUM",
    solutionContent:
      "**a. (1 mark)**\n\n*Step 1 (1 mark):* The system has no unique solution when the determinant is zero.\n\n$$\\begin{vmatrix} 2 & -1 \\\\ k & 3 \\end{vmatrix} = 6 + k = 0$$\n\n$$k = -6$$\n\n**b. (2 marks)**\n\n*Step 1 (1 mark):* With $k = 1$: $2x - y = 5$ and $x + 3y = 1$.\n\nFrom the first equation: $y = 2x - 5$. Substitute:\n\n$$x + 3(2x - 5) = 1$$\n\n$$7x - 15 = 1$$\n\n$$x = \\dfrac{16}{7}$$\n\n*Step 2 (1 mark):* Find $y$.\n\n$$y = 2 \\cdot \\dfrac{16}{7} - 5$$\n\n$$= \\dfrac{32 - 35}{7}$$\n\n$$= -\\dfrac{3}{7}$$\n\n**c. (2 marks)**\n\n*Step 1 (1 mark):* With $k = -6$: the equations are $2x - y = 5$ and $-6x + 3y = 1$.\n\nMultiply the first by $3$: $6x - 3y = 15$.\n\n*Step 2 (1 mark):* Add to the second: $0 = 16$, which is a contradiction.\n\nTherefore the system has no solution.",
    subtopicSlugs: ["simultaneous-equations"],
  },
  // Q3: 6 marks (1+2+1+2)
  {
    content:
      "Consider the line $y = 2x + 1$ and the parabola $y = x^2 - 2x + 5$.\n\n**a.** Find the $x$-coordinates of the points of intersection by solving simultaneously. (1 mark)\n\n**b.** Find the coordinates of the intersection point. (2 marks)\n\n**c.** Find the gradient of the parabola at the intersection point. (1 mark)\n\n**d.** Hence show that the line $y = 2x + 1$ is tangent to the parabola at this point. (2 marks)",
    marks: 6,
    difficulty: "MEDIUM",
    solutionContent:
      "**a. (1 mark)**\n\n*Step 1 (1 mark):* Set equal.\n\n$$2x + 1 = x^2 - 2x + 5$$\n\n$$x^2 - 4x + 4 = 0$$\n\n$$(x - 2)^2 = 0$$\n\n$$x = 2$$\n\n**b. (2 marks)**\n\n*Step 1 (1 mark):* Since $(x-2)^2 = 0$ is a repeated root, the line touches the parabola at a single point.\n\n*Step 2 (1 mark):* At $x = 2$: $y = 2(2) + 1 = 5$.\n\nThe single point of intersection is $(2, 5)$.\n\n**c. (1 mark)**\n\n*Step 1 (1 mark):* Differentiate the parabola: $\\dfrac{dy}{dx} = 2x - 2$.\n\nAt $x = 2$: gradient $= 2(2) - 2 = 2$.\n\n**d. (2 marks)**\n\n*Step 1 (1 mark):* The tangent at $(2, 5)$ has gradient $2$.\n\n$$y - 5 = 2(x - 2)$$\n\n*Step 2 (1 mark):* Simplify.\n\n$$y = 2x + 1$$\n\nThis is the same as the given line, confirming that $y = 2x + 1$ is tangent to the parabola at $(2, 5)$.",
    subtopicSlugs: ["simultaneous-equations"],
  },
  // Q4: 7 marks (1+2+2+2)
  {
    content:
      "Consider the simultaneous equations\n$$x + y = 4$$\n$$xy = k$$\nwhere $k$ is a real constant.\n\n**a.** By substituting $y = 4 - x$, show that $x$ satisfies $x^2 - 4x + k = 0$. (1 mark)\n\n**b.** Find the range of values of $k$ for which the system has two distinct real solutions. (2 marks)\n\n**c.** Find the solutions when $k = 3$. (2 marks)\n\n**d.** Find the value of $k$ for which the system has exactly one solution, and state that solution. (2 marks)",
    marks: 7,
    difficulty: "HARD",
    solutionContent:
      "**a. (1 mark)**\n\n*Step 1 (1 mark):* Substitute $y = 4 - x$ into $xy = k$.\n\n$$x(4 - x) = k$$\n\n$$4x - x^2 = k$$\n\n$$x^2 - 4x + k = 0$$\n\n**b. (2 marks)**\n\n*Step 1 (1 mark):* For two distinct real solutions, the discriminant must be positive.\n\n$$\\Delta = 16 - 4k > 0$$\n\n*Step 2 (1 mark):* Solve.\n\n$$k < 4$$\n\n**c. (2 marks)**\n\n*Step 1 (1 mark):* With $k = 3$: $x^2 - 4x + 3 = 0$.\n\n$$(x - 1)(x - 3) = 0$$\n\n$$x = 1 \\text{ or } x = 3$$\n\n*Step 2 (1 mark):* Using $y = 4 - x$:\n\n$$(x, y) = (1, 3) \\text{ or } (3, 1)$$\n\n**d. (2 marks)**\n\n*Step 1 (1 mark):* Exactly one solution requires $\\Delta = 0$.\n\n$$16 - 4k = 0$$\n\n$$k = 4$$\n\n*Step 2 (1 mark):* Then $x^2 - 4x + 4 = 0$, so $(x - 2)^2 = 0$ and $x = 2$, $y = 2$.\n\nThe single solution is $(2, 2)$.",
    subtopicSlugs: ["simultaneous-equations"],
  },
  // Q5: 8 marks (1+2+2+3)
  {
    content:
      "The system of equations\n$$kx + 3y = k + 3$$\n$$3x + ky = 2$$\nwhere $k \\in \\mathbb{R}$.\n\n**a.** Show that the system has no unique solution when $k = 3$ or $k = -3$. (1 mark)\n\n**b.** For $k = -3$, determine whether the system has no solution or infinitely many solutions. (2 marks)\n\n**c.** For $k = 3$, determine whether the system has no solution or infinitely many solutions. (2 marks)\n\n**d.** For $k = 1$, solve the system and verify your solution. (3 marks)",
    marks: 8,
    difficulty: "HARD",
    solutionContent:
      "**a. (1 mark)**\n\n*Step 1 (1 mark):* The system has no unique solution when the determinant is zero.\n\n$$\\begin{vmatrix} k & 3 \\\\ 3 & k \\end{vmatrix} = k^2 - 9$$\n\n$$= (k-3)(k+3)$$\n\nThis equals zero when $k = 3$ or $k = -3$.\n\n**b. (2 marks)**\n\n*Step 1 (1 mark):* With $k = -3$: the equations become $-3x + 3y = 0$ and $3x - 3y = 2$.\n\nSimplify the first: $y = x$.\n\n*Step 2 (1 mark):* Substitute into the second: $3x - 3x = 2$, giving $0 = 2$, a contradiction.\n\nTherefore the system has no solution.\n\n**c. (2 marks)**\n\n*Step 1 (1 mark):* With $k = 3$: the equations become $3x + 3y = 6$ and $3x + 3y = 2$.\n\nSimplify: $x + y = 2$ and $x + y = \\dfrac{2}{3}$.\n\n*Step 2 (1 mark):* These are contradictory, so the system has no solution.\n\n**d. (3 marks)**\n\n*Step 1 (1 mark):* With $k = 1$: $x + 3y = 4$ and $3x + y = 2$.\n\nFrom the first: $x = 4 - 3y$. Substitute:\n\n$$3(4 - 3y) + y = 2$$\n\n$$12 - 9y + y = 2$$\n\n$$-8y = -10$$\n\n$$y = \\dfrac{5}{4}$$\n\n*Step 2 (1 mark):* Find $x$.\n\n$$x = 4 - 3 \\cdot \\dfrac{5}{4}$$\n\n$$= 4 - \\dfrac{15}{4}$$\n\n$$= \\dfrac{1}{4}$$\n\n*Step 3 (1 mark):* Verify in both equations.\n\nEquation 1: $\\dfrac{1}{4} + 3 \\cdot \\dfrac{5}{4} = \\dfrac{1}{4} + \\dfrac{15}{4} = 4$. Correct.\n\nEquation 2: $3 \\cdot \\dfrac{1}{4} + \\dfrac{5}{4} = \\dfrac{3}{4} + \\dfrac{5}{4} = 2$. Correct.",
    subtopicSlugs: ["simultaneous-equations"],
  },
];

// ───────────────────────────────────────────────────────────────────────────
// Write to files
// ───────────────────────────────────────────────────────────────────────────
const FILES: [string, EA[]][] = [
  ["qset-polynomial-equations.json", POLY],
  ["qset-exponent-and-logarithm-laws.json", EXP_LOG_LAWS],
  ["qset-exponential-equations.json", EXP_EQN],
  ["qset-logarithmic-equations.json", LOG_EQN],
  ["qset-trigonometric-equations.json", TRIG_EQN],
  ["qset-simultaneous-equations.json", SIMUL_EQN],
];

for (const [filename, items] of FILES) {
  const filepath = path.join(OUT, filename);
  const data: Qset = JSON.parse(fs.readFileSync(filepath, "utf8"));

  if ((data.extendedAnswer ?? []).length >= 5) {
    console.log(`SKIP ${filename}: already has ${data.extendedAnswer!.length} extendedAnswer items`);
    continue;
  }

  data.extendedAnswer = items;
  fs.writeFileSync(filepath, JSON.stringify(data, null, 2) + "\n", "utf8");
  console.log(`DONE ${filename}: wrote ${items.length} extendedAnswer items`);
}

console.log("\nAll done.");
