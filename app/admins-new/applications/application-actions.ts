"use server";

import { ApplicationStatus, AssignmentStatus, EvaluationStatus, Prisma } from "@prisma/client";
import db from "@/lib/db/index";
import { revalidatePath } from "next/cache";
import { requireAnyPermission } from "@/lib/auth/permissions";
import { PERMISSIONS } from "@/lib/auth/permission-codes";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { CertificateType, UserRole } from "@prisma/client";
import { createNotification } from "@/lib/notifications";
import { randomBytes } from "crypto";

const APPLICATION_VIEW_PERMISSIONS = [
  PERMISSIONS.OPS_APP_VIEW_ALL,
  PERMISSIONS.OPS_APP_REVIEW,
  PERMISSIONS.OPS_APP_DECISION,
] as const;

const APPLICATION_UPDATE_PERMISSIONS = [
  PERMISSIONS.OPS_APP_REVIEW,
  PERMISSIONS.OPS_APP_DECISION,
] as const;

export type AdminApplicationRow = {
  id: string;
  name: string;
  type: string;
  category: string;
  submitted: string;
  applicant: string;
  location: string;
  status: string;
  rawStatus: ApplicationStatus;
  website?: string | null;
  email?: string | null;
  phoneNumber?: string | null;
  reason?: string | null;
  history?: any[];
};

export type AdminApplicationStats = {
  total: number;
  pending: number;
  approved: number;
  rejected: number;
  additional: number;
  weeklyChange: number;
};

function toUiStatus(status: ApplicationStatus): string {
  switch (status) {
    case ApplicationStatus.PENDING:
      return "Pending Review";
    case ApplicationStatus.UNDER_REVIEW:
      return "Under Review";
    case ApplicationStatus.REVIEWED:
      return "Reviewed";
    case ApplicationStatus.ASSIGNED_TO_COMMITTEE:
      return "Committee Assigned";
    case ApplicationStatus.IN_COMMITTEE_REVIEW:
      return "In Committee Review";
    case ApplicationStatus.COMMITTEE_REVIEW_SUBMITTED:
      return "Review Submitted";
    case ApplicationStatus.CERTIFIED:
      return "Certified";
    case ApplicationStatus.REJECTED:
      return "Rejected";
    case ApplicationStatus.ROLLED_BACK:
      return "Rolled Back";
    case ApplicationStatus.DRAFT:
    default:
      return "Draft";
  }
}

type AdminStatusAction =
  | "APPROVE"
  | "REJECT"
  | "ROLLBACK"
  | "PASS_SCREENING"
  | "ASSIGN_COMMITTEE";

function toDbStatus(action: AdminStatusAction): ApplicationStatus {
  switch (action) {
    case "APPROVE":
      return ApplicationStatus.CERTIFIED;
    case "REJECT":
      return ApplicationStatus.REJECTED;
    case "ROLLBACK":
      return ApplicationStatus.ROLLED_BACK;
    case "PASS_SCREENING":
      return ApplicationStatus.REVIEWED;
    case "ASSIGN_COMMITTEE":
      return ApplicationStatus.ASSIGNED_TO_COMMITTEE;
    default:
      return ApplicationStatus.PENDING;
  }
}

type AdminApplicationsQuery = {
  page?: number;
  pageSize?: number;
  search?: string;
  status?: string;
  type?: string;
};

const STATUS_FILTER_MAP: Record<string, ApplicationStatus[]> = {
  "PENDING": [ApplicationStatus.PENDING],
  "UNDER_REVIEW": [ApplicationStatus.UNDER_REVIEW],
  "REVIEWED": [ApplicationStatus.REVIEWED],
  "ASSIGNED_TO_COMMITTEE": [ApplicationStatus.ASSIGNED_TO_COMMITTEE],
  "IN_COMMITTEE_REVIEW": [ApplicationStatus.IN_COMMITTEE_REVIEW],
  "COMMITTEE_REVIEW_SUBMITTED": [ApplicationStatus.COMMITTEE_REVIEW_SUBMITTED],
  "CERTIFIED": [ApplicationStatus.CERTIFIED],
  "REJECTED": [ApplicationStatus.REJECTED],
  "ROLLED_BACK": [ApplicationStatus.ROLLED_BACK],
  "IN_COMMITTEE": [
    ApplicationStatus.ASSIGNED_TO_COMMITTEE,
    ApplicationStatus.IN_COMMITTEE_REVIEW,
    ApplicationStatus.COMMITTEE_REVIEW_SUBMITTED
  ],
};

