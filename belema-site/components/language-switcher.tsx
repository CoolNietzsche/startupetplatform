"use client";

import { useLocale, useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";

export function LanguageSwitcher() {
  const locale = useLocale() as Locale;
  const pathname = usePathname();
  const t = useTranslations("nav");
  return (
    <nav className="language-switch" aria-label={t("language")}>
      <Link href={pathname} locale="en" aria-current={locale === "en" ? "true" : undefined} hrefLang="en">EN</Link>
      <Link href={pathname} locale="am" aria-current={locale === "am" ? "true" : undefined} hrefLang="am">አማ</Link>
    </nav>
  );
}
