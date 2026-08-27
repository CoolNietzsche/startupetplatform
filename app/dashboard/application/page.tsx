"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  PlusIcon,
  Info,
  Download,
  Award,
  Edit,
  Clock,
  CheckCircle,
  AlertCircle,
  FileText,
  ClipboardCheck,
  Loader2,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { formatDistanceToNow, format } from "date-fns";

type PaginationMeta = {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
  hasMore: boolean;
};

type ApplicationRecord = Record<string, any>;

const DEFAULT_PAGE_SIZE = 10;
const PAGE_SIZE_OPTIONS = [10, 20, 30, 50, 100];

export default function ApplicationPage() {
  const [applications, setApplications] = useState<ApplicationRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("all");
  const [paginationMeta, setPaginationMeta] = useState<PaginationMeta>({
    page: 1,
    pageSize: DEFAULT_PAGE_SIZE,
    total: 0,
    totalPages: 1,
    hasMore: false,
  });
  const latestParamsRef = useRef({
    page: 1,
    pageSize: DEFAULT_PAGE_SIZE,
    tab: "all",
  });

  const fetchApplications = useCallback(
    async (
      page = latestParamsRef.current.page,
      pageSize = latestParamsRef.current.pageSize,
      tab = latestParamsRef.current.tab,
    ) => {
      try {
        setIsLoading(true);
        setError(null);
        latestParamsRef.current = { page, pageSize, tab };
        const params = new URLSearchParams({
          page: page.toString(),
          pageSize: pageSize.toString(),
          tab,
        });
        const response = await fetch(`/api/applications?${params.toString()}`);
        if (!response.ok) {
          throw new Error("Failed to fetch applications");
        }
        const body = await response.json();
        setApplications(body.data || []);
        setPaginationMeta((prev) => ({
          ...prev,
          ...(body.meta || {}),
        }));
      } catch (err: any) {
        console.error(err);
        setError(err.message || "Failed to fetch applications");
      } finally {
        setIsLoading(false);
      }
    },
    [],
  );

  useEffect(() => {
    fetchApplications(1, DEFAULT_PAGE_SIZE, activeTab);
  }, [fetchApplications, activeTab]);

  const handlePageChange = (page: number) => {
    fetchApplications(page, paginationMeta.pageSize, activeTab);
  };

  const handlePageSizeChange = (value: string) => {
    const nextSize = Number(value);
    if (Number.isNaN(nextSize)) return;
    fetchApplications(1, nextSize, activeTab);
  };

  function toDisplayStatus(status: string) {
    switch (status) {
      case "DRAFT":
        return {
          label: "Draft",
          badge: <Badge variant="outline" className="bg-brand-deep-dark/[0.04] text-brand-deep-dark/70 border-brand-deep-dark/10 font-semibold px-2.5 py-0.5 rounded-full text-[10px]">Draft</Badge>,
          icon: <FileText className="h-4 w-4 text-brand-deep-dark/70" />,
        };
      case "PENDING":
        return {
          label: "Pending",
          badge: <Badge variant="outline" className="bg-blue-50 text-blue-600 border-blue-200 font-semibold px-2.5 py-0.5 rounded-full text-[10px]">Pending</Badge>,
          icon: <Clock className="h-4 w-4 text-blue-600" />,
        };
      case "UNDER_REVIEW":
      case "REVIEWED":
      case "ASSIGNED_TO_COMMITTEE":
      case "IN_COMMITTEE_REVIEW":
      case "COMMITTEE_REVIEW_SUBMITTED":
        return {
          label: "Under Review",
          badge: <Badge variant="outline" className="bg-brand-startup-amber/10 text-brand-startup-amber border-brand-startup-amber/30 font-semibold px-2.5 py-0.5 rounded-full text-[10px]">Under Review</Badge>,
          icon: <Clock className="h-4 w-4 text-brand-startup-amber" />,
        };
      case "CERTIFIED":
        return {
          label: "Certified",
          badge: <Badge className="bg-emerald-600 text-white font-semibold px-2.5 py-0.5 rounded-full text-[10px] shadow-sm">Certified</Badge>,
          icon: <CheckCircle className="h-4 w-4 text-emerald-600" />,
        };
      case "REJECTED":
        return {
          label: "Rejected",
          badge: <Badge variant="destructive" className="font-semibold px-2.5 py-0.5 rounded-full text-[10px]">Rejected</Badge>,
          icon: <AlertCircle className="h-4 w-4 text-red-600" />,
        };
      case "ROLLED_BACK":
        return {
          label: "Action Required",
          badge: <Badge variant="outline" className="bg-orange-50 text-orange-600 border-orange-300 font-semibold px-2.5 py-0.5 rounded-full text-[10px]">Action Required</Badge>,
          icon: <AlertCircle className="h-4 w-4 text-orange-600" />,
        };
      default:
        return {
          label: status,
          badge: <Badge variant="outline" className="bg-brand-deep-dark/[0.04] text-brand-deep-dark/50 border-brand-deep-dark/10 font-semibold px-2.5 py-0.5 rounded-full text-[10px]">{status.replaceAll('_', ' ')}</Badge>,
          icon: <Info className="h-4 w-4 text-brand-deep-dark/70" />,
        };
    }
  }

  return (
    <div className="space-y-4 sm:space-y-6 w-full pt-3 sm:pt-6 pb-20">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 px-2 sm:px-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-brand-deep-dark">
          Applications
        </h1>
        <Button
          className="bg-brand-deep-dark hover:bg-brand-deep-dark/90 text-white shadow-lg rounded-xl px-6 h-11 font-semibold text-sm transition-all"
          asChild
        >
          <Link href="/dashboard/application/apply">
            <PlusIcon className="mr-2 h-4 w-4" /> New Application
          </Link>
        </Button>
      </div>

      <Card className="border-2 border-brand-deep-dark/5 rounded-2xl sm:rounded-[32px] shadow-sm mx-2 sm:mx-6">
        <CardHeader className="p-3 sm:p-6 pb-0">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-auto">
              <TabsList className="bg-brand-deep-dark/5 p-1 rounded-xl border border-brand-deep-dark/10">
                <TabsTrigger value="all" className="text-brand-deep-dark/80 data-[state=active]:bg-brand-deep-dark data-[state=active]:text-white rounded-lg font-medium text-xs px-3 sm:px-4 h-8">All</TabsTrigger>
                <TabsTrigger value="under_review" className="text-brand-deep-dark/80 data-[state=active]:bg-brand-deep-dark data-[state=active]:text-white rounded-lg font-medium text-xs px-3 sm:px-4 h-8">Review</TabsTrigger>
                <TabsTrigger value="completed" className="text-brand-deep-dark/80 data-[state=active]:bg-brand-deep-dark data-[state=active]:text-white rounded-lg font-medium text-xs px-3 sm:px-4 h-8">Complete</TabsTrigger>
                <TabsTrigger value="certified" className="text-brand-deep-dark/80 data-[state=active]:bg-brand-deep-dark data-[state=active]:text-white rounded-lg font-medium text-xs px-3 sm:px-4 h-8">Certified</TabsTrigger>
              </TabsList>
            </Tabs>
            <span className="text-xs text-brand-deep-dark/60 font-medium shrink-0">
              Total: <span className="text-brand-deep-dark font-bold">{paginationMeta.total}</span>
            </span>
          </div>
        </CardHeader>

        <CardContent className="p-3 sm:p-6">
          <div className="rounded-xl sm:rounded-2xl border border-brand-deep-dark/5 bg-white overflow-hidden">
            <div className="overflow-x-auto">
              <Table className="min-w-[600px]">
                <TableHeader className="bg-brand-deep-dark/[0.04] border-b border-brand-deep-dark/10">
                  <TableRow className="border-none hover:bg-transparent">
                    <TableHead className="py-3 sm:py-4 font-bold text-xs text-brand-deep-dark pl-4 sm:pl-6">Identity</TableHead>
                    <TableHead className="py-3 sm:py-4 font-bold text-xs text-brand-deep-dark hidden md:table-cell">Focus</TableHead>
                    <TableHead className="py-3 sm:py-4 font-bold text-xs text-brand-deep-dark">Category</TableHead>
                    <TableHead className="py-3 sm:py-4 font-bold text-xs text-brand-deep-dark">Status</TableHead>
                    <TableHead className="py-3 sm:py-4 font-bold text-xs text-brand-deep-dark hidden sm:table-cell">Filed On</TableHead>
                    <TableHead className="py-3 sm:py-4 font-bold text-xs text-brand-deep-dark text-right pr-4 sm:pr-6">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    Array.from({ length: 3 }).map((_, i) => (
                      <TableRow key={i} className="animate-pulse">
                        <TableCell colSpan={6} className="py-6 pl-6">
                          <div className="flex items-center gap-3">
                            <div className="h-9 w-9 rounded-lg bg-brand-deep-dark/[0.04]" />
                            <div className="h-4 bg-brand-deep-dark/[0.04] rounded w-40" />
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : error ? (
                    <TableRow>
                      <TableCell colSpan={6} className="h-80 text-center">
                        <div className="flex flex-col items-center justify-center gap-4">
                          <AlertCircle className="h-10 w-10 text-red-400" />
                          <p className="text-sm font-medium text-red-600">{error}</p>
                          <Button size="sm" variant="outline" onClick={() => fetchApplications()} className="rounded-xl">
                            Try Again
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : applications.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="h-80 text-center">
                        <div className="flex flex-col items-center justify-center gap-4">
                          <div className="h-16 w-16 rounded-2xl bg-brand-deep-dark/[0.08] flex items-center justify-center border-2 border-dashed border-brand-deep-dark/20">
                            <ClipboardCheck className="h-8 w-8 text-brand-deep-dark/50" />
                          </div>
                          <div>
                            <p className="font-semibold text-brand-deep-dark">No Applications Yet</p>
                            <p className="text-sm text-brand-deep-dark/70 mt-1">Start a new application to get certified.</p>
                          </div>
                          <Button asChild className="bg-brand-deep-dark hover:bg-brand-deep-dark/90 text-white rounded-xl h-11 px-8 text-sm font-semibold">
                            <Link href="/dashboard/application/apply">New Application</Link>
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : applications.map((app) => {
                    const display = toDisplayStatus(app.status);
                    return (
                      <TableRow key={app.id} className="hover:bg-brand-deep-dark/[0.04] transition-colors border-b border-brand-deep-dark/[0.06] last:border-0 group">
                        <TableCell className="py-3 sm:py-4 pl-4 sm:pl-6">
                          <div className="flex items-center gap-3">
                            <div className="h-9 w-9 rounded-lg bg-brand-deep-dark text-white flex items-center justify-center font-bold text-xs shadow-sm">
                              {app.startupName ? app.startupName[0].toUpperCase() : 'S'}
                            </div>
                            <div className="min-w-0">
                              <p className="font-semibold text-sm text-brand-deep-dark truncate max-w-[130px] sm:max-w-[200px]">{app.startupName || 'Unnamed'}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="hidden md:table-cell">
                          <span className="text-sm text-brand-deep-dark font-medium">{app.industry || 'General'}</span>
                        </TableCell>
                        <TableCell>
                          <span className="text-xs text-brand-deep-dark font-bold bg-brand-deep-dark/[0.08] px-2.5 py-1 rounded-lg">
                            {app.typeOfCompany || 'SEED'}
                          </span>
                        </TableCell>
                        <TableCell>
                          {display.badge}
                        </TableCell>
                        <TableCell className="hidden sm:table-cell">
                          <div className="flex flex-col">
                            <span className="text-sm text-brand-deep-dark font-medium">{format(new Date(app.createdAt), 'MMM dd, yyyy')}</span>
                            <span className="text-[10px] text-brand-deep-dark/60">{formatDistanceToNow(new Date(app.createdAt), { addSuffix: true })}</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-right pr-4 sm:pr-6">
                          <div className="flex justify-end gap-1">
                            <Button variant="ghost" size="icon" asChild className="h-8 w-8 rounded-lg hover:bg-brand-deep-dark/5 hover:text-brand-deep-dark">
                              <Link href={`/dashboard/application/${app.id}`}>
                                <Info className="h-4 w-4" />
                              </Link>
                            </Button>

                            {(app.status === 'DRAFT' || app.status === 'ROLLED_BACK') && (
                              <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg hover:bg-brand-startup-amber/10 hover:text-brand-startup-amber" asChild>
                                <Link href={`/dashboard/application/edit/${app.id}`}>
                                  <Edit className="h-4 w-4" />
                                </Link>
                              </Button>
                            )}

                            {app.status === 'CERTIFIED' && app.certificate && (
                              <>
                                <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg hover:bg-emerald-50 hover:text-emerald-600" asChild>
                                  <Link href="/dashboard/certifications">
                                    <Award className="h-4 w-4" />
                                  </Link>
                                </Button>
                                <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg hover:bg-emerald-50 hover:text-emerald-600 text-emerald-600" onClick={() => window.open(`/api/certificates/${app.certificate.id}/download`, '_blank')}>
                                  <Download className="h-4 w-4" />
                                </Button>
                              </>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          </div>

          {!isLoading && applications.length > 0 && (
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mt-6 px-2">
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-brand-deep-dark/60 font-medium">Show</span>
                  <Select value={paginationMeta.pageSize.toString()} onValueChange={handlePageSizeChange}>
                    <SelectTrigger className="h-8 w-16 rounded-lg border border-brand-deep-dark/20 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl border-brand-deep-dark/10">
                      {PAGE_SIZE_OPTIONS.map(opt => <SelectItem key={opt} value={opt.toString()} className="text-sm">{opt}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <span className="text-xs text-brand-deep-dark/60 font-medium">
                  {((paginationMeta.page - 1) * paginationMeta.pageSize) + 1}–{Math.min(paginationMeta.page * paginationMeta.pageSize, paginationMeta.total)} of {paginationMeta.total}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(paginationMeta.page - 1)}
                  disabled={paginationMeta.page === 1 || isLoading}
                  className="rounded-lg border-brand-deep-dark/10 h-9 px-4 text-xs font-medium"
                >
                  <ChevronLeft className="h-4 w-4 mr-1" /> Prev
                </Button>
                <span className="px-3 h-9 flex items-center rounded-lg bg-brand-deep-dark/5 text-xs font-medium text-brand-deep-dark">
                  {paginationMeta.page} / {paginationMeta.totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(paginationMeta.page + 1)}
                  disabled={paginationMeta.page === paginationMeta.totalPages || isLoading}
                  className="rounded-lg border-brand-deep-dark/10 h-9 px-4 text-xs font-medium"
                >
                  Next <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
