"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ReviewActionDialog } from "@/components/super-admin/review-action-dialog";
import { getActionRequests, approveActionRequest, rejectActionRequest } from "./actions";
import { 
  Search, 
  Clock,
  CheckCircle,
  XCircle,
  Eye,
  FileText,
  Download,
  AlertTriangle,
  Shield,
  Loader2
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";

export default function ActionRequestsPage() {
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTab, setSelectedTab] = useState("pending");
  const [selectedPriority, setSelectedPriority] = useState("all");
  const [selectedType, setSelectedType] = useState("all");
  const [isReviewDialogOpen, setIsReviewDialogOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<any>(null);

  useEffect(() => {
    async function fetchRequests() {
      try {
        setLoading(true);
        const res = await getActionRequests();
        if (res.success) setRequests(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchRequests();
  }, []);

  const handleReviewClick = (request: any) => {
    setSelectedRequest(request);
    setIsReviewDialogOpen(true);
  };

  const handleApprove = async (notes: string) => {
    if (!selectedRequest) return;
    try {
      const res = await approveActionRequest(selectedRequest.id);
      if (res.success) {
        toast.success(res.message);
        setRequests(prev => prev.map(r => r.id === selectedRequest.id ? { ...r, status: "ACCEPTED" } : r));
      } else {
        toast.error(res.message);
      }
    } catch (err: any) {
      toast.error(err.message);
    }
    setIsReviewDialogOpen(false);
  };

  const handleReject = async (notes: string) => {
    if (!selectedRequest) return;
    try {
      const res = await rejectActionRequest(selectedRequest.id);
      if (res.success) {
        toast.success(res.message);
        setRequests(prev => prev.map(r => r.id === selectedRequest.id ? { ...r, status: "REJECTED" } : r));
      } else {
        toast.error(res.message);
      }
    } catch (err: any) {
      toast.error(err.message);
    }
    setIsReviewDialogOpen(false);
  };

  const filteredRequests = requests.filter(request => {
    const matchesSearch = request.entityName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         request.requestedBy?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = selectedTab === "all" || request.status === selectedTab;
    const matchesPriority = selectedPriority === "all" || request.priority === selectedPriority;
    const matchesType = selectedType === "all" || request.requestType === selectedType;
    
    return matchesSearch && matchesStatus && matchesPriority && matchesType;
  });

  const pendingCount = requests.filter(r => r.status === "pending").length;
  const approvedCount = requests.filter(r => r.status === "approved").length;
  const rejectedCount = requests.filter(r => r.status === "rejected").length;

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high": return "bg-red-100 text-red-800";
      case "medium": return "bg-orange-100 text-orange-800";
      case "low": return "bg-blue-100 text-blue-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getActionTypeColor = (type: string) => {
    return type === "revoke" ? "bg-red-100 text-red-800" : "bg-orange-100 text-orange-800";
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Action Requests</h1>
        <p className="text-muted-foreground">
          Review and manage suspension and revocation requests from admins
        </p>
      </div>

      {/* Statistics Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="border-l-4 border-l-orange-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Requests</CardTitle>
            <Clock className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingCount}</div>
            <p className="text-xs text-muted-foreground">
              Awaiting review
            </p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-green-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Approved</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{approvedCount}</div>
            <p className="text-xs text-muted-foreground">
              Actions executed
            </p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-gray-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Rejected</CardTitle>
            <XCircle className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{rejectedCount}</div>
            <p className="text-xs text-muted-foreground">
              Requests denied
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Tabs */}
      <Card>
        <CardHeader>
          <CardTitle>Requests Management</CardTitle>
          <CardDescription>Review suspension and revocation requests</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by entity or requester..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Select value={selectedType} onValueChange={setSelectedType}>
              <SelectTrigger className="w-full md:w-[180px]">
                <SelectValue placeholder="Action Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="suspend">Suspend</SelectItem>
                <SelectItem value="revoke">Revoke</SelectItem>
              </SelectContent>
            </Select>

            <Select value={selectedPriority} onValueChange={setSelectedPriority}>
              <SelectTrigger className="w-full md:w-[180px]">
                <SelectValue placeholder="Priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Priorities</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="low">Low</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Tabs value={selectedTab} onValueChange={setSelectedTab} className="space-y-4">
            <TabsList>
              <TabsTrigger value="pending">
                Pending ({pendingCount})
              </TabsTrigger>
              <TabsTrigger value="approved">
                Approved ({approvedCount})
              </TabsTrigger>
              <TabsTrigger value="rejected">
                Rejected ({rejectedCount})
              </TabsTrigger>
              <TabsTrigger value="all">
                All ({requests.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value={selectedTab} className="space-y-4">
              {filteredRequests.map((request) => (
                <Card key={request.id} className="border-2 hover:border-purple-200 transition-all">
                  <CardContent className="pt-6">
                    <div className="space-y-4">
                      {/* Header */}
                      <div className="flex items-start justify-between">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <h3 className="text-lg font-semibold">{request.entityName}</h3>
                            <Badge className={getActionTypeColor(request.requestType)}>
                              {request.requestType === "suspend" ? "Suspend" : "Revoke"}
                            </Badge>
                            <Badge variant="outline">{request.entityType}</Badge>
                            <Badge className={getPriorityColor(request.priority)}>
                              {request.priority} priority
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-500">
                            Requested by {request.requestedBy} ({request.requestedByRole}) • {new Date(request.requestDate).toLocaleDateString()}
                          </p>
                        </div>
                        {request.status === "pending" && (
                          <Button size="sm" className="bg-purple-600 hover:bg-purple-700" onClick={() => handleReviewClick(request)}>
                            <Eye className="mr-2 h-4 w-4" />
                            Review
                          </Button>
                        )}
                      </div>

                      {/* Reason */}
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <h4 className="font-semibold text-sm mb-2 flex items-center gap-2">
                          <AlertTriangle className="h-4 w-4" />
                          Reason
                        </h4>
                        <p className="text-sm font-medium mb-1">{request.reason}</p>
                        <p className="text-sm text-gray-600">{request.description}</p>
                      </div>

                      {/* Evidence */}
                      <div>
                        <h4 className="font-semibold text-sm mb-2 flex items-center gap-2">
                          <FileText className="h-4 w-4" />
                          Evidence
                        </h4>
                        <p className="text-sm text-gray-600 mb-2">{request.evidence}</p>
                        <div className="flex flex-wrap gap-2">
                          {request.documents.map((doc, index) => (
                            <div key={index} className="flex items-center gap-2 bg-white border rounded-lg px-3 py-2">
                              <FileText className="h-4 w-4 text-purple-500" />
                              <div>
                                <p className="text-sm font-medium">{doc.name}</p>
                                <p className="text-xs text-gray-500">{doc.size}</p>
                              </div>
                              <Button variant="ghost" size="sm">
                                <Download className="h-4 w-4" />
                              </Button>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Review Status */}
                      {request.status !== "pending" && (
                        <div className={`p-4 rounded-lg border-2 ${
                          request.status === "approved" 
                            ? "bg-green-50 border-green-200" 
                            : "bg-red-50 border-red-200"
                        }`}>
                          <div className="flex items-center gap-2 mb-2">
                            {request.status === "approved" ? (
                              <CheckCircle className="h-5 w-5 text-green-600" />
                            ) : (
                              <XCircle className="h-5 w-5 text-red-600" />
                            )}
                            <h4 className="font-semibold">
                              {request.status === "approved" ? "Approved" : "Rejected"}
                            </h4>
                          </div>
                          <p className="text-sm text-gray-600 mb-1">
                            Reviewed by {request.reviewedBy} on {new Date(request.reviewDate!).toLocaleDateString()}
                          </p>
                          <p className="text-sm font-medium">{request.reviewNotes}</p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}

              {filteredRequests.length === 0 && (
                <div className="text-center py-12">
                  <Shield className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">No requests found</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    Try adjusting your search or filter criteria
                  </p>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Review Action Dialog */}
      <ReviewActionDialog
        open={isReviewDialogOpen}
        onOpenChange={setIsReviewDialogOpen}
        request={selectedRequest}
        onApprove={handleApprove}
        onReject={handleReject}
      />
    </div>
  );
}
