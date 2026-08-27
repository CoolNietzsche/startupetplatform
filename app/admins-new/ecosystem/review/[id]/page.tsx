"use client";

import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  ArrowLeft,
  FileText,
  Download,
  CheckCircle,
  XCircle,
  Clock,
  UserCheck,
  Building,
  Calendar,
  Award,
  MessageSquare,
  RefreshCw,
  ClipboardCheck,
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import Link from 'next/link';
import {
  getEcosystemApplicationReviewById,
  updateEcosystemApplicationReviewStatus,
  finalizeEcosystemApplication,
  verifyEcoDocument,
  completeEcoPreAssessment,
  type EcosystemApplicationReviewDetail,
} from "../../ecosystem-actions";
import { getChecklist, computeSla, type DocumentVerification } from "@/lib/directive/pre-assessment";
import { CommitteeAssignmentModal } from "../../components/committee-assignment-modal";
import { RequestClarificationModal } from "@/components/request-clarification-modal";
import { getOrCreateEcoConversation } from "@/lib/actions/communication";
import {
  OrganizationProfile,
  ServicesOffered
} from "@/components/ecosystem/application";
import { UniversalStatusBanner } from "@/components/shared/certification";
import { EcosystemIssuanceModal } from "@/components/certificate/issuance-modal";

function getStatusBadgeVariant(workflowStatus: string, certified: boolean): "success" | "warning" | "destructive" | "outline" {
  if (certified || workflowStatus === "CERTIFIED") return "success";
  if (workflowStatus === "PENDING") return "warning";
  if (workflowStatus === "REJECTED") return "destructive";
  return "outline";
}

