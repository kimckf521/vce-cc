/**
 * Targeted fixes for the 16 quality issues found by audit-qsets.ts:
 *   - Remove AI thinking-out-loud from 15 solutions
 *   - Fix 7 MCQ answer/correctOption mismatches
 *   - Repair broken MCQ question content (wrong numeric setup) in 3 cases
 *   - Fix one inconsistent system in SA simultaneous-equations
 *   - Rewrite confusing discrete-RV dependent MCQs
 *   - Clean the farmer-paddock ER setup
 *
 * Each fix below is idempotent — running the script twice is a no-op.
 * Usage: npx tsx scripts/fix-audit-issues.ts
 */
import fs from "fs";
import path from "path";

const OUT = path.resolve(__dirname, "output");

function load(name: string): any {
  return JSON.parse(fs.readFileSync(path.join(OUT, name), "utf-8"));
}
function save(name: string, data: any): void {
  fs.writeFileSync(
    path.join(OUT, name),
    JSON.stringify(data, null, 2),
    "utf-8"
  );
  console.log(`✏️  ${name}`);
}

// ── 1. qset-area-under-curves MCQ#13 — trapezoidal rule ─────────────────
{
  const d = load("qset-area-under-curves.json");
  const q = d.mcq[13];
  // Trapezoidal rule: T = (1/2)(3 + 2·5 + 2·4 + 2·2 + 1) = (1/2)(26) = 13
  // Options were 10/12/14/16 — 13 wasn't an option. Fix options.
  q.optionA = "$11$";
  q.optionB = "$12$";
  q.optionC = "$13$";
  q.optionD = "$14$";
  q.correctOption = "C";
  q.solutionContent =
    "**Step 1 (1 mark):** Apply the trapezoidal rule with $h = 1$.\n\n" +
    "$$T = \\tfrac{1}{2}\\big(f(0) + 2 f(1) + 2 f(2) + 2 f(3) + f(4)\\big)$$\n\n" +
    "$$= \\tfrac{1}{2}(3 + 10 + 8 + 4 + 1)$$\n\n" +
    "$$= \\tfrac{1}{2}(26)$$\n\n" +
    "$$= 13.$$\n\n" +
    "**Answer: C**";
  save("qset-area-under-curves.json", d);
}

// ── 2. qset-continuous-random-variables ER#1 — remove "Wait" line ────────
{
  const d = load("qset-continuous-random-variables.json");
  const q = d.extendedResponse[1];
  q.solutionContent = q.solutionContent.replace(
    /\n\nWait, \$E\(X\^2\) = \\int_0\^3 x\^2 f\(x\)\\,dx = \\tfrac\{2\}\{9\}\\int_0\^3 \(3x\^3 - x\^4\)\\,dx\$\.\n\n/,
    "\n\n"
  );
  save("qset-continuous-random-variables.json", d);
}

// ── 3. qset-discrete-random-variables MCQ#7 — E(X) = 2.6, answer C ───────
{
  const d = load("qset-discrete-random-variables.json");
  const q = d.mcq[7];
  q.correctOption = "C";
  q.solutionContent =
    "**Step 1 (1 mark):** Compute $E(X) = \\sum x\\,\\Pr(X = x)$.\n\n" +
    "$$E(X) = 1(0.1) + 2(0.4) + 3(0.3) + 4(0.2)$$\n\n" +
    "$$= 0.1 + 0.8 + 0.9 + 0.8$$\n\n" +
    "$$= 2.6.$$\n\n" +
    "**Answer: C**";

  // ── 4. MCQ#10 E(X²) — rewrite to independent, self-contained question ──
  const q10 = d.mcq[10];
  q10.content =
    "A discrete random variable $X$ has the probability distribution shown below.\n\n" +
    "| $x$ | $0$ | $1$ | $2$ | $3$ |\n" +
    "|---|---|---|---|---|\n" +
    "| $\\Pr(X = x)$ | $0.1$ | $0.3$ | $0.4$ | $0.2$ |\n\n" +
    "The value of $E(X^2)$ is:";
  q10.optionA = "$2.5$";
  q10.optionB = "$3.0$";
  q10.optionC = "$3.7$";
  q10.optionD = "$4.0$";
  q10.correctOption = "C";
  q10.solutionContent =
    "**Step 1 (1 mark):** Apply $E(X^2) = \\sum x^2 \\Pr(X = x)$.\n\n" +
    "$$E(X^2) = 0^2(0.1) + 1^2(0.3) + 2^2(0.4) + 3^2(0.2)$$\n\n" +
    "$$= 0 + 0.3 + 1.6 + 1.8$$\n\n" +
    "$$= 3.7.$$\n\n" +
    "**Answer: C**";
  save("qset-discrete-random-variables.json", d);
}