export async function getAdminApplications(query: AdminApplicationsQuery = {}) {
  try {
    await requireAnyPermission([...APPLICATION_VIEW_PERMISSIONS]);

    const page = query.page && query.page > 0 ? query.page : 1;
    const pageSizeRaw =
      query.pageSize && query.pageSize > 0 ? query.pageSize : 6;
    const pageSize = Math.min(Math.max(pageSizeRaw, 3), 100);
    const search = query.search?.trim();
    const statusFilter =
      query.status && query.status !== "all" ? query.status : undefined;
    const typeFilter =
      query.type && query.type !== "all" ? query.type : undefined;

    const where: Prisma.ApplicationWhereInput = {};

    if (statusFilter && STATUS_FILTER_MAP[statusFilter]) {
      where.status = { in: STATUS_FILTER_MAP[statusFilter] };
    } else {
      where.status = { not: ApplicationStatus.DRAFT };
    }

    if (typeFilter) {
      where.typeOfCompany = { equals: typeFilter, mode: "insensitive" } as any;
    }

    if (search) {
      const orConditions: Prisma.ApplicationWhereInput[] = [
        { id: { contains: search, mode: "insensitive" } },
        { startupName: { contains: search, mode: "insensitive" } },
        {
          user: {
            is: {
              OR: [
                { firstName: { contains: search, mode: "insensitive" } },
                { lastName: { contains: search, mode: "insensitive" } },
                { email: { contains: search, mode: "insensitive" } },
              ],
            },
          },
        },
      ];

      const currentAnd = where.AND || [];
      const andArray = Array.isArray(currentAnd) ? currentAnd : [currentAnd];
      where.AND = [...andArray, { OR: orConditions }];
    }

    const startOfWeek = new Date();
    startOfWeek.setHours(0, 0, 0, 0);
    const day = startOfWeek.getDay();
    const diffToMonday = day === 0 ? 6 : day - 1;
    startOfWeek.setDate(startOfWeek.getDate() - diffToMonday);

    const skip = (page - 1) * pageSize;

    const [applications, filteredTotal, total, byStatus, weeklyChange] =
      await Promise.all([
        db.application.findMany({
          where,
          include: {
            user: {
              select: {
                firstName: true,
                lastName: true,
                email: true,
                address: true,
              },
            },
            statusHistory: {
              orderBy: { createdAt: "desc" }
            }
          },
          orderBy: { createdAt: "desc" },
          skip,
          take: pageSize,
        }),
        db.application.count({ where }),
        db.application.count(),
        db.application.groupBy({
          by: ["status"],
          _count: { _all: true },
        }),
        db.application.count({
          where: { createdAt: { gte: startOfWeek } },
        }),
      ]);

    const statusCountMap: Record<ApplicationStatus, number> = {
      DRAFT: 0,
      PENDING: 0,
      UNDER_REVIEW: 0,
      REVIEWED: 0,
      ASSIGNED_TO_COMMITTEE: 0,
      IN_COMMITTEE_REVIEW: 0,
      COMMITTEE_REVIEW_SUBMITTED: 0,
      CERTIFIED: 0,
      REJECTED: 0,
      ROLLED_BACK: 0,
    };

    for (const item of byStatus) {
      statusCountMap[item.status] = item._count._all;
    }

    const data: AdminApplicationRow[] = applications.map((app) => ({
      id: app.id,
      name: app.startupName || "Unnamed application",
      type: app.typeOfCompany || "Startup",
      category: app.industry || "N/A",
      submitted: app.createdAt.toISOString().slice(0, 10),
      applicant:
        [app.user.firstName, app.user.lastName].filter(Boolean).join(" ") ||
        app.user.email ||
        "Unknown",
      location: app.user.address || "N/A",
      status: toUiStatus(app.status),
      rawStatus: app.status,
      website: app.website,
      email: app.email,
      phoneNumber: app.phoneNumber,
      reason: app.reason,
      history: app.statusHistory,
    }));

    const stats: AdminApplicationStats = {
      total,
      pending: statusCountMap.PENDING + statusCountMap.UNDER_REVIEW,
      approved: statusCountMap.CERTIFIED,
      rejected: statusCountMap.REJECTED,
      additional: statusCountMap.ROLLED_BACK,
      weeklyChange,
    };

    const totalPages = Math.max(1, Math.ceil(filteredTotal / pageSize));

    return {
      success: true as const,
      data,
      stats,
      meta: {
        page,
        pageSize,
        total: filteredTotal,
        totalPages,
        hasMore: page < totalPages,
      },
    };
  } catch (error: any) {
    console.error("Failed to fetch admin applications:", error);
    return {
      success: false as const,
      message: error.message || "Failed to fetch applications",
    };
  }
}

