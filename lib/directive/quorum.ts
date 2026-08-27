export interface QuorumConfig {
  minMembers: number;
  quorumPercentage: number;
  approvalPercentage: number;
  directiveRef: string;
}

export const QUORUM_CONFIG: Record<string, QuorumConfig> = {
  STANDARD_COMMITTEE: {
    minMembers: 3,
    quorumPercentage: 50,
    approvalPercentage: 50,
    directiveRef: "Art. 13.1, 33.3(a)",
  },
  CAC_OVERSIGHT: {
    minMembers: 5,
    quorumPercentage: 60,
    approvalPercentage: 66,
    directiveRef: "Art. 33.3(b)",
  },
  EMERGENCY_SESSION: {
    minMembers: 3,
    quorumPercentage: 33,
    approvalPercentage: 50,
    directiveRef: "Art. 33.3(c)",
  },
};

export function hasQuorum(totalMembers: number, presentMembers: number, config: QuorumConfig): boolean {
  if (totalMembers < config.minMembers) return false;
  const requiredPresent = Math.ceil(totalMembers * config.quorumPercentage / 100);
  return presentMembers >= Math.max(requiredPresent, config.minMembers);
}

export function hasApproval(totalMembers: number, votesInFavor: number, config: QuorumConfig): boolean {
  const requiredVotes = Math.ceil(totalMembers * config.approvalPercentage / 100);
  return votesInFavor >= requiredVotes;
}

export function getRequiredPresent(totalMembers: number, config: QuorumConfig): number {
  const byPercentage = Math.ceil(totalMembers * config.quorumPercentage / 100);
  return Math.max(byPercentage, config.minMembers);
}

export function getRequiredApprovals(totalMembers: number, config: QuorumConfig): number {
  return Math.ceil(totalMembers * config.approvalPercentage / 100);
}

export function getQuorumConfig(committeeType: string, isEmergency?: boolean): QuorumConfig {
  if (isEmergency) return QUORUM_CONFIG.EMERGENCY_SESSION;
  if (committeeType === "CAC") return QUORUM_CONFIG.CAC_OVERSIGHT;
  return QUORUM_CONFIG.STANDARD_COMMITTEE;
}
