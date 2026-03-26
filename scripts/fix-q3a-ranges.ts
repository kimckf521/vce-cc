import { prisma } from "../lib/prisma";

async function main() {
  const q3a = await prisma.question.findFirst({
    where: { questionNumber: 3, part: "a" },
    include: { solution: true },
  });
  if (!q3a) { console.log("Q3a not found"); return; }

  // Fix question grid: x -3 to 3, y -5 to 5 (matching actual exam paper)
  await prisma.question.update({
    where: { id: q3a.id },
    data: {
      imageUrl: `grid:${JSON.stringify({ xMin: -3, xMax: 3, yMin: -5, yMax: 5 })}`,
    },
  });
  console.log("✅ Q3a question grid fixed: x[-3,3] y[-5,5]");

  // Fix solution graph: f(x) = 2 + 3/(x-1) on same grid
  // Vertical asymptote: x = 1
  // Horizontal asymptote: y = 2
  // x-intercept: (-1/2, 0)
  // y-intercept: (0, -1)
  if (q3a.solution) {
    const graphConfig = {
      fn: "2 + 3/(x - 1)",
      xMin: -3,
      xMax: 3,
      yMin: -5,
      yMax: 5,
      xStart: -3,
      showGrid: true,
      xTicks: [
        { value: -3, label: "-3" },
        { value: -2, label: "-2" },
        { value: -1, label: "-1" },
        { value:  1, label:  "1" },
        { value:  2, label:  "2" },
        { value:  3, label:  "3" },
      ],
      yTicks: [
        { value: -5, label: "-5" },
        { value: -4, label: "-4" },
        { value: -3, label: "-3" },
        { value: -2, label: "-2" },
        { value: -1, label: "-1" },
        { value:  1, label:  "1" },
        { value:  2, label:  "2" },
        { value:  3, label:  "3" },
        { value:  4, label:  "4" },
        { value:  5, label:  "5" },
      ],
      asymptotes: [
        { type: "vertical",   value: 1, label: "x = 1" },
        { type: "horizontal", value: 2, label: "y = 2" },
      ],
      intercepts: [
        { x: -0.5, y: 0,  label: "(-½, 0)"  },
        { x:  0,   y: -1, label: "(0, -1)"  },
      ],
    };

    await prisma.solution.update({
      where: { id: q3a.solution.id },
      data: { imageUrl: `function:${JSON.stringify(graphConfig)}` },
    });
    console.log("✅ Q3a solution graph fixed with correct range + intercepts");
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
