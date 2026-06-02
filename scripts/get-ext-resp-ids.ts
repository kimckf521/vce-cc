import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient({ log: ["error"] });
async function main() {
  const set = await prisma.questionSet.findFirst({
    where: { isDefault: true },
    select: { id: true },
  });
  if (!set) return;
  const items = await prisma.questionSetItem.findMany({
    where: {
      questionSetId: set.id,
      status: "APPROVED",
      type: "EXTENDED_RESPONSE",
    },
    select: { id: true },
    take: 26,
  });
  console.log(items.map((i) => i.id).join(" "));
  await prisma.$disconnect();
}
main();
