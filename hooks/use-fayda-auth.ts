'use client';

import { useAuth } from 'react-oidc-context';
import { extractVerifiedClaims } from '@/lib/oidc-config';
import { useState, useEffect } from 'react';

/**
 * Custom hook for using Ethiopia's National ID authentication in components
 * Extends the standard useAuth hook with Fayda-specific functionality
 */
export const useFaydaAuth = () => {
  // Always call the useAuth hook unconditionally (React Hook rule)
  const auth = useAuth();
  
  // State to track if there was an error initializing
  const [hasError, setHasError] = useState(false);
  
  // Check for initialization errors
  useEffect(() => {
    try {
      // Try accessing a property to see if auth is properly initialized
      // eslint-disable-next-line no-unused-vars
      const _ = auth.isLoading;
    } catch (error) {
      console.error('Error accessing auth object:', error);
      setHasError(true);
    }
  }, [auth]);
  
  // If there was an error, provide safe fallback values
  if (hasError) {
    return {
      isAuthenticated: false,
      isLoading: false,
      user: null,
      twoStepAuthEnabled: false,
      verifiedClaims: null,
      login: async () => { 
        console.error('Auth not properly initialized, login unavailable');
      },
      logout: async () => { 
        console.error('Auth not properly initialized, logout unavailable');
      },
      fcn: null,
      firstName: null,
      lastName: null,
      fullName: null,
      email: null,
      phoneNumber: null,
      dateOfBirth: null,
      isVerified: false,
    };
  }
  
  // Extract verified claims from the ID token when authenticated
  const verifiedClaims = auth.isAuthenticated && auth.user 
    ? extractVerifiedClaims(auth.user) 
    : null;
  
  // Login with redirect
  const login = async () => {
    try {
      await auth.signinRedirect();
    } catch (error) {
      console.error('Error during Fayda login redirect:', error);
    }
  };
  
  // Logout
  const logout = async () => {
    try {
      await auth.removeUser();
    } catch (error) {
      console.error('Error during Fayda logout:', error);
    }
  };
  
  return {
    // Pass through original auth properties with safe defaults
    ...auth,
    // Explicitly add missing property that might be causing the error
    twoStepAuthEnabled: false,
    
    // Add Fayda-specific properties and functions
    verifiedClaims,
    login,
    logout,
    
    // Convenience getters for verified identity data
    fcn: verifiedClaims?.fcn || null,
    firstName: verifiedClaims?.firstName || null,
    lastName: verifiedClaims?.lastName || null,
    fullName: verifiedClaims ? `${verifiedClaims.firstName} ${verifiedClaims.lastName}` : null,
    email: verifiedClaims?.email || null,
    phoneNumber: verifiedClaims?.phoneNumber || null,
    dateOfBirth: verifiedClaims?.dateOfBirth || null,
    
    // Check if identity is verified through Fayda
    isVerified: !!verifiedClaims?.fcn,
  };
};

export default useFaydaAuth;
