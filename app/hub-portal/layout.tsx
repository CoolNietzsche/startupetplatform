"use client";

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { PortalSidebarProvider } from '@/components/layout/portal-sidebar-context';

const navItems = [
  { href: "/hub-portal", label: "Dashboard" },
  { href: "/hub-portal/assets", label: "Assets" },
  { href: "/hub-portal/programs", label: "Programs" },
];

export default function HubPortalLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <PortalSidebarProvider>
      <div className="flex h-screen bg-slate-50 overflow-hidden relative">
        <div className="flex-1 flex flex-col min-w-0 relative z-10">
          <nav className="h-14 bg-white border-b flex items-center px-6 gap-1 shrink-0">
            <span className="font-bold text-lg mr-6 text-brand-mint-teal">Hub Portal</span>
            {navItems.map(item => (
              <Link key={item.href} href={item.href} className={cn("px-4 py-2 text-sm font-semibold rounded-lg transition-colors", pathname === item.href ? "bg-brand-mint-teal text-white" : "text-slate-600 hover:bg-slate-100")}>
                {item.label}
              </Link>
            ))}
          </nav>
          <div className="flex-1 overflow-y-auto w-full relative">
            <div className="container mx-auto pt-6 pb-6 px-4 max-w-7xl">
              {children}
            </div>
          </div>
        </div>
      </div>
    </PortalSidebarProvider>
  );
}
