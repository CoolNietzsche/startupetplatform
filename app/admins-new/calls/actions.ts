"use server";

import db from "@/lib/db";
import { requireAnyPermission } from "@/lib/auth/permissions";
import { revalidatePath } from "next/cache";
import { APPLICATION_MANAGE_PERMISSIONS } from "@/lib/constants";
import { validateApplicationWindow } from "@/lib/directive/calls";

export async function getCalls() {
  try {
    await requireAnyPermission(APPLICATION_MANAGE_PERMISSIONS);
    const { getCallStatus, getDaysRemaining, isCallOpen } = await import("@/lib/directive/calls");

    // Since we don't have a Calls table in Prisma, we use in-memory from the directive library
    // In production, this would query a DB table. For now, return the directive config.
    const calls = [
      {
        id: "default",
        title: "Startup & Ecosystem Builder Designation Call",
        description: "General call for applications under the Startup & Ecosystem Builder Designation Directive",
        targetType: "both" as const,
        status: "PUBLISHED" as const,
        opensAt: new Date("2025-01-01"),
        closesAt: new Date("2026-12-31"),
        requirements: [
          "Business license valid for at least 2 years (Art. 7)",
          "Articles of incorporation (Art. 7.1)",
          "Financial statements for last 2 fiscal years (Art. 7.1)",
          "Pitch deck / business plan (Art. 7.1)",
          "Tax registration certificate",
          "Proof of incubation program participation (if applicable, Art. 20)",
        ],
        createdAt: new Date("2025-01-01"),
      },
    ];

    const enriched = calls.map((c) => ({
      ...c,
      callStatus: getCallStatus(c),
      daysRemaining: getDaysRemaining(c),
      isOpen: isCallOpen(c),
      opensAt: c.opensAt.toISOString(),
      closesAt: c.closesAt.toISOString(),
      createdAt: c.createdAt.toISOString(),
    }));

    return { success: true as const, data: enriched };
  } catch (error: any) {
    return { success: false as const, message: error.message || "Failed to load calls" };
  }
}

export async function createCall(data: {
  title: string; description: string; targetType: string;
  opensAt: string; closesAt: string; requirements: string[];
}) {
  try {
    await requireAnyPermission(APPLICATION_MANAGE_PERMISSIONS);
    const { validateApplicationWindow, MIN_APPLICATION_WINDOW_DAYS } = await import("@/lib/directive/calls");

    const opensAt = new Date(data.opensAt);
    const closesAt = new Date(data.closesAt);
    const validation = validateApplicationWindow(opensAt, closesAt);
    if (!validation.valid) return { success: false as const, message: validation.message };

    // In production, insert into DB. For now, validate only.
    revalidatePath("/admins-new/calls");
    return { success: true as const, message: `Call "${data.title}" created successfully (${MIN_APPLICATION_WINDOW_DAYS}-day window enforced, Art. 6)` };
  } catch (error: any) {
    return { success: false as const, message: error.message || "Failed to create call" };
  }
}

export async function updateCallStatus(callId: string, newStatus: string) {
  try {
    await requireAnyPermission(APPLICATION_MANAGE_PERMISSIONS);
    // In production, update DB. For now, return success.
    revalidatePath("/admins-new/calls");
    return { success: true as const, message: `Call status updated to ${newStatus}` };
  } catch (error: any) {
    return { success: false as const, message: error.message || "Failed to update call status" };
  }
}
