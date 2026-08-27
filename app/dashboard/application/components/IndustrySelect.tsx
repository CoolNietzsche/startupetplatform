"use client";

import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type IndustrySelectProps = {
  value?: string;
  onSelect: (value: string) => void;
  error?: string;
  disabled?: boolean;
};

const industries = [
  { value: "technology", label: "Technology" },
  { value: "agriculture", label: "Agriculture" },
  { value: "healthcare", label: "Healthcare" },
  { value: "education", label: "Education" },
  { value: "finance", label: "Finance" },
  { value: "manufacturing", label: "Manufacturing" },
  { value: "retail", label: "Retail" },
  { value: "services", label: "Services" },
  { value: "other", label: "Other" },
];

export function IndustrySelect({ value, onSelect, error, disabled }: IndustrySelectProps) {
  return (
    <div>
      <Label htmlFor="industry" className="flex items-center gap-1 text-brand-deep-dark font-bold pl-1 mb-1.5 inline-block">Industry <span className="text-red-500">*</span></Label>
      <Select onValueChange={onSelect} defaultValue={value} value={value || undefined} disabled={disabled}>
        <SelectTrigger className="border-brand-deep-dark/20 focus:ring-brand-deep-dark focus:border-brand-deep-dark hover:border-brand-deep-dark/40 transition-colors bg-white shadow-sm h-10 data-[state=open]:border-brand-deep-dark">
          <SelectValue placeholder="Select industry" />
        </SelectTrigger>
        <SelectContent className="z-[100] bg-white border border-brand-deep-dark/10 shadow-xl shadow-brand-deep-dark/5">
          {industries.map((industry) => (
            <SelectItem key={industry.value} value={industry.value}>
              {industry.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
    </div>
  );
}
