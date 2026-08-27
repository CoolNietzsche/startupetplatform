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

    // BUSINESS RULE: Only certified builders can manage applications
    const isActuallyCertified = builder.certified || builder.ecoApplications.length > 0;

    if (!isActuallyCertified) {
      return NextResponse.json({ 
        success: false, 
        error: "Your account must be certified before you can manage funding applications." 
      }, { status: 403 });
    }

    // Get all applications for all opportunities created by this builder
    const applications = await prisma.fundingApplication.findMany({
      where: {
        opportunity: {
          creatorId: builder.id
        }
      },
      include: {
        opportunity: {
          select: {
            title: true
          }
        },
        user: {
          select: {
            firstName: true,
            lastName: true,
            email: true
          }
        }
      },
      orderBy: { submittedDate: 'desc' }
    });

    return NextResponse.json({ 
      success: true, 
      data: applications 
    });
  } catch (error) {
    console.error("GET Applications Error:", error);
    return NextResponse.json({ success: false, error: "Internal Server Error" }, { status: 500 });
  }
}
