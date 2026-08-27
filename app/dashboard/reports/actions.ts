"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import db from "@/lib/db";

export type PendingReport = {
  id: string;
  programName: string;
  reportType: string;
  dueDate: string;
  daysLeft: number;
  requirements: string[];
};

export type SubmittedReport = {
  id: string;
  title: string;
  programName: string;
  reportType: string;
  submittedDate: string;
  status: string;
  feedback: string | null;
};

export type DashboardReportsData = {
  pendingReports: PendingReport[];
  submittedReports: SubmittedReport[];
};

async function getStartupId(): Promise<string> {
  const session = await getServerSession(authOptions);
  if (!session?.user) throw new Error("Unauthorized");

  const user = await db.user.findUnique({
    where: { id: session.user.id },
    include: { startup: true },
  });

  if (!user?.startup) throw new Error("No startup profile found");
  return user.startup.id;
}

export async function getDashboardReportsData(): Promise<DashboardReportsData> {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  const [userFundingApps, formalRequests] = await Promise.all([
    db.fundingApplication.findMany({
      where: { userId: session.user.id },
      include: { opportunity: { select: { title: true, category: true, deadline: true } } },
      orderBy: { submittedDate: "desc" },
    }),
    db.formalRequest.findMany({
      where: { sender: { userId: session.user.id } },
      include: { recipient: { select: { name: true } } },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  const reportTypeMap: Record<string, string> = {
    GRANT: "Financial Report",
    INVESTMENT: "Quarterly Progress",
    ACCELERATOR: "Milestone Report",
  };

  const pendingReports: PendingReport[] = userFundingApps
    .filter((app) => app.opportunity?.deadline)
    .map((app) => {
      const now = new Date();
      const deadline = new Date(app.opportunity.deadline!);
      const daysLeft = Math.max(0, Math.ceil((deadline.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));

      return {
        id: app.id,
        programName: app.opportunity.title,
        reportType: reportTypeMap[app.opportunity.category] || "Progress Report",
        dueDate: deadline.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
        daysLeft,
        requirements: ["Progress summary", "Key metrics", "Financial update"],
      };
    });

  const statusMap: Record<string, string> = {
    PENDING: "Under Review",
    ACCEPTED: "Approved",
    REJECTED: "Rejected",
    CANCELLED: "Cancelled",
  };

  const feedbackMap: Record<string, string> = {
    APPROVED: "Your report has been reviewed and accepted. Thank you for your submission.",
    REJECTED: "Your report requires revisions. Please review the feedback and resubmit.",
  };

  const submittedReports: SubmittedReport[] = formalRequests.map((req) => ({
    id: req.id,
    title: req.subject,
    programName: req.recipient?.name || "Stakeholder",
    reportType: "Formal Request",
    submittedDate: req.createdAt.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" }),
    status: statusMap[req.status] || req.status,
    feedback: req.status === "ACCEPTED" ? feedbackMap.APPROVED : req.status === "REJECTED" ? feedbackMap.REJECTED : null,
  }));

  return { pendingReports, submittedReports };
}