// ── 5. qset-exponential-equations MCQ#8 — adjust exponent so x is integer ─
{
  const d = load("qset-exponential-equations.json");
  const q = d.mcq[8];
  // Original: 2^(x+3) = 3·2^x + 16  →  5·2^x = 16  → not integer.
  // Fix: 2^(x+2) = 3·2^x + 16  →  4·2^x - 3·2^x = 16  →  2^x = 16  →  x = 4.
  q.content = "If $2^{x+2} = 3 \\cdot 2^x + 16$, then $x$ equals:";
  q.correctOption = "C";
  q.solutionContent =
    "**Step 1 (1 mark):** Rewrite $2^{x+2}$ as $4 \\cdot 2^x$ and collect terms.\n\n" +
    "$$4 \\cdot 2^x - 3 \\cdot 2^x = 16,$$\n\n" +
    "$$2^x = 16 = 2^4,$$\n\n" +
    "so $x = 4$.\n\n" +
    "**Answer: C**";
  save("qset-exponential-equations.json", d);
}

// ── 6. qset-fundamental-theorem-of-calculus MCQ#10 — f(3) = 16 ───────────
{
  const d = load("qset-fundamental-theorem-of-calculus.json");
  const q = d.mcq[10];
  q.correctOption = "C";
  q.solutionContent =
    "**Step 1 (1 mark):** Apply the fundamental theorem.\n\n" +
    "$$f(3) - f(1) = \\int_1^3 (4 t - 1)\\,dt$$\n\n" +
    "$$= \\big[2 t^2 - t\\big]_1^3$$\n\n" +
    "$$= (18 - 3) - (2 - 1)$$\n\n" +
    "$$= 14.$$\n\n" +
    "So $f(3) = f(1) + 14 = 2 + 14 = 16$.\n\n" +
    "**Answer: C**";
  save("qset-fundamental-theorem-of-calculus.json", d);
}

// ── 7. qset-optimisation MCQ#19 — fix V so optimal r is 3 ────────────────
{
  const d = load("qset-optimisation.json");
  const q = d.mcq[19];
  // Open-top cylinder: S = πr² + 2V/r. dS/dr = 2πr - 2V/r² = 0  →  πr³ = V.
  // For r = 3:  V = 27π.
  q.content =
    "A cylindrical open-top tank with volume $V = 27\\pi$ has minimum surface area when its radius is:";
  q.solutionContent =
    "**Step 1 (1 mark):** Let $V = \\pi r^2 h = 27\\pi$, so $h = \\dfrac{27}{r^2}$.\n\n" +
    "The open-top surface area is\n\n" +
    "$$S(r) = \\pi r^2 + 2\\pi r h = \\pi r^2 + \\dfrac{54\\pi}{r}.$$\n\n" +
    "Differentiating and setting to zero:\n\n" +
    "$$S'(r) = 2\\pi r - \\dfrac{54\\pi}{r^2} = 0,$$\n\n" +
    "$$r^3 = 27 \\implies r = 3.$$\n\n" +
    "**Answer: B**";
  save("qset-optimisation.json", d);
}

// ── 8. qset-optimisation ER#0 — clean farmer-paddock setup ──────────────
{
  const d = load("qset-optimisation.json");
  const q = d.extendedResponse[0];
  q.solutionContent =
    "**a. (2 marks)**\n\n" +
    "*Step 1 (1 mark):* The fence pieces are the two perpendicular sides (each of length $x$), the far side opposite the river (length $y$), and the internal divider parallel to the river (also length $y$).\n\n" +
    "$$2x + 2y = 120.$$\n\n" +
    "*Step 2 (1 mark):* Rearrange.\n\n" +
    "$$y = 60 - x.$$\n\n" +
    "**b. (2 marks)**\n\n" +
    "*Step 1 (1 mark):* Area of the paddock.\n\n" +
    "$$A = x y.$$\n\n" +
    "*Step 2 (1 mark):* Substitute $y = 60 - x$.\n\n" +
    "$$A(x) = x(60 - x) = 60 x - x^2.$$\n\n" +
    "**c. (3 marks)**\n\n" +
    "*Step 1 (1 mark):* Differentiate.\n\n" +
    "$$A'(x) = 60 - 2 x.$$\n\n" +
    "*Step 2 (1 mark):* Set $A'(x) = 0$.\n\n" +
    "$$60 - 2 x = 0.$$\n\n" +
    "*Step 3 (1 mark):* Solve.\n\n" +
    "$$x = 30 \\text{ m}.$$\n\n" +
    "**d. (2 marks)**\n\n" +
    "*Step 1 (1 mark):* $y = 60 - 30 = 30$ m.\n\n" +
    "*Step 2 (1 mark):* Maximum area $A = 30 \\cdot 30 = 900$ m$^2$.\n\n" +
    "**e. (2 marks)**\n\n" +
    "*Step 1 (1 mark):* $A''(x) = -2$.\n\n" +
    "*Step 2 (1 mark):* Since $A''(30) = -2 < 0$, the stationary point $x = 30$ is a local maximum.";
  save("qset-optimisation.json", d);
}

