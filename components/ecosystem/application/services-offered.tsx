"use client";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Layers } from "lucide-react";

interface ServicesOfferedProps {
  services: string[];
}

export function ServicesOffered({ services }: ServicesOfferedProps) {
  if (!services || services.length === 0) return null;

  return (
    <Card className="overflow-hidden border border-slate-200/60 shadow-lg bg-white group">
      <CardHeader className="bg-slate-50/40 p-5 border-b">
        <CardTitle className="text-base flex items-center gap-3 font-black uppercase tracking-widest text-slate-900">
          <div className="p-2 bg-slate-100 rounded-lg text-slate-500 group-hover:bg-primary group-hover:text-white transition-all">
            <Layers className="h-5 w-5" />
          </div>
          Specialization Areas
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <div className="flex flex-wrap gap-2.5">
          {services.map((service, index) => (
            <Badge 
              key={index} 
              variant="secondary"
              className="px-4 py-2 bg-slate-100 text-slate-600 border border-slate-200 hover:bg-primary hover:text-white hover:border-primary transition-all font-bold uppercase tracking-widest text-[10px] rounded-xl"
            >
              {service.replace(/-/g, ' ')}
            </Badge>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
