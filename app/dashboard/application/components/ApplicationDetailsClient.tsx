"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
  LayoutDashboard,
  RefreshCw,
  Coins,
  Gem,
  BarChart3,
  ShieldAlert,
  MessageSquare,
  UserCircle
} from "lucide-react";
import { DocumentPreview } from "./DocumentPreview";
import { initAppChatWithAdmin, initAppChatWithCommittee } from "@/lib/actions/communication";

interface ApplicationDetailsClientProps {
  id: string;
}

type StartupApplication = {
  id: string;
  startupName: string;
  industry: string | null;
  status: string;
  numberOfEmployees: number | null;
  foundingDate: string | null;
  phoneNumber: string | null;
  email: string | null;
  alternateEmail: string | null;
  website: string | null;
  businessLicense: string | null;
  typeOfCompany: string | null;
  vision: string | null; // This is 'capital' in form
  totalShares: number | null;
  sharePrice: number | null;
  productDescription: string | null;
  tin: string | null;
  problemStatement: string | null;
  solution: string | null;
  innovationDescription: string | null;
  targetMarket: string | null;
  competitiveAdvantage: string | null;
  scalabilityPlan: string | null;
  traction: string | null;
  riskAssessment: string | null;
  revenue: string | null;
  totalFundingRaised: string | null;
  investmentNeeded: string | null;
  useOfFunds: string | null;
  fundingSources: string | null;
  createdAt: string;
  updatedAt: string;
  reason: string | null;
  founders: {
    id: string;
    fullName: string;
    fcn: string | null;
    noOfShares: number | null;
    email: string | null;
    phone: string | null;
    role: string | null;
  }[];
  businessLicenseFile: { id: string; originalName: string } | null;
  articlesOfIncorpFile: { id: string; originalName: string } | null;
  pitchDeckFile: { id: string; originalName: string } | null;
  financialsFile: { id: string; originalName: string } | null;
  certificate: {
    id: string;
    certificateNumber: string | null;
    issuedAt: string;
  } | null;
};

