import Image from "next/image";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { site, telegramShareUrl } from "@/content/site";
import type { Locale } from "@/i18n/routing";

const footerLinks = [
  ["home", "/"], ["fineWater", "/fine-water"], ["import", "/import"], ["export", "/export"],
  ["about", "/about"], ["quality", "/quality-certification"], ["contact", "/contact"],
] as const;

export async function SiteFooter({ locale }: { locale: Locale }) {
  const nav = await getTranslations("nav");
  const common = await getTranslations("common");
  const t = await getTranslations("legal");
  return <footer className="site-footer">
    <div className="container-shell footer-grid">
      <div>
        <h2>{site.legalName}</h2><p>{common("footerNote")}</p><p>{common("location")}</p>
        <div className="cert-logo-wrap"><Image src={site.certification.logoPath} alt={common("logoAlt")} width={609} height={112} sizes="(max-width: 600px) 80vw, 300px" /></div>
        <p className="muted">{site.certification.label}</p>
      </div>
      <div><h3>{nav("home")}</h3><nav className="footer-links" aria-label={nav("menu")}>
        {footerLinks.map(([key, href]) => <Link key={key} href={href}>{nav(key)}</Link>)}
      </nav></div>
      <div><h3>{common("contactUs")}</h3><div className="footer-links">
        <a href={`tel:${site.contact.telephone}`}>{site.contact.telephoneDisplay}</a>
        <a href={`${site.contact.whatsappUrl}?text=${encodeURIComponent("Hello, I would like to contact Belema General Trading PLC.")}`} target="_blank" rel="noreferrer">{common("whatsapp")}: {site.contact.mobileDisplay}</a>
        <a href={`mailto:${site.contact.email}`}>{site.contact.email}</a>
        <a href={telegramShareUrl("I would like to contact Belema General Trading PLC.")} target="_blank" rel="noreferrer">{common("telegram")}</a>
      </div></div>
      <div><h3>{common("draft")}</h3><div className="footer-links"><Link href="/privacy">{t("privacyTitle")}</Link><Link href="/terms">{t("termsTitle")}</Link></div><p>{site.brandName} · “{site.tagline}”</p></div>
    </div>
    <div className="container-shell footer-bottom"><span>© {new Date().getFullYear()} {site.legalName}</span><span>{locale === "am" ? "የአማርኛ ትርጉም ለግምገማ ይጠብቃል።" : "Amharic translation pending native-speaker review."}</span></div>
  </footer>;
}
