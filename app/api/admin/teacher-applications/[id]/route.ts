import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuthenticatedUser } from "@/lib/auth";
import { isAdminRole } from "@/lib/utils";
import { rateLimit } from "@/lib/rate-limit";
import { teacherReviewSchema } from "@/lib/validations";
import { logAdminAction } from "@/lib/admin-audit";
import {
  sendTeacherApprovedEmail,
  sendTeacherRejectedEmail,
} from "@/lib/teacher-emails";

/**
 * PATCH /api/admin/teacher-applications/[id] — approve or reject an
 * application after the manual VIT register cross-check.
 *
 * APPROVE promotes the applicant to TEACHER only from STUDENT or TUTOR —
 * admin roles are never touched, so an admin approving their own test
 * application can't accidentally demote themselves. Approving from
 * PENDING_EMAIL is allowed (admin discretion for applicants who never
 * clicked the link but checked out fine).
 */
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAuthenticatedUser();
  if (auth.response) return auth.response;
  const { dbUser } = auth;

  if (!isAdminRole(dbUser.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const limited = rateLimit(`teacher-review:${dbUser.id}`, {
    maxRequests: 30,
    windowMs: 60_000,
  });
  if (limited) return limited;

  const { id } = await params;
  const body = await req.json().catch(() => null);
  const parsed = teacherReviewSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid input" },
      { status: 400 }
    );
  }
  const { action, note } = parsed.data;

  const application = await prisma.teacherApplication.findUnique({
    where: { id },
    include: { user: { select: { id: true, email: true, role: true } } },
  });
  if (!application) {
    return NextResponse.json({ error: "Application not found" }, { status: 404 });
  }
  if (application.status === "APPROVED" || application.status === "REJECTED") {
    return NextResponse.json(
      { error: `Application is already ${application.status.toLowerCase()}.` },
      { status: 409 }
    );
  }

  const firstName = application.fullName.split(/\s+/)[0] ?? "there";

  if (action === "APPROVE") {
    const promotable =
      application.user.role === "STUDENT" || application.user.role === "TUTOR";
    await prisma.$transaction(async (tx) => {
      await tx.teacherApplication.update({
        where: { id },
        data: { status: "APPROVED", reviewNote: note ?? null },
      });
      if (promotable) {
        await tx.user.update({
          where: { id: application.user.id },
          data: { role: "TEACHER" },
        });
      }
    });
    await logAdminAction({
      actorId: dbUser.id,
      action: "TEACHER_APPLICATION_APPROVE",
      targetType: "TeacherApplication",
      targetId: id,
      summary: `Approved teacher application for ${application.user.email} (${application.applicantType}, VIT ${application.vitNumber})`,
      metadata: { previousRole: application.user.role, promoted: promotable },
    });
    void sendTeacherApprovedEmail({
      to: application.user.email,
      firstName,
    }).catch((err) => console.error("[teacher-review] approve email failed:", err));
    return NextResponse.json({ status: "APPROVED" });
  }

  await prisma.teacherApplication.update({
    where: { id },
    data: { status: "REJECTED", reviewNote: note ?? null },
  });
  await logAdminAction({
    actorId: dbUser.id,
    action: "TEACHER_APPLICATION_REJECT",
    targetType: "TeacherApplication",
    targetId: id,
    summary: `Rejected teacher application for ${application.user.email}${note ? ` — ${note}` : ""}`,
  });
  void sendTeacherRejectedEmail({
    to: application.user.email,
    firstName,
    reason: note,
  }).catch((err) => console.error("[teacher-review] reject email failed:", err));
  return NextResponse.json({ status: "REJECTED" });
}
