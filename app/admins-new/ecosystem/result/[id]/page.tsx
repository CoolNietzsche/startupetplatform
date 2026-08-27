"use client";

import React, { useState, useEffect, useCallback, Suspense } from "react";
import { useParams, useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
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
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { getAssessmentResults } from "@/app/committee-portal/dashboard/actions";
import { getEcosystemApplicationReviewById, finalizeEcosystemApplication } from "../../ecosystem-actions";
import { toast } from "sonner";

function ResultContent() {
  const { id } = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  
  const builderId = searchParams.get("builderId");
  const applicationId = id as string;
  
  const [loading, setLoading] = useState(true);
  const [resultsData, setResultsData] = useState<any>(null);
  const [workflowStatus, setWorkflowStatus] = useState<string>("");
  
  // Modal states
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [showCertifyModal, setShowCertifyModal] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const fetchResults = useCallback(async () => {
    try {
      setLoading(true);
      const [appResult, assessmentResult] = await Promise.all([
        getEcosystemApplicationReviewById({ applicationId }),
        getAssessmentResults(applicationId)
      ]);
      
      if (appResult.success && appResult.data) {
        setWorkflowStatus((appResult.data as any).workflowStatus);
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

  const reviewHref = `/admins-new/ecosystem/review/${applicationId}`;
  const certificateHref = `/admins-new/ecosystem/${builderId}?applicationId=${applicationId}&tab=certification`;

  const handleReject = async () => {
    if (!rejectionReason.trim()) {
      toast.error("Please provide a rejection reason.");
      return;
    }
    setSubmitting(true);
    const res = await finalizeEcosystemApplication({
      applicationId,
      status: "REJECTED",
      reason: rejectionReason
    });
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
    const res = await finalizeEcosystemApplication({
      applicationId,
      status: "CERTIFIED"
    });
    setSubmitting(false);
    if (res.success) {
      toast.success("Application certified successfully.");
      setShowCertifyModal(false);
      setWorkflowStatus("CERTIFIED");
      // Redirect to certification page to let them view/print the certificate
      router.push(certificateHref);
    } else {
      toast.error(res.message || "Failed to certify application.");
    }
  };

  if (loading) {
    return (
      <div className="flex h-[50vh] flex-col items-center justify-center space-y-4">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        <p className="text-sm font-medium text-muted-foreground">Loading assessment results...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 max-w-[1400px]">
      <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <Button variant="ghost" size="sm" className="mb-2 -ml-2" asChild>
            <Link href={reviewHref}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Application Detail
            </Link>
          </Button>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-black tracking-tight text-slate-800">
              Ecosystem Assessment Results
            </h1>
            <Badge variant="outline" className="text-xs uppercase bg-primary/5 text-primary">
              Completed Phase
            </Badge>
          </div>
          <p className="text-muted-foreground mt-2 font-medium">
            Consolidated evaluation from the committee for {resultsData?.applicationName || 'the application'}
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <Button variant="outline" asChild>
            <Link href={reviewHref}>
              <FileText className="mr-2 h-4 w-4" />
              View Application
            </Link>
          </Button>
          
          {workflowStatus === "COMMITTEE_REVIEW_SUBMITTED" && (
            <>
              <Button variant="destructive" onClick={() => setShowRejectModal(true)}>
                <ThumbsDown className="mr-2 h-4 w-4" />
                Reject
              </Button>
              <Button onClick={() => setShowCertifyModal(true)} className="bg-green-600 hover:bg-green-700 text-white font-bold">
                <Award className="mr-2 h-4 w-4" />
                Issue Certificate
              </Button>
            </>
          )}

          {["CERTIFIED", "REJECTED"].includes(workflowStatus) && (
             <div className="flex items-center gap-2">
               <Badge variant={workflowStatus === "CERTIFIED" ? "success" : "destructive"} className="text-sm px-4 py-2 border-2 uppercase font-black tracking-widest">
                 {workflowStatus}
               </Badge>
               {workflowStatus === "CERTIFIED" && (
                 <Link href={`/admins-new/certifications?search=${resultsData?.applicationName}`}>
                   <Button variant="outline" size="sm" className="font-bold">
                     <Award className="mr-2 h-4 w-4" />
                     View Certificate
                   </Button>
                 </Link>
               )}
             </div>
          )}
        </div>
      </div>

      {/* Reject Modal */}
      <Dialog open={showRejectModal} onOpenChange={setShowRejectModal}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="text-red-600 flex items-center">
              <ThumbsDown className="mr-2 h-5 w-5" /> Reject Application
            </DialogTitle>
            <DialogDescription>
              Provide a detailed reason for rejecting {resultsData?.applicationName}. This will finalize the workflow status.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="rejectReason" className="font-bold">Rejection Reason</Label>
              <Textarea 
                id="rejectReason" 
                placeholder="State the core reasons based on the committee evaluation..."
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                className="resize-none h-32"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowRejectModal(false)} disabled={submitting}>Cancel</Button>
            <Button variant="destructive" onClick={handleReject} disabled={submitting || !rejectionReason.trim()}>
              {submitting ? "Rejecting..." : "Confirm Rejection"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Certify Modal */}
      <Dialog open={showCertifyModal} onOpenChange={setShowCertifyModal}>
        <DialogContent className="sm:max-w-[700px] p-0 overflow-y-auto max-h-[95vh] border-none shadow-2xl">
          <div className="bg-gradient-to-br from-green-600 to-emerald-700 p-8 text-white">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="bg-white/20 p-2 rounded-lg backdrop-blur-sm">
                  <Award className="h-7 w-7 text-white" />
                </div>
                <div>
                  <DialogTitle className="text-2xl font-black text-white">Issue Official Certificate</DialogTitle>
                  <DialogDescription className="text-green-50/80 font-medium">
                    Finalize assessment and grant official status
                  </DialogDescription>
                </div>
              </div>
              <Badge className="bg-white/20 text-white border-white/30 backdrop-blur-sm h-8 px-3">
                Ecosystem Builder
              </Badge>
            </div>
          </div>

          <div className="p-8 bg-slate-50">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
              {/* Preview Side */}
              <div className="space-y-4">
                <Label className="text-[10px] font-black uppercase text-slate-500 tracking-wider">Document Preview</Label>
                <div className="aspect-[1/1.414] bg-white rounded-xl shadow-inner border-2 border-dashed border-slate-200 flex flex-col items-center justify-center p-6 text-center group cursor-pointer hover:border-green-300 transition-colors">
                  <div className="scale-75 origin-center transform transition-transform group-hover:scale-90">
                     <div className="border-[8px] border-emerald-600 p-4 w-full h-full bg-white relative">
                        <div className="border-2 border-emerald-600/30 p-2 h-full flex flex-col items-center">
                           <ShieldCheck className="h-10 w-10 text-emerald-600 mb-2" />
                           <div className="text-[8px] font-black text-emerald-800 uppercase tracking-tighter mb-1">Republic of Ethiopia</div>
                           <div className="text-[6px] font-medium text-slate-500 mb-4">Ministry of Innovation & Technology</div>
                           <div className="w-12 h-[1px] bg-emerald-600 mb-4" />
                           <div className="text-[10px] font-black text-slate-800 uppercase mb-1">CERTIFICATE</div>
                           <div className="text-[6px] font-bold text-slate-400 mb-4 tracking-[0.2em] uppercase">OF EXCELLENCE</div>
                           <div className="text-[5px] text-slate-400 italic mb-1">This is to certify that</div>
                           <div className="text-[9px] font-black text-emerald-700 underline underline-offset-4 mb-2">{resultsData?.applicationName}</div>
                           <div className="text-[5px] text-slate-500 text-center px-4 leading-[1.4]">has successfully met all established criteria for official Ecosystem Builder status.</div>
                        </div>
                     </div>
                  </div>
                  <div className="absolute inset-0 bg-white/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity rounded-xl">
                     <Badge className="bg-green-600 text-white shadow-lg">View Full Preview</Badge>
                  </div>
                </div>
              </div>

              {/* Data Side */}
              <div className="space-y-6">
                <div className="space-y-4">
                  <Label className="text-[10px] font-black uppercase text-slate-500 tracking-wider">Final Verification</Label>
                  <div className="space-y-3">
                    <div className="bg-white p-3 rounded-xl border flex items-center gap-3">
                      <div className="bg-blue-50 p-2 rounded-lg">
                        <TrendingUp className="h-4 w-4 text-blue-600" />
                      </div>
                      <div>
                        <div className="text-[9px] font-bold text-slate-400 uppercase">Mean Valuation</div>
                        <div className="text-sm font-black">{resultsData?.overallAverageValuation?.toFixed(1) || "0.0"} <span className="text-[10px] opacity-40">/ {resultsData?.totalWeightAvailable}</span></div>
                      </div>
                    </div>
                    <div className="bg-white p-3 rounded-xl border flex items-center gap-3">
                      <div className="bg-purple-50 p-2 rounded-lg">
                        <Award className="h-4 w-4 text-purple-600" />
                      </div>
                      <div>
                        <div className="text-[9px] font-bold text-slate-400 uppercase">Excellence Rating</div>
                        <div className="text-sm font-black">{resultsData?.overallAverageRating?.toFixed(1) || "0.0"} <span className="text-[10px] opacity-40">/ 5.0</span></div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-100 space-y-3">
                  <div className="flex items-center gap-2 text-emerald-700">
                    <CheckCircle2 className="h-4 w-4" />
                    <span className="text-xs font-bold uppercase tracking-wider">Issuance Readiness</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="bg-white/80 p-2 rounded-lg border border-emerald-200/50 flex flex-col items-center">
                       <ShieldCheck className="h-4 w-4 text-emerald-600 mb-1" />
                       <span className="text-[9px] font-bold text-emerald-800">Entity Verified</span>
                    </div>
                    <div className="bg-white/80 p-2 rounded-lg border border-emerald-200/50 flex flex-col items-center">
                       <FileText className="h-4 w-4 text-emerald-600 mb-1" />
                       <span className="text-[9px] font-bold text-emerald-800">Review Done</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <DialogFooter className="gap-2 sm:gap-0 mt-2">
              <Button
                variant="outline"
                onClick={() => setShowCertifyModal(false)}
                disabled={submitting}
                className="border-slate-200 hover:bg-slate-100"
              >
                Go Back
              </Button>
              <Button
                className="bg-green-600 hover:bg-green-700 text-white min-w-[200px] shadow-lg shadow-green-600/20 font-bold"
                onClick={handleCertify}
                disabled={submitting}
              >
                {submitting ? (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                    Issuing...
                  </>
                ) : (
                  "Confirm & Issue Certificate"
                )}
              </Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>

      <div className="space-y-6">
        {!resultsData || !resultsData.memberResults || resultsData.memberResults.length === 0 ? (
          <Card className="flex flex-col items-center justify-center p-12 text-center border-dashed border-2">
            <div className="bg-primary/5 p-6 rounded-full mb-4">
              <Users className="h-12 w-12 text-primary opacity-20" />
            </div>
            <h3 className="text-xl font-bold mb-2">No Reviews Submitted</h3>
            <p className="text-muted-foreground max-w-md">
              There are no committee reviews available for this application yet.
            </p>
          </Card>
        ) : (
          <div className="space-y-8">
            {/* Aggregated Header Dashboard */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <Card className="bg-primary text-primary-foreground overflow-hidden relative border-none shadow-lg md:col-span-2">
                <div className="absolute right-0 bottom-0 opacity-10">
                  <TrendingUp size={120} />
                </div>
                <CardHeader className="pb-2">
                  <CardTitle className="text-xs font-black uppercase tracking-widest opacity-80">Avg. Consolidated Valuation</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-5xl font-black mb-1">
                    {resultsData.overallAverageValuation?.toFixed(1) || "0.0"}
                    <span className="text-xl opacity-60 ml-2">/ {resultsData.totalWeightAvailable}</span>
                  </div>
                  <p className="text-xs font-bold opacity-70">Mean weighted score (points)</p>
                </CardContent>
              </Card>

              <Card className="bg-slate-800 text-white overflow-hidden relative border-none shadow-lg">
                <div className="absolute right-0 bottom-0 opacity-10">
                  <Award size={120} />
                </div>
                <CardHeader className="pb-2">
                  <CardTitle className="text-xs font-black uppercase tracking-widest opacity-80">Avg. Excellence Rating</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-5xl font-black mb-1">
                    {resultsData.overallAverageRating?.toFixed(1) || "0.0"}
                    <span className="text-xl opacity-60 ml-2">/ 5.0</span>
                  </div>
                  <p className="text-xs font-bold opacity-70 italic text-slate-400">Qualitative expert consensus</p>
                </CardContent>
              </Card>

              <Card className="overflow-hidden border-2">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Committee Recommendation</CardTitle>
                </CardHeader>
                <CardContent className="pt-2">
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center text-sm font-bold text-green-600">
                      <ThumbsUp className="h-4 w-4 mr-2" />
                      Approve: {resultsData.memberResults.filter((r: any) => r.recommendation === 'APPROVE').length}
                    </div>
                    <div className="flex items-center text-sm font-bold text-red-600">
                      <ThumbsDown className="h-4 w-4 mr-2" />
                      Reject: {resultsData.memberResults.filter((r: any) => r.recommendation === 'REJECT').length}
                    </div>
                    <div className="flex items-center text-sm font-bold text-amber-500">
                      <HelpCircle className="h-4 w-4 mr-2" />
                      Clarify: {resultsData.memberResults.filter((r: any) => r.recommendation === 'MORE_INFO').length}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Summary of Committee Members */}
            <div className="space-y-6">
              <div className="flex items-center gap-2">
                <Users className="h-6 w-6 text-primary" />
                <h3 className="text-xl font-black uppercase tracking-widest text-slate-800">Review Committee Breakdown</h3>
              </div>
              
              <Card className="border-2 overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-slate-50 border-b">
                        <th className="px-6 py-4 text-left font-black uppercase tracking-wider text-[10px] text-slate-500">Member</th>
                        <th className="px-6 py-4 text-center font-black uppercase tracking-wider text-[10px] text-slate-500">Verdict</th>
                        <th className="px-6 py-4 text-center font-black uppercase tracking-wider text-[10px] text-slate-500">Avg. Rating</th>
                        <th className="px-6 py-4 text-center font-black uppercase tracking-wider text-[10px] text-slate-500">Total Valuation</th>
                        <th className="px-6 py-4 text-left font-black uppercase tracking-wider text-[10px] text-slate-500">Summary Comment</th>
                      </tr>
                    </thead>
                    <tbody>
                      {resultsData.memberResults.map((result: any) => (
                        <tr key={result.memberId} className="border-b last:border-0 hover:bg-muted/10 transition-colors">
                          <td className="px-6 py-4 font-bold text-primary">
                            <div className="flex items-center gap-2">
                              {result.memberName}
                              {result.isChair && (
                                <Badge variant="outline" className="text-[9px] font-black uppercase text-indigo-600 border-indigo-200 bg-indigo-50">
                                  Chairperson
                                </Badge>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4 text-center">
                            <Badge variant={
                              result.recommendation === 'APPROVE' ? 'default' : 
                              result.recommendation === 'REJECT' ? 'destructive' : 'outline'
                            } className="font-black px-3 py-1 uppercase text-[9px]">
                              {result.recommendation}
                            </Badge>
                          </td>
                          <td className="px-6 py-4 text-center font-black text-slate-700">
                            {result.averageRating?.toFixed(1) || "0.0"}
                            <span className="text-[10px] opacity-40 ml-0.5">/5</span>
                          </td>
                          <td className="px-6 py-4 text-center font-black text-primary text-lg">
                            {result.totalValuation}
                            <span className="text-[10px] opacity-60 ml-0.5">pts</span>
                          </td>
                          <td className="px-6 py-4 text-xs italic text-muted-foreground">
                            {result.overallComment ? `"${result.overallComment}"` : "No summary provided"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Card>
            </div>

            {/* Collapsible Detailed Results */}
            <div className="space-y-6">
              <div className="flex items-center gap-2">
                <ClipboardCheck className="h-6 w-6 text-primary" />
                <h3 className="text-xl font-black uppercase tracking-widest text-slate-800">Detailed Member Evaluations</h3>
              </div>

              <Accordion type="single" collapsible className="space-y-4">
                {resultsData.memberResults.map((result: any, idx: number) => (
                  <AccordionItem key={result.memberId} value={result.memberId} className="border-2 rounded-2xl overflow-hidden bg-background px-0">
                    <AccordionTrigger className="px-6 py-4 hover:no-underline hover:bg-muted/5 transition-colors">
                      <div className="flex items-center gap-4 text-left">
                        <div className="bg-primary/10 h-10 w-10 rounded-full flex items-center justify-center font-black text-primary">
                          {idx + 1}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-black text-lg text-slate-800 block">{result.memberName}</span>
                            {result.isChair && (
                              <Badge variant="outline" className="text-[9px] font-black uppercase text-indigo-600 border-indigo-200 bg-indigo-50">
                                Chairperson
                              </Badge>
                            )}
                          </div>
                          <span className="text-[10px] font-bold text-muted-foreground uppercase">Expert Breakdown • {result.criteriaScores?.length || 0} Tasks Evaluated</span>
                        </div>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="p-0 border-t bg-slate-50/30">
                      <div className="p-6">
                        <h4 className="font-black text-[10px] uppercase tracking-widest text-primary mb-4">Criterion-wise Performance</h4>
                        <div className="overflow-hidden rounded-xl border-2 bg-white">
                          <table className="w-full text-sm">
                            <thead>
                              <tr className="bg-slate-100/50 border-b">
                                <th className="px-4 py-3 text-left font-black uppercase text-[9px] w-[250px]">Criterion Task</th>
                                <th className="px-4 py-3 text-center font-black uppercase text-[9px] w-[80px]">Rating</th>
                                <th className="px-4 py-3 text-center font-black uppercase text-[9px] w-[80px]">Valuation</th>
                                <th className="px-4 py-3 text-left font-black uppercase text-[9px]">Expert Remarks</th>
                              </tr>
                            </thead>
                            <tbody>
                              {result.criteriaScores?.map((score: any, sIdx: number) => {
                                const critInfo = resultsData.criteria?.find((c: any) => c.id === score.criterionId);
                                return (
                                  <tr key={sIdx} className="border-b last:border-0 hover:bg-primary/[0.02]">
                                    <td className="px-4 py-4">
                                      <div className="font-bold text-slate-700">{critInfo?.name || "Unknown Criterion"}</div>
                                      {critInfo?.weight && (
                                        <div className="text-[10px] text-muted-foreground mt-1">Weight: {critInfo.weight} pts</div>
                                      )}
                                    </td>
                                    <td className="px-4 py-4 text-center">
                                      <div className={`inline-flex items-center justify-center w-9 h-7 rounded-md font-black border ${
                                        score.score >= 4 ? 'bg-green-50 border-green-200 text-green-700' :
                                        score.score <= 2 ? 'bg-red-50 border-red-200 text-red-700' :
                                        'bg-amber-50 border-amber-200 text-amber-700'
                                      }`}>
                                        {score.score}
                                      </div>
                                    </td>
                                    <td className="px-4 py-4 text-center font-black text-primary">
                                      {score.valuation}
                                    </td>
                                    <td className="px-4 py-4 text-xs italic text-muted-foreground leading-relaxed break-words whitespace-pre-wrap">
                                      {score.comment ? `"${score.comment}"` : <span className="opacity-30">No remarks</span>}
                                    </td>
                                  </tr>
                                );
                              })}
                              {(!result.criteriaScores || result.criteriaScores.length === 0) && (
                                <tr>
                                  <td colSpan={4} className="px-4 py-8 text-center text-muted-foreground italic">
                                    No detailed scores available.
                                  </td>
                                </tr>
                              )}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function AdminEcosystemResultPage() {
  return (
    <Suspense fallback={
      <div className="flex h-screen w-full items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    }>
      <ResultContent />
    </Suspense>
  );
}
