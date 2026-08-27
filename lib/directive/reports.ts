export type ReportType = "STARTUP_PROGRESS" | "INCUBATION_PROGRESS" | "ECOSYSTEM_ANNUAL";

export interface ReportRequirement {
  reportType: ReportType;
  directiveRef: string;
  frequency: "QUARTERLY" | "SEMI_ANNUAL" | "ANNUAL";
  entityType: "startup" | "ecosystem";
  description: string;
  dueDaysAfterPeriod: number;
}

export const REPORT_REQUIREMENTS: ReportRequirement[] = [
  {
    reportType: "STARTUP_PROGRESS",
    directiveRef: "Art. 19.5",
    frequency: "QUARTERLY",
    entityType: "startup",
    description: "Progress report on milestones, KPIs, and growth metrics",
    dueDaysAfterPeriod: 15,
  },
  {
    reportType: "INCUBATION_PROGRESS",
    directiveRef: "Art. 20.5",
    frequency: "QUARTERLY",
    entityType: "startup",
    description: "Incubation program progress and mentorship outcomes",
    dueDaysAfterPeriod: 15,
  },
  {
    reportType: "ECOSYSTEM_ANNUAL",
    directiveRef: "Art. 29.1",
    frequency: "ANNUAL",
    entityType: "ecosystem",
    description: "Annual report on operations, impact, and compliance",
    dueDaysAfterPeriod: 90,
  },
];

export function getReportRequirements(entityType: "startup" | "ecosystem"): ReportRequirement[] {
  return REPORT_REQUIREMENTS.filter(r => r.entityType === entityType);
}

export function computeReportDueDate(lastSubmittedAt: Date, requirement: ReportRequirement): Date {
  const periodMap = { QUARTERLY: 3, SEMI_ANNUAL: 6, ANNUAL: 12 };
  const months = periodMap[requirement.frequency];
  const due = new Date(lastSubmittedAt);
  const targetMonth = due.getMonth() + months;
  const targetYear = due.getFullYear() + Math.floor(targetMonth / 12);
  const month = targetMonth % 12;
  const day = Math.min(due.getDate(), new Date(targetYear, month + 1, 0).getDate());
  due.setFullYear(targetYear, month, day);
  due.setDate(due.getDate() + requirement.dueDaysAfterPeriod);
  return due;
}

export function isReportOverdue(lastSubmittedAt: Date, requirement: ReportRequirement): boolean {
  return new Date() > computeReportDueDate(lastSubmittedAt, requirement);
}

export function getReportStatus(lastSubmittedAt: Date | null, requirement: ReportRequirement): "OVERDUE" | "DUE_SOON" | "COMPLIANT" | "NEVER_SUBMITTED" {
  if (!lastSubmittedAt) return "NEVER_SUBMITTED";
  const dueDate = computeReportDueDate(lastSubmittedAt, requirement);
  if (new Date() > dueDate) return "OVERDUE";
  const warningDays = 30;
  const warningDate = new Date(dueDate);
  warningDate.setDate(warningDate.getDate() - warningDays);
  if (new Date() > warningDate) return "DUE_SOON";
  return "COMPLIANT";
}
