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

export async function getHubAssets(hubId: string) {
  await getSession();
  return db.asset.findMany({
    where: { hubId },
    include: { bookings: true },
  });
}

export async function createAsset(data: {
  hubId: string;
  name: string;
  type: string;
  description?: string;
  quantity?: number;
  status?: string;
}) {
  const session = await getSession();
  const asset = await db.asset.create({ data });
  await createAuditLog({
    userId: session.user.id,
    email: session.user.email ?? undefined,
    action: "ASSET_CREATED",
    resource: asset.id,
    details: data,
  });
  revalidatePath("/hub-portal/assets");
  return asset;
}

export async function updateAsset(
  assetId: string,
  data: { name?: string; type?: string; description?: string; quantity?: number; status?: string }
) {
  const session = await getSession();
  const asset = await db.asset.update({ where: { id: assetId }, data });
  await createAuditLog({
    userId: session.user.id,
    email: session.user.email ?? undefined,
    action: "ASSET_UPDATED",
    resource: asset.id,
    details: data,
  });
  revalidatePath("/hub-portal/assets");
  return asset;
}

export async function deleteAsset(assetId: string) {
  const session = await getSession();
  await db.asset.delete({ where: { id: assetId } });
  await createAuditLog({
    userId: session.user.id,
    email: session.user.email ?? undefined,
    action: "ASSET_DELETED",
    resource: assetId,
  });
  revalidatePath("/hub-portal/assets");
}

export async function bookAsset(data: {
  assetId: string;
  startupId: string;
  startDate: string;
  endDate: string;
}) {
  const session = await getSession();
  const booking = await db.assetBooking.create({
    data: {
      assetId: data.assetId,
      startupId: data.startupId,
      startDate: new Date(data.startDate),
      endDate: new Date(data.endDate),
    },
  });
  await createAuditLog({
    userId: session.user.id,
    email: session.user.email ?? undefined,
    action: "ASSET_BOOKED",
    resource: booking.id,
    details: data,
  });
  revalidatePath("/hub-portal/assets");
  return booking;
}

export async function approveBooking(bookingId: string) {
  const session = await getSession();
  const booking = await db.assetBooking.update({
    where: { id: bookingId },
    data: { status: "APPROVED" },
  });
  await createAuditLog({
    userId: session.user.id,
    email: session.user.email ?? undefined,
    action: "BOOKING_APPROVED",
    resource: booking.id,
  });
  revalidatePath("/hub-portal/assets");
  return booking;
}

export async function cancelBooking(bookingId: string) {
  const session = await getSession();
  const booking = await db.assetBooking.update({
    where: { id: bookingId },
    data: { status: "CANCELLED" },
  });
  await createAuditLog({
    userId: session.user.id,
    email: session.user.email ?? undefined,
    action: "BOOKING_CANCELLED",
    resource: booking.id,
  });
  revalidatePath("/hub-portal/assets");
  return booking;
}

export async function getAvailableAssets(hubId: string) {
  await getSession();
  return db.asset.findMany({
    where: { hubId, status: "AVAILABLE" },
    include: { bookings: true },
  });
}
