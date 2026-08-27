"use server";

import db from "@/lib/db";
import { requireAnyPermission } from "@/lib/auth/permissions";
import { APPLICATION_VIEW_PERMISSIONS } from "@/lib/constants";

export async function getRegistryData(search?: string) {
  try {
    await requireAnyPermission(APPLICATION_VIEW_PERMISSIONS);

    // Fetch certified startups
    const startups = await db.application.findMany({
      where: { status: "CERTIFIED" },
      select: {
        id: true, name: true, type: true, category: true, location: true,
        createdAt: true, updatedAt: true,
        startup: { select: { level: true, certificateId: true, issuedAt: true, expiresAt: true } },
      },
    });

    // Fetch certified ecosystem builders
    const ecosystems = await db.ecoApplication.findMany({
      where: { status: "CERTIFIED" },
      select: {
        id: true, name: true, type: true, category: true, city: true,
        createdAt: true, updatedAt: true,
      },
    });

    const { computeRegistryStats, searchRegistry } = await import("@/lib/directive/registry");

    const entries = [
      ...startups.map((s) => ({
        certificateNumber: s.startup?.certificateId || s.id,
        entityName: s.name,
        entityType: "startup" as const,
        entitySubType: s.type,
        stage: s.startup?.level || "INITIAL",
        certificateStatus: "ACTIVE" as const,
        issuedAt: s.startup?.issuedAt || s.createdAt,
        expiresAt: s.startup?.expiresAt || null,
        region: s.location || "Unknown",
        sector: s.category || undefined,
      })),
      ...ecosystems.map((e) => ({
        certificateNumber: e.id,
        entityName: e.name,
        entityType: "ecosystem" as const,
        entitySubType: e.type,
        stage: "ACTIVE",
        certificateStatus: "ACTIVE" as const,
        issuedAt: e.createdAt,
        expiresAt: null,
        region: e.city || "Unknown",
        sector: e.category || undefined,
      })),
    ];

    const filtered = search ? searchRegistry(entries, search) : entries;
    const stats = computeRegistryStats(entries);

    return {
      success: true as const,
      data: { entries: filtered, stats, totalEntries: entries.length },
    };
  } catch (error: any) {
    return { success: false as const, message: error.message || "Failed to load registry" };
  }
}
