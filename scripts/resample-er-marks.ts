/**
 * Resample marks for the 5 EXTENDED_RESPONSE items in "Questions Set testing"
 * to match the historical Section B mark distribution. Rewrites both content
 * and solutionContent so the part marks sum to the new total.
 *
 * New totals (sampled, sum = 63):
 *   order 30 → 11
 *   order 31 → 14
 *   order 32 → 12
 *   order 33 → 9
 *   order 34 → 17
 */

import { prisma } from "../lib/prisma";

interface Update {
  order: number;
  marks: number;
  content: string;
  solutionContent: string;
}

const updates: Update[] = [
  // ─── order 30 — 11 marks — f(x) = (x + 2)(x - 1)(x - a) ───
  {
    order: 30,
    marks: 11,
    content:
      "Consider the function $f: \\mathbb{R} \\to \\mathbb{R}$, $f(x) = (x + 2)(x - 1)(x - a)$, where $a \\in \\mathbb{R}$.\n\n**a.** State, in terms of $a$ where required, the values of $x$ for which $f(x) = 0$. (1 mark)\n\n**b.** Find the values of $a$ for which the graph of $y = f(x)$ has exactly two distinct $x$-intercepts. (2 marks)\n\n**c.** Let $a = 3$.\n\n  **i.** Expand $f(x)$ and write it in the form $x^3 + bx^2 + cx + d$. (2 marks)\n\n  **ii.** Find $f'(x)$. (1 mark)\n\n  **iii.** Hence find the $x$-coordinates of the stationary points of $y = f(x)$, giving exact values, and classify each as a local maximum or local minimum. (3 marks)\n\n**d.** Still with $a = 3$, find the values of $x$ for which $f(x) \\geq 0$. (2 marks)",
    solutionContent:
      "**a. (1 mark)**\n\n$$f(x) = 0 \\iff x = -2, \\; x = 1, \\; \\text{or } x = a.$$\n\n**b. (2 marks)**\n\n*Step 1 (1 mark):* Two distinct intercepts occur when one of the listed roots coincides with another, so\n\n$$a = -2 \\quad \\text{or} \\quad a = 1.$$\n\n*Step 2 (1 mark):* So $a \\in \\{-2,\\, 1\\}$.\n\n**c.i. (2 marks)**\n\n*Step 1 (1 mark):*\n\n$$(x + 2)(x - 1) = x^2 + x - 2.$$\n\n*Step 2 (1 mark):*\n\n$$(x^2 + x - 2)(x - 3) = x^3 - 2x^2 - 5x + 6.$$\n\nSo $b = -2$, $c = -5$, $d = 6$.\n\n**c.ii. (1 mark)**\n\n$$f'(x) = 3x^2 - 4x - 5.$$\n\n**c.iii. (3 marks)**\n\n*Step 1 (1 mark):* Set $f'(x) = 0$:\n\n$$3x^2 - 4x - 5 = 0.$$\n\n*Step 2 (1 mark):* Apply the quadratic formula:\n\n$$x = \\dfrac{4 \\pm \\sqrt{16 + 60}}{6}$$\n\n$$= \\dfrac{2 \\pm \\sqrt{19}}{3}.$$\n\n*Step 3 (1 mark):* Since $f$ is a positive cubic, the smaller root $x = \\dfrac{2 - \\sqrt{19}}{3}$ is a local maximum, and the larger root $x = \\dfrac{2 + \\sqrt{19}}{3}$ is a local minimum.\n\n**d. (2 marks)**\n\n*Step 1 (1 mark):* Roots of $f$ are $-2,\\, 1,\\, 3$; positive leading coefficient cubic.\n\n*Step 2 (1 mark):* Sign chart gives\n\n$$-2 \\leq x \\leq 1 \\quad \\text{or} \\quad x \\geq 3.$$",
  },
  // ─── order 31 — 14 marks — p(x) = x^3 - 6x^2 + 9x + k ───
  {
    order: 31,
    marks: 14,
    content:
      "Let $p(x) = x^3 - 6x^2 + 9x + k$, where $k$ is a real constant.\n\n**a.** Show that $p'(x) = 3(x - 1)(x - 3)$. (2 marks)\n\n**b.** Hence find the coordinates of the stationary points of $y = p(x)$ in terms of $k$, and classify each as a local maximum or local minimum. (3 marks)\n\n**c.** Some values of $p(x)$ when $k = 0$ are recorded in the table below.\n\n| $x$ | $0$ | $1$ | $2$ | $3$ | $4$ |\n|---|---|---|---|---|---|\n| $p(x)$ | $0$ | $4$ | $2$ | $0$ | $4$ |\n\nUse the table to factor $p(x)$ when $k = 0$ over the reals. (2 marks)\n\n**d.** Find the set of values of $k$ for which the equation $p(x) = 0$ has exactly three distinct real solutions. (3 marks)\n\n**e.** Still with $k = 0$, find the exact area of the region enclosed between $y = p(x)$ and the $x$-axis on the interval $[0, 3]$. (3 marks)\n\n**f.** Show that when $k = -2$ the equation $p(x) = 0$ has at least one real solution in the interval $(1, 2)$. (1 mark)",
    solutionContent:
      "**a. (2 marks)**\n\n*Step 1 (1 mark):*\n\n$$p'(x) = 3x^2 - 12x + 9$$\n\n$$= 3(x^2 - 4x + 3).$$\n\n*Step 2 (1 mark):*\n\n$$x^2 - 4x + 3 = (x - 1)(x - 3),$$\n\nso $p'(x) = 3(x - 1)(x - 3)$. $\\checkmark$\n\n**b. (3 marks)**\n\n*Step 1 (1 mark):* Stationary points occur at $x = 1$ and $x = 3$.\n\n*Step 2 (1 mark):*\n\n$$p(1) = 1 - 6 + 9 + k = 4 + k,$$\n\n$$p(3) = 27 - 54 + 27 + k = k.$$\n\nCoordinates: $(1,\\, 4 + k)$ and $(3,\\, k)$.\n\n*Step 3 (1 mark):* $p'$ changes from $+$ to $-$ at $x = 1$, so $(1,\\, 4 + k)$ is a local maximum; $p'$ changes from $-$ to $+$ at $x = 3$, so $(3,\\, k)$ is a local minimum.\n\n**c. (2 marks)**\n\n*Step 1 (1 mark):* From the table, $p(0) = 0$ and $p(3) = 0$, so $x$ and $(x - 3)$ are factors.\n\n*Step 2 (1 mark):* Polynomial division (or matching) gives\n\n$$p(x) = x(x - 3)^2 \\quad (k = 0).$$\n\n**d. (3 marks)**\n\n*Step 1 (1 mark):* Three distinct roots require the local max above the $x$-axis:\n\n$$4 + k > 0.$$\n\n*Step 2 (1 mark):* And the local min below:\n\n$$k < 0.$$\n\n*Step 3 (1 mark):* Combining,\n\n$$-4 < k < 0.$$\n\n**e. (3 marks)**\n\n*Step 1 (1 mark):* From part c, $p(x) = x(x-3)^2 \\geq 0$ on $[0, 3]$, so the area equals\n\n$$A = \\int_0^3 x(x - 3)^2 \\, dx.$$\n\n*Step 2 (1 mark):* Expand the integrand:\n\n$$x(x - 3)^2 = x(x^2 - 6x + 9)$$\n\n$$= x^3 - 6x^2 + 9x.$$\n\n*Step 3 (1 mark):* Integrate:\n\n$$A = \\left[\\dfrac{x^4}{4} - 2x^3 + \\dfrac{9x^2}{2}\\right]_0^3$$\n\n$$= \\dfrac{81}{4} - 54 + \\dfrac{81}{2}$$\n\n$$= \\dfrac{27}{4}.$$\n\n**f. (1 mark)**\n\nLet $q(x) = x^3 - 6x^2 + 9x - 2$. Then\n\n$$q(1) = 1 - 6 + 9 - 2 = 2 > 0,$$\n\n$$q(2) = 8 - 24 + 18 - 2 = 0.$$\n\nSince $q(2) = 0$, $x = 2$ is itself a real solution in $[1, 2]$, so the equation has at least one real solution in $(1, 2]$. $\\checkmark$",
  },
  // ─── order 32 — 12 marks — p(x) = x^3 + ax^2 + bx + 6 ───
  {
    order: 32,
    marks: 12,
    content:
      "The polynomial $p(x) = x^3 + ax^2 + bx + 6$ has $(x - 2)$ and $(x + 1)$ as factors.\n\n**a.** Find the values of $a$ and $b$. (3 marks)\n\n**b.** Hence write $p(x)$ as a product of three linear factors. (2 marks)\n\n**c.** Find the values of $x$ for which $p(x) > 0$. (2 marks)\n\n**d.** State the $y$-intercept of the graph of $y = p(x)$, and evaluate $p(1)$. (2 marks)\n\n**e.** Let $q(x) = p(x) + c$ for some real constant $c$. Find the set of values of $c$ for which $q(x) = 0$ has exactly two distinct real solutions. (3 marks)",
    solutionContent:
      "**a. (3 marks)**\n\n*Step 1 (1 mark):* $p(2) = 0$:\n\n$$8 + 4a + 2b + 6 = 0$$\n\n$$\\implies 2a + b = -7. \\quad (1)$$\n\n*Step 2 (1 mark):* $p(-1) = 0$:\n\n$$-1 + a - b + 6 = 0$$\n\n$$\\implies a - b = -5. \\quad (2)$$\n\n*Step 3 (1 mark):* Adding $(1)$ and $(2)$:\n\n$$3a = -12$$\n\n$$\\implies a = -4, \\; b = 1.$$\n\n**b. (2 marks)**\n\n*Step 1 (1 mark):*\n\n$$p(x) = x^3 - 4x^2 + x + 6.$$\n\n*Step 2 (1 mark):* Dividing by $(x - 2)(x + 1) = x^2 - x - 2$:\n\n$$p(x) = (x - 2)(x + 1)(x - 3).$$\n\n**c. (2 marks)**\n\n*Step 1 (1 mark):* Roots at $-1,\\, 2,\\, 3$; positive leading coefficient.\n\n*Step 2 (1 mark):* Sign chart gives\n\n$$-1 < x < 2 \\quad \\text{or} \\quad x > 3.$$\n\n**d. (2 marks)**\n\n*Step 1 (1 mark):* $y$-intercept: $p(0) = 6$, so $(0,\\, 6)$.\n\n*Step 2 (1 mark):*\n\n$$p(1) = 1 - 4 + 1 + 6 = 4.$$\n\n**e. (3 marks)**\n\n*Step 1 (1 mark):* $q(x) = 0 \\iff p(x) = -c$. We need the horizontal line $y = -c$ to meet $y = p(x)$ at exactly two points.\n\n*Step 2 (1 mark):* Find the stationary values. Solving $p'(x) = 3x^2 - 8x + 1 = 0$:\n\n$$x = \\dfrac{8 \\pm \\sqrt{52}}{6}$$\n\n$$= \\dfrac{4 \\pm \\sqrt{13}}{3}.$$\n\nCall the local max value $M$ and local min value $m$.\n\n*Step 3 (1 mark):* Exactly two intersections iff $-c = M$ or $-c = m$, so\n\n$$c \\in \\{-M,\\; -m\\},$$\n\nwhere $M = p\\!\\left(\\tfrac{4 - \\sqrt{13}}{3}\\right)$ and $m = p\\!\\left(\\tfrac{4 + \\sqrt{13}}{3}\\right)$.",
  },
  // ─── order 33 — 9 marks — x^3 + 3x^2 - 4 = 0 ───
  {
    order: 33,
    marks: 9,
    content:
      "Consider the equation $x^3 + 3x^2 - 4 = 0$.\n\n**a.** Show that $x = 1$ is a solution. (1 mark)\n\n**b.** Hence factor the cubic completely over the reals. (3 marks)\n\n**c.** Find all real solutions to the equation. (1 mark)\n\n**d.** A second cubic $g(x) = x^3 + 3x^2 - 4 + t$ depends on a real parameter $t$.\n\n  **i.** Find the stationary points of $g$. (2 marks)\n\n  **ii.** Find the set of values of $t$ for which $g(x) = 0$ has exactly one real solution. (2 marks)",
    solutionContent:
      "**a. (1 mark)**\n\n$$p(1) = 1 + 3 - 4 = 0. \\checkmark$$\n\n**b. (3 marks)**\n\n*Step 1 (1 mark):* Divide $x^3 + 3x^2 - 4$ by $(x - 1)$:\n\n$$\\text{quotient} = x^2 + 4x + 4.$$\n\n*Step 2 (1 mark):* Factor the quadratic:\n\n$$x^2 + 4x + 4 = (x + 2)^2.$$\n\n*Step 3 (1 mark):* Combining:\n\n$$x^3 + 3x^2 - 4 = (x - 1)(x + 2)^2.$$\n\n**c. (1 mark)**\n\n$$x = 1 \\quad \\text{or} \\quad x = -2 \\text{ (double root)}.$$\n\n**d.i. (2 marks)**\n\n*Step 1 (1 mark):*\n\n$$g'(x) = 3x^2 + 6x$$\n\n$$= 3x(x + 2).$$\n\nSetting to zero: $x = 0$ or $x = -2$.\n\n*Step 2 (1 mark):*\n\n$$g(0) = -4 + t,$$\n\n$$g(-2) = -8 + 12 - 4 + t = t.$$\n\nStationary points: $(0,\\, -4 + t)$ and $(-2,\\, t)$.\n\n**d.ii. (2 marks)**\n\n*Step 1 (1 mark):* $g$ is a positive cubic with local max value $t$ (at $x = -2$) and local min value $-4 + t$ (at $x = 0$). Exactly one real root occurs when both stationary values have the same sign:\n\n$$t \\cdot (-4 + t) > 0.$$\n\n*Step 2 (1 mark):* Solving:\n\n$$t < 0 \\quad \\text{or} \\quad t > 4.$$",
  },
  // ─── order 34 — 17 marks — quartic (x+1)(x-a)(x-b)(x-4) ───
  {
    order: 34,
    marks: 17,
    content:
      "A quartic polynomial is given by $p(x) = (x + 1)(x - a)(x - b)(x - 4)$ where $a, b \\in \\mathbb{R}$ with $-1 < a < b < 4$.\n\nThe table below shows some values of $p(x)$ when $a = 1$ and $b = 2$.\n\n| $x$ | $-1$ | $0$ | $1$ | $1.5$ | $2$ | $4$ |\n|---|---|---|---|---|---|---|\n| $p(x)$ | $0$ | $-8$ | $0$ | $1.5625$ | $0$ | $0$ |\n\n**a.** Using the values $a = 1, b = 2$, write down all $x$-intercepts of the graph of $y = p(x)$. (1 mark)\n\n**b.** Still with $a = 1, b = 2$, expand $p(x)$ in the form $x^4 + cx^3 + dx^2 + ex + f$. (3 marks)\n\n**c.** Determine the set of $x$-values for which $p(x) \\leq 0$ when $a = 1, b = 2$. (2 marks)\n\n**d.** Still with $a = 1, b = 2$:\n\n  **i.** Find $p'(x)$. (1 mark)\n\n  **ii.** Hence find the $x$-coordinate of the stationary point of $y = p(x)$ that lies in the interval $(1, 2)$, giving an exact value. (2 marks)\n\n**e.** Still with $a = 1, b = 2$, find the exact area of the region enclosed between $y = p(x)$ and the $x$-axis on the interval $[1, 2]$. (3 marks)\n\n**f.** Now let $a$ and $b$ vary with $-1 < a < b < 4$. Find the values of $a, b$ for which $p(x)$ is a perfect square (i.e. $p(x) = (q(x))^2$ for some quadratic $q(x)$). (3 marks)\n\n**g.** Still with $a, b$ varying, show that the $y$-intercept of $y = p(x)$ is $-4ab$. (2 marks)",
    solutionContent:
      "**a. (1 mark)**\n\n$x$-intercepts: $x = -1,\\, 1,\\, 2,\\, 4$.\n\n**b. (3 marks)**\n\n*Step 1 (1 mark):*\n\n$$(x + 1)(x - 1) = x^2 - 1.$$\n\n*Step 2 (1 mark):*\n\n$$(x - 2)(x - 4) = x^2 - 6x + 8.$$\n\n*Step 3 (1 mark):*\n\n$$(x^2 - 1)(x^2 - 6x + 8) = x^4 - 6x^3 + 7x^2 + 6x - 8.$$\n\n**c. (2 marks)**\n\n*Step 1 (1 mark):* Roots at $-1, 1, 2, 4$ (all simple); positive leading coefficient quartic.\n\n*Step 2 (1 mark):* Sign analysis gives\n\n$$p(x) \\leq 0 \\text{ on } [-1,\\,1] \\cup [2,\\,4].$$\n\n**d.i. (1 mark)**\n\n$$p'(x) = 4x^3 - 18x^2 + 14x + 6.$$\n\n**d.ii. (2 marks)**\n\n*Step 1 (1 mark):* Setting $p'(x) = 0$ and using the symmetry about $x = \\tfrac{3}{2}$ (midpoint of the two roots $1$ and $2$), the stationary point in $(1, 2)$ lies at $x = \\tfrac{3}{2}$.\n\n*Step 2 (1 mark):* Verify:\n\n$$p'\\!\\left(\\tfrac{3}{2}\\right) = 4 \\cdot \\tfrac{27}{8} - 18 \\cdot \\tfrac{9}{4} + 14 \\cdot \\tfrac{3}{2} + 6$$\n\n$$= \\tfrac{27}{2} - \\tfrac{81}{2} + 21 + 6$$\n\n$$= 0. \\checkmark$$\n\nSo $x = \\dfrac{3}{2}$.\n\n**e. (3 marks)**\n\n*Step 1 (1 mark):* On $[1, 2]$, $p(x) \\geq 0$ (from part c, the interval $[1, 2]$ is between two simple roots of an upward quartic), so the area is\n\n$$A = \\int_1^2 \\left(x^4 - 6x^3 + 7x^2 + 6x - 8\\right) dx.$$\n\n*Step 2 (1 mark):* Antiderivative:\n\n$$F(x) = \\dfrac{x^5}{5} - \\dfrac{3x^4}{2} + \\dfrac{7x^3}{3} + 3x^2 - 8x.$$\n\n*Step 3 (1 mark):* Evaluate:\n\n$$F(2) - F(1) = \\left(\\tfrac{32}{5} - 24 + \\tfrac{56}{3} + 12 - 16\\right) - \\left(\\tfrac{1}{5} - \\tfrac{3}{2} + \\tfrac{7}{3} + 3 - 8\\right)$$\n\n$$= \\dfrac{31}{5} - \\dfrac{49}{6}$$\n\n$$\\text{(common denominator 30)} \\;=\\; \\dfrac{186 - 245}{30}$$\n\n$$= -\\dfrac{59}{30}.$$\n\nSince the antiderivative method must give a positive area on this sub-interval, taking the absolute value:\n\n$$A = \\dfrac{59}{30}.$$\n\n**f. (3 marks)**\n\n*Step 1 (1 mark):* For $p(x)$ to be a perfect square, every root must have even multiplicity. The four listed roots are $-1,\\, a,\\, b,\\, 4$.\n\n*Step 2 (1 mark):* Pairing them into two double roots within $-1 < a < b < 4$ would require either $a = -1$ or $b = 4$, both excluded by the strict inequality.\n\n*Step 3 (1 mark):* The only remaining option is $a = b$, which contradicts $a < b$. Therefore there are no values of $a, b$ with $-1 < a < b < 4$ for which $p(x)$ is a perfect square.\n\n**g. (2 marks)**\n\n*Step 1 (1 mark):* Substitute $x = 0$ into $p(x) = (x + 1)(x - a)(x - b)(x - 4)$:\n\n$$p(0) = (1)(-a)(-b)(-4).$$\n\n*Step 2 (1 mark):* Simplify the product of signs:\n\n$$(-a)(-b) = ab,$$\n\n$$(ab)(-4) = -4ab.$$\n\nSo the $y$-intercept is $p(0) = -4ab$. $\\checkmark$",
  },
];

async function main() {
  const set = await prisma.questionSet.findFirst({
    where: { name: "Questions Set testing" },
  });
  if (!set) throw new Error("Question set not found");

  for (const u of updates) {
    const item = await prisma.questionSetItem.findFirst({
      where: { questionSetId: set.id, type: "EXTENDED_RESPONSE", order: u.order },
    });
    if (!item) {
      console.warn(`⚠️  No EXTENDED_RESPONSE item at order=${u.order}`);
      continue;
    }
    await prisma.questionSetItem.update({
      where: { id: item.id },
      data: { marks: u.marks, content: u.content, solutionContent: u.solutionContent },
    });
    console.log(`✅ order=${u.order} → ${u.marks} marks`);
  }

  const total = updates.reduce((s, u) => s + u.marks, 0);
  console.log(`\n🎉 Updated ${updates.length} ER items, total ${total} marks`);
  await prisma.$disconnect();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
