import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";

export async function CtaPanel({ title, text, href = "/contact", buttonLabel }: { title: string; text: string; href?: "/contact" | "/fine-water"; buttonLabel?: string }) {
  const c = await getTranslations("common");
  return <section className="container-shell section-pad" aria-label={title}>
    <div className="cta-panel gradient-panel">
      <div><h2>{title}</h2><p>{text}</p></div>
      <Button variant="light" asChild><Link href={href}>{buttonLabel || c("contactUs")}</Link></Button>
    </div>
  </section>;
}
