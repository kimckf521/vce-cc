/**
 * Rewrite the solutionContent for every item in "Questions Set testing"
 * so that multi-step algebra appears on SEPARATE lines (one equation per
 * line, using display math $$…$$) instead of a single chained line.
 *
 * Items are matched by (type, order). The first 5 MCQs are graph questions
 * and are skipped here (they already have clean one-line solutions).
 */

import { prisma } from "../lib/prisma";

interface Update {
  type: "MCQ" | "SHORT_ANSWER" | "EXTENDED_RESPONSE";
  order: number;
  solutionContent: string;
}

// MCQ orders 0–4 are graph questions whose solutions are already clean.
// Orders 5–19 hold the original JSON MCQ indices 5–19.
const updates: Update[] = [
  // ─── MCQ order=5 — Remainder theorem, x^3 - 2x^2 + 5x - 1 ÷ (x - 2) ───
  {
    type: "MCQ",
    order: 5,
    solutionContent:
      "**Step 1 (1 mark):** Apply the remainder theorem: remainder $= p(2)$.\n\n$$p(2) = 8 - 8 + 10 - 1$$\n\n$$= 9.$$\n\n**Answer: B**",
  },
  // ─── MCQ order=6 — Cubic from table ───
  {
    type: "MCQ",
    order: 6,
    solutionContent:
      "**Step 1 (1 mark):** Use the table to identify roots and solve for the third factor.\n\nFrom the table, $p(-2) = 0$ and $p(2) = 0$, so $(x + 2)$ and $(x - 2)$ are factors.\n\nWrite $p(x) = a(x+2)(x-2)(x - r)$. Then\n\n$$p(0) = a(2)(-2)(-r) = 4ar = 6,$$\n\n$$p(1) = a(3)(-1)(1-r) = -3a(1-r) = 4.$$\n\nSolving the system gives $a = 1$ and $r = 3$, so the factors are $(x+2), (x-2), (x-3)$.\n\n**Answer: B**",
  },
  // ─── MCQ order=7 — Product of roots, 2x^3 - 5x^2 + x - 8 ───
  {
    type: "MCQ",
    order: 7,
    solutionContent:
      "**Step 1 (1 mark):** Apply Vieta's formula for cubics: product of roots $= -\\dfrac{d}{a}$.\n\n$$\\text{product} = -\\dfrac{-8}{2}$$\n\n$$= 4.$$\n\n**Answer: B**",
  },
  // ─── MCQ order=8 — (x-1)^2(x+3) = 0 ───
  {
    type: "MCQ",
    order: 8,
    solutionContent:
      "**Step 1 (1 mark):** Read off the roots from the factored form.\n\n$$(x-1)^2 = 0 \\implies x = 1 \\text{ (multiplicity 2)},$$\n\n$$(x+3) = 0 \\implies x = -3.$$\n\n**Answer: A**",
  },
  // ─── MCQ order=9 — Quadratic formula, x^2 - 4x + 1 ───
  {
    type: "MCQ",
    order: 9,
    solutionContent:
      "**Step 1 (1 mark):** Apply the quadratic formula.\n\n$$x = \\dfrac{4 \\pm \\sqrt{16 - 4}}{2}$$\n\n$$= \\dfrac{4 \\pm \\sqrt{12}}{2}$$\n\n$$= \\dfrac{4 \\pm 2\\sqrt{3}}{2}$$\n\n$$= 2 \\pm \\sqrt{3}.$$\n\n**Answer: B**",
  },
  // ─── MCQ order=10 — Equal roots, THE EXAMPLE ───
  {
    type: "MCQ",
    order: 10,
    solutionContent:
      "**Step 1 (1 mark):** Set discriminant to zero.\n\n$$\\Delta = (k+1)^2 - 4k$$\n\n$$= k^2 - 2k + 1$$\n\n$$= (k-1)^2.$$\n\nSetting $\\Delta = 0$ gives $k = 1$.\n\n**Answer: B**",
  },
  // ─── MCQ order=11 — Factor of (x+1), find other factors ───
  {
    type: "MCQ",
    order: 11,
    solutionContent:
      "**Step 1 (1 mark):** Divide $p(x)$ by $(x+1)$, then factor the quotient.\n\n$$p(x) \\div (x+1) = x^2 + x - 6$$\n\n$$= (x-2)(x+3).$$\n\n**Answer: A**",
  },
  // ─── MCQ order=12 — α²+β² for x^2 - 6x + 4 ───
  {
    type: "MCQ",
    order: 12,
    solutionContent:
      "**Step 1 (1 mark):** Apply Vieta's formulas.\n\n$$\\alpha + \\beta = 6, \\quad \\alpha\\beta = 4.$$\n\n**Step 2 (1 mark):** Use the identity $\\alpha^2 + \\beta^2 = (\\alpha+\\beta)^2 - 2\\alpha\\beta$.\n\n$$\\alpha^2 + \\beta^2 = 6^2 - 2(4)$$\n\n$$= 36 - 8$$\n\n$$= 28.$$\n\n**Answer: A**",
  },
  // ─── MCQ order=13 — Sign behaviour table ───
  {
    type: "MCQ",
    order: 13,
    solutionContent:
      "**Step 1 (1 mark):** Read the intervals where $p(x) \\geq 0$ from the table, including the zeros of $p$.\n\nThe sign is $+$ on $(-2, 1)$ and $(4, \\infty)$. Including the zeros at $-2$, $1$, and $4$:\n\n$$-2 \\leq x \\leq 1 \\quad \\text{or} \\quad x \\geq 4.$$\n\n**Answer: B**",
  },
  // ─── MCQ order=14 — x^4 - 5x^2 + 4 = 0 ───
  {
    type: "MCQ",
    order: 14,
    solutionContent:
      "**Step 1 (1 mark):** Substitute $u = x^2$ and solve.\n\n$$u^2 - 5u + 4 = 0$$\n\n$$(u-1)(u-4) = 0$$\n\n$$u = 1 \\quad \\text{or} \\quad u = 4.$$\n\nConverting back:\n\n$$x = \\pm 1 \\quad \\text{or} \\quad x = \\pm 2$$\n\n— four distinct real solutions.\n\n**Answer: D**",
  },
  // ─── MCQ order=15 — x^2 + (m-2)x + (m+1) no real solutions ───
  {
    type: "MCQ",
    order: 15,
    solutionContent:
      "**Step 1 (1 mark):** Compute the discriminant and require $\\Delta < 0$.\n\n$$\\Delta = (m-2)^2 - 4(m+1)$$\n\n$$= m^2 - 4m + 4 - 4m - 4$$\n\n$$= m^2 - 8m.$$\n\nSolving $\\Delta < 0$:\n\n$$m(m - 8) < 0$$\n\n$$0 < m < 8.$$\n\n**Answer: A**",
  },
  // ─── MCQ order=16 — Remainder system 2x^3 - 3x^2 + ax + b ───
  {
    type: "MCQ",
    order: 16,
    solutionContent:
      "**Step 1 (1 mark):** Apply the remainder theorem at $x = 1$.\n\n$$p(1) = 2 - 3 + a + b = 5$$\n\n$$\\implies a + b = 6. \\quad (1)$$\n\n**Step 2 (1 mark):** Apply the remainder theorem at $x = -1$.\n\n$$p(-1) = -2 - 3 - a + b = -1$$\n\n$$\\implies b - a = 4. \\quad (2)$$\n\nAdding $(1)$ and $(2)$:\n\n$$2b = 10 \\implies b = 5, \\; a = 1.$$\n\n**Answer: A**",
  },
  // ─── MCQ order=17 — x^3 - 3x + 2 factored ───
  {
    type: "MCQ",
    order: 17,
    solutionContent:
      "**Step 1 (1 mark):** Find one root, then divide.\n\n$$p(1) = 1 - 3 + 2 = 0,$$\n\nso $(x - 1)$ is a factor. Dividing:\n\n$$x^3 - 3x + 2 = (x - 1)(x^2 + x - 2).$$\n\n**Step 2 (1 mark):** Factor the quotient.\n\n$$x^2 + x - 2 = (x - 1)(x + 2),$$\n\nso $p(x) = (x - 1)^2(x + 2)$.\n\n**Answer: A**",
  },
  // ─── MCQ order=18 — IVT from table ───
  {
    type: "MCQ",
    order: 18,
    solutionContent:
      "**Step 1 (1 mark):** Apply the intermediate value theorem (or spot the sign change in the table).\n\n$$f(0) = -6 < 0,$$\n\n$$f(2) = 0,$$\n\nso a zero exists in $[0, 2]$.\n\n**Answer: B**",
  },
  // ─── MCQ order=19 — Third root of x^3 - 7x + 6 ───
  {
    type: "MCQ",
    order: 19,
    solutionContent:
      "**Step 1 (1 mark):** Use Vieta's: sum of roots $= 0$ (no $x^2$ term).\n\n$$1 + 2 + r = 0$$\n\n$$\\implies r = -3.$$\n\n**Answer: B**",
  },
  // ─── SHORT ANSWER ───────────────────────────────────────────────
  // SA 01 (order=0) — 2x^2 - 7x + 3 = 0
  {
    type: "SHORT_ANSWER",
    order: 0,
    solutionContent:
      "**Step 1 (1 mark):** Substitute into the quadratic formula.\n\n$$x = \\dfrac{7 \\pm \\sqrt{49 - 24}}{4}$$\n\n$$= \\dfrac{7 \\pm \\sqrt{25}}{4}$$\n\n$$= \\dfrac{7 \\pm 5}{4}.$$\n\n**Step 2 (1 mark):** Simplify to obtain both solutions.\n\n$$x = \\dfrac{12}{4} = 3 \\quad \\text{or} \\quad x = \\dfrac{2}{4} = \\dfrac{1}{2}.$$",
  },
  // SA 02 (order=1) — x^3 - x^2 - 6x
  {
    type: "SHORT_ANSWER",
    order: 1,
    solutionContent:
      "**Step 1 (1 mark):** Factor out the common factor and the quadratic.\n\n$$x^3 - x^2 - 6x = x(x^2 - x - 6)$$\n\n$$= x(x - 3)(x + 2).$$\n\n**Step 2 (1 mark):** Read off the solutions.\n\n$$x = 0, \\quad x = 3, \\quad x = -2.$$",
  },
  // SA 03 (order=2) — x^3 + ax^2 - 4x + 6
  {
    type: "SHORT_ANSWER",
    order: 2,
    solutionContent:
      "**Step 1 (1 mark):** Apply the factor theorem to find $a$.\n\n$$p(1) = 1 + a - 4 + 6$$\n\n$$= 3 + a.$$\n\nSetting this to zero: $a = -3$, so $p(x) = x^3 - 3x^2 - 4x + 6$.\n\n**Step 2 (1 mark):** Divide by $(x - 1)$.\n\n$$p(x) = (x - 1)(x^2 - 2x - 6).$$\n\n**Step 3 (1 mark):** Factor the quadratic over the reals using the quadratic formula.\n\n$$x = \\dfrac{2 \\pm \\sqrt{4 + 24}}{2}$$\n\n$$= 1 \\pm \\sqrt{7}.$$\n\nSo $p(x) = (x - 1)\\bigl(x - 1 - \\sqrt{7}\\bigr)\\bigl(x - 1 + \\sqrt{7}\\bigr)$.",
  },
  // SA 04 (order=3) — distinct real roots condition
  {
    type: "SHORT_ANSWER",
    order: 3,
    solutionContent:
      "**Step 1 (1 mark):** Write the discriminant condition for two distinct real solutions.\n\n$$\\Delta > 0.$$\n\n**Step 2 (1 mark):** Compute the discriminant.\n\n$$\\Delta = (k - 1)^2 - 16.$$\n\n**Step 3 (1 mark):** Solve $\\Delta > 0$.\n\n$$(k - 1)^2 > 16$$\n\n$$|k - 1| > 4$$\n\n$$k < -3 \\quad \\text{or} \\quad k > 5.$$",
  },
  // SA 05 (order=4) — x^4 - 13x^2 + 36
  {
    type: "SHORT_ANSWER",
    order: 4,
    solutionContent:
      "**Step 1 (1 mark):** Substitute $u = x^2$.\n\n$$u^2 - 13u + 36 = 0.$$\n\n**Step 2 (1 mark):** Factor and solve for $u$.\n\n$$(u - 4)(u - 9) = 0$$\n\n$$u = 4 \\quad \\text{or} \\quad u = 9.$$\n\n**Step 3 (1 mark):** Convert back to $x$.\n\n$$x^2 = 4 \\implies x = \\pm 2,$$\n\n$$x^2 = 9 \\implies x = \\pm 3.$$\n\nSo $x \\in \\{-3, -2, 2, 3\\}$.",
  },
  // SA 06 (order=5) — α + β, αβ, 1/α + 1/β
  {
    type: "SHORT_ANSWER",
    order: 5,
    solutionContent:
      "**Step 1 (1 mark):** Apply Vieta's formulas.\n\n$$\\alpha + \\beta = \\dfrac{5}{2},$$\n\n$$\\alpha\\beta = \\dfrac{1}{2}.$$\n\n**Step 2 (1 mark):** Combine the fractions.\n\n$$\\dfrac{1}{\\alpha} + \\dfrac{1}{\\beta} = \\dfrac{\\alpha + \\beta}{\\alpha\\beta}.$$\n\n**Step 3 (1 mark):** Substitute and simplify.\n\n$$= \\dfrac{5/2}{1/2}$$\n\n$$= 5.$$",
  },
  // SA 07 (order=6) — (x-1)(x^2-4) > 0
  {
    type: "SHORT_ANSWER",
    order: 6,
    solutionContent:
      "**Step 1 (1 mark):** Identify the roots and critical points.\n\n$$x = -2, \\quad x = 1, \\quad x = 2.$$\n\n**Step 2 (1 mark):** Build a sign chart.\n\n| Interval | $x < -2$ | $-2 < x < 1$ | $1 < x < 2$ | $x > 2$ |\n|---|---|---|---|---|\n| $(x - 1)$ | $-$ | $-$ | $+$ | $+$ |\n| $(x - 2)$ | $-$ | $-$ | $-$ | $+$ |\n| $(x + 2)$ | $-$ | $+$ | $+$ | $+$ |\n| Product | $-$ | $+$ | $-$ | $+$ |\n\n**Step 3 (1 mark):** Read off the intervals where the product is positive.\n\n$$-2 < x < 1 \\quad \\text{or} \\quad x > 2.$$",
  },
  // SA 08 (order=7) — x^3 - 6x^2 + 11x - 6
  {
    type: "SHORT_ANSWER",
    order: 7,
    solutionContent:
      "**Step 1 (1 mark):** Apply the rational root theorem to find one root.\n\nCandidates: $\\pm 1, \\pm 2, \\pm 3, \\pm 6$. Test $x = 1$:\n\n$$p(1) = 1 - 6 + 11 - 6$$\n\n$$= 0. \\checkmark$$\n\n**Step 2 (1 mark):** Divide by $(x - 1)$.\n\n$$x^3 - 6x^2 + 11x - 6 = (x - 1)(x^2 - 5x + 6).$$\n\n**Step 3 (1 mark):** Factor the quadratic.\n\n$$x^2 - 5x + 6 = (x - 2)(x - 3).$$\n\nRoots: $x = 1, 2, 3$.",
  },
  // SA 09 (order=8) — 2^{2x} - 5·2^x + 4
  {
    type: "SHORT_ANSWER",
    order: 8,
    solutionContent:
      "**Step 1 (1 mark):** Substitute $u = 2^x$.\n\n$$u^2 - 5u + 4 = 0.$$\n\n**Step 2 (1 mark):** Factor and solve for $u$.\n\n$$(u - 1)(u - 4) = 0$$\n\n$$u = 1 \\quad \\text{or} \\quad u = 4.$$\n\n**Step 3 (1 mark):** Convert back to $x$.\n\n$$2^x = 1 \\implies x = 0,$$\n\n$$2^x = 4 \\implies x = 2.$$",
  },
  // SA 10 (order=9) — b,c,d from roots -1,2,3
  {
    type: "SHORT_ANSWER",
    order: 9,
    solutionContent:
      "**Step 1 (1 mark):** Apply Vieta's for the sum of roots: sum $= -b$.\n\n$$-1 + 2 + 3 = 4$$\n\n$$\\implies b = -4.$$\n\n**Step 2 (1 mark):** Apply Vieta's for the sum of products of pairs: $= c$.\n\n$$(-1)(2) + (-1)(3) + (2)(3)$$\n\n$$= -2 - 3 + 6$$\n\n$$= 1$$\n\n$$\\implies c = 1.$$\n\n**Step 3 (1 mark):** Apply Vieta's for the product of roots: $= -d$.\n\n$$(-1)(2)(3) = -6$$\n\n$$\\implies d = 6.$$\n\n**Step 4 (1 mark):** State the polynomial.\n\n$$p(x) = x^3 - 4x^2 + x + 6.$$",
  },
  // ─── EXTENDED RESPONSE ───────────────────────────────────────────
  // LR 01 (order=0) — f(x) = (x+2)(x-1)(x-a)
  {
    type: "EXTENDED_RESPONSE",
    order: 0,
    solutionContent:
      "**a. (1 mark)**\n\n$$f(x) = 0 \\iff x = -2, \\; x = 1, \\; \\text{or } x = a.$$\n\n**b. (2 marks)**\n\n*Step 1 (1 mark):* Two distinct intercepts occur when one of the listed roots coincides with another, so\n\n$$a = -2 \\quad \\text{or} \\quad a = 1.$$\n\n*Step 2 (1 mark):* So $a \\in \\{-2, 1\\}$.\n\n**c.i. (2 marks)**\n\n*Step 1 (1 mark):*\n\n$$(x + 2)(x - 1) = x^2 + x - 2.$$\n\n*Step 2 (1 mark):*\n\n$$(x^2 + x - 2)(x - 3) = x^3 - 2x^2 - 5x + 6.$$\n\nSo $b = -2$, $c = -5$, $d = 6$.\n\n**c.ii. (1 mark)**\n\n$$f'(x) = 3x^2 - 4x - 5.$$\n\n**c.iii. (2 marks)**\n\n*Step 1 (1 mark):* Set $f'(x) = 0$:\n\n$$3x^2 - 4x - 5 = 0.$$\n\n*Step 2 (1 mark):* Apply the quadratic formula:\n\n$$x = \\dfrac{4 \\pm \\sqrt{16 + 60}}{6}$$\n\n$$= \\dfrac{4 \\pm \\sqrt{76}}{6}$$\n\n$$= \\dfrac{2 \\pm \\sqrt{19}}{3}.$$\n\n**d. (2 marks)**\n\n*Step 1 (1 mark):* Roots of $f$ are $-2, 1, 3$; cubic with positive leading coefficient.\n\n*Step 2 (1 mark):* Sign chart gives\n\n$$-2 \\leq x \\leq 1 \\quad \\text{or} \\quad x \\geq 3.$$",
  },
  // LR 02 (order=1) — p(x) = x^3 - 6x^2 + 9x + k
  {
    type: "EXTENDED_RESPONSE",
    order: 1,
    solutionContent:
      "**a. (2 marks)**\n\n*Step 1 (1 mark):*\n\n$$p'(x) = 3x^2 - 12x + 9$$\n\n$$= 3(x^2 - 4x + 3).$$\n\n*Step 2 (1 mark):*\n\n$$x^2 - 4x + 3 = (x - 1)(x - 3),$$\n\nso $p'(x) = 3(x - 1)(x - 3)$. $\\checkmark$\n\n**b. (3 marks)**\n\n*Step 1 (1 mark):* Stationary points occur at $x = 1$ and $x = 3$.\n\n*Step 2 (1 mark):*\n\n$$p(1) = 1 - 6 + 9 + k = 4 + k,$$\n\n$$p(3) = 27 - 54 + 27 + k = k.$$\n\nCoordinates: $(1,\\, 4 + k)$ and $(3,\\, k)$.\n\n*Step 3 (1 mark):* $p'$ changes from $+$ to $-$ at $x = 1$, so $(1,\\, 4 + k)$ is a local maximum; $p'$ changes from $-$ to $+$ at $x = 3$, so $(3,\\, k)$ is a local minimum.\n\n**c. (2 marks)**\n\n*Step 1 (1 mark):* From the table, $p(0) = 0$ and $p(3) = 0$, so $x$ and $(x - 3)$ are factors.\n\n*Step 2 (1 mark):* Polynomial division (or matching) gives\n\n$$p(x) = x(x - 3)^2 \\quad (k = 0).$$\n\n**d. (3 marks)**\n\n*Step 1 (1 mark):* Three distinct roots require the local max above the $x$-axis:\n\n$$4 + k > 0.$$\n\n*Step 2 (1 mark):* And the local min below:\n\n$$k < 0.$$\n\n*Step 3 (1 mark):* Combining,\n\n$$-4 < k < 0.$$",
  },
  // LR 03 (order=2) — p(x) = x^3 + ax^2 + bx + 6
  {
    type: "EXTENDED_RESPONSE",
    order: 2,
    solutionContent:
      "**a. (3 marks)**\n\n*Step 1 (1 mark):* $p(2) = 0$:\n\n$$8 + 4a + 2b + 6 = 0$$\n\n$$\\implies 2a + b = -7. \\quad (1)$$\n\n*Step 2 (1 mark):* $p(-1) = 0$:\n\n$$-1 + a - b + 6 = 0$$\n\n$$\\implies a - b = -5. \\quad (2)$$\n\n*Step 3 (1 mark):* Adding $(1)$ and $(2)$:\n\n$$3a = -12$$\n\n$$\\implies a = -4, \\; b = 1.$$\n\n**b. (2 marks)**\n\n*Step 1 (1 mark):*\n\n$$p(x) = x^3 - 4x^2 + x + 6.$$\n\n*Step 2 (1 mark):* Dividing by $(x - 2)(x + 1) = x^2 - x - 2$:\n\n$$p(x) = (x - 2)(x + 1)(x - 3).$$\n\n**c. (2 marks)**\n\n*Step 1 (1 mark):* Roots at $-1, 2, 3$; positive leading coefficient.\n\n*Step 2 (1 mark):* Sign chart gives\n\n$$-1 < x < 2 \\quad \\text{or} \\quad x > 3.$$\n\n**d. (3 marks)**\n\n*Step 1 (1 mark):* $q(x) = 0 \\iff p(x) = -c$. We need the horizontal line $y = -c$ to meet $y = p(x)$ at exactly two points.\n\n*Step 2 (1 mark):* Find the stationary values. Solving $p'(x) = 3x^2 - 8x + 1 = 0$:\n\n$$x = \\dfrac{8 \\pm \\sqrt{52}}{6}$$\n\n$$= \\dfrac{4 \\pm \\sqrt{13}}{3}.$$\n\nCall the local max value $M$ and local min value $m$.\n\n*Step 3 (1 mark):* Exactly two intersections iff $-c = M$ or $-c = m$, so\n\n$$c \\in \\{-M,\\; -m\\},$$\n\nwhere $M = p\\!\\left(\\tfrac{4 - \\sqrt{13}}{3}\\right)$ and $m = p\\!\\left(\\tfrac{4 + \\sqrt{13}}{3}\\right)$.",
  },
  // LR 04 (order=3) — x^3 + 3x^2 - 4
  {
    type: "EXTENDED_RESPONSE",
    order: 3,
    solutionContent:
      "**a. (1 mark)**\n\n$$p(1) = 1 + 3 - 4 = 0. \\checkmark$$\n\n**b. (3 marks)**\n\n*Step 1 (1 mark):* Divide $x^3 + 3x^2 - 4$ by $(x - 1)$:\n\n$$\\text{quotient} = x^2 + 4x + 4.$$\n\n*Step 2 (1 mark):* Factor the quadratic:\n\n$$x^2 + 4x + 4 = (x + 2)^2.$$\n\n*Step 3 (1 mark):* Combining:\n\n$$x^3 + 3x^2 - 4 = (x - 1)(x + 2)^2.$$\n\n**c. (1 mark)**\n\n$$x = 1 \\quad \\text{or} \\quad x = -2 \\text{ (double root)}.$$\n\n**d.i. (2 marks)**\n\n*Step 1 (1 mark):*\n\n$$g'(x) = 3x^2 + 6x$$\n\n$$= 3x(x + 2).$$\n\nSetting to zero: $x = 0$ or $x = -2$.\n\n*Step 2 (1 mark):*\n\n$$g(0) = -4 + t,$$\n\n$$g(-2) = -8 + 12 - 4 + t = t.$$\n\nStationary points: $(0,\\, -4 + t)$ and $(-2,\\, t)$.\n\n**d.ii. (3 marks)**\n\n*Step 1 (1 mark):* $g$ is a positive cubic, so $(-2,\\, t)$ is the local max and $(0,\\, -4 + t)$ is the local min.\n\n*Step 2 (1 mark):* Exactly one real root occurs when both stationary values have the same (non-zero) sign:\n\n$$t \\cdot (-4 + t) > 0.$$\n\n*Step 3 (1 mark):* Solving:\n\n$$t < 0 \\quad \\text{or} \\quad t > 4.$$",
  },
  // LR 05 (order=4) — Quartic (x+1)(x-a)(x-b)(x-4)
  {
    type: "EXTENDED_RESPONSE",
    order: 4,
    solutionContent:
      "**a. (1 mark)**\n\n$x$-intercepts: $x = -1, 1, 2, 4$.\n\n**b. (3 marks)**\n\n*Step 1 (1 mark):*\n\n$$(x + 1)(x - 1) = x^2 - 1.$$\n\n*Step 2 (1 mark):*\n\n$$(x - 2)(x - 4) = x^2 - 6x + 8.$$\n\n*Step 3 (1 mark):*\n\n$$(x^2 - 1)(x^2 - 6x + 8) = x^4 - 6x^3 + 8x^2 - x^2 + 6x - 8$$\n\n$$= x^4 - 6x^3 + 7x^2 + 6x - 8.$$\n\n**c. (2 marks)**\n\n*Step 1 (1 mark):* Roots at $-1, 1, 2, 4$ (all simple); positive leading coefficient quartic.\n\n*Step 2 (1 mark):* Sign analysis:\n\n$$p(x) \\leq 0 \\text{ on } [-1,\\,1] \\cup [2,\\,4].$$\n\n**d. (4 marks)**\n\n*Step 1 (1 mark):* For $p(x)$ to be a perfect square, every root must have even multiplicity. The four listed roots are $-1,\\, a,\\, b,\\, 4$.\n\n*Step 2 (1 mark):* Pairing them into two double roots within $-1 < a < b < 4$ would require either $a = -1$ or $b = 4$, both excluded by the strict inequality.\n\n*Step 3 (1 mark):* The only remaining option is $a = b$, which contradicts $a < b$.\n\n*Step 4 (1 mark):* Therefore there are no values of $a, b$ with $-1 < a < b < 4$ for which $p(x)$ is a perfect square.",
  },
];

