import React from 'react';
import { getPublicStartups } from "../dashboard/startups/actions";

export const dynamic = "force-dynamic";
import { StartupDirectory } from "@/components/directory/startup-directory";
import { HeaderSection } from "@/components/landing/header-section";

export default async function PublicStartupsPage() {
  const result = await getPublicStartups();
  const startups = result.success ? result.data : [];

  const getDashboardUrl = () => "/dashboard/home";

  return (
    <div className="min-h-screen bg-[#fcfdfd]">
      <HeaderSection dashboardUrl={getDashboardUrl()} />
      
      <main className="pt-32 pb-20 px-6">
        <div className="max-w-7xl mx-auto">
          <StartupDirectory 
            startups={startups} 
            isPublic={true} 
            title="Certified Startups"
          />
        </div>
      </main>

      <footer className="w-full bg-brand-deep-dark py-12 border-t-2 border-brand-startup-amber mt-20">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-8">
           <div className="text-white font-black text-xl italic uppercase tracking-tighter">
             Startup<span className="text-brand-startup-amber">ET</span>
           </div>
           <div className="text-white/30 text-xs font-black uppercase tracking-widest">
             © {new Date().getFullYear()} Ministry of Innovation & Technology
           </div>
        </div>
      </footer>
    </div>
  );
}
