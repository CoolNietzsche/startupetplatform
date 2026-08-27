"use server";

import { revalidatePath } from "next/cache";
import db from "@/lib/db/index";
import globalEmitter from "@/lib/event-emitter";
import { ensureAuthenticated, ensureAdmin } from "@/lib/security";

/**
 * Retrieves a specific conversation with all its messages and participants.
 * Automatically marks the user's unread status to false.
 */
export async function getConversationDetails(conversationId: string) {
  try {
    const session = await ensureAuthenticated();
    const userId = session.user.id;

    // Verify the user is actually a participant in this conversation
    const participation = await db.conversationParticipant.findUnique({
      where: {
        conversationId_userId: { conversationId, userId }
      }
    });

    if (!participation) {
      const role = session.user.role;
      if (role !== "SUPER_ADMIN" && role !== "ADMIN") {
        throw new Error(`Access Denied: You are not a participant in this conversation.`);
      }
    } else if (participation.hasUnread) {
      // Mark as read!
      await db.conversationParticipant.update({
        where: { id: participation.id },
        data: { hasUnread: false, lastReadAt: new Date() }
      });
    }

    const conversation = await db.conversation.findUnique({
      where: { id: conversationId },
      include: {
        application: { select: { startupName: true, status: true, id: true } },
        ecoApplication: { select: { name: true, status: true, id: true } },
        participants: {
          include: {
            user: { select: { id: true, firstName: true, lastName: true, role: true } }
          }
        },
        messages: {
          orderBy: { createdAt: 'desc' },
          take: 100,
          include: {
            sender: { select: { id: true, firstName: true, lastName: true, role: true } },
            attachments: {
              include: {
                file: { select: { id: true, originalName: true, size: true, mimeType: true, storagePath: true } }
              }
            }
          }
        }
      }
    });

    if (conversation?.messages) {
       conversation.messages.reverse();
    }
 
    return { success: true, data: conversation };
  } catch (error: any) {
    console.error("Failed to get conversation:", error);
    return { success: false, error: error.message };
  }
}

/**
 * Sends a standard message into an existing conversation thread.
 */
export async function sendThreadMessage(conversationId: string, content: string, attachmentIds: string[] = []) {
  try {
    const session = await ensureAuthenticated();
    const userId = session.user.id;
    const userRole = (session.user as any).role ?? "USER";

    // 1. Create message
    const dbStart = Date.now();
    const newMessage = await db.message.create({
      data: {
        conversationId,
        senderId: userId,
        content,
        messageType: "TEXT",
        attachments: {
          create: attachmentIds.map(fid => ({ fileId: fid }))
        }
      },
      include: {
        sender: { select: { firstName: true, lastName: true, role: true } },
        attachments: { include: { file: true } }
      }
    });

    // 2. Update unread status for other participants
    const updateStart = Date.now();
    await db.conversationParticipant.updateMany({
      where: { conversationId, userId: { not: userId } },
      data: { hasUnread: true, isArchived: false, updatedAt: new Date() }
    });

    // 3. Fetch participants for SSE broadcast
    const sseStart = Date.now();
    const participants = await db.conversationParticipant.findMany({
      where: { conversationId },
      select: { userId: true }
    });
    const recipientIds = participants.map(p => p.userId);
    const otherParticipantIds = recipientIds.filter(id => id !== userId);

    // 4. Real-Time new-message SSE event
    globalEmitter.emit('new-message', {
      ...newMessage,
      recipientIds
    });

    // 5. Emit individual notification for each recipient in the top nav
    // The SSE stream filters by `data.userId === userId` (scalar), so emit once per user
    for (const recipientId of otherParticipantIds) {
      const notifLink = (userRole === "ADMIN" || userRole === "SUPER_ADMIN")
        ? `/admins-new/messages?conversationId=${conversationId}`
        : userRole === "COMMITTEE" 
          ? `/committee-portal/messages?conversationId=${conversationId}`
          : `/dashboard/messages?conversationId=${conversationId}`;

      globalEmitter.emit('new-notification', {
        userId: recipientId,    // scalar — matches SSE filter `data.userId === userId`
        id: `msg-${newMessage.id}-${recipientId}`,
        title: "New Message",
        message: newMessage.content.substring(0, 60) + (newMessage.content.length > 60 ? "..." : ""),
        type: "info",
        isRead: false,
        link: notifLink,
        createdAt: new Date()
      });
    }

    return { success: true, data: newMessage };
  } catch (error: any) {
    console.error("Failed to send message:", error);
    return { success: false, error: error.message };
  }
}

