"use client";

import React, { useState, useEffect, ReactNode } from 'react';
import Link from 'next/link';
import { EcosystemBuilderSidebar } from './components/sidebar';
import { EcosystemBuilderNavbar } from './components/navbar';
import { PortalSidebarProvider } from '@/components/layout/portal-sidebar-context';


// Define types for ErrorBoundary
interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
}

// Custom error boundary to catch input value errors
class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState & { error?: Error }> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState & { error: Error } {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
    console.error("Error caught:", error, errorInfo);
  }

  render(): React.ReactNode {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-red-50 p-6 text-center">
          <div className="bg-white p-8 rounded-xl shadow-lg max-w-2xl border border-red-200">
            <h2 className="text-2xl font-bold text-red-600 mb-4">Application Error</h2>
            <p className="mb-2 text-gray-700 font-medium">Something went wrong while rendering this page.</p>
            <div className="bg-red-50 p-4 rounded text-left mb-6 overflow-auto max-h-40">
              <p className="text-xs font-mono text-red-800 break-all">
                {this.state.error?.toString()}
              </p>
            </div>
            <div className="flex gap-4 justify-center">
              <Link href="/ecosystem-builder" className="px-4 py-2 bg-slate-800 text-white rounded-lg hover:bg-slate-700 transition-colors">
                Return to Portal
              </Link>
              <button 
                onClick={() => window.location.reload()} 
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Try Again
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default function EcosystemBuilderLayout({
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
        <div className="flex h-screen bg-gray-100 overflow-hidden">
          <EcosystemBuilderSidebar />
          <main className="flex-1 flex flex-col min-w-0">
            <EcosystemBuilderNavbar />
            <div className="flex-1 overflow-y-auto w-full group/content relative">
              <div className="container mx-auto py-6 px-4 max-w-7xl">
                {children}
              </div>
            </div>
          </main>
        </div>
      </PortalSidebarProvider>
    </ErrorBoundary>
  );
}


