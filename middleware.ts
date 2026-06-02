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
    // Curriculum-prefixed subject routes (the canonical URLs as of Phase 2).
    // The :subject segment matches any slug — `[subject]/layout.tsx` validates
    // it and 404s if unknown. Flat /topics, /exams, etc. are 301-redirected
    // here by next.config.mjs before middleware runs, so they don't need to
    // be in the matcher anymore.
    "/:subject/topics/:path*",
    "/:subject/exams/:path*",
    "/:subject/practice/:path*",
    "/:subject/questions/:path*",
    "/search/:path*",
    "/history/:path*",
    "/profile/:path*",
    "/admin/:path*",
    "/referrals/:path*",
    "/login",
    "/signup",
  ],
};
