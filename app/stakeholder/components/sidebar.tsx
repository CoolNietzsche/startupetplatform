"use client";

import React from 'react';
import {
  LayoutDashboard,
  Building2,
  Bell,
  FileText
} from 'lucide-react';
import { PortalSidebar } from '@/components/layout/portal-sidebar';
import { useSession } from 'next-auth/react';

export function StakeholderSidebar() {
  const sections = [
    {
      section: "OVERVIEW",
      items: [
        { id: 'dashboard', title: 'Dashboard', href: '/stakeholder', exact: true, icon: <LayoutDashboard className="h-4 w-4" /> },
      ]
    },
    {
      section: "INSTITUTIONAL",
      items: [
        { id: 'organization', title: 'My Organization', href: '/stakeholder/organization', icon: <Building2 className="h-4 w-4" /> },
        { id: 'requests', title: 'Formal Requests', href: '/stakeholder/requests', icon: <FileText className="h-4 w-4" /> },
        { id: 'alerts', title: 'Notification Hub', href: '/stakeholder/notifications', icon: <Bell className="h-4 w-4" /> },
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
