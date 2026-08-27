"use client";

import React, { useState, useEffect } from "react";
import { CheckCircle, XCircle, Clock, RefreshCw, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import { verifyStartupDocument, completeStartupPreAssessment } from "../application-actions";
import { getChecklist } from "@/lib/directive/pre-assessment";

interface Props {
  applicationId: string;
  status: string;
  submittedAt: string | null;
  hasBusinessLicense: boolean;
  hasArticlesOfIncorp: boolean;
  hasPitchDeck: boolean;
  hasFinancials: boolean;
  initialDocVerification: any[];
}

export default function StartupDocumentChecklist({
  applicationId, status, submittedAt, hasBusinessLicense, hasArticlesOfIncorp, hasPitchDeck, hasFinancials, initialDocVerification,
}: Props) {
  const [docVerification, setDocVerification] = useState<any[]>(initialDocVerification || []);
  const [verifyingDoc, setVerifyingDoc] = useState<string | null>(null);
  const [completingPre, setCompletingPre] = useState(false);

  const checklistItems = getChecklist("startup").map(item => ({
    ...item,
    isUploaded: item.id === "startup_business_license" ? hasBusinessLicense
      : item.id === "startup_articles_incorp" ? hasArticlesOfIncorp
      : item.id === "startup_pitch_deck" ? hasPitchDeck
      : item.id === "startup_financials" ? hasFinancials
      : item.id === "startup_founders_id" ? true
      : false,
  }));

  const verifiedCount = docVerification.filter(v => v.status === "VERIFIED").length;

  // Live SLA countdown
  const slaDeadline = submittedAt ? new Date(new Date(submittedAt).getTime() + 5 * 24 * 60 * 60 * 1000) : null;
  const [timeLeft, setTimeLeft] = useState<string | null>(null);
  const [slaOverdue, setSlaOverdue] = useState(false);

  useEffect(() => {
    if (!slaDeadline) return;
    const update = () => {
      const now = new Date();
      const diffMs = slaDeadline.getTime() - now.getTime();
      setSlaOverdue(diffMs <= 0);
      if (diffMs <= 0) {
        const overdueMs = Math.abs(diffMs);
        const d = Math.floor(overdueMs / (1000 * 60 * 60 * 24));
        const h = Math.floor((overdueMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        setTimeLeft(`Overdue by ${d}d ${h}h`);
      } else {
        const d = Math.floor(diffMs / (1000 * 60 * 60 * 24));
        const h = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const m = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
        if (d > 0) setTimeLeft(`${d}d ${h}h remaining`);
        else setTimeLeft(`${h}h ${m}m remaining`);
      }
    };
    update();
    const interval = setInterval(update, 60000);
    return () => clearInterval(interval);
  }, [slaDeadline]);

  const isUnderReview = status === "UNDER_REVIEW";
  const isReviewed = status === "REVIEWED";
  const isLocked = isReviewed || status === "CERTIFIED" || status === "REJECTED";

  if (status === "PENDING" || status === "DRAFT") return null;

  return (
    <div className="space-y-4">
      {/* SLA Timer */}
      {slaDeadline && submittedAt && !isLocked && timeLeft && (
        <div className={`p-3 rounded-2xl border ${
          slaOverdue ? "bg-red-50 border-red-200" : "bg-blue-50 border-blue-200"
        }`}>
          <div className="flex items-center gap-2">
            <Clock className={`h-4 w-4 ${slaOverdue ? "text-red-500" : "text-blue-500"}`} />
            <span className={`text-[9px] font-black uppercase tracking-widest ${slaOverdue ? "text-red-600" : "text-blue-600"}`}>
              {slaOverdue ? `SLA BREACHED — ${timeLeft}` : timeLeft}
            </span>
          </div>
          <p className="text-[8px] text-slate-400 font-bold uppercase tracking-widest mt-1">
            Deadline: {slaDeadline.toLocaleDateString()} · 5-day SLA per Art. 9.1
          </p>
        </div>
      )}

      {/* Document Checklist */}
      {checklistItems.map((item) => {
        const v = docVerification.find(d => d.checklistItemId === item.id);
        const vStatus = v?.status || "PENDING";

        return (
          <div key={item.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-700">{item.label}</span>
              <span className="text-[7px] text-slate-400 font-mono uppercase bg-slate-100 px-1.5 py-0.5 rounded">{item.directiveRef}</span>
              {!item.isUploaded && <Badge className="bg-slate-200 text-slate-500 text-[7px] uppercase">Not Uploaded</Badge>}
              {vStatus === "VERIFIED" && <Badge className="bg-green-100 text-green-700 text-[7px]"><CheckCircle className="h-2.5 w-2.5 mr-0.5" />Verified</Badge>}
              {vStatus === "REJECTED" && <Badge className="bg-red-100 text-red-700 text-[7px]"><XCircle className="h-2.5 w-2.5 mr-0.5" />Rejected</Badge>}
            </div>
            {isUnderReview && item.isUploaded && (
              <div className="flex items-center gap-1">
                <button
                  disabled={verifyingDoc === item.id}
                  className={`p-1.5 rounded-lg text-[9px] font-bold uppercase tracking-widest ${
                    vStatus === "VERIFIED" ? "bg-green-100 text-green-700" : "hover:bg-green-50 text-slate-400 hover:text-green-600"
                  }`}
                  onClick={async () => {
                    setVerifyingDoc(item.id);
                    const res = await verifyStartupDocument(applicationId, item.id, "VERIFIED");
                    if (res.success) setDocVerification(res.data.documentVerification);
                    else toast.error(res.message || "Failed to verify");
                    setVerifyingDoc(null);
                  }}
                >
                  <CheckCircle className="h-3.5 w-3.5" />
                </button>
                <button
                  disabled={verifyingDoc === item.id}
                  className={`p-1.5 rounded-lg text-[9px] font-bold uppercase tracking-widest ${
                    vStatus === "REJECTED" ? "bg-red-100 text-red-700" : "hover:bg-red-50 text-slate-400 hover:text-red-600"
                  }`}
                  onClick={async () => {
                    setVerifyingDoc(item.id);
                    const res = await verifyStartupDocument(applicationId, item.id, "REJECTED");
                    if (res.success) setDocVerification(res.data.documentVerification);
                    else toast.error(res.message || "Failed to reject");
                    setVerifyingDoc(null);
                  }}
                >
                  <XCircle className="h-3.5 w-3.5" />
                </button>
              </div>
            )}
          </div>
        );
      })}

      {/* Progress + Complete */}
      {isUnderReview && (
        <div className="space-y-3 pt-2">
          <div className="flex items-center justify-between">
            <span className="text-[9px] font-bold uppercase tracking-widest text-slate-500">Documents Verified</span>
            <span className="text-sm font-black">{verifiedCount}/{checklistItems.length}</span>
          </div>
          <Progress value={checklistItems.length > 0 ? (verifiedCount / checklistItems.length) * 100 : 0} className="h-1.5" />
          <Button
            className="w-full h-10 bg-emerald-600 hover:bg-emerald-700 text-white font-black uppercase tracking-widest text-[10px] rounded-xl"
            disabled={completingPre || verifiedCount < checklistItems.length}
            onClick={async () => {
              setCompletingPre(true);
              const res = await completeStartupPreAssessment(applicationId);
              if (res.success) { toast.success("Pre-assessment completed"); window.location.reload(); }
              else toast.error(res.message || "Failed");
              setCompletingPre(false);
            }}
          >
            {completingPre ? <RefreshCw className="mr-2 h-4 w-4 animate-spin" /> : <ShieldCheck className="mr-2 h-4 w-4" />}
            {completingPre ? "Processing..." : "Complete Pre-Assessment"}
          </Button>
        </div>
      )}

      {isReviewed && (
        <div className="text-center p-3 bg-green-50 border border-green-100 rounded-xl">
          <CheckCircle className="h-5 w-5 text-green-600 mx-auto mb-1" />
          <p className="text-[9px] font-black uppercase tracking-widest text-green-700">Pre-Assessment Completed</p>
        </div>
      )}
    </div>
  );
}
