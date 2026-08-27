"use server";

import db from "@/lib/db/index";
import { revalidatePath } from "next/cache";
import { requireAnyPermission } from "@/lib/auth/permissions";
import { PERMISSIONS } from "@/lib/auth/permission-codes";
import {
  getPreset,
  getPresetsByType,
  validateWeightTotal,
} from "@/lib/directive/scoring-presets";

const COMMITTEE_MANAGE_PERMISSIONS = [
  PERMISSIONS.ID_USER_MANAGE,
  PERMISSIONS.ID_ROLE_MANAGE,
  PERMISSIONS.SYS_DASHBOARD_ACCESS,
] as const;

type CommitteeEntityTypeUi = "startup" | "ecosystem";

type CommitteeStatusUi = "active" | "inactive";

type MemberRoleUi = "chair" | "member";

const VALID_ENTITY_TYPES = ["startup", "ecosystem"] as const;

const VALID_STATUS_TYPES = ["active", "inactive"] as const;

const MAX_COMMITTEE_NAME_LENGTH = 120;

const MAX_COMMITTEE_DESCRIPTION_LENGTH = 500;

const MAX_REQUIRED_APPROVALS = 20;

function toDbEntityType(value: CommitteeEntityTypeUi) {
  return value === "startup" ? "STARTUP" : "ECOSYSTEM";
}

function toUiEntityType(value: "STARTUP" | "ECOSYSTEM"): CommitteeEntityTypeUi {
  return value === "STARTUP" ? "startup" : "ecosystem";
}

function toDbStatus(value: CommitteeStatusUi) {
  return value === "active" ? "ACTIVE" : "INACTIVE";
}

function toUiStatus(value: "ACTIVE" | "INACTIVE"): CommitteeStatusUi {
  return value === "ACTIVE" ? "active" : "inactive";
}

function toDbMemberRole(value: MemberRoleUi) {
  return value === "chair" ? "CHAIR" : "MEMBER";
}

function toUiMemberRole(value: "CHAIR" | "MEMBER"): MemberRoleUi {
  return value === "CHAIR" ? "chair" : "member";
}

async function requireCommitteeManageAccess() {
  await requireAnyPermission([...COMMITTEE_MANAGE_PERMISSIONS]);
}

function validateCommitteeInput(data: {
  name?: string;
  description?: string;
  entityType?: CommitteeEntityTypeUi;
  requiredApprovals?: number;
  status?: CommitteeStatusUi;
}) {
  const normalizedName = typeof data.name === "string" ? data.name.trim().replace(/\s+/g, " ") : undefined;
  const normalizedDescription = typeof data.description === "string"
    ? data.description.trim().replace(/\s+/g, " ")
    : undefined;

  if (typeof normalizedName === "string") {
    if (!normalizedName) {
      return { success: false as const, message: "Committee name is required" };
    }

    if (normalizedName.length < 3) {
      return { success: false as const, message: "Committee name must be at least 3 characters" };
    }

    if (normalizedName.length > MAX_COMMITTEE_NAME_LENGTH) {
      return { success: false as const, message: `Committee name must be ${MAX_COMMITTEE_NAME_LENGTH} characters or less` };
    }
  }

  if (
    typeof data.entityType !== "undefined" &&
    !VALID_ENTITY_TYPES.includes(data.entityType)
  ) {
    return { success: false as const, message: "Invalid committee entity type" };
  }

  if (
    typeof data.status !== "undefined" &&
    !VALID_STATUS_TYPES.includes(data.status)
  ) {
    return { success: false as const, message: "Invalid committee status" };
  }

  if (typeof normalizedDescription === "string" && normalizedDescription.length > MAX_COMMITTEE_DESCRIPTION_LENGTH) {
    return {
      success: false as const,
      message: `Committee description must be ${MAX_COMMITTEE_DESCRIPTION_LENGTH} characters or less`,
    };
  }

  if (typeof data.requiredApprovals !== "undefined") {
    const requiredApprovals = Number(data.requiredApprovals);

    if (!Number.isInteger(requiredApprovals)) {
      return { success: false as const, message: "Required approvals must be a whole number" };
    }

    if (requiredApprovals < 0 || requiredApprovals > MAX_REQUIRED_APPROVALS) {
      return {
        success: false as const,
        message: `Required approvals must be between 0 and ${MAX_REQUIRED_APPROVALS}`,
      };
    }
  }

  return {
    success: true as const,
    data: {
      name: normalizedName,
      description: normalizedDescription,
      entityType: data.entityType,
      status: data.status,
      requiredApprovals:
        typeof data.requiredApprovals === "undefined"
          ? undefined
          : Number(data.requiredApprovals),
    },
  };
}

