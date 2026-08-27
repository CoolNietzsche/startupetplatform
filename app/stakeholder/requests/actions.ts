"use server";

import db from "@/lib/db/index";
import { revalidatePath } from "next/cache";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { createNotification } from "@/lib/notifications";
import { FormalRequestStatus } from "@prisma/client";

async function requireStakeholder() {
  const session = await getServerSession(authOptions);
  if (!session?.user || session.user.role !== 'STAKEHOLDER') {
    throw new Error("Unauthorized: Access restricted to Stakeholder Admins.");
  }
  if (!session.user.stakeholderId) {
    throw new Error("User is not associated with any stakeholder organization.");
  }
  return session.user;
}

export async function getIncomingRequests() {
  try {
    const user = await requireStakeholder();

    const requests = await db.formalRequest.findMany({
      where: { recipientStakeholderId: user.stakeholderId! },
      include: {
        sender: {
          select: {
            id: true,
            name: true,
            level: true,
            applicationId: true,
            user: {
              select: {
                firstName: true,
                lastName: true,
                email: true,
              },
            },
          },
        },
        attachment: true,
      },
      orderBy: { createdAt: "desc" },
    });

    return { success: true, data: requests };
  } catch (error: any) {
    return { success: false, message: error.message };
  }
}

export async function getIncomingRequestById(id: string) {
  try {
    const user = await requireStakeholder();

    const request = await db.formalRequest.findUnique({
      where: { 
        id,
        recipientStakeholderId: user.stakeholderId! 
      },
      include: {
        sender: {
          select: {
            id: true,
            name: true,
            level: true,
            applicationId: true,
            user: {
              select: {
                firstName: true,
                lastName: true,
                email: true,
              },
            },
          },
        },
        attachment: true,
      },
    });

    if (!request) {
      throw new Error("Request not found or access denied.");
    }

    return { success: true, data: request };
  } catch (error: any) {
    return { success: false, message: error.message };
  }
}

export async function updateRequestStatus(requestId: string, status: FormalRequestStatus, rejectionReason?: string) {
  try {
    const user = await requireStakeholder();

    const request = await db.formalRequest.findUnique({
      where: { id: requestId },
      include: { 
        sender: {
          include: {
            user: true
          }
        }
      },
    });

    if (!request || request.recipientStakeholderId !== user.stakeholderId) {
        throw new Error("Request not found or access denied.");
    }

    const updated = await db.formalRequest.update({
      where: { id: requestId },
      data: {
        status,
        rejectionReason: status === FormalRequestStatus.REJECTED ? rejectionReason : null,
      },
    });

    // Notify the startup user
    await createNotification({
      userId: request.sender.userId,
      title: `Request ${status.toLowerCase()}`,
      message: `Your formal request "${request.subject}" has been ${status.toLowerCase()} by the stakeholder.${status === FormalRequestStatus.REJECTED && rejectionReason ? ` Reason: ${rejectionReason}` : ''}`,
      type: status === FormalRequestStatus.ACCEPTED ? "success" : "error",
      link: `/dashboard/requests`,
      sendAsEmail: true,
    });

    revalidatePath("/stakeholder/requests");
    revalidatePath("/dashboard/requests");
    return { success: true, data: updated };
  } catch (error: any) {
    return { success: false, message: error.message };
  }
}
