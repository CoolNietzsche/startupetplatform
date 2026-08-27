export const CERTIFICATE_VALIDITY_YEARS = 2;
export const RENEWAL_WINDOW_DAYS = 90;
export const GRACE_PERIOD_DAYS = 30;
export const DIRECTIVE_REF = "Art. 10";

export interface CertificateValidity {
  issuedAt: Date;
  expiresAt: Date;
  isWithinRenewalWindow: boolean;
  isExpired: boolean;
  isInGracePeriod: boolean;
  daysUntilExpiry: number;
  daysSinceExpiry: number;
}

export function computeCertificateExpiry(issuedAt: Date): Date {
  const expiry = new Date(issuedAt);
  expiry.setFullYear(expiry.getFullYear() + CERTIFICATE_VALIDITY_YEARS);
  return expiry;
}

export function getCertificateValidity(issuedAt: Date, expiresAt?: Date | null): CertificateValidity {
  const expiry = expiresAt || computeCertificateExpiry(issuedAt);
  const now = new Date();
  const diffMs = expiry.getTime() - now.getTime();
  const daysUntilExpiry = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
  const daysSinceExpiry = Math.ceil(Math.abs(diffMs) / (1000 * 60 * 60 * 24));

  return {
    issuedAt,
    expiresAt: expiry,
    isWithinRenewalWindow: daysUntilExpiry > 0 && daysUntilExpiry <= RENEWAL_WINDOW_DAYS,
    isExpired: now > expiry,
    isInGracePeriod: now > expiry && daysSinceExpiry <= GRACE_PERIOD_DAYS,
    daysUntilExpiry: Math.max(0, daysUntilExpiry),
    daysSinceExpiry: now > expiry ? daysSinceExpiry : 0,
  };
}

export function canRenew(validity: CertificateValidity): boolean {
  return validity.isWithinRenewalWindow || validity.isInGracePeriod;
}

export function isCertificateActive(expiresAt: Date | null | undefined): boolean {
  if (!expiresAt) return true;
  return new Date() <= expiresAt;
}
