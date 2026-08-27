"use client";

import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { 
  FileCheck, 
  Download, 
  Maximize2, 
  Minimize2, 
  FileText, 
  AlertCircle, 
  Award, 
  Share2 
} from "lucide-react";
import { toast } from "sonner";

interface DocumentViewerProps {
  application: any;
  activeTab: string;
  setActiveTab: (val: string) => void;
  isFullscreen: boolean;
  setIsFullscreen: (val: boolean) => void;
  pdfError: { [key: string]: boolean };
  handlePdfError: (type: string) => void;
  isTabLoading: boolean;
}

export function DocumentViewer({
  application,
  activeTab,
  setActiveTab,
  isFullscreen,
  setIsFullscreen,
  pdfError,
  handlePdfError,
  isTabLoading
}: DocumentViewerProps) {
  if (!application) return null;

  return (
    <div className="space-y-6">
      <Card className={`overflow-hidden border-none shadow-xl transition-all duration-300 ${isFullscreen ? 'fixed inset-4 z-50 m-0' : ''}`}>
        <CardContent className="p-0">
          <Tabs defaultValue="business" value={activeTab} onValueChange={setActiveTab}>
            <div className="px-6 py-4 bg-slate-900 border-b flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <FileCheck className="h-5 w-5 text-blue-400" />
                <div>
                  <h3 className="text-white font-semibold flex items-center gap-2">
                    Supporting Documents
                    <Badge variant="outline" className="text-[10px] text-blue-300 border-blue-800 uppercase tracking-wider">SECURE</Badge>
                  </h3>
                  <p className="text-xs text-slate-400">Verified certification documents</p>
                </div>
              </div>

              <div className="flex items-center gap-3 bg-slate-800/50 p-1.5 rounded-xl border border-slate-700">
                <TabsList className="bg-transparent border-none">
                  <TabsTrigger value="business" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white text-slate-300 h-8 text-xs">
                    Business License
                  </TabsTrigger>
                  <TabsTrigger value="tax" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white text-slate-300 h-8 text-xs">
                    Tax Registration
                  </TabsTrigger>
                  {application.certificate && (
                    <TabsTrigger value="certificate" className="data-[state=active]:bg-green-600 data-[state=active]:text-white text-slate-300 h-8 text-xs">
                      Certificate
                    </TabsTrigger>
                  )}
                </TabsList>
                <Separator orientation="vertical" className="h-6 bg-slate-700" />
                <div className="flex gap-1.5 px-1">
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-8 w-8 text-slate-400 hover:text-white hover:bg-slate-700"
                    onClick={() => {
                      let fileUrl = "";
                      if (activeTab === 'business') fileUrl = `/api/files/${application.businessLicenseFileId}/download`;
                      else if (activeTab === 'tax') fileUrl = `/api/files/${application.taxRegistrationFileId}/download`;
                      else if (activeTab === 'certificate') fileUrl = `/api/certificates/${application.certificate?.id}/download`;

                      if (fileUrl) window.open(fileUrl, '_blank');
                    }}
                    disabled={
                      activeTab === 'business' ? !application.businessLicenseFileId :
                        activeTab === 'tax' ? !application.taxRegistrationFileId :
                          activeTab === 'certificate' ? !application.certificate : true
                    }
                  >
                    <Download className="h-4 w-4" />
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-8 w-8 text-slate-400 hover:text-white hover:bg-slate-700"
                    onClick={() => setIsFullscreen(!isFullscreen)}
                  >
                    {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
                  </Button>
                </div>
              </div>
            </div>

            <TabsContent value="business" className="m-0">
              {isTabLoading ? (
                <div className="flex flex-col items-center justify-center min-h-[600px] h-[calc(100vh-300px)] bg-slate-50 gap-4">
                  <div className="w-12 h-12 border-4 border-slate-200 border-t-blue-600 rounded-full animate-spin"></div>
                  <p className="text-sm text-slate-500 animate-pulse font-medium">Preparing Business License...</p>
                </div>
              ) : application.businessLicenseFileId ? (
                <div className="bg-slate-100 p-4">
                  <div className="bg-white rounded-lg shadow-inner overflow-hidden border border-slate-200">
                    {pdfError.business ? (
                      <div className="flex flex-col items-center justify-center h-[650px] bg-slate-50">
                        <AlertCircle className="h-12 w-12 text-amber-500 mb-4" />
                        <p className="text-lg font-medium text-slate-700">PDF Preview Unavailable</p>
                        <p className="text-sm text-slate-500 mb-6">You can still download the file to view it offline</p>
                        <Button
                          onClick={() => window.open(`/api/files/${application.businessLicenseFileId}/download`, '_blank')}
                          className="bg-blue-600 hover:bg-blue-700"
                        >
                          <Download className="h-4 w-4 mr-2" />
                          Download Business License
                        </Button>
                      </div>
                    ) : (
                      <iframe
                        src={`/api/files/${application.businessLicenseFileId}/download?inline=true`}
                        className="w-full h-[650px] border-none"
                        title="Business License Viewer"
                        onError={() => handlePdfError('business')}
                      />
                    )}
                  </div>
                  <div className="mt-4 px-2 flex items-center justify-between text-sm text-slate-600">
                    <div className="flex items-center gap-3">
                      <div className="bg-blue-100 p-2 rounded-lg">
                        <FileText className="h-5 w-5 text-blue-600" />
                      </div>
                      <div className="flex flex-col">
                        <span className="font-semibold text-slate-900">{application.businessLicenseFileName || 'Business License Document'}</span>
                        <span className="text-[10px] text-slate-500 uppercase font-bold tracking-tight">Status: SECURE & VERIFIED</span>
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-primary border-primary/20 hover:bg-primary/5 gap-2"
                      onClick={() => window.open(`/api/files/${application.businessLicenseFileId}/download`, '_blank')}
                    >
                      <Download className="h-4 w-4" />
                      Download
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center min-h-[400px] h-[calc(100vh-400px)] bg-slate-50 text-slate-500 gap-4">
                  <FileText className="h-16 w-16 opacity-20" />
                  <p className="text-lg font-medium">No Document Available</p>
                  <p className="text-sm">Business license document has not been uploaded.</p>
                </div>
              )}
            </TabsContent>

            <TabsContent value="tax" className="m-0">
              {isTabLoading ? (
                <div className="flex flex-col items-center justify-center min-h-[600px] h-[calc(100vh-300px)] bg-slate-50 gap-4">
                  <div className="w-12 h-12 border-4 border-slate-200 border-t-blue-600 rounded-full animate-spin"></div>
                  <p className="text-sm text-slate-500 animate-pulse font-medium">Preparing Tax Registration...</p>
                </div>
              ) : application.taxRegistrationFileId ? (
                <div className="bg-slate-100 p-4">
                  <div className="bg-white rounded-lg shadow-inner overflow-hidden border border-slate-200">
                    {pdfError.tax ? (
                      <div className="flex flex-col items-center justify-center h-[650px] bg-slate-50">
                        <AlertCircle className="h-12 w-12 text-amber-500 mb-4" />
                        <p className="text-lg font-medium text-slate-700">PDF Preview Unavailable</p>
                        <p className="text-sm text-slate-500 mb-6">You can still download the file to view it offline</p>
                        <Button
                          onClick={() => window.open(`/api/files/${application.taxRegistrationFileId}/download`, '_blank')}
                          className="bg-blue-600 hover:bg-blue-700"
                        >
                          <Download className="h-4 w-4 mr-2" />
                          Download Tax Document
                        </Button>
                      </div>
                    ) : (
                      <iframe
                        src={`/api/files/${application.taxRegistrationFileId}/download?inline=true`}
                        className="w-full h-[650px] border-none"
                        title="Tax Registration Viewer"
                        onError={() => handlePdfError('tax')}
                      />
                    )}
                  </div>
                  <div className="mt-4 px-2 flex items-center justify-between text-sm text-slate-600">
                    <div className="flex items-center gap-3">
                      <div className="bg-blue-100 p-2 rounded-lg">
                        <FileText className="h-5 w-5 text-blue-600" />
                      </div>
                      <div className="flex flex-col">
                        <span className="font-semibold text-slate-900">{application.taxRegistrationFileName || 'Tax Registration Document'}</span>
                        <span className="text-[10px] text-slate-500 uppercase font-bold tracking-tight">Status: SECURE & VERIFIED</span>
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-primary border-primary/20 hover:bg-primary/5 gap-2"
                      onClick={() => window.open(`/api/files/${application.taxRegistrationFileId}/download`, '_blank')}
                    >
                      <Download className="h-4 w-4" />
                      Download
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center min-h-[400px] h-[calc(100vh-400px)] bg-slate-50 text-slate-500 gap-4">
                  <FileText className="h-16 w-16 opacity-20" />
                  <p className="text-lg font-medium">No Document Available</p>
                  <p className="text-sm">Tax registration document has not been uploaded.</p>
                </div>
              )}
            </TabsContent>

            <TabsContent value="certificate" className="m-0">
              {isTabLoading ? (
                <div className="flex flex-col items-center justify-center min-h-[600px] h-[calc(100vh-300px)] bg-slate-50 gap-4">
                  <div className="w-12 h-12 border-4 border-slate-200 border-t-blue-600 rounded-full animate-spin"></div>
                  <p className="text-sm text-slate-500 animate-pulse font-medium">Preparing Official Credential...</p>
                </div>
              ) : application.certificate ? (
                <div className="bg-slate-900 overflow-hidden">
                  <div className="flex items-center justify-between p-4 bg-slate-950/50 border-b border-white/5">
                    <div className="flex items-center gap-3">
                      <div className="bg-blue-500/10 p-2 rounded-lg">
                        <Award className="h-5 w-5 text-blue-500" />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-xs font-bold text-white uppercase tracking-widest">Official Ecosystem Certificate</span>
                        <span className="text-[10px] text-blue-500 font-black uppercase tracking-tighter">Verified • Digital Identifier: {application.certificate.certificateNumber || 'N/A'}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-slate-400 hover:text-white hover:bg-white/10 h-8 gap-2 uppercase text-[10px] font-bold tracking-widest"
                        onClick={() => window.open(`/api/certificates/${application.certificate?.id}/download?inline=true`, '_blank')}
                      >
                        <Maximize2 className="h-3.5 w-3.5" />
                        Full View
                      </Button>
                      <Separator orientation="vertical" className="h-4 bg-white/10 mx-1" />
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-blue-500 hover:text-blue-400 hover:bg-blue-500/10 h-8 gap-2 uppercase text-[10px] font-bold tracking-widest"
                        onClick={() => window.open(`/api/certificates/${application.certificate?.id}/download`, '_blank')}
                      >
                        <Download className="h-3.5 w-3.5" />
                        Download Original
                      </Button>
                    </div>
                  </div>

                  <div className="relative group">
                    <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/40 to-transparent pointer-events-none z-10" />
                    <iframe
                      src={`/api/certificates/${application.certificate.id}/download?inline=true`}
                      className="w-full h-[700px] border-none"
                      title="Certificate Viewer"
                    />
                  </div>

                  <div className="bg-slate-950 p-4 border-t border-white/5 flex flex-wrap gap-4 items-center justify-between">
                    <div className="flex items-center gap-6">
                      <div className="flex flex-col gap-0.5">
                        <span className="text-[9px] text-slate-500 uppercase tracking-widest font-bold font-mono">Blockchain Hash</span>
                        <span className="text-[10px] text-white font-mono opacity-60">{application.certificate.id.slice(0, 24)}...</span>
                      </div>
                      <div className="flex flex-col gap-0.5">
                        <span className="text-[9px] text-slate-500 uppercase tracking-widest font-bold font-mono">Status</span>
                        <span className="text-[10px] text-blue-400 font-bold uppercase tracking-widest flex items-center gap-1.5 leading-none">
                          <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
                          Authenticated
                        </span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="secondary"
                        size="sm"
                        className="h-8 gap-2 bg-white/10 hover:bg-white/20 text-white border-none text-[10px] font-bold tracking-widest uppercase"
                        onClick={() => {
                          if (application.certificate?.id) {
                            const url = `${window.location.origin}/eco-certificate/${application.certificate.id}`;
                            navigator.clipboard.writeText(url);
                            toast.success("Verification link copied!");
                          }
                        }}
                      >
                        <Share2 className="h-3.5 w-3.5 text-primary" />
                        Share Verified Link
                      </Button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center min-h-[500px] h-[calc(100vh-300px)] bg-slate-50 text-slate-500 gap-4">
                  <div className="bg-white p-8 rounded-full shadow-inner ring-4 ring-slate-100/50">
                    <Award className="h-20 w-20 opacity-10 text-slate-400" />
                  </div>
                  <p className="text-xl font-black text-slate-400 uppercase tracking-tighter">Credential Pending</p>
                  <p className="text-sm max-w-xs text-center leading-relaxed">The official national certificate record is being finalized by the administration.</p>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
