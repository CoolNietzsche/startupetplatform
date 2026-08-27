"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowLeft,
  FileText,
  X,
  AlertCircle,
  Send,
  Save,
  Info,
  Eye,
  Download,
  ExternalLink,
  ThumbsUp,
  ThumbsDown,
  HelpCircle,
  Maximize2,
  Minimize2,
  CheckSquare,
  ClipboardCheck,
  Award,
  CheckCircle,
  Loader2,
  TrendingUp,
  Users,
  Phone,
  Mail,
  Check,
  CheckCircle2,
  ShieldCheck,
  Clock,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { Slider } from "@/components/ui/slider";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
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
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CertificationRequirements as AdminCertificationRequirements } from "@/app/admins-new/certifications/workflow/components/certification-requirements";
import { getAssessmentDetails, saveAssessment, getAssessmentResults, submitFinalDecision } from '../../dashboard/actions';
import { initCommitteeChatWithStartup } from "@/lib/actions/communication";
import { MessageCircle } from "lucide-react";
import { toast } from "sonner";
import { UniversalStatusBanner } from "@/components/shared/certification";
import { ArrowLeft as BackIcon } from "lucide-react";

// Workflow steps definition
const WORKFLOW_STEPS = [
  { id: "DRAFT", label: "Draft", description: "Initial application draft" },
  { id: "PENDING", label: "Pending", description: "Waiting for initial review" },
  { id: "UNDER_REVIEW", label: "Reviewing", description: "Documentation review in progress" },
  { id: "REVIEWED", label: "Reviewed", description: "Technical assessment completed" },
  { id: "ASSIGNED_TO_COMMITTEE", label: "Assigned to Committee", description: "Allocated to selection committee for evaluation" },
  { id: "IN_COMMITTEE_REVIEW", label: "In Committee Review", description: "Active committee evaluation in progress" },
  { id: "COMMITTEE_REVIEW_SUBMITTED", label: "Submitted", description: "Reviews collected for consolidation" },
  { id: "CERTIFIED", label: "Certified", description: "Certification process completed" },
];

interface AssessmentDetailsClientProps {
  entityType: "ecosystem" | "startup";
}

