"use server";

import db from "@/lib/db/index";
import { revalidatePath } from "next/cache";
import {
  requireAnyPermission,
  requirePermission,
} from "@/lib/auth/permissions";
import { PERMISSIONS } from "@/lib/auth/permission-codes";

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

export async function getPermissions() {
  try {
    await requirePermission(PERMISSIONS.ID_ROLE_MANAGE);
    const permissions = await db.permission.findMany({
      orderBy: [{ category: "asc" }, { name: "asc" }],
    });
    return { success: true, data: permissions };
  } catch (error: any) {
    console.error("Failed to fetch permissions:", error);
    return {
      success: false,
      message: error.message || "Failed to fetch permissions",
    };
  }
}

export async function createRole(data: {
  name: string;
  description?: string;
  permissionCodes: string[];
}) {
  try {
    await requirePermission(PERMISSIONS.ID_ROLE_MANAGE);
    const existingRole = await db.role.findFirst({
      where: { name: data.name },
    });

    if (existingRole) {
      return {
        success: false,
        message: "A role with this name already exists.",
      };
    }

    const role = await db.role.create({
      data: {
        name: data.name,
        description: data.description,
        permissions: {
          connect: data.permissionCodes.map((code) => ({ code })),
        },
      },
    });

    revalidatePath("/admins-new/roles");
    return { success: true, message: "Role created successfully", data: role };
  } catch (error: any) {
    console.error("Failed to create role:", error);
    return {
      success: false,
      message: error.message || "Failed to create role",
    };
  }
}

export async function updateRole(
  roleId: string,
  data: { name?: string; description?: string; permissionCodes?: string[] },
) {
  try {
    await requirePermission(PERMISSIONS.ID_ROLE_MANAGE);
    const { permissionCodes, ...rest } = data;

    const updateData: any = { ...rest };
    if (permissionCodes) {
      updateData.permissions = {
        set: [], // Clear existing
        connect: permissionCodes.map((code) => ({ code })),
      };
    }

    const role = await db.role.update({
      where: { id: roleId },
      data: updateData,
    });

    revalidatePath("/admins-new/roles");
    revalidatePath("/admins-new/users");
    return { success: true, message: "Role updated successfully", data: role };
  } catch (error: any) {
    console.error("Failed to update role:", error);
    return {
      success: false,
      message: error.message || "Failed to update role",
    };
  }
}

export async function deleteRole(roleId: string) {
  try {
    await requirePermission(PERMISSIONS.ID_ROLE_MANAGE);
    const roleWithUsers = await db.role.findUnique({
      where: { id: roleId },
      include: {
        _count: {
          select: { users: true },
        },
      },
    });

    if (roleWithUsers && roleWithUsers._count.users > 0) {
      return {
        success: false,
        message: "Cannot delete role while it is assigned to users.",
      };
    }

    await db.role.delete({
      where: { id: roleId },
    });

    revalidatePath("/admins-new/roles");
    return { success: true, message: "Role deleted successfully" };
  } catch (error: any) {
    console.error("Failed to delete role:", error);
    return {
      success: false,
      message: error.message || "Failed to delete role",
    };
  }
}
