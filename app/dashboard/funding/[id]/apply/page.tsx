"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import { ArrowLeft } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import FundingApplicationForm from "./application-form";

// Header data will be fetched dynamically via effect

export default function FundingApplicationPage() {
  const params = useParams();
  const router = useRouter();
  const id = typeof params?.id === 'string' ? params.id : '';
  
  const [funding, setFunding] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (id) {
       fetchHeaderDetails();
    }
  }, [id]);

  const fetchHeaderDetails = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/funding/${id}`);
      const result = await res.json();
      if (result.success) {
        setFunding(result.data);
      }
    } catch (_) {} finally {
      setLoading(false);
    }
  };
  
  const handleApplicationComplete = async (applicationData: any) => {
    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/funding/${id}/apply`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(applicationData)
      });
      const result = await res.json();
      if (result.success) {
        router.push(`/dashboard/funding/${id}/apply/success?ref=${result.data.id}`);
      } else {
        toast.error(result.error || "Submission failed");
      }
    } catch (error) {
      toast.error("An error occurred during submission");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
     return <div className="p-20 text-center">Loading form details...</div>;
  }

  if (!funding) return null;
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <Link 
          href={`/dashboard/funding/${id}`} 
          className="flex items-center text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          <span>Back to Funding Details</span>
        </Link>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Apply for Funding</CardTitle>
          <CardDescription>
            {funding.title} - Application Form
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600 mb-6">
            Complete the following application form to apply for this funding opportunity. 
            Make sure to have all the required documents ready before you start.
            The deadline for this application is <span className="font-medium">{funding.deadlineFormatted}</span>.
          </p>
          
          <FundingApplicationForm 
            fundingId={id}
            onComplete={handleApplicationComplete}
            isSubmitting={isSubmitting}
          />
        </CardContent>
      </Card>
    </div>
  );
}
