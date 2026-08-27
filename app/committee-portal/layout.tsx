"use client";

import { CommitteeSidebar } from "./components/committee-sidebar";
import { CommitteeNavbar } from "./components/navbar";
import { useState, useEffect } from "react";
import Link from 'next/link';
import { Users } from 'lucide-react';
import { PortalSidebarProvider } from "@/components/layout/portal-sidebar-context";


export default function CommitteePortalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) {
    return <div className="min-h-screen bg-slate-50/30"></div>;
  }

  return (
    <PortalSidebarProvider>
      <div className="relative h-screen flex bg-slate-50/30 overflow-hidden">
        {/* Sidebar - responsive */}
        <CommitteeSidebar />

        {/* Main content area */}
        <div className="flex-1 flex flex-col min-w-0">
          <CommitteeNavbar />
          {/* Dynamic Main Body */}
          <main className="flex-1 p-4 md:p-6 relative overflow-y-auto bg-slate-50/50 group/content">
            <div className="absolute top-0 left-0 w-full h-64 bg-gradient-to-b from-white to-transparent pointer-events-none" />
            <div className="mx-auto max-w-7xl relative">
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 fill-mode-both">
                {children}
              </div>
            </div>
          </main>


        </div>
      </div>
    </PortalSidebarProvider>
  );
}

