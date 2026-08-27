"use client";

import React, { useEffect, useMemo, useState, useCallback } from 'react';
import Link from 'next/link';
import {
  Building,
  Search,
  MapPin,
  Users,
  Download,
  ChevronDown,
  ArrowUpDown,
  Award,
  Loader2,
  Trash,
  CheckCircle2,
  FileSearch,
  ClipboardCheck,
  UserCheck,
  FileCheck2,
  ShieldCheck,
  Clock3,
  AlertTriangle,
  RefreshCw,
  MessageCircle,
  MoreVertical,
} from 'lucide-react';
import { cn } from "@/lib/utils";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogTitle
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { CommitteeAssignmentModal } from "./components/committee-assignment-modal";
import { CommitteeMemberViewModal } from "./components/committee-member-view-modal";
import { EcosystemCertificateModal } from "./components/ecosystem-certificate-modal";
import {
  type EcosystemApplicationStatusFilter,
  deleteEcosystemBuilder,
  getEcosystemBuilders,
  getEcosystemStats,
  setEcosystemBuilderCertified,
} from "./ecosystem-actions";
import { initAdminChatWithApplicant } from "@/lib/actions/communication";
import {
  EcosystemApplicationTable,
  type EcosystemTableItem,
} from "@/components/ecosystem/shared";
const STATUS_TABS: Array<{ value: EcosystemApplicationStatusFilter; label: string }> = [
  { value: "all", label: "All" },
  { value: "PENDING", label: "Pending" },
  { value: "UNDER_REVIEW", label: "Under Review" },
  { value: "REVIEWED", label: "Reviewed" },
  { value: "ASSIGNED_TO_COMMITTEE", label: "Committee" },
  { value: "CERTIFIED", label: "Certified" },
  { value: "REJECTED", label: "Rejected" },
];


const PAGE_SIZE = 10;
const PAGE_SIZE_OPTIONS = [5, 10, 25, 50, 100] as const;



function getWorkflowBadge(workflowStatus: string) {
  const status = workflowStatus || "DRAFT";

  switch (status) {
    case "CERTIFIED":
      return <Badge variant="success" className="font-medium bg-green-100 text-green-800 border-green-200">Certified</Badge>;
    case "PENDING":
      return <Badge variant="warning" className="font-medium bg-amber-100 text-amber-800 border-amber-200">Pending Review</Badge>;
    case "UNDER_REVIEW":
      return <Badge className="font-medium bg-blue-100 text-blue-800 border-blue-200">Under Review</Badge>;
    case "REVIEWED":
      return <Badge className="font-medium bg-purple-100 text-purple-800 border-purple-200">Reviewed</Badge>;
    case "CLARIFICATION_REQUESTED":
      return <Badge variant="warning" className="font-medium bg-orange-100 text-orange-800 border-orange-200">Clarification</Badge>;
    case "ASSIGNED_TO_COMMITTEE":
      return <Badge className="font-medium bg-indigo-100 text-indigo-800 border-indigo-200">In Committee</Badge>;
    case "IN_COMMITTEE_REVIEW":
      return <Badge className="font-medium bg-cyan-100 text-cyan-800 border-cyan-200">Committee Reviewing</Badge>;
    case "COMMITTEE_REVIEW_SUBMITTED":
      return <Badge className="font-medium bg-emerald-100 text-emerald-800 border-emerald-200">Review Submitted</Badge>;
    case "REJECTED":
      return <Badge variant="destructive" className="font-medium">Rejected</Badge>;
    default:
      return (
        <Badge variant="outline" className="font-normal">
          {status.replace(/_/g, " ")}
        </Badge>
      );
  }
}

interface EcoWorkflowAction {
  label: string;
  href?: string;
  type?: "chat";
  icon?: any;
  color?: string;
}