/**
 * Retrieves all conversations for the logged-in user's inbox
 */
export async function getUserInbox() {
  try {
    const session = await ensureAuthenticated();
    const userId = session.user.id;

    const participations = await db.conversationParticipant.findMany({
      where: { 
        userId,
        isArchived: false
      },
      include: {
        conversation: {
          include: {
            application: { select: { startupName: true } },
            ecoApplication: { select: { name: true } },
            participants: {
              where: { userId: { not: userId } },
              include: { user: { select: { firstName: true, lastName: true, role: true } } }
            },
            messages: {
              orderBy: { createdAt: 'desc' },
              take: 1 // Only get the latest message for the inbox preview
            }
          }
        }
      },
      orderBy: { updatedAt: 'desc' }
    });

    return { success: true, data: participations };
  } catch (error: any) {
    console.error("Failed to fetch inbox:", error);
    return { success: false, error: error.message };
  }
}

/**
 * Retrieves the count of conversations with unread messages for the user
 */
export async function getUnreadMessageCount() {
  try {
    const session = await ensureAuthenticated();
    if (!session || !session.user?.id) return { success: true, count: 0 };

    const count = await db.conversationParticipant.count({
      where: { 
        userId: session.user.id,
        hasUnread: true,
        isArchived: false
      }
    });

    return { success: true, count };
  } catch (error) {
    return { success: false, count: 0 };
  }
}

/**
 * Marks notifications related to a specific thread as read
 */
export async function markThreadNotificationsAsRead(conversationId: string) {
  try {
    const session = await ensureAuthenticated();

    // Mark notifications as read heuristic: any notification with a link containing the conversationId
    await db.notification.updateMany({
      where: {
        userId: session.user.id,
        isRead: false,
        link: { contains: conversationId }
      },
      data: { isRead: true }
    });

    return { success: true };
  } catch (error) {
    return { success: false };
  }
}

/**
 * Starts or retrieves an existing general conversation for an ecosystem application.
 * Unlike clarification requests, this does NOT change the status of the application.
 */
export async function getOrCreateEcoConversation(ecoApplicationId: string) {
  try {
    const session = await ensureAdmin();
    const adminId = session.user.id;

    // 1. Fetch info about the applicant
    const eco = await db.ecoApplication.findUnique({
      where: { id: ecoApplicationId },
      include: { builder: { select: { userId: true, name: true } } }
    });

    if (!eco || !eco.builder.userId) throw new Error("Ecosystem applicant not found");
    const applicantId = eco.builder.userId;

    // 2. Check if a GENERAL conversation already exists for this app
    let conversation = await db.conversation.findFirst({
      where: {
        ecoApplicationId,
        type: "GENERAL"
      }
    });

    if (!conversation) {
      // Create new!
      conversation = await db.conversation.create({
        data: {
          ecoApplicationId,
          type: "GENERAL",
          title: `Inquiry: ${eco.name}`,
          participants: {
            create: [
              { userId: applicantId, role: "OWNER" },
              { userId: adminId, role: "MEMBER" }
            ]
          }
        }
      });
    }

    return { success: true, conversationId: conversation.id };
  } catch (error: any) {
    console.error("Failed to get/create eco conversation:", error);
    return { success: false, error: error.message };
  }
}

/**
 * Fetches all conversations related to a specific ecosystem application.
 * Returns both 'CLARIFICATION' and 'GENERAL' types.
 */
