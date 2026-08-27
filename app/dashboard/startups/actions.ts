"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import db from "@/lib/db";

export type DashboardStartupItem = {
  id: string;
  name: string;
  sector: string;
  founded: number | "N/A";
  description: string;
  status: string;
  stage: string;
};

export async function getStartupsForDashboard() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return { success: false, message: "Unauthorized", data: [] as DashboardStartupItem[] };
    }

    const startups = await db.startup.findMany({
      include: {
        application: true,
      },
      orderBy: { createdAt: "desc" },
    });

    const data: DashboardStartupItem[] = startups.map((s) => ({
      id: s.id,
      name: s.name,
      sector: s.application.industry || "General",
      founded: s.application.foundingDate
        ? new Date(s.application.foundingDate).getFullYear()
        : "N/A",
      description: s.application.productDescription || "",
      status: "Certified",
      stage: s.application.typeOfCompany || "Seed",
    }));

    return { success: true, data };
  } catch (error) {
    console.error("Failed to fetch startups:", error);
    return { success: false, message: "Failed to fetch startups", data: [] as DashboardStartupItem[] };
  }
}

export type DashboardStartupDetail = {
  id: string;
  name: string;
  logo: string | null;
  sector: string;
  location: string;
  address: string;
  phone: string;
  email: string;
  founded: number | "N/A";
  employees: number;
  stage: string;
  website: string;
  description: string;
  status: string;
  certification: {
    id: string;
    certificate_id: string;
    level: string;
    issued: string;
    expiry: string;
  };
  financials: {
    fundingTotal: string;
    revenue: Record<string, string> | null;
    investmentNeeded: string | null;
    useOfFunds: string | null;
  };
  founders: { name: string; role: string; email: string }[];
  documents: { name: string; id: string; type: string; status: string; date: string }[];
  tags: string[];
};

export async function getStartupByIdForDashboard(id: string) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return { success: false, message: "Unauthorized", data: null };
    }

    const s = await db.startup.findUnique({
      where: { id },
      include: {
        application: {
          include: { founders: true },
        },
        user: true,
        certificate: true,
      },
    });

    if (!s) {
      return { success: false, message: "Startup not found", data: null };
    }

    const data: DashboardStartupDetail = {
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
        id: s.certificate.id,
        certificate_id: s.certificate.id.slice(-8).toUpperCase(),
        level: s.level.replace("level-", "Level "),
        issued: s.issuedAt.toISOString().split("T")[0],
        expiry: s.expiresAt?.toISOString().split("T")[0] || "N/A",
      },
      financials: {
        fundingTotal: s.application.totalFundingRaised || "N/A",
        revenue: s.application.revenue ? { Current: s.application.revenue } : null,
        investmentNeeded: s.application.investmentNeeded,
        useOfFunds: s.application.useOfFunds,
      },
      founders: s.application.founders.map((f) => ({
        name: f.fullName,
        role: f.role || "Founder",
        email: f.email || "",
      })),
      documents: [
        s.application.pitchDeckFileId && {
          name: "Pitch Deck",
          id: s.application.pitchDeckFileId,
          type: "Business",
          status: "Verified",
          date: s.application.updatedAt.toISOString().split("T")[0],
        },
        s.application.financialsFileId && {
          name: "Financial Statements",
          id: s.application.financialsFileId,
          type: "Financial",
          status: "Verified",
          date: s.application.updatedAt.toISOString().split("T")[0],
        },
        s.application.businessLicenseFileId && {
          name: "Business License",
          id: s.application.businessLicenseFileId,
          type: "Legal",
          status: "Verified",
          date: s.application.updatedAt.toISOString().split("T")[0],
        },
      ].filter(Boolean) as DashboardStartupDetail["documents"],
      tags: [s.application.industry].filter(Boolean) as string[],
    };

    return { success: true, data };
  } catch (error) {
    console.error("Failed to fetch startup:", error);
    return { success: false, message: "Failed to fetch startup", data: null };
  }
}

export async function getPublicStartups() {
  try {
    const startups = await db.startup.findMany({
      include: {
        application: true,
      },
      orderBy: { createdAt: "desc" },
    });

    const data: DashboardStartupItem[] = startups.map((s: any) => ({
      id: s.id,
      name: s.name,
      sector: s.application?.industry || "General",
      founded: s.application?.foundingDate
        ? new Date(s.application.foundingDate).getFullYear()
        : "N/A",
      description: s.application?.productDescription || "",
      status: "Certified",
      stage: s.application?.typeOfCompany || "Seed",
    }));

    return { success: true, data };
  } catch (error) {
    console.error("Failed to fetch public startups:", error);
    return { success: false, message: "Failed to fetch startups", data: [] as DashboardStartupItem[] };
  }
}
