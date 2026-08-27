"use client";

import React, { useState, useEffect, ReactNode } from 'react';
import Link from 'next/link';
import { SuperAdminSidebar } from './components/sidebar';
import { SuperAdminNavbar } from './components/navbar';
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
    console.error("Error caught:", error, errorInfo);
  }

  render(): React.ReactNode {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center h-screen bg-red-50 p-4">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Something went wrong</h2>
          <p className="mb-4 text-gray-700">An error occurred while loading the super admin dashboard.</p>
          <Link href="/" className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
            Return Home
          </Link>
        </div>
      );
    }

    return this.props.children;
  }
}

export default function SuperAdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isClient, setIsClient] = useState(false);

  // This effect will only run on the client side
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Return null during SSR to avoid hydration issues
  if (!isClient) {
    return <div className="min-h-screen bg-gray-100"></div>;
  }

  return (
    <ErrorBoundary>
      <PortalSidebarProvider>
        <div className="flex h-screen bg-slate-50 overflow-hidden relative group/layout">
          {/* Advanced Brand Mesh Glows */}
          <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0 opacity-40">
            <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-brand-mint-teal/10 blur-[120px]" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-brand-startup-amber/10 blur-[120px]" />
          </div>

          <SuperAdminSidebar />
          <main className="flex-1 flex flex-col min-w-0 relative z-10">
            <SuperAdminNavbar />
            <div className="flex-1 overflow-y-auto w-full group/content relative">
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