export async function getCommittees(params?: {
  search?: string;
  entityType?: CommitteeEntityTypeUi | "all";
  status?: CommitteeStatusUi | "all";
}) {
  try {
    await requireCommitteeManageAccess();

    const search = (params?.search || "").trim();
    const entityType = params?.entityType || "all";
    const status = params?.status || "all";

    const where: any = {};

    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
      ];
    }

    if (entityType !== "all") {
      where.entityType = toDbEntityType(entityType);
    }

    if (status !== "all") {
      where.status = toDbStatus(status);
    }

    const committees = await db.committee.findMany({
      where,
      orderBy: { createdAt: "desc" },
      include: {
        _count: {
          select: {
            members: {
              where: { removedAt: null },
            },
            criteria: true,
          },
        },
      },
    });

    return {
      success: true,
      data: committees.map((c) => ({
        id: c.id,
        name: c.name,
        description: c.description || "",
        entityType: toUiEntityType(c.entityType as any),
        requiredApprovals: c.requiredApprovals,
        status: toUiStatus(c.status as any),
        passThreshold: c.passThreshold,
        directivePreset: c.directivePreset,
        createdAt: c.createdAt.toISOString(),
        members: c._count.members,
        criteriaCount: c._count.criteria,
      })),
    };
  } catch (error: any) {
    console.error("getCommittees failed:", error);
    return {
      success: false,
      message: error.message || "Failed to fetch committees",
    };
  }
}

