import { Droplet } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { site } from "@/content/site";

export async function WaterFeature() {
  const t = await getTranslations("home");
  const c = await getTranslations("common");
  return <section className="container-shell section-pad">
    <div className="two-column" style={{ alignItems: "center" }}>
      <div><p className="eyebrow">{t("waterLabel")}</p><h2 style={{ margin: "0.45rem 0 0.8rem", fontSize: "clamp(2rem, 4vw, 3.2rem)" }}>{t("rangeTitle")}</h2><p className="muted">{t("rangeIntro")}</p><ul className="feature-list"><li><Droplet size={18} aria-hidden="true" /><span>2 L · 1 L · 600 ml · 350 ml</span></li><li><Droplet size={18} aria-hidden="true" /><span>{c("labelMark")}: {site.certification.label}</span></li></ul><div className="action-row"><Button asChild><Link href="/fine-water">{t("fineCta")}</Link></Button></div></div>
      <div className="surface-card" style={{ minHeight: "18rem", display: "grid", alignContent: "center", background: "linear-gradient(135deg,#f2f9fc,#e1f5fc)" }}>
        <div style={{ color: "#08457c" }}><Droplet size={40} aria-hidden="true" /></div><p className="eyebrow" style={{ marginTop: "1rem" }}>{c("labelMark")}</p><p style={{ color: "#0b2e5e", fontWeight: 800 }}>{site.certification.label}</p><p className="muted">{t("reason2Text")}</p>
      </div>
    </div>
  </section>;
}
