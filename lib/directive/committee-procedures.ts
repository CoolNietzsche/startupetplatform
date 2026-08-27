export type MeetingStatus = "SCHEDULED" | "IN_PROGRESS" | "ADJOURNED" | "COMPLETED" | "CANCELLED";
export type VoteType = "IN_FAVOR" | "AGAINST" | "ABSTAIN" | "RECUSED";

export interface CommitteeMeeting {
  id: string;
  committeeId: string;
  scheduledAt: Date;
  startedAt?: Date;
  endedAt?: Date;
  status: MeetingStatus;
  agenda: string[];
  minutes?: string;
  decisions: MeetingDecision[];
}

export interface MeetingDecision {
  id: string;
  meetingId: string;
  item: string;
  directiveRef: string;
  proposedById: string;
  votes: VoteRecord[];
  outcome: "PASSED" | "FAILED" | "TABLED";
}

export interface VoteRecord {
  memberId: string;
  vote: VoteType;
  reason?: string;
}

export const MIN_ADVANCE_NOTICE_DAYS = 7;
export const DIRECTIVE_REF = "Art. 15-18";

export function validateMeetingSchedule(scheduledAt: Date): { valid: boolean; message?: string } {
  const diffDays = Math.ceil((scheduledAt.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
  if (diffDays < MIN_ADVANCE_NOTICE_DAYS) {
    return { valid: false, message: `Meetings must be scheduled at least ${MIN_ADVANCE_NOTICE_DAYS} days in advance (Art. 15)` };
  }
  return { valid: true };
}

export function tallyVotes(votes: VoteRecord[], totalMembers: number, decisionType: "SUSPENSION" | "REVOCATION" | "STANDARD" = "STANDARD"): { inFavor: number; against: number; abstain: number; recused: number; pass: boolean } {
  const inFavor = votes.filter(v => v.vote === "IN_FAVOR").length;
  const against = votes.filter(v => v.vote === "AGAINST").length;
  const abstain = votes.filter(v => v.vote === "ABSTAIN").length;
  const recused = votes.filter(v => v.vote === "RECUSED").length;
  const voted = inFavor + against;
  const required = getRequiredMajority(decisionType);
  const pass = voted > 0 && totalMembers > 0 && (inFavor / Math.max(voted, 1)) >= required && (inFavor + against + abstain + recused) <= totalMembers;
  return { inFavor, against, abstain, recused, pass };
}

export function requiresTwoThirdsMajority(decisionType: "SUSPENSION" | "REVOCATION" | "STANDARD"): boolean {
  return decisionType === "SUSPENSION" || decisionType === "REVOCATION";
}

export function getRequiredMajority(decisionType: "SUSPENSION" | "REVOCATION" | "STANDARD"): number {
  return requiresTwoThirdsMajority(decisionType) ? 2 / 3 : 0.5;
}