export async function createCommittee(data: {
  name: string;
  description?: string;
  entityType: CommitteeEntityTypeUi;
  requiredApprovals: number;
  status: CommitteeStatusUi;
  initialMembers?: Array<{
    userId: string;
    memberRole: MemberRoleUi;
  }>;
}) {
  try {
    await requireCommitteeManageAccess();

    const validation = validateCommitteeInput(data);
    if (!validation.success) {
      return validation;
    }

    const { name, description, entityType, requiredApprovals, status } = validation.data;
    const initialMembers = Array.isArray(data.initialMembers)
      ? data.initialMembers.filter((member) => member.userId)
      : [];

    const uniqueMemberIds = new Set(initialMembers.map((member) => member.userId));
    if (uniqueMemberIds.size !== initialMembers.length) {
      return { success: false, message: "Duplicate committee members are not allowed." };
    }

    const chairCount = initialMembers.filter((member) => member.memberRole === "chair").length;
    if (initialMembers.length === 0) {
      return { success: false, message: "Assign at least one member, including the chairman." };
    }

    if (chairCount !== 1) {
      return { success: false, message: "Exactly one chairman is required." };
    }

    if ((requiredApprovals ?? 0) > initialMembers.length) {
      return {
        success: false,
        message: `Required approvals must be between 0 and ${initialMembers.length}`,
      };
    }

    const existingCommittee = await db.committee.findFirst({
      where: {
        name: {
          equals: name,
          mode: "insensitive",
        },
      },
      select: {
        id: true,
        _count: {
          select: {
            members: {
              where: { removedAt: null },
            },
            criteria: true,
            assignments: true,
            ecoAssignments: true,
            evaluations: true,
          },
        },
      },
    });

    const committeeRoleName = "COMMITTEE_MEMBER";

    const role = await db.role.upsert({
      where: { name: committeeRoleName },
      update: {},
      create: {
        name: committeeRoleName,
        description: "Default role for committee membership",
      },
    });

    const users = await db.user.findMany({
      where: {
        id: { in: [...uniqueMemberIds] },
      },
      select: {
        id: true,
        role: true,
        roles: { select: { id: true, name: true } },
      },
    });

    if (users.length !== uniqueMemberIds.size) {
      return { success: false, message: "One or more selected members were not found." };
    }

    const canRecoverExistingCommittee = Boolean(
      existingCommittee &&
        existingCommittee._count.members === 0 &&
        existingCommittee._count.criteria === 0 &&
        existingCommittee._count.assignments === 0 &&
        existingCommittee._count.ecoAssignments === 0 &&
        existingCommittee._count.evaluations === 0,
    );

    if (existingCommittee && !canRecoverExistingCommittee) {
      return { success: false, message: "A committee with this name already exists" };
    }

    const committee = await db.$transaction(async (tx) => {
      const createdCommittee = canRecoverExistingCommittee
        ? await tx.committee.update({
            where: { id: existingCommittee!.id },
            data: {
              description: description || null,
              entityType: toDbEntityType(entityType!) as any,
              requiredApprovals: requiredApprovals!,
              status: toDbStatus(status!) as any,
            },
          })
        : await tx.committee.create({
            data: {
              name: name!,
              description: description || null,
              entityType: toDbEntityType(entityType!) as any,
              requiredApprovals: requiredApprovals!,
              status: toDbStatus(status!) as any,
            },
          });

      for (const user of users) {
        const alreadyHasCommitteeRole = user.roles.some((existingRole) => existingRole.name === committeeRoleName);

        await tx.user.update({
          where: { id: user.id },
          data: {
            ...(user.role === "USER" ? { role: "REVIEWER" } : {}),
            ...(alreadyHasCommitteeRole
              ? {}
              : {
                  roles: {
                    connect: { id: role.id },
                  },
                }),
          },
        });
      }

      await tx.committeeMember.createMany({
        data: initialMembers.map((member) => ({
          committeeId: createdCommittee.id,
          userId: member.userId,
          memberRole: toDbMemberRole(member.memberRole) as any,
        })),
      });

      return createdCommittee;
    });

    revalidatePath("/admins-new/committees");
    return { success: true, data: committee };
  } catch (error: any) {
    console.error("createCommittee failed:", error);
    if (error.code === "P2002") {
      return {
        success: false,
        message: "A committee with this name already exists",
      };
    }
    return {
      success: false,
      message: error.message || "Failed to create committee",
    };
  }
}

