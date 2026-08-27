"use server";

import db from "@/lib/db";
import { verifyJWTToken } from "@/lib/token";
import { getUserPermissions } from "@/lib/auth/permissions";
import type { Permission, UserRole } from "@prisma/client";

export async function getUserById(userId: string) {
  return db.user.findUnique({
    where: { id: userId },
  });
}

export async function getUserByEmail(email: string) {
  return db.user.findUnique({
    where: { email },
  });
}

export async function getUserWithRolesById(userId: string) {
  return db.user.findUnique({
    where: { id: userId },
    include: { roles: true },
  });
}

export async function getUserWithRolesByEmail(email: string) {
  return db.user.findUnique({
    where: { email },
    include: { roles: true },
  });
}

export async function getUserFromJWT(token: string) {
  const payload = await verifyJWTToken(token);
  if (!payload) return null;

  const email =
    typeof (payload as any).email === "string"
      ? ((payload as any).email as string)
      : null;
  if (email) return getUserByEmail(email);

  const userId =
    typeof (payload as any).id === "string"
      ? ((payload as any).id as string)
      : typeof (payload as any).sub === "string"
        ? ((payload as any).sub as string)
        : null;

  if (!userId) return null;
  return getUserById(userId);
}

export async function getUserRoleById(
  userId: string,
): Promise<UserRole | null> {
  const user = await db.user.findUnique({
    where: { id: userId },
    select: { role: true },
  });

  return user?.role ?? null;
}

export async function getUserPermissionsById(
  userId: string,
): Promise<Permission[]> {
  return getUserPermissions(userId);
}
