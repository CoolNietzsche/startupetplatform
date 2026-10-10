import Image from "next/image";
import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";
import { pageMetadata } from "@/lib/metadata";
import { PageTitle } from "@/components/page-title";
import { Button } from "@/components/ui/button";
import { site } from "@/content/site";

export async function generateMetadata({ params }: { params: Promise<{ locale: Locale }> }): Promise<Metadata> {
  const { locale } = await params; const t = await getTranslations({ locale, namespace: "quality" });
  return pageMetadata({ title: `${t("eyebrow")} | Belema`, description: t("intro"), locale, path: "quality-certification" });
}

export default async function QualityPage({ params }: { params: Promise<{ locale: Locale }> }) {
  const { locale } = await params; setRequestLocale(locale);
  const t = await getTranslations("quality"); const c = await getTranslations("common");
  return <main id="main-content">
    <PageTitle eyebrow={t("eyebrow")} title={t("title")} description={t("intro")} />
    <section className="container-shell section-pad"><div className="two-column">
      <div><p className="eyebrow">{t("licenseTitle")}</p><h2 style={{ fontSize: "clamp(1.8rem, 4vw, 3rem)" }}>{site.certification.label}</h2><p>{t("issuer")}</p><p className="notice">{t("scopeNote")}</p></div>
      <a className="surface-card cert-logo-wrap" style={{ display: "block", width: "100%" }} href={site.certification.issuerWebsite} target="_blank" rel="noreferrer" aria-label={`${c("logoAlt")} — ${t("issuer")}`}><Image src={site.certification.logoPath} alt={c("logoAlt")} width={609} height={112} sizes="(max-width: 900px) 90vw, 40vw" /></a>
    </div></section>
    <section className="soft-section section-pad"><div className="container-shell two-column"><div><h2>{t("commitmentTitle")}</h2><p className="muted">{t("commitmentText")}</p></div><Button asChild variant="secondary"><Link href="/fine-water#analysis">{t("analysisCta")}</Link></Button></div></section>
  </main>;
}
