"use client";

import type { ChangeEvent } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ChevronLeftIcon, ChevronRightIcon, Users } from "lucide-react";
import type { StepErrors } from "../schema";
import { computeFounderSharePct } from "../schema";

export type FounderInformationTabProps = {
  formState: any;
  formErrors: StepErrors;
  handleFounderInputChange: (
    e: ChangeEvent<HTMLInputElement>,
    index: number,
    field: string,
  ) => void;
  handleInputChange: (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => void;
  handleAddFounder: () => void;
  handleRemoveFounder: (indexToRemove: number) => void;
  handleSaveDraft: () => void;
  handleNext: () => void;
  handleBack: () => void;
  isStepComplete: (step: string) => boolean;
  isSubmitting: boolean;
  isReadOnly?: boolean;
};

export function FounderInformationTab({
  formState,
  formErrors,
  handleFounderInputChange,
  handleInputChange,
  handleAddFounder,
  handleRemoveFounder,
  handleSaveDraft,
  handleNext,
  handleBack,
  isStepComplete,
  isSubmitting,
  isReadOnly,
}: FounderInformationTabProps) {
  return (
    <div className="space-y-6">
      <div className="mb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <h3 className="text-2xl font-black text-brand-deep-dark">Founding Team</h3>
        {formState.totalShares && formState.founders?.length > 0 && (
          <div className={`flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-sm ${
            computeFounderSharePct(formState.totalShares, formState.founders) >= 25
              ? "bg-green-50 text-green-700 border border-green-200"
              : "bg-red-50 text-red-700 border border-red-200"
          }`}>
            <Users className="h-4 w-4" />
            {computeFounderSharePct(formState.totalShares, formState.founders)}%
          </div>
        )}
      </div>

      {!isReadOnly && (
        <div className="p-5 mb-8">
          <div className="flex items-start gap-3">
            <div className="shrink-0">
              <Users className="h-5 w-5 text-brand-deep-dark" />
            </div>
            <div className="flex-1">
              <h4 className="font-bold text-brand-deep-dark text-sm">Directive Requirement — Art. 22</h4>
              <p className="text-xs text-brand-deep-dark/70 mt-1 font-medium leading-relaxed">
                The founding team must collectively hold a minimum of <strong>25%</strong> of the company's total shares.
                The current allocation is <strong>{computeFounderSharePct(formState.totalShares, formState.founders)}%</strong>.
              </p>
            </div>
          </div>
        </div>
      )}

      
      
      {formState.founders.map((founder: any, index: number) => (
        <div key={index} className="p-2 sm:p-4 space-y-4 mb-3">
          <div className="flex justify-between items-center pb-4">
            <h4 className="font-bold text-brand-deep-dark">Founder {index + 1}</h4>
            {formState.founders.length > 1 && !isReadOnly && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleRemoveFounder(index)}
                className="text-red-500 hover:text-red-600 hover:bg-red-50"
              >
                Remove
              </Button>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor={`founderFirstName-${index}`} className="flex items-center gap-1 text-brand-deep-dark font-bold pl-1">
                First Name <span className="text-red-500">*</span>
              </Label>
              <Input
                id={`founderFirstName-${index}`}
                value={founder.firstName || ""}
                onChange={(e) =>
                  handleFounderInputChange(e, index, "firstName")
                }
                placeholder="First name of founder"
                readOnly={isReadOnly}
                className="bg-white border border-gray-300 rounded px-3 py-2 text-sm text-gray-900 w-full"
              />
              {formErrors[`founders.${index}.firstName`] && (
                <p className="text-red-500 text-xs mt-1">{formErrors[`founders.${index}.firstName`]}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor={`founderLastName-${index}`} className="flex items-center gap-1 text-brand-deep-dark font-bold pl-1">
                Last Name <span className="text-red-500">*</span>
              </Label>
              <Input
                id={`founderLastName-${index}`}
                value={founder.lastName || ""}
                onChange={(e) => handleFounderInputChange(e, index, "lastName")}
                placeholder="Last name of founder"
                readOnly={isReadOnly}
                className="bg-white border border-gray-300 rounded px-3 py-2 text-sm text-gray-900 w-full"
              />
              {formErrors[`founders.${index}.lastName`] && (
                <p className="text-red-500 text-xs mt-1">{formErrors[`founders.${index}.lastName`]}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor={`founderNationalIdNumber-${index}`} className="flex items-center gap-1 text-brand-deep-dark font-bold pl-1">
                National ID (FCN) <span className="text-red-500">*</span>
              </Label>
              <Input
                  id={`founderNationalIdNumber-${index}`}
                  value={founder.nationalIdNumber || ""}
                  onChange={(e) =>
                    handleFounderInputChange(e, index, "nationalIdNumber")
                  }
                  placeholder="Format: 1234567890123456"
                  className="bg-white border border-gray-300 rounded px-3 py-2 text-sm text-gray-900 w-full"
                  readOnly={isReadOnly}
                />
              {formErrors[`founders.${index}.nationalIdNumber`] && (
                <p className="text-red-500 text-xs mt-1">{formErrors[`founders.${index}.nationalIdNumber`]}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor={`founderNumberOfShares-${index}`} className="flex items-center gap-1 text-brand-deep-dark font-bold pl-1">
                Number of Shares <span className="text-red-500">*</span>
              </Label>
              <Input
                id={`founderNumberOfShares-${index}`}
                type="number"
                min="1"
                value={founder.numberOfShares || ""}
                onChange={(e) =>
                  handleFounderInputChange(e, index, "numberOfShares")
                }
                placeholder="Number of shares held"
                readOnly={isReadOnly}
                className="bg-white border border-gray-300 rounded px-3 py-2 text-sm text-gray-900 w-full"
              />
              {formErrors[`founders.${index}.numberOfShares`] && (
                <p className="text-red-500 text-xs mt-1">{formErrors[`founders.${index}.numberOfShares`]}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor={`founderEmail-${index}`} className="flex items-center gap-1 text-brand-deep-dark font-bold pl-1">
                Email Address <span className="text-red-500">*</span>
              </Label>
              <Input
                id={`founderEmail-${index}`}
                type="email"
                value={founder.email || ""}
                onChange={(e) => handleFounderInputChange(e, index, "email")}
                placeholder="Email address of founder"
                readOnly={isReadOnly}
                className="bg-white border border-gray-300 rounded px-3 py-2 text-sm text-gray-900 w-full"
              />
              {formErrors[`founders.${index}.email`] && (
                <p className="text-red-500 text-xs mt-1">{formErrors[`founders.${index}.email`]}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor={`founderPhone-${index}`} className="text-brand-deep-dark font-bold pl-1">Phone Number</Label>
              <Input
                id={`founderPhone-${index}`}
                value={founder.phone || ""}
                onChange={(e) => handleFounderInputChange(e, index, "phone")}
                placeholder="Phone number of founder"
                readOnly={isReadOnly}
                className="bg-white border border-gray-300 rounded px-3 py-2 text-sm text-gray-900 w-full"
              />
            </div>
          </div>

            <div className="space-y-1.5">
              <Label htmlFor={`founderRole-${index}`} className="text-brand-deep-dark font-bold pl-1">Role</Label>
            <Input
              id={`founderRole-${index}`}
              value={founder.role || ""}
              onChange={(e) => handleFounderInputChange(e, index, "role")}
              placeholder="e.g. CEO, CTO, COO"
              readOnly={isReadOnly}
              className="bg-white border border-gray-300 rounded px-3 py-2 text-sm text-gray-900 w-full"
            />
          </div>
        </div>
      ))}

      {!isReadOnly && (
        <Button
          type="button"
          variant="ghost"
          onClick={handleAddFounder}
          className="font-bold text-brand-deep-dark h-10 px-4 mt-2"
        >
          + Add Another Founder
        </Button>
      )}

      <div className="mt-4 pt-3">
        <h3 className="text-lg font-black text-brand-deep-dark mb-4">Share Details</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label htmlFor="totalShares" className="flex items-center gap-1 text-brand-deep-dark font-bold pl-1">
              Total Number of Shares <span className="text-red-500">*</span>
            </Label>
            <Input
              id="totalShares"
              name="totalShares"
              value={formState.totalShares || ""}
              onChange={handleInputChange}
              readOnly={isReadOnly}
              className="bg-white border border-gray-300 rounded px-3 py-2 text-sm text-gray-900 w-full"
            />
            {formErrors.totalShares && (
              <p className="text-red-500 text-xs mt-1">
                {formErrors.totalShares}
              </p>
            )}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="sharePrice" className="flex items-center gap-1 text-brand-deep-dark font-bold pl-1">
              Share Price (ETB) <span className="text-red-500">*</span>
            </Label>
            <Input
              id="sharePrice"
              name="sharePrice"
              value={formState.sharePrice || ""}
              onChange={handleInputChange}
              placeholder="e.g., 100"
              readOnly={isReadOnly}
              className="bg-white border border-gray-300 rounded px-3 py-2 text-sm text-gray-900 w-full"
            />
            {formErrors.sharePrice && (
              <p className="text-red-500 text-xs mt-1">
                {formErrors.sharePrice}
              </p>
            )}
          </div>
        </div>
      </div>

      <div className="flex justify-between pt-4 mt-6">
        <Button variant="ghost" onClick={handleBack} className="font-bold text-brand-deep-dark h-11 px-6">
          <ChevronLeftIcon className="mr-2 h-4 w-4" /> Previous Step
        </Button>
        <Button onClick={handleNext} className="bg-brand-deep-dark text-white font-bold h-11 px-8">
          {isReadOnly ? "Next Step" : "Save and Continue"} <ChevronRightIcon className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
