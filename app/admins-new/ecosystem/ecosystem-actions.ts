"use server";

import db from "@/lib/db/index";
import { revalidatePath } from "next/cache";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { createNotification } from "@/lib/notifications";
import { randomBytes } from "crypto";
import { requireAnyPermission } from "@/lib/auth/permissions";
import { PERMISSIONS } from "@/lib/auth/permission-codes";

const ECOSYSTEM_MANAGE_PERMISSIONS = [
  PERMISSIONS.SYS_DASHBOARD_ACCESS,
  PERMISSIONS.ID_USER_MANAGE,
  PERMISSIONS.ID_ROLE_MANAGE,
] as const;

async function requireEcosystemManageAccess() {
  await requireAnyPermission([...ECOSYSTEM_MANAGE_PERMISSIONS]);
}

export type EcosystemBuilderRow = {
  id: string;
  applicationId: string;
  name: string;
  type: string;
  location: string;
  region: string;
  established?: number | null;
  capacity?: number | null;
  website?: string | null;
  certified: boolean;
  workflowStatus: string;
  services: string[];
  description?: string | null;
  createdAt: string;
};

export type EcosystemApplicationReviewDetail = {
  id: string;
  builderId: string;
  workflowStatus: string;
  certified: boolean;
  name: string;
  type: string;
  location: string;
  address?: string | null;
  city?: string | null;
  region: string;
  contactName?: string | null;
  contactEmail?: string | null;
  contactPhone?: string | null;
  website?: string | null;
  services: string[];
  description?: string | null;
  serviceDescription?: string | null;
  impactDescription?: string | null;
  established?: number | null;
  capacity?: number | null;
  businessLicenseFileId?: string | null;
  taxRegistrationFileId?: string | null;
  businessLicenseFileName?: string | null;
  taxRegistrationFileName?: string | null;
  documentVerification?: any;
  preAssessedAt?: string | null;
  preAssessedById?: string | null;
  submittedAt?: string | null;
  validatedAt?: string | null;
  rejectedReason?: string | null;
  rollbackReason?: string | null;
  createdAt: string;
  updatedAt: string;
};

export type EcosystemApplicationStatusFilter =
  | "all"
  | "PENDING"
  | "UNDER_REVIEW"
  | "REVIEWED"
  | "ASSIGNED_TO_COMMITTEE"
  | "IN_COMMITTEE_REVIEW"
  | "COMMITTEE_REVIEW_SUBMITTED"
  | "CERTIFIED"
  | "REJECTED"
  | "CLARIFICATION_REQUESTED";

type EcosystemReviewAction = "START_REVIEW" | "MARK_REVIEWED";

function toEcosystemReviewStatus(action: EcosystemReviewAction) {
  if (action === "START_REVIEW") return "UNDER_REVIEW" as const;
  return "REVIEWED" as const;
}

function coerceServices(services: unknown): string[] {
  if (!services) return [];
  if (Array.isArray(services))
    return services.filter((s) => typeof s === "string");
  return [];
}

