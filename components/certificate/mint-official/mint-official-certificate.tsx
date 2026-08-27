"use client";

import Image from "next/image";
import { forwardRef } from "react";
import { QRCodeSVG } from "qrcode.react";
import { Great_Vibes } from "next/font/google";
import { cn } from "@/lib/utils";
import { CERT_COLORS } from "@/lib/certificate-design-tokens";
import { getOfficialCertificateCopy } from "@/lib/certificate-official-copy";
import type { MintOfficialCertificateProps } from "./types";

const script = Great_Vibes({ weight: "400", subsets: ["latin"] });

const qrSize = { compact: 64, comfortable: 96 } as const;

const QR_FG = "hsl(var(--mint-teal))";
const QR_BG = "#FFFFFF";

function SignatureLeft({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 140 44"
      className={cn("text-slate-800", className)}
      aria-hidden
    >
      <path
        d="M8 32 C 22 10, 38 38, 58 22 S 88 36, 108 18 S 128 28, 132 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.35"
        strokeLinecap="round"
      />
    </svg>
  );
}

function SignatureRight({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 140 44"
      className={cn("text-slate-800", className)}
      aria-hidden
    >
      <path
        d="M12 26 Q 35 8, 52 30 T 96 20 Q 118 12, 128 30"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.35"
        strokeLinecap="round"
      />
    </svg>
  );
}

export const MintOfficialCertificate = forwardRef<
  HTMLDivElement,
  MintOfficialCertificateProps
