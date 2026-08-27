"use client";

import type { ChangeEvent } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react";
import type { StepErrors } from "../schema";

export type FinancialTabProps = {
  formState: any;
  formErrors: StepErrors;
  handleInputChange: (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => void;
  handleBack: () => void;
  handleSaveDraft: () => void;
  handleNext: () => void;
  isStepComplete: (step: string) => boolean;
  isSubmitting: boolean;
  isReadOnly?: boolean;
};

const CharacterLimitedTextarea = ({
  id,
  name,
  value,
  onChange,
  placeholder,
  maxLength = 1000,
  rows = 4,
  readOnly,
}: {
  id: string;
  name: string;
  value: string;
  onChange: any;
  placeholder: string;
  maxLength?: number;
  rows?: number;
  readOnly?: boolean;
}) => (
  <div className="relative">
    <Textarea
      id={id}
      name={name}
      value={value || ""}
      onChange={onChange}
      placeholder={placeholder}
      rows={rows}
      maxLength={maxLength}
      readOnly={readOnly}
      className="resize-none pb-8 bg-white border rounded px-3 py-2 text-sm text-gray-900 w-full"
    />
    <span className="absolute bottom-2 right-3 text-[10px] font-bold text-brand-deep-dark/40 select-none">
      {(value || "").length} / {maxLength}
    </span>
  </div>
);

export function FinancialTab({
  formState,
  formErrors,
  handleInputChange,
  handleBack,
  handleSaveDraft,
  handleNext,
  isStepComplete,
  isSubmitting,
  isReadOnly,
}: FinancialTabProps) {
  return (
    <div className="space-y-6">
      <div className="mb-8">
        <h3 className="text-2xl font-black text-brand-deep-dark">Financial Performance</h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="revenue" className="flex items-center gap-1 text-brand-deep-dark font-bold pl-1">Annual Revenue (ETB)</Label>
          <Input
            id="revenue"
            name="revenue"
            type="number"
            value={formState.revenue || ""}
            onChange={handleInputChange}
            placeholder="e.g., 500,000"
            readOnly={isReadOnly}
            className="bg-white border border-gray-300 rounded px-3 py-2 text-sm text-gray-900 w-full"
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="funding" className="flex items-center gap-1 text-brand-deep-dark font-bold pl-1">Total Funding Raised (ETB)</Label>
          <Input
            id="funding"
            name="funding"
            type="number"
            value={formState.funding || ""}
            onChange={handleInputChange}
            placeholder="e.g., 1,000,000"
            readOnly={isReadOnly}
            className="bg-white border border-gray-300 rounded px-3 py-2 text-sm text-gray-900 w-full"
          />
        </div>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="investmentNeeded" className="flex items-center gap-1 text-brand-deep-dark font-bold pl-1">Investment Needed (ETB)</Label>
        <Input
          id="investmentNeeded"
          name="investmentNeeded"
          type="number"
          value={formState.investmentNeeded || ""}
          onChange={handleInputChange}
          placeholder="e.g., 2,000,000"
          readOnly={isReadOnly}
          className="bg-white border border-gray-300 rounded px-3 py-2 text-sm text-gray-900 w-full"
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="useOfFunds" className="flex items-center gap-1 text-brand-deep-dark font-bold pl-1">Use of Funds</Label>
        <CharacterLimitedTextarea
          id="useOfFunds"
          name="useOfFunds"
          value={formState.useOfFunds}
          onChange={handleInputChange}
          placeholder="How would you use any additional funding? Explain briefly."
          readOnly={isReadOnly}
        />
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
