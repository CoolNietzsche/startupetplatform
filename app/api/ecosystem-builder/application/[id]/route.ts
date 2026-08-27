import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/db/index";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

function toPortalStatus(status: string, certified: boolean): "pending" | "under_review" | "certified" | "rejected" {
  if (status === "PENDING") return "pending";
  if (certified || status === "CERTIFIED") return "certified";
  if (status === "REJECTED") return "rejected";
  return "under_review";
}

function toYearsOfOperation(established: number | null): number | null {
  if (!established) return null;
  return Math.max(0, new Date().getFullYear() - established);
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 },
      );
    }

    const { id } = await params;

    const application = await db.ecoApplication.findFirst({
      where: {
        id,
        builder: {
          userId: session.user.id,
          deletedAt: null,
        },
      },
      include: {
        builder: true,
        certificate: true,
        assignments: {
          include: {
            decision: true,
            memberReviews: {
              include: {
                member: {
                  include: {
                    user: {
                      select: {
                        firstName: true,
                        lastName: true,
                      }
                    }
                  }
                }
              }
            }
          }
        }
      },
    });

    if (!application) {
      return NextResponse.json(
        { success: false, error: "Application not found" },
        { status: 404 }
      );
    }

    const status = toPortalStatus(application.status, application.builder.certified);

    // Fetch file names
    let businessLicenseFileName = null;
    let taxRegistrationFileName = null;

    if (application.businessLicenseFileId) {
      const file = await db.file.findUnique({
        where: { id: application.businessLicenseFileId },
        select: { originalName: true },
      });
      if (file) businessLicenseFileName = file.originalName;
    }

    if (application.taxRegistrationFileId) {
      const file = await db.file.findUnique({
        where: { id: application.taxRegistrationFileId },
        select: { originalName: true },
      });
      if (file) taxRegistrationFileName = file.originalName;
    }

    return NextResponse.json({
      success: true,
      data: {
        id: application.id,
        builderId: application.builder.id,
        status,
        workflowStatus: application.status,
        certified: application.builder.certified,
        name: application.name,
        type: application.type,
        location: application.location,
        address: application.address,
        city: application.city,
        region: application.region,
        contactName: application.contactName,
        contactEmail: application.contactEmail,
        contactPhone: application.contactPhone,
        website: application.website,
        services: application.services,
        description: application.description,
        serviceDescription: application.serviceDescription,
        impactDescription: application.impactDescription,
        established: application.established,
        yearsOfOperation: toYearsOfOperation(application.established),
        capacity: application.capacity,
        businessLicenseFileId: application.businessLicenseFileId,
        taxRegistrationFileId: application.taxRegistrationFileId,
        businessLicenseFileName,
        taxRegistrationFileName,
        submittedAt: application.submittedAt,
        validatedAt: application.validatedAt,
        rejectedReason: application.rejectedReason,
        createdAt: application.createdAt,
        updatedAt: application.updatedAt,
        certificate: application.certificate ? {
          id: application.certificate.id,
          certificateNumber: application.certificate.certificateNumber,
          issuedAt: application.certificate.issuedAt,
          filePath: application.certificate.filePath,
        } : null,
        committeeDecision: application.assignments?.[0]?.decision ? {
          summary: application.assignments[0].decision.summary,
          finalDecision: application.assignments[0].decision.finalDecision,
          submittedAt: application.assignments[0].decision.submittedAt,
        } : null,
        committeeReviews: [], // Individual committee reviews are not exposed to the applicant
      },
    });
  } catch (error) {
    console.error("Fetch application by ID failed:", error);
    return NextResponse.json(
      { success: false, error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
