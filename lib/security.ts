"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";

export type Role = "SUPER_ADMIN" | "ADMIN" | "REGIONAL_ADMIN" | "HUB_MANAGER" | "MENTOR" | "COMMITTEE" | "REVIEWER" | "ECOSYSTEM_BUILDER" | "USER" | "STAKEHOLDER";

/**
 * Ensures the user is authenticated before executing the action.
 * Use this in Server Actions.
 */
export async function ensureAuthenticated() {
  const session = await getServerSession(authOptions);
  if (!session || !session.user) {
    throw new Error("Unauthorized: You must be logged in to perform this action.");
  }
  return session;
}

/**
 * Ensures the user has one of the required roles before executing the action.
 * Use this in Server Actions.
 */
export async function ensureRole(allowedRoles: Role[]) {
  const session = await ensureAuthenticated();
  const userRole = (session.user as any).role as Role;

  if (!allowedRoles.includes(userRole)) {
    throw new Error(`Forbidden: You do not have permission to perform this action. Required roles: ${allowedRoles.join(", ")}`);
  }
  return session;
}

/**
 * Ensures the user is an admin (SUPER_ADMIN or ADMIN).
 */
export async function ensureAdmin() {
  return ensureRole(["SUPER_ADMIN", "ADMIN"]);
}

/**
 * A wrapper for server actions that handles authentication and logging.
 */
export async function actionWrapper<T>(
  action: () => Promise<T>,
  options?: {
    requiredRoles?: Role[];
    requireAdmin?: boolean;
    actionName?: string;
  }
) {
  try {
    if (options?.requireAdmin) {
      await ensureAdmin();
    } else if (options?.requiredRoles) {
      await ensureRole(options.requiredRoles);
    } else {
      await ensureAuthenticated();
    }

    return await action();
  } catch (error: any) {
    console.error(`[Server Action Error] ${options?.actionName || "Unknown"}:`, error.message);
    throw error; // Rethrow to let the caller handle it (e.g., toast)
  }
}