// ── 9. qset-polynomial-functions MCQ#17 — answer is B ───────────────────
{
  const d = load("qset-polynomial-functions.json");
  const q = d.mcq[17];
  q.correctOption = "B";
  q.solutionContent =
    "**Step 1 (1 mark):** Write $p(x) = a(x - 2)(x + 1)^2$ and use $p(0) = -4$.\n\n" +
    "$$p(0) = a \\cdot (-2) \\cdot 1 = -2a.$$\n\n" +
    "Set equal to $-4$: $-2a = -4$, so $a = 2$.\n\n" +
    "$$p(x) = 2(x - 2)(x + 1)^2.$$\n\n" +
    "**Answer: B**";
  save("qset-polynomial-functions.json", d);
}

// ── 10. qset-product-rule MCQ#18 — clean options, f'(1) = e ─────────────
{
  const d = load("qset-product-rule.json");
  const q = d.mcq[18];
  q.optionA = "$e$";
  q.optionB = "$0$";
  q.optionC = "$2e$";
  q.optionD = "$e + 1$";
  q.correctOption = "A";
  q.solutionContent =
    "**Step 1 (1 mark):** Apply the product rule to $f(x) = x e^x \\ln x$ (viewing it as a product of three factors).\n\n" +
    "$$f'(x) = e^x \\ln x + x e^x \\ln x + x e^x \\cdot \\dfrac{1}{x}$$\n\n" +
    "$$= e^x \\ln x (1 + x) + e^x.$$\n\n" +
    "At $x = 1$, $\\ln 1 = 0$, so the first term vanishes:\n\n" +
    "$$f'(1) = 0 + e^1 = e.$$\n\n" +
    "**Answer: A**";
  save("qset-product-rule.json", d);
}

// ── 11. qset-simultaneous-equations MCQ#14 — replace inconsistent system ─
{
  const d = load("qset-simultaneous-equations.json");
  const q = d.mcq[14];
  q.content = "Solve $x + y + z = 6$, $2x + y = 4$, $y + z = 5$.";
  // Options already include (1,2,3); correctOption is B.
  q.solutionContent =
    "**Step 1 (1 mark):** From the second equation, $y = 4 - 2x$. From the third, $z = 5 - y = 5 - (4 - 2x) = 1 + 2x$. Substitute into the first.\n\n" +
    "$$x + (4 - 2x) + (1 + 2x) = 6,$$\n\n" +
    "$$x + 5 = 6 \\implies x = 1.$$\n\n" +
    "Then $y = 4 - 2 = 2$ and $z = 1 + 2 = 3$. Solution: $(1, 2, 3)$.\n\n" +
    "**Answer: B**";
  save("qset-simultaneous-equations.json", d);
}

// ── 12. qset-simultaneous-equations SA#6 — make 3x3 system consistent ──
{
  const d = load("qset-simultaneous-equations.json");
  const q = d.shortAnswer[6];
  q.content =
    "Solve the system $\\begin{cases} x + y + z = 6 \\\\ 2x - y + z = 3 \\\\ x + 2y - z = 2 \\end{cases}$.";
  q.solutionContent =
    "**Step 1 (1 mark):** Add equations (1) and (3).\n\n" +
    "$$(x + y + z) + (x + 2y - z) = 6 + 2,$$\n\n" +
    "$$2x + 3y = 8. \\quad (\\text{i})$$\n\n" +
    "**Step 2 (1 mark):** Subtract (1) from (2).\n\n" +
    "$$x - 2y = -3. \\quad (\\text{ii})$$\n\n" +
    "**Step 3 (1 mark):** Solve (i) and (ii). From (ii), $x = 2y - 3$. Substitute into (i):\n\n" +
    "$$2(2y - 3) + 3y = 8 \\implies 7y = 14 \\implies y = 2, \\; x = 1.$$\n\n" +
    "**Step 4 (1 mark):** Substitute into (1): $z = 6 - x - y = 6 - 1 - 2 = 3$. Solution: $(x, y, z) = (1, 2, 3)$.";
  save("qset-simultaneous-equations.json", d);
}

