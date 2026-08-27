"use client";

import React from "react";
import Link from "next/link";
import { Building2 } from "lucide-react";
import { PortalNavbar } from "@/components/layout/portal-navbar";
import { usePortalSidebar } from "@/components/layout/portal-sidebar-context";


import { InstitutionalTopBar } from "@/components/layout/institutional-top-bar";

export function EcosystemBuilderNavbar() {
  return <InstitutionalTopBar title="Ecosystem Builder Dashboard" />;
}

