export interface CacMember {
  userId: string;
  name: string;
  role: "CHAIR" | "MEMBER";
  appointedAt: Date;
  termEnd: Date;
}

export interface CommitteePerformance {
  committeeId: string;
  committeeName: string;
  entityType: string;
  totalAssignments: number;
  completedAssignments: number;
  overdueAssignments: number;
  avgCompletionDays: number;
  passRate: number;
}

const CAC_TERM_YEARS = 3;

export function computeCacTermEnd(appointedAt: Date): Date {
  const end = new Date(appointedAt);
  end.setFullYear(end.getFullYear() + CAC_TERM_YEARS);
  return end;
}

export function isCacMemberExpired(appointedAt: Date): boolean {
  return new Date() > computeCacTermEnd(appointedAt);
}

export function computeOverdueDays(assignedAt: Date, slaDays: number = 30): number {
  const deadline = new Date(assignedAt.getTime() + slaDays * 24 * 60 * 60 * 1000);
  if (new Date() <= deadline) return 0;
  return Math.ceil((new Date().getTime() - deadline.getTime()) / (1000 * 60 * 60 * 24));
}

export function computeAvgCompletionDays(timeline: { assignedAt: Date; completedAt?: Date | null }[]): number {
  const completed = timeline.filter(t => t.completedAt);
  if (completed.length === 0) return 0;
  const totalDays = completed.reduce((sum, t) => {
    return sum + Math.ceil((t.completedAt!.getTime() - t.assignedAt.getTime()) / (1000 * 60 * 60 * 24));
  }, 0);
  return Math.round(totalDays / completed.length);
}

export function computePassRate(results: ("PASSED" | "FAILED")[]): number {
  if (results.length === 0) return 0;
  const passed = results.filter(r => r === "PASSED").length;
  return Math.round((passed / results.length) * 100);
}

export function getCommitteeHealthScore(perf: CommitteePerformance): "HEALTHY" | "WARNING" | "CRITICAL" {
  if (perf.overdueAssignments > 3 || perf.avgCompletionDays > 45) return "CRITICAL";
  if (perf.overdueAssignments > 1 || perf.avgCompletionDays > 30) return "WARNING";
  return "HEALTHY";
}
