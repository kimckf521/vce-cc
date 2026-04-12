// One-off helper to create (or reset) a confirmed free-tier test user via the
// Supabase admin API. Idempotent: if the user exists, only the password and
// confirmation status are updated.
import { createClient } from "@supabase/supabase-js";
import { prisma } from "../lib/prisma";
import { ensureMathMethodsSubject, ensureFreeEnrolment } from "../lib/subscription";

const EMAIL = "freetiertest@vcemethods.local";
const PASSWORD = "TestPassword123!";
const NAME = "Free Test User";

const admin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
);

async function main() {
  // Look up by email via list (admin API has no direct getByEmail)
  const { data: list, error: listErr } = await admin.auth.admin.listUsers();
  if (listErr) throw listErr;
  const existing = list.users.find((u) => u.email === EMAIL);

  let userId: string;
  if (existing) {
    const { error } = await admin.auth.admin.updateUserById(existing.id, {
      password: PASSWORD,
      email_confirm: true,
    });
    if (error) throw error;
    userId = existing.id;
    console.log(`Updated existing user ${EMAIL} (${userId})`);
  } else {
    const { data, error } = await admin.auth.admin.createUser({
      email: EMAIL,
      password: PASSWORD,
      email_confirm: true,
      user_metadata: { name: NAME },
    });
    if (error) throw error;
    userId = data.user!.id;
    console.log(`Created user ${EMAIL} (${userId})`);
  }

  // Mirror what /api/auth/sync-user does on first login
  await prisma.user.upsert({
    where: { id: userId },
    update: { name: NAME },
    create: { id: userId, email: EMAIL, name: NAME, role: "STUDENT" },
  });
  await ensureMathMethodsSubject();
  await ensureFreeEnrolment(userId);

  console.log(`Done. Login: ${EMAIL} / ${PASSWORD}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
