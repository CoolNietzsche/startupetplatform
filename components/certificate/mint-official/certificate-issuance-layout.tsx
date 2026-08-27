"use client";

import type { ReactNode } from "react";
import { DialogTitle } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { CERT_COLORS } from "@/lib/certificate-design-tokens";

type Props = {
  title: string;
  headerRight?: ReactNode;
  children: ReactNode;
  className?: string;
};

/** Shared mint header for startup + ecosystem issuance dialogs. */
export function CertificateIssuanceLayout({
  title,
  headerRight,
  children,
  className,
}: Props) {
  return (
    <div className={cn("flex max-h-[95vh] flex-col overflow-hidden bg-white", className)}>
      <div
        className="relative shrink-0 border-b border-white/10 px-4 py-3 shadow-md"
        style={{ background: `linear-gradient(135deg, ${CERT_COLORS.teal}, ${CERT_COLORS.navy})` }}
      >
        <div className="flex items-center justify-between gap-3 pr-8">
          <DialogTitle className="text-base font-black tracking-tight text-white sm:text-lg">
            {title}
          </DialogTitle>
          {headerRight}
        </div>
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto">{children}</div>
    </div>
  );
}

type SuccessProps = {
  headline: string;
  message: ReactNode;
  certificateSlot: ReactNode;
  actions: ReactNode;
  footer?: ReactNode;
};

export function CertificateIssuanceSuccessLayout({
  headline,
  message,
  certificateSlot,
  actions,
  footer,
}: SuccessProps) {
  return (
    <div className="animate-in fade-in zoom-in flex flex-1 flex-col items-center overflow-y-auto p-6 duration-500 sm:p-10">
      <h2 className="mb-2 text-center text-xl font-black tracking-tight text-slate-900">
        {headline}
      </h2>
      <div className="mb-6 max-w-sm text-center text-xs font-medium text-slate-500 sm:text-sm">
        {message}
      </div>
      <div className="mb-8 w-full max-w-lg">{certificateSlot}</div>
      <div className="mb-6 flex w-full max-w-md flex-col gap-3 sm:flex-row">{actions}</div>
      {footer}
    </div>
  );
}
