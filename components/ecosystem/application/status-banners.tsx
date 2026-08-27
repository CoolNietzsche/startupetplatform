"use client";

import React from "react";
import { AlertCircle, Mail, Award, Calendar, Shield, Download, LayoutDashboard, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";

export function ClarificationBanner({
  application
}: {
  application: any
}) {
  const isClarification = application?.status === "CLARIFICATION_REQUESTED" || application?.status === "clarification_requested" || application?.workflowStatus === "CLARIFICATION_REQUESTED";

  if (!isClarification) return null;

  return (
    <div className="mb-6 sm:mb-12 animate-in fade-in slide-in-from-top duration-700">
      <div className="bg-amber-50/50 rounded-2xl sm:rounded-[2rem] p-5 sm:p-8 border border-amber-200/50 shadow-xl shadow-amber-100/50 flex flex-col lg:flex-row items-center justify-between gap-6 sm:gap-8">
        <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6 text-center sm:text-left">
          <div className="h-14 w-14 sm:h-20 sm:w-20 bg-amber-100 rounded-2xl sm:rounded-3xl flex items-center justify-center shadow-lg shadow-amber-200/50 ring-4 ring-amber-50 shrink-0">
            <AlertCircle className="h-7 w-7 sm:h-10 sm:w-10 text-amber-600" />
          </div>
          <div className="min-w-0">
            <h2 className="text-xl sm:text-2xl font-black tracking-tight text-amber-900 mb-1 uppercase">Clarification Required</h2>
            <p className="text-amber-800/80 font-medium text-sm sm:text-base leading-relaxed max-w-xl">
              The evaluation committee has requested additional information. Your application is currently paused.
            </p>
          </div>
        </div>
        <div className="w-full lg:w-auto">
          <Button
            size="lg"
            className="w-full sm:w-auto bg-amber-600 hover:bg-amber-700 text-white shadow-xl shadow-amber-200 border-none font-black px-8 h-12 sm:h-14 rounded-xl sm:rounded-2xl transition-all hover:scale-[1.02] active:scale-95 uppercase tracking-widest text-xs"
            onClick={() => {
              const el = document.getElementById('messaging-section');
              if (el) el.scrollIntoView({ behavior: 'smooth' });
              // Trigger tab switch if needed (this would require parent state access)
            }}
          >
            <Mail className="h-4 w-4 sm:h-5 sm:w-5 mr-2 sm:mr-3" />
            Respond Now
          </Button>
        </div>
      </div>
    </div>
  );
}

export function CertificateBanner({
  application,
  onViewCertificate
}: {
  application: any;
  onViewCertificate: () => void;
}) {
  if (!application?.certified) return null;

  return (
    <div className="mb-6 sm:mb-12 group animate-in fade-in slide-in-from-top duration-700">
      <div className="relative bg-white rounded-2xl sm:rounded-[2rem] p-5 sm:p-8 shadow-2xl shadow-slate-200/50 overflow-hidden border border-slate-200">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -mr-32 -mt-32 opacity-50" />

        <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-6 sm:gap-8">
          <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6 text-center sm:text-left">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 sm:gap-4 mb-3">
                <h2 className="text-xl sm:text-3xl font-black tracking-tight text-primary uppercase">
                  Certification Complete
                </h2>
                {application.certificate?.certificateNumber && (
                  <Badge className="bg-primary text-white border-none font-black px-3 sm:px-4 py-1 sm:py-1.5 rounded-full shadow-lg shadow-primary/20 uppercase tracking-widest text-[8px] sm:text-[9px]">
                    ID: {application.certificate.certificateNumber}
                  </Badge>
                )}
              </div>
              <p className="text-slate-500 font-medium text-sm sm:text-base leading-relaxed max-w-xl">
                Your organization has satisfied all national ecosystem requirements and is officially certified by the Ministry.
              </p>
              {application.certificate?.issuedAt && (
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 sm:gap-4 mt-5 sm:mt-6">
                  <div className="flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-100">
                    <Calendar className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-slate-400" />
                    <span className="text-[10px] sm:text-xs font-bold text-slate-500 uppercase tracking-wider">
                      Issued {new Date(application.certificate.issuedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 bg-primary/5 px-3 py-1.5 rounded-xl border border-primary/10">
                    <Shield className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-primary" />
                    <span className="text-[10px] sm:text-xs font-black text-primary uppercase tracking-widest">
                      Verified Provider
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>
          
          <div className="flex flex-col xs:flex-row items-stretch gap-3 w-full lg:w-auto">
            <Button
              size="lg"
              className="flex-1 lg:flex-none bg-primary hover:bg-primary/90 text-white shadow-xl shadow-primary/20 border-none font-black px-8 h-12 sm:h-14 rounded-xl sm:rounded-2xl transition-all hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-2 group uppercase tracking-widest text-xs"
              onClick={onViewCertificate}
            >
              <Eye className="h-5 w-5 transition-transform group-hover:scale-110" />
              View Certificate
            </Button>
            <div className="flex items-center gap-2">
              <Button
                size="lg"
                variant="outline"
                className="flex-1 h-12 sm:h-14 rounded-xl sm:rounded-2xl border-slate-200 text-slate-500 hover:bg-slate-50 transition-all font-black px-4"
                asChild
              >
                <Link href="/ecosystem-builder/certifications">
                  <LayoutDashboard className="h-5 w-5" />
                </Link>
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="flex-1 h-12 sm:h-14 rounded-xl sm:rounded-2xl border-slate-200 text-slate-500 hover:bg-slate-50 transition-all font-black px-4"
                onClick={() => application.certificate?.id && window.open(`/api/certificates/${application.certificate.id}/download`, '_blank')}
              >
                <Download className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
