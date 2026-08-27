"use client";

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { signOut } from 'next-auth/react';
import { cn } from '@/lib/utils';
import {
  LogOut,
  ChevronRight,
  ShieldCheck,
  Zap,
  Rocket
} from 'lucide-react';
import { usePortalSidebar } from './portal-sidebar-context';

export interface SidebarItem {
  id: string;
  title: string;
  href: string;
  icon: React.ReactNode;
  exact?: boolean;
  requiredPermission?: string;
  submenu?: {
    href: string;
    label: string;
  }[];
  badge?: React.ReactNode;
}

export interface SidebarSection {
  section?: string;
  items: SidebarItem[];
}

export interface PortalSidebarProps {
  title?: React.ReactNode;
  sections: SidebarSection[];
  footerItems?: React.ReactNode;
  activeColor?: 'mint' | 'amber' | 'primary' | 'slate';
  onSignOut?: () => void;
  className?: string;
  showSignOut?: boolean;
}

export function PortalSidebar({
  title,
  sections,
  footerItems,
  activeColor = 'mint',
  onSignOut,
  className,
  showSignOut = true,
}: PortalSidebarProps) {
  const pathname = usePathname();
  const { isOpen, setIsOpen } = usePortalSidebar();

  const handleSignOut = () => {
    if (onSignOut) {
      onSignOut();
    } else {
      signOut({ callbackUrl: "/auth/sign-in" });
    }
  };

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-[60] bg-brand-deep-dark/40 backdrop-blur-md lg:hidden transition-all duration-500 animate-in fade-in"
          onClick={() => setIsOpen(false)}
        ></div>
      )}

      {/* Sidebar Container */}
      <div
        className={cn(
          "fixed top-0 bottom-0 left-0 z-[70] w-[280px] lg:w-64 bg-white transition-all duration-500 ease-in-out transform lg:translate-x-0 lg:relative lg:z-10 lg:h-screen lg:sticky lg:top-0 shadow-2xl lg:shadow-none overflow-hidden border-r border-gray-200 font-sans antialiased",
          isOpen ? "translate-x-0 scale-100 opacity-100" : "-translate-x-full lg:translate-x-0",
          className
        )}
      >
        <div className="flex flex-col h-full">
          {/* Top Logo Section */}
          <div className="relative flex items-center justify-between h-14 md:h-16 px-6 overflow-hidden shrink-0 border-b border-gray-200">
            {/* Subtle glow */}
            <div className="absolute -top-10 -left-10 h-32 w-32 bg-brand-startup-amber/15 rounded-full blur-3xl pointer-events-none" />

            <div className="relative flex items-center flex-1 min-w-0">
              <Link href="/" className="flex items-center group/logo">
                <img src="/image/WhatsApp_Image_2026-07-18_at_8.29.44_PM-removebg-preview.png" alt="StartupET" className="h-16 w-full object-contain transition-transform group-hover/logo:scale-105" />
              </Link>
            </div>

            <button
              onClick={() => setIsOpen(false)}
              className="relative p-2 rounded-xl text-white/50 hover:text-white hover:bg-white/10 transition-all lg:hidden shrink-0 ml-2 border border-white/10"
              aria-label="Close sidebar"
            >
              <ChevronRight className="h-4 w-4 rotate-180" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto py-4 px-4 bg-gradient-to-b from-brand-startup-amber/[0.02] to-white [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar-thumb]:bg-brand-startup-amber/10 [&::-webkit-scrollbar-thumb]:rounded-full scroll-smooth">
            <nav className="space-y-1">
              {sections.flatMap((section) => section.items).map((item) => {
                const isActive = pathname === item.href ||
                  (!item.exact && item.href !== '/' && pathname.startsWith(item.href + '/'));

                return (
                  <div key={item.id} className="flex flex-col">
                    <Link
                      href={item.href}
                      onClick={() => {
                        if (window.innerWidth < 1024) setIsOpen(false);
                      }}
                      className={cn(
                        "group relative flex items-center gap-4 px-4 py-2 rounded-xl transition-all duration-300 overflow-hidden border-b border-slate-50 last:border-0",
                        isActive
                          ? "bg-brand-deep-dark text-white shadow-xl shadow-brand-deep-dark/20 border-b-brand-deep-dark/10"
                          : "text-slate-900 hover:text-brand-startup-amber hover:bg-brand-startup-amber/5"
                      )}
                    >
                      <div className={cn(
                        "flex items-center justify-center transition-all duration-300 shrink-0",
                        isActive ? "scale-110" : "group-hover:scale-110"
                      )}>
                        {React.cloneElement(item.icon as React.ReactElement, {
                          size: 20,
                          className: cn(isActive ? "text-brand-startup-amber" : "text-slate-500 group-hover:text-brand-startup-amber")
                        })}
                      </div>

                      <span className={cn(
                        "flex-1 text-[14.5px] font-semibold transition-all font-sans",
                        isActive ? "translate-x-0" : ""
                      )}>
                        {item.title}
                      </span>

                      {isActive && (
                        <div className="h-1.5 w-1.5 rounded-full bg-brand-startup-amber animate-pulse" />
                      )}
                    </Link>

                    {item.submenu && isActive && (
                      <div className="ml-10 mt-1 pl-4 border-l-2 border-brand-startup-amber/10 space-y-1">
                        {item.submenu.map((sub, subIdx) => (
                          <Link
                            key={subIdx}
                            href={sub.href}
                            onClick={() => {
                              if (window.innerWidth < 1024) setIsOpen(false);
                            }}
                            className={cn(
                              "relative block px-3 py-2 text-[11px] font-semibold transition-all rounded-xl font-sans",
                              pathname === sub.href
                                ? "text-brand-startup-amber bg-brand-startup-amber/5"
                                : "text-slate-500 hover:text-brand-startup-amber hover:bg-brand-startup-amber/5"
                            )}
                          >
                            {pathname === sub.href && (
                              <Zap size={10} className="inline-block mr-2 fill-brand-startup-amber" />
                            )}
                            {sub.label}
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </nav>
          </div>

          {/* Footer */}
          <div className="px-5 py-4 border-t border-brand-startup-amber/5 shrink-0 bg-white">
            {footerItems && <div className="mb-2">{footerItems}</div>}
            
            <div className="space-y-1">
              {showSignOut && (
                <button
                  onClick={handleSignOut}
                  className="w-full flex items-center justify-between px-4 py-3 text-sm font-semibold text-rose-600 hover:text-rose-700 hover:bg-rose-50 transition-all rounded-xl group"
                >
                  <div className="flex items-center gap-3">
                    <LogOut className="h-5 w-5" />
                    Logout
                  </div>
                  <ChevronRight size={14} className="opacity-0 group-hover:opacity-40 transition-opacity" />
                </button>
              )}
            </div>
            
            {!showSignOut && (
              <div className="mt-2 text-center opacity-30">
                 <span className="text-[7px] font-semibold text-slate-400">
                   v2.0.4 - StartupET
                 </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