export async function getEcoApplicationConversations(ecoApplicationId: string) {
  try {
    const session = await ensureAuthenticated();
    const userId = session.user.id;

    const conversations = await db.conversation.findMany({
      where: {
        ecoApplicationId,
        participants: {
          some: { userId }
        }
      },
      include: {
        participants: { 
          where: { userId: { not: userId } },
          include: { user: { select: { firstName: true, lastName: true, role: true } } }
        },
        messages: {
          orderBy: { createdAt: 'desc' },
          take: 1
        }
      },
      orderBy: { updatedAt: 'desc' }
    });

    return { success: true, data: conversations };
  } catch (error: any) {
    console.error("Failed to fetch eco application conversations:", error);
    return { success: false, error: error.message };
  }
}

/**
 * Broadcasts a typing indicator to other participants
 */
export async function sendTypingStatus(conversationId: string, isTyping: boolean) {
  try {
    const session = await ensureAuthenticated();
    const userId = session.user.id;
    const participants = await db.conversationParticipant.findMany({
      where: { conversationId },
      select: { userId: true }
    });

    globalEmitter.emit('typing', {
      conversationId,
      userId,
      isTyping,
      recipientIds: participants.filter(p => p.userId !== userId).map(p => p.userId),
      userName: `${session.user.firstName} ${session.user.lastName}`
    });

    return { success: true };
  } catch (error) {
    return { success: false };
  }
}

/**
 * Initiates or retrieves a conversation between a Startup and the assigning Admin/Reviewer
 */
