"use client";

import { Button } from "@/components/ui/button";
import { ChevronLeftIcon, CheckIcon, AlertCircle, Users, ShieldAlert } from "lucide-react";
import { computeFounderSharePct } from "../schema";
import {
  StoredFilePreview,
  type StoredFileMetadata,
} from "../components/StoredFilePreview";
import type { ApplicationFileField } from "../file-fields";

export type ReviewTabProps = {
  formState: any;
  handleBack: () => void;
  handleSaveDraft: () => void;
  handleSubmit: () => void;
  isSubmitting: boolean;
  storedFiles: Record<ApplicationFileField, StoredFileMetadata | null>;
  isReadOnly?: boolean;
};

export function ReviewTab({
  formState,
  handleBack,
  handleSaveDraft,
  handleSubmit,
  isSubmitting,
  storedFiles,
  isReadOnly,
}: ReviewTabProps) {
  return (
    <div className="space-y-6">
      <div className="mb-4">
        <h3 className="text-2xl font-black text-brand-deep-dark">Review Your Application</h3>
        <p className="text-brand-deep-dark/60 text-sm mt-1 font-medium">Please review all your details before final submission.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <section className="p-6">
          <h3 className="text-xs font-bold uppercase text-brand-deep-dark mb-6">
            Business Information
          </h3>
          <div className="grid grid-cols-1 gap-y-5">
            <div className="group">
              <p className="text-xs uppercase font-bold text-brand-deep-dark/60 mb-0.5">Startup Name</p>
              <p className="text-brand-deep-dark font-black text-lg">{formState.startupName || "Not provided"}</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="group">
                <p className="text-xs uppercase font-bold text-brand-deep-dark/60 mb-0.5">Industry</p>
                <p className="text-brand-deep-dark font-bold">{formState.industry || "Not provided"}</p>
              </div>
              <div className="group">
                <p className="text-xs uppercase font-bold text-brand-deep-dark/60 mb-0.5">Stage</p>
                <p className="text-brand-deep-dark font-bold underline decoration-brand-deep-dark/30 decoration-2 underline-offset-4">{formState.stage || "Not provided"}</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="group">
                 <p className="text-xs uppercase font-bold text-brand-deep-dark/60 mb-0.5">TIN Number</p>
                 <p className="text-brand-deep-dark/80 font-bold">{formState.tinNumber || "Not provided"}</p>
              </div>
              <div className="group">
                 <p className="text-xs uppercase font-bold text-brand-deep-dark/60 mb-0.5">Employees</p>
                 <p className="text-brand-deep-dark/80 font-bold">{formState.numberOfEmployees || "Not provided"}</p>
              </div>
            </div>
          </div>
        </section>

        <section className="p-6">
          <h3 className="text-xs font-bold uppercase text-brand-deep-dark mb-6">
            Founding Team
          </h3>
          <div className="space-y-4 max-h-[220px] overflow-y-auto pr-2">
            {formState.founders.map((founder: any, index: number) => (
              <div key={index} className="p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-brand-deep-dark font-black">
                      {founder.firstName} {founder.lastName}
                    </p>
                    <p className="text-xs text-brand-deep-dark/60 font-bold mt-0.5 uppercase">{founder.role || "Founder"}</p>
                  </div>
                </div>
                <div className="mt-3 flex items-center gap-3 text-xs font-bold text-brand-deep-dark/60">
                  <span>{founder.email}</span>
                  <span>{founder.phone || "No phone"}</span>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>

      <section className="p-8">
          <h3 className="text-xs font-bold uppercase text-brand-deep-dark mb-8">
          Business Narrative
        </h3>
        <div className="grid gap-8 md:grid-cols-2">
          {[
            { label: "Business Description", value: formState.businessDescription },
            { label: "Problem Statement", value: formState.problemStatement },
            { label: "Solution", value: formState.solution },
            { label: "Innovation", value: formState.innovationDescription },
            { label: "Target Market", value: formState.targetMarket },
            { label: "Competitive Advantage", value: formState.competitiveAdvantage },
            { label: "Scalability Plan", value: formState.scalabilityPlan },
          ].map((item, idx) => (
            <div key={idx} className="group">
              <p className="text-xs uppercase font-bold text-brand-deep-dark/60 mb-2">{item.label}</p>
              <p className="text-sm text-brand-deep-dark/80 font-medium leading-relaxed">
                {item.value || "Not provided"}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Directive Compliance — Founding Team Share */}
      {formState.totalShares && formState.founders?.length > 0 && computeFounderSharePct(formState.totalShares, formState.founders) < 25 && (
        <div className="p-5 flex gap-4 items-start mb-6">
          <div className="shrink-0">
            <ShieldAlert className="w-5 h-5 text-red-500" />
          </div>
          <div>
            <p className="font-black text-xs uppercase text-red-700 mb-1">Directive Non-Compliance — Art. 22</p>
            <p className="text-sm text-red-800 font-medium">
              Founding team currently holds only <strong>{computeFounderSharePct(formState.totalShares, formState.founders)}%</strong> of total shares. A minimum of <strong>25%</strong> is required. Go back to the Founders step to adjust share allocation.
            </p>
          </div>
        </div>
      )}

      {formState.totalShares && formState.founders?.length > 0 && computeFounderSharePct(formState.totalShares, formState.founders) >= 25 && (
        <div className="p-4 flex gap-3 items-center mb-6">
          <div className="shrink-0">
            <Users className="w-4 h-4 text-green-600" />
          </div>
          <p className="text-sm text-green-800 font-medium">
            Founding team holds <strong>{computeFounderSharePct(formState.totalShares, formState.founders)}%</strong> of total shares — compliant with Art. 22 (≥25%).
          </p>
        </div>
      )}

      <div className="grid gap-6 md:grid-cols-2">
        <section className="p-6">
          <h3 className="text-xs font-bold uppercase text-brand-deep-dark mb-6">
            Financials & Shares
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4">
              <p className="text-xs uppercase font-bold text-brand-deep-dark/60 mb-1">Total Shares</p>
              <p className="text-brand-deep-dark font-black text-xl">{formState.totalShares || "0"}</p>
            </div>
            <div className="p-4">
                <p className="text-xs uppercase font-bold text-brand-deep-dark/60 mb-1">Share Price</p>
              <p className="text-brand-deep-dark font-black text-xl">
                {formState.sharePrice ? `${formState.sharePrice} ETB` : "0 ETB"}
              </p>
            </div>
          </div>
          <div className="mt-4 grid grid-cols-2 gap-4">
             <div className="group">
                <p className="text-xs uppercase font-bold text-brand-deep-dark/60 mb-0.5">Revenue</p>
                <p className="text-brand-deep-dark/80 font-bold">{formState.revenue ? `${formState.revenue} ETB` : "0 ETB"}</p>
             </div>
             <div className="group">
                <p className="text-xs uppercase font-bold text-brand-deep-dark/60 mb-0.5">Investment</p>
                <p className="text-brand-deep-dark/80 font-bold">{formState.investmentNeeded ? `${formState.investmentNeeded} ETB` : "0 ETB"}</p>
             </div>
          </div>
        </section>

        <section className="p-6">
          <h3 className="text-xs font-bold uppercase text-brand-deep-dark mb-6">
            Verified Documents
          </h3>
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: "Registration", id: "businessLicenseFileId", temp: "businessRegistrationFile" },
              { label: "Incorp. Articles", id: "articlesOfIncorpFileId", temp: "articlesOfIncorporationFile" },
              { label: "Pitch Deck", id: "pitchDeckFileId", temp: "pitchDeck" },
              { label: "Financials", id: "financialsFileId", temp: "financialStatements" },
            ].map((doc, idx) => {
              const hasFile = (formState[doc.id] && storedFiles[doc.id as ApplicationFileField]) || formState[doc.temp];
              return (
              <div key={idx} className="p-4">
                <p className="text-[9px] uppercase font-bold text-brand-deep-dark/60 mb-2 truncate">{doc.label}</p>
                {formState[doc.id] && storedFiles[doc.id as ApplicationFileField] ? (
                   <span className="text-[10px] font-black text-brand-deep-dark uppercase">
                      Uploaded
                   </span>
                ) : formState[doc.temp] ? (
                  <span className="text-[10px] font-black text-brand-deep-dark uppercase">
                    {formState[doc.temp].name.substring(0, 10)}...
                  </span>
                ) : (
                  <span className="text-[10px] font-bold text-brand-deep-dark/50 uppercase">Pending</span>
                )}
              </div>
              );
            })}
          </div>
        </section>
      </div>

      <div className="p-6 flex gap-4 items-start">
        <div className="shrink-0">
          <AlertCircle className="w-5 h-5 text-brand-deep-dark" />
        </div>
        <p className="text-xs text-brand-deep-dark/80 font-bold leading-relaxed">
          I hereby certify that all the information and documents provided in this application are true, complete, and accurate to the best of my knowledge. I understand that any false statements may result in disqualification.
        </p>
      </div>

      <div className="flex justify-between items-center pt-4 mt-6 pb-4">
        <Button variant="ghost" onClick={handleBack} className="font-bold text-brand-deep-dark h-11 px-6">
          <ChevronLeftIcon className="mr-2 h-4 w-4" /> Go Back
        </Button>
        {!isReadOnly && (
          <div className="flex gap-4">
            <Button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="bg-brand-deep-dark text-white font-bold h-11 px-8"
            >
              {isSubmitting ? "Finalizing..." : "Submit Application"}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
