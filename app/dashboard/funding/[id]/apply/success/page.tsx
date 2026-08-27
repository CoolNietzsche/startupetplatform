"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { CheckCircle, ArrowLeft, Calendar, Clock, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

export default function ApplicationSuccessPage() {
  const params = useParams();
  const id = typeof params?.id === 'string' ? params.id : '';
  
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    setMounted(true);
  }, []);

  // Use a deterministic seed from the ID if possible
  const applicationRef = `ETH-${Math.abs(id.split('').reduce((a, b) => { a = ((a << 5) - a) + b.charCodeAt(0); return a & a }, 0) % 900000) + 100000}`;
  
  const today = new Date();
  const reviewDate = new Date(today);
  reviewDate.setDate(today.getDate() + 30);
  
  const formattedToday = today.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  const formattedReviewDate = reviewDate.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  if (!mounted) {
    return <div className="min-h-screen bg-gray-50 flex items-center justify-center">Loading...</div>;
  }
  
  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <div className="mb-8">
        <Link 
          href="/dashboard/funding"
          className="flex items-center text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          <span>Back to Funding Opportunities</span>
        </Link>
      </div>
      
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center p-4 bg-green-100 rounded-full mb-6">
          <CheckCircle className="h-10 w-10 text-green-600" />
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-3">Application Submitted Successfully!</h1>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Thank you for applying to the Ethiopian Startup Growth Fund. Your application has been received and will be reviewed by our team.
        </p>
      </div>
      
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Application Summary</CardTitle>
          <CardDescription>Your application reference and important information</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 text-amber-800">
            <p className="text-sm font-medium mb-1">Application Reference Number</p>
            <p className="text-xl font-bold">{applicationRef}</p>
            <p className="text-xs mt-1">Please save this reference number for future communication</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="border rounded-lg p-4">
              <div className="flex items-center mb-2">
                <Calendar className="h-5 w-5 text-gray-500 mr-2" />
                <p className="text-sm font-medium text-gray-700">Submission Date</p>
              </div>
              <p className="text-lg font-semibold">{formattedToday}</p>
            </div>
            
            <div className="border rounded-lg p-4">
              <div className="flex items-center mb-2">
                <Clock className="h-5 w-5 text-gray-500 mr-2" />
                <p className="text-sm font-medium text-gray-700">Estimated Review By</p>
              </div>
              <p className="text-lg font-semibold">{formattedReviewDate}</p>
            </div>
            
            <div className="border rounded-lg p-4">
              <div className="flex items-center mb-2">
                <FileText className="h-5 w-5 text-gray-500 mr-2" />
                <p className="text-sm font-medium text-gray-700">Application Status</p>
              </div>
              <p className="text-lg font-semibold text-amber-600">Under Review</p>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>What Happens Next?</CardTitle>
        </CardHeader>
        <CardContent>
          <ol className="space-y-4">
            <li className="flex gap-3">
              <div className="flex-shrink-0 w-7 h-7 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-medium">1</div>
              <div>
                <p className="font-medium">Initial Screening (7-10 days)</p>
                <p className="text-gray-600 text-sm">Our team will review your application to ensure all requirements are met.</p>
              </div>
            </li>
            <li className="flex gap-3">
              <div className="flex-shrink-0 w-7 h-7 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-medium">2</div>
              <div>
                <p className="font-medium">Evaluation (14-21 days)</p>
                <p className="text-gray-600 text-sm">Qualified applications will be evaluated by our investment committee based on innovation, market potential, and impact.</p>
              </div>
            </li>
            <li className="flex gap-3">
              <div className="flex-shrink-0 w-7 h-7 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-medium">3</div>
              <div>
                <p className="font-medium">Interview (if selected)</p>
                <p className="text-gray-600 text-sm">Shortlisted startups will be invited for a virtual or in-person interview.</p>
              </div>
            </li>
            <li className="flex gap-3">
              <div className="flex-shrink-0 w-7 h-7 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-medium">4</div>
              <div>
                <p className="font-medium">Final Decision</p>
                <p className="text-gray-600 text-sm">Funding decisions will be announced on the platform and via email.</p>
              </div>
            </li>
          </ol>
        </CardContent>
      </Card>
      
      <div className="space-y-4">
        <div className="bg-gray-50 border rounded-lg p-4">
          <p className="text-sm text-gray-700">
            <span className="font-medium">Questions?</span> Contact us at <a href="mailto:funding@ethiopianstartups.gov.et" className="text-blue-600 hover:underline">funding@ethiopianstartups.gov.et</a> or call our support line at <span className="font-medium">+251 11 552 3333</span>
          </p>
        </div>
        
        <div className="flex justify-center md:justify-start gap-4">
          <Button asChild variant="outline">
            <Link href="/dashboard/funding">
              View All Funding Opportunities
            </Link>
          </Button>
          <Button asChild>
            <Link href="/dashboard">
              Return to Dashboard
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
