import React, { useState } from 'react';
import Link from 'next/link';
import { 
  CheckCircle, 
  XCircle, 
  AlertCircle, 
  FileText,
  Edit,
  MoreHorizontal,
  ChevronRight
} from 'lucide-react';

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";

// Interface for an application object
export interface ApplicationType {
  id: string;
  name: string;
  type: string;
  location: string;
  submittedDate: string;
  status: 'pending' | 'certified' | 'rejected';
  notes: string;
  documents: {
    id: string;
    name: string;
    status: 'pending' | 'verified' | 'rejected';
  }[];
  assessments: {
    infrastructure: { score: number; notes: string };
    services: { score: number; notes: string };
    impact: { score: number; notes: string };
    sustainability: { score: number; notes: string };
  };
}

// Props for the BaseApplications component
interface BaseApplicationsProps {
  applications: ApplicationType[];
  onMoveApplication?: (applicationId: string) => void;
  actionButtonText?: string;
  actionButtonIcon?: React.ReactNode;
  emptyStateMessage?: string;
}

// Base component for displaying applications in any stage
export default function BaseApplications({
  applications,
  onMoveApplication,
  actionButtonText = "Move to Next Stage",
  actionButtonIcon = <ChevronRight className="ml-2 h-4 w-4" />,
  emptyStateMessage = "No applications in this stage"
}: BaseApplicationsProps) {
  // State for toast message
  const [message, setMessage] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null);
  
  // Function to show toast message
  const showMessage = (type: 'success' | 'error' | 'info', text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 3000);
  };

  // Format date 
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric'
    }).format(date);
  };
  
  // Calculate days pending
  const getDaysPending = (dateString: string) => {
    const submitted = new Date(dateString);
    const today = new Date();
    const diffTime = Math.abs(today.getTime() - submitted.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  return (
    <>
      {applications.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-10">
            <AlertCircle className="h-12 w-12 text-muted-foreground mb-3" />
            <p className="text-muted-foreground">{emptyStateMessage}</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {applications.map((application) => (
            <Card key={application.id} className="overflow-hidden">
              <CardContent className="p-0">
                <div className="grid md:grid-cols-4 border-b">
                  {/* Application info */}
                  <div className="p-4 md:border-r">
                    <div className="flex items-center">
                      <Avatar className="h-10 w-10 mr-3">
                        <AvatarFallback className="bg-primary/10 text-primary font-medium">
                          {application.name.substring(0, 2)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <h3 className="font-medium">{application.name}</h3>
                        <div className="text-sm text-muted-foreground">{application.id}</div>
                      </div>
                    </div>
                    
                    <div className="mt-3 space-y-1 text-sm">
                      <div>
                        <span className="text-muted-foreground">Type:</span> {application.type}
                      </div>
                      <div>
                        <span className="text-muted-foreground">Location:</span> {application.location}
                      </div>
                    </div>
                  </div>
                  
                  {/* Status and timeline */}
                  <div className="p-4 md:border-r bg-gray-50">
                    <h4 className="text-sm font-medium mb-2">Application Status</h4>
                    <div className="flex items-center mb-3">
                      {application.status === 'certified' ? (
                        <Badge className="bg-green-100 text-green-800 hover:bg-green-200">Certified</Badge>
                      ) : application.status === 'rejected' ? (
                        <Badge className="bg-red-100 text-red-800 hover:bg-red-200">Rejected</Badge>
                      ) : (
                        <Badge variant="secondary">Pending</Badge>
                      )}
                    </div>
                    
                    <div className="text-xs text-muted-foreground">
                      <div className="flex items-center mb-1">
                        <FileText className="h-3.5 w-3.5 mr-1 text-muted-foreground" />
                        Submitted: {formatDate(application.submittedDate)}
                      </div>
                      <div>Days in system: {getDaysPending(application.submittedDate)}</div>
                    </div>
                  </div>
                  
                  {/* Documents section */}
                  <div className="p-4 md:border-r">
                    <h4 className="text-sm font-medium mb-2">Documents</h4>
                    <div className="space-y-1.5">
                      {application.documents.map(doc => (
                        <div key={doc.id} className="flex items-center text-sm">
                          {doc.status === 'verified' ? (
                            <CheckCircle className="h-3.5 w-3.5 mr-1.5 text-green-600" />
                          ) : (
                            <AlertCircle className="h-3.5 w-3.5 mr-1.5 text-amber-500" />
                          )}
                          <span className={doc.status === 'verified' ? 'text-gray-700' : 'text-muted-foreground'}>
                            {doc.name}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  {/* Actions section */}
                  <div className="p-4 flex flex-col justify-between">
                    <div className="flex justify-end">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <Link href={`/admins-new/ecosystem/${application.id}`} passHref legacyBehavior>
                            <DropdownMenuItem className="cursor-pointer">
                              <FileText className="mr-2 h-4 w-4" />
                              View Details
                            </DropdownMenuItem>
                          </Link>
                          <DropdownMenuItem className="cursor-pointer">
                            <Edit className="mr-2 h-4 w-4" />
                            Edit Application
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                    
                    <div className="mt-auto">
                      {onMoveApplication && (
                        <Button 
                          onClick={() => {
                            onMoveApplication(application.id);
                            showMessage('success', 'Application moved to next stage');
                          }}
                          className="w-full"
                        >
                          {actionButtonText}
                          {actionButtonIcon}
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
      
      {/* Toast message */}
      {message && (
        <div className={`
          fixed bottom-4 right-4 px-4 py-3 rounded shadow-md z-50
          ${message.type === 'success' ? 'bg-green-100 border border-green-400 text-green-700' : 
            message.type === 'error' ? 'bg-red-100 border border-red-400 text-red-700' :
            'bg-blue-100 border border-blue-400 text-blue-700'}
        `}>
          <span className="flex items-center">
            {message.type === 'success' && <CheckCircle className="h-5 w-5 mr-2" />}
            {message.type === 'error' && <XCircle className="h-5 w-5 mr-2" />}
            {message.type === 'info' && <AlertCircle className="h-5 w-5 mr-2" />}
            {message.text}
          </span>
        </div>
      )}
    </>
  );
}
