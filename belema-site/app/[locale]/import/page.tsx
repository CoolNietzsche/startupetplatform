import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import type { Locale } from "@/i18n/routing";
import { pageMetadata } from "@/lib/metadata";
import { PageTitle } from "@/components/page-title";
import { ImportSteps } from "@/components/import-steps";
import { InquiryForm } from "@/components/inquiry-form";

export async function generateMetadata({ params }: { params: Promise<{ locale: Locale }> }): Promise<Metadata> {
  const { locale } = await params; const t = await getTranslations({ locale, namespace: "import" });
  return pageMetadata({ title: `${t("eyebrow")} | Belema`, description: t("intro"), locale, path: "import" });
}

export default async function ImportPage({ params }: { params: Promise<{ locale: Locale }> }) {
  const { locale } = await params; setRequestLocale(locale);
  const t = await getTranslations("import");
  return <main id="main-content">
    <PageTitle eyebrow={t("eyebrow")} title={t("title")} description={t("intro")} />
    <section className="container-shell section-pad"><div className="section-heading"><h2>{t("servicesTitle")}</h2><p>{t("servicesText")}</p></div><p className="eyebrow">{t("processTitle")}</p><ImportSteps /></section>
    <section className="soft-section section-pad"><div className="container-shell two-column"><div><p className="eyebrow">{t("categoryTitle")}</p><h2>{t("categoryTitle")}</h2><p className="muted">{t("categoryText")}</p></div><div className="surface-card"><h3>{t("formTitle")}</h3><p>{t("formText")}</p></div></div></section>
    <section className="container-shell section-pad" id="inquiry"><div className="two-column"><div><h2>{t("formTitle")}</h2><p className="muted">{t("formText")}</p></div><InquiryForm type="import-quote" /></div></section>
  </main>;
}
