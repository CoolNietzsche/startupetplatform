"use client";

import React, { useState, useEffect, useCallback, Suspense } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { format, formatDistanceToNow } from "date-fns";
import { 
  ArrowLeft,
  ThumbsDown,
  ThumbsUp,
  HelpCircle,
  FileText,
  ShieldCheck,
  RefreshCw,
  CheckCircle2,
  Award,
  TrendingUp,
  Users,
  ClipboardCheck,
  Mail,
  Phone,
  Info,
  Eye,
  CheckSquare,
  Loader2,
  Building,
  Calendar,
  Clock,
  UserCheck,
  Download,
  AlertTriangle,
  LayoutDashboard,
  ExternalLink
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { getAssessmentResults } from "@/app/committee-portal/dashboard/actions";
import { getAdminApplicationById, rejectApplicationAction, setApplicationCertified } from "../../application-actions";
import { toast } from "sonner";

function renderText(value: string | null | undefined) {
  return value && value.trim() ? value : "Not provided";
}

function ResultContent() {
  const { id } = useParams();
  const router = useRouter();
  
  const applicationId = id as string;
  
  const [loading, setLoading] = useState(true);
  const [resultsData, setResultsData] = useState<any>(null);
  const [appData, setAppData] = useState<any>(null);
  const [workflowStatus, setWorkflowStatus] = useState<string>("");
  
  // Modal states
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [showCertifyModal, setShowCertifyModal] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [selectedMemberProfile, setSelectedMemberProfile] = useState<any>(null);
  const [showProfileModal, setShowProfileModal] = useState(false);

  const fetchResults = useCallback(async () => {
    try {
      setLoading(true);
      const [appResult, assessmentResult] = await Promise.all([
        getAdminApplicationById(applicationId),
        getAssessmentResults(applicationId, 'startup')
      ]);
      
      if (appResult.success && appResult.data) {
          setAppData(appResult.data);
          setWorkflowStatus(appResult.data.status);
      }

      if (assessmentResult.success && assessmentResult.data) {
        setResultsData(assessmentResult.data);
      } else {
        toast.error(assessmentResult.message || "Failed to load assessment results.");
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to fetch assessment results");
    } finally {
      setLoading(false);
    }
  }, [applicationId]);

  useEffect(() => {
    if (applicationId) {
      fetchResults();
    }
  }, [applicationId, fetchResults]);

  const detailHref = `/admins-new/applications/${applicationId}`;

  const handleReject = async () => {
    if (!rejectionReason.trim()) {
      toast.error("Please provide a rejection reason.");
      return;
    }
    setSubmitting(true);
    const res = await rejectApplicationAction(applicationId, rejectionReason);
    setSubmitting(false);
    if (res.success) {
      toast.success("Application rejected successfully.");
      setShowRejectModal(false);
      setWorkflowStatus("REJECTED");
    } else {
      toast.error(res.message || "Failed to reject application.");
    }
  };

  const handleCertify = async () => {
    setSubmitting(true);
    const res = await setApplicationCertified(applicationId, true);
    setSubmitting(false);
    if (res.success) {
      toast.success("Application certified successfully.");
      setShowCertifyModal(false);
      setWorkflowStatus("CERTIFIED");
    } else {
      toast.error(res.message || "Failed to certify application.");
    }
  };

  if (loading) {
    return (
      <div className="flex h-[80vh] flex-col items-center justify-center space-y-4">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="text-lg font-black text-slate-800 tracking-tight">Gathering committee evaluations...</p>
        <p className="text-sm text-muted-foreground animate-pulse">Calculating aggregated results...</p>
      </div>
    );
  }

  const currentAssignment = appData?.assignments?.[0];

  return (
    <div className="container mx-auto py-8 max-w-[1400px]">
      <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <Button variant="ghost" size="sm" className="mb-2 -ml-2 hover:bg-slate-100" asChild>
            <Link href="/admins-new/applications">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Dashboard
            </Link>
          </Button>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-black tracking-tight text-slate-800">
              Committee Evaluation Audit
            </h1>
            <Badge variant="outline" className="text-[10px] font-black uppercase tracking-widest bg-indigo-50 text-indigo-700 border-indigo-200 px-3">
              Admin View Mode
            </Badge>
          </div>
          <p className="text-muted-foreground mt-2 font-medium">
            Reviewing results for <span className="text-slate-900 font-bold">{appData?.startupName || applicationId}</span>
          </p>
        </div>
        
        <div className="flex items-center gap-3 bg-white p-2 rounded-2xl shadow-sm border border-slate-100">
           {workflowStatus === "COMMITTEE_REVIEW_SUBMITTED" && (
            <>
              <Button variant="destructive" onClick={() => setShowRejectModal(true)} className="font-bold shadow-lg shadow-red-100">
                <ThumbsDown className="mr-2 h-4 w-4" />
                Reject Entity
              </Button>
              <Button onClick={() => setShowCertifyModal(true)} className="bg-emerald-600 hover:bg-emerald-700 text-white font-black shadow-lg shadow-emerald-100 border-none">
                <Award className="mr-2 h-4 w-4" />
                Issue Certificate
              </Button>
            </>
          )}

          {["CERTIFIED", "REJECTED"].includes(workflowStatus) && (
             <div className="flex items-center gap-2 px-2">
               <Badge variant={workflowStatus === "CERTIFIED" ? "success" : "destructive"} className="text-[10px] px-4 py-2 border-2 uppercase font-black tracking-widest">
                 {workflowStatus}
               </Badge>
             </div>
          )}
        </div>
      </div>

      <Tabs defaultValue="results" className="space-y-8">
        <TabsList className="bg-white p-1 h-14 rounded-2xl border-2 border-slate-100 shadow-sm flex items-center justify-start max-w-fit px-2 gap-2">
            <TabsTrigger value="results" className="rounded-xl px-6 h-10 font-black text-xs uppercase tracking-widest data-[state=active]:bg-primary data-[state=active]:text-white transition-all">
                <LayoutDashboard className="h-4 w-4 mr-2" />
                Committee Results
            </TabsTrigger>
            <TabsTrigger value="overview" className="rounded-xl px-6 h-10 font-black text-xs uppercase tracking-widest data-[state=active]:bg-primary data-[state=active]:text-white transition-all">
                <FileText className="h-4 w-4 mr-2" />
                Application Detail
            </TabsTrigger>
            <TabsTrigger value="history" className="rounded-xl px-6 h-10 font-black text-xs uppercase tracking-widest data-[state=active]:bg-primary data-[state=active]:text-white transition-all">
                <Clock className="h-4 w-4 mr-2" />
                Status Timeline
            </TabsTrigger>
        </TabsList>

        {/* ── Committee Results Tab ── */}
        <TabsContent value="results" className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {!resultsData || !resultsData.memberResults || resultsData.memberResults.length === 0 ? (
                <Card className="flex flex-col items-center justify-center p-24 text-center border-dashed border-4 border-slate-200 rounded-[3rem] bg-slate-50/40">
                    <div className="bg-white p-8 rounded-full shadow-xl mb-6 ring-8 ring-slate-100">
                    <Users className="h-16 w-16 text-slate-300" />
                    </div>
                    <h3 className="text-2xl font-black text-slate-800 mb-2">Awaiting Evaluations</h3>
                    <p className="text-muted-foreground max-w-sm font-medium leading-relaxed">
                    The assigned committee members have not yet submitted their formal reviews for this application.
                    </p>
                </Card>
            ) : (
                <div className="space-y-12">
                   {/* Aggregated Header Dashboard */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                    <Card className="bg-primary text-primary-foreground overflow-hidden relative border-none shadow-2xl rounded-[2.5rem] md:col-span-2 group">
                        <div className="absolute right-[-20%] bottom-[-20%] opacity-10 transition-transform duration-700 group-hover:scale-110 group-hover:rotate-6">
                        <TrendingUp size={240} />
                        </div>
                        <CardHeader className="pb-2 pt-8 px-8">
                        <CardTitle className="text-[10px] font-black uppercase tracking-[0.2em] opacity-60">Consolidated System Valuation</CardTitle>
                        </CardHeader>
                        <CardContent className="px-8 pb-10">
                        <div className="text-7xl font-black mb-2 tracking-tighter">
                            {resultsData.overallAverageValuation?.toFixed(1) || "0.0"}
                            <span className="text-2xl opacity-40 ml-4 font-bold tracking-normal">/ {resultsData.totalWeightAvailable}</span>
                        </div>
                        <p className="text-sm font-bold opacity-60 flex items-center gap-2">
                            <Info className="h-4 w-4" /> Mean weighted score across all evaluators
                        </p>
                        </CardContent>
                    </Card>

                    <Card className="bg-slate-900 text-white overflow-hidden relative border-none shadow-2xl rounded-[2.5rem] group">
                        <div className="absolute right-[-20%] bottom-[-20%] opacity-10 transition-transform duration-700 group-hover:scale-110 group-hover:rotate-6">
                        <Award size={240} />
                        </div>
                        <CardHeader className="pb-2 pt-8 px-8">
                        <CardTitle className="text-[10px] font-black uppercase tracking-[0.2em] opacity-40">Excellence Rating</CardTitle>
                        </CardHeader>
                        <CardContent className="px-8 pb-10">
                        <div className="text-7xl font-black mb-2 tracking-tighter">
                            {resultsData.overallAverageRating?.toFixed(1) || "0.0"}
                            <span className="text-2xl opacity-40 ml-3 font-bold tracking-normal">/ 5.0</span>
                        </div>
                        <p className="text-xs font-bold opacity-40 italic tracking-wide">Qualitative consensus average</p>
                        </CardContent>
                    </Card>

                    <Card className="overflow-hidden border-2 border-slate-100 rounded-[2.5rem] shadow-xl bg-white flex flex-col justify-center">
                        <CardContent className="p-8">
                        <div className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-6">Expert Verdict Summary</div>
                        <div className="grid grid-cols-1 gap-4">
                            <div className="flex items-center justify-between p-4 rounded-2xl bg-emerald-50 border border-emerald-100">
                            <div className="flex items-center text-sm font-black text-emerald-700 uppercase tracking-wider">
                                <ThumbsUp className="h-4 w-4 mr-3" /> Approve
                            </div>
                            <span className="text-xl font-black text-emerald-700">{resultsData.memberResults.filter((r: any) => r.recommendation === 'APPROVE').length}</span>
                            </div>
                            <div className="flex items-center justify-between p-4 rounded-2xl bg-rose-50 border border-rose-100">
                            <div className="flex items-center text-sm font-black text-rose-700 uppercase tracking-wider">
                                <ThumbsDown className="h-4 w-4 mr-3" /> Reject
                            </div>
                            <span className="text-xl font-black text-rose-700">{resultsData.memberResults.filter((r: any) => r.recommendation === 'REJECT').length}</span>
                            </div>
                            <div className="flex items-center justify-between p-4 rounded-2xl bg-amber-50 border border-amber-100">
                            <div className="flex items-center text-sm font-black text-amber-700 uppercase tracking-wider">
                                <HelpCircle className="h-4 w-4 mr-3" /> Clarify
                            </div>
                            <span className="text-xl font-black text-amber-700">{resultsData.memberResults.filter((r: any) => r.recommendation === 'MORE_INFO').length}</span>
                            </div>
                        </div>
                        </CardContent>
                    </Card>
                    </div>

                    {/* Verdict Table */}
                    <div className="space-y-6">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                        <div className="bg-primary/10 p-2 rounded-xl">
                            <Users className="h-6 w-6 text-primary" />
                        </div>
                        <h3 className="text-2xl font-black tracking-tight text-slate-800 uppercase">Review Committee Audit</h3>
                        </div>
                    </div>
                    
                    <Card className="border-2 border-slate-100 overflow-hidden shadow-2xl rounded-[2.5rem] bg-white">
                        <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                            <tr className="bg-slate-50/80 border-b border-slate-100">
                                <th className="px-8 py-6 text-left font-black uppercase tracking-[0.15em] text-[10px] text-slate-400">Audited Member</th>
                                <th className="px-8 py-6 text-center font-black uppercase tracking-[0.15em] text-[10px] text-slate-400">Individual Verdict</th>
                                <th className="px-8 py-6 text-center font-black uppercase tracking-[0.15em] text-[10px] text-slate-400">Mean Rating</th>
                                <th className="px-8 py-6 text-center font-black uppercase tracking-[0.15em] text-[10px] text-slate-400">Total Valuation</th>
                                <th className="px-8 py-6 text-left font-black uppercase tracking-[0.15em] text-[10px] text-slate-400">Aggregated Remarks</th>
                            </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                            {resultsData.memberResults.map((result: any) => (
                                <tr key={result.memberId} className="group hover:bg-slate-50/50 transition-all duration-300">
                                <td className="px-8 py-6">
                                    <div className="flex flex-col gap-1">
                                    <div className="flex items-center gap-3">
                                        <span className="text-slate-900 font-black text-base">{result.memberName}</span>
                                        {result.isChair && (
                                        <Badge className="bg-indigo-600 text-white border-none font-black uppercase text-[8px] tracking-[0.15em] px-2 py-0.5">
                                            Chair
                                        </Badge>
                                        )}
                                        <Button 
                                            variant="ghost" 
                                            size="sm" 
                                            className="h-8 w-8 p-0 rounded-xl hover:bg-indigo-100 hover:text-indigo-600 transition-colors"
                                            onClick={() => {
                                            setSelectedMemberProfile(result);
                                            setShowProfileModal(true);
                                            }}
                                        >
                                            <Eye className="h-4 w-4" />
                                        </Button>
                                    </div>
                                    <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground font-bold italic">
                                        <Mail className="h-3 w-3 opacity-40" />
                                        {result.email}
                                    </div>
                                    </div>
                                </td>
                                <td className="px-8 py-6 text-center">
                                    <Badge variant={
                                    result.recommendation === 'APPROVE' ? 'default' : 
                                    result.recommendation === 'REJECT' ? 'destructive' : 'outline'
                                    } className="font-black px-4 py-1.5 uppercase text-[9px] tracking-widest border-2 shadow-sm rounded-lg border-slate-100">
                                    {result.recommendation || 'PENDING'}
                                    </Badge>
                                </td>
                                <td className="px-8 py-6 text-center">
                                    <div className="inline-flex flex-col items-center">
                                    <div className="text-lg font-black text-slate-800">{result.averageRating?.toFixed(1) || "0.0"}</div>
                                    <div className="text-[10px] font-bold text-slate-400 uppercase">/ 5.0</div>
                                    </div>
                                </td>
                                <td className="px-8 py-6 text-center">
                                    <div className="inline-flex flex-col items-center">
                                    <div className="text-2xl font-black text-indigo-600 tracking-tighter">{result.totalValuation?.toFixed(1)}</div>
                                    <div className="text-[10px] font-bold text-slate-400 uppercase">Points</div>
                                    </div>
                                </td>
                                <td className="px-8 py-6">
                                    <div className="max-w-xs p-4 rounded-2xl bg-slate-50 border border-slate-100 italic text-slate-500 text-xs leading-relaxed transform transition-transform group-hover:translate-x-1">
                                    {result.overallComment ? `"${result.overallComment}"` : <span className="opacity-30">No session remarks provided</span>}
                                    </div>
                                </td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                        </div>
                    </Card>
                    </div>

                    {/* Detailed Member Evaluations */}
                    <div className="space-y-6">
                    <div className="flex items-center gap-3">
                        <div className="bg-primary/10 p-2 rounded-xl">
                            <ClipboardCheck className="h-6 w-6 text-primary" />
                        </div>
                        <h3 className="text-2xl font-black tracking-tight text-slate-800 uppercase">Task Breakdown</h3>
                    </div>

                    <Accordion type="single" collapsible className="grid grid-cols-1 gap-6">
                        {resultsData.memberResults.map((result: any, idx: number) => (
                        <AccordionItem key={result.memberId} value={result.memberId} className="border-none">
                            <Card className="rounded-[2.5rem] overflow-hidden border-2 border-slate-100 shadow-xl bg-white hover:border-primary/20 transition-all group">
                            <AccordionTrigger className="px-8 py-8 hover:no-underline hover:bg-slate-50/50 transition-colors">
                                <div className="flex items-center gap-6 text-left">
                                <div className="bg-slate-900 h-14 w-14 rounded-2xl flex items-center justify-center font-black text-white text-xl shadow-2xl shadow-slate-200 group-hover:scale-110 transition-transform">
                                    {idx + 1}
                                </div>
                                <div>
                                    <div className="flex items-center gap-3 mb-1">
                                        <span className="font-black text-2xl text-slate-900 tracking-tight">{result.memberName}</span>
                                        {result.isChair && (
                                        <Badge className="bg-indigo-500 text-white border-none font-black text-[9px] uppercase tracking-widest px-3">
                                            Chairman
                                        </Badge>
                                        )}
                                    </div>
                                    <div className="flex items-center gap-4">
                                    <div className="flex items-center gap-1.5 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                        <CheckSquare className="h-3 w-3" /> {result.criteriaScores?.length || 0} Criteria
                                    </div>
                                    <div className="h-1 w-1 rounded-full bg-slate-300"></div>
                                    <div className="flex items-center gap-1.5 text-[10px] font-black text-indigo-600 uppercase tracking-widest">
                                        <TrendingUp className="h-3 w-3" /> {result.totalValuation?.toFixed(1)} Points
                                    </div>
                                    </div>
                                </div>
                                </div>
                            </AccordionTrigger>
                            <AccordionContent className="p-0 border-t border-slate-100 bg-slate-50/30">
                                <div className="p-8">
                                <div className="overflow-hidden rounded-[2rem] border-2 border-slate-100 bg-white shadow-sm ring-4 ring-white">
                                    <table className="w-full text-sm">
                                    <thead>
                                        <tr className="bg-slate-50/50 border-b border-slate-100">
                                        <th className="px-6 py-5 text-left font-black uppercase text-[10px] tracking-[0.15em] text-slate-400 w-[40%]">Criteria</th>
                                        <th className="px-6 py-5 text-center font-black uppercase text-[10px] tracking-[0.15em] text-slate-400 w-[15%]">Rating</th>
                                        <th className="px-6 py-5 text-center font-black uppercase text-[10px] tracking-[0.15em] text-slate-400 w-[15%]">Value</th>
                                        <th className="px-6 py-5 text-left font-black uppercase text-[10px] tracking-[0.15em] text-slate-400 w-[30%]">Justification</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {result.criteriaScores?.length > 0 ? result.criteriaScores.map((score: any, sIdx: number) => {
                                        const critInfo = resultsData.criteria?.find((c: any) => c.id === score.criterionId);
                                        return (
                                            <tr key={sIdx} className="hover:bg-slate-50/50 transition-colors">
                                            <td className="px-6 py-5">
                                                <div className="font-black text-slate-800 text-base">{critInfo?.name || "Requirement"}</div>
                                                {critInfo?.weight && (
                                                <div className="inline-block mt-2 px-3 py-1 bg-slate-100 rounded-lg text-[9px] font-black text-slate-500 uppercase tracking-widest">
                                                    Weight: {critInfo.weight}
                                                </div>
                                                )}
                                            </td>
                                            <td className="px-6 py-5 text-center">
                                                <div className={`inline-flex items-center justify-center w-12 h-10 rounded-2xl font-black border-2 shadow-inner ${
                                                score.score >= 4 ? 'bg-emerald-50 border-emerald-200 text-emerald-700' :
                                                score.score <= 2 ? 'bg-rose-50 border-rose-200 text-rose-700' :
                                                'bg-amber-50 border-amber-200 text-amber-700'
                                                }`}>
                                                <span className="text-lg">{score.score}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-5 text-center font-black text-slate-900 text-lg tracking-tight">
                                                {score.valuation?.toFixed(1)}
                                            </td>
                                            <td className="px-6 py-5">
                                                <div className="text-xs italic text-slate-600 leading-relaxed font-medium p-4 bg-slate-50/50 rounded-2xl border border-dashed border-slate-200">
                                                {score.comment ? `"${score.comment}"` : <span className="opacity-30 italic">No justification provided</span>}
                                                </div>
                                            </td>
                                            </tr>
                                        );
                                        }) : (
                                            <tr>
                                                <td colSpan={4} className="py-10 text-center text-slate-400 font-bold italic">No criteria scores found for this member eval.</td>
                                            </tr>
                                        )}
                                    </tbody>
                                    </table>
                                </div>
                        
                                {result.overallComment && (
                                    <div className="mt-8 p-6 bg-slate-900 rounded-[2rem] text-white relative overflow-hidden group">
                                    <div className="absolute top-0 right-0 p-6 opacity-10 rotate-12 transition-transform group-hover:rotate-0 duration-500">
                                        <Info size={100} />
                                    </div>
                                    <div className="relative z-10">
                                        <h5 className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40 mb-3">Overall Evaluator Remark</h5>
                                        <p className="text-sm italic font-medium leading-relaxed text-indigo-50">"{result.overallComment}"</p>
                                    </div>
                                    </div>
                                )}
                                </div>
                            </AccordionContent>
                            </Card>
                        </AccordionItem>
                        ))}
                    </Accordion>
                    </div>
                </div>
            )}
        </TabsContent>

        {/* ── Overview Tab (borrowed from app review) ── */}
        <TabsContent value="overview" className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 [content-visibility:auto]">
            <div className="grid gap-8 lg:grid-cols-3">
                <div className="lg:col-span-2 space-y-8">
                    {/* Organization Summary */}
                    <Card className="rounded-[2.5rem] border-2 border-slate-100 shadow-xl overflow-hidden">
                        <CardHeader className="bg-slate-50/50 border-b border-slate-100 p-8">
                            <CardTitle className="flex items-center gap-3 text-2xl font-black">
                                <Building className="h-6 w-6 text-primary" />
                                Corporate Identity & Operations
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-8">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-sm">
                                <div className="space-y-6">
                                    <div>
                                        <Label className="text-[10px] font-black uppercase text-slate-400 tracking-widest block mb-2">Legal Business Name</Label>
                                        <p className="text-lg font-black text-slate-800">{renderText(appData?.startupName)}</p>
                                    </div>
                                    <div>
                                        <Label className="text-[10px] font-black uppercase text-slate-400 tracking-widest block mb-2">Business Registration #</Label>
                                        <p className="text-base font-bold text-slate-700">{renderText(appData?.businessLicense)}</p>
                                    </div>
                                    <div>
                                        <Label className="text-[10px] font-black uppercase text-slate-400 tracking-widest block mb-2">TIN Registration</Label>
                                        <p className="text-base font-bold text-slate-700">{renderText(appData?.tin)}</p>
                                    </div>
                                    <div>
                                        <Label className="text-[10px] font-black uppercase text-slate-400 tracking-widest block mb-2">Capital (ETB)</Label>
                                        <p className="text-base font-bold text-slate-700">{renderText(appData?.vision)}</p>
                                    </div>
                                </div>
                                <div className="space-y-6">
                                    <div>
                                        <Label className="text-[10px] font-black uppercase text-slate-400 tracking-widest block mb-2">Industry Sector</Label>
                                        <p className="text-lg font-black text-slate-800">{renderText(appData?.industry)}</p>
                                    </div>
                                    <div>
                                        <Label className="text-[10px] font-black uppercase text-slate-400 tracking-widest block mb-2">Company Stage</Label>
                                        <p className="text-base font-bold text-slate-700">{renderText(appData?.typeOfCompany)}</p>
                                    </div>
                                    <div>
                                        <Label className="text-[10px] font-black uppercase text-slate-400 tracking-widest block mb-2">Total Employees</Label>
                                        <p className="text-base font-bold text-slate-700">{appData?.numberOfEmployees ?? "Not stated"}</p>
                                    </div>
                                    <div>
                                        <Label className="text-[10px] font-black uppercase text-slate-400 tracking-widest block mb-2">Founding Date</Label>
                                        <p className="text-base font-bold text-slate-700">{appData?.foundingDate ? format(new Date(appData.foundingDate), "PPP") : "N/A"}</p>
                                    </div>
                                </div>
                            </div>

                            <Separator className="my-10" />

                            <div className="space-y-8">
                                <div>
                                    <Label className="text-[10px] font-black uppercase text-slate-400 tracking-widest block mb-3">Product/Service Mission</Label>
                                    <div className="p-6 rounded-[2rem] bg-slate-50 border-2 border-slate-100 italic text-slate-600 leading-relaxed font-medium">
                                        "{renderText(appData?.productDescription)}"
                                    </div>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                     <div>
                                        <Label className="text-[10px] font-black uppercase text-slate-400 tracking-widest block mb-3">Core Innovation</Label>
                                        <p className="text-sm leading-relaxed text-slate-600">{renderText(appData?.innovationDescription)}</p>
                                    </div>
                                    <div>
                                        <Label className="text-[10px] font-black uppercase text-slate-400 tracking-widest block mb-3">Target Market</Label>
                                        <p className="text-sm leading-relaxed text-slate-600">{renderText(appData?.targetMarket)}</p>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Founders */}
                    <Card className="rounded-[2.5rem] border-2 border-slate-100 shadow-xl overflow-hidden">
                         <CardHeader className="bg-slate-50/50 border-b border-slate-100 p-8">
                            <CardTitle className="flex items-center gap-3 text-2xl font-black">
                                <Users className="h-6 w-6 text-primary" />
                                Founding Team
                                <Badge className="ml-2 bg-slate-900 text-white rounded-full px-3">{appData?.founders?.length || 0}</Badge>
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-8 grid grid-cols-1 md:grid-cols-2 gap-6">
                            {appData?.founders?.map((founder: any) => (
                                <div key={founder.id} className="p-6 rounded-3xl border-2 border-slate-50 bg-white shadow-sm flex items-start gap-4">
                                    <div className="bg-slate-100 h-12 w-12 rounded-2xl flex items-center justify-center font-black text-slate-400">
                                        {founder.fullName.substring(0, 1)}
                                    </div>
                                    <div className="space-y-1">
                                        <p className="font-black text-slate-800">{founder.fullName}</p>
                                        <p className="text-[10px] font-black uppercase text-indigo-600 tracking-widest">{founder.role || "Co-Founder"}</p>
                                        <div className="pt-2 flex flex-col gap-1 text-[11px] text-slate-500 font-bold">
                                            <span className="flex items-center gap-2"><Mail className="h-3 w-3" /> {founder.email}</span>
                                            <span className="flex items-center gap-2"><Phone className="h-3 w-3" /> {founder.phone}</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </CardContent>
                    </Card>

                    {/* Financials */}
                    <Card className="rounded-[2.5rem] border-2 border-slate-100 shadow-xl overflow-hidden">
                        <CardHeader className="bg-slate-50/50 border-b border-slate-100 p-8">
                            <CardTitle className="text-xl font-black uppercase tracking-widest">Financial Disclosure</CardTitle>
                        </CardHeader>
                        <CardContent className="p-8 grid grid-cols-1 md:grid-cols-2 gap-10">
                            <div className="space-y-6">
                                <div>
                                    <Label className="text-[10px] font-black uppercase text-slate-400 tracking-widest block mb-2 text-rose-600">Total Funding Raised</Label>
                                    <p className="text-2xl font-black text-slate-800">ETB {renderText(appData?.totalFundingRaised)}</p>
                                </div>
                                <div>
                                    <Label className="text-[10px] font-black uppercase text-slate-400 tracking-widest block mb-2 text-indigo-600">Investment Needed</Label>
                                    <p className="text-2xl font-black text-slate-800">ETB {renderText(appData?.investmentNeeded)}</p>
                                </div>
                            </div>
                            <div className="space-y-3">
                                <Label className="text-[10px] font-black uppercase text-slate-400 tracking-widest block">Proposed Use of Funds</Label>
                                <p className="text-sm leading-relaxed text-slate-600 italic">"{renderText(appData?.useOfFunds)}"</p>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Documentation */}
                    <Card className="rounded-[2.5rem] border-2 border-slate-100 shadow-xl overflow-hidden">
                        <CardHeader className="bg-slate-50/50 border-b border-slate-100 p-8">
                             <CardTitle className="flex items-center gap-3 text-2xl font-black">
                                <FileText className="h-6 w-6 text-primary" />
                                Vital Documentation
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-8">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {[
                                    { label: "Business License", id: appData?.businessLicenseFileId },
                                    { label: "Articles of Incorporation", id: appData?.articlesOfIncorpFileId },
                                    { label: "Pitch Deck", id: appData?.pitchDeckFileId },
                                    { label: "Financial Statements", id: appData?.financialsFileId },
                                ].map((doc, dIdx) => (
                                    <div key={dIdx} className="p-6 rounded-[2rem] border-2 border-slate-100 bg-white shadow-sm flex items-center justify-between group hover:border-primary/20 transition-all">
                                        <div className="flex items-center gap-4">
                                            <div className="bg-slate-100 p-3 rounded-2xl text-slate-400 group-hover:bg-primary/10 group-hover:text-primary transition-all">
                                                <FileText className="h-5 w-5" />
                                            </div>
                                            <div>
                                                <p className="font-black text-slate-800 text-sm">{doc.label}</p>
                                                <p className="text-[10px] font-bold text-slate-400 uppercase">Verification Required</p>
                                            </div>
                                        </div>
                                        {doc.id ? (
                                             <Button variant="ghost" size="sm" asChild className="h-10 w-10 p-0 rounded-xl hover:bg-slate-100">
                                                <Link href={`/api/files/${doc.id}`} target="_blank">
                                                    <Download className="h-4 w-4 text-primary" />
                                                </Link>
                                             </Button>
                                        ) : (
                                            <Badge variant="outline" className="text-[9px] font-black opacity-30">Missing</Badge>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <div className="space-y-8">
                    {/* Public Contact */}
                     <Card className="rounded-[2.5rem] border-2 border-slate-100 shadow-xl overflow-hidden bg-slate-900 text-white border-none">
                        <CardHeader className="border-b border-white/10 p-8">
                            <CardTitle className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40">Point of Contact</CardTitle>
                        </CardHeader>
                        <CardContent className="p-8 space-y-6">
                            <div className="flex items-start gap-4">
                                <div className="bg-white/10 p-3 rounded-2xl">
                                    <Mail className="h-5 w-5 text-primary" />
                                </div>
                                <div>
                                    <p className="text-[9px] font-black uppercase text-white/30 tracking-widest mb-1">Email</p>
                                    <p className="font-bold text-sm truncate">{appData?.email}</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-4">
                                <div className="bg-white/10 p-3 rounded-2xl">
                                    <Phone className="h-5 w-5 text-emerald-400" />
                                </div>
                                <div>
                                    <p className="text-[9px] font-black uppercase text-white/30 tracking-widest mb-1">Phone</p>
                                    <p className="font-bold text-sm">{appData?.phoneNumber}</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-4">
                                <div className="bg-white/10 p-3 rounded-2xl">
                                    <ExternalLink className="h-5 w-5 text-blue-400" />
                                </div>
                                <div>
                                    <p className="text-[9px] font-black uppercase text-white/30 tracking-widest mb-1">Website</p>
                                    <a href={appData?.website || "#"} target="_blank" className="font-bold text-sm text-blue-400 hover:underline">{appData?.website || "No URL provided"}</a>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Committee Assignment Side Card */}
                    {currentAssignment && (
                        <Card className="rounded-[2.5rem] border-2 border-slate-100 shadow-xl overflow-hidden bg-white">
                             <CardHeader className="bg-indigo-50/50 border-b border-indigo-100 p-8">
                                <CardTitle className="text-base font-black uppercase tracking-widest text-indigo-900">Assigned Committee</CardTitle>
                            </CardHeader>
                            <CardContent className="p-8 space-y-6">
                                <div className="flex flex-col gap-1">
                                    <p className="font-black text-xl text-indigo-950">{currentAssignment.committee?.name}</p>
                                    <Badge variant="secondary" className="max-w-fit uppercase font-black text-[9px] tracking-widest bg-indigo-100 text-indigo-700">{currentAssignment.committee?.entityType}</Badge>
                                </div>
                                <div className="pt-4 space-y-4 border-t border-slate-100">
                                     <div className="flex justify-between items-center text-xs">
                                        <span className="font-bold text-slate-400 uppercase tracking-widest">Chairperson</span>
                                        <span className="font-black text-slate-800">Assignee ID #{currentAssignment.chairMemberId?.substring(0,8)}</span>
                                    </div>
                                    <div className="flex justify-between items-center text-xs">
                                        <span className="font-bold text-slate-400 uppercase tracking-widest">Assignment date</span>
                                        <span className="font-black text-slate-800">{format(new Date(currentAssignment.assignedAt), "MMM d, yyyy")}</span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {/* Review Status Progress */}
                    <Card className="rounded-[2.5rem] border-2 border-slate-100 shadow-xl overflow-hidden bg-white">
                        <CardHeader className="p-8 pb-4">
                            <CardTitle className="text-sm font-black uppercase tracking-widest text-slate-400">Current Phase</CardTitle>
                        </CardHeader>
                        <CardContent className="p-8 pt-0 space-y-6">
                             <div className="text-3xl font-black text-primary tracking-tighter">
                                {workflowStatus.replace(/_/g, " ")}
                            </div>
                            <div className="space-y-2">
                                <Progress value={75} className="h-3 rounded-full bg-slate-100" />
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Progress audit: 75% completed</p>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </TabsContent>

        {/* ── Status History Tab ── */}
        <TabsContent value="history" className="animate-in fade-in duration-500">
            <Card className="rounded-[2.5rem] border-2 border-slate-100 shadow-2xl overflow-hidden bg-white">
                <CardHeader className="p-10 border-b border-slate-50 bg-slate-50/30">
                    <CardTitle className="text-2xl font-black tracking-tight flex items-center gap-3">
                        <Clock className="h-7 w-7 text-primary" />
                        Application Lifecycle Timeline
                    </CardTitle>
                    <CardDescription className="text-slate-500 font-medium">Record of all administrative status transitions and recorded comments.</CardDescription>
                </CardHeader>
                <CardContent className="p-10">
                    {appData?.statusHistory?.length > 0 ? (
                        <div className="relative pl-8 space-y-12 before:absolute before:left-0 before:top-0 before:h-full before:w-[2px] before:bg-slate-100 border-none outline-none">
                            {appData.statusHistory.map((history: any, hIdx: number) => (
                                <div key={history.id} className="relative group">
                                    {/* Timeline dot */}
                                    <div className="absolute -left-[37px] top-1.5 h-4 w-4 rounded-full bg-white border-4 border-primary shadow-sm z-10 transition-transform group-hover:scale-125" />
                                    
                                    <div className="space-y-3">
                                        <div className="flex items-center gap-4">
                                             <Badge className="bg-slate-900 text-white font-black uppercase px-4 py-1.5 text-[10px] tracking-widest rounded-xl">
                                                {history.status.replace(/_/g, " ")}
                                            </Badge>
                                            <span className="text-xs font-black text-slate-400 uppercase tracking-widest">
                                                {format(new Date(history.createdAt), "PPP p")}
                                            </span>
                                        </div>
                                        <div className="p-6 rounded-[2rem] bg-slate-50 border-2 border-slate-100 italic text-slate-600 text-sm leading-relaxed font-medium transition-colors hover:bg-slate-100/50">
                                            "{history.comment || "No supplementary comment provided for this transition."}"
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-20 bg-slate-50 rounded-[2.5rem] border-2 border-dashed border-slate-200">
                            <Info className="h-12 w-12 text-slate-300 mx-auto mb-4" />
                            <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">No history records detected for this entity.</p>
                        </div>
                    )}
                </CardContent>
            </Card>
        </TabsContent>
        </Tabs>

      {/* Reject Modal */}
      <Dialog open={showRejectModal} onOpenChange={setShowRejectModal}>
        <DialogContent className="sm:max-w-[500px] rounded-3xl p-0 overflow-hidden border-none shadow-2xl">
          <div className="bg-red-600 p-8 text-white">
            <DialogTitle className="text-2xl font-black flex items-center">
              <ThumbsDown className="mr-3 h-6 w-6" /> Reject Application
            </DialogTitle>
            <DialogDescription className="text-red-100 font-medium mt-1">
              Final decision to deny certification for {appData?.startupName}.
            </DialogDescription>
          </div>
          <div className="p-8 bg-white space-y-4">
            <div className="space-y-2">
              <Label htmlFor="rejectReason" className="font-black text-[10px] uppercase tracking-widest text-slate-500">Official Rejection Reason</Label>
              <Textarea 
                id="rejectReason" 
                placeholder="State the core reasons based on the committee evaluation..."
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                className="resize-none h-32 border-2 rounded-2xl p-4 focus:ring-red-500"
              />
            </div>
            
            <DialogFooter className="pt-4 border-t gap-2 sm:gap-0">
              <Button variant="ghost" onClick={() => setShowRejectModal(false)} disabled={submitting} className="font-bold text-slate-600">Cancel</Button>
              <Button variant="destructive" onClick={handleReject} disabled={submitting || !rejectionReason.trim()} className="font-black px-8 rounded-xl shadow-lg shadow-red-100 transition-all active:scale-95">
                {submitting ? "Rejecting..." : "Confirm Rejection"}
              </Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>

      {/* Certify Modal */}
      <Dialog open={showCertifyModal} onOpenChange={setShowCertifyModal}>
        <DialogContent className="sm:max-w-[450px] p-0 overflow-hidden border-none shadow-2xl rounded-3xl max-h-[85vh] flex flex-col [&>button]:text-white [&>button]:opacity-80 [&>button]:hover:opacity-100 [&>button]:transition-all">
          <div className="bg-gradient-to-r from-sky-500 to-blue-600 p-5 pr-12 text-white shrink-0">
            <div className="flex items-center gap-3">
              <div className="bg-white/20 p-2 rounded-xl backdrop-blur-md">
                <Award className="h-5 w-5 text-white" />
              </div>
              <div>
                <DialogTitle className="text-lg font-black text-white tracking-tight leading-none">Issue Certificate</DialogTitle>
                <DialogDescription className="text-sky-100 font-bold text-[10px] mt-1 opacity-80">
                  {appData?.startupName} status grant
                </DialogDescription>
              </div>
            </div>
          </div>

          <div className="p-5 bg-white space-y-4 overflow-y-auto">
            {/* Horizontal Stats Row */}
            <div className="grid grid-cols-2 gap-3">
              <div className="flex items-center gap-3 p-3 rounded-2xl bg-sky-50 border border-sky-100">
                <div className="bg-white p-2 rounded-lg shadow-sm">
                  <TrendingUp className="h-4 w-4 text-sky-600" />
                </div>
                <div>
                  <p className="text-[8px] font-black text-sky-500 uppercase tracking-widest leading-none mb-1">Score</p>
                  <p className="text-sm font-black text-slate-800 leading-none">{resultsData?.overallAverageValuation?.toFixed(1) || "0.0"}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 rounded-2xl bg-blue-50 border border-blue-100">
                <div className="bg-white p-2 rounded-lg shadow-sm">
                  <CheckCircle2 className="h-4 w-4 text-blue-600" />
                </div>
                <div>
                  <p className="text-[8px] font-black text-blue-500 uppercase tracking-widest leading-none mb-1">Status</p>
                  <p className="text-sm font-black text-slate-800 leading-none uppercase">Qualified</p>
                </div>
              </div>
            </div>

            {/* Verification Alert */}
            <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 border border-slate-100">
              <ShieldCheck className="h-5 w-5 text-blue-500 shrink-0" />
              <p className="text-[10px] font-bold text-slate-500 leading-tight">
                Finalizing this will generate a unique QR-secured certificate and notify the founders.
              </p>
            </div>

            <DialogFooter className="flex-row items-center gap-3 sm:gap-3 mt-2 border-t pt-4">
              <Button
                variant="ghost"
                onClick={() => setShowCertifyModal(false)}
                disabled={submitting}
                className="flex-1 h-10 font-bold text-slate-400 hover:bg-slate-50 rounded-xl transition-all"
              >
                No, Cancel
              </Button>
              <Button
                className="flex-[1.5] bg-gradient-to-r from-sky-600 to-blue-700 hover:from-sky-700 hover:to-blue-800 text-white h-10 font-black rounded-xl shadow-lg shadow-blue-100 transition-all active:scale-95"
                onClick={handleCertify}
                disabled={submitting}
              >
                {submitting ? (
                  <RefreshCw className="h-4 w-4 animate-spin" />
                ) : (
                  "Confirm & Issue"
                )}
              </Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>

      {/* ── Member Profile View Modal ── */}
      <Dialog open={showProfileModal} onOpenChange={setShowProfileModal}>
        <DialogContent className="sm:max-w-[425px] overflow-hidden p-0 rounded-[2.5rem] border-none shadow-2xl">
          <div className="bg-gradient-to-br from-slate-800 to-slate-950 p-10 text-white relative">
            <div className="relative z-10 flex flex-col items-center text-center">
              <Avatar className="h-28 w-28 border-4 border-white/10 shadow-2xl mb-6 ring-4 ring-white/5">
                <AvatarFallback className="text-4xl bg-indigo-600 font-black text-white">
                  {selectedMemberProfile?.memberName?.substring(0, 2).toUpperCase() || "CM"}
                </AvatarFallback>
              </Avatar>
              <h3 className="text-3xl font-black tracking-tight">{selectedMemberProfile?.memberName}</h3>
              <div className="flex items-center gap-2 mt-3">
                <Badge className="bg-white/10 text-white border-none font-bold uppercase text-[10px] tracking-widest px-4 py-1 rounded-full backdrop-blur-sm">
                  {selectedMemberProfile?.userRole || "Committee Member"}
                </Badge>
              </div>
            </div>
          </div>
          
          <div className="p-10 bg-white space-y-8">
            <div className="grid grid-cols-1 gap-6">
              <div className="flex items-start gap-4 p-5 rounded-3xl bg-slate-50 border border-slate-100 group transition-all hover:bg-slate-100/50">
                <Mail className="h-6 w-6 text-indigo-600" />
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Official Email</p>
                  <p className="text-base font-black text-slate-700">{selectedMemberProfile?.email || "N/A"}</p>
                </div>
              </div>

              <div className="flex items-start gap-4 p-5 rounded-3xl bg-slate-50 border border-slate-100 group transition-all hover:bg-slate-100/50">
                <Phone className="h-6 w-6 text-indigo-600" />
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Primary Contact</p>
                  <p className="text-base font-black text-slate-700">{selectedMemberProfile?.phoneNumber || "Not Provisioned"}</p>
                </div>
              </div>
            </div>

            <Button className="w-full h-16 bg-slate-900 hover:bg-slate-800 text-white font-black rounded-[1.5rem]" onClick={() => setShowProfileModal(false)}>
              Close Profile
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default function StartupAdminResultPage() {
  return (
    <Suspense fallback={
      <div className="flex h-screen w-full flex-col items-center justify-center space-y-4">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="text-muted-foreground font-black text-xs uppercase tracking-widest animate-pulse">Initializing Result Engine...</p>
      </div>
    }>
      <ResultContent />
    </Suspense>
  );
}
