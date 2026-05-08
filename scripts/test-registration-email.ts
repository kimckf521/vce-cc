/**
 * Manual test for the new-registration email notification.
 *
 * Constructs the same payload that /api/auth/sync-user sends when a brand-new
 * user signs up, and dispatches it via the shared sendEmail helper. Used to
 * verify Resend credentials and the support inbox routing without needing to
 * actually create a fresh user account.
 *
 * Run:  npx tsx scripts/test-registration-email.ts
 */

// Run with `npx tsx --env-file=.env.local scripts/test-registration-email.ts`
// (the --env-file flag handles env loading, no dotenv import needed).
import { sendEmail } from "../lib/email";

const ADMIN_NOTIFY_EMAIL = "support@atarhero.com.au";

async function main() {
  const fakeUserId = "test-user-" + Math.random().toString(36).slice(2, 10);
  const fakeUserEmail = "test-registration@example.com";
  const fakeUserName = "Test Registration User";

  const lines = [
    "A new user has just registered on ATAR Hero.",
    "",
    `Name:  ${fakeUserName}`,
    `Email: ${fakeUserEmail}`,
    `User ID: ${fakeUserId}`,
    "Referral code: (none)",
    `Registered at: ${new Date().toISOString()}`,
    "",
    "— This is a TEST email triggered manually via scripts/test-registration-email.ts —",
  ];

  const result = await sendEmail({
    to: ADMIN_NOTIFY_EMAIL,
    subject: `[ATAR Hero] [TEST] New registration — ${fakeUserEmail}`,
    text: lines.join("\n"),
    replyTo: fakeUserEmail,
  });

  if (result.ok) {
    console.log("✅ Test email accepted by Resend.");
    console.log("   id:", result.id ?? "(no id — dev fallback log used)");
    console.log("   to:", ADMIN_NOTIFY_EMAIL);
    console.log("\nCheck the inbox for support@atarhero.com.au.");
  } else {
    console.error("❌ Test email failed:", result.error);
    process.exit(1);
  }
}

main().catch((err) => {
  console.error("Unexpected error:", err);
  process.exit(1);
});
