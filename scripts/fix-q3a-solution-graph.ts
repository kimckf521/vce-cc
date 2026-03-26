import { prisma } from "../lib/prisma";

async function main() {
  const q3a = await prisma.question.findFirst({
    where: { questionNumber: 3, part: "a" },
    include: { solution: true },
  });
  if (!q3a?.solution) { console.log("Q3a solution not found"); return; }

  const graphConfig = {
    fn: "2 + 3/(x - 1)",
    xMin: -4,
    xMax: 4,
    yMin: -6,
    yMax: 6,
    xStart: -4,
    showGrid: false,
    xTicks: [
      { value: -3, label: "-3" },
      { value: -2, label: "-2" },
      { value: -1, label: "-1" },
      { value:  1, label:  "1" },
      { value:  2, label:  "2" },
      { value:  3, label:  "3" },
    ],
    yTicks: [
      { value: -6, label: "-6" },
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
      { value:  6, label:  "6" },
    ],
    asymptotes: [
      { type: "vertical",   value: 1, label: "x=1", labelPos: "bottom" },
      { type: "horizontal", value: 2, label: "y=2", labelPos: "right"  },
    ],
    intercepts: [
      {
        x: -0.5, y: 0,
        label: "(-\u00bd, 0)",
        labelX: -1.8,
        labelY: -3.0,
        useArrow: true,
      },
      {
        x: 0, y: -1,
        label: "(0, -1)",
        labelX: -1.8,
        labelY: -4.5,
        useArrow: true,
      },
    ],
  };

  await prisma.solution.update({
    where: { id: q3a.solution.id },
    data: { imageUrl: `function:${JSON.stringify(graphConfig)}` },
  });

  console.log("✅ Q3a intercept arrows added");
}

main().catch(console.error).finally(() => prisma.$disconnect());
