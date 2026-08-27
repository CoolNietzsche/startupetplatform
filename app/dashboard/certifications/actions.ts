"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import db from "@/lib/db";

export async function getStartupCertifications() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return { success: false, message: "Unauthorized" };
    }

    // 1. Fetch all certificates for this user's startup applications
    const certificates = await db.certificate.findMany({
      where: {
        application: {
          userId: session.user.id
        },
        type: 'STARTUP'
      },
      include: {
        application: true
      },
      orderBy: {
        issuedAt: 'desc'
      }
    });

    const mappedData = certificates.map(cert => ({
      id: cert.id,
      certificateId: cert.certificateNumber || cert.id.slice(-8).toUpperCase(),
      level: 1,
      levelName: "Certified Startup",
      issueDate: cert.issuedAt.toISOString(),
      expiryDate: cert.expiresAt ? cert.expiresAt.toISOString() : "N/A",
      issuedBy: "Ministry of Innovation & Technology",
      status: "active" as const,
      realCertificateId: cert.id,
      startupName: cert.application?.startupName || "Unknown Startup",
      requirements: [
        "Annual compliance verification",
        "Economic impact reporting",
        "Employment data updates"
      ]
    }));

    return { success: true, data: mappedData };
  } catch (error) {
    console.error("Failed to fetch startup certifications:", error);
    return { success: false, message: "Failed to fetch certifications" };
  }
}
