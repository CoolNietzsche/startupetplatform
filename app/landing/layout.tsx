import type { Metadata } from "next";
import { Sora } from "next/font/google";

const sora = Sora({
  subsets: ["latin"],
  variable: "--font-sora",
  display: "swap",
});

export const metadata: Metadata = {
  title: "MinT STI Platform — National Science, Technology & Innovation Registry",
  description:
    "Ethiopia's Science, Technology & Innovation Platform — One national system for startup registration, designation, regional hub coordination, and government oversight.",
};

export default function LandingLayout({ children }: { children: React.ReactNode }) {
  return <div className={sora.variable}>{children}</div>;
}
