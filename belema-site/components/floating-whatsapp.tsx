import { MessageCircle } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { site } from "@/content/site";

export async function FloatingWhatsApp() {
  const t = await getTranslations("common");
  return <a className="floating-whatsapp" href={`${site.contact.whatsappUrl}?text=${encodeURIComponent("Hello, I would like to contact Belema General Trading PLC.")}`} target="_blank" rel="noreferrer" aria-label={`${t("whatsapp")} — ${site.contact.mobileDisplay}`}><MessageCircle size={19} aria-hidden="true" /><span>{t("whatsapp")}</span></a>;
}
