import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/db/index";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
        return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    // Find the ecosystem builder profile for this user
    const builder = await prisma.ecosystemBuilder.findUnique({
      where: { userId: (session.user as any).id },
      include: {
        ecoApplications: {
          where: { status: "CERTIFIED" },
          take: 1
        }
      }
    });

    if (!builder) {
      return NextResponse.json({ 
        success: false, 
        error: "Ecosystem Builder profile not found. Please complete your registration first." 
      }, { status: 404 });
    }

    // BUSINESS RULE: Only certified builders can manage funding
    // We check both the boolean flag and if they have any CERTIFIED application
    const isActuallyCertified = builder.certified || builder.ecoApplications.length > 0;

    if (!isActuallyCertified) {
      return NextResponse.json({ 
        success: false, 
        error: "Your account must be certified before you can manage funding opportunities." 
      }, { status: 403 });
    }

    const opportunities = await prisma.fundingOpportunity.findMany({
      where: {
        creatorId: builder.id
      },
      include: {
        _count: {
          select: { applications: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    const formatted = opportunities.map((opp: any) => ({
      ...opp,
      applications: opp._count.applications,
      deadline: opp.deadline ? new Date(opp.deadline).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) : "Ongoing",
      createdAt: new Date(opp.createdAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
      sectors: Array.isArray(opp.sectors) ? (opp.sectors as string[]) : [],
      eligibility: Array.isArray(opp.eligibility) ? (opp.eligibility as string[]) : [],
      fundingUses: Array.isArray(opp.fundingUses) ? (opp.fundingUses as string[]) : [],
      applicationProcess: Array.isArray(opp.applicationProcess) ? (opp.applicationProcess as string[]) : [],
    }));

    return NextResponse.json({ success: true, data: formatted });
  } catch (error) {
    console.error("GET Funding Opportunities Error:", error);
    return NextResponse.json({ success: false, error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
        return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    // Find and verify the ecosystem builder profile
    const builder = await prisma.ecosystemBuilder.findUnique({
      where: { userId: (session.user as any).id },
      include: {
        ecoApplications: {
          where: { status: "CERTIFIED" },
          take: 1
        }
      }
    });

    if (!builder) {
      return NextResponse.json({ success: false, error: "Ecosystem Builder profile not found" }, { status: 404 });
    }

    // BUSINESS RULE: Only certified builders can create opportunities
    const isActuallyCertified = builder.certified || builder.ecoApplications.length > 0;

    if (!isActuallyCertified) {
      return NextResponse.json({ 
        success: false, 
        error: "Your account must be certified before you can create funding opportunities." 
      }, { status: 403 });
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
      applicationProcess 
    } = body;

    const opportunity = await prisma.fundingOpportunity.create({
      data: {
        title,
        description,
        longDescription,
        organization: builder.name, // Use the builder's name
        category,
        amountMin: parseFloat(amountMin) || 0,
        amountMax: parseFloat(amountMax) || 0,
        deadline: deadline ? new Date(deadline) : null,
        location,
        status: "draft",
        isActive: false,
        creatorId: builder.id, // Set the creator
        sectors: Array.isArray(sectors) ? sectors : sectors.split(',').map((s: string) => s.trim()).filter(Boolean),
        eligibility: Array.isArray(eligibility) ? eligibility : eligibility.split(',').map((e: string) => e.trim()).filter(Boolean),
        fundingUses: Array.isArray(fundingUses) ? fundingUses : fundingUses.split(',').map((f: string) => f.trim()).filter(Boolean),
        applicationProcess: Array.isArray(applicationProcess) ? applicationProcess : applicationProcess.split(',').map((a: string) => a.trim()).filter(Boolean),
        applicationUrl: "#",
        region: [],
      },
    });

    return NextResponse.json({ success: true, data: opportunity });
  } catch (error) {
    console.error("POST Funding Opportunity Error:", error);
    return NextResponse.json({ success: false, error: "Internal Server Error" }, { status: 500 });
  }
}