// ── 13. qset-stationary-points ER#3 — remove "Recompute:" line ──────────
{
  const d = load("qset-stationary-points-and-curve-sketching.json");
  const q = d.extendedResponse[3];
  q.solutionContent = q.solutionContent.replace(
    /\n\nRecompute: \$\(x\^2 - 4x \+ 4\)\(x \+ 1\) = x\^3 \+ x\^2 - 4x\^2 - 4x \+ 4x \+ 4 = x\^3 - 3 x\^2 \+ 4\$\./,
    ""
  );
  save("qset-stationary-points-and-curve-sketching.json", d);
}

// ── 14. qset-tangents-and-normals MCQ#19 — answer is B ─────────────────
{
  const d = load("qset-tangents-and-normals.json");
  const q = d.mcq[19];
  q.correctOption = "B";
  q.solutionContent =
    "**Step 1 (1 mark):** $y' = 2x$, so at $(2, 4)$ the tangent slope is $4$ and the normal slope is $-\\dfrac{1}{4}$.\n\n" +
    "Equation of the normal:\n\n" +
    "$$y - 4 = -\\tfrac{1}{4}(x - 2).$$\n\n" +
    "At $x = 0$:\n\n" +
    "$$y = 4 + \\tfrac{2}{4} = 4 + \\tfrac{1}{2} = \\tfrac{9}{2}.$$\n\n" +
    "So the normal passes through $\\left(0, \\dfrac{9}{2}\\right)$.\n\n" +
    "**Answer: B**";
  save("qset-tangents-and-normals.json", d);
}

// ── 15. qset-trigonometric-equations MCQ#16 — replace option set ─────────
{
  const d = load("qset-trigonometric-equations.json");
  const q = d.mcq[16];
  q.optionA = "$\\dfrac{\\pi}{2}, \\dfrac{7\\pi}{6}, \\dfrac{11\\pi}{6}$";
  q.optionB = "$\\dfrac{\\pi}{2}, \\dfrac{3\\pi}{2}$";
  q.optionC = "$\\dfrac{\\pi}{6}, \\dfrac{3\\pi}{2}$";
  q.optionD = "$\\dfrac{\\pi}{4}, \\dfrac{5\\pi}{4}$";
  q.correctOption = "A";
  q.solutionContent =
    "**Step 1 (1 mark):** Let $u = \\sin x$.\n\n" +
    "$$2u^2 - u - 1 = 0.$$\n\n" +
    "Apply the quadratic formula: $u = \\dfrac{1 \\pm \\sqrt{1 + 8}}{4} = \\dfrac{1 \\pm 3}{4}$, giving $u = 1$ or $u = -\\dfrac{1}{2}$.\n\n" +
    "From $\\sin x = 1$: $x = \\dfrac{\\pi}{2}$.\n\n" +
    "From $\\sin x = -\\dfrac{1}{2}$: $x = \\dfrac{7\\pi}{6}$ or $x = \\dfrac{11\\pi}{6}$.\n\n" +
    "**Answer: A**";
  save("qset-trigonometric-equations.json", d);
}

// ── 16. qset-trigonometric-equations MCQ#18 — 3 solutions, answer B ──────
{
  const d = load("qset-trigonometric-equations.json");
  const q = d.mcq[18];
  q.correctOption = "B";
  q.solutionContent =
    "**Step 1 (1 mark):** Use $\\cos 2x = 1 - 2\\sin^2 x$.\n\n" +
    "$$1 - 2\\sin^2 x = \\sin x,$$\n\n" +
    "$$2\\sin^2 x + \\sin x - 1 = 0.$$\n\n" +
    "Factor: $(2\\sin x - 1)(\\sin x + 1) = 0$.\n\n" +
    "$\\sin x = \\dfrac{1}{2}$ gives $x = \\dfrac{\\pi}{6}$ and $x = \\dfrac{5\\pi}{6}$ (2 solutions).\n\n" +
    "$\\sin x = -1$ gives $x = \\dfrac{3\\pi}{2}$ (1 solution).\n\n" +
    "Total: $3$ solutions.\n\n" +
    "**Answer: B**";
  save("qset-trigonometric-equations.json", d);
}

console.log("\n✅ All 16 audit findings patched.");