export async function getAdminApplicationById(id: string) {
  try {
    await requireAnyPermission([...APPLICATION_VIEW_PERMISSIONS]);

    const app = await db.application.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            firstName: true,
            lastName: true,
            email: true,
            address: true,
            phoneNumber: true,
          },
        },
        founders: true,
        statusHistory: {
          orderBy: { createdAt: "desc" },
        },
        assignments: {
          orderBy: { assignedAt: "desc" },
          take: 1,
          include: {
            committee: true,
            assignedBy: {
              select: { firstName: true, lastName: true, email: true },
            },
          },
        },
      },
    });

    if (!app) {
      return { success: false as const, message: "Application not found" };
    }

    return {
      success: true as const,
      data: {
        ...app,
        uiStatus: toUiStatus(app.status),
        applicantName: [app.user.firstName, app.user.lastName].filter(Boolean).join(" ") || app.user.email || "Unknown",
      },
    };
  } catch (error: any) {
    console.error("Failed to fetch admin application by ID:", error);
    return {
      success: false as const,
      message: error.message || "Failed to fetch application",
    };
  }
}

export async function updateAdminApplicationStatus(
  applicationId: string,
  action: AdminStatusAction,
  options?: { reason?: string },
) {
  try {
    await requireAnyPermission([...APPLICATION_UPDATE_PERMISSIONS]);

    const reason = options?.reason?.trim();
    if (action === "ROLLBACK" && !reason) {
      return {
        success: false as const,
        message: "Rollback reason is required",
      };
    }

    const newStatus = toDbStatus(action);

    const comment =
      action === "ROLLBACK"
        ? reason
        : action === "REJECT"
          ? "Rejected by administrator"
          : action === "PASS_SCREENING"
            ? "Passed initial screening"
            : action === "ASSIGN_COMMITTEE"
              ? "Committee assignment initiated"
              : "Application approved";

    const updated = await db.application.update({
      where: { id: applicationId },
      include: { user: { select: { id: true, email: true } } },
      data: {
        status: newStatus,
        reason: action === "ROLLBACK" || action === "REJECT" ? reason : null,
        statusHistory: {
          create: {
            status: newStatus,
            comment,
          },
        },
      },
    });

    if (action === "PASS_SCREENING" && updated.userId) {
      await createNotification({
        userId: updated.userId,
        title: "Application Reviewed",
        message: `Your startup application for "${updated.startupName}" has been reviewed but requires further evaluation before certification or approval.`,
        type: "success",
        link: `/dashboard/application`,
        sendAsEmail: true
      });
    } else if (action === "REJECT" && updated.userId) {
      await createNotification({
        userId: updated.userId,
        title: "Application Status Update",
        message: `Your startup application for "${updated.startupName}" has been rejected. Reason: ${reason || "Criteria not met."}`,
        type: "error",
        link: `/dashboard/application`,
        sendAsEmail: true
      });
    }

    return { success: true as const };
  } catch (error: any) {
    console.error("Failed to update application status:", error);
    return {
      success: false as const,
      message: error.message || "Failed to update application status",
    };
  }
}

