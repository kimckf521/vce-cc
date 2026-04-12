import { NextResponse, type NextRequest } from "next/server";
import { requireAuthenticatedUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { isAdminRole } from "@/lib/utils";
import { rateLimit } from "@/lib/rate-limit";
import { updateContractSchema } from "@/lib/validations";

/**
 * PATCH /api/admin/affiliates/[id]/contracts/[contractId]
 *
 * Updates a content contract. When the admin marks `feePaid: true` for the
 * first time, we automatically create a CONTENT_FEE Payout record so the
 * payment is tracked alongside commission payouts.
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; contractId: string }> }
) {
  const ip = request.headers.get("x-forwarded-for") ?? "unknown";
  const limited = rateLimit(`admin-contract-patch:${ip}`, { maxRequests: 60 });
  if (limited) return limited;

  const auth = await requireAuthenticatedUser();
  if (auth.response) return auth.response;
  if (!isAdminRole(auth.dbUser.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id, contractId } = await params;
  const body = await request.json().catch(() => ({}));
  const parsed = updateContractSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const existing = await prisma.influencerContract.findUnique({
    where: { id: contractId },
  });
  if (!existing || existing.affiliateId !== id) {
    return NextResponse.json({ error: "Contract not found" }, { status: 404 });
  }

  const updated = await prisma.$transaction(async (tx) => {
    const contract = await tx.influencerContract.update({
      where: { id: contractId },
      data: parsed.data,
    });

    // Auto-create a Payout record the first time fee is marked paid
    if (parsed.data.feePaid === true && !existing.feePaid) {
      await tx.payout.create({
        data: {
          affiliateId: id,
          amount: contract.contentFee,
          type: "CONTENT_FEE",
          status: "COMPLETED",
          processedAt: new Date(),
          notes: `Content fee for contract ${contract.id}`,
        },
      });
    }

    return contract;
  });

  return NextResponse.json({ contract: updated });
}
