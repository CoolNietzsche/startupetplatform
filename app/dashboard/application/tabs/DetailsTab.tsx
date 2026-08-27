"use client";

import type { ChangeEvent, ClipboardEvent } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react";
import type { StepErrors } from "../schema";
import { MIN_NARRATIVE_CHARS } from "../schema";

export type DetailsTabProps = {
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
  minLength = MIN_NARRATIVE_CHARS,
  maxLength = 1000,
  rows = 4,
  readOnly,
}: {
  id: string;
  name: string;
  value: string;
  onChange: any;
  placeholder: string;
  minLength?: number;
  maxLength?: number;
  rows?: number;
  readOnly?: boolean;
}) => {
  const len = (value || "").length;
  const belowMin = !readOnly && len > 0 && len < minLength;

  return (
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
      <div className="absolute bottom-2 right-3 flex items-center gap-2">
        {belowMin && (
          <span className="text-[10px] font-bold text-brand-deep-dark/60 select-none">
            {minLength - len} more needed
          </span>
        )}
        <span className={`text-[10px] font-bold select-none ${len >= minLength ? "text-green-600" : "text-brand-deep-dark/40"}`}>
          {len} / {maxLength}
        </span>
      </div>
    </div>
  );
};

export function DetailsTab({
  formState,
  formErrors,
  handleInputChange,
  handleBack,
  handleSaveDraft,
  handleNext,
  isStepComplete,
  isSubmitting,
  isReadOnly,
}: DetailsTabProps) {
  return (
    <div className="space-y-6">
      <div className="mb-4">
        <h3 className="text-2xl font-black text-brand-deep-dark">Business Narrative</h3>
      </div>

      
      <div className="space-y-1.5">
        <Label htmlFor="businessDescription" className="flex items-center gap-1 text-brand-deep-dark font-bold pl-1">
          Business Description <span className="text-red-500">*</span>
        </Label>
        <CharacterLimitedTextarea
          id="businessDescription"
          name="businessDescription"
          value={formState.businessDescription}
          onChange={handleInputChange}
          placeholder="Provide a brief description of your startup and what it does"
          readOnly={isReadOnly}
        />
        {formErrors.businessDescription && (
          <p className="text-red-500 text-xs mt-1">
            {formErrors.businessDescription}
          </p>
        )}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="problemStatement" className="flex items-center gap-1 text-brand-deep-dark font-bold pl-1">
          Problem Statement <span className="text-red-500">*</span>
        </Label>
        <CharacterLimitedTextarea
          id="problemStatement"
          name="problemStatement"
          value={formState.problemStatement}
          onChange={handleInputChange}
          placeholder="What specific problem is your startup solving? Why is this problem important?"
          readOnly={isReadOnly}
        />
        {formErrors.problemStatement && (
          <p className="text-red-500 text-xs mt-1">
            {formErrors.problemStatement}
          </p>
        )}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="solution" className="flex items-center gap-1 text-brand-deep-dark font-bold pl-1">
          Solution <span className="text-red-500">*</span>
        </Label>
        <CharacterLimitedTextarea
          id="solution"
          name="solution"
          value={formState.solution}
          onChange={handleInputChange}
          placeholder="How does your product or service solve this problem? What makes your solution innovative?"
          readOnly={isReadOnly}
        />
        {formErrors.solution && (
          <p className="text-red-500 text-xs mt-1">
            {formErrors.solution}
          </p>
        )}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="innovationDescription" className="flex items-center gap-1 text-brand-deep-dark font-bold pl-1">
          Innovation Description <span className="text-red-500">*</span>
        </Label>
        <CharacterLimitedTextarea
          id="innovationDescription"
          name="innovationDescription"
          value={formState.innovationDescription}
          onChange={handleInputChange}
          placeholder="Describe what makes your business innovative. What new technologies, methods, or business models are you implementing?"
          readOnly={isReadOnly}
        />
        {formErrors.innovationDescription && (
          <p className="text-red-500 text-xs mt-1">
            {formErrors.innovationDescription}
          </p>
        )}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="targetMarket" className="flex items-center gap-1 text-brand-deep-dark font-bold pl-1">
          Target Market <span className="text-red-500">*</span>
        </Label>
        <CharacterLimitedTextarea
          id="targetMarket"
          name="targetMarket"
          value={formState.targetMarket}
          onChange={handleInputChange}
          placeholder="Describe your target market. Include market size, growth potential, and customer segments."
          readOnly={isReadOnly}
        />
        {formErrors.targetMarket && (
          <p className="text-red-500 text-xs mt-1">
            {formErrors.targetMarket}
          </p>
        )}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="competitiveAdvantage" className="flex items-center gap-1 text-brand-deep-dark font-bold pl-1">
          Competitive Advantage <span className="text-red-500">*</span>
        </Label>
        <CharacterLimitedTextarea
          id="competitiveAdvantage"
          name="competitiveAdvantage"
          value={formState.competitiveAdvantage}
          onChange={handleInputChange}
          placeholder="What is your competitive advantage? How does your solution differ from existing alternatives?"
          readOnly={isReadOnly}
        />
        {formErrors.competitiveAdvantage && (
          <p className="text-red-500 text-xs mt-1">
            {formErrors.competitiveAdvantage}
          </p>
        )}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="scalabilityPlan" className="flex items-center gap-1 text-brand-deep-dark font-bold pl-1">
          Scalability Plan <span className="text-red-500">*</span>
        </Label>
        <CharacterLimitedTextarea
          id="scalabilityPlan"
          name="scalabilityPlan"
          value={formState.scalabilityPlan}
          onChange={handleInputChange}
          placeholder="How do you plan to scale your business? What strategies will enable rapid growth?"
          readOnly={isReadOnly}
        />
        {formErrors.scalabilityPlan && (
          <p className="text-red-500 text-xs mt-1">
            {formErrors.scalabilityPlan}
          </p>
        )}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="traction" className="text-brand-deep-dark font-bold pl-1">Traction & Key Metrics</Label>
        <CharacterLimitedTextarea
          id="traction"
          name="traction"
          value={formState.traction}
          onChange={handleInputChange}
          placeholder="Describe any traction you have achieved so far. Include key metrics, user numbers, revenue, or other relevant indicators of progress."
          readOnly={isReadOnly}
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="riskAssessment" className="text-brand-deep-dark font-bold pl-1">Risk Assessment</Label>
        <CharacterLimitedTextarea
          id="riskAssessment"
          name="riskAssessment"
          value={formState.riskAssessment}
          onChange={handleInputChange}
          placeholder="What are the major risks your startup faces? How do you plan to mitigate these risks?"
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
