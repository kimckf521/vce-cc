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

  const updated = await prisma.payout.update({
    where: { id },
    data,
  });

  return NextResponse.json({ payout: updated });
}
