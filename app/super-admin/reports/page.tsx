"use client";

import React, { useEffect, useState, useCallback } from "react";
import {
  FileText,
  CheckCircle,
  XCircle,
  Trash2,
  Loader2,
  RefreshCw,
  Download,
  Eye,
  Search,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import {
  getReportSubmissions,
  approveReport,
  rejectReport,
  deleteReport,
  type ReportSubmissionItem,
  type ReportSubmissionsData,
} from "./actions";

const statusBadge = (status: string) => {
  switch (status) {
    case "SUBMITTED":
      return <Badge className="bg-blue-100 text-blue-700 border-blue-200"><FileText className="h-3 w-3 mr-1" />Submitted</Badge>;
    case "APPROVED":
      return <Badge className="bg-green-100 text-green-700 border-green-200"><CheckCircle className="h-3 w-3 mr-1" />Approved</Badge>;
    case "REJECTED":
      return <Badge className="bg-red-100 text-red-700 border-red-200"><XCircle className="h-3 w-3 mr-1" />Rejected</Badge>;
    default:
      return <Badge variant="outline">{status}</Badge>;
  }
};

const reportTypeLabel: Record<string, string> = {
  STARTUP_PROGRESS: "Startup Progress (Art. 19.5)",
  INCUBATION_PROGRESS: "Incubation Progress (Art. 20.5)",
  ECOSYSTEM_ANNUAL: "Ecosystem Annual (Art. 29.1)",
};

export default function SuperAdminReportsPage() {
  const [data, setData] = useState<ReportSubmissionsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterReportType, setFilterReportType] = useState("all");
  const [filterEntityType, setFilterEntityType] = useState("all");
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [selectedReport, setSelectedReport] = useState<ReportSubmissionItem | null>(null);
  const [showDetail, setShowDetail] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const filters: any = {};
      if (filterStatus !== "all") filters.status = filterStatus;
      if (filterReportType !== "all") filters.reportType = filterReportType;
      if (filterEntityType !== "all") filters.entityType = filterEntityType;
      const result = await getReportSubmissions(filters);
      setData(result);
    } catch (e: any) {
      toast.error(e.message || "Failed to load reports");
    } finally {
      setLoading(false);
    }
  }, [filterStatus, filterReportType, filterEntityType]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleApprove = async (id: string) => {
    setActionLoading(id);
    try {
      await approveReport(id);
      toast.success("Report approved");
      fetchData();
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (id: string) => {
    setActionLoading(id);
    try {
      await rejectReport(id);
      toast.success("Report rejected");
      fetchData();
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setActionLoading(null);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this report submission permanently?")) return;
    setActionLoading(id);
    try {
      await deleteReport(id);
      toast.success("Report deleted");
      fetchData();
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setActionLoading(null);
    }
  };

  const viewDetail = (item: ReportSubmissionItem) => {
    setSelectedReport(item);
    setShowDetail(true);
  };

  const filteredItems = data?.submissions ?? [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Report Submissions</h1>
          <p className="text-sm text-muted-foreground">
            Review and manage startup & ecosystem report submissions
          </p>
        </div>
        <Button variant="outline" onClick={fetchData} disabled={loading}>
          <RefreshCw className={`mr-2 h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>

      {/* Stats Cards */}
      {data && (
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-sm font-medium">Total</CardTitle></CardHeader>
            <CardContent><p className="text-3xl font-bold">{data.stats.total}</p></CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-sm font-medium">Submitted</CardTitle></CardHeader>
            <CardContent><p className="text-3xl font-bold text-blue-600">{data.stats.submitted}</p></CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-sm font-medium">Approved</CardTitle></CardHeader>
            <CardContent><p className="text-3xl font-bold text-green-600">{data.stats.approved}</p></CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-sm font-medium">Rejected</CardTitle></CardHeader>
            <CardContent><p className="text-3xl font-bold text-red-600">{data.stats.rejected}</p></CardContent>
          </Card>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-wrap gap-4">
        <div className="w-40">
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger><SelectValue placeholder="Status" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="SUBMITTED">Submitted</SelectItem>
              <SelectItem value="APPROVED">Approved</SelectItem>
              <SelectItem value="REJECTED">Rejected</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="w-56">
          <Select value={filterReportType} onValueChange={setFilterReportType}>
            <SelectTrigger><SelectValue placeholder="Report Type" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="STARTUP_PROGRESS">Startup Progress</SelectItem>
              <SelectItem value="INCUBATION_PROGRESS">Incubation Progress</SelectItem>
              <SelectItem value="ECOSYSTEM_ANNUAL">Ecosystem Annual</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="w-40">
          <Select value={filterEntityType} onValueChange={setFilterEntityType}>
            <SelectTrigger><SelectValue placeholder="Entity Type" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Entities</SelectItem>
              <SelectItem value="startup">Startup</SelectItem>
              <SelectItem value="ecosystem">Ecosystem</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Submissions Table */}
      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : filteredItems.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
              <FileText className="h-12 w-12 mb-4 opacity-30" />
              <p className="text-lg font-medium">No report submissions found</p>
              <p className="text-sm">Try adjusting your filters</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Entity</TableHead>
                  <TableHead>Report Type</TableHead>
                  <TableHead>Submitted By</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredItems.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium">{item.entityName}</TableCell>
                    <TableCell className="max-w-[200px] truncate" title={reportTypeLabel[item.reportType] || item.reportType}>
                      {reportTypeLabel[item.reportType] || item.reportType}
                    </TableCell>
                    <TableCell>{item.submittedBy?.name || item.submittedBy?.email || "—"}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {new Date(item.submittedAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell>{statusBadge(item.status)}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button variant="ghost" size="sm" onClick={() => viewDetail(item)}>
                          <Eye className="h-4 w-4" />
                        </Button>
                        {item.status === "SUBMITTED" && (
                          <>
                            <Button variant="ghost" size="sm" className="text-green-600" onClick={() => handleApprove(item.id)} disabled={actionLoading === item.id}>
                              <CheckCircle className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="sm" className="text-red-600" onClick={() => handleReject(item.id)} disabled={actionLoading === item.id}>
                              <XCircle className="h-4 w-4" />
                            </Button>
                          </>
                        )}
                        <Button variant="ghost" size="sm" className="text-destructive" onClick={() => handleDelete(item.id)} disabled={actionLoading === item.id}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Detail Dialog */}
      <Dialog open={showDetail} onOpenChange={setShowDetail}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Report Submission Details</DialogTitle>
            <DialogDescription>Full information about the submitted report</DialogDescription>
          </DialogHeader>
          {selectedReport && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Entity</p>
                  <p>{selectedReport.entityName}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Entity Type</p>
                  <p className="capitalize">{selectedReport.entityType}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Report Type</p>
                  <p>{reportTypeLabel[selectedReport.reportType] || selectedReport.reportType}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Status</p>
                  <p>{statusBadge(selectedReport.status)}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Submitted By</p>
                  <p>{selectedReport.submittedBy?.name || selectedReport.submittedBy?.email || "—"}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Submitted At</p>
                  <p>{new Date(selectedReport.submittedAt).toLocaleString()}</p>
                </div>
              </div>
              {selectedReport.notes && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Notes</p>
                  <p className="text-sm mt-1 bg-muted p-3 rounded-md">{selectedReport.notes}</p>
                </div>
              )}
              {selectedReport.fileIds.length > 0 && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Attached Files ({selectedReport.fileIds.length})</p>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {selectedReport.fileIds.map((fid, i) => (
                      <Badge key={i} variant="secondary">
                        <Download className="h-3 w-3 mr-1" />
                        File {i + 1}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
          <DialogFooter className="gap-2">
            {selectedReport?.status === "SUBMITTED" && (
              <>
                <Button variant="default" className="bg-green-600 hover:bg-green-700" onClick={() => { handleApprove(selectedReport.id); setShowDetail(false); }}>
                  <CheckCircle className="h-4 w-4 mr-1" /> Approve
                </Button>
                <Button variant="destructive" onClick={() => { handleReject(selectedReport.id); setShowDetail(false); }}>
                  <XCircle className="h-4 w-4 mr-1" /> Reject
                </Button>
              </>
            )}
            <Button variant="outline" onClick={() => setShowDetail(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
