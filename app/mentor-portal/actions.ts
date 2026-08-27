"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import db from "@/lib/db";
import { createAuditLog } from "@/lib/audit";
import { revalidatePath } from "next/cache";

async function getSession() {
  const session = await getServerSession(authOptions);
  if (!session?.user) throw new Error("Unauthorized");
  return session as typeof session & { user: { id: string; email: string } };
}

export async function getMentorDashboardData() {
  const session = await getSession();

  const user = await db.user.findUnique({
    where: { id: session.user.id },
    include: { mentorStartups: true, hubMemberships: { include: { mentorAssignments: { where: { mentorId: session.user.id } } } } },
  });

  const mentorAssignments = await db.mentorAssignment.findMany({
    where: { mentorId: session.user.id },
    include: { hub: true, program: true },
  });

  return { user, mentorAssignments };
}

export interface MentorSessionData {
  startupId: string;
  date: string;
  duration: number;
  topicsCovered: string;
  outcomes: string;
  nextSteps?: string;
}

export async function logMentorSession(data: MentorSessionData) {
  const session = await getSession();

  const log = await db.mentorSession.create({
    data: {
      mentorId: session.user.id,
      startupId: data.startupId,
      date: new Date(data.date),
      duration: data.duration,
      topicsCovered: data.topicsCovered,
      outcomes: data.outcomes,
      nextSteps: data.nextSteps || null,
    },
  });

  await createAuditLog({ userId: session.user.id, email: session.user.email, action: "MENTOR_ASSIGNED", resource: log.id, details: { action: "session_logged", startupId: data.startupId } });
  revalidatePath("/mentor-portal");
  return log;
}

export async function getMentorSessions() {
  const session = await getSession();

  return db.mentorSession.findMany({
    where: { mentorId: session.user.id },
    include: { startup: { select: { name: true } } },
    orderBy: { date: "desc" },
  });
}
