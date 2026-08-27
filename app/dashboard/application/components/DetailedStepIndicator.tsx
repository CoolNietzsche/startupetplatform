"use client";

import React from "react";
import { CheckIcon } from "lucide-react";

type Step = {
  id: string;
  name: string;
};

type StepIndicatorProps = {
  steps: Step[];
  currentStep: string;
};

export function DetailedStepIndicator({ steps, currentStep }: StepIndicatorProps) {
  const currentIndex = steps.findIndex((s) => s.id === currentStep);

  return (
    <div className="w-full overflow-x-auto scrollbar-hide">
      <nav aria-label="Progress">
        <ol role="list" className="flex items-center gap-2 sm:gap-4 md:gap-6 min-w-max px-1">
          {steps.map((step, index) => {
            const isCompleted = index < currentIndex;
            const isActive = index === currentIndex;

            return (
              <li key={step.id} className="flex items-center">
                <div className="flex flex-col items-center">
                  <div className="flex items-center">
                    <div
                      className={`flex h-7 w-7 sm:h-9 sm:w-9 items-center justify-center rounded-full border-2 ${isCompleted
                          ? "border-brand-deep-dark bg-brand-deep-dark"
                          : isActive
                            ? "border-brand-deep-dark"
                            : "border-brand-deep-dark/20"
                        }`}
                    >
                      {isCompleted ? (
                        <CheckIcon className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-white" />
                      ) : (
                        <span
                          className={`text-[10px] sm:text-xs font-bold ${isActive ? "text-brand-deep-dark" : "text-brand-deep-dark/40"
                            }`}
                        >
                          {index + 1}
                        </span>
                      )}
                    </div>
                    {index !== steps.length - 1 && (
                      <div className="mx-1 sm:mx-2 w-4 sm:w-8 md:w-12 h-0.5 bg-brand-deep-dark/10">
                        <div
                          className={`h-full bg-brand-deep-dark transition-all ${isCompleted ? "w-full" : "w-0"}`}
                        />
                      </div>
                    )}
                  </div>
                  <span
                    className={`mt-1 text-[8px] sm:text-[10px] font-bold whitespace-nowrap ${isActive ? "text-brand-deep-dark" : "text-brand-deep-dark/50"
                      }`}
                  >
                    {step.name}
                  </span>
                </div>
              </li>
            );
          })}
        </ol>
      </nav>
    </div>
  );
}