export function ApplicationDetailsClient({ id }: ApplicationDetailsClientProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [application, setApplication] = useState<StartupApplication | null>(null);
  const [activeTab, setActiveTab] = useState("business");
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [isTabLoading, setIsTabLoading] = useState(false);

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
      const response = await fetch(`/api/applications/${id}`);
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case "CERTIFIED": return "bg-brand-mint-teal/10 text-brand-mint-teal border-brand-mint-teal/20";
      case "PENDING": return "bg-blue-500/10 text-blue-600 border-blue-200";
      case "UNDER_REVIEW": 
      case "REVIEWED": return "bg-brand-startup-amber/10 text-brand-startup-amber border-brand-startup-amber/20";
      case "REJECTED": return "bg-rose-500/10 text-rose-600 border-rose-200";
      case "ROLLED_BACK": return "bg-orange-500/10 text-orange-600 border-orange-200";
      default: return "bg-slate-500/10 text-slate-600 border-slate-200";
    }
  };

  const steps = useMemo(() => {
    if (!application) return [];
    
    const status = application.status;
    
    const isSubmitted = status !== "DRAFT";
    const isVerificationDone = !["DRAFT", "PENDING", "UNDER_REVIEW"].includes(status);
    const isCommitteeDone = !["DRAFT", "PENDING", "UNDER_REVIEW", "REVIEWED", "ASSIGNED_TO_COMMITTEE", "IN_COMMITTEE_REVIEW"].includes(status);
    const isFinalDecision = status === "CERTIFIED" || status === "REJECTED";

    return [
      { 
        label: "Submitted", 
        status: isSubmitted ? "completed" : "upcoming", 
        date: application.createdAt 
      },
      { 
        label: "Verification", 
        status: ["PENDING", "UNDER_REVIEW", "REVIEWED"].includes(status) ? "current" : isVerificationDone ? "completed" : "upcoming" 
      },
      { 
        label: "Committee Review", 
        status: ["ASSIGNED_TO_COMMITTEE", "IN_COMMITTEE_REVIEW", "COMMITTEE_REVIEW_SUBMITTED"].includes(status) ? "current" : isCommitteeDone ? "completed" : "upcoming" 
      },
      { 
        label: "Decision", 
        status: isFinalDecision ? (status === "CERTIFIED" ? "completed" : "error") : "upcoming" 
      }
    ];
  }, [application]);

  const documents = useMemo(() => {
    if (!application) return [];
    
    const docs: {
      id: string;
      label: string;
      fileId: string | null;
      fileName?: string | null;
      url?: string;
    }[] = [
      {
        id: "license",
        label: "Business License",
        fileId: application.businessLicenseFile?.id || null,
        fileName: application.businessLicenseFile?.originalName,
      },
      {
        id: "articles",
        label: "Articles of Incorp.",
        fileId: application.articlesOfIncorpFile?.id || null,
        fileName: application.articlesOfIncorpFile?.originalName,
      },
      {
        id: "pitch",
        label: "Pitch Deck",
        fileId: application.pitchDeckFile?.id || null,
        fileName: application.pitchDeckFile?.originalName,
      },
      {
        id: "financials",
        label: "Financials",
        fileId: application.financialsFile?.id || null,
        fileName: application.financialsFile?.originalName,
      },
    ];

    if (application.certificate) {
      docs.push({
        id: "certificate",
        label: "Certificate",
        fileId: application.certificate.id,
        fileName: "Certificate.pdf",
        url: `/api/certificates/${application.certificate.id}/download`
      });
    }

    return docs;
  }, [application]);

  if (loading) {
    return (
      <div className="container mx-auto py-10 space-y-8 animate-pulse">
        <div className="h-20 bg-slate-100 rounded-xl" />
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="col-span-1 md:col-span-3 h-96 bg-slate-100 rounded-xl" />
          <div className="h-96 bg-slate-100 rounded-xl" />
        </div>
      </div>
    );
  }

  if (error || !application) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center p-4">
        <Card className="max-w-md w-full border-red-100 shadow-2xl">
          <CardHeader className="text-center pb-2">
            <div className="w-20 h-20 bg-red-50 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <AlertCircle className="h-10 w-10 text-red-500" />
            </div>
            <CardTitle className="text-2xl font-bold">Application Error</CardTitle>
            <CardDescription className="text-slate-500 mt-2">
              {error || "We couldn't find the application you're looking for."}
            </CardDescription>
          </CardHeader>
          <CardFooter className="flex flex-col gap-3 px-8 pb-8">
            <Button onClick={() => load()} className="w-full">
              <RefreshCw className="mr-2 h-4 w-4" /> Try Again
            </Button>
            <Button asChild variant="outline" className="w-full">
              <Link href="/dashboard/application">Return to Dashboard</Link>
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  return (
    <TooltipProvider>
      <div className="space-y-8 animate-in fade-in duration-500">
        {/* Header Section */}
        <div className="bg-white/80 border border-slate-200 rounded-3xl p-6 shadow-sm backdrop-blur-xl">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-center gap-5">
              <Button 
                variant="ghost" 
                size="icon" 
                asChild
                className="rounded-full hover:bg-slate-100 h-12 w-12"
              >
                <Link href="/dashboard/application">
                  <ArrowLeft className="h-6 w-6" />
                </Link>
              </Button>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[10px] font-black text-slate-400 tracking-[0.2em] uppercase">Startup Portal</span>
                  <Badge variant="outline" className="bg-brand-mint-teal/5 text-brand-mint-teal border-brand-mint-teal/20 h-5 text-[10px] font-black">
                    ID: {application.id.slice(0, 8)}
                  </Badge>
                </div>
                <h1 className="text-2xl font-black text-brand-deep-dark tracking-tighter">{application.startupName}</h1>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="hidden sm:flex items-center bg-slate-50 rounded-2xl p-1.5 border border-slate-100">
                <Badge 
                  variant="outline" 
                  className={`border-none rounded-xl px-4 h-9 flex items-center gap-2 font-bold ${getStatusColor(application.status)}`}
                >
                  {application.status === "CERTIFIED" ? (
                    <><CheckCircle className="h-4 w-4" /> Certified</>
                  ) : application.status === "PENDING" ? (
                    <><Clock className="h-4 w-4" /> Pending</>
                  ) : application.status === "REJECTED" ? (
                    <><AlertCircle className="h-4 w-4" /> Rejected</>
                  ) : (
                    <><RefreshCw className="h-4 w-4 animate-spin" /> {application.status.replaceAll('_', ' ')}</>
                  )}
                </Badge>
              </div>

              <div className="flex items-center gap-2">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button className="bg-brand-deep-dark hover:bg-brand-mint-teal text-white shadow-xl shadow-brand-deep-dark/10 rounded-xl font-black text-xs h-11 px-6 group transition-all">
                      <MessageSquare className="w-4 h-4 mr-2" /> 
                      Contact Support
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56 mt-2 rounded-2xl p-2 z-50">
                    <DropdownMenuLabel className="px-3 py-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">Select Channel</DropdownMenuLabel>
                    <DropdownMenuItem 
                      onClick={async () => {
                        const res = await initAppChatWithAdmin(application.id);
                        if (res.success) {
                          router.push(`/dashboard/messages?conversationId=${res.data?.conversationId}`);
                        } else {
                          toast.error(res.error || "Failed to start chat");
                        }
                      }}
                      className="rounded-xl px-3 py-2 cursor-pointer"
                    >
                      <UserCircle className="w-4 h-4 mr-2 text-blue-500" />
                      <div className="flex flex-col">
                        <span className="text-xs font-bold">Message Admin</span>
                        <span className="text-[9px] text-slate-400">Direct compliance inquiry</span>
                      </div>
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      onClick={async () => {
                        const res = await initAppChatWithCommittee(application.id);
                        if (res.success) {
                          router.push(`/dashboard/messages?conversationId=${res.data?.conversationId}`);
                        } else {
                          toast.error(res.error || "Failed to start chat");
                        }
                      }}
                      className="rounded-xl px-3 py-2 cursor-pointer"
                    >
                      <Users className="w-4 h-4 mr-2 text-indigo-500" />
                      <div className="flex flex-col">
                        <span className="text-xs font-bold">Message Committee</span>
                        <span className="text-[9px] text-slate-400">Strategic clarification</span>
                      </div>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>

                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="ghost" size="icon" className="rounded-full h-11 w-11 text-slate-500" onClick={() => setIsBookmarked(!isBookmarked)}>
                      <Bookmark className={`h-5 w-5 ${isBookmarked ? 'fill-primary text-primary' : ''}`} />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Save to Library</TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button 
                      variant="ghost" 
                      size="icon"
                      className="rounded-full h-11 w-11 text-slate-500"
                      onClick={() => {
                        const url = window.location.href;
                        navigator.clipboard.writeText(url);
                        toast.success("Link copied!");
                      }}
                    >
                      <Share2 className="h-5 w-5" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Share Access</TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="ghost" size="icon" className="rounded-full h-11 w-11 text-slate-500" onClick={() => window.print()}>
                      <Printer className="h-5 w-5" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Print Report</TooltipContent>
                </Tooltip>
              </div>
            </div>
          </div>
        </div>

        {/* Progress Stepper */}
        <div className="bg-white border border-slate-200 rounded-3xl p-8 shadow-sm">
          <div className="relative">
            <div className="absolute top-5 left-8 right-8 h-0.5 bg-slate-100 hidden md:block" />
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {steps.map((step, idx) => (
                <div key={idx} className="relative z-10 flex flex-col items-center">
                  <div className={`w-11 h-11 rounded-2xl flex items-center justify-center border-2 transition-all duration-500 ${
                    step.status === 'completed' ? 'bg-brand-mint-teal border-brand-mint-teal text-white shadow-lg shadow-brand-mint-teal/20' :
                    step.status === 'current' ? 'bg-brand-startup-amber border-brand-startup-amber text-white shadow-lg shadow-brand-startup-amber/20 animate-pulse' :
                    step.status === 'error' ? 'bg-rose-600 border-rose-600 text-white shadow-lg shadow-rose-100' :
                    'bg-white border-slate-200 text-slate-400'
                  }`}>
                    {step.status === 'completed' ? <CheckCircle className="h-5 w-5" /> : 
                     step.status === 'error' ? <AlertCircle className="h-5 w-5" /> :
                     <span className="text-sm font-black">{idx + 1}</span>}
                  </div>
                  <div className="mt-4 text-center">
                    <p className={`text-[10px] font-black uppercase tracking-widest ${
                      step.status === 'completed' ? 'text-brand-mint-teal' :
                      step.status === 'current' ? 'text-brand-startup-amber' :
                      step.status === 'error' ? 'text-rose-600' :
                      'text-slate-400'
                    }`}>{step.label}</p>
                    {step.date && (
                      <p className="text-[10px] text-slate-400 mt-1 font-medium">{new Date(step.date).toLocaleDateString()}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Certification Banner */}
        {application.status === "CERTIFIED" && (
          <div className="animate-in slide-in-from-top duration-700">
            <div className="bg-gradient-to-br from-brand-deep-dark to-brand-mint-teal rounded-3xl p-8 shadow-2xl shadow-brand-mint-teal/20 relative overflow-hidden text-white">
              <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mr-32 -mt-32" />
              <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-8">
                <div className="flex flex-col md:flex-row items-center gap-8">
                  <div className="h-24 w-24 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center shadow-xl ring-4 ring-white/10">
                    <Award className="h-12 w-12 text-white" />
                  </div>
                  <div className="text-center md:text-left">
                    <h2 className="text-3xl font-black tracking-tight mb-2">Startup Certified</h2>
                    <p className="text-blue-100 text-lg font-medium max-w-xl">
                      Your startup has successfully completed the national evaluation process and is now an officially recognized startup.
                    </p>
                    {application.certificate?.certificateNumber && (
                      <div className="flex items-center justify-center md:justify-start gap-3 mt-4">
                        <Badge className="bg-white/20 text-white border-none font-black px-3 py-1">#{application.certificate.certificateNumber}</Badge>
                        <span className="text-xs text-blue-200 font-bold uppercase tracking-widest flex items-center gap-1.5">
                          <Shield className="h-3.5 w-3.5" /> Securely Issued
                        </span>
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
                  <Button 
                    size="lg"
                    className="bg-white text-brand-deep-dark hover:bg-brand-mint-teal hover:text-white shadow-xl font-black px-8 h-14 rounded-2xl transition-all"
                    onClick={() => setActiveTab("certificate")}
                  >
                    <Award className="h-5 w-5 mr-3" />
                    View Certificate
                  </Button>
                  <Button 
                    size="lg"
                    variant="outline" 
                    className="border-white/20 bg-white/10 hover:bg-white/20 text-white font-black h-14 rounded-2xl px-6"
                    onClick={() => application.certificate?.id && window.open(`/api/certificates/${application.certificate.id}/download`, '_blank')}
                  >
                    <Download className="h-5 w-5" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Action Required Banner */}
        {application.status === "ROLLED_BACK" && application.reason && (
          <div className="bg-rose-50 border border-rose-200 rounded-3xl p-6 flex flex-col md:flex-row items-center gap-6 animate-in slide-in-from-top duration-700">
            <div className="h-14 w-14 bg-rose-100 rounded-2xl flex items-center justify-center shrink-0">
              <ShieldAlert className="h-7 w-7 text-rose-600" />
            </div>
            <div className="flex-1 text-center md:text-left">
              <h3 className="text-lg font-black text-rose-900 mb-1 uppercase tracking-tight">Action Required: Application Rollback</h3>
              <p className="text-rose-700 text-sm font-medium leading-relaxed">
                {application.reason}
              </p>
            </div>
            <Button asChild className="bg-rose-600 hover:bg-rose-700 text-white font-black h-12 rounded-xl px-6">
              <Link href={`/dashboard/application/edit/${application.id}`}>Resume Application</Link>
            </Button>
          </div>
        )}
        {/* Action Required Banner for Clarification */}
        {application.status === "CLARIFICATION_REQUESTED" && (
          <div className="bg-brand-startup-amber/5 border border-brand-startup-amber/20 rounded-3xl p-6 flex flex-col md:flex-row items-center gap-6 animate-in slide-in-from-top duration-700">
            <div className="h-14 w-14 bg-brand-startup-amber/10 rounded-2xl flex items-center justify-center shrink-0">
              <MessageSquare className="h-7 w-7 text-brand-startup-amber" />
            </div>
            <div className="flex-1 text-center md:text-left">
              <h3 className="text-lg font-black text-brand-startup-amber mb-1 uppercase tracking-tight">Support Interaction Required</h3>
              <p className="text-brand-startup-amber text-sm font-medium leading-relaxed">
                The evaluation committee has requested additional clarifications or documents. Please check your messages to respond and resume the process.
              </p>
            </div>
            <Button asChild className="bg-brand-startup-amber hover:bg-brand-startup-amber/90 text-white font-black h-12 rounded-xl px-6 shadow-lg shadow-brand-startup-amber/20">
              <Link href="/dashboard/messages">Open Message Hub</Link>
            </Button>
          </div>
        )}

        {/* Profile Card */}
        <Card className="overflow-hidden border-none shadow-sm rounded-3xl">
          <CardHeader className="bg-slate-50 border-b p-6">
            <CardTitle className="text-lg font-black flex items-center gap-3">
              <Building2 className="h-5 w-5 text-primary" />
              Startup Profile
            </CardTitle>
          </CardHeader>
          <CardContent className="p-8">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-y-8 gap-x-12">
              <div className="space-y-1.5">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                  <Briefcase className="h-3 w-3" /> Industry
                </p>
                <p className="font-bold text-slate-900">{application.industry || 'Not set'}</p>
              </div>
              <div className="space-y-1.5">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                  <Layers className="h-3 w-3" /> Stage
                </p>
                <Badge variant="outline" className="font-bold border-slate-200 bg-slate-50 text-slate-700">{application.typeOfCompany || 'Seed Stage'}</Badge>
              </div>
              <div className="space-y-1.5">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                  <RefreshCw className="h-3 w-3" /> TIN Number
                </p>
                <p className="font-mono font-bold text-slate-900 tracking-wider bg-slate-100 px-2 py-0.5 rounded-md inline-block">
                  {application.tin || 'PENDING'}
                </p>
              </div>
              <div className="space-y-1.5">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                  <Calendar className="h-3 w-3" /> Founded
                </p>
                <p className="font-bold text-slate-900">{application.foundingDate ? new Date(application.foundingDate).toLocaleDateString() : 'Not set'}</p>
              </div>
              <div className="space-y-1.5">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                  <Users className="h-3 w-3" /> Employees
                </p>
                <p className="font-bold text-slate-900">{application.numberOfEmployees || '1-10'} Members</p>
              </div>
              <div className="space-y-1.5">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                  <Globe className="h-3 w-3" /> Website
                </p>
                {application.website ? (
                  <a href={application.website} target="_blank" rel="noopener noreferrer" className="font-bold text-primary hover:underline flex items-center gap-1.5 truncate">
                    {application.website.replace(/^https?:\/\//, '')} <ExternalLink className="h-3 w-3" />
                  </a>
                ) : <p className="font-bold text-slate-400">N/A</p>}
              </div>
              <div className="space-y-1.5">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                  <Mail className="h-3 w-3" /> Contact Email
                </p>
                <p className="font-bold text-slate-900 break-all">{application.email || 'N/A'}</p>
              </div>
              <div className="space-y-1.5">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                  <Phone className="h-3 w-3" /> Phone
                </p>
                <p className="font-bold text-slate-900">{application.phoneNumber || 'N/A'}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Detailed Tabs */}
        <Tabs defaultValue="business" className="w-full" onValueChange={setActiveTab}>
          <div className="flex items-center justify-between mb-6">
            <TabsList className="bg-slate-100/50 p-1.5 rounded-2xl border border-slate-200">
              <TabsTrigger value="business" className="data-[state=active]:bg-white data-[state=active]:text-brand-mint-teal data-[state=active]:shadow-sm rounded-xl font-black px-6">Model</TabsTrigger>
              <TabsTrigger value="founders" className="data-[state=active]:bg-white data-[state=active]:text-brand-mint-teal data-[state=active]:shadow-sm rounded-xl font-black px-6">Founders</TabsTrigger>
              <TabsTrigger value="financial" className="data-[state=active]:bg-white data-[state=active]:text-brand-mint-teal data-[state=active]:shadow-sm rounded-xl font-black px-6">Financial</TabsTrigger>
              <TabsTrigger value="documents" className="data-[state=active]:bg-white data-[state=active]:text-brand-mint-teal data-[state=active]:shadow-sm rounded-xl font-black px-6">Documents</TabsTrigger>
              {application.certificate && (
                <TabsTrigger value="certificate" className="data-[state=active]:bg-white data-[state=active]:text-brand-mint-teal data-[state=active]:shadow-sm rounded-xl font-black px-6 border-l ml-2 border-slate-200">
                  <Award className="h-4 w-4 mr-2" />
                  Certificate
                </TabsTrigger>
              )}
            </TabsList>
            
            <div className="flex items-center gap-1.5 text-slate-400 font-bold text-[10px] uppercase tracking-widest">
              <Clock className="h-3 w-3" /> Updated {new Date(application.updatedAt).toLocaleDateString()}
            </div>
          </div>

          <div className="mt-2 min-h-[400px]">
            {isTabLoading ? (
              <div className="flex flex-col items-center justify-center py-20 gap-4">
                <div className="w-10 h-10 border-4 border-slate-100 border-t-primary rounded-full animate-spin" />
                <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">Loading Tab Content...</p>
              </div>
            ) : (
              <>
                <TabsContent value="business" className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <Card className="md:col-span-2 border-none shadow-sm rounded-3xl overflow-hidden">
                      <CardHeader className="bg-slate-50/50 border-b p-6">
                        <CardTitle className="text-sm font-black uppercase tracking-widest flex items-center gap-2">
                          <Target className="h-4 w-4 text-brand-mint-teal" /> Vision & Product
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="p-8 space-y-10">
                        <section>
                          <h4 className="text-xs font-black text-brand-deep-dark uppercase tracking-widest mb-4 flex items-center gap-3">
                            <div className="w-1.5 h-1.5 rounded-full bg-brand-mint-teal" /> Business Description
                          </h4>
                          <p className="text-slate-600 leading-relaxed font-medium">
                            {application.productDescription || 'No description provided.'}
                          </p>
                        </section>
                        <Separator className="bg-slate-100" />
                        <section>
                          <h4 className="text-xs font-black text-brand-deep-dark uppercase tracking-widest mb-4 flex items-center gap-3">
                            <div className="w-1.5 h-1.5 rounded-full bg-brand-mint-teal" /> Innovation Strategy
                          </h4>
                          <p className="text-slate-600 leading-relaxed font-medium">
                            {application.innovationDescription || 'No innovation details provided.'}
                          </p>
                        </section>
                        <Separator className="bg-slate-100" />
                        <section>
                          <h4 className="text-xs font-black text-brand-deep-dark uppercase tracking-widest mb-4 flex items-center gap-3">
                            <div className="w-1.5 h-1.5 rounded-full bg-brand-mint-teal" /> Solution & Impact
                          </h4>
                          <p className="text-slate-600 leading-relaxed font-medium">
                            {application.solution || 'No solution details provided.'}
                          </p>
                        </section>
                      </CardContent>
                    </Card>

                    <div className="space-y-6">
                      <Card className="border-none shadow-sm rounded-3xl bg-brand-mint-teal/5 border border-brand-mint-teal/10">
                        <CardHeader className="p-6 pb-2">
                          <CardTitle className="text-[10px] font-black uppercase tracking-widest text-brand-mint-teal">Market Dynamics</CardTitle>
                        </CardHeader>
                        <CardContent className="p-6 pt-0 space-y-6">
                          <div>
                            <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Target Market</p>
                            <p className="text-sm font-bold text-slate-900 leading-relaxed">{application.targetMarket || 'N/A'}</p>
                          </div>
                          <div>
                            <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Competitive Edge</p>
                            <p className="text-sm font-bold text-slate-900 leading-relaxed">{application.competitiveAdvantage || 'N/A'}</p>
                          </div>
                        </CardContent>
                      </Card>

                      <Card className="border-none shadow-sm rounded-3xl">
                        <CardHeader className="p-6 pb-2">
                          <CardTitle className="text-[10px] font-black uppercase tracking-widest text-slate-400">Problem Statement</CardTitle>
                        </CardHeader>
                        <CardContent className="p-6 pt-0">
                          <p className="text-sm font-bold text-slate-700 leading-relaxed italic">
                            "{application.problemStatement || 'No problem statement recorded.'}"
                          </p>
                        </CardContent>
                      </Card>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="founders" className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {application.founders.map((founder, i) => (
                      <Card key={founder.id} className="border-none shadow-sm rounded-3xl overflow-hidden group hover:shadow-xl transition-all duration-500">
                        <div className="h-2 bg-gradient-to-r from-primary to-indigo-400" />
                        <CardHeader className="p-6 flex flex-row items-center gap-4 border-b">
                          <Avatar className="h-14 w-14 rounded-2xl shadow-lg ring-4 ring-slate-50">
                            <AvatarFallback className="bg-slate-100 text-slate-900 font-black text-xl">
                              {founder.fullName.split(' ').map(n=>n[0]).join('')}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <CardTitle className="text-lg font-black tracking-tighter">{founder.fullName}</CardTitle>
                            <p className="text-xs font-black text-brand-mint-teal uppercase tracking-widest mt-0.5">{founder.role || 'Founding Member'}</p>
                          </div>
                        </CardHeader>
                        <CardContent className="p-6 space-y-5">
                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1">
                              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5"><Shield className="h-3 w-3" /> FCN</p>
                              <p className="text-xs font-bold text-slate-900 truncate" title={founder.fcn || ''}>{founder.fcn || 'UNVERIFIED'}</p>
                            </div>
                            <div className="space-y-1 text-right">
                              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest flex items-center justify-end gap-1.5"><Coins className="h-3 w-3" /> Equity</p>
                              <p className="text-xs font-black text-slate-900">{founder.noOfShares || '0'}%</p>
                            </div>
                          </div>
                          <Separator className="bg-slate-100" />
                          <div className="space-y-3">
                            <div className="flex items-center gap-3 text-slate-600 hover:text-primary transition-colors cursor-default">
                              <Mail className="h-4 w-4" />
                              <span className="text-xs font-bold truncate">{founder.email || 'No email provided'}</span>
                            </div>
                            <div className="flex items-center gap-3 text-slate-600 hover:text-primary transition-colors cursor-default">
                              <Phone className="h-4 w-4" />
                              <span className="text-xs font-bold">{founder.phone || 'No phone provided'}</span>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </TabsContent>

                <TabsContent value="financial" className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Card className="border-none shadow-sm rounded-3xl overflow-hidden">
                      <CardHeader className="bg-slate-50 border-b p-6">
                        <CardTitle className="text-sm font-black uppercase tracking-widest flex items-center gap-2">
                          <Gem className="h-5 w-5 text-indigo-500" /> Capital Structure
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="p-8 space-y-8">
                        <div className="grid grid-cols-2 gap-8">
                          <div className="space-y-2">
                            <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Initial Capital</p>
                            <p className="text-xl font-black text-slate-900">{application.vision || 'N/A'} <span className="text-[10px] text-slate-400 ml-1">ETB</span></p>
                          </div>
                          <div className="space-y-2">
                            <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Share Price</p>
                            <p className="text-xl font-black text-slate-900">{application.sharePrice || '0'} <span className="text-[10px] text-slate-400 ml-1">ETB</span></p>
                          </div>
                          <div className="space-y-2">
                            <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Total Shares</p>
                            <p className="text-xl font-black text-slate-900">{application.totalShares || '0'}</p>
                          </div>
                        </div>
                        <Separator className="bg-slate-100" />
                        <div className="space-y-2">
                          <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Funding Sources</p>
                          <p className="text-sm font-bold text-slate-700 leading-relaxed italic">
                            {application.fundingSources || 'No external funding sources documented.'}
                          </p>
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="border-none shadow-sm rounded-3xl overflow-hidden">
                      <CardHeader className="bg-slate-50 border-b p-6">
                        <CardTitle className="text-sm font-black uppercase tracking-widest flex items-center gap-2">
                          <TrendingUp className="h-5 w-5 text-green-500" /> Performance & Scale
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="p-8 space-y-8">
                        <div className="grid grid-cols-2 gap-8">
                          <div className="space-y-2">
                            <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Current Revenue</p>
                            <p className="text-xl font-black text-green-600">{application.revenue || 'N/A'}</p>
                          </div>
                          <div className="space-y-2">
                            <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Funding Raised</p>
                            <p className="text-xl font-black text-indigo-600">{application.totalFundingRaised || 'N/A'}</p>
                          </div>
                        </div>
                        <Separator className="bg-slate-100" />
                        <div className="space-y-4">
                          <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100">
                             <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-3">Traction Summary</p>
                             <p className="text-sm font-bold text-slate-700 leading-relaxed">{application.traction || 'No traction data recorded yet.'}</p>
                          </div>
                          <div className="p-6 bg-primary/5 rounded-2xl border border-primary/10">
                             <p className="text-xs font-black text-primary uppercase tracking-widest mb-3">Investment Needed</p>
                             <p className="text-sm font-black text-slate-900">{application.investmentNeeded || 'N/A'}</p>
                             <p className="text-[10px] font-bold text-slate-400 mt-2 uppercase">Intended Use: <span className="text-slate-600 ml-1">{application.useOfFunds || 'Scalability'}</span></p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>

                <TabsContent value="documents" className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                  <DocumentPreview documents={documents.filter(d => d.id !== 'certificate')} />
                </TabsContent>

                {application.certificate && (
                  <TabsContent value="certificate" className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                    <DocumentPreview documents={[{
                      id: "certificate",
                      label: "Certificate",
                      fileId: application.certificate.id,
                      fileName: "Certificate.pdf",
                      url: `/api/certificates/${application.certificate.id}/download`
                    }]} />
                  </TabsContent>
                )}
              </>
            )}
          </div>
        </Tabs>
      </div>
    </TooltipProvider>
  );
}
