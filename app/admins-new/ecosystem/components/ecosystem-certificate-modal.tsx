"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  Award,
  ShieldCheck,
  Download,
  CheckCircle2,
  RefreshCw,
  AlertTriangle,
  FileText,
  Printer,
  ChevronRight,
  MapPin,
} from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { setEcosystemBuilderCertified } from "../ecosystem-actions";
import { MintOfficialCertificate } from "@/components/certificate/mint-official/mint-official-certificate";
import {
  CertificateIssuanceLayout,
  CertificateIssuanceSuccessLayout,
} from "@/components/certificate/mint-official/certificate-issuance-layout";
import { useCertificatePdfExport } from "@/hooks/useCertificatePdfExport";
import { CERT_COLORS } from "@/lib/certificate-design-tokens";

interface EcosystemCertificateModalProps {
  isOpen: boolean;
  onClose: () => void;
  /** Ecosystem builder id — passed to setEcosystemBuilderCertified */
  builder: {
    id: string;
    name: string;
    type: string;
    location?: string;
    applicationId?: string;
    [key: string]: unknown;
  } | null;
  /** Eco application id — required for PDF download API */
  ecoApplicationId?: string;
  onSuccess?: () => void;
}

export function EcosystemCertificateModal({
  isOpen,
  onClose,
  builder,
  ecoApplicationId: ecoApplicationIdProp,
  onSuccess,
}: EcosystemCertificateModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [step, setStep] = useState<"preview" | "success">("preview");
  const successCertRef = useRef<HTMLDivElement>(null);
  const { busy, downloadFromApi, printFromApi } =
    useCertificatePdfExport();

  useEffect(() => {
    if (isOpen) setStep("preview");
  }, [isOpen, builder?.id]);

  if (!builder) return null;

  const ecoApplicationId =
    ecoApplicationIdProp || builder.applicationId || "";

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

  const certificateId = `ETH-ECO-${builder.id.substring(0, 8).toUpperCase()}`;
  const verificationUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}/verify/ecosystem/${builder.id}`
      : "";

  const downloadUrl = ecoApplicationId
    ? `/api/certificates/${ecoApplicationId}/download`
    : "";

  const safeFileName = `Ecosystem_Certificate_${builder.name.replace(/\s+/g, "_")}.pdf`;
  const subtitle = builder.type.toUpperCase();

  const handleIssue = async () => {
    setIsSubmitting(true);
    try {
      const res = await setEcosystemBuilderCertified(builder.id, true);
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

  const handleDownload = async () => {
    if (!downloadUrl) {
      toast.error("Missing application id for download");
      return;
    }
    try {
      await downloadFromApi(downloadUrl, safeFileName);
    } catch {
      toast.error("Download failed");
    }
  };

  const handlePrint = async () => {
    if (!downloadUrl) {
      toast.error("Missing application id for print");
      return;
    }
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
          <CertificateIssuanceLayout title="Issue ecosystem builder certificate">
            <div className="grid gap-6 p-4 sm:p-6 lg:grid-cols-12 lg:gap-8">
              <div className="space-y-3 lg:col-span-7">
                <div className="flex items-center justify-between">
                  <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
                    Document security preview
                  </Label>
                  <Badge
                    variant="outline"
                    className="border-teal-100 bg-teal-50/50 text-[9px] font-bold text-emerald-700"
                  >
                    NSLP registry
                  </Badge>
                </div>
                <MintOfficialCertificate
                  variant="ECOSYSTEM"
                  recipientName={builder.name}
                  subtitle={subtitle}
                  issueDate={issueDate}
                  expiryDate={expiryDateString}
                  certificateRef={certificateId}
                  verificationUrl={verificationUrl}
                  location={builder.location}
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
                      label: "Registry compliance",
                      status: "Verified",
                      icon: ShieldCheck,
                      color: "text-emerald-600",
                      bg: "bg-emerald-50",
                    },
                    {
                      label: "Technical audit",
                      status: "Passed",
                      icon: CheckCircle2,
                      color: "text-blue-600",
                      bg: "bg-blue-50",
                    },
                    {
                      label: "Regional consent",
                      status: "Obtained",
                      icon: CheckCircle2,
                      color: "text-emerald-600",
                      bg: "bg-emerald-50",
                    },
                  ].map((item, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between rounded-xl border border-slate-100 bg-white p-3 shadow-sm"
                    >
                      <div className="flex items-center gap-3">
                        <div className={`${item.bg} rounded-lg p-2`}>
                          <item.icon className={`h-4 w-4 ${item.color}`} />
                        </div>
                        <span className="text-xs font-bold text-slate-600">
                          {item.label}
                        </span>
                      </div>
                      <Badge
                        variant="outline"
                        className="h-5 border-slate-100 px-2 text-[9px] font-black uppercase text-slate-500"
                      >
                        {item.status}
                      </Badge>
                    </div>
                  ))}
                </div>
                <div className="rounded-2xl border border-emerald-100 bg-white p-5 shadow-sm">
                  <h4 className="mb-2 flex items-center gap-2 text-xs font-black uppercase tracking-wider text-emerald-900">
                    <AlertTriangle className="h-3 w-3" />
                    Legal declaration
                  </h4>
                  <p className="text-[11px] font-medium leading-relaxed text-emerald-800">
                    By proceeding, you authorize generation of this credential and
                    its inclusion in the official registry. QR and watermark apply on
                    the PDF.
                  </p>
                </div>
                <div className="flex items-start gap-2 text-[10px] text-slate-500">
                  <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0 text-brand-mint-teal" />
                  {builder.location || "Location on file"}
                </div>
                <Button
                  className="h-14 w-full rounded-2xl border-none font-black uppercase text-white shadow-xl transition-all"
                  style={{ backgroundColor: CERT_COLORS.teal }}
                  onClick={handleIssue}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <RefreshCw className="mr-2 h-5 w-5 animate-spin" />
                  ) : (
                    <Award className="mr-2 h-5 w-5" style={{ color: CERT_COLORS.gold }} />
                  )}
                  {isSubmitting ? "Authenticating…" : "Sign & issue certificate"}
                  {!isSubmitting && (
                    <ChevronRight className="ml-2 h-5 w-5 opacity-60" />
                  )}
                </Button>
              </div>
            </div>
          </CertificateIssuanceLayout>
        ) : (
          <CertificateIssuanceLayout title="Certification complete">
            <CertificateIssuanceSuccessLayout
              headline="Certification complete"
              message={
                <>
                  Certificate for{" "}
                  <span className="font-black text-brand-mint-teal">{builder.name}</span>{" "}
                  is registered. Download or print the official PDF.
                </>
              }
              certificateSlot={
                <div ref={successCertRef} className="mx-auto max-w-lg">
                  <MintOfficialCertificate
                    variant="ECOSYSTEM"
                    recipientName={builder.name}
                    subtitle={subtitle}
                    issueDate={issueDate}
                    expiryDate={expiryDateString}
                    certificateRef={certificateId}
                    verificationUrl={verificationUrl}
                    location={builder.location}
                    density="compact"
                  />
                </div>
              }
              actions={
                <>
                  <Button
                    variant="outline"
                    className="h-12 flex-1 rounded-2xl font-black uppercase"
                    onClick={handlePrint}
                    disabled={busy || !downloadUrl}
                  >
                    <Printer className="mr-2 h-4 w-4" />
                    Print
                  </Button>
                  <Button
                    className="h-12 flex-1 rounded-2xl font-black uppercase text-white"
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
                <div className="flex flex-col items-center gap-3">
                  <Button
                    variant="link"
                    onClick={onClose}
                    className="font-bold text-slate-500"
                  >
                    Back to portal
                  </Button>
                  <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-slate-400">
                    <FileText className="h-3 w-3" />
                    Digital asset secured
                  </div>
                </div>
              }
            />
          </CertificateIssuanceLayout>
        )}
      </DialogContent>
    </Dialog>
  );
}
