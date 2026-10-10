import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import type { Locale } from "@/i18n/routing";
import { pageMetadata } from "@/lib/metadata";
import { PageTitle } from "@/components/page-title";
import { ContactDetails } from "@/components/contact-details";
import { ContactActions } from "@/components/contact-actions";
import { InquiryForm } from "@/components/inquiry-form";
import { site } from "@/content/site";

export async function generateMetadata({ params }: { params: Promise<{ locale: Locale }> }): Promise<Metadata> {
  const { locale } = await params; const t = await getTranslations({ locale, namespace: "contact" });
  return pageMetadata({ title: `${t("eyebrow")} | Belema`, description: t("intro"), locale, path: "contact" });
}

export default async function ContactPage({ params }: { params: Promise<{ locale: Locale }> }) {
  const { locale } = await params; setRequestLocale(locale);
  const t = await getTranslations("contact"); const c = await getTranslations("common");
  return <main id="main-content">
    <PageTitle eyebrow={t("eyebrow")} title={t("title")} description={t("intro")} />
    <section className="container-shell"><ContactDetails /><ContactActions /></section>
    <section className="container-shell section-pad"><div className="two-column">
      <div><p className="eyebrow">{t("mapTitle")}</p><h2>{c("location")}</h2><p className="muted">{t("mapNote")}</p><p><a href={site.address.mapSearch} target="_blank" rel="noreferrer">{c("openMap")}</a></p><div className="map-frame"><iframe src={site.address.mapEmbed} loading="lazy" title={t("mapTitle")} referrerPolicy="no-referrer" /></div></div>
      <div><h2>{t("formTitle")}</h2><p className="muted">{t("formText")}</p><InquiryForm type="general-contact" /></div>
    </div></section>
  </main>;
}
