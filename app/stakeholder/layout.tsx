"use client";

import React, { useState, useEffect, ReactNode } from 'react';
import Link from 'next/link';
import { StakeholderSidebar } from './components/sidebar';
import { StakeholderNavbar } from './components/navbar';
import { PortalSidebarProvider } from '@/components/layout/portal-sidebar-context';

// Define types for ErrorBoundary
interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
}

// Custom error boundary to catch input value errors
class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
    console.error("Stakeholder Portal Error:", error, errorInfo);
  }

  render(): React.ReactNode {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center h-screen bg-rose-50 p-4">
          <h2 className="text-2xl font-black text-rose-600 mb-4 tracking-tighter">Portal Sync Failure</h2>
          <p className="mb-6 text-slate-600 font-medium text-center max-w-md">An error occurred while loading the institutional interface. Technical monitoring is investigating.</p>
          <Link href="/" className="px-8 py-3 bg-brand-deep-dark text-white font-black rounded-2xl hover:scale-105 transition-all shadow-xl shadow-slate-900/20">
            Return Home
          </Link>
        </div>
      );
    }

    return this.props.children;
  }
}

export default function StakeholderLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) {
    return <div className="min-h-screen bg-slate-50"></div>;
  }

  return (
    <ErrorBoundary>
      <PortalSidebarProvider>
        <div className="flex h-screen bg-slate-50 overflow-hidden relative">
          {/* Stakeholder-specific mesh glows */}
          <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0 opacity-30">
            <div className="absolute top-0 right-0 w-[50%] h-[50%] rounded-full bg-brand-mint-teal/10 blur-[150px]" />
            <div className="absolute bottom-0 left-0 w-[50%] h-[50%] rounded-full bg-indigo-500/5 blur-[150px]" />
          </div>

          <StakeholderSidebar />
          <main className="flex-1 flex flex-col min-w-0 relative z-10">
            <StakeholderNavbar />
            <div className="flex-1 overflow-y-auto w-full relative">
              <div className="container mx-auto pt-2 pb-6 px-4 max-w-7xl">
                {children}
              </div>
            </div>
          </main>
        </div>
      </PortalSidebarProvider>
    </ErrorBoundary>
  );
}
