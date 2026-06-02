"use server";

import { cookies } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { isKnownSubject } from "@/lib/subject-context";

// Cookie name mirroring the user's "which subjects are you studying?"
// selection. The account field `User.studyingSubjects` is the source of truth;
// this cookie is a fast/logged-out fallback that the onboarding pre-fill reads
// (app/welcome/page.tsx). Comma-separated list of URL subject slugs
// (e.g. "methods,specialist").
//
// Kept local — "use server" files can only export async functions. When a
// reader also needs this name, move it to its own non-"use server" module.
const STUDYING_COOKIE = "vce_studying";

/**
 * Server Action — persist the student's registered ("studying") maths
 * subjects. Writes `User.studyingSubjects` (source of truth, follows the
 * student across devices and drives the subject switcher) and mirrors the
 * selection into the `vce_studying` cookie.
 *
 * Called by the Welcome onboarding form and the Profile → Subjects editor.
 * Display preference only — never touches enrolment / billing / access. The
 * Profile UI enforces "at least one" before calling; onboarding may pass an
 * empty list, which reads back as "all subjects" in the switcher.
 *
 * Returns `ok: false` when signed in but the account write failed, so the
 * Profile editor can surface a real error; the cookie is always written first.
 * One-year cookie max-age — long enough to outlast a typical VCE year.
 */
export async function saveStudyingSubjects(
  slugs: string[]
): Promise<{ ok: boolean }> {
  // Validate against known slugs and de-duplicate, preserving order.
  const valid = Array.from(new Set(slugs.filter(isKnownSubject)));

  const store = await cookies();
  store.set(STUDYING_COOKIE, valid.join(","), {
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
    sameSite: "lax",
    httpOnly: false,
  });

  // Persist to the account when signed in. Onboarding ignores the return
  // value (it proceeds to checkout regardless); the Profile editor checks it.
  let ok = true;
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (user) {
      await prisma.user.update({
        where: { id: user.id },
        data: { studyingSubjects: valid },
      });
    }
  } catch {
    ok = false;
  }

  return { ok };
}