export async function updateCommittee(
  committeeId: string,
  data: {
    name?: string;
    description?: string;
    entityType?: CommitteeEntityTypeUi;
    requiredApprovals?: number;
    status?: CommitteeStatusUi;
    members?: Array<{
      userId: string;
      memberRole: MemberRoleUi;
    }>;
  },
) {
  try {
    await requireCommitteeManageAccess();

    if (!committeeId)
      return { success: false, message: "Committee id is required" };

    const validation = validateCommitteeInput(data);
    if (!validation.success) {
      return validation;
    }

    const { name, description, entityType, requiredApprovals, status } = validation.data;
    const members = Array.isArray(data.members)
      ? data.members.filter((member) => member.userId)
      : undefined;

    if (members) {
      const uniqueMemberIds = new Set(members.map((m) => m.userId));
      if (uniqueMemberIds.size !== members.length) {
        return { success: false, message: "Duplicate committee members are not allowed." };
      }

      const chairCount = members.filter((m) => m.memberRole === "chair").length;
      if (members.length === 0) {
        return { success: false, message: "Assign at least one member, including the chairman." };
      }

      if (chairCount !== 1) {
        return { success: false, message: "Exactly one chairman is required." };
      }
    }

    const updateData: any = {};

    if (typeof name === "string") {
      const existingCommittee = await db.committee.findFirst({
        where: {
          id: { not: committeeId },
          name: {
            equals: name,
            mode: "insensitive",
          },
        },
        select: { id: true },
      });

      if (existingCommittee) {
        return { success: false, message: "A committee with this name already exists" };
      }

      updateData.name = name;
    }
    if (typeof description === "string") {
      updateData.description = description || null;
    }
    if (entityType) {
      updateData.entityType = toDbEntityType(entityType);
    }
    if (typeof requiredApprovals === "number") {
      updateData.requiredApprovals = requiredApprovals;
    }
    if (status) updateData.status = toDbStatus(status);

    await db.$transaction(async (tx) => {
      // Update basic info
      await tx.committee.update({
        where: { id: committeeId },
        data: updateData,
      });

      if (members) {
        // Soft delete all current members
        await tx.committeeMember.updateMany({
          where: { committeeId, removedAt: null },
          data: { removedAt: new Date() },
        });

        const committeeRoleName = "COMMITTEE_MEMBER";
        const role = await db.role.upsert({
          where: { name: committeeRoleName },
          update: {},
          create: {
            name: committeeRoleName,
            description: "Default role for committee membership",
          },
        });

        for (const member of members) {
          const user = await tx.user.findUnique({
            where: { id: member.userId },
            select: { id: true, role: true, roles: { select: { id: true, name: true } } },
          });

          if (!user) continue;

          // Update user role if needed
          const alreadyHasCommitteeRole = user.roles.some((r) => r.name === committeeRoleName);
          await tx.user.update({
            where: { id: user.id },
            data: {
              ...(user.role === "USER" ? { role: "REVIEWER" } : {}),
              ...(alreadyHasCommitteeRole
                ? {}
                : {
                    roles: {
                      connect: { id: role.id },
                    },
                  }),
            },
          });

          // Insert or update member record
          const existingMembership = await tx.committeeMember.findFirst({
            where: {
              committeeId,
              userId: member.userId,
            },
            select: { id: true },
          });

          if (existingMembership) {
            await tx.committeeMember.update({
              where: { id: existingMembership.id },
              data: {
                removedAt: null,
                memberRole: toDbMemberRole(member.memberRole) as any,
              },
            });
          } else {
            await tx.committeeMember.create({
              data: {
                committeeId,
                userId: member.userId,
                memberRole: toDbMemberRole(member.memberRole) as any,
              },
            });
          }
        }
      }
    });

    revalidatePath("/admins-new/committees");
    return { success: true };
  } catch (error: any) {
    console.error("updateCommittee failed:", error);
    if (error.code === "P2002") {
      return {
        success: false,
        message: "A committee with this name already exists",
      };
    }
    return {
      success: false,
      message: error.message || "Failed to update committee",
    };
  }
}

export async function deleteCommittee(committeeId: string) {
  try {
    await requireCommitteeManageAccess();

    if (!committeeId)
      return { success: false, message: "Committee id is required" };

    await db.committee.delete({ where: { id: committeeId } });

    revalidatePath("/admins-new/committees");
    return { success: true };
  } catch (error: any) {
    console.error("deleteCommittee failed:", error);
    return {
      success: false,
      message: error.message || "Failed to delete committee",
    };
  }
}

export async function getCommitteeMembers(committeeId: string) {
  try {
    await requireCommitteeManageAccess();

    const members = await db.committeeMember.findMany({
      where: { committeeId, removedAt: null },
      orderBy: [{ memberRole: "asc" }, { addedAt: "desc" }],
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phoneNumber: true,
            role: true,
            roles: { select: { id: true, name: true } },
          },
        },
      },
    });

    return {
      success: true,
      data: members.map((m) => ({
        id: m.id,
        userId: m.userId,
        committeeId: m.committeeId,
        memberRole: toUiMemberRole(m.memberRole as any),
        addedAt: m.addedAt.toISOString(),
        user: {
          id: m.user.id,
          firstName: m.user.firstName,
          lastName: m.user.lastName,
          email: m.user.email,
          phoneNumber: m.user.phoneNumber,
          role: m.user.role,
          roles: m.user.roles,
        },
      })),
    };
  } catch (error: any) {
    console.error("getCommitteeMembers failed:", error);
    return {
      success: false,
      message: error.message || "Failed to fetch committee members",
    };
  }
}

