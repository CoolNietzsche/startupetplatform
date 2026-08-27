"use client";
 
 import React from "react";
 import {
   ShieldAlert,
   Terminal,
   Activity,
   Monitor
 } from "lucide-react";
 import { PortalNavbar } from "@/components/layout/portal-navbar";
 import { usePortalSidebar } from "@/components/layout/portal-sidebar-context";
 import { useSession } from "next-auth/react";
 import { InstitutionalTopBar } from "@/components/layout/institutional-top-bar";
 
 export function SuperAdminNavbar() {
   const { data: session } = useSession();
   const isStakeholder = session?.user?.role === "STAKEHOLDER";

   return <InstitutionalTopBar title={isStakeholder ? "Stakeholder Portal" : "System Administrative Dashboard"} />;
 }
