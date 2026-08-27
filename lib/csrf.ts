import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";

const CSRF_HEADER = "x-csrf-token";

export function generateCsrfToken(): string {
  return crypto.randomBytes(32).toString("hex");
}

export async function validateCsrf(request: NextRequest): Promise<{ valid: boolean; error?: string }> {
  const session = await getServerSession(authOptions);
  if (!session) {
    return { valid: false, error: "Unauthorized" };
  }
  const token = request.headers.get(CSRF_HEADER);
  if (!token) {
    return { valid: false, error: "Missing CSRF token" };
  }
  const sessionToken = (session as any).csrfToken;
  if (!sessionToken || token !== sessionToken) {
    return { valid: false, error: "Invalid CSRF token" };
  }
  return { valid: true };
}

export function csrfGuard(request: NextRequest): NextResponse | null {
  if (request.method === "GET" || request.method === "HEAD" || request.method === "OPTIONS") {
    return null;
  }
  const token = request.headers.get(CSRF_HEADER);
  if (!token) {
    return NextResponse.json({ error: "Missing CSRF token" }, { status: 403 });
  }
  return null;
}
