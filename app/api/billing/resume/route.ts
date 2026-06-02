import { NextResponse, type NextRequest } from "next/server";
import { requireAuthenticatedUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getStripe } from "@/lib/stripe";
import { rateLimit } from "@/lib/rate-limit";

// TODO B2: derive subject from URL context. Today all 4 enrolment rows for a
// VCE Maths sub share the same stripeSubscriptionId, so reading from any one
// gives the right sub to resume — the webhook syncs every row afterwards.
const LEGACY_BILLING_SUBJECT_SLUG = "mathematical-methods";

/**
 * POST /api/billing/resume
 * Removes scheduled cancellation — the subscription will renew normally.
 */
export async function POST(request: NextRequest) {
  const ip = request.headers.get("x-forwarded-for") ?? "unknown";
  const limited = rateLimit(`billing-resume:${ip}`, { maxRequests: 5 });
  if (limited) return limited;

  const auth = await requireAuthenticatedUser();
  if (auth.response) return auth.response;
  const { user } = auth;

  const enrolment = await prisma.subjectEnrolment.findFirst({
    where: {
      userId: user.id,
      subject: { slug: LEGACY_BILLING_SUBJECT_SLUG },
      stripeSubscriptionId: { not: null },
    },
    select: { stripeSubscriptionId: true },
  });

  if (!enrolment?.stripeSubscriptionId) {
    return NextResponse.json(
      { error: "No subscription found." },
      { status: 400 }
    );
  }

  const stripe = getStripe();

  await stripe.subscriptions.update(enrolment.stripeSubscriptionId, {
    cancel_at_period_end: false,
  });

  // Optimistic local update
  // updateMany — one Stripe sub now backs 4 enrolment rows.
  await prisma.subjectEnrolment.updateMany({
    where: { stripeSubscriptionId: enrolment.stripeSubscriptionId },
    data: { cancelAtPeriodEnd: false },
  });

  return NextResponse.json({ ok: true, cancelAtPeriodEnd: false });
}
