"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Search,
  Filter,
  ArrowUpDown,
  Clock,
  ThumbsUp,
  ThumbsDown,
  HelpCircle,
  MessageCircle,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { AssessmentResultModal } from "../dashboard/components/assessment-result-modal";
import { startAssessmentReview } from "../dashboard/actions";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { initCommitteeChatWithStartup } from "@/lib/actions/communication";
import { Loader2 } from "lucide-react";

interface AssessmentsClientProps {
  committees: any[];
  pendingAssessments: any[];
  underReviewAssessments: any[];
  completedAssessments: any[];
  mode?: "all" | "ecosystem" | "startup";
}

export function AssessmentsClient({
  committees = [],
  pendingAssessments = [],
  underReviewAssessments = [],
  completedAssessments = [],
  mode = "all",
}: AssessmentsClientProps) {
  const [tabView, setTabView] = useState("pending");
  const [searchQuery, setSearchQuery] = useState("");
  const [committeeFilter, setCommitteeFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortField, setSortField] = useState("dueDate");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [selectedApplicationId, setSelectedApplicationId] = useState<
    string | null
  >(null);
  const [selectedEntityType, setSelectedEntityType] = useState<
    "ecosystem" | "startup"
  >("ecosystem");
  const [isResultModalOpen, setIsResultModalOpen] = useState(false);
  const [startingReview, setStartingReview] = useState<string | null>(null);
  const [initiatingChat, setInitiatingChat] = useState<string | null>(null);
  const router = useRouter();

  const handleStartReview = async (assessment: any) => {
    setStartingReview(assessment.id);
    try {
      const result = await startAssessmentReview(assessment.id, assessment.entityType);
      if (result.success) {
        router.push(getAssessmentLink(assessment));
      } else {
        toast.error(result.message || "Failed to start review");
      }
    } catch (error) {
      console.error("Error starting review:", error);
      toast.error("An unexpected error occurred");
    } finally {
      setStartingReview(null);
    }
  };

  const handleSeeResult = (applicationId: string, entityType: string) => {
    setSelectedApplicationId(applicationId);
    setSelectedEntityType((entityType as any) || "ecosystem");
    setIsResultModalOpen(true);
  };

  const handleInitiateChat = async (entityId: string, entityType: "startup" | "ecosystem") => {
    setInitiatingChat(entityId);
    try {
      const res = await initCommitteeChatWithStartup(entityId, entityType);
      if (res.success && res.data?.conversationId) {
        router.push(`/committee-portal/messages?conversationId=${res.data.conversationId}`);
      } else {
        toast.error(res.error || "Failed to initiate chat");
      }
    } catch (error) {
      toast.error("An error occurred while opening chat");
    } finally {
      setInitiatingChat(null);
    }
  };

  const getDaysRemaining = (dueDateString: string) => {
    const dueDate = new Date(dueDateString);
    const today = new Date();
    const diffTime = dueDate.getTime() - today.getTime();
    return Math.max(0, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return "—";
    return new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    }).format(new Date(dateString));
  };

  const toggleSort = (field: string) => {
    if (sortField === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortOrder("asc");
    }
  };

  const filterAssessments = (list: any[]) => {
    return list.filter((a) => {
      if (mode === "ecosystem" && a.entityType !== "ecosystem") return false;
      if (mode === "startup" && a.entityType !== "startup") return false;
      
      const matchesSearch =
        a.entityName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        a.sector.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCommittee =
        committeeFilter === "all" || a.committeeId === committeeFilter;
      
      let matchesStatus = true;
      if (tabView === "completed") {
        matchesStatus = statusFilter === "all" || a.status === statusFilter;
      }

      return matchesSearch && matchesCommittee && matchesStatus;
    });
  };

  const sortAssessments = (list: any[]) => {
    return [...list].sort((a, b) => {
      if (sortField === "dueDate" || sortField === "submittedDate") {
        const dateA = a[sortField] ? new Date(a[sortField]).getTime() : 0;
        const dateB = b[sortField] ? new Date(b[sortField]).getTime() : 0;
        return sortOrder === "asc" ? dateA - dateB : dateB - dateA;
      }
      if (sortField === "name") {
        const diff = a.entityName.localeCompare(b.entityName);
        return sortOrder === "asc" ? diff : -diff;
      }
      return 0;
    });
  };

  const filteredPending = sortAssessments(filterAssessments(pendingAssessments));
  const filteredUnderReview = sortAssessments(filterAssessments(underReviewAssessments));
  const filteredCompleted = sortAssessments(filterAssessments(completedAssessments));

  const getAssessmentLink = (assessment: any) => {
    const type = assessment.entityType === "startup" ? "startup" : "ecosystem";
    return `/committee-portal/assessments/${type}/${assessment.id}`;
  };

  return (
    <div className="container max-w-screen-2xl py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold">
            {mode === "ecosystem" ? "Ecosystem Builder Applications" : 
             mode === "startup" ? "Startup Applications" : 
             "All Applications"}
          </h1>
          <p className="text-muted-foreground">
            View and manage your {mode !== "all" ? mode : ""} pending and completed assessments
          </p>
        </div>
      </div>

      <Tabs value={tabView} onValueChange={setTabView} className="space-y-6">
        {/* Toolbar */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <TabsList>
            <TabsTrigger value="pending">
              Pending
              {filteredPending.length > 0 && (
                <Badge
                  variant="secondary"
                  className="ml-2 bg-slate-200 text-slate-800"
                >
                  {filteredPending.length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="underReview">
              Under Review
              {filteredUnderReview.length > 0 && (
                <Badge
                  variant="secondary"
                  className="ml-2 bg-blue-100 text-blue-800 border-blue-200"
                >
                  {filteredUnderReview.length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="completed">
              Completed
              {filteredCompleted.length > 0 && (
                <Badge
                  variant="secondary"
                  className="ml-2 bg-green-100 text-green-800"
                >
                  {filteredCompleted.length}
                </Badge>
              )}
            </TabsTrigger>
          </TabsList>

          <div className="flex items-center gap-2 flex-wrap">
            <div className="relative w-64">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search..."
                className="pl-9"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <Select value={committeeFilter} onValueChange={setCommitteeFilter}>
              <SelectTrigger className="w-[200px]">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Committee" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Committees</SelectItem>
                {committees.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {tabView === "completed" && (
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[180px]">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Verdict" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Verdicts</SelectItem>
                  <SelectItem value="approve">Approved</SelectItem>
                  <SelectItem value="reject">Rejected</SelectItem>
                  <SelectItem value="more-info">More Info</SelectItem>
                  <SelectItem value="submitted">Submitted</SelectItem>
                </SelectContent>
              </Select>
            )}
          </div>
        </div>

        {/* ── PENDING TAB ── */}
        <TabsContent value="pending" className="m-0">
          <Card>
            <CardHeader className="px-6 py-5">
              <CardTitle>Pending Assessments</CardTitle>
              <CardDescription>
                Applications waiting for your evaluation
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => toggleSort("name")}
                          className="flex items-center p-0 h-auto font-medium"
                        >
                          Name <ArrowUpDown className="ml-2 h-3 w-3" />
                        </Button>
                      </TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Sector</TableHead>
                      <TableHead>Committee</TableHead>
                      <TableHead>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => toggleSort("dueDate")}
                          className="flex items-center p-0 h-auto font-medium"
                        >
                          Due Date <ArrowUpDown className="ml-2 h-3 w-3" />
                        </Button>
                      </TableHead>
                      <TableHead>Progress</TableHead>
                      <TableHead>Created</TableHead>
                      <TableHead className="text-right">Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredPending.length === 0 ? (
                      <TableRow>
                        <TableCell
                          colSpan={8}
                          className="text-center py-10 text-muted-foreground"
                        >
                          No pending assessments match the selected filters
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredPending.map((assessment) => {
                        const daysLeft = getDaysRemaining(assessment.dueDate);
                        const progressPct =
                          (assessment.completedVotes /
                            assessment.requiredVotes) *
                          100;
                        return (
                          <TableRow key={assessment.id}>
                            <TableCell className="font-medium whitespace-nowrap">
                              <div className="flex items-center gap-2">
                                {assessment.entityLogo ? (
                                  <Avatar className="h-7 w-7">
                                    <AvatarImage
                                      src={assessment.entityLogo}
                                      alt={assessment.entityName}
                                    />
                                  </Avatar>
                                ) : (
                                  <Avatar className="h-7 w-7">
                                    <AvatarFallback className="text-xs bg-primary/10">
                                      {assessment.entityName
                                        .substring(0, 2)
                                        .toUpperCase()}
                                    </AvatarFallback>
                                  </Avatar>
                                )}
                                <span>{assessment.entityName}</span>
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge
                                variant="outline"
                                className="text-xs whitespace-nowrap"
                              >
                                {assessment.entityType === "startup"
                                  ? "Startup"
                                  : "Ecosystem Builder"}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-sm text-muted-foreground">
                              {assessment.sector}
                            </TableCell>
                            <TableCell className="text-sm">
                              {assessment.committeeName}
                            </TableCell>
                            <TableCell className="whitespace-nowrap">
                              <div className="text-sm font-medium">
                                {formatDate(assessment.dueDate)}
                              </div>
                              {daysLeft === 0 ? (
                                <Badge variant="destructive" className="mt-1 text-xs">Overdue</Badge>
                              ) : daysLeft <= 5 ? (
                                <Badge
                                  variant="destructive"
                                  className="mt-1 text-xs"
                                >
                                  {daysLeft}d left
                                </Badge>
                              ) : (
                                <span className="text-xs text-muted-foreground flex items-center mt-1">
                                  <Clock className="h-3 w-3 mr-1" />
                                  {daysLeft}d left
                                </span>
                              )}
                            </TableCell>
                            <TableCell>
                              <div className="w-32">
                                <div className="flex justify-between text-xs mb-1">
                                  <span>
                                    {assessment.completedVotes}/
                                    {assessment.requiredVotes}
                                  </span>
                                  <span>{Math.round(progressPct)}%</span>
                                </div>
                                <Progress value={progressPct} className="h-2" />
                              </div>
                            </TableCell>
                            <TableCell className="text-sm whitespace-nowrap">
                              {formatDate(assessment.createdAt)}
                            </TableCell>
                            <TableCell className="text-right">
                              <Button
                                size="sm"
                                variant="default"
                                className="bg-primary hover:bg-primary/90"
                                onClick={() => handleStartReview(assessment)}
                                disabled={startingReview === assessment.id}
                              >
                                {startingReview === assessment.id ? (
                                  <>
                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                    Starting...
                                  </>
                                ) : (
                                  "Start Review"
                                )}
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                className="h-9 w-9 p-0 ml-2 rounded-full text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50"
                                onClick={() => handleInitiateChat(assessment.id, assessment.entityType)}
                                disabled={initiatingChat === assessment.id}
                                title="Message Applicant"
                              >
                                {initiatingChat === assessment.id ? (
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                  <MessageCircle className="h-4 w-4" />
                                )}
                              </Button>
                            </TableCell>
                          </TableRow>
                        );
                      })
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── UNDER REVIEW TAB ── */}
        <TabsContent value="underReview" className="m-0">
          <Card>
            <CardHeader className="px-6 py-5">
              <CardTitle>Under Review Assessments</CardTitle>
              <CardDescription>
                Applications you or others have started reviewing
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => toggleSort("name")}
                          className="flex items-center p-0 h-auto font-medium"
                        >
                          Name <ArrowUpDown className="ml-2 h-3 w-3" />
                        </Button>
                      </TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Sector</TableHead>
                      <TableHead>Committee</TableHead>
                      <TableHead>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => toggleSort("dueDate")}
                          className="flex items-center p-0 h-auto font-medium"
                        >
                          Due Date <ArrowUpDown className="ml-2 h-3 w-3" />
                        </Button>
                      </TableHead>
                      <TableHead>Progress</TableHead>
                      <TableHead>Created</TableHead>
                      <TableHead className="text-right">Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredUnderReview.length === 0 ? (
                      <TableRow>
                        <TableCell
                          colSpan={8}
                          className="text-center py-10 text-muted-foreground"
                        >
                          No assessments are currently under review
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredUnderReview.map((assessment) => {
                        const daysLeft = getDaysRemaining(assessment.dueDate);
                        const progressPct =
                          (assessment.completedVotes /
                            assessment.requiredVotes) *
                          100;
                        return (
                          <TableRow key={assessment.id}>
                            <TableCell className="font-medium whitespace-nowrap">
                              <div className="flex items-center gap-2">
                                {assessment.entityLogo ? (
                                  <Avatar className="h-7 w-7">
                                    <AvatarImage
                                      src={assessment.entityLogo}
                                      alt={assessment.entityName}
                                    />
                                  </Avatar>
                                ) : (
                                  <Avatar className="h-7 w-7">
                                    <AvatarFallback className="text-xs bg-primary/10">
                                      {assessment.entityName
                                        .substring(0, 2)
                                        .toUpperCase()}
                                    </AvatarFallback>
                                  </Avatar>
                                )}
                                <span>{assessment.entityName}</span>
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge
                                variant="outline"
                                className="text-xs whitespace-nowrap"
                              >
                                {assessment.entityType === "startup"
                                  ? "Startup"
                                  : "Ecosystem Builder"}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-sm text-muted-foreground">
                              {assessment.sector}
                            </TableCell>
                            <TableCell className="text-sm">
                              {assessment.committeeName}
                            </TableCell>
                            <TableCell className="whitespace-nowrap">
                              <div className="text-sm font-medium">
                                {formatDate(assessment.dueDate)}
                              </div>
                              {daysLeft === 0 ? (
                                <Badge variant="destructive" className="mt-1 text-xs">Overdue</Badge>
                              ) : daysLeft <= 5 ? (
                                <Badge
                                  variant="destructive"
                                  className="mt-1 text-xs"
                                >
                                  {daysLeft}d left
                                </Badge>
                              ) : (
                                <span className="text-xs text-muted-foreground flex items-center mt-1">
                                  <Clock className="h-3 w-3 mr-1" />
                                  {daysLeft}d left
                                </span>
                              )}
                            </TableCell>
                            <TableCell>
                              <div className="w-32">
                                <div className="flex justify-between text-xs mb-1">
                                  <span>
                                    {assessment.completedVotes}/
                                    {assessment.requiredVotes}
                                  </span>
                                  <span>{Math.round(progressPct)}%</span>
                                </div>
                                <Progress value={progressPct} className="h-2" />
                              </div>
                            </TableCell>
                            <TableCell className="text-sm whitespace-nowrap">
                              {formatDate(assessment.createdAt)}
                            </TableCell>
                            <TableCell className="text-right">
                              <Button size="sm" asChild>
                                <Link
                                  href={getAssessmentLink(assessment)}
                                >
                                  Continue
                                </Link>
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                className="h-9 w-9 p-0 ml-2 rounded-full text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50"
                                onClick={() => handleInitiateChat(assessment.id, assessment.entityType)}
                                disabled={initiatingChat === assessment.id}
                                title="Message Applicant"
                              >
                                {initiatingChat === assessment.id ? (
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                  <MessageCircle className="h-4 w-4" />
                                )}
                              </Button>
                            </TableCell>
                          </TableRow>
                        );
                      })
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── COMPLETED TAB ── */}
        <TabsContent value="completed" className="m-0">
          <Card>
            <CardHeader className="px-6 py-5">
              <CardTitle>Completed Assessments</CardTitle>
              <CardDescription>
                Reviews you have already submitted
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => toggleSort("name")}
                          className="flex items-center p-0 h-auto font-medium"
                        >
                          Name <ArrowUpDown className="ml-2 h-3 w-3" />
                        </Button>
                      </TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Sector</TableHead>
                      <TableHead>Committee</TableHead>
                      <TableHead>Your Rating</TableHead>
                      <TableHead>Total Valuation</TableHead>
                      <TableHead>Verdict</TableHead>
                      <TableHead>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => toggleSort("submittedDate")}
                          className="flex items-center p-0 h-auto font-medium"
                        >
                          Submitted <ArrowUpDown className="ml-2 h-3 w-3" />
                        </Button>
                      </TableHead>
                      <TableHead className="text-right">Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredCompleted.length === 0 ? (
                      <TableRow>
                        <TableCell
                          colSpan={9}
                          className="text-center py-10 text-muted-foreground"
                        >
                          No completed assessments match the selected filters
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredCompleted.map((assessment) => (
                        <TableRow key={assessment.id}>
                          <TableCell className="font-medium whitespace-nowrap">
                            <div className="flex items-center gap-2">
                              {assessment.entityLogo ? (
                                <Avatar className="h-7 w-7">
                                  <AvatarImage
                                    src={assessment.entityLogo}
                                    alt={assessment.entityName}
                                  />
                                </Avatar>
                              ) : (
                                <Avatar className="h-7 w-7">
                                  <AvatarFallback className="text-xs bg-primary/10">
                                    {assessment.entityName
                                      .substring(0, 2)
                                      .toUpperCase()}
                                  </AvatarFallback>
                                </Avatar>
                              )}
                              <span>{assessment.entityName}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant="outline"
                              className="text-xs whitespace-nowrap"
                            >
                              {assessment.entityType === "startup"
                                ? "Startup"
                                : "Ecosystem Builder"}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {assessment.sector}
                          </TableCell>
                          <TableCell className="text-sm">
                            {assessment.committeeName}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-baseline gap-1">
                              <span className="text-lg font-bold text-amber-500">
                                {(assessment.yourScore ?? 0).toFixed(1)}
                              </span>
                              <span className="text-xs text-muted-foreground">
                                /5.0
                              </span>
                            </div>
                            <span className="text-xs text-muted-foreground block">
                              Avg: {(assessment.avgScore ?? 0).toFixed(1)}
                            </span>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-baseline gap-1">
                              <span className="text-lg font-bold text-primary">
                                {assessment.yourTotalValuation ?? 0}
                              </span>
                              <span className="text-xs text-muted-foreground">
                                pts
                              </span>
                            </div>
                          </TableCell>
                          <TableCell>
                            {assessment.status === "approve" && (
                              <Badge className="bg-green-100 text-green-800 border-green-200 whitespace-nowrap">
                                <ThumbsUp className="h-3 w-3 mr-1" /> Approved
                              </Badge>
                            )}
                            {assessment.status === "reject" && (
                              <Badge className="bg-red-100 text-red-800 border-red-200 whitespace-nowrap">
                                <ThumbsDown className="h-3 w-3 mr-1" /> Rejected
                              </Badge>
                            )}
                            {assessment.status === "more-info" && (
                              <Badge className="bg-amber-100 text-amber-800 border-amber-200 whitespace-nowrap">
                                <HelpCircle className="h-3 w-3 mr-1" /> More
                                Info
                              </Badge>
                            )}
                            {assessment.status === "submitted" && (
                              <Badge className="bg-blue-100 text-blue-800 border-blue-200 whitespace-nowrap">
                                <ThumbsUp className="h-3 w-3 mr-1" /> Submitted
                              </Badge>
                            )}
                            {![
                              "approve",
                              "reject",
                              "more-info",
                              "submitted",
                            ].includes(assessment.status) && (
                              <Badge
                                variant="outline"
                                className="whitespace-nowrap"
                              >
                                <Clock className="h-3 w-3 mr-1" /> Pending
                              </Badge>
                            )}
                          </TableCell>
                          <TableCell className="text-sm whitespace-nowrap">
                            {formatDate(assessment.submittedDate)}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() =>
                                  handleSeeResult(
                                    assessment.id,
                                    assessment.entityType || "ecosystem",
                                  )
                                }
                              >
                                See Result
                              </Button>
                              <Button variant="outline" size="sm" asChild>
                                <Link
                                  href={getAssessmentLink(assessment)}
                                >
                                  View
                                </Link>
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                className="h-9 w-9 p-0 ml-1 rounded-full text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50"
                                onClick={() => handleInitiateChat(assessment.id, assessment.entityType)}
                                disabled={initiatingChat === assessment.id}
                                title="Message Applicant"
                              >
                                {initiatingChat === assessment.id ? (
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                  <MessageCircle className="h-4 w-4" />
                                )}
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <AssessmentResultModal
        isOpen={isResultModalOpen}
        onClose={() => setIsResultModalOpen(false)}
        applicationId={selectedApplicationId}
        entityType={selectedEntityType}
      />
    </div>
  );
}
