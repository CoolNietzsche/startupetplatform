import { Mail, MapPin, Phone } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { site } from "@/content/site";

export async function ContactDetails() {
  const t = await getTranslations("contact");
  const c = await getTranslations("common");
  return <div className="card-grid-3">
    <article className="surface-card"><MapPin size={20} color="#0a78ad" aria-hidden="true" /><h3>{t("addressTitle")}</h3><p>{c("location")}</p></article>
    <article className="surface-card"><Phone size={20} color="#0a78ad" aria-hidden="true" /><h3>{t("phoneTitle")}</h3><p><a href={`tel:${site.contact.telephone}`}>{site.contact.telephoneDisplay}</a></p><p><a href={`tel:${site.contact.mobile}`}>{site.contact.mobileDisplay}</a></p></article>
    <article className="surface-card"><Mail size={20} color="#0a78ad" aria-hidden="true" /><h3>{t("emailTitle")}</h3><p><a href={`mailto:${site.contact.email}`}>{site.contact.email}</a></p></article>
  </div>;
}
