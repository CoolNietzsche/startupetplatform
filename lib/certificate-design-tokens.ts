/** Shared Mint-inspired palette for certificate UI + server PDF HTML. */
export const CERT_COLORS = {
  navy: "#0D4E63",
  teal: "#11838D",
  gold: "#E8A844",
  slate900: "#0f172a",
  slate600: "#475569",
  slate400: "#94a3b8",
  borderGrey: "#cbd5e1",
  paper: "#ffffff",
  pageBg: "#f1f5f9",
} as const;

export type CertColorKey = keyof typeof CERT_COLORS;
