import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/db/index";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const { id: fundingOpportunityId } = await params;

    // Check if the user has a certified startup application OR is a certified ecosystem builder
    const [certifiedStartup, certifiedBuilder] = await Promise.all([
      prisma.application.findFirst({
        where: {
          userId: (session.user as any).id,
          status: "CERTIFIED"
        }
      }),
      prisma.ecosystemBuilder.findFirst({
        where: {
          userId: (session.user as any).id,
          certified: true
        }
      })
    ]);

    if (!certifiedStartup && !certifiedBuilder) {
      return NextResponse.json({ 
        success: false, 
        error: "Certification is required before you can apply for funding. Please complete your certification process first." 
      }, { status: 403 });
    }

    const body = await req.json();
    
    // The form sends data in nested objects: company, project, documents
    const { company, project, documents } = body;

    // Map form data to Prisma model
    const application = await prisma.fundingApplication.create({
      data: {
        fundingOpportunityId,
        userId: (session.user as any).id,
        // Company details
        companyName: company.companyName,
        registrationNumber: company.registrationNumber,
        foundingDate: company.foundingDate,
        companySize: company.companySize,
        website: company.website,
        address: company.address,
        city: company.city,
        // Applicant details
        applicantName: company.contactName,
        email: company.contactEmail,
        phone: company.contactPhone,
        // Project details
        projectTitle: project.projectTitle,
        projectDescription: project.projectDescription,
        sector: project.sector,
        impactArea: project.impactArea,
        requestedAmount: (() => {
          const value = project.fundingAmount || "0";
          // If range like "5000-10000", take the second number
          if (value.includes("-")) {
            const parts = value.split("-");
            return parseFloat(parts[1].replace(/[^0-9.]/g, '')) || 0;
          }
          // Otherwise just strip non-numeric
          return parseFloat(value.replace(/[^0-9.]/g, '')) || 0;
        })(),
        timeline: project.timeline,
        teamSize: project.teamSize,
        previousFunding: project.previousFunding,
        challenge: project.challenge,
        solution: project.solution,
        // Documents (URLs or paths - currently these are just filenames from mock)
        businessPlan: documents.businessPlan,
        financialProjections: documents.financialProjections,
        teamCV: documents.teamCV,
        presentationDeck: documents.presentationDeck,
        proofOfRegistration: documents.proofOfRegistration,
        // Default status
        status: "pending"
      }
    });

    return NextResponse.json({ success: true, data: application });
  } catch (error) {
    console.error("POST Funding Application Error:", error);
    return NextResponse.json({ success: false, error: "Internal Server Error" }, { status: 500 });
  }
}
