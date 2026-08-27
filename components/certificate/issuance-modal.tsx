"use client";

import React, { useEffect, useMemo, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Loader2, Award, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { MintOfficialCertificate } from "@/components/certificate/mint-official/mint-official-certificate";
import { CERT_COLORS } from "@/lib/certificate-design-tokens";

interface IssuanceModalProps {
  isOpen: boolean;
  onClose: () => void;
  application: {
    id: string;
    name: string;
    type?: string;
    location?: string;
    [key: string]: unknown;
  };
  onIssue: (data: {
    certificateNumber: string;
    issuedAt: Date;
    expiresAt: Date | null;
  }) => Promise<void>;
}

export function EcosystemIssuanceModal({
  isOpen,
  onClose,
  application,
  onIssue,
}: IssuanceModalProps) {
  const [loading, setLoading] = useState(false);
  const [certNumber, setCertNumber] = useState(
    () => `NSLP-ECO-${application.id.slice(0, 8).toUpperCase()}`,
  );
  const [issueDate, setIssueDate] = useState(
    () => new Date().toISOString().split("T")[0],
  );
  const [expiryDate, setExpiryDate] = useState("");

  useEffect(() => {
    setCertNumber(`NSLP-ECO-${application.id.slice(0, 8).toUpperCase()}`);
  }, [application.id]);

  const verificationUrl = useMemo(() => {
    if (typeof window === "undefined") return "";
    return `${window.location.origin}/verify/eco/${application.id}`;
  }, [application.id]);

  const issuePretty = useMemo(() => {
    const d = new Date(issueDate);
    return d.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  }, [issueDate]);

  const expiryPretty = useMemo(() => {
    if (expiryDate) {
      return new Date(expiryDate).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    }
    const d = new Date(issueDate);
    d.setFullYear(d.getFullYear() + 2);
    return d.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  }, [expiryDate, issueDate]);

  const subtitle = (application.type || "Ecosystem builder").toUpperCase();

  const handleIssue = async () => {
    setLoading(true);
    try {
      await onIssue({
        certificateNumber: certNumber,
        issuedAt: new Date(issueDate),
        expiresAt: expiryDate ? new Date(expiryDate) : null,
      });
      toast.success("Certificate issued successfully");
      onClose();
    } catch {
      toast.error("Failed to issue certificate");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="flex h-[90vh] max-w-6xl flex-col overflow-hidden border-none bg-slate-50 p-0 shadow-2xl">
        <div className="flex flex-1 flex-col overflow-hidden lg:flex-row">
          <div className="flex w-full flex-col gap-8 overflow-y-auto border-b border-slate-200 bg-white p-8 lg:w-1/3 lg:border-b-0 lg:border-r">
            <DialogHeader className="p-0">
              <div
                className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl"
                style={{ background: `${CERT_COLORS.teal}18` }}
              >
                <Award className="h-6 w-6" style={{ color: CERT_COLORS.teal }} />
              </div>
              <DialogTitle className="text-2xl font-black uppercase tracking-tight text-slate-900">
                Accreditation setup
              </DialogTitle>
              <DialogDescription className="text-sm font-medium text-slate-500">
                Configure credentials for {application.name}.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-6">
              <div className="space-y-2">
                <Label
                  htmlFor="certNum"
                  className="text-[10px] font-black uppercase tracking-widest text-slate-400"
                >
                  Certificate ID
                </Label>
                <Input
                  id="certNum"
                  value={certNumber}
                  onChange={(e) => setCertNumber(e.target.value)}
                  className="h-12 border-slate-200 bg-slate-50 font-bold"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                    Issue date
                  </Label>
                  <Input
                    type="date"
                    value={issueDate}
                    onChange={(e) => setIssueDate(e.target.value)}
                    className="h-12 border-slate-200 bg-slate-50 font-bold"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                    Expiry (optional)
                  </Label>
                  <Input
                    type="date"
                    value={expiryDate}
                    onChange={(e) => setExpiryDate(e.target.value)}
                    className="h-12 border-slate-200 bg-slate-50 font-bold"
                  />
                </div>
              </div>

              <Card
                className="rounded-2xl border p-4"
                style={{
                  borderColor: `${CERT_COLORS.teal}33`,
                  background: `${CERT_COLORS.teal}0d`,
                }}
              >
                <div className="flex gap-3">
                  <CheckCircle2
                    className="h-5 w-5 shrink-0"
                    style={{ color: CERT_COLORS.teal }}
                  />
                  <p className="text-xs font-medium text-slate-600 leading-relaxed">
                    By issuing, you accredit{" "}
                    <span className="font-bold text-slate-900">
                      {application.name}
                    </span>{" "}
                    as a verified ecosystem builder. Preview matches the official
                    PDF layout.
                  </p>
                </div>
              </Card>

              <div className="border-t border-slate-100 pt-4">
                <Button
                  onClick={handleIssue}
                  disabled={loading}
                  className="h-14 w-full rounded-2xl font-black uppercase tracking-widest text-xs text-white shadow-xl transition-all"
                  style={{ backgroundColor: CERT_COLORS.teal }}
                >
                  {loading ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    "Finalize & issue"
                  )}
                </Button>
                <Button
                  variant="ghost"
                  onClick={onClose}
                  className="mt-2 h-12 w-full text-[10px] font-bold uppercase tracking-widest text-slate-400"
                >
                  Cancel
                </Button>
              </div>
            </div>
          </div>

          <div className="hidden flex-1 flex-col overflow-y-auto bg-slate-100 p-6 lg:flex">
            <p className="mb-4 text-[10px] font-black uppercase tracking-widest text-slate-500">
              Live preview (mint template)
            </p>
            <div className="mx-auto w-full max-w-2xl">
              <MintOfficialCertificate
                variant="ECOSYSTEM"
                recipientName={application.name}
                subtitle={subtitle}
                issueDate={issuePretty}
                expiryDate={expiryPretty}
                certificateRef={certNumber}
                verificationUrl={verificationUrl}
                location={application.location}
                density="compact"
              />
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
