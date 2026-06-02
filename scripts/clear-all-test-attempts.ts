import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient({ log: ["error"] });
async function main() {
  const u = await prisma.user.findFirst({ where: { email: "paulckf@icloud.com" } });
  if (!u) return;
  const r = await prisma.questionSetAttempt.deleteMany({ where: { userId: u.id } });
  console.log(`Deleted ${r.count} attempts for ${u.email}`);
  await prisma.$disconnect();
}
main();
