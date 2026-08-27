"use server";

import db from "@/lib/db";
import { requireAnyPermission } from "@/lib/auth/permissions";
import { APPLICATION_VIEW_PERMISSIONS } from "@/lib/constants";

export async function getOversightStats() {
  try {
    await requireAnyPermission(APPLICATION_VIEW_PERMISSIONS);

    const committees = await db.committee.findMany({
      include: {
        members: { where: { removedAt: null } },
        assignments: {
          include: {
            evaluations: true,
            application: { select: { id: true, name: true, status: true, createdAt: true } },
          },
        },
      },
    });

    const cacMembers = await db.committeeMember.findMany({
      where: { removedAt: null, committee: { entityType: "ECOSYSTEM" } },
      include: { user: { select: { id: true, firstName: true, lastName: true, email: true } }, committee: { select: { name: true } } },
    });

    const { computeCacTermEnd, isCacMemberExpired, computeAvgCompletionDays, computePassRate, getCommitteeHealthScore, computeOverdueDays } = await import("@/lib/directive/cac-oversight");
    const { getQuorumConfig, getRequiredApprovals } = await import("@/lib/directive/quorum");

    const committeePerformance = committees.map((c) => {
      const totalAssignments = c.assignments.length;
      const completedAssignments = c.assignments.filter((a) => a.completedAt).length;
      const overdueAssignments = c.assignments.filter((a) => !a.completedAt && a.createdAt).filter((a) => computeOverdueDays(a.createdAt) > 0).length;
      const avgCompletionDays = computeAvgCompletionDays(
        c.assignments.map((a) => ({ assignedAt: a.createdAt, completedAt: a.completedAt }))
      );
      const results = c.assignments
        .flatMap((a) => a.evaluations.map((e) => e.result as "PASSED" | "FAILED"))
        .filter(Boolean);
      const passRate = computePassRate(results);
      const perf = { committeeId: c.id, committeeName: c.name, entityType: c.entityType, totalAssignments, completedAssignments, overdueAssignments, avgCompletionDays, passRate };
      const health = getCommitteeHealthScore(perf);
      return { ...perf, health, memberCount: c.members.length };
    });

    const qConfig = getQuorumConfig("CAC");
    const requiredApprovals = getRequiredApprovals(cacMembers.length, qConfig);

    const cacMemberData = cacMembers.map((m) => {
      const termEnd = computeCacTermEnd(m.addedAt);
      return {
        id: m.id,
        name: `${m.user.firstName} ${m.user.lastName}`,
        email: m.user.email,
        role: m.memberRole,
        committeeName: m.committee.name,
        termEnd: termEnd.toISOString(),
        isExpired: isCacMemberExpired(m.addedAt),
        appointedAt: m.addedAt.toISOString(),
      };
    });

    return {
      success: true as const,
      data: {
        committeePerformance,
        cacMembers: cacMemberData,
        quorumConfig: { config: qConfig, requiredApprovals },
        totalCommittees: committees.length,
        totalActiveMembers: cacMembers.length,
      },
    };
  } catch (error: any) {
    return { success: false as const, message: error.message || "Failed to load oversight data" };
  }
}
