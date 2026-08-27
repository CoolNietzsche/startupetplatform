import React from 'react';
import { Clock } from "lucide-react";
import { HeaderSection } from "@/components/landing/header-section";

export const dynamic = "force-dynamic";

export default function PublicNewsPage() {
  const getDashboardUrl = () => "/dashboard/home";

  return (
    <div className="min-h-screen bg-[#fcfdfd]">
      <HeaderSection dashboardUrl={getDashboardUrl()} />

      <main className="pt-32 pb-20 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-amber-100 text-amber-800 font-bold text-xs uppercase tracking-widest px-4 py-2 rounded-full mb-6">
            <Clock className="h-4 w-4" />
            Coming Soon
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-brand-deep-dark tracking-tighter mb-4">
            Ecosystem Highlights
          </h1>
          <p className="text-slate-500 text-lg leading-relaxed">
            A public feed of national startup ecosystem news, designation announcements,
            and hub activity is on its way. Sign in and check your dashboard for the
            latest updates in the meantime.
          </p>
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
