import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { requireAuthenticatedUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { rateLimit } from "@/lib/rate-limit";
import { registerAffiliateSchema } from "@/lib/validations";
import { generateReferralCode } from "@/lib/affiliate";

/**
 * POST /api/affiliates/register
 *
 * Creates an Affiliate row for the authenticated user.
 *
 * - STUDENT_REFERRAL → auto-approved, no ABN required.
 * - TUTOR_AFFILIATE → requires ABN, awaits admin approval.
 * - INFLUENCER_AFFILIATE → requires ABN + platform info, awaits admin approval.
 *
 * Idempotent: if the user already has an affiliate record, returns it as-is.
 */
export async function POST(request: NextRequest) {
  const ip = request.headers.get("x-forwarded-for") ?? "unknown";
  const limited = rateLimit(`affiliate-register:${ip}`, { maxRequests: 5 });
  if (limited) return limited;

  const auth = await requireAuthenticatedUser();
  if (auth.response) return auth.response;
  const { user } = auth;
  // Still need raw supabase for user_metadata.name on the upsert below
  const supabase = await createClient();
  const { data: { user: supabaseUser } } = await supabase.auth.getUser();

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = registerAffiliateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  // Make sure the user row exists in our DB
  const dbUser = await prisma.user.upsert({
    where: { id: user.id },
    update: {},
    create: {
      id: user.id,
      email: user.email!,
      name: supabaseUser?.user_metadata?.name ?? null,
    },
    select: { id: true, name: true, email: true, role: true },
  });

  // If the user is already an affiliate, return their existing record.
  const existing = await prisma.affiliate.findUnique({
    where: { userId: dbUser.id },
  });
  if (existing) {
    return NextResponse.json({ affiliate: existing }, { status: 200 });
  }

  const { type, abn } = parsed.data;
  const code = await generateReferralCode(dbUser.name ?? dbUser.email.split("@")[0]);

  // Auto-approve students; tutors/influencers need admin approval.
  const approved = type === "STUDENT_REFERRAL";

  // Promote the user's role if they're applying as a tutor or influencer.
  const newRole =
    type === "TUTOR_AFFILIATE"
      ? "TUTOR"
      : type === "INFLUENCER_AFFILIATE"
        ? "INFLUENCER"
        : null;

  const affiliate = await prisma.$transaction(async (tx) => {
    if (newRole && dbUser.role === "STUDENT") {
      await tx.user.update({
        where: { id: dbUser.id },
        data: { role: newRole },
      });
    }
    return tx.affiliate.create({
      data: {
        userId: dbUser.id,
        type,
        referralCode: code,
        abn: abn ?? null,
        approved,
        active: true,
      },
    });
  });

  return NextResponse.json({ affiliate }, { status: 201 });
}
