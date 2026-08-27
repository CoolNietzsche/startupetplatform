"use client";

import React from "react";
import { PortalNavbar } from "@/components/layout/portal-navbar";
import { usePortalSidebar } from "@/components/layout/portal-sidebar-context";

import { InstitutionalTopBar } from "@/components/layout/institutional-top-bar";

export function AdminNavbar() {
  return <InstitutionalTopBar title="Manage Admin" />;
}

