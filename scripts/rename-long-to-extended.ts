/**
 * One-shot migration: rename the QuestionSetItemType enum value
 * LONG_RESPONSE → EXTENDED_RESPONSE in Postgres.
 *
 * Uses ALTER TYPE … RENAME VALUE so existing rows automatically point to
 * the new name — no data backfill required.
 *
 * Run once with `npx tsx scripts/rename-long-to-extended.ts`, then run
 * `npx prisma generate` to refresh the client.
 */

import { prisma } from "../lib/prisma";

async function main() {
  // Detect current enum values so the script is idempotent.
  const rows = await prisma.$queryRaw<{ enumlabel: string }[]>`
    SELECT e.enumlabel
    FROM pg_enum e
    JOIN pg_type t ON e.enumtypid = t.oid
    WHERE t.typname = 'QuestionSetItemType';
  `;
  const labels = rows.map((r) => r.enumlabel);
  console.log("Current enum values:", labels);

  if (labels.includes("EXTENDED_RESPONSE")) {
    console.log("✅ EXTENDED_RESPONSE already present — nothing to do.");
    await prisma.$disconnect();
    return;
  }
  if (!labels.includes("LONG_RESPONSE")) {
    throw new Error("Neither LONG_RESPONSE nor EXTENDED_RESPONSE found.");
  }

  await prisma.$executeRawUnsafe(
    `ALTER TYPE "QuestionSetItemType" RENAME VALUE 'LONG_RESPONSE' TO 'EXTENDED_RESPONSE';`
  );
  console.log("✅ Renamed LONG_RESPONSE → EXTENDED_RESPONSE");
  await prisma.$disconnect();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
