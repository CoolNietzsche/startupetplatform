'use server';

import db from "@/lib/db";
import { sendEmail } from "@/lib/actions/send-email";
import globalEmitter from "@/lib/event-emitter";
import { ensureAuthenticated, ensureAdmin } from "@/lib/security";

export type NotificationType = 'info' | 'success' | 'warning' | 'error';

interface CreateNotificationParams {
  userId: string;
  title: string;
  message: string;
  type?: NotificationType;
  link?: string;
  sendAsEmail?: boolean;
}

/**
 * Creates a system notification and optionally sends an email.
 */
export async function createNotification({
  userId,
  title,
  message,
  type = 'info',
  link,
  sendAsEmail = false,
}: CreateNotificationParams) {
  await ensureAuthenticated();
  try {
    // 1. Persist in Database (System Notification)
    const notification = await db.notification.create({
      data: {
        userId,
        title,
        message,
        type,
        link,
      },
    });

    // 2. Real-time Trigger with Native Next.js SSE (Event Emitter)
    try {
      globalEmitter.emit("new-notification", notification);
    } catch (sseErr) {
      console.error("[REAL-TIME SSE] Event emit failed:", sseErr);
    }


    // 3. Email Notification (if requested and user preference allows)
    if (sendAsEmail) {
      const user = await db.user.findUnique({
        where: { id: userId },
        include: { notificationPrefs: true },
      });

      if (user && user.email && (!user.notificationPrefs || user.notificationPrefs.emailNotifications)) {
        await sendEmail({
          to: user.email,
          subject: title,
          html: `
            <!DOCTYPE html>
            <html>
            <head>
              <meta charset="utf-8">
              <style>
                body { font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; margin: 0; padding: 0; }
                .email-wrapper { max-width: 600px; margin: 40px auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06); border: 1px solid #e2e8f0; }
                .email-header { background-color: #0f172a; padding: 24px 32px; text-align: center; }
                .email-header h1 { color: #ffffff; margin: 0; font-size: 20px; font-weight: 600; letter-spacing: 0.5px; }
                .email-body { padding: 40px 32px; }
                .email-title { color: #0f172a; font-size: 22px; font-weight: 700; margin-top: 0; margin-bottom: 20px; }
                .email-content { color: #334155; font-size: 16px; line-height: 1.6; margin-bottom: 30px; }
                .btn-container { text-align: left; margin: 30px 0; }
                .btn { display: inline-block; background-color: #2563eb; color: #ffffff; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 15px; transition: background-color 0.2s; }
                .email-footer { background-color: #f8fafc; padding: 24px 32px; text-align: left; border-top: 1px solid #e2e8f0; }
                .footer-text { margin: 0; color: #64748b; font-size: 13px; line-height: 1.5; }
              </style>
            </head>
            <body>
              <div class="email-wrapper">
                <div class="email-header">
                  <h1>STARTUP ETHIOPIA PORTAL</h1>
                </div>
                <div class="email-body">
                  <h2 class="email-title">${title}</h2>
                  <div class="email-content">
                    ${message.replace(/\n/g, '<br/>')}
                  </div>
                  ${link ? `
                  <div class="btn-container">
                    <a href="${process.env.NEXT_PUBLIC_APP_URL}${link}" class="btn">View Request Details</a>
                  </div>
                  ` : ''}
                </div>
                <div class="email-footer">
                  <p class="footer-text">
                    <strong>Note:</strong> This is an official automated notification from the National Digital Startup Portal (NSLP). Please do not reply directly to this email. Use the portal to submit your response.
                  </p>
                </div>
              </div>
            </body>
            </html>
          `,
        });
      }
    }

    return { success: true, data: notification };
  } catch (error) {
    console.error("Failed to create notification:", error);
    return { success: false, error: "Notification failed" };
  }
}

/**
 * Marks a notification as read.
 */
export async function markNotificationAsRead(notificationId: string) {
  const session = await ensureAuthenticated();
  try {
    // Verify ownership
    const notification = await db.notification.findUnique({
      where: { id: notificationId },
      select: { userId: true }
    });

    if (!notification || notification.userId !== session.user.id) {
       throw new Error("Forbidden: You can only mark your own notifications as read.");
    }

    await db.notification.update({
      where: { id: notificationId },
      data: { isRead: true },
    });
    return { success: true };
  } catch (error) {
    console.error("Failed to mark notification as read:", error);
    return { success: false };
  }
}

/**
 * Marks all notifications as read for a user.
 */
export async function markAllNotificationsAsRead(userId: string) {
  const session = await ensureAuthenticated();
  if (session.user.id !== userId) {
      throw new Error("Forbidden: You can only mark your own notifications as read.");
  }
  try {
    await db.notification.updateMany({
      where: { userId, isRead: false },
      data: { isRead: true },
    });
    return { success: true };
  } catch (error) {
    console.error("Failed to mark all notifications as read:", error);
    return { success: false };
  }
}

/**
 * Fetches notifications for a specific user.
 */
export async function getUserNotifications(userId: string, unreadOnly: boolean = false) {
  const session = await ensureAuthenticated();
  if (session.user.id !== userId && (session.user as any).role !== 'ADMIN' && (session.user as any).role !== 'SUPER_ADMIN') {
      throw new Error("Forbidden: You can only view your own notifications.");
  }
  try {
    const notifications = await db.notification.findMany({
      where: {
        userId,
        ...(unreadOnly ? { isRead: false } : {}),
      },
      orderBy: { createdAt: 'desc' },
      take: 50, // Get the latest 50 notifications
    });
    return { success: true, data: notifications as any };
  } catch (error) {
    console.error("Failed to fetch notifications:", error);
    return { success: false, data: [] };
  }
}

/**
 * Notifies all system administrators.
 */
export async function notifyAllAdmins({
  title,
  message,
  type = 'info',
  link,
  sendAsEmail = false,
}: Omit<CreateNotificationParams, 'userId'>) {
  await ensureAuthenticated();
  try {
    const admins = await db.user.findMany({
      where: {
        role: {
          in: ['ADMIN', 'SUPER_ADMIN']
        }
      },
      select: { id: true }
    });

    const notifications = await Promise.all(
      admins.map(admin => 
        createNotification({
          userId: admin.id,
          title,
          message,
          type,
          link,
          sendAsEmail
        })
      )
    );

    return { success: true, count: notifications.length };
  } catch (error) {
    console.error("Failed to notify all admins:", error);
    return { success: false, error: "Admin notification failed" };
  }
}