async function main() {
  const set = await prisma.questionSet.findFirst({
    where: { name: "Questions Set testing" },
  });
  if (!set) throw new Error('Question set "Questions Set testing" not found');

  // Group items by type and key by order
  const allItems = await prisma.questionSetItem.findMany({
    where: { questionSetId: set.id },
    orderBy: { order: "asc" },
  });

  const byKey = new Map<string, (typeof allItems)[number]>();
  for (const item of allItems) {
    byKey.set(`${item.type}:${item.order}`, item);
  }

  // Orders are global across the set:
  //   MCQ          0–19
  //   SHORT_ANSWER 20–29
  //   EXTENDED_RESPONSE 30–34
  // Our updates array uses type-local order; offset it to the global order.
  const offsets: Record<Update["type"], number> = {
    MCQ: 0,
    SHORT_ANSWER: 20,
    EXTENDED_RESPONSE: 30,
  };

  let updated = 0;
  for (const u of updates) {
    const globalOrder = u.order + offsets[u.type];
    const item = byKey.get(`${u.type}:${globalOrder}`);
    if (!item) {
      console.warn(`⚠️  No item for ${u.type}:${globalOrder}`);
      continue;
    }
    await prisma.questionSetItem.update({
      where: { id: item.id },
      data: { solutionContent: u.solutionContent },
    });
    updated++;
    console.log(`✅ ${u.type} order=${globalOrder}`);
  }

  console.log(`\n🎉 Rewrote ${updated} solutions with one equation per line`);
  await prisma.$disconnect();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
