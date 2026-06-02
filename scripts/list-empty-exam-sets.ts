/**
 * Identify which empty "1st Generated Exam Set" row belongs to which subject,
 * so the generation script knows where to insert each subject's items.
 */
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient({ log: ["error"] });

async function main() {
  const sets = await prisma.questionSet.findMany({
    where: { name: "1st Generated Exam Set" },
    select: {
      id: true,
      name: true,
      isDefault: true,
      subject: { select: { slug: true, name: true } },
      _count: { select: { items: true } },
    },
  });
  for (const s of sets) {
    console.log(
      `${s.id}  items=${s._count.items.toString().padStart(3)}  default=${s.isDefault ? "Y" : "N"}  subject=${s.subject?.slug ?? "null"} (${s.subject?.name ?? "—"})`,
    );
  }
  await prisma.$disconnect();
}

main().catch(async (e) => {
  console.error(e);
  await prisma.$disconnect();
  process.exit(1);
});
