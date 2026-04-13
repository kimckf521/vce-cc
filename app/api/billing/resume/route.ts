import { NextResponse, type NextRequest } from "next/server";
import { requireAuthenticatedUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getStripe, STANDARD_SUBJECT_SLUG } from "@/lib/stripe";
import { rateLimit } from "@/lib/rate-limit";

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
      subject: { slug: STANDARD_SUBJECT_SLUG },
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
  await prisma.subjectEnrolment.update({
    where: { stripeSubscriptionId: enrolment.stripeSubscriptionId },
    data: { cancelAtPeriodEnd: false },
  });

  return NextResponse.json({ ok: true, cancelAtPeriodEnd: false });
}
