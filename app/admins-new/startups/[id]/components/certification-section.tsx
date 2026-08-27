import React from "react";
import Link from "next/link";
import {
  Award,
  Calendar,
  CheckCircle,
  AlertCircle,
  XCircle,
  Clock,
  FileText,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

type CertificationProps = {
  startup: any; // In a real app, we would define a proper type
};

export function CertificationSection({ startup }: CertificationProps) {
  // Get the appropriate status icon
  const getStatusIcon = () => {
    switch (startup.status) {
      case "Certified":
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case "Under Review":
        return <Clock className="h-5 w-5 text-amber-500" />;
      case "Pending":
        return <AlertCircle className="h-5 w-5 text-blue-500" />;
      case "Rejected":
        return <XCircle className="h-5 w-5 text-red-500" />;
      default:
        return <AlertCircle className="h-5 w-5 text-gray-500" />;
    }
  };

  // Calculate days remaining on certification if certified
  const calculateDaysRemaining = () => {
    if (!startup.certification?.expiry) return null;

    const expiryDate = new Date(startup.certification.expiry);
    const today = new Date();
    const diffTime = expiryDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    return diffDays;
  };

  const daysRemaining = calculateDaysRemaining();

  // Calculate percentage of certification validity remaining
  const calculatePercentageRemaining = () => {
    if (!startup.certification?.issued || !startup.certification?.expiry)
      return 0;

    const issueDate = new Date(startup.certification.issued);
    const expiryDate = new Date(startup.certification.expiry);
    const today = new Date();

    const totalDuration = expiryDate.getTime() - issueDate.getTime();
    const elapsed = today.getTime() - issueDate.getTime();

    const percentElapsed = (elapsed / totalDuration) * 100;
    return Math.max(0, Math.min(100, 100 - percentElapsed));
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between">
          <span>Certification Status</span>
          {getStatusIcon()}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {startup.status === "Certified" && startup.certification ? (
          <>
            <div className="flex flex-col space-y-1">
              <div className="flex items-center">
                <Award className="h-5 w-5 text-amber-500 mr-2" />
                <span className="text-lg font-medium">
                  {startup.certification.level}
                </span>
              </div>
              <span className="text-sm text-muted-foreground">
                Certificate ID: {startup.certification.certificate_id || "N/A"}
              </span>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Valid until {startup.certification.expiry}</span>
                <span>{daysRemaining} days remaining</span>
              </div>
              <Progress
                value={calculatePercentageRemaining()}
                className="h-2"
              />
            </div>

            {startup.certification.criteria_met && (
              <div className="pt-3">
                <h4 className="text-sm font-medium mb-2">Criteria Met</h4>
                <ul className="space-y-1">
                  {startup.certification.criteria_met.map(
                    (criteria: string, index: number) => (
                      <li key={index} className="flex items-start text-sm">
                        <CheckCircle className="h-3 w-3 text-green-600 mt-1 mr-2 flex-shrink-0" />
                        <span>{criteria}</span>
                      </li>
                    ),
                  )}
                </ul>
              </div>
            )}

            <div className="pt-3 space-y-2">
              <Button className="w-full" asChild>
                <Link
                  href={`/admins-new/certificates/${startup.certification?.id}`}
                >
                  <FileText className="mr-2 h-4 w-4" />
                  View Certificate
                </Link>
              </Button>
              <Button variant="outline" className="w-full">
                <Award className="mr-2 h-4 w-4" />
                Upgrade Level
              </Button>
            </div>
          </>
        ) : startup.status === "Under Review" ? (
          <>
            <div className="text-center py-3">
              <Clock className="h-12 w-12 text-amber-500 mx-auto mb-3" />
              <h3 className="text-lg font-medium">Under Review</h3>
              <p className="text-sm text-muted-foreground">
                Application is currently being reviewed by the certification
                team
              </p>
            </div>

            <div className="space-y-2 pt-2">
              <h4 className="text-sm font-medium">Review Progress</h4>
              <Progress value={65} className="h-2" />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Documentation</span>
                <span>Technical</span>
                <span>Financial</span>
                <span>Final</span>
              </div>
            </div>

            <div className="pt-3 space-y-2">
              <Button className="w-full">
                <CheckCircle className="mr-2 h-4 w-4" />
                Approve Certification
              </Button>
              <Button variant="outline" className="w-full">
                <AlertCircle className="mr-2 h-4 w-4" />
                Request Information
              </Button>
            </div>
          </>
        ) : startup.status === "Pending" ? (
          <>
            <div className="text-center py-3">
              <AlertCircle className="h-12 w-12 text-blue-500 mx-auto mb-3" />
              <h3 className="text-lg font-medium">Pending Review</h3>
              <p className="text-sm text-muted-foreground">
                Application has been submitted and is awaiting review
              </p>
            </div>

            <div className="pt-3 space-y-2">
              <Button className="w-full">
                <Clock className="mr-2 h-4 w-4" />
                Begin Review Process
              </Button>
              <Button variant="outline" className="w-full">
                <AlertCircle className="mr-2 h-4 w-4" />
                Request Documentation
              </Button>
            </div>
          </>
        ) : (
          <>
            <div className="text-center py-3">
              <XCircle className="h-12 w-12 text-red-500 mx-auto mb-3" />
              <h3 className="text-lg font-medium">Application Rejected</h3>
              <p className="text-sm text-muted-foreground">
                This startup&apos;s application did not meet the certification
                criteria
              </p>
            </div>

            <div className="border rounded-md p-3 bg-red-50 border-red-200 text-sm mt-3">
              <h4 className="font-medium text-red-800 mb-1">
                Rejection Reasons
              </h4>
              <ul className="space-y-1 text-red-700">
                <li>• Insufficient market validation</li>
                <li>• Incomplete financial documentation</li>
                <li>• Failure to demonstrate innovation criteria</li>
              </ul>
            </div>

            <div className="pt-3 space-y-2">
              <Button className="w-full">
                <AlertCircle className="mr-2 h-4 w-4" />
                Send Feedback
              </Button>
              <Button variant="outline" className="w-full">
                <Clock className="mr-2 h-4 w-4" />
                Allow Reapplication
              </Button>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
