"use server";

import db from "@/lib/db";
import { requireAnyPermission } from "@/lib/auth/permissions";
import { APPLICATION_VIEW_PERMISSIONS } from "@/lib/constants";
import { getReportRequirements, computeReportDueDate, getReportStatus, type ReportRequirement } from "@/lib/directive/reports";

export async function getDirectiveReportData(entityType: "startup" | "ecosystem" = "startup") {
  try {
    await requireAnyPermission(APPLICATION_VIEW_PERMISSIONS);

    const requirements = getReportRequirements(entityType);

    // Get all certified entities of the given type
    let entities: { id: string; name: string; status: string; lastReportDate?: Date }[] = [];

    if (entityType === "startup") {
      const apps = await db.application.findMany({
        where: { status: "CERTIFIED" },
        select: { id: true, name: true, status: true, updatedAt: true },
      });
      entities = apps.map((a) => ({ id: a.id, name: a.name, status: a.status, lastReportDate: a.updatedAt }));
    } else {
      const apps = await db.ecoApplication.findMany({
        where: { status: "CERTIFIED" },
        select: { id: true, name: true, status: true, updatedAt: true },
      });
      entities = apps.map((a) => ({ id: a.id, name: a.name, status: a.status, lastReportDate: a.updatedAt }));
    }

    const reportStatuses = requirements.map((req) => {
      const statuses = entities.map((e) => ({
        entityId: e.id,
        entityName: e.name,
        reportStatus: getReportStatus(e.lastReportDate || null, req),
        dueDate: e.lastReportDate ? computeReportDueDate(e.lastReportDate, req).toISOString() : null,
      }));
      return { requirement: req, entityStatuses: statuses };
    });

    // Compute aggregate stats
    const allStatuses = reportStatuses.flatMap((rs) => rs.entityStatuses.map((es) => es.reportStatus));
    const compliant = allStatuses.filter((s) => s === "COMPLIANT").length;
    const overdue = allStatuses.filter((s) => s === "OVERDUE").length;
    const dueSoon = allStatuses.filter((s) => s === "DUE_SOON").length;
    const neverSubmitted = allStatuses.filter((s) => s === "NEVER_SUBMITTED").length;

    return {
      success: true as const,
      data: {
        requirements,
        reportStatuses,
        stats: { compliant, overdue, dueSoon, neverSubmitted, total: allStatuses.length },
        entityType,
      },
    };
  } catch (error: any) {
    return { success: false as const, message: error.message || "Failed to load report data" };
  }
}
