import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient({ log: ["error"] });
const ids = process.argv.slice(2);
(async () => {
  for (const id of ids) {
    const it = await prisma.questionSetItem.findUnique({
      where: { id },
      select: { id: true, type: true, correctOption: true, solutionContent: true },
    });
    if (!it) continue;
    console.log(`── ${id} (${it.type}) correctOption=${it.correctOption} ──`);
    console.log(`Solution: ${(it.solutionContent ?? "").slice(0, 200)}`);
    console.log();
  }
  await prisma.$disconnect();
})();
