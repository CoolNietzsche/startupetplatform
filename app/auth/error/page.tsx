"use client";

import React, { Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

function AuthErrorContent() {
  const searchParams = useSearchParams();
  const error = searchParams?.get("error") || "Unknown";

  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4">
      <div className="w-full max-w-md rounded-lg border bg-white p-6">
        <h1 className="text-xl font-semibold">Authentication Error</h1>
        <p className="mt-2 text-sm text-muted-foreground">Error: {error}</p>
        <div className="mt-6">
          <Link href="/auth/sign-in" className="text-sm font-medium text-blue-600 hover:underline">
            Go to Sign In
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function AuthErrorPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <AuthErrorContent />
    </Suspense>
  );
}