// Individual server actions for client component
export async function passScreeningAction(applicationId: string) {
  return updateAdminApplicationStatus(applicationId, "PASS_SCREENING");
}

export async function verifyStartupDocument(
  applicationId: string,
  checklistItemId: string,
  status: "VERIFIED" | "REJECTED",
  comment?: string,
) {
  try {
    await requireAnyPermission([...APPLICATION_UPDATE_PERMISSIONS]);
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return { success: false as const, message: "Unauthorized" };

    const app = await db.application.findUnique({
      where: { id: applicationId },
      select: { id: true, documentVerification: true },
    });
    if (!app) return { success: false as const, message: "Application not found" };

    const existing: any[] = (app.documentVerification as any[]) || [];
    const idx = existing.findIndex(v => v.checklistItemId === checklistItemId);
    const entry = { checklistItemId, status, reviewedById: session.user.id, reviewedAt: new Date().toISOString(), comment };

    if (idx >= 0) existing[idx] = entry;
    else existing.push(entry);

    await db.application.update({
      where: { id: applicationId },
      data: { documentVerification: existing },
    });

    revalidatePath(`/admins-new/applications/${applicationId}`);
    return { success: true as const, data: { documentVerification: existing } };
  } catch (error: any) {
    console.error("verifyStartupDocument failed:", error);
    return { success: false as const, message: error.message || "Failed to verify document" };
  }
}

export async function completeStartupPreAssessment(applicationId: string) {
  try {
    await requireAnyPermission([...APPLICATION_UPDATE_PERMISSIONS]);
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return { success: false as const, message: "Unauthorized" };

    const app = await db.application.findUnique({
      where: { id: applicationId },
      select: { id: true, status: true, documentVerification: true },
    });
    if (!app) return { success: false as const, message: "Application not found" };
    if (app.status !== "UNDER_REVIEW") return { success: false as const, message: "Application must be under review" };

    const verifications: any[] = (app.documentVerification as any[]) || [];
    const { getRequiredChecklist, checkAllDocumentsVerified, computeVerificationStats } = await import("@/lib/directive/pre-assessment");
    const allVerified = checkAllDocumentsVerified(verifications, "startup");

    if (!allVerified) {
      const stats = computeVerificationStats(verifications, "startup");
      return { success: false as const, message: `Cannot complete pre-assessment: ${stats.verifiedCount}/${stats.totalRequired} documents verified` };
    }

    const updated = await db.application.update({
      where: { id: applicationId },
      data: {
        status: "REVIEWED",
        preAssessedAt: new Date(),
        preAssessedById: session.user.id,
        statusHistory: {
          create: {
            status: "REVIEWED",
            comment: "Pre-assessment completed — all documents verified",
          },
        },
      },
      select: { status: true },
    });

    revalidatePath("/admins-new/applications");
    revalidatePath(`/admins-new/applications/${applicationId}`);
    return { success: true as const, data: { status: updated.status } };
  } catch (error: any) {
    console.error("completeStartupPreAssessment failed:", error);
    return { success: false as const, message: error.message || "Failed to complete pre-assessment" };
  }
}

export async function assignCommitteeAction() {
  throw new Error(
    "assignCommitteeAction(applicationId, committeeId) requires committee selection",
  );
}

export async function getAssignableCommitteesAction() {
  try {
    await requireAnyPermission([...APPLICATION_UPDATE_PERMISSIONS]);
    const committees = await db.committee.findMany({
      where: { status: "ACTIVE" },
      orderBy: { name: "asc" },
      select: {
        id: true,
        name: true,
        entityType: true,
        requiredApprovals: true,
        status: true,
      },
    });
    return { success: true as const, data: committees };
  } catch (error: any) {
    console.error("Failed to fetch committees for assignment:", error);
    return {
      success: false as const,
      message: error.message || "Failed to load committees",
    };
  }
}

