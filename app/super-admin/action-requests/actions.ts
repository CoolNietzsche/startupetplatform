"use server";

import db from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { requireAnyPermission } from "@/lib/auth/permissions";
import { PERMISSIONS } from "@/lib/auth/permission-codes";
import { revalidatePath } from "next/cache";
import { createNotification } from "@/lib/notifications";

async function requireSuperAdmin() {
  const session = await getServerSession(authOptions);
  if (!session?.user) throw new Error("Unauthorized");
  if ((session.user as any).role !== "SUPER_ADMIN") throw new Error("Forbidden: Super Admin access required");
  return session;
}

export async function getActionRequests() {
  try {
    await requireSuperAdmin();
    const requests = await db.formalRequest.findMany({
      orderBy: { createdAt: "desc" },
      take: 50,
    });
    return { success: true as const, data: requests };
  } catch (error: any) {
    return { success: false as const, message: error.message };
  }
}

export async function approveActionRequest(requestId: string) {
  try {
    const session = await requireSuperAdmin();
    await db.formalRequest.update({
      where: { id: requestId },
      data: { status: "ACCEPTED" },
    });
    await createNotification({
      userId: session.user.id,
      title: "Action Request Approved",
      message: "The action request has been approved",
      type: "success",
    });
    revalidatePath("/super-admin/action-requests");
    return { success: true as const, message: "Request approved" };
  } catch (error: any) {
    return { success: false as const, message: error.message };
  }
}

export async function rejectActionRequest(requestId: string) {
  try {
    const session = await requireSuperAdmin();
    await db.formalRequest.update({
      where: { id: requestId },
      data: { status: "REJECTED" },
    });
    await createNotification({
      userId: session.user.id,
      title: "Action Request Rejected",
      message: "The action request has been rejected",
      type: "warning",
    });
    revalidatePath("/super-admin/action-requests");
    return { success: true as const, message: "Request rejected" };
  } catch (error: any) {
    return { success: false as const, message: error.message };
  }
}
