import { NextResponse } from "next/server";
import db from "@/lib/db/index";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

function toPortalStatus(status: string, certified: boolean): "draft" | "pending" | "under_review" | "certified" | "rejected" {
  if (status === "DRAFT") return "draft";
  if (status === "PENDING") return "pending";
  if (certified || status === "CERTIFIED") return "certified";
  if (status === "REJECTED") return "rejected";
  return "under_review";
}

function canEditApplication(status: string, certified: boolean): boolean {
  return !certified && status === "DRAFT";
}

function buildApplicationSignature(application: {
  status: string;
  name: string;
  type: string;
  location: string;
  region: string;
  website: string | null;
  services: unknown;
  description: string | null;
  established: number | null;
  capacity: number | null;
  businessLicenseFileId: string | null;
  taxRegistrationFileId: string | null;
}) {
  return JSON.stringify({
    status: application.status,
    name: application.name,
    type: application.type,
    location: application.location,
    region: application.region,
    website: application.website,
    services: application.services,
    description: application.description,
    established: application.established,
    capacity: application.capacity,
    businessLicenseFileId: application.businessLicenseFileId,
    taxRegistrationFileId: application.taxRegistrationFileId,
  });
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 },
      );
    }

    const applications = await db.ecoApplication.findMany({
      where: {
        builder: {
          userId: session.user.id,
          deletedAt: null,
        },
      },
      include: {
        builder: true,
        certificate: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    const seenSignatures = new Set<string>();
    const deduplicatedApplications = applications.filter((application) => {
      const signature = buildApplicationSignature(application);
      if (seenSignatures.has(signature)) {
        return false;
      }

      seenSignatures.add(signature);
      return true;
    });

    return NextResponse.json({
      success: true,
      data: deduplicatedApplications.map((application) => ({
        id: application.id,
        builderId: application.builder.id,
        status: toPortalStatus(application.status, application.builder.certified),
        workflowStatus: application.status,
        certified: application.builder.certified,
        canEdit: canEditApplication(application.status, application.builder.certified),
        name: application.name,
        type: application.type,
        location: application.location,
        region: application.region,
        website: application.website,
        services: application.services,
        description: application.description,
        established: application.established,
        capacity: application.capacity,
        businessLicenseFileId: application.businessLicenseFileId,
        taxRegistrationFileId: application.taxRegistrationFileId,
        businessLicenseFileName: null,
        taxRegistrationFileName: null,
        createdAt: application.createdAt,
        updatedAt: application.updatedAt,
        certificate: application.certificate ? {
          id: application.certificate.id,
          certificateNumber: application.certificate.certificateNumber,
          issuedAt: application.certificate.issuedAt,
          filePath: application.certificate.filePath,
        } : null,
        certificateId: application.certificate?.id || null,
      })),
    });
  } catch (error) {
    console.error("Fetch ecosystem applications failed:", error);
    return NextResponse.json(
      { success: false, error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
