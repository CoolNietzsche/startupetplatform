'use server'

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import db from "@/lib/db";
import { createAuditLog } from "@/lib/audit";
import { revalidatePath } from "next/cache";

export async function submitAppeal(applicationId: string, reason: string, details?: string) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) throw new Error("Unauthorized");

  const appeal = await db.appeal.create({
    data: {
      applicationId,
      reason,
      details: details ?? null,
      status: "PENDING",
    },
  });

  await createAuditLog({
    userId: session.user.id,
    action: "APPLICATION_UPDATE",
    resource: "appeal",
    details: { appealId: appeal.id, applicationId, reason },
  });

  revalidatePath("/dashboard/appeals");
  return appeal;
}

export async function getMyAppeals(userId: string) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) throw new Error("Unauthorized");

  return db.appeal.findMany({
    where: {
      application: { userId },
    },
    include: {
      application: {
        select: {
          id: true,
          startupName: true,
          status: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function respondToAppeal(appealId: string, status: string, response: string) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) throw new Error("Unauthorized");

  const appeal = await db.appeal.update({
    where: { id: appealId },
    data: {
      status,
      response,
      respondedById: session.user.id,
    },
  });

  await createAuditLog({
    userId: session.user.id,
    action: "APPLICATION_UPDATE",
    resource: "appeal",
    details: { appealId, status, response },
  });

  revalidatePath("/dashboard/appeals");
  return appeal;
}

export async function getPendingAppeals() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) throw new Error("Unauthorized");

  const role = session.user.role;
  if (role !== "SUPER_ADMIN" && role !== "ADMIN") {
    throw new Error("Forbidden: Admin access required");
  }

  return db.appeal.findMany({
    where: { status: "PENDING" },
    include: {
      application: {
        select: {
          id: true,
          startupName: true,
          status: true,
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
            },
          },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });
}
