export type SurrenderStatus = "DRAFT" | "SUBMITTED" | "UNDER_REVIEW" | "APPROVED" | "REJECTED";
export type WindingUpReason = "VOLUNTARY" | "DISSOLUTION" | "MERGER" | "ACQUISITION" | "CESSATION" | "OTHER";

export interface SurrenderRequest {
  id: string;
  entityId: string;
  entityType: "startup" | "ecosystem";
  reason: WindingUpReason;
  description: string;
  status: SurrenderStatus;
  submittedAt: Date;
  decidedAt?: Date;
  certificateRevokedAt?: Date;
}

export const SURRENDER_REVIEW_DAYS = 45;
export const DIRECTIVE_REF = "Art. 26-27";

export function computeReviewDeadline(submittedAt: Date): Date {
  const deadline = new Date(submittedAt);
  deadline.setDate(deadline.getDate() + SURRENDER_REVIEW_DAYS);
  return deadline;
}

export function isReviewOverdue(submittedAt: Date): boolean {
  return new Date() > computeReviewDeadline(submittedAt);
}

export function getSurrenderStatus(submittedAt: Date, status: SurrenderStatus): { label: string; daysRemaining?: number } {
  if (status === "APPROVED") return { label: "Approved" };
  if (status === "REJECTED") return { label: "Rejected" };
  if (status === "DRAFT") return { label: "Draft" };
  if (status === "SUBMITTED") {
    const deadline = computeReviewDeadline(submittedAt);
    const remaining = Math.ceil((deadline.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
    return { label: "Submitted", daysRemaining: Math.max(0, remaining) };
  }
  const deadline = computeReviewDeadline(submittedAt);
  const remaining = Math.ceil((deadline.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
  return { label: "Under Review", daysRemaining: Math.max(0, remaining) };
}
