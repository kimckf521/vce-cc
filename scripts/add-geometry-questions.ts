/**
 * Replace 4 algebra-only items in "Questions Set testing" with
 * geometric word problems that lead to polynomial equations.
 *
 * Polynomial Equations doesn't accommodate pure geometry, but it does
 * accommodate problems whose geometric setup produces a quadratic or
 * cubic — that's the natural way to add a "geometry flavour" here.
 *
 *   MCQ order 8  : (x-1)^2(x+3)=0          → rectangle area (quadratic)
 *   MCQ order 17 : factor x^3-3x+2          → box volume (cubic)
 *   MCQ order 19 : third root via Vieta     → Pythagorean triangle (quadratic)
 *   SA  order 21 : x^3-x^2-6x=0             → open box from cardboard (cubic)
 */

import { prisma } from "../lib/prisma";

interface Replacement {
  order: number;
  type: "MCQ" | "SHORT_ANSWER";
  data: {
    content: string;
    optionA?: string;
    optionB?: string;
    optionC?: string;
    optionD?: string;
    correctOption?: "A" | "B" | "C" | "D";
    marks: number;
    difficulty: "EASY" | "MEDIUM" | "HARD";
    solutionContent: string;
  };
}

const replacements: Replacement[] = [
  // ─── MCQ order 8 — Rectangle area (quadratic) ───
  {
    order: 8,
    type: "MCQ",
    data: {
      content:
        "A rectangle has length $3$ cm more than its width and an area of $40$ cm$^2$. The width of the rectangle, in cm, is:",
      optionA: "$4$",
      optionB: "$5$",
      optionC: "$6$",
      optionD: "$8$",
      correctOption: "B",
      marks: 1,
      difficulty: "EASY",
      solutionContent:
        "**Step 1 (1 mark):** Set up the polynomial equation.\n\nLet the width be $w$ cm; then the length is $(w + 3)$ cm. The area equation is\n\n$$w(w + 3) = 40$$\n\n$$w^2 + 3w - 40 = 0$$\n\n$$(w - 5)(w + 8) = 0.$$\n\nSince $w > 0$, $w = 5$ cm.\n\n**Answer: B**",
    },
  },
  // ─── MCQ order 17 — Box volume (cubic) ───
  {
    order: 17,
    type: "MCQ",
    data: {
      content:
        "A rectangular box has a square base of side $x$ cm, a height of $(x + 1)$ cm, and a volume of $80$ cm$^3$. The value of $x$ is:",
      optionA: "$3$",
      optionB: "$4$",
      optionC: "$5$",
      optionD: "$6$",
      correctOption: "B",
      marks: 1,
      difficulty: "MEDIUM",
      solutionContent:
        "**Step 1 (1 mark):** Set up the cubic equation and find the integer root.\n\nThe volume equation is\n\n$$x^2(x + 1) = 80$$\n\n$$x^3 + x^2 - 80 = 0.$$\n\nTest $x = 4$:\n\n$$64 + 16 - 80 = 0. \\checkmark$$\n\nSo $x = 4$ cm.\n\n**Answer: B**",
    },
  },
  // ─── MCQ order 19 — Pythagorean triangle (quadratic) ───
  {
    order: 19,
    type: "MCQ",
    data: {
      content:
        "A right-angled triangle has legs of length $x$ cm and $(x + 7)$ cm and a hypotenuse of length $13$ cm. The length of the shorter leg, in cm, is:",
      optionA: "$4$",
      optionB: "$5$",
      optionC: "$6$",
      optionD: "$12$",
      correctOption: "B",
      marks: 1,
      difficulty: "MEDIUM",
      solutionContent:
        "**Step 1 (1 mark):** Apply Pythagoras' theorem and solve.\n\n$$x^2 + (x + 7)^2 = 13^2$$\n\n$$2x^2 + 14x + 49 = 169$$\n\n$$x^2 + 7x - 60 = 0$$\n\n$$(x - 5)(x + 12) = 0.$$\n\nSince $x > 0$, the shorter leg is $x = 5$ cm.\n\n**Answer: B**",
    },
  },
  // ─── SA order 21 — Open box from cardboard (cubic) ───
  {
    order: 21,
    type: "SHORT_ANSWER",
    data: {
      content:
        "A square sheet of cardboard with side length $10$ cm has a square of side $x$ cm cut from each corner, and the resulting flaps are folded up to form an open box of volume $V(x) = x(10 - 2x)^2$ cm$^3$.\n\nFind the value of $x$, with $0 < x < 5$, for which $V(x) = 48$.",
      marks: 2,
      difficulty: "MEDIUM",
      solutionContent:
        "**Step 1 (1 mark):** Set up the cubic equation.\n\n$$x(10 - 2x)^2 = 48.$$\n\nExpand:\n\n$$x(100 - 40x + 4x^2) = 48$$\n\n$$4x^3 - 40x^2 + 100x - 48 = 0$$\n\n$$x^3 - 10x^2 + 25x - 12 = 0.$$\n\n**Step 2 (1 mark):** Test $x = 3$:\n\n$$27 - 90 + 75 - 12 = 0. \\checkmark$$\n\nSince $0 < 3 < 5$, the required value is $x = 3$ cm.",
    },
  },
];

async function main() {
  const set = await prisma.questionSet.findFirst({
    where: { name: "Questions Set testing" },
  });
  if (!set) throw new Error("Question set not found");

  for (const r of replacements) {
    const item = await prisma.questionSetItem.findFirst({
      where: { questionSetId: set.id, type: r.type, order: r.order },
    });
    if (!item) {
      console.warn(`⚠️  No ${r.type} item at order=${r.order}`);
      continue;
    }
    await prisma.questionSetItem.update({
      where: { id: item.id },
      data: r.data,
    });
    console.log(`✅ ${r.type} order=${r.order} → geometry`);
  }

  console.log(`\n🎉 Replaced ${replacements.length} items with geometric word problems`);
  await prisma.$disconnect();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
