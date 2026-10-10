"use client";

import { useEffect, useId, useRef, useState, type FormEvent } from "react";
import Script from "next/script";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";

export type InquiryType = "water-wholesale" | "import-quote" | "export-inquiry" | "general-contact";
type TurnstileApi = { render: (container: HTMLElement, options: Record<string, unknown>) => string; remove: (id: string) => void };
declare global { interface Window { turnstile?: TurnstileApi } }

export function InquiryForm({ type }: { type: InquiryType }) {
  const t = useTranslations("form");
  const id = useId();
  const containerRef = useRef<HTMLDivElement>(null);
  const widgetRef = useRef<string | null>(null);
  const [token, setToken] = useState("");
  const [status, setStatus] = useState<{ kind: "success" | "error"; message: string } | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;
  const testMode = process.env.NEXT_PUBLIC_INQUIRY_TEST_MODE === "true";
  const ready = Boolean(siteKey) || testMode;

  useEffect(() => {
    if (!siteKey || !containerRef.current) return;
    let disposed = false;
    const renderWidget = () => {
      if (disposed || !containerRef.current || !window.turnstile || widgetRef.current) return;
      widgetRef.current = window.turnstile.render(containerRef.current, {
        sitekey: siteKey,
        callback: (value: string) => setToken(value),
        "expired-callback": () => setToken(""),
        "error-callback": () => setToken(""),
        theme: "light",
      });
    };
    if (window.turnstile) renderWidget();
    const script = document.querySelector<HTMLScriptElement>("script[data-belema-turnstile]");
    if (script) script.addEventListener("load", renderWidget);
    return () => {
      disposed = true;
      script?.removeEventListener("load", renderWidget);
      if (widgetRef.current && window.turnstile) window.turnstile.remove(widgetRef.current);
      widgetRef.current = null;
    };
  }, [siteKey]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!ready || submitting) return;
    const form = event.currentTarget;
    const data = new FormData(form);
    setSubmitting(true);
    setStatus(null);
    try {
      const response = await fetch("/api/inquiry", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          type,
          name: data.get("name"),
          company: data.get("company"),
          email: data.get("email"),
          phone: data.get("phone"),
          message: data.get("message"),
          website: data.get("website"),
          turnstileToken: testMode ? "test-token" : token,
        }),
      });
      if (!response.ok) {
        const result = await response.json().catch(() => ({}));
        const message = response.status === 429 ? t("rateLimited") : t("error");
        setStatus({ kind: "error", message: result.error === "not_configured" ? t("serviceUnavailable") : message });
        return;
      }
      form.reset();
      setToken("");
      setStatus({ kind: "success", message: t("success") });
    } catch {
      setStatus({ kind: "error", message: t("error") });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form className="form-shell" onSubmit={handleSubmit} data-testid="inquiry-form" noValidate>
      <input type="hidden" name="type" value={type} />
      <div aria-hidden="true" style={{ position: "absolute", width: 1, height: 1, overflow: "hidden", clipPath: "inset(50%)" }}>
        <label htmlFor={`${id}-website`}>Leave this field empty</label>
        <input id={`${id}-website`} name="website" tabIndex={-1} autoComplete="off" />
      </div>
      <div className="form-grid">
        <div className="form-field">
          <label htmlFor={`${id}-name`}>{t("name")} <span aria-hidden="true">*</span></label>
          <input id={`${id}-name`} name="name" autoComplete="name" required maxLength={100} minLength={2} />
        </div>
        <div className="form-field">
          <label htmlFor={`${id}-company`}>{t("company")}</label>
          <input id={`${id}-company`} name="company" autoComplete="organization" maxLength={150} />
        </div>
        <div className="form-field">
          <label htmlFor={`${id}-email`}>{t("email")}</label>
          <input id={`${id}-email`} name="email" type="email" autoComplete="email" maxLength={254} />
        </div>
        <div className="form-field">
          <label htmlFor={`${id}-phone`}>{t("phone")}</label>
          <input id={`${id}-phone`} name="phone" type="tel" autoComplete="tel" maxLength={40} />
        </div>
        <p className="form-help form-field-full">{t("replyChoice")}</p>
        <div className="form-field form-field-full">
          <label htmlFor={`${id}-message`}>{t("message")} <span aria-hidden="true">*</span></label>
          <textarea id={`${id}-message`} name="message" required minLength={10} maxLength={3000} />
        </div>
      </div>
      {siteKey ? <div className="turnstile-box" aria-label={t("turnstileLabel")}><div ref={containerRef} /></div> : testMode ? <input type="hidden" name="turnstileToken" value="test-token" /> : <p className="notice turnstile-box">{t("serviceUnavailable")}</p>}
      <p className="form-help" style={{ marginBlock: "0.75rem" }}>{t("consent")}</p>
      <Button type="submit" disabled={!ready || submitting || (!testMode && !token)}>{submitting ? t("sending") : t("submit")}</Button>
      {siteKey && <Script src="https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit" strategy="afterInteractive" data-belema-turnstile="true" />}
      <div className="form-status" aria-live="polite" aria-atomic="true" data-status={status?.kind} hidden={!status}>{status?.message}</div>
    </form>
  );
}
