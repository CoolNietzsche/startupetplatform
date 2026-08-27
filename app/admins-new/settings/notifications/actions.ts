"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import db from "@/lib/db";
import { createAuditLog } from "@/lib/audit";
import { revalidatePath } from "next/cache";

export async function getTemplates() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return { success: false, message: "Unauthorized" };
  }

  try {
    const templates = await db.notificationTemplate.findMany({
      orderBy: { createdAt: "desc" },
    });
    return { success: true, data: templates };
  } catch (error: any) {
    return { success: false, message: error.message };
  }
}

export async function createTemplate(data: {
  code: string;
  name: string;
  subject: string;
  body: string;
  type?: string;
}) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return { success: false, message: "Unauthorized" };
  }

  try {
    const template = await db.notificationTemplate.create({
      data: {
        code: data.code,
        name: data.name,
        subject: data.subject,
        body: data.body,
        type: data.type || "info",
      },
    });

    await createAuditLog({
      userId: session.user.id,
      action: "TEMPLATE_CREATED",
      resource: template.id,
      details: { code: data.code, name: data.name },
    });

    revalidatePath("/admins-new/settings/notifications");
    return { success: true, data: template };
  } catch (error: any) {
    return { success: false, message: error.message };
  }
}

export async function updateTemplate(
  id: string,
  data: {
    code?: string;
    name?: string;
    subject?: string;
    body?: string;
    type?: string;
  }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return { success: false, message: "Unauthorized" };
  }

  try {
    const template = await db.notificationTemplate.update({
      where: { id },
      data,
    });

    await createAuditLog({
      userId: session.user.id,
      action: "TEMPLATE_UPDATED",
      resource: template.id,
      details: { code: data.code, name: data.name },
    });

    revalidatePath("/admins-new/settings/notifications");
    return { success: true, data: template };
  } catch (error: any) {
    return { success: false, message: error.message };
  }
}

export async function deleteTemplate(id: string) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return { success: false, message: "Unauthorized" };
  }

  try {
    const template = await db.notificationTemplate.delete({
      where: { id },
    });

    await createAuditLog({
      userId: session.user.id,
      action: "TEMPLATE_DELETED",
      resource: template.id,
      details: { code: template.code, name: template.name },
    });

    revalidatePath("/admins-new/settings/notifications");
    return { success: true };
  } catch (error: any) {
    return { success: false, message: error.message };
  }
}

export async function previewTemplate(
  templateId: string,
  variables: Record<string, string>
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return { success: false, message: "Unauthorized" };
  }

  try {
    const template = await db.notificationTemplate.findUnique({
      where: { id: templateId },
    });

    if (!template) {
      return { success: false, message: "Template not found" };
    }

    let subject = template.subject;
    let body = template.body;

    for (const [key, value] of Object.entries(variables)) {
      const regex = new RegExp(`\\{\\{${key}\\}\\}`, "g");
      subject = subject.replace(regex, value);
      body = body.replace(regex, value);
    }

    return {
      success: true,
      data: {
        subject,
        body,
      },
    };
  } catch (error: any) {
    return { success: false, message: error.message };
  }
}
