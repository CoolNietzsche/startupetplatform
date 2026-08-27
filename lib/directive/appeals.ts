export type AppealStatus = "PENDING" | "UNDER_REVIEW" | "UPHELD" | "DENIED" | "DISMISSED";
export type AppealGround = "PROCEDURAL_ERROR" | "NEW_EVIDENCE" | "MISAPPLICATION" | "BIAS" | "OTHER";

export interface Appeal {
  id: string;
  entityId: string;
  entityType: "startup" | "ecosystem";
  decisionId: string;
  grounds: AppealGround;
  description: string;
  status: AppealStatus;
  filedAt: Date;
  appealDeadline: Date;
  decidedAt?: Date;
  decidedById?: string;
  decisionReason?: string;
}

export const APPEAL_DEADLINE_DAYS = 30;
export const APPEAL_REVIEW_DAYS = 60;
export const DIRECTIVE_REF = "Art. 35";

export function computeAppealDeadline(decisionDate: Date): Date {
  const deadline = new Date(decisionDate);
  deadline.setDate(deadline.getDate() + APPEAL_DEADLINE_DAYS);
  return deadline;
}

export function isAppealTimely(decisionDate: Date): boolean {
  return new Date() <= computeAppealDeadline(decisionDate);
}

export function computeReviewDeadline(filedAt: Date): Date {
  const deadline = new Date(filedAt);
  deadline.setDate(deadline.getDate() + APPEAL_REVIEW_DAYS);
  return deadline;
}

export function isReviewOverdue(filedAt: Date): boolean {
  return new Date() > computeReviewDeadline(filedAt);
}

export function getAppealStatus(filedAt: Date, status: AppealStatus, decisionDate?: Date): { label: string; isActive: boolean; daysRemaining?: number } {
  if (status === "UPHELD" || status === "DENIED" || status === "DISMISSED") {
    return { label: status === "UPHELD" ? "Upheld" : status === "DENIED" ? "Denied" : "Dismissed", isActive: false };
  }
  if (status === "UNDER_REVIEW") {
    const deadline = computeReviewDeadline(filedAt);
    const remaining = Math.ceil((deadline.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
    return { label: "Under Review", isActive: true, daysRemaining: Math.max(0, remaining) };
  }
  const deadline = computeReviewDeadline(filedAt);
  const remaining = Math.ceil((deadline.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
  return { label: "Pending Review", isActive: true, daysRemaining: Math.max(0, remaining) };
}
