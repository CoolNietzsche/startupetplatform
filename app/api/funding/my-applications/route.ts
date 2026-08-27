import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/db/index";

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const userId = (session.user as any).id;

    const applications = await prisma.fundingApplication.findMany({
      where: {
        userId
      },
      include: {
        opportunity: true
      },
      orderBy: {
        submittedDate: 'desc'
      }
    });

    const normaliseStatus = (status: string): string => {
      const s = status.toLowerCase();
      if (["pending", "under_review", "shortlisted"].includes(s)) return "review";
      if (["approved", "certified"].includes(s)) return "approved";
      if (["declined", "rejected"].includes(s)) return "declined";
      if (s === "draft") return "draft";
      return s;
    };

    const formattedApplications = applications.map(app => ({
      id: app.id,
      opportunityId: app.fundingOpportunityId,
      programName: app.opportunity.title,
      status: app.status.replace(/_/g, ' ').replace(/\b\w/g, (c: string) => c.toUpperCase()),
      statusType: normaliseStatus(app.status),
      fundingAmount: app.requestedAmount.toLocaleString(),
      submissionDate: new Date(app.submittedDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
      reviewDate: app.opportunity.deadline ? new Date(app.opportunity.deadline).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) : "N/A",
      category: app.opportunity.category,
      provider: app.opportunity.organization,
    }));

    return NextResponse.json({ success: true, data: formattedApplications });
  } catch (error) {
    console.error("GET My Applications Error:", error);
    return NextResponse.json({ success: false, error: "Internal Server Error" }, { status: 500 });
  }
}
