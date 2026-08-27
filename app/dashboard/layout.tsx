"use client";

import React, { useState, useEffect } from 'react';
import AppSidebar from './components/sidebar';
import AppNavbar from './components/navbar';
import { PortalSidebarProvider } from '@/components/layout/portal-sidebar-context';


export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) {
    return <div className="min-h-screen bg-[#f8fafc]"></div>;
  }

  return (
    <PortalSidebarProvider>
      <div className="flex h-screen overflow-hidden">
        {/* Sidebar - responsive standalone component */}
        <AppSidebar />

        {/* Main content area */}
        <main className='flex-1 flex flex-col bg-[#f8fafc] overflow-hidden lg:pl-0 min-w-0'>
          <AppNavbar />
          <div className="flex-1 overflow-auto p-4 pt-0 md:p-6 md:pt-0 lg:p-10 lg:pt-0 group/content relative">
            <div className="mx-auto max-w-7xl animate-in fade-in slide-in-from-bottom-2 duration-500">
              {children}
            </div>
          </div>
        </main>
      </div>
    </PortalSidebarProvider>
  );
}


