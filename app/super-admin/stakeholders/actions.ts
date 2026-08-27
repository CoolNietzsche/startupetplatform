"use server";

import db from "@/lib/db/index";
import { revalidatePath } from "next/cache";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import bcrypt from "bcryptjs";
import { requireAnyPermission } from "@/lib/auth/permissions";
import { PERMISSIONS } from "@/lib/auth/permission-codes";

async function requireAccess(targetStakeholderId?: string) {
  const session = await getServerSession(authOptions);
  if (!session?.user) throw new Error("Unauthorized");

  // Allow Super Admins globally
  if (session.user.role === 'SUPER_ADMIN') return session;

  // Allow Stakeholders only for their own organization
  if (session.user.role === 'STAKEHOLDER') {
    if (targetStakeholderId && session.user.stakeholderId !== targetStakeholderId) {
      throw new Error("Access denied to this organization");
    }
    return session;
  }

  // Fallback to permission check for other admin roles
  await requireAnyPermission([PERMISSIONS.SYS_DASHBOARD_ACCESS, PERMISSIONS.ID_USER_MANAGE]);
  return session;
}

export async function getStakeholders(params?: {
  search?: string;
  type?: string | "all";
  status?: string | "all";
}) {
  try {
    const session = await requireAccess();

    const search = params?.search || "";
    const type = params?.type || "all";
    const status = params?.status || "all";

    const where: any = {};
    
    // If stakeholder, restrict to their own ID
    if (session.user.role === 'STAKEHOLDER' && session.user.stakeholderId) {
      where.id = session.user.stakeholderId;
    }

    if (type !== "all") where.type = type;
    if (status !== "all") where.status = status;
    
    // ... rest of the logic

    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
      ];
    }

    const stakeholders = await db.stakeholder.findMany({
      where,
      include: {
        admins: true,
      },
      orderBy: { createdAt: "desc" },
    });

    return {
      success: true,
      data: stakeholders.map(s => ({
        id: s.id,
        name: s.name,
        type: s.type,
        description: s.description || "",
        website: s.website || "",
        email: s.email || "",
        phone: s.phone || "",
        address: s.address || "",
        region: s.region || "",
        status: s.status as "active" | "inactive" | "pending",
        portalAccess: s.portalAccess,
        createdAt: s.createdAt.toISOString().split('T')[0],
        admins: s.admins.map(a => ({
          id: a.id,
          name: `${a.firstName} ${a.lastName}`,
          email: a.email,
          role: "Stakeholder Admin", // Default label
          addedDate: a.createdAt.toISOString().split('T')[0],
        })),
        dashboardUrl: `/stakeholder/${s.id}`,
      })),
    };
  } catch (error: any) {
    console.error("getStakeholders failed:", error);
    return { success: false, message: error.message };
  }
}

export async function createStakeholder(data: any) {
  try {
    await requireAccess();

    const stakeholder = await db.stakeholder.create({
      data: {
        name: data.name,
        type: data.type,
        description: data.description,
        website: data.website,
        email: data.email,
        phone: data.phone,
        address: data.address,
        region: data.region,
        status: data.status || "pending",
        portalAccess: data.portalAccess || false,
      },
    });

    revalidatePath("/super-admin/stakeholders");
    return { success: true, data: stakeholder };
  } catch (error: any) {
    return { success: false, message: error.message };
  }
}

export async function updateStakeholder(id: string, data: any) {
  try {
    await requireAccess(id);

    const stakeholder = await db.stakeholder.update({
      where: { id },
      data: {
        name: data.name,
        type: data.type,
        description: data.description,
        website: data.website,
        email: data.email,
        phone: data.phone,
        address: data.address,
        region: data.region,
        status: data.status,
        portalAccess: data.portalAccess,
      },
    });

    revalidatePath("/super-admin/stakeholders");
    return { success: true, data: stakeholder };
  } catch (error: any) {
    return { success: false, message: error.message };
  }
}

