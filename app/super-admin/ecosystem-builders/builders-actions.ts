"use server";

import db from "@/lib/db/index";
import { revalidatePath } from "next/cache";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { requireAnyPermission } from "@/lib/auth/permissions";
import { PERMISSIONS } from "@/lib/auth/permission-codes";

async function requireSuperAdminAccess() {
  const session = await getServerSession(authOptions);
  if (!session?.user) throw new Error("Unauthorized");
  if ((session.user as any).role !== "SUPER_ADMIN") throw new Error("Forbidden: Super Admin access required");
  await requireAnyPermission([PERMISSIONS.SYS_DASHBOARD_ACCESS]);
}

export async function getCertifiedEcosystemBuilders(params?: {
  search?: string;
  type?: string | "all";
  region?: string | "all";
}) {
  try {
    await requireSuperAdminAccess();

    const search = (params?.search || "").trim();
    const type = params?.type || "all";
    const region = params?.region || "all";

    const where: any = {
      certified: true,
      deletedAt: null,
    };

    if (type !== "all") where.type = type;
    if (region !== "all") where.region = region;

    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { city: { contains: search, mode: "insensitive" } },
        { contactName: { contains: search, mode: "insensitive" } },
        { contactEmail: { contains: search, mode: "insensitive" } },
      ];
    }

    const builders = await db.ecosystemBuilder.findMany({
      where,
      orderBy: { name: "asc" },
      include: {
        ecoApplications: {
          where: { status: "CERTIFIED" },
          orderBy: { createdAt: "desc" },
          take: 1,
        },
      },
    });

    return {
      success: true,
      data: builders.map((b) => ({
        id: b.id,
        name: b.name,
        type: b.type,
        region: b.region,
        city: b.city || b.location,
        establishedDate: b.established ? `${b.established}-01-01` : null,
        status: "Active", // If in this list, they are certified/active
        startupsSupported: b.capacity || 0, // Mapping capacity to startupsSupported for now as a proxy
        programsOffered: Array.isArray(b.services) ? b.services.length : 0,
        contactPerson: b.contactName || "N/A",
        email: b.contactEmail || "N/A",
        phone: b.contactPhone || "N/A",
        website: b.website || "N/A",
        focusAreas: [], // Not explicitly in model yet, could be from description
        services: Array.isArray(b.services) ? (b.services as string[]) : [],
      })),
    };
  } catch (error: any) {
    console.error("getCertifiedEcosystemBuilders failed:", error);
    return {
      success: false,
      message: error.message || "Failed to fetch ecosystem builders",
    };
  }
}

export async function suspendEcosystemBuilder(id: string) {
  try {
    await requireSuperAdminAccess();
    // For now, let's just mark it as uncertified or add a status field if we had one.
    // For now, we'll use 'certified: false' as a way to "suspend" from the certified list.
    await db.ecosystemBuilder.update({
      where: { id },
      data: { certified: false },
    });
    revalidatePath("/super-admin/ecosystem-builders");
    return { success: true };
  } catch (error: any) {
    return { success: false, message: error.message };
  }
}

export async function revokeEcosystemBuilderStatus(id: string) {
  try {
    await requireSuperAdminAccess();
    // Permanent revoke = soft delete or just removing certification
    await db.ecosystemBuilder.update({
      where: { id },
      data: { 
        certified: false,
        deletedAt: new Date() // Soft delete
      },
    });
    revalidatePath("/super-admin/ecosystem-builders");
    return { success: true };
  } catch (error: any) {
    return { success: false, message: error.message };
  }
}

export async function createEcosystemBuilder(data: {
  name: string;
  type: string;
  contactPerson: string;
  email: string;
  phone: string;
  website?: string;
  region: string;
  city: string;
  description: string;
  services: string[];
}) {
  try {
    await requireSuperAdminAccess();

    const builder = await db.ecosystemBuilder.create({
      data: {
        name: data.name,
        type: data.type,
        contactName: data.contactPerson,
        contactEmail: data.email,
        contactPhone: data.phone,
        website: data.website || null,
        region: data.region,
        city: data.city,
        location: data.city, // usually location is used for city search
        description: data.description,
        services: data.services,
        certified: true, // If Super Admin adds them directly, they are likely certified
      },
    });

    revalidatePath("/super-admin/ecosystem-builders");
    return { success: true, data: builder };
  } catch (error: any) {
    console.error("createEcosystemBuilder failed:", error);
    return { success: false, message: error.message };
  }
}
