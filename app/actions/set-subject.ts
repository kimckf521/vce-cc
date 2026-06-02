"use server";

import { cookies } from "next/headers";
import { SUBJECT_COOKIE, isKnownSubject } from "@/lib/subject-context";

/**
 * Server Action — persist the user's currently-chosen subject in a cookie.
 *
 * Called by `<SubjectPicker>` whenever the user switches subjects from the
 * sidebar. The cookie is read by `app/(app)/layout.tsx` on subsequent
 * navigations to keep the sidebar / nav highlighted on the correct subject
 * even on user-scoped pages (Dashboard, History, etc.) that don't have a
 * `[subject]/` segment in their URL.
 *
 * One-year max-age — the cookie outlives a typical VCE year so students
 * don't have to re-pick after the holidays.
 */
export async function setSubjectCookie(slug: string): Promise<{ ok: boolean }> {
  if (!isKnownSubject(slug)) {
    return { ok: false };
  }
  const store = await cookies();
  store.set(SUBJECT_COOKIE, slug, {
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
    sameSite: "lax",
    httpOnly: false,
  });
  return { ok: true };
}
