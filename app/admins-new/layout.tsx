"use client";

import React from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { AdminSidebar } from "./components/admin-sidebar";
import { AdminNavbar } from "./components/navbar";
import { useState, useEffect } from "react";
import { PortalSidebarProvider } from "@/components/layout/portal-sidebar-context";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/sign-in");
    }
  }, [status, router]);

  if (!isClient || status === "loading") {
    return <div className="min-h-screen bg-slate-50"></div>;
  }

  if (!session) {
    return <div className="min-h-screen bg-slate-50"></div>;
  }

  const permissionCodes = (session?.user as any)?.permissions as
    | string[]
    | undefined;
  const perms = Array.isArray(permissionCodes) ? permissionCodes : [];


  return (
    <PortalSidebarProvider>
      <div className="flex h-screen overflow-hidden bg-slate-50">
        {/* Sidebar */}
        <AdminSidebar perms={perms} />

        {/* Main content area */}
        <div className="flex-1 flex flex-col min-w-0">
          <AdminNavbar />
          {/* Page content */}
          <div className="flex-1 overflow-auto p-4 md:p-8 pt-10 group/content relative">
            {children}
          </div>
        </div>
      </div>
    </PortalSidebarProvider>
  );
}


