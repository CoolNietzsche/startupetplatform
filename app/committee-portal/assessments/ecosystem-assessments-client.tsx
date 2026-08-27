"use client";

import React, { useState, useEffect } from "react";
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
  Loader2,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
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
import { Progress } from "@/components/ui/progress";
import { AssessmentResultModal } from "../dashboard/components/assessment-result-modal";
import { startAssessmentReview } from "../dashboard/actions";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { initCommitteeChatWithStartup } from "@/lib/actions/communication";
import { EcosystemApplicationTable, EcosystemTableItem, TableColumnDef } from "@/components/ecosystem/shared/application-table";
import { cn } from "@/lib/utils";

interface EcosystemAssessmentsClientProps {
  committees: any[];
  pendingAssessments: any[];
  underReviewAssessments: any[];
  completedAssessments: any[];
}

export function EcosystemAssessmentsClient({
  committees = [],
  pendingAssessments = [],
  underReviewAssessments = [],
  completedAssessments = [],
}: EcosystemAssessmentsClientProps) {
  const [tabView, setTabView] = useState("pending");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
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

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, committeeFilter, statusFilter]);

  const handleTabChange = (value: string) => {
    setTabView(value);
    setCurrentPage(1);
  };

  const handleStartReview = async (assessment: any) => {
    setStartingReview(assessment.id);
    try {
      const result = await startAssessmentReview(assessment.id, assessment.entityType);
      if (result.success) {
        router.push(`/committee-portal/assessments/ecosystem/${assessment.id}`);
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
      const res = await initCommitteeChatWithStartup(entityId, "ecosystem");
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

  const filterAssessments = (list: any[]) => {
    return list.filter((a) => {
      if (a.entityType !== "ecosystem") return false;
      const matchesSearch =
        a.entityName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (a.sector || "").toLowerCase().includes(searchQuery.toLowerCase());
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

  // Mapper to transform into EcosystemTableItem
  const mapToTableItem = (assessment: any): EcosystemTableItem => {
    return {
      id: assessment.id,
      applicationId: assessment.id, // Using the assessment id, which represents the application id in this context 
      name: assessment.entityName,
      type: assessment.entityType === 'startup' ? 'Startup' : 'Builder',
      location: assessment.committeeName || "—", // Repurposing column as Committee Name visually if needed
      region: assessment.sector || "—",
      status: assessment.applicationStatus || assessment.status, // Pass real status for EcosystemStatusBadge
      workflowStatus: assessment.applicationStatus, 
      certified: assessment.applicationStatus === "CERTIFIED",
      // raw assessment object passed for custom columns
      _raw: assessment
    };
  };

  const paginate = (items: any[]) => items.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const tableDataPending = paginate(filteredPending).map(mapToTableItem);
  const tableDataUnderReview = paginate(filteredUnderReview).map(mapToTableItem);
  const tableDataCompleted = paginate(filteredCompleted).map(mapToTableItem);

  const renderPagination = (totalItems: number) => {
    const totalPages = Math.ceil(totalItems / itemsPerPage) || 1;

    return (
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2 mt-2 border-t border-slate-100">
        <div className="flex flex-wrap items-center gap-4">
          <p className="text-xs text-slate-500 font-medium whitespace-nowrap">
            Showing {totalItems === 0 ? 0 : ((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, totalItems)} of {totalItems} entries
          </p>
          <div className="flex items-center gap-2">
            <p className="text-xs text-slate-500 font-medium whitespace-nowrap">Rows per page</p>
            <Select 
              value={itemsPerPage.toString()} 
              onValueChange={(val) => {
                setItemsPerPage(Number(val));
                setCurrentPage(1);
              }}
            >
              <SelectTrigger className="h-8 w-[70px] rounded-lg text-xs bg-white border-slate-200">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="rounded-xl min-w-[70px]">
                {[5, 10, 20, 50, 100, 200, 500].map(size => (
                  <SelectItem key={size} value={size.toString()} className="text-xs">
                    {size}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex items-center gap-2 order-1 sm:order-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="h-8 px-3 rounded-lg border-slate-200 font-semibold text-xs text-slate-700 bg-white shadow-sm"
          >
            <ChevronLeft className="h-4 w-4 mr-1" />
            Previous
          </Button>
          
          <div className="flex items-center gap-1">
            <Badge variant="secondary" className="h-8 px-3 rounded-lg bg-slate-100 text-slate-900 font-bold border-none flex items-center justify-center text-xs">
              {currentPage} / {totalPages}
            </Badge>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="h-8 px-3 rounded-lg border-slate-200 font-semibold text-xs text-slate-700 bg-white shadow-sm"
          >
            Next
            <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        </div>
      </div>
    );
  };

  const sharedExtraCols: TableColumnDef[] = [
    {
      header: "Committee",
      cell: (item) => item._raw.committeeName,
    },
    {
      header: "Due Date",
      cell: (item) => {
        const daysLeft = getDaysRemaining(item._raw.dueDate);
        return (
          <div className="flex flex-col">
            <span className="font-medium text-slate-800">{formatDate(item._raw.dueDate)}</span>
            {daysLeft === 0 ? (
              <Badge variant="destructive" className="mt-1 w-fit text-[10px]">Overdue</Badge>
            ) : daysLeft <= 5 ? (
              <Badge variant="destructive" className="mt-1 w-fit text-[10px]">
                {daysLeft}d left
              </Badge>
            ) : (
              <span className="text-[10px] text-muted-foreground flex items-center mt-1">
                <Clock className="h-3 w-3 mr-1" />
                {daysLeft}d left
              </span>
            )}
          </div>
        );
      }
    },
    {
      header: "Progress",
      cell: (item) => {
        const pct = (item._raw.completedVotes / item._raw.requiredVotes) * 100;
        return (
          <div className="w-24">
            <div className="flex justify-between text-[10px] mb-1 text-slate-500 font-bold">
              <span>{item._raw.completedVotes}/{item._raw.requiredVotes}</span>
              <span>{Math.round(pct)}%</span>
            </div>
            <Progress value={pct} className="h-1.5" />
          </div>
        );
      }
    }
  ];

  const completedExtraCols: TableColumnDef[] = [
    {
      header: "Committee",
      cell: (item) => item._raw.committeeName,
    },
    {
      header: "Your Rating",
      cell: (item) => (
        <div className="flex items-baseline gap-1 whitespace-nowrap">
          <span className="text-sm font-bold text-amber-500">
            {(item._raw.yourScore ?? 0).toFixed(1)}
          </span>
          <span className="text-[10px] text-muted-foreground">/5.0</span>
          <span className="text-[10px] text-muted-foreground font-medium ml-1">
            Avg: {(item._raw.avgScore ?? 0).toFixed(1)}
          </span>
        </div>
      )
    },
    {
      header: "Valuation",
      cell: (item) => (
        <div className="flex items-baseline gap-1">
          <span className="text-sm font-bold text-primary">
            {item._raw.yourTotalValuation ?? 0}
          </span>
          <span className="text-[10px] text-muted-foreground">pts</span>
        </div>
      )
    },
    {
      header: "Verdict",
      cell: (item) => {
        const st = item._raw.status;
        if (st === "approve") return <Badge className="bg-green-100 text-green-800 border-none"><ThumbsUp className="h-3 w-3 mr-1" /> Approved</Badge>;
        if (st === "reject") return <Badge className="bg-red-100 text-red-800 border-none"><ThumbsDown className="h-3 w-3 mr-1" /> Rejected</Badge>;
        if (st === "more-info") return <Badge className="bg-amber-100 text-amber-800 border-none"><HelpCircle className="h-3 w-3 mr-1" /> More Info</Badge>;
        if (st === "submitted") return <Badge className="bg-blue-100 text-blue-800 border-none"><ThumbsUp className="h-3 w-3 mr-1" /> Submitted</Badge>;
        return <Badge variant="outline" className="border-slate-200"><Clock className="h-3 w-3 mr-1" /> Pending</Badge>;
      }
    }
  ];

  // Provide high-density top section
  return (
    <div className="container max-w-screen-2xl pt-0 pb-4">
      <Card className="border-none shadow-xl bg-white rounded-3xl overflow-hidden mt-0">
        <CardHeader className="p-4 px-6 space-y-3 bg-slate-50/30 border-b border-slate-100">
          <div className="flex flex-col gap-4">
            
            {/* Integrated Command Bar & Title */}
            <div className="flex flex-col xl:flex-row gap-4 items-stretch xl:items-center justify-between">
              <h1 className="text-xl font-extrabold tracking-tight text-slate-900 shrink-0">
                Ecosystem Applications
              </h1>
              
              <div className="flex flex-col md:flex-row gap-2 items-stretch md:items-center w-full xl:w-auto">
                <div className="relative flex-grow group transition-all md:min-w-[300px]">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-brand-1 transition-colors" />
                  <Input
                    type="search"
                    placeholder="Search by name or sector..."
                    className="w-full bg-white pl-10 h-10 border-slate-200 focus:border-brand-1 rounded-2xl shadow-sm transition-all text-sm font-medium"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <Select value={committeeFilter} onValueChange={setCommitteeFilter}>
                    <SelectTrigger className="w-[180px] h-10 rounded-2xl border-slate-200 shadow-sm font-semibold text-xs bg-white">
                      <Filter className="h-3.5 w-3.5 mr-2 text-slate-400" />
                      <SelectValue placeholder="Committee" />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl">
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
                      <SelectTrigger className="w-[160px] h-10 rounded-2xl border-slate-200 shadow-sm font-semibold text-xs bg-white">
                        <Filter className="h-3.5 w-3.5 mr-2 text-slate-400" />
                        <SelectValue placeholder="Verdict" />
                      </SelectTrigger>
                      <SelectContent className="rounded-xl">
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
            </div>

            {/* Stage Tabs */}
            <div className="w-full overflow-x-auto scrollbar-hide">
              <Tabs 
                value={tabView} 
                onValueChange={handleTabChange}
                className="w-full"
              >
                <TabsList className="inline-flex h-11 items-center justify-start rounded-xl bg-slate-100 p-1 text-slate-500 border border-slate-200/60 min-w-full">
                  <TabsTrigger 
                    value="pending" 
                    className="inline-flex items-center justify-center whitespace-nowrap rounded-lg px-6 py-2 text-xs font-bold uppercase tracking-wider transition-all data-[state=active]:bg-white data-[state=active]:text-brand-1 data-[state=active]:shadow-sm shrink-0"
                  >
                    Pending
                    {filteredPending.length > 0 && (
                      <Badge className="ml-2 bg-slate-200 text-slate-800 border-none h-5 px-1.5 text-[10px]">
                        {filteredPending.length}
                      </Badge>
                    )}
                  </TabsTrigger>
                  <TabsTrigger 
                    value="underReview"
                    className="inline-flex items-center justify-center whitespace-nowrap rounded-lg px-6 py-2 text-xs font-bold uppercase tracking-wider transition-all data-[state=active]:bg-white data-[state=active]:text-brand-1 data-[state=active]:shadow-sm shrink-0"
                  >
                    Under Review
                    {filteredUnderReview.length > 0 && (
                      <Badge className="ml-2 bg-blue-100 text-blue-800 border-none h-5 px-1.5 text-[10px]">
                        {filteredUnderReview.length}
                      </Badge>
                    )}
                  </TabsTrigger>
                  <TabsTrigger 
                    value="completed"
                    className="inline-flex items-center justify-center whitespace-nowrap rounded-lg px-6 py-2 text-xs font-bold uppercase tracking-wider transition-all data-[state=active]:bg-white data-[state=active]:text-brand-1 data-[state=active]:shadow-sm shrink-0"
                  >
                    Completed
                    {filteredCompleted.length > 0 && (
                      <Badge className="ml-2 bg-green-100 text-green-800 border-none h-5 px-1.5 text-[10px]">
                        {filteredCompleted.length}
                      </Badge>
                    )}
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            </div>

          </div>
        </CardHeader>
        <div className="px-6 pb-6 pt-2">
          {tabView === "pending" && (
            <div className="flex flex-col">
              <EcosystemApplicationTable
              data={tableDataPending}
              extraColumns={sharedExtraCols}
              emptyMessage="No pending assessments match the selected filters"
              hideStatusOnMobile
              className="border-0 shadow-none rounded-none"
              renderActions={(item) => (
                <div className="flex items-center justify-center gap-1.5">
                  <Button
                    size="sm"
                    className="bg-brand-1 hover:bg-brand-1/90 rounded-xl h-8 text-xs font-bold shadow-sm"
                    onClick={() => handleStartReview(item._raw)}
                    disabled={startingReview === item._raw.id}
                  >
                    {startingReview === item._raw.id ? (
                      <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                    ) : null}
                    Start Review
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-8 w-8 p-0 rounded-xl text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 border border-transparent hover:border-indigo-100"
                    onClick={() => handleInitiateChat(item._raw.id, "ecosystem")}
                    disabled={initiatingChat === item._raw.id}
                    title="Message Applicant"
                  >
                    {initiatingChat === item._raw.id ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <MessageCircle className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              )}
            />
            {renderPagination(filteredPending.length)}
            </div>
          )}

          {tabView === "underReview" && (
            <div className="flex flex-col">
              <EcosystemApplicationTable
              data={tableDataUnderReview}
              extraColumns={sharedExtraCols}
              emptyMessage="No assessments are currently under review"
              hideStatusOnMobile
              className="border-0 shadow-none rounded-none"
              renderActions={(item) => (
                <div className="flex items-center justify-center gap-1.5">
                  <Button size="sm" asChild className="rounded-xl h-8 bg-slate-800 hover:bg-slate-900 text-white shadow-sm font-bold text-xs">
                    <Link href={`/committee-portal/assessments/ecosystem/${item._raw.id}`}>
                      Continue
                    </Link>
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-8 w-8 p-0 rounded-xl text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 border border-transparent hover:border-indigo-100"
                    onClick={() => handleInitiateChat(item._raw.id, "ecosystem")}
                    disabled={initiatingChat === item._raw.id}
                    title="Message Applicant"
                  >
                    {initiatingChat === item._raw.id ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <MessageCircle className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              )}
            />
            {renderPagination(filteredUnderReview.length)}
            </div>
          )}

          {tabView === "completed" && (
            <div className="flex flex-col">
              <EcosystemApplicationTable
              data={tableDataCompleted}
              extraColumns={completedExtraCols}
              emptyMessage="No completed assessments match the selected filters"
              hideStatusOnMobile
              className="border-0 shadow-none rounded-none"
              renderActions={(item) => (
                <div className="flex items-center justify-center gap-1.5 whitespace-nowrap">
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-8 rounded-xl border-slate-200 text-xs font-bold"
                    onClick={() => handleSeeResult(item._raw.id, "ecosystem")}
                  >
                    See Result
                  </Button>
                  <Button variant="outline" size="sm" asChild className="h-8 rounded-xl border-slate-200 text-xs font-bold">
                    <Link href={`/committee-portal/assessments/ecosystem/${item._raw.id}`}>
                      View Request
                    </Link>
                  </Button>
                </div>
              )}
            />
            {renderPagination(filteredCompleted.length)}
            </div>
          )}

        </div>
      </Card>

      <AssessmentResultModal
        isOpen={isResultModalOpen}
        onClose={() => setIsResultModalOpen(false)}
        applicationId={selectedApplicationId || ""}
        entityType={selectedEntityType}
      />
    </div>
  );
}
