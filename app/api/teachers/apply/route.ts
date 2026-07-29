import { randomBytes } from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuthenticatedUser } from "@/lib/auth";
import { isTeacherRole } from "@/lib/teacher-gate";
import { rateLimit } from "@/lib/rate-limit";
import { teacherApplySchema } from "@/lib/validations";
import { scoreApplication } from "@/lib/teacher-application";
import { sendTeacherVerificationEmail } from "@/lib/teacher-emails";
import { SITE_URL } from "@/lib/site";

/**
 * POST /api/teachers/apply — submit (or re-submit) a teacher/tutor account
 * application for the logged-in user.
 *
 * State handling on the one-application-per-user row:
 *   none / REJECTED   → (re)create as PENDING_EMAIL with a fresh token
 *   PENDING_EMAIL     → update fields, fresh token, resend the email
 *   PENDING_REVIEW    → already verified & queued — reject edits (409) so the
 *                       reviewed snapshot can't drift under the admin
 *   APPROVED          → 409 (nothing to apply for)
 */
export async function POST(req: NextRequest) {
  const auth = await requireAuthenticatedUser();
  if (auth.response) return auth.response;
  const { user, dbUser } = auth;

  const limited = rateLimit(`teacher-apply:${user.id}`, {
    maxRequests: 5,
    windowMs: 10 * 60_000,
  });
  if (limited) return limited;

  if (isTeacherRole(dbUser.role)) {
    return NextResponse.json(
      { error: "This account already has teacher access." },
      { status: 409 }
    );
  }

  const body = await req.json().catch(() => null);
  const parsed = teacherApplySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid input" },
      { status: 400 }
    );
  }
  const data = parsed.data;

  const existing = await prisma.teacherApplication.findUnique({
    where: { userId: user.id },
    select: { status: true },
  });
  if (existing?.status === "APPROVED") {
    return NextResponse.json(
      { error: "Your application is already approved." },
      { status: 409 }
    );
  }
  if (existing?.status === "PENDING_REVIEW") {
    return NextResponse.json(
      { error: "Your application is already under review — we'll email you soon." },
      { status: 409 }
    );
  }

  const score = scoreApplication(data.fullName, data.schoolEmail);
  const emailToken = randomBytes(24).toString("base64url");

  const fields = {
    applicantType: data.applicantType,
    fullName: data.fullName,
    schoolName: data.applicantType === "SCHOOL_TEACHER" ? (data.schoolName ?? null) : null,
    schoolEmail: data.schoolEmail,
    vitNumber: data.vitNumber,
    abn: data.abn ?? null,
    status: "PENDING_EMAIL" as const,
    emailToken,
    emailVerifiedAt: null,
    domainTier: score.domainTier,
    nameMatch: score.nameMatch,
    gradYearFlag: score.gradYearFlag,
    reviewNote: null,
  };

  await prisma.teacherApplication.upsert({
    where: { userId: user.id },
    create: { userId: user.id, ...fields },
    update: fields,
  });

  const verifyUrl = `${SITE_URL}/teachers/verify?token=${emailToken}`;
  const firstName = data.fullName.split(/\s+/)[0] ?? "there";
  const sent = await sendTeacherVerificationEmail({
    to: data.schoolEmail,
    firstName,
    verifyUrl,
  });
  if (!sent.ok) {
    // Keep the application row (the user can re-submit to retry the email)
    // but surface the failure honestly instead of a silent dead end.
    return NextResponse.json(
      { error: "We couldn't send the verification email. Please try again." },
      { status: 502 }
    );
  }

  return NextResponse.json({ status: "PENDING_EMAIL" }, { status: 201 });
}
