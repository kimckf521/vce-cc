import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { isAdminRole } from "@/lib/utils";

async function getAdmin() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;
  const dbUser = await prisma.user.findUnique({ where: { id: user.id } });
  if (!isAdminRole(dbUser?.role)) return null;
  return { authUser: user, dbUser: dbUser! };
}

/**
 * GET — list all extraction sessions (shared across admins).
 */
export async function GET() {
  const admin = await getAdmin();
  if (!admin)
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const sessions = await prisma.extractionSession.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      user: { select: { name: true, email: true } },
    },
  });

  return NextResponse.json({
    sessions: sessions.map((s) => ({
      id: s.id,
      pdfName: s.pdfName,
      result: s.result,
      statuses: s.statuses,
      createdAt: s.createdAt.toISOString(),
      updatedAt: s.updatedAt.toISOString(),
      createdBy: s.user.name || s.user.email,
      userId: s.userId,
    })),
  });
}

/**
 * POST — create a new extraction session.
 */
export async function POST(req: NextRequest) {
  const admin = await getAdmin();
  if (!admin)
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const body = await req.json();
  const { pdfName, result, statuses } = body;

  if (!pdfName || !result) {
    return NextResponse.json(
      { error: "pdfName and result are required" },
      { status: 400 }
    );
  }

  const session = await prisma.extractionSession.create({
    data: {
      userId: admin.authUser.id,
      pdfName,
      result,
      statuses: statuses || {},
    },
    include: {
      user: { select: { name: true, email: true } },
    },
  });

  return NextResponse.json({
    session: {
      id: session.id,
      pdfName: session.pdfName,
      result: session.result,
      statuses: session.statuses,
      createdAt: session.createdAt.toISOString(),
      updatedAt: session.updatedAt.toISOString(),
      createdBy: session.user.name || session.user.email,
      userId: session.userId,
    },
  });
}

/**
 * PATCH — update an existing session (statuses, result).
 */
export async function PATCH(req: NextRequest) {
  const admin = await getAdmin();
  if (!admin)
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const body = await req.json();
  const { id, statuses, result } = body;

  if (!id) {
    return NextResponse.json({ error: "id is required" }, { status: 400 });
  }

  const existing = await prisma.extractionSession.findUnique({
    where: { id },
  });
  if (!existing) {
    return NextResponse.json({ error: "Session not found" }, { status: 404 });
  }

  const data: Record<string, unknown> = {};
  if (statuses !== undefined) data.statuses = statuses;
  if (result !== undefined) data.result = result;

  await prisma.extractionSession.update({
    where: { id },
    data,
  });

  return NextResponse.json({ ok: true });
}

/**
 * DELETE — delete an extraction session.
 */
export async function DELETE(req: NextRequest) {
  const admin = await getAdmin();
  if (!admin)
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const body = await req.json();
  const { id } = body;

  if (!id) {
    return NextResponse.json({ error: "id is required" }, { status: 400 });
  }

  await prisma.extractionSession.delete({ where: { id } });

  return NextResponse.json({ ok: true });
}
