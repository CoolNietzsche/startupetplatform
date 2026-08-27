import React from 'react';
import Link from 'next/link';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowRight, MapPin, Building2, Calendar } from "lucide-react";

export type StartupData = {
  id: string;
  name: string;
  sector: string;
  founded: number | string;
  description: string;
  status: string;
  stage?: string;
  location?: string;
  slug?: string;
};

interface StartupCardProps {
  startup: StartupData;
  isPublic?: boolean;
}

function getInitials(name: string) {
  return name
    .split(/\s+/)
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export function StartupCard({ startup, isPublic = false }: StartupCardProps) {
  const profileUrl = isPublic 
    ? `/startups/${startup.id}` 
    : `/dashboard/startups/${startup.id}`;

  return (
    <Card
      className="group border-2 border-brand-mint-teal/10 bg-white p-0 rounded-[32px] hover:border-brand-mint-teal/20 transition-all duration-500 hover:shadow-[0_40px_80px_-20px_hsl(var(--mint-teal)_/_0.12)] hover:-translate-y-2 relative overflow-hidden h-full"
    >
      <div className="absolute top-0 right-0 w-32 h-32 bg-brand-mint-teal/5 rounded-bl-[100px] -mr-8 -mt-8 transition-transform duration-700 group-hover:scale-110" />
      
      <CardContent className="p-8 h-full flex flex-col">
        <div className="flex justify-between items-start mb-6">
          <div className="h-16 w-16 bg-brand-mint-teal/5 rounded-2xl flex items-center justify-center group-hover:bg-brand-mint-teal transition-colors duration-500 shadow-sm border border-brand-mint-teal/10 group-hover:border-transparent group-hover:shadow-xl group-hover:shadow-brand-mint-teal/20 shrink-0">
            <span className="text-xl font-black text-brand-deep-dark/80 group-hover:text-white transition-colors">
              {getInitials(startup.name)}
            </span>
          </div>
          <Badge variant="outline" className="border-brand-mint-teal/20 text-brand-mint-teal font-black text-[9px] uppercase tracking-widest bg-brand-mint-teal/5 px-3 py-1">
            {startup.status}
          </Badge>
        </div>
        
        <div className="space-y-4 flex-1">
          <div>
            <h3 className="text-xl font-black text-brand-deep-dark tracking-tight leading-tight group-hover:text-brand-startup-amber transition-colors break-words">
              {startup.name}
            </h3>
            {startup.stage && (
              <p className="text-[10px] font-black uppercase tracking-widest text-brand-startup-amber mt-1">
                {startup.stage} Stage
              </p>
            )}
          </div>
          
          <p className="text-brand-deep-dark text-[13px] font-bold line-clamp-3 leading-relaxed">
            {startup.description || "No description available."}
          </p>
          
          <div className="space-y-2.5 pt-2">
            <div className="flex items-center gap-2 text-brand-mint-teal/70 font-black text-xs tracking-tight">
              <MapPin size={14} className="text-brand-mint-teal" />
              <span className="text-brand-mint-teal">{startup.location || "Addis Ababa, Ethiopia"}</span>
            </div>
            <div className="flex items-center gap-2 text-brand-mint-teal/70 font-black text-xs tracking-tight">
              <Building2 size={14} className="text-brand-mint-teal" />
              Sector: <span className="text-brand-mint-teal">{startup.sector}</span>
            </div>
            <div className="flex items-center gap-2 text-brand-mint-teal/70 font-black text-xs tracking-tight">
              <Calendar size={14} className="text-brand-mint-teal" />
              Founded: <span className="text-brand-startup-amber font-black">{startup.founded}</span>
            </div>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-brand-mint-teal/5 flex items-center justify-between opacity-0 group-hover:opacity-100 transition-all translate-y-4 group-hover:translate-y-0">
          <Button variant="link" className="p-0 h-auto flex items-center gap-1.5 text-brand-mint-teal font-black text-[10px] uppercase tracking-widest hover:gap-2 transition-all no-underline" asChild>
            <Link href={profileUrl}>
              View Profile <ArrowRight size={12} />
            </Link>
          </Button>
          <div className="h-2 w-2 rounded-full bg-brand-mint-teal" />
        </div>
      </CardContent>
    </Card>
  );
}
