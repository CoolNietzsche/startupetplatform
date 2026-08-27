"use server";

import db from "@/lib/db/index";
import { revalidatePath } from "next/cache";
import { requirePermission } from "@/lib/auth/permissions";
import { PERMISSIONS } from "@/lib/auth/permission-codes";
import bcrypt from "bcryptjs";

const DEFAULT_USER_PASSWORD = "ChangeMe123!";

const USER_ROLE_ENUM = [
  "SUPER_ADMIN",
  "ADMIN",
  "REVIEWER",
  "MANAGER",
  "SUPPORT",
  "USER",
] as const;

function normalizeUserRole(role: any): (typeof USER_ROLE_ENUM)[number] {
  if (typeof role !== "string") return "USER";
  if ((USER_ROLE_ENUM as readonly string[]).includes(role)) return role as any;
  if (role === "COMMITTEE_MEMBER" || role === "COMMITTEE") return "REVIEWER";
  return "USER";
}

export async function getUsers(
  page: number = 1,
  pageSize: number = 10,
  search: string = "",
  role?: string,
  status?: string,
) {
  try {
    await requirePermission(PERMISSIONS.ID_USER_VIEW);
    const baseWhere: any = {};

    if (status === "archived") {
      baseWhere.deletedAt = { not: null };
    } else {
      baseWhere.deletedAt = null;
    }

    if (search) {
      baseWhere.OR = [
        { firstName: { contains: search, mode: "insensitive" as const } },
        { lastName: { contains: search, mode: "insensitive" as const } },
        { email: { contains: search, mode: "insensitive" as const } },
        { phoneNumber: { contains: search, mode: "insensitive" as const } },
      ];
    }

    if (role && role !== "all") {
      baseWhere.role = role;
    }

    if (status && status !== "all" && status !== "archived") {
      baseWhere.emailVerified = status === "active" ? { not: null } : null;
    }

    // Execute in parallel for performance
    const [users, total, adminCount, reviewerCount, verifiedCount] =
      await Promise.all([
        db.user.findMany({
          where: baseWhere,
          skip: (page - 1) * pageSize,
          take: pageSize,
          orderBy: {
            createdAt: "desc",
          },
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            role: true,
            emailVerified: true,
            createdAt: true,
            phoneNumber: true,
            onboardingCompleted: true,
            isSuspended: true,
            roles: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        }),
        db.user.count({ where: baseWhere }),
        db.user.count({
          where: { deletedAt: null, role: { in: ["ADMIN", "SUPER_ADMIN"] } },
        }),
        db.user.count({ where: { deletedAt: null, role: "REVIEWER" } }),
        db.user.count({
          where: { deletedAt: null, emailVerified: { not: null } },
        }),
      ]);

    return {
      success: true,
      data: users,
      stats: {
        total,
        adminCount,
        reviewerCount,
        verifiedCount,
      },
      pagination: {
        total,
        page,
        pageSize,
        totalPages: Math.ceil(total / pageSize),
      },
    };
  } catch (error: any) {
    console.error("Failed to fetch users:", error);
    return {
      success: false,
      message: error.message || "Failed to fetch users",
    };
  }
}

export async function deleteUser(userId: string) {
  try {
    await requirePermission(PERMISSIONS.ID_USER_MANAGE);
    // Check if user has any critical assignments (applications, reviews, or roles)
    const user = await db.user.findUnique({
      where: { id: userId },
      include: {
        _count: {
          select: {
            applications: true,
            reviewedApplications: true,
            roles: true,
            sentMessages: true,
            receivedMessages: true,
          },
        },
      },
    });

    if (!user) {
      return { success: false, message: "User not found" };
    }

    const isAssigned =
      user._count.applications > 0 ||
      user._count.reviewedApplications > 0 ||
      user._count.roles > 0 ||
      user._count.sentMessages > 0 ||
      user._count.receivedMessages > 0;

    if (isAssigned) {
      // Soft delete for users with data
      await db.user.update({
        where: { id: userId },
        data: {
          deletedAt: new Date(),
        },
      });
      revalidatePath("/admins-new/users");
      return {
        success: true,
        message:
          "User identity archived (soft delete) due to existing assignments",
      };
    } else {
      // Hard delete for fresh/unassigned users
      await db.user.delete({
        where: { id: userId },
      });
      revalidatePath("/admins-new/users");
      return {
        success: true,
        message: "User identity permanently removed (hard delete)",
      };
    }
  } catch (error: any) {
    console.error("Failed to delete user:", error);
    return {
      success: false,
      message: error.message || "Failed to delete user",
    };
  }
}

