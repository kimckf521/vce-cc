/**
 * One-off announcement: tell existing PAID subscribers that their
 * subscription now unlocks all 4 VCE Maths subjects (post-B1 migration).
 * Copy, audience and test-account exclusions are documented in
 * docs/email-vce-maths-upgrade.md — the rendered copy itself lives in
 * lib/billing-emails.ts (renderVceMathsUpgradeEmail).
 *
 * Audience: every user with at least one PAID SubjectEnrolment, deduped by
 * user (after the sibling-enrolment migration each payer holds 4 PAID rows —
 * one per maths subject). Known test accounts are excluded.
 *
 * Default: DRY RUN — prints the exact recipient list and the rendered email
 * for each recipient. Nothing is sent.
 * Pass --execute to actually send. Review the dry-run output first.
 *
 * Usage:
 *   npx tsx --env-file=.env.local scripts/send-vce-maths-upgrade-email.ts
 *   npx tsx --env-file=.env.local scripts/send-vce-maths-upgrade-email.ts --execute
 *
 * (Deliberately not registered as an npm script — this is a one-off send;
 * run it via npx tsx as above.)
 */

import { prisma } from "../lib/prisma";
import {
  renderVceMathsUpgradeEmail,
  sendVceMathsUpgradeEmail,
} from "../lib/billing-emails";

// Test accounts that must never receive the announcement — from the sending
// notes in docs/email-vce-maths-upgrade.md.
const TEST_ACCOUNT_EMAILS = new Set([
  "freetiertest@vcemethods.local",
  "test-paid-1@example.com",
]);

// Defensive net on top of the explicit list: anything on an obviously
// non-deliverable test domain gets skipped too.
function isTestAccount(email: string): boolean {
  const lower = email.toLowerCase();
  return (
    TEST_ACCOUNT_EMAILS.has(lower) ||
    lower.endsWith("@example.com") ||
    lower.endsWith(".local")
  );
}

/** First word of User.name, falling back to "there" (per the doc's notes). */
function firstNameOf(name: string | null): string {
  return name?.trim().split(/\s+/)[0] || "there";
}

const execute = process.argv.includes("--execute");
const mode = execute ? "EXECUTE" : "DRY RUN";

async function main() {
  console.log(`\n📧 VCE Maths upgrade announcement (${mode})\n`);

  // Every PAID enrolment joined to its user. Post-migration each paying user
  // has PAID rows on all 4 maths subjects, so dedupe by user id below.
  const paidEnrolments = await prisma.subjectEnrolment.findMany({
    where: { tier: "PAID" },
    select: {
      user: { select: { id: true, email: true, name: true } },
      subject: { select: { slug: true } },
    },
  });

  const byUser = new Map<
    string,
    { email: string; name: string | null; subjects: string[] }
  >();
  for (const enrolment of paidEnrolments) {
    const entry = byUser.get(enrolment.user.id);
    if (entry) {
      entry.subjects.push(enrolment.subject.slug);
    } else {
      byUser.set(enrolment.user.id, {
        email: enrolment.user.email,
        name: enrolment.user.name,
        subjects: [enrolment.subject.slug],
      });
    }
  }

  const allUsers = [...byUser.values()].sort((a, b) =>
    a.email.localeCompare(b.email)
  );
  const testAccounts = allUsers.filter((u) => isTestAccount(u.email));
  const recipients = allUsers.filter((u) => !isTestAccount(u.email));

  console.log(`PAID enrolment rows:   ${paidEnrolments.length}`);
  console.log(`Unique PAID users:     ${allUsers.length}`);
  console.log(`Test accounts skipped: ${testAccounts.length}`);
  for (const u of testAccounts) console.log(`  ⏭️  ${u.email}`);

  console.log(`\nRecipients (${recipients.length}):`);
  for (const u of recipients) {
    console.log(
      `  ✉️  ${u.email} — firstName "${firstNameOf(u.name)}" — PAID on: ${u.subjects.join(", ")}`
    );
  }

  if (recipients.length === 0) {
    console.log(`\n✅ Nothing to send.`);
    await prisma.$disconnect();
    return;
  }

  if (!execute) {
    // Dry run — print exactly what each recipient would receive.
    for (const u of recipients) {
      const { subject, text } = renderVceMathsUpgradeEmail({
        firstName: firstNameOf(u.name),
      });
      console.log(`\n${"─".repeat(60)}`);
      console.log(`To:      ${u.email}`);
      console.log(`Subject: ${subject}`);
      console.log("─".repeat(60));
      console.log(text);
    }
    console.log(`\nℹ️  This was a DRY RUN — nothing was sent.`);
    console.log(`   Re-run with --execute to send for real.`);
    await prisma.$disconnect();
    return;
  }

  // EXECUTE — one email per recipient, logging success/failure per user.
  let sent = 0;
  let failed = 0;
  for (const u of recipients) {
    const result = await sendVceMathsUpgradeEmail({
      to: u.email,
      firstName: firstNameOf(u.name),
    });
    if (result.ok) {
      sent++;
      console.log(`  ✅ ${u.email} (Resend id: ${result.id ?? "n/a"})`);
    } else {
      failed++;
      console.error(`  ❌ ${u.email}: ${result.error}`);
    }
  }

  console.log(
    `\n📊 Summary: ${sent} sent, ${failed} failed, ${testAccounts.length} test account(s) skipped.`
  );

  await prisma.$disconnect();
  if (failed > 0) process.exit(1);
}

main().catch(async (err) => {
  console.error(err);
  await prisma.$disconnect();
  process.exit(1);
});
