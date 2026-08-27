"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  ArrowLeft,
  Calendar,
  CheckCircle,
  Clock,
  Download,
  ExternalLink,
  FileText,
  Globe,
  MapPin,
  Building2,
  Users,
  AlertCircle,
  Mail,
  Phone,
  Award,
  Target,
  TrendingUp,
  Shield,
  FileCheck,
  Eye,
  Printer,
  Share2,
  Bookmark,
  Zap,
  Briefcase,
  Layers,
  Maximize2,
  Minimize2,
  ClipboardCheck,
  RefreshCw,
  LayoutDashboard,
  MessageSquare
} from "lucide-react";
import { ApplicationMessaging } from "../../components/application-messaging";
import {
  OrganizationProfile,
  ServicesOffered,
  DocumentViewer,
  ProgressStepper,
  ClarificationBanner,
  CertificateBanner
} from "@/components/ecosystem/application";

type EcosystemBuilderApplication = {
  id: string;
  name: string;
  type: string;
  description: string;
  status: string;
  workflowStatus: string;
  certified: boolean;
  location: string;
  address: string | null;
  city: string | null;
  region: string;
  contactName: string | null;
  contactEmail: string | null;
  contactPhone: string | null;
  website: string | null;
  established: number | null;
  capacity: number | null;
  services: string[];
  serviceDescription: string | null;
  impactDescription: string | null;
  businessLicenseFileId: string | null;
  businessLicenseFileName: string | null;
  taxRegistrationFileId: string | null;
  taxRegistrationFileName: string | null;
  submittedAt: string;
  validatedAt: string | null;
  rejectedReason: string | null;
  createdAt: string;
  updatedAt: string;
  certificate: {
    id: string;
    certificateNumber: string | null;
    issuedAt: string;
    filePath: string;
  } | null;
  committeeDecision: {
    summary: string;
    finalDecision: string;
    submittedAt: string;
  } | null;
  committeeReviews: {
    memberId: string;
    memberName: string;
    recommendation: string;
    comment: string | null;
    submittedAt: string | null;
  }[];
};

