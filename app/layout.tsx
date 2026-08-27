import type { Metadata } from "next";
import localFont from "next/font/local";
import { Inter } from "next/font/google"; // Add Inter
import "./globals.css";
import { NextAuthProvider } from "@/components/auth/session-provider";
import FaydaAuthProvider from "@/components/fayda/auth-provider";
import { FeatureControlProvider } from "@/contexts/FeatureControlContext";
import { Toaster } from "@/components/ui/toaster";

const inter = Inter({ subsets: ["latin"] });

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});

const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: "StartupET | National Innovation Portal",
  description: "The official national infrastructure dedicated to fueling Ethiopia's digital economy and global startup competitiveness.",
  icons: {
    icon: "/image/startup-icon-mark.png",
    apple: "/image/startup-icon-mark.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} ${inter.className} antialiased text-brand-deep-dark`}>
        <NextAuthProvider>
          <FaydaAuthProvider>
            <FeatureControlProvider>
              {children}
            </FeatureControlProvider>
          </FaydaAuthProvider>
        </NextAuthProvider>
        <Toaster />
      </body>
    </html>
  );
}
