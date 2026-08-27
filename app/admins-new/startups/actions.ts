"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import db from "@/lib/db";

export async function getStartups() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return { success: false, message: "Unauthorized" };
    }

    const startups = await db.startup.findMany({
      include: {
        application: {
          include: {
            founders: true,
          }
        },
        user: true,
        certificate: true,
      },
      orderBy: { createdAt: "desc" },
    });

    const mappedStartups = startups.map((s) => ({
      id: s.id,
      name: s.name,
      logo: null, // We don't have a logo field yet, maybe use initials in UI
      sector: s.application.industry || "General",
      location: s.user.address || "Unknown",
      founded: s.application.foundingDate ? new Date(s.application.foundingDate).getFullYear() : "N/A",
      employees: s.application.numberOfEmployees || 0,
      stage: s.application.typeOfCompany || "Seed",
      website: s.application.website || "#",
      description: s.application.productDescription || "",
      status: "Certified",
      certification: {
        id: s.certificate.id,
        level: s.level.replace("level-", "Level "),
        issued: s.issuedAt.toISOString().split("T")[0],
        expiry: s.expiresAt?.toISOString().split("T")[0] || "N/A",
      },
      founders: s.application.founders.map(f => ({
        name: f.fullName,
        role: f.role || "Founder",
        email: f.email || ""
      })),
      tags: [s.application.industry].filter(Boolean) as string[],
    }));

    return { success: true, data: mappedStartups };
  } catch (error) {
    console.error("Failed to fetch startups:", error);
    return { success: false, message: "Failed to fetch startups" };
  }
}

export async function getStartupStats() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return { success: false, message: "Unauthorized" };
    }

    const [totalApplications, startupsCount, pendingCount, underReviewCount, rejectedCount] = await Promise.all([
      db.application.count(),
      db.startup.count(),
      db.application.count({ where: { status: "COMMITTEE_REVIEW_SUBMITTED" } }), // Simplified as "Pending Certification"
      db.application.count({ where: { status: "UNDER_REVIEW" } }),
      db.application.count({ where: { status: "REJECTED" } }),
    ]);

    // Aggregate by sector from applications linked to startups
    const startupsWithApplications = await db.startup.findMany({
      include: { application: true }
    });

    const sectorCounts: Record<string, number> = {};
    const stageCounts: Record<string, number> = {};

    startupsWithApplications.forEach(s => {
      const sector = s.application.industry || "Other";
      sectorCounts[sector] = (sectorCounts[sector] || 0) + 1;

      const stage = s.application.typeOfCompany || "Seed";
      stageCounts[stage] = (stageCounts[stage] || 0) + 1;
    });

    return {
      success: true,
      data: {
        total: totalApplications,
        certified: startupsCount,
        pending: pendingCount,
        underReview: underReviewCount,
        rejected: rejectedCount,
        bySector: sectorCounts,
        byStage: stageCounts,
      }
    };
  } catch (error) {
    console.error("Failed to fetch startup stats:", error);
    return { success: false, message: "Failed to fetch stats" };
  }
}

export async function getStartupById(id: string) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return { success: false, message: "Unauthorized" };
    }

    const s = await db.startup.findUnique({
      where: { id },
      include: {
        application: {
          include: {
            founders: true,
          },
        },
        user: true,
        certificate: true,
      },
    });

    if (!s) {
      return { success: false, message: "Startup not found" };
    }

    const mappedStartup = {
      id: s.id,
      name: s.name,
      logo: null,
      sector: s.application.industry || "General",
      location: s.user.address || "Unknown",
      address: s.user.address || "Unknown",
      phone: s.user.phoneNumber || "",
      email: s.user.email || "",
      founded: s.application.foundingDate
        ? new Date(s.application.foundingDate).getFullYear()
        : "N/A",
      employees: s.application.numberOfEmployees || 0,
      stage: s.application.typeOfCompany || "Seed",
      website: s.application.website || "#",
      description: s.application.productDescription || "",
      status: "Certified",
      certification: {
        id: s.certificate?.id,
        certificate_id: s.certificate?.id.slice(-8).toUpperCase(),
        level: s.level.replace("level-", "Level "),
        issued: s.issuedAt.toISOString().split("T")[0],
        expiry: s.expiresAt?.toISOString().split("T")[0] || "N/A",
      },
      financials: {
        fundingTotal: s.application.totalFundingRaised || "N/A",
        revenue: s.application.revenue ? { "Current": s.application.revenue } : null,
        investmentNeeded: s.application.investmentNeeded,
        useOfFunds: s.application.useOfFunds,
      },
      founders: s.application.founders.map((f) => ({
        name: f.fullName,
        role: f.role || "Founder",
        email: f.email || "",
      })),
      documents: [
        s.application.pitchDeckFileId && { name: "Pitch Deck", id: s.application.pitchDeckFileId, type: "Business", status: "Verified", date: s.application.updatedAt.toISOString().split('T')[0] },
        s.application.financialsFileId && { name: "Financial Statements", id: s.application.financialsFileId, type: "Financial", status: "Verified", date: s.application.updatedAt.toISOString().split('T')[0] },
        s.application.businessLicenseFileId && { name: "Business License", id: s.application.businessLicenseFileId, type: "Legal", status: "Verified", date: s.application.updatedAt.toISOString().split('T')[0] },
      ].filter(Boolean),
      tags: [s.application.industry].filter(Boolean) as string[],
    };

    return { success: true, data: mappedStartup };
  } catch (error) {
    console.error("Failed to fetch startup:", error);
    return { success: false, message: "Failed to fetch startup" };
  }
}

export async function updateCertificateStatus(certificateId: string, status: "ACTIVE" | "PAUSED" | "REVOKED" | "EXPIRED") {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return { success: false, message: "Unauthorized" };
    }

    // Verify admin role if necessary, for now assume session check is enough as this is in admins-new
    
    await db.certificate.update({
      where: { id: certificateId },
      data: { status }
    });

    // If it's a startup certificate, sync status with application if needed
    // However, usually we keep Application as CERTIFIED and only change Certificate status.

    return { success: true, message: `Certificate status updated to ${status}` };
  } catch (error) {
    console.error("Failed to update certificate status:", error);
    return { success: false, message: "Failed to update certificate status" };
  }
}
