"use server";

import bcrypt from "bcryptjs";
import db from "@/lib/db";
import { createAuditLog } from "@/lib/audit";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import crypto from "crypto";

export async function recordFailedLoginAttempt(email: string) {
  const user = await db.user.findUnique({ where: { email } });
  if (!user) return;

  const newCount = user.loginAttempts + 1;
  const data: Record<string, unknown> = { loginAttempts: newCount };

  if (newCount >= 5) {
    data.lockedUntil = new Date(Date.now() + 30 * 60 * 1000);
  }

  await db.user.update({
    where: { email },
    data: data as any,
  });

  await createAuditLog({
    email: email ?? undefined,
    action: "SIGN_IN",
    resource: "auth",
    details: { loginAttempts: newCount, locked: newCount >= 5 },
  });
}

export async function resetLoginAttempts(userId: string) {
  const session = await getServerSession(authOptions);
  if (!session?.user) throw new Error("Unauthorized");

  await db.user.update({
    where: { id: userId },
    data: { loginAttempts: 0, lockedUntil: null },
  });

  await createAuditLog({
    userId,
    email: session.user.email ?? undefined,
    action: "USER_LOGIN",
    resource: "auth",
    details: { loginAttemptsReset: true },
  });
}

export async function isAccountLocked(userId: string): Promise<boolean> {
  const user = await db.user.findUnique({
    where: { id: userId },
    select: { lockedUntil: true },
  });
  if (!user?.lockedUntil) return false;
  return new Date() < user.lockedUntil;
}

export async function addPasswordToHistory(userId: string, password: string) {
  const hashed = await bcrypt.hash(password, 12);

  await db.passwordHistory.create({
    data: { userId, password: hashed },
  });

  const toDelete = await db.passwordHistory.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    skip: 5,
    select: { id: true },
  });

  if (toDelete.length > 0) {
    await db.passwordHistory.deleteMany({
      where: { id: { in: toDelete.map((e) => e.id) } },
    });
  }
}

export async function isPasswordReused(userId: string, password: string): Promise<boolean> {
  const history = await db.passwordHistory.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    take: 5,
  });

  for (const entry of history) {
    if (await bcrypt.compare(password, entry.password)) {
      return true;
    }
  }
  return false;
}

export async function createEmailChangeRequest(userId: string, newEmail: string) {
  const session = await getServerSession(authOptions);
  if (!session?.user) throw new Error("Unauthorized");

  const token = crypto.randomUUID();
  const request = await db.emailChangeRequest.create({
    data: {
      userId,
      newEmail,
      token,
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
    },
  });

  await createAuditLog({
    userId,
    email: session.user.email ?? undefined,
    action: "EMAIL_CHANGE",
    resource: "email-change",
    details: { requestId: request.id, newEmail },
  });

  return request;
}

export async function approveEmailChangeRequest(requestId: string) {
  const session = await getServerSession(authOptions);
  if (!session?.user) throw new Error("Unauthorized");

  const request = await db.emailChangeRequest.findUnique({
    where: { id: requestId },
  });
  if (!request) throw new Error("Email change request not found");

  await db.user.update({
    where: { id: request.userId },
    data: { email: request.newEmail },
  });

  await db.emailChangeRequest.update({
    where: { id: requestId },
    data: {
      status: "APPROVED",
      reviewedAt: new Date(),
      reviewedById: session.user.id,
    },
  });

  await createAuditLog({
    userId: request.userId,
    email: session.user.email ?? undefined,
    action: "EMAIL_CHANGE",
    resource: "email-change",
    details: { requestId, approved: true },
  });
}

export async function rejectEmailChangeRequest(requestId: string, reason: string) {
  const session = await getServerSession(authOptions);
  if (!session?.user) throw new Error("Unauthorized");

  const request = await db.emailChangeRequest.findUnique({
    where: { id: requestId },
  });
  if (!request) throw new Error("Email change request not found");

  await db.emailChangeRequest.update({
    where: { id: requestId },
    data: {
      status: "REJECTED",
      reviewedAt: new Date(),
      reviewedById: session.user.id,
      reason,
    },
  });

  await createAuditLog({
    userId: request.userId,
    email: session.user.email ?? undefined,
    action: "EMAIL_CHANGE",
    resource: "email-change",
    details: { requestId, rejected: true, reason },
  });
}

export async function getUserSessions(userId: string) {
  return db.userSession.findMany({
    where: { userId, isActive: true },
    orderBy: { lastActiveAt: "desc" },
  });
}

export async function terminateSession(sessionId: string) {
  const session = await getServerSession(authOptions);
  if (!session?.user) throw new Error("Unauthorized");

  await db.userSession.update({
    where: { id: sessionId },
    data: { isActive: false },
  });

  await createAuditLog({
    userId: session.user.id,
    email: session.user.email ?? undefined,
    action: "USER_LOGOUT",
    resource: "session",
    details: { terminatedSessionId: sessionId },
  });
}

export async function terminateOtherSessions(userId: string, currentSessionToken: string) {
  const session = await getServerSession(authOptions);
  if (!session?.user) throw new Error("Unauthorized");

  await db.userSession.updateMany({
    where: {
      userId,
      token: { not: currentSessionToken },
      isActive: true,
    },
    data: { isActive: false },
  });

  await createAuditLog({
    userId,
    email: session.user.email ?? undefined,
    action: "USER_LOGOUT",
    resource: "session",
    details: { terminatedOtherSessions: true },
  });
}
