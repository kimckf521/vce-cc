import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient({ log: ["error"] });
async function main() {
  const userId = "9309c6d3-2560-4ffb-9ab9-7f6b3b7b8c81";
  const u = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, email: true },
  });
  console.log("User row in Prisma:", u);
  // Also count existing attempts for this user (sanity)
  const cnt = await prisma.questionSetAttempt.count({ where: { userId } });
  console.log("Existing attempts:", cnt);
  await prisma.$disconnect();
}
main();
