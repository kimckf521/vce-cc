import { createServerClient, type CookieMethodsServer } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { sanitizeNext } from "@/lib/next-param";

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet: Parameters<NonNullable<CookieMethodsServer["setAll"]>>[0]) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const url = request.nextUrl.clone();
  const isAuthPage = url.pathname.startsWith("/login") || url.pathname.startsWith("/signup");
  // Gated (app) routes. The subject-scoped ones are curriculum-prefixed
  // (/vce/methods/topics, ...) — matched by segment position so the PUBLIC
  // (content) routes at the same depth (/vce/methods/exams|questions) stay
  // open. The old bare `/practice` check never matched the real paths.
  const isProtected =
    url.pathname.startsWith("/dashboard") ||
    url.pathname.startsWith("/admin") ||
    url.pathname === "/teacher" ||
    url.pathname.startsWith("/teacher/") ||
    url.pathname.startsWith("/profile") ||
    url.pathname.startsWith("/referrals") ||
    url.pathname === "/search" ||
    url.pathname.startsWith("/search/") ||
    url.pathname === "/history" ||
    url.pathname.startsWith("/history/") ||
    /^\/[^/]+\/[^/]+\/(topics|practice|bookmark|history)(\/|$)/.test(url.pathname);

  if (!user && isProtected) {
    // Carry a return-to so login can send the student back to the page they
    // wanted instead of a generic /dashboard.
    const nextPath = url.pathname + url.search;
    url.pathname = "/login";
    url.search = `?next=${encodeURIComponent(nextPath)}`;
    return NextResponse.redirect(url);
  }

  if (user && isAuthPage) {
    // Already signed in — honour a carried `next` (e.g. a shared /login?next=
    // link, or bouncing back from signup) instead of always dumping them on
    // the dashboard.
    const dest = sanitizeNext(url.searchParams.get("next")) ?? "/dashboard";
    url.pathname = dest.split("?")[0];
    url.search = dest.includes("?") ? dest.slice(dest.indexOf("?")) : "";
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}
