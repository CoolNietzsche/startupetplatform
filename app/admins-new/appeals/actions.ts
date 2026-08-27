"use server";

import { requireAnyPermission } from "@/lib/auth/permissions";
import { revalidatePath } from "next/cache";
import { APPLICATION_MANAGE_PERMISSIONS } from "@/lib/constants";
import { Pool } from "pg";
import "dotenv/config";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import db from "@/lib/db";
import { computeAppealDeadline, computeReviewDeadline, isAppealTimely } from "@/lib/directive/appeals";
import { createNotification, notifyAllAdmins } from "@/lib/notifications";

export async function getAppeals() {
  try {
    await requireAnyPermission(APPLICATION_MANAGE_PERMISSIONS);

    // Fetch from DB
    const result = await pool.query(`
      SELECT id, entity_id, entity_type, decision_id, grounds, description, status,
             filed_at, appeal_deadline, decided_at, decided_by_id, decision_reason
      FROM "directive"."DirectiveAppeal"
      ORDER BY filed_at DESC
    `);

    // Also fetch appealable decisions from applications
    const rejectedApps = await db.application.findMany({
      where: { status: { in: ["REJECTED", "SUSPENDED", "REVOKED"] } },
      select: { id: true, name: true, status: true, updatedAt: true },
    });
    const rejectedEcos = await db.ecoApplication.findMany({
      where: { status: { in: ["REJECTED", "SUSPENDED", "REVOKED"] } },
      select: { id: true, name: true, status: true, updatedAt: true },
    });

    // Build combined list: DB appeals + appealable decisions
    const dbAppeals = result.rows.map((r: any) => ({
      id: r.id,
      entityId: r.entity_id,
      entityName: r.entityType === "startup" ? "" : "", // populated from lookup below
      entityType: r.entity_type,
      decisionDate: r.filed_at,
      appealDeadline: r.appeal_deadline,
      isTimely: r.appeal_deadline ? new Date() <= new Date(r.appeal_deadline) : true,
      status: r.status,
      daysRemaining: r.appeal_deadline ? Math.max(0, Math.ceil((new Date(r.appeal_deadline).getTime() - Date.now()) / 86400000)) : 0,
      fromDb: true,
    }));

    const appealableDecisions = [
      ...rejectedApps.map((a) => {
        const deadline = computeAppealDeadline(a.updatedAt);
        return {
          id: `appeal-${a.id}`,
          entityId: a.id,
          entityName: a.name,
          entityType: "startup" as const,
          decisionDate: a.updatedAt.toISOString(),
          appealDeadline: deadline.toISOString(),
          isTimely: isAppealTimely(a.updatedAt),
          status: isAppealTimely(a.updatedAt) ? "PENDING" : "EXPIRED",
          daysRemaining: Math.max(0, Math.ceil((deadline.getTime() - Date.now()) / 86400000)),
          fromDb: false,
        };
      }),
      ...rejectedEcos.map((a) => {
        const deadline = computeAppealDeadline(a.updatedAt);
        return {
          id: `appeal-${a.id}`,
          entityId: a.id,
          entityName: a.name,
          entityType: "ecosystem" as const,
          decisionDate: a.updatedAt.toISOString(),
          appealDeadline: deadline.toISOString(),
          isTimely: isAppealTimely(a.updatedAt),
          status: isAppealTimely(a.updatedAt) ? "PENDING" : "EXPIRED",
          daysRemaining: Math.max(0, Math.ceil((deadline.getTime() - Date.now()) / 86400000)),
          fromDb: false,
        };
      }),
    ];

    // Merge, avoid duplicates (prefer DB record)
    const dbEntityIds = new Set(dbAppeals.map((a: any) => a.entityId));
    const merged = [...dbAppeals, ...appealableDecisions.filter((a) => !dbEntityIds.has(a.entityId))];

    return { success: true as const, data: merged };
  } catch (error: any) {
    return { success: false as const, message: error.message || "Failed to load appeals" };
  }
}

export async function submitAppeal(entityId: string, entityType: "startup" | "ecosystem", grounds: string, description: string) {
  try {
    await requireAnyPermission(APPLICATION_MANAGE_PERMISSIONS);
    const session = await getServerSession(authOptions);

    const filedAt = new Date();
    const deadline = new Date(filedAt.getTime() + 30 * 24 * 60 * 60 * 1000);

    await pool.query(
      `INSERT INTO "directive"."DirectiveAppeal" (entity_id, entity_type, grounds, description, status, filed_at, appeal_deadline)
       VALUES ($1, $2, $3, $4, 'PENDING', $5, $6)`,
      [entityId, entityType, grounds, description, filedAt, deadline]
    );

    revalidatePath("/admins-new/appeals");
    return { success: true as const, message: "Appeal filed successfully (Art. 35)" };
  } catch (error: any) {
    return { success: false as const, message: error.message || "Failed to file appeal" };
  }
}

export async function decideAppeal(appealId: string, entityId: string, entityType: "startup" | "ecosystem", decision: "UPHELD" | "DENIED" | "DISMISSED", reason: string) {
  try {
    await requireAnyPermission(APPLICATION_MANAGE_PERMISSIONS);
    const session = await getServerSession(authOptions);

    // Update appeal status
    await pool.query(
      `UPDATE "directive"."DirectiveAppeal" SET status = $1, decided_at = NOW(), decided_by_id = $2, decision_reason = $3
       WHERE id = $4 AND entity_id = $5`,
      [decision, session?.user?.id || "", reason, appealId, entityId]
    );

    // If upheld, restore entity status to UNDER_REVIEW
    if (decision === "UPHELD") {
      if (entityType === "startup") {
        await db.application.update({
          where: { id: entityId },
          data: { status: "UNDER_REVIEW" },
        });
      } else {
        await db.ecoApplication.update({
          where: { id: entityId },
          data: { status: "UNDER_REVIEW" },
        });
      }
    }

    // Notify admins
    await notifyAllAdmins({
      title: `Appeal ${decision}`,
      message: `Appeal for ${entityType} ${entityId.slice(0, 12)} was ${decision.toLowerCase()}. Reason: ${reason}`,
      type: decision === "UPHELD" ? "success" : "warning",
      link: "/admins-new/appeals",
    });

    revalidatePath("/admins-new/appeals");
    return { success: true as const, message: `Appeal ${decision.toLowerCase()}. ${decision === "UPHELD" ? "Status restored to Under Review." : ""}` };
  } catch (error: any) {
    return { success: false as const, message: error.message || "Failed to decide appeal" };
  }
}
