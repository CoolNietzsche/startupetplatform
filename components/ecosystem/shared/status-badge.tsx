import React from "react";
import { Badge } from "@/components/ui/badge";
import { 
  FileText, 
  Clock, 
  Search, 
  RotateCw, 
  CheckCircle2, 
  Award, 
  XCircle,
  Users,
  AlertCircle
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { EcosystemApplicationStatus } from "./types";

interface EcosystemStatusBadgeProps {
  status: string | EcosystemApplicationStatus;
  showIcon?: boolean;
  className?: string;
}

export const getStatusConfig = (status: string) => {
  const s = status?.toUpperCase() || "DRAFT";
  
  switch (s) {
    case "CERTIFIED":
      return { 
        label: "Certified", 
        variant: "success", 
        icon: Award, 
        className: "bg-emerald-100 text-emerald-800 border-emerald-200/50 font-black uppercase text-[9px] px-2.5 py-1" 
      };
    case "PENDING":
      return { 
        label: "Pending Review", 
        variant: "warning", 
        icon: Clock, 
        className: "bg-amber-50 text-amber-600 border-amber-200/50" 
      };
    case "UNDER_REVIEW":
      return { 
        label: "Under Review", 
        variant: "info", 
        icon: Search, 
        className: "bg-brand-1/5 text-brand-1 border-brand-1/10" 
      };
    case "REVIEWED":
      return { 
        label: "Reviewed", 
        variant: "secondary", 
        icon: CheckCircle2, 
        className: "bg-indigo-50 text-indigo-700 border-indigo-100/50 font-black uppercase text-[9px] px-2.5 py-1" 
      };
    case "CLARIFICATION_REQUESTED":
      return { 
        label: "Clarification Requested", 
        variant: "warning", 
        icon: RotateCw, 
        className: "bg-amber-50 text-amber-600 border-amber-200/50" 
      };
    case "ASSIGNED_TO_COMMITTEE":
      return { 
        label: "In Committee", 
        variant: "info", 
        icon: Users, 
        className: "bg-brand-1/5 text-brand-1 border-brand-1/10" 
      };
    case "IN_COMMITTEE_REVIEW":
      return { 
        label: "Committee Reviewing", 
        variant: "info", 
        icon: Clock, 
        className: "bg-brand-1/10 text-brand-1 border-brand-1/20" 
      };
    case "COMMITTEE_REVIEW_SUBMITTED":
      return { 
        label: "Committee Approved", 
        icon: CheckCircle2, 
        className: "bg-emerald-600 text-white border-emerald-700 shadow-sm font-black uppercase text-[10px] px-3 py-1 ring-2 ring-emerald-500/20" 
      };
    case "REJECTED":
      return { 
        label: "Rejected", 
        variant: "destructive", 
        icon: XCircle, 
        className: "bg-red-50 text-red-600 border-red-100" 
      };
    case "DRAFT":
      return { 
        label: "Draft", 
        variant: "outline", 
        icon: FileText, 
        className: "bg-slate-50 text-slate-500 border-slate-200" 
      };
    default:
      return { 
        label: status || "Unknown Status", 
        variant: "outline", 
        icon: AlertCircle, 
        className: "bg-slate-50 text-slate-500 border-slate-200" 
      };
  }
};

export function EcosystemStatusBadge({ status, showIcon = true, className }: EcosystemStatusBadgeProps) {
  const config = getStatusConfig(status);
  const Icon = config.icon;
  
  return (
    <Badge 
      variant={config.variant as any} 
      className={cn("font-medium gap-1.5 py-0.5 whitespace-nowrap", config.className, className)}
    >
      {showIcon && <Icon className="h-3.5 w-3.5" />}
      {config.label}
    </Badge>
  );
}
