export type CoiRelationship = "FAMILY" | "BUSINESS" | "FINANCIAL" | "EMPLOYMENT" | "OTHER";

export interface CoiDeclaration {
  id: string;
  committeeMemberId: string;
  applicationId: string;
  relationship: CoiRelationship;
  description: string;
  declaredAt: Date;
  resolution: "NONE" | "RECUSED" | "OVERRULED";
  resolvedAt?: Date;
  resolvedById?: string;
}

export interface CoiCheckResult {
  hasConflict: boolean;
  declarations: CoiDeclaration[];
  canParticipate: boolean;
}

const FAMILY_RELATIONS = ["spouse", "parent", "sibling", "child", "relative"];
const BUSINESS_RELATIONS = ["partner", "co-founder", "director", "shareholder"];

export function checkPotentialConflict(
  memberName: string,
  applicantName: string,
  memberRelations: { type: CoiRelationship; detail: string }[],
): CoiRelationship | null {
  for (const rel of memberRelations) {
    if (rel.type === "FAMILY" && FAMILY_RELATIONS.some(r => rel.detail.toLowerCase().includes(r))) {
      return "FAMILY";
    }
    if (rel.type === "BUSINESS" && BUSINESS_RELATIONS.some(r => rel.detail.toLowerCase().includes(r))) {
      return "BUSINESS";
    }
    if (rel.type === "FINANCIAL") return "FINANCIAL";
    if (rel.type === "EMPLOYMENT") return "EMPLOYMENT";
  }
  return null;
}

export function canProceedWithConflict(declaration: CoiDeclaration): boolean {
  return declaration.resolution === "OVERRULED" || declaration.resolution === "NONE";
}

export function requiresRecusal(declaration: CoiDeclaration): boolean {
  return declaration.resolution === "RECUSED";
}

export function getConflictDirectiveRef(relationship: CoiRelationship): string {
  const refs: Record<CoiRelationship, string> = {
    FAMILY: "Art. 14.1(a)",
    BUSINESS: "Art. 14.1(b)",
    FINANCIAL: "Art. 14.1(c)",
    EMPLOYMENT: "Art. 14.1(d)",
    OTHER: "Art. 14.1(e)",
  };
  return refs[relationship];
}
