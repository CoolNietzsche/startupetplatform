import { NextRequest, NextResponse } from "next/server";

/**
 * This API route handles the callback from the Fayda OIDC provider
 * after a user has authenticated through the National ID System.
 * 
 * The authentication code is processed by the client-side OIDC library,
 * so this route simply redirects back to the application.
 */
export async function GET(request: NextRequest) {
  // In a production implementation, we might perform additional verification
  // or update user info in our database using the callback data
  
  // Extract the URL parameters from the callback
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const error = url.searchParams.get("error");
  
  // Log errors (for development/debugging)
  if (error) {
    console.error("OIDC Authentication Error:", error);
    return NextResponse.redirect(new URL("/auth/error?error=fayda_auth_failed", request.url));
  }
  
  // If no code was returned, redirect to error page
  if (!code) {
    console.error("No authentication code provided in callback");
    return NextResponse.redirect(new URL("/auth/error?error=missing_code", request.url));
  }
  
  // The actual token exchange occurs client-side in the OIDC library
  // This is a safety fallback if the client-side redirect doesn't happen
  return NextResponse.redirect(new URL("/", request.url));
}
