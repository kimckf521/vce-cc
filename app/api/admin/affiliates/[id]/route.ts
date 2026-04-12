import { NextResponse, type NextRequest } from "next/server";
import { requireAuthenticatedUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { isAdminRole } from "@/lib/utils";
import { rateLimit } from "@/lib/rate-limit";
import { updateAffiliateSchema } from "@/lib/validations";

/** PATCH /api/admin/affiliates/[id] — update affiliate status, credit, notes */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const ip = request.headers.get("x-forwarded-for") ?? "unknown";
  const limited = rateLimit(`admin-aff-patch:${ip}`, { maxRequests: 60 });
  if (limited) return limited;

  const auth = await requireAuthenticatedUser();
  if (auth.response) return auth.response;
  if (!isAdminRole(auth.dbUser.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await params;
  const body = await request.json().catch(() => ({}));
  const parsed = updateAffiliateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const data: Record<string, unknown> = {};
  if (parsed.data.approved !== undefined) data.approved = parsed.data.approved;
  if (parsed.data.active !== undefined) data.active = parsed.data.active;
  if (parsed.data.notes !== undefined) data.notes = parsed.data.notes;
  if (parsed.data.creditAdjustment !== undefined) {
    data.creditBalance = { increment: parsed.data.creditAdjustment };
  }

  const updated = await prisma.affiliate.update({
    where: { id },
    data,
  });

  return NextResponse.json({ affiliate: updated });
}
