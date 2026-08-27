"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useParams, useSearchParams } from "next/navigation";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowLeft,
  FileText,
  AlertCircle,
  Send,
  Save,
  Info,
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
import { WorkflowDiagram } from "@/app/admins-new/certifications/workflow/components/workflow-diagram";
import { getAssessmentDetails, saveAssessment, getAssessmentResults, submitFinalDecision } from '../../dashboard/actions';
import { toast } from "sonner";


function AssessmentPageContent() {
  const { id } = useParams();
  const searchParams = useSearchParams();
  const entityType =
    (searchParams.get("type") as "ecosystem" | "startup") || "ecosystem";
  const router = useRouter();
  const [recommendation, setRecommendation] = useState("");
  const [finalComments, setFinalComments] = useState("");
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [showOtherVotes, setShowOtherVotes] = useState(false);
  const [loading, setLoading] = useState(true);
  const [dynamicCriteria, setDynamicCriteria] = useState<any[]>([]);
  const [applicationData, setApplicationData] = useState<any>(null);
  const [applicationDocuments, setApplicationDocuments] = useState<any[]>([]);

  // New state for scores including recommendation per criterion
  const [detailedScores, setDetailedScores] = useState<
    Record<
      string,
      {
        score: number;
        weightEvaluation: number;
        recommendation: string;
        comment: string;
      }
    >
  >({});
  const [resultsData, setResultsData] = useState<any>(null);
  const [isChair, setIsChair] = useState(false);
  const [isReadOnly, setIsReadOnly] = useState(false);

  useEffect(() => {
    if (id) {
      fetchData();
    }
  }, [id]);

  const fetchData = async () => {
    setLoading(true);
    const result = await getAssessmentDetails(id as string, entityType);
    if (result.success) {
      const { application, criteria, existingReview, documents, isChair } =
        result.data;
      setApplicationData(application);
      const effectiveCriteria = criteria || [];
      setDynamicCriteria(effectiveCriteria);
      setApplicationDocuments(documents);
      setIsChair(isChair);

      // Initialize scores for the effective criteria
      const initialDetailedScores: Record<string, any> = {};

      if (existingReview) {
        setRecommendation(existingReview.recommendation || "");
        setFinalComments(existingReview.comment || "");
        // Personal review is read-only if submitted
        setIsReadOnly(existingReview.status === "SUBMITTED");

        // Merge existing scores with criteria
        effectiveCriteria.forEach((c: any) => {
          const existing = existingReview.scores.find(
            (s: any) => s.criterionId === c.id,
          );
          initialDetailedScores[c.id] = {
            score: existing?.score || 3,
            weightEvaluation:
              existing?.weightSnapshot !== undefined
                ? existing.weightSnapshot
                : c.weight,
            recommendation: existing?.recommendation || "",
            comment: existing?.comment || "",
          };
        });
      } else {
        // Initialize with defaults
        effectiveCriteria.forEach((c: any) => {
          initialDetailedScores[c.id] = {
            score: 3,
            weightEvaluation: c.weight,
            recommendation: "",
            comment: "",
          };
        });
      }
      setDetailedScores(initialDetailedScores);
    } else {
      toast.error(result.message || "Failed to load assessment details");
    }

    // Also fetch aggregated results
    const resultsResult = await getAssessmentResults(id as string, entityType);
    if (resultsResult.success) {
      setResultsData(resultsResult.data);
    }

    setLoading(false);
  };

  // Document viewer state
  const [viewingDocument, setViewingDocument] = useState<{
    id: string;
    name: string;
    url: string;
    type: string;
  } | null>(null);
  const [fullScreen, setFullScreen] = useState(false);

  // Document notes state
  type NoteType = {
    text: string;
    category: string;
    timestamp: string;
  };

  const [documentNotes, setDocumentNotes] = useState<
    Record<string, NoteType[]>
  >({});
  const [currentNote, setCurrentNote] = useState("");
  const [currentCategory, setCurrentCategory] = useState("general");
  const [showNotesPanel, setShowNotesPanel] = useState(true);

  // Note categories
  const noteCategories = [
    { value: "general", label: "General", icon: "FileText" },
    { value: "strength", label: "Strengths", icon: "ThumbsUp" },
    { value: "weakness", label: "Weaknesses", icon: "ThumbsDown" },
    { value: "question", label: "Questions", icon: "HelpCircle" },
    { value: "action", label: "Action Items", icon: "CheckSquare" },
  ];

  // Get category icon component
  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "strength":
        return <ThumbsUp className="h-4 w-4 mr-2 text-green-500" />;
      case "weakness":
        return <ThumbsDown className="h-4 w-4 mr-2 text-red-500" />;
      case "question":
        return <HelpCircle className="h-4 w-4 mr-2 text-amber-500" />;
      case "action":
        return <CheckSquare className="h-4 w-4 mr-2 text-blue-500" />;
      default:
        return <FileText className="h-4 w-4 mr-2 text-gray-500" />;
    }
  };

  // Calculate total score sum (from weight evaluations)
  const calculateTotalScore = () => {
    return dynamicCriteria.reduce(
      (sum, criteria) =>
        sum + (detailedScores[criteria.id]?.weightEvaluation || 0),
      0,
    );
  };

  // Calculate total possible weight sum
  const calculateTotalWeight = () => {
    return dynamicCriteria.reduce(
      (sum, criteria) => sum + (criteria.weight || 0),
      0,
    );
  };

  // Calculate final percentage for display
  const calculateFinalPercentage = () => {
    const totalWeight = calculateTotalWeight();
    if (totalWeight === 0) return 0;
    return (calculateTotalScore() / totalWeight) * 100;
  };

  // Calculate Average Expert Rating (1-5)
  const calculateAverageRating = () => {
    if (dynamicCriteria.length === 0) return 0;
    const totalRating = dynamicCriteria.reduce(
      (sum, criteria) => sum + (detailedScores[criteria.id]?.score || 0),
      0,
    );
    return (totalRating / dynamicCriteria.length).toFixed(1);
  };

  // Handle score change (1-5)
  const handleScoreChange = (criteriaId: string, value: number[]) => {
    setDetailedScores((prev) => ({
      ...prev,
      [criteriaId]: { ...prev[criteriaId], score: value[0] },
    }));
  };

  // Handle weight evaluation change (0-weight)
  const handleWeightEvaluationChange = (criteriaId: string, value: number) => {
    setDetailedScores((prev) => ({
      ...prev,
      [criteriaId]: { ...prev[criteriaId], weightEvaluation: value },
    }));
  };

  // Handle comment change
  const handleCommentChange = (criteriaId: string, value: string) => {
    setDetailedScores((prev) => ({
      ...prev,
      [criteriaId]: { ...prev[criteriaId], comment: value },
    }));
  };

  // Handle final comments change
  const handleFinalCommentsChange = (value: string) => {
    setFinalComments(value);
  };

  // Save assessment as draft
  const saveDraft = async () => {
    const result = await saveAssessment(
      id as string,
      detailedScores,
      recommendation,
      finalComments,
      false,
      entityType,
    );
    if (result.success) {
      toast.success("Draft saved successfully");
    } else {
      toast.error(result.message);
    }
  };

  // Submit the personal assessment
  const submitMyReview = async () => {
    const result = await saveAssessment(
      id as string,
      detailedScores,
      recommendation,
      finalComments,
      true,
      entityType,
    );
    if (result.success) {
      toast.success("Personal review submitted successfully");
      router.push('/committee-portal/dashboard');
    } else {
      toast.error(result.message);
    }
  };

  // Submit the final committee assessment
  const submitFinalAssessment = async () => {
    const result = await submitFinalDecision(
      id as string,
      recommendation,
      finalComments
    );
    if (result.success) {
      toast.success("Final committee evaluation submitted successfully");
      setShowConfirmDialog(false);
      router.push("/committee-portal/dashboard");
    } else {
      toast.error(result.message);
    }
  };

  // Helper to handle the submit action from the confirmation dialog
  const submitAssessment = () => {
    if (isChair) {
      submitFinalAssessment();
    } else {
      submitMyReview();
    }
  };

  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    }).format(date);
  };

  // Get file type icon
  const getFileIcon = (fileType: string) => {
    if (fileType.includes("pdf")) {
      return <FileText className="h-5 w-5 text-red-500" />;
    } else if (fileType.includes("xlsx") || fileType.includes("excel")) {
      return <FileText className="h-5 w-5 text-green-500" />;
    } else if (fileType.includes("docx") || fileType.includes("word")) {
      return <FileText className="h-5 w-5 text-blue-500" />;
    } else if (fileType.includes("image/")) {
      return <FileText className="h-5 w-5 text-purple-500" />;
    } else {
      return <FileText className="h-5 w-5 text-gray-500" />;
    }
  };

  // Handle document view
  const handleViewDocument = (doc: any) => {
    setViewingDocument(doc);
    // Initialize current note with any existing notes for this document
    setCurrentNote(documentNotes[doc.id] ? documentNotes[doc.id][0].text : "");
  };

  if (loading) {
    return (
      <div className="container py-32 flex flex-col items-center justify-center space-y-4">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="text-muted-foreground font-medium">
          Loading assessment data...
        </p>
      </div>
    );
  }

  const currentStatusIndex = -1;
  const isRejected = applicationData?.status === 'REJECTED';

  return (
    <div className="container py-8">
      {/* Back button and page title */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-8 gap-4">
        <div className="flex items-center">
          <Button variant="outline" size="sm" asChild className="mr-4">
            <Link href="/committee-portal/dashboard">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Dashboard
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Assessment Form</h1>
            <p className="text-muted-foreground">
              Review and evaluate {applicationData?.name}
            </p>
          </div>
        </div>
        
        {isChair && applicationData?.status !== "COMMITTEE_REVIEW_SUBMITTED" && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <span>
                  <Button
                    variant="default"
                    onClick={() => setShowConfirmDialog(true)}
                    disabled={
                      !resultsData || 
                      (resultsData.memberResults.length < (resultsData.totalMembersCount || 0)) ||
                      !recommendation ||
                      !finalComments
                    }
                    className="bg-indigo-600 hover:bg-indigo-700 font-bold shadow-lg"
                  >
                    <Send className="mr-2 h-4 w-4" />
                    Submit Final Decision
                  </Button>
                </span>
              </TooltipTrigger>
              {resultsData && resultsData.memberResults.length < (resultsData.totalMembersCount || 0) && (
                <TooltipContent>
                  <p>All {resultsData.totalMembersCount} members must submit their reviews first. Currently: {resultsData.memberResults.length}/{resultsData.totalMembersCount}</p>
                </TooltipContent>
              )}
            </Tooltip>
          </TooltipProvider>
        )}
      </div>

      <Tabs defaultValue="evaluation" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4 h-12">
          <TabsTrigger value="overview" className="text-sm font-semibold">
            <Info className="mr-2 h-4 w-4" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="evaluation" className="text-sm font-semibold">
            <ClipboardCheck className="mr-2 h-4 w-4" />
            My Evaluation
          </TabsTrigger>
          <TabsTrigger value="results" className="text-sm font-semibold">
            <Award className="mr-2 h-4 w-4" />
            Consolidated Results
          </TabsTrigger>
          <TabsTrigger value="workflow" className="text-sm font-semibold">
            <TrendingUp className="mr-2 h-4 w-4" />
            Timeline
          </TabsTrigger>
        </TabsList>

        {/* Tab 1: Overview & Documents */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-1">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Startup Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center">
                    {applicationData?.builder?.logo ? (
                      <Avatar className="h-16 w-16 mr-4">
                        <AvatarImage
                          src={applicationData?.builder?.logo}
                          alt={applicationData?.name}
                        />
                      </Avatar>
                    ) : (
                      <Avatar className="h-16 w-16 mr-4">
                        <AvatarFallback className="text-xl bg-primary/10">
                          {applicationData?.name
                            ?.substring(0, 2)
                            .toUpperCase() || "EB"}
                        </AvatarFallback>
                      </Avatar>
                    )}
                    <div>
                      <h3 className="text-xl font-semibold">
                        {applicationData?.name}
                      </h3>
                      <div className="flex flex-wrap gap-2 mt-1">
                        <Badge variant="outline">{applicationData?.type}</Badge>
                        <Badge variant="outline">
                          {applicationData?.region}
                        </Badge>
                      </div>
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-4">
                    <div>
                      <h4 className="text-sm font-medium text-muted-foreground">
                        Description
                      </h4>
                      <p className="mt-1 text-sm">
                        {applicationData?.description ||
                          applicationData?.builder?.description}
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <h4 className="text-sm font-medium text-muted-foreground">
                          Established
                        </h4>
                        <p className="mt-1">
                          {applicationData?.established || "Not specified"}
                        </p>
                      </div>
                      <div>
                        <h4 className="text-sm font-medium text-muted-foreground">
                          Capacity
                        </h4>
                        <p className="mt-1">
                          {applicationData?.capacity || "Not specified"}
                        </p>
                      </div>
                      <div>
                        <h4 className="text-sm font-medium text-muted-foreground">
                          Location
                        </h4>
                        <p className="mt-1">
                          {applicationData?.location || "Not specified"}
                        </p>
                      </div>
                      <div>
                        <h4 className="text-sm font-medium text-muted-foreground">
                          City
                        </h4>
                        <p className="mt-1">
                          {applicationData?.city || "Not specified"}
                        </p>
                      </div>
                      <div>
                        <h4 className="text-sm font-medium text-muted-foreground">
                          Region
                        </h4>
                        <p className="mt-1">
                          {applicationData?.region || "Not specified"}
                        </p>
                      </div>
                    </div>

                    <Separator />

                    <div>
                      <h4 className="text-sm font-medium text-muted-foreground mb-3">
                        Contact Information
                      </h4>
                      <div className="space-y-3">
                        <div className="flex items-center text-sm">
                          <Users className="h-4 w-4 mr-3 text-muted-foreground" />
                          <span>
                            {applicationData?.contactName ||
                              applicationData?.builder?.contactName ||
                              "Not specified"}
                          </span>
                        </div>
                        <div className="flex items-center text-sm">
                          <Mail className="h-4 w-4 mr-3 text-muted-foreground" />
                          <a
                            href={`mailto:${applicationData?.contactEmail || applicationData?.builder?.contactEmail}`}
                            className="text-blue-600 hover:underline"
                          >
                            {applicationData?.contactEmail ||
                              applicationData?.builder?.contactEmail ||
                              "Not specified"}
                          </a>
                        </div>
                        <div className="flex items-center text-sm">
                          <Phone className="h-4 w-4 mr-3 text-muted-foreground" />
                          <a
                            href={`tel:${applicationData?.contactPhone || applicationData?.builder?.contactPhone}`}
                            className="text-blue-600 hover:underline"
                          >
                            {applicationData?.contactPhone ||
                              applicationData?.builder?.contactPhone ||
                              "Not specified"}
                          </a>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h4 className="text-sm font-medium text-muted-foreground">
                        Website
                      </h4>
                      {applicationData?.website ? (
                        <a
                          href={applicationData.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="mt-1 inline-flex items-center text-blue-600 hover:underline"
                        >
                          {applicationData.website}
                          <ExternalLink className="ml-1 h-3 w-3" />
                        </a>
                      ) : (
                        <p className="text-sm text-muted-foreground">
                          No website provided
                        </p>
                      )}
                    </div>

                    {applicationData?.services &&
                      applicationData?.services.length > 0 && (
                        <div className="pt-2">
                          <h4 className="text-sm font-medium text-muted-foreground mb-2">
                            Services Offered
                          </h4>
                          <div className="flex flex-wrap gap-2">
                            {applicationData.services.map(
                              (service: string, index: number) => (
                                <Badge
                                  key={index}
                                  variant="secondary"
                                  className="font-normal"
                                >
                                  {service}
                                </Badge>
                              ),
                            )}
                          </div>
                        </div>
                      )}
                  </div>
                  <Separator />
                </CardContent>
                <CardFooter>
                  <Button variant="outline" className="w-full" asChild>
                    <Link
                      href={`/admins-new/ecosystem/${applicationData?.id}`}
                      target="_blank"
                    >
                      <ExternalLink className="mr-2 h-4 w-4" />
                      View Complete Profile
                    </Link>
                  </Button>
                </CardFooter>
              </Card>
            </div>

            <div className="lg:col-span-2">
              <Card className="h-full">
                <CardHeader>
                  <CardTitle className="text-lg">
                    Application Documents
                  </CardTitle>
                  <CardDescription>
                    Review the official documentation provided by the applicant.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-8">
                    {applicationDocuments.map((doc) => (
                      <div key={doc.id} className="space-y-3">
                        <h4 className="font-medium text-base flex flex-row items-center gap-2">
                          {getFileIcon(doc.type)}
                          {doc.name}
                        </h4>
                        <div className="border rounded-lg overflow-hidden bg-muted/10">
                          {doc.type.includes("pdf") ? (
                            <iframe
                              src={`/api/files/${doc.id}/download?inline=true`}
                              className="w-full h-[600px]"
                              title={doc.name}
                            />
                          ) : doc.type.includes("image/") ? (
                            <div className="w-full h-[600px] flex items-center justify-center p-4">
                              <img
                                src={`/api/files/${doc.id}/download?inline=true`}
                                alt={doc.name}
                                className="max-w-full max-h-full object-contain"
                              />
                            </div>
                          ) : (
                            <div className="w-full h-[200px] flex flex-col items-center justify-center">
                              {getFileIcon(doc.type)}
                              <p className="mt-4 text-muted-foreground text-sm">
                                Preview not available for this file type.
                              </p>
                            </div>
                          )}
                        </div>
                        <div className="flex justify-end">
                          <Button variant="outline" size="sm" asChild>
                            <a
                              href={`/api/files/${doc.id}/download`}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              <Download className="mr-2 h-4 w-4" />
                              Download {doc.name}
                            </a>
                          </Button>
                        </div>
                      </div>
                    ))}

                    {applicationDocuments.length === 0 && (
                      <div className="flex flex-col items-center justify-center py-12 text-center border-2 border-dashed rounded-xl">
                        <FileText className="h-12 w-12 text-muted-foreground mb-4 opacity-20" />
                        <p className="text-muted-foreground font-medium italic">
                          No documents uploaded for this application
                        </p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        {/* Tab 2: Evaluation */}
        <TabsContent value="evaluation" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Assessment Criteria */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader className="border-b bg-muted/5">
                  <CardTitle>Assessment Criteria</CardTitle>
                  <CardDescription>
                    Provide detailed scores and qualitative feedback for each
                    evaluation segment.
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                  <Accordion type="single" collapsible className="w-full">
                    {dynamicCriteria.map((criteria) => (
                      <AccordionItem
                        key={criteria.id}
                        value={criteria.id}
                        className="border-b last:border-0"
                      >
                        <AccordionTrigger className="px-6 py-6 hover:bg-muted/30 transition-colors">
                          <div className="flex justify-between items-center w-full pr-4">
                            <div className="flex flex-col items-start gap-1">
                              <div className="flex items-center">
                                <span className="font-bold text-base">
                                  {criteria.name}
                                </span>
                                <Badge
                                  variant="secondary"
                                  className="ml-3 font-bold bg-primary/10 text-primary hover:bg-primary/20"
                                >
                                  Weight: {criteria.weight}%
                                </Badge>
                              </div>
                              <p className="text-xs text-muted-foreground font-normal">
                                {criteria.description}
                              </p>
                            </div>
                            <div className="flex items-center gap-3">
                              <div className="flex flex-col items-end">
                                <span className="text-[10px] text-muted-foreground uppercase font-bold leading-none mb-1">
                                  Rating
                                </span>
                                <div className="flex items-center bg-slate-100/50 px-2 py-0.5 rounded-md border text-sm font-bold shadow-sm">
                                  {detailedScores[criteria.id]?.score || 0}
                                  <span className="text-[10px] text-muted-foreground ml-0.5">
                                    /5
                                  </span>
                                </div>
                              </div>
                              <div className="flex flex-col items-end">
                                <span className="text-[10px] text-primary/70 uppercase font-bold leading-none mb-1">
                                  Valuation
                                </span>
                                <div className="flex items-center bg-primary/5 px-2 py-0.5 rounded-md border border-primary/20 text-sm font-bold text-primary shadow-sm">
                                  {detailedScores[criteria.id]
                                    ?.weightEvaluation || 0}
                                  <span className="text-[10px] opacity-60 ml-0.5">
                                    /{criteria.weight}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </AccordionTrigger>
                        <AccordionContent className="px-6 pb-8 pt-4 bg-muted/5 border-t">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                            <div className="space-y-8">
                              {/* Part 1: Qualitative Rating (1-5) */}
                              <div className="space-y-4">
                                <div className="flex justify-between items-end">
                                  <Label className="font-bold text-xs uppercase tracking-wider text-muted-foreground">
                                    Expert Rating (Level of Excellence)
                                  </Label>
                                  <div className="text-2xl font-black text-slate-700 tracking-tighter">
                                    {detailedScores[criteria.id]?.score || 0}
                                    <span className="text-xs text-muted-foreground font-normal">
                                      /5
                                    </span>
                                  </div>
                                </div>
                                <div className="px-2">
                                  <Slider
                                    disabled={isReadOnly}
                                    max={5}
                                    min={1}
                                    step={1}
                                    value={[
                                      detailedScores[criteria.id]?.score || 3,
                                    ]}
                                    onValueChange={(value) =>
                                      handleScoreChange(criteria.id, value)
                                    }
                                    className="my-4"
                                  />
                                  <div className="flex justify-between text-[8px] uppercase tracking-tighter text-muted-foreground/60 font-black">
                                    <span>Poor</span>
                                    <span>Fair</span>
                                    <span>Good</span>
                                    <span>V. Good</span>
                                    <span>Excellent</span>
                                  </div>
                                </div>
                              </div>

                              <Separator className="opacity-50" />

                              {/* Part 2: Weight Valuation (0-Weight) */}
                              <div className="space-y-4">
                                <div className="flex justify-between items-end">
                                  <Label className="font-bold text-xs uppercase tracking-wider text-primary/70">
                                    Weight Valuation (Scale 0-{criteria.weight})
                                  </Label>
                                  <div className="text-2xl font-black text-primary tracking-tighter">
                                    {detailedScores[criteria.id]
                                      ?.weightEvaluation || 0}
                                    <span className="text-xs opacity-60 font-normal">
                                      /{criteria.weight}
                                    </span>
                                  </div>
                                </div>
                                <div className="flex gap-4 items-center">
                                  <div className="flex-1 px-2">
                                    <Slider
                                      disabled={isReadOnly}
                                      max={criteria.weight}
                                      min={0}
                                      step={1}
                                      value={[
                                        detailedScores[criteria.id]
                                          ?.weightEvaluation || 0,
                                      ]}
                                      onValueChange={(value) =>
                                        handleWeightEvaluationChange(
                                          criteria.id,
                                          value[0],
                                        )
                                      }
                                      className="my-4"
                                    />
                                    <div className="flex justify-between text-[8px] uppercase tracking-tighter text-muted-foreground/60 font-black">
                                      <span>Zero</span>
                                      <span>Midpoint</span>
                                      <span>Full ({criteria.weight})</span>
                                    </div>
                                  </div>
                                  <div className="w-16">
                                    <Input 
                                      type="number"
                                      max={criteria.weight}
                                      min={0}
                                      value={
                                        detailedScores[criteria.id]
                                          ?.weightEvaluation || 0
                                      }
                                      onChange={(e) => {
                                        const val = parseInt(e.target.value);
                                        if (!isNaN(val)) {
                                          handleWeightEvaluationChange(
                                            criteria.id,
                                            Math.min(
                                              criteria.weight,
                                              Math.max(0, val),
                                            ),
                                          );
                                        }
                                      }}
                                      className="h-10 text-base font-black text-center border-2 focus:ring-primary/20"
                                    />
                                  </div>
                                </div>
                              </div>
                            </div>

                            <div className="space-y-6">
                              <div className="space-y-4">
                                <Label htmlFor={`comment-${criteria.id}`} className="font-bold text-sm uppercase tracking-wider text-muted-foreground">Expert Remarks</Label>
                                <Textarea 
                                  id={`comment-${criteria.id}`}
                                  placeholder="Justify your score with specific observations..."
                                  className="resize-none min-h-[160px] border-2 focus:ring-primary/20"
                                  disabled={isReadOnly}
                                  value={
                                    detailedScores[criteria.id]?.comment || ""
                                  }
                                  onChange={(e) =>
                                    handleCommentChange(
                                      criteria.id,
                                      e.target.value,
                                    )
                                  }
                                />
                              </div>

                              {/* Redundant remarks removed */}
                            </div>
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                    {dynamicCriteria.length === 0 && (
                      <div className="p-12 text-center text-muted-foreground font-medium italic">
                        No evaluation criteria have been defined for this
                        committee.
                      </div>
                    )}
                  </Accordion>
                </CardContent>
              </Card>

              {isChair && resultsData?.memberResults.length === resultsData?.totalMembersCount && (
                <Card className="mt-8 border-2 border-indigo-100 shadow-md">
                   <CardHeader className="bg-indigo-50/50">
                     <CardTitle className="text-indigo-900 flex items-center gap-2">
                       <ClipboardCheck className="h-5 w-5" />
                       Final Consensus Summary
                     </CardTitle>
                     <CardDescription>
                       As Chairperson, provide the final summarized determination based on committee consensus.
                     </CardDescription>
                   </CardHeader>
                   <CardContent className="space-y-4 pt-4">
                      <div className="space-y-2">
                        <Label className="font-bold underline">Final Recommendation</Label>
                        <Select value={recommendation} onValueChange={setRecommendation} disabled={applicationData?.status === "COMMITTEE_REVIEW_SUBMITTED"}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select final verdict" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="APPROVE">Approve</SelectItem>
                            <SelectItem value="REJECT">Reject</SelectItem>
                            <SelectItem value="MORE_INFO">Request Clarification</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label className="font-bold underline">Committee Consensus Remarks</Label>
                        <Textarea 
                          placeholder="Summarize the core consensus..."
                          value={finalComments}
                          onChange={(e) => setFinalComments(e.target.value)}
                          disabled={applicationData?.status === "COMMITTEE_REVIEW_SUBMITTED"}
                          className="min-h-[120px]"
                        />
                      </div>
                   </CardContent>
                </Card>
              )}
            </div>

            {/* Decision Panel */}
            <div className="lg:col-span-1">
              <Card className="sticky top-8 border-2 border-primary/10 shadow-xl">
                <CardHeader className="bg-primary/5 border-b">
                  <CardTitle className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-primary" />
                    Final Determination
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-8 py-8">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex flex-col items-center justify-center p-4 bg-primary/5 rounded-2xl border-2 border-primary/10">
                      <div className="text-3xl font-black text-primary mb-1">
                        {isChair && resultsData 
                          ? resultsData.overallAverageValuation?.toFixed(1)
                          : calculateTotalScore()}
                        <span className="text-[10px] font-normal opacity-60 ml-0.5">
                          / {calculateTotalWeight()}
                        </span>
                      </div>
                      <div className="text-[9px] font-black uppercase tracking-wider text-primary/60">
                        {isChair ? "Avg. Committee Valuation" : "My Total Valuation"}
                      </div>
                      <Progress
                        value={isChair && resultsData
                          ? (resultsData.overallAverageValuation / (resultsData.totalWeightAvailable || 1)) * 100
                          : calculateFinalPercentage()}
                        className="h-1.5 w-full mt-3"
                      />
                    </div>

                    <div className="flex flex-col items-center justify-center p-4 bg-slate-50 rounded-2xl border-2 border-slate-200/50">
                      <div className="text-3xl font-black text-slate-700 mb-1">
                        {isChair && resultsData
                          ? resultsData.overallAverageRating?.toFixed(1)
                          : calculateAverageRating()}
                        <span className="text-[10px] font-normal text-muted-foreground ml-0.5">
                          / 5
                        </span>
                      </div>
                      <div className="text-[9px] font-black uppercase tracking-wider text-slate-500">
                        {isChair ? "Avg. Committee Rating" : "My Avg. Rating"}
                      </div>
                      <div className="flex gap-0.5 mt-3">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <div
                            key={star}
                            className={`h-1.5 w-4 rounded-full ${star <= Math.round(Number(isChair && resultsData ? resultsData.overallAverageRating : calculateAverageRating())) ? "bg-amber-400" : "bg-slate-200"}`}
                          />
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <Label htmlFor="recommendation" className="font-bold text-sm uppercase tracking-wider text-muted-foreground px-1">
                      {isChair ? "My Recommendation" : "My Verdict"}
                    </Label>
                    <Select 
                      value={recommendation} 
                      onValueChange={(value) => setRecommendation(value)}
                      disabled={isReadOnly}
                    >
                      <SelectTrigger className="h-12 border-2 text-lg font-bold">
                        <SelectValue placeholder="Select verdict" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="APPROVE" className="py-3">
                          <div className="flex items-center font-bold text-green-600">
                            <ThumbsUp className="h-5 w-5 mr-3" />
                            <span>APPROVE</span>
                          </div>
                        </SelectItem>
                        <SelectItem value="REJECT" className="py-3">
                          <div className="flex items-center font-bold text-red-600">
                            <ThumbsDown className="h-5 w-5 mr-3" />
                            <span>REJECT</span>
                          </div>
                        </SelectItem>
                        <SelectItem value="MORE_INFO" className="py-3">
                          <div className="flex items-center font-bold text-amber-500">
                            <HelpCircle className="h-5 w-5 mr-3" />
                            <span>NEED CLARIFICATION</span>
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-3">
                    <Label htmlFor="final-comments" className="font-bold text-sm uppercase tracking-wider text-muted-foreground px-1">Consolidated Feedback</Label>
                    <Textarea 
                      id="final-comments"
                      placeholder="Summarize the core reasons for this determination..."
                      className="min-h-[150px] border-2"
                      disabled={isReadOnly}
                      value={finalComments}
                      onChange={(e) =>
                        handleFinalCommentsChange(e.target.value)
                      }
                    />
                  </div>
                </CardContent>
                 <CardFooter className="bg-muted/10 border-t flex flex-col gap-3 p-6">
                  {!isReadOnly && (
                    <>
                      <Button 
                        className="w-full h-12 text-lg font-bold shadow-lg shadow-primary/20" 
                        onClick={() => {
                          const incomplete = dynamicCriteria.some(c => !detailedScores[c.id]?.comment && detailedScores[c.id]?.score !== 3);
                          if (incomplete) {
                            toast.warning("Please provide remarks for all your scores before submitting.");
                            return;
                          }
                          if (!recommendation) {
                            toast.warning("Please select a verdict for your evaluation.");
                            return;
                          }
                          submitMyReview();
                        }}
                        disabled={Object.values(detailedScores).length === 0}
                      >
                        <Send className="mr-2 h-5 w-5" />
                        Submit My Review
                      </Button>
                      <Button 
                        variant="outline" 
                        className="w-full h-10 font-semibold border-2" 
                        onClick={saveDraft}
                      >
                        <Save className="mr-2 h-4 w-4" />
                        Save as Draft
                      </Button>
                    </>
                  )}
                  {isReadOnly && isChair && applicationData?.status !== "COMMITTEE_REVIEW_SUBMITTED" && (
                    <Button 
                      className="w-full h-12 text-lg font-bold shadow-lg shadow-indigo-200 bg-indigo-600 hover:bg-indigo-700" 
                      onClick={() => {
                        if (resultsData && resultsData.memberResults.length < resultsData.totalMembersCount) {
                          toast.error(`Wait for all members. Currently ${resultsData.memberResults.length}/${resultsData.totalMembersCount} submitted.`);
                          return;
                        }
                        if (!recommendation || !finalComments) {
                          toast.warning("Please fill out the Final Consensus Summary section first.");
                          return;
                        }
                        setShowConfirmDialog(true);
                      }}
                    >
                      <Send className="mr-2 h-5 w-5" />
                      Finalize Committee Decision
                    </Button>
                  )}
                  {isReadOnly && (
                    <div className="w-full p-4 bg-green-50 border border-green-200 rounded-lg text-center">
                      <p className="text-sm font-bold text-green-700">Evaluation Submitted</p>
                      <p className="text-xs text-green-600">This assessment is now in read-only mode.</p>
                    </div>
                  )}
                </CardFooter>
              </Card>
            </div>
          </div>
        </TabsContent>

        {/* Tab 4: Results */}
        <TabsContent value="results" className="space-y-6">
          {!resultsData || resultsData.memberResults.length === 0 ? (
            <Card className="flex flex-col items-center justify-center p-12 text-center border-dashed border-2">
              <div className="bg-primary/5 p-6 rounded-full mb-4">
                <Users className="h-12 w-12 text-primary opacity-20" />
              </div>
              <h3 className="text-xl font-bold mb-2">
                No Reviews Submitted Yet
              </h3>
              <p className="text-muted-foreground max-w-md">
                Aggregated results will be available once committee members
                start submitting their final assessments.
              </p>
            </Card>
          ) : (
            <div className="space-y-6">
              {/* Aggregated Header Dashboard */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="bg-primary text-primary-foreground overflow-hidden relative border-none shadow-lg">
                  <div className="absolute right-0 bottom-0 opacity-10">
                    <TrendingUp size={120} />
                  </div>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-xs font-black uppercase tracking-widest opacity-80">
                      Avg. Consolidated Valuation
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-5xl font-black mb-1">
                      {resultsData.overallAverageValuation?.toFixed(1) || "0.0"}
                      <span className="text-xl opacity-60 ml-2">
                        / {resultsData.totalWeightAvailable}
                      </span>
                    </div>
                    <p className="text-xs font-bold opacity-70">
                      Mean weighted score (points)
                    </p>
                  </CardContent>
                </Card>

                <Card className="bg-slate-800 text-white overflow-hidden relative border-none shadow-lg">
                  <div className="absolute right-0 bottom-0 opacity-10">
                    <Award size={120} />
                  </div>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-xs font-black uppercase tracking-widest opacity-80">
                      Avg. Excellence Rating
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-5xl font-black mb-1">
                      {resultsData.overallAverageRating?.toFixed(1) || "0.0"}
                      <span className="text-xl opacity-60 ml-2">/ 5.0</span>
                    </div>
                    <p className="text-xs font-bold opacity-70 italic text-slate-400">
                      Qualitative expert consensus
                    </p>
                  </CardContent>
                </Card>

                <Card className="overflow-hidden border-2">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-bold uppercase tracking-wider text-muted-foreground">
                      Committee Status
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-2">
                    <div className="flex items-center gap-4">
                      <div className="relative h-16 w-16">
                        <svg className="h-full w-full" viewBox="0 0 36 36">
                          <circle
                            cx="18"
                            cy="18"
                            r="16"
                            fill="none"
                            className="stroke-muted"
                            strokeWidth="3"
                          />
                          <circle
                            cx="18"
                            cy="18"
                            r="16"
                            fill="none"
                            className="stroke-primary"
                            strokeWidth="3"
                            strokeDasharray={`${(resultsData.memberResults.length / 5) * 100}, 100`}
                          />
                        </svg>
                        <div className="absolute inset-0 flex items-center justify-center text-sm font-black">
                          {resultsData.memberResults.length}/5
                        </div>
                      </div>
                      <div>
                        <p className="text-2xl font-black">Submissions</p>
                        <p className="text-xs text-muted-foreground">
                          Active members participated
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="overflow-hidden border-2">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-bold uppercase tracking-wider text-muted-foreground">
                      Recommendation
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-2">
                    <div className="flex flex-wrap gap-2">
                      <Badge className="bg-green-500 text-white font-bold h-8 px-3">
                        APPROVE:{" "}
                        {
                          resultsData.memberResults.filter(
                            (r: any) => r.recommendation === "APPROVE",
                          ).length
                        }
                      </Badge>
                      <Badge
                        variant="destructive"
                        className="font-bold h-8 px-3"
                      >
                        REJECT:{" "}
                        {
                          resultsData.memberResults.filter(
                            (r: any) => r.recommendation === "REJECT",
                          ).length
                        }
                      </Badge>
                    </div>
                    <p className="text-[10px] mt-3 font-bold text-muted-foreground uppercase opacity-60">
                      Consensus View
                    </p>
                  </CardContent>
                </Card>
              </div>

              {/* Summary of Committee Members */}
              <div className="space-y-6">
                <div className="flex items-center gap-2">
                  <Users className="h-6 w-6 text-primary" />
                  <h3 className="text-xl font-black uppercase tracking-widest text-slate-800">
                    Committee Member Summary
                  </h3>
                </div>

                <Card className="border-2 overflow-hidden shadow-sm">
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="bg-slate-50 border-b">
                          <th className="px-6 py-4 text-left font-black uppercase tracking-wider text-[10px] text-slate-500">
                            Member
                          </th>
                          <th className="px-6 py-4 text-center font-black uppercase tracking-wider text-[10px] text-slate-500">
                            Verdict
                          </th>
                          <th className="px-6 py-4 text-center font-black uppercase tracking-wider text-[10px] text-slate-500">
                            Avg. Rating
                          </th>
                          <th className="px-6 py-4 text-center font-black uppercase tracking-wider text-[10px] text-slate-500">
                            Total Valuation
                          </th>
                          <th className="px-6 py-4 text-left font-black uppercase tracking-wider text-[10px] text-slate-500">
                            Summary Comment
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {resultsData.memberResults.map((result: any) => (
                          <tr
                            key={result.memberId}
                            className="border-b last:border-0 hover:bg-muted/10 transition-colors"
                          >
                            <td className="px-6 py-4 font-bold text-primary">
                              <div className="flex items-center gap-2">
                                {result.memberName}
                                {result.isChair && (
                                  <Badge
                                    variant="outline"
                                    className="text-[9px] font-black uppercase text-indigo-600 border-indigo-200 bg-indigo-50"
                                  >
                                    Chairperson
                                  </Badge>
                                )}
                              </div>
                            </td>
                            <td className="px-6 py-4 text-center">
                              <Badge
                                variant={
                                  result.recommendation === "APPROVE"
                                    ? "default"
                                    : result.recommendation === "REJECT"
                                      ? "destructive"
                                      : "outline"
                                }
                                className="font-black px-3 py-1 uppercase text-[9px]"
                              >
                                {result.recommendation}
                              </Badge>
                            </td>
                            <td className="px-6 py-4 text-center font-black text-slate-700">
                              {result.averageRating?.toFixed(1) || "0.0"}
                              <span className="text-[10px] opacity-40 ml-0.5">
                                /5
                              </span>
                            </td>
                            <td className="px-6 py-4 text-center font-black text-primary text-lg">
                              {result.totalValuation}
                              <span className="text-[10px] opacity-60 ml-0.5">
                                pts
                              </span>
                            </td>
                            <td
                              className="px-6 py-4 text-xs italic text-muted-foreground truncate max-w-[300px]"
                              title={result.overallComment}
                            >
                              {result.overallComment
                                ? `"${result.overallComment}"`
                                : "No summary provided"}
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
                  <h3 className="text-xl font-black uppercase tracking-widest text-slate-800">
                    Detailed Member Evaluations
                  </h3>
                </div>

                <Accordion type="single" collapsible className="space-y-4">
                  {resultsData.memberResults.map((result: any, idx: number) => (
                    <AccordionItem
                      key={result.memberId}
                      value={result.memberId}
                      className="border-2 rounded-2xl overflow-hidden bg-background px-0"
                    >
                      <AccordionTrigger className="px-6 py-4 hover:no-underline hover:bg-muted/5 transition-colors">
                        <div className="flex items-center gap-4 text-left">
                          <div className="bg-primary/10 h-10 w-10 rounded-full flex items-center justify-center font-black text-primary">
                            {idx + 1}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-black text-lg text-slate-800 block">
                                {result.memberName}
                              </span>
                              {result.isChair && (
                                <Badge
                                  variant="outline"
                                  className="text-[9px] font-black uppercase text-indigo-600 border-indigo-200 bg-indigo-50"
                                >
                                  Chairperson
                                </Badge>
                              )}
                            </div>
                            <span className="text-[10px] font-bold text-muted-foreground uppercase">
                              Expert Breakdown • {result.criteriaScores.length}{" "}
                              Tasks Evaluated
                            </span>
                          </div>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent className="p-0 border-t bg-slate-50/30">
                        <div className="p-6">
                          <h4 className="font-black text-[10px] uppercase tracking-widest text-primary mb-4">
                            Criterion-wise Performance
                          </h4>
                          <div className="overflow-hidden rounded-xl border-2 bg-white">
                            <table className="w-full text-sm">
                              <thead>
                                <tr className="bg-slate-100/50 border-b">
                                  <th className="px-4 py-3 text-left font-black uppercase text-[9px] w-[250px]">
                                    Criterion Task
                                  </th>
                                  <th className="px-4 py-3 text-center font-black uppercase text-[9px] w-[80px]">
                                    Rating
                                  </th>
                                  <th className="px-4 py-3 text-center font-black uppercase text-[9px] w-[80px]">
                                    Valuation
                                  </th>
                                  <th className="px-4 py-3 text-left font-black uppercase text-[9px]">
                                    Expert Remarks
                                  </th>
                                </tr>
                              </thead>
                              <tbody>
                                {result.criteriaScores.map(
                                  (score: any, sIdx: number) => {
                                    const critInfo = resultsData.criteria.find(
                                      (c: any) => c.id === score.criterionId,
                                    );
                                    return (
                                      <tr
                                        key={sIdx}
                                        className="border-b last:border-0 hover:bg-primary/[0.02]"
                                      >
                                        <td className="px-4 py-4">
                                          <div className="font-bold text-slate-700">
                                            {critInfo?.name}
                                          </div>
                                          <div className="text-[10px] text-muted-foreground mt-1">
                                            Weight: {critInfo?.weight} pts
                                          </div>
                                        </td>
                                        <td className="px-4 py-4 text-center">
                                          <div
                                            className={`inline-flex items-center justify-center w-9 h-7 rounded-md font-black border ${
                                              score.score >= 4
                                                ? "bg-green-50 border-green-200 text-green-700"
                                                : score.score <= 2
                                                  ? "bg-red-50 border-red-200 text-red-700"
                                                  : "bg-amber-50 border-amber-200 text-amber-700"
                                            }`}
                                          >
                                            {score.score}
                                          </div>
                                        </td>
                                        <td className="px-4 py-4 text-center font-black text-primary">
                                          {score.valuation}
                                        </td>
                                        <td className="px-4 py-4 text-xs italic text-muted-foreground leading-relaxed">
                                          {score.comment ? (
                                            `"${score.comment}"`
                                          ) : (
                                            <span className="opacity-30">
                                              No remarks
                                            </span>
                                          )}
                                        </td>
                                      </tr>
                                    );
                                  },
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
        </TabsContent>

        {/* Tab 5: Workflow */}
        <TabsContent value="workflow">
          <Card>
            <CardHeader className="bg-primary/5 border-b">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-6 w-6 text-primary" />
                  <CardTitle className="text-xl">
                    Certification Lifecycle Tracker
                  </CardTitle>
                </div>
                <Badge
                  variant={isRejected ? "destructive" : "outline"}
                  className="font-black px-4 py-1.5 uppercase tracking-wider"
                >
                  Phase: {applicationData?.status?.replace(/_/g, " ")}
                </Badge>
              </div>
              <CardDescription className="mt-2">
                Real-time status of the startup across the standardized
                certification pipeline.
              </CardDescription>
            </CardHeader>
            <CardContent className="py-16 overflow-x-auto">
              <div className="relative flex items-center justify-between min-w-[1000px] px-8">
                {WORKFLOW_STEPS.map((step, index) => {
                  const isCompleted = !isRejected && currentStatusIndex > index;
                  const isActive = !isRejected && currentStatusIndex === index;

                  return (
                    <div
                      key={step.id}
                      className="flex flex-col items-center flex-1 relative group"
                    >
                      {/* Connection Line */}
                      {index < WORKFLOW_STEPS.length - 1 && (
                        <div className="absolute top-6 left-1/2 w-full h-[3px] bg-muted -z-0">
                          <div
                            className={`h-full transition-all duration-1000 ease-in-out ${isCompleted ? "bg-green-500 w-full" : "bg-transparent w-0"}`}
                          />
                        </div>
                      )}

                      {/* Step Bubble */}
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <div
                              className={`w-12 h-12 rounded-full flex items-center justify-center border-4 transition-all duration-500 relative z-10 cursor-help ${
                                isCompleted
                                  ? "bg-green-500 border-green-500 text-white shadow-lg group-hover:scale-110"
                                  : isActive
                                    ? "bg-primary border-primary text-white shadow-[0_0_25px_rgba(var(--primary),0.6)] scale-125 z-20"
                                    : "bg-background border-muted text-muted-foreground group-hover:border-primary/40"
                              }`}
                            >
                              {isCompleted ? (
                                <Check className="h-7 w-7" />
                              ) : (
                                <span className="text-sm font-black">
                                  {index + 1}
                                </span>
                              )}
                            </div>
                          </TooltipTrigger>
                          <TooltipContent
                            side="top"
                            className="p-3 max-w-xs shadow-xl"
                          >
                            <p className="font-black uppercase tracking-tight text-primary mb-1">
                              {step.label}
                            </p>
                            <p className="text-xs font-medium text-muted-foreground">
                              {step.description}
                            </p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>

                      <div className="mt-6 flex flex-col items-center text-center">
                        <span
                          className={`text-[10px] font-black uppercase tracking-[0.2em] transition-colors duration-300 ${
                            isActive
                              ? "text-primary"
                              : isCompleted
                                ? "text-green-600"
                                : "text-muted-foreground/40"
                          }`}
                        >
                          {step.label}
                        </span>
                        {isActive && (
                          <div className="mt-2 h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
                        )}
                      </div>
                    </div>
                  );
                })}

                {isRejected && (
                  <div className="flex flex-col items-center flex-1 relative animate-in slide-in-from-right duration-500">
                    <div className="w-12 h-12 rounded-full bg-red-500 border-4 border-red-500 text-white flex items-center justify-center shadow-xl scale-125 z-20 group">
                      <X className="h-7 w-7" />
                    </div>
                    <span className="mt-6 text-[10px] font-black uppercase tracking-[0.2em] text-red-600">
                      Rejected
                    </span>
                  </div>
                )}
              </div>
            </CardContent>
            <CardFooter className="bg-muted/5 border-t py-4 justify-center">
              <p className="text-xs text-muted-foreground font-medium flex items-center gap-2">
                <Info className="h-3 w-3" />
                This timeline is automatically updated as the application moves
                through the system phases.
              </p>
            </CardFooter>
          </Card>

          <Card className="mt-8">
            <CardHeader className="bg-primary/5 border-b">
              <div className="flex items-center gap-2">
                <ClipboardCheck className="h-5 w-5 text-primary" />
                <CardTitle className="text-lg">
                  Certification Requirements
                </CardTitle>
              </div>
              <CardDescription>
                Minimum standards and documentation required for each
                certification level.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              <AdminCertificationRequirements viewOnly />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Submit confirmation dialog */}
      <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="text-xl">
              Evaluation Submission Summary
            </DialogTitle>
            <DialogDescription>
              Review the committee-wide evaluation summary before finalizing
              your submission.
            </DialogDescription>
          </DialogHeader>

          <div className="py-4 space-y-4">
            <div className="text-sm font-medium text-muted-foreground mb-2">
              Consolidated Committee Summary for{" "}
              {applicationData?.name || applicationData?.builder?.name}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-slate-50 p-4 rounded-lg border text-center">
                <div className="text-3xl font-black text-slate-700">
                  {resultsData?.overallAverageRating?.toFixed(1) || "0.0"}
                </div>
                <div className="text-[10px] font-bold uppercase text-slate-500 mt-1">
                  Committee Avg. Rating
                </div>
              </div>
              <div className="bg-primary/5 p-4 rounded-lg border text-center">
                <div className="text-3xl font-black text-primary">
                  {resultsData?.overallAverageValuation?.toFixed(0) || "0"}
                </div>
                <div className="text-[10px] font-bold uppercase text-primary/70 mt-1">
                  Committee Avg. Valuation
                </div>
              </div>
            </div>

            <div className="bg-muted/30 p-4 rounded-lg border space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold uppercase text-muted-foreground">
                  Committee Consensus
                </span>
                <Badge
                  variant="outline"
                  className="text-[10px] font-black uppercase"
                >
                  {resultsData?.memberResults?.length || 0} Submissions
                </Badge>
              </div>

              <div className="flex gap-4">
                <div className="flex items-center text-sm font-bold text-green-600">
                  <ThumbsUp className="h-4 w-4 mr-1.5" />
                  Approve:{" "}
                  {resultsData?.memberResults?.filter(
                    (r: any) => r.recommendation === "APPROVE",
                  ).length || 0}
                </div>
                <div className="flex items-center text-sm font-bold text-red-600">
                  <ThumbsDown className="h-4 w-4 mr-1.5" />
                  Reject:{" "}
                  {resultsData?.memberResults?.filter(
                    (r: any) => r.recommendation === "REJECT",
                  ).length || 0}
                </div>
                <div className="flex items-center text-sm font-bold text-amber-500">
                  <HelpCircle className="h-4 w-4 mr-1.5" />
                  Clarify:{" "}
                  {resultsData?.memberResults?.filter(
                    (r: any) => r.recommendation === "MORE_INFO",
                  ).length || 0}
                </div>
              </div>
            </div>

            {isChair && (
              <div className="bg-indigo-50 border border-indigo-100 p-4 rounded-lg flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="bg-indigo-600 h-10 w-10 rounded-full flex items-center justify-center text-white shadow-sm">
                    <Award className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="font-black text-xs uppercase tracking-tight text-indigo-900">
                      Chairperson Action
                    </p>
                    <p className="text-[10px] text-indigo-700 font-medium">
                      Your submission will finalize the official assessment
                      phase.
                    </p>
                  </div>
                </div>
                <Users className="h-8 w-8 text-indigo-300/30" />
              </div>
            )}

            {!isChair && (
              <div className="bg-amber-50 border border-amber-100 p-4 rounded-lg">
                <p className="text-[10px] font-bold text-amber-800 uppercase mb-1">
                  Your Personal Verdict
                </p>
                <div className="font-bold flex items-center">
                  {recommendation === "APPROVE" && (
                    <>
                      <ThumbsUp className="h-4 w-4 mr-2 text-green-600" />
                      <span className="text-sm">Approve</span>
                    </>
                  )}
                  {recommendation === "REJECT" && (
                    <>
                      <ThumbsDown className="h-4 w-4 mr-2 text-red-600" />
                      <span className="text-sm">Reject</span>
                    </>
                  )}
                  {recommendation === "MORE_INFO" && (
                    <>
                      <HelpCircle className="h-4 w-4 mr-2 text-amber-500" />
                      <span className="text-sm">Need Clarification</span>
                    </>
                  )}
                  {!recommendation && (
                    <span className="text-slate-500 font-normal italic text-sm">
                      Not specified
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowConfirmDialog(false)}
            >
              Back to Edit
            </Button>
            <Button 
              variant="default" 
              onClick={submitAssessment} 
              disabled={!recommendation}
              className={
                isChair ? "bg-indigo-600 hover:bg-indigo-700 text-white" : ""
              }
            >
              {isChair ? "Submit Final Decision" : "Confirm Evaluation"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Document Viewer Modal */}
      {viewingDocument && (
        <Dialog
          open={!!viewingDocument}
          onOpenChange={() => setViewingDocument(null)}
        >
          <DialogContent
            className={`${fullScreen ? "max-w-screen-2xl w-[95vw] h-[90vh]" : "max-w-5xl"}`}
          >
            <DialogHeader>
              <div className="flex justify-between items-center">
                <DialogTitle className="mr-8">
                  {viewingDocument.name}
                </DialogTitle>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setFullScreen(!fullScreen)}
                  >
                    {fullScreen ? (
                      <Minimize2 className="h-4 w-4" />
                    ) : (
                      <Maximize2 className="h-4 w-4" />
                    )}
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setViewingDocument(null)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </DialogHeader>

            <div className="flex gap-4 mt-4">
              {/* Document content */}
              <div
                className={`${fullScreen ? "h-[calc(90vh-120px)]" : "h-[60vh]"} overflow-hidden rounded-md border bg-muted flex flex-col ${!fullScreen ? "w-3/5" : "w-3/4"}`}
              >
                {viewingDocument.type.includes("pdf") ? (
                  <object
                    data={viewingDocument.url}
                    type="application/pdf"
                    className="w-full h-full"
                  >
                    <div className="w-full h-full flex items-center justify-center p-8">
                      <div className="text-center space-y-4">
                        <p className="text-sm text-muted-foreground">
                          Unable to display PDF. Please{" "}
                          <a
                            href={viewingDocument.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-primary underline"
                          >
                            open in new tab
                          </a>{" "}
                          or download.
                        </p>
                        <Button asChild>
                          <a
                            href={viewingDocument.url}
                            download={viewingDocument.name}
                          >
                            <Download className="mr-2 h-4 w-4" />
                            Download
                          </a>
                        </Button>
                      </div>
                    </div>
                  </object>
                ) : viewingDocument.type.includes("image/") ? (
                  <div className="w-full h-full flex items-center justify-center bg-black/5">
                    <Image
                      src={viewingDocument.url}
                      alt={viewingDocument.name}
                      className="max-w-full max-h-full object-contain"
                      width={800}
                      height={600}
                    />
                  </div>
                ) : (
                  <div className="w-full h-full flex items-center justify-center p-8">
                    <div className="text-center space-y-4">
                      <div className="bg-background w-20 h-20 rounded-full mx-auto flex items-center justify-center">
                        {getFileIcon(viewingDocument.type)}
                      </div>
                      <div>
                        <p className="text-xl font-medium">
                          {viewingDocument.name}
                        </p>
                        <p className="text-sm text-muted-foreground mt-1">
                          This file type can&apos;t be previewed. Please
                          download to view.
                        </p>
                      </div>
                      <Button asChild>
                        <a
                          href={viewingDocument.url}
                          download={viewingDocument.name}
                        >
                          <Download className="mr-2 h-4 w-4" />
                          Download
                        </a>
                      </Button>
                    </div>
                  </div>
                )}
              </div>

              {/* Notes panel */}
              <div
                className={`${fullScreen ? "h-[calc(90vh-120px)]" : "h-[60vh]"} ${!fullScreen ? "w-2/5" : "w-1/4"} flex flex-col`}
              >
                <div className="bg-background p-4 rounded-md border h-full flex flex-col">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-lg font-medium">Document Notes</h3>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowNotesPanel(!showNotesPanel)}
                      className="h-7 w-7 p-0"
                    >
                      {showNotesPanel ? (
                        <Minimize2 className="h-4 w-4" />
                      ) : (
                        <Maximize2 className="h-4 w-4" />
                      )}
                    </Button>
                  </div>

                  {showNotesPanel && (
                    <>
                      <p className="text-sm text-muted-foreground mb-4">
                        Add notes by category to organize your thoughts about
                        this document.
                      </p>

                      <Tabs defaultValue="editor" className="mb-4">
                        <TabsList className="w-full">
                          <TabsTrigger value="editor" className="flex-1">
                            Add Note
                          </TabsTrigger>
                          <TabsTrigger value="notes" className="flex-1">
                            View Notes
                            <Badge
                              variant="secondary"
                              className="ml-2 bg-primary/10 hover:bg-primary/20"
                            >
                              {documentNotes[viewingDocument.id]?.length || 0}
                            </Badge>
                          </TabsTrigger>
                        </TabsList>

                        <TabsContent
                          value="editor"
                          className="flex-grow flex flex-col"
                        >
                          <div className="space-y-2 mb-3">
                            <Label htmlFor="note-category">Category</Label>
                            <Select
                              value={currentCategory}
                              onValueChange={setCurrentCategory}
                            >
                              <SelectTrigger id="note-category">
                                <div className="flex items-center gap-2">
                                  {getCategoryIcon(currentCategory)}
                                  <span>
                                    {noteCategories.find(
                                      (c) => c.value === currentCategory,
                                    )?.label || "General"}
                                  </span>
                                </div>
                              </SelectTrigger>
                              <SelectContent>
                                {noteCategories.map((category) => (
                                  <SelectItem
                                    key={category.value}
                                    value={category.value}
                                  >
                                    <div className="flex items-center gap-2">
                                      {getCategoryIcon(category.value)}
                                      <span>{category.label}</span>
                                    </div>
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>

                          <div className="flex-grow mb-4">
                            <Label
                              htmlFor="note-content"
                              className="mb-2 block"
                            >
                              Note
                            </Label>
                            <Textarea
                              id="note-content"
                              placeholder="Type your notes about this document here..."
                              className="h-[calc(100%-2rem)] resize-none"
                              value={currentNote}
                              onChange={(e) => setCurrentNote(e.target.value)}
                            />
                          </div>

                          <div className="flex justify-end gap-2">
                            <Button
                              variant="outline"
                              onClick={() => setCurrentNote("")}
                              disabled={!currentNote}
                            >
                              Clear
                            </Button>
                            <Button
                              onClick={() => {
                                if (!currentNote.trim()) return;

                                // Save current note to document notes
                                setDocumentNotes({
                                  ...documentNotes,
                                  [viewingDocument.id]: [
                                    ...(documentNotes[viewingDocument.id] ||
                                      []),
                                    {
                                      text: currentNote,
                                      category: currentCategory,
                                      timestamp: new Date().toISOString(),
                                    },
                                  ],
                                });

                                // Clear current note after saving
                                setCurrentNote("");
                              }}
                              disabled={!currentNote.trim()}
                            >
                              Save Note
                            </Button>
                          </div>
                        </TabsContent>

                        <TabsContent
                          value="notes"
                          className="h-full overflow-auto"
                        >
                          {!documentNotes[viewingDocument.id] ||
                          documentNotes[viewingDocument.id].length === 0 ? (
                            <div className="h-full flex flex-col items-center justify-center text-center p-4">
                              <FileText className="h-8 w-8 mb-2 text-muted-foreground" />
                              <p className="text-muted-foreground">
                                No notes yet for this document
                              </p>
                              <p className="text-sm text-muted-foreground mt-1">
                                Switch to the Add Note tab to create your first
                                note
                              </p>
                            </div>
                          ) : (
                            <div className="space-y-3">
                              {documentNotes[viewingDocument.id]
                                .sort(
                                  (a, b) =>
                                    new Date(b.timestamp).getTime() -
                                    new Date(a.timestamp).getTime(),
                                )
                                .map((note, i) => (
                                  <Card key={i} className="overflow-hidden">
                                    <CardHeader className="py-2 px-3 bg-muted/50 flex flex-row items-center space-y-0 gap-2">
                                      {getCategoryIcon(note.category)}
                                      <span className="text-sm font-medium">
                                        {noteCategories.find(
                                          (c) => c.value === note.category,
                                        )?.label || "General"}
                                      </span>
                                      <span className="text-xs text-muted-foreground ml-auto">
                                        {new Date(
                                          note.timestamp,
                                        ).toLocaleString()}
                                      </span>
                                    </CardHeader>
                                    <CardContent className="p-3">
                                      <p className="text-sm whitespace-pre-wrap">
                                        {note.text}
                                      </p>
                                    </CardContent>
                                  </Card>
                                ))}
                            </div>
                          )}
                        </TabsContent>
                      </Tabs>
                    </>
                  )}
                </div>
              </div>
            </div>

            <DialogFooter className="flex justify-between mt-4">
              <div className="flex items-center text-sm text-muted-foreground">
                <span>
                  {documentNotes[viewingDocument.id]
                    ? "Notes saved for this document"
                    : "No notes saved for this document yet"}
                </span>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" asChild>
                  <a href={viewingDocument.url} download={viewingDocument.name}>
                    <Download className="mr-2 h-4 w-4" />
                    Download
                  </a>
                </Button>
              </div>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}

export default function AssessmentPage() {
  return (
    <Suspense fallback={<div>Loading assessment...</div>}>
      <AssessmentPageContent />
    </Suspense>
  );
}
