import { NextResponse, type NextRequest } from "next/server";
import { randomUUID } from "crypto";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { ensureMathMethodsSubject, ensureFreeEnrolment } from "@/lib/subscription";
import { syncUserSchema } from "@/lib/validations";
import { SESSION_COOKIE, sessionCookieOptions } from "@/lib/session";
import { isAdminRole } from "@/lib/utils";

// Cookie set by /signup?ref=CODE to persist the referral code across the
// email-confirmation flow. Read here as a fallback when the body doesn't
// include one (e.g. user logging in after confirming their email).
const REFERRAL_COOKIE = "ref_code";

// Called after signup/login to ensure a User row exists in our DB
// and that the user has a FREE enrolment for Mathematical Methods so
// gating logic always has something to read.
//
// Optionally accepts a referral code in the request body. If present and the
// code matches an approved active affiliate, a Referral record is created in
// PENDING status. The referral converts when the user makes their first paid
// subscription payment (handled in the Stripe webhook).
export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  // Parse optional referral code from body. We're tolerant of missing/empty body.
  let referralCode: string | undefined;
  try {
    const text = await request.text();
    if (text) {
      const parsed = syncUserSchema.parse(JSON.parse(text));
      referralCode = parsed.referralCode;
    }
  } catch {
    // Ignore body parse errors — referral code is optional
  }

  // Fallback: read the cookie set by /signup?ref=CODE. This handles the
  // email-confirmation flow where the user lands here from /login (not /signup)
  // and the body doesn't include a referralCode.
  if (!referralCode) {
    const cookieValue = request.cookies.get(REFERRAL_COOKIE)?.value;
    if (cookieValue) {
      try {
        referralCode = decodeURIComponent(cookieValue).trim();
      } catch {
        // Bad cookie value — ignore
      }
    }
  }

  // Resolve the referring affiliate (if any) before creating the user.
  let referringAffiliateId: string | null = null;
  if (referralCode) {
    const affiliate = await prisma.affiliate.findUnique({
      where: { referralCode },
      select: { id: true, userId: true, approved: true, active: true },
    });
    // Only attribute if the affiliate is approved+active and isn't self-referring
    if (affiliate && affiliate.approved && affiliate.active && affiliate.userId !== user.id) {
      referringAffiliateId = affiliate.id;
    }
  }

  // Look up the existing row (if any) to decide whether to rotate the
  // single-active-session ID. Admins and super admins are exempt — they may
  // log in on multiple devices, so we don't rotate their activeSessionId and
  // instead clear it to null so the layout/API mismatch checks always skip.
  const existing = await prisma.user.findUnique({
    where: { id: user.id },
    select: { role: true },
  });
  const isAdmin = isAdminRole(existing?.role);

  // Non-admins get a fresh session ID that invalidates any other browser
  // currently logged into the same account.
  const newSessionId = isAdmin ? null : randomUUID();

  // Upsert the user. Only set referredByCode on first creation — never overwrite.
  const dbUser = await prisma.user.upsert({
    where: { id: user.id },
    update: { activeSessionId: newSessionId },
    create: {
      id: user.id,
      email: user.email!,
      name: user.user_metadata?.name ?? null,
      referredByCode: referringAffiliateId ? referralCode : null,
      activeSessionId: newSessionId,
    },
    select: { id: true, referredByCode: true },
  });

  // Create the Referral record once, only if this is a fresh attribution
  // (i.e. the user was just created with a referredByCode AND no referral exists yet).
  if (referringAffiliateId && dbUser.referredByCode === referralCode) {
    const existing = await prisma.referral.findUnique({
      where: { referredUserId: user.id },
      select: { id: true },
    });
    if (!existing) {
      await prisma.referral.create({
        data: {
          affiliateId: referringAffiliateId,
          referredUserId: user.id,
          status: "PENDING",
        },
      });
    }
  }

  // Make sure the Methods subject exists, then give the user a FREE enrolment
  // (idempotent — won't downgrade an existing PAID enrolment).
  await ensureMathMethodsSubject();
  await ensureFreeEnrolment(user.id);

  const response = NextResponse.json({ ok: true });
  if (newSessionId) {
    // Only set the single-session cookie for non-admin users; admins are
    // exempt from single-active-session enforcement.
    response.cookies.set(SESSION_COOKIE, newSessionId, sessionCookieOptions);
  } else {
    // Admin login — clear any stale cookie from a previous non-admin session
    // (e.g. a student who was just promoted to admin).
    response.cookies.delete(SESSION_COOKIE);
  }

  // Clear the referral cookie once we've processed it (whether attribution
  // succeeded or the affiliate was invalid — either way, don't try again).
  if (request.cookies.get(REFERRAL_COOKIE)) {
    response.cookies.delete(REFERRAL_COOKIE);
  }
  return response;
}
