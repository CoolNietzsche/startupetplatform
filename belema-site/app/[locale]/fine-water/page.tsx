import type { Metadata } from "next";
import { Download, ShieldCheck } from "lucide-react";
import { getTranslations, setRequestLocale } from "next-intl/server";
import type { Locale } from "@/i18n/routing";
import { pageMetadata } from "@/lib/metadata";
import { productSchemas } from "@/lib/structured-data";
import { JsonLd } from "@/components/json-ld";
import { PageTitle } from "@/components/page-title";
import { SizeCards } from "@/components/size-cards";
import { AnalysisTable } from "@/components/analysis-table";
import { InquiryForm } from "@/components/inquiry-form";
import { Button } from "@/components/ui/button";
import { CtaPanel } from "@/components/cta-panel";
import { site } from "@/content/site";

export async function generateMetadata({ params }: { params: Promise<{ locale: Locale }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "fine" });
  return pageMetadata({ title: `${t("title")} | Fine Water`, description: t("intro"), locale, path: "fine-water" });
}

export default async function FineWaterPage({ params }: { params: Promise<{ locale: Locale }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("fine");
  const c = await getTranslations("common");
  return <main id="main-content">
    <PageTitle eyebrow={t("eyebrow")} title={t("title")} description={t("intro")} />
    <section className="container-shell section-pad" id="sizes"><div className="section-heading"><h2>{t("storyTitle")}</h2><p>{t("storyText")}</p></div><SizeCards /></section>
    <section className="soft-section section-pad" id="analysis"><div className="container-shell"><div className="section-heading"><p className="eyebrow">{t("analysisTitle")}</p><h2>{t("analysisIntro")}</h2></div><AnalysisTable /></div></section>
    <section className="container-shell section-pad">
      <div className="two-column">
        <div><p className="eyebrow"><ShieldCheck size={16} style={{ display: "inline", verticalAlign: "middle" }} aria-hidden="true" /> {t("qualityTitle")}</p><h2 style={{ fontSize: "clamp(1.8rem, 3vw, 2.4rem)" }}>{t("licenseLabel")}</h2><p className="muted">{t("qualityText")}</p><div className="notice"><strong>{site.certification.label}</strong><br />{site.certification.issuer}</div></div>
        <div className="surface-card"><p className="eyebrow">{t("storageTitle")}</p><p>{t("storageText")}</p><h3 style={{ marginTop: "1.5rem" }}>{t("sheetTitle")}</h3><p className="muted">{t("sheetText")}</p><Button variant="secondary" asChild><a href={site.productSheetPath} download><Download size={16} aria-hidden="true" />{t("downloadSheet")}</a></Button></div>
      </div>
    </section>
    <section className="soft-section section-pad" id="inquiry"><div className="container-shell two-column"><div><p className="eyebrow">{site.brandName}</p><h2>{t("inquiryTitle")}</h2><p className="muted">{t("inquiryText")}</p></div><InquiryForm type="water-wholesale" /></div></section>
    <CtaPanel title={c("contactUs")} text={t("inquiryText")} href="/contact" buttonLabel={c("contactUs")} />
    <JsonLd data={productSchemas(locale)} />
  </main>;
}
