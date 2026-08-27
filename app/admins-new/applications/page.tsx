"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  CalendarDays,
  AlertTriangle,
  RefreshCw,
  Building,
  MapPin,
  ChevronDown,
  UserCheck,
  FileCheck2,
  ShieldCheck,
  FileSearch,
  ClipboardCheck,
  Award,
  Loader2,
  UserPlus,
  Users,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  ArrowUp,
  Search,
  FileText,
  ArrowUpDown,
  Download,
  History,
  Trash2,
  Settings,
  MessageSquarePlus,
  MessageCircle,
} from "lucide-react";
import { setApplicationCertified } from "./application-actions";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  getAdminApplications,
  type AdminApplicationRow,
  type AdminApplicationStats,
  getAdminStats,
  deleteApplication,
} from "./application-actions";

import { StartupCertificateModal } from "./components/startup-certificate-modal";
import { AssignCommitteeModal } from "./components/AssignCommitteeModal";
import { CommitteeMemberViewModal } from "./components/CommitteeMemberViewModal";
import { StatusHistoryModal } from "./components/status-history-modal";
import { RevokeCertificateModal } from "./components/RevokeCertificateModal";
import { RequestClarificationModal } from "@/components/request-clarification-modal";
import { initAdminChatWithApplicant } from "@/lib/actions/communication";

const DEFAULT_STATS: AdminApplicationStats = {
  total: 0,
  pending: 0,
  approved: 0,
  rejected: 0,
  additional: 0,
  weeklyChange: 0,
};

type PaginationMeta = {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
  hasMore: boolean;
};

const DEFAULT_PAGINATION: PaginationMeta = {
  page: 1,
  pageSize: 6,
  total: 0,
  totalPages: 1,
  hasMore: false,
};

const PAGE_SIZE_OPTIONS = [6, 10, 20, 30, 50, 100];

const STATUS_TABS: Array<{ value: string; label: string }> = [
  { value: "all", label: "All" },
  { value: "PENDING", label: "Pending" },
  { value: "UNDER_REVIEW", label: "Under Review" },
  { value: "REVIEWED", label: "Reviewed" },
  { value: "IN_COMMITTEE", label: "In Committee" },
  { value: "CERTIFIED", label: "Certified" },
  { value: "REJECTED", label: "Rejected" },
];





function getWorkflowBadge(status: string) {
  switch (status) {
    case "CERTIFIED":
    case "Certified":
      return <Badge variant="success" className="font-medium bg-green-100 text-green-800 border-green-200">Certified</Badge>;
    case "PENDING":
    case "Pending Review":
      return <Badge variant="warning" className="font-medium bg-amber-100 text-amber-800 border-amber-200">Pending Review</Badge>;
    case "UNDER_REVIEW":
    case "Under Verification":
      return <Badge className="font-medium bg-blue-100 text-blue-800 border-blue-200">Under Review</Badge>;
    case "REVIEWED":
    case "Screening Passed":
      return <Badge className="font-medium bg-purple-100 text-purple-800 border-purple-200">Reviewed</Badge>;
    case "ASSIGNED_TO_COMMITTEE":
    case "Committee Assigned":
      return <Badge className="font-medium bg-indigo-100 text-indigo-800 border-indigo-200">In Committee</Badge>;
    case "IN_COMMITTEE_REVIEW":
    case "In Committee Review":
      return <Badge className="font-medium bg-cyan-100 text-cyan-800 border-cyan-200">Committee Reviewing</Badge>;
    case "COMMITTEE_REVIEW_SUBMITTED":
    case "Review Submitted":
      return <Badge className="font-medium bg-emerald-100 text-emerald-800 border-emerald-200">Review Submitted</Badge>;
    case "REJECTED":
    case "Rejected":
      return <Badge variant="destructive" className="font-medium">Rejected</Badge>;
    default:
      return (
        <Badge variant="outline" className="font-normal">
          {status.replace(/_/g, " ")}
        </Badge>
      );
  }
}

interface WorkflowAction {
  label: string;
  icon: any;
  color: string;
  type?: "clarify" | "chat" | "assign" | "certify" | "revoke" | "view_committee";
  href?: string;
}