export async function assignApplicationToCommitteeAction(data: {
  applicationId: string;
  committeeId: string;
  memberIds: string[];
  chairMemberId: string;
}) {
  try {
    await requireAnyPermission([...APPLICATION_UPDATE_PERMISSIONS]);
    const { applicationId, committeeId, memberIds, chairMemberId } = data;

    if (!applicationId || !committeeId || !memberIds.length || !chairMemberId) {
      return { success: false as const, message: "Missing required fields" };
    }

    const session = await getServerSession(authOptions);
    const assignedById = session?.user?.id;

    const [application, committee] = await Promise.all([
      db.application.findUnique({ where: { id: applicationId } }),
      db.committee.findUnique({ where: { id: committeeId } }),
    ]);

    if (!application) {
      return { success: false as const, message: "Application not found" };
    }

    if (!committee) {
      return { success: false as const, message: "Committee not found" };
    }

    // Stage match check: committee's directivePreset must match application's directiveStage
    const appStage = application.directiveStage || "";
    const committeePresetStage = (committee.directivePreset || "").replace("STARTUP_", "");
    if (appStage && committeePresetStage && appStage !== committeePresetStage) {
      return {
        success: false as const,
        message: `Stage mismatch: Application is "${appStage}" stage but this committee is configured for "${committeePresetStage}" stage. Select a matching committee or load the correct preset.`,
      };
    }

    // Quorum check per Art. 13.1 & 33.3
    const { hasQuorum, getQuorumConfig, getRequiredPresent } = await import("@/lib/directive/quorum");
    const qConfig = getQuorumConfig(committee.entityType === "STARTUP" ? "STANDARD" : "CAC");
    if (!hasQuorum(memberIds.length, memberIds.length, qConfig)) {
      const required = getRequiredPresent(memberIds.length, qConfig);
      return { success: false as const, message: `Committee requires at least ${required} members for quorum (Art. 13.1). Selected: ${memberIds.length}.` };
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
      return { success: false as const, message: "One or more selected members do not belong to the selected committee." };
    }

    await db.$transaction(async (tx) => {
      // 0. Deactivate any existing assignments for this application
      await tx.applicationCommitteeAssignment.updateMany({
        where: { 
          applicationId,
          status: { not: AssignmentStatus.CANCELLED }
        },
        data: { status: AssignmentStatus.CANCELLED }
      });

      // 1. Create or update assignment
      const assignment = await tx.applicationCommitteeAssignment.create({
        data: {
          applicationId,
          committeeId,
          status: AssignmentStatus.ASSIGNED,
          assignedById,
          chairMemberId,
          assignedAt: new Date(),
        }
      });

      // 2. Create evaluations for each member
      for (const memberId of memberIds) {
        // Find the user ID for this member
        const member = await tx.committeeMember.findUnique({
          where: { id: memberId },
          select: { userId: true }
        });

        if (member) {
          await tx.applicationEvaluation.create({
            data: {
              applicationId,
              assignmentId: assignment.id,
              committeeId,
              evaluatorId: member.userId,
              status: EvaluationStatus.DRAFT,
            }
          });
        }
      }

      const newStatus = ApplicationStatus.ASSIGNED_TO_COMMITTEE;
      await tx.application.update({
        where: { id: applicationId },
        data: {
          status: newStatus,
          statusHistory: {
            create: {
              status: newStatus,
              comment: `Assigned to committee ${committee.name}`,
            },
          },
        },
      });
    });

    // Notify Applicant
    const appRecord = await db.application.findUnique({
      where: { id: applicationId },
      select: { userId: true, startupName: true }
    });

    if (appRecord?.userId) {
      await createNotification({
        userId: appRecord.userId,
        title: "Assigned to Committee",
        message: `Your startup application for "${appRecord.startupName}" has been assigned to a committee for final review.`,
        type: "info",
        link: `/dashboard/application`,
        sendAsEmail: false
      });
    }

    // Notify Members
    for (const memberId of memberIds) {
      const member = await db.committeeMember.findUnique({
        where: { id: memberId },
        select: { userId: true, user: { select: { firstName: true } } }
      });
      
      if (member?.userId) {
        await createNotification({
          userId: member.userId,
          title: "New Startup Review Assigned",
          message: `Hello ${member.user.firstName}, you have been assigned to review the startup application for "${appRecord?.startupName}".`,
          type: "info",
          link: `/committee-portal/assessments/startup`,
          sendAsEmail: true
        });
      }
    }

    revalidatePath("/admins-new/applications");
    return { success: true as const };
  } catch (error: any) {
    console.error("Failed to assign committee:", error);
    return {
      success: false as const,
      message: error.message || "Failed to assign committee",
    };
  }
}

