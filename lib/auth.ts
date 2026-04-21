import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { SESSION_COOKIE } from "@/lib/session";
import { isAdminRole } from "@/lib/utils";

/**
 * Result of {@link requireAuthenticatedUser}. Either:
 *   - `{ user, dbUser }` — caller is authenticated and the browser holds the
 *     currently-active session for this user.
 *   - `{ response }`    — caller should return this NextResponse immediately
 *     (401 with a "session-expired" reason the client can use to redirect).
 */
export type AuthResult =
  | {
      user: { id: string; email: string | null };
      dbUser: { id: string; role: string };
      response?: never;
    }
  | { response: NextResponse; user?: never; dbUser?: never };

/**
 * API-route auth guard. Verifies that:
 *   1. Supabase has a valid auth cookie for the caller.
 *   2. The browser's `vce_sid` cookie matches `User.activeSessionId` in the
 *      DB — i.e. this browser has not been superseded by a newer login on
 *      another device.
 *
 * On failure returns a NextResponse with status 401 and `{ error, reason }`
 * in the body. `reason: "other-device"` is set specifically when the browser
 * has been kicked by a single-active-session mismatch; clients can use this
 * to show the "signed in elsewhere" message and redirect to /login.
 *
 * Usage pattern:
 *
 *     const auth = await requireAuthenticatedUser();
 *     if (auth.response) return auth.response;
 *     const { user, dbUser } = auth;
 *     // …
 */
export async function requireAuthenticatedUser(): Promise<AuthResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      response: NextResponse.json(
        { error: "Unauthorized", reason: "no-session" },
        { status: 401 }
      ),
    };
  }

  const dbUser = await prisma.user.findUnique({
    where: { id: user.id },
    select: { id: true, role: true, activeSessionId: true },
  });

  if (!dbUser) {
    // User row missing — likely a race between auth signup and user row
    // creation. Treat as unauthenticated.
    return {
      response: NextResponse.json(
        { error: "User not provisioned", reason: "no-user-row" },
        { status: 401 }
      ),
    };
  }

  // Single-active-session enforcement. Skipped for:
  //   - ADMIN / SUPER_ADMIN roles (may log in on multiple devices)
  //   - users with no active session ID in the DB (e.g. pre-feature users)
  if (dbUser.activeSessionId && !isAdminRole(dbUser.role)) {
    const cookieStore = await cookies();
    const cookieSid = cookieStore.get(SESSION_COOKIE)?.value;
    if (cookieSid !== dbUser.activeSessionId) {
      // Sign out of Supabase server-side so the sb-* cookies are cleared
      // and the browser can't keep reusing this JWT.
      await supabase.auth.signOut();
      return {
        response: NextResponse.json(
          { error: "Signed in on another device", reason: "other-device" },
          { status: 401 }
        ),
      };
    }
  }

  return {
    user: { id: user.id, email: user.email ?? null },
    dbUser: { id: dbUser.id, role: dbUser.role },
  };
}
