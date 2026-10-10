export const site = {
  legalName: "Belema General Trading PLC",
  brandName: "Fine Water",
  tagline: "Fine is Fine for Health",
  domain: "belemagroup.com",
  productionUrl: "https://belemagroup.com",
  contact: {
    telephone: "+25112601219",
    telephoneDisplay: "+251 126 01219",
    mobile: "+251983858659",
    mobileDisplay: "+251 983 858 659",
    email: "finewater@belemagroup.com",
    whatsappUrl: "https://wa.me/251983858659",
    telegramShareBase: "https://t.me/share/url",
  },
  address: {
    locality: "Sheger City",
    region: "Oromia Region",
    country: "Ethiopia",
    countryCode: "ET",
    display: "Sheger City, Oromia Region, Ethiopia",
    mapSearch: "https://www.openstreetmap.org/search?query=Sheger%20City%2C%20Oromia%20Region%2C%20Ethiopia",
    // Broad regional view only. An exact company pin/address was not supplied.
    mapEmbed: "https://www.openstreetmap.org/export/embed.html?bbox=37.5%2C7.2%2C40.5%2C10.2&layer=mapnik",
  },
  certification: {
    label: "CES 99 LICENSE NO. 100532",
    issuer: "Ethiopian Conformity Assessment Enterprise",
    issuerWebsite: "https://ecae.org.et/",
    logoPath: "/images/ecae-logo.png",
  },
  productSheetPath: "/fine-water-product-sheet.pdf",
} as const;

export function siteOrigin(): string {
  const configured = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  return (configured || site.productionUrl).replace(/\/$/, "");
}

export function telegramShareUrl(message: string): string {
  const url = new URL(site.contact.telegramShareBase);
  url.searchParams.set("url", site.productionUrl);
  url.searchParams.set("text", message);
  return url.toString();
}