export async function unassignApplicationCommitteeAction(applicationId: string) {
  try {
    await requireAnyPermission([...APPLICATION_UPDATE_PERMISSIONS]);
    const session = await getServerSession(authOptions);
    const assignedById = session?.user?.id;

    const application = await db.application.findUnique({
      where: { id: applicationId },
      select: { status: true }
    });

    if (!application) return { success: false, message: "Application not found" };

    await db.$transaction(async (tx) => {
      // 1. Cancel all active assignments
      await tx.applicationCommitteeAssignment.updateMany({
        where: { applicationId, status: { not: AssignmentStatus.CANCELLED } },
        data: { status: AssignmentStatus.CANCELLED }
      });

      // 2. Revert status if needed
      if (application.status === 'ASSIGNED_TO_COMMITTEE' || application.status === 'IN_COMMITTEE_REVIEW') {
        const nextStatus = ApplicationStatus.REVIEWED;
        await tx.application.update({
          where: { id: applicationId },
          data: {
            status: nextStatus,
            statusHistory: {
              create: {
                status: nextStatus,
                comment: 'Committee unassigned'
              }
            }
          }
        });
      }
    });

    revalidatePath("/admins-new/applications");
    return { success: true };
  } catch (error: any) {
    console.error("unassignApplicationCommitteeAction failed:", error);
    return { success: false, message: error.message || "Failed to unassign committee" };
  }
}

export async function approveApplicationAction(applicationId: string) {
  return updateAdminApplicationStatus(applicationId, "APPROVE");
}

export async function rollbackApplicationAction(
  applicationId: string,
  reason: string,
) {
  return updateAdminApplicationStatus(applicationId, "ROLLBACK", { reason });
}

export async function rejectApplicationAction(
  applicationId: string,
  reason: string,
) {
  return updateAdminApplicationStatus(applicationId, "REJECT", { reason });
}

export async function suspendApplicationAction(applicationId: string, reason: string) {
  try {
    await requireAnyPermission([...APPLICATION_UPDATE_PERMISSIONS]);
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return { success: false as const, message: "Unauthorized" };

    const app = await db.application.findUnique({ where: { id: applicationId }, select: { id: true, status: true } });
    if (!app) return { success: false as const, message: "Application not found" };
    if (app.status !== "CERTIFIED") return { success: false as const, message: "Only certified applications can be suspended" };

    await db.application.update({
      where: { id: applicationId },
      data: {
        status: "SUSPENDED" as any,
        reason,
        statusHistory: { create: { status: "SUSPENDED" as any, comment: `Suspended: ${reason}` } },
      },
    });
    revalidatePath("/admins-new/applications");
    return { success: true as const };
  } catch (error: any) {
    return { success: false as const, message: error.message || "Failed to suspend" };
  }
}

export async function revokeApplicationAction(applicationId: string, reason: string) {
  try {
    await requireAnyPermission([...APPLICATION_UPDATE_PERMISSIONS]);
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return { success: false as const, message: "Unauthorized" };

    const app = await db.application.findUnique({ where: { id: applicationId }, select: { id: true, status: true } });
    if (!app) return { success: false as const, message: "Application not found" };

    await db.application.update({
      where: { id: applicationId },
      data: {
        status: "REVOKED" as any,
        reason,
        statusHistory: { create: { status: "REVOKED" as any, comment: `Revoked: ${reason}` } },
      },
    });
    // Also expire the certificate
    await db.certificate.updateMany({
      where: { applicationId },
      data: { status: "EXPIRED" },
    });
    revalidatePath("/admins-new/applications");
    return { success: true as const };
  } catch (error: any) {
    return { success: false as const, message: error.message || "Failed to revoke" };
  }
}

