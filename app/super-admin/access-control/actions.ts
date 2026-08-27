"use server";

import db from "@/lib/db/index";
import { revalidatePath } from "next/cache";
import { requirePermission } from "@/lib/auth/permissions";
import { PERMISSIONS } from "@/lib/auth/permission-codes";

export async function getAccessControlData() {
  try {
    await requirePermission(PERMISSIONS.ID_ROLE_MANAGE);

    const [roles, permissions] = await Promise.all([
      db.role.findMany({
        include: {
          permissions: true,
        },
        orderBy: {
          name: "asc",
        },
      }),
      db.permission.findMany({
        orderBy: [
          { category: "asc" },
          { name: "asc" },
        ],
      }),
    ]);

    // Map roles to the format expected by the UI
    const mappedRolePermissions = roles.map((role) => {
      const permissionMap: { [key: string]: boolean } = {};
      role.permissions.forEach((p) => {
        permissionMap[p.code] = true;
      });
      
      // Ensure all permissions have a value even if false
      permissions.forEach((p) => {
        if (!permissionMap[p.code]) {
          permissionMap[p.code] = false;
        }
      });

      return {
        id: role.id,
        role: role.name, // Using name as the key for the selector like in the mock UI
        permissions: permissionMap,
      };
    });

    const mappedPermissions = permissions.map((p) => ({
      id: p.code,
      name: p.name,
      description: p.description || "",
      category: p.category || "Uncategorized",
    }));

    return {
      success: true,
      roles: mappedRolePermissions,
      permissions: mappedPermissions,
    };
  } catch (error: any) {
    console.error("Failed to fetch access control data:", error);
    return {
      success: false,
      message: error.message || "Failed to fetch access control data",
    };
  }
}

export async function updateRolePermissions(
  roleId: string,
  permissionCodes: string[]
) {
  try {
    await requirePermission(PERMISSIONS.ID_ROLE_MANAGE);

    await db.role.update({
      where: { id: roleId },
      data: {
        permissions: {
          set: permissionCodes.map((code) => ({ code })),
        },
      },
    });

    revalidatePath("/super-admin/access-control");
    return { success: true, message: "Permissions updated successfully" };
  } catch (error: any) {
    console.error("Failed to update role permissions:", error);
    return {
      success: false,
      message: error.message || "Failed to update role permissions",
    };
  }
}
