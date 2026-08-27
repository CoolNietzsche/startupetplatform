"use server";

import db from "@/lib/db/index";
import { revalidatePath } from "next/cache";
import { requireAnyPermission } from "@/lib/auth/permissions";
import { PERMISSIONS } from "@/lib/auth/permission-codes";
import {
  SCORING_PRESETS,
  type ScoringPreset,
} from "@/lib/directive/scoring-presets";

const STORAGE_KEY = "STAGE_CRITERIA_PRESETS";
const REVALIDATE_PATH = "/super-admin/stage-criteria";

export interface StageCriterion {
  name: string;
  description: string;
  maxWeight: number;
  directiveRef: string;
}

export interface StagePresetData {
  passThreshold: number;
  criteria: StageCriterion[];
}

export type StageKey = "INITIAL" | "POST_INITIAL" | "SCALE_EXIT";

const STAGE_KEYS: StageKey[] = ["INITIAL", "POST_INITIAL", "SCALE_EXIT"];
const PRESET_MAP: Record<StageKey, string> = {
  INITIAL: "STARTUP_INITIAL",
  POST_INITIAL: "STARTUP_POST_INITIAL",
  SCALE_EXIT: "STARTUP_SCALE_EXIT",
};

function getDefaultPresets(): Record<StageKey, StagePresetData> {
  const result = {} as Record<StageKey, StagePresetData>;
  for (const key of STAGE_KEYS) {
    const preset = SCORING_PRESETS[PRESET_MAP[key]];
    result[key] = {
      passThreshold: preset?.passThreshold ?? 70,
      criteria: (preset?.criteria ?? []).map((c) => ({
        name: c.name,
        description: c.description,
        maxWeight: c.maxWeight,
        directiveRef: c.directiveRef,
      })),
    };
  }
  return result;
}

export async function getStageCriteria() {
  try {
    await requireAnyPermission([
      PERMISSIONS.ID_USER_MANAGE,
      PERMISSIONS.SYS_DASHBOARD_ACCESS,
    ]);

    const record = await db.systemConfig.findUnique({
      where: { key: STORAGE_KEY },
    });

    if (record?.value && typeof record.value === "object") {
      return { success: true as const, data: record.value as Record<StageKey, StagePresetData> };
    }

    const defaults = getDefaultPresets();
    return { success: true as const, data: defaults };
  } catch (error: any) {
    console.error("getStageCriteria failed:", error);
    return { success: false as const, message: error.message || "Failed to load stage criteria" };
  }
}

export async function saveStageCriteria(data: Record<StageKey, StagePresetData>) {
  try {
    await requireAnyPermission([
      PERMISSIONS.ID_USER_MANAGE,
      PERMISSIONS.SYS_DASHBOARD_ACCESS,
    ]);

    for (const key of STAGE_KEYS) {
      const preset = data[key];
      if (!preset || !Array.isArray(preset.criteria)) {
        return { success: false as const, message: `Invalid data for stage: ${key}` };
      }
      if (preset.criteria.length === 0) {
        return { success: false as const, message: `Stage "${key}" must have at least one criterion` };
      }
      const totalWeight = preset.criteria.reduce((sum, c) => sum + (Number(c.maxWeight) || 0), 0);
      if (totalWeight !== 100) {
        return {
          success: false as const,
          message: `Stage "${key}" criteria weights sum to ${totalWeight}, must equal 100`,
        };
      }
      if (preset.passThreshold < 0 || preset.passThreshold > 100) {
        return { success: false as const, message: `Stage "${key}" pass threshold must be 0-100` };
      }
    }

    await db.systemConfig.upsert({
      where: { key: STORAGE_KEY },
      create: {
        key: STORAGE_KEY,
        value: data as any,
        description: "Startup stage evaluation criteria presets",
      },
      update: {
        value: data as any,
      },
    });

    revalidatePath(REVALIDATE_PATH);
    return { success: true as const };
  } catch (error: any) {
    console.error("saveStageCriteria failed:", error);
    return { success: false as const, message: error.message || "Failed to save stage criteria" };
  }
}

export async function resetStageCriteria() {
  try {
    await requireAnyPermission([
      PERMISSIONS.ID_USER_MANAGE,
      PERMISSIONS.SYS_DASHBOARD_ACCESS,
    ]);

    await db.systemConfig.deleteMany({ where: { key: STORAGE_KEY } });
    revalidatePath(REVALIDATE_PATH);
    return { success: true as const };
  } catch (error: any) {
    console.error("resetStageCriteria failed:", error);
    return { success: false as const, message: error.message || "Failed to reset stage criteria" };
  }
}