export async function getEligibleCommitteeUsers(params?: {
  search?: string;
  onlyCommitteeRole?: boolean;
  committeeId?: string;
}) {
  try {
    await requireCommitteeManageAccess();

    const search = (params?.search || "").trim();
    const onlyCommitteeRole = Boolean(params?.onlyCommitteeRole);
    const committeeId = params?.committeeId?.trim();

    const where: any = {
      deletedAt: null,
    };

    if (onlyCommitteeRole) {
      where.OR = [
        { role: "REVIEWER" },
        {
          roles: {
            some: {
              name: {
                in: [
                  "COMMITTEE",
                  "COMMITTEE_MEMBER",
                  "Committee",
                  "Committee Member",
                  "REVIEWER",
                  "Reviewer",
                ],
              },
            },
          },
        },
      ];
    }

    if (search) {
      const searchOr = [
        { firstName: { contains: search, mode: "insensitive" } },
        { lastName: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } },
        { phoneNumber: { contains: search, mode: "insensitive" } },
      ];

      if (onlyCommitteeRole) {
        where.AND = [{ OR: searchOr }];
      } else {
        where.OR = searchOr;
      }
    }

    if (committeeId) {
      where.committeeMemberships = {
        none: {
          committeeId,
          removedAt: null,
        },
      };
    }

    const users = await db.user.findMany({
      where,
      take: 30,
      orderBy: [{ firstName: "asc" }, { lastName: "asc" }],
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        phoneNumber: true,
        role: true,
      },
    });

    return { success: true, data: users };
  } catch (error: any) {
    console.error("getEligibleCommitteeUsers failed:", error);
    return {
      success: false,
      message: error.message || "Failed to fetch eligible users",
    };
  }
}

export async function addCommitteeMember(data: {
  committeeId: string;
  userId: string;
  memberRole?: MemberRoleUi;
}) {
  try {
    await requireCommitteeManageAccess();

    if (!data.committeeId || !data.userId) {
      return { success: false, message: "committeeId and userId are required" };
    }

    const committeeRoleName = "COMMITTEE_MEMBER";

    const role = await db.role.upsert({
      where: { name: committeeRoleName },
      update: {},
      create: {
        name: committeeRoleName,
        description: "Default role for committee membership",
      },
    });

    const user = await db.user.findUnique({
      where: { id: data.userId },
      select: {
        id: true,
        role: true,
        roles: { select: { id: true, name: true } },
      },
    });

    if (!user) return { success: false, message: "User not found" };

    const alreadyHasCommitteeRole = user.roles.some(
      (r) => r.name === committeeRoleName,
    );

    const existingMembership = await db.committeeMember.findFirst({
      where: {
        committeeId: data.committeeId,
        userId: data.userId,
      },
      select: { id: true, removedAt: true },
    });

    const desiredMemberRole = toDbMemberRole(
      data.memberRole || "member",
    ) as any;

    await db.$transaction([
      db.user.update({
        where: { id: user.id },
        data: {
          ...(user.role === "USER" ? { role: "REVIEWER" } : {}),
          ...(alreadyHasCommitteeRole
            ? {}
            : {
                roles: {
                  connect: { id: role.id },
                },
              }),
        },
      }),
      ...(existingMembership
        ? [
            db.committeeMember.update({
              where: { id: existingMembership.id },
              data: {
                removedAt: null,
                memberRole: desiredMemberRole,
              },
            }),
          ]
        : [
            db.committeeMember.create({
              data: {
                committeeId: data.committeeId,
                userId: data.userId,
                memberRole: desiredMemberRole,
              },
            }),
          ]),
    ]);

    revalidatePath("/admins-new/committees");
    return { success: true };
  } catch (error: any) {
    console.error("addCommitteeMember failed:", error);
    if (error.code === "P2002") {
      return {
        success: false,
        message: "User is already a member of this committee.",
      };
    }
    return { success: false, message: error.message || "Failed to add member" };
  }
}

