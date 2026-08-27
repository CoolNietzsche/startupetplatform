"use client";

import { useFeatureControl } from "@/contexts/FeatureControlContext";
import { ReactNode } from "react";

interface FeatureGuardProps {
  featureId: string;
  userRole?: string;
  children: ReactNode;
  fallback?: ReactNode;
}

export function FeatureGuard({ featureId, userRole = "startup", children, fallback = null }: FeatureGuardProps) {
  const { isFeatureEnabled } = useFeatureControl();
  
  const enabled = isFeatureEnabled(featureId, userRole);
  
  if (!enabled) {
    return <>{fallback}</>;
  }
  
  return <>{children}</>;
}
