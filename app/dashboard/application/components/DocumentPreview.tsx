"use client";

import React, { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import {
  FileText,
  Download,
  Maximize2,
  Minimize2,
  AlertCircle,
  FileCheck,
  Eye,
  Award,
  Share2
} from "lucide-react";

interface DocumentPreviewProps {
  documents: {
    id: string;
    label: string;
    fileId: string | null;
    fileName?: string | null;
    url?: string | null;
  }[];
}

export function DocumentPreview({ documents }: DocumentPreviewProps) {
  const [activeTab, setActiveTab] = useState(documents[0]?.id || "");
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [pdfError, setPdfError] = useState<Record<string, boolean>>({});
  const [isTabLoading, setIsTabLoading] = useState(false);

  const activeDoc = documents.find((doc) => doc.id === activeTab);

  useEffect(() => {
    if (activeTab) {
      setIsTabLoading(true);
      const timer = setTimeout(() => setIsTabLoading(false), 500);
      return () => clearTimeout(timer);
    }
  }, [activeTab]);

  const handlePdfError = (id: string) => {
    setPdfError((prev) => ({ ...prev, [id]: true }));
  };

  if (documents.length === 0) return null;

  return (
    <Card
      className={`overflow-hidden border-none shadow-xl transition-all duration-300 ${
        isFullscreen ? "fixed inset-4 z-50 m-0" : ""
      }`}
    >
      <CardContent className="p-0">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <div className="px-6 py-4 bg-slate-900 border-b flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <FileCheck className="h-5 w-5 text-green-400" />
              <div>
                <h3 className="text-white font-semibold flex items-center gap-2">
                  Supporting Documents
                  <Badge
                    variant="outline"
                    className="text-[10px] text-green-300 border-green-800 uppercase tracking-wider"
                  >
                    SECURE
                  </Badge>
                </h3>
                <p className="text-xs text-slate-400">
                  Verified application documents
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 bg-slate-800/50 p-1.5 rounded-xl border border-slate-700">
              <TabsList className="bg-transparent border-none">
                {documents.map((doc) => (
                  <TabsTrigger
                    key={doc.id}
                    value={doc.id}
                    className={`data-[state=active]:bg-green-600 data-[state=active]:text-white text-slate-300 h-8 text-xs ${doc.id === "certificate" ? "data-[state=active]:bg-blue-600" : ""}`}
                    disabled={!(doc.fileId || doc.url)}
                  >
                    {doc.label}
                  </TabsTrigger>
                ))}
              </TabsList>
              <Separator orientation="vertical" className="h-6 bg-slate-700" />
              <div className="flex gap-1.5 px-1">
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-8 w-8 text-slate-400 hover:text-white hover:bg-slate-700"
                  onClick={() => {
                    if (activeDoc?.url || activeDoc?.fileId) {
                      const dlUrl = activeDoc.url || `/api/files/${activeDoc.fileId}/download`;
                      window.open(dlUrl, "_blank");
                    }
                  }}
                  disabled={!(activeDoc?.url || activeDoc?.fileId)}
                >
                  <Download className="h-4 w-4" />
                </Button>
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-8 w-8 text-slate-400 hover:text-white hover:bg-slate-700"
                  onClick={() => setIsFullscreen(!isFullscreen)}
                >
                  {isFullscreen ? (
                    <Minimize2 className="h-4 w-4" />
                  ) : (
                    <Maximize2 className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>
          </div>

          {documents.map((doc) => (
            <TabsContent key={doc.id} value={doc.id} className="m-0">
              {isTabLoading ? (
                <div className="flex flex-col items-center justify-center h-[600px] bg-slate-50 gap-4">
                  <div className={`w-12 h-12 border-4 border-slate-200 border-t-${doc.id === 'certificate' ? 'blue' : 'green'}-600 rounded-full animate-spin`}></div>
                  <p className="text-sm text-slate-500 animate-pulse font-medium">
                    Preparing {doc.label}...
                  </p>
                </div>
              ) : (doc.fileId || doc.url) ? (
                doc.id === 'certificate' ? (
                  <div className="bg-slate-900 overflow-hidden">
                    <div className="flex items-center justify-between p-4 bg-slate-950/50 border-b border-white/5">
                      <div className="flex items-center gap-3">
                        <div className="bg-blue-500/10 p-2 rounded-lg">
                          <Award className="h-5 w-5 text-blue-500" />
                        </div>
                        <div className="flex flex-col">
                          <span className="text-xs font-bold text-white uppercase tracking-widest">Official Startup Certificate</span>
                          <span className="text-[10px] text-blue-500 font-black uppercase tracking-tighter">Verified • Digital Identifier: {doc.fileId || doc.id}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="text-slate-400 hover:text-white hover:bg-white/10 h-8 gap-2 uppercase text-[10px] font-bold tracking-widest"
                          onClick={() => window.open(doc.url ? `${doc.url}?inline=true` : `/api/files/${doc.fileId}/download?inline=true`, '_blank')}
                        >
                          <Maximize2 className="h-3.5 w-3.5" />
                          Full View
                        </Button>
                        <Separator orientation="vertical" className="h-4 bg-white/10 mx-1" />
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="text-blue-500 hover:text-blue-400 hover:bg-blue-500/10 h-8 gap-2 uppercase text-[10px] font-bold tracking-widest"
                          onClick={() => window.open(doc.url || `/api/files/${doc.fileId}/download`, '_blank')}
                        >
                          <Download className="h-3.5 w-3.5" />
                          Download Original
                        </Button>
                      </div>
                    </div>
                    
                    <div className="relative group">
                      <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/40 to-transparent pointer-events-none z-10" />
                      <iframe 
                        src={doc.url ? `${doc.url}?inline=true` : `/api/files/${doc.fileId}/download?inline=true`}
                        className="w-full h-[700px] border-none"
                        title="Certificate Viewer"
                        onError={() => handlePdfError(doc.id)}
                      />
                    </div>

                    <div className="bg-slate-950 p-4 border-t border-white/5 flex flex-wrap gap-4 items-center justify-between">
                      <div className="flex items-center gap-6">
                        <div className="flex flex-col gap-0.5">
                          <span className="text-[9px] text-slate-500 uppercase tracking-widest font-bold font-mono">Blockchain Hash</span>
                          <span className="text-[10px] text-white font-mono opacity-60">{(doc.fileId || doc.id).slice(0, 24)}...</span>
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
                            if (doc.fileId) {
                              const url = `${window.location.origin}/verify/startup/${doc.fileId}`;
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
                  <div className="bg-slate-100 p-4">
                    <div className="bg-white rounded-lg shadow-inner overflow-hidden border border-slate-200">
                      {pdfError[doc.id] ? (
                        <div className="flex flex-col items-center justify-center h-[650px] bg-slate-50">
                          <AlertCircle className="h-12 w-12 text-amber-500 mb-4" />
                          <p className="text-lg font-medium text-slate-700">
                            PDF Preview Unavailable
                          </p>
                          <p className="text-sm text-slate-500 mb-6">
                            You can still download the file to view it offline
                          </p>
                          <Button
                            onClick={() => {
                              const dlUrl = doc.url || `/api/files/${doc.fileId}/download`;
                              window.open(dlUrl, "_blank");
                            }}
                            className="bg-green-600 hover:bg-green-700"
                          >
                            <Download className="h-4 w-4 mr-2" />
                            Download {doc.label}
                          </Button>
                        </div>
                      ) : (
                        <iframe
                          src={doc.url ? `${doc.url}?inline=true` : `/api/files/${doc.fileId}/download?inline=true`}
                          className="w-full h-[650px] border-none"
                          title={`${doc.label} Viewer`}
                          onError={() => handlePdfError(doc.id)}
                        />
                      )}
                    </div>
                    <div className="mt-4 px-2 flex items-center justify-between text-sm text-slate-600">
                      <div className="flex items-center gap-3">
                        <div className="bg-green-100 p-2 rounded-lg">
                          <FileText className="h-5 w-5 text-green-600" />
                        </div>
                        <div className="flex flex-col">
                          <span className="font-semibold text-slate-900">
                            {doc.fileName || doc.label}
                          </span>
                          <span className="text-[10px] text-slate-500 uppercase font-bold tracking-tight">
                            Status: SECURE & VERIFIED
                          </span>
                        </div>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-green-700 border-green-200 hover:bg-green-50 gap-2"
                        onClick={() => {
                          const dlUrl = doc.url || `/api/files/${doc.fileId}/download`;
                          window.open(dlUrl, "_blank");
                        }}
                      >
                        <Download className="h-4 w-4" />
                        Download
                      </Button>
                    </div>
                  </div>
                )
              ) : (
                <div className="flex flex-col items-center justify-center h-[400px] bg-slate-50 text-slate-500 gap-4">
                  {doc.id === 'certificate' ? (
                    <>
                      <div className="bg-white p-8 rounded-full shadow-inner ring-4 ring-slate-100/50">
                        <Award className="h-20 w-20 opacity-10 text-slate-400" />
                      </div>
                      <p className="text-xl font-black text-slate-400 uppercase tracking-tighter">Credential Pending</p>
                      <p className="text-sm max-w-xs text-center leading-relaxed">The official national certificate record is being finalized by the administration.</p>
                    </>
                  ) : (
                    <>
                      <FileText className="h-16 w-16 opacity-20" />
                      <p className="text-lg font-medium">No Document Available</p>
                      <p className="text-sm">
                        {doc.label} has not been uploaded.
                      </p>
                    </>
                  )}
                </div>
              )}
            </TabsContent>
          ))}
        </Tabs>
      </CardContent>
    </Card>
  );
}
