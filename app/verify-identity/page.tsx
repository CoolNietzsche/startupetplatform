'use client';

import React, { useState } from 'react';
import { useFaydaAuth } from '@/hooks/use-fayda-auth';
import { FaydaLoginButton } from '@/components/fayda/login-button';
import { VerifiedProfile } from '@/components/fayda/verified-profile';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, UserCheck, FileText, AlertTriangle } from 'lucide-react';
import Link from 'next/link';

const VerifyIdentityPage = () => {
  const { isAuthenticated, isVerified, fcn, firstName, lastName, email } = useFaydaAuth();
  const [activeTab, setActiveTab] = useState('overview');

  // Function to simulate auto-populating a form with verified identity information
  const handleAutoFill = () => {
    // In a real implementation, this would populate an actual form or store the data
    setActiveTab('next');
  };

  return (
    <div className="max-w-6xl mx-auto py-10 px-4">
      <div className="flex items-center mb-6">
        <Link href="/dashboard">
          <Button variant="ghost" size="sm" className="mr-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
        </Link>
        <h1 className="text-2xl font-bold">Verify Your Identity</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>National Digital ID Verification</CardTitle>
              <CardDescription>
                Verify your identity using Ethiopia&apos;s National ID System to streamline your startup registration
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid grid-cols-3 mb-6">
                  <TabsTrigger value="overview">Overview</TabsTrigger>
                  <TabsTrigger value="verify" disabled={activeTab === 'next'}>Verify ID</TabsTrigger>
                  <TabsTrigger value="next" disabled={!isVerified}>Next Steps</TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="space-y-4">
                  <div className="flex items-start space-x-4 p-4 rounded-lg bg-blue-50">
                    <div className="mt-1 bg-blue-100 rounded-full p-2">
                      <FileText className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-medium text-blue-900">Why Verify Your Identity?</h3>
                      <p className="text-sm text-blue-700 mt-1">
                        Verifying your identity with the National ID system helps streamline your
                        startup registration by:
                      </p>
                      <ul className="text-sm text-blue-700 list-disc list-inside mt-2 space-y-1">
                        <li>Ensuring accurate identity information</li>
                        <li>Eliminating the need for physical document submission</li>
                        <li>Speeding up the verification process</li>
                        <li>Allowing you to digitally sign official documents</li>
                      </ul>
                    </div>
                  </div>

                  <p className="text-sm">
                    The National Digital ID Program of Ethiopia provides a secure way to verify your identity
                    online. By authenticating with your National ID, your information will be automatically
                    and securely filled in the required forms, saving you time and ensuring accuracy.
                  </p>

                  <div className="flex justify-end mt-4">
                    <Button onClick={() => setActiveTab('verify')}>Continue to Verification</Button>
                  </div>
                </TabsContent>

                <TabsContent value="verify" className="space-y-6">
                  {isAuthenticated && isVerified ? (
                    <div className="flex flex-col items-center space-y-4">
                      <div className="bg-green-100 p-3 rounded-full">
                        <UserCheck className="h-8 w-8 text-green-600" />
                      </div>
                      <h3 className="text-xl font-medium text-center">Identity Successfully Verified!</h3>
                      <p className="text-center text-gray-500 max-w-md">
                        Your National ID has been verified. You can now proceed with your application using your verified information.
                      </p>
                      <Button onClick={handleAutoFill} className="mt-4">
                        Continue with Verified Identity
                      </Button>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center space-y-4 py-6">
                      <div className="max-w-md text-center space-y-4">
                        <h3 className="text-xl font-medium">Authenticate with National ID</h3>
                        <p className="text-gray-500">
                          Click the button below to securely authenticate with Ethiopia&apos;s National ID system (ID.et)
                        </p>
                        <div className="p-4 rounded-lg bg-amber-50 text-amber-800 text-sm flex items-start space-x-2">
                          <AlertTriangle className="h-5 w-5 text-amber-500 flex-shrink-0 mt-0.5" />
                          <span>
                            For security reasons, you will be redirected to the official National ID authentication page 
                            to complete the verification process.
                          </span>
                        </div>
                        <div className="pt-4">
                          <FaydaLoginButton className="mx-auto" />
                        </div>
                      </div>
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="next" className="space-y-6">
                  <div className="flex flex-col items-center space-y-4">
                    <h3 className="text-xl font-medium text-center">Ready to Continue Your Application</h3>
                    <p className="text-center text-gray-500 max-w-md">
                      Your verified identity information will be used to pre-fill parts of your startup registration.
                      You can now return to the application form.
                    </p>
                    <Link href="/dashboard/application">
                      <Button className="mt-4">
                        Continue to Application
                      </Button>
                    </Link>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>

        <div>
          <VerifiedProfile />
        </div>
      </div>
    </div>
  );
};

export default VerifyIdentityPage;