export async function removeCommitteeMember(memberId: string) {
  try {
    await requireCommitteeManageAccess();

    const membership = await db.committeeMember.findUnique({
      where: { id: memberId },
      select: {
        id: true,
        committeeId: true,
        memberRole: true,
        removedAt: true,
      },
    });

    if (!membership || membership.removedAt) {
      return { success: false, message: "Member not found" };
    }

    if (membership.memberRole === "CHAIR") {
      const activeChairs = await db.committeeMember.count({
        where: {
          committeeId: membership.committeeId,
          removedAt: null,
          memberRole: "CHAIR",
        },
      });

      if (activeChairs <= 1) {
        return {
          success: false,
          message: "You must assign another chairman before unassigning the current chairman.",
        };
      }
    }

    await db.committeeMember.update({
      where: { id: memberId },
      data: { removedAt: new Date() },
    });

    revalidatePath("/admins-new/committees");
    return { success: true };
  } catch (error: any) {
    console.error("removeCommitteeMember failed:", error);
    return {
      success: false,
      message: error.message || "Failed to remove member",
    };
  }
}

export async function updateCommitteeMemberRole(
  memberId: string,
  memberRole: MemberRoleUi,
) {
  try {
    await requireCommitteeManageAccess();

    const membership = await db.committeeMember.findUnique({
      where: { id: memberId },
      select: {
        id: true,
        committeeId: true,
        memberRole: true,
        removedAt: true,
      },
    });

    if (!membership || membership.removedAt) {
      return { success: false, message: "Member not found" };
    }

    const targetRole = toDbMemberRole(memberRole) as any;

    if (membership.memberRole === targetRole) {
      return { success: true };
    }

    if (targetRole === "MEMBER" && membership.memberRole === "CHAIR") {
      const activeChairs = await db.committeeMember.count({
        where: {
          committeeId: membership.committeeId,
          removedAt: null,
          memberRole: "CHAIR",
        },
      });

      if (activeChairs <= 1) {
        return {
          success: false,
          message: "You must assign another chairman before changing this chairman to member.",
        };
      }
    }

    await db.$transaction(async (tx) => {
      if (targetRole === "CHAIR") {
        await tx.committeeMember.updateMany({
          where: {
            committeeId: membership.committeeId,
            removedAt: null,
            memberRole: "CHAIR",
            id: { not: membership.id },
          },
          data: { memberRole: "MEMBER" },
        });
      }

      await tx.committeeMember.update({
        where: { id: memberId },
        data: { memberRole: targetRole },
      });
    });

    revalidatePath("/admins-new/committees");
    return { success: true };
  } catch (error: any) {
    console.error("updateCommitteeMemberRole failed:", error);
    return {
      success: false,
      message: error.message || "Failed to update member role",
    };
  }
}

export async function getCommitteeCriteria(committeeId: string) {
  try {
    await requireCommitteeManageAccess();

    const criteria = await db.committeeCriterion.findMany({
      where: { committeeId },
      orderBy: { createdAt: "asc" },
    });

    return {
      success: true,
      data: criteria.map((c) => ({
        id: c.id,
        committeeId: c.committeeId,
        name: c.name,
        description: c.description || "",
        weight: c.weight,
        directivePreset: c.directivePreset,
        directiveRef: c.directiveRef,
      })),
    };
  } catch (error: any) {
    console.error("getCommitteeCriteria failed:", error);
    return {
      success: false,
      message: error.message || "Failed to fetch criteria",
    };
  }
}