function getWorkflowActions(app: AdminApplicationRow): WorkflowAction[] {
  const detailHref = `/admins-new/applications/${app.id}`;
  const clarifyAction: WorkflowAction = { label: "Request Clarification", type: "clarify", icon: MessageSquarePlus, color: "text-amber-600" };
  const chatAction: WorkflowAction = { label: "Direct Message", type: "chat", icon: MessageCircle, color: "text-indigo-600" };

  switch (app.rawStatus) {
    case "PENDING":
    case "UNDER_REVIEW":
      return [
        { label: "Review Application", href: detailHref, icon: FileSearch, color: "text-blue-500" },
        clarifyAction,
        chatAction,
      ] as WorkflowAction[];
    case "REVIEWED":
      return [
        { label: "Assign to Committee", type: "assign", icon: Users, color: "text-indigo-500" },
        clarifyAction,
        chatAction,
        { label: "View Details", href: detailHref, icon: Building, color: "text-slate-500" },
      ] as WorkflowAction[];
    case "ASSIGNED_TO_COMMITTEE":
    case "IN_COMMITTEE_REVIEW":
      return [
        { label: "See Committee Result", href: `/admins-new/applications/result/${app.id}`, icon: Users, color: "text-blue-500" },
        { label: "Manage Assignment", type: "assign", icon: UserCheck, color: "text-indigo-500" },
        clarifyAction,
        chatAction,
      ] as WorkflowAction[];
    case "COMMITTEE_REVIEW_SUBMITTED":
      return [
        { label: "View Committee Result", href: `/admins-new/applications/result/${app.id}`, icon: ClipboardCheck, color: "text-emerald-500" },
        { label: "Issue/Generate Certificate", type: "certify", icon: Award, color: "text-sky-600" },
        clarifyAction,
        chatAction,
        { label: "Reject", href: `${detailHref}?action=reject`, icon: AlertTriangle, color: "text-red-600" },
      ] as WorkflowAction[];
    case "CERTIFIED":
      return [
        { label: "View Certificate", href: `/admins-new/certificates/${app.id}`, icon: Award, color: "text-green-600" },
        { label: "Manage Certificate", type: "certify", icon: Settings, color: "text-sky-600" },
        { label: "Revoke Certificate", type: "revoke", icon: Trash2, color: "text-red-500" },
        { label: "View Committee Result", href: `/admins-new/applications/result/${app.id}`, icon: ClipboardCheck, color: "text-emerald-500" },
        clarifyAction,
        chatAction,
        { label: "View Details", href: detailHref, icon: Building, color: "text-slate-500" },
      ] as WorkflowAction[];
    default:
      return [
        { label: "View Details", href: detailHref, icon: Building, color: "text-slate-500" },
        clarifyAction,
        chatAction,
      ] as WorkflowAction[];
  }
}

