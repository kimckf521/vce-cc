/**
 * Admin audit log helper.
 *
 * Call from any admin-only mutation after a successful state change so the
 * action shows up on /admin/audit. Best-effort — failures are logged but
 * never thrown, so audit logging can't break the underlying admin flow.
 *
 * Example:
 *   await logAdminAction({
 *     actorId: auth.dbUser.id,
 *     action: "USER_ROLE_CHANGE",
 *     targetType: "User",
 *     targetId: targetUser.id,
 *     summary: `Promoted ${targetUser.email} → ${role}`,
 *     metadata: { previousRole: targetUser.role, newRole: role },
 *   });
 */
import type { AdminActionType } from "@prisma/client";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";

export interface LogAdminActionInput {
  actorId: string;
  action: AdminActionType;
  targetType: string;
  targetId?: string | null;
  summary: string;
  metadata?: Record<string, unknown>;
}

export async function logAdminAction(input: LogAdminActionInput): Promise<void> {
  try {
    await prisma.adminActionLog.create({
      data: {
        actorId: input.actorId,
        action: input.action,
        targetType: input.targetType,
        targetId: input.targetId ?? null,
        summary: input.summary.slice(0, 500),
        // Prisma JSON columns expect Prisma.JsonNull when the value is null,
        // not native null. Avoids InputJsonValue type confusion.
        metadata: input.metadata
          ? (input.metadata as Prisma.InputJsonValue)
          : Prisma.JsonNull,
      },
    });
  } catch (err) {
    // Audit logging must never break the underlying admin flow.
    console.error("[admin-audit] Failed to log admin action:", err);
  }
}
