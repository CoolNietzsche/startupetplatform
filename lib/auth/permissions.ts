import { Role, User, UserRole } from "@prisma/client";
import { getServerSession } from "next-auth";
import db from "@/lib/db";
import { authOptions } from "@/lib/auth";
import {
  ALL_PERMISSION_CODES,
  PERMISSIONS,
  type PermissionCode,
} from "@/lib/auth/permission-codes";

export { ALL_PERMISSION_CODES, PERMISSIONS };
export type { PermissionCode };

export type UserWithRoles = User & {
  roles: Role[];
};

const PERMISSION_CODE_SET = new Set<PermissionCode>(ALL_PERMISSION_CODES);

function isPermissionCode(value: unknown): value is PermissionCode {
  return (
    typeof value === "string" &&
    PERMISSION_CODE_SET.has(value as PermissionCode)
  );
}

// Default role permissions (by Permission.code)
export const DEFAULT_ROLE_PERMISSION_CODES: Record<UserRole, PermissionCode[]> =
  {
    SUPER_ADMIN: [
      PERMISSIONS.ID_USER_VIEW,
      PERMISSIONS.ID_USER_MANAGE,
      PERMISSIONS.ID_ROLE_MANAGE,
      PERMISSIONS.OPS_APP_SUBMIT,
      PERMISSIONS.OPS_APP_TRACK,
      PERMISSIONS.OPS_APP_VIEW_ALL,
      PERMISSIONS.OPS_APP_REVIEW,
      PERMISSIONS.OPS_APP_DECISION,
      PERMISSIONS.GROW_OPP_MANAGE,
      PERMISSIONS.GROW_CONTENT_MANAGE,
      PERMISSIONS.GROW_ANALYTICS_VIEW,
      PERMISSIONS.SYS_SETTINGS_MANAGE,
      PERMISSIONS.SYS_DASHBOARD_ACCESS,
      PERMISSIONS.SYS_LOGS_VIEW,
    ],
    ADMIN: [
      PERMISSIONS.ID_USER_VIEW,
      PERMISSIONS.ID_USER_MANAGE,
      PERMISSIONS.ID_ROLE_MANAGE,
      PERMISSIONS.OPS_APP_VIEW_ALL,
      PERMISSIONS.OPS_APP_REVIEW,
      PERMISSIONS.GROW_OPP_MANAGE,
      PERMISSIONS.GROW_CONTENT_MANAGE,
      PERMISSIONS.GROW_ANALYTICS_VIEW,
      PERMISSIONS.SYS_DASHBOARD_ACCESS,
      PERMISSIONS.SYS_SETTINGS_MANAGE,
    ],
    REVIEWER: [
      PERMISSIONS.OPS_APP_VIEW_ALL,
      PERMISSIONS.OPS_APP_REVIEW,
      PERMISSIONS.GROW_ANALYTICS_VIEW,
      PERMISSIONS.SYS_DASHBOARD_ACCESS,
    ],
    COMMITTEE: [
      PERMISSIONS.OPS_APP_REVIEW,
      PERMISSIONS.OPS_APP_VIEW_ALL,
      PERMISSIONS.SYS_DASHBOARD_ACCESS,
      PERMISSIONS.GROW_ANALYTICS_VIEW,
    ],
    ECOSYSTEM_BUILDER: [
      PERMISSIONS.OPS_APP_SUBMIT,
      PERMISSIONS.OPS_APP_TRACK,
      PERMISSIONS.SYS_DASHBOARD_ACCESS,
    ],
    USER: [
      PERMISSIONS.OPS_APP_SUBMIT,
      PERMISSIONS.OPS_APP_TRACK,
      PERMISSIONS.SYS_DASHBOARD_ACCESS,
    ],
  };

function normalizeCustomPermissionCodes(
  customPermissions: unknown,
): PermissionCode[] {
  if (!customPermissions) return [];

  if (Array.isArray(customPermissions)) {
    return customPermissions.filter(isPermissionCode);
  }

  // If customPermissions is stored as a map/object (legacy UI), ignore it for code-based auth
  // until a clear mapping to Permission.code is defined.
  return [];
}