export default function EcosystemReviewPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [loading, setLoading] = useState(true);
  const [application, setApplication] = useState<EcosystemApplicationReviewDetail | null>(null);
  const [rejecting, setRejecting] = useState(false);
  const [assigning] = useState(false);
  const [markingReviewed, setMarkingReviewed] = useState(false);
  const [isReviewed, setIsReviewed] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [checklist, setChecklist] = useState<{ id: string; label: string; directiveRef: string }[]>([]);
  const [docVerification, setDocVerification] = useState<any[]>([]);
  const [verifyingDoc, setVerifyingDoc] = useState<string | null>(null);
  const [completingPre, setCompletingPre] = useState(false);

  const [showAssignmentModal, setShowAssignmentModal] = useState(false);
  const [showClarificationModal, setShowClarificationModal] = useState(false);
  const [showIssuanceModal, setShowIssuanceModal] = useState(false);

  const fetchApplication = useCallback(async () => {
    try {
      setLoading(true);
      const startReviewRes = await updateEcosystemApplicationReviewStatus(id, "START_REVIEW");
      if (!startReviewRes.success && !(startReviewRes as any).skipped) {
        toast.error(startReviewRes.message || 'Failed to start review');
      }

      const result = await getEcosystemApplicationReviewById({ applicationId: id });

      if (result.success && result.data) {
        const data = result.data as EcosystemApplicationReviewDetail;
        setApplication(data);
        setIsReviewed(data.workflowStatus === "REVIEWED");
        // Build checklist from directive presets
        const items = getChecklist("ecosystem", data.type);
        setChecklist(items.map(i => ({ id: i.id, label: i.label, directiveRef: i.directiveRef })));
        setDocVerification(Array.isArray(data.documentVerification) ? data.documentVerification : []);
      } else {
        toast.error('Application not found');
        router.push('/admins-new/ecosystem');
      }
    } catch {
      toast.error('Error fetching application');
      router.push('/admins-new/ecosystem');
    } finally {
      setLoading(false);
    }
  }, [id, router]);

  useEffect(() => {
    if (id) {
      fetchApplication();
    }
  }, [id, fetchApplication]);

  const handleMarkAsReviewed = async () => {
    try {
      setMarkingReviewed(true);
      const res = await updateEcosystemApplicationReviewStatus(id, "MARK_REVIEWED");
      if (!res.success) {
        toast.error(res.message || "Failed to mark as reviewed");
        return;
      }

      setIsReviewed(true);
      toast.success("Application marked as reviewed");
      await fetchApplication();
    } catch {
      toast.error("Failed to mark as reviewed");
    } finally {
      setMarkingReviewed(false);
    }
  };

  const handleAssignToCommittee = async () => {
    if (!isReviewed && application?.workflowStatus !== "REVIEWED") {
      toast.error("Application must be reviewed before assigning to committee");
      return;
    }

    setShowAssignmentModal(true);
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center min-h-[400px]">
          <Clock className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </div>
    );
  }

  if (!application) {
    return (
      <div className="p-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Application Not Found</h1>
          <Button asChild>
            <Link href="/admins-new/ecosystem">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Ecosystem Applications
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-4 lg:p-5 bg-white min-h-screen">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-2 sm:mb-10">
        <div className="flex items-center gap-3 sm:gap-4">
          <Button variant="ghost" size="icon" asChild className="rounded-full h-9 w-9 sm:h-11 sm:u-11 p-0 hover:bg-white shadow-sm border border-slate-200">
            <Link href="/admins-new/ecosystem">
              <ArrowLeft className="h-4 w-4 sm:h-5 sm:w-5 text-slate-500" />
            </Link>
          </Button>
          <div>
            <h1 className="text-xl sm:text-3xl font-black text-brand-mint-teal uppercase tracking-tight leading-none">Review Application</h1>
          </div>
        </div>
      </div>

      {/* <div className="mb-6 sm:mb-10">
        <UniversalStatusBanner
          status={application.workflowStatus}
          type="ECOSYSTEM"
          organizationName={application.name}
          issuedAt={application.updatedAt}
        />
      </div> */}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6 sm:space-y-8">
          <div className="grid grid-cols-1 gap-6 sm:gap-8">
            <OrganizationProfile application={application} />
            <ServicesOffered services={application.services} />
          </div>

          {/* Documents */}
          <Card className="border-none shadow-2xl bg-white overflow-hidden">
            <CardHeader className="bg-slate-50/50 border-b p-5 sm:p-6">
              <CardTitle className="text-lg sm:text-xl flex items-center gap-3 font-black uppercase tracking-widest text-brand-deep-dark">
                <div className="p-2 bg-brand-mint-teal rounded-xl shadow-lg shadow-brand-mint-teal/20">
                  <FileText className="h-5 w-5 text-white" />
                </div>
                Supporting Documents
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 sm:p-8 space-y-8">
              {checklist.map((item) => {
                const isBusinessLicense = item.id === "eco_business_license" || item.id === "startup_business_license";
                const isTaxReg = item.id === "eco_tax_registration";
                const fileId = isBusinessLicense ? application.businessLicenseFileId : isTaxReg ? application.taxRegistrationFileId : null;
                const fileName = isBusinessLicense ? application.businessLicenseFileName : isTaxReg ? application.taxRegistrationFileName : null;
                const v = docVerification.find(d => d.checklistItemId === item.id);
                const vStatus = v?.status || "PENDING";

                return (
                  <div key={item.id} className="space-y-3 p-4 border border-slate-100 rounded-2xl bg-white shadow-sm">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <h4 className="text-xs sm:text-sm font-black uppercase tracking-widest text-brand-mint-teal">{item.label}</h4>
                        <span className="text-[7px] text-slate-400 font-mono uppercase tracking-widest bg-slate-100 px-1.5 py-0.5 rounded">{item.directiveRef}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        {vStatus === "VERIFIED" && <Badge className="bg-green-100 text-green-700 border-green-200 text-[8px] font-bold uppercase tracking-widest"><CheckCircle className="h-3 w-3 mr-1" />Verified</Badge>}
                        {vStatus === "REJECTED" && <Badge className="bg-red-100 text-red-700 border-red-200 text-[8px] font-bold uppercase tracking-widest"><XCircle className="h-3 w-3 mr-1" />Rejected</Badge>}
                        {vStatus === "PENDING" && <Badge className="bg-amber-100 text-amber-700 border-amber-200 text-[8px] font-bold uppercase tracking-widest"><Clock className="h-3 w-3 mr-1" />Pending</Badge>}
                      </div>
                    </div>
                    {fileId ? (
                      <div className="border border-slate-200 rounded-2xl overflow-hidden shadow-sm group bg-white">
                        <iframe src={`/api/files/${fileId}/download?inline=true`} className="w-full h-[450px] sm:h-[600px] border-none" title={item.label} />
                      </div>
                    ) : (
                      <div className="h-[100px] flex items-center justify-center bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Not Uploaded</p>
                      </div>
                    )}
                    <div className="flex justify-between items-center pt-2">
                      <div className="flex items-center gap-2">
                        {fileId && (
                          <Button variant="outline" size="sm" asChild className="rounded-xl border-slate-200 hover:bg-slate-50 font-bold uppercase tracking-widest text-[10px]">
                            <a href={`/api/files/${fileId}/download`} target="_blank" rel="noopener noreferrer">
                              <Download className="mr-2 h-3.5 w-3.5" />
                              Download
                            </a>
                          </Button>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          disabled={verifyingDoc === item.id || !fileId || application.workflowStatus === "REVIEWED" || application.workflowStatus === "CERTIFIED" || application.workflowStatus === "REJECTED"}
                          className={`rounded-xl text-[9px] font-black uppercase tracking-widest px-3 ${
                            vStatus === "VERIFIED"
                              ? "bg-green-50 text-green-700 border-green-200 hover:bg-green-100"
                              : "border-slate-200 hover:bg-green-50 hover:text-green-700 hover:border-green-200"
                          }`}
                          onClick={async () => {
                            setVerifyingDoc(item.id);
                            const res = await verifyEcoDocument(application.id, item.id, "VERIFIED");
                            if (res.success) setDocVerification(res.data.documentVerification);
                            else toast.error(res.message || "Failed to verify");
                            setVerifyingDoc(null);
                          }}
                        >
                          {verifyingDoc === item.id ? <RefreshCw className="h-3 w-3 animate-spin mr-1" /> : <CheckCircle className="h-3 w-3 mr-1" />}
                          Verify
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          disabled={verifyingDoc === item.id || !fileId || application.workflowStatus === "REVIEWED" || application.workflowStatus === "CERTIFIED" || application.workflowStatus === "REJECTED"}
                          className={`rounded-xl text-[9px] font-black uppercase tracking-widest px-3 ${
                            vStatus === "REJECTED"
                              ? "bg-red-50 text-red-700 border-red-200 hover:bg-red-100"
                              : "border-slate-200 hover:bg-red-50 hover:text-red-700 hover:border-red-200"
                          }`}
                          onClick={async () => {
                            setVerifyingDoc(item.id);
                            const res = await verifyEcoDocument(application.id, item.id, "REJECTED");
                            if (res.success) setDocVerification(res.data.documentVerification);
                            else toast.error(res.message || "Failed to reject");
                            setVerifyingDoc(null);
                          }}
                        >
                          {verifyingDoc === item.id ? <RefreshCw className="h-3 w-3 animate-spin mr-1" /> : <XCircle className="h-3 w-3 mr-1" />}
                          Reject
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })}

              {checklist.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  <FileText className="h-12 w-12 mx-auto mb-2 opacity-20" />
                  <p>No document checklist available</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Application Status */}
          <Card className="border-none shadow-xl bg-white overflow-hidden">
            <CardHeader className="bg-slate-50/50 border-b">
              <CardTitle className="text-brand-deep-dark font-black uppercase tracking-widest text-sm">Application Status</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 pt-6">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-brand-mint-teal" />
                <span className="text-xs font-bold text-brand-deep-dark/70">Submitted: {application.submittedAt ? new Date(application.submittedAt).toLocaleDateString() : 'N/A'}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-brand-mint-teal" />
                <span className="text-xs font-bold text-brand-deep-dark/70">Last Updated: {new Date(application.updatedAt).toLocaleDateString()}</span>
              </div>
              {/* SLA Timer */}
              {application.submittedAt && (application.workflowStatus === "PENDING" || application.workflowStatus === "UNDER_REVIEW") && (
                <div className={`mt-4 p-3 rounded-2xl border ${
                  (() => {
                    const sla = computeSla(new Date(application.submittedAt), 5);
                    return sla.isOverdue ? "bg-red-50 border-red-200" : sla.slaRemainingDays <= 2 ? "bg-amber-50 border-amber-200" : "bg-blue-50 border-blue-200";
                  })()
                }`}>
                  <div className="flex items-center gap-2">
                    <Clock className={`h-4 w-4 ${
                      (() => { const s = computeSla(new Date(application.submittedAt), 5); return s.isOverdue ? "text-red-500" : s.slaRemainingDays <= 2 ? "text-amber-500" : "text-blue-500"; })()
                    }`} />
                    <span className={`text-[9px] font-black uppercase tracking-widest ${
                      (() => { const s = computeSla(new Date(application.submittedAt), 5); return s.isOverdue ? "text-red-600" : s.slaRemainingDays <= 2 ? "text-amber-600" : "text-blue-600"; })()
                    }`}>
                      {(() => { const s = computeSla(new Date(application.submittedAt), 5); return s.isOverdue ? "SLA BREACHED" : `${s.slaRemainingDays} day${s.slaRemainingDays !== 1 ? 's' : ''} remaining`; })()}
                    </span>
                  </div>
                  <p className="text-[8px] text-slate-400 font-bold uppercase tracking-widest mt-1">
                    Deadline: {computeSla(new Date(application.submittedAt), 5).slaDeadline.toLocaleDateString()}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Pre-Assessment */}
          {(application.workflowStatus === "PENDING" || application.workflowStatus === "UNDER_REVIEW") && (
            <Card className="border-none shadow-xl bg-white overflow-hidden">
              <CardHeader className="bg-slate-50/30 border-b p-4 sm:p-5">
                <CardTitle className="text-sm font-black uppercase tracking-widest text-brand-deep-dark flex items-center gap-2">
                  <ClipboardCheck className="h-4 w-4 text-brand-mint-teal" />
                  Pre-Assessment
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 sm:p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-[9px] font-bold uppercase tracking-widest text-slate-500">Documents Verified</span>
                  <span className="text-sm font-black">{docVerification.filter(v => v.status === "VERIFIED").length}/{checklist.length}</span>
                </div>
                <Progress value={checklist.length > 0 ? (docVerification.filter(v => v.status === "VERIFIED").length / checklist.length) * 100 : 0} className="h-1.5" />
                {application.workflowStatus === "UNDER_REVIEW" && (
                  <Button
                    className="w-full h-11 bg-brand-mint-teal hover:bg-brand-mint-teal/90 text-white font-black uppercase tracking-widest text-[10px] rounded-2xl"
                    disabled={completingPre || docVerification.filter(v => v.status === "VERIFIED").length < checklist.length}
                    onClick={async () => {
                      setCompletingPre(true);
                      const res = await completeEcoPreAssessment(application.id);
                      if (res.success) {
                        toast.success("Pre-assessment completed");
                        await fetchApplication();
                      } else {
                        toast.error(res.message || "Failed to complete pre-assessment");
                      }
                      setCompletingPre(false);
                    }}
                  >
                    {completingPre ? <RefreshCw className="mr-2 h-4 w-4 animate-spin" /> : <CheckCircle className="mr-2 h-4 w-4" />}
                    {completingPre ? "Processing..." : "Complete Pre-Assessment"}
                  </Button>
                )}
                {application.workflowStatus === "PENDING" && (
                  <Button
                    className="w-full h-11 bg-brand-startup-amber hover:bg-brand-startup-amber/90 text-brand-deep-dark font-black uppercase tracking-widest text-[10px] rounded-2xl"
                    onClick={async () => {
                      const res = await updateEcosystemApplicationReviewStatus(id, "START_REVIEW");
                      if (res.success) await fetchApplication();
                      else toast.error(res.message || "Failed to start review");
                    }}
                  >
                    <UserCheck className="mr-2 h-4 w-4" />
                    Start Pre-Assessment Review
                  </Button>
                )}
              </CardContent>
            </Card>
          )}

          {/* Review Actions */}
          <Card>
            <CardHeader className="p-5 sm:p-6 border-b bg-slate-50/30">
              <CardTitle className="text-lg font-black uppercase tracking-widest text-brand-deep-dark flex items-center gap-3">
                <div className="p-2 bg-brand-startup-amber rounded-xl shadow-lg shadow-brand-startup-amber/20">
                  <Award className="h-5 w-5 text-brand-deep-dark" />
                </div>
                Review Actions
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 sm:p-6 space-y-4">
              {/* Action: Messaging Hub */}
              {application.workflowStatus !== "CERTIFIED" && application.workflowStatus !== "REJECTED" && (
                <div className="flex flex-col gap-3 pt-2">
                  <Button
                    variant="ghost"
                    className="w-full h-11 text-brand-mint-teal hover:bg-brand-mint-teal/5 font-bold uppercase tracking-widest text-[10px] rounded-xl"
                    onClick={async () => {
                      const res = await getOrCreateEcoConversation(application.id);
                      if (res.success) {
                        router.push(`/admins-new/messages?conversationId=${res.conversationId}`);
                      } else {
                        toast.error(res.error || "Failed to start conversation");
                      }
                    }}
                  >
                    <MessageSquare className="mr-2 h-4 w-4" />
                    Secure Correspondence
                  </Button>

                  <Button
                    onClick={() => setShowClarificationModal(true)}
                    variant="ghost"
                    className="w-full h-11 text-brand-startup-amber hover:bg-brand-startup-amber/5 font-bold uppercase tracking-widest text-[10px] rounded-xl"
                  >
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Request Clarification
                  </Button>
                </div>
              )}

              {/* Action: Committee Assignment */}
              {(isReviewed || application.workflowStatus === "REVIEWED") && application.workflowStatus !== "CERTIFIED" && (
                <div className="space-y-4 pt-4 border-t border-slate-100">
                  <div className="text-center p-4 bg-slate-50 border border-slate-200 rounded-2xl">
                    <CheckCircle className="h-6 w-6 text-brand-mint-teal mx-auto mb-2" />
                    <p className="text-[10px] font-black uppercase tracking-widest text-brand-deep-dark leading-tight">Phase 1 Complete</p>
                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-tight mt-1 opacity-60">Ready for Committee Audit</p>
                  </div>

                  <Button
                    onClick={handleAssignToCommittee}
                    variant="outline"
                    className="w-full h-12 border-slate-200 font-black uppercase tracking-widest text-[10px] rounded-2xl shadow-sm hover:bg-slate-50"
                  >
                    <UserCheck className="mr-2 h-4 w-4" />
                    Assign Oversight Committee
                  </Button>
                </div>
              )}

              {/* Action: Final Accreditation (Post-Committee) */}
              {application.workflowStatus === "COMMITTEE_REVIEW_SUBMITTED" && (
                <div className="space-y-4 pt-4 border-t border-slate-100">
                  <div className="text-center p-4 bg-brand-mint-teal/5 border border-brand-mint-teal/20 rounded-2xl">
                    <Award className="h-6 w-6 text-brand-mint-teal mx-auto mb-2" />
                    <p className="text-[10px] font-black uppercase tracking-widest text-brand-mint-teal leading-tight">Committee Approval Received</p>
                    <p className="text-[9px] font-bold text-brand-deep-dark/40 uppercase tracking-tight mt-1 opacity-60">Accreditation Finalization Required</p>
                  </div>

                  <Button
                    onClick={() => setShowIssuanceModal(true)}
                    className="w-full h-14 bg-brand-startup-amber hover:bg-brand-startup-amber/90 text-brand-deep-dark font-black uppercase tracking-widest text-xs rounded-2xl shadow-xl shadow-brand-startup-amber/20 transition-all hover:scale-[1.02] active:scale-95"
                  >
                    <Award className="mr-2 h-5 w-5" />
                    Issue & Verify Certificate
                  </Button>
                </div>
              )}

              {/* Action: Rejection Framework */}
              {application.workflowStatus !== "CERTIFIED" && application.workflowStatus !== "REJECTED" && (
                <div className="space-y-4 pt-4 border-t border-slate-100">
                  <div className="space-y-2">
                    <Label htmlFor="rejection" className="text-[10px] font-black uppercase tracking-widest text-slate-400">Rejection Protocol</Label>
                    <Textarea
                      id="rejection"
                      placeholder="Explain the reason for denial..."
                      value={rejectionReason}
                      onChange={(e) => setRejectionReason(e.target.value)}
                      className="min-h-[100px] border-slate-200 focus:border-red-300 focus:ring-red-100 rounded-2xl resize-none text-xs"
                    />
                  </div>

                  <Button
                    onClick={async () => {
                      if (!rejectionReason.trim()) {
                        toast.error('Please provide a rejection reason');
                        return;
                      }
                      setRejecting(true);
                      try {
                        const res = await finalizeEcosystemApplication({
                          applicationId: id,
                          status: "REJECTED",
                          reason: rejectionReason
                        });
                        if (res.success) {
                          toast.success('Application rejected');
                          router.push('/admins-new/ecosystem');
                        } else {
                          toast.error(res.message || 'Failed to reject');
                        }
                      } finally {
                        setRejecting(false);
                      }
                    }}
                    disabled={rejecting || !rejectionReason.trim()}
                    variant="destructive"
                    className="w-full h-12 bg-red-600 hover:bg-red-700 font-black uppercase tracking-widest text-[10px] rounded-2xl shadow-lg shadow-red-200"
                  >
                    {rejecting ? (
                      <Clock className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <XCircle className="mr-2 h-4 w-4" />
                    )}
                    {rejecting ? 'Processing Denial...' : 'Confirm Rejection'}
                  </Button>
                </div>
              )}

              {/* Status: Application Finalized */}
              {application.workflowStatus === "CERTIFIED" && (
                <div className="text-center p-6 bg-brand-mint-teal/5 border border-brand-mint-teal/10 rounded-3xl">
                  <Award className="h-10 w-10 text-brand-mint-teal mx-auto mb-3" />
                  <p className="text-xs font-black uppercase tracking-widest text-brand-mint-teal leading-tight">Official Accreditation Finalized</p>
                  <p className="text-[10px] font-bold text-brand-deep-dark/50 uppercase tracking-tight mt-1 opacity-70">Record matches national innovation registry</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
      <CommunicationModals
        application={application}
        showAssignmentModal={showAssignmentModal}
        setShowAssignmentModal={setShowAssignmentModal}
        showClarificationModal={showClarificationModal}
        setShowClarificationModal={setShowClarificationModal}
        fetchApplication={fetchApplication}
      />
      <EcosystemIssuanceModal
        isOpen={showIssuanceModal}
        onClose={() => setShowIssuanceModal(false)}
        application={application}
        onIssue={async (data) => {
          const res = await finalizeEcosystemApplication({
            applicationId: id,
            status: "CERTIFIED",
            ...data
          });
          if (res.success) {
            setApplication(prev => prev ? { ...prev, workflowStatus: "CERTIFIED", updatedAt: new Date().toISOString() } : null);
          } else {
            throw new Error(res.message);
          }
        }}
      />
    </div>
  );
}

function CommunicationModals({
  application,
  showAssignmentModal,
  setShowAssignmentModal,
  showClarificationModal,
  setShowClarificationModal,
  fetchApplication
}: any) {
  return (
    <>
      <CommitteeAssignmentModal
        isOpen={showAssignmentModal}
        onClose={() => setShowAssignmentModal(false)}
        application={application}
        onSuccess={fetchApplication}
      />
      <RequestClarificationModal
        ecoApplicationId={application.id}
        open={showClarificationModal}
        onOpenChange={setShowClarificationModal}
      />
    </>
  );
}
