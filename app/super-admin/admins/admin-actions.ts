"use server";

import db from "@/lib/db/index";
import { revalidatePath } from "next/cache";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { UserRole } from "@prisma/client";
import bcrypt from "bcryptjs";

const DEFAULT_ADMIN_PASSWORD = "ChangeMe123!";

async function requireSuperAdminAccess() {
  const session = await getServerSession(authOptions);
  if (!session?.user) throw new Error("Unauthorized");
  if (session.user.role !== UserRole.SUPER_ADMIN) throw new Error("Forbidden");
  return session;
}

export async function getAdmins(params?: {
  search?: string;
  role?: string | "all";
  page?: number;
  pageSize?: number;
}) {
  try {
    await requireSuperAdminAccess();

    const search = (params?.search || "").trim();
    const role = params?.role || "all";
    const page = params?.page || 1;
    const pageSize = params?.pageSize || 10;
    const skip = (page - 1) * pageSize;

    const where: any = {
      role: {
        in: [UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.REVIEWER]
      },
      deletedAt: null,
    };

    if (role !== "all") {
      if (role === "admin") where.role = UserRole.ADMIN;
      else if (role === "reviewer") where.role = UserRole.REVIEWER;
      else if (role === "super_admin") where.role = UserRole.SUPER_ADMIN;
      else if (role === "review_manager") {
        delete where.role;
        where.roles = {
          some: {
            name: { in: ["Review Manager", "REVIEW_MANAGER"] }
          }
        };
      }
    }

    if (search) {
      where.OR = [
        { firstName: { contains: search, mode: "insensitive" } },
        { lastName: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } },
      ];
    }

    const [users, totalCount] = await Promise.all([
      db.user.findMany({
        where,
        orderBy: { createdAt: "desc" },
        include: {
          roles: true,
        },
        skip,
        take: pageSize,
      }),
      db.user.count({ where })
    ]);

    return {
      success: true,
      data: users.map((u) => {
        let uiRole: "admin" | "reviewer" = "reviewer";
        if (u.role === UserRole.SUPER_ADMIN || u.role === UserRole.ADMIN) uiRole = "admin";
        
        const isReviewManager = u.roles.some(r => r.name.toLowerCase().includes("review manager") || r.name === "REVIEW_MANAGER");
        
        return {
          id: u.id,
          name: `${u.firstName} ${u.lastName}`,
          email: u.email,
          role: uiRole,
          isReviewManager,
          department: "General",
          responsibilities: u.roles.map(r => r.name),
          status: u.isSuspended ? "inactive" : "active",
          assignedTasks: 0,
          completedTasks: 0,
          joinedDate: u.createdAt.toISOString().split('T')[0]
        };
      }),
      pagination: {
        totalCount,
        totalPages: Math.ceil(totalCount / pageSize),
        currentPage: page,
        pageSize
      }
    };
  } catch (error: any) {
    console.error("getAdmins failed:", error);
    return {
      success: false,
      message: error.message || "Failed to fetch admins",
    };
  }
}

export async function updateAdminRole(
  id: string, 
  role: "admin" | "reviewer", 
  isReviewManager: boolean,
  responsibilities: string[] = []
) {
  try {
    await requireSuperAdminAccess();
    
    let dbRole: UserRole = UserRole.REVIEWER;
    if (role === "admin") dbRole = UserRole.ADMIN;
    
    // Update base user role
    await db.user.update({
      where: { id },
      data: { role: dbRole }
    });

    // Prepare all role names to be connected
    const rolesToConnect = [...responsibilities];
    if (isReviewManager && !rolesToConnect.includes("Review Manager")) {
      rolesToConnect.push("Review Manager");
    }

    // Ensure all these roles exist and get their IDs
    const roleIds = await Promise.all(rolesToConnect.map(async (name) => {
      const dbRoleRec = await db.role.upsert({
        where: { name },
        update: {},
        create: { name, description: `Role for ${name}` },
      });
      return { id: dbRoleRec.id };
    }));

    // For simplicity in this implementation, we overwrite the roles relation
    // Caution: this removes previous roles not in the list.
    await db.user.update({
      where: { id },
      data: {
        roles: {
          set: roleIds
        }
      }
    });

    revalidatePath("/super-admin/admins");
    return { success: true };
  } catch (error: any) {
    return { success: false, message: error.message };
  }
}

export async function deleteAdmin(id: string) {
  try {
    await requireSuperAdminAccess();
    await db.user.update({
      where: { id },
      data: { deletedAt: new Date() }
    });
    revalidatePath("/super-admin/admins");
    return { success: true };
  } catch (error: any) {
    return { success: false, message: error.message };
  }
}

export async function suspendAdmin(id: string, isSuspended: boolean) {
  try {
    await requireSuperAdminAccess();
    await db.user.update({
      where: { id },
      data: { isSuspended }
    });
    revalidatePath("/super-admin/admins");
    return { success: true };
  } catch (error: any) {
    return { success: false, message: error.message };
  }
}

export async function createAdmin(data: {
  email: string;
  firstName: string;
  lastName: string;
  role: "admin" | "reviewer";
  isReviewManager: boolean;
  responsibilities: string[];
}) {
  try {
    await requireSuperAdminAccess();
    
    let dbRole: UserRole = data.role === "admin" ? UserRole.ADMIN : UserRole.REVIEWER;

    const existingUser = await db.user.findUnique({
      where: { email: data.email }
    });

    if (existingUser) {
      return { success: false, message: "An account with this email already exists." };
    }

    // Prepare all role names
    const rolesToConnect = [...data.responsibilities];
    if (data.isReviewManager && !rolesToConnect.includes("Review Manager")) {
      rolesToConnect.push("Review Manager");
    }

    // Ensure all roles exist
    const roleIds = await Promise.all(rolesToConnect.map(async (name) => {
      const dbRoleRec = await db.role.upsert({
        where: { name },
        update: {},
        create: { name, description: `Role for ${name}` },
      });
      return { id: dbRoleRec.id };
    }));

    const hashedPassword = await bcrypt.hash(DEFAULT_ADMIN_PASSWORD, 10);

    const user = await db.user.create({
      data: {
        email: data.email,
        firstName: data.firstName,
        lastName: data.lastName,
        role: dbRole,
        password: hashedPassword,
        emailVerified: true,
        roles: {
          connect: roleIds
        }
      },
    });

    revalidatePath("/super-admin/admins");
    return { success: true, message: `Admin created successfully. Default password: ${DEFAULT_ADMIN_PASSWORD}` };
  } catch (error: any) {
    console.error("createAdmin failed:", error);
    return { success: false, message: error.message || "Failed to create admin" };
  }
}

