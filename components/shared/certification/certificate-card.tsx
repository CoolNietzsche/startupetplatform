"use client";

import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Award, Shield, Calendar, ExternalLink, Download, Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface CertificateCardProps {
  data: {
    id: string;
    certificateNumber?: string;
    type: "STARTUP" | "ECOSYSTEM";
    issuedAt: string;
    level?: string;
    organizationName: string;
    status?: string;
  };
  onView?: () => void;
  onDownload?: () => void;
  className?: string;
}

/**
 * Premium, reusable card for displaying official certificate summaries
 * Features adaptive branding based on MInT standards (Teal/Amber).
 */
export function CertificateCard({ data, onView, onDownload, className }: CertificateCardProps) {
  const isEcosystem = data.type === "ECOSYSTEM";
  const brandColor = isEcosystem ? "text-primary" : "text-amber-600";
  const bgColor = isEcosystem ? "bg-primary/5" : "bg-amber-50";
  const borderColor = isEcosystem ? "border-primary/10" : "border-amber-100";

  return (
    <Card className={cn(
      "group overflow-hidden border-slate-200 shadow-xl transition-all hover:shadow-2xl hover:border-primary/20 bg-white rounded-[2rem]",
      className
    )}>
      <CardContent className="p-0">
        <div className={cn("relative p-6 sm:p-8 overflow-hidden border-b", borderColor, bgColor)}>
          <div className="absolute top-0 right-0 w-48 h-48 bg-white/40 rounded-full blur-3xl -mr-24 -mt-24" />
          
          <div className="relative z-10 flex items-start justify-between">
            <div className="p-3 sm:p-4 bg-white rounded-2xl sm:rounded-3xl shadow-lg shadow-black/5 flex items-center justify-center shrink-0">
              <Award className={cn("h-8 w-8 sm:h-10 sm:w-10", brandColor)} />
            </div>
            <div className="text-right">
              <Badge variant="outline" className="bg-white/80 border-slate-200 text-slate-500 font-black tracking-widest uppercase text-[8px] sm:text-[9px] px-2 sm:px-3 py-1 rounded-full whitespace-nowrap">
                {isEcosystem ? "Ecosystem Builder" : "Startup License"}
              </Badge>
              <p className="mt-2 text-[8px] sm:text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Credential ID</p>
              <p className="text-xs sm:text-sm font-black text-slate-900 tracking-tight truncate max-w-[120px] sm:max-w-none ml-auto">
                {data.certificateNumber || data.id.slice(0, 12).toUpperCase()}
              </p>
            </div>
          </div>
          
          <div className="mt-6 sm:mt-8 relative z-10">
            <h3 className="text-xl sm:text-2xl font-black text-slate-900 leading-tight uppercase tracking-tight group-hover:text-primary transition-colors truncate">
              {data.organizationName}
            </h3>
            <div className="flex flex-wrap items-center gap-2 sm:gap-4 mt-4">
              <div className="flex items-center gap-2 px-2 sm:px-3 py-1 sm:py-1.5 bg-white/80 rounded-lg sm:rounded-xl border border-slate-200/50">
                <Shield className={cn("h-3.5 w-3.5 sm:h-4 sm:w-4", brandColor)} />
                <span className="text-[8px] sm:text-[10px] font-black uppercase tracking-widest text-slate-600">
                  {data.level || (isEcosystem ? "Verified Provider" : "Beta Stage")}
                </span>
              </div>
              <div className="flex items-center gap-2 px-2 sm:px-3 py-1 sm:py-1.5 bg-white/80 rounded-lg sm:rounded-xl border border-slate-200/50">
                <Calendar className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-slate-400" />
                <span className="text-[8px] sm:text-[10px] font-black uppercase tracking-widest text-slate-500">
                  {new Date(data.issuedAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short' })}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="p-4 sm:p-6 bg-slate-50/50 flex flex-col xs:flex-row items-center gap-3">
          <Button 
            onClick={onView}
            className="w-full sm:flex-1 bg-primary hover:bg-primary/90 text-white shadow-lg shadow-primary/20 border-none font-black h-11 sm:h-12 rounded-xl sm:rounded-2xl active:scale-95 transition-all text-[10px] sm:text-xs uppercase tracking-widest flex items-center justify-center gap-2"
          >
            <ExternalLink className="h-4 w-4" />
            Official Preview
          </Button>
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Button 
              variant="outline" 
              size="icon" 
              onClick={onDownload}
              className="h-11 w-11 sm:h-12 sm:w-12 rounded-xl sm:rounded-2xl border-slate-200 hover:bg-white text-slate-500 transition-all hover:text-primary active:scale-95 shadow-sm"
              title="Download PDF"
            >
              <Download className="h-5 w-5" />
            </Button>
            <Button 
              variant="outline" 
              size="icon" 
              className="h-11 w-11 sm:h-12 sm:w-12 rounded-xl sm:rounded-2xl border-slate-200 hover:bg-white text-slate-500 transition-all hover:text-primary active:scale-95 shadow-sm"
              title="Share Credential"
            >
              <Share2 className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
