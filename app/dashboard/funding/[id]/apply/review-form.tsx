"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ArrowLeft, CheckCircle, AlertCircle, FileText, Building, GraduationCap } from "lucide-react";

interface ReviewFormProps {
  formData: {
    company: any;
    project: any;
    documents: any;
  };
  onBack: () => void;
  onSubmit: () => void;
  isSubmitting: boolean;
}

export function ReviewForm({ formData, onBack, onSubmit, isSubmitting }: ReviewFormProps) {
  const { company, project, documents } = formData;
  
  // Check if required sections are complete
  const isCompanyComplete = company && Object.keys(company).length > 0;
  const isProjectComplete = project && Object.keys(project).length > 0;
  const isDocumentsComplete = documents && Object.keys(documents).length > 0;
  
  // Check if all required documents are uploaded
  const requiredDocuments = [
    "businessRegistration",
    "businessPlan", 
    "financialProjections",
    "teamCVs",
    "proofOfConcept"
  ];
  
  const allRequiredDocumentsUploaded = requiredDocuments.every(doc => 
    documents && documents[doc]
  );
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Review Your Application</CardTitle>
        <CardDescription>
          Please review all information carefully before submitting your funding application.
          Once submitted, you will not be able to make changes.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Company Information */}
        <Card>
          <CardHeader className="p-4 pb-2">
            <div className="flex items-start gap-3">
              <div className="bg-blue-100 text-blue-600 p-2 rounded-lg">
                <Building className="h-5 w-5" />
              </div>
              <div>
                <CardTitle className="text-lg">Company Information</CardTitle>
                <CardDescription>Basic details about your company</CardDescription>
              </div>
              {isCompanyComplete ? (
                <div className="ml-auto flex items-center text-green-600">
                  <CheckCircle className="h-5 w-5 mr-1" />
                  <span className="text-sm">Complete</span>
                </div>
              ) : (
                <div className="ml-auto flex items-center text-amber-600">
                  <AlertCircle className="h-5 w-5 mr-1" />
                  <span className="text-sm">Incomplete</span>
                </div>
              )}
            </div>
          </CardHeader>
          <CardContent className="p-4 pt-2">
            {isCompanyComplete ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <h3 className="font-medium text-gray-700">Company Name</h3>
                  <p>{company.name}</p>
                </div>
                <div>
                  <h3 className="font-medium text-gray-700">Registration Number</h3>
                  <p>{company.registrationNumber}</p>
                </div>
                <div>
                  <h3 className="font-medium text-gray-700">Founding Date</h3>
                  <p>{company.foundingDate}</p>
                </div>
                <div>
                  <h3 className="font-medium text-gray-700">Industry Sector</h3>
                  <p>{company.sector}</p>
                </div>
                <div>
                  <h3 className="font-medium text-gray-700">Company Stage</h3>
                  <p>{company.stage}</p>
                </div>
                <div>
                  <h3 className="font-medium text-gray-700">Number of Employees</h3>
                  <p>{company.employeeCount}</p>
                </div>
                <div className="md:col-span-2">
                  <h3 className="font-medium text-gray-700">Company Description</h3>
                  <p className="line-clamp-3">{company.description}</p>
                </div>
              </div>
            ) : (
              <p className="text-amber-600 text-sm">
                Please complete the company information section.
              </p>
            )}
          </CardContent>
        </Card>

        {/* Project Information */}
        <Card>
          <CardHeader className="p-4 pb-2">
            <div className="flex items-start gap-3">
              <div className="bg-green-100 text-green-600 p-2 rounded-lg">
                <GraduationCap className="h-5 w-5" />
              </div>
              <div>
                <CardTitle className="text-lg">Project Details</CardTitle>
                <CardDescription>Information about your project and funding request</CardDescription>
              </div>
              {isProjectComplete ? (
                <div className="ml-auto flex items-center text-green-600">
                  <CheckCircle className="h-5 w-5 mr-1" />
                  <span className="text-sm">Complete</span>
                </div>
              ) : (
                <div className="ml-auto flex items-center text-amber-600">
                  <AlertCircle className="h-5 w-5 mr-1" />
                  <span className="text-sm">Incomplete</span>
                </div>
              )}
            </div>
          </CardHeader>
          <CardContent className="p-4 pt-2">
            {isProjectComplete ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <h3 className="font-medium text-gray-700">Project Title</h3>
                  <p>{project.title}</p>
                </div>
                <div>
                  <h3 className="font-medium text-gray-700">Current Progress</h3>
                  <p>{project.currentProgress}</p>
                </div>
                <div className="md:col-span-2">
                  <h3 className="font-medium text-gray-700">Project Summary</h3>
                  <p className="line-clamp-3">{project.summary}</p>
                </div>
                <div>
                  <h3 className="font-medium text-gray-700">Requested Funding</h3>
                  <p className="font-semibold">${Number(project.fundingAmount).toLocaleString()} USD</p>
                </div>
                <div>
                  <h3 className="font-medium text-gray-700">Impact Area</h3>
                  <p>{project.sustainabilityImpact}</p>
                </div>
                <div className="md:col-span-2">
                  <h3 className="font-medium text-gray-700">Funding Usage Plan</h3>
                  <p className="line-clamp-3">{project.fundingUsage}</p>
                </div>
              </div>
            ) : (
              <p className="text-amber-600 text-sm">
                Please complete the project details section.
              </p>
            )}
          </CardContent>
        </Card>

        {/* Documents */}
        <Card>
          <CardHeader className="p-4 pb-2">
            <div className="flex items-start gap-3">
              <div className="bg-purple-100 text-purple-600 p-2 rounded-lg">
                <FileText className="h-5 w-5" />
              </div>
              <div>
                <CardTitle className="text-lg">Required Documents</CardTitle>
                <CardDescription>Supporting documents for your application</CardDescription>
              </div>
              {allRequiredDocumentsUploaded ? (
                <div className="ml-auto flex items-center text-green-600">
                  <CheckCircle className="h-5 w-5 mr-1" />
                  <span className="text-sm">Complete</span>
                </div>
              ) : (
                <div className="ml-auto flex items-center text-amber-600">
                  <AlertCircle className="h-5 w-5 mr-1" />
                  <span className="text-sm">Incomplete</span>
                </div>
              )}
            </div>
          </CardHeader>
          <CardContent className="p-4 pt-2">
            {isDocumentsComplete ? (
              <div className="grid grid-cols-1 gap-3 text-sm">
                {Object.entries(documents).map(([key, doc]: [string, any]) => (
                  <div key={key} className="flex items-center justify-between border-b pb-2">
                    <div className="flex items-center">
                      <FileText className="h-4 w-4 mr-2 text-gray-500" />
                      <span>
                        {key === "businessRegistration" && "Business Registration Certificate"}
                        {key === "businessPlan" && "Business Plan"}
                        {key === "financialProjections" && "Financial Projections"}
                        {key === "teamCVs" && "Team CVs"}
                        {key === "proofOfConcept" && "Proof of Concept/MVP"}
                        {key === "additionalDocuments" && "Additional Documents"}
                      </span>
                    </div>
                    <span className="text-green-600">Uploaded</span>
                  </div>
                ))}
                
                {requiredDocuments.filter(doc => !documents[doc]).map((doc) => (
                  <div key={doc} className="flex items-center justify-between border-b pb-2">
                    <div className="flex items-center">
                      <FileText className="h-4 w-4 mr-2 text-gray-500" />
                      <span>
                        {doc === "businessRegistration" && "Business Registration Certificate"}
                        {doc === "businessPlan" && "Business Plan"}
                        {doc === "financialProjections" && "Financial Projections"}
                        {doc === "teamCVs" && "Team CVs"}
                        {doc === "proofOfConcept" && "Proof of Concept/MVP"}
                      </span>
                    </div>
                    <span className="text-amber-600">Missing</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-amber-600 text-sm">
                Please upload all required documents.
              </p>
            )}
          </CardContent>
        </Card>

        {/* Final submission message */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-sm">
          <div className="flex">
            <AlertCircle className="h-5 w-5 text-yellow-600 mr-2 flex-shrink-0" />
            <div>
              <h3 className="font-medium text-yellow-800">Important Notice</h3>
              <p className="text-yellow-700">
                By submitting this application, you confirm that all information provided is accurate and complete.
                False information may result in disqualification and potential legal consequences.
              </p>
            </div>
          </div>
        </div>
      </CardContent>

      <CardFooter className="flex justify-between">
        <Button
          type="button"
          variant="outline"
          onClick={onBack}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        <Button 
          type="button" 
          onClick={onSubmit}
          className="bg-green-600 hover:bg-green-700"
          disabled={!isCompanyComplete || !isProjectComplete || !allRequiredDocumentsUploaded || isSubmitting}
        >
          {isSubmitting ? (
            <>
              <span className="animate-pulse">Submitting Application...</span>
            </>
          ) : (
            <>Submit Application</>
          )}
        </Button>
      </CardFooter>
    </Card>
  );
}
