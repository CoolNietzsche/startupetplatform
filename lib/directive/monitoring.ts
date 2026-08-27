export type InspectionStatus = "SCHEDULED" | "IN_PROGRESS" | "COMPLETED" | "OVERDUE";
export type FindingSeverity = "CRITICAL" | "MAJOR" | "MINOR" | "OBSERVATION";
export type FindingStatus = "OPEN" | "IN_PROGRESS" | "CLOSED" | "WAIVER";

export interface Inspection {
  id: string;
  entityId: string;
  entityType: "startup" | "ecosystem";
  scheduledAt: Date;
  completedAt?: Date;
  status: InspectionStatus;
  inspectorId: string;
  findings: Finding[];
}

export interface Finding {
  id: string;
  inspectionId: string;
  description: string;
  severity: FindingSeverity;
  status: FindingStatus;
  directiveRef: string;
  correctiveAction?: string;
  dueDate?: Date;
  closedAt?: Date;
}

export const DEFAULT_INSPECTION_FREQUENCY_MONTHS = 12;
export const DIRECTIVE_REF = "Art. 23";

export function computeNextInspectionDate(lastInspectionAt: Date | null): Date {
  if (!lastInspectionAt) return new Date();
  const next = new Date(lastInspectionAt);
  const targetMonth = next.getMonth() + DEFAULT_INSPECTION_FREQUENCY_MONTHS;
  const targetYear = next.getFullYear() + Math.floor(targetMonth / 12);
  const month = targetMonth % 12;
  const day = Math.min(next.getDate(), new Date(targetYear, month + 1, 0).getDate());
  next.setFullYear(targetYear, month, day);
  return next;
}

export function isInspectionOverdue(scheduledAt: Date): boolean {
  return new Date() > scheduledAt;
}

export function getInspectionPriority(findings: Finding[]): "LOW" | "MEDIUM" | "HIGH" | "CRITICAL" {
  if (findings.some(f => f.severity === "CRITICAL" && f.status !== "CLOSED")) return "CRITICAL";
  if (findings.some(f => f.severity === "MAJOR" && f.status !== "CLOSED")) return "HIGH";
  if (findings.some(f => f.severity === "MINOR" && f.status !== "CLOSED")) return "MEDIUM";
  return "LOW";
}

export function computeComplianceScore(findings: Finding[]): number {
  if (findings.length === 0) return 100;
  const closed = findings.filter(f => f.status === "CLOSED").length;
  return Math.round((closed / findings.length) * 100);
}

export const FINDING_SEVERITY_WEIGHTS: Record<FindingSeverity, number> = {
  CRITICAL: 10, MAJOR: 5, MINOR: 2, OBSERVATION: 1,
};
