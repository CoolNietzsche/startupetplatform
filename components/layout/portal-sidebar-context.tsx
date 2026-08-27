"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';

interface PortalSidebarContextType {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  toggle: () => void;
}

const PortalSidebarContext = createContext<PortalSidebarContextType | undefined>(undefined);

export function PortalSidebarProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setIsOpen(true);
      } else {
        setIsOpen(false);
      }
    };
    
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const toggle = () => setIsOpen(prev => !prev);

  return (
    <PortalSidebarContext.Provider value={{ isOpen, setIsOpen, toggle }}>
      {children}
    </PortalSidebarContext.Provider>
  );
}

export function usePortalSidebar() {
  const context = useContext(PortalSidebarContext);
  if (context === undefined) {
    throw new Error('usePortalSidebar must be used within a PortalSidebarProvider');
  }
  return context;
}
