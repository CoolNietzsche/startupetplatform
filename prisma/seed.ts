import db from "../lib/db/index";
import bcrypt from "bcryptjs";
import { Prisma, UserRole } from "@prisma/client";

const prisma = db;

type SeedUserInput = Prisma.UserCreateInput & { id?: string; stakeholderId?: string };

function isMissingTableError(error: unknown, modelName?: string): boolean {
  if ((error as { code?: string } | null)?.code !== "P2021") {
    return false;
  }

  const prismaMeta = (error as { meta?: { modelName?: string } } | null)?.meta;
  if (!modelName) {
    return true;
  }

  return prismaMeta?.modelName === modelName;
}

function isMissingColumnError(error: unknown, modelName?: string): boolean {
  if ((error as { code?: string } | null)?.code !== "P2022") {
    return false;
  }

  const prismaMeta = (error as { meta?: { modelName?: string } } | null)?.meta;
  if (!modelName) {
    return true;
  }

  return prismaMeta?.modelName === modelName;
}

async function ensureUser(email: string, data: SeedUserInput) {
  try {
    const rawRoleConnect = data.roles && "connect" in data.roles
      ? Array.isArray(data.roles.connect)
        ? data.roles.connect
        : [data.roles.connect]
      : [];

    const roleConnect: Prisma.RoleWhereUniqueInput[] = rawRoleConnect.filter(
      (role): role is Prisma.RoleWhereUniqueInput => Boolean(role),
    );

    return await prisma.user.upsert({
      where: { email },
      update: {
        firstName: data.firstName,
        lastName: data.lastName,
        password: data.password,
        role: data.role,
        stakeholderId: data.stakeholderId,
        emailVerified: data.emailVerified,
        roles: roleConnect.length > 0
          ? {
              set: [],
              connect: roleConnect,
            }
          : undefined,
      },
      create: data,
    });
  } catch (error) {
    if (isMissingTableError(error, "User")) {
      console.warn("Skipping user seed: user.User table does not exist in the current database.");
      throw error;
    }

    throw error;
  }
}

async function ensureApplication(id: string, data: Prisma.ApplicationUncheckedCreateInput) {
  try {
    return await prisma.application.upsert({
      where: { id },
      update: data,
      create: data,
    });
  } catch (error) {
    if (isMissingTableError(error, "Application")) {
      console.warn("Skipping application seed: application.Application table does not exist in the current database.");
      return null;
    }

    if (isMissingColumnError(error, "Application")) {
      console.warn("Skipping application seed: application.Application columns are out of sync with the current database.");
      return null;
    }

    throw error;
  }
}

