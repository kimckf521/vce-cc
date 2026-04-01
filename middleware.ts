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
    "/topics/:path*",
    "/exams/:path*",
    "/practice/:path*",
    "/search/:path*",
    "/questions/:path*",
    "/history/:path*",
    "/profile/:path*",
    "/admin/:path*",
    "/login",
    "/signup",
  ],
};
