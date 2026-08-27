"use client";

import React from 'react';
import { useSession } from "next-auth/react";
import {
  HomeIcon,
  AppWindow,
  MessageSquare,
  NewspaperIcon,
  SettingsIcon,
  Users,
  BarChart3,
  Calendar,
  Bookmark,
  Briefcase,
  FileText,
  Banknote,
  PieChart,
  Rocket,
  Bell,
  CheckCircle2,
  TrendingUp,
  Globe,
  Award,
  Wallet,
  LayoutDashboard
} from 'lucide-react';
import { PortalSidebar, SidebarSection } from '@/components/layout/portal-sidebar';

const sidebarData = [
  {
    section: "MAIN",
    items: [
      {
        id: "dashboard",
        title: "Dashboard",
        icon: <LayoutDashboard className="h-5 w-5" />,
        href: "/dashboard/home",
        exact: true,
        requiredPermission: "SYS_DASHBOARD_ACCESS",
      },

    ],
  },
  {
    section: "FINANCING",
    items: [
      {
        id: "funding",
        title: "Funding",
        icon: <Banknote className="h-5 w-5" />,
        href: "/dashboard/funding",
        requiredPermission: "OPS_APP_SUBMIT",
      },
      {
        id: "application",
        title: " Application",
        icon: <Rocket className="h-5 w-5" />,
        href: "/dashboard/application",
        requiredPermission: "OPS_APP_SUBMIT",
      },
      {
        id: "certifications",
        title: "Certifications",
        icon: <Award className="h-5 w-5" />,
        href: "/dashboard/certifications",
        requiredPermission: "OPS_APP_SUBMIT",
      },
    ],
  },
  {
    section: "NETWORK",
    items: [
      {
        id: "startups",
        title: "Startups",
        icon: <Briefcase className="h-5 w-5" />,
        href: "/dashboard/startups",
        requiredPermission: "ID_USER_VIEW",
      },
      {
        id: "investors",
        title: "Investors",
        icon: <Wallet className="h-5 w-5" />,
        href: "/dashboard/investors",
        requiredPermission: "ID_USER_VIEW",
      },
      {
        id: "builders",
        title: "Ecosystem ",
        icon: <Users className="h-5 w-5" />,
        href: "/dashboard/ecosystem-builders",
        requiredPermission: "ID_USER_VIEW",
      },
      // {
      //   id: "eb-portal",
      //   title: "Builder Portal",
      //   icon: <Globe className="h-5 w-5" />,
      //   href: "/dashboard/ecosystem-builder-portal",
      //   requiredPermission: "GROW_CONTENT_MANAGE",
      // },
    ],
  },
  {
    section: "GROWTH & RESOURCES",
    items: [
      // {
      //   id: "market-insights",
      //   title: "Market Insights",
      //   icon: <TrendingUp className="h-5 w-5" />,
      //   href: "/dashboard/market-insights",
      //   requiredPermission: "GROW_ANALYTICS_VIEW",
      // },
      // {
      //   id: "reports",
      //   title: "Reports",
      //   icon: <BarChart3 className="h-5 w-5" />,
      //   href: "/dashboard/reports",
      //   requiredPermission: "GROW_ANALYTICS_VIEW",
      // },
      {
        id: "documents",
        title: "Documents",
        icon: <FileText className="h-5 w-5" />,
        href: "/dashboard/documents",
        requiredPermission: "SYS_DASHBOARD_ACCESS",
      },
      {
        id: "resources",
        title: "Library",
        icon: <Bookmark className="h-5 w-5" />,
        href: "/dashboard/resources",
        requiredPermission: "GROW_CONTENT_MANAGE",
      },
      {
        id: "events",
        title: "Events",
        icon: <Calendar className="h-5 w-5" />,
        href: "/dashboard/events",
        requiredPermission: "GROW_CONTENT_MANAGE",
      },
      {
        id: "news",
        title: "News",
        icon: <NewspaperIcon className="h-5 w-5" />,
        href: "/dashboard/news",
        requiredPermission: "GROW_CONTENT_MANAGE",
      },
    ],
  },
  {
    section: "COMMUNICATION",
    items: [
      {
        id: "messages",
        title: "Messages",
        icon: <MessageSquare className="h-5 w-5" />,
        href: "/dashboard/messages",
        requiredPermission: "SYS_DASHBOARD_ACCESS",
      },
      {
        id: "formal-requests",
        title: "Formal Requests",
        icon: <FileText className="h-5 w-5" />,
        href: "/dashboard/requests",
        requiredPermission: "SYS_DASHBOARD_ACCESS",
      },
      {
        id: "settings",
        title: "Settings",
        icon: <SettingsIcon className="h-5 w-5" />,
        href: "/dashboard/settings",
      },
      {
        id: "notifications",
        title: "Notifications",
        icon: <Bell className="h-5 w-5" />,
        href: "/dashboard/notifications",
        requiredPermission: "SYS_DASHBOARD_ACCESS",
      },
    ],
  },
];

export default function AppSidebar() {
  const { data: session } = useSession();

  // Super Admin bypasses all checks
  const isSuperAdmin = (session?.user as any)?.role === "SUPER_ADMIN";
  const isStartup = (session?.user as any)?.role === "USER";
  const userPermissions = (session?.user as any)?.permissions || [];

  const filteredSections: SidebarSection[] = sidebarData
    .map((section) => ({
      ...section,
      items: section.items.filter(
        (item) => {
          // Bypass permissions for Super Admin
          if (isSuperAdmin) return true;

          // Allow specific items for Startup users by ID regardless of permissions
          // Roles like 'USER' represent Startup owners in this dashboard
          const startupAllowedIds = [
            "dashboard",
            "notifications",
            "application",
            "certifications",
            "eb-portal",
            "market-insights",
            "reports",
            "settings"
          ];

          if (isStartup && startupAllowedIds.includes(item.id)) {
            return true;
          }

          // Default permission check
          return !item.requiredPermission || userPermissions.includes(item.requiredPermission);
        }
      ),
    }))
    .filter((section) => section.items.length > 0);

  const title = (
    <div className="flex items-center gap-2">
      <Rocket className="h-5 w-5 text-brand-startup-amber" />
      <span className="text-sm font-black text-brand-deep-dark tracking-tighter font-sans">Startup Dashboard</span>
    </div>
  );

  return (
    <PortalSidebar
      title={title}
      sections={filteredSections}
      activeColor="primary"
      className=""
    />
  );
}


