import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

/**
 * OAuth / magic-link / email-confirmation landing.
 *
 * Exchanges the auth `code` for a session, then hands off to `/auth/finish`
 * (a tiny client page) which POSTs `/api/auth/sync-user`. That endpoint is the
 * single source of provisioning truth — it upserts the user, grants FREE
 * enrolments for every maths subject, attributes the `ref_code` referral
 * cookie, sets the `vce_sid` single-session cookie, and emails support on a
 * first registration. Routing every provider through it means a Google /
 * magic-link signup gets an identical first run to a password signup.
 *
 * Password-reset links (`type=recovery`) skip provisioning and go straight to
 * the set-new-password screen.
 */
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");

  // Only honour internal, non-protocol-relative redirect targets (no open redirect).
  const nextParam = searchParams.get("next");
  const next =
    nextParam && nextParam.startsWith("/") && !nextParam.startsWith("//")
      ? nextParam
      : "/dashboard";

  if (code) {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error && data.user) {
      if (searchParams.get("type") === "recovery") {
        return NextResponse.redirect(`${origin}/reset-password`);
      }
      return NextResponse.redirect(
        `${origin}/auth/finish?next=${encodeURIComponent(next)}`,
      );
    }
  }

  return NextResponse.redirect(`${origin}/login?error=auth`);
}
