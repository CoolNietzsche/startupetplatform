"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import db from "@/lib/db";
import fs from "fs/promises";
import path from "path";
import { randomBytes } from "crypto";

export async function getApprovedApplications() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return { success: false, message: "Unauthorized" };
    }

    const allApps: any[] = [];

    // 1. Fetch Startup applications
    try {
      const startupApps = await db.application.findMany({
        where: {
          status: "COMMITTEE_REVIEW_SUBMITTED",
          certificate: null,
        },
        include: {
          assignments: {
            include: {
              committee: true,
              aggregate: true
            }
          }
        },
        orderBy: {
          updatedAt: "desc"
        }
      });

      const mappedApps = startupApps.map((app: any) => {
        const successfulAssignment = app.assignments.find((a: any) => a.aggregate?.result === "PASSED");
        return {
          id: app.id,
          startupName: app.startupName || "Unknown",
          sector: app.industry || "Unknown",
          level: app.typeOfCompany || "level-1",
          score: successfulAssignment?.aggregate?.totalScore ? Math.round(successfulAssignment.aggregate.totalScore) : 0,
          leadAssessor: "Committee Chair",
          committee: successfulAssignment?.committee?.name || "Unknown Committee",
          decisionDate: successfulAssignment?.aggregate?.computedAt ? new Date(successfulAssignment.aggregate.computedAt).toISOString().split('T')[0] : app.updatedAt.toISOString().split('T')[0],
          applicationType: "Startup Certification",
          entityType: 'startup'
        };
      });
      allApps.push(...mappedApps);
    } catch (e) {
      console.error("Error fetching startup apps:", e);
    }

    // 2. Fetch Ecosystem applications
    try {
      const ecoApps = await db.ecoApplication.findMany({
        where: {
          // Use a valid status from EcoApplicationStatus
          status: { in: ["REVIEWED", "COMMITTEE_REVIEW_SUBMITTED"] },
          certificate: null,
        },
        include: {
          assignments: {
            include: {
              committee: true,
              decision: true
            }
          },
          builder: true
        },
        orderBy: {
          updatedAt: "desc"
        }
      });

      const mappedEcoApps = ecoApps.map((app: any) => {
        const successfulAssignment = app.assignments.find((a: any) => 
          a.decision?.finalDecision === "APPROVE" || a.decision?.finalDecision === "ACCEPTED"
        );
        return {
          id: app.id,
          startupName: app.name || app.builder?.name || "Unknown",
          sector: "Ecosystem Builder",
          level: "level-1", 
          score: 100,
          leadAssessor: "Committee Chair",
          committee: successfulAssignment?.committee?.name || "Unknown Committee",
          decisionDate: successfulAssignment?.decision?.submittedAt ? new Date(successfulAssignment.decision.submittedAt).toISOString().split('T')[0] : app.updatedAt.toISOString().split('T')[0],
          applicationType: "Ecosystem Certification",
          entityType: 'ecosystem'
        }
      });
      allApps.push(...mappedEcoApps);
    } catch (e) {
      console.error("Error fetching eco apps:", e);
    }

    allApps.sort((a: any, b: any) => new Date(b.decisionDate).getTime() - new Date(a.decisionDate).getTime());

    return {
      success: true,
      data: allApps,
    };
  } catch (error: any) {
    console.error("Overall failed to fetch approved applications:", error);
    return {
      success: false,
      message: error.message || "Failed to fetch data",
    };
  }
}