async function main() {
  console.log("Starting Advanced Stakeholder Matrix seed process...");
  const defaultPassword = await bcrypt.hash("password123", 10);

  // 1. Comprehensive Permissions Matrix
  const permissionsData = [
    // Identity & Access Management
    {
      code: "ID_USER_VIEW",
      name: "View Identities",
      description: "Access the list of all system users",
      category: "Identity",
    },
    {
      code: "ID_USER_MANAGE",
      name: "Manage Identities",
      description: "Create, edit, and archive user accounts",
      category: "Identity",
    },
    {
      code: "ID_ROLE_MANAGE",
      name: "Manage Authority Matrix",
      description: "Define roles and assign permission codes",
      category: "Identity",
    },

    // Application Lifecycle
    {
      code: "OPS_APP_SUBMIT",
      name: "Submit Application",
      description: "Initialize and submit startup certification requests",
      category: "Operations",
    },
    {
      code: "OPS_APP_TRACK",
      name: "Track Application",
      description: "Monitor live status of certification process",
      category: "Operations",
    },
    {
      code: "OPS_APP_VIEW_ALL",
      name: "View All Applications",
      description: "Access records for all startup submissions",
      category: "Operations",
    },
    {
      code: "OPS_APP_REVIEW",
      name: "Perform Review",
      description: "Score, comment, and assess assigned applications",
      category: "Operations",
    },
    {
      code: "OPS_APP_DECISION",
      name: "Final Decision",
      description: "Grant final approval or rejection for certifications",
      category: "Operations",
    },

    // Content & Growth
    {
      code: "GROW_OPP_MANAGE",
      name: "Manage Opportunities",
      description: "Create and curate ecosystem growth programs",
      category: "Growth",
    },
    {
      code: "GROW_CONTENT_MANAGE",
      name: "Manage Portal Content",
      description: "Update portal news, feeds, and informational pages",
      category: "Growth",
    },
    {
      code: "GROW_ANALYTICS_VIEW",
      name: "View System Analytics",
      description: "Access high-level data dashboards and reports",
      category: "Growth",
    },

    // System & Configuration
    {
      code: "SYS_SETTINGS_MANAGE",
      name: "System Settings",
      description: "Modify global variables and system-wide rules",
      category: "System",
    },
    {
      code: "SYS_DASHBOARD_ACCESS",
      name: "Administrative Dashboard",
      description: "Access the central management console",
      category: "System",
    },
    {
      code: "SYS_LOGS_VIEW",
      name: "View Audit Logs",
      description: "Monitor system interactions and security events",
      category: "System",
    },
  ];

  console.log("Initializing Advanced Permissions Table...");
  try {
    for (const p of permissionsData) {
      await prisma.permission.upsert({
        where: { code: p.code },
        update: p,
        create: p,
      });
    }
  } catch (error) {
    if (isMissingTableError(error, "Permission")) {
      console.warn("Skipping stakeholder seed: user.Permission table does not exist in the current database.");
      return;
    }

    throw error;
  }
  console.log(`${permissionsData.length} modular permissions synchronized.`);

  // 2. Default Stakeholder Role Definitions
  const rolesData = [
    {
      name: "SUPER_ADMIN",
      description: "Full system-wide master authority with unrestricted access",
      permissionCodes: permissionsData.map((p) => p.code),
    },
    {
      name: "ADMIN",
      description: "Administrative role for managing operations and identities",
      permissionCodes: [
        "ID_USER_VIEW",
        "ID_USER_MANAGE",
        "OPS_APP_VIEW_ALL",
        "SYS_DASHBOARD_ACCESS",
        "SYS_LOGS_VIEW",
      ],
    },
    {
      name: "REVIEWER",
      description: "Review role for assessing submitted applications",
      permissionCodes: [
        "OPS_APP_REVIEW",
        "OPS_APP_VIEW_ALL",
        "SYS_DASHBOARD_ACCESS",
      ],
    },
    {
      name: "COMMITTEE",
      description: "Committee member role for certification review and evaluation",
      permissionCodes: [
        "OPS_APP_REVIEW",
        "OPS_APP_VIEW_ALL",
        "SYS_DASHBOARD_ACCESS",
        "GROW_ANALYTICS_VIEW",
      ],
    },
    {
      name: "ECOSYSTEM_BUILDER",
      description: "Ecosystem builder role for builder-side platform participation",
      permissionCodes: [
        "OPS_APP_SUBMIT",
        "OPS_APP_TRACK",
        "SYS_DASHBOARD_ACCESS",
      ],
    },
    {
      name: "USER",
      description: "General user role for standard platform access",
      permissionCodes: [
        "OPS_APP_SUBMIT",
        "OPS_APP_TRACK",
        "SYS_DASHBOARD_ACCESS",
      ],
    },
    {
      name: "STAKEHOLDER",
      description: "Government stakeholder role for monitoring and reporting",
      permissionCodes: [
        "GROW_ANALYTICS_VIEW",
        "OPS_APP_VIEW_ALL",
        "SYS_DASHBOARD_ACCESS",
      ],
    },
  ];

  console.log("Pushing default Stakeholder Roles...");
  try {
    for (const r of rolesData) {
      const existingRole = await prisma.role.findUnique({
        where: { name: r.name },
      });

      if (existingRole) {
        await prisma.role.update({
          where: { name: r.name },
          data: {
            description: r.description,
            permissions: {
              set: [],
              connect: r.permissionCodes.map((code) => ({ code })),
            },
          },
        });
      } else {
        await prisma.role.create({
          data: {
            name: r.name,
            description: r.description,
            permissions: {
              connect: r.permissionCodes.map((code) => ({ code })),
            },
          },
        });
      }
    }
  } catch (error) {
    if (isMissingTableError(error, "Role")) {
      console.warn("Skipping stakeholder role seed: user.Role table does not exist in the current database.");
      return;
    }

    throw error;
  }
  console.log(" stakeholder roles fully initialized with granular mapping.");

  // 3. Ensure Primary Admin Account
  const adminEmail = "admin@example.com";
  let superAdminRole = null;
  let adminRole = null;
  let reviewerRole = null;
  let committeeRole = null;
  let ecosystemBuilderRole = null;
  let userRoleRecord = null;

  try {
    const [superAdmin, admin, reviewer, committee, ecosystemBuilder, userRole] = await Promise.all([
      prisma.role.findUnique({ where: { name: "SUPER_ADMIN" } }),
      prisma.role.findUnique({ where: { name: "ADMIN" } }),
      prisma.role.findUnique({ where: { name: "REVIEWER" } }),
      prisma.role.findUnique({ where: { name: "COMMITTEE" } }),
      prisma.role.findUnique({ where: { name: "ECOSYSTEM_BUILDER" } }),
      prisma.role.findUnique({ where: { name: "USER" } }),
    ]);

    superAdminRole = superAdmin;
    adminRole = admin;
    reviewerRole = reviewer;
    committeeRole = committee;
    ecosystemBuilderRole = ecosystemBuilder;
    userRoleRecord = userRole;
  } catch (error) {
    if (isMissingTableError(error, "Role")) {
      console.warn("Skipping admin seed: user.Role table does not exist in the current database.");
      return;
    }

    throw error;
  }

  if (superAdminRole) {
    await ensureUser(adminEmail, {
      id: "admin-user-id",
      email: adminEmail,
      password: defaultPassword,
      firstName: "System",
      lastName: "Administrator",
      role: "SUPER_ADMIN",
      emailVerified: true,
      roles: {
        connect: { id: superAdminRole.id },
      },
    });
    console.log("Primary Master Identity connected to Super Admin role.");
  }

  const usersBySeedRole = {
    SUPER_ADMIN: {
      enumRole: "SUPER_ADMIN" as UserRole,
      relationRole: superAdminRole,
      users: [
      { email: "admin@example.com", firstName: "System", lastName: "Administrator" },
      { email: "superadmin1@example.com", firstName: "Super", lastName: "Admin One" },
      { email: "superadmin2@example.com", firstName: "Super", lastName: "Admin Two" },
      { email: "superadmin3@example.com", firstName: "Super", lastName: "Admin Three" },
      { email: "superadmin4@example.com", firstName: "Super", lastName: "Admin Four" },
      ],
    },
    ADMIN: {
      enumRole: "ADMIN" as UserRole,
      relationRole: adminRole,
      users: [
      { email: "admin.role1@example.com", firstName: "Admin", lastName: "Role One" },
      { email: "admin.role2@example.com", firstName: "Admin", lastName: "Role Two" },
      { email: "admin.role3@example.com", firstName: "Admin", lastName: "Role Three" },
      { email: "admin.role4@example.com", firstName: "Admin", lastName: "Role Four" },
      { email: "admin.role5@example.com", firstName: "Admin", lastName: "Role Five" },
      ],
    },
    REVIEWER: {
      enumRole: "REVIEWER" as UserRole,
      relationRole: reviewerRole,
      users: [
      { email: "reviewer1@example.com", firstName: "Review", lastName: "One" },
      { email: "reviewer2@example.com", firstName: "Review", lastName: "Two" },
      { email: "reviewer3@example.com", firstName: "Review", lastName: "Three" },
      { email: "reviewer4@example.com", firstName: "Review", lastName: "Four" },
      { email: "reviewer5@example.com", firstName: "Review", lastName: "Five" },
      ],
    },
    COMMITTEE: {
      enumRole: "COMMITTEE" as UserRole,
      relationRole: committeeRole,
      users: [
        { email: "committee1@example.com", firstName: "Committee", lastName: "One" },
        { email: "committee2@example.com", firstName: "Committee", lastName: "Two" },
      ],
    },
    ECOSYSTEM_BUILDER: {
      enumRole: "ECOSYSTEM_BUILDER" as UserRole,
      relationRole: ecosystemBuilderRole,
      users: [
        { email: "ecosystembuilder1@example.com", firstName: "Ecosystem", lastName: "Builder One" },
        { email: "ecosystembuilder2@example.com", firstName: "Ecosystem", lastName: "Builder Two" },
      ],
    },
    USER: {
      enumRole: "USER" as UserRole,
      relationRole: userRoleRecord,
      users: [
      { email: "user1@example.com", firstName: "User", lastName: "One" },
      { email: "user2@example.com", firstName: "User", lastName: "Two" },
      ],
    },
  };

  for (const [, config] of Object.entries(usersBySeedRole)) {
    for (const user of config.users) {
      await ensureUser(user.email, {
        email: user.email,
        password: defaultPassword,
        firstName: user.firstName,
        lastName: user.lastName,
        role: config.enumRole,
        emailVerified: true,
        roles: config.relationRole ? { connect: { id: config.relationRole.id } } : undefined,
      });
    }
  }
  console.log("Seeded users for SUPER_ADMIN, ADMIN, REVIEWER, COMMITTEE, ECOSYSTEM_BUILDER, and USER roles.");

  // 5. Draft applications with applicants
  const applicant1 = await ensureUser("applicant1@example.com", {
    email: "applicant1@example.com",
    password: defaultPassword,
    firstName: "Alice",
    lastName: "Applicant",
    role: "USER",
    emailVerified: true,
    roles: userRoleRecord ? { connect: { id: userRoleRecord.id } } : undefined,
  });

  const applicant2 = await ensureUser("applicant2@example.com", {
    email: "applicant2@example.com",
    password: defaultPassword,
    firstName: "Bob",
    lastName: "Builder",
    role: "USER",
    emailVerified: true,
    roles: userRoleRecord ? { connect: { id: userRoleRecord.id } } : undefined,
  });

  const draftApplications = [
    {
      id: "draft-app-1",
      userId: applicant1.id,
      status: "DRAFT" as const,
      startupName: "Sunrise Agro",
      numberOfEmployees: 12,
      numberOfFounders: 2,
      foundingDate: new Date("2023-01-10"),
      industry: "AgriTech",
      website: "https://sunrise-agro.example.com",
      phoneNumber: "+251900000001",
      email: "contact@sunrise-agro.example.com",
      alternateEmail: "ops@sunrise-agro.example.com",
      businessLicense: "LIC-AG-2023-01",
      typeOfCompany: "Private Limited",
      totalShares: 100000,
      sharePrice: 1.5,
      vision: "Empower farmers with data-driven insights",
      mission: "Deliver affordable agri analytics",
      productDescription: "IoT sensors and dashboards for farms",
      uniqueValueProposition: "Real-time crop intelligence for smallholders",
      tin: "TIN-123-456",
      problemStatement: "Low yields due to limited data",
      solution: "Affordable sensor kits",
      innovationDescription: "Edge analytics with offline support",
      targetMarket: "Smallholder farmers in Ethiopia",
      competitiveAdvantage: "Lower cost hardware and localized advisory",
      scalabilityPlan: "Partner with co-ops across regions",
      traction: "Pilots with 25 farms",
      riskAssessment: "Hardware supply chain",
      revenue: "$45k ARR",
      totalFundingRaised: "$120k",
      investmentNeeded: "$250k",
      useOfFunds: "Manufacturing and distribution",
    },
    {
      id: "draft-app-2",
      userId: applicant2.id,
      status: "DRAFT" as const,
      startupName: "HealthLink",
      numberOfEmployees: 20,
      numberOfFounders: 3,
      foundingDate: new Date("2022-07-20"),
      industry: "HealthTech",
      website: "https://healthlink.example.com",
      phoneNumber: "+251900000002",
      email: "hello@healthlink.example.com",
      alternateEmail: "ops@healthlink.example.com",
      businessLicense: "LIC-HL-2022-07",
      typeOfCompany: "Private Limited",
      totalShares: 200000,
      sharePrice: 2.2,
      vision: "Accessible healthcare",
      mission: "Connect clinics and patients digitally",
      productDescription: "Telehealth scheduling and triage",
      uniqueValueProposition: "Localized triage in multiple languages",
      tin: "TIN-987-654",
      problemStatement: "Limited clinic capacity",
      solution: "Smart routing of appointments",
      innovationDescription: "AI-assisted triage",
      targetMarket: "Urban clinics",
      competitiveAdvantage: "Local compliance and language support",
      scalabilityPlan: "Expand to regional hospitals",
      traction: "5 clinics onboarded",
      riskAssessment: "Regulatory approvals",
      revenue: "$80k ARR",
      totalFundingRaised: "$300k",
      investmentNeeded: "$500k",
      useOfFunds: "Product and sales",
    },
  ];

  let seededDraftApplicationCount = 0;
  for (const app of draftApplications) {
    const seeded = await ensureApplication(app.id, app);
    if (seeded) {
      seededDraftApplicationCount += 1;
    }
  }

  if (seededDraftApplicationCount > 0) {
    console.log(`Seeded ${seededDraftApplicationCount} draft applications with sample data.`);
  } else {
    console.log("Skipped draft application seed because the application table is not aligned with the current database.");
  }

  // 6. Stakeholder Seeding
  console.log("Seeding example Stakeholder...");
  try {
    let stakeholder = await prisma.stakeholder.findFirst({
      where: { name: "Ministry of Innovation and Technology" }
    });

    if (!stakeholder) {
      stakeholder = await prisma.stakeholder.create({
        data: {
          name: "Ministry of Innovation and Technology",
          type: "Government Ministry",
          description: "Driving Ethiopia's digital transformation and innovation ecosystem.",
          website: "https://www.mint.gov.et",
          email: "contact@mint.gov.et",
          phone: "+251111111111",
          address: "Addis Ababa, Ethiopia",
          region: "Addis Ababa",
          status: "active",
          portalAccess: true,
        },
      });
    }

    const stakeholderAdminRole = await prisma.role.findUnique({ where: { name: "STAKEHOLDER" } });

    const stakeholderPassword = await bcrypt.hash("StartupET@2025", 10);

    await ensureUser("stakeholder.admin@mint.gov.et", {
      email: "stakeholder.admin@mint.gov.et",
      password: stakeholderPassword,
      firstName: "MinT",
      lastName: "Coordinator",
      role: "STAKEHOLDER",
      emailVerified: true,
      stakeholderId: stakeholder.id,
      roles: stakeholderAdminRole ? { connect: { id: stakeholderAdminRole.id } } : undefined,
    } as any);
    console.log("Stakeholder 'Ministry of Innovation and Technology' and its admin seeded.");
  } catch (error) {
    console.warn("Skipping stakeholder seeding due to potential schema mismatch or constraint violation.");
    console.error(error);
  }

  console.log("Advanced Stakeholder Matrix deployment complete.");
}

main()
  .catch((e) => {
    console.error("Critical Deployment Failure:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
