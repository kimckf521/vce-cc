/** Wave 4c: EXT_ANS top-up — 1 more per applicable subtopic = 31 new EXT_ANS. */
import * as fs from "fs";
import * as path from "path";

const OUT_DIR = "scripts/output";
interface EA { content: string; marks: number; difficulty: "EASY" | "MEDIUM" | "HARD"; solutionContent: string; subtopicSlugs: string[]; }
const e = (c: string, m: number, d: "EASY" | "MEDIUM" | "HARD", sol: string, p: string): EA =>
  ({ content: c, marks: m, difficulty: d, solutionContent: sol, subtopicSlugs: [p] });

const SUBS: Record<string, EA[]> = {
  "polynomial-equations": [e("Find values of $k$ for which $x^2 + (k - 2) x + k = 0$ has equal roots.\n\n**a.** Set discriminant = 0. (2 marks)\n\n**b.** Solve for $k$. (3 marks)", 5, "MEDIUM",
    "**a.** (2) $\\Delta = (k - 2)^2 - 4 k = 0$.\n**b.** (3) Expand: $k^2 - 4 k + 4 - 4 k = 0 \\Rightarrow k^2 - 8 k + 4 = 0 \\Rightarrow k = 4 \\pm 2\\sqrt 3$.", "polynomial-equations")],
  "exponential-equations": [e("Solve $4^x - 2^{x+1} = 0$.\n\n**a.** Rewrite using base 2. (2 marks)\n\n**b.** Factor. (2 marks)\n\n**c.** Solve. (2 marks)", 6, "MEDIUM",
    "**a.** (2) $2^{2x} - 2 \\cdot 2^x = 0$.\n**b.** (2) $2^x(2^x - 2) = 0$.\n**c.** (2) $2^x = 2 \\Rightarrow x = 1$ (other factor $2^x = 0$ has no solution).", "exponential-equations")],
  "logarithmic-equations": [e("Solve $\\log_2(x + 1) - \\log_2(x - 1) = 1$.\n\n**a.** Combine the logs. (2 marks)\n\n**b.** Solve. (3 marks)", 5, "MEDIUM",
    "**a.** (2) $\\log_2\\dfrac{x + 1}{x - 1} = 1 \\Rightarrow \\dfrac{x + 1}{x - 1} = 2$.\n**b.** (3) $x + 1 = 2(x - 1) \\Rightarrow x = 3$. Valid ($x > 1$).", "logarithmic-equations")],
  "trigonometric-equations": [e("Solve $2 \\cos^2 x = 1$ for $x \\in [0, 2\\pi]$.\n\n**a.** Isolate $\\cos^2 x$. (1 mark)\n\n**b.** Take square roots. (2 marks)\n\n**c.** List all solutions. (3 marks)", 6, "MEDIUM",
    "**a.** (1) $\\cos^2 x = 1/2$.\n**b.** (2) $\\cos x = \\pm 1/\\sqrt 2$.\n**c.** (3) $x = \\pi/4, 3\\pi/4, 5\\pi/4, 7\\pi/4$.", "trigonometric-equations")],
  "simultaneous-equations": [e("Find the intersection of $x^2 + y^2 = 10$ and $y = 3 x$.\n\n**a.** Substitute. (2 marks)\n\n**b.** Solve. (3 marks)\n\n**c.** State points. (1 mark)", 6, "MEDIUM",
    "**a.** (2) $x^2 + 9 x^2 = 10 \\Rightarrow 10 x^2 = 10$.\n**b.** (3) $x = \\pm 1$.\n**c.** (1) $(1, 3)$ and $(-1, -3)$.", "simultaneous-equations")],
  // Functions (8 extended-fit + modelling-rich)
  "polynomial-functions": [e("Sketch $y = (x - 1)(x + 2)(x - 4)$.\n\n**a.** Find x-intercepts. (2 marks)\n\n**b.** y-intercept. (1 mark)\n\n**c.** End behaviour. (2 marks)", 5, "MEDIUM",
    "**a.** (2) $x = 1, -2, 4$.\n**b.** (1) $y(0) = (-1)(2)(-4) = 8$.\n**c.** (2) Cubic with positive leading: $-\\infty \\to -\\infty$, $\\infty \\to \\infty$.", "polynomial-functions")],
  "exponential-functions": [e("Let $f(x) = 1 - e^{-x}$.\n\n**a.** State the x-intercept. (2 marks)\n\n**b.** Asymptote as $x \\to \\infty$. (2 marks)\n\n**c.** $f'(x)$. (2 marks)", 6, "MEDIUM",
    "**a.** (2) $f(x) = 0 \\Rightarrow e^{-x} = 1 \\Rightarrow x = 0$.\n**b.** (2) $e^{-x} \\to 0$, so $f \\to 1$. Asymptote $y = 1$.\n**c.** (2) $f'(x) = e^{-x}$.", "exponential-functions")],
  "logarithmic-functions": [e("Let $f(x) = \\ln(x) + 2$.\n\n**a.** Find $f(e)$. (1 mark)\n\n**b.** Solve $f(x) = 0$. (2 marks)\n\n**c.** Find $f^{-1}$. (3 marks)", 6, "MEDIUM",
    "**a.** (1) $f(e) = 1 + 2 = 3$.\n**b.** (2) $\\ln x = -2 \\Rightarrow x = e^{-2}$.\n**c.** (3) $y = \\ln x + 2 \\Rightarrow x = e^{y - 2}$; $f^{-1}(x) = e^{x - 2}$.", "logarithmic-functions")],
  "trigonometric-functions": [e("Let $g(x) = 3 \\sin(2 x + \\pi/4)$.\n\n**a.** Amplitude and period. (2 marks)\n\n**b.** Find $g(0)$. (2 marks)\n\n**c.** Find one x-intercept in $[0, \\pi]$. (3 marks)", 7, "MEDIUM",
    "**a.** (2) Amplitude 3, period $\\pi$.\n**b.** (2) $g(0) = 3 \\sin(\\pi/4) = 3\\sqrt 2/2$.\n**c.** (3) $\\sin(2 x + \\pi/4) = 0 \\Rightarrow 2 x + \\pi/4 = 0, \\pi$ ⇒ $x = 3\\pi/8$ (other negative or out of range).", "trigonometric-functions")],
  "rational-functions": [e("Let $f(x) = \\dfrac{x + 2}{x - 3}$.\n\n**a.** Vertical asymptote. (1 mark)\n\n**b.** Horizontal asymptote. (2 marks)\n\n**c.** Intercepts. (3 marks)", 6, "MEDIUM",
    "**a.** (1) $x = 3$.\n**b.** (2) Ratio $1/1 = 1$, so $y = 1$.\n**c.** (3) x-int: $x = -2$; y-int: $-2/3$.", "rational-functions")],
  "transformations": [e("Find the equation of $y = x^2$ after: (i) translate 2 right, (ii) dilate by factor 3 from x-axis, (iii) reflect in x-axis.\n\n**a.** After (i). (1 mark)\n\n**b.** After (ii). (2 marks)\n\n**c.** After (iii). (2 marks)", 5, "MEDIUM",
    "**a.** (1) $y = (x - 2)^2$.\n**b.** (2) $y = 3(x - 2)^2$.\n**c.** (2) $y = -3(x - 2)^2$.", "transformations")],
  "inverse-functions": [e("Let $f(x) = 2 x - 5$.\n\n**a.** Find $f^{-1}(x)$. (3 marks)\n\n**b.** Find $f(f^{-1}(7))$ to verify. (2 marks)\n\n**c.** Sketch both with $y = x$. (2 marks)", 7, "MEDIUM",
    "**a.** (3) $y = 2 x - 5 \\Rightarrow x = (y + 5)/2$; $f^{-1}(x) = (x + 5)/2$.\n**b.** (2) $f^{-1}(7) = 6$; $f(6) = 7$ ✓.\n**c.** (2) Two lines, reflections across $y = x$.", "inverse-functions")],
  "composite-functions": [e("If $f(x) = e^x$ and $g(x) = 2 x + 1$, find $(f \\circ g)(x)$ and its derivative.\n\n**a.** Composition. (2 marks)\n\n**b.** Derivative using chain rule. (3 marks)", 5, "MEDIUM",
    "**a.** (2) $(f \\circ g)(x) = e^{2 x + 1}$.\n**b.** (3) Chain: $2 e^{2 x + 1}$.", "composite-functions")],
  // Calculus extended-fit/modelling-rich (11)
  "differentiation": [e("Differentiate $f(x) = 3 x^4 - 5 x^2 + 2 x - 7$ and evaluate $f'(1)$.\n\n**a.** Derivative. (2 marks)\n\n**b.** Evaluate. (2 marks)", 4, "EASY",
    "**a.** (2) $f'(x) = 12 x^3 - 10 x + 2$.\n**b.** (2) $f'(1) = 12 - 10 + 2 = 4$.", "differentiation")],
  "chain-rule": [e("Differentiate $f(x) = e^{2 x + 3}$ and find the slope at $x = 0$.\n\n**a.** Derivative. (3 marks)\n\n**b.** Slope at $x = 0$. (2 marks)", 5, "MEDIUM",
    "**a.** (3) $f'(x) = 2 e^{2 x + 3}$.\n**b.** (2) $f'(0) = 2 e^3$.", "chain-rule")],
  "product-rule": [e("Differentiate $f(x) = x^3 \\cos x$.\n\n**a.** Apply product rule. (3 marks)\n\n**b.** Simplify. (2 marks)", 5, "MEDIUM",
    "**a.** (3) $3 x^2 \\cos x + x^3(-\\sin x) = 3 x^2 \\cos x - x^3 \\sin x$.\n**b.** (2) $= x^2(3 \\cos x - x \\sin x)$.", "product-rule")],
  "quotient-rule": [e("Differentiate $f(x) = \\dfrac{e^x}{x + 1}$.\n\n**a.** Apply quotient rule. (3 marks)\n\n**b.** Simplify. (2 marks)", 5, "MEDIUM",
    "**a.** (3) $\\dfrac{e^x(x + 1) - e^x(1)}{(x + 1)^2}$.\n**b.** (2) $= \\dfrac{e^x x}{(x + 1)^2}$.", "quotient-rule")],
  "tangents-and-normals": [e("Find the tangent and normal to $y = x^3 - 2 x$ at $x = 1$.\n\n**a.** Point. (1 mark)\n\n**b.** Slope. (2 marks)\n\n**c.** Tangent. (2 marks)\n\n**d.** Normal. (2 marks)", 7, "MEDIUM",
    "**a.** (1) $y(1) = -1$.\n**b.** (2) $y'(x) = 3 x^2 - 2$; $y'(1) = 1$.\n**c.** (2) $y - (-1) = 1(x - 1) \\Rightarrow y = x - 2$.\n**d.** (2) Normal slope $-1$: $y + 1 = -(x - 1) \\Rightarrow y = -x$.", "tangents-and-normals")],
  "rates-of-change": [e("$V(t) = 50 t^2 - t^3$ litres, $0 \\leq t \\leq 30$.\n\n**a.** $V'(t)$. (2 marks)\n\n**b.** When is rate maximum? (3 marks)\n\n**c.** Max rate. (2 marks)", 7, "MEDIUM",
    "**a.** (2) $V'(t) = 100 t - 3 t^2$.\n**b.** (3) $V''(t) = 100 - 6 t = 0 \\Rightarrow t = 50/3 \\approx 16.7$.\n**c.** (2) $V'(50/3) = 100 \\cdot 50/3 - 3 (50/3)^2 = 5000/3 - 2500/3 = 2500/3 \\approx 833$ L/h.", "rates-of-change")],
  "stationary-points-and-curve-sketching": [e("Investigate $f(x) = x^3 + 3 x^2 - 9 x + 5$.\n\n**a.** Stationary points. (3 marks)\n\n**b.** Classify. (2 marks)", 5, "MEDIUM",
    "**a.** (3) $f'(x) = 3 x^2 + 6 x - 9 = 3(x + 3)(x - 1) = 0 \\Rightarrow x = -3, 1$; $f(-3) = 32$, $f(1) = 0$.\n**b.** (2) $f''(x) = 6 x + 6$; $f''(-3) = -12 < 0$ (max), $f''(1) = 12 > 0$ (min).", "stationary-points-and-curve-sketching")],
  "optimisation": [e("A box has square base $x$, no top, fixed volume $108$ m³.\n\n**a.** Height in terms of $x$. (1 mark)\n\n**b.** Surface area $S(x)$. (3 marks)\n\n**c.** Find $x$ minimising $S$. (3 marks)", 7, "MEDIUM",
    "**a.** (1) $h = 108/x^2$.\n**b.** (3) $S = x^2 + 4 x h = x^2 + 432/x$.\n**c.** (3) $S'(x) = 2 x - 432/x^2 = 0 \\Rightarrow x^3 = 216 \\Rightarrow x = 6$.", "optimisation")],
  "antidifferentiation": [e("Find $\\int (2 e^x + 3/x) dx$ for $x > 0$.\n\n**a.** Integrate. (3 marks)\n\n**b.** Don't forget constant. (1 mark)", 4, "EASY",
    "**a.** (3) $2 e^x + 3 \\ln x$.\n**b.** (1) $+ C$.", "antidifferentiation")],
  "definite-integrals": [e("Evaluate $\\int_1^3 (2 x + 5) dx$.\n\n**a.** Antidifferentiate. (2 marks)\n\n**b.** Evaluate. (3 marks)", 5, "MEDIUM",
    "**a.** (2) $F(x) = x^2 + 5 x$.\n**b.** (3) $F(3) - F(1) = (9 + 15) - (1 + 5) = 18$.", "definite-integrals")],
  "area-under-curves": [e("Find the area enclosed by $y = 6 - x^2$ and the x-axis.\n\n**a.** Find x-intercepts. (2 marks)\n\n**b.** Set up integral. (1 mark)\n\n**c.** Evaluate. (3 marks)", 6, "MEDIUM",
    "**a.** (2) $x = \\pm \\sqrt 6$.\n**b.** (1) $\\int_{-\\sqrt 6}^{\\sqrt 6} (6 - x^2) dx$.\n**c.** (3) Even integrand: $2 \\int_0^{\\sqrt 6} (6 - x^2) dx = 2[6 x - x^3/3]_0^{\\sqrt 6} = 2(6\\sqrt 6 - 2\\sqrt 6) = 8\\sqrt 6$.", "area-under-curves")],
  // Data (7 modelling-rich)
  "conditional-probability": [e("In a class, 70% pass maths, 50% pass science, 40% pass both.\n\n**a.** $P(\\text{passes maths} | \\text{passes science})$. (2 marks)\n\n**b.** Are events independent? (3 marks)", 5, "MEDIUM",
    "**a.** (2) $P(M | S) = 0.40/0.50 = 0.8$.\n**b.** (3) $P(M) = 0.7 \\neq 0.8 = P(M | S)$ ⇒ NOT independent (positively correlated).", "conditional-probability")],
  "discrete-random-variables": [e("$X$ takes values $0, 1, 2, 3$ with probabilities $0.1, 0.2, 0.3, 0.4$.\n\n**a.** $E[X]$. (2 marks)\n\n**b.** $\\text{Var}(X)$. (4 marks)", 6, "MEDIUM",
    "**a.** (2) $E[X] = 0 + 0.2 + 0.6 + 1.2 = 2.0$.\n**b.** (4) $E[X^2] = 0 + 0.2 + 1.2 + 3.6 = 5.0$; $\\text{Var} = 5 - 4 = 1$.", "discrete-random-variables")],
  "binomial-distribution": [e("$X \\sim \\text{Bin}(12, 0.4)$.\n\n**a.** $E[X]$ and $\\text{Var}(X)$. (2 marks)\n\n**b.** $P(X = 5)$ to 4 dp. (3 marks)", 5, "MEDIUM",
    "**a.** (2) $E[X] = 4.8$; $\\text{Var}(X) = 2.88$.\n**b.** (3) $P(X = 5) = \\binom{12}{5}(0.4)^5(0.6)^7 \\approx 0.2270$.", "binomial-distribution")],
  "continuous-random-variables": [e("$X$ has pdf $f(x) = c(1 - x^2)$ on $[0, 1]$.\n\n**a.** Find $c$. (3 marks)\n\n**b.** $E[X]$. (3 marks)", 6, "MEDIUM",
    "**a.** (3) $\\int_0^1 c(1 - x^2) dx = c[x - x^3/3]_0^1 = c \\cdot 2/3 = 1 \\Rightarrow c = 3/2$.\n**b.** (3) $E[X] = (3/2)\\int_0^1 x(1 - x^2) dx = (3/2)[x^2/2 - x^4/4]_0^1 = (3/2)(1/4) = 3/8$.", "continuous-random-variables")],
  "normal-distribution": [e("$X \\sim N(70, 100)$. Find $P(60 < X < 85)$, 4 dp.\n\n**a.** Standardise. (3 marks)\n\n**b.** Compute. (3 marks)", 6, "MEDIUM",
    "**a.** (3) $\\sigma = 10$; $z_1 = -1$, $z_2 = 1.5$.\n**b.** (3) $\\Phi(1.5) - \\Phi(-1) \\approx 0.9332 - 0.1587 = 0.7745$.", "normal-distribution")],
  "confidence-intervals": [e("From a sample of 250, 145 prefer brand X.\n\n**a.** $\\hat p$ and SE. (3 marks)\n\n**b.** 95% CI to 3 dp. (3 marks)", 6, "MEDIUM",
    "**a.** (3) $\\hat p = 0.58$, SE $= \\sqrt{0.58 \\cdot 0.42/250} \\approx 0.0312$.\n**b.** (3) $0.58 \\pm 1.96(0.0312) \\approx (0.519, 0.641)$.", "confidence-intervals")],
  "sample-proportions-and-sampling": [e("True $p = 0.4$, sample $n = 400$.\n\n**a.** Distribution of $\\hat p$. (2 marks)\n\n**b.** $P(\\hat p < 0.35)$, 4 dp. (4 marks)", 6, "MEDIUM",
    "**a.** (2) $\\hat p \\approx N(0.4, 0.4 \\cdot 0.6/400) = N(0.4, 0.0006)$, sd $\\approx 0.0245$.\n**b.** (4) $z = (0.35 - 0.4)/0.0245 \\approx -2.041$; $P \\approx 0.0206$.", "sample-proportions-and-sampling")],
};

let total = 0;
for (const [slug, items] of Object.entries(SUBS)) {
  fs.writeFileSync(path.join(OUT_DIR, `qset-methods-w4-ea-${slug}.json`),
    JSON.stringify({ mcq: [], shortAnswer: [], extendedAnswer: items, extendedResponse: [] }, null, 2) + "\n");
  console.log(`${slug}: ${items.length} EXT_ANS`);
  total += items.length;
}
console.log(`Total: ${total} EXT_ANS across ${Object.keys(SUBS).length} subtopics.`);
