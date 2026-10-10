import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import type { Locale } from "@/i18n/routing";
import { pageMetadata } from "@/lib/metadata";
import { PageTitle } from "@/components/page-title";
import { site } from "@/content/site";

export async function generateMetadata({ params }: { params: Promise<{ locale: Locale }> }): Promise<Metadata> {
  const { locale } = await params; const t = await getTranslations({ locale, namespace: "legal" });
  return pageMetadata({ title: t("termsTitle"), description: t("termsIntro"), locale, path: "terms" });
}

export default async function TermsPage({ params }: { params: Promise<{ locale: Locale }> }) {
  const { locale } = await params; setRequestLocale(locale); const t = await getTranslations("legal"); const c = await getTranslations("common");
  return <main id="main-content"><PageTitle eyebrow={t("reviewBadge")} title={t("termsTitle")} description={t("termsIntro")} />
    <article className="container-shell legal-copy"><span className="review-badge">{t("reviewBadge")}</span>
      <section><h2>{t("termsInfoTitle")}</h2><p>{t("termsInfoText")}</p></section>
      <section><h2>{t("termsInquiryTitle")}</h2><p>{t("termsInquiryText")}</p></section>
      <section><h2>{t("termsContactTitle")}</h2><p>{t("termsContactText")}</p><p><a href={`mailto:${site.contact.email}`}>{c("email")}: {site.contact.email}</a></p></section>
    </article></main>;
}