>(function MintOfficialCertificate(
  {
    variant,
    recipientName,
    subtitle,
    issueDate,
    expiryDate,
    certificateRef,
    verificationUrl,
    location,
    density = "comfortable",
    className,
  },
  ref,
) {
  const copy = getOfficialCertificateCopy(variant);
  const qr = qrSize[density];
  const isCompact = density === "compact";

  return (
    <div
      ref={ref}
      className={cn(
        "relative w-full overflow-hidden bg-white shadow-xl",
        isCompact ? "max-w-xl rounded-md" : "max-w-5xl rounded-sm",
        className,
      )}
      style={{
        aspectRatio: "297 / 210",
        color: CERT_COLORS.slate900,
        boxShadow:
          "0 0 0 1px rgb(203 213 225), 0 25px 50px -12px rgb(0 0 0 / 0.15)",
      }}
    >
      {/* Security watermark */}
      <div
        className="pointer-events-none absolute inset-0 flex items-center justify-center overflow-hidden text-[10vw] font-black uppercase leading-none opacity-[0.035] sm:text-[3.5rem]"
        style={{ color: CERT_COLORS.teal, transform: "rotate(-18deg)" }}
        aria-hidden
      >
        NSLP · {certificateRef} · VERIFY
      </div>
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.05]"
        style={{
          background: `repeating-linear-gradient(-12deg, transparent, transparent 10px, ${CERT_COLORS.teal}1a 10px, ${CERT_COLORS.teal}1a 11px)`,
        }}
        aria-hidden
      />

      <div
        className="h-1 w-full shrink-0"
        style={{ backgroundColor: CERT_COLORS.teal }}
      />

      <div className="relative flex h-[calc(100%-0.25rem)] flex-col">
        <div
          className="pointer-events-none absolute top-1/2 left-0 z-[1] h-2.5 w-2.5 -translate-y-1/2 rotate-45 border border-white/80"
          style={{
            backgroundColor: CERT_COLORS.teal,
            marginLeft: "3px",
            boxShadow: "0 0 0 1px rgb(203 213 225)",
          }}
        />
        <div
          className="pointer-events-none absolute top-1/2 right-0 z-[1] h-2.5 w-2.5 -translate-y-1/2 rotate-45 border border-white/80"
          style={{
            backgroundColor: CERT_COLORS.teal,
            marginRight: "3px",
            boxShadow: "0 0 0 1px rgb(203 213 225)",
          }}
        />

        {/* Header: logo | title | QR */}
        <header
          className={cn(
            "grid shrink-0 items-center gap-3 border-b border-slate-200/90 bg-white",
            isCompact
              ? "grid-cols-[4rem_1fr_auto] px-2.5 py-2"
              : "grid-cols-[6.5rem_1fr_auto] px-5 py-3.5",
          )}
        >
          <div
            className={cn(
              "relative flex items-center justify-start",
              isCompact ? "h-14 w-16" : "h-[4.5rem] w-[5.5rem]",
            )}
          >
            <Image
              src="/Mint_Logo.png"
              alt=""
              fill
              className="object-contain object-left"
              sizes={isCompact ? "64px" : "96px"}
            />
          </div>
          <div className="min-w-0 text-center">
            <h2
              className={cn(
                "font-serif font-extrabold uppercase tracking-[0.2em] text-slate-900",
                isCompact
                  ? "text-[0.5rem] leading-tight sm:text-[0.55rem]"
                  : "text-[0.7rem] sm:text-sm md:text-base lg:text-lg",
              )}
            >
              {copy.documentTitle}
            </h2>
            <p
              className={cn(
                "mt-1 font-semibold uppercase tracking-[0.15em] text-brand-deep-dark",
                isCompact ? "text-[0.3rem]" : "text-[0.55rem] sm:text-xs",
              )}
            >
              {copy.recognitionLine}
            </p>
          </div>
          {verificationUrl ? (
            <div
              className={cn(
                "rounded-2xl border-2 border-slate-200 bg-white p-1 shadow-md",
                isCompact ? "shadow-sm" : "",
              )}
              title="Scan to verify authenticity"
            >
              <QRCodeSVG
                value={verificationUrl}
                size={qr}
                level="M"
                fgColor={QR_FG}
                bgColor={QR_BG}
              />
            </div>
          ) : (
            <div />
          )}
        </header>

        {/* Body */}
        <div
          className={cn(
            "relative z-0 flex min-h-0 flex-1 flex-col items-center overflow-hidden bg-white",
            isCompact ? "px-3 py-2" : "px-8 py-3 sm:py-4",
          )}
        >
          <p
            className={cn(
              "text-slate-600",
              isCompact ? "text-[0.38rem]" : "text-xs sm:text-sm",
            )}
          >
            {copy.presentedLead}
          </p>
          <p
            className={cn(
              script.className,
              "mt-0.5 max-w-[96%] text-center leading-none text-slate-900",
              isCompact
                ? "text-lg sm:text-xl"
                : "text-3xl sm:text-4xl md:text-5xl lg:text-6xl",
            )}
          >
            {recipientName}
          </p>
          {location ? (
            <p
              className={cn(
                "mt-1 font-semibold uppercase tracking-wider text-brand-mint-teal",
                isCompact ? "text-[0.32rem]" : "text-[0.65rem]",
              )}
            >
              {location}
            </p>
          ) : null}

          <div
            className={cn(
              "my-1.5 rotate-45 rounded-[1px] border border-white/50 shadow-sm",
              isCompact ? "h-1.5 w-1.5" : "h-2 w-2",
            )}
            style={{ backgroundColor: CERT_COLORS.teal }}
            aria-hidden
          />

          <div
            className={cn(
              "w-full max-w-3xl text-slate-600",
              isCompact
                ? "line-clamp-4 text-[0.34rem] leading-snug"
                : "text-[0.7rem] leading-relaxed sm:text-sm",
            )}
            style={{ textAlign: "justify", textJustify: "inter-word" }}
          >
            {copy.bodyParagraphs.map((p, i) => (
              <p key={i} className={i > 0 ? "mt-1.5" : ""}>
                {p}
              </p>
            ))}
          </div>

          <div
            className={cn(
              "mt-2 inline-block border border-brand-deep-dark/20 px-3 py-1 font-black uppercase tracking-[0.12em] text-white shadow-sm",
              isCompact ? "text-[0.32rem]" : "text-[0.65rem] sm:text-xs",
            )}
            style={{
              background: `linear-gradient(180deg, ${CERT_COLORS.navy}, #0a3d4f)`,
            }}
          >
            {subtitle}
          </div>
        </div>

        {/* Footer: signatures + seal */}
        <footer
          className={cn(
            "grid shrink-0 border-t border-slate-200 bg-white",
            isCompact
              ? "grid-cols-3 gap-1 px-2 py-2"
              : "grid-cols-3 gap-3 px-5 py-3",
          )}
        >
          <div className="flex min-w-0 flex-col items-start justify-end">
            <SignatureLeft
              className={isCompact ? "h-5 w-20" : "h-8 w-28"}
            />
            <div
              className={cn(
                "w-full border-b border-dotted border-slate-400",
                isCompact ? "mb-0.5" : "mb-1",
              )}
            />
            <p
              className={cn(
                "font-serif text-slate-800",
                isCompact ? "text-[0.28rem]" : "text-[0.65rem]",
              )}
            >
              Issue date: {issueDate}
            </p>
            <p
              className={cn(
                "text-slate-500",
                isCompact ? "text-[0.26rem]" : "text-[0.6rem]",
              )}
            >
              Valid until: {expiryDate}
            </p>
          </div>

          <div className="flex flex-col items-center justify-end">
            <div className="relative flex flex-col items-center">
              <div
                className={cn(
                  "flex flex-col items-center justify-center rounded-full border-[3px] text-center font-black leading-tight text-brand-deep-dark shadow-lg",
                  isCompact ? "h-11 w-11 text-[0.22rem]" : "h-[4.25rem] w-[4.25rem] text-[0.45rem]",
                )}
                style={{
                  borderColor: "#d4a017",
                  background:
                    "linear-gradient(160deg, #fffbeb 0%, #fde68a 45%, #fbbf24 100%)",
                  boxShadow:
                    "0 4px 14px rgba(0,0,0,0.12), inset 0 1px 0 rgba(255,255,255,0.8)",
                }}
              >
                OFFICIAL
                <br />
                SEAL
              </div>
              <div className="mt-0.5 flex gap-1">
                <div
                  className={cn(
                    "rounded-b-sm bg-brand-mint-teal",
                    isCompact ? "h-3 w-1.5" : "h-4 w-2",
                  )}
                />
                <div
                  className={cn(
                    "rounded-b-sm bg-brand-mint-teal",
                    isCompact ? "h-3 w-1.5" : "h-4 w-2",
                  )}
                />
              </div>
            </div>
          </div>

          <div className="flex min-w-0 flex-col items-end justify-end text-right">
            <SignatureRight
              className={isCompact ? "h-5 w-20" : "h-8 w-28"}
            />
            <div
              className={cn(
                "w-full border-b border-dotted border-slate-400",
                isCompact ? "mb-0.5" : "mb-1",
              )}
            />
            <p
              className={cn(
                "font-serif text-slate-800",
                isCompact ? "text-[0.28rem]" : "text-[0.65rem]",
              )}
            >
              Authorized signature
            </p>
            <p
              className={cn(
                "font-mono font-semibold text-slate-500",
                isCompact ? "text-[0.24rem]" : "text-[0.55rem]",
              )}
            >
              Credential: {certificateRef}
            </p>
          </div>
        </footer>

        {/* Decorative bottom band */}
        <div
          className={cn(
            "relative w-full shrink-0 overflow-hidden",
            isCompact ? "h-2.5" : "h-3.5",
          )}
          style={{
            background: `
              repeating-linear-gradient(
                90deg,
                hsl(var(--mint-teal) / 0.22) 0,
                hsl(var(--mint-teal) / 0.22) 4px,
                transparent 4px,
                transparent 10px
              ),
              repeating-linear-gradient(
                -45deg,
                transparent,
                transparent 3px,
                hsl(var(--mint-teal) / 0.08) 3px,
                hsl(var(--mint-teal) / 0.08) 4px
              ),
              linear-gradient(180deg, #f8fafc 0%, #e2e8f0 100%)
            `,
          }}
          aria-hidden
        />
      </div>

      <div
        className="h-1 w-full shrink-0"
        style={{ backgroundColor: CERT_COLORS.teal }}
      />
    </div>
  );
});
