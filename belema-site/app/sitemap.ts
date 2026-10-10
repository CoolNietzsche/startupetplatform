import type { MetadataRoute } from "next";
import { siteOrigin } from "@/content/site";

const paths = ["", "/fine-water", "/import", "/export", "/about", "/quality-certification", "/contact", "/privacy", "/terms"];

export default function sitemap(): MetadataRoute.Sitemap {
  const origin = siteOrigin();
  return paths.flatMap((path) => ["en", "am"].map((locale) => ({
    url: `${origin}/${locale}${path}`,
    lastModified: new Date(),
    changeFrequency: path === "" ? "weekly" as const : "monthly" as const,
    priority: path === "" ? 1 : path === "/fine-water" ? 0.9 : 0.7,
    alternates: { languages: { en: `${origin}/en${path}`, am: `${origin}/am${path}`, "x-default": `${origin}/en${path}` } },
  })));
}
