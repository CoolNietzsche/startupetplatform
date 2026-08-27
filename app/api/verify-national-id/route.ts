import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { rateLimit } from "@/lib/rate-limit";

// Define the type for person data
type PersonData = {
  fcn: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  gender: string;
  nationality: string;
  idExpiryDate: string;
  idIssueDate: string;
  phoneNumber: string;
  email: string;
};

// Define the data store with an index signature
interface NationalIdDataStore {
  [key: string]: PersonData;
}

// In production, this would make actual API calls to id.et
const mockNationalIdData: NationalIdDataStore = {};

/**
 * Validates if an FCN matches the proper Ethiopian National ID format
 */
function isValidFcnFormat(fcn: string): boolean {
  // FCN format: exactly 16 digits
  const fcnRegex = /^\d{16}$/;
  return fcnRegex.test(fcn);
}

/**
 * Handler for GET requests to verify national ID
 */
export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  const ip = request.headers.get("x-forwarded-for")?.split(",")[0] || "127.0.0.1";
  const { success } = await rateLimit(`fayda-verify:${session.user.id}`, 20, 3600);

  if (!success) {
    return NextResponse.json(
      { success: false, error: "Too many requests. Please try again later." },
      { status: 429 }
    );
  }

  const searchParams = request.nextUrl.searchParams;
  const fcn = searchParams.get("fcn");
  
  if (!fcn) {
    return NextResponse.json(
      { success: false, error: "Missing FCN parameter" }, 
      { status: 400 }
    );
  }
  
  if (!isValidFcnFormat(fcn)) {
    return NextResponse.json(
      { success: false, error: "Invalid FCN format. FCN must be exactly 16 digits." }, 
      { status: 400 }
    );
  }
  
  // Try real integration if environment variables exist
  const faydaApiUrl = process.env.FAYDA_API_URL || "https://platform.id.et";
  const faydaApiKey = process.env.FAYDA_API_KEY;
  const faydaAccessToken = process.env.FAYDA_ACCESS_TOKEN;

  // Real Integration Block
  if (faydaApiKey && faydaAccessToken) {
    try {
      const response = await fetch(`${faydaApiUrl}/api/v1/identity/${fcn}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${faydaAccessToken}`,
          'X-API-Key': faydaApiKey,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        if (response.status === 404) {
          return NextResponse.json({ success: false, error: "Person not found in National ID database" }, { status: 404 });
        }
        throw new Error("Fayda API request failed");
      }

      const data = await response.json();
      return NextResponse.json({ success: true, data });
    } catch (error) {
      console.error("Error making payload request to Fayda Platform:", error);
      return NextResponse.json({ success: false, error: "Failed to connect to Fayda verification service" }, { status: 500 });
    }
  }

  // Fallback when tokens aren't configured
  return NextResponse.json({ error: "National ID verification unavailable" }, { status: 501 });
}

/**
 * In a production environment, this would be the implementation to call the actual VeriFayda 2.0 API:
 * 
 * async function verifyIdWithFaydaApi(fcn: string) {
 *   // Initialize VeriFayda client with proper credentials
 *   const verifayda = new VeriFaydaClient({
 *     clientId: process.env.FAYDA_CLIENT_ID,
 *     apiKey: process.env.FAYDA_API_KEY,
 *     environment: process.env.NODE_ENV === 'production' ? 'production' : 'sandbox'
 *   });
 *   
 *   // Request identity verification
 *   const verificationResponse = await verifayda.verifyIdentity({
 *     fcn: fcn,
 *     requestedAttributes: ['firstName', 'lastName', 'dateOfBirth', 'email', 'phoneNumber']
 *   });
 *   
 *   if (!verificationResponse.verified) {
 *     throw new Error('Identity verification failed');
 *   }
 *   
 *   // Return the verified identity information
 *   return {
 *     fcn: fcn,
 *     firstName: verificationResponse.attributes.firstName,
 *     lastName: verificationResponse.attributes.lastName,
 *     dateOfBirth: verificationResponse.attributes.dateOfBirth,
 *     email: verificationResponse.attributes.email,
 *     phoneNumber: verificationResponse.attributes.phoneNumber
 *   };
 * }
 */
