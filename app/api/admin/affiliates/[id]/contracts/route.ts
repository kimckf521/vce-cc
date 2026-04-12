import { NextResponse, type NextRequest } from "next/server";
import { requireAuthenticatedUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { isAdminRole } from "@/lib/utils";
import { rateLimit } from "@/lib/rate-limit";
import { createContractSchema } from "@/lib/validations";

/** POST /api/admin/affiliates/[id]/contracts — create an influencer content contract */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const ip = request.headers.get("x-forwarded-for") ?? "unknown";
  const limited = rateLimit(`admin-contract-post:${ip}`, { maxRequests: 30 });
  if (limited) return limited;

  const auth = await requireAuthenticatedUser();
  if (auth.response) return auth.response;
  if (!isAdminRole(auth.dbUser.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await params;
  const body = await request.json().catch(() => ({}));
  const parsed = createContractSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const affiliate = await prisma.affiliate.findUnique({ where: { id } });
  if (!affiliate || affiliate.type !== "INFLUENCER_AFFILIATE") {
    return NextResponse.json(
      { error: "Affiliate is not an influencer" },
      { status: 400 }
    );
  }

  const contract = await prisma.influencerContract.create({
    data: {
      affiliateId: id,
      platform: parsed.data.platform,
      platformHandle: parsed.data.platformHandle,
      followerCount: parsed.data.followerCount ?? null,
      contentFee: parsed.data.contentFee,
      contentDeadline: parsed.data.contentDeadline
        ? new Date(parsed.data.contentDeadline)
        : null,
      notes: parsed.data.notes ?? null,
    },
  });

  return NextResponse.json({ contract }, { status: 201 });
}
