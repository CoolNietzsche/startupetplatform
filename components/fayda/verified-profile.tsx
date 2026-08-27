'use client';

import React from 'react';
import { useFaydaAuth } from '@/hooks/use-fayda-auth';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, Shield, AlertCircle } from 'lucide-react';

/**
 * Component that displays verified user information from Ethiopia's National ID
 */
export const VerifiedProfile: React.FC = () => {
  const { 
    isAuthenticated, 
    isLoading, 
    isVerified,
    logout,
    fcn,
    firstName,
    lastName,
    email,
    phoneNumber,
    dateOfBirth
  } = useFaydaAuth();

  if (isLoading) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl">Verifying Identity</CardTitle>
          <CardDescription>
            Please wait while we verify your National ID information...
          </CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center py-6">
          <div className="animate-pulse flex flex-col items-center">
            <div className="rounded-full bg-gray-200 h-16 w-16 mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!isAuthenticated) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl">National ID Required</CardTitle>
          <CardDescription>
            You need to authenticate with your National ID to view this information.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center py-4">
          <AlertCircle className="h-16 w-16 text-amber-500" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="space-y-1 pb-2">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-2xl">Verified Identity</CardTitle>
            <CardDescription>
              Information verified through Ethiopia's National ID system
            </CardDescription>
          </div>
          {isVerified && (
            <Badge variant="outline" className="flex items-center gap-1 bg-green-50 text-green-700 border-green-200">
              <CheckCircle2 className="h-3 w-3" />
              Verified
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-center mb-6">
          <div className="bg-green-50 p-4 rounded-full">
            <Shield className="h-12 w-12 text-green-600" />
          </div>
        </div>

        <div className="space-y-3">
          <div className="grid grid-cols-3 gap-1 text-sm">
            <div className="font-medium text-gray-500">Full Name</div>
            <div className="col-span-2 font-semibold">{firstName} {lastName}</div>
          </div>

          <div className="grid grid-cols-3 gap-1 text-sm">
            <div className="font-medium text-gray-500">National ID</div>
            <div className="col-span-2">{fcn}</div>
          </div>

          {dateOfBirth && (
            <div className="grid grid-cols-3 gap-1 text-sm">
              <div className="font-medium text-gray-500">Date of Birth</div>
              <div className="col-span-2">{dateOfBirth}</div>
            </div>
          )}

          {email && (
            <div className="grid grid-cols-3 gap-1 text-sm">
              <div className="font-medium text-gray-500">Email</div>
              <div className="col-span-2">{email}</div>
            </div>
          )}

          {phoneNumber && (
            <div className="grid grid-cols-3 gap-1 text-sm">
              <div className="font-medium text-gray-500">Phone</div>
              <div className="col-span-2">{phoneNumber}</div>
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter>
        <Button variant="outline" className="w-full" onClick={() => logout()}>
          Sign Out
        </Button>
      </CardFooter>
    </Card>
  );
};

export default VerifiedProfile;
