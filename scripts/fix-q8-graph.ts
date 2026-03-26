import { prisma } from "../lib/prisma";

async function main() {
  const q8a = await prisma.question.findFirst({
    where: { questionNumber: 8, part: "a" },
  });
  if (!q8a) { console.log("Q8a not found"); return; }

  const graphConfig = {
    fn: "-4*x*Math.log(x)",
    xMin: 0,
    xMax: 1.15,
    yMin: 0,
    yMax: 1.5,
    xStart: 0.001,
    showGrid: false,
    xTicks: [
      { value: 0,      label: "0" },
      { value: 1/Math.E, label: "1", subLabel: "e" },
      { value: 1,      label: "1" },
    ],
    yTicks: [],
  };

  await prisma.question.update({
    where: { id: q8a.id },
    data: { imageUrl: `function:${JSON.stringify(graphConfig)}` },
  });

  console.log("✅ Q8a graph config updated");
}

main().catch(console.error).finally(() => prisma.$disconnect());
