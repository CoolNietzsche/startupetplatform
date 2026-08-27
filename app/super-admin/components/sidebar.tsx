"use client";

import React from 'react';
import {
  LayoutDashboard,
  Users,
  Shield,
  UserCog,
  BarChart3,
  Building2,
  Settings,
  FileText,
  Bell,
  Sliders,
  Rocket,
  Briefcase,
  ClipboardCheck,
  ListChecks
} from 'lucide-react';
import { PortalSidebar, SidebarItem } from '@/components/layout/portal-sidebar';
import { useSession } from 'next-auth/react';

export function SuperAdminSidebar() {
  const sections = [
    {
      section: "OVERVIEW",
      items: [
        { id: 'dashboard', title: 'Dashboard', href: '/super-admin', exact: true, icon: <LayoutDashboard className="h-4 w-4" /> },
        { id: 'analytics', title: 'Analytics', href: '/super-admin/analytics', icon: <BarChart3 className="h-4 w-4" /> },
      ]
    },
    {
      section: "ECOSYSTEM",
      items: [
        { id: 'startups', title: 'Startups', href: '/super-admin/startups', icon: <Rocket className="h-4 w-4" /> },
        { id: 'builders', title: 'Builders', href: '/super-admin/ecosystem-builders', icon: <Briefcase className="h-4 w-4" /> },
        { id: 'committees', title: 'Committees', href: '/super-admin/committees', icon: <Building2 className="h-4 w-4" /> },
        { id: 'stage-criteria', title: 'Stage Criteria', href: '/super-admin/stage-criteria', icon: <ListChecks className="h-4 w-4" /> },
        { id: 'stakeholders', title: 'Stakeholders', href: '/super-admin/stakeholders', icon: <Building2 className="h-4 w-4" /> }
      ]
    },
    {
      section: "OPERATIONS",
      items: [
        { id: 'requests', title: 'Requests', href: '/super-admin/action-requests', icon: <ClipboardCheck className="h-4 w-4" /> },
        { id: 'notifications', title: 'Notifications', href: '/super-admin/notifications', icon: <Bell className="h-4 w-4" /> },
        { id: 'logs', title: 'Logs', href: '/super-admin/logs', icon: <FileText className="h-4 w-4" /> },
        { id: 'reports', title: 'Reports', href: '/super-admin/reports', icon: <FileText className="h-4 w-4" /> },
      ]
    },
    {
      section: "CONFIGURATION",
      items: [
        { id: 'features', title: 'Features', href: '/super-admin/feature-control', icon: <Sliders className="h-4 w-4" /> },
        { id: 'settings', title: 'Settings', href: '/super-admin/settings', icon: <Settings className="h-4 w-4" /> },
      ]
    },
    {
      section: "ACCESS PORTALS",
      items: [
        { id: 'stakeholder-portal', title: 'Stakeholder Portal', href: '/stakeholder', icon: <Building2 className="h-4 w-4" /> },
        { id: 'startup-dashboard', title: 'Startup Dashboard', href: '/dashboard/home', icon: <Rocket className="h-4 w-4" /> },
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
