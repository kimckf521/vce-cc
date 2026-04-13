import { NextResponse, type NextRequest } from "next/server";
import { requireAuthenticatedUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getStripe, STANDARD_SUBJECT_SLUG } from "@/lib/stripe";
import { rateLimit } from "@/lib/rate-limit";

/**
 * POST /api/billing/cancel
 * Cancels the user's subscription at the end of the current billing period.
 * Does NOT cancel immediately — the user keeps access until period end.
 */
export async function POST(request: NextRequest) {
  const ip = request.headers.get("x-forwarded-for") ?? "unknown";
  const limited = rateLimit(`billing-cancel:${ip}`, { maxRequests: 5 });
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
      { error: "No active subscription found." },
      { status: 400 }
    );
  }

  const stripe = getStripe();

  const updated = await stripe.subscriptions.update(
    enrolment.stripeSubscriptionId,
    { cancel_at_period_end: true }
  );

  // Optimistic local update (webhook will also sync this)
  const firstItem = updated.items.data[0];
  const periodEnd = firstItem?.current_period_end
    ? new Date(firstItem.current_period_end * 1000)
    : null;

  await prisma.subjectEnrolment.update({
    where: { stripeSubscriptionId: enrolment.stripeSubscriptionId },
    data: {
      cancelAtPeriodEnd: true,
      ...(periodEnd ? { currentPeriodEnd: periodEnd } : {}),
    },
  });

  return NextResponse.json({
    ok: true,
    cancelAtPeriodEnd: true,
    currentPeriodEnd: periodEnd?.toISOString() ?? null,
  });
}
