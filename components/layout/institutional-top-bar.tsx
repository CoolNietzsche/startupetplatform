"use client";

import React, { useMemo } from "react";
import { PortalNavbar } from "./portal-navbar";
import { usePortalSidebar } from "./portal-sidebar-context";
import { cn } from "@/lib/utils";

interface InstitutionalTopBarProps {
  title?: string;
  className?: string;
}

export function InstitutionalTopBar({ title = "Dashboard", className }: InstitutionalTopBarProps) {
  const { toggle } = usePortalSidebar();

  const formattedTitle = useMemo(() => {
    const parts = title.split(" ");
    if (parts.length <= 1) return <span className="text-brand-deep-dark">{title}</span>;
    
    // Primary brand keyword (e.g., "System", "Admin", "Startup")
    const prefix = parts[0];
    // Administrative suffixes to hide on mobile (e.g., "Administrative Dashboard")
    const suffix = parts.slice(1);
    
    return (
      <>
        <span className="text-brand-deep-dark">{prefix}</span>
        <span className="hidden md:inline ml-2">
          {suffix.length > 1 ? (
            <>
              <span className="text-brand-deep-dark">{suffix.slice(0, -1).join(" ")}</span>
              <span className="text-brand-startup-amber ml-2">{suffix[suffix.length - 1]}</span>
            </>
          ) : (
            <span className="text-brand-startup-amber">{suffix[0]}</span>
          )}
        </span>
      </>
    );
  }, [title]);

  const leftContent = (
    <div className="flex items-center gap-2 md:gap-4 overflow-hidden lg:overflow-visible">
      {/* Branding with Logo and Large Text */}
      <div className="flex items-center gap-1.5 md:gap-3 group cursor-default shrink-0">
        
        <div className="flex flex-col min-w-0 md:min-w-max">
          <h1 className="text-sm md:text-base lg:text-lg font-bold tracking-tight leading-none">
            {formattedTitle}
          </h1>
        </div>
      </div>
      
      {/* Vertical Divider */}
      <div className="hidden xl:block h-8 w-px bg-slate-200 mx-2" />
    </div>
  );

  return (
    <PortalNavbar 
      leftContent={leftContent}
      variant="light"
      showNotifications={true}
      onMenuToggle={toggle}
      className={cn("h-14 md:h-16 border-b border-gray-200 bg-white", className)}
    />
  );
}