export function AssessmentDetailsClient({ entityType }: AssessmentDetailsClientProps) {
  const { id } = useParams();
  const router = useRouter();
  
  const [loading, setLoading] = useState(true);
  const [recommendation, setRecommendation] = useState("");
  const [recommendationError, setRecommendationError] = useState(false);
  const [finalComments, setFinalComments] = useState("");
  
  // Final Decision State (for Chair)
  const [finalDecisionChoice, setFinalDecisionChoice] = useState("");
  const [finalDecisionSummary, setFinalDecisionSummary] = useState("");
  
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [showResultModal, setShowResultModal] = useState(false);
  const [hasSubmittedReview, setHasSubmittedReview] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isInitiatingChat, setIsInitiatingChat] = useState(false);
  const [dynamicCriteria, setDynamicCriteria] = useState<any[]>([]);
  const [applicationData, setApplicationData] = useState<any>(null);
  const [applicationDocuments, setApplicationDocuments] = useState<any[]>([]);
  const [detailedScores, setDetailedScores] = useState<Record<string, any>>({});
  const [resultsData, setResultsData] = useState<any>(null);
  const [isChair, setIsChair] = useState(false);
  const [isReadOnly, setIsReadOnly] = useState(false);
  const [evaluationSla, setEvaluationSla] = useState<{
    assignedAt: string;
    slaDeadline: string;
  } | null>(null);
  const [slaTimeLeft, setSlaTimeLeft] = useState<string | null>(null);
  const [slaOverdue, setSlaOverdue] = useState(false);
  
  // Document viewer state
  const [viewingDocument, setViewingDocument] = useState<any | null>(null);
  const [fullScreen, setFullScreen] = useState(false);
  const [documentNotes, setDocumentNotes] = useState<Record<string, any[]>>({});
  const [currentNote, setCurrentNote] = useState("");
  const [currentCategory, setCurrentCategory] = useState("general");
  const [showNotesPanel, setShowNotesPanel] = useState(true);
  const [selectedMemberProfile, setSelectedMemberProfile] = useState<any>(null);
  const [showProfileModal, setShowProfileModal] = useState(false);

  const noteCategories = [
    { value: "general", label: "General", icon: "FileText" },
    { value: "strength", label: "Strengths", icon: "ThumbsUp" },
    { value: "weakness", label: "Weaknesses", icon: "ThumbsDown" },
    { value: "question", label: "Questions", icon: "HelpCircle" },
    { value: "action", label: "Action Items", icon: "CheckSquare" },
  ];

  useEffect(() => {
    if (id) {
      fetchData();
    }
  }, [id]);

  // Live SLA countdown
  useEffect(() => {
    if (!evaluationSla?.slaDeadline) return;
    const deadline = new Date(evaluationSla.slaDeadline);
    const update = () => {
      const now = new Date();
      const diffMs = deadline.getTime() - now.getTime();
      setSlaOverdue(diffMs <= 0);
      if (diffMs <= 0) {
        const overdueMs = Math.abs(diffMs);
        const d = Math.floor(overdueMs / (1000 * 60 * 60 * 24));
        const h = Math.floor((overdueMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        setSlaTimeLeft(`Overdue by ${d}d ${h}h`);
      } else {
        const d = Math.floor(diffMs / (1000 * 60 * 60 * 24));
        const h = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const m = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
        if (d > 0) setSlaTimeLeft(`${d}d ${h}h remaining`);
        else setSlaTimeLeft(`${h}h ${m}m remaining`);
      }
    };
    update();
    const interval = setInterval(update, 60000);
    return () => clearInterval(interval);
  }, [evaluationSla?.slaDeadline]);

  const fetchData = async () => {
    setLoading(true);
    const result = await getAssessmentDetails(id as string, entityType);
    if (result.success) {
      const { application, criteria, existingReview, documents, isChair, evaluationSla } = result.data as any;
      setApplicationData(application);
      setDynamicCriteria(criteria || []);
      setApplicationDocuments(documents);
      setIsChair(isChair);
      if (evaluationSla) {
        setEvaluationSla({ assignedAt: evaluationSla.assignedAt, slaDeadline: evaluationSla.slaDeadline });
      }

      const initialDetailedScores: Record<string, any> = {};
      
      const isAppFinalized = ["COMMITTEE_REVIEW_SUBMITTED", "CERTIFIED", "REJECTED"].includes(application?.status);
      setIsReadOnly(isAppFinalized);
      
      if (existingReview) {
        setRecommendation(existingReview.recommendation || "");
        setFinalComments(existingReview.comment || "");
        setHasSubmittedReview(existingReview.status === "SUBMITTED");

        criteria.forEach((c: any) => {
          const existing = existingReview.scores.find((s: any) => s.criterionId === c.id);
          initialDetailedScores[c.id] = {
            score: existing?.score || 0,
            weightEvaluation: existing?.weightSnapshot !== undefined ? existing.weightSnapshot : 0,
            recommendation: existing?.recommendation || "",
            comment: existing?.comment || "",
          };
        });
      } else {
        criteria.forEach((c: any) => {
          initialDetailedScores[c.id] = {
            score: 0,
            weightEvaluation: 0,
            recommendation: "",
            comment: "",
          };
        });
      }
      setDetailedScores(initialDetailedScores);
    } else {
      toast.error(result.message || "Failed to load assessment details");
    }

    const resultsResult = await getAssessmentResults(id as string, entityType);
    if (resultsResult.success) {
      setResultsData(resultsResult.data);
      if (resultsResult.data?.decision) {
        setFinalDecisionChoice((resultsResult.data as any).decision.finalDecision || "");
        setFinalDecisionSummary((resultsResult.data as any).decision.summary || "");
      }
    }
    setLoading(false);
  };

  const calculateTotalScore = () => {
    return dynamicCriteria.reduce((sum, criteria) => sum + (detailedScores[criteria.id]?.weightEvaluation || 0), 0);
  };

  const calculateTotalWeight = () => {
    return dynamicCriteria.reduce((sum, criteria) => sum + (criteria.weight || 0), 0);
  };

  const calculateFinalPercentage = () => {
    const totalWeight = calculateTotalWeight();
    if (totalWeight === 0) return 0;
    return (calculateTotalScore() / totalWeight) * 100;
  };

  const calculateAverageRating = () => {
    if (dynamicCriteria.length === 0) return 0;
    const totalRating = dynamicCriteria.reduce((sum, criteria) => sum + (detailedScores[criteria.id]?.score || 0), 0);
    return (totalRating / dynamicCriteria.length).toFixed(1);
  };

  const handleScoreChange = (criteriaId: string, value: number[]) => {
    setDetailedScores((prev) => ({
      ...prev,
      [criteriaId]: { ...prev[criteriaId], score: value[0] },
    }));
  };

  const handleWeightEvaluationChange = (criteriaId: string, value: number) => {
    setDetailedScores((prev) => ({
      ...prev,
      [criteriaId]: { ...prev[criteriaId], weightEvaluation: value },
    }));
  };

  const handleCommentChange = (criteriaId: string, value: string) => {
    setDetailedScores((prev) => ({
      ...prev,
      [criteriaId]: { ...prev[criteriaId], comment: value },
    }));
  };

  const saveDraft = async () => {
    const result = await saveAssessment(id as string, detailedScores, recommendation, finalComments, false, entityType);
    if (result.success) {
      toast.success("Draft saved successfully");
    } else {
      toast.error(result.message);
    }
  };

  const submitMyReview = async () => {
    setIsSubmitting(true);
    try {
      const result = await saveAssessment(id as string, detailedScores, recommendation, finalComments, true, entityType);
      if (result.success) {
        toast.success(hasSubmittedReview ? "Personal evaluation updated successfully" : "Personal evaluation submitted successfully");
        setHasSubmittedReview(true);
        setShowResultModal(true);
        
        // Quietly refresh aggregated results without full loading state
        const resultsResult = await getAssessmentResults(id as string, entityType);
        if (resultsResult.success) {
          setResultsData(resultsResult.data);
        }
      } else {
        toast.error(result.message);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOpenMyReviewSubmit = () => {
    // Check if all criteria have been scored
    for (const c of dynamicCriteria) {
      const score = detailedScores[c.id]?.score;
      
      if (!score || score === 0) {
        toast.error(`Please provide a rating for "${c.name}".`);
        return;
      }
    }

    if (!recommendation) {
      setRecommendationError(true);
      toast.warning("Please select your final recommendation before submitting.");
      return;
    }
    setRecommendationError(false);
    submitMyReview();
  };

  const submitFinalAssessment = async () => {
    if (!finalDecisionChoice) {
      toast.warning("Please select a final decision for the committee.");
      return;
    }
    setIsSubmitting(true);
    try {
      const result = await submitFinalDecision(id as string, finalDecisionChoice, finalDecisionSummary, entityType);
      if (result.success) {
        toast.success("Final committee evaluation submitted successfully");
        setShowConfirmDialog(false);
        router.push("/committee-portal/dashboard");
      } else {
        toast.error(result.message);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInitiateChat = async () => {
    setIsInitiatingChat(true);
    try {
      const res = await initCommitteeChatWithStartup(id as string, entityType);
      if (res.success && res.data?.conversationId) {
        router.push(`/committee-portal/messages?conversationId=${res.data.conversationId}`);
      } else {
        toast.error(res.error || "Failed to initiate chat");
      }
    } catch (error) {
      toast.error("An error occurred while opening chat");
    } finally {
      setIsInitiatingChat(false);
    }
  };


  const getFileIcon = (fileType: string) => {
    if (fileType.includes("pdf")) return <FileText className="h-5 w-5 text-red-500" />;
    if (fileType.includes("xlsx") || fileType.includes("excel")) return <FileText className="h-5 w-5 text-green-500" />;
    if (fileType.includes("image/")) return <FileText className="h-5 w-5 text-purple-500" />;
    return <FileText className="h-5 w-5 text-gray-500" />;
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "strength": return <ThumbsUp className="h-4 w-4 mr-2 text-green-500" />;
      case "weakness": return <ThumbsDown className="h-4 w-4 mr-2 text-red-500" />;
      case "question": return <HelpCircle className="h-4 w-4 mr-2 text-amber-500" />;
      case "action": return <CheckSquare className="h-4 w-4 mr-2 text-blue-500" />;
      default: return <FileText className="h-4 w-4 mr-2 text-gray-500" />;
    }
  };

  if (loading) {
    return (
      <div className="container py-32 flex flex-col items-center justify-center space-y-4">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="text-muted-foreground font-medium">Loading assessment data...</p>
      </div>
    );
  }

  const currentStatusIndex = WORKFLOW_STEPS.findIndex(s => s.id === applicationData?.status);
  const isRejected = applicationData?.status === 'REJECTED';

  return (
    <div className="p-4 sm:p-6 lg:p-10 bg-slate-50 min-h-screen">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 sm:mb-10">
        <div className="flex items-center gap-3 sm:gap-4">
          <Button variant="ghost" size="icon" asChild className="rounded-full h-9 w-9 sm:h-11 sm:u-11 p-0 hover:bg-white shadow-sm border border-slate-200">
            <Link href={`/committee-portal/assessments/${entityType}`}>
              <BackIcon className="h-4 w-4 sm:h-5 sm:w-5 text-slate-500" />
            </Link>
          </Button>
          <div>
            <h1 className="text-xl sm:text-3xl font-black text-slate-900 uppercase tracking-tight leading-none">Assessment Workspace</h1>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleInitiateChat}
            disabled={isInitiatingChat}
            className="h-11 sm:h-12 border-slate-200 text-slate-600 hover:bg-white font-black uppercase tracking-widest text-[10px] shadow-sm rounded-2xl"
          >
            {isInitiatingChat ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <MessageCircle className="h-4 w-4 mr-2" />}
            Secure Messaging
          </Button>

          {isChair && applicationData?.status !== "COMMITTEE_REVIEW_SUBMITTED" && (
            <Button
              variant="default"
              onClick={() => setShowConfirmDialog(true)}
              disabled={!resultsData || resultsData.memberResults.filter((r: any) => r.recommendation !== 'PENDING').length < (resultsData.totalMembersCount || 0)}
              className="h-11 sm:h-12 bg-primary hover:bg-primary/90 font-black uppercase tracking-widest text-[10px] shadow-xl shadow-primary/20 rounded-2xl"
            >
              <Send className="mr-2 h-4 w-4" />
              Finalize Decision
            </Button>
          )}
        </div>
      </div>

      <div className="mb-6 sm:mb-10">
        <UniversalStatusBanner
          status={applicationData?.status}
          type={entityType === "ecosystem" ? "ECOSYSTEM" : "STARTUP"}
          organizationName={applicationData?.name || applicationData?.startupName}
          issuedAt={applicationData?.certifiedAt || applicationData?.updatedAt}
        />
      </div>

      {evaluationSla && ["ASSIGNED_TO_COMMITTEE", "IN_COMMITTEE_REVIEW"].includes(applicationData?.status) && slaTimeLeft && (
        <div className={`mb-6 p-4 rounded-2xl border-2 flex items-center gap-3 ${
          slaOverdue
            ? "bg-red-50 border-red-200"
            : "bg-blue-50 border-blue-200"
        }`}>
          <Clock className={`h-5 w-5 ${
            slaOverdue ? "text-red-500" : "text-blue-500"
          }`} />
          <div className="flex-1">
            <p className={`text-xs font-black uppercase tracking-widest ${
              slaOverdue ? "text-red-600" : "text-blue-600"
            }`}>
              {slaOverdue ? `SLA BREACHED — ${slaTimeLeft}` : `${slaTimeLeft} to complete evaluation`}
            </p>
            <p className="text-[10px] text-slate-500 font-bold mt-0.5">
              Deadline: {new Date(evaluationSla.slaDeadline).toLocaleDateString()} · Assigned: {new Date(evaluationSla.assignedAt).toLocaleDateString()} · 30-day SLA per Art. 9.1/17
            </p>
          </div>
        </div>
      )}

      <Tabs defaultValue="evaluation" className="space-y-5">
        <div className="flex justify-center sm:justify-start">
          <TabsList className="bg-slate-100/80 p-1.5 rounded-[1.25rem] h-auto border border-slate-200/50 shadow-sm inline-flex flex-nowrap overflow-x-auto no-scrollbar">
            <TabsTrigger value="overview" className="h-10 sm:h-11 px-4 sm:px-6 rounded-[0.9rem] data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:shadow-md bg-transparent text-slate-500 font-black uppercase tracking-widest text-[9px] sm:text-[10px] transition-all">
              Overview
            </TabsTrigger>
            <TabsTrigger value="evaluation" className="h-10 sm:h-11 px-4 sm:px-6 rounded-[0.9rem] data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:shadow-md bg-transparent text-slate-500 font-black uppercase tracking-widest text-[9px] sm:text-[10px] transition-all">
              Evaluation
            </TabsTrigger>
            <TabsTrigger value="results" className="h-10 sm:h-11 px-4 sm:px-6 rounded-[0.9rem] data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:shadow-md bg-transparent text-slate-500 font-black uppercase tracking-widest text-[9px] sm:text-[10px] transition-all">
              Consolidated
            </TabsTrigger>
            <TabsTrigger value="workflow" className="h-10 sm:h-11 px-4 sm:px-6 rounded-[0.9rem] data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:shadow-md bg-transparent text-slate-500 font-black uppercase tracking-widest text-[9px] sm:text-[10px] transition-all">
              Timeline
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="overview" className="space-y-4">
          <Card className="border-none shadow-2xl overflow-hidden rounded-[1.5rem]">
            <CardHeader className="border-b bg-white p-4 sm:p-6 pb-2 sm:pb-3">
              <div className="flex flex-col gap-2">
                <div>
                  <h4 className="text-[9px] font-black text-primary uppercase tracking-[0.2em] mb-1 opacity-70">Application Profile</h4>
                  <h2 className="text-xl sm:text-2xl font-black text-slate-900 uppercase tracking-tight mb-2">{applicationData?.name || applicationData?.startupName}</h2>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  <Badge variant="outline" className="bg-slate-50 border-slate-200 text-slate-500 font-bold tracking-widest uppercase text-[8px] px-2 py-1 rounded-lg">{applicationData?.type || applicationData?.typeOfCompany}</Badge>
                  <Badge variant="outline" className="bg-slate-50 border-slate-200 text-slate-500 font-bold tracking-widest uppercase text-[8px] px-2 py-1 rounded-lg">{applicationData?.region || applicationData?.location}</Badge>
                  <Badge className="bg-primary/10 text-primary border-primary/20 font-black uppercase text-[8px] tracking-widest px-2 py-1 rounded-lg">{entityType}</Badge>
                    {!["ASSIGNED_TO_COMMITTEE", "IN_COMMITTEE_REVIEW"].includes(applicationData?.status) && (
                      <Badge className="bg-slate-900 text-white font-black uppercase text-[9px] tracking-widest px-3 py-1 rounded-full">
                        {applicationData?.status?.replace(/_/g, " ")}
                      </Badge>
                    )}
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-6 space-y-6">
              {entityType === "ecosystem" ? (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                    <div className="space-y-6">
                      <div>
                        <h4 className="text-[10px] font-black uppercase tracking-widest text-primary mb-3">Core Description</h4>
                        <p className="text-sm leading-relaxed text-slate-600">{applicationData?.description || "No description provided."}</p>
                      </div>
                      <div>
                        <h4 className="text-[10px] font-black uppercase tracking-widest text-primary mb-3">Service portfolio</h4>
                        <p className="text-sm leading-relaxed text-slate-600 italic">{applicationData?.serviceDescription || "No service details provided."}</p>
                      </div>
                    </div>
                    <div className="space-y-6">
                      <div>
                        <h4 className="text-[10px] font-black uppercase tracking-widest text-primary mb-3">Strategic Impact</h4>
                        <p className="text-sm leading-relaxed text-slate-600">{applicationData?.impactDescription || "No impact assessment provided."}</p>
                      </div>
                      <div>
                        <h4 className="text-[10px] font-black uppercase tracking-widest text-primary mb-3">Services Rendered</h4>
                        <div className="flex flex-wrap gap-2 mt-2">
                          {applicationData?.services?.map((service: string, i: number) => (
                            <Badge key={i} variant="secondary" className="bg-slate-100 text-slate-600 border-none font-bold text-[9px] uppercase tracking-tighter px-2">
                              {service}
                            </Badge>
                          ))}
                          {(!applicationData?.services || applicationData.services.length === 0) && (
                            <span className="text-xs text-slate-400 italic">No services listed</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  <Separator className="opacity-50" />

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-8">
                    <div>
                      <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Established</h4>
                      <p className="text-sm font-black text-slate-700">{applicationData?.established || "N/A"}</p>
                    </div>
                    <div>
                      <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Support Capacity</h4>
                      <p className="text-sm font-black text-slate-700">{applicationData?.capacity || "N/A"} <span className="text-[10px] opacity-40 font-normal">Entities</span></p>
                    </div>
                    <div>
                      <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Operational Region</h4>
                      <p className="text-sm font-black text-slate-700">{applicationData?.region || "N/A"}</p>
                    </div>
                    <div>
                      <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Digital Presence</h4>
                      {applicationData?.website ? (
                        <a href={applicationData.website} target="_blank" rel="noreferrer" className="text-sm font-black text-primary hover:underline flex items-center gap-1">
                          Visit Site <ExternalLink className="h-3 w-3" />
                        </a>
                      ) : (
                        <p className="text-sm font-black text-slate-300 uppercase italic">Not Provided</p>
                      )}
                    </div>
                  </div>
                </>
              ) : (
                <>
                  {/* Basic Info Row */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
                    <div><h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1">Industry</h4><p className="text-sm font-medium">{applicationData?.industry || "N/A"}</p></div>
                    <div><h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1">Type</h4><p className="text-sm font-medium">{applicationData?.typeOfCompany || "N/A"}</p></div>
                    <div><h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1">Employees</h4><p className="text-sm font-medium">{applicationData?.numberOfEmployees || "N/A"}</p></div>
                    <div><h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1">Founders</h4><p className="text-sm font-medium">{applicationData?.founders?.[0]?.fullName || applicationData?.founderName || "N/A"}</p></div>
                  </div>

                  <Separator />

                  {/* Business Case */}
                  <div>
                    <h4 className="font-bold text-xs uppercase tracking-wider text-primary mb-4">Business Case</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      <div>
                        <h5 className="text-xs font-bold text-muted-foreground uppercase mb-1">Problem Statement</h5>
                        <p className="text-sm leading-relaxed">{applicationData?.problemStatement || "N/A"}</p>
                      </div>
                      <div>
                        <h5 className="text-xs font-bold text-muted-foreground uppercase mb-1">Solution</h5>
                        <p className="text-sm leading-relaxed">{applicationData?.solution || "N/A"}</p>
                      </div>
                      <div>
                        <h5 className="text-xs font-bold text-muted-foreground uppercase mb-1">Target Market</h5>
                        <p className="text-sm leading-relaxed">{applicationData?.targetMarket || "N/A"}</p>
                      </div>
                      <div>
                        <h5 className="text-xs font-bold text-muted-foreground uppercase mb-1">Traction</h5>
                        <p className="text-sm leading-relaxed">{applicationData?.traction || "N/A"}</p>
                      </div>
                      {applicationData?.innovationDescription && (
                        <div>
                          <h5 className="text-xs font-bold text-muted-foreground uppercase mb-1">Innovation</h5>
                          <p className="text-sm leading-relaxed">{applicationData?.innovationDescription}</p>
                        </div>
                      )}
                      {applicationData?.competitiveAdvantage && (
                        <div>
                          <h5 className="text-xs font-bold text-muted-foreground uppercase mb-1">Competitive Advantage</h5>
                          <p className="text-sm leading-relaxed">{applicationData?.competitiveAdvantage}</p>
                        </div>
                      )}
                    </div>
                  </div>

                  <Separator />

                  {/* Financials */}
                  <div>
                    <h4 className="font-bold text-xs uppercase tracking-wider text-primary mb-4">Financials &amp; Market</h4>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
                      <div><h5 className="text-xs font-bold text-muted-foreground uppercase mb-1">Revenue</h5><p className="text-sm font-medium">{applicationData?.revenue || "N/A"}</p></div>
                      <div><h5 className="text-xs font-bold text-muted-foreground uppercase mb-1">Funding Raised</h5><p className="text-sm font-medium">{applicationData?.totalFundingRaised || "N/A"}</p></div>
                      <div><h5 className="text-xs font-bold text-muted-foreground uppercase mb-1">Investment Needed</h5><p className="text-sm font-medium">{applicationData?.investmentNeeded || "N/A"}</p></div>
                      <div><h5 className="text-xs font-bold text-muted-foreground uppercase mb-1">Use of Funds</h5><p className="text-sm font-medium">{applicationData?.useOfFunds || "N/A"}</p></div>
                    </div>
                  </div>
                </>
              )}

              <Separator />

              {/* Contact */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3">Contact Information</h4>
                <div className="flex flex-wrap gap-6">
                  <div className="flex items-center text-sm gap-2">
                    <Users className="h-4 w-4 text-muted-foreground shrink-0" />
                    <span>{applicationData?.contactName || applicationData?.founders?.[0]?.fullName || "Primary Contact"}</span>
                  </div>
                  <div className="flex items-center text-sm gap-2">
                    <Mail className="h-4 w-4 text-muted-foreground shrink-0" />
                    <span className="text-blue-600">{applicationData?.contactEmail || applicationData?.email || "No email"}</span>
                  </div>
                  <div className="flex items-center text-sm gap-2">
                    <Phone className="h-4 w-4 text-muted-foreground shrink-0" />
                    <span className="text-blue-600">{applicationData?.contactPhone || applicationData?.phoneNumber || "No phone"}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* ── Row 2: Documents ── */}
          <Card>
            <CardHeader className="border-b">
              <CardTitle className="text-lg">Documents</CardTitle>
              <CardDescription>Review the official documentation provided by the applicant.</CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="space-y-8">
                {applicationDocuments.map((doc) => (
                  <div key={doc.id} className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium text-base flex flex-row items-center gap-2">{getFileIcon(doc.type)}{doc.name}</h4>
                      <Button variant="outline" size="sm" asChild>
                        <a href={`/api/files/${doc.id}/download`} target="_blank" rel="noopener noreferrer">
                          <Download className="mr-2 h-4 w-4" />Download
                        </a>
                      </Button>
                    </div>
                    <div className="border rounded-lg overflow-hidden bg-muted/10">
                      {doc.type.includes("pdf")
                        ? <iframe src={`/api/files/${doc.id}/download?inline=true`} className="w-full h-[600px]" title={doc.name} />
                        : doc.type.includes("image/")
                          ? <img src={`/api/files/${doc.id}/download?inline=true`} alt={doc.name} className="max-w-full max-h-[600px] mx-auto object-contain p-4" />
                          : <div className="h-[200px] flex flex-col items-center justify-center">{getFileIcon(doc.type)}<p className="mt-4 text-muted-foreground text-sm">Preview not available.</p></div>
                      }
                    </div>
                  </div>
                ))}
                {applicationDocuments.length === 0 && (
                  <div className="py-16 text-center border-2 border-dashed rounded-xl">
                    <FileText className="h-12 w-12 text-muted-foreground mb-4 mx-auto opacity-20" />
                    <p className="text-muted-foreground font-medium italic">No documents uploaded.</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="evaluation" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <Card>
                <CardHeader className="border-b bg-muted/5"><CardTitle>Assessment Criteria</CardTitle><CardDescription>Provide detailed scores and qualitative feedback.</CardDescription></CardHeader>
                <CardContent className="p-0">
                  <Accordion type="single" collapsible className="w-full space-y-3 p-3 sm:p-4 bg-slate-50/50">
                    {dynamicCriteria.map((criteria) => (
                      <AccordionItem key={criteria.id} value={criteria.id} className="border-none bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all">
                        <AccordionTrigger className="px-5 py-5 hover:no-underline">
                          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center w-full pr-3 gap-3">
                            <div className="flex flex-col items-start gap-0.5">
                              <div className="flex items-center">
                                <span className="font-black text-slate-800 uppercase tracking-tight text-sm">{criteria.name}</span>
                                <Badge variant="secondary" className="ml-2 font-bold bg-primary/10 text-primary uppercase text-[8px] tracking-widest px-1.5 py-0 rounded-md border border-primary/20 text-[7px]">
                                  {criteria.weight}%
                                </Badge>
                              </div>
                              <p className="text-[10px] text-slate-400 font-medium text-left line-clamp-1">{criteria.description}</p>
                            </div>
                              <div className="flex items-center gap-2">
                                {criteria.directiveRef && (
                                  <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200 uppercase text-[7px] tracking-widest font-bold px-1.5 py-0.5">
                                    Directive
                                  </Badge>
                                )}
                                <div className="flex flex-col items-end">
                                  <span className="text-[8px] text-slate-400 uppercase font-black leading-none mb-1 tracking-widest">Valuation</span>
                                  <div className="flex items-center bg-primary/5 px-2 py-0.5 rounded-lg border border-primary/10 text-[11px] font-black text-primary shadow-sm">
                                    {detailedScores[criteria.id]?.weightEvaluation || 0}
                                    <span className="text-[9px] opacity-40 ml-0.5">/{criteria.weight}</span>
                                  </div>
                                </div>
                              </div>
                          </div>
                        </AccordionTrigger>
                        <AccordionContent className="px-5 sm:px-8 pb-5 pt-2 bg-slate-50/10 border-t border-slate-100">
                          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-10">
                            <div className="space-y-3">
                              <div className="space-y-4">
                                <div className="flex justify-between items-end">
                                  <Label className="font-black text-[9px] uppercase tracking-widest text-slate-500">
                                    Rating <span className="text-red-500">*</span>
                                  </Label>
                                  <div className="text-2xl font-black text-slate-800 tracking-tighter italic">
                                    {detailedScores[criteria.id]?.score || 0}
                                    <span className="text-xs font-normal opacity-30 not-italic ml-0.5">/ 5</span>
                                  </div>
                                </div>
                                <div className="px-1">
                                  <Slider 
                                    disabled={isReadOnly} 
                                    max={5} min={0} step={1} 
                                    value={[detailedScores[criteria.id]?.score || 0]} 
                                    onValueChange={(value) => handleScoreChange(criteria.id, value)} 
                                    className="my-3" 
                                  />
                                  <div className="flex justify-between text-[7px] uppercase tracking-widest text-slate-400 font-black px-0.5 opacity-60">
                                    <span>Zero</span>
                                    <span>Poor</span>
                                    <span>Good</span>
                                    <span>Max</span>
                                  </div>
                                </div>
                              </div>

                              <div className="space-y-4">
                                <div className="flex justify-between items-end">
                                  <Label className="font-black text-[9px] uppercase tracking-widest text-primary">
                                    Valuation <span className="text-red-500">*</span>
                                  </Label>
                                  <div className="text-2xl font-black text-primary tracking-tighter italic">
                                    {detailedScores[criteria.id]?.weightEvaluation || 0}
                                    <span className="text-xs font-normal opacity-30 not-italic ml-0.5">/ {criteria.weight}</span>
                                  </div>
                                </div>
                                <div className="flex gap-3 items-center">
                                  <div className="flex-1 px-1">
                                    <Slider 
                                      disabled={isReadOnly || !!criteria.directiveRef} 
                                      max={criteria.weight} min={0} step={1} 
                                      value={[detailedScores[criteria.id]?.weightEvaluation || 0]} 
                                      onValueChange={(value) => handleWeightEvaluationChange(criteria.id, value[0])} 
                                      className="my-3" 
                                    />
                                  </div>
                                  <div className="w-16">
                                    <Input 
                                      type="number" 
                                      max={criteria.weight} min={0} 
                                      value={detailedScores[criteria.id]?.weightEvaluation || 0} 
                                      readOnly={!!criteria.directiveRef}
                                      onChange={(e) => { 
                                        if (criteria.directiveRef) return;
                                        const val = parseInt(e.target.value); 
                                        if (!isNaN(val)) handleWeightEvaluationChange(criteria.id, Math.min(criteria.weight, Math.max(0, val))); 
                                      }} 
                                      className={`h-10 text-base font-black text-center border-2 rounded-xl ${criteria.directiveRef ? 'opacity-60 cursor-not-allowed' : 'focus:ring-primary/20'}`} 
                                    />
                                  </div>
                                </div>
                              </div>
                            </div>
                            
                            <div className="flex flex-col h-full gap-2 pt-1">
                                <Label className="font-black text-[9px] uppercase tracking-widest text-slate-500 px-0.5">
                                  Audit Remarks
                                </Label>
                                <div className="relative flex-1 flex flex-col">
                                   <Textarea 
                                    placeholder="Justify your institutional score..." 
                                    className="flex-1 resize-none min-h-[120px] sm:min-h-full border-2 rounded-xl p-4 text-xs leading-relaxed focus:ring-primary/20 border-slate-100 bg-slate-50/50" 
                                    disabled={isReadOnly} 
                                    maxLength={500}
                                    value={detailedScores[criteria.id]?.comment || ""} 
                                    onChange={(e) => handleCommentChange(criteria.id, e.target.value)} 
                                  />
                                  <div className="absolute bottom-3 right-3 flex items-center gap-2">
                                    <span className={`text-[8px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded-md border ${
                                      (detailedScores[criteria.id]?.comment?.length || 0) >= 500 
                                      ? "bg-red-50 text-red-500 border-red-100" 
                                      : "bg-green-50 text-green-600 border-green-100"
                                    }`}>
                                      {detailedScores[criteria.id]?.comment?.length || 0} / 500
                                    </span>
                                  </div>
                                </div>
                            </div>
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                </CardContent>
              </Card>
            </div>
            <div className="lg:col-span-1">
              <Card className="sticky top-10 border-none shadow-[0_32px_64px_-16px_rgba(0,0,0,0.1)] rounded-[2.5rem] bg-white overflow-hidden">
                <CardHeader className="bg-primary p-6 sm:p-8">
                  <CardTitle className="flex items-center gap-3 text-white font-black uppercase tracking-widest text-sm">
                    <div className="p-2 bg-white/20 rounded-xl">
                      <CheckCircle className="h-5 w-5" />
                    </div>
                    Expert Verdict
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-8 p-6 sm:p-8">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex flex-col items-center justify-center p-4 bg-primary/5 rounded-2xl border-2 border-primary/10">
                      <div className="text-3xl font-black text-primary mb-1">{isChair && resultsData ? resultsData.overallAverageValuation?.toFixed(1) : calculateTotalScore()}<span className="text-[10px] font-normal opacity-60 ml-0.5">/ {calculateTotalWeight()}</span></div>
                      <div className="text-[9px] font-black uppercase tracking-wider text-primary/60">{isChair ? "Avg. Committee Valuation" : "My Total Valuation"}</div>
                      <Progress value={isChair && resultsData ? (resultsData.overallAverageValuation / (resultsData.totalWeightAvailable || 1)) * 100 : calculateFinalPercentage()} className="h-1.5 w-full mt-3" />
                    </div>
                    <div className="flex flex-col items-center justify-center p-4 bg-slate-50 rounded-2xl border-2 border-slate-200/50">
                      <div className="text-3xl font-black text-slate-700 mb-1">{isChair && resultsData ? resultsData.overallAverageRating?.toFixed(1) : calculateAverageRating()}<span className="text-[10px] font-normal text-muted-foreground ml-0.5">/ 5</span></div>
                      <div className="text-[9px] font-black uppercase tracking-wider text-slate-500">{isChair ? "Avg. Committee Rating" : "My Avg. Rating"}</div>
                      <div className="flex gap-0.5 mt-3">{[1, 2, 3, 4, 5].map((star) => <div key={star} className={`h-1.5 w-4 rounded-full ${star <= Math.round(Number(isChair && resultsData ? resultsData.overallAverageRating : calculateAverageRating())) ? "bg-amber-400" : "bg-slate-200"}`} />)}</div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center gap-1 px-1">
                      <Label className={`font-bold text-sm uppercase tracking-wider ${recommendationError ? 'text-red-600' : 'text-muted-foreground'}`}>
                        My Recommendation
                      </Label>
                      <span className="text-red-500 font-bold">*</span>
                    </div>
                    <Select
                      value={recommendation}
                      onValueChange={(v) => { setRecommendation(v); setRecommendationError(false); }}
                      disabled={isReadOnly}
                    >
                      <SelectTrigger className={`h-12 border-2 text-lg font-bold transition-colors ${
                        recommendationError ? 'border-red-500 ring-2 ring-red-200' : ''
                      }`}>
                        <SelectValue placeholder="Select your verdict (required)" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="APPROVE"><div className="flex items-center font-bold text-green-600"><ThumbsUp className="h-5 w-5 mr-3" />APPROVE</div></SelectItem>
                        <SelectItem value="REJECT"><div className="flex items-center font-bold text-red-600"><ThumbsDown className="h-5 w-5 mr-3" />REJECT</div></SelectItem>
                        <SelectItem value="MORE_INFO"><div className="flex items-center font-bold text-amber-500"><HelpCircle className="h-5 w-5 mr-3" />NEED CLARIFICATION</div></SelectItem>
                      </SelectContent>
                    </Select>
                    {recommendationError && (
                      <p className="text-xs text-red-600 font-semibold px-1 flex items-center gap-1">
                        <AlertCircle className="h-3 w-3" /> A recommendation is required before submitting.
                      </p>
                    )}
                  </div>
                  <div className="space-y-3">
                    <Label className="font-bold text-sm uppercase tracking-wider text-muted-foreground px-1">Overall Remarks</Label>
                    <Textarea placeholder="Summarize your overall reasoning..." className="min-h-[120px] border-2" disabled={isReadOnly} value={finalComments} onChange={(e) => setFinalComments(e.target.value)} />
                  </div>
                </CardContent>
                <CardFooter className="bg-muted/10 border-t flex flex-col gap-3 p-6">
                  {!isReadOnly && (
                    <>
                      <Button
                        className="w-full h-12 text-lg font-bold"
                        onClick={handleOpenMyReviewSubmit}
                        disabled={isSubmitting}
                      >
                        {isSubmitting ? <Loader2 className="mr-2 h-5 w-5 animate-spin"/> : <Send className="mr-2 h-5 w-5" />}
                        {hasSubmittedReview ? 'Update My Evaluation' : 'Submit My Evaluation'}
                      </Button>
                      <Button variant="outline" className="w-full h-10 font-semibold border-2" onClick={saveDraft} disabled={isSubmitting}><Save className="mr-2 h-4 w-4" />Save as Draft</Button>
                      {hasSubmittedReview && (
                        <Button variant="secondary" className="w-full h-10 font-semibold border-2 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border-indigo-200" onClick={() => setShowResultModal(true)}>
                          <Eye className="mr-2 h-4 w-4" />View Evaluation Summary
                        </Button>
                      )}
                    </>
                  )}
                  {isReadOnly && (
                    <div className="w-full space-y-3">
                      <div className="p-4 bg-slate-100 border border-slate-200 rounded-lg text-center font-bold text-slate-700">
                        Status: {(applicationData?.status || "SUBMITTED").replace(/_/g, " ")}
                      </div>
                      <Button variant="outline" className="w-full h-10 font-semibold border-2" onClick={() => setShowResultModal(true)}>
                        <Eye className="mr-2 h-4 w-4" />View My Final Evaluation
                      </Button>
                    </div>
                  )}
                </CardFooter>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="results" className="space-y-6">
          {!resultsData || !resultsData.memberResults || resultsData.memberResults.length === 0 ? (
            <Card className="flex flex-col items-center justify-center p-12 text-center border-dashed border-2">
               <div className="bg-primary/5 p-6 rounded-full mb-4">
                <Users className="h-12 w-12 text-primary opacity-20" />
              </div>
              <h3 className="text-xl font-bold mb-2">No Reviews Submitted Yet</h3>
              <p className="text-muted-foreground max-w-md">Aggregated results will appear here once committee members submit their evaluations.</p>
            </Card>
          ) : (
            <div className="space-y-8">
              {/* Summary of Committee Members (Member Evaluation Summary) */}
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Users className="h-6 w-6 text-primary" />
                    <h3 className="text-xl font-black uppercase tracking-widest text-slate-800">Review Committee Breakdown</h3>
                  </div>
                  <Badge variant="outline" className="text-[10px] font-bold uppercase tracking-tighter">Anonymized View</Badge>
                </div>
                
                <Card className="border-2 overflow-hidden shadow-sm">
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="bg-slate-50 border-b">
                          <th className="px-6 py-4 text-left font-black uppercase tracking-wider text-[10px] text-slate-500">Member ID</th>
                          <th className="px-6 py-4 text-center font-black uppercase tracking-wider text-[10px] text-slate-500">Verdict</th>
                          <th className="px-6 py-4 text-center font-black uppercase tracking-wider text-[10px] text-slate-500">Avg. Rating</th>
                          <th className="px-6 py-4 text-center font-black uppercase tracking-wider text-[10px] text-slate-500">Total Valuation</th>
                          <th className="px-6 py-4 text-left font-black uppercase tracking-wider text-[10px] text-slate-500">Summary Comment</th>
                        </tr>
                      </thead>
                      <tbody>
                        {resultsData.memberResults.map((result: any, idx: number) => (
                          <tr key={result.memberId} className="border-b last:border-0 hover:bg-muted/10 transition-colors">
                            <td className="px-6 py-4 font-bold text-primary">
                              <div className="flex flex-col gap-0.5">
                                <div className="flex items-center gap-2">
                                  <span className="text-slate-900 font-black">{result.memberName}</span>
                                  {result.isChair && (
                                    <Badge variant="outline" className="text-[9px] font-black uppercase text-indigo-600 border-indigo-200 bg-indigo-50">
                                      Chairperson
                                    </Badge>
                                  )}
                                  <Button 
                                    variant="ghost" 
                                    size="sm" 
                                    className="h-7 w-7 p-0 rounded-full hover:bg-primary/10 transition-colors"
                                    onClick={() => {
                                      setSelectedMemberProfile(result);
                                      setShowProfileModal(true);
                                    }}
                                  >
                                    <Eye className="h-4 w-4 text-primary/60" />
                                  </Button>
                                </div>
                                <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground font-bold uppercase tracking-tighter">
                                  <Mail className="h-3 w-3 text-primary/40" />
                                  {result.email}
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 text-center">
                              <Badge variant={
                                result.recommendation === 'APPROVE' ? 'default' : 
                                result.recommendation === 'REJECT' ? 'destructive' : 'outline'
                              } className="bg-opacity-10 font-black px-3 py-1 uppercase text-[9px] border-2">
                                {result.recommendation || 'PENDING'}
                              </Badge>
                            </td>
                            <td className="px-6 py-4 text-center font-black text-slate-700">
                              {result.averageRating?.toFixed(1) || "0.0"}
                              <span className="text-[10px] opacity-40 ml-0.5">/5</span>
                            </td>
                            <td className="px-6 py-4 text-center font-black text-primary text-lg">
                              {result.totalValuation?.toFixed(1)}
                              <span className="text-[10px] opacity-60 ml-0.5">pts</span>
                            </td>
                            <td className="px-6 py-4 text-xs italic text-muted-foreground max-w-xs truncate">
                              {result.overallComment ? `"${result.overallComment}"` : "No summary provided"}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </Card>
              </div>

              {/* Aggregated Header Dashboard (Consolidated Result Section) */}
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

              {/* Detailed Member Evaluations */}
              <div className="space-y-6">
                <div className="flex items-center gap-2">
                  <ClipboardCheck className="h-6 w-6 text-primary" />
                  <h3 className="text-xl font-black uppercase tracking-widest text-slate-800">Detailed Evaluator Breakdown</h3>
                </div>

                <Accordion type="single" collapsible className="space-y-4">
                  {resultsData.memberResults.map((result: any, idx: number) => (
                    <AccordionItem key={result.memberId} value={result.memberId} className="border-2 rounded-2xl overflow-hidden bg-background px-0 shadow-sm border-slate-200">
                      <AccordionTrigger className="px-6 py-5 hover:no-underline hover:bg-muted/5 transition-colors">
                        <div className="flex items-center gap-4 text-left">
                          <div className="bg-primary/10 h-10 w-10 rounded-full flex items-center justify-center font-black text-primary">
                            {idx + 1}
                          </div>
                          <div>
                            <div className="flex items-center gap-3">
                              <span className="font-black text-lg text-slate-800 block">{result.memberName} Evaluation</span>
                              {result.isChair && (
                                <Badge variant="outline" className="text-[9px] font-black uppercase text-indigo-600 border-indigo-200 bg-indigo-50">
                                  Chairperson
                                </Badge>
                              )}
                              <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground font-bold bg-muted/40 px-2 py-0.5 rounded-full">
                                <Mail className="h-3 w-3" />
                                {result.email}
                              </div>
                            </div>
                            <div className="flex items-center gap-2 mt-0.5">
                              <span className="text-[10px] font-bold text-muted-foreground uppercase">{result.criteriaScores?.length || 0} Criteria Scored</span>
                              <span className="text-[10px] text-muted-foreground">•</span>
                              <span className="text-[10px] font-black text-primary">{result.totalValuation?.toFixed(1)} Points</span>
                            </div>
                          </div>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent className="p-0 border-t bg-slate-50/30">
                        <div className="p-6">
                          <div className="overflow-hidden rounded-xl border-2 bg-white">
                            <table className="w-full text-sm">
                              <thead>
                                <tr className="bg-slate-100/50 border-b">
                                  <th className="px-4 py-3 text-left font-black uppercase text-[9px] w-[250px]">Criterion</th>
                                  <th className="px-4 py-3 text-center font-black uppercase text-[9px] w-[80px]">Rating</th>
                                  <th className="px-4 py-3 text-center font-black uppercase text-[9px] w-[80px]">Valuation</th>
                                  <th className="px-4 py-3 text-left font-black uppercase text-[9px]">Justification</th>
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
                                          <div className="text-[10px] text-muted-foreground mt-1 font-medium">Max Points: {critInfo.weight}</div>
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
                                        {score.valuation?.toFixed(1)}
                                      </td>
                                      <td className="px-4 py-4 text-xs italic text-muted-foreground leading-relaxed">
                                        {score.comment ? `"${score.comment}"` : <span className="opacity-30">No remarks</span>}
                                      </td>
                                    </tr>
                                  );
                                })}
                              </tbody>
                            </table>
                          </div>
                   
                          {result.overallComment && (
                            <div className="mt-6 p-4 bg-white border-2 border-dashed rounded-xl">
                              <h5 className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2">Overall Evaluator Remark</h5>
                              <p className="text-sm italic text-slate-600 leading-relaxed">"{result.overallComment}"</p>
                            </div>
                          )}
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </div>

              {/* ── Final Committee Decision / Section ── */}
              <div className="pt-4 border-t-2 border-slate-100">
                <div className="flex items-center gap-2 mb-4">
                  <ShieldCheck className="h-6 w-6 text-indigo-600" />
                  <h3 className="text-xl font-black uppercase tracking-widest text-slate-800">Final Committee Decision</h3>
                </div>

                {!resultsData.decision ? (
                  isChair && (
                    <Card className="border-2 border-indigo-200 bg-indigo-50/50 shadow-md">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-indigo-800 text-lg flex items-center gap-2">
                          <Award className="h-5 w-5" />
                          Chairperson Action Required
                        </CardTitle>
                        <CardDescription className="text-indigo-600 font-medium italic">
                          As the Committee Chair, you are responsible for providing the final consolidated decision for this application.
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="pt-4">
                        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                          <div className="space-y-4 max-w-2xl">
                            <p className="text-sm text-slate-600 leading-relaxed font-medium">
                              Review the average scores and individual member justifications above. Once the committee has reached a consensus, submit the final official verdict (Approve, Reject, or Need Clarification).
                            </p>
                            <div className="flex items-center gap-4">
                              <div className="flex items-center gap-2 text-xs font-bold text-slate-500">
                                <CheckCircle2 className="h-4 w-4 text-green-500" /> 
                                {resultsData.memberResults.length} / {resultsData.totalMembersCount || 0} Members Submitted
                              </div>
                              <div className="flex items-center gap-2 text-xs font-bold text-slate-500">
                                <TrendingUp className="h-4 w-4 text-indigo-500" />
                                {resultsData.overallAverageValuation?.toFixed(1)} Avg. Score
                              </div>
                            </div>
                          </div>
                          
                          <Button 
                            className="bg-indigo-600 hover:bg-indigo-700 text-white font-black px-8 h-14 shadow-lg shadow-indigo-200 transition-all hover:scale-105"
                            onClick={() => setShowConfirmDialog(true)}
                            disabled={!resultsData || resultsData.memberResults.filter((r: any) => r.recommendation !== 'PENDING').length < (resultsData.totalMembersCount || 0)}
                          >
                            <Send className="mr-2 h-5 w-5" />
                            Submit Final Official Decision
                          </Button>
                        </div>
                        {resultsData && resultsData.memberResults.filter((r: any) => r.recommendation !== 'PENDING').length < (resultsData.totalMembersCount || 0) && (
                          <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg flex items-center gap-2 text-[10px] font-bold text-amber-700 uppercase tracking-wider">
                            <AlertCircle className="h-4 w-4" />
                            Note: All committee members ({resultsData.totalMembersCount}) must submit their reviews before the final decision can be finalized. Only {resultsData.memberResults.filter((r: any) => r.recommendation !== 'PENDING').length} submitted so far.
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  )
                ) : (
                  <Card className={`border-2 overflow-hidden ${resultsData.decision.finalDecision === 'APPROVE' || resultsData.decision.finalDecision === 'PASSED' ? 'border-green-300 shadow-green-100' : resultsData.decision.finalDecision === 'MORE_INFO' ? 'border-amber-300 shadow-amber-100' : 'border-red-300 shadow-red-100'} shadow-lg`}>
                    <div className={`${resultsData.decision.finalDecision === 'APPROVE' || resultsData.decision.finalDecision === 'PASSED' ? 'bg-green-600' : resultsData.decision.finalDecision === 'MORE_INFO' ? 'bg-amber-500' : 'bg-red-600'} p-4 text-white flex items-center justify-between`}>
                      <CardTitle className="flex items-center gap-2 text-lg font-black uppercase tracking-wider">
                        {resultsData.decision.finalDecision === 'APPROVE' || resultsData.decision.finalDecision === 'PASSED'
                          ? <><ThumbsUp className="h-6 w-6" /> Approved</>
                          : resultsData.decision.finalDecision === 'MORE_INFO'
                            ? <><HelpCircle className="h-6 w-6" /> Needs Clarification</>
                            : <><ThumbsDown className="h-6 w-6" /> Rejected</>}
                      </CardTitle>
                      <Badge className="bg-white/20 hover:bg-white/30 border-white/20 text-white font-bold uppercase text-[10px]">Official Record</Badge>
                    </div>
                    {resultsData.decision.summary && (
                      <CardContent className="p-6 bg-white">
                        <div className="space-y-4">
                          <div>
                            <h5 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-2">Chairman Summary</h5>
                            <p className="text-base text-slate-700 leading-relaxed font-medium italic">&ldquo;{resultsData.decision.summary}&rdquo;</p>
                          </div>
                          <div className="flex items-center gap-2 text-[10px] text-muted-foreground font-bold">
                            <CheckCircle2 className="h-3 w-3 text-green-500" /> 
                            Final Decision Authenticated by Committee Chairperson
                          </div>
                        </div>
                      </CardContent>
                    )}
                  </Card>
                )}
              </div>
            </div>
          )}
        </TabsContent>

        <TabsContent value="workflow" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-1">
              <Card className="h-full">
                <CardHeader className="bg-muted/10 border-b">
                  <CardTitle className="text-lg">Application Progress</CardTitle>
                </CardHeader>
                <CardContent className="pt-6">
                  <div className="space-y-6 relative before:absolute before:left-[10px] before:top-2 before:bottom-2 before:w-[2px] before:bg-slate-100">
                    {WORKFLOW_STEPS.map((step, idx) => {
                      const isActive = idx <= currentStatusIndex;
                      const isCurrent = idx === currentStatusIndex;
                      
                      return (
                        <div key={step.id} className="flex gap-4 relative">
                          <div className={`z-10 h-5 w-5 rounded-full flex items-center justify-center ${isActive ? 'bg-primary text-white' : 'bg-slate-100 text-slate-400'}`}>
                            {isActive ? <Check className="h-3 w-3" /> : <div className="h-1.5 w-1.5 rounded-full bg-slate-300" />}
                          </div>
                          <div className="flex-1">
                            <p className={`font-bold text-sm ${isActive ? 'text-primary' : 'text-muted-foreground'}`}>
                              {step.label}
                              {isCurrent && <Badge variant="outline" className="ml-2 text-[10px] bg-primary/10 text-primary border-primary/20">Current</Badge>}
                            </p>
                            <p className="text-xs text-muted-foreground mt-0.5">{step.description}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="md:col-span-2">
              <Card className="h-full">
                <CardHeader className="bg-muted/10 border-b">
                  <CardTitle className="text-lg">Detailed Status History</CardTitle>
                  <CardDescription>Historical record of application status transitions.</CardDescription>
                </CardHeader>
                <CardContent className="pt-6 max-h-[600px] overflow-y-auto pr-2 sm:pr-6 custom-scrollbar">
                  <div className="space-y-8 py-4 px-2">
                    {applicationData?.history && applicationData.history.length > 0 ? (
                      applicationData.history.map((item: any, idx: number) => (
                        <div key={item.id} className="relative flex gap-6">
                          <div className="flex flex-col items-center">
                            <div className="h-10 w-10 rounded-xl bg-slate-50 border-2 flex items-center justify-center text-primary shadow-sm">
                              <TrendingUp className="h-5 w-5" />
                            </div>
                            {idx !== applicationData.history.length - 1 && (
                              <div className="w-[2px] flex-1 bg-slate-100 my-2" />
                            )}
                          </div>
                          <div className="flex-1 pb-4">
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center gap-3">
                                <Badge variant="secondary" className="font-black text-[10px] uppercase tracking-wider py-1">
                                  {item.status || item.toStatus}
                                </Badge>
                                {item.changedBy && (
                                  <span className="text-xs font-bold text-muted-foreground">
                                    by {item.changedBy.firstName} {item.changedBy.lastName}
                                  </span>
                                )}
                              </div>
                              <time className="text-[10px] font-bold text-muted-foreground/60 uppercase">
                                {new Date(item.createdAt).toLocaleString(undefined, { 
                                  dateStyle: 'medium', 
                                  timeStyle: 'short' 
                                })}
                              </time>
                            </div>
                            <div className="bg-slate-50/50 rounded-xl p-4 border-2 border-dashed border-slate-200">
                              <p className="text-sm italic text-slate-600 leading-relaxed font-medium">
                                {item.comment || item.reason || "Status transitioned during normal workflow processing."}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="py-12 text-center">
                        <TrendingUp className="h-12 w-12 text-muted-foreground mx-auto opacity-20 mb-4" />
                        <p className="text-muted-foreground font-medium">No historical status records found.</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>
      </Tabs>

      {/* ── Chair Final Decision Confirm ── */}
      <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Submit Final Committee Decision</DialogTitle>
            <DialogDescription>
              As the Committee Chair, provide the final decision and summary for this application.
            </DialogDescription>
          </DialogHeader>
          
          {resultsData && (
            <div className="bg-slate-50 border rounded-lg p-4 grid grid-cols-3 gap-4 text-center mt-2">
              <div>
                <div className="text-xl font-black text-primary">{resultsData.overallAverageValuation?.toFixed(1)}<span className="text-sm font-normal opacity-60">/{resultsData.totalWeightAvailable}</span></div>
                <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mt-1">Avg Valuation</div>
              </div>
              <div className="border-x">
                <div className="text-xl font-black text-amber-600">{resultsData.overallAverageRating?.toFixed(1)}<span className="text-sm font-normal opacity-60">/5</span></div>
                <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mt-1">Avg Rating</div>
              </div>
              <div>
                <div className="text-xl font-black text-slate-700">{resultsData.memberResults.length}<span className="text-sm font-normal opacity-60">/{resultsData.totalMembersCount ?? resultsData.memberResults.length}</span></div>
                <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mt-1">Submissions</div>
              </div>
            </div>
          )}

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label className="font-bold text-sm">Official Committee Decision</Label>
              <Select value={finalDecisionChoice} onValueChange={setFinalDecisionChoice}>
                <SelectTrigger className="h-12 border-2 text-base font-bold">
                  <SelectValue placeholder="Select final decision" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="APPROVE"><div className="flex items-center font-bold text-green-600"><ThumbsUp className="h-5 w-5 mr-2" />Approve</div></SelectItem>
                  <SelectItem value="REJECT"><div className="flex items-center font-bold text-red-600"><ThumbsDown className="h-5 w-5 mr-2" />Reject</div></SelectItem>
                  <SelectItem value="MORE_INFO"><div className="flex items-center font-bold text-amber-500"><HelpCircle className="h-5 w-5 mr-2" />Need Clarification / Waitlist</div></SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="font-bold text-sm">Committee Summary Remarks</Label>
              <Textarea 
                placeholder="Summarize the committee's reasoning for this final decision..." 
                className="min-h-[120px] border-2" 
                value={finalDecisionSummary} 
                onChange={(e) => setFinalDecisionSummary(e.target.value)} 
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowConfirmDialog(false)}>Cancel</Button>
            <Button 
              className="bg-primary hover:bg-primary/90 text-white font-black uppercase tracking-widest text-[10px] rounded-2xl shadow-xl shadow-primary/20 h-11 sm:h-12 px-8 transition-all hover:scale-[1.02]" 
              onClick={submitFinalAssessment} 
              disabled={isSubmitting || !finalDecisionChoice}
            >
              {isSubmitting ? (
                <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Processing...</>
              ) : (
                "Finalize Decision"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Personal Evaluation Result Modal ── */}
      <Dialog open={showResultModal} onOpenChange={setShowResultModal}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ClipboardCheck className="h-5 w-5 text-primary" />
              Evaluation Result Summary
            </DialogTitle>
            <DialogDescription>
              Your personal evaluation has been successfully submitted. You can update your evaluation until the final committee decision is submitted by the chairman.
            </DialogDescription>
          </DialogHeader>

          {/* Recommendation banner */}
          <div className={`rounded-lg px-4 py-3 border-2 flex items-center gap-3 ${
            recommendation === 'APPROVE' ? 'bg-green-50 border-green-300' :
            recommendation === 'REJECT' ? 'bg-red-50 border-red-300' :
            'bg-amber-50 border-amber-300'
          }`}>
            {recommendation === 'APPROVE'
              ? <ThumbsUp className="h-6 w-6 text-green-600 shrink-0" />
              : recommendation === 'REJECT'
                ? <ThumbsDown className="h-6 w-6 text-red-600 shrink-0" />
                : <HelpCircle className="h-6 w-6 text-amber-600 shrink-0" />}
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">My Recommendation</p>
              <p className={`font-black text-lg ${
                recommendation === 'APPROVE' ? 'text-green-700' :
                recommendation === 'REJECT' ? 'text-red-700' :
                'text-amber-700'
              }`}>
                {recommendation === 'APPROVE' ? 'Approve' : recommendation === 'REJECT' ? 'Reject' : 'Need Clarification'}
              </p>
            </div>
          </div>

          {/* Criteria table */}
          <div className="space-y-2">
            <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Criteria Scores</p>
            <div className="rounded-lg border overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-muted/40 border-b">
                    <th className="text-left px-3 py-2 font-bold text-xs uppercase tracking-wider text-muted-foreground">Criterion</th>
                    <th className="text-center px-3 py-2 font-bold text-xs uppercase tracking-wider text-muted-foreground">Rating</th>
                    <th className="text-center px-3 py-2 font-bold text-xs uppercase tracking-wider text-primary">Valuation</th>
                  </tr>
                </thead>
                <tbody>
                  {dynamicCriteria.map((c) => (
                    <tr key={c.id} className="border-b last:border-0 hover:bg-muted/10">
                      <td className="px-3 py-2">
                        <p className="font-medium">{c.name}</p>
                        {detailedScores[c.id]?.comment && (
                          <p className="text-xs text-muted-foreground italic mt-0.5 line-clamp-2">
                            &ldquo;{detailedScores[c.id]?.comment}&rdquo;
                          </p>
                        )}
                      </td>
                      <td className="px-3 py-2 text-center">
                        <span className="font-bold text-slate-700">{detailedScores[c.id]?.score ?? '—'}/5</span>
                      </td>
                      <td className="px-3 py-2 text-center">
                        <span className="font-black text-primary">{detailedScores[c.id]?.weightEvaluation ?? '—'}</span>
                        <span className="text-[10px] text-muted-foreground">/{c.weight}</span>
                      </td>
                    </tr>
                  ))}
                  <tr className="bg-primary/5 border-t-2 border-primary/20">
                    <td className="px-3 py-2 font-black text-xs uppercase tracking-wider text-primary">TOTAL</td>
                    <td className="px-3 py-2 text-center font-black text-slate-700">{calculateAverageRating()}/5</td>
                    <td className="px-3 py-2 text-center font-black text-primary text-base">
                      {calculateTotalScore()}<span className="text-[10px] font-normal text-muted-foreground">/{calculateTotalWeight()}</span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Overall comment */}
          {finalComments && (
            <div className="space-y-1">
              <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Overall Remarks</p>
              <div className="bg-muted/30 rounded-lg p-3 border text-sm text-muted-foreground italic">
                &ldquo;{finalComments}&rdquo;
              </div>
            </div>
          )}

          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setShowResultModal(false)}>
              Close
            </Button>
            {!isReadOnly && (
              <Button
                className={`font-bold text-white bg-indigo-600 hover:bg-indigo-700`}
                onClick={() => setShowResultModal(false)}
              >
                <CheckSquare className="mr-2 h-4 w-4" /> Edit Evaluation
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Member Profile View Modal ── */}
      <Dialog open={showProfileModal} onOpenChange={setShowProfileModal}>
        <DialogContent className="sm:max-w-[425px] overflow-hidden p-0 rounded-3xl border-none shadow-2xl">
          <div className="bg-gradient-to-br from-indigo-600 to-indigo-800 p-8 text-white relative">
            <div className="absolute top-0 right-0 p-8 opacity-10">
              <Users size={120} />
            </div>
            <div className="relative z-10 flex flex-col items-center text-center">
              <Avatar className="h-24 w-24 border-4 border-white/20 shadow-xl mb-4">
                <AvatarFallback className="text-3xl bg-white/10 font-black text-white">
                  {selectedMemberProfile?.memberName?.substring(0, 2).toUpperCase() || "CM"}
                </AvatarFallback>
              </Avatar>
              <h3 className="text-2xl font-black tracking-tight">{selectedMemberProfile?.memberName}</h3>
              <div className="flex items-center gap-2 mt-2">
                <Badge className="bg-white/20 hover:bg-white/30 text-white border-none font-bold uppercase text-[10px] tracking-widest px-3">
                  {selectedMemberProfile?.userRole || "Committee Member"}
                </Badge>
                {selectedMemberProfile?.isChair && (
                  <Badge className="bg-amber-400 text-amber-900 border-none font-black uppercase text-[10px] tracking-widest px-3">
                    Chairperson
                  </Badge>
                )}
              </div>
            </div>
          </div>
          
          <div className="p-8 bg-white space-y-6">
            <div className="grid grid-cols-1 gap-6">
              <div className="flex items-start gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-100 group hover:border-indigo-100 transition-colors">
                <div className="bg-white p-3 rounded-xl shadow-sm border border-slate-100 text-indigo-600 group-hover:text-indigo-700">
                  <Mail className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Email Address</p>
                  <p className="text-sm font-bold text-slate-700">{selectedMemberProfile?.email || "N/A"}</p>
                </div>
              </div>

              <div className="flex items-start gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-100 group hover:border-indigo-100 transition-colors">
                <div className="bg-white p-3 rounded-xl shadow-sm border border-slate-100 text-indigo-600 group-hover:text-indigo-700">
                  <Phone className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Contact Number</p>
                  <p className="text-sm font-bold text-slate-700">{selectedMemberProfile?.phoneNumber || "Not Provided"}</p>
                </div>
              </div>

              <div className="flex items-start gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-100 group hover:border-indigo-100 transition-colors">
                <div className="bg-white p-3 rounded-xl shadow-sm border border-slate-100 text-indigo-600 group-hover:text-indigo-700">
                  <Info className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Address Info</p>
                  <p className="text-sm font-bold text-slate-700 leading-relaxed">{selectedMemberProfile?.address || "No address on record"}</p>
                </div>
              </div>
            </div>

            <Button 
              className="w-full h-12 bg-slate-900 hover:bg-slate-800 text-white font-black rounded-2xl shadow-lg shadow-slate-200 transition-all active:scale-95 mt-4"
              onClick={() => setShowProfileModal(false)}
            >
              Close Profile
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
