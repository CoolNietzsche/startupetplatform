import { site, siteOrigin } from "@/content/site";
import type { Locale } from "@/i18n/routing";
import products from "@/content/products.json";

export function organizationSchemas() {
  const origin = siteOrigin();
  const organization = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: site.legalName,
    url: origin,
    email: site.contact.email,
    telephone: site.contact.telephone,
    address: {
      "@type": "PostalAddress",
      addressLocality: site.address.locality,
      addressRegion: site.address.region,
      addressCountry: site.address.countryCode,
    },
  };
  const localBusiness = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    name: site.legalName,
    url: origin,
    email: site.contact.email,
    telephone: site.contact.telephone,
    address: organization.address,
    areaServed: site.address.country,
  };
  return [organization, localBusiness];
}

export function productSchemas(locale: Locale) {
  return products.products.map((product) => ({
    "@context": "https://schema.org",
    "@type": "Product",
    name: `${site.brandName} ${product.size}`,
    description: locale === "am"
      ? `የተጣራ የመጠጥ ውሃ፣ ${product.size} ጠርሙስ።`
      : `Purified bottled drinking water in a ${product.size} bottle.`,
    brand: { "@type": "Brand", name: site.brandName },
    size: product.size,
    category: "Purified bottled drinking water",
    url: `${siteOrigin()}/${locale}/fine-water#size-${product.id}`,
  }));
}
