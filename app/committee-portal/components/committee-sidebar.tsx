"use client";

import React from 'react';
import {
  LayoutDashboard,
  ClipboardCheck,
  MessageSquare,
  Calendar,
  Layers
} from 'lucide-react';
import { PortalSidebar, SidebarItem } from '@/components/layout/portal-sidebar';

export function CommitteeSidebar() {
  const navItems: SidebarItem[] = [
    {
      id: 'dashboard',
      href: '/committee-portal/dashboard',
      icon: <LayoutDashboard className="h-5 w-5" />,
      title: 'Dashboard',
    },
    {
      id: 'assessments',
      href: '/committee-portal/assessments',
      icon: <ClipboardCheck className="h-5 w-5" />,
      title: 'Applications',
      submenu: [
        { href: '/committee-portal/assessments/startup', label: 'Startup Applications' },
        { href: '/committee-portal/assessments/ecosystem', label: 'Ecosystem Applications' },
      ],
    },
    {
      id: 'committees',
      href: '/committee-portal/committees',
      icon: <Layers className="h-5 w-5" />,
      title: 'Committee',
    },
    {
      id: 'messages',
      href: '/committee-portal/messages',
      icon: <MessageSquare className="h-5 w-5" />,
      title: 'Messages',
    },
    {
      id: 'meetings',
      href: '/committee-portal/meetings',
      icon: <Calendar className="h-5 w-5" />,
      title: 'Calendar',
    },
  ];

  const title = (
    <div className="flex items-center">
      <span className="text-xl font-bold text-gray-900">Expert Portal</span>
    </div>
  );

  return (
    <PortalSidebar
      title={title}
      sections={[{ items: navItems }]}
      activeColor="primary"
    />
  );
}

