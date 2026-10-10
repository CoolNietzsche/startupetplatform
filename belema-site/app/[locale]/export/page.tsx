import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import type { Locale } from "@/i18n/routing";
import { pageMetadata } from "@/lib/metadata";
import { PageTitle } from "@/components/page-title";
import { InquiryForm } from "@/components/inquiry-form";

export async function generateMetadata({ params }: { params: Promise<{ locale: Locale }> }): Promise<Metadata> {
  const { locale } = await params; const t = await getTranslations({ locale, namespace: "export" });
  return pageMetadata({ title: `${t("eyebrow")} | Belema`, description: t("intro"), locale, path: "export" });
}

export default async function ExportPage({ params }: { params: Promise<{ locale: Locale }> }) {
  const { locale } = await params; setRequestLocale(locale);
  const t = await getTranslations("export");
  return <main id="main-content">
    <PageTitle eyebrow={t("eyebrow")} title={t("title")} description={t("intro")} />
    <section className="container-shell section-pad"><div className="card-grid-3">
      <article className="surface-card"><p className="eyebrow">01</p><h2>{t("goodsTitle")}</h2><p>{t("goodsText")}</p></article>
      <article className="surface-card"><p className="eyebrow">02</p><h2>{t("documentsTitle")}</h2><p>{t("documentsText")}</p></article>
      <article className="surface-card"><p className="eyebrow">03</p><h2>{t("formTitle")}</h2><p>{t("formText")}</p></article>
    </div></section>
    <section className="soft-section section-pad" id="inquiry"><div className="container-shell two-column"><div><h2>{t("formTitle")}</h2><p className="muted">{t("formText")}</p></div><InquiryForm type="export-inquiry" /></div></section>
  </main>;
}
