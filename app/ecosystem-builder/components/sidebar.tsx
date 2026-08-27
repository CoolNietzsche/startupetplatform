"use client";

import React from 'react';
import {
  Home,
  ClipboardCheck,
  Briefcase,
  FileText,
  Calendar,
  Settings,
  Building2,
  Award,
  Bell,
  TrendingUp,
  Mail
} from 'lucide-react';
import { UnreadMessageBadge } from '@/messaging/unread-badge';
import { PortalSidebar, SidebarItem } from '@/components/layout/portal-sidebar';

export function EcosystemBuilderSidebar() {
  const sidebarItems: SidebarItem[] = [
    {
      id: 'dashboard',
      title: 'Dashboard',
      href: '/ecosystem-builder',
      exact: true,
      icon: <Home className="h-5 w-5" />
    },
    {
      id: 'apply',
      title: 'Apply',
      href: '/ecosystem-builder/apply',
      icon: <ClipboardCheck className="h-5 w-5" />
    },
    {
      id: 'status',
      title: 'Application',
      href: '/ecosystem-builder/application',
      icon: <ClipboardCheck className="h-5 w-5" />
    },
    {
      id: 'funding',
      title: 'Manage Funding',
      href: '/ecosystem-builder/funding',
      icon: <Briefcase className="h-5 w-5" />
    },
    {
      id: 'investments',
      title: 'Manage Investment',
      href: '/ecosystem-builder/investments',
      icon: <TrendingUp className="h-5 w-5" />
    },
    {
      id: 'news',
      title: 'Manage News',
      href: '/ecosystem-builder/news',
      icon: <FileText className="h-4 w-4" />
    },
    {
      id: 'bookings',
      title: 'Bookings',
      href: '/ecosystem-builder/bookings',
      icon: <Building2 className="h-5 w-5" />
    },
    {
      id: 'events',
      title: 'Events',
      href: '/ecosystem-builder/events',
      icon: <Calendar className="h-5 w-5" />
    },
    {
      id: 'certifications',
      title: 'Certifications',
      href: '/ecosystem-builder/certifications',
      icon: <Award className="h-5 w-5" />
    },
    {
      id: 'messages',
      title: 'Messages',
      href: '/ecosystem-builder/messages',
      icon: <Mail className="h-5 w-5" />,
      badge: <UnreadMessageBadge />
    },
    {
      id: 'notifications',
      title: 'Notifications',
      href: '/ecosystem-builder/notifications',
      icon: <Bell className="h-5 w-5" />
    },
    {
      id: 'settings',
      title: 'Settings',
      href: '/ecosystem-builder/settings',
      icon: <Settings className="h-5 w-5" />
    }
  ];

  const title = (
    <div className="flex items-center min-w-0">
      <span className="text-sm font-black tracking-tight text-slate-900 uppercase truncate">
        Ecosystem<span className="text-primary italic">Builder</span>
      </span>
    </div>
  );

  return (
    <PortalSidebar
      title={title}
      sections={[{ items: sidebarItems }]}
      activeColor="primary"
    />
  );
}

