"use server";

import { Pool } from "pg";
import "dotenv/config";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

import { requireAnyPermission } from "@/lib/auth/permissions";
import { revalidatePath } from "next/cache";
import { APPLICATION_MANAGE_PERMISSIONS } from "@/lib/constants";
import db from "@/lib/db";
import { computeNextInspectionDate, isInspectionOverdue, computeComplianceScore, type FindingSeverity, type FindingStatus } from "@/lib/directive/monitoring";

export async function getMonitoringData() {
  try {
    await requireAnyPermission(APPLICATION_MANAGE_PERMISSIONS);

    // Get certified entities
    const startups = await db.application.findMany({
      where: { status: "CERTIFIED" },
      select: { id: true, name: true, createdAt: true, updatedAt: true, category: true, location: true },
    });
    const ecosystems = await db.ecoApplication.findMany({
      where: { status: "CERTIFIED" },
      select: { id: true, name: true, createdAt: true, updatedAt: true, category: true, city: true },
    });

    // Get inspections from DB
    const inspectionsResult = await pool.query(`SELECT id, entity_id, entity_type, status, scheduled_at, completed_at FROM "directive"."Inspection"`);
    const findingsResult = await pool.query(`SELECT id, inspection_id, severity, status FROM "directive"."InspectionFinding"`);

    const inspectionsByEntity: Record<string, any[]> = {};
    for (const row of inspectionsResult.rows) {
      const key = `${row.entity_id}:${row.entity_type}`;
      if (!inspectionsByEntity[key]) inspectionsByEntity[key] = [];
      inspectionsByEntity[key].push(row);
    }

    const findingsByInspection: Record<string, any[]> = {};
    for (const row of findingsResult.rows) {
      if (!findingsByInspection[row.inspection_id]) findingsByInspection[row.inspection_id] = [];
      findingsByInspection[row.inspection_id].push(row);
    }

    const entities = [
      ...startups.map((s) => {
        const entityInspections = inspectionsByEntity[`${s.id}:startup`] || [];
        const lastInspection = entityInspections.length > 0 ? entityInspections[entityInspections.length - 1].scheduled_at : null;
        const openFindings = entityInspections.flatMap((i: any) => (findingsByInspection[i.id] || [])).filter((f: any) => f.status !== "CLOSED");
        const allFindings = entityInspections.flatMap((i: any) => findingsByInspection[i.id] || []);
        const nextInspection = computeNextInspectionDate(lastInspection ? new Date(lastInspection) : null);
        return {
          id: s.id, name: s.name, entityType: "startup" as const,
          lastInspectionDate: lastInspection?.toISOString() || null,
          nextInspectionDate: nextInspection.toISOString(),
          isOverdue: isInspectionOverdue(nextInspection),
          category: s.category || "N/A", region: s.location || "Unknown",
          complianceScore: computeComplianceScore(allFindings),
          findingsCount: allFindings.length, openFindings: openFindings.length,
        };
      }),
      ...ecosystems.map((s) => {
        const entityInspections = inspectionsByEntity[`${s.id}:ecosystem`] || [];
        const lastInspection = entityInspections.length > 0 ? entityInspections[entityInspections.length - 1].scheduled_at : null;
        const openFindings = entityInspections.flatMap((i: any) => (findingsByInspection[i.id] || [])).filter((f: any) => f.status !== "CLOSED");
        const allFindings = entityInspections.flatMap((i: any) => findingsByInspection[i.id] || []);
        const nextInspection = computeNextInspectionDate(lastInspection ? new Date(lastInspection) : null);
        return {
          id: s.id, name: s.name, entityType: "ecosystem" as const,
          lastInspectionDate: lastInspection?.toISOString() || null,
          nextInspectionDate: nextInspection.toISOString(),
          isOverdue: isInspectionOverdue(nextInspection),
          category: s.category || "N/A", region: s.city || "Unknown",
          complianceScore: computeComplianceScore(allFindings),
          findingsCount: allFindings.length, openFindings: openFindings.length,
        };
      }),
    ];

    return { success: true as const, data: entities };
  } catch (error: any) {
    return { success: false as const, message: error.message || "Failed to load monitoring data" };
  }
}

export async function logInspectionFinding(entityId: string, entityType: "startup" | "ecosystem", data: { description: string; severity: FindingSeverity; directiveRef: string; correctiveAction?: string }) {
  try {
    await requireAnyPermission(APPLICATION_MANAGE_PERMISSIONS);

    // Create or get inspection
    const existing = await pool.query(
      `SELECT id FROM "directive"."Inspection" WHERE entity_id = $1 AND entity_type = $2 AND status = 'SCHEDULED' ORDER BY scheduled_at DESC LIMIT 1`,
      [entityId, entityType]
    );

    let inspectionId: string;
    if (existing.rows.length > 0) {
      inspectionId = existing.rows[0].id;
    } else {
      const newInspection = await pool.query(
        `INSERT INTO "directive"."Inspection" (entity_id, entity_type, scheduled_at, status, inspector_id)
         VALUES ($1, $2, NOW(), 'IN_PROGRESS', 'system') RETURNING id`,
        [entityId, entityType]
      );
      inspectionId = newInspection.rows[0].id;
    }

    // Log finding
    await pool.query(
      `INSERT INTO "directive"."InspectionFinding" (inspection_id, description, severity, status, directive_ref, corrective_action)
       VALUES ($1, $2, $3, 'OPEN', $4, $5)`,
      [inspectionId, data.description, data.severity, data.directiveRef, data.correctiveAction || null]
    );

    revalidatePath("/admins-new/monitoring");
    return { success: true as const, message: `Finding logged: ${data.severity} - ${data.description}` };
  } catch (error: any) {
    return { success: false as const, message: error.message || "Failed to log finding" };
  }
}
