"use client";

import React from 'react';
import {
  LayoutDashboard,
  Building2,
  Layers,
} from 'lucide-react';
import { PortalSidebar } from '@/components/layout/portal-sidebar';

export function RegionalAdminSidebar() {
  const sections = [
    {
      section: "OVERVIEW",
      items: [
        { id: 'dashboard', title: 'Dashboard', href: '/regional-admin', exact: true, icon: <LayoutDashboard className="h-4 w-4" /> },
      ]
    },
    {
      section: "MANAGEMENT",
      items: [
        { id: 'hubs', title: 'Hubs', href: '/regional-admin/hubs', icon: <Building2 className="h-4 w-4" /> },
        { id: 'startups', title: 'Startups', href: '/regional-admin/startups', icon: <Layers className="h-4 w-4" /> },
      ]
    }
  ];

  return (
    <PortalSidebar
      sections={sections}
      activeColor="primary"
    />
  );
}
