"use client";

import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type StageSelectProps = {
  value?: string;
  onSelect: (value: string) => void;
  error?: string;
  disabled?: boolean;
};

const stages = [
  { value: "INITIAL", label: "Initial Stage", description: "2yr — Idea to early revenue (Art. 22.1)" },
  { value: "POST_INITIAL", label: "Post-Initial Stage", description: "4yr — Growth & traction (Art. 22.2)" },
  { value: "SCALE_EXIT", label: "Scale & Exit Stage", description: "2yr — Scaling & exit readiness (Art. 22.3)" },
];

export function StageSelect({ value, onSelect, error, disabled }: StageSelectProps) {
  return (
    <div>
      <Label htmlFor="stage" className="flex items-center gap-1 text-brand-deep-dark font-bold pl-1 mb-1.5 inline-block">Business Stage <span className="text-red-500">*</span></Label>
      <Select onValueChange={onSelect} defaultValue={value} value={value || undefined} disabled={disabled}>
        <SelectTrigger className="border-brand-deep-dark/20 focus:ring-brand-deep-dark focus:border-brand-deep-dark hover:border-brand-deep-dark/40 transition-colors bg-white shadow-sm h-10 data-[state=open]:border-brand-deep-dark">
          <SelectValue placeholder="Select lifecycle stage">
            {value && stages.find(s => s.value === value)?.label}
          </SelectValue>
        </SelectTrigger>
        <SelectContent className="z-[100] bg-white border border-brand-deep-dark/10 shadow-xl shadow-brand-deep-dark/5">
          {stages.map((stage) => (
            <SelectItem key={stage.value} value={stage.value} className="py-2">
              <div>
                <div>{stage.label}</div>
                <div className="text-[10px] text-brand-deep-dark/60">{stage.description}</div>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
    </div>
  );
}
