import { NextRequest, NextResponse } from "next/server";
import { requireAuthenticatedUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { isAdminRole } from "@/lib/utils";
import { createClient as createSupabaseAdmin } from "@supabase/supabase-js";
import { z } from "zod";

const enrolmentSchema = z.object({
  subjectId: z.string().min(1),
  tier: z.enum(["FREE", "PAID"]),
});

const createUserSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6, "Password must be at least 6 characters"),
  name: z.string().min(1, "Name is required"),
  role: z.enum(["STUDENT", "TUTOR", "INFLUENCER", "ADMIN", "SUPER_ADMIN"]).default("STUDENT"),
  enrolments: z.array(enrolmentSchema).optional().default([]),
});

const changeRoleSchema = z.object({
  userId: z.string().min(1),
  role: z.enum(["STUDENT", "TUTOR", "INFLUENCER", "ADMIN", "SUPER_ADMIN"]),
});

export async function POST(req: NextRequest) {
  const auth = await requireAuthenticatedUser();
  if (auth.response) return auth.response;

  if (!isAdminRole(auth.dbUser.role))
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !serviceRoleKey) {
    return NextResponse.json(
      { error: "Service role key not configured" },
      { status: 500 }
    );
  }

  try {
    const body = await req.json();
    const parsed = createUserSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0].message },
        { status: 400 }
      );
    }

    const { email, password, name, role, enrolments } = parsed.data;

    // Check if email already exists in our DB
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json(
        { error: "An account with this email already exists" },
        { status: 409 }
      );
    }

    // Create user in Supabase Auth using admin API
    const adminClient = createSupabaseAdmin(supabaseUrl, serviceRoleKey);
    const { data: authData, error: authError } =
      await adminClient.auth.admin.createUser({
        email,
        password,
        email_confirm: true, // Skip email verification
        user_metadata: { name },
      });

    if (authError) {
      return NextResponse.json(
        { error: authError.message },
        { status: 400 }
      );
    }

    if (!authData.user) {
      return NextResponse.json(
        { error: "Failed to create auth user" },
        { status: 500 }
      );
    }

    // Create user in Prisma DB (with optional enrolments)
    const newUser = await prisma.user.create({
      data: {
        id: authData.user.id,
        email,
        name,
        role,
        ...(enrolments.length > 0 && {
          enrolments: {
            create: enrolments.map((e) => ({
              subjectId: e.subjectId,
              tier: e.tier,
            })),
          },
        }),
      },
      include: { enrolments: { include: { subject: true } } },
    });

    return NextResponse.json({
      id: newUser.id,
      email: newUser.email,
      name: newUser.name,
      role: newUser.role,
      enrolments: newUser.enrolments,
    });
  } catch (err) {
    console.error("[admin/users] Error:", err);
    return NextResponse.json(
      {
        error: "Failed to create account",
        details: err instanceof Error ? err.message : String(err),
      },
      { status: 500 }
    );
  }
}

/**
 * PATCH — change a user's role. Only SUPER_ADMIN can do this.
 */
export async function PATCH(req: NextRequest) {
  const auth = await requireAuthenticatedUser();
  if (auth.response) return auth.response;
  const { user } = auth;

  if (auth.dbUser.role !== "SUPER_ADMIN")
    return NextResponse.json(
      { error: "Only Super Admin can change roles" },
      { status: 403 }
    );

  try {
    const body = await req.json();
    const parsed = changeRoleSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0].message },
        { status: 400 }
      );
    }

    const { userId, role } = parsed.data;

    if (userId === user.id) {
      return NextResponse.json(
        { error: "You cannot change your own role" },
        { status: 400 }
      );
    }

    const targetUser = await prisma.user.findUnique({ where: { id: userId } });
    if (!targetUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const updated = await prisma.user.update({
      where: { id: userId },
      data: { role },
    });

    return NextResponse.json({
      id: updated.id,
      email: updated.email,
      role: updated.role,
    });
  } catch (err) {
    console.error("[admin/users] Role change error:", err);
    return NextResponse.json(
      { error: "Failed to change role" },
      { status: 500 }
    );
  }
}
