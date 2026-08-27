export interface ChecklistItem {
  id: string;
  label: string;
  directiveRef: string;
  required: boolean;
  entityType: "startup" | "ecosystem";
  forBuilderTypes?: string[];
}

export interface DocumentVerification {
  checklistItemId: string;
  status: "PENDING" | "VERIFIED" | "REJECTED";
  reviewedById?: string;
  reviewedAt?: Date;
  comment?: string;
}

export interface PreAssessmentResult {
  allDocumentsVerified: boolean;
  verifiedCount: number;
  totalRequired: number;
  rejectedCount: number;
  slaDeadline: Date;
  slaRemainingDays: number;
  isOverdue: boolean;
}

const STARTUP_CHECKLIST: ChecklistItem[] = [
  { id: "startup_business_license", label: "Business License", directiveRef: "Art. 7.1(a)", required: true, entityType: "startup" },
  { id: "startup_articles_incorp", label: "Articles of Incorporation", directiveRef: "Art. 7.1(b)", required: true, entityType: "startup" },
  { id: "startup_pitch_deck", label: "Pitch Deck", directiveRef: "Art. 7.1(c)", required: true, entityType: "startup" },
  { id: "startup_financials", label: "Financial Statements", directiveRef: "Art. 7.1(d)", required: true, entityType: "startup" },
  { id: "startup_founders_id", label: "Founders Identification", directiveRef: "Art. 7.1(e)", required: true, entityType: "startup" },
];

const ECOSYSTEM_CHECKLIST: ChecklistItem[] = [
  { id: "eco_business_license", label: "Business License", directiveRef: "Art. 8.1(a)", required: true, entityType: "ecosystem" },
  { id: "eco_tax_registration", label: "Tax Registration", directiveRef: "Art. 8.1(b)", required: true, entityType: "ecosystem" },
  { id: "eco_service_documentation", label: "Service Description & Portfolio", directiveRef: "Art. 8.1(c)", required: true, entityType: "ecosystem" },
  { id: "eco_team_professionals", label: "Professional Team Credentials", directiveRef: "Art. 8.1(d)", required: true, entityType: "ecosystem" },
  { id: "eco_facility_proof", label: "Facility & Infrastructure Proof", directiveRef: "Art. 8.1(e)", required: false, entityType: "ecosystem", forBuilderTypes: ["INCUBATOR", "ACCELERATOR", "COWORKING"] },
  { id: "eco_financial_records", label: "Financial Records (2 years)", directiveRef: "Art. 8.1(f)", required: true, entityType: "ecosystem" },
  { id: "eco_legal_compliance", label: "Legal Compliance Certificate", directiveRef: "Art. 8.1(g)", required: true, entityType: "ecosystem" },
];

export function getChecklist(entityType: "startup" | "ecosystem", builderType?: string): ChecklistItem[] {
  const items = entityType === "startup" ? STARTUP_CHECKLIST : ECOSYSTEM_CHECKLIST;
  if (!builderType) return items;
  return items.filter(i => !i.forBuilderTypes || i.forBuilderTypes.includes(builderType));
}

export function getRequiredChecklist(entityType: "startup" | "ecosystem", builderType?: string): ChecklistItem[] {
  return getChecklist(entityType, builderType).filter(i => i.required);
}

export function checkAllDocumentsVerified(verifications: DocumentVerification[], entityType: "startup" | "ecosystem", builderType?: string): PreAssessmentResult["allDocumentsVerified"] {
  const required = getRequiredChecklist(entityType, builderType);
  return required.every(r => {
    const v = verifications.find(v => v.checklistItemId === r.id);
    return v?.status === "VERIFIED";
  });
}

export function computeVerificationStats(verifications: DocumentVerification[], entityType: "startup" | "ecosystem", builderType?: string) {
  const required = getRequiredChecklist(entityType, builderType).map(r => r.id);
  const relevant = verifications.filter(v => required.includes(v.checklistItemId));
  return {
    verifiedCount: relevant.filter(v => v.status === "VERIFIED").length,
    rejectedCount: relevant.filter(v => v.status === "REJECTED").length,
    totalRequired: required.length,
  };
}

export function computeSla(submittedAt: Date, slaDays: number = 5): Omit<PreAssessmentResult, "allDocumentsVerified" | "verifiedCount" | "totalRequired" | "rejectedCount"> {
  const deadline = new Date(submittedAt.getTime() + slaDays * 24 * 60 * 60 * 1000);
  const now = new Date();
  const diffMs = deadline.getTime() - now.getTime();
  const remainingDays = Math.max(0, Math.ceil(diffMs / (1000 * 60 * 60 * 24)));
  return {
    slaDeadline: deadline,
    slaRemainingDays: remainingDays,
    isOverdue: now > deadline,
  };
}

export function isSlaBreached(submittedAt: Date, slaDays: number = 5): boolean {
  return new Date() > new Date(submittedAt.getTime() + slaDays * 24 * 60 * 60 * 1000);
}
