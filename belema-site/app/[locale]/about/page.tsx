import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";
import { pageMetadata } from "@/lib/metadata";
import { PageTitle } from "@/components/page-title";
import { Button } from "@/components/ui/button";
import { site } from "@/content/site";

export async function generateMetadata({ params }: { params: Promise<{ locale: Locale }> }): Promise<Metadata> {
  const { locale } = await params; const t = await getTranslations({ locale, namespace: "about" });
  return pageMetadata({ title: `${t("eyebrow")} | Belema`, description: t("intro"), locale, path: "about" });
}

export default async function AboutPage({ params }: { params: Promise<{ locale: Locale }> }) {
  const { locale } = await params; setRequestLocale(locale);
  const t = await getTranslations("about");
  return <main id="main-content">
    <PageTitle eyebrow={t("eyebrow")} title={t("title")} description={t("intro")} />
    <section className="container-shell section-pad"><div className="two-column">
      <article><p className="eyebrow">{t("missionTitle")}</p><h2>{t("missionText")}</h2><p className="muted">{t("valuesNote")}</p></article>
      <div className="card-grid" style={{ gridTemplateColumns: "1fr" }}>
        <article className="surface-card"><h3>{t("valuesTitle")}</h3><ul className="feature-list"><li>{t("values.clarity")}</li><li>{t("values.service")}</li><li>{t("values.care")}</li></ul></article>
        <article className="surface-card"><h3>{t("locationTitle")}</h3><p>{site.address.display}</p></article>
        <article className="surface-card"><h3>{t("leadershipTitle")}</h3><p>{t("leadershipText")}</p></article>
      </div>
    </div><div className="action-row"><Button asChild><Link href="/contact">{t("contactCta")}</Link></Button></div></section>
  </main>;
}
