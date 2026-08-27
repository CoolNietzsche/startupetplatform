"use client";

import React from 'react';
import { StartupDirectory } from "@/components/directory/startup-directory";
import type { DashboardStartupItem } from "./actions";

export function StartupsClient({
  startups,
}: {
  startups: DashboardStartupItem[];
}) {
  return (
    <div className="bg-white min-h-screen p-6 md:p-8 lg:p-10 rounded-[40px] shadow-sm border border-slate-100 overflow-hidden">
      <StartupDirectory 
        startups={startups} 
        isPublic={false} 
        title="Institutional Startups"
      />
    </div>
  );
}