export async function initAppChatWithAdmin(applicationId: string) {
  try {
    const session = await ensureAuthenticated();
    const userId = session.user.id;

    const app = await db.application.findUnique({
      where: { id: applicationId },
      select: { startupName: true, reviewerId: true, userId: true }
    });

    if (!app) throw new Error("Application not found");
    
    let adminId = app.reviewerId;
    if (!adminId) {
       const firstAdmin = await db.user.findFirst({
         where: { role: { in: ["ADMIN", "SUPER_ADMIN"] } }
       });
       if (!firstAdmin) throw new Error("No available admin to process request.");
       adminId = firstAdmin.id;
    }

    let conversation = await db.conversation.findFirst({
      where: {
        applicationId,
        type: "GENERAL",
        participants: { some: { userId: adminId } }
      }
    });

    if (!conversation) {
      conversation = await db.conversation.create({
        data: {
          applicationId,
          type: "GENERAL",
          title: `Inquiry: ${app.startupName || 'Application'}`,
          participants: {
            create: [
              { userId, role: "OWNER" },
              { userId: adminId, role: "MEMBER" }
            ]
          }
        }
      });
    }

    return { success: true, data: { conversationId: conversation.id } };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

/**
 * Initiates or retrieves a conversation between a Startup and the Committee assigned to the app
 */
export async function initAppChatWithCommittee(applicationId: string) {
  try {
    const session = await ensureAuthenticated();
    const userId = session.user.id;

    const app = await db.application.findUnique({
      where: { id: applicationId },
      include: {
        assignments: {
          include: {
            committee: {
              include: {
                members: { include: { user: { select: { id: true } } } }
              }
            }
          }
        }
      }
    });

    if (!app) throw new Error("Application not found");
    if (app.assignments.length === 0) throw new Error("No committee assigned to this application yet.");

    const committeeMemberIds = app.assignments[0].committee.members.map(m => m.user.id);
    
    let conversation = await db.conversation.findFirst({
      where: {
        applicationId,
        type: "CLARIFICATION"
      }
    });

    if (!conversation) {
      conversation = await db.conversation.create({
        data: {
          applicationId,
          type: "CLARIFICATION",
          title: `Strategic Inquiry: ${app.startupName || 'Startup'}`,
          participants: {
            create: [
              { userId, role: "OWNER" },
              ...committeeMemberIds.map(memId => ({ userId: memId, role: "MEMBER" as const }))
            ]
          }
        }
      });
    }

    return { success: true, data: { conversationId: conversation.id } };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

/**
 * Initiates or retrieves a conversation between a Committee member and the Applicant.
 * Supported for both 'startup' and 'ecosystem' entity types.
 */
export async function initCommitteeChatWithStartup(entityId: string, entityType: "startup" | "ecosystem") {
  try {
    const session = await ensureAuthenticated();
    const userId = session.user.id;

    let targetUserId: string | null = null;
    let title = "";
    let applicationId: string | undefined;
    let ecoApplicationId: string | undefined;

    if (entityType === "startup") {
      const app = await db.application.findUnique({
        where: { id: entityId },
        select: { userId: true, startupName: true, id: true }
      });
      if (!app) throw new Error("Startup application not found");
      targetUserId = app.userId;
      title = `Strategic Inquiry: ${app.startupName || 'Startup'}`;
      applicationId = app.id;
    } else {
      const eco = await db.ecoApplication.findUnique({
        where: { id: entityId },
        include: { builder: { select: { userId: true, name: true } } }
      });
      if (!eco || !eco.builder?.userId) throw new Error("Ecosystem application not found");
      targetUserId = eco.builder.userId;
      title = `Strategic Inquiry: ${eco.name || 'Ecosystem'}`;
      ecoApplicationId = eco.id;
    }

    if (!targetUserId) throw new Error("Target applicant user not found");

    // Check for existing CLARIFICATION conversation
    let conversation = await db.conversation.findFirst({
      where: {
        applicationId,
        ecoApplicationId,
        type: "CLARIFICATION"
      }
    });

    if (!conversation) {
      // Find all committee members for this app to include them in the loop
      let committeeMemberIds: string[] = [];
      if (entityType === "startup") {
        const appWithAssignments = await db.application.findUnique({
          where: { id: entityId },
          include: { assignments: { include: { committee: { include: { members: true } } } } }
        });
        committeeMemberIds = appWithAssignments?.assignments?.[0]?.committee.members.map(m => m.userId) || [];
      } else {
        const ecoWithAssignments = await db.ecoApplication.findUnique({
          where: { id: entityId },
          include: { assignments: { include: { committee: { include: { members: true } } } } }
        });
        committeeMemberIds = ecoWithAssignments?.assignments?.[0]?.committee.members.map(m => m.userId) || [];
      }

      // Ensure the current user (the committee member) is a participant
      const uniqueParticipants = Array.from(new Set([targetUserId, userId, ...committeeMemberIds]));

      conversation = await db.conversation.create({
        data: {
          applicationId,
          ecoApplicationId,
          type: "CLARIFICATION",
          title,
          participants: {
            create: uniqueParticipants.map(pid => ({ 
              userId: pid, 
              role: pid === targetUserId ? "OWNER" : "MEMBER" 
            }))
          }
        }
      });
    }

    return { success: true, data: { conversationId: conversation.id } };
  } catch (error: any) {
    console.error("Failed to init committee-startup chat:", error);
    return { success: false, error: error.message };
  }
}

/**
 * Initiates or retrieves a conversation between an Ecosystem Builder and the Admin
 */
export async function initEcoChatWithAdmin(ecoApplicationId: string) {
  try {
    const session = await ensureAuthenticated();
    const userId = session.user.id;

    const eco = await db.ecoApplication.findUnique({
      where: { id: ecoApplicationId },
      select: { name: true, reviewerId: true }
    });

    if (!eco) throw new Error("Ecosystem application not found");
    
    let adminId = eco.reviewerId;
    if (!adminId) {
       const firstAdmin = await db.user.findFirst({
         where: { role: { in: ["ADMIN", "SUPER_ADMIN"] } }
       });
       if (!firstAdmin) throw new Error("No available admin to process request.");
       adminId = firstAdmin.id;
    }

    let conversation = await db.conversation.findFirst({
      where: {
        ecoApplicationId,
        type: "GENERAL",
        participants: { some: { userId: adminId } }
      }
    });

    if (!conversation) {
      conversation = await db.conversation.create({
        data: {
          ecoApplicationId,
          type: "GENERAL",
          title: `Inquiry: ${eco.name || 'Ecosystem Agent'}`,
          participants: {
            create: [
              { userId, role: "OWNER" },
              { userId: adminId, role: "MEMBER" }
            ]
          }
        }
      });
    }

    return { success: true, data: { conversationId: conversation.id } };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

/**
 * Initiates or retrieves a conversation between an Ecosystem Builder and the Committee
 */
export async function initEcoChatWithCommittee(ecoApplicationId: string) {
  try {
    const session = await ensureAuthenticated();
    const userId = session.user.id;

    const eco = await db.ecoApplication.findUnique({
      where: { id: ecoApplicationId },
      include: {
        assignments: {
          include: {
            committee: {
              include: {
                members: { include: { user: { select: { id: true } } } }
              }
            }
          }
        }
      }
    });

    if (!eco) throw new Error("Ecosystem application not found");
    if (eco.assignments.length === 0) throw new Error("No committee assigned to this application yet.");

    const committeeMemberIds = eco.assignments[0].committee.members.map(m => m.user.id);
    
    let conversation = await db.conversation.findFirst({
      where: {
        ecoApplicationId,
        type: "CLARIFICATION"
      }
    });

    if (!conversation) {
      conversation = await db.conversation.create({
        data: {
          ecoApplicationId,
          type: "CLARIFICATION",
          title: `Strategic Inquiry: ${eco.name || 'Ecosystem'}`,
          participants: {
            create: [
              { userId, role: "OWNER" },
              ...committeeMemberIds.map(memId => ({ userId: memId, role: "MEMBER" as const }))
            ]
          }
        }
      });
    }

    return { success: true, data: { conversationId: conversation.id } };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
/**
 * Initiates or retrieves a 'GENERAL' conversation between an Admin and an Applicant.
 * This is used for direct messaging from the admin list views.
 */
export async function initAdminChatWithApplicant(entityId: string, entityType: "startup" | "ecosystem") {
  try {
    const session = await ensureAdmin();
    const adminId = session.user.id;

    const userRole = (session.user as any).role;
    if (userRole !== "ADMIN" && userRole !== "SUPER_ADMIN") {
      throw new Error("Only administrators can initiate this type of chat.");
    }

    let targetUserId: string | null = null;
    let title = "";
    let applicationId: string | undefined;
    let ecoApplicationId: string | undefined;

    if (entityType === "startup") {
      const app = await db.application.findUnique({
        where: { id: entityId },
        select: { userId: true, startupName: true, id: true }
      });
      if (!app) throw new Error("Application not found");
      targetUserId = app.userId;
      title = `Inquiry: ${app.startupName || 'Startup'}`;
      applicationId = app.id;
    } else {
      const eco = await db.ecoApplication.findUnique({
        where: { id: entityId },
        include: { builder: { select: { userId: true, name: true } } }
      });
      if (!eco || !eco.builder?.userId) throw new Error("Ecosystem application not found");
      targetUserId = eco.builder.userId;
      title = `Inquiry: ${eco.name || 'Ecosystem'}`;
      ecoApplicationId = eco.id;
    }

    if (!targetUserId) throw new Error("Target applicant user not found");

    // Check for existing GENERAL conversation between this admin and this applicant for this specific application
    let conversation = await db.conversation.findFirst({
      where: {
        applicationId,
        ecoApplicationId,
        type: "GENERAL"
      }
    });

    if (!conversation) {
      conversation = await db.conversation.create({
        data: {
          applicationId,
          ecoApplicationId,
          type: "GENERAL",
          title,
          participants: {
            create: [
              { userId: adminId, role: "MEMBER" },
              { userId: targetUserId, role: "OWNER" }
            ]
          }
        }
      });
    }

    return { success: true, data: { conversationId: conversation.id } };
  } catch (error: any) {
    console.error("Failed to init admin-applicant chat:", error);
    return { success: false, error: error.message };
  }
}/**
 * Closes an existing conversation thread, preventing further messages.
 */
export async function closeConversation(conversationId: string) {
  try {
    const session = await ensureAuthenticated();
    const userRole = session.user.role ?? "USER";

    if (userRole !== "ADMIN" && userRole !== "SUPER_ADMIN" && userRole !== "COMMITTEE") {
      throw new Error("Only administrators or committee members can close threads.");
    }

    const updated = await db.conversation.update({
      where: { id: conversationId },
      data: { status: "CLOSED" }
    });

    return { success: true, data: updated };
  } catch (error: any) {
    console.error("Failed to close conversation:", error);
    return { success: false, error: error.message };
  }
}

