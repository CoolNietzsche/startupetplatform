"use client";

import { createContext, useContext, useState, useEffect } from 'react';

interface FeatureRoles {
  startup: boolean;
  ecosystemBuilder: boolean;
  stakeholder: boolean;
  admin: boolean;
}

interface Feature {
  id: string;
  name: string;
  description: string;
  category: string;
  roles: FeatureRoles;
}

interface FeatureControlContextType {
  features: Feature[];
  updateFeature: (featureId: string, role: keyof FeatureRoles, enabled: boolean) => void;
  isFeatureEnabled: (featureId: string, userRole: string) => boolean;
  updateAllForRole: (role: keyof FeatureRoles, enabled: boolean) => void;
}

const FeatureControlContext = createContext<FeatureControlContextType | undefined>(undefined);

const defaultFeatures: Feature[] = [
  // Dashboard Features
  {
    id: "dashboard-overview",
    name: "Dashboard Overview",
    description: "Main dashboard page with statistics and insights",
    category: "Dashboard",
    roles: { startup: true, ecosystemBuilder: true, stakeholder: true, admin: true }
  },
  {
    id: "dashboard-analytics",
    name: "Analytics Dashboard",
    description: "Advanced analytics and reporting",
    category: "Dashboard",
    roles: { startup: true, ecosystemBuilder: true, stakeholder: true, admin: true }
  },

  // Startup Features
  {
    id: "startup-news",
    name: "News Page",
    description: "Access to news and updates",
    category: "Startup",
    roles: { startup: true, ecosystemBuilder: true, stakeholder: false, admin: true }
  },
  {
    id: "startup-funding",
    name: "Funding Opportunities",
    description: "Browse and apply for funding",
    category: "Startup",
    roles: { startup: true, ecosystemBuilder: false, stakeholder: false, admin: true }
  },
  {
    id: "startup-messages",
    name: "Messaging System",
    description: "Send and receive messages",
    category: "Startup",
    roles: { startup: true, ecosystemBuilder: true, stakeholder: true, admin: true }
  },
  {
    id: "startup-certification",
    name: "Certification Application",
    description: "Apply for startup certification",
    category: "Startup",
    roles: { startup: true, ecosystemBuilder: false, stakeholder: false, admin: true }
  },
  {
    id: "startup-profile",
    name: "Profile Management",
    description: "Edit and manage profile",
    category: "Startup",
    roles: { startup: true, ecosystemBuilder: true, stakeholder: true, admin: true }
  },

  // Ecosystem Builder Features
  {
    id: "eb-directory",
    name: "Startup Directory",
    description: "Browse and search startups",
    category: "Ecosystem Builder",
    roles: { startup: false, ecosystemBuilder: true, stakeholder: true, admin: true }
  },
  {
    id: "eb-events",
    name: "Events Management",
    description: "Create and manage events",
    category: "Ecosystem Builder",
    roles: { startup: true, ecosystemBuilder: true, stakeholder: false, admin: true }
  },
  {
    id: "eb-resources",
    name: "Resource Library",
    description: "Access to resources and materials",
    category: "Ecosystem Builder",
    roles: { startup: true, ecosystemBuilder: true, stakeholder: false, admin: true }
  },
  {
    id: "eb-bookings",
    name: "Booking System",
    description: "Book spaces and services",
    category: "Ecosystem Builder",
    roles: { startup: true, ecosystemBuilder: true, stakeholder: false, admin: true }
  },
  {
    id: "eb-mentorship",
    name: "Mentorship Program",
    description: "Connect with mentors",
    category: "Ecosystem Builder",
    roles: { startup: true, ecosystemBuilder: true, stakeholder: false, admin: true }
  },

  // Stakeholder Features
  {
    id: "stakeholder-reports",
    name: "Reports & Analytics",
    description: "View ecosystem reports",
    category: "Stakeholder",
    roles: { startup: false, ecosystemBuilder: false, stakeholder: true, admin: true }
  },
  {
    id: "stakeholder-insights",
    name: "Ecosystem Insights",
    description: "Regional and sector insights",
    category: "Stakeholder",
    roles: { startup: false, ecosystemBuilder: true, stakeholder: true, admin: true }
  },

  // Community Features
  {
    id: "community-forum",
    name: "Community Forum",
    description: "Discussion and networking",
    category: "Community",
    roles: { startup: true, ecosystemBuilder: true, stakeholder: false, admin: true }
  },
  {
    id: "community-networking",
    name: "Networking Hub",
    description: "Connect with other users",
    category: "Community",
    roles: { startup: true, ecosystemBuilder: true, stakeholder: true, admin: true }
  },

  // System Features
  {
    id: "system-notifications",
    name: "Notifications",
    description: "System notifications and alerts",
    category: "System",
    roles: { startup: true, ecosystemBuilder: true, stakeholder: true, admin: true }
  },
  {
    id: "system-settings",
    name: "Account Settings",
    description: "Manage account preferences",
    category: "System",
    roles: { startup: true, ecosystemBuilder: true, stakeholder: true, admin: true }
  }
];

export function FeatureControlProvider({ children }: { children: React.ReactNode }) {
  const [features, setFeatures] = useState<Feature[]>(defaultFeatures);
  const [isHydrated, setIsHydrated] = useState(false);

  // Load from localStorage after hydration
  useEffect(() => {
    setIsHydrated(true);
    const stored = localStorage.getItem('featureControl');
    if (stored) {
      try {
        setFeatures(JSON.parse(stored));
      } catch {
        setFeatures(defaultFeatures);
      }
    }
  }, []);

  // Save to localStorage whenever features change (but only after hydration)
  useEffect(() => {
    if (isHydrated) {
      localStorage.setItem('featureControl', JSON.stringify(features));
    }
  }, [features, isHydrated]);

  const updateFeature = (featureId: string, role: keyof FeatureRoles, enabled: boolean) => {
    setFeatures(prev => prev.map(feature =>
      feature.id === featureId
        ? { ...feature, roles: { ...feature.roles, [role]: enabled } }
        : feature
    ));
  };

  const updateAllForRole = (role: keyof FeatureRoles, enabled: boolean) => {
    setFeatures(prev => prev.map(feature => ({
      ...feature,
      roles: { ...feature.roles, [role]: enabled }
    })));
  };

  const isFeatureEnabled = (featureId: string, userRole: string): boolean => {
    const feature = features.find(f => f.id === featureId);
    if (!feature) return false;

    // Map user role to feature role key
    const roleMap: { [key: string]: keyof FeatureRoles } = {
      'startup': 'startup',
      'user': 'startup', // Map 'user' to 'startup'
      'ecosystem-builder': 'ecosystemBuilder',
      'ecosystemBuilder': 'ecosystemBuilder',
      'stakeholder': 'stakeholder',
      'admin': 'admin',
      'super-admin': 'admin'
    };

    const mappedRole = roleMap[userRole];
    return mappedRole ? feature.roles[mappedRole] : false;
  };

  return (
    <FeatureControlContext.Provider value={{ features, updateFeature, isFeatureEnabled, updateAllForRole }}>
      {children}
    </FeatureControlContext.Provider>
  );
}

export function useFeatureControl() {
  const context = useContext(FeatureControlContext);
  if (context === undefined) {
    throw new Error('useFeatureControl must be used within a FeatureControlProvider');
  }
  return context;
}
