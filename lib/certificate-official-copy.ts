export type CertificateVariant = "STARTUP" | "ECOSYSTEM";

export type OfficialCertificateCopy = {
  /** Main header line (reference layout). */
  documentTitle: string;
  /** Secondary line under title (smaller caps). */
  recognitionLine: string;
  presentedLead: string;
  bodyParagraphs: string[];
};

export function getOfficialCertificateCopy(
  variant: CertificateVariant,
): OfficialCertificateCopy {
  if (variant === "ECOSYSTEM") {
    return {
      documentTitle: "CERTIFICATE OF ACHIEVEMENT",
      recognitionLine: "Ecosystem builder — National accreditation",
      presentedLead: "This certificate is proudly presented to",
      bodyParagraphs: [
        "For successfully completing the National Startup Licensing Program (NSLP) evaluation criteria for ecosystem builders, demonstrating recognized capacity to support startups, innovation, and entrepreneurial excellence in line with program standards.",
        "This credential is recorded in the national registry and may be required for accredited support activities, partnerships, and program-gated services.",
      ],
    };
  }
  return {
    documentTitle: "CERTIFICATE OF ACHIEVEMENT",
    recognitionLine: "Certified startup — National recognition",
    presentedLead: "This certificate is proudly presented to",
    bodyParagraphs: [
      "For successfully completing the National Startup Licensing Program (NSLP) evaluation criteria, demonstrating recognized innovation and entrepreneurial excellence under program governance.",
      "This credential is recorded in the national registry and may be required for funding, partnerships, and other program-gated activities as published by the program.",
    ],
  };
}