export async function rescindSuspensionAction(applicationId: string) {
  try {
    await requireAnyPermission([...APPLICATION_UPDATE_PERMISSIONS]);
    const app = await db.application.findUnique({ where: { id: applicationId }, select: { id: true, status: true } });
    if (!app) return { success: false as const, message: "Application not found" };
    if (app.status !== "SUSPENDED") return { success: false as const, message: "Application is not suspended" };

    await db.application.update({
      where: { id: applicationId },
      data: {
        status: "CERTIFIED" as any,
        statusHistory: { create: { status: "CERTIFIED" as any, comment: "Suspension rescinded" } },
      },
    });
    revalidatePath("/admins-new/applications");
    return { success: true as const };
  } catch (error: any) {
    return { success: false as const, message: error.message || "Failed to rescind" };
  }
}

export async function getApplicationAssignment(applicationId: string) {
  try {
    await requireAnyPermission([...APPLICATION_VIEW_PERMISSIONS]);
    if (!applicationId)
      return { success: false, message: "applicationId is required" };

    const assignment = await db.applicationCommitteeAssignment.findFirst({
      where: {
        applicationId: applicationId,
        status: { not: AssignmentStatus.CANCELLED },
      },
      include: {
        evaluations: {
          include: {
            evaluator: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
              },
            },
          },
        },
        committee: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: { assignedAt: "desc" },
    });

    if (!assignment) return { success: true, data: null };

    const committeeMembers = await db.committeeMember.findMany({
      where: {
        committeeId: assignment.committeeId,
        userId: { in: assignment.evaluations.map(ev => ev.evaluatorId) },
        removedAt: null
      },
      select: { id: true, userId: true, memberRole: true }
    });

    return {
      success: true,
      data: {
        id: assignment.id,
        committeeId: assignment.committeeId,
        committeeName: assignment.committee.name,
        chairMemberId: assignment.chairMemberId,
        assignedMemberIds: committeeMembers.map(m => m.id),
        reviews: assignment.evaluations.map((ev) => {
          const member = committeeMembers.find(m => m.userId === ev.evaluatorId);
          return {
            id: ev.id,
            status: ev.status,
            memberId: member?.id || ev.evaluatorId,
            member: {
              id: member?.id || ev.evaluatorId,
              user: ev.evaluator,
              memberRole: member?.memberRole || "MEMBER",
            },
          };
        }),
      },
    };
  } catch (error: any) {
    console.error("getApplicationAssignment failed:", error);
    return {
      success: false,
      message: error.message || "Failed to fetch assignment",
    };
  }
}

export async function getAdminStats() {
  try {
    await requireAnyPermission([...APPLICATION_VIEW_PERMISSIONS]);

    const [total, approved] = await Promise.all([
      db.application.count({
        where: { status: { not: ApplicationStatus.DRAFT } },
      }),
      db.application.count({
        where: { status: ApplicationStatus.CERTIFIED },
      }),
    ]);

    // Mock weekly change for now
    const weeklyChange = 5;

    return {
      success: true as const,
      data: {
        total,
        approved,
        pending: total - approved,
        rejected: 0, // Calculate if needed
        additional: 0,
        weeklyChange,
      } satisfies AdminApplicationStats,
    };
  } catch (error: any) {
    console.error("getAdminStats failed:", error);
    return {
      success: false as const,
      message: error.message || "Failed to fetch admin stats",
    };
  }
}

export async function deleteApplication(id: string) {
  try {
    await requireAnyPermission([...APPLICATION_UPDATE_PERMISSIONS]);

    if (!id) return { success: false, message: "id is required" };

    await db.application.delete({
      where: { id },
    });

    revalidatePath("/admins-new/applications");
    return { success: true };
  } catch (error: any) {
    console.error("deleteApplication failed:", error);
    return {
      success: false,
      message: error.message || "Failed to delete application",
    };
  }
}

