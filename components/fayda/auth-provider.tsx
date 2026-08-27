'use client';

import React, { ReactNode } from 'react';
import { AuthProvider as OIDCAuthProvider } from 'react-oidc-context';
import { getOIDCConfig } from '@/lib/oidc-config';

interface AuthProviderProps {
  children: ReactNode;
}

/**
 * Provider component for Fayda National ID authentication
 * Wraps the application with OIDC authentication context
 */
export const FaydaAuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  // Get the appropriate configuration based on environment
  const oidcConfig = getOIDCConfig();

  return (
    <OIDCAuthProvider {...oidcConfig}>
      {children}
    </OIDCAuthProvider>
  );
};

export default FaydaAuthProvider;
