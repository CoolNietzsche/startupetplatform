import type { Metadata } from "next";
import { Check, ArrowUpRight } from "lucide-react";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";
import { pageMetadata } from "@/lib/metadata";
import { site } from "@/content/site";
import { Button } from "@/components/ui/button";
import { HeroIllustration } from "@/components/hero-illustration";
import { SizeCards } from "@/components/size-cards";
import { WaterFeature } from "@/components/water-feature";
import { CertificationBand } from "@/components/certification-band";
import { ContactActions } from "@/components/contact-actions";
import { CtaPanel } from "@/components/cta-panel";
import { Reveal } from "@/components/reveal";

export async function generateMetadata({ params }: { params: Promise<{ locale: Locale }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "seo" });
  return pageMetadata({ title: t("siteTitle"), description: t("siteDescription"), locale });
}

export default async function HomePage({ params }: { params: Promise<{ locale: Locale }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("home");
  const c = await getTranslations("common");
  return <main id="main-content">
    <section className="container-shell hero">
      <div className="hero-copy">
        <p className="eyebrow">{t("eyebrow")}</p>
        <h1>{t("title")}</h1>
        <p>{t("intro")}</p>
        <p className="hero-tagline"><span aria-hidden="true">●</span>{site.tagline}</p>
        <div className="hero-actions">
          <Button asChild><Link href="/fine-water#inquiry">{c("order")}</Link></Button>
          <Button variant="secondary" asChild><Link href="/import">{c("trade")} <ArrowUpRight size={16} aria-hidden="true" /></Link></Button>
        </div>
      </div>
      <HeroIllustration alt={t("heroAlt")} />
    </section>

    <WaterFeature />

    <Reveal>
    <section className="soft-section section-pad" id="sizes">
      <div className="container-shell"><div className="section-heading"><p className="eyebrow">{t("waterLabel")}</p><h2>{t("rangeTitle")}</h2><p>{t("rangeIntro")}</p></div><SizeCards /></div>
    </section>
    </Reveal>

    <section className="container-shell section-pad">
      <div className="section-heading"><p className="eyebrow">{site.brandName}</p><h2>{t("whyTitle")}</h2><p>{t("whyIntro")}</p></div>
      <div className="card-grid-3">
        {[1, 2, 3].map((n) => <article className="surface-card" key={n}><Check size={21} color="#48780f" aria-hidden="true" /><h3>{t(`reason${n}Title`)}</h3><p>{t(`reason${n}Text`)}</p></article>)}
      </div>
    </section>

    <section className="soft-section section-pad">
      <div className="container-shell"><div className="section-heading"><p className="eyebrow">{site.legalName}</p><h2>{t("tradeTitle")}</h2><p>{t("tradeText")}</p></div>
        <div className="card-grid-3">
          <article className="surface-card"><h3>{t("importTitle")}</h3><p>{t("importText")}</p><div className="action-row"><Button variant="secondary" asChild><Link href="/import">{c("learnMore")}</Link></Button></div></article>
          <article className="surface-card"><h3>{t("exportTitle")}</h3><p>{t("exportText")}</p><div className="action-row"><Button variant="secondary" asChild><Link href="/export">{c("learnMore")}</Link></Button></div></article>
          <article className="surface-card"><h3>{t("contactStrip")}</h3><p>{site.contact.telephoneDisplay}<br />{site.contact.email}</p><ContactActions compact /></article>
        </div>
      </div>
    </section>

    <CertificationBand title={t("certTitle")} text={t("certText")} />
    <CtaPanel title={t("ctaTitle")} text={t("ctaText")} href="/contact" buttonLabel={c("contactUs")} />
  </main>;
}
