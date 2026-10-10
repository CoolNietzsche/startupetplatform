import type { Metadata } from "next";
import type { Locale } from "@/i18n/routing";
import { siteOrigin } from "@/content/site";

export function pageMetadata({ title, description, locale, path = "" }: {
  title: string;
  description: string;
  locale: Locale;
  path?: string;
}): Metadata {
  const safePath = path ? `/${path.split("/").filter(Boolean).join("/")}` : "";
  const canonicalPath = `/${locale}${safePath}`;
  const origin = siteOrigin();
  const image = "/images/fine-water-hero.webp";
  return {
    metadataBase: new URL(origin),
    title,
    description,
    alternates: {
      canonical: `${origin}${canonicalPath}`,
      languages: {
        en: `${origin}/en${safePath}`,
        am: `${origin}/am${safePath}`,
        "x-default": `${origin}/en${safePath}`,
      },
    },
    openGraph: {
      type: "website",
      siteName: "Belema General Trading PLC",
      title,
      description,
      url: `${origin}${canonicalPath}`,
      locale: locale === "am" ? "am_ET" : "en_ET",
      alternateLocale: locale === "am" ? ["en_ET"] : ["am_ET"],
      images: [{ url: image, alt: "Abstract water and mountain illustration" }],
    },
    twitter: { card: "summary_large_image", title, description, images: [image] },
  };
}
