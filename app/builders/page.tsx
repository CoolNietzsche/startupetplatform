import React from 'react';
import { getEcosystemBuilders } from "@/lib/actions/ecosystem";

export const dynamic = "force-dynamic";
import { HeaderSection } from "@/components/landing/header-section";
import { EcosystemBuilderClient } from "../dashboard/ecosystem-builders/client";

export default async function PublicBuildersPage() {
  const builders = await getEcosystemBuilders();
  const allSectors = Array.from(new Set(builders.flatMap(b => b.focusSectors || [])));

  const getDashboardUrl = () => "/dashboard/home";

  return (
    <div className="min-h-screen bg-[#fcfdfd]">
      <HeaderSection dashboardUrl={getDashboardUrl()} />
      
      <main className="pt-32 pb-20 px-6">
        <div className="max-w-7xl mx-auto space-y-8">
          <div className="border-b border-slate-100 pb-8">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-brand-deep-dark tracking-tighter">
              Institutional <span className="text-brand-startup-amber italic underline decoration-brand-mint-teal/20">Hubs</span>
            </h1>
          </div>

          {/* Reusing the dashboard client for the public view */}
          <div className="bg-white p-6 rounded-[32px] border-2 border-slate-50 shadow-xl shadow-slate-100/50">
            <EcosystemBuilderClient 
              initialBuilders={builders} 
              allSectors={allSectors} 
            />
          </div>
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