export async function issueStartupCertificate(data: {
  appId: string;
  startupName: string;
  level: string;
  startDate: string;
  endDate: string;
  pdfUrl?: string;
  pdfBase64?: string;
  qrCodeDataUrl?: string;
}) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return { success: false, message: "Unauthorized" };
    }

    const { appId, startupName, level, startDate, endDate, pdfUrl, pdfBase64, qrCodeDataUrl } = data;

    // 1. Determine application type and fetch data
    let isEco = false;
    let application: any = await db.application.findUnique({
      where: { id: appId },
      include: { user: true, startup: { include: { certificate: true } } }
    });

    if (!application) {
      application = await db.ecoApplication.findUnique({
        where: { id: appId },
        include: { builder: { include: { user: true } } }
      });
      if (application) isEco = true;
    }

    if (!application) {
      return { success: false, message: "Application not found" };
    }

    const userId = isEco ? application.builder?.userId : application.userId;
    if (!userId) {
       return { success: false, message: "No associated user found for this application" };
    }

    return await db.$transaction(async (tx) => {
      // 2. Handle Renewal Transition Logic
      if (!isEco && application.type === "RENEWAL") {
        // Find existing startup for this user
        const existingStartup = await tx.startup.findUnique({
          where: { userId: userId },
          include: { certificate: true }
        });

        if (existingStartup?.certificateId) {
          // Mark old certificate as expired and renewed
          await tx.certificate.update({
            where: { id: existingStartup.certificateId },
            data: { 
              status: "EXPIRED",
              isRenewed: true 
            }
          });
        }
      }

      // 3. Generate Unique Certificate Number if not provided
      const year = new Date().getFullYear();
      const timestampPart = Date.now().toString().slice(-6);
      const randomPart = randomBytes(3).toString('hex').toUpperCase();
      const generatedNumber = isEco 
        ? `ECO-CERT-${year}-${timestampPart}-${randomPart}`
        : `STP-CERT-${year}-${timestampPart}-${randomPart}`;

      const filePath = pdfUrl || `/certificates/${appId}.pdf`;
      const relativePath = filePath.replace(/^\//, "");
      const fullPath = path.join(process.cwd(), "public", relativePath);

      if (pdfBase64) {
        try {
          const pdfBuffer = Buffer.from(pdfBase64, "base64");
          await fs.mkdir(path.dirname(fullPath), { recursive: true });
          await fs.writeFile(fullPath, pdfBuffer);
          
          if (qrCodeDataUrl && qrCodeDataUrl.startsWith("data:image")) {
            const base64Data = qrCodeDataUrl.split(",")[1];
            if (base64Data) {
              const qrBuffer = Buffer.from(base64Data, "base64");
              const qrPath = path.join(path.dirname(fullPath), `qr-${appId}.png`);
              await fs.writeFile(qrPath, qrBuffer);
            }
          }
        } catch (err) {
          console.error("Failed to save PDF during issuance:", err);
          throw err;
        }
      }

      // 3. Create unified Certificate record
      const certificate = await tx.certificate.create({
        data: {
          applicationId: isEco ? null : appId,
          ecoApplicationId: isEco ? appId : null,
          certificateNumber: generatedNumber,
          filePath: filePath,
          issuedAt: new Date(startDate),
          type: isEco ? 'ECOSYSTEM' : 'STARTUP',
          qrData: qrCodeDataUrl,
          issuedById: session.user.id
        }
      });

      // 4. Update status and profiles
      if (isEco) {
        // Update EcoApplication
        await tx.ecoApplication.update({
          where: { id: appId },
          data: {
            status: "CERTIFIED",
            certificateId: certificate.id
          }
        });

        // Update Builder profile
        if (application.builderId) {
          await tx.ecosystemBuilder.update({
            where: { id: application.builderId },
            data: { certified: true }
          });
        }
      } else {
        // Update Application
        await tx.application.update({
          where: { id: appId },
          data: {
            status: "CERTIFIED" as any,
          }
        });

        // Upsert Startup profile
        await tx.startup.upsert({
          where: { userId: userId },
          update: {
            name: startupName,
            applicationId: appId,
            level: level,
            certificateId: certificate.id,
            issuedAt: new Date(startDate),
            expiresAt: new Date(endDate),
          },
          create: {
            name: startupName,
            applicationId: appId,
            userId: userId,
            level: level,
            certificateId: certificate.id,
            issuedAt: new Date(startDate),
            expiresAt: new Date(endDate),
          }
        });
      }

      return {
        success: true,
        message: `${isEco ? 'Ecosystem' : 'Startup'} certificate issued successfully`,
        data: { id: certificate.id }
      };
    });
  } catch (error: any) {
    console.error("Failed to issue certificate:", error);
    return {
      success: false,
      message: error.message || "Internal server error"
    };
  }
}