export async function getEcosystemBuilders(params?: {
  search?: string;
  type?: string | "all";
  location?: string | "all";
  certified?: "all" | "certified" | "pending";
  status?: EcosystemApplicationStatusFilter;
  page?: number;
  pageSize?: number;
}) {
  try {
    await requireEcosystemManageAccess();

    const search = (params?.search || "").trim();
    const type = params?.type || "all";
    const location = params?.location || "all";
    const certified = params?.certified || "all";
    const status = params?.status || "all";
    const page = Math.max(1, Number(params?.page) || 1);
    const pageSize = Math.min(100, Math.max(1, Number(params?.pageSize) || 10));

    const where: any = {
      status: { not: "DRAFT" },
      submittedAt: { not: null },
      builder: {
        deletedAt: null,
      },
    };

    if (type !== "all") where.type = type;
    if (location !== "all") where.location = location;
    if (status !== "all") where.status = status;

    if (certified === "certified") {
      where.OR = [
        { status: "CERTIFIED" },
        { builder: { certified: true, deletedAt: null } },
      ];
    }

    if (certified === "pending") {
      where.status = { in: ["PENDING", "UNDER_REVIEW", "CLARIFICATION_REQUESTED", "REVIEWED", "ASSIGNED_TO_COMMITTEE", "IN_COMMITTEE_REVIEW", "COMMITTEE_REVIEW_SUBMITTED"] };
    }

    if (search) {
      where.AND = [
        ...(where.AND ?? []),
        {
          OR: [
            { name: { contains: search, mode: "insensitive" } },
            { type: { contains: search, mode: "insensitive" } },
            { location: { contains: search, mode: "insensitive" } },
            { region: { contains: search, mode: "insensitive" } },
            { website: { contains: search, mode: "insensitive" } },
          ],
        },
      ];
    }

    const [total, applications] = await Promise.all([
      db.ecoApplication.count({ where }),
      db.ecoApplication.findMany({
        where,
        include: {
          builder: true,
        },
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
    ]);

    const totalPages = Math.max(1, Math.ceil(total / pageSize));

    return {
      success: true,
      data: applications.map((application) => ({
        id: application.builderId,
        applicationId: application.id,
        name: application.name,
        type: application.type,
        location: application.location,
        region: application.region,
        established: application.established,
        capacity: application.capacity,
        website: application.website,
        certified: application.status === "CERTIFIED",
        workflowStatus: application.status,
        services: coerceServices(application.services),
        description: application.description,
        createdAt: application.createdAt.toISOString(),
      })) satisfies EcosystemBuilderRow[],
      meta: {
        total,
        page,
        pageSize,
        totalPages,
      },
    };
  } catch (error: any) {
    console.error("getEcosystemBuilders failed:", error);
    return {
      success: false,
      message: error.message || "Failed to fetch ecosystem builders",
    };
  }
}

export async function getEcosystemBuilderById(id: string) {
  try {
    await requireEcosystemManageAccess();
    if (!id) return { success: false, message: "id is required" };

    const [b, latestApp] = await Promise.all([
      db.ecosystemBuilder.findFirst({
        where: { id, deletedAt: null },
      }),
      db.ecoApplication.findFirst({
        where: { builderId: id },
        orderBy: { createdAt: "desc" },
      })
    ]);

    if (!b) return { success: false, message: "Ecosystem builder not found" };

    return {
      success: true,
      data: {
        id: b.id,
        name: b.name,
        type: b.type,
        location: b.location,
        region: b.region,
        established: b.established,
        capacity: b.capacity,
        website: b.website,
        certified: b.certified,
        workflowStatus: latestApp?.status || "PENDING",
        applicationId: latestApp?.id || "",
        services: coerceServices(b.services),
        description: b.description,
        createdAt: b.createdAt.toISOString(),
      },
    };
  } catch (error: any) {
    console.error("getEcosystemBuilderById failed:", error);
    return {
      success: false,
      message: error.message || "Failed to fetch ecosystem builder",
    };
  }
}

export async function getEcosystemApplicationReviewById(params: {
  applicationId: string;
  builderId?: string;
}) {
  try {
    await requireEcosystemManageAccess();

    const applicationId = params.applicationId?.trim();
    const builderId = params.builderId?.trim();

    if (!applicationId) {
      return { success: false, message: "applicationId is required" };
    }

    const application = await db.ecoApplication.findFirst({
      where: {
        id: applicationId,
        ...(builderId ? { builderId } : {}),
        builder: {
          deletedAt: null,
        },
      },
      include: {
        builder: true,
      },
    });

    if (!application) {
      return { success: false, message: "Ecosystem application not found" };
    }

    let businessLicenseFileName: string | null = null;
    let taxRegistrationFileName: string | null = null;

    if (application.businessLicenseFileId) {
      const file = await db.file.findUnique({
        where: { id: application.businessLicenseFileId },
        select: { originalName: true },
      });
      businessLicenseFileName = file?.originalName ?? null;
    }

    if (application.taxRegistrationFileId) {
      const file = await db.file.findUnique({
        where: { id: application.taxRegistrationFileId },
        select: { originalName: true },
      });
      taxRegistrationFileName = file?.originalName ?? null;
    }

    return {
      success: true,
      data: {
        id: application.id,
        builderId: application.builderId,
        workflowStatus: application.status,
        certified: application.status === "CERTIFIED",
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
        services: coerceServices(application.services),
        description: application.description,
        serviceDescription: application.serviceDescription,
        impactDescription: application.impactDescription,
        established: application.established,
        capacity: application.capacity,
        businessLicenseFileId: application.businessLicenseFileId,
        taxRegistrationFileId: application.taxRegistrationFileId,
        businessLicenseFileName,
        taxRegistrationFileName,
        documentVerification: application.documentVerification,
        preAssessedAt: application.preAssessedAt?.toISOString() ?? null,
        preAssessedById: application.preAssessedById,
        submittedAt: application.submittedAt?.toISOString() ?? null,
        validatedAt: application.validatedAt?.toISOString() ?? null,
        rejectedReason: application.rejectedReason,
        rollbackReason: application.rollbackReason,
        createdAt: application.createdAt.toISOString(),
        updatedAt: application.updatedAt.toISOString(),
      } satisfies EcosystemApplicationReviewDetail,
    };
  } catch (error: any) {
    console.error("getEcosystemApplicationReviewById failed:", error);
    return {
      success: false,
      message: error.message || "Failed to fetch ecosystem application review details",
    };
  }
}

export async function updateEcosystemApplicationReviewStatus(
  applicationId: string,
  action: EcosystemReviewAction,
) {
  try {
    await requireEcosystemManageAccess();

    if (!applicationId?.trim()) {
      return { success: false, message: "applicationId is required" };
    }

    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return { success: false, message: "Unauthorized" };
    }

    const application = await db.ecoApplication.findFirst({
      where: {
        id: applicationId,
        builder: {
          deletedAt: null,
        },
      },
      select: {
        id: true,
        builderId: true,
        status: true,
      },
    });

    if (!application) {
      return { success: false, message: "Ecosystem application not found" };
    }

    if (action === "START_REVIEW" && application.status !== "PENDING") {
      return {
        success: true,
        skipped: true,
        data: { status: application.status },
      };
    }

    if (action === "MARK_REVIEWED" && application.status !== "UNDER_REVIEW") {
      return {
        success: false,
        message: "Only applications under review can be marked as reviewed",
      };
    }

    const nextStatus = toEcosystemReviewStatus(action);

    const updated = await db.ecoApplication.update({
      where: { id: application.id },
      data: {
        status: nextStatus,
        reviewerId: session.user.id,
        validatedAt: action === "MARK_REVIEWED" ? new Date() : undefined,
        statusHistory: {
          create: {
            fromStatus: application.status,
            toStatus: nextStatus,
            changedById: session.user.id,
          },
        },
      },
      select: {
        status: true,
        builder: { select: { userId: true, name: true } }
      },
    });

    if (action === "MARK_REVIEWED" && updated.builder.userId) {
      await createNotification({
        userId: updated.builder.userId,
        title: "Application Reviewed",
        message: `Your Ecosystem Builder application for "${updated.builder.name}" has been reviewed but requires further evaluation before certification.`,
        type: "success",
        link: `/dashboard/ecosystem`,
        sendAsEmail: true
      });
    }

    revalidatePath("/admins-new/ecosystem");
    revalidatePath(`/admins-new/ecosystem/${application.builderId}`);
    revalidatePath(`/admins-new/ecosystem/review/${application.id}`);
    revalidatePath("/admins-new/ecosystem/workflow");

    return {
      success: true,
      data: {
        status: updated.status,
      },
    };
  } catch (error: any) {
    console.error("updateEcosystemApplicationReviewStatus failed:", error);
    return {
      success: false,
      message: error.message || "Failed to update ecosystem application status",
    };
  }
}

export async function verifyEcoDocument(
  applicationId: string,
  checklistItemId: string,
  status: "VERIFIED" | "REJECTED",
  comment?: string,
) {
  try {
    await requireEcosystemManageAccess();
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return { success: false, message: "Unauthorized" };

    const app = await db.ecoApplication.findUnique({
      where: { id: applicationId },
      select: { id: true, documentVerification: true },
    });
    if (!app) return { success: false, message: "Application not found" };

    const existing: any[] = (app.documentVerification as any[]) || [];
    const idx = existing.findIndex(v => v.checklistItemId === checklistItemId);
    const entry = { checklistItemId, status, reviewedById: session.user.id, reviewedAt: new Date().toISOString(), comment };

    if (idx >= 0) existing[idx] = entry;
    else existing.push(entry);

    await db.ecoApplication.update({
      where: { id: applicationId },
      data: { documentVerification: existing },
    });

    revalidatePath(`/admins-new/ecosystem/review/${applicationId}`);
    return { success: true, data: { documentVerification: existing } };
  } catch (error: any) {
    console.error("verifyEcoDocument failed:", error);
    return { success: false, message: error.message || "Failed to verify document" };
  }
}

export async function completeEcoPreAssessment(applicationId: string) {
  try {
    await requireEcosystemManageAccess();
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return { success: false, message: "Unauthorized" };

    const app = await db.ecoApplication.findUnique({
      where: { id: applicationId },
      select: { id: true, status: true, documentVerification: true, type: true, submittedAt: true },
    });
    if (!app) return { success: false, message: "Application not found" };
    if (app.status !== "UNDER_REVIEW") return { success: false, message: "Application must be under review" };

    const verifications: any[] = (app.documentVerification as any[]) || [];
    const { getRequiredChecklist, checkAllDocumentsVerified, computeVerificationStats } = await import("@/lib/directive/pre-assessment");
    const allVerified = checkAllDocumentsVerified(verifications, "ecosystem", app.type);

    if (!allVerified) {
      const stats = computeVerificationStats(verifications, "ecosystem", app.type);
      return { success: false, message: `Cannot complete pre-assessment: ${stats.verifiedCount}/${stats.totalRequired} documents verified` };
    }

    const updated = await db.ecoApplication.update({
      where: { id: applicationId },
      data: {
        status: "REVIEWED",
        preAssessedAt: new Date(),
        preAssessedById: session.user.id,
        validatedAt: new Date(),
        statusHistory: {
          create: {
            fromStatus: app.status,
            toStatus: "REVIEWED",
            changedById: session.user.id,
            reason: "Pre-assessment completed — all documents verified",
          },
        },
      },
      select: { status: true },
    });

    revalidatePath("/admins-new/ecosystem");
    revalidatePath(`/admins-new/ecosystem/review/${applicationId}`);
    return { success: true, data: { status: updated.status } };
  } catch (error: any) {
    console.error("completeEcoPreAssessment failed:", error);
    return { success: false, message: error.message || "Failed to complete pre-assessment" };
  }
}

export async function setEcosystemBuilderCertified(
  id: string,
  certified: boolean,
) {
  try {
    await requireEcosystemManageAccess();
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return { success: false, message: "Unauthorized" };

    if (!id) return { success: false, message: "id is required" };

    if (certified) {
      // Find the most recent eligible application for this builder
      const application = await db.ecoApplication.findFirst({
        where: { builderId: id },
        orderBy: { updatedAt: 'desc' }
      });

      await db.$transaction(async (tx) => {
        // 1. Mark builder as certified
        await tx.ecosystemBuilder.update({
          where: { id },
          data: { certified: true }
        });

        if (application) {
          // 2. Update application status to CERTIFIED if not already
          await tx.ecoApplication.update({
            where: { id: application.id },
            data: { status: "CERTIFIED" }
          });

          // 3. Create certificate if it doesn't exist
          const existingCert = await tx.certificate.findUnique({
            where: { ecoApplicationId: application.id }
          });

          if (!existingCert) {
            const year = new Date().getFullYear();
            const timestamp = Date.now().toString().slice(-6);
            const randomPart = randomBytes(3).toString('hex').toUpperCase();
            const certificateNumber = `ECO-CERT-${year}-${timestamp}-${randomPart}`;
            
            const qrData = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/verify/ecosystem/${certificateNumber}`;
            const pdfUrl = `/api/ecosystem/certificates/${application.id}/pdf`;

            const certificate = await tx.certificate.create({
              data: {
                ecoApplicationId: application.id,
                certificateNumber,
                filePath: pdfUrl,
                qrData,
                issuedById: session.user.id,
                type: 'ECOSYSTEM',
                issuedAt: new Date()
              }
            });

            await tx.ecoApplication.update({
              where: { id: application.id },
              data: { certificateId: certificate.id }
            });
          }
        }
      });
    } else {
      // Remove certification
      await db.$transaction(async (tx) => {
        await tx.ecosystemBuilder.update({
          where: { id },
          data: { certified: false }
        });
        
        // Find existing certificates to potentially revert status
        const certifiedApps = await tx.ecoApplication.findMany({
          where: { builderId: id, status: "CERTIFIED" }
        });
        
        for (const app of certifiedApps) {
          await tx.ecoApplication.update({
            where: { id: app.id },
            data: { status: "COMMITTEE_REVIEW_SUBMITTED" }
          });
        }
      });
    }

    // Notify Builder
    const builderRecord = await db.ecosystemBuilder.findUnique({
      where: { id },
      select: { userId: true, name: true }
    });

    if (certified && builderRecord?.userId) {
      await createNotification({
        userId: builderRecord.userId,
        title: "Certificate Generated",
        message: `Congratulations! Your organization "${builderRecord.name}" has been officially certified as an Ecosystem Builder. You can now download your certificate from your portal.`,
        type: "success",
        link: `/dashboard/ecosystem`,
        sendAsEmail: true
      });
    }

    revalidatePath("/admins-new/ecosystem");
    revalidatePath(`/admins-new/ecosystem/${id}`);
    revalidatePath("/admins-new/ecosystem/workflow");
    revalidatePath("/admins-new/certifications");
    
    return { success: true };
  } catch (error: any) {
    console.error("setEcosystemBuilderCertified failed:", error);
    return {
      success: false,
      message: error.message || "Failed to update certification",
    };
  }
}

export async function finalizeEcosystemApplication(params: {
  applicationId: string;
  status: "CERTIFIED" | "REJECTED";
  reason?: string;
}) {
  try {
    await requireEcosystemManageAccess();
    if (!params.applicationId) return { success: false, message: "applicationId is required" };

    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return { success: false, message: "Unauthorized" };

    const application = await db.ecoApplication.findUnique({
      where: { id: params.applicationId },
      select: { id: true, builderId: true, status: true }
    });

    if (!application) {
      return { success: false, message: "Application not found" };
    }

    const updated = await db.ecoApplication.update({
      where: { id: application.id },
      include: { builder: { select: { userId: true, name: true } } },
      data: {
        status: params.status,
        rejectedReason: params.status === "REJECTED" ? params.reason : undefined,
        statusHistory: {
          create: {
            fromStatus: application.status,
            toStatus: params.status,
            changedById: session.user.id,
            reason: params.reason
          }
        }
      }
    });

    if (updated.builder.userId) {
      if (params.status === "CERTIFIED") {
        await createNotification({
          userId: updated.builder.userId,
          title: "Certificate Generated",
          message: `Congratulations! Your organization "${updated.builder.name}" has been officially certified as an Ecosystem Builder. You can now download your certificate from your portal.`,
          type: "success",
          link: `/dashboard/ecosystem`, 
          sendAsEmail: true
        });
      } else if (params.status === "REJECTED") {
        await createNotification({
          userId: updated.builder.userId,
          title: "Application Rejected",
          message: `Your Ecosystem Builder application for "${updated.builder.name}" has been rejected. Reason: ${params.reason || "Documents verified do not meet criteria."}`,
          type: "error",
          link: `/dashboard/ecosystem`,
          sendAsEmail: true
        });
      }
    }

    if (params.status === "CERTIFIED") {
      await db.$transaction(async (tx) => {
        // Mark builder as certified
        await tx.ecosystemBuilder.update({
          where: { id: application.builderId },
          data: { certified: true }
        });

        // Check if certificate already exists to prevent duplicates
        const existingCert = await tx.certificate.findUnique({
          where: { ecoApplicationId: application.id }
        });

        if (!existingCert) {
          // Generate unique certificate properties
          const year = new Date().getFullYear();
          const timestamp = Date.now().toString().slice(-5);
          const randomPart = randomBytes(3).toString('hex').toUpperCase();
          const certificateNumber = `ECO-CERT-${year}-${timestamp}-${randomPart}`;
          
          // Data for QR Code to verify the certificate publicly
          const qrData = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/verify/ecosystem/${certificateNumber}`;
          
          // URL to the physical or dynamic PDF certificate
          const pdfUrl = `/api/ecosystem/certificates/${application.id}/pdf`;

          const certificate = await tx.certificate.create({
            data: {
              ecoApplicationId: application.id,
              certificateNumber,
              filePath: pdfUrl,
              qrData,
              issuedById: session.user.id,
              type: 'ECOSYSTEM'
            }
          });

          // Link the generated certificate strictly to the application
          await tx.ecoApplication.update({
            where: { id: application.id },
            data: { certificateId: certificate.id }
          });
        }
      });
    }

    revalidatePath("/admins-new/ecosystem");
    revalidatePath(`/admins-new/ecosystem/${application.builderId}`);
    revalidatePath(`/admins-new/ecosystem/review/${application.id}`);
    revalidatePath(`/admins-new/ecosystem/result/${application.id}`);
    
    return { success: true, data: { status: updated.status } };
  } catch (error: any) {
    console.error("finalizeEcosystemApplication failed:", error);
    return {
      success: false,
      message: error.message || "Failed to finalize application status",
    };
  }
}

export async function suspendEcoApplicationAction(applicationId: string, reason: string) {
  try {
    await requireEcosystemManageAccess();
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return { success: false, message: "Unauthorized" };

    const app = await db.ecoApplication.findUnique({ where: { id: applicationId }, select: { id: true, status: true } });
    if (!app) return { success: false, message: "Application not found" };
    if (app.status !== "CERTIFIED") return { success: false, message: "Only certified applications can be suspended" };

    await db.ecoApplication.update({
      where: { id: applicationId },
      data: {
        status: "SUSPENDED" as any,
        statusHistory: {
          create: { fromStatus: app.status, toStatus: "SUSPENDED" as any, changedById: session.user.id, reason },
        },
      },
    });
    revalidatePath("/admins-new/ecosystem");
    return { success: true };
  } catch (error: any) {
    return { success: false, message: error.message || "Failed to suspend" };
  }
}

export async function revokeEcoApplicationAction(applicationId: string, reason: string) {
  try {
    await requireEcosystemManageAccess();
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return { success: false, message: "Unauthorized" };

    const app = await db.ecoApplication.findUnique({ where: { id: applicationId }, select: { id: true, status: true } });
    if (!app) return { success: false, message: "Application not found" };

    await db.ecoApplication.update({
      where: { id: applicationId },
      data: {
        status: "REVOKED" as any,
        statusHistory: {
          create: { fromStatus: app.status, toStatus: "REVOKED" as any, changedById: session.user.id, reason },
        },
      },
    });
    await db.certificate.updateMany({
      where: { ecoApplicationId: applicationId },
      data: { status: "EXPIRED" },
    });
    revalidatePath("/admins-new/ecosystem");
    return { success: true };
  } catch (error: any) {
    return { success: false, message: error.message || "Failed to revoke" };
  }
}

export async function rescindEcoSuspensionAction(applicationId: string) {
  try {
    await requireEcosystemManageAccess();
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return { success: false, message: "Unauthorized" };

    const app = await db.ecoApplication.findUnique({ where: { id: applicationId }, select: { id: true, status: true } });
    if (!app) return { success: false, message: "Application not found" };
    if (app.status !== "SUSPENDED") return { success: false, message: "Application is not suspended" };

    await db.ecoApplication.update({
      where: { id: applicationId },
      data: {
        status: "CERTIFIED" as any,
        statusHistory: {
          create: { fromStatus: "SUSPENDED", toStatus: "CERTIFIED" as any, changedById: session.user.id, reason: "Suspension rescinded" },
        },
      },
    });
    revalidatePath("/admins-new/ecosystem");
    return { success: true };
  } catch (error: any) {
    return { success: false, message: error.message || "Failed to rescind" };
  }
}

export async function getEcosystemStats() {
  try {
    await requireEcosystemManageAccess();

    const [total, certified] = await Promise.all([
      db.ecoApplication.count({
        where: {
          status: { not: "DRAFT" },
          submittedAt: { not: null },
          builder: { deletedAt: null },
        },
      }),
      db.ecoApplication.count({
        where: {
          status: "CERTIFIED",
          submittedAt: { not: null },
          builder: { deletedAt: null },
        },
      }),
    ]);

    return {
      success: true,
      data: {
        total,
        certified,
        pending: total - certified,
      },
    };
  } catch (error: any) {
    console.error("getEcosystemStats failed:", error);
    return {
      success: false,
      message: error.message || "Failed to fetch ecosystem stats",
    };
  }
}

export async function createEcosystemBuilder(data: {
  name: string;
  type: string;
  location: string;
  region: string;
  established?: number;
  capacity?: number;
  website?: string;
  certified?: boolean;
  services?: string[];
  description?: string;
}) {
  try {
    await requireEcosystemManageAccess();

    if (!data.name?.trim())
      return { success: false, message: "Name is required" };
    if (!data.type?.trim())
      return { success: false, message: "Type is required" };
    if (!data.location?.trim())
      return { success: false, message: "Location is required" };
    if (!data.region?.trim())
      return { success: false, message: "Region is required" };

    const builder = await db.ecosystemBuilder.create({
      data: {
        name: data.name.trim(),
        type: data.type.trim(),
        location: data.location.trim(),
        region: data.region.trim(),
        established:
          typeof data.established === "number" ? data.established : null,
        capacity: typeof data.capacity === "number" ? data.capacity : null,
        website: data.website?.trim() || null,
        certified: Boolean(data.certified),
        services: data.services || [],
        description: data.description?.trim() || null,
      },
    });

    revalidatePath("/admins-new/ecosystem");
    return { success: true, data: builder };
  } catch (error: any) {
    console.error("createEcosystemBuilder failed:", error);
    return {
      success: false,
      message: error.message || "Failed to create ecosystem builder",
    };
  }
}

export async function updateEcosystemBuilder(
  id: string,
  data: {
    name?: string;
    type?: string;
    location?: string;
    region?: string;
    established?: number | null;
    capacity?: number | null;
    website?: string | null;
    certified?: boolean;
    services?: string[];
    description?: string | null;
  },
) {
  try {
    await requireEcosystemManageAccess();

    if (!id) return { success: false, message: "id is required" };

    await db.ecosystemBuilder.update({
      where: { id },
      data: {
        ...(typeof data.name === "string" ? { name: data.name.trim() } : {}),
        ...(typeof data.type === "string" ? { type: data.type.trim() } : {}),
        ...(typeof data.location === "string"
          ? { location: data.location.trim() }
          : {}),
        ...(typeof data.region === "string"
          ? { region: data.region.trim() }
          : {}),
        ...(typeof data.established === "number" || data.established === null
          ? { established: data.established }
          : {}),
        ...(typeof data.capacity === "number" || data.capacity === null
          ? { capacity: data.capacity }
          : {}),
        ...(typeof data.website === "string" || data.website === null
          ? { website: data.website || null }
          : {}),
        ...(typeof data.certified === "boolean"
          ? { certified: data.certified }
          : {}),
        ...(Array.isArray(data.services) ? { services: data.services } : {}),
        ...(typeof data.description === "string" || data.description === null
          ? { description: data.description || null }
          : {}),
      },
    });

    revalidatePath("/admins-new/ecosystem");
    return { success: true };
  } catch (error: any) {
    console.error("updateEcosystemBuilder failed:", error);
    return {
      success: false,
      message: error.message || "Failed to update ecosystem builder",
    };
  }
}

export async function deleteEcosystemBuilder(id: string) {
  try {
    await requireEcosystemManageAccess();

    if (!id) return { success: false, message: "id is required" };

    // soft delete
    await db.ecosystemBuilder.update({
      where: { id },
      data: { deletedAt: new Date() },
    });

    revalidatePath("/admins-new/ecosystem");
    return { success: true };
  } catch (error: any) {
    console.error("deleteEcosystemBuilder failed:", error);
    return {
      success: false,
      message: error.message || "Failed to delete ecosystem builder",
    };
  }
}

export async function assignApplicationToCommittee(data: {
  applicationId: string;
  committeeId: string;
  memberIds: string[];
  chairMemberId: string;
}) {
  try {
    await requireEcosystemManageAccess();
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return { success: false, message: "Unauthorized" };

    const { applicationId, committeeId, memberIds, chairMemberId } = data;

    if (!applicationId || !committeeId || !memberIds.length || !chairMemberId) {
      return { success: false, message: "Missing required fields" };
    }

    // Check application status
    const application = await db.ecoApplication.findUnique({
      where: { id: applicationId },
      select: { status: true, builderId: true, name: true }
    });

    if (!application) {
      return { success: false, message: "Application not found" };
    }

    // Verify all members belong to the committee
    const validMembersCount = await db.committeeMember.count({
      where: {
        id: { in: [...memberIds, chairMemberId] },
        committeeId: committeeId,
        removedAt: null
      }
    });

    if (validMembersCount < new Set([...memberIds, chairMemberId]).size) {
      return { success: false, message: "One or more selected members do not belong to the selected committee." };
    }

    // Quorum check per Art. 13.1 & 33.3
    const { hasQuorum, getQuorumConfig, getRequiredPresent } = await import("@/lib/directive/quorum");
    const qConfig = getQuorumConfig("CAC");
    const totalCommitteeMembers = await db.committeeMember.count({
      where: { committeeId: committeeId, removedAt: null }
    });
    if (!hasQuorum(totalCommitteeMembers, memberIds.length, qConfig)) {
      const required = getRequiredPresent(totalCommitteeMembers, qConfig);
      return { success: false, message: `Committee requires at least ${required} members for quorum (Art. 13.1). Selected: ${memberIds.length}, Total: ${totalCommitteeMembers}.` };
    }

    const result = await db.$transaction(async (tx) => {
      // 0. Deactivate any existing assignments for this application
      await tx.ecoCommitteeAssignment.updateMany({
        where: { 
          ecoApplicationId: applicationId,
          active: true,
          NOT: { committeeId: committeeId } // Don't deactivate the one we're about to update if it's the same
        },
        data: { active: false }
      });

      // 1. Create or update assignment
      const assignment = await tx.ecoCommitteeAssignment.upsert({
        where: {
          ecoApplicationId_committeeId: {
            ecoApplicationId: applicationId,
            committeeId: committeeId
          }
        },
        update: {
          chairMemberId: chairMemberId,
          active: true,
          assignedById: session.user.id
        },
        create: {
          ecoApplicationId: applicationId,
          committeeId: committeeId,
          assignedById: session.user.id,
          chairMemberId: chairMemberId,
          active: true
        }
      });

      // 2. Reconcile Reviews: Delete members no longer in the list
      await tx.ecoCommitteeReview.deleteMany({
        where: {
          assignmentId: assignment.id,
          memberId: { notIn: memberIds },
          status: 'DRAFT' // Only delete if they haven't submitted yet
        }
      });

      // 3. Upsert Reviews for each member in the new list
      for (const memberId of memberIds) {
        await tx.ecoCommitteeReview.upsert({
          where: {
            assignmentId_memberId: {
              assignmentId: assignment.id,
              memberId: memberId
            }
          },
          update: {}, // Keep existing review if it exists
          create: {
            ecoApplicationId: applicationId,
            assignmentId: assignment.id,
            memberId: memberId,
            status: 'DRAFT'
          }
        });
      }
      // 4. Update Application Status
      await tx.ecoApplication.update({
        where: { id: applicationId },
        data: {
          status: 'ASSIGNED_TO_COMMITTEE',
          statusHistory: {
            create: {
              fromStatus: application.status,
              toStatus: 'ASSIGNED_TO_COMMITTEE',
              changedById: session.user.id,
              reason: 'Assigned to committee'
            }
          }
        }
      });

      return assignment;
    });

    // Notify Startup User (Ecosystem Builder)
    const builder = await db.ecosystemBuilder.findUnique({
      where: { id: application.builderId },
      select: { userId: true }
    });

    if (builder?.userId) {
      await createNotification({
        userId: builder.userId,
        title: "Application Assigned to Committee",
        message: `Your Ecosystem Builder application for "${application.name}" has been assigned to a committee for review.`,
        type: "info",
        link: `/dashboard/ecosystem`,
        sendAsEmail: false
      });
    }

    for (const memberId of memberIds) {
      const memberRecord = await db.committeeMember.findUnique({
        where: { id: memberId },
        select: { userId: true, user: { select: { firstName: true } } }
      });
      
      if (memberRecord?.userId) {
        await createNotification({
          userId: memberRecord.userId,
          title: "New Ecosystem Review Assigned",
          message: `Hello ${memberRecord.user.firstName}, you have been assigned to review "${application.name}". Please visit your portal to complete the evaluation.`,
          type: "info",
          link: `/committee-portal/assessments/ecosystem`,
          sendAsEmail: true
        });
      }
    }

    revalidatePath("/admins-new/ecosystem");
    return { success: true, data: result };
  } catch (error: any) {
    console.error("assignApplicationToCommittee failed:", error);
    return { success: false, message: error.message || "Failed to assign application" };
  }
}

export async function getApplicationAssignment(applicationId: string) {
  try {
    await requireEcosystemManageAccess();
    if (!applicationId) return { success: false, message: "applicationId is required" };

    const assignment = await db.ecoCommitteeAssignment.findFirst({
      where: { ecoApplicationId: applicationId, active: true },
      include: {
        memberReviews: {
          include: {
            member: {
              include: {
                user: {
                  select: {
                    firstName: true,
                    lastName: true,
                    email: true
                  }
                }
              }
            }
          }
        },
        committee: {
          select: {
            id: true,
            name: true
          }
        }
      }
    });

    if (!assignment) return { success: true, data: null };

    return {
      success: true,
      data: {
        id: assignment.id,
        committeeId: assignment.committeeId,
        committeeName: assignment.committee.name,
        chairMemberId: assignment.chairMemberId,
        assignedMemberIds: assignment.memberReviews.map(r => r.memberId),
        reviews: assignment.memberReviews
      }
    };
  } catch (error: any) {
    console.error("getApplicationAssignment failed:", error);
    return { success: false, message: error.message || "Failed to fetch assignment" };
  }
}

export async function unassignMemberFromApplication(applicationId: string, memberId: string) {
  try {
    await requireEcosystemManageAccess();
    if (!applicationId || !memberId) return { success: false, message: "Missing required fields" };

    const assignment = await db.ecoCommitteeAssignment.findFirst({
      where: { ecoApplicationId: applicationId, active: true }
    });

    if (!assignment) return { success: false, message: "Assignment not found" };

    // Check if it's the chair
    if (assignment.chairMemberId === memberId) {
       return { success: false, message: "Cannot unassign the chairman. Please assign a new chairman first." };
    }

    await db.ecoCommitteeReview.deleteMany({
      where: {
        assignmentId: assignment.id,
        memberId: memberId,
        status: 'DRAFT' // Only allow deleting if not submitted
      }
    });

    revalidatePath("/admins-new/ecosystem");
    return { success: true };
  } catch (error: any) {
    console.error("unassignMemberFromApplication failed:", error);
    return { success: false, message: error.message || "Failed to unassign member" };
  }
}

export async function unassignApplicationCommittee(applicationId: string) {
  try {
    await requireEcosystemManageAccess();
    if (!applicationId) return { success: false, message: "applicationId is required" };

    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return { success: false, message: "Unauthorized" };

    const application = await db.ecoApplication.findUnique({
      where: { id: applicationId },
      select: { status: true }
    });

    if (!application) return { success: false, message: "Application not found" };

    await db.$transaction(async (tx) => {
      // 1. Deactivate all assignments
      await tx.ecoCommitteeAssignment.updateMany({
        where: { ecoApplicationId: applicationId, active: true },
        data: { active: false }
      });

      // 2. Revert status to REVIEWED if it was in committee status
      if (application.status === 'ASSIGNED_TO_COMMITTEE' || application.status === 'IN_COMMITTEE_REVIEW') {
        await tx.ecoApplication.update({
          where: { id: applicationId },
          data: {
            status: 'REVIEWED',
            statusHistory: {
              create: {
                fromStatus: application.status,
                toStatus: 'REVIEWED',
                changedById: session.user.id,
                reason: 'Committee unassigned'
              }
            }
          }
        });
      }
    });

    revalidatePath("/admins-new/ecosystem");
    revalidatePath("/admins-new/ecosystem/workflow");
    return { success: true };
  } catch (error: any) {
    console.error("unassignApplicationCommittee failed:", error);
    return { success: false, message: error.message || "Failed to unassign committee" };
  }
}
