"use server";

import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";

export async function getSystemSettings() {
  try {
    const settings = await db.systemConfig.findMany();
    
    // Map array of rows to an object keyed by the 'key'
    const settingsMap = settings.reduce((acc: Record<string, any>, curr: any) => {
      acc[curr.key] = curr.value;
      return acc;
    }, {});

    return {
      success: true,
      settings: settingsMap
    };
  } catch (error) {
    console.error("[SETTINGS_GET] ERROR:", error);
    return { success: false, error: "Critical failure during node recovery." };
  }
}

export async function updateSettingsGroup(key: string, value: any) {
  try {
    await db.systemConfig.upsert({
      where: { key },
      update: { value, updatedAt: new Date() },
      create: { key, value }
    });
    
    revalidatePath("/super-admin/settings");
    return { success: true };
  } catch (error) {
    console.error(`[SETTINGS_UPDATE] [${key}] ERROR:`, error);
    return { success: false, error: `Protocol mismatch on ${key} synchronization.` };
  }
}

export async function updateAllSettings(allSettings: Record<string, any>) {
  try {
    // Using sequential updates for maximum integrity
    for (const [key, value] of Object.entries(allSettings)) {
      await db.systemConfig.upsert({
        where: { key },
        update: { value, updatedAt: new Date() },
        create: { key, value }
      });
    }
    
    revalidatePath("/super-admin/settings");
    return { success: true };
  } catch (error) {
    console.error("[SETTINGS_SYNC] ERROR:", error);
    return { success: false, error: "Global state synchronization failure." };
  }
}
