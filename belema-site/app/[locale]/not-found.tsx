import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";

export default async function NotFound() {
  const t = await getTranslations("notFound");
  return <main className="container-shell section-pad" id="main-content"><p className="eyebrow">404</p><h1>{t("title")}</h1><p className="muted">{t("text")}</p><div className="action-row"><Button asChild><Link href="/">{t("back")}</Link></Button></div></main>;
}
