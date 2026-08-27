import db from "@/lib/db";

export type AuditAction =
  | "SIGN_IN"
  | "SIGN_OUT"
  | "ROLE_CHANGE"
  | "USER_SUSPEND"
  | "USER_UNSUSPEND"
  | "APPLICATION_CREATE"
  | "APPLICATION_UPDATE"
  | "CERTIFICATE_ISSUE"
  | "CERTIFICATE_REVOKE"
  | "COMMITTEE_ASSIGN"
  | "PERMISSION_CHANGE"
  | "SETTINGS_CHANGE"
  | "PASSWORD_RESET"
  | "EMAIL_CHANGE"
  | "PROFILE_UPDATE"
  | "USER_LOGIN" | "USER_LOGOUT" | "USER_CREATED" | "USER_SUSPENDED" | "USER_UNSUSPENDED"
  | "ROLE_CHANGED" | "PERMISSION_GRANTED" | "PERMISSION_REVOKED"
  | "APPLICATION_STATUS_CHANGED" | "CERTIFICATE_ISSUED" | "CERTIFICATE_REVOKED"
  | "REPORT_SUBMITTED" | "REPORT_REVIEWED"
  | "HUB_UPDATED" | "PROGRAM_CREATED" | "MENTOR_ASSIGNED"
  | "SYSTEM_CONFIG_CHANGED";

async function writeAuditLog(params: {
  userId?: string;
  email?: string;
  action: AuditAction | string;
  resource?: string;
  details?: Record<string, unknown>;
  ipAddress?: string;
  userAgent?: string;
}) {
  try {
    await db.auditLog.create({ data: params });
  } catch (error) {
    console.error("[AuditLog] Failed to write audit entry:", error);
  }
}

export async function logAuditEvent(params: {
  userId?: string;
  email?: string;
  action: AuditAction;
  resource?: string;
  details?: Record<string, unknown>;
  ipAddress?: string;
  userAgent?: string;
}) {
  return writeAuditLog(params);
}

export async function createAuditLog(params: {
  userId?: string;
  email?: string;
  action: AuditAction | string;
  resource?: string;
  details?: Record<string, unknown>;
  ipAddress?: string;
  userAgent?: string;
}) {
  return writeAuditLog(params);
}

export async function getAuditLogs(options?: {
  limit?: number;
  offset?: number;
  action?: string;
  userId?: string;
}) {
  const where: Record<string, unknown> = {};
  if (options?.action) where.action = options.action;
  if (options?.userId) where.userId = options.userId;

  const [logs, total] = await Promise.all([
    db.auditLog.findMany({
      where: where as any,
      orderBy: { createdAt: "desc" },
      take: options?.limit || 100,
      skip: options?.offset || 0,
    }),
    db.auditLog.count({ where: where as any }),
  ]);

  return { logs, total };
}
