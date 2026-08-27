"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import db from "@/lib/db";

export interface LogEntry {
  id: string;
  timestamp: string;
  level: "info" | "warning" | "error" | "success";
  category: string;
  action: string;
  user: string;
  details: string;
  ipAddress: string;
}

function formatTimestamp(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  const h = String(d.getHours()).padStart(2, "0");
  const min = String(d.getMinutes()).padStart(2, "0");
  const s = String(d.getSeconds()).padStart(2, "0");
  return `${y}-${m}-${day} ${h}:${min}:${s}`;
}

export async function getSystemLogs(): Promise<LogEntry[]> {
  const session = await getServerSession(authOptions);
  if (!session || session.user?.role !== "SUPER_ADMIN") {
    throw new Error("Unauthorized: SUPER_ADMIN role required");
  }

  const logs: LogEntry[] = [];

  // 1. ApplicationStatusHistory
  const appHistories = await db.applicationStatusHistory.findMany({
    take: 500,
    orderBy: { createdAt: "desc" },
    include: {
      application: {
        select: {
          id: true,
          startupName: true,
          user: { select: { email: true } },
        },
      },
    },
  });

  for (const h of appHistories) {
    const statusStr = h.status.replace(/_/g, " ").toLowerCase();
    const statusTitle = h.status.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
    let level: LogEntry["level"] = "info";
    if (h.status === "CERTIFIED") level = "success";
    else if (h.status === "REJECTED" || h.status === "EXPIRED") level = "error";
    else if (["ROLLED_BACK", "CLARIFICATION_REQUESTED", "PAUSED"].includes(h.status)) level = "warning";

    logs.push({
      id: `app-status-${h.id}`,
      timestamp: formatTimestamp(h.createdAt),
      level,
      category: "Application",
      action: `Status Changed to ${statusTitle}`,
      user: h.application?.user?.email || "system",
      details: h.comment || `Application ${h.application?.startupName || h.applicationId} → ${statusStr}`,
      ipAddress: "",
    });
  }

  // 2. FileAccessLog
  const fileLogs = await db.fileAccessLog.findMany({
    take: 500,
    orderBy: { accessedAt: "desc" },
    include: {
      user: { select: { email: true } },
      file: { select: { originalName: true } },
    },
  });

  for (const f of fileLogs) {
    let level: LogEntry["level"] = "info";
    if (f.action === "DELETE") level = "warning";
    else if (f.action === "DOWNLOAD") level = "info";

    logs.push({
      id: `file-${f.id}`,
      timestamp: formatTimestamp(f.accessedAt),
      level,
      category: "File Access",
      action: `${f.action} File`,
      user: f.user?.email || "unknown",
      details: `File: ${f.file?.originalName || f.fileId}`,
      ipAddress: f.ipAddress || "",
    });
  }

  // 3. ComplaintHistory
  const complaintHistories = await db.complaintHistory.findMany({
    take: 500,
    orderBy: { createdAt: "desc" },
    include: {
      user: { select: { email: true } },
      complaint: {
        select: {
          title: true,
          submitterIp: true,
          trackingCode: true,
        },
      },
    },
  });

  for (const c of complaintHistories) {
    let level: LogEntry["level"] = "info";
    const actionLower = c.action.toLowerCase();
    if (actionLower.includes("resolved") || actionLower.includes("resolv")) level = "success";
    else if (actionLower.includes("reject")) level = "error";
    else if (actionLower.includes("warn") || actionLower.includes("suspen")) level = "warning";

    logs.push({
      id: `complaint-${c.id}`,
      timestamp: formatTimestamp(c.createdAt),
      level,
      category: "Complaint",
      action: c.action,
      user: c.user?.email || "Anonymous",
      details: c.note || `Complaint: ${c.complaint?.title || c.complaintId} (${c.complaint?.trackingCode || ""})`,
      ipAddress: c.complaint?.submitterIp || "",
    });
  }

  // 4. EcoApplicationStatusHistory
  const ecoHistories = await db.ecoApplicationStatusHistory.findMany({
    take: 500,
    orderBy: { createdAt: "desc" },
    include: {
      changedBy: { select: { email: true } },
      ecoApplication: {
        select: {
          name: true,
        },
      },
    },
  });

  for (const e of ecoHistories) {
    const toTitle = e.toStatus.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
    let level: LogEntry["level"] = "info";
    if (e.toStatus === "CERTIFIED") level = "success";
    else if (e.toStatus === "REJECTED" || e.toStatus === "EXPIRED") level = "error";
    else if (["CLARIFICATION_REQUESTED", "PAUSED"].includes(e.toStatus)) level = "warning";

    logs.push({
      id: `eco-status-${e.id}`,
      timestamp: formatTimestamp(e.createdAt),
      level,
      category: "Ecosystem",
      action: `Status Changed to ${toTitle}`,
      user: e.changedBy?.email || "system",
      details: e.reason || `Eco application ${e.ecoApplication?.name || e.ecoApplicationId} → ${toTitle}`,
      ipAddress: "",
    });
  }

  logs.sort((a, b) => b.timestamp.localeCompare(a.timestamp));

  return logs;
}
