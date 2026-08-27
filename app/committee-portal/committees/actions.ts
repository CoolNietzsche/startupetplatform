"use server";

import db from "@/lib/db/index";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function getMyCommittees() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return { success: false, message: "Unauthorized" };
    }

    const userId = session.user.id;

    const committees = await db.committee.findMany({
      where: {
        status: "ACTIVE",
        members: {
          some: {
            userId: userId,
            removedAt: null,
          },
        },
      },
      include: {
        members: {
          where: { removedAt: null },
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
                role: true,
              },
            },
          },
        },
        criteria: true,
        assignments: {
          where: {
            status: { not: "CANCELLED" },
          },
        },
        ecoAssignments: {
          where: {
            active: true,
          },
        },
      },
      orderBy: {
        name: "asc",
      },
    });

    const formattedCommittees = committees.map((c) => {
      // Find the user's role in this committee
      const userMembership = c.members.find((m) => m.userId === userId);
      const role = userMembership?.memberRole === "CHAIR" ? "chair" : "member";

      const members = c.members.map((m) => ({
        id: m.userId,
        name: `${m.user.firstName} ${m.user.lastName}`,
        role: m.memberRole === "CHAIR" ? "chair" : "member",
        avatar: "",
      }));

      const criteria = c.criteria.map((crit) => ({
        id: crit.id,
        name: crit.name,
        weight: crit.weight,
      }));

      // Approximate pending vs completed assessments
      // (For a real production app, this would query evaluations/decisions, but this serves as a good proxy for the UI)
      const pendingAssessments =
        c.assignments.filter((a) => a.status !== "COMPLETED").length +
        c.ecoAssignments.filter((a) => a.active).length;

      const completedAssessments = c.assignments.filter(
        (a) => a.status === "COMPLETED"
      ).length;

      // Provide a stub for nextMeeting and recentActivity for now
      const nextMeeting = new Date().toISOString(); 
      const recentActivity: any[] = []; 

      return {
        id: c.id,
        name: c.name,
        description: c.description || "",
        role,
        members,
        pendingAssessments,
        completedAssessments,
        nextMeeting,
        criteria,
        recentActivity,
      };
    });

    return { success: true, data: formattedCommittees };
  } catch (error: any) {
    console.error("Failed to fetch my committees:", error);
    return {
      success: false,
      message: error.message || "Failed to fetch committees",
    };
  }
}
