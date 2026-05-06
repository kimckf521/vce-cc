import { NextResponse, type NextRequest } from "next/server";
import { requireAuthenticatedUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { isAdminRole } from "@/lib/utils";
import { rateLimit } from "@/lib/rate-limit";
import { updatePayoutSchema } from "@/lib/validations";

/** PATCH /api/admin/affiliates/payouts/[id] — update payout status */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const ip = request.headers.get("x-forwarded-for") ?? "unknown";
  const limited = rateLimit(`admin-payout-patch:${ip}`, { maxRequests: 60 });
  if (limited) return limited;

  const auth = await requireAuthenticatedUser();
  if (auth.response) return auth.response;
  if (!isAdminRole(auth.dbUser.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await params;
  const body = await request.json().catch(() => ({}));
  const parsed = updatePayoutSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const data: Record<string, unknown> = { status: parsed.data.status };
  if (parsed.data.reference !== undefined) data.reference = parsed.data.reference;
  if (parsed.data.notes !== undefined) data.notes = parsed.data.notes;
  if (parsed.data.status === "COMPLETED" || parsed.data.status === "FAILED") {
    data.processedAt = new Date();
  }

  // For influencer COMMISSION payouts, sync the affiliate's "Payout balance"
  // (creditBalance field) with the payout state transition:
  //   PENDING/PROCESSING → COMPLETED → decrement balance (cash has been paid)
  //   COMPLETED → FAILED → restore the decrement (rare clawback)
  // Pending → Failed: no change (balance was never decremented).
  // Wrap in a transaction so balance and status stay consistent.
  const existing = await prisma.payout.findUnique({
    where: { id },
    include: { affiliate: { select: { id: true, type: true } } },
  });
  if (!existing) {
    return NextResponse.json({ error: "Payout not found" }, { status: 404 });
  }

  const isInfluencerCommission =
    existing.affiliate.type === "INFLUENCER_AFFILIATE" && existing.type === "COMMISSION";

  const updated = await prisma.$transaction(async (tx) => {
    const payout = await tx.payout.update({ where: { id }, data });

    if (isInfluencerCommission) {
      // Transition to COMPLETED from a non-completed state → deduct
      if (
        parsed.data.status === "COMPLETED" &&
        existing.status !== "COMPLETED"
      ) {
        await tx.affiliate.update({
          where: { id: existing.affiliateId },
          data: { creditBalance: { decrement: existing.amount } },
        });
      }
      // Reversing a completion (rare) → restore
      else if (
        parsed.data.status === "FAILED" &&
        existing.status === "COMPLETED"
      ) {
        await tx.affiliate.update({
          where: { id: existing.affiliateId },
          data: { creditBalance: { increment: existing.amount } },
        });
      }
    }

    return payout;
  });

  return NextResponse.json({ payout: updated });
}
