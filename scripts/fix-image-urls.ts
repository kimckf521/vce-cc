import { prisma } from "../lib/prisma";

async function main() {
  // Find Q3a and Q8a
  const questions = await prisma.question.findMany({
    where: { OR: [{ questionNumber: 3 }, { questionNumber: 8 }] },
    select: { id: true, questionNumber: true, part: true, imageUrl: true },
  });
  console.log("Current state:", JSON.stringify(questions, null, 2));

  // Fix Q3a: grid x:-4 to 4, y:-6 to 6
  const q3a = questions.find((q) => q.questionNumber === 3 && q.part === "a");
  if (q3a) {
    await prisma.question.update({
      where: { id: q3a.id },
      data: { imageUrl: 'grid:{"xMin":-4,"xMax":4,"yMin":-6,"yMax":6}' },
    });
    console.log("✅ Updated Q3a grid config");
  }

  // Fix Q8a: function graph f(x) = -4x*ln(x) for 0 < x ≤ 1
  const q8a = questions.find((q) => q.questionNumber === 8 && q.part === "a");
  if (q8a) {
    await prisma.question.update({
      where: { id: q8a.id },
      data: {
        imageUrl: 'function:{"fn":"-4*x*Math.log(x)","xMin":0.001,"xMax":1,"yMin":0,"yMax":1.5,"label":"f(x) = -4x log_e(x)"}',
      },
    });
    console.log("✅ Updated Q8a function graph config");
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