export default function ApplicationDetailPage() {
  const params = useParams();
  const id = params?.id;
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [application, setApplication] = useState<EcosystemBuilderApplication | null>(null);
  const [activeMainTab, setActiveMainTab] = useState("overview");
  const [activeTab, setActiveTab] = useState("business");
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [pdfError, setPdfError] = useState<{ [key: string]: boolean }>({});
  const [isTabLoading, setIsTabLoading] = useState(false);

  const handlePdfError = (type: string) => {
    setPdfError(prev => ({ ...prev, [type]: true }));
  };

  useEffect(() => {
    if (activeTab) {
      setIsTabLoading(true);
      const timer = setTimeout(() => setIsTabLoading(false), 500);
      return () => clearTimeout(timer);
    }
  }, [activeTab]);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/ecosystem-builder/application/${id}`);
      const result = await response.json();

      if (result.success) {
        setApplication(result.data);
      } else {
        setError(result.error || "Failed to load application.");
      }
    } catch (e) {
      setError("Failed to fetch application details. Please check your connection.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) load();
  }, [id]);

  const companyDetails = useMemo(() => {
    if (!application) return null;
    return {
      description: application.description || "",
      address: application.address || application.location || "",
      contact: application.contactName
        ? `${application.contactName} | ${application.contactEmail} | ${application.contactPhone}`
        : "",
      serviceDetails: application.serviceDescription || "",
      impact: application.impactDescription || ""
    };
  }, [application]);

  const getStatusColor = (status: string, certified: boolean) => {
    if (certified) return "bg-primary/10 text-primary border-primary/20";
    if (status === "pending") return "bg-amber-500/10 text-amber-600 border-amber-200";
    if (status === "under_review") return "bg-amber-500/10 text-amber-600 border-amber-200";
    if (status === "rejected") return "bg-red-500/10 text-red-600 border-red-200";
    if (status === "CLARIFICATION_REQUESTED" || status === "clarification_requested") return "bg-amber-500/10 text-amber-600 border-amber-200";
    return "bg-slate-500/10 text-slate-600 border-slate-200";
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map(word => word[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const getPdfViewerUrl = (fileId: string | null) => {
    if (!fileId) return "";
    return `/api/files/${fileId}/download?inline=true`;
  };

  const steps = [
    { label: "Submitted", status: "completed", date: application?.submittedAt },
    {
      label: "Verification",
      status: application?.workflowStatus === "PENDING" ? "current" : application?.workflowStatus === "DRAFT" ? "upcoming" : "completed"
    },
    {
      label: "Committee Review",
      status: application?.workflowStatus === "UNDER_REVIEW" ? "current" : ["PENDING", "DRAFT"].includes(application?.workflowStatus || "") ? "upcoming" : "completed"
    },
    {
      label: "Decision",
      status: application?.certified ? "completed" : application?.status === "rejected" ? "error" : "upcoming"
    }
  ];

  // Insert Clarification Step if requested
  if (application?.status === "CLARIFICATION_REQUESTED" || application?.workflowStatus === "CLARIFICATION_REQUESTED") {
    steps.splice(2, 0, {
      label: "Clarification",
      status: "current",
      date: application?.updatedAt as any
    });
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50">
        <div className="bg-white border-b h-20 animate-pulse" />
        <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
          <div className="h-32 bg-white rounded-2xl shadow-sm animate-pulse" />
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-8">
              <div className="h-64 bg-white rounded-2xl shadow-sm animate-pulse" />
              <div className="h-96 bg-white rounded-2xl shadow-sm animate-pulse" />
            </div>
            <div className="space-y-8">
              <div className="h-48 bg-white rounded-2xl shadow-sm animate-pulse" />
              <div className="h-96 bg-white rounded-2xl shadow-sm animate-pulse" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !application) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 flex items-center justify-center p-4">
        <Card className="max-w-md w-full border-red-100 shadow-2xl animate-in fade-in zoom-in duration-300">
          <CardHeader className="text-center pb-2">
            <div className="w-20 h-20 bg-red-50 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-sm border border-red-100">
              <AlertCircle className="h-10 w-10 text-red-500" />
            </div>
            <CardTitle className="text-2xl font-bold text-slate-900">Application Error</CardTitle>
            <CardDescription className="text-slate-500 mt-2 px-4">
              {error || "We couldn't find the application you're looking for. It might have been deleted or you may not have access."}
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center pb-6">
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 mb-6 mx-4">
              <p className="text-xs text-slate-400 font-mono break-all">Error ID: {id}</p>
            </div>
          </CardContent>
          <CardFooter className="flex flex-col gap-3 px-8 pb-8">
            <Button onClick={() => load()} className="w-full bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20 h-11">
              <RefreshCw className="mr-2 h-4 w-4" /> Try Again
            </Button>
            <Button asChild variant="outline" className="w-full border-slate-200 hover:bg-slate-50 h-11">
              <Link href="/ecosystem-builder/application">
                <LayoutDashboard className="mr-2 h-4 w-4 text-slate-500" /> Return to Portal
              </Link>
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  return (
    <TooltipProvider>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100">
        {/* Header with gradient */}
        <div className="bg-white/90 border-b border-slate-200 shadow-sm sticky top-0 z-30 backdrop-blur-xl">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 sm:py-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
              <div className="flex items-center gap-3 sm:gap-4">
                <Button
                  variant="ghost"
                  size="icon"
                  asChild
                  className="rounded-full hover:bg-slate-100 h-9 w-9 sm:h-10 sm:w-10 shrink-0"
                >
                  <Link href="/ecosystem-builder/application">
                    <ArrowLeft className="h-4 w-4 sm:h-5 sm:w-5" />
                  </Link>
                </Button>
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-0.5">
                    <span className="text-[9px] sm:text-[10px] font-bold text-slate-400 tracking-widest uppercase truncate">Ecosystem Builder Portal</span>
                    <Badge variant="outline" className="bg-blue-50/50 text-blue-600 border-blue-100/50 h-4 sm:h-5 text-[8px] sm:text-[10px] whitespace-nowrap">
                      ID: {application.id.slice(0, 8)}
                    </Badge>
                  </div>
                  <h1 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight truncate leading-tight">{application.name}</h1>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6 sm:space-y-8">
          
          <Tabs value={activeMainTab} onValueChange={setActiveMainTab} className="space-y-6 sm:space-y-8">
            <div className="bg-white/50 p-1.5 rounded-2xl border border-slate-200 backdrop-blur-sm sticky top-[72px] sm:top-24 z-20 shadow-sm">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <TabsList className="bg-transparent gap-1.5 sm:gap-2 h-10 sm:h-12 p-0 w-full lg:w-auto overflow-x-auto no-scrollbar flex flex-nowrap justify-start lg:justify-center">
                  <TabsTrigger
                    value="overview"
                    className="rounded-xl px-4 sm:px-6 font-bold uppercase tracking-widest text-[9px] sm:text-[10px] data-[state=active]:bg-white data-[state=active]:shadow-lg data-[state=active]:text-primary h-8 sm:h-10 transition-all border border-transparent data-[state=active]:border-primary/10 whitespace-nowrap flex-1 lg:flex-none"
                  >
                    <Building2 className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1.5 sm:mr-2" />
                    Overview
                  </TabsTrigger>
                  <TabsTrigger
                    value="documents"
                    className="rounded-xl px-4 sm:px-6 font-bold uppercase tracking-widest text-[9px] sm:text-[10px] data-[state=active]:bg-white data-[state=active]:shadow-lg data-[state=active]:text-primary h-8 sm:h-10 transition-all border border-transparent data-[state=active]:border-primary/10 whitespace-nowrap flex-1 lg:flex-none"
                  >
                    <FileCheck className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1.5 sm:mr-2" />
                    Documents
                  </TabsTrigger>
                  <TabsTrigger
                    value="messages"
                    className="rounded-xl px-4 sm:px-6 font-bold uppercase tracking-widest text-[9px] sm:text-[10px] data-[state=active]:bg-white data-[state=active]:shadow-lg data-[state=active]:text-primary h-8 sm:h-10 transition-all border border-transparent data-[state=active]:border-primary/10 whitespace-nowrap flex-1 lg:flex-none"
                  >
                    <MessageSquare className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1.5 sm:mr-2" />
                    Messages
                  </TabsTrigger>

                  {(application?.status === "CLARIFICATION_REQUESTED" || application?.workflowStatus === "CLARIFICATION_REQUESTED") && (
                    <TabsTrigger
                      value="clarification"
                      className="rounded-xl px-4 sm:px-6 font-bold uppercase tracking-widest text-[9px] sm:text-[10px] data-[state=active]:bg-white data-[state=active]:shadow-lg data-[state=active]:text-amber-600 h-8 sm:h-10 transition-all border border-transparent data-[state=active]:border-amber-100 whitespace-nowrap flex-1 lg:flex-none"
                    >
                      <AlertCircle className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1.5 sm:mr-2" />
                      Clarification
                    </TabsTrigger>
                  )}

                  {application?.certified && (
                    <TabsTrigger
                      value="certification"
                      className="rounded-xl px-4 sm:px-6 font-bold uppercase tracking-widest text-[9px] sm:text-[10px] data-[state=active]:bg-white data-[state=active]:shadow-lg data-[state=active]:text-primary h-8 sm:h-10 transition-all border border-transparent data-[state=active]:border-primary/10 whitespace-nowrap flex-1 lg:flex-none"
                    >
                      <Award className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1.5 sm:mr-2" />
                      Certification
                    </TabsTrigger>
                  )}
                </TabsList>

                <div className="hidden lg:flex items-center gap-4 px-4 border-l border-slate-200">
                  <div className="flex flex-col items-end">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">Last Update</span>
                    <span className="text-xs font-bold text-slate-700">{new Date(application.updatedAt).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
            </div>

            <TabsContent value="overview" className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 outline-none">
              <ProgressStepper steps={steps} />

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-8">
                  <OrganizationProfile application={application} />

                  <div className="flex flex-col gap-6">
                    {application.rejectedReason && (
                      <Card className="overflow-hidden border-none shadow-lg bg-gradient-to-br from-red-50 to-white">
                        <CardHeader className="border-b border-red-100">
                          <CardTitle className="text-lg flex items-center gap-2 text-red-700 font-black uppercase tracking-tight">
                            <AlertCircle className="h-5 w-5" />
                            Review Feedback
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="p-6">
                          <p className="text-red-900 font-medium leading-relaxed whitespace-pre-wrap">{application.rejectedReason}</p>
                        </CardContent>
                      </Card>
                    )}

                    {/* General Description */}
                    <Card className="overflow-hidden border border-slate-200/60 shadow-lg bg-white group">
                      <CardHeader className="border-b bg-slate-50/40 px-6 py-4">
                        <CardTitle className="text-sm sm:text-base flex items-center gap-3 font-black uppercase tracking-widest text-blue-700">
                          <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 shadow-sm transition-transform group-hover:scale-110">
                            <FileText className="h-5 w-5" />
                          </div>
                          General Description
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="">
                        <p className="text-slate-600 text-justify font-medium leading-relaxed whitespace-pre-wrap text-[15px]">
                          {companyDetails?.description || "No description provided."}
                        </p>
                      </CardContent>
                    </Card>

                    {/* Service Strategy */}
                    {companyDetails?.serviceDetails && (
                      <Card className="overflow-hidden border border-slate-200/60 shadow-lg bg-white group">
                        <CardHeader className="border-b bg-slate-50/40 px-6 py-4">
                          <CardTitle className="text-sm sm:text-base flex items-center gap-3 font-black uppercase tracking-widest text-blue-700">
                            <div className="h-10 w-10 rounded-full bg-teal-100 flex items-center justify-center text-teal-600 shadow-sm transition-transform group-hover:scale-110">
                              <Zap className="h-5 w-5" />
                            </div>
                            Service Strategy
                          </CardTitle>
                        </CardHeader>
                        <CardContent className=" text-justify">
                          <p className="text-slate-600 font-medium leading-relaxed whitespace-pre-wrap text-[15px]">
                            {companyDetails.serviceDetails}
                          </p>
                        </CardContent>
                      </Card>
                    )}

                    {/* Ecosystem Contribution */}
                    {companyDetails?.impact && (
                      <Card className="overflow-hidden border border-slate-200/60 shadow-lg bg-white group">
                        <CardHeader className="border-b bg-slate-50/40 px-6 py-4">
                          <CardTitle className="text-sm sm:text-base flex items-center gap-3 font-black uppercase tracking-widest text-blue-700">
                            <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 shadow-sm transition-transform group-hover:scale-110">
                              <TrendingUp className="h-5 w-5" />
                            </div>
                            Ecosystem Contribution
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="">
                          <p className="text-slate-600 font-medium leading-relaxed whitespace-pre-wrap text-[15px] text-justify">
                            {companyDetails.impact}
                          </p>
                        </CardContent>
                      </Card>
                    )}
                  </div>
                </div>

                <div className="space-y-8">
                  <div className="sticky top-40 space-y-8">
                    <ServicesOffered services={application.services} />

                    {application.committeeDecision && (
                      <Card className="overflow-hidden border-none shadow-xl bg-gradient-to-br from-blue-600 to-indigo-700 text-white">
                        <CardHeader className="pb-4">
                          <div className="flex items-center gap-2 text-blue-100 mb-1">
                            <ClipboardCheck className="h-4 w-4" />
                            <span className="text-[10px] font-black uppercase tracking-widest">Final Decision</span>
                          </div>
                          <CardTitle className="text-2xl font-black">Committee Review</CardTitle>
                          <p className="text-blue-100/70 text-[10px] font-bold uppercase tracking-wider">
                            {new Date(application.committeeDecision.submittedAt).toLocaleDateString()}
                          </p>
                        </CardHeader>
                        <CardContent className="space-y-6 pt-0">
                          <div className="p-4 bg-white/10 rounded-2xl backdrop-blur-sm border border-white/10">
                            <p className="text-sm font-medium leading-relaxed italic">"{application.committeeDecision.summary}"</p>
                          </div>
                          <div className="flex items-center justify-between pt-2 border-t border-white/10">
                            <span className="text-xs font-black uppercase tracking-wider">Verdict</span>
                            <Badge className={`${application.committeeDecision.finalDecision === 'APPROVE' ? 'bg-green-400 text-green-950' : 'bg-red-400 text-red-950'} font-black px-4`}>
                              {application.committeeDecision.finalDecision}
                            </Badge>
                          </div>
                        </CardContent>
                      </Card>
                    )}
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="documents" className="animate-in fade-in slide-in-from-bottom-4 duration-500 outline-none">
              <DocumentViewer
                application={application}
                activeTab={activeTab}
                setActiveTab={setActiveTab}
                isFullscreen={isFullscreen}
                setIsFullscreen={setIsFullscreen}
                pdfError={pdfError}
                handlePdfError={handlePdfError}
                isTabLoading={isTabLoading}
              />
            </TabsContent>

            <TabsContent value="messages" className="animate-in fade-in slide-in-from-bottom-4 duration-500 outline-none">
              <Card className="overflow-hidden border-none shadow-2xl">
                <CardHeader className="bg-slate-50 border-b p-8">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="bg-blue-600 p-3 rounded-2xl shadow-lg ring-4 ring-blue-50">
                        <MessageSquare className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <h3 className="text-2xl font-black text-slate-900 tracking-tight uppercase">Communications</h3>
                        <p className="text-xs text-slate-500 font-bold uppercase tracking-widest mt-1">Direct inquiries with national evaluators</p>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-0">
                  <ApplicationMessaging appId={application.id} />
                </CardContent>
              </Card>
            </TabsContent>

            {(application?.status === "CLARIFICATION_REQUESTED" || application?.workflowStatus === "CLARIFICATION_REQUESTED") && (
              <TabsContent value="clarification" className="animate-in fade-in slide-in-from-bottom-4 duration-500 outline-none">
                <div className="mt-4">
                  <ClarificationBanner application={application} />
                </div>
              </TabsContent>
            )}

            {application?.certified && (
              <TabsContent value="certification" className="animate-in fade-in slide-in-from-bottom-4 duration-500 outline-none">
                <div className="mt-4">
                  <CertificateBanner 
                    application={application} 
                    onViewCertificate={() => {
                      setActiveTab("certificate");
                      setActiveMainTab("documents");
                    }} 
                  />
                </div>
              </TabsContent>
            )}
          </Tabs>
        </div>
      </div>
    </TooltipProvider>
  );
}