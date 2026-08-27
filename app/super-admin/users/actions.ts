"use server";

import db from "@/lib/db/index";
import { revalidatePath } from "next/cache";
import { requirePermission, requireAnyPermission } from "@/lib/auth/permissions";
import { PERMISSIONS } from "@/lib/auth/permission-codes";
import { UserRole } from "@prisma/client";

export async function getRoles() {
  try {
    await requireAnyPermission([
      PERMISSIONS.ID_ROLE_MANAGE,
      PERMISSIONS.ID_USER_VIEW,
      PERMISSIONS.ID_USER_MANAGE,
    ]);
    const roles = await db.role.findMany({
      include: {
        _count: {
          select: { users: true },
        },
        permissions: true,
      },
      orderBy: {
        name: "asc",
      },
    });
    return { success: true, data: roles };
  } catch (error: any) {
    console.error("Failed to fetch roles:", error);
    return {
      success: false,
      message: error.message || "Failed to fetch roles",
    };
  }
}

// Normalize role to ensure it matches the Prisma Enum
function normalizeUserRole(role: any): UserRole {
  const validRoles = Object.values(UserRole);
  if (validRoles.includes(role)) return role as UserRole;
  
  // Legacy or slight mismatches
  if (role === "MANAGER" || role === "SUPPORT") return "ADMIN"; // Fallback for Super Admin view if needed
  if (role === "COMMITTEE") return "COMMITTEE";
  
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
      baseWhere.role = role as UserRole;
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
    const user = await db.user.findUnique({
      where: { id: userId },
      include: {
        _count: {
          select: {
            applications: true,
            reviewedApplications: true,
            roles: true,
            messages: true,
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
      user._count.messages > 0;

    if (isAssigned) {
      await db.user.update({
        where: { id: userId },
        data: {
          deletedAt: new Date(),
        },
      });
      revalidatePath("/super-admin/users");
      return {
        success: true,
        message: "User identity archived (soft delete) due to existing assignments",
      };
    } else {
      await db.user.delete({
        where: { id: userId },
      });
      revalidatePath("/super-admin/users");
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
    revalidatePath("/super-admin/users");
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
    revalidatePath("/super-admin/users");
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
          message: "This phone number is already registered to another account.",
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
    
    revalidatePath("/super-admin/users");
    return { success: true, message: "User updated successfully" };
  } catch (error: any) {
    console.error("Failed to update user:", error);
    return { success: false, message: error.message || "Failed to update user" };
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
        return { success: false, message: "An identity with this email already exists." };
      }
      if (existingUser.phoneNumber === data.phoneNumber) {
        return { success: false, message: "An identity with this phone number already exists." };
      }
    }

    const user = await db.user.create({
      data: {
        ...userData,
        role: normalizedRole,
        emailVerified: true,
        password: "ChangeMe123!",
        ...(roles && roles.length > 0
          ? {
              roles: {
                connect: roles.map((id) => ({ id })),
              },
            }
          : {}),
      },
    });

    revalidatePath("/super-admin/users");
    return { success: true, message: "User created successfully", data: user };
  } catch (error: any) {
    console.error("Failed to create user:", error);
    return { success: false, message: error.message || "Failed to create user" };
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
    return { success: false, message: error.message || "Failed to fetch user details" };
  }
}
