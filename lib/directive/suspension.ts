export type SuspensionSeverity = "MINOR" | "MODERATE" | "SEVERE";

export interface SuspensionAction {
  id: string;
  entityType: "startup" | "ecosystem";
  entityId: string;
  actionType: "SUSPEND" | "REVOKE";
  severity: SuspensionSeverity;
  reason: string;
  directiveRef: string;
  issuedById: string;
  issuedAt: Date;
  effectiveFrom: Date;
  durationDays?: number;
  rescindedAt?: Date;
  rescindedById?: string;
  appealDeadline?: Date;
}

export interface SuspensionGrounds {
  directiveRef: string;
  reason: string;
  severity: SuspensionSeverity;
  defaultDurationDays: number;
}

export const SUSPENSION_GROUNDS: SuspensionGrounds[] = [
  {
    directiveRef: "Art. 24.1(a)",
    reason: "Non-compliance with certification requirements",
    severity: "MODERATE",
    defaultDurationDays: 90,
  },
  {
    directiveRef: "Art. 24.1(b)",
    reason: "Failure to maintain minimum operating standards",
    severity: "MODERATE",
    defaultDurationDays: 60,
  },
  {
    directiveRef: "Art. 25.1(a)",
    reason: "Fraudulent documentation or misrepresentation",
    severity: "SEVERE",
    defaultDurationDays: 0,
  },
  {
    directiveRef: "Art. 25.1(b)",
    reason: "Repeated or willful violation of directive provisions",
    severity: "SEVERE",
    defaultDurationDays: 0,
  },
  {
    directiveRef: "Art. 30.1(a)",
    reason: "Failure to submit periodic reports",
    severity: "MINOR",
    defaultDurationDays: 30,
  },
  {
    directiveRef: "Art. 30.1(b)",
    reason: "Operational changes without prior notification",
    severity: "MINOR",
    defaultDurationDays: 45,
  },
  {
    directiveRef: "Art. 31.1",
    reason: "Revocation of business license or legal status",
    severity: "SEVERE",
    defaultDurationDays: 0,
  },
];

export function getSuspensionGrounds(directiveRef: string): SuspensionGrounds | undefined {
  return SUSPENSION_GROUNDS.find(g => g.directiveRef === directiveRef);
}

export function isSuspensionActive(suspension: SuspensionAction): boolean {
  if (suspension.rescindedAt) return false;
  if (suspension.actionType === "REVOKE") return true;
  if (!suspension.durationDays) return true;
  const endDate = new Date(suspension.effectiveFrom);
  endDate.setDate(endDate.getDate() + suspension.durationDays);
  return new Date() < endDate;
}

export function computeAppealDeadline(issuedAt: Date, days: number = 30): Date {
  const deadline = new Date(issuedAt);
  deadline.setDate(deadline.getDate() + days);
  return deadline;
}

export function canRescind(suspension: SuspensionAction): boolean {
  return suspension.actionType === "SUSPEND" && !suspension.rescindedAt;
}
