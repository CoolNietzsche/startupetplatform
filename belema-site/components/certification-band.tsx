import Image from "next/image";
import { getTranslations } from "next-intl/server";
import { site } from "@/content/site";

export async function CertificationBand({ title, text }: { title: string; text: string }) {
  const t = await getTranslations("common");
  return <section className="container-shell section-pad" aria-label={title}>
    <div className="cert-band">
      <div><p className="eyebrow">{site.certification.issuer}</p><h2 style={{ margin: "0.5rem 0", color: "#0b2e5e", fontSize: "clamp(1.5rem, 3vw, 2.25rem)" }}>{title}</h2><p className="muted">{text}</p><p><strong>{site.certification.label}</strong></p></div>
      <a className="cert-logo-wrap" href={site.certification.issuerWebsite} target="_blank" rel="noreferrer" aria-label={`${t("logoAlt")} — ${site.certification.issuer}`}>
        <Image src={site.certification.logoPath} alt={t("logoAlt")} width={609} height={112} sizes="(max-width: 600px) 80vw, 300px" />
      </a>
    </div>
  </section>;
}
