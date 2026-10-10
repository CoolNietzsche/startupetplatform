"use client";

import { useSyncExternalStore } from "react";
import Script from "next/script";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";

const storageKey = "belema-analytics-consent";
const eventName = "belema-analytics-consent-change";
const plausibleDomain = process.env.NEXT_PUBLIC_PLAUSIBLE_DOMAIN;
const gaId = process.env.NEXT_PUBLIC_GA_ID;
const enabled = Boolean(plausibleDomain || gaId);
type Preference = "accepted" | "declined" | "unset" | "loading";

function subscribe(callback: () => void) {
  window.addEventListener("storage", callback);
  window.addEventListener(eventName, callback);
  return () => {
    window.removeEventListener("storage", callback);
    window.removeEventListener(eventName, callback);
  };
}
function getSnapshot(): Preference {
  const saved = window.localStorage.getItem(storageKey);
  return saved === "accepted" || saved === "declined" ? saved : "unset";
}
function getServerSnapshot(): Preference { return "loading"; }

export function CookieConsent() {
  const t = useTranslations("legal");
  const choice = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  if (!enabled) return null;

  const setPreference = (value: "accepted" | "declined") => {
    window.localStorage.setItem(storageKey, value);
    window.dispatchEvent(new Event(eventName));
  };

  return <>
    {choice === "accepted" && plausibleDomain && <Script strategy="afterInteractive" src="https://plausible.io/js/script.js" data-domain={plausibleDomain} />}
    {choice === "accepted" && gaId && <>
      <Script strategy="afterInteractive" src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`} />
      <Script id="belema-google-analytics" strategy="afterInteractive">{`window.dataLayer = window.dataLayer || []; function gtag(){dataLayer.push(arguments);} gtag('js', new Date()); gtag('config', '${gaId}', { anonymize_ip: true });`}</Script>
    </>}
    {choice === "unset" && <aside className="consent-panel" role="dialog" aria-label={t("analyticsConsentTitle")}>
      <h2>{t("analyticsConsentTitle")}</h2>
      <p>{t("analyticsConsentText")}</p>
      <div className="action-row" style={{ marginTop: 0 }}>
        <Button size="sm" onClick={() => setPreference("accepted")}>{t("acceptAnalytics")}</Button>
        <Button size="sm" variant="secondary" onClick={() => setPreference("declined")}>{t("declineAnalytics")}</Button>
      </div>
    </aside>}
  </>;
}
