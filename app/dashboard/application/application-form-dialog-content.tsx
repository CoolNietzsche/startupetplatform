"use client";

import { type ChangeEvent, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { IndustrySelect } from "./components/IndustrySelect";
import { StageSelect } from "./components/StageSelect";
import { BusinessInformationTab } from "./tabs/BusinessInformationTab";
import { FounderInformationTab } from "./tabs/FounderInformationTab";
import { DetailsTab } from "./tabs/DetailsTab";
import { FinancialTab } from "./tabs/FinancialTab";
import { DocumentsTab } from "./tabs/DocumentsTab";
import { ReviewTab } from "./tabs/ReviewTab";
import {
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertCircle,
  CheckIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from "lucide-react";
import type { StepErrors } from "./schema";
import type { ApplicationFileField } from "./file-fields";
import type { StoredFileMetadata } from "./components/StoredFilePreview";

type ApplicationFormDialogContentProps = {
  currentStep: string;
  setCurrentStep: (value: string) => void;
  formState: any;
  isVerifyingTin: boolean;
  tinVerificationError: string | null;
  isSubmitting: boolean;
  founderVerification: any;
  handleInputChange: (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => void;
  handleSelectChange: (name: string, value: string) => void;
  handleFileChange: (
    e: ChangeEvent<HTMLInputElement>,
    fieldName: string,
  ) => void;
  handleVerifyTin: () => void;
  handleNext: () => void;
  handleBack: () => void;
  handleSaveDraft: () => void;
  handleSubmit: () => void;
  handleAddFounder: () => void;
  handleRemoveFounder: (indexToRemove: number) => void;
  handleVerifyNationalId: (index: number) => void;
  handleFounderInputChange: (
    e: ChangeEvent<HTMLInputElement>,
    index: number,
    field: string,
  ) => void;
  validateStepCompletion: (step: string) => boolean;
  isStepComplete: (step: string) => boolean;
  formErrors: StepErrors;
  saveError: string | null;
  onReady?: () => void;
  storedFiles: Record<ApplicationFileField, StoredFileMetadata | null>;
  onRemoveStoredFile: (field: ApplicationFileField) => void;
  removingFileField: ApplicationFileField | null;
  decisionReasonNote?: string | null;
};

export function ApplicationFormDialogContent({
  currentStep,
  setCurrentStep,
  formState,
  isVerifyingTin,
  tinVerificationError,
  isSubmitting,
  founderVerification,
  handleInputChange,
  handleSelectChange,
  handleFileChange,
  handleVerifyTin,
  handleNext,
  handleBack,
  handleSaveDraft,
  handleSubmit,
  handleAddFounder,
  handleRemoveFounder,
  handleVerifyNationalId,
  handleFounderInputChange,
  validateStepCompletion,
  isStepComplete,
  formErrors,
  saveError,
  onReady,
  storedFiles,
  onRemoveStoredFile,
  removingFileField,
  decisionReasonNote,
}: ApplicationFormDialogContentProps) {
  useEffect(() => {
    if (!onReady) return;
    const tick = requestAnimationFrame(onReady);
    return () => cancelAnimationFrame(tick);
  }, [onReady]);
  return (
    <DialogContent className="max-w-7xl max-h-[90vh] overflow-y-auto">
      <DialogHeader>
        <DialogTitle>Startup Verification Application</DialogTitle>
        <DialogDescription>
          Complete this application to verify your startup and access Ethiopian
          government support programs.
        </DialogDescription>
      </DialogHeader>

      {decisionReasonNote && (
        <div className="mt-4 flex gap-3 rounded-md border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
          <AlertCircle className="h-5 w-5 shrink-0 text-amber-500" />
          <div>
            <p className="font-semibold text-amber-900">Admin Feedback</p>
            <p className="whitespace-pre-line text-amber-800">
              {decisionReasonNote}
            </p>
          </div>
        </div>
      )}

      {saveError && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm">
          <p className="font-medium">Error</p>
          <p>{saveError}</p>
          {Object.keys(formErrors).length > 0 && (
            <ul className="mt-1 list-disc list-inside text-xs">
              {Object.entries(formErrors).map(([field, msg]) => (
                <li key={field}>
                  <span className="font-medium">{field}</span>: {msg}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {/* Application Progress */}
      <div className="relative mt-4">
        <div className="flex justify-between mb-4">
          {[
            "Business Information",
            "Founder Details",
            "Business Model",
            "Financial Information",
            "Documents",
            "Review & Submit",
          ].map((step, index) => (
            <div key={index} className="flex flex-col items-center w-1/6">
              <div
                className={`w-6 h-6 rounded-full flex items-center justify-center border-2 ${
                  (currentStep === "business" && index === 0) ||
                  (currentStep === "founder" && index === 1) ||
                  (currentStep === "details" && index === 2) ||
                  (currentStep === "financial" && index === 3) ||
                  (currentStep === "documents" && index === 4) ||
                  (currentStep === "review" && index === 5)
                    ? "border-green-600 bg-green-100 text-green-600"
                    : "border-gray-300 bg-white text-gray-400"
                }`}
              >
                {(currentStep === "business" && index === 0) ||
                (currentStep === "founder" && index === 1) ||
                (currentStep === "details" && index === 2) ||
                (currentStep === "financial" && index === 3) ||
                (currentStep === "documents" && index === 4) ||
                (currentStep === "review" && index === 5) ? (
                  <span className="text-xs">{index + 1}</span>
                ) : index <
                  [
                    "business",
                    "founder",
                    "details",
                    "financial",
                    "documents",
                    "review",
                  ].indexOf(currentStep) ? (
                  <CheckIcon className="w-3 h-3 text-green-600" />
                ) : (
                  <span className="text-xs">{index + 1}</span>
                )}
              </div>
              <span
                className={`text-[10px] mt-1 text-center ${
                  (currentStep === "business" && index === 0) ||
                  (currentStep === "founder" && index === 1) ||
                  (currentStep === "details" && index === 2) ||
                  (currentStep === "financial" && index === 3) ||
                  (currentStep === "documents" && index === 4) ||
                  (currentStep === "review" && index === 5)
                    ? "text-green-600 font-medium"
                    : "text-gray-500"
                }`}
              >
                {step}
              </span>
            </div>
          ))}
        </div>

        <div className="h-0.5 bg-gray-200 absolute top-3 left-0 right-0 z-0">
          <div
            className={`h-0.5 bg-green-600 transition-all ${
              currentStep === "business"
                ? "w-0"
                : currentStep === "founder"
                  ? "w-1/5"
                  : currentStep === "details"
                    ? "w-2/5"
                    : currentStep === "financial"
                      ? "w-3/5"
                      : currentStep === "documents"
                        ? "w-4/5"
                        : "w-full"
            }`}
          ></div>
        </div>
      </div>

      {/* Application Form */}
      <Tabs value={currentStep} onValueChange={setCurrentStep} className="mt-4">
        <TabsContent value="business" className="space-y-4 py-2">
          <BusinessInformationTab
            formState={formState}
            formErrors={formErrors}
            handleInputChange={handleInputChange}
            handleSelectChange={handleSelectChange}
            handleFileChange={handleFileChange}
            handleVerifyTin={handleVerifyTin}
            handleSaveDraft={handleSaveDraft}
            handleNext={handleNext}
            isStepComplete={isStepComplete}
            isSubmitting={isSubmitting}
            isVerifyingTin={isVerifyingTin}
            tinVerificationError={tinVerificationError}
            storedFiles={storedFiles}
            onRemoveStoredFile={onRemoveStoredFile}
            removingFileField={removingFileField}
          />
        </TabsContent>

        <TabsContent value="founder">
          <FounderInformationTab
            formState={formState}
            formErrors={formErrors}
            handleFounderInputChange={handleFounderInputChange}
            handleInputChange={handleInputChange}
            handleAddFounder={handleAddFounder}
            handleRemoveFounder={handleRemoveFounder}
            handleVerifyNationalId={handleVerifyNationalId}
            handleSaveDraft={handleSaveDraft}
            handleNext={handleNext}
            handleBack={handleBack}
            isStepComplete={isStepComplete}
            isSubmitting={isSubmitting}
            founderVerification={founderVerification}
          />
        </TabsContent>

        <TabsContent value="details">
          <DetailsTab
            formState={formState}
            formErrors={formErrors}
            handleInputChange={handleInputChange}
            handleBack={handleBack}
            handleSaveDraft={handleSaveDraft}
            handleNext={handleNext}
            isStepComplete={isStepComplete}
            isSubmitting={isSubmitting}
          />
        </TabsContent>

        <TabsContent value="financial">
          <FinancialTab
            formState={formState}
            formErrors={formErrors}
            handleInputChange={handleInputChange}
            handleBack={handleBack}
            handleSaveDraft={handleSaveDraft}
            handleNext={handleNext}
            isStepComplete={isStepComplete}
            isSubmitting={isSubmitting}
          />
        </TabsContent>

        <TabsContent value="documents">
          <DocumentsTab
            formState={formState}
            handleFileChange={handleFileChange}
            handleBack={handleBack}
            handleSaveDraft={handleSaveDraft}
            handleNext={handleNext}
            isStepComplete={isStepComplete}
            isSubmitting={isSubmitting}
            storedFiles={storedFiles}
            onRemoveStoredFile={onRemoveStoredFile}
            removingFileField={removingFileField}
          />
        </TabsContent>

        <TabsContent value="review">
          <ReviewTab
            formState={formState}
            handleBack={handleBack}
            handleSaveDraft={handleSaveDraft}
            handleSubmit={handleSubmit}
            isSubmitting={isSubmitting}
            storedFiles={storedFiles}
          />
        </TabsContent>
      </Tabs>
    </DialogContent>
  );
}
