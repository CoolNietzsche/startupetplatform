"use client";

import React from 'react';
import {
  LayoutDashboard,
  Briefcase,
  FileText,
  Settings,
  Tag,
  Package,
  UserCheck,
  BarChart,
  Users,
  Shield,
  MessageSquare,
  Bell,
  Activity,
  Megaphone,
  Bookmark,
  Scale,
  Search,
} from 'lucide-react';
import { PortalSidebar, SidebarItem } from '@/components/layout/portal-sidebar';

interface AdminSidebarProps {
  perms: string[];
}

export function AdminSidebar({ perms }: AdminSidebarProps) {
  const sections = [
    {
      section: "CORE",
      items: [
        { id: 'dashboard', title: "Dashboard", href: "/admins-new", exact: true, icon: <LayoutDashboard className="h-4 w-4" /> },
        { id: 'applications', title: "Applications", href: "/admins-new/applications", icon: <FileText className="h-4 w-4" /> },
        { id: 'messages', title: "Messages", href: "/admins-new/messages", icon: <MessageSquare className="h-4 w-4" /> },
      ],
    },
    {
      section: "MANAGEMENT",
      items: [
        { id: 'startups', title: "Startups", href: "/admins-new/startups", icon: <Briefcase className="h-4 w-4" /> },
        { id: 'ecosystem', title: "Ecosystem", href: "/admins-new/ecosystem", icon: <Package className="h-4 w-4" /> },
        { id: 'committees', title: "Committees", href: "/admins-new/committees", icon: <UserCheck className="h-4 w-4" /> },
        { id: 'oversight', title: "Oversight", href: "/admins-new/oversight", icon: <Activity className="h-4 w-4" /> },
        { id: 'calls', title: "Calls", href: "/admins-new/calls", icon: <Megaphone className="h-4 w-4" /> },
        { id: 'appeals', title: "Appeals", href: "/admins-new/appeals", icon: <Scale className="h-4 w-4" /> },
        { id: 'monitoring', title: "Monitoring", href: "/admins-new/monitoring", icon: <Search className="h-4 w-4" /> },
        ...(perms.includes("ID_USER_VIEW") || perms.includes("ID_USER_MANAGE")
          ? [{ id: 'users', title: "Users", href: "/admins-new/users", icon: <Users className="h-4 w-4" /> }]
          : []),
      ],
    },
    {
      section: "ANALYTICS",
      items: [
        { id: 'reports', title: "Reports", href: "/admins-new/reports", icon: <BarChart className="h-4 w-4" /> },
        { id: 'directive-reports', title: "Directive Reports", href: "/admins-new/reports/directive", icon: <FileText className="h-4 w-4" /> },
        { id: 'report-submissions', title: "Report Submissions", href: "/admins-new/reports/submissions", icon: <FileText className="h-4 w-4" /> },
        { id: 'registry', title: "Registry", href: "/admins-new/registry", icon: <Bookmark className="h-4 w-4" /> },
        { id: 'certifications', title: "Certifications", href: "/admins-new/certifications", icon: <Tag className="h-4 w-4" /> },
      ],
    },
    {
      section: "SYSTEM",
      items: [
        ...(perms.includes("ID_ROLE_MANAGE")
          ? [{ id: 'roles', title: "Roles", href: "/admins-new/roles", icon: <Shield className="h-4 w-4" /> }]
          : []),
      ],
    },
    {
      section: "SETTINGS",
      items: [
        { id: "notification-templates", title: "Notification Templates", href: "/admins-new/settings/notifications", icon: <Bell className="h-4 w-4" /> },
      ],
    },
  ].filter(s => s.items.length > 0);

  const title = (
    <div className="flex items-center">
      <span className="text-lg font-bold tracking-tighter text-slate-900 uppercase">
        Manage<span className="text-primary italic">Admin</span>
      </span>
    </div>
  );

  return (
    <PortalSidebar
      title={title}
      sections={sections}
      activeColor="primary"
    />
  );
}
