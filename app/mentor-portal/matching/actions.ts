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

export async function getCurrentUserProfile() {
  const session = await getSession();
  const user = await db.user.findUnique({
    where: { id: session.user.id },
    select: {
      role: true,
      startup: { select: { id: true } },
    },
  });
  return {
    role: user?.role ?? null,
    startupId: user?.startup?.id ?? null,
  };
}

export async function requestMentorMatch(data: {
  startupId: string;
  mentorId?: string;
  mentorName?: string;
  message?: string;
}) {
  const session = await getSession();

  const request = await db.mentorMatchRequest.create({
    data: {
      startupId: data.startupId,
      mentorId: data.mentorId ?? null,
      mentorName: data.mentorName ?? null,
      message: data.message ?? null,
    },
  });

  await createAuditLog({
    userId: session.user.id,
    email: session.user.email ?? undefined,
    action: "MENTOR_ASSIGNED",
    resource: request.id,
    details: { action: "match_requested", ...data },
  });

  revalidatePath("/mentor-portal/matching");
  return request;
}

export async function respondToMatchRequest(requestId: string, accept: boolean) {
  const session = await getSession();
  const status = accept ? "ACCEPTED" : "DECLINED";

  const request = await db.mentorMatchRequest.update({
    where: { id: requestId },
    data: { status },
  });

  await createAuditLog({
    userId: session.user.id,
    email: session.user.email ?? undefined,
    action: "MENTOR_ASSIGNED",
    resource: requestId,
    details: { action: "match_responded", status },
  });

  revalidatePath("/mentor-portal/matching");
  return request;
}

export async function getPendingRequests(mentorId: string) {
  return db.mentorMatchRequest.findMany({
    where: { mentorId, status: "PENDING" },
    include: { startup: { select: { name: true, sector: true } } },
    orderBy: { createdAt: "desc" },
  });
}

export async function getMyRequests(startupId: string) {
  return db.mentorMatchRequest.findMany({
    where: { startupId },
    include: { mentor: { select: { id: true, firstName: true, lastName: true, email: true } } },
    orderBy: { createdAt: "desc" },
  });
}

export async function getMentorDirectory() {
  return db.user.findMany({
    where: { role: "MENTOR" },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      email: true,
      managedHub: { select: { name: true } },
    },
  });
}

export async function searchMentors(query: string) {
  return db.user.findMany({
    where: {
      role: "MENTOR",
      OR: [
        { firstName: { contains: query, mode: "insensitive" } },
        { lastName: { contains: query, mode: "insensitive" } },
        { email: { contains: query, mode: "insensitive" } },
      ],
    },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      email: true,
      managedHub: { select: { name: true } },
    },
    take: 20,
  });
}

export async function getStartupDirectory() {
  return db.startup.findMany({
    select: {
      id: true,
      name: true,
      sector: true,
      region: true,
      hub: { select: { name: true } },
    },
  });
}

export async function getAcademyDirectory() {
  return db.hub.findMany({
    select: {
      id: true,
      name: true,
      region: true,
      description: true,
      _count: { select: { startups: true } },
    },
  });
}

export async function getAcceleratorDirectory() {
  return db.hub.findMany({
    select: {
      id: true,
      name: true,
      region: true,
      description: true,
      _count: { select: { incubationPrograms: true } },
    },
  });
}
