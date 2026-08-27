export type ConfidentialityLevel = "PUBLIC" | "INTERNAL" | "CONFIDENTIAL" | "RESTRICTED";
export type DataCategory = "PERSONAL" | "FINANCIAL" | "COMMERCIAL" | "TECHNICAL" | "LEGAL" | "OPERATIONAL";

export interface ConfidentialityObligation {
  dataCategory: DataCategory;
  level: ConfidentialityLevel;
  directiveRef: string;
  description: string;
  retentionYears: number;
}

export interface DisclosureRequest {
  id: string;
  requestedById: string;
  dataCategory: DataCategory;
  purpose: string;
  status: "PENDING" | "APPROVED" | "DENIED";
  decidedAt?: Date;
  decisionReason?: string;
}

export const CONFIDENTIALITY_OBLIGATIONS: ConfidentialityObligation[] = [
  { dataCategory: "PERSONAL", level: "RESTRICTED", directiveRef: "Art. 12.1", description: "Personal data of founders, employees, and beneficiaries", retentionYears: 5 },
  { dataCategory: "FINANCIAL", level: "CONFIDENTIAL", directiveRef: "Art. 12.2", description: "Financial statements, tax records, and bank details", retentionYears: 7 },
  { dataCategory: "COMMERCIAL", level: "CONFIDENTIAL", directiveRef: "Art. 12.3", description: "Business plans, IP, trade secrets, and competitive data", retentionYears: 3 },
  { dataCategory: "TECHNICAL", level: "INTERNAL", directiveRef: "Art. 12.4", description: "Technical specifications and process documentation", retentionYears: 3 },
  { dataCategory: "LEGAL", level: "CONFIDENTIAL", directiveRef: "Art. 12.5", description: "Legal correspondence, contracts, and dispute records", retentionYears: 10 },
  { dataCategory: "OPERATIONAL", level: "INTERNAL", directiveRef: "Art. 12.6", description: "Operational metrics, internal reports, and performance data", retentionYears: 3 },
];

export function getDataLevel(dataCategory: DataCategory): ConfidentialityLevel {
  return CONFIDENTIALITY_OBLIGATIONS.find(o => o.dataCategory === dataCategory)?.level || "INTERNAL";
}

export function canDisclose(dataCategory: DataCategory, userRole: string): boolean {
  const level = getDataLevel(dataCategory);
  if (level === "PUBLIC") return true;
  if (userRole === "SUPER_ADMIN") return true;
  if (level === "RESTRICTED") return userRole === "CAC_MEMBER" || userRole === "ADMIN";
  if (level === "CONFIDENTIAL") return userRole === "CAC_MEMBER" || userRole === "ADMIN" || userRole === "COMMITTEE_CHAIR";
  return true;
}

export function computeRetentionExpiry(createdAt: Date, dataCategory: DataCategory): Date {
  const obligation = CONFIDENTIALITY_OBLIGATIONS.find(o => o.dataCategory === dataCategory);
  const years = obligation?.retentionYears || 3;
  const expiry = new Date(createdAt);
  expiry.setFullYear(expiry.getFullYear() + years);
  return expiry;
}

export const DIRECTIVE_REF = "Art. 12";