export async function getAvailablePresets(entityType: string) {
  try {
    await requireCommitteeManageAccess();

    const presets = getPresetsByType(entityType as "startup" | "ecosystem");
    return {
      success: true,
      data: Object.entries(presets).map(([key, preset]) => ({
        key,
        label: preset.label,
        criteriaCount: preset.criteria.length,
        passThreshold: preset.passThreshold,
        criteria: preset.criteria.map((c) => ({
          name: c.name,
          maxWeight: c.maxWeight,
          description: c.description,
          directiveRef: c.directiveRef,
        })),
      })),
    };
  } catch (error: any) {
    console.error("getAvailablePresets failed:", error);
    return {
      success: false,
      message: error.message || "Failed to fetch presets",
    };
  }
}

export async function loadDirectivePreset(
  committeeId: string,
  presetKey: string,
) {
  try {
    await requireCommitteeManageAccess();

    const preset = getPreset(presetKey);
    if (!preset) {
      return { success: false, message: "Invalid preset key" };
    }

    const committee = await db.committee.findUnique({
      where: { id: committeeId },
      include: {
        _count: {
          select: {
            assignments: true,
            ecoAssignments: true,
          },
        },
      },
    });

    if (!committee) {
      return { success: false, message: "Committee not found" };
    }

    if (committee._count.assignments > 0 || committee._count.ecoAssignments > 0) {
      return {
        success: false,
        message:
          "Cannot load preset: committee already has active assignments. Remove all assignments first.",
      };
    }

    const validation = validateWeightTotal(preset.criteria);
    if (!validation.valid) {
      return {
        success: false,
        message: `Preset weights total ${validation.total}%, must equal exactly 100%.`,
      };
    }

    await db.$transaction(async (tx) => {
      // Delete existing criteria
      await tx.committeeCriterion.deleteMany({
        where: { committeeId },
      });

      // Create preset criteria
      for (const c of preset.criteria) {
        await tx.committeeCriterion.create({
          data: {
            committeeId,
            name: c.name,
            description: c.description,
            weight: c.maxWeight,
            directivePreset: presetKey,
            directiveRef: c.directiveRef,
          },
        });
      }

      // Update committee with preset metadata
      await tx.committee.update({
        where: { id: committeeId },
        data: {
          directivePreset: presetKey,
          passThreshold: preset.passThreshold,
        },
      });
    });

    revalidatePath("/admins-new/committees");
    return { success: true };
  } catch (error: any) {
    console.error("loadDirectivePreset failed:", error);
    return {
      success: false,
      message: error.message || "Failed to load preset",
    };
  }
}

async function canEditPresetCriteria(committeeId: string): Promise<{
  allowed: boolean;
  message?: string;
}> {
  const committee = await db.committee.findUnique({
    where: { id: committeeId },
    select: {
      directivePreset: true,
      _count: {
        select: {
          assignments: {
            where: {
              status: { not: "CANCELLED" },
            },
          },
          ecoAssignments: {
            where: { active: true },
          },
        },
      },
    },
  });

  if (!committee) {
    return { allowed: false, message: "Committee not found" };
  }

  if (committee.directivePreset && committee._count.assignments + committee._count.ecoAssignments > 0) {
    return {
      allowed: false,
      message:
        "Cannot modify preset criteria while committee has active assignments.",
    };
  }

  return { allowed: true };
}

