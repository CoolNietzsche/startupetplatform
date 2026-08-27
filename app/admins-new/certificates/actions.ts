"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import db from "@/lib/db";
import { computeDisplayExpiry } from "@/lib/services/certificate-regeneration";

export type CertificatePreviewData = {
  certificateId: string;
  applicationId: string;
  startupName: string;
  level: string;
  levelDisplay: string;
  issued: string;
  expiry: string;
  shortId: string;
  type: "STARTUP" | "ECOSYSTEM";
};

/**
 * Get certificate preview data by certificate id (full or short 8-char) or by application id.
 */
export async function getCertificatePreview(
  id: string
): Promise<{ success: boolean; data?: CertificatePreviewData; message?: string }> {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return { success: false, message: "Unauthorized" };
    }

    const idLower = id.toLowerCase().trim();
    const isShortId = id.length <= 10 && /^[a-z0-9]+$/i.test(id);

    // 1. Try by certificate id (exact or endsWith for short id)
    let cert = await db.certificate.findFirst({
      where: isShortId
        ? { id: { endsWith: idLower } }
        : { id: id },
      include: {
        application: true,
        ecoApplication: true,
      },
    });

    // 2. If not found, try by application id
    if (!cert) {
      cert = await db.certificate.findFirst({
        where: {
          OR: [
            { applicationId: id },
            { ecoApplicationId: id }
          ]
        },
        include: { 
          application: true,
          ecoApplication: true
        },
      });
    }

    if (!cert) {
      return { success: false, message: "Certificate not found" };
    }

    // Try to find startup info
    const startup = await db.startup.findUnique({
      where: { certificateId: cert.id },
    });

    // Try to find ecosystem builder info if not startup
    const ecoBuilder = !startup ? await db.ecosystemBuilder.findFirst({
      where: { 
        ecoApplications: {
          some: { id: cert.ecoApplicationId || '' }
        }
      }
    }) : null;

    const startupName =
      startup?.name ?? ecoBuilder?.name ?? cert.application?.startupName ?? cert.ecoApplication?.name ?? "—";
    const level = startup?.level ?? "level-1";
    const levelDisplay = startup ? level.replace("level-", "Level ") : (ecoBuilder?.type || "Ecosystem Builder");
    const issued = startup?.issuedAt
      ? new Date(startup.issuedAt).toISOString().split("T")[0]
      : cert.issuedAt.toISOString().split("T")[0];
    const expiry = startup
      ? computeDisplayExpiry(cert.issuedAt, startup.expiresAt ?? null, 2)
      : computeDisplayExpiry(cert.issuedAt, null, 2);

    return {
      success: true,
      data: {
        certificateId: cert.id,
        applicationId: cert.ecoApplicationId || cert.applicationId || '',
        startupName,
        level,
        levelDisplay,
        issued,
        expiry,
        shortId: cert.id.slice(-8).toUpperCase(),
        type: cert.type as "STARTUP" | "ECOSYSTEM",
      },
    };
  } catch (error) {
    console.error("getCertificatePreview:", error);
    return { success: false, message: "Failed to load certificate" };
  }
}
