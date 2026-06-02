/**
 * Show topics + subtopics that exist for Foundation, General, Specialist,
 * so the exam-set generator knows what tags are available.
 */
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient({ log: ["error"] });

async function main() {
  const slugs = ["vce-foundation", "vce-general", "vce-specialist"];
  for (const slug of slugs) {
    const subj = await prisma.subject.findFirst({
      where: { slug },
      include: {
        topics: {
          orderBy: { order: "asc" },
          include: {
            subtopics: { select: { slug: true, name: true } },
          },
        },
      },
    });
    console.log(`\n══ ${subj?.name ?? slug} (${slug}) ══`);
    if (!subj) {
      console.log("  Subject not found");
      continue;
    }
    for (const t of subj.topics) {
      console.log(`  TOPIC ${t.order}. ${t.name} [${t.slug}]`);
      for (const st of t.subtopics) {
        console.log(`    - ${st.name} [${st.slug}]`);
      }
    }
  }
  await prisma.$disconnect();
}

main().catch(async (e) => {
  console.error(e);
  await prisma.$disconnect();
  process.exit(1);
});