export async function upsertCommitteeCriterion(data: {
  id?: string;
  committeeId: string;
  name: string;
  description?: string;
  weight: number;
}) {
  try {
    await requireCommitteeManageAccess();

    const committeeId = data.committeeId?.trim();
    const criterionId = data.id?.trim();
    const name = data.name.trim().replace(/\s+/g, " ");
    const description = data.description?.trim().replace(/\s+/g, " ") || null;
    const weight = Number(data.weight);

    if (!committeeId) {
      return { success: false, message: "Committee id is required" };
    }

    if (!name) {
      return { success: false, message: "Criterion name is required" };
    }

    if (!Number.isInteger(weight) || weight < 1 || weight > 100) {
      return { success: false, message: "Weight must be a whole number between 1 and 100" };
    }

    const editCheck = await canEditPresetCriteria(committeeId);
    if (!editCheck.allowed) {
      return { success: false, message: editCheck.message };
    }

    const totalWeightResult = await db.committeeCriterion.aggregate({
      where: {
        committeeId,
        ...(criterionId
          ? {
              id: { not: criterionId },
            }
          : {}),
      },
      _sum: {
        weight: true,
      },
    });

    const existingWeight = totalWeightResult._sum.weight ?? 0;
    if (existingWeight + weight > 100) {
      return {
        success: false,
        message: "Total criteria weight cannot exceed 100",
      };
    }

    const committee = await db.committee.findUnique({
      where: { id: committeeId },
      select: { id: true },
    });

    if (!committee) {
      return { success: false, message: "Committee not found" };
    }

    let existingCriterion: {
      id: string;
      committeeId: string;
      name: string;
      directivePreset: string | null;
    } | null = null;

    if (criterionId) {
      existingCriterion = await db.committeeCriterion.findUnique({
        where: { id: criterionId },
        select: {
          id: true,
          committeeId: true,
          name: true,
          directivePreset: true,
        },
      });

      if (!existingCriterion || existingCriterion.committeeId !== committeeId) {
        return { success: false, message: "Criterion not found" };
      }

      // Block weight changes on preset criteria
      if (existingCriterion.directivePreset) {
        return {
          success: false,
          message:
            "Cannot edit a directive preset criterion. Remove the preset first, or create custom criteria.",
        };
      }
    }

    const duplicateCriterion = await db.committeeCriterion.findFirst({
      where: {
        committeeId,
        name: {
          equals: name,
          mode: "insensitive",
        },
        ...(criterionId
          ? {
              id: { not: criterionId },
            }
          : {}),
      },
      select: { id: true },
    });

    if (duplicateCriterion) {
      return {
        success: false,
        message: "A criterion with this name already exists for this committee.",
      };
    }

    let savedCriterion;

    if (existingCriterion) {
      savedCriterion = await db.committeeCriterion.update({
        where: { id: existingCriterion.id },
        data: {
          name,
          description,
          weight,
        },
      });
    } else {
      savedCriterion = await db.committeeCriterion.create({
        data: {
          committeeId,
          name,
          description,
          weight,
        },
      });
    }

    revalidatePath("/admins-new/committees");
    return {
      success: true,
      data: {
        id: savedCriterion.id,
        committeeId: savedCriterion.committeeId,
        name: savedCriterion.name,
        description: savedCriterion.description || "",
        weight: savedCriterion.weight,
        directivePreset: savedCriterion.directivePreset,
        directiveRef: savedCriterion.directiveRef,
      },
    };
  } catch (error: any) {
    console.error("upsertCommitteeCriterion failed:", error);
    if (error.code === "P2002") {
      return {
        success: false,
        message:
          "A criterion with this name already exists for this committee.",
      };
    }
    return {
      success: false,
      message: error.message || "Failed to save criterion",
    };
  }
}

export async function deleteCommitteeCriterion(criterionId: string) {
  try {
    await requireCommitteeManageAccess();

    if (!criterionId) {
      return { success: false, message: "Criterion id is required" };
    }

    const existingCriterion = await db.committeeCriterion.findUnique({
      where: { id: criterionId },
      select: { id: true },
    });

    if (!existingCriterion) {
      return { success: false, message: "Criterion not found" };
    }

    await db.committeeCriterion.delete({ where: { id: criterionId } });

    revalidatePath("/admins-new/committees");
    return { success: true };
  } catch (error: any) {
    console.error("deleteCommitteeCriterion failed:", error);
    return {
      success: false,
      message: error.message || "Failed to delete criterion",
    };
  }
}
