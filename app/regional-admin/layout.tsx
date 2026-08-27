"use client";

import React from 'react';
import { PortalSidebarProvider } from '@/components/layout/portal-sidebar-context';
import { RegionalAdminSidebar } from './components/sidebar';
import { RegionalAdminNavbar } from './components/navbar';

export default function RegionalAdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <PortalSidebarProvider>
      <div className="flex h-screen bg-slate-50 overflow-hidden relative">
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0 opacity-30">
          <div className="absolute top-0 right-0 w-[50%] h-[50%] rounded-full bg-blue-500/10 blur-[150px]" />
          <div className="absolute bottom-0 left-0 w-[50%] h-[50%] rounded-full bg-indigo-500/5 blur-[150px]" />
        </div>

        <RegionalAdminSidebar />
        <main className="flex-1 flex flex-col min-w-0 relative z-10">
          <RegionalAdminNavbar />
          <div className="flex-1 overflow-y-auto w-full relative">
            <div className="container mx-auto pt-2 pb-6 px-4 max-w-7xl">
              {children}
            </div>
          </div>
        </main>
      </div>
    </PortalSidebarProvider>
  );
}
