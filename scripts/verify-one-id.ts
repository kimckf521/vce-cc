import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient({ log: ["error"] });
async function main() {
  const id = process.argv[2];
  const item = await prisma.questionSetItem.findUnique({
    where: { id },
    select: { id: true, type: true, status: true, questionSetId: true },
  });
  console.log(item);
  await prisma.$disconnect();
}
main();
