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

export async function getHubDashboardData() {
  const session = await getSession();

  const user = await db.user.findUnique({
    where: { id: session.user.id },
    include: { managedHub: { include: { startups: { include: { application: true } }, incubationPrograms: { include: { mentorAssignments: true, progress: true } }, mentorAssignments: true } } },
  });

  return { hub: user?.managedHub || null };
}

export async function createIncubationProgram(data: { hubId: string; name: string; description?: string; startDate?: string; endDate?: string; capacity?: number; assignedTrainer?: string }) {
  const session = await getSession();
  const program = await db.incubationProgram.create({
    data: { ...data, startDate: data.startDate ? new Date(data.startDate) : undefined, endDate: data.endDate ? new Date(data.endDate) : undefined, capacity: data.capacity || undefined },
  });
  await createAuditLog({ userId: session.user.id, email: session.user.email, action: "PROGRAM_CREATED", resource: program.id, details: data });
  revalidatePath("/hub-portal");
  return program;
}

export async function assignMentor(data: { hubId: string; programId?: string; mentorName: string; mentorEmail?: string; startupId?: string; focusArea?: string }) {
  const session = await getSession();
  const assignment = await db.mentorAssignment.create({ data });
  await createAuditLog({ userId: session.user.id, email: session.user.email, action: "MENTOR_ASSIGNED", resource: assignment.id, details: data });
  revalidatePath("/hub-portal");
  return assignment;
}

export async function updateProgress(progressId: string, data: { stage?: string; progress?: number; notes?: string }) {
  await getSession();
  return db.incubationProgress.update({ where: { id: progressId }, data });
}

export async function getStartups() {
  await getSession();
  return db.startup.findMany({ include: { application: true, hub: true } });
}

export async function enrollStartup(programId: string, startupId: string) {
  const session = await getSession();

  const existing = await db.incubationProgress.findFirst({ where: { programId, startupId } });
  if (existing) throw new Error("Startup already enrolled in this program");

  const progress = await db.incubationProgress.create({ data: { programId, startupId, stage: "ONBOARDING", progress: 0 } });
  await createAuditLog({ userId: session.user.id, email: session.user.email, action: "PROGRAM_CREATED", resource: progress.id, details: { action: "enrolled", programId, startupId } });
  revalidatePath("/hub-portal");
  return progress;
}
