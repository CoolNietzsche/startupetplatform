"use client";

import type { ChangeEvent } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react";
import {
  StoredFilePreview,
  type StoredFileMetadata,
} from "../components/StoredFilePreview";
import type { ApplicationFileField } from "../file-fields";
import type { StepErrors } from "../schema";

export type DocumentsTabProps = {
  formState: any;
  formErrors: StepErrors;
  handleFileChange: (
    e: ChangeEvent<HTMLInputElement>,
    fieldName: string,
  ) => void;
  handleBack: () => void;
  handleSaveDraft: () => void;
  handleNext: () => void;
  isStepComplete: (step: string) => boolean;
  isSubmitting: boolean;
  storedFiles: Record<ApplicationFileField, StoredFileMetadata | null>;
  onRemoveStoredFile: (field: ApplicationFileField) => void;
  removingFileField: ApplicationFileField | null;
  isReadOnly?: boolean;
};

export function DocumentsTab({
  formState,
  formErrors,
  handleFileChange,
  handleBack,
  handleSaveDraft,
  handleNext,
  isStepComplete,
  isSubmitting,
  storedFiles,
  onRemoveStoredFile,
  removingFileField,
  isReadOnly,
}: DocumentsTabProps) {
  return (
    <div className="space-y-6">
      <div className="mb-8">
        <h3 className="text-2xl font-black text-brand-deep-dark">Required Documentation</h3>
      </div>

      <div className="space-y-8">
        <div className="space-y-3">
          <Label className="flex items-center gap-1 font-bold text-brand-deep-dark pl-1">
            Business Registration Certificate <span className="text-red-500">*</span>
          </Label>
          <div className="p-6">
            {formState.businessLicenseFileId &&
            storedFiles["businessLicenseFileId"] ? (
              <StoredFilePreview
                fileId={formState.businessLicenseFileId}
                file={storedFiles["businessLicenseFileId"] ?? undefined}
                onRemove={!isReadOnly ? () => onRemoveStoredFile("businessLicenseFileId") : undefined}
                isRemoving={removingFileField === "businessLicenseFileId"}
              />
            ) : (
              !isReadOnly ? (
                <>
                  <Input
                    id="businessRegistration"
                    type="file"
                    className="bg-white border border-gray-300 rounded px-3 py-2 text-sm text-gray-900 w-full"
                    accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                    onChange={(e) => handleFileChange(e, "businessRegistration")}
                  />
                  <p className="text-xs text-brand-deep-dark/60 font-medium mt-2 pl-1">
                    {formState.businessRegistration?.name || "No file selected"} &middot; Max 20MB
                  </p>
                  {formErrors.businessLicenseFileId && (
                    <p className="text-red-500 text-xs mt-1 pl-1">{formErrors.businessLicenseFileId}</p>
                  )}
                </>
              ) : (
                <p className="text-sm text-brand-deep-dark/40">No document uploaded</p>
              )
            )}
          </div>
        </div>

        <div className="space-y-3">
          <Label className="flex items-center gap-1 font-bold text-brand-deep-dark pl-1">
            Pitch Deck <span className="text-red-500">*</span>
          </Label>
          <div className="p-6">
            {formState.pitchDeckFileId && storedFiles["pitchDeckFileId"] ? (
              <StoredFilePreview
                fileId={formState.pitchDeckFileId}
                file={storedFiles["pitchDeckFileId"] ?? undefined}
                onRemove={!isReadOnly ? () => onRemoveStoredFile("pitchDeckFileId") : undefined}
                isRemoving={removingFileField === "pitchDeckFileId"}
              />
            ) : (
              !isReadOnly ? (
                <>
                  <Input
                    id="pitchDeck"
                    type="file"
                    className="bg-white border border-gray-300 rounded px-3 py-2 text-sm text-gray-900 w-full"
                    accept=".pdf,.ppt,.pptx,.doc,.docx"
                    onChange={(e) => handleFileChange(e, "pitchDeck")}
                  />
                  <p className="text-xs text-brand-deep-dark/60 font-medium mt-2 pl-1">
                    {formState.pitchDeck?.name || "No file selected"} &middot; Max 30MB
                  </p>
                  {formErrors.pitchDeckFileId && (
                    <p className="text-red-500 text-xs mt-1 pl-1">{formErrors.pitchDeckFileId}</p>
                  )}
                </>
              ) : (
                <p className="text-sm text-brand-deep-dark/40">No document uploaded</p>
              )
            )}
          </div>
        </div>

        <div className="space-y-3">
          <Label className="flex items-center gap-1 font-bold text-brand-deep-dark pl-1">Financial Statements (if available)</Label>
          <div className="p-6">
            {formState.financialsFileId && storedFiles["financialsFileId"] ? (
              <StoredFilePreview
                fileId={formState.financialsFileId}
                file={storedFiles["financialsFileId"] ?? undefined}
                onRemove={!isReadOnly ? () => onRemoveStoredFile("financialsFileId") : undefined}
                isRemoving={removingFileField === "financialsFileId"}
              />
            ) : (
              !isReadOnly ? (
                <>
                  <Input
                    id="financialStatements"
                    type="file"
                    className="bg-white border border-gray-300 rounded px-3 py-2 text-sm text-gray-900 w-full"
                    accept=".pdf,.xls,.xlsx,.csv"
                    onChange={(e) => handleFileChange(e, "financialStatements")}
                  />
                  <p className="text-xs text-brand-deep-dark/60 font-medium mt-2 pl-1">
                    {formState.financialStatements?.name || "No file selected"} &middot; Max 20MB
                  </p>
                </>
              ) : (
                <p className="text-sm text-brand-deep-dark/40">No document uploaded</p>
              )
            )}
          </div>
        </div>
      </div>

      <div className="flex justify-between pt-4 mt-6">
        <Button variant="ghost" onClick={handleBack} className="font-bold text-brand-deep-dark h-11 px-6">
          <ChevronLeftIcon className="mr-2 h-4 w-4" /> Previous Step
        </Button>
        <Button onClick={handleNext} className="bg-brand-deep-dark text-white font-bold h-11 px-8">
          {isReadOnly ? "Review Application" : "Save and Continue"} <ChevronRightIcon className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
