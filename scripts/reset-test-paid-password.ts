/**
 * One-shot script to reset the password for test-paid-1@example.com.
 *
 * Usage:
 *   npx tsx --env-file=.env.local scripts/reset-test-paid-password.ts
 */
import { createClient } from "@supabase/supabase-js";

const EMAIL = "test-paid-1@example.com";
const NEW_PASSWORD = "TestPaid123!";

const SUPABASE_URL =
  process.env.NEXT_PUBLIC_SUPABASE_URL ?? process.env.SUPABASE_URL;
const SERVICE_KEY =
  process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.SUPABASE_SERVICE_KEY;

if (!SUPABASE_URL || !SERVICE_KEY) {
  console.error(
    "Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local"
  );
  process.exit(1);
}

async function main() {
  const supabase = createClient(SUPABASE_URL!, SERVICE_KEY!);

  // Find the auth user by email — listUsers paginates, but for our small
  // dev DB the first page is enough.
  const { data: list, error: listErr } = await supabase.auth.admin.listUsers({
    page: 1,
    perPage: 1000,
  });
  if (listErr) {
    console.error("Failed to list users:", listErr.message);
    process.exit(1);
  }

  const user = list.users.find((u) => u.email === EMAIL);
  if (!user) {
    console.error(`No auth user found with email ${EMAIL}`);
    process.exit(1);
  }

  const { error: updateErr } = await supabase.auth.admin.updateUserById(
    user.id,
    { password: NEW_PASSWORD }
  );
  if (updateErr) {
    console.error("Failed to update password:", updateErr.message);
    process.exit(1);
  }

  console.log(`Password reset for ${EMAIL} (${user.id})`);
  console.log(`New login: ${EMAIL} / ${NEW_PASSWORD}`);
}

main();
