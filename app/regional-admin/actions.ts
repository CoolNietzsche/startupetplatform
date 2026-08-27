"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import db from "@/lib/db";
import { createAuditLog } from "@/lib/audit";
import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";

function getRequiredSession() {
  return getServerSession(authOptions).then(s => {
    if (!s?.user) throw new Error("Unauthorized");
    const role = (s.user as any).role;
    if (role !== "REGIONAL_ADMIN" && role !== "SUPER_ADMIN") throw new Error("Forbidden");
    return s;
  });
}

export async function getRegionalDashboardStats(hubId?: string) {
  const session = await getRequiredSession();

  const regions = await db.region.findMany();
  const hubs = hubId
    ? await db.hub.findMany({ where: { id: hubId }, include: { startups: true, incubationPrograms: true, mentorAssignments: true } })
    : await db.hub.findMany({ include: { startups: true, incubationPrograms: true, mentorAssignments: true } });

  const totalStartups = hubs.reduce((sum, h) => sum + h.startups.length, 0);
  const totalPrograms = hubs.reduce((sum, h) => sum + h.incubationPrograms.length, 0);
  const totalMentors = hubs.reduce((sum, h) => sum + h.mentorAssignments.length, 0);

  return { regions, hubs, totalStartups, totalPrograms, totalMentors };
}

export async function updateHubBranding(hubId: string, data: { name?: string; logoUrl?: string; primaryColor?: string; description?: string }) {
  const session = await getRequiredSession();
  const hub = await db.hub.update({ where: { id: hubId }, data });
  await createAuditLog({ userId: session.user.id, email: session.user.email ?? undefined, action: "HUB_UPDATED", resource: hubId, details: data });
  revalidatePath("/regional-admin/hubs");
  return hub;
}

export async function createHub(data: { name: string; region: string; description?: string }) {
  const session = await getRequiredSession();
  const hub = await db.hub.create({ data });
  await createAuditLog({ userId: session.user.id, email: session.user.email ?? undefined, action: "HUB_UPDATED", resource: hub.id, details: { action: "created", ...data } });
  revalidatePath("/regional-admin/hubs");
  return hub;
}

export async function deleteHub(hubId: string) {
  const session = await getRequiredSession();
  await db.hub.delete({ where: { id: hubId } });
  await createAuditLog({ userId: session.user.id, email: session.user.email ?? undefined, action: "HUB_UPDATED", resource: hubId, details: { action: "deleted" } });
  revalidatePath("/regional-admin/hubs");
}

export async function createHubManager(data: { email: string; firstName: string; lastName: string; phoneNumber?: string; hubId: string }) {
  const session = await getRequiredSession();

  const existing = await db.user.findUnique({ where: { email: data.email } });
  if (existing) throw new Error("Email already in use");

  const hashedPassword = await bcrypt.hash("ChangeMe123!", 10);
  const user = await db.user.create({
    data: {
      email: data.email,
      firstName: data.firstName,
      lastName: data.lastName,
      phoneNumber: data.phoneNumber || null,
      password: hashedPassword,
      role: "HUB_MANAGER",
      emailVerified: true,
      managedHub: { connect: { id: data.hubId } },
    },
  });

  await createAuditLog({ userId: session.user.id, email: session.user.email ?? undefined, action: "USER_CREATED", resource: user.id, details: { role: "HUB_MANAGER", hubId: data.hubId } });
  revalidatePath("/regional-admin/hubs");
  return { success: true, message: "Hub Manager created successfully. Default password: ChangeMe123!" };
}

export async function createMentor(data: { email: string; firstName: string; lastName: string; phoneNumber?: string; hubId: string }) {
  const session = await getRequiredSession();

  const existing = await db.user.findUnique({ where: { email: data.email } });
  if (existing) throw new Error("Email already in use");

  const hashedPassword = await bcrypt.hash("ChangeMe123!", 10);
  const user = await db.user.create({
    data: {
      email: data.email,
      firstName: data.firstName,
      lastName: data.lastName,
      phoneNumber: data.phoneNumber || null,
      password: hashedPassword,
      role: "MENTOR",
      emailVerified: true,
      hubMemberships: { connect: { id: data.hubId } },
    },
  });

  await createAuditLog({ userId: session.user.id, email: session.user.email ?? undefined, action: "USER_CREATED", resource: user.id, details: { role: "MENTOR", hubId: data.hubId } });
  revalidatePath("/regional-admin/hubs");
  return { success: true, message: "Mentor created successfully. Default password: ChangeMe123!" };
}

export async function getRegionStartups() {
  const session = await getRequiredSession();

  const hubs = await db.hub.findMany({
    include: {
      startups: { include: { application: { select: { industry: true } } } },
    },
  });

  const startups = hubs.flatMap(h =>
    h.startups.map(s => ({
      id: s.id,
      name: s.name,
      hubId: s.hubId,
      industry: (s as any).application?.industry ?? null,
      sector: (s as any).sector ?? null,
      region: (s as any).region ?? null,
      innovationType: (s as any).innovationType ?? null,
      createdAt: s.createdAt,
      hubName: hubs.find(hh => hh.id === s.hubId)?.name ?? "Unassigned",
    }))
  );

  return { startups, hubs };
}

export async function assignStartupToHub(startupId: string, hubId: string | null) {
  const session = await getRequiredSession();

  const data = hubId ? { hub: { connect: { id: hubId } } } : { hub: { disconnect: true } };
  await db.startup.update({ where: { id: startupId }, data });

  await createAuditLog({ userId: session.user.id, email: session.user.email ?? undefined, action: "HUB_UPDATED", resource: startupId, details: { action: "startup_assigned", hubId } });
  revalidatePath("/regional-admin/startups");
  return { success: true };
}
