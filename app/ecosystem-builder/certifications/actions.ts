"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import db from "@/lib/db";
import { randomBytes } from "crypto";

export async function getEcosystemCertifications() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return { success: false, message: "Unauthorized" };
    }

    // 1. Find the builder profile for this user
    const builder = await db.ecosystemBuilder.findUnique({
      where: { userId: session.user.id },
      include: {
        ecoApplications: {
          where: { status: 'CERTIFIED' },
          include: { certificate: true },
          orderBy: { updatedAt: 'desc' }
        }
      }
    });

    if (!builder) {
      return { success: true, data: [] };
    }

    // 2. Sync: If builder is certified but some CERTIFIED apps lack a record, create it
    if (builder.certified) {
      const appsMissingCert = builder.ecoApplications.filter(app => !app.certificate);
      for (const app of appsMissingCert) {
        const year = new Date().getFullYear();
        const timestamp = Date.now().toString().slice(-6);
        const randomPart = randomBytes(3).toString('hex').toUpperCase();
        const certNumber = `ECO-CERT-${year}-${timestamp}-${randomPart}`;

        const newCert = await db.certificate.create({
          data: {
            ecoApplicationId: app.id,
            certificateNumber: certNumber,
            filePath: `/api/certificates/${app.id}/download`, // Standard endpoint
            issuedById: null, // System generated
            type: 'ECOSYSTEM',
            issuedAt: app.updatedAt || new Date()
          }
        });

        await db.ecoApplication.update({
          where: { id: app.id },
          data: { certificateId: newCert.id }
        });
      }
    }

    // 3. Fetch all certificates for this user's applications
    const certificates = await db.certificate.findMany({
      where: {
        OR: [
          {
            ecoApplication: {
              builder: { userId: session.user.id }
            }
          },
          {
            // Fallback for cases where ecoApplication link exists but builder link is through user
            ecoApplication: {
              builderId: builder.id
            }
          }
        ],
        type: 'ECOSYSTEM'
      },
      include: {
        ecoApplication: true
      },
      orderBy: {
        issuedAt: 'desc'
      }
    });

    const mappedData = certificates.map(cert => ({
      id: cert.id,
      certificateId: cert.certificateNumber || cert.id.slice(-8).toUpperCase(),
      level: 1,
      levelName: "Certified Ecosystem Builder",
      issueDate: cert.issuedAt.toISOString(),
      expiryDate: "N/A",
      issuedBy: "Ministry of Innovation & Technology",
      status: "active" as const,
      realCertificateId: cert.id,
      requirements: [
        "Maintain ethical standards and practices",
        "Regular updates of organizational information",
        "Periodic impact reporting"
      ]
    }));

    return { success: true, data: mappedData };
  } catch (error) {
    console.error("Failed to fetch ecosystem certifications:", error);
    return { success: false, message: "Failed to fetch certifications" };
  }
}

export async function getUpgradeProgress() {
    // This is a placeholder for future real progress tracking
    // For now, we return 0 to indicate no real progress data yet
    return {
        success: true,
        data: [
            { level: 3, name: "Advanced", progress: 0 },
            { level: 4, name: "Expert", progress: 0 }
        ]
    };
}
