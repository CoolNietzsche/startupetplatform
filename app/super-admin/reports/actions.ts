"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import db from "@/lib/db";

export type ReportSubmissionItem = {
  id: string;
  entityId: string;
  entityType: string;
  reportType: string;
  notes: string | null;
  fileIds: string[];
  status: string;
  submittedAt: Date;
  submittedBy: { name: string | null; email: string } | null;
  entityName: string | null;
};

export type ReportSubmissionsData = {
  submissions: ReportSubmissionItem[];
  total: number;
  stats: { submitted: number; approved: number; rejected: number; total: number };
};

export async function getReportSubmissions(filters?: {
  status?: string;
  reportType?: string;
  entityType?: string;
}): Promise<ReportSubmissionsData> {
  const session = await getServerSession(authOptions);
  if (!session?.user || !["SUPER_ADMIN", "ADMIN"].includes((session.user as any).role)) {
    throw new Error("Unauthorized");
  }

  const where: any = {};
  if (filters?.status) where.status = filters.status;
  if (filters?.reportType) where.reportType = filters.reportType;
  if (filters?.entityType) where.entityType = filters.entityType;

  const submissions = await db.reportSubmission.findMany({
    where,
    orderBy: { submittedAt: "desc" },
    include: {
      submitter: { select: { name: true, email: true } },
    },
  });

  // Resolve entity names from Application or EcoApplication
  const startupIds = submissions.filter((s) => s.entityType === "startup").map((s) => s.entityId);
  const ecoIds = submissions.filter((s) => s.entityType === "ecosystem").map((s) => s.entityId);

  const [startups, ecosystems] = await Promise.all([
    startupIds.length
      ? db.application.findMany({ where: { id: { in: startupIds } }, select: { id: true, name: true } })
      : [],
    ecoIds.length
      ? db.ecoApplication.findMany({ where: { id: { in: ecoIds } }, select: { id: true, name: true } })
      : [],
  ]);

  const entityNames: Record<string, string> = {};
  startups.forEach((s) => { entityNames[s.id] = s.name; });
  ecosystems.forEach((e) => { entityNames[e.id] = e.name; });

  const items: ReportSubmissionItem[] = submissions.map((s) => ({
    id: s.id,
    entityId: s.entityId,
    entityType: s.entityType,
    reportType: s.reportType,
    notes: s.notes,
    fileIds: (s.fileIds as string[]) || [],
    status: s.status,
    submittedAt: s.submittedAt,
    submittedBy: s.submitter ? { name: s.submitter.name, email: s.submitter.email } : null,
    entityName: entityNames[s.entityId] || "Unknown",
  }));

  const stats = {
    submitted: submissions.filter((s) => s.status === "SUBMITTED").length,
    approved: submissions.filter((s) => s.status === "APPROVED").length,
    rejected: submissions.filter((s) => s.status === "REJECTED").length,
    total: submissions.length,
  };

  return { submissions: items, total: items.length, stats };
}

export async function approveReport(id: string) {
  const session = await getServerSession(authOptions);
  if (!session?.user || !["SUPER_ADMIN", "ADMIN"].includes((session.user as any).role)) {
    throw new Error("Unauthorized");
  }
  await db.reportSubmission.update({ where: { id }, data: { status: "APPROVED" } });
  return { success: true };
}

export async function rejectReport(id: string) {
  const session = await getServerSession(authOptions);
  if (!session?.user || !["SUPER_ADMIN", "ADMIN"].includes((session.user as any).role)) {
    throw new Error("Unauthorized");
  }
  await db.reportSubmission.update({ where: { id }, data: { status: "REJECTED" } });
  return { success: true };
}

export async function deleteReport(id: string) {
  const session = await getServerSession(authOptions);
  if (!session?.user || (session.user as any).role !== "SUPER_ADMIN") {
    throw new Error("Unauthorized — super-admin only");
  }
  await db.reportSubmission.delete({ where: { id } });
  return { success: true };
}
