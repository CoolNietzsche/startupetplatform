import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/db/index";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    const opportunity = await prisma.fundingOpportunity.findUnique({
      where: { id },
      include: {
        creator: true,
        _count: {
          select: { applications: true }
        }
      }
    });

    if (!opportunity) {
      return NextResponse.json({ success: false, error: "Opportunity not found" }, { status: 404 });
    }

    // Format for frontend
    const formatted = {
      ...opportunity,
      applicationCount: opportunity._count.applications,
      deadlineFormatted: opportunity.deadline ? new Date(opportunity.deadline).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) : "Ongoing",
      daysLeft: opportunity.deadline ? Math.max(0, Math.ceil((new Date(opportunity.deadline).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))) : 999,
      // Ensure JSON fields are handled
      sectors: Array.isArray(opportunity.sectors) ? opportunity.sectors : [],
      eligibility: Array.isArray(opportunity.eligibility) ? opportunity.eligibility : [],
      fundingUses: Array.isArray(opportunity.fundingUses) ? opportunity.fundingUses : [],
      applicationProcess: Array.isArray(opportunity.applicationProcess) ? opportunity.applicationProcess : [],
      selectionCriteria: [], // Default empty as it's not in schema yet
      faq: [],              // Default empty
      previousRecipients: [], // Default empty
      requiredDocuments: [], // Default empty
      startDate: opportunity.createdAt ? new Date(opportunity.createdAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) : "Recently"
    };

    const userId = (session.user as any).id;
    const userCertified = await prisma.application.findFirst({
      where: { userId, status: "CERTIFIED" }
    }) !== null;

    return NextResponse.json({ success: true, data: formatted, userCertified });
  } catch (error) {
    console.error("GET Funding Details Error:", error);
    return NextResponse.json({ success: false, error: "Internal Server Error" }, { status: 500 });
  }
}