export async function setApplicationCertified(
  id: string,
  certified: boolean,
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return { success: false, message: "Unauthorized" };

    if (!id) return { success: false, message: "id is required" };

    if (certified) {
      // Fetch application details first
      const application = await db.application.findUnique({
        where: { id },
        include: { user: true }
      });

      if (!application) return { success: false, message: "Application not found" };

      await db.$transaction(async (tx) => {
        // 1. Update application status to CERTIFIED
        await tx.application.update({
          where: { id },
          data: { 
            status: ApplicationStatus.CERTIFIED,
            statusHistory: {
              create: {
                status: ApplicationStatus.CERTIFIED,
                comment: "Application officially certified by administrator.",
              }
            }
          }
        });

        // 2. Create certificate if it doesn't exist
        let certificateId: string;
        const existingCert = await tx.certificate.findUnique({
          where: { applicationId: id }
        });

        if (!existingCert) {
          const year = new Date().getFullYear();
          const timestamp = Date.now().toString().slice(-6);
          const randomPart = randomBytes(3).toString('hex').toUpperCase();
          const certificateNumber = `STP-CERT-${year}-${timestamp}-${randomPart}`;
          
          const qrData = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/verify/startup/${certificateNumber}`;
          const pdfUrl = `/api/startup/certificates/${id}/pdf`;

          const newCert = await tx.certificate.create({
            data: {
              applicationId: id,
              certificateNumber,
              filePath: pdfUrl,
              qrData,
              issuedById: session.user.id,
              type: CertificateType.STARTUP,
              issuedAt: new Date()
            }
          });
          certificateId = newCert.id;
        } else {
          certificateId = existingCert.id;
        }

        // 3. Determine directive stage from application type and directiveStage
        const { getDefaultStageForApplicationType, computeExpiryDate } = await import("@/lib/directive/stages");
        const stage = (application as any).directiveStage || getDefaultStageForApplicationType(application.type);
        const stageExpiry = computeExpiryDate(new Date(), stage);

        await tx.startup.upsert({
          where: { applicationId: id },
          update: {
            name: application.startupName || "Unnamed Startup",
            level: application.typeOfCompany || "level-1",
            directiveStage: stage,
            certificateId: certificateId,
            issuedAt: new Date(),
            expiresAt: stageExpiry,
          },
          create: {
            applicationId: id,
            userId: application.userId,
            name: application.startupName || "Unnamed Startup",
            level: application.typeOfCompany || "level-1",
            directiveStage: stage,
            certificateId: certificateId,
            issuedAt: new Date(),
            expiresAt: stageExpiry,
          }
        });
      });
    } else {
      // 1. Delete Startup profile if it exists
      await db.startup.deleteMany({
        where: { applicationId: id }
      });

      // 2. Remove certificate 
      await db.certificate.deleteMany({
        where: { applicationId: id }
      });

      // 3. Revert status
      await db.application.update({
        where: { id },
        data: { 
          status: ApplicationStatus.COMMITTEE_REVIEW_SUBMITTED,
          statusHistory: {
            create: {
              status: ApplicationStatus.COMMITTEE_REVIEW_SUBMITTED,
              comment: "Certification revoked and reverted to review submitted status.",
            }
          }
        }
      });
    }

    // Notify Startup
    const app = await db.application.findUnique({
      where: { id },
      select: { userId: true, startupName: true }
    });

    if (certified && app?.userId) {
      await createNotification({
        userId: app.userId,
        title: "Certificate Generated",
        message: `Congratulations! Your startup "${app.startupName}" has been officially certified. You can now download your certificate from your dashboard.`,
        type: "success",
        link: `/dashboard/application`, 
        sendAsEmail: true
      });
    }

    revalidatePath("/admins-new/applications");
    revalidatePath(`/admins-new/applications/${id}`);
    revalidatePath("/admins-new/certifications");
    
    return { success: true };
  } catch (error: any) {
    console.error("setApplicationCertified failed:", error);
    return {
      success: false,
      message: error.message || "Failed to update certification",
    };
  }
}
