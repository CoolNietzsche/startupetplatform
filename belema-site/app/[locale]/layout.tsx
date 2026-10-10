import type { Metadata, Viewport } from "next";
import { notFound } from "next/navigation";
import { getMessages, getTranslations, setRequestLocale } from "next-intl/server";
import { hasLocale } from "next-intl";
import { Inter, Noto_Sans_Ethiopic, Plus_Jakarta_Sans } from "next/font/google";
import { NextIntlClientProvider } from "next-intl";
import { routing, type Locale } from "@/i18n/routing";
import { pageMetadata } from "@/lib/metadata";
import { organizationSchemas } from "@/lib/structured-data";
import { JsonLd } from "@/components/json-ld";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { FloatingWhatsApp } from "@/components/floating-whatsapp";
import { CookieConsent } from "@/components/cookie-consent";
import "../globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" });
const jakarta = Plus_Jakarta_Sans({ subsets: ["latin"], variable: "--font-jakarta", display: "swap" });
const ethiopic = Noto_Sans_Ethiopic({ subsets: ["ethiopic", "latin"], variable: "--font-ethiopic", display: "swap" });

export const viewport: Viewport = { width: "device-width", initialScale: 1, themeColor: "#08457C" };

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) return {};
  const t = await getTranslations({ locale, namespace: "seo" });
  return pageMetadata({ title: t("siteTitle"), description: t("siteDescription"), locale: locale as Locale });
}

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export const dynamicParams = false;

export default async function LocaleLayout({ children, params }: Readonly<{ children: React.ReactNode; params: Promise<{ locale: string }> }>) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  setRequestLocale(locale);
  const messages = await getMessages();
  const organization = organizationSchemas();

  return (
    <html lang={locale}>
      <body className={`${inter.variable} ${jakarta.variable} ${ethiopic.variable}`} data-locale={locale}>
        <NextIntlClientProvider messages={messages}>
          <JsonLd data={organization} />
          <SiteHeader locale={locale as Locale} />
          {children}
          <SiteFooter locale={locale as Locale} />
          <FloatingWhatsApp />
          <CookieConsent />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
