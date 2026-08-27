import React, { useState } from 'react';
import BaseApplications, { ApplicationType } from './base-applications';
import { FileText, CheckCircle, AlertCircle } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface DocumentationReviewProps {
  applications: ApplicationType[];
  stage: string;
  onMoveApplication: (applicationId: string) => void;
  onCompleteReview: (applicationId: string, documentStatuses: any) => void;
}

export default function DocumentationReview({ 
  applications, 
  stage, 
  onMoveApplication,
  onCompleteReview
}: DocumentationReviewProps) {
  const [selectedApp, setSelectedApp] = useState<string | null>(null);
  const [documentStatuses, setDocumentStatuses] = useState<any>({});
  const [message, setMessage] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null);
  
  const showMessage = (type: 'success' | 'error' | 'info', text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 3000);
  };
  
  const handleOpenDocumentReview = (applicationId: string) => {
    const app = applications.find(a => a.id === applicationId);
    if (app) {
      setDocumentStatuses(app.documents);
      setSelectedApp(applicationId);
    }
  };
  
  const handleVerifyDocument = (docId: string) => {
    setDocumentStatuses(prev => 
      prev.map(doc => doc.id === docId ? { ...doc, status: 'verified' } : doc)
    );
  };
  
  const handleRejectDocument = (docId: string) => {
    setDocumentStatuses(prev => 
      prev.map(doc => doc.id === docId ? { ...doc, status: 'rejected' } : doc)
    );
  };
  
  const handleCompleteReview = () => {
    if (selectedApp) {
      onCompleteReview(selectedApp, documentStatuses);
      setSelectedApp(null);
      showMessage('success', 'Document review completed');
    }
  };
  
  return (
    <>
      <BaseApplications
        applications={applications}
        stage={stage}
        onMoveApplication={(appId) => handleOpenDocumentReview(appId)}
        actionButtonText="Review Documents"
        actionButtonIcon={<FileText className="ml-2 h-4 w-4" />}
        emptyStateMessage="No applications pending document review"
      />
      
      {/* Document Review Dialog */}
      {selectedApp && (
        <Dialog open={Boolean(selectedApp)} onOpenChange={() => setSelectedApp(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Document Review</DialogTitle>
              <DialogDescription>
                Verify the required documents for this ecosystem builder
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4 my-4">
              {documentStatuses.map(doc => (
                <div key={doc.id} className="border rounded-md p-4 bg-white">
                  <div className="flex justify-between mb-2">
                    <div className="font-medium">{doc.name}</div>
                    <Badge variant={doc.status === 'verified' ? 'success' : doc.status === 'rejected' ? 'destructive' : 'outline'}>
                      {doc.status === 'verified' ? 'Verified' : doc.status === 'rejected' ? 'Rejected' : 'Pending Verification'}
                    </Badge>
                  </div>
                  
                  <div className="text-sm text-muted-foreground mb-2">
                    Document ID: {doc.id}
                  </div>
                  
                  <div className="flex justify-end space-x-2 mt-3">
                    <Button size="sm" variant="outline">
                      <FileText className="mr-2 h-4 w-4" />
                      View Document
                    </Button>
                    <Button 
                      size="sm" 
                      variant="destructive"
                      onClick={() => handleRejectDocument(doc.id)}
                    >
                      Reject
                    </Button>
                    <Button 
                      size="sm"
                      onClick={() => handleVerifyDocument(doc.id)}
                    >
                      Verify
                    </Button>
                  </div>
                </div>
              ))}
            </div>
            
            <DialogFooter>
              <Button variant="outline" onClick={() => setSelectedApp(null)}>Cancel</Button>
              <Button onClick={handleCompleteReview}>
                Complete Document Review
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
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
            {message.type === 'error' && <AlertCircle className="h-5 w-5 mr-2" />}
            {message.type === 'info' && <AlertCircle className="h-5 w-5 mr-2" />}
            {message.text}
          </span>
        </div>
      )}
    </>
  );
}
