import React from 'react';
import { 
  File, 
  FileText, 
  FilePlus, 
  Download, 
  CheckCircle, 
  AlertCircle, 
  Clock, 
  Eye,
  Calendar
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

type DocumentsSectionProps = {
  startup: any; // In a real app, we would define a proper type
};

export function DocumentsSection({ startup }: DocumentsSectionProps) {
  // Function to get the appropriate status badge for a document
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Verified":
        return <Badge variant="success" className="ml-auto">Verified</Badge>;
      case "Approved":
        return <Badge variant="success" className="ml-auto">Approved</Badge>;
      case "Reviewed":
        return <Badge variant="warning" className="ml-auto">Reviewed</Badge>;
      case "Pending":
        return <Badge variant="outline" className="ml-auto">Pending</Badge>;
      case "Rejected":
        return <Badge variant="destructive" className="ml-auto">Rejected</Badge>;
      default:
        return <Badge variant="outline" className="ml-auto">Unknown</Badge>;
    }
  };

  // Function to get the appropriate icon for a document type
  const getDocumentIcon = (type: string) => {
    switch (type) {
      case "Legal":
        return <FileText className="h-5 w-5 text-blue-500" />;
      case "Financial":
        return <FileText className="h-5 w-5 text-green-500" />;
      case "Certification":
        return <FileText className="h-5 w-5 text-amber-500" />;
      case "Business":
        return <FileText className="h-5 w-5 text-purple-500" />;
      default:
        return <File className="h-5 w-5 text-gray-500" />;
    }
  };

  // Group documents by type if they exist
  const documentTypes = startup.documents
    ? Array.from(new Set(startup.documents.map((doc: any) => doc.type)))
    : [];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Documentation</CardTitle>
          <Button size="sm">
            <FilePlus className="h-4 w-4 mr-2" />
            Upload Document
          </Button>
        </CardHeader>
        <CardContent>
          {!startup.documents || startup.documents.length === 0 ? (
            <div className="text-center p-6">
              <File className="h-10 w-10 text-muted-foreground mx-auto mb-3 opacity-40" />
              <h3 className="font-medium mb-1">No Documents Available</h3>
              <p className="text-sm text-muted-foreground">
                No documents have been uploaded for this startup yet.
              </p>
              <Button className="mt-4" variant="outline" size="sm">
                <FilePlus className="h-4 w-4 mr-2" />
                Upload First Document
              </Button>
            </div>
          ) : (
            <Tabs defaultValue="all" className="space-y-4">
              <TabsList className="grid grid-cols-4 mb-4">
                <TabsTrigger value="all">All Documents</TabsTrigger>
                <TabsTrigger value="legal">Legal</TabsTrigger>
                <TabsTrigger value="certification">Certification</TabsTrigger>
                <TabsTrigger value="financial">Financial</TabsTrigger>
              </TabsList>

              {/* All Documents Tab */}
              <TabsContent value="all" className="m-0">
                <div className="space-y-4">
                  {documentTypes.map((type: string) => (
                    <div key={type} className="space-y-3">
                      <h3 className="text-sm font-medium">{type} Documents</h3>
                      
                      <div className="space-y-2">
                        {startup.documents
                          .filter((doc: any) => doc.type === type)
                          .map((doc: any, index: number) => (
                            <div 
                              key={index} 
                              className="flex items-center p-3 rounded-md border hover:bg-gray-50 transition-colors"
                            >
                              {getDocumentIcon(doc.type)}
                              
                              <div className="ml-3 flex-1">
                                <div className="font-medium text-sm">{doc.name}</div>
                                <div className="flex items-center text-xs text-muted-foreground mt-1">
                                  <Calendar className="h-3 w-3 mr-1" />
                                  {doc.date}
                                </div>
                              </div>
                              
                              {getStatusBadge(doc.status)}
                              
                              <div className="flex ml-4">
                                <Button variant="ghost" size="icon" className="h-8 w-8">
                                  <Eye className="h-4 w-4" />
                                </Button>
                                <Button variant="ghost" size="icon" className="h-8 w-8">
                                  <Download className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                          ))}
                      </div>
                    </div>
                  ))}
                </div>
              </TabsContent>
              
              {/* Legal Documents Tab */}
              <TabsContent value="legal" className="m-0">
                <div className="space-y-2">
                  {startup.documents
                    .filter((doc: any) => doc.type === "Legal")
                    .map((doc: any, index: number) => (
                      <div 
                        key={index} 
                        className="flex items-center p-3 rounded-md border hover:bg-gray-50 transition-colors"
                      >
                        <FileText className="h-5 w-5 text-blue-500" />
                        
                        <div className="ml-3 flex-1">
                          <div className="font-medium text-sm">{doc.name}</div>
                          <div className="flex items-center text-xs text-muted-foreground mt-1">
                            <Calendar className="h-3 w-3 mr-1" />
                            {doc.date}
                          </div>
                        </div>
                        
                        {getStatusBadge(doc.status)}
                        
                        <div className="flex ml-4">
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <Download className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                </div>
              </TabsContent>
              
              {/* Certification Documents Tab */}
              <TabsContent value="certification" className="m-0">
                <div className="space-y-2">
                  {startup.documents
                    .filter((doc: any) => doc.type === "Certification")
                    .map((doc: any, index: number) => (
                      <div 
                        key={index} 
                        className="flex items-center p-3 rounded-md border hover:bg-gray-50 transition-colors"
                      >
                        <FileText className="h-5 w-5 text-amber-500" />
                        
                        <div className="ml-3 flex-1">
                          <div className="font-medium text-sm">{doc.name}</div>
                          <div className="flex items-center text-xs text-muted-foreground mt-1">
                            <Calendar className="h-3 w-3 mr-1" />
                            {doc.date}
                          </div>
                        </div>
                        
                        {getStatusBadge(doc.status)}
                        
                        <div className="flex ml-4">
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <Download className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                </div>
              </TabsContent>
              
              {/* Financial Documents Tab */}
              <TabsContent value="financial" className="m-0">
                <div className="space-y-2">
                  {startup.documents
                    .filter((doc: any) => doc.type === "Financial")
                    .map((doc: any, index: number) => (
                      <div 
                        key={index} 
                        className="flex items-center p-3 rounded-md border hover:bg-gray-50 transition-colors"
                      >
                        <FileText className="h-5 w-5 text-green-500" />
                        
                        <div className="ml-3 flex-1">
                          <div className="font-medium text-sm">{doc.name}</div>
                          <div className="flex items-center text-xs text-muted-foreground mt-1">
                            <Calendar className="h-3 w-3 mr-1" />
                            {doc.date}
                          </div>
                        </div>
                        
                        {getStatusBadge(doc.status)}
                        
                        <div className="flex ml-4">
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <Download className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                </div>
              </TabsContent>
            </Tabs>
          )}
        </CardContent>
      </Card>
      
      {/* Required Documents Checklist */}
      <Card>
        <CardHeader>
          <CardTitle>Certification Document Requirements</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              The following documents are required for {startup.certification?.level || "Level 1"} certification:
            </p>
            
            <div className="space-y-2">
              {[
                { name: "Business Registration Certificate", status: "Verified" },
                { name: "Tax Compliance Certificate", status: "Verified" },
                { name: "Financial Statements (Last 2 Years)", status: startup.documents?.some((d: any) => d.name.includes("Financial") || d.name.includes("Audit")) ? "Verified" : "Missing" },
                { name: "Business Plan / Strategy", status: startup.documents?.some((d: any) => d.name.includes("Business Plan")) ? "Verified" : "Missing" },
                { name: "Proof of Employment (Local Jobs)", status: "Pending" },
                { name: "Intellectual Property Documentation", status: "N/A" },
              ].map((req, index) => (
                <div key={index} className="flex items-center">
                  {req.status === "Verified" ? (
                    <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                  ) : req.status === "Pending" ? (
                    <Clock className="h-4 w-4 text-amber-500 mr-2" />
                  ) : req.status === "Missing" ? (
                    <AlertCircle className="h-4 w-4 text-red-500 mr-2" />
                  ) : (
                    <AlertCircle className="h-4 w-4 text-gray-300 mr-2" />
                  )}
                  
                  <span className="text-sm">{req.name}</span>
                  
                  {req.status === "Verified" ? (
                    <Badge variant="outline" className="ml-auto text-green-600 border-green-200 bg-green-50">Verified</Badge>
                  ) : req.status === "Pending" ? (
                    <Badge variant="outline" className="ml-auto text-amber-600 border-amber-200 bg-amber-50">Pending</Badge>
                  ) : req.status === "Missing" ? (
                    <Badge variant="outline" className="ml-auto text-red-600 border-red-200 bg-red-50">Missing</Badge>
                  ) : (
                    <Badge variant="outline" className="ml-auto text-gray-500 border-gray-200">Not Required</Badge>
                  )}
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
