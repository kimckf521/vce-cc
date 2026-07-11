/**
 * `?next=` return-to handling for the auth funnel.
 *
 * A visitor who hits a gate (try-wall, checkout, a protected page) carries
 * their intended destination as `?next=<path>` so signup/login can send them
 * back to it instead of dumping everyone on /dashboard. Because the value ends
 * up in a redirect, it MUST be validated: only same-origin absolute paths are
 * allowed — never a protocol-relative `//evil.com`, a scheme, or a control
 * char that a URL parser would strip into one.
 */

export function sanitizeNext(raw: string | null | undefined): string | null {
  if (!raw) return null;
  // Must be an absolute path, not protocol-relative.
  if (!raw.startsWith("/") || raw.startsWith("//")) return null;
  // Reject backslashes (normalize to `/`) and any control char: WHATWG URL
  // parsing strips ASCII tab/newline/CR BEFORE tokenizing, so `/\t/evil.com`
  // could smuggle a protocol-relative `//evil.com` past a naive prefix check.
  for (let i = 0; i < raw.length; i++) {
    const c = raw.charCodeAt(i);
    if (c < 0x20 || c === 0x7f || raw[i] === "\\") return null;
  }
  // Belt-and-suspenders: resolve against a throwaway base and require the
  // result to stay on that origin. Anything that escapes to another origin
  // (or fails to parse) is rejected; otherwise return the normalized path.
  try {
    const base = "https://internal.invalid";
    const u = new URL(raw, base);
    if (u.origin !== base) return null;
    return u.pathname + u.search + u.hash;
  } catch {
    return null;
  }
}

/**
 * Where to send a user immediately after authentication.
 *
 * - Returning users go straight to their intended `next` (default /dashboard).
 * - First-time registrations go through /welcome onboarding first, carrying
 *   `next` as the post-onboarding destination so intent survives onboarding.
 */
export function postAuthDestination(
  isNewRegistration: boolean,
  next: string | null | undefined,
): string {
  const dest = sanitizeNext(next) ?? "/dashboard";
  if (!isNewRegistration) return dest;
  return dest === "/dashboard"
    ? "/welcome"
    : `/welcome?next=${encodeURIComponent(dest)}`;
}