export async function restoreUser(userId: string) {
  try {
    await requirePermission(PERMISSIONS.ID_USER_MANAGE);
    await db.user.update({
      where: { id: userId },
      data: {
        deletedAt: null,
      },
    });
    revalidatePath("/admins-new/users");
    return { success: true, message: "User account has been restored" };
  } catch (error: any) {
    console.error("Failed to restore user:", error);
    return {
      success: false,
      message: error.message || "Failed to restore user",
    };
  }
}

export async function toggleUserSuspension(
  userId: string,
  currentStatus: boolean,
) {
  try {
    await requirePermission(PERMISSIONS.ID_USER_MANAGE);
    await db.user.update({
      where: { id: userId },
      data: {
        isSuspended: !currentStatus,
      },
    });
    revalidatePath("/admins-new/users");
    return {
      success: true,
      message: currentStatus
        ? "User suspension lifted"
        : "User access has been suspended",
    };
  } catch (error: any) {
    console.error("Failed to toggle suspension:", error);
    return {
      success: false,
      message: error.message || "Failed to update suspension status",
    };
  }
}

export async function updateUser(
  userId: string,
  data: {
    role?: any;
    firstName?: string;
    lastName?: string;
    phoneNumber?: string;
    roles?: string[];
  },
) {
  try {
    await requirePermission(PERMISSIONS.ID_USER_MANAGE);
    if (data.phoneNumber) {
      const existingPhone = await db.user.findFirst({
        where: {
          phoneNumber: data.phoneNumber,
          NOT: { id: userId },
        },
      });
      if (existingPhone) {
        return {
          success: false,
          message:
            "This phone number is already registered to another account.",
        };
      }
    }

    const { roles, ...dbData } = data;
    if (dbData.role) {
      dbData.role = normalizeUserRole(dbData.role);
    }
    const updatePayload: any = { ...dbData };
    if (roles) {
      updatePayload.roles = {
        set: roles.map((id: string) => ({ id })),
      };
    }

    await db.user.update({
      where: { id: userId },
      data: updatePayload,
    });
    revalidatePath("/admins-new/users");
    return { success: true, message: "User updated successfully" };
  } catch (error: any) {
    console.error("Failed to update user:", error);
    if (error.code === "P2002") {
      const field = error.meta?.target?.[0] || "field";
      return {
        success: false,
        message: `An account with this ${field} already exists.`,
      };
    }
    return { success: false, message: "Failed to update user" };
  }
}

export async function createUser(data: {
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  phoneNumber?: string;
  roles?: string[];
}) {
  try {
    await requirePermission(PERMISSIONS.ID_USER_MANAGE);
    const { roles, role, ...userData } = data;
    const normalizedRole = normalizeUserRole(role);
    const existingUser = await db.user.findFirst({
      where: {
        OR: [
          { email: data.email },
          ...(data.phoneNumber ? [{ phoneNumber: data.phoneNumber }] : []),
        ],
      },
    });

    if (existingUser) {
      if (existingUser.email === data.email) {
        return {
          success: false,
          message: "An identity with this email already exists.",
        };
      }
      if (existingUser.phoneNumber === data.phoneNumber) {
        return {
          success: false,
          message: "An identity with this phone number already exists.",
        };
      }
    }

    const hashedPassword = await bcrypt.hash(DEFAULT_USER_PASSWORD, 10);

    const user = await db.user.create({
      data: {
        ...userData,
        role: normalizedRole,
        emailVerified: true, // Auto-verify users created by admin
        password: hashedPassword,
        ...(roles && roles.length > 0
          ? {
              roles: {
                connect: roles.map((id) => ({ id })),
              },
            }
          : {}),
      },
    });

    revalidatePath("/admins-new/users");
    return {
      success: true,
      message: `User created successfully. Default password: ${DEFAULT_USER_PASSWORD}`,
      data: user,
    };
  } catch (error: any) {
    console.error("Failed to create user:", error);
    if (error.code === "P2002") {
      const target = error.meta?.target || [];
      if (target.includes("email")) {
        return { success: false, message: "Email address is already in use." };
      }
      return {
        success: false,
        message: "A unique constraint violation occurred in the database.",
      };
    }
    return {
      success: false,
      message: error.message || "Failed to create user",
    };
  }
}

export async function getUserById(userId: string) {
  try {
    await requirePermission(PERMISSIONS.ID_USER_VIEW);
    const user = await db.user.findUnique({
      where: {
        id: userId,
        deletedAt: null,
      },
      include: {
        roles: true,
      },
    });

    if (!user) {
      return { success: false, message: "User not found" };
    }

    return { success: true, data: user };
  } catch (error: any) {
    console.error("Failed to fetch user:", error);
    return {
      success: false,
      message: error.message || "Failed to fetch user details",
    };
  }
}
