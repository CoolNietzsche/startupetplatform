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

    const builder = await prisma.ecosystemBuilder.findUnique({
      where: { userId: (session.user as any).id }
    });

    if (!builder) {
      return NextResponse.json({ success: false, error: "Ecosystem Builder profile not found" }, { status: 404 });
    }

    const opportunity = await prisma.fundingOpportunity.findUnique({
      where: {
        id,
        creatorId: builder.id
      },
      include: {
        applications: {
          orderBy: { submittedDate: 'desc' },
          include: {
            user: {
              select: {
                firstName: true,
                lastName: true,
                email: true
              }
            }
          }
        },
        _count: {
          select: { applications: true }
        }
      }
    });

    if (!opportunity) {
      return NextResponse.json({ success: false, error: "Opportunity not found or access denied" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      data: {
        ...opportunity,
        applicationsCount: opportunity._count.applications,
        deadline: opportunity.deadline ? new Date(opportunity.deadline).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) : "Ongoing",
        createdAt: new Date(opportunity.createdAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
      }
    });
  } catch (error) {
    console.error("GET Funding Opportunity Error:", error);
    return NextResponse.json({ success: false, error: "Internal Server Error" }, { status: 500 });
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    const builder = await prisma.ecosystemBuilder.findUnique({
      where: { userId: (session.user as any).id }
    });

    if (!builder) {
      return NextResponse.json({ success: false, error: "Ecosystem Builder profile not found" }, { status: 404 });
    }

    // Check ownership
    const existing = await prisma.fundingOpportunity.findUnique({
      where: { id }
    });

    if (!existing || existing.creatorId !== builder.id) {
      return NextResponse.json({ success: false, error: "Forbidden: You do not own this opportunity" }, { status: 403 });
    }

    const body = await req.json();
    const {
      title,
      description,
      longDescription,
      category,
      amountMin,
      amountMax,
      deadline,
      location,
      sectors,
      eligibility,
      fundingUses,
      applicationProcess,
      status,
      isActive
    } = body;

    const data: any = {
      title,
      description,
      longDescription,
      category,
      amountMin: parseFloat(amountMin) || undefined,
      amountMax: parseFloat(amountMax) || undefined,
      deadline: deadline ? new Date(deadline) : undefined,
      location,
      status,
      isActive,
      sectors: Array.isArray(sectors) ? sectors : sectors?.split(',').map((s: string) => s.trim()).filter(Boolean),
      eligibility: Array.isArray(eligibility) ? eligibility : eligibility?.split(',').map((e: string) => e.trim()).filter(Boolean),
      fundingUses: Array.isArray(fundingUses) ? fundingUses : fundingUses?.split(',').map((f: string) => f.trim()).filter(Boolean),
      applicationProcess: Array.isArray(applicationProcess) ? applicationProcess : applicationProcess?.split(',').map((a: string) => a.trim()).filter(Boolean),
    };

    // Remove undefined fields
    Object.keys(data).forEach(key => data[key] === undefined && delete data[key]);

    const opportunity = await prisma.fundingOpportunity.update({
      where: { id },
      data
    });

    return NextResponse.json({ success: true, data: opportunity });
  } catch (error) {
    console.error("PUT Funding Opportunity Error:", error);
    return NextResponse.json({ success: false, error: "Internal Server Error" }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    const builder = await prisma.ecosystemBuilder.findUnique({
      where: { userId: (session.user as any).id }
    });

    if (!builder) {
      return NextResponse.json({ success: false, error: "Ecosystem Builder profile not found" }, { status: 404 });
    }

    // Check ownership
    const existing = await prisma.fundingOpportunity.findUnique({
      where: { id }
    });

    if (!existing || existing.creatorId !== builder.id) {
      return NextResponse.json({ success: false, error: "Forbidden: You do not own this opportunity" }, { status: 403 });
    }

    await prisma.fundingOpportunity.delete({
      where: { id }
    });

    return NextResponse.json({ success: true, message: "Deleted successfully" });
  } catch (error) {
    console.error("DELETE Funding Opportunity Error:", error);
    return NextResponse.json({ success: false, error: "Internal Server Error" }, { status: 500 });
  }
}
