"use server";

import db from "@/lib/db";
import { createNotification } from "@/lib/notifications";
import { revalidatePath } from "next/cache";
import { ensureAdmin } from "@/lib/security";

export async function requestClarification({
  applicationId,
  ecoApplicationId,
  topic,
  messageContent,
  documentsRequested
}: {
  applicationId?: string;
  ecoApplicationId?: string;
  topic: string;
  messageContent: string;
  documentsRequested?: string[];
}) {
  try {
    const session = await ensureAdmin();
    const adminId = session.user.id;
    let applicantId = "";
    let appTitle = "";

    // 1. Verify Application exists and grab the Applicant's User ID
    if (applicationId) {
      const app = await db.application.findUnique({
        where: { id: applicationId },
        select: { userId: true, startupName: true }
      });
      if (!app) throw new Error("Application not found");
      applicantId = app.userId;
      appTitle = app.startupName || applicationId;

      // Pausing the Application
      await db.application.update({
        where: { id: applicationId },
        data: { status: "CLARIFICATION_REQUESTED" }
      });
    } else if (ecoApplicationId) {
      const eco = await db.ecoApplication.findUnique({
        where: { id: ecoApplicationId },
        include: { 
          builder: {
            select: { userId: true }
          }
        }
      });
      if (!eco) throw new Error("Ecosystem Application not found");
      if (!eco.builder.userId) throw new Error("Ecosystem Builder has no associated user");
      applicantId = eco.builder.userId;
      appTitle = eco.name || ecoApplicationId;

      // Pausing the EcoApplication
      await db.ecoApplication.update({
        where: { id: ecoApplicationId },
        data: { status: "CLARIFICATION_REQUESTED" }
      });
    } else {
      throw new Error("Application ID required");
    }

    // 2. Create the unified Clarification Thread (Conversation)
    const conversation = await db.conversation.create({
      data: {
        applicationId: applicationId || null,
        ecoApplicationId: ecoApplicationId || null,
        title: `Clarification: ${topic}`,
        type: "CLARIFICATION",
        status: "OPEN",
        participants: {
          create: [
            { userId: applicantId, role: "OWNER" },
            { userId: adminId, role: "MEMBER" }
          ]
        },
        messages: {
          create: [
            // Message 1: The System Context message
            {
              senderId: null, // Null sender means System Array
              content: `[SYSTEM STATUS UPDATE]: Application process paused. Status officially moved to CLARIFICATION REQUESTED by the Evaluation Committee. Pending applicant response.`,
              messageType: "SYSTEM_ALERT"
            },
            // Message 2: The actual typed message from Admin
            {
              senderId: adminId,
              content: `${messageContent}${documentsRequested?.length ? '\n\nRequested Documents:\n- ' + documentsRequested.join('\n- ') : ''}`,
              messageType: documentsRequested?.length ? "DOCUMENT_REQUEST" : "TEXT"
            }
          ]
        }
      }
    });

    // 3. FIRE THE REAL-TIME SSE NOTIFICATION TO THE APPLICANT!
    await createNotification({
      userId: applicantId,
      title: "Action Required: Clarification & Documents Requested",
      message: `The evaluation committee requires specific clarifications and/or additional documentation regarding your application: ${appTitle}. Please review the request and provide the necessary files to resume your evaluation process.`,
      type: "warning",
      link: `/dashboard/messages/${conversation.id}`, // Or wherever their applicant inbox goes
      sendAsEmail: true // Shoots them an email too!
    });

    // Refresh UI
    if (applicationId) revalidatePath(`/admins-new/applications/${applicationId}`);
    if (ecoApplicationId) revalidatePath(`/admins-new/ecosystem/review/${ecoApplicationId}`);
    
    return { success: true, conversationId: conversation.id };

  } catch (error: any) {
    console.error("Error requesting clarification:", error);
    return { success: false, error: error.message };
  }
}
