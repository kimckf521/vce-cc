/**
 * Test-injects fake QuestionSetAttempt rows for the preview test user,
 * then prints how many recent items would be excluded by the picker.
 * Run BEFORE re-rendering the practice page to see dedup take effect.
 *
 * Usage:
 *   npm run verify-dedup -- --record <id1> <id2> ...   # insert attempts
 *   npm run verify-dedup -- --recent                   # show recent N
 *   npm run verify-dedup -- --clear                    # remove the fake attempts (only ours)
 */
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient({ log: ["error"] });
const TEST_EMAIL = "paulckf@icloud.com";

async function main() {
  const user = await prisma.user.findFirst({
    where: { email: TEST_EMAIL },
    select: { id: true, email: true },
  });
  if (!user) {
    console.error(`User ${TEST_EMAIL} not found`);
    process.exit(1);
  }
  console.log(`Test user: ${user.email} (${user.id})\n`);

  const args = process.argv.slice(2);
  const mode = args[0];

  if (mode === "--recent") {
    const recent = await prisma.questionSetAttempt.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
      take: 30,
      select: { questionSetItemId: true, status: true, createdAt: true },
    });
    console.log(`Last ${recent.length} attempts:`);
    for (const r of recent.slice(0, 10)) {
      console.log(`  ${r.questionSetItemId}  ${r.status}  ${r.createdAt.toISOString()}`);
    }
    if (recent.length > 10) console.log(`  ... and ${recent.length - 10} more`);
  } else if (mode === "--record") {
    const ids = args.slice(1);
    if (ids.length === 0) {
      console.error("No ids given");
      process.exit(1);
    }
    for (const id of ids) {
      // Upsert so re-running doesn't fail on the unique constraint
      await prisma.questionSetAttempt.upsert({
        where: {
          userId_questionSetItemId: { userId: user.id, questionSetItemId: id },
        },
        create: {
          userId: user.id,
          questionSetItemId: id,
          status: "ATTEMPTED",
        },
        update: {},
      });
    }
    console.log(`Recorded ${ids.length} fake attempts.`);
  } else if (mode === "--clear") {
    const ids = args.slice(1);
    if (ids.length === 0) {
      console.error("Pass the ids to clear");
      process.exit(1);
    }
    const res = await prisma.questionSetAttempt.deleteMany({
      where: { userId: user.id, questionSetItemId: { in: ids } },
    });
    console.log(`Deleted ${res.count} attempt rows.`);
  } else {
    console.log("Usage: --recent | --record <id...> | --clear <id...>");
  }
  await prisma.$disconnect();
}

main().catch(async (e) => {
  console.error(e);
  await prisma.$disconnect();
  process.exit(1);
});
