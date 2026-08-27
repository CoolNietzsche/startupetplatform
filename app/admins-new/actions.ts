"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import db from "@/lib/db";

export type AdminDashboardStats = {
  totalStartups: number;
  pendingVerifications: number;
  activeUsers: number;
  newApplications: number;
  pendingReviews: number;
  certifiedStartups: number;
  certifiedEcosystemBuilders: number;
  successRate: number;
  certificationLevels: { level: string; count: number }[];
  ecosystemBuilders: { type: string; count: number }[];
  regionalDistribution: { region: string; count: number }[];
  monthlyApplications: { month: string; count: number }[];
  sectorDistribution: { sector: string; count: number }[];
  recentApplications: {
    id: string;
    name: string;
    type: string;
    category: string;
    submitted: string;
    status: string;
  }[];
};

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

export async function getAdminDashboardStats(): Promise<AdminDashboardStats> {
  const session = await getServerSession(authOptions);
  if (!session?.user || !["ADMIN", "SUPER_ADMIN"].includes((session.user as any).role)) {
    throw new Error("Unauthorized");
  }

  const [
    totalStartups,
    pendingApps,
    certifiedStartups,
    ecoBuilders,
    ecoCertified,
    recentApps,
    sectorAgg,
    regionAgg,
    startupLevels,
  ] = await Promise.all([
    db.application.count({ where: { status: { not: "DRAFT" } } }),
    db.application.count({ where: { status: { in: ["PENDING", "UNDER_REVIEW"] } } }),
    db.application.count({ where: { status: "CERTIFIED" } }),
    db.ecosystemBuilder.findMany({ select: { id: true, type: true, certified: true } }),
    db.ecosystemBuilder.count({ where: { certified: true } }),
    db.application.findMany({
      orderBy: { updatedAt: "desc" },
      take: 10,
      select: { id: true, startupName: true, industry: true, status: true, updatedAt: true, type: true },
    }),
    db.application.groupBy({ by: ["industry"], _count: { id: true } }),
    db.startup.groupBy({ by: ["region"], _count: { id: true } }),
    db.startup.groupBy({ by: ["level"], _count: { id: true } }),
  ]);

  const activeUsers = await db.user.count({ where: { isSuspended: false, deletedAt: null } });

  const allApplications = await db.application.findMany({
    where: { status: { not: "DRAFT" } },
    select: { createdAt: true },
  });

  const totalApps = totalStartups + ecoBuilders.length;
  const successRate = totalApps > 0 ? Math.round((certifiedStartups / totalApps) * 100) : 0;

  const certificationLevels = startupLevels.map((l) => ({
    level: l.level || "Unclassified",
    count: l._count.id,
  }));

  const ecoBuilderTypes: Record<string, number> = {};
  for (const b of ecoBuilders) {
    const t = b.type || "Other";
    ecoBuilderTypes[t] = (ecoBuilderTypes[t] || 0) + 1;
  }
  const ecosystemBuilders = Object.entries(ecoBuilderTypes).map(([type, count]) => ({ type, count }));

  const regionCount: Record<string, number> = {};
  for (const r of regionAgg) {
    const name = r.region || "Unknown";
    regionCount[name] = (regionCount[name] || 0) + r._count.id;
  }
  const regionalDistribution = Object.entries(regionCount).map(([region, count]) => ({ region, count }));

  const monthCount: Record<string, number> = {};
  for (const app of allApplications) {
    const monthName = MONTH_NAMES[app.createdAt.getMonth()];
    monthCount[monthName] = (monthCount[monthName] || 0) + 1;
  }
  const monthlyApplications = MONTH_NAMES.map((month) => ({
    month,
    count: monthCount[month] || 0,
  }));

  const sectorCount: Record<string, number> = {};
  for (const s of sectorAgg) {
    const name = s.industry || "Unknown";
    sectorCount[name] = (sectorCount[name] || 0) + s._count.id;
  }
  const sectorDistribution = Object.entries(sectorCount).map(([sector, count]) => ({ sector, count }));

  const recentApplications = recentApps.map((app) => ({
    id: app.id,
    name: app.startupName || "Unknown",
    type: app.type,
    category: app.industry || "N/A",
    submitted: app.updatedAt.toISOString().split("T")[0],
    status: app.status,
  }));

  return {
    totalStartups,
    pendingVerifications: pendingApps,
    activeUsers,
    newApplications: pendingApps,
    pendingReviews: pendingApps,
    certifiedStartups,
    certifiedEcosystemBuilders: ecoCertified,
    successRate,
    certificationLevels,
    ecosystemBuilders,
    regionalDistribution,
    monthlyApplications,
    sectorDistribution,
    recentApplications,
  };
}
