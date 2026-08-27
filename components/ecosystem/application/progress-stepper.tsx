"use client";

import React from "react";
import { CheckCircle, AlertCircle } from "lucide-react";

interface ProgressStepperProps {
  steps: {
    label: string;
    status: string;
    date?: string | null;
  }[];
}

export function ProgressStepper({ steps }: ProgressStepperProps) {
  return (
    <div className="mb-12">
      <div className="relative">
        <div className="absolute top-5 left-8 right-8 h-0.5 bg-slate-200 hidden md:block" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 px-2">
          {steps.map((step, idx) => (
            <div key={idx} className="relative z-10 flex flex-col items-center group">
              <div 
                className={`w-12 h-12 rounded-full flex items-center justify-center border-4 transition-all duration-500 shadow-xl ${
                  step.status === 'completed' ? 'bg-primary border-primary/20 text-white shadow-primary/20' :
                  step.status === 'current' ? 'bg-amber-500 border-amber-500/20 text-white shadow-amber-200 animate-pulse' :
                  step.status === 'error' ? 'bg-red-600 border-red-600/20 text-white shadow-red-200' :
                  'bg-white border-slate-100 text-slate-300'
                }`}
              >
                {step.status === 'completed' ? <CheckCircle className="h-6 w-6" /> :
                 step.status === 'error' ? <AlertCircle className="h-6 w-6" /> :
                 <span className="text-sm font-black">{idx + 1}</span>}
              </div>
              <div className="mt-4 text-center">
                <p 
                  className={`text-[10px] font-black uppercase tracking-[0.2em] transition-colors ${
                    step.status === 'completed' ? 'text-primary' :
                    step.status === 'current' ? 'text-amber-600' :
                    step.status === 'error' ? 'text-red-600' :
                    'text-slate-400'
                  }`}
                >
                  {step.label}
                </p>
                {step.date && (
                  <p className="text-[9px] text-slate-400 font-bold uppercase tracking-tighter mt-1">{new Date(step.date).toLocaleDateString()}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
