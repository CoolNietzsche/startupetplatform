export type TransitionStatus = "ACTIVE" | "CONVERTED" | "EXPIRED" | "EXEMPT";

export interface TransitionalProvision {
  entityId: string;
  entityType: "startup" | "ecosystem";
  previousDesignation: string;
  newDesignation: string;
  transitionDeadline: Date;
  status: TransitionStatus;
  convertedAt?: Date;
}

export const TRANSITION_GRACE_DAYS = 180;
export const DIRECTIVE_REF = "Art. 32";

export function computeTransitionDeadline(effectiveDate: Date): Date {
  const deadline = new Date(effectiveDate);
  deadline.setDate(deadline.getDate() + TRANSITION_GRACE_DAYS);
  return deadline;
}

export function isTransitionOverdue(effectiveDate: Date): boolean {
  return new Date() > computeTransitionDeadline(effectiveDate);
}

export function getTransitionStatus(effectiveDate: Date, status: TransitionStatus): { label: string; daysRemaining?: number; isOverdue: boolean } {
  if (status === "CONVERTED") return { label: "Converted", isOverdue: false };
  if (status === "EXPIRED") return { label: "Expired", isOverdue: true };
  if (status === "EXEMPT") return { label: "Exempt", isOverdue: false };
  const deadline = computeTransitionDeadline(effectiveDate);
  const remaining = Math.ceil((deadline.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
  const overdue = new Date() > deadline;
  return { label: "Active", daysRemaining: Math.max(0, remaining), isOverdue: overdue };
}

export function canApplyTransition(entityType: "startup" | "ecosystem", existingDesignation: string): boolean {
  const validDesignations: Record<string, string[]> = {
    startup: ["INITIAL", "POST_INITIAL", "SCALE_EXIT"],
    ecosystem: ["INCUBATOR", "ACCELERATOR", "COWORKING", "VENTURE_CAPITAL", "ANGEL_INVESTOR"],
  };
  return validDesignations[entityType]?.includes(existingDesignation) || false;
}
