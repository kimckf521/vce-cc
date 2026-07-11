import { type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

export async function middleware(request: NextRequest) {
  return await updateSession(request);
}

export const config = {
  // Only run middleware on routes that need auth checks — skip API routes,
  // static assets, and the landing page to eliminate unnecessary overhead.
  matcher: [
    "/dashboard/:path*",
    // Curriculum-prefixed subject routes (the canonical URLs as of Phase 2):
    // /vce/methods/topics/... → TWO segments (curriculum + subject) before the
    // route type. The earlier single-segment patterns (/:subject/topics/...)
    // never matched these real URLs, so session refresh silently skipped every
    // page students actually use — expired tokens then surfaced as random
    // logged-out chrome. `[subject]/layout.tsx` validates the slugs and 404s
    // unknown ones. Flat /topics, /exams, ... are 308-redirected here by
    // next.config.mjs before middleware runs.
    "/:curriculum/:subject/topics/:path*",
    "/:curriculum/:subject/exams/:path*",
    "/:curriculum/:subject/practice/:path*",
    "/:curriculum/:subject/questions/:path*",
    "/:curriculum/:subject/bookmark/:path*",
    "/:curriculum/:subject/history/:path*",
    "/search/:path*",
    "/history/:path*",
    "/profile/:path*",
    "/admin/:path*",
    "/referrals/:path*",
    "/login",
    "/signup",
  ],
};
