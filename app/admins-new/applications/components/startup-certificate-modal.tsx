"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  Award,
  ShieldCheck,
  Download,
  CheckCircle2,
  RefreshCw,
  AlertTriangle,
  Printer,
  Trash2,
} from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { setApplicationCertified } from "../application-actions";
import { MintOfficialCertificate } from "@/components/certificate/mint-official/mint-official-certificate";
import {
  CertificateIssuanceLayout,
  CertificateIssuanceSuccessLayout,
} from "@/components/certificate/mint-official/certificate-issuance-layout";
import { useCertificatePdfExport } from "@/hooks/useCertificatePdfExport";
import { CERT_COLORS } from "@/lib/certificate-design-tokens";

interface StartupCertificateModalProps {
  isOpen: boolean;
  onClose: () => void;
  application: {
    id: string;
    name: string;
    type: string;
    location?: string;
    rawStatus?: string;
    [key: string]: unknown;
  } | null;
  onSuccess?: () => void;
}

export function StartupCertificateModal({
  isOpen,
  onClose,
  application,
  onSuccess,
}: StartupCertificateModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [step, setStep] = useState<"preview" | "success">("preview");
  const successCertRef = useRef<HTMLDivElement>(null);
  const { busy, downloadFromApi, printFromApi } =
    useCertificatePdfExport();

  useEffect(() => {
    if (isOpen) setStep("preview");
  }, [isOpen, application?.id]);

  if (!application) return null;

  const currentDate = new Date();
  const issueDate = currentDate.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  const expiryDate = new Date(currentDate);
  expiryDate.setFullYear(expiryDate.getFullYear() + 2);
  const expiryDateString = expiryDate.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const certificateId = `ETH-STP-${application.id.substring(0, 8).toUpperCase()}`;
  const verificationUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}/verify/startup/${application.id}`
      : "";

  const downloadUrl = `/api/certificates/${application.id}/download`;
  const safeFileName = `Startup_Certificate_${application.name.replace(/\s+/g, "_")}.pdf`;

  const subtitle = `${application.type} · Certified startup`.toUpperCase();

  const handleIssue = async () => {
    setIsSubmitting(true);
    try {
      const res = await setApplicationCertified(application.id, true);
      if (res.success) {
        toast.success("Certificate issued and saved successfully");
        setStep("success");
        onSuccess?.();
      } else {
        toast.error(res.message || "Failed to issue certificate");
      }
    } catch {
      toast.error("An error occurred during issuance");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRevoke = async () => {
    if (
      !confirm(
        "Are you sure you want to revoke this certificate? This will remove the official startup status and move the application back to review.",
      )
    )
      return;

    setIsSubmitting(true);
    try {
      const res = await setApplicationCertified(application.id, false);
      if (res.success) {
        toast.success("Certificate revoked successfully");
        onSuccess?.();
        onClose();
      } else {
        toast.error(res.message || "Failed to revoke certificate");
      }
    } catch {
      toast.error("An error occurred during revocation");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDownload = async () => {
    try {
      await downloadFromApi(downloadUrl, safeFileName);
    } catch {
      toast.error("Download failed");
    }
  };

  const handlePrint = async () => {
    try {
      await printFromApi(downloadUrl);
    } catch {
      toast.error("Print failed");
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="flex max-h-[95vh] max-w-[920px] flex-col overflow-hidden rounded-2xl border-none p-0 shadow-2xl [&>button]:text-white [&>button]:opacity-90">
        {step === "preview" ? (
          <CertificateIssuanceLayout
            title="Issue startup certificate"
            headerRight={
              <div className="hidden font-mono text-[10px] font-bold text-white/80 md:block">
                REF: {certificateId}
              </div>
            }
          >
            <div className="grid gap-6 p-4 sm:p-6 lg:grid-cols-12 lg:gap-8">
              <div className="space-y-3 lg:col-span-7">
                <div className="flex items-center justify-between">
                  <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
                    Security layout preview
                  </Label>
                  <Badge
                    variant="outline"
                    className="border-teal-100 bg-teal-50/50 text-[9px] font-bold text-brand-mint-teal"
                  >
                    NSLP registry
                  </Badge>
                </div>
                <MintOfficialCertificate
                  variant="STARTUP"
                  recipientName={application.name}
                  subtitle={subtitle}
                  issueDate={issueDate}
                  expiryDate={expiryDateString}
                  certificateRef={certificateId}
                  verificationUrl={verificationUrl}
                  location={application.location}
                  density="compact"
                />
              </div>
              <div className="flex flex-col gap-5 lg:col-span-5">
                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                    Verification summary
                  </Label>
                  {[
                    {
                      label: "Compliance audit",
                      status: "Verified",
                      icon: ShieldCheck,
                      color: "text-brand-mint-teal",
                      bg: "bg-teal-50",
                    },
                    {
                      label: "Evaluation",
                      status: "Passed",
                      icon: CheckCircle2,
                      color: "text-brand-deep-dark",
                      bg: "bg-slate-50",
                    },
                  ].map((item, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between rounded-xl border border-slate-100 bg-white p-2.5 shadow-sm"
                    >
                      <div className="flex items-center gap-3">
                        <div className={`${item.bg} rounded-lg p-1.5`}>
                          <item.icon className={`h-3.5 w-3.5 ${item.color}`} />
                        </div>
                        <span className="text-[11px] font-bold text-slate-600">
                          {item.label}
                        </span>
                      </div>
                      <Badge
                        variant="outline"
                        className="h-4 border-slate-100 px-1.5 text-[8px] font-black uppercase text-slate-500"
                      >
                        {item.status}
                      </Badge>
                    </div>
                  ))}
                </div>
                <div
                  className="rounded-xl border p-4"
                  style={{
                    borderColor: `${CERT_COLORS.teal}33`,
                    background: `${CERT_COLORS.teal}08`,
                  }}
                >
                  <h4 className="mb-2 flex items-center gap-2 text-[10px] font-black uppercase tracking-wider text-brand-deep-dark">
                    <AlertTriangle className="h-3 w-3" />
                    Legal confirmation
                  </h4>
                  <p className="text-[10px] font-semibold italic leading-relaxed text-brand-deep-dark">
                    Authorizing digital generation and inclusion in the national
                    registry. QR and watermark apply on the official PDF.
                  </p>
                </div>
                <div className="mt-auto space-y-2 border-t pt-3">
                  <Button
                    className="h-12 w-full rounded-xl font-black shadow-lg transition-all"
                    style={{ backgroundColor: CERT_COLORS.teal }}
                    onClick={handleIssue}
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <Award className="mr-2 h-4 w-4" />
                    )}
                    {isSubmitting
                      ? "Securing registry…"
                      : application.rawStatus === "CERTIFIED"
                        ? "Update certificate"
                        : "Issue certificate"}
                  </Button>
                  {application.rawStatus === "CERTIFIED" && (
                    <Button
                      variant="ghost"
                      className="h-10 w-full rounded-xl text-xs font-bold text-red-500 hover:bg-red-50 hover:text-red-700"
                      onClick={handleRevoke}
                      disabled={isSubmitting}
                    >
                      <Trash2 className="mr-2 h-3.5 w-3.5" />
                      Revoke certification
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </CertificateIssuanceLayout>
        ) : (
          <CertificateIssuanceLayout title="Certificate issued">
            <CertificateIssuanceSuccessLayout
              headline="Issuance successful"
              message={
                <>
                  Official recognition for{" "}
                  <span
                    className="font-black"
                    style={{ color: CERT_COLORS.teal }}
                  >
                    {application.name}
                  </span>{" "}
                  is finalized. Download or print the official PDF (always
                  regenerated with the latest template).
                </>
              }
              certificateSlot={
                <div ref={successCertRef} className="mx-auto max-w-lg">
                  <MintOfficialCertificate
                    variant="STARTUP"
                    recipientName={application.name}
                    subtitle={subtitle}
                    issueDate={issueDate}
                    expiryDate={expiryDateString}
                    certificateRef={certificateId}
                    verificationUrl={verificationUrl}
                    location={application.location}
                    density="compact"
                  />
                </div>
              }
              actions={
                <>
                  <Button
                    variant="outline"
                    className="h-11 flex-1 rounded-xl font-bold"
                    onClick={handlePrint}
                    disabled={busy}
                  >
                    <Printer className="mr-2 h-4 w-4" />
                    Print
                  </Button>
                  <Button
                    className="h-11 flex-1 rounded-xl font-bold text-white"
                    style={{ backgroundColor: CERT_COLORS.teal }}
                    onClick={handleDownload}
                    disabled={busy}
                  >
                    <Download className="mr-2 h-4 w-4" />
                    Download PDF
                  </Button>
                </>
              }
              footer={
                <Button
                  variant="ghost"
                  onClick={onClose}
                  className="text-xs font-bold text-slate-400 hover:text-slate-900"
                >
                  Close
                </Button>
              }
            />
          </CertificateIssuanceLayout>
        )}
      </DialogContent>
    </Dialog>
  );
}
