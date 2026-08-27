"use client";

import type { ChangeEvent } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ChevronRightIcon } from "lucide-react";
import type { StepErrors } from "../schema";
import { IndustrySelect } from "../components/IndustrySelect";
import { StageSelect } from "../components/StageSelect";
import EthiopianDatePicker from "react-ethiopian-datepicker";
import {
  StoredFilePreview,
  type StoredFileMetadata,
} from "../components/StoredFilePreview";
import type { ApplicationFileField } from "../file-fields";

export type BusinessInformationTabProps = {
  formState: any;
  formErrors: StepErrors;
  handleInputChange: (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => void;
  handleSelectChange: (name: string, value: string) => void;
  handleFileChange: (
    e: ChangeEvent<HTMLInputElement>,
    fieldName: string,
  ) => void;
  handleSaveDraft: () => void;
  handleNext: () => void;
  isStepComplete: (step: string) => boolean;
  isSubmitting: boolean;
  storedFiles: Record<ApplicationFileField, StoredFileMetadata | null>;
  onRemoveStoredFile: (field: ApplicationFileField) => void;
  removingFileField: ApplicationFileField | null;
  isReadOnly?: boolean;
};

export function BusinessInformationTab({
  formState,
  formErrors,
  handleInputChange,
  handleSelectChange,
  handleFileChange,
  handleSaveDraft,
  handleNext,
  isStepComplete,
  isSubmitting,
  storedFiles,
  onRemoveStoredFile,
  removingFileField,
  isReadOnly,
}: BusinessInformationTabProps) {
  return (
    <div className="">
      <div className="mb-4">
        <h3 className="text-2xl font-black text-brand-deep-dark">Business Profile</h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-3">
        <div className="space-y-1.5">
          <Label htmlFor="startupName" className="flex items-center gap-1 text-brand-deep-dark font-bold pl-1">
            Startup Name <span className="text-red-500">*</span>
          </Label>
          <Input
            id="startupName"
            name="startupName"
            value={formState.startupName || ""}
            onChange={handleInputChange}
            placeholder="Your business name"
            readOnly={isReadOnly}
            className="bg-white border border-gray-300 rounded px-3 py-2 text-sm text-gray-900 w-full"
          />
          {formErrors.startupName && (
            <p className="text-red-500 text-xs mt-1">
              {formErrors.startupName}
            </p>
          )}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="businessRegNumber" className="flex items-center gap-1 text-brand-deep-dark font-bold pl-1">
            Business Registration Number
          </Label>
          <Input
            id="businessRegNumber"
            name="businessRegNumber"
            value={formState.businessRegNumber || ""}
            onChange={handleInputChange}
            placeholder="e.g., BRN123456"
            readOnly={isReadOnly}
            className="bg-white border border-gray-300 rounded px-3 py-2 text-sm text-gray-900 w-full"
          />
          {formErrors.businessRegNumber && (
            <p className="text-red-500 text-xs mt-1">
              {formErrors.businessRegNumber}
            </p>
          )}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="tinNumber" className="flex items-center gap-1 text-brand-deep-dark font-bold pl-1">
            TIN Number
          </Label>
            <Input
              id="tinNumber"
              name="tinNumber"
              value={formState.tinNumber || ""}
              onChange={handleInputChange}
              placeholder="Tax Identification Number"
              className="bg-white border border-gray-300 rounded px-3 py-2 text-sm text-gray-900 w-full"
              readOnly={isReadOnly}
            />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="numberOfEmployees" className="flex items-center gap-1 text-brand-deep-dark font-bold pl-1">
            Number of Employees <span className="text-red-500">*</span>
          </Label>
          <Input
            id="numberOfEmployees"
            name="numberOfEmployees"
            type="number"
            min="1"
            value={formState.numberOfEmployees || ""}
            onChange={handleInputChange}
            placeholder="e.g., 10"
            readOnly={isReadOnly}
            className="bg-white border border-gray-300 rounded px-3 py-2 text-sm text-gray-900 w-full"
          />
          {formErrors.numberOfEmployees && (
            <p className="text-red-500 text-xs mt-1">
              {formErrors.numberOfEmployees}
            </p>
          )}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="capital" className="text-brand-deep-dark font-bold pl-1">Capital (ETB)</Label>
          <Input
            id="capital"
            name="capital"
            value={formState.capital || ""}
            onChange={handleInputChange}
            placeholder="e.g., 100,000"
            readOnly={isReadOnly}
            className="bg-white border border-gray-300 rounded px-3 py-2 text-sm text-gray-900 w-full"
          />
        </div>

        <div className="space-y-1.5 flex flex-col">
          <Label htmlFor="foundingDate" className="text-brand-deep-dark font-bold pl-1">Founding Date</Label>
          <div className="w-full">
            <EthiopianDatePicker
              value={formState.foundingDate ? new Date(formState.foundingDate) : null}
              onChange={(d: Date | null) => {
                const value = d ? d.toISOString().split("T")[0] : "";
                handleInputChange({
                  target: { name: "foundingDate", value }
                } as any);
              }}
              customization={{
                colors: {
                  primary: "#0D4E63",
                  accent: "#0D4E63",
                  background: "#ffffff",
                  border: "#cbd5e1",
                }
              }}
            />
          </div>
        </div>

        <IndustrySelect
          value={formState.industry}
          onSelect={(value) => handleSelectChange("industry", value)}
          error={formErrors.industry}
          disabled={isReadOnly}
        />

        <StageSelect
          value={formState.stage}
          onSelect={(value) => handleSelectChange("stage", value)}
          error={formErrors.stage}
          disabled={isReadOnly}
        />

        <div className="space-y-1.5">
          <Label htmlFor="website" className="text-brand-deep-dark font-bold pl-1">Website</Label>
          <Input
            id="website"
            name="website"
            value={formState.website || ""}
            onChange={handleInputChange}
            placeholder="https://www.example.com"
            readOnly={isReadOnly}
            className="bg-white border border-gray-300 rounded px-3 py-2 text-sm text-gray-900 w-full"
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="businessEmail" className="flex items-center gap-1 text-brand-deep-dark font-bold pl-1">
            Business Email <span className="text-red-500">*</span>
          </Label>
          <Input
            id="businessEmail"
            name="businessEmail"
            type="email"
            value={formState.businessEmail || ""}
            onChange={handleInputChange}
            placeholder="business@example.com"
            readOnly={isReadOnly}
            className="bg-white border border-gray-300 rounded px-3 py-2 text-sm text-gray-900 w-full"
          />
          {formErrors.businessEmail && (
            <p className="text-red-500 text-xs mt-1">
              {formErrors.businessEmail}
            </p>
          )}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="altEmail" className="text-brand-deep-dark font-bold pl-1">Alternative Email</Label>
          <Input
            id="altEmail"
            name="altEmail"
            type="email"
            value={formState.altEmail || ""}
            onChange={handleInputChange}
            placeholder="alternative@example.com"
            readOnly={isReadOnly}
            className="bg-white border border-gray-300 rounded px-3 py-2 text-sm text-gray-900 w-full"
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="phoneNumber" className="flex items-center gap-1 text-brand-deep-dark font-bold pl-1">
            Phone Number <span className="text-red-500">*</span>
          </Label>
          <Input
            id="phoneNumber"
            name="phoneNumber"
            value={formState.phoneNumber || ""}
            onChange={handleInputChange}
            placeholder="+251 91 234 5678"
            readOnly={isReadOnly}
            className="bg-white border border-gray-300 rounded px-3 py-2 text-sm text-gray-900 w-full"
          />
          {formErrors.phoneNumber && (
            <p className="text-red-500 text-xs mt-1">
              {formErrors.phoneNumber}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="articlesOfIncorporationFile" className="flex items-center gap-1 font-bold text-brand-deep-dark pl-1">
            Articles of Incorporation <span className="text-red-500">*</span>
          </Label>
          <div className="p-4">
            {formState.articlesOfIncorpFileId &&
              storedFiles["articlesOfIncorpFileId"] ? (
              <StoredFilePreview
                fileId={formState.articlesOfIncorpFileId}
                file={storedFiles["articlesOfIncorpFileId"] ?? undefined}
                onRemove={!isReadOnly ? () => onRemoveStoredFile("articlesOfIncorpFileId") : undefined}
                isRemoving={removingFileField === "articlesOfIncorpFileId"}
              />
            ) : (
              !isReadOnly ? (
                <>
                  <Input
                    id="articlesOfIncorporationFile"
                    type="file"
                    className="bg-white border border-gray-300 rounded px-3 py-2 text-sm text-gray-900 w-full"
                    accept=".pdf,.doc,.docx"
                    onChange={(e) =>
                      handleFileChange(e, "articlesOfIncorporationFile")
                    }
                  />
                  <p className="text-xs text-brand-deep-dark/60 font-medium mt-2 pl-1">Max 20MB</p>
                  {formErrors.articlesOfIncorpFileId && (
                    <p className="text-red-500 text-xs mt-1 pl-1">{formErrors.articlesOfIncorpFileId}</p>
                  )}
                </>
              ) : (
<p className="text-sm text-brand-deep-dark/40">No document uploaded</p>
            )
          )}
        </div>
        </div>
      </div>

      <div className="flex justify-end gap-4 mt-6 pt-4">
        <Button
          onClick={handleNext}
          disabled={isSubmitting}
          className="bg-brand-deep-dark text-white font-bold h-11 px-8"
        >
          {isReadOnly ? "Next Step" : "Save and Continue"} <ChevronRightIcon className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
