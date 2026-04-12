/**
 * Single-active-session cookie constants.
 *
 * On every successful login the sync-user route mints a new random session ID,
 * stores it on `User.activeSessionId`, and writes it to the `vce_sid` cookie.
 * Middleware compares the cookie value to the DB value on every authenticated
 * request — a mismatch means this browser was superseded by another login and
 * must be signed out.
 */

export const SESSION_COOKIE = "vce_sid";

export const sessionCookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  path: "/",
  // 30 days — matches Supabase's refresh-token lifetime. We don't actually
  // rely on expiry because the server-side DB check is authoritative; this
  // just prevents the cookie from lingering forever if the user abandons
  // the browser.
  maxAge: 60 * 60 * 24 * 30,
};
