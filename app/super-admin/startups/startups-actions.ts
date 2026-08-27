"use server";

import db from "@/lib/db/index";
import { revalidatePath } from "next/cache";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { requireAnyPermission } from "@/lib/auth/permissions";
import { PERMISSIONS } from "@/lib/auth/permission-codes";
import { ApplicationStatus } from "@prisma/client";

async function requireSuperAdminAccess() {
  const session = await getServerSession(authOptions);
  if (!session?.user) throw new Error("Unauthorized");
  if ((session.user as any).role !== "SUPER_ADMIN") throw new Error("Forbidden: Super Admin access required");
  await requireAnyPermission([PERMISSIONS.SYS_DASHBOARD_ACCESS]);
}

export async function getStartups(params?: {
  search?: string;
  sector?: string | "all";
  region?: string | "all";
  status?: string | "all";
}) {
  try {
    await requireSuperAdminAccess();

    const search = (params?.search || "").trim();
    const sector = params?.sector || "all";
    const region = params?.region || "all";
    const status = params?.status || "all";

    const where: any = {
      status: { not: ApplicationStatus.DRAFT },
    };

    if (sector !== "all") where.industry = sector;
    if (status !== "all") {
      if (status === "Certified") where.status = ApplicationStatus.CERTIFIED;
      else if (status === "Pending") where.status = { in: [ApplicationStatus.PENDING, ApplicationStatus.UNDER_REVIEW, ApplicationStatus.REVIEWED, ApplicationStatus.ASSIGNED_TO_COMMITTEE, ApplicationStatus.IN_COMMITTEE_REVIEW, ApplicationStatus.COMMITTEE_REVIEW_SUBMITTED] };
      else if (status === "Rejected") where.status = ApplicationStatus.REJECTED;
    }

    if (search) {
      where.OR = [
        { startupName: { contains: search, mode: "insensitive" } },
        { user: { firstName: { contains: search, mode: "insensitive" } } },
        { user: { lastName: { contains: search, mode: "insensitive" } } },
        { industry: { contains: search, mode: "insensitive" } },
      ];
    }

    // Since address is a single field in User, we might need to filter by it if region is passed
    // But region is not explicitly in Application. Let's assume region filter is on industry or similar if not found
    // Or just skip region filter for now if it's not in the model.
    // Actually, let's look for address in User.
    if (region !== "all") {
      where.user = {
        address: { contains: region, mode: "insensitive" }
      };
    }

    const applications = await db.application.findMany({
      where,
      orderBy: { createdAt: "desc" },
      include: {
        user: true,
        startup: true,
      },
    });

    return {
      success: true,
      data: applications.map((app) => ({
        id: app.id,
        name: app.startupName || "Unnamed Startup",
        sector: app.industry || "N/A",
        stage: app.typeOfCompany || "N/A",
        region: app.user.address || "Addis Ababa", // Default if blank
        city: app.user.address || "Addis Ababa",
        foundedDate: app.foundingDate ? app.foundingDate.toISOString().split('T')[0] : "N/A",
        certificationStatus: app.status === ApplicationStatus.CERTIFIED ? "Certified" : 
                            (app.status === ApplicationStatus.REJECTED ? "Rejected" : "Pending"),
        certificationLevel: app.startup?.level || "N/A",
        employeeCount: app.numberOfEmployees || 0,
        fundingRaised: parseFloat(app.totalFundingRaised || "0") || 0,
        founder: `${app.user.firstName} ${app.user.lastName}`,
        email: app.email || app.user.email,
        phone: app.phoneNumber || app.user.phoneNumber || "N/A",
        website: app.website || "N/A",
        description: app.productDescription || "N/A",
        revenueModel: app.revenue || "N/A",
      })),
    };
  } catch (error: any) {
    console.error("getStartups failed:", error);
    return {
      success: false,
      message: error.message || "Failed to fetch startups",
    };
  }
}

export async function suspendStartup(id: string) {
  try {
    await requireSuperAdminAccess();
    // Suspend could mean many things, for now let's just mark the application as rolled back or something.
    // Or if they have a startup record, we could delete it.
    // Let's just update the status to ROLLED_BACK for now.
    await db.application.update({
      where: { id },
      data: { status: ApplicationStatus.ROLLED_BACK },
    });
    revalidatePath("/super-admin/startups");
    return { success: true };
  } catch (error: any) {
    return { success: false, message: error.message };
  }
}

export async function revokeStartupCertification(id: string) {
  try {
    await requireSuperAdminAccess();
    // Revoke means taking it away from CERTIFIED status
    await db.application.update({
      where: { id },
      data: { status: ApplicationStatus.REJECTED },
    });
    // Also delete any associated Startup record
    await db.startup.deleteMany({
      where: { applicationId: id }
    });
    revalidatePath("/super-admin/startups");
    return { success: true };
  } catch (error: any) {
    return { success: false, message: error.message };
  }
}