export async function getUserPermissionCodes(
  userId: string,
): Promise<PermissionCode[]> {
  const user = await db.user.findUnique({
    where: { id: userId },
    include: {
      roles: {
        include: {
          permissions: true,
        },
      },
    },
  });

  if (!user) return [];

  // Super admin has all permissions
  if (user.role === "SUPER_ADMIN") {
    const all = await db.permission.findMany({
      select: { code: true },
    });
    return all.map((p) => p.code).filter(isPermissionCode);
  }

  const rolePermissionCodes = user.roles.flatMap((r) =>
    r.permissions.map((p) => p.code).filter(isPermissionCode),
  );
  const customPermissionCodes = normalizeCustomPermissionCodes(
    user.customPermissions,
  );

  return Array.from(
    new Set([...rolePermissionCodes, ...customPermissionCodes]),
  );
}

export async function userHasPermissionCode(
  userId: string,
  permissionCode: PermissionCode,
): Promise<boolean> {
  if (!permissionCode) return false;

  const user = await db.user.findUnique({
    where: { id: userId },
    select: {
      role: true,
      customPermissions: true,
      roles: {
        select: {
          permissions: {
            select: { code: true },
          },
        },
      },
    },
  });

  if (!user) return false;
  if (user.role === "SUPER_ADMIN") return true;

  // Check default role permissions based on the user's enum role
  const defaultCodes = DEFAULT_ROLE_PERMISSION_CODES[user.role as UserRole] ?? [];
  if (defaultCodes.includes(permissionCode)) return true;

  const customPermissionCodes = normalizeCustomPermissionCodes(
    user.customPermissions,
  );
  if (customPermissionCodes.includes(permissionCode)) return true;

  return user.roles.some((r) =>
    r.permissions.some((p) => p.code === permissionCode),
  );
}

export async function requirePermission(permissionCode: PermissionCode) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  const has = await userHasPermissionCode(session.user.id, permissionCode);
  if (!has) {
    throw new Error("Forbidden");
  }

  return session;
}

export async function requireAnyPermission(permissionCodes: PermissionCode[]) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  if (!Array.isArray(permissionCodes) || permissionCodes.length === 0) {
    throw new Error("Forbidden");
  }

  for (const code of permissionCodes) {
    const has = await userHasPermissionCode(session.user.id, code);
    if (has) return session;
  }

  throw new Error("Forbidden");
}

// Assign role to user
export async function assignRole(userId: string, roleId: string) {
  return db.user.update({
    where: { id: userId },
    data: {
      roles: {
        connect: { id: roleId },
      },
    },
    include: { roles: true },
  });
}

// Remove role from user
export async function removeRole(userId: string, roleId: string) {
  return db.user.update({
    where: { id: userId },
    data: {
      roles: {
        disconnect: { id: roleId },
      },
    },
    include: { roles: true },
  });
}

// Grant custom permission to user (stores Permission.code strings as JSON array)
export async function grantCustomPermission(
  userId: string,
  permissionCode: PermissionCode,
) {
  const user = await db.user.findUnique({
    where: { id: userId },
    select: { customPermissions: true },
  });

  if (!user) throw new Error("User not found");

  const existing = normalizeCustomPermissionCodes(user.customPermissions);
  const updated = Array.from(new Set([...existing, permissionCode]));

  return db.user.update({
    where: { id: userId },
    data: {
      customPermissions: updated,
    },
  });
}

// Revoke custom permission from user
export async function revokeCustomPermission(
  userId: string,
  permissionCode: PermissionCode,
) {
  const user = await db.user.findUnique({
    where: { id: userId },
    select: { customPermissions: true },
  });

  if (!user) throw new Error("User not found");

  const existing = normalizeCustomPermissionCodes(user.customPermissions);
  const updated = existing.filter((p) => p !== permissionCode);

  return db.user.update({
    where: { id: userId },
    data: {
      customPermissions: updated,
    },
  });
}
