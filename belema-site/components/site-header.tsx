import { Droplets, Menu, Phone } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { site } from "@/content/site";
import { Button } from "@/components/ui/button";
import { LanguageSwitcher } from "@/components/language-switcher";
import type { Locale } from "@/i18n/routing";

const navItems = [
  ["home", "/"], ["fineWater", "/fine-water"], ["import", "/import"], ["export", "/export"],
  ["about", "/about"], ["quality", "/quality-certification"], ["contact", "/contact"],
] as const;

export async function SiteHeader({ locale }: { locale: Locale }) {
  const t = await getTranslations("nav");
  const c = await getTranslations("common");
  return <header className="site-header" data-locale={locale}>
    <a className="skip-link" href="#main-content">{c("skip")}</a>
    <div className="container-shell header-inner">
      <Link className="brand-lockup" href="/" aria-label={`${site.legalName} — ${site.brandName}`}>
        <span className="brand-drop" aria-hidden="true"><Droplets size={20} strokeWidth={2.1} /></span>
        <span className="brand-copy"><strong>{site.brandName}</strong><small>{site.legalName}</small></span>
      </Link>
      <nav className="main-nav" aria-label={t("menu")}>
        {navItems.map(([key, href]) => <Link key={key} href={href}>{t(key)}</Link>)}
      </nav>
      <div className="header-actions">
        <LanguageSwitcher />
        <Button className="button-order" asChild size="sm"><a href={`tel:${site.contact.telephone}`}><Phone size={15} aria-hidden="true" />{c("order")}</a></Button>
        <details className="mobile-menu">
          <summary aria-label={t("menu")}><Menu size={20} aria-hidden="true" /></summary>
          <nav className="mobile-menu-panel" aria-label={t("menu")}>
            {navItems.map(([key, href]) => <Link key={key} href={href}>{t(key)}</Link>)}
            <a href={`tel:${site.contact.telephone}`}>{c("call")} {site.contact.telephoneDisplay}</a>
          </nav>
        </details>
      </div>
    </div>
  </header>;
}
