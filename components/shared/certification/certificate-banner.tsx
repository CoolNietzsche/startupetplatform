"use client";

import React from "react";
import { AlertCircle, Award, Calendar, Shield, Mail, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface UniversalStatusBannerProps {
  status: string;
  type: "STARTUP" | "ECOSYSTEM";
  organizationName: string;
  issuedAt?: string;
  onAction?: () => void;
  actionLabel?: string;
  className?: string;
}

/**
 * High-performance, universal status banner for all application portals.
 * Standardizes the 'hero' UI for both Startup and Ecosystem builders.
 */
export function UniversalStatusBanner({ 
  status, 
  type, 
  organizationName, 
  issuedAt, 
  onAction, 
  actionLabel, 
  className 
}: UniversalStatusBannerProps) {
  const isCertified = status?.toUpperCase() === "CERTIFIED";
  const isCommittee = status?.includes("COMMITTEE") || status?.includes("ASSIGNED");
  const isClarification = status?.includes("CLARIFICATION") || isCommittee;
  const isPending = status?.toLowerCase() === "pending" || status?.toLowerCase() === "under_review" || status?.toLowerCase() === "submitted";
  
  // Theme selection based on status and organization type
  const theme = {
    bg: isCertified ? "bg-primary/5" : isClarification ? "bg-amber-50" : "bg-slate-50",
    border: isCertified ? "border-primary/20" : isClarification ? "border-amber-200" : "border-slate-200",
    shadow: isCertified ? "shadow-primary/10" : isClarification ? "shadow-amber-100" : "shadow-slate-100",
    iconBg: isCertified ? "bg-primary" : isClarification ? "bg-amber-100" : "bg-white",
    iconText: isCertified ? "text-white" : isClarification ? "text-amber-600" : "text-slate-400",
  };

  // Only show the hero banner for significant milestones (Certified) or initial submission (Pending)
  if (isClarification && !isCertified) return null;

  return (
    <div className={cn("animate-in fade-in slide-in-from-top duration-700", className)}>
      <div className={cn(
        "relative overflow-hidden p-6 sm:p-8 rounded-[2rem] border shadow-2xl transition-all",
        theme.bg, theme.border, theme.shadow
      )}>
        {/* Decorative background element */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/40 rounded-full blur-3xl -mr-32 -mt-32 opacity-80" />
        
        <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-8">
          <div className="flex flex-col sm:flex-row items-center gap-6 text-center sm:text-left">
            {/* Visual Icon/Badge */}
            <div className={cn(
              "h-16 w-16 sm:h-20 sm:w-20 rounded-3xl flex items-center justify-center shadow-lg ring-4 ring-white/50 shrink-0",
              theme.iconBg
            )}>
              {isCertified ? <Award className="h-8 w-8 text-white" /> : 
               isClarification ? <AlertCircle className="h-8 w-8 text-amber-600" /> : 
               <Shield className="h-8 w-8 text-slate-400" />}
            </div>

            <div className="min-w-0">
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 mb-2">
                <h2 className={cn(
                  "text-xl sm:text-2xl font-black tracking-tight uppercase",
                  isCertified ? "text-primary" : isClarification ? "text-amber-900" : "text-slate-900"
                )}>
                  {isCertified ? "Certification Complete" : isClarification ? "Clarification Requested" : "Status Update"}
                </h2>
                <Badge variant="outline" className="bg-white/80 border-slate-200 text-slate-500 font-bold tracking-widest uppercase text-[8px] px-3 py-1 rounded-full">
                  {type} Portal
                </Badge>
              </div>
              
              <p className="text-slate-500 font-medium text-sm sm:text-base leading-relaxed max-w-xl">
                {isCertified ? 
                  `Congratulations ${organizationName}, your organization is officially certified by the Ministry.` :
                  isClarification ? 
                  `The evaluation committee requires additional context regarding your ${organizationName} profile.` :
                  `Your application is currently being processed by the National Startup Portal teams.`
                }
              </p>

              {isCertified && issuedAt && (
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 mt-6">
                  <div className="flex items-center gap-2 bg-white/80 px-3 py-2 rounded-xl border border-slate-200/50 shadow-sm">
                    <Calendar className="h-3.5 w-3.5 text-slate-400" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">
                      Issued {new Date(issuedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 bg-primary/10 px-3 py-2 rounded-xl border border-primary/20 shadow-sm">
                    <Shield className="h-3.5 w-3.5 text-primary" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-primary">
                      Institutional Provider
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="w-full lg:w-auto">
            <Button
              size="lg"
              onClick={onAction}
              className={cn(
                "w-full sm:w-auto h-12 sm:h-14 px-8 rounded-xl sm:rounded-2xl font-black uppercase tracking-widest text-[10px] sm:text-xs transition-all hover:scale-[1.02] active:scale-95 shadow-xl flex items-center justify-center gap-2 group",
                isCertified ? "bg-primary text-white shadow-primary/20" : 
                isClarification ? "bg-amber-600 text-white shadow-amber-200" : 
                "bg-slate-900 text-white shadow-slate-200"
              )}
            >
              {isClarification ? <Mail className="h-4 w-4 transition-transform group-hover:scale-110" /> : <Award className="h-4 w-4" />}
              {actionLabel || (isCertified ? "View Certificate" : isClarification ? "Respond Now" : "Check Progress")}
              {!isCertified && <ArrowRight className="h-4 w-4 ml-1 opacity-50 group-hover:translate-x-1 transition-transform" />}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
