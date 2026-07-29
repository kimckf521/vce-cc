import { NextResponse } from "next/server";
import { requireAuthenticatedUser, type AuthResult } from "@/lib/auth";
import { isAdminRole } from "@/lib/utils";

/**
 * Returns true if the role may use the teacher assessment-builder area.
 * Mirrors the isAdminRole pattern in lib/utils.ts: TEACHER plus both admin
 * roles. TUTOR is deliberately excluded — it is an affiliate-track marker,
 * not a classroom role (see the Role enum comments in prisma/schema.prisma).
 */
export function isTeacherRole(role: string | null | undefined): boolean {
  return role === "TEACHER" || isAdminRole(role);
}

/**
 * API-route guard for /api/teacher/** — requireAuthenticatedUser plus a role
 * check. Same result contract as {@link requireAuthenticatedUser} so routes
 * keep the familiar pattern:
 *
 *     const auth = await requireTeacher();
 *     if (auth.response) return auth.response;
 *     const { user, dbUser } = auth;
 *
 * Note that admins pass the gate but the T1 routes still scope every query
 * by teacherId === user.id — there is no cross-teacher browsing.
 */
export async function requireTeacher(): Promise<AuthResult> {
  const auth = await requireAuthenticatedUser();
  if (auth.response) return auth;

  if (!isTeacherRole(auth.dbUser.role)) {
    return {
      response: NextResponse.json({ error: "Forbidden" }, { status: 403 }),
    };
  }

  return auth;
}
