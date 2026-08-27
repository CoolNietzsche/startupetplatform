"use server";

import db from "@/lib/db/index";
import { revalidatePath } from "next/cache";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { createNotification } from "@/lib/notifications";
import { FormalRequestStatus } from "@prisma/client";

async function getStartupId() {
  const session = await getServerSession(authOptions);
  if (!session?.user) throw new Error("Unauthorized");

  const user = await db.user.findUnique({
    where: { id: session.user.id },
    include: { startup: true },
  });

  if (!user?.startup) throw new Error("No startup profile found. Please complete your registration.");
  return user.startup.id;
}

export async function getAvailableStakeholders() {
  try {
    const stakeholders = await db.stakeholder.findMany({
      select: {
        id: true,
        name: true,
        type: true,
      },
      orderBy: { name: "asc" },
    });

    return { success: true, data: stakeholders };
  } catch (error: any) {
    return { success: false, message: error.message };
  }
}

export async function submitFormalRequest(data: {
  subject: string;
  body: string;
  recipientStakeholderId: string;
  attachmentFileId?: string;
}) {
  try {
    const startupId = await getStartupId();
    const session = await getServerSession(authOptions);

    if (data.body.length > 2000) {
      throw new Error("Message body exceeds the 2000 character limit.");
    }

    const request = await db.formalRequest.create({
      data: {
        subject: data.subject,
        body: data.body,
        senderId: startupId,
        recipientStakeholderId: data.recipientStakeholderId,
        attachmentFileId: data.attachmentFileId || null,
        status: FormalRequestStatus.PENDING,
      },
      include: {
        sender: true,
        recipient: {
          include: {
            admins: true,
          },
        },
      },
    });

    // Notify all admins of the stakeholder
    if (request.recipient.admins.length > 0) {
      await Promise.all(
        request.recipient.admins.map((admin) =>
          createNotification({
            userId: admin.id,
            title: "New Formal Request Received",
            message: `You have received a new formal request from ${request.sender.name}: "${request.subject}"`,
            type: "info",
            link: `/stakeholder/requests`,
            sendAsEmail: true,
          })
        )
      );
    }

    revalidatePath("/dashboard/requests");
    return { success: true, data: request };
  } catch (error: any) {
    console.error("submitFormalRequest failed:", error);
    return { success: false, message: error.message };
  }
}

export async function getMyFormalRequests() {
  try {
    const startupId = await getStartupId();

    const requests = await db.formalRequest.findMany({
      where: { senderId: startupId },
      include: {
        recipient: {
          select: { name: true },
        },
        attachment: {
          select: { originalName: true, id: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return { success: true, data: requests };
  } catch (error: any) {
    return { success: false, message: error.message };
  }
}

export async function getFormalRequestById(requestId: string) {
  try {
    const startupId = await getStartupId();

    const request = await db.formalRequest.findFirst({
      where: { 
        id: requestId,
        senderId: startupId
      },
      include: {
        recipient: {
          select: { name: true, type: true, email: true },
        },
        attachment: {
          select: { id: true, originalName: true, storagePath: true },
        },
      },
    });

    if (!request) throw new Error("Request not found.");

    return { success: true, data: request };
  } catch (error: any) {
    return { success: false, message: error.message };
  }
}

export async function cancelFormalRequest(requestId: string) {
  try {
    const startupId = await getStartupId();

    const request = await db.formalRequest.findFirst({
      where: { 
        id: requestId, 
        senderId: startupId 
      },
    });

    if (!request) throw new Error("Request not found.");
    if (request.status !== FormalRequestStatus.PENDING) {
      throw new Error("Only pending requests can be cancelled.");
    }

    const updated = await db.formalRequest.update({
      where: { id: requestId },
      data: { status: FormalRequestStatus.CANCELLED },
      include: {
        sender: true,
        recipient: {
          include: {
            admins: true,
          },
        },
      },
    });

    // Notify all admins of the stakeholder
    if (updated.recipient.admins.length > 0) {
      await Promise.all(
        updated.recipient.admins.map((admin) =>
          createNotification({
            userId: admin.id,
            title: "Formal Request Cancelled",
            message: `The formal request "${updated.subject}" from ${updated.sender.name} has been cancelled by the sender.`,
            type: "warning",
            link: `/stakeholder/requests`,
            sendAsEmail: true,
          })
        )
      );
    }

    revalidatePath("/dashboard/requests");
    revalidatePath(`/dashboard/requests/${requestId}`);
    revalidatePath("/stakeholder/requests");
    return { success: true, data: updated };
  } catch (error: any) {
    return { success: false, message: error.message };
  }
}

export async function updateFormalRequest(requestId: string, data: {
  subject: string;
  body: string;
  attachmentFileId?: string;
}) {
  try {
    const startupId = await getStartupId();

    const request = await db.formalRequest.findFirst({
      where: { 
        id: requestId, 
        senderId: startupId 
      },
    });

    if (!request) throw new Error("Request not found.");
    if (request.status !== FormalRequestStatus.PENDING) {
      throw new Error("Only pending requests can be edited.");
    }

    if (data.body.length > 2000) {
      throw new Error("Message body exceeds the 2000 character limit.");
    }

    const updated = await db.formalRequest.update({
      where: { id: requestId },
      data: {
        subject: data.subject,
        body: data.body,
        attachmentFileId: data.attachmentFileId || request.attachmentFileId,
      },
      include: {
        sender: true,
        recipient: {
          include: {
            admins: true,
          },
        },
      },
    });

    // Notify all admins of the stakeholder
    if (updated.recipient.admins.length > 0) {
      await Promise.all(
        updated.recipient.admins.map((admin) =>
          createNotification({
            userId: admin.id,
            title: "Formal Request Updated",
            message: `The formal request "${updated.subject}" from ${updated.sender.name} has been updated.`,
            type: "info",
            link: `/stakeholder/requests`,
            sendAsEmail: true,
          })
        )
      );
    }

    revalidatePath("/dashboard/requests");
    revalidatePath(`/dashboard/requests/${requestId}`);
    revalidatePath("/stakeholder/requests");
    return { success: true, data: updated };
  } catch (error: any) {
    return { success: false, message: error.message };
  }
}