function getWorkflowActions(builder: { id: string; applicationId: string; workflowStatus: string }): EcoWorkflowAction[] {
  const detailHref = `/admins-new/ecosystem/${builder.id}?applicationId=${builder.applicationId}`;
  const reviewHref = `/admins-new/ecosystem/review/${builder.applicationId}`;
  const workflowHref = `/admins-new/ecosystem/workflow?builderId=${builder.id}&applicationId=${builder.applicationId}`;
  const certificationHref = `/admins-new/ecosystem/${builder.id}?applicationId=${builder.applicationId}&tab=certification`;
  const chatAction: EcoWorkflowAction = { label: "Direct Message", type: "chat", icon: MessageCircle, color: "text-indigo-600" };

  switch (builder.workflowStatus) {
    case "PENDING":
    case "UNDER_REVIEW":
      return [
        { label: "Review Application", href: reviewHref },
        chatAction,
      ];
    case "REVIEWED":
      return [
        { label: "Assign to Committee", href: workflowHref },
        { label: "Manage Committee", href: workflowHref },
        chatAction,
      ];
    case "ASSIGNED_TO_COMMITTEE":
      return [
        { label: "View Application Detail", href: reviewHref },
        { label: "Manage Assignment", href: workflowHref },
        chatAction,
      ];
    case "IN_COMMITTEE_REVIEW":
      return [
        { label: "View Application Detail", href: reviewHref },
        { label: "See Committee List", href: workflowHref },
        chatAction,
      ];
    case "COMMITTEE_REVIEW_SUBMITTED":
      const resultHref = `/admins-new/ecosystem/result/${builder.applicationId}?builderId=${builder.id}`;
      return [
        { label: "View Application Detail", href: reviewHref },
        { label: "View Committee Result", href: resultHref },
        { label: "Issue/Generate Certificate", href: certificationHref },
        chatAction,
        { label: "Reject", href: `${detailHref}&action=reject` },
      ];
    case "CERTIFIED":
      const certViewHref = `/admins-new/certificates/${builder.applicationId}`;
      return [
        { label: "View Application Detail", href: reviewHref },
        { label: "See Certificate", href: certViewHref },
        { label: "Review Certificate", href: certViewHref },
        chatAction,
      ];
    case "REJECTED":
      return [
        { label: "View Application Detail", href: reviewHref },
        chatAction,
      ];
    default:
      return [];
  }
}