export async function getCertifications() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return { success: false, message: "Unauthorized" };
    }

    // 1. Sync Logic: Find Ecosystem Builders marked as certified but missing Certificate records
    const buildersWithMissingCerts = await db.ecosystemBuilder.findMany({
      where: {
        certified: true,
        ecoApplications: {
          some: {
            certificate: null
          }
        }
      },
      include: {
        ecoApplications: {
          where: { certificate: null },
          orderBy: { updatedAt: 'desc' },
          take: 1
        }
      }
    });

    if (buildersWithMissingCerts.length > 0) {
      for (const builder of buildersWithMissingCerts) {
        const app = builder.ecoApplications[0];
        if (app) {
          const year = new Date().getFullYear();
          const timestamp = Date.now().toString().slice(-6);
          const randomPart = randomBytes(3).toString('hex').toUpperCase();
          const certificateNumber = `ECO-CERT-${year}-${timestamp}-${randomPart}`;

          const certificate = await db.certificate.create({
            data: {
              ecoApplicationId: app.id,
              certificateNumber,
              filePath: `/api/ecosystem/certificates/${app.id}/pdf`,
              issuedById: session.user.id,
              type: 'ECOSYSTEM',
              issuedAt: app.updatedAt || new Date()
            }
          });

          await db.ecoApplication.update({
            where: { id: app.id },
            data: { 
              certificateId: certificate.id,
              status: 'CERTIFIED' 
            }
          });
        }
      }

      // Sync Startup records for already certified applications
      const certifiedApps = await db.application.findMany({
        where: {
          status: 'CERTIFIED',
          startup: null
        },
        include: {
          certificate: true
        }
      });

      for (const app of certifiedApps) {
        if (app.certificate) {
          const expiryDate = new Date();
          expiryDate.setFullYear(expiryDate.getFullYear() + 2);
          
          await db.startup.create({
            data: {
              applicationId: app.id,
              userId: app.userId,
              name: app.startupName || "Unnamed Startup",
              level: app.typeOfCompany || "level-1",
              certificateId: app.certificate.id,
              issuedAt: app.certificate.issuedAt,
              expiresAt: expiryDate,
            }
          });
        }
      }
    }

    const [startups, ecoCertificates] = await Promise.all([
      db.startup.findMany({
        include: {
          application: true,
          certificate: true,
        },
        orderBy: { issuedAt: "desc" },
      }),
      db.certificate.findMany({
        where: { type: 'ECOSYSTEM' },
        include: {
          ecoApplication: true,
        },
        orderBy: { issuedAt: "desc" },
      }),
    ]);

    const mappedCertifications = [
      ...startups.filter(s => s.certificate).map((s) => ({
        id: s.certificate!.id.slice(-8).toUpperCase(),
        certificateId: s.certificate!.id,
        applicationId: s.applicationId,
        organization: s.name || s.application?.startupName || "Unnamed Startup",
        type: "Startup",
        category: s.application?.industry || "General",
        issued: (s.issuedAt || s.certificate!.issuedAt).toISOString().split("T")[0],
        expiry: s.expiresAt?.toISOString().split("T")[0] || "N/A",
        level: s.level.replace("level-", "Level "),
        status: "Active",
        fileUrl: s.certificate!.filePath,
      })),
      ...ecoCertificates.map((ec) => ({
        id: ec.id.slice(-8).toUpperCase(),
        certificateId: ec.id,
        applicationId: null as string | null,
        organization: ec.ecoApplication.name,
        type: ec.ecoApplication.type,
        category: "Ecosystem Builder",
        issued: ec.issuedAt.toISOString().split("T")[0],
        expiry: "N/A",
        level: "Certified",
        status: "Active",
        fileUrl: ec.filePath,
      })),
    ];

    return { success: true, data: mappedCertifications };
  } catch (error) {
    console.error("Failed to fetch certifications:", error);
    return { success: false, message: "Failed to fetch certifications" };
  }
}

export async function getCertificationStats() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return { success: false, message: "Unauthorized" };
    }

    const [startupCount, ecoCount, level1Count, level2Count, level3Count] = await Promise.all([
      db.startup.count(),
      db.certificate.count({ where: { type: 'ECOSYSTEM' } }),
      db.startup.count({ where: { level: { contains: "level-1", mode: 'insensitive' } } }),
      db.startup.count({ where: { level: { contains: "level-2", mode: 'insensitive' } } }),
      db.startup.count({ where: { level: { contains: "level-3", mode: 'insensitive' } } }),
    ]);

    return {
      success: true,
      data: {
        total: startupCount + ecoCount,
        startups: startupCount,
        ecosystemBuilders: ecoCount,
        investors: 0,
        level1: level1Count,
        level2: level2Count,
        level3: level3Count,
      }
    };
  } catch (error) {
    console.error("Failed to fetch certification stats:", error);
    return { success: false, message: "Failed to fetch stats" };
  }
}

