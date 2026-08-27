import QRCode from "qrcode";
import db from "@/lib/db/index";
import { CERT_COLORS } from "@/lib/certificate-design-tokens";
import {
  certificateService,
  type CertificateData,
} from "@/lib/services/certificate.service";

function addYears(d: Date, years: number): Date {
  const n = new Date(d);
  n.setFullYear(n.getFullYear() + years);
  return n;
}

function ymd(d: Date): string {
  return d.toISOString().split("T")[0];
}

/** Public display expiry: explicit DB date, or issuedAt + fallbackYears. */
export function computeDisplayExpiry(
  issuedAt: Date,
  explicit: Date | null | undefined,
  fallbackYears = 2,
): string {
  if (explicit) return ymd(explicit);
  return ymd(addYears(issuedAt, fallbackYears));
}

const certInclude = {
  startup: { include: { application: true } },
  application: true,
  ecoApplication: { include: { builder: true } },
} as const;

export type CertificateWithRelations = NonNullable<
  Awaited<ReturnType<typeof loadCertificateFlexible>>
>;

export async function loadCertificateFlexible(id: string) {
  const idLower = id.toLowerCase().trim();
  return db.certificate.findFirst({
    where: {
      OR: [
        { id },
        { id: { endsWith: idLower } },
        { applicationId: id },
        { ecoApplicationId: id },
        { certificateNumber: id },
      ],
    },
    include: certInclude,
  });
}

export async function buildCertificateDataForPdf(
  cert: CertificateWithRelations,
  origin: string,
): Promise<CertificateData> {
  const isEco = cert.type === "ECOSYSTEM";

  let verificationUrl: string;
  let startupName: string;
  let certificateLevel: string;

  if (isEco && cert.ecoApplication) {
    const b = cert.ecoApplication.builder;
    startupName = b?.name ?? cert.ecoApplication.name ?? "Ecosystem Builder";
    certificateLevel = b?.type ?? "Ecosystem Builder";
    verificationUrl = `${origin}/eco-certificate/${cert.id}`;
  } else {
    const s = cert.startup;
    const app = cert.application;
    startupName = s?.name ?? app?.startupName ?? "Unknown";
    certificateLevel = s?.level ?? app?.typeOfCompany ?? "level-1";
    const appId = s?.applicationId ?? app?.id ?? "unknown";
    const issued = (s?.issuedAt ?? cert.issuedAt).toISOString().split("T")[0];
    verificationUrl = `${origin}/certificate/${appId}?startup=${encodeURIComponent(startupName)}&level=${encodeURIComponent(certificateLevel)}&issued=${issued}`;
  }

  const qrCodeDataUrl = await QRCode.toDataURL(verificationUrl, {
    margin: 1,
    color: { dark: CERT_COLORS.teal, light: "#FFFFFF" },
  });
  const startDate = cert.issuedAt.toISOString().split("T")[0];
  const endDate = isEco
    ? computeDisplayExpiry(cert.issuedAt, null, 2)
    : computeDisplayExpiry(cert.issuedAt, cert.startup?.expiresAt ?? null, 2);

  return {
    certificateType: cert.type as "STARTUP" | "ECOSYSTEM",
    startupName,
    certificateLevel,
    startDate,
    endDate,
    qrCodeDataUrl,
    ministryLogoUrl: "/Mint_Logo.png",
    certificateNumber:
      cert.certificateNumber ?? cert.id.slice(-8).toUpperCase(),
  };
}

/** Regenerates PDF with current template, overwrites `cert.filePath`, returns buffer. */
export async function regenerateCertificatePdfToBuffer(
  cert: CertificateWithRelations,
  origin: string,
): Promise<Buffer> {
  const data = await buildCertificateDataForPdf(cert, origin);
  const relativePath =
    cert.filePath?.replace(/^\//, "") || `certificates/${cert.id}.pdf`;
  return certificateService.generateAndSave(data, relativePath);
}
