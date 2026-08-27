import type { CertificateVariant } from "@/lib/certificate-official-copy";

export type MintCertificateDensity = "compact" | "comfortable";

export type MintOfficialCertificateProps = {
  variant: CertificateVariant;
  recipientName: string;
  subtitle: string;
  issueDate: string;
  expiryDate: string;
  certificateRef: string;
  verificationUrl: string;
  location?: string;
  density?: MintCertificateDensity;
  className?: string;
};
