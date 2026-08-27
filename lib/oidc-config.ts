/**
 * Configuration for Ethiopia's National ID OIDC authentication
 * Based on the reference implementation from https://github.com/National-ID-Program-Ethiopia/oidc-react-app
 */

// OIDC Client configuration
export const OIDCConfig = {
  // These values would be provided by the National ID Program when registering as a relying party
  authority: process.env.NEXT_PUBLIC_FAYDA_AUTHORITY || "https://id.et/auth/realms/fayda",
  client_id: process.env.NEXT_PUBLIC_FAYDA_CLIENT_ID || "startup-et-portal",
  redirect_uri: process.env.NEXT_PUBLIC_FAYDA_REDIRECT_URI || "http://localhost:3000/api/auth/callback/fayda",
  
  // Standard OIDC scopes for identity information
  scope: "openid profile email phone",
  
  // Fayda-specific scopes to access additional verified information
  // These would need to be approved during the registration process
  additionalScopes: "verified.fcn verified.firstName verified.lastName verified.dateOfBirth",
  
  // Response type for authorization code flow
  response_type: "code",
  
  // Method to validate tokens
  automaticSilentRenew: true,
  
  // Load user profile after login
  loadUserInfo: true,
  
  // Additional endpoints
  metadataUrl: process.env.NEXT_PUBLIC_FAYDA_METADATA_URL || "https://id.et/auth/realms/fayda/.well-known/openid-configuration",
  
  // Determines if tokens should be stored in session storage (cleared on tab close)
  userStore: "sessionStorage",
  
  // Post logout redirect URI
  post_logout_redirect_uri: process.env.NEXT_PUBLIC_FAYDA_POST_LOGOUT_REDIRECT_URI || "http://localhost:3000/",
  
  // Custom parameters for Fayda-specific functionality
  extraQueryParams: {
    // This is used to enable Amharic language in the authentication UI
    // Supports: en (English) or am (Amharic)
    ui_locales: "am",
    
    // Request specific verified claims
    claims: JSON.stringify({
      id_token: {
        verified_fcn: {essential: true},
        verified_name: {essential: true},
      }
    })
  }
};

// Mock/development configuration for testing without actual Fayda integration
export const DevelopmentOIDCConfig = {
  authority: "https://demo.duendesoftware.com",
  client_id: "interactive.public",
  redirect_uri: "http://localhost:3000/api/auth/callback/fayda",
  scope: "openid profile email",
  response_type: "code",
  automaticSilentRenew: true,
  loadUserInfo: true,
  userStore: "sessionStorage",
  post_logout_redirect_uri: "http://localhost:3000/",
};

// Get the appropriate config based on environment
export const getOIDCConfig = () => {
  // Use development config for local development to avoid actual API calls
  if (process.env.NODE_ENV !== "production") {
    return DevelopmentOIDCConfig;
  }
  return OIDCConfig;
};

// Helper function to extract verified claims from the ID token
export const extractVerifiedClaims = (user: any) => {
  if (!user || !user.id_token) {
    return null;
  }

  try {
    // In production, these would be actual verified claims
    // provided by Ethiopia's National ID system
    const claims = {
      fcn: user.profile.verified_fcn || user.profile.sub,
      firstName: user.profile.verified_first_name || user.profile.given_name,
      lastName: user.profile.verified_last_name || user.profile.family_name,
      dateOfBirth: user.profile.verified_dob || null,
      phoneNumber: user.profile.verified_phone_number || user.profile.phone_number,
      email: user.profile.verified_email || user.profile.email,
    };
    
    return claims;
  } catch (error) {
    console.error("Error extracting verified claims:", error);
    return null;
  }
};