export async function deleteStakeholder(id: string) {
  try {
    const session = await requireAccess(id);
    if (session.user.role !== 'SUPER_ADMIN') throw new Error("Only Super Admins can delete stakeholders");

    await db.stakeholder.delete({
      where: { id },
    });

    revalidatePath("/super-admin/stakeholders");
    return { success: true };
  } catch (error: any) {
    return { success: false, message: error.message };
  }
}

export async function toggleStakeholderPortalAccess(id: string, currentStatus: boolean) {
  try {
    await requireAccess(id);

    await db.stakeholder.update({
      where: { id },
      data: { portalAccess: !currentStatus },
    });

    revalidatePath("/super-admin/stakeholders");
    return { success: true };
  } catch (error: any) {
    return { success: false, message: error.message };
  }
}

export async function addStakeholderAdmin(stakeholderId: string, userData: any) {
  try {
    await requireAccess(stakeholderId);

    // Check if user already exists
    let user = await db.user.findUnique({
      where: { email: userData.email },
    });

    if (user) {
      // Update existing user to be a stakeholder admin
      user = await db.user.update({
        where: { email: userData.email },
        data: {
          stakeholderId: stakeholderId,
          role: "STAKEHOLDER",
        },
      });
      
      // Also update password if provided
      if (userData.password) {
        const hashedPassword = await bcrypt.hash(userData.password, 10);
        await db.user.update({
          where: { id: user.id },
          data: { password: hashedPassword }
        });
      }
    } else {
      // Create a new user as a stakeholder admin
      if (!userData.password) {
        throw new Error("Password is required for new users.");
      }
      
      const hashedPassword = await bcrypt.hash(userData.password, 10);
      const names = (userData.name || userData.email.split('@')[0]).split(' ');
      const firstName = names[0];
      const lastName = names.slice(1).join(' ') || "Admin";

      await db.user.create({
        data: {
          email: userData.email,
          firstName,
          lastName,
          password: hashedPassword,
          role: "STAKEHOLDER",
          stakeholderId: stakeholderId,
          onboardingCompleted: true,
          emailVerified: true
        }
      });
    }

    revalidatePath("/super-admin/stakeholders");
    return { success: true };
  } catch (error: any) {
    return { success: false, message: error.message };
  }
}

export async function removeStakeholderAdmin(adminId: string) {
  try {
    // Find user first to get their stakeholderId
    const user = await db.user.findUnique({ where: { id: adminId } });
    if (!user) throw new Error("User not found");
    
    const session = await requireAccess(user.stakeholderId || undefined);
    if (session.user.role !== 'SUPER_ADMIN') throw new Error("Only Super Admins can remove coordinators");

    await db.user.update({
      where: { id: adminId },
      data: {
        stakeholderId: null,
        role: "USER", // Revert to standard user
      },
    });

    revalidatePath("/super-admin/stakeholders");
    return { success: true };
  } catch (error: any) {
    return { success: false, message: error.message };
  }
}

export async function resetStakeholderAdminPassword(adminId: string, newPassword: string) {
  try {
    const user = await db.user.findUnique({ where: { id: adminId } });
    if (!user) throw new Error("User not found");
    
    await requireAccess(user.stakeholderId || undefined);

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    
    await db.user.update({
      where: { id: adminId },
      data: { password: hashedPassword }
    });

    return { success: true, message: "Password updated successfully" };
  } catch (error: any) {
    return { success: false, message: error.message };
  }
}

export async function updateStakeholderStatus(id: string, status: string) {
  try {
    const session = await requireAccess(id);
    if (session.user.role !== 'SUPER_ADMIN') throw new Error("Only Super Admins can suspend institutions");

    await db.stakeholder.update({
      where: { id },
      data: { status },
    });

    revalidatePath("/super-admin/stakeholders");
    revalidatePath("/stakeholder");
    return { success: true };
  } catch (error: any) {
    return { success: false, message: error.message };
  }
}
