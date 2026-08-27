export type CallStatus = "DRAFT" | "PUBLISHED" | "CLOSED" | "CANCELLED";
export type CallTarget = "startup" | "ecosystem" | "both";

export const MIN_APPLICATION_WINDOW_DAYS = 30;
export const DIRECTIVE_REF = "Art. 6";

export interface CallForApplications {
  id: string;
  title: string;
  description: string;
  targetType: CallTarget;
  status: CallStatus;
  opensAt: Date;
  closesAt: Date;
  maxApplications?: number;
  requirements: string[];
  issuedById: string;
  createdAt: Date;
}

export function isCallOpen(call: Pick<CallForApplications, "status" | "opensAt" | "closesAt">): boolean {
  if (call.status !== "PUBLISHED") return false;
  const now = new Date();
  return now >= call.opensAt && now <= call.closesAt;
}

export function getCallStatus(call: Pick<CallForApplications, "status" | "opensAt" | "closesAt">): CallStatus {
  if (call.status === "DRAFT") return "DRAFT";
  if (call.status === "CANCELLED") return "CANCELLED";
  const now = new Date();
  if (now < call.opensAt) return "PUBLISHED";
  if (now > call.closesAt) return "CLOSED";
  return "PUBLISHED";
}

export function getDaysRemaining(call: Pick<CallForApplications, "closesAt">): number {
  const diffMs = call.closesAt.getTime() - new Date().getTime();
  return Math.max(0, Math.ceil(diffMs / (1000 * 60 * 60 * 24)));
}

export function validateApplicationWindow(opensAt: Date, closesAt: Date): { valid: boolean; message?: string } {
  const diffDays = Math.ceil((closesAt.getTime() - opensAt.getTime()) / (1000 * 60 * 60 * 24));
  if (diffDays < MIN_APPLICATION_WINDOW_DAYS) {
    return { valid: false, message: `Application window must be at least ${MIN_APPLICATION_WINDOW_DAYS} days` };
  }
  return { valid: true };
}