export default function EcosystemPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<EcosystemApplicationStatusFilter>('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [locationFilter, setLocationFilter] = useState('all');
  const [certifiedFilter, setCertifiedFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState<number>(PAGE_SIZE);
  const [loading, setLoading] = useState(true);
  const [initiatingChat, setInitiatingChat] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [builders, setBuilders] = useState<any[]>([]);
  const [pagination, setPagination] = useState({ total: 0, page: 1, pageSize: PAGE_SIZE, totalPages: 1 });
  const [stats, setStats] = useState<{ total: number; certified: number; pending: number }>({
    total: 0,
    certified: 0,
    pending: 0,
  });

  const [showFilters, setShowFilters] = useState(false);
  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (typeFilter !== 'all') count++;
    if (locationFilter !== 'all') count++;
    if (certifiedFilter !== 'all') count++;
    return count;
  }, [typeFilter, locationFilter, certifiedFilter]);

  const [showAssignmentModal, setShowAssignmentModal] = useState(false);
  const [selectedApplicationForAssignment, setSelectedApplicationForAssignment] = useState<{ id: string; name: string } | null>(null);

  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedApplicationForView, setSelectedApplicationForView] = useState<{ id: string; name: string } | null>(null);

  const [showCertifyModal, setShowCertifyModal] = useState(false);
  const [selectedBuilderForCertify, setSelectedBuilderForCertify] = useState<any | null>(null);
  const [isCertifying, setIsCertifying] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [listRes, statsRes] = await Promise.all([
        getEcosystemBuilders({
          search: searchQuery,
          status: statusFilter,
          type: typeFilter as any,
          location: locationFilter as any,
          certified: certifiedFilter as any,
          page: currentPage,
          pageSize,
        }),
        getEcosystemStats(),
      ]);

      if (!listRes.success) {
        toast.error(listRes.message || "Failed to fetch ecosystem builders");
        setBuilders([]);
        setPagination({ total: 0, page: 1, pageSize, totalPages: 1 });
      } else {
        setBuilders(listRes.data as any);
        setPagination((listRes as any).meta ?? { total: 0, page: 1, pageSize, totalPages: 1 });
      }

      if (statsRes.success) {
        setStats(statsRes.data as any);
      }
    } finally {
      setLoading(false);
    }
  }, [searchQuery, statusFilter, typeFilter, locationFilter, certifiedFilter, currentPage, pageSize]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, statusFilter, typeFilter, locationFilter, certifiedFilter, pageSize]);

  const filteredBuilders = useMemo(() => builders, [builders]);

  const typeStats = useMemo(() => {
    const map: Record<string, number> = {};
    for (const b of builders) {
      map[b.type] = (map[b.type] || 0) + 1;
    }
    return map;
  }, [builders]);

  const regionStats = useMemo(() => {
    const map: Record<string, number> = {};
    for (const b of builders) {
      map[b.region] = (map[b.region] || 0) + 1;
    }
    return map;
  }, [builders]);

  // ── Map Admin Builders to Shared Table Item ──
  const tableData: EcosystemTableItem[] = useMemo(
    () =>
      builders.map((builder) => ({
        id: builder.id,
        applicationId: builder.applicationId,
        name: builder.name,
        type: builder.type,
        location: builder.location,
        region: builder.region,
        status: builder.status,
        workflowStatus: builder.workflowStatus,
        certified: builder.certified,
        website: builder.website ?? undefined,
        established: builder.established ?? undefined,
        capacity: builder.capacity ?? undefined,
        services: builder.services || [],
        createdAt: builder.createdAt ? new Date(builder.createdAt) : undefined,
        showReadyIndicator: builder.workflowStatus === "COMMITTEE_REVIEW_SUBMITTED" && !builder.certified,
      })),
    [builders]
  );

  const handleInitiateChat = async (entityId: string, entityType: "startup" | "ecosystem") => {
    setInitiatingChat(entityId);
    try {
      const res = await initAdminChatWithApplicant(entityId, entityType);
      const router = (window as any).nextRouter || { push: (url: string) => window.location.href = url };

      if (res.success && res.data?.conversationId) {
        // Fallback for router if not using useRouter()
        window.location.href = `/admins-new/messages?conversationId=${res.data.conversationId}`;
      } else {
        toast.error(res.error || "Failed to initiate chat");
      }
    } catch (error: any) {
      toast.error("An error occurred while opening chat");
    } finally {
      setInitiatingChat(null);
    }
  };

  const handleExportCSV = () => {
    if (!builders.length) {
      toast.error("No data available to export");
      return;
    }

    const headers = ["Name", "Org Type", "Location", "Region", "Status", "Workflow Status", "Certified", "Joined At"];
    const csvContent = [
      headers.join(","),
      ...builders.map(b => [
        `"${b.name || ''}"`,
        `"${b.type || ''}"`,
        `"${b.location || ''}"`,
        `"${b.region || ''}"`,
        `"${b.status || ''}"`,
        `"${b.workflowStatus || ''}"`,
        b.certified ? "YES" : "NO",
        b.createdAt ? new Date(b.createdAt).toLocaleDateString() : ""
      ].join(","))
    ].join("\n");

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `ecosystem-builders-export-${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("CSV Export starting...");
  };

  return (
    <div className="pt-4 px-6 pb-6 bg-gray-50">
      {/* Ecosystem applications table with Integrated Filter Command Bar */}
      <Card className="border-none shadow-xl bg-white rounded-3xl overflow-hidden">
        <CardHeader className="p-6 space-y-6 bg-slate-50/30 border-b border-slate-100">
          <div className="flex flex-col gap-6">
            
            {/* Integrated Header Row (Title + Command Bar) */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              <div className="shrink-0">
                <h1 className="text-xl font-bold tracking-tight text-slate-800">Ecosystem Applications</h1>
              </div>

              {/* Integrated Command Bar (Search + Detailed Filters + Export) */}
              <div className="flex-grow max-w-4xl">
                <div className="space-y-2">
                  <div className="flex flex-col md:flex-row gap-2 items-stretch md:items-end lg:justify-end">
                    {/* Search Bar - High Focus */}
                    <div className="relative flex-grow max-w-md group transition-all">
                      <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-brand-1 transition-colors" />
                      <Input
                        type="search"
                        placeholder="Search registry..."
                        className="w-full bg-white pl-10 h-10 border-slate-200 focus:border-brand-1 rounded-2xl shadow-sm transition-all text-sm font-medium"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                      />
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <Button 
                        onClick={() => setShowFilters(!showFilters)}
                        variant={showFilters || activeFilterCount > 0 ? "secondary" : "outline"}
                        className={cn(
                          "h-10 px-4 rounded-2xl font-bold text-xs uppercase tracking-widest border border-slate-200 shadow-sm transition-all whitespace-nowrap",
                          (showFilters || activeFilterCount > 0) && "bg-brand-1/10 text-brand-1 border-brand-1/20"
                        )}
                      >
                        <Users className="mr-2 h-4 w-4" />
                        Filters
                        {activeFilterCount > 0 && (
                          <Badge className="ml-2 bg-brand-1 text-white hover:bg-brand-1 border-none h-5 px-1.5 text-[10px] min-w-5 justify-center">
                            {activeFilterCount}
                          </Badge>
                        )}
                        <ChevronDown className={cn("ml-2 h-4 w-4 transition-transform", showFilters && "rotate-180")} />
                      </Button>

                      <Button 
                        onClick={handleExportCSV}
                        variant="outline" 
                        className="h-10 px-4 rounded-2xl border-slate-200 text-slate-700 font-bold shadow-sm hover:bg-slate-50 hidden sm:flex"
                      >
                        <Download className="mr-2 h-4 w-4 text-slate-400" />
                        Export
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Expandable Advanced Filters (Inline) */}
            {showFilters && (

                <div className="p-4 bg-white border border-brand-1/10 rounded-2xl shadow-md animate-in slide-in-from-top-4 duration-300">
                  <div className="flex flex-col sm:flex-row flex-wrap items-center gap-4">
                    <div className="flex items-center gap-1 px-3 py-1.5 bg-slate-50 rounded-xl border border-slate-100">
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mr-2 text-nowrap">Org Type:</span>
                      <Select value={typeFilter} onValueChange={setTypeFilter}>
                        <SelectTrigger className="h-8 w-[140px] bg-white border-none shadow-none text-xs font-bold rounded-lg focus:ring-1 focus:ring-brand-1">
                          <SelectValue placeholder="All Types" />
                        </SelectTrigger>
                        <SelectContent className="rounded-xl border border-slate-100 shadow-xl bg-white z-[100]">
                          <SelectItem value="all">All Types</SelectItem>
                          <SelectItem value="co-working space">Co-working Space</SelectItem>
                          <SelectItem value="accelerator">Accelerator</SelectItem>
                          <SelectItem value="incubator">Incubator</SelectItem>
                          <SelectItem value="venture capital">Venture Capital</SelectItem>
                          <SelectItem value="angel investor">Angel Investor</SelectItem>
                          <SelectItem value="training provider">Training Provider</SelectItem>
                          <SelectItem value="tech park">Tech Park</SelectItem>
                          <SelectItem value="innovation hub">Innovation Hub</SelectItem>
                          <SelectItem value="entrepreneurship center">Entrepreneurship Center</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="flex items-center gap-1 px-3 py-1.5 bg-slate-50 rounded-xl border border-slate-100">
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mr-2 text-nowrap">Location:</span>
                      <Select value={locationFilter} onValueChange={setLocationFilter}>
                        <SelectTrigger className="h-8 w-[140px] bg-white border-none shadow-none text-xs font-bold rounded-lg focus:ring-1 focus:ring-brand-1">
                          <SelectValue placeholder="All Locations" />
                        </SelectTrigger>
                        <SelectContent className="rounded-xl border border-slate-100 shadow-xl bg-white z-[100]">
                          <SelectItem value="all">All Locations</SelectItem>
                          <SelectItem value="Addis Ababa">Addis Ababa</SelectItem>
                          <SelectItem value="Hawassa">Hawassa</SelectItem>
                          <SelectItem value="Adama">Adama</SelectItem>
                          <SelectItem value="Bahir Dar">Bahir Dar</SelectItem>
                          <SelectItem value="Mekelle">Mekelle</SelectItem>
                          <SelectItem value="Dire Dawa">Dire Dawa</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="flex items-center gap-1 px-3 py-1.5 bg-slate-50 rounded-xl border border-slate-100">
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mr-2 text-nowrap">Status:</span>
                      <Select value={certifiedFilter} onValueChange={setCertifiedFilter}>
                        <SelectTrigger className="h-8 w-[140px] bg-white border-none shadow-none text-xs font-bold rounded-lg focus:ring-1 focus:ring-brand-1">
                          <SelectValue placeholder="All Status" />
                        </SelectTrigger>
                        <SelectContent className="rounded-xl border border-slate-100 shadow-xl bg-white z-[100]">
                          <SelectItem value="all">Any Status</SelectItem>
                          <SelectItem value="certified">Certified Only</SelectItem>
                          <SelectItem value="pending">Not Certified</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="flex items-center gap-2 ml-auto">
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => {
                          setSearchQuery('');
                          setTypeFilter('all');
                          setLocationFilter('all');
                          setCertifiedFilter('all');
                        }}
                        className="h-8 text-xs font-bold text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl"
                      >
                        <RefreshCw className="mr-2 h-3 w-3" />
                        Clear All
                      </Button>
                    </div>
                  </div>
                </div>
              )}

            {/* Stage Tabs (Status) */}
            <div className="w-full overflow-x-auto scrollbar-hide">
              <Tabs 
                value={statusFilter} 
                onValueChange={(value) => setStatusFilter(value as any)}
                className="w-full"
              >
                <TabsList className="inline-flex h-11 items-center justify-start rounded-xl bg-slate-100 p-1 text-slate-500 border border-slate-200/60 min-w-full">
                  {STATUS_TABS.map((tab) => (
                    <TabsTrigger 
                      key={tab.value} 
                      value={tab.value} 
                      className="inline-flex items-center justify-center whitespace-nowrap rounded-lg px-6 py-2 text-xs font-bold uppercase tracking-wider transition-all data-[state=active]:bg-white data-[state=active]:text-brand-1 data-[state=active]:shadow-sm shrink-0"
                    >
                      {tab.label}
                    </TabsTrigger>
                  ))}
                </TabsList>
              </Tabs>
            </div>
          </div>
        </CardHeader>
        <CardContent className="px-6 pb-6 pt-0">
          <EcosystemApplicationTable
            data={tableData}
            showProfileView={true}
            extraColumns={[
              {
                header: "Est. Year",
                cell: (item) => item.established || "—",
                className: "hidden xl:table-cell",
              },
              {
                header: "Capacity",
                cell: (item) => item.capacity || "—",
                className: "hidden 2xl:table-cell",
              },
              {
                header: "Services",
                cell: (item) => item.services?.length || 0,
                className: "hidden xl:table-cell text-center",
              },
            ]}
            renderActions={(item) => (
              <div className="flex items-center justify-center gap-1.5">
                {/* Desktop Actions */}
                <div className="hidden md:flex items-center gap-1.5">
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-8 w-8 p-0 rounded-xl text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 border border-transparent hover:border-indigo-100 shadow-sm transition-all"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleInitiateChat(item.applicationId!, "ecosystem");
                    }}
                    disabled={initiatingChat === item.applicationId}
                  >
                    {initiatingChat === item.applicationId ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <MessageCircle className="h-4 w-4" />
                    )}
                  </Button>

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                      <Button variant="outline" size="sm" className="h-8 px-3 rounded-lg border-slate-200 hover:border-slate-300 font-semibold text-slate-700">
                        Manage <ChevronDown className="ml-1 h-3 w-3 opacity-50" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-56 p-1 rounded-xl shadow-xl border border-slate-100 bg-white z-[100]">
                      <DropdownMenuItem asChild>
                        <Link href={`/admins-new/ecosystem/${item.id}?applicationId=${item.applicationId}`}>
                          <UserCheck className="mr-2 h-4 w-4 text-slate-500" />
                          Complete Profile
                        </Link>
                      </DropdownMenuItem>
                      
                      {getWorkflowActions({ id: item.id, applicationId: item.applicationId!, workflowStatus: item.workflowStatus! }).map((action) => {
                         const isAssignAction = action.label === "Assign to Committee";
                         const isViewCommitteeAction = action.label === "Manage Assignment" || action.label === "Manage Committee" || action.label === "See Committee List";
                         const isIssueCertificateAction = action.label === "Issue Certificate" || action.label === "Issue/Generate Certificate";

                         if (isAssignAction) {
                            return (
                                <DropdownMenuItem
                                    key={action.label}
                                    className="cursor-pointer font-medium"
                                    onClick={() => {
                                        setSelectedApplicationForAssignment({ id: item.applicationId!, name: item.name });
                                        setShowAssignmentModal(true);
                                    }}
                                >
                                    <Users className="mr-2 h-4 w-4 text-primary" />
                                    {action.label}
                                </DropdownMenuItem>
                            );
                         }

                         if (isViewCommitteeAction) {
                            return (
                                <DropdownMenuItem
                                    key={action.label}
                                    className="cursor-pointer font-medium"
                                    onClick={() => {
                                        setSelectedApplicationForView({ id: item.applicationId!, name: item.name });
                                        setShowViewModal(true);
                                    }}
                                >
                                    <Users className="mr-2 h-4 w-4 text-indigo-500" />
                                    {action.label}
                                </DropdownMenuItem>
                            );
                         }

                         if (isIssueCertificateAction) {
                            if (item.certified) {
                                return (
                                    <DropdownMenuItem key="view-cert" asChild className="font-medium text-green-600">
                                        <Link href={`/admins-new/certifications?search=${item.name}`}>
                                            <Award className="mr-2 h-4 w-4" />
                                            View Certificate
                                        </Link>
                                    </DropdownMenuItem>
                                );
                            }
                            return (
                                <DropdownMenuItem
                                    key={action.label}
                                    className="cursor-pointer font-medium text-blue-600 bg-blue-50/50"
                                    onClick={() => {
                                        setSelectedBuilderForCertify(item);
                                        setShowCertifyModal(true);
                                    }}
                                >
                                    <Award className="mr-2 h-4 w-4" />
                                    {action.label}
                                </DropdownMenuItem>
                            );
                         }

                         if (action.type === "chat") {
                           return (
                             <DropdownMenuItem
                               key={action.label}
                               className="cursor-pointer font-medium text-indigo-600"
                               onClick={() => handleInitiateChat(item.applicationId!, "ecosystem")}
                             >
                               <MessageCircle className="mr-2 h-4 w-4" />
                               {action.label}
                             </DropdownMenuItem>
                           );
                         }

                         return (
                            <DropdownMenuItem key={action.label} asChild className="font-medium">
                                <Link href={action.href! || "#"}>
                                    {action.icon ? <action.icon className={cn("mr-2 h-4 w-4", action.color)} /> : <Building className="mr-2 h-4 w-4 text-slate-500" />}
                                    {action.label}
                                </Link>
                            </DropdownMenuItem>
                         );
                      })}

                      <Separator className="my-1 opacity-50" />
                      <DropdownMenuItem
                        className="cursor-pointer text-red-600 font-medium hover:bg-red-50"
                        onClick={async () => {
                          setDeletingId(item.id);
                          try {
                            const res = await deleteEcosystemBuilder(item.id);
                            if (!res.success) {
                              toast.error(res.message || "Failed to delete");
                              return;
                            }
                            toast.success("Organization Archived");
                            await fetchData();
                          } finally {
                            setDeletingId(null);
                          }
                        }}
                      >
                        {deletingId === item.id ? (
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ) : (
                          <Trash className="mr-2 h-4 w-4" />
                        )}
                        Archive Org
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                {/* Mobile Tablet Action Dropdown */}
                <div className="md:hidden">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                      <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full hover:bg-slate-100">
                        <MoreVertical className="h-4 w-4 text-slate-500" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-52 p-1 rounded-xl shadow-xl bg-white border border-slate-100 z-[100]">
                       <DropdownMenuItem onClick={() => handleInitiateChat(item.applicationId!, "ecosystem")} className="font-medium text-indigo-600">
                          <MessageCircle className="mr-2 h-4 w-4" />
                          Send Message
                       </DropdownMenuItem>
                       <DropdownMenuItem asChild className="font-medium">
                          <Link href={`/admins-new/ecosystem/${item.id}?applicationId=${item.applicationId}`}>
                            <Users className="mr-2 h-4 w-4" />
                            Profile View
                          </Link>
                       </DropdownMenuItem>
                       {getWorkflowActions({ id: item.id, applicationId: item.applicationId!, workflowStatus: item.workflowStatus! }).map((action) => {
                          if (action.type === "chat") {
                             return (
                                <DropdownMenuItem 
                                  key={action.label} 
                                  onClick={() => handleInitiateChat(item.applicationId!, "ecosystem")} 
                                  className="font-medium text-indigo-600"
                                >
                                   <MessageCircle className="mr-2 h-4 w-4" />
                                   {action.label}
                                </DropdownMenuItem>
                             );
                          }
                          return (
                            <DropdownMenuItem key={action.label} asChild className="font-medium">
                               <Link href={action.href! || "#"}>
                                 {action.icon ? <action.icon className="mr-2 h-4 w-4" /> : <Building className="mr-2 h-4 w-4" />}
                                 {action.label}
                               </Link>
                            </DropdownMenuItem>
                          );
                       })}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            )}
          />
        </CardContent>
        <CardFooter className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 bg-white border-t rounded-b-xl mt-0">
          <div className="flex items-center gap-4 order-2 sm:order-1">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-widest whitespace-nowrap">Show:</span>
              <Select
                value={pageSize.toString()}
                onValueChange={(val) => setPageSize(parseInt(val))}
              >
                <SelectTrigger className="h-8 w-[75px] bg-slate-50 border-none font-bold text-slate-700">
                  <SelectValue placeholder={pageSize.toString()} />
                </SelectTrigger>
                <SelectContent className="bg-white border border-slate-100">
                  {PAGE_SIZE_OPTIONS.map((size) => (
                    <SelectItem key={size} value={size.toString()}>
                      {size}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="text-xs font-medium text-slate-500">
              Showing <span className="font-bold text-slate-900">{(currentPage - 1) * pageSize + 1}</span>
              {" "}-{" "}
              <span className="font-bold text-slate-900">{Math.min(pagination.total, currentPage * pageSize)}</span>
              {" "}of{" "}
              <span className="font-bold text-slate-900">{pagination.total}</span>
            </div>
          </div>

          <div className="flex items-center gap-2 order-1 sm:order-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1 || loading}
              className="h-8 px-3 rounded-lg border-slate-200 font-semibold"
            >
              Previous
            </Button>
            
            <div className="flex items-center gap-1">
              <Badge variant="secondary" className="h-8 px-3 rounded-lg bg-slate-100 text-slate-900 font-bold border-none">
                {currentPage} / {pagination.totalPages}
              </Badge>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((p) => Math.min(pagination.totalPages, p + 1))}
              disabled={currentPage === pagination.totalPages || loading}
              className="h-8 px-3 rounded-lg border-slate-200 font-semibold"
            >
              Next
            </Button>
          </div>
        </CardFooter>
      </Card>

      <CommitteeAssignmentModal
        isOpen={showAssignmentModal}
        onClose={() => setShowAssignmentModal(false)}
        application={selectedApplicationForAssignment}
        onSuccess={fetchData}
      />

      <CommitteeMemberViewModal
        isOpen={showViewModal}
        onClose={() => setShowViewModal(false)}
        application={selectedApplicationForView}
      />

      <EcosystemCertificateModal
        isOpen={showCertifyModal}
        onClose={() => setShowCertifyModal(false)}
        builder={selectedBuilderForCertify}
        ecoApplicationId={selectedBuilderForCertify?.applicationId}
        onSuccess={fetchData}
      />
    </div>
  );
}