export default function ApplicationsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [apps, setApps] = useState<AdminApplicationRow[]>([]);
  const [stats, setStats] = useState<AdminApplicationStats>(DEFAULT_STATS);
  const [pagination, setPagination] = useState({ total: 0, page: 1, pageSize: 10, totalPages: 1 });
  const [loading, setLoading] = useState(true);
  const [initiatingChat, setInitiatingChat] = useState<string | null>(null);

  const [assigningAppId, setAssigningAppId] = useState<string | null>(null);
  const [clarifyingAppId, setClarifyingAppId] = useState<string | null>(null);
  const [viewingApp, setViewingApp] = useState<{ id: string; name: string } | null>(null);

  const [showCertifyModal, setShowCertifyModal] = useState(false);
  const [selectedApplicationForCertify, setSelectedApplicationForCertify] = useState<AdminApplicationRow | null>(null);

  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [selectedApplicationForHistory, setSelectedApplicationForHistory] = useState<AdminApplicationRow | null>(null);

  const [appToRevoke, setAppToRevoke] = useState<AdminApplicationRow | null>(null);
  const [isRevoking, setIsRevoking] = useState(false);

  const router = useRouter();

  const fetchData = useCallback(async (page = pagination.page, pageSize = pagination.pageSize) => {
    setLoading(true);
    try {
      const [listRes, statsRes] = await Promise.all([
        getAdminApplications({
          search: searchQuery || undefined,
          status: statusFilter,
          type: typeFilter,
          page: page,
          pageSize: pageSize,
        }),
        getAdminStats(),
      ]);

      if (listRes.success) {
        setApps(listRes.data);
        setPagination(listRes.meta || { total: 0, page: 1, pageSize: 10, totalPages: 1 });
      } else {
        toast.error(listRes.message || "Failed to load applications");
      }

      if (statsRes.success) {
        setStats(statsRes.data);
      } else {
        toast.error(statsRes.message || "Failed to load stats");
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      toast.error("An unexpected error occurred while fetching data.");
    } finally {
      setLoading(false);
    }
  }, [searchQuery, statusFilter, typeFilter, pagination.page, pagination.pageSize]);

  useEffect(() => {
    fetchData(1, pagination.pageSize); // Reset to page 1 when filters change
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchQuery, statusFilter, typeFilter]);

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pagination.page, pagination.pageSize]);


  const handleManualRefresh = () => {
    fetchData(pagination.page, pagination.pageSize);
  };

  const handlePageChange = (direction: "prev" | "next") => {
    const nextPage =
      direction === "prev"
        ? Math.max(1, pagination.page - 1)
        : Math.min(pagination.totalPages, pagination.page + 1);
    if (nextPage === pagination.page) return;
    fetchData(nextPage, pagination.pageSize);
  };

  const handlePageSizeChange = (value: string) => {
    const size = Number(value);
    if (Number.isNaN(size)) return;
    fetchData(1, size);
  };

  const handleReview = (appId: string) => {
    router.push(`/admins-new/applications/${appId}`);
  };

  const handleInitiateChat = async (entityId: string, entityType: "startup" | "ecosystem") => {
    setInitiatingChat(entityId);
    try {
      const res = await initAdminChatWithApplicant(entityId, entityType);
      if (res.success && res.data?.conversationId) {
        router.push(`/admins-new/messages?conversationId=${res.data.conversationId}`);
      } else {
        toast.error(res.error || "Failed to initiate chat");
      }
    } catch (error: any) {
      toast.error("An error occurred while opening chat");
    } finally {
      setInitiatingChat(null);
    }
  };

  return (
    <div className="p-6 bg-gray-50">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Startup Applications</h1>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" onClick={handleManualRefresh} disabled={loading}>
            <RefreshCw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
        </div>
      </div>



      {/* Stats cards - Minimized */}
      <div className="flex flex-wrap gap-4 mb-6">
        <div className="flex items-center gap-3 bg-white px-4 py-3 rounded-xl border border-slate-200 shadow-sm min-w-[200px]">
          <div className="p-2 bg-indigo-50 rounded-lg">
            <Building className="h-5 w-5 text-indigo-600" />
          </div>
          <div>
            <p className="text-[11px] text-slate-500 font-bold uppercase tracking-wider">Total Apps</p>
            <p className="text-xl font-black text-slate-900">{stats.total}</p>
          </div>
        </div>

        <div className="flex items-center gap-3 bg-white px-4 py-3 rounded-xl border border-slate-200 shadow-sm min-w-[240px]">
          <div className="p-2 bg-emerald-50 rounded-lg">
            <Award className="h-5 w-5 text-emerald-600" />
          </div>
          <div>
            <p className="text-[11px] text-slate-500 font-bold uppercase tracking-wider">Certified</p>
            <div className="flex items-baseline gap-2">
              <p className="text-xl font-black text-slate-900">{stats.approved}</p>
              <p className="text-[10px] text-emerald-600 font-bold bg-emerald-50 px-1.5 py-0.5 rounded-md">
                {stats.total ? Math.round((stats.approved / stats.total) * 100) : 0}% of total
              </p>
            </div>
          </div>
        </div>
      </div>



      <div className="mb-6 space-y-4">
        {/* Filter controls */}
        <div className="flex flex-wrap gap-4">
          <div className="relative w-80">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search applications..."
              className="w-full bg-white pl-8"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-[200px] bg-white text-slate-700">
              <SelectValue placeholder="Filter by type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Company Stages</SelectItem>
              <SelectItem value="pvt">Private Limited</SelectItem>
              <SelectItem value="plc">Public Limited</SelectItem>
              <SelectItem value="sole">Sole Proprietorship</SelectItem>
              <SelectItem value="startup">Startup Entity</SelectItem>
            </SelectContent>
          </Select>

          <Select
            value={pagination.pageSize.toString()}
            onValueChange={handlePageSizeChange}
          >
            <SelectTrigger className="w-[140px] bg-white">
              <SelectValue placeholder="Items per page" />
            </SelectTrigger>
            <SelectContent>
              {PAGE_SIZE_OPTIONS.map((size) => (
                <SelectItem key={size} value={size.toString()}>
                  {size} per page
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Applications table */}
      <Card>
        <CardHeader>

          <Tabs value={statusFilter} onValueChange={(value) => setStatusFilter(value)}>
            <TabsList className="mt-4 w-full justify-start overflow-x-auto flex-nowrap h-11 bg-slate-100/50 p-1">
              {STATUS_TABS.map((tab) => (
                <TabsTrigger key={tab.value} value={tab.value} className="whitespace-nowrap px-4">
                  {tab.label}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="py-8 text-center text-muted-foreground">
              Loading applications...
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-muted-foreground text-xs font-semibold uppercase tracking-wider">
                  <th className="text-left pb-4 pl-4 font-medium text-slate-500 whitespace-nowrap">Organization</th>
                  <th className="text-left pb-4 font-medium text-slate-500 whitespace-nowrap">Industry</th>
                  <th className="text-left pb-4 font-medium text-slate-500 whitespace-nowrap">
                    <div className="flex items-center">
                      Location
                      <ArrowUpDown className="ml-1 h-3 w-3" />
                    </div>
                  </th>
                  <th className="text-center pb-4 font-medium text-slate-500 whitespace-nowrap">Status</th>
                  <th className="text-center pb-4 font-medium text-slate-500 whitespace-nowrap">Actions</th>
                </tr>
              </thead>
              <tbody>
                {apps.map((app: AdminApplicationRow) => (
                  <tr key={app.id} className="border-b group hover:bg-slate-50/80 transition-all duration-200">
                    <td className="py-4 pl-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div>
                          <div className="flex items-center gap-1.5 font-bold text-slate-900">
                            {app.name}
                            {app.rawStatus === "CERTIFIED" && (
                              <Award className="h-3.5 w-3.5 text-green-600" />
                            )}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 whitespace-nowrap">
                      <span className="font-medium text-slate-700">{app.category}</span>
                    </td>
                    <td className="py-4 whitespace-nowrap">
                      <div className="flex items-center text-slate-600">
                        <MapPin className="h-3.5 w-3.5 mr-1.5 text-slate-400" />
                        <span className="font-medium">{app.location || 'Addis Ababa'}</span>
                      </div>
                    </td>
                    <td className="py-4 whitespace-nowrap">
                      <div className="flex flex-row items-center justify-center gap-2">
                        {getWorkflowBadge(app.rawStatus)}
                      </div>
                    </td>
                    <td className="py-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-8 w-8 p-0 rounded-xl text-indigo-600 hover:text-indigo-700 hover:bg-white hover:border-slate-200 border border-transparent shadow-sm"
                          onClick={() => handleInitiateChat(app.id, (app.type as any) === "ecosystem" ? "ecosystem" : "startup")}
                          disabled={initiatingChat === app.id}
                        >
                          {initiatingChat === app.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <MessageCircle className="h-4 w-4" />}
                        </Button>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" className="hover:bg-white hover:shadow-sm border border-transparent hover:border-slate-200 h-8 font-bold text-slate-500 rounded-xl px-3 transition-all">
                              Actions <ChevronDown className="ml-1 h-3.5 w-3.5 text-slate-400" />
                            </Button>
                          </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-56">
                          <DropdownMenuItem asChild className="font-medium cursor-pointer">
                            <Link href={`/admins-new/applications/${app.id}`}>
                              <Building className="mr-2 h-4 w-4 text-slate-500" />
                              Profile View
                            </Link>
                          </DropdownMenuItem>

                          <DropdownMenuItem
                            onClick={() => {
                              setSelectedApplicationForHistory(app);
                              setShowHistoryModal(true);
                            }}
                            className="font-medium cursor-pointer"
                          >
                            <History className="mr-2 h-4 w-4" />
                            View History
                          </DropdownMenuItem>

                          {getWorkflowActions(app).map((action: WorkflowAction) => {
                            if (action.label === "View Details" || action.label === "Profile View") return null;

                            const Icon = (action as any).icon || Building;
                            const color = (action as any).color || "text-slate-500";

                            if (action.type === "assign") {
                              return (
                                <DropdownMenuItem 
                                  key={action.label}
                                  onClick={() => setAssigningAppId(app.id)}
                                  className="font-medium cursor-pointer"
                                >
                                  <Icon className={`mr-2 h-4 w-4 ${color}`} />
                                  {action.label}
                                </DropdownMenuItem>
                              );
                            }

                            if (action.type === "chat") {
                              return (
                                <DropdownMenuItem 
                                  key={action.label}
                                  onClick={() => handleInitiateChat(app.id, (app.type as any) === "ecosystem" ? "ecosystem" : "startup")}
                                  className="font-medium cursor-pointer"
                                >
                                  <Icon className={`mr-2 h-4 w-4 ${color}`} />
                                  {action.label}
                                </DropdownMenuItem>
                              );
                            }

                            if (action.type === "clarify") {
                              return (
                                <DropdownMenuItem 
                                  key={action.label}
                                  onClick={() => setClarifyingAppId(app.id)}
                                  className="font-medium cursor-pointer"
                                >
                                  <Icon className={`mr-2 h-4 w-4 ${color}`} />
                                  {action.label}
                                </DropdownMenuItem>
                              );
                            }

                            if (action.type === "view_committee") {
                              return (
                                <DropdownMenuItem
                                  key={action.label}
                                  onClick={() =>
                                    setViewingApp({ id: app.id, name: app.name })
                                  }
                                  className="font-medium cursor-pointer"
                                >
                                  <Icon className={`mr-2 h-4 w-4 ${color}`} />
                                  {action.label}
                                </DropdownMenuItem>
                              );
                            }

                            if (action.type === "revoke") {
                              return (
                                <DropdownMenuItem
                                  key={action.label}
                                  onClick={() => setAppToRevoke(app)}
                                  className="font-medium cursor-pointer text-red-600 hover:text-red-700 hover:bg-red-50"
                                >
                                  <Icon className={`mr-2 h-4 w-4 ${color}`} />
                                  {action.label}
                                </DropdownMenuItem>
                              );
                            }

                            if (action.type === "certify") {
                              return (
                                <DropdownMenuItem
                                  key={action.label}
                                  onClick={() => {
                                    setSelectedApplicationForCertify(app);
                                    setShowCertifyModal(true);
                                  }}
                                  className="font-medium cursor-pointer"
                                >
                                  <Icon className={`mr-2 h-4 w-4 ${color}`} />
                                  {action.label}
                                </DropdownMenuItem>
                              );
                            }

                            return (
                              <DropdownMenuItem 
                                key={action.label}
                                onClick={() => router.push(action.href as string)}
                                className="font-medium cursor-pointer"
                              >
                                <Icon className={`mr-2 h-4 w-4 ${color}`} />
                                {action.label}
                              </DropdownMenuItem>
                            );
                          })}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </td>
                  </tr>
                ))}
              </tbody>
            </table>
            </div>
          )}
        </CardContent>
        <CardFooter className="flex justify-between border-t border-slate-100 pt-6">
          <div className="text-sm text-slate-500">
            Showing <span className="font-bold text-slate-900">{apps.length}</span> of <span className="font-bold text-slate-900">{pagination.total}</span> startup applications
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange("prev")}
              disabled={pagination.page <= 1 || loading}
              className="bg-white border-slate-200 text-slate-600 hover:bg-slate-50 font-medium px-4"
            >
              Previous
            </Button>
            <div className="flex items-center justify-center px-4 h-9 rounded-md border border-slate-200 bg-white font-bold text-xs text-slate-900">
              PAGE {pagination.page} / {pagination.totalPages}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange("next")}
              disabled={
                pagination.page >= pagination.totalPages || loading
              }
              className="bg-white border-slate-200 text-slate-600 hover:bg-slate-50 font-medium px-4"
            >
              Next
            </Button>
          </div>
          <div className="text-xs font-bold text-slate-400 uppercase tracking-widest bg-slate-100 px-3 py-1.5 rounded-full">
            Filtered View
          </div>
        </CardFooter>
      </Card>

      {assigningAppId && (
        <AssignCommitteeModal 
          isOpen={!!assigningAppId}
          onOpenChange={(open) => !open && setAssigningAppId(null)}
          applicationId={assigningAppId}
          onSuccess={fetchData}
        />
      )}

      {viewingApp && (
        <CommitteeMemberViewModal 
          isOpen={!!viewingApp}
          onClose={() => setViewingApp(null)}
          application={viewingApp}
        />
      )}

      <StartupCertificateModal 
        isOpen={showCertifyModal}
        onClose={() => setShowCertifyModal(false)}
        application={selectedApplicationForCertify}
        onSuccess={fetchData}
      />

      <StatusHistoryModal 
        isOpen={showHistoryModal}
        onClose={() => setShowHistoryModal(false)}
        application={selectedApplicationForHistory}
      />

      <RevokeCertificateModal
        isOpen={!!appToRevoke}
        onClose={() => setAppToRevoke(null)}
        application={appToRevoke}
        onSuccess={fetchData}
      />

      {clarifyingAppId && (
        <RequestClarificationModal
          applicationId={clarifyingAppId}
          open={!!clarifyingAppId}
          onOpenChange={(open) => {
            if (!open) {
              setClarifyingAppId(null);
              fetchData(); // Refresh the table so the status updates to CLARIFICATION_REQUESTED
            }
          }}
        />
      )}
    </div>
  );
}
