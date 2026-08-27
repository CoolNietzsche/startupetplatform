import React, { useState } from 'react';
import { 
  ArrowRight, 
  CheckCircle, 
  XCircle, 
  AlertCircle, 
  FileText,
  ClipboardCheck,
  Edit,
  MoreHorizontal
} from 'lucide-react';
import Link from 'next/link';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuSeparator,
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

type Application = {
  id: string;
  startupName: string;
  startupId: string;
  submissionDate: string;
  applicationType: string;
  sector: string;
  location: string;
  status: string;
  assignedTo: string | null;
  [key: string]: any; // For additional properties in different stages
};

type StageApplicationsProps = {
  applications: Application[];
  stage: string;
  onMoveApplication?: (applicationId: string) => void;
  onApprove?: (applicationId: string) => void;
  onReject?: (applicationId: string) => void;
};

export function StageApplications({ applications, stage, onMoveApplication, onApprove, onReject }: StageApplicationsProps) {
  const [showDocumentsModalFor, setShowDocumentsModalFor] = useState<string | null>(null);
  const [showEditModalFor, setShowEditModalFor] = useState<string | null>(null);
  const [messageInfo, setMessageInfo] = useState<{ type: string; text: string } | null>(null);
  
  // Helper to show a success message
  const showMessage = (type: string, text: string) => {
    setMessageInfo({ type, text });
    setTimeout(() => setMessageInfo(null), 3000);
  };

  // Function to format dates
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };
  
  // Function to get the status badge variant
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "New":
        return <Badge variant="outline">New</Badge>;
      case "Documentation Review":
        return <Badge variant="warning">Documentation</Badge>;
      case "Technical Assessment":
        return <Badge variant="warning">Technical</Badge>;
      case "Business Assessment":
        return <Badge variant="warning">Business</Badge>;
      case "Final Review":
        return <Badge variant="warning">Final Review</Badge>;
      case "Approved":
        return <Badge variant="success">Approved</Badge>;
      case "Rejected":
        return <Badge variant="destructive">Rejected</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };
  
  // Function to render applications based on current stage
  const renderApplications = () => {
    switch (stage) {
      case 'new':
        return renderNewApplications();
      case 'documentation':
        return renderDocumentationApplications();
      case 'technical':
        return renderTechnicalApplications();
      case 'business':
        return renderBusinessApplications();
      case 'final':
        return renderFinalReviewApplications();
      case 'completed':
        return renderCompletedApplications();
      default:
        return renderNewApplications();
    }
  };
  
  // Render applications in the New stage
  const renderNewApplications = () => (
    <div className="space-y-4">
      {applications.map((app) => (
        <Card key={app.id} className="overflow-hidden">
          <CardContent className="p-0">
            <div className="p-4 flex justify-between items-center">
              <div className="flex-1">
                <div className="flex items-center">
                  <div className="font-medium">{app.startupName}</div>
                  <Badge variant="outline" className="ml-2">{app.applicationType}</Badge>
                </div>
                <div className="flex items-center text-sm text-muted-foreground mt-1">
                  <span className="mr-4">{app.id}</span>
                  <span className="mr-4">{app.sector}</span>
                  <span>{app.location}</span>
                </div>
              </div>
              
              <div className="flex items-center">
                <div className="flex flex-col items-end mr-4">
                  <span className="text-sm font-medium">Submitted</span>
                  <span className="text-sm text-muted-foreground">
                    {formatDate(app.submissionDate)}
                  </span>
                </div>
                
                <Button onClick={() => onMoveApplication?.(app.id)}>
                  Start Review <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
  
  // Render applications in the Documentation Review stage
  const renderDocumentationApplications = () => (
    <div className="space-y-4">
      {applications.map((app) => (
        <Card key={app.id} className="overflow-hidden">
          <CardContent className="p-0">
            <div className="p-4">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center">
                    <div className="font-medium">{app.startupName}</div>
                    <Badge variant="outline" className="ml-2">{app.applicationType}</Badge>
                  </div>
                  <div className="flex items-center text-sm text-muted-foreground mt-1">
                    <span className="mr-4">{app.id}</span>
                    <span className="mr-4">{app.sector}</span>
                    <span>{app.location}</span>
                  </div>
                </div>
                
                <div className="flex items-center">
                  {app.assignedTo && (
                    <div className="flex items-center mr-4">
                      <Avatar className="h-6 w-6 mr-2">
                        <AvatarFallback className="text-xs">
                          {app.assignedTo.split(' ').map((n: string) => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-sm">{app.assignedTo}</span>
                    </div>
                  )}
                  
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem asChild>
                        <Link href={`/admins-new/startups/${app.startupId}`}>
                          <FileText className="mr-2 h-4 w-4" />
                          View Startup
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setShowDocumentsModalFor(app.id)}>
                        <ClipboardCheck className="mr-2 h-4 w-4" />
                        Review Documents
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setShowEditModalFor(app.id)}>
                        <Edit className="mr-2 h-4 w-4" />
                        Edit Application
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => onMoveApplication?.(app.id)}>
                        <ArrowRight className="mr-2 h-4 w-4" />
                        Move to Technical Assessment
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
              
              <div className="mt-4">
                <div className="flex justify-between text-sm mb-1">
                  <span>Document Verification</span>
                  <span>
                    {app.documentsVerified}/{app.documentsRequired} Documents Verified
                  </span>
                </div>
                <Progress 
                  value={(app.documentsVerified / app.documentsRequired) * 100} 
                  className="h-2" 
                />
                
                <div className="flex justify-between mt-3">
                  <div className="text-xs">
                    <span className="text-muted-foreground">Submitted: </span>
                    {formatDate(app.submissionDate)}
                  </div>
                  
                  <Button onClick={() => onMoveApplication?.(app.id)}>
                    Complete Review <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
  
  // Render applications in the Technical Assessment stage
  const renderTechnicalApplications = () => (
    <div className="space-y-4">
      {applications.map((app) => (
        <Card key={app.id} className="overflow-hidden">
          <CardContent className="p-0">
            <div className="p-4">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center">
                    <div className="font-medium">{app.startupName}</div>
                    <Badge variant="outline" className="ml-2">{app.applicationType}</Badge>
                  </div>
                  <div className="flex items-center text-sm text-muted-foreground mt-1">
                    <span className="mr-4">{app.id}</span>
                    <span className="mr-4">{app.sector}</span>
                    <span>{app.location}</span>
                  </div>
                </div>
                
                <div className="flex items-center">
                  {app.assignedTo && (
                    <div className="flex items-center mr-4">
                      <Avatar className="h-6 w-6 mr-2">
                        <AvatarFallback className="text-xs">
                          {app.assignedTo.split(' ').map((n: string) => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-sm">{app.assignedTo}</span>
                    </div>
                  )}
                  
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem asChild>
                        <Link href={`/admins-new/startups/${app.startupId}`}>
                          <FileText className="mr-2 h-4 w-4" />
                          View Startup
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setShowEditModalFor(app.id)}>
                        <Edit className="mr-2 h-4 w-4" />
                        Edit Assessment
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => onMoveApplication?.(app.id)}>
                        <ArrowRight className="mr-2 h-4 w-4" />
                        Move to Business Assessment
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
              
              <div className="mt-4">
                <div className="flex justify-between text-sm mb-1">
                  <span>Technical Assessment</span>
                  <span>
                    {app.technicalCriteriaMet}/{app.technicalCriteriaTotal} Criteria Met
                  </span>
                </div>
                <Progress 
                  value={(app.technicalCriteriaMet / app.technicalCriteriaTotal) * 100} 
                  className="h-2" 
                />
                
                <div className="grid grid-cols-2 gap-4 mt-3">
                  <div className="border rounded-md p-2 text-center">
                    <div className="text-xs text-muted-foreground">Technical Score</div>
                    <div className="text-lg font-semibold">{app.technicalScore}/100</div>
                  </div>
                  <div className="border rounded-md p-2 text-center">
                    <div className="text-xs text-muted-foreground">Assessment Progress</div>
                    <div className="text-lg font-semibold">
                      {Math.round((app.technicalCriteriaMet / app.technicalCriteriaTotal) * 100)}%
                    </div>
                  </div>
                </div>
                
                <div className="flex justify-end mt-3">
                  <Button onClick={() => onMoveApplication?.(app.id)}>
                    Complete Assessment <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
  
  // Render applications in the Business Assessment stage
  const renderBusinessApplications = () => (
    <div className="space-y-4">
      {applications.map((app) => (
        <Card key={app.id} className="overflow-hidden">
          <CardContent className="p-0">
            <div className="p-4">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center">
                    <div className="font-medium">{app.startupName}</div>
                    <Badge variant="outline" className="ml-2">{app.applicationType}</Badge>
                  </div>
                  <div className="flex items-center text-sm text-muted-foreground mt-1">
                    <span className="mr-4">{app.id}</span>
                    <span className="mr-4">{app.sector}</span>
                    <span>{app.location}</span>
                  </div>
                </div>
                
                <div className="flex items-center">
                  {app.assignedTo && (
                    <div className="flex items-center mr-4">
                      <Avatar className="h-6 w-6 mr-2">
                        <AvatarFallback className="text-xs">
                          {app.assignedTo.split(' ').map((n: string) => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-sm">{app.assignedTo}</span>
                    </div>
                  )}
                  
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem asChild>
                        <Link href={`/admins-new/startups/${app.startupId}`}>
                          <FileText className="mr-2 h-4 w-4" />
                          View Startup
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setShowEditModalFor(app.id)}>
                        <Edit className="mr-2 h-4 w-4" />
                        Edit Assessment
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => onMoveApplication?.(app.id)}>
                        <ArrowRight className="mr-2 h-4 w-4" />
                        Move to Final Review
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
              
              <div className="mt-4">
                <div className="flex justify-between text-sm mb-1">
                  <span>Business Assessment</span>
                  <span>
                    {app.businessCriteriaMet}/{app.businessCriteriaTotal} Criteria Met
                  </span>
                </div>
                <Progress 
                  value={(app.businessCriteriaMet / app.businessCriteriaTotal) * 100} 
                  className="h-2" 
                />
                
                <div className="grid grid-cols-2 gap-4 mt-3">
                  <div className="border rounded-md p-2 text-center">
                    <div className="text-xs text-muted-foreground">Business Score</div>
                    <div className="text-lg font-semibold">{app.businessScore}/100</div>
                  </div>
                  <div className="border rounded-md p-2 text-center">
                    <div className="text-xs text-muted-foreground">Assessment Progress</div>
                    <div className="text-lg font-semibold">
                      {Math.round((app.businessCriteriaMet / app.businessCriteriaTotal) * 100)}%
                    </div>
                  </div>
                </div>
                
                <div className="flex justify-end mt-3">
                  <Button onClick={() => onMoveApplication?.(app.id)}>
                    Complete Assessment <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
  
  // Render applications in the Final Review stage
  const renderFinalReviewApplications = () => (
    <div className="space-y-4">
      {applications.map((app) => (
        <Card key={app.id} className="overflow-hidden">
          <CardContent className="p-0">
            <div className="p-4">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center">
                    <div className="font-medium">{app.startupName}</div>
                    <Badge variant="outline" className="ml-2">{app.applicationType}</Badge>
                  </div>
                  <div className="flex items-center text-sm text-muted-foreground mt-1">
                    <span className="mr-4">{app.id}</span>
                    <span className="mr-4">{app.sector}</span>
                    <span>{app.location}</span>
                  </div>
                </div>
                
                <div className="flex items-center">
                  {app.assignedTo && (
                    <div className="flex items-center mr-4">
                      <Avatar className="h-6 w-6 mr-2">
                        <AvatarFallback className="text-xs">
                          {app.assignedTo.split(' ').map((n: string) => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-sm">{app.assignedTo}</span>
                    </div>
                  )}
                  
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem asChild>
                        <Link href={`/admins-new/startups/${app.startupId}`}>
                          <FileText className="mr-2 h-4 w-4" />
                          View Startup
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => showMessage('info', 'Technical score: ' + app.technicalScore + ', Business score: ' + app.businessScore)}>
                        <ClipboardCheck className="mr-2 h-4 w-4" />
                        View Assessment Scores
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => onApprove?.(app.id)}>
                        <CheckCircle className="mr-2 h-4 w-4 text-green-600" />
                        Approve & Certify
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => onReject?.(app.id)}>
                        <XCircle className="mr-2 h-4 w-4 text-red-600" />
                        Reject Application
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
              
              <div className="mt-4 grid grid-cols-2 gap-4">
                <div className="border rounded-md p-3">
                  <div className="text-xs text-muted-foreground mb-1">Technical Assessment</div>
                  <div className="text-xl font-semibold">{app.technicalScore}/100</div>
                  <Progress 
                    value={app.technicalScore} 
                    className="h-2 mt-2" 
                  />
                </div>
                <div className="border rounded-md p-3">
                  <div className="text-xs text-muted-foreground mb-1">Business Assessment</div>
                  <div className="text-xl font-semibold">{app.businessScore}/100</div>
                  <Progress 
                    value={app.businessScore} 
                    className="h-2 mt-2" 
                  />
                </div>
              </div>
              
              <div className="mt-4 p-3 border rounded-md bg-gray-50">
                <div className="text-sm font-medium mb-1">Recommended Action</div>
                <div className="flex items-center">
                  {app.recommendedAction === "Approve" ? (
                    <>
                      <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
                      <span className="text-green-700">Approve certification</span>
                    </>
                  ) : (
                    <>
                      <XCircle className="h-4 w-4 text-red-600 mr-2" />
                      <span className="text-red-700">Reject application</span>
                    </>
                  )}
                </div>
              </div>
              
              <div className="flex justify-end space-x-2 mt-4">
                <Button variant="destructive" onClick={() => onReject?.(app.id)}>
                  <XCircle className="mr-2 h-4 w-4" />
                  Reject
                </Button>
                <Button onClick={() => onApprove?.(app.id)}>
                  <CheckCircle className="mr-2 h-4 w-4" />
                  Approve & Certify
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
  
  // Render applications in the Completed stage
  const renderCompletedApplications = () => (
    <div className="space-y-4">
      {applications.map((app) => (
        <Card key={app.id} className="overflow-hidden">
          <CardContent className="p-0">
            <div className="p-4">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center">
                    <div className="font-medium">{app.startupName}</div>
                    <Badge variant="outline" className="ml-2">{app.applicationType}</Badge>
                    {getStatusBadge(app.status)}
                  </div>
                  <div className="flex items-center text-sm text-muted-foreground mt-1">
                    <span className="mr-4">{app.id}</span>
                    <span className="mr-4">{app.sector}</span>
                    <span>{app.location}</span>
                  </div>
                </div>
                
                <div className="flex items-center">
                  <div className="flex flex-col items-end">
                    <span className="text-sm font-medium">Completed</span>
                    <span className="text-sm text-muted-foreground">
                      {formatDate(app.completionDate)}
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                {app.status === "Approved" ? (
                  <>
                    <div className="border rounded-md p-3 flex items-center bg-green-50">
                      <CheckCircle className="h-10 w-10 text-green-500 mr-3" />
                      <div>
                        <div className="text-sm font-medium text-green-700">Certification Issued</div>
                        <div className="text-xs text-green-600">
                          Certificate ID: {app.certificateId}
                        </div>
                      </div>
                    </div>
                    <div className="border rounded-md p-3">
                      <div className="grid grid-cols-2 gap-2 text-center">
                        <div>
                          <div className="text-xs text-muted-foreground">Technical Score</div>
                          <div className="font-medium">{app.technicalScore}/100</div>
                        </div>
                        <div>
                          <div className="text-xs text-muted-foreground">Business Score</div>
                          <div className="font-medium">{app.businessScore}/100</div>
                        </div>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="border rounded-md p-3 flex items-center bg-red-50 col-span-2">
                    <XCircle className="h-10 w-10 text-red-500 mr-3" />
                    <div>
                      <div className="text-sm font-medium text-red-700">Application Rejected</div>
                      <div className="text-xs text-red-600">
                        Reason: {app.rejectionReason}
                      </div>
                    </div>
                  </div>
                )}
              </div>
              
              <div className="flex justify-end mt-4">
                <Button variant="outline" size="sm" asChild>
                  <Link href={`/admins-new/startups/${app.startupId}`}>
                    <FileText className="mr-2 h-4 w-4" />
                    View Startup
                  </Link>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
  
  return (
    <>
      {renderApplications()}
      
      {/* Document Review Modal */}
      {showDocumentsModalFor && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setShowDocumentsModalFor(null)}>
          <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-2xl" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-medium flex items-center mb-4">
              Document Review
              <Badge className="ml-2">Submitted by startup</Badge>
            </h3>
            
            <div className="mb-4 bg-gray-50 p-3 rounded border">
              <div className="flex items-center text-sm text-muted-foreground">
                <AlertCircle className="h-4 w-4 mr-2 text-amber-500" />
                All documents were submitted by the startup through their application portal. 
                Your job is to verify their authenticity and completeness.
              </div>
            </div>
            
            <div className="space-y-4 mb-6">
              <div className="border rounded-md p-4 bg-white">
                <div className="flex justify-between mb-2">
                  <div className="font-medium">Business Registration Certificate</div>
                  <Badge variant="success">Verified</Badge>
                </div>
                <div className="text-sm text-muted-foreground mb-2">
                  Submitted on: Apr 22, 2025 • File: business_reg_cert.pdf
                </div>
                <div className="bg-gray-50 p-3 rounded text-sm">
                  <p>Reviewer notes: Valid business registration from Ministry of Trade, expires 2027.</p>
                </div>
                <div className="flex justify-end mt-3">
                  <Button size="sm" variant="outline">
                    <FileText className="mr-2 h-4 w-4" />
                    View Document
                  </Button>
                </div>
              </div>
              
              <div className="border rounded-md p-4 bg-white">
                <div className="flex justify-between mb-2">
                  <div className="font-medium">Tax Compliance Certificate</div>
                  <Badge variant="outline">Pending Verification</Badge>
                </div>
                <div className="text-sm text-muted-foreground mb-2">
                  Submitted on: Apr 22, 2025 • File: tax_compliance.pdf
                </div>
                <div className="bg-gray-50 p-3 rounded text-sm mb-3">
                  <textarea 
                    className="w-full min-h-[60px] p-2 text-sm border rounded" 
                    placeholder="Add your verification notes here..."
                  ></textarea>
                </div>
                <div className="flex justify-end space-x-2">
                  <Button size="sm" variant="outline">
                    <FileText className="mr-2 h-4 w-4" />
                    View Document
                  </Button>
                  <Button size="sm" variant="destructive">Reject</Button>
                  <Button size="sm" onClick={() => {
                    showMessage('success', 'Document verified successfully');
                  }}>Verify</Button>
                </div>
              </div>
              
              <div className="border rounded-md p-4 bg-white">
                <div className="flex justify-between mb-2">
                  <div className="font-medium">Business Plan</div>
                  <Badge variant="outline">Pending Verification</Badge>
                </div>
                <div className="text-sm text-muted-foreground mb-2">
                  Submitted on: Apr 22, 2025 • File: business_plan_2025.pdf
                </div>
                <div className="bg-gray-50 p-3 rounded text-sm mb-3">
                  <textarea 
                    className="w-full min-h-[60px] p-2 text-sm border rounded" 
                    placeholder="Add your verification notes here..."
                  ></textarea>
                </div>
                <div className="flex justify-end space-x-2">
                  <Button size="sm" variant="outline">
                    <FileText className="mr-2 h-4 w-4" />
                    View Document
                  </Button>
                  <Button size="sm" variant="destructive">Reject</Button>
                  <Button size="sm" onClick={() => {
                    showMessage('success', 'Document verified successfully');
                  }}>Verify</Button>
                </div>
              </div>
              
              <div className="border rounded-md p-4 bg-white">
                <div className="flex justify-between mb-2">
                  <div className="font-medium">Founder&apos;s CV</div>
                  <Badge variant="outline">Pending Verification</Badge>
                </div>
                <div className="text-sm text-muted-foreground mb-2">
                  Submitted on: Apr 22, 2025 • File: ceo_cv.pdf
                </div>
                <div className="bg-gray-50 p-3 rounded text-sm mb-3">
                  <textarea 
                    className="w-full min-h-[60px] p-2 text-sm border rounded" 
                    placeholder="Add your verification notes here..."
                  ></textarea>
                </div>
                <div className="flex justify-end space-x-2">
                  <Button size="sm" variant="outline">
                    <FileText className="mr-2 h-4 w-4" />
                    View Document
                  </Button>
                  <Button size="sm" variant="destructive">Reject</Button>
                  <Button size="sm" onClick={() => {
                    showMessage('success', 'Document verified successfully');
                  }}>Verify</Button>
                </div>
              </div>
            </div>
            
            <div className="flex justify-between">
              <Button variant="outline" onClick={() => setShowDocumentsModalFor(null)}>Close</Button>
              <Button onClick={() => {
                onMoveApplication?.(showDocumentsModalFor);
                setShowDocumentsModalFor(null);
                showMessage('success', 'All documents reviewed and application moved to next stage');
              }}>
                Complete Document Review
              </Button>
            </div>
          </div>
        </div>
      )}
      
      {/* Edit Application Modal */}
      {showEditModalFor && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setShowEditModalFor(null)}>
          <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-medium mb-4">Edit Application</h3>
            
            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-sm font-medium mb-1">Application ID</label>
                <Input value={applications.find(a => a.id === showEditModalFor)?.id || ''} disabled />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Startup Name</label>
                <Input defaultValue={applications.find(a => a.id === showEditModalFor)?.startupName || ''} />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Application Type</label>
                <Select defaultValue={applications.find(a => a.id === showEditModalFor)?.applicationType || ''}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select certification level" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Level 1 Certification">Level 1 Certification</SelectItem>
                    <SelectItem value="Level 2 Certification">Level 2 Certification</SelectItem>
                    <SelectItem value="Level 3 Certification">Level 3 Certification</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Sector</label>
                <Input defaultValue={applications.find(a => a.id === showEditModalFor)?.sector || ''} />
              </div>
            </div>
            
            <div className="flex justify-between">
              <Button variant="outline" onClick={() => setShowEditModalFor(null)}>Cancel</Button>
              <Button onClick={() => {
                showMessage('success', 'Application updated successfully');
                setTimeout(() => setShowEditModalFor(null), 1000);
              }}>
                Save Changes
              </Button>
            </div>
          </div>
        </div>
      )}
      
      {/* Success/Info Message */}
      {messageInfo && (
        <div className={`fixed bottom-4 right-4 ${messageInfo.type === 'success' ? 'bg-green-100 border-green-400 text-green-700' : 'bg-blue-100 border-blue-400 text-blue-700'} px-4 py-3 rounded shadow-md z-50 border`}>
          <span className="flex items-center">
            {messageInfo.type === 'success' ? (
              <CheckCircle className="h-5 w-5 mr-2" />
            ) : (
              <AlertCircle className="h-5 w-5 mr-2" />
            )}
            {messageInfo.text}
          </span>
        </div>
      )}
    </>
  );
}
