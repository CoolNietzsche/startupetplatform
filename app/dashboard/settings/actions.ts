'use server'

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import db from "@/lib/db";

export async function updateProfileAction(data: {
  firstName: string;
  lastName: string;
  phoneNumber: string;
  address: string;
  image?: string | null;
}) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return { success: false, message: "Unauthorized" };
  }

  try {
    await db.user.update({
      where: { id: session.user.id },
      data: {
        firstName: data.firstName,
        lastName: data.lastName,
        phoneNumber: data.phoneNumber,
        address: data.address,
        ...(data.image !== undefined && { image: data.image }),
      },
    });
    return { success: true, message: "Profile updated successfully" };
  } catch (error) {
    console.error("Update profile error:", error);
    return { success: false, message: "Failed to update profile" };
  }
}

export async function toggle2FAAction(enabled: boolean) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return { success: false, message: "Unauthorized" };
  }

  try {
    await db.user.update({
      where: { id: session.user.id },
      data: { twoStepAuthEnabled: enabled },
    });
    return { success: true, message: enabled ? "Two-factor authentication enabled" : "Two-factor authentication disabled" };
  } catch (error) {
    console.error("Toggle 2FA error:", error);
    return { success: false, message: "Failed to update 2FA settings" };
  }
}
