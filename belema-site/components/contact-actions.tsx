import { Mail, MessageCircle, Phone, Send } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { site, telegramShareUrl } from "@/content/site";
import { Button } from "@/components/ui/button";

export async function ContactActions({ compact = false }: { compact?: boolean }) {
  const t = await getTranslations("common");
  const items = [
    { label: t("call"), href: `tel:${site.contact.telephone}`, icon: Phone, external: false },
    { label: t("whatsapp"), href: `${site.contact.whatsappUrl}?text=${encodeURIComponent("Hello, I would like to contact Belema General Trading PLC.")}`, icon: MessageCircle, external: true },
    { label: t("email"), href: `mailto:${site.contact.email}`, icon: Mail, external: false },
    { label: t("telegram"), href: telegramShareUrl("I would like to contact Belema General Trading PLC."), icon: Send, external: true },
  ];
  return <div className="action-row" style={compact ? { marginTop: 0 } : undefined}>
    {items.map(({ label, href, icon: Icon, external }, index) => <Button key={label} asChild variant={index === 0 ? "primary" : "secondary"}>
      <a href={href} {...(external ? { target: "_blank", rel: "noreferrer" } : {})}><Icon size={16} aria-hidden="true" />{label}</a>
    </Button>)}
  </div>;
}
