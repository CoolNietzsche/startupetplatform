import type { MetadataRoute } from "next";
import { siteOrigin } from "@/content/site";

export default function robots(): MetadataRoute.Robots {
  const origin = siteOrigin();
  return { rules: [{ userAgent: "*", allow: "/", disallow: ["/api/"] }], sitemap: `${origin}/sitemap.xml`, host: origin };
}
