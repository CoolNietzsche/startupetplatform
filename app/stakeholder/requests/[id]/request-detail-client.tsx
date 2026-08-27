"use client";

import React, { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { 
  FileText, 
  ExternalLink, 
  CheckCircle, 
  XCircle, 
  Clock, 
  Paperclip,
  User as UserIcon,
  Building2,
  AlertTriangle,
  Loader2,
  ArrowLeft,
  Calendar
} from "lucide-react";
import { toast } from "sonner";
import { updateRequestStatus } from "../actions";
import { FormalRequestStatus } from "@prisma/client";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function StakeholderRequestDetailClient({ request: initialRequest }: { request: any }) {
  const router = useRouter();
  const [request, setRequest] = useState(initialRequest);
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");
  const [actionLoading, setActionLoading] = useState(false);

  const handleStatusUpdate = async (status: FormalRequestStatus, reason?: string) => {
    setActionLoading(true);
    try {
      const res = await updateRequestStatus(request.id, status, reason);
      if (res.success) {
        toast.success(`Request ${status.toLowerCase()}ed successfully.`);
        setRequest({ ...request, status, rejectionReason: reason || null });
        setRejectDialogOpen(false);
        setRejectionReason("");
        router.refresh();
      } else {
        toast.error(res.message || "Failed to update status.");
      }
    } catch (err) {
      toast.error("An error occurred.");
    } finally {
      setActionLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "PENDING":
        return <Badge className="bg-amber-500 text-white border-transparent uppercase font-black text-[9px] tracking-widest px-3">Pending</Badge>;
      case "ACCEPTED":
        return <Badge className="bg-brand-mint-teal text-white border-transparent uppercase font-black text-[9px] tracking-widest px-3">Accepted</Badge>;
      case "REJECTED":
        return <Badge className="bg-rose-500 text-white border-transparent uppercase font-black text-[9px] tracking-widest px-3">Rejected</Badge>;
      case "CANCELLED":
        return <Badge className="bg-slate-500 text-white border-transparent uppercase font-black text-[9px] tracking-widest px-3">Cancelled</Badge>;
      default:
        return <Badge className="uppercase font-black text-[9px] tracking-widest px-3">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-20">
      {/* Detail Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div className="space-y-2">
          <Button variant="ghost" size="sm" asChild className="p-0 hover:bg-transparent -ml-1 h-auto text-slate-400 font-bold uppercase tracking-widest text-[10px] mb-2">
             <Link href="/stakeholder/requests" className="flex items-center gap-2">
                <ArrowLeft className="h-3.5 w-3.5" /> Back to Inbox
             </Link>
          </Button>
          <div className="flex items-center gap-3 mb-1">
             <h1 className="text-3xl font-black tracking-tighter text-brand-deep-dark">
               Review <span className="text-brand-mint-teal italic">Formal Request</span>
             </h1>
             {getStatusBadge(request.status)}
          </div>
          <p className="text-slate-500 font-bold text-sm tracking-tight flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            Received on {new Date(request.createdAt).toLocaleDateString(undefined, { dateStyle: 'long' })}
          </p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Review Content */}
        <div className="lg:col-span-2 space-y-6">
           {/* Message Content */}
           <Card className="border border-slate-200 shadow-xl shadow-slate-200/50 bg-white overflow-hidden">
             <CardHeader className="bg-slate-50/50 border-b border-slate-100">
               <CardTitle className="text-sm font-black text-brand-deep-dark uppercase tracking-widest">Formal Subject</CardTitle>
               <CardDescription className="text-lg font-black text-slate-800 leading-tight">
                 {request.subject}
               </CardDescription>
             </CardHeader>
             <CardContent className="pt-6">
               <div className="p-6 rounded-3xl bg-white border border-slate-100 text-slate-700 font-medium whitespace-pre-wrap leading-relaxed">
                 {request.body}
               </div>
             </CardContent>
           </Card>

           {/* Attachments */}
           {request.attachment && (
             <Card className="border border-slate-200 shadow-xl shadow-slate-200/50">
                <CardHeader className="pb-3 flex flex-row items-center justify-between">
                   <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400">Document Annex</h4>
                   <Badge variant="outline" className="text-[9px] uppercase font-black border-indigo-100 text-indigo-500 bg-indigo-50/30">Verified PDF</Badge>
                </CardHeader>
                <CardContent>
                   <Link 
                     href={`/api/files/download/${request.attachment.id}`} 
                     target="_blank"
                     className="flex items-center justify-between p-5 rounded-3xl border-2 border-indigo-50 bg-indigo-50/10 hover:bg-indigo-50/30 transition-all group"
                   >
                     <div className="flex items-center gap-4">
                       <div className="p-3 rounded-2xl bg-white text-indigo-600 shadow-sm group-hover:scale-110 transition-transform">
                         <Paperclip className="h-6 w-6" />
                       </div>
                       <div className="flex flex-col">
                          <span className="text-sm font-black text-slate-800">{request.attachment.originalName}</span>
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Supporting Evidence</span>
                       </div>
                     </div>
                     <ExternalLink className="h-5 w-5 text-indigo-200 group-hover:text-indigo-600" />
                   </Link>
                </CardContent>
             </Card>
           )}

           {/* Rejection Alert */}
           {request.status === "REJECTED" && request.rejectionReason && (
              <div className="p-6 rounded-3xl bg-rose-50 border border-rose-100 flex gap-4">
                 <AlertTriangle className="h-6 w-6 text-rose-500 shrink-0" />
                 <div className="space-y-1">
                    <p className="text-sm font-black text-rose-800 uppercase tracking-widest leading-none">Your Rejection Reason</p>
                    <p className="text-sm font-medium text-rose-700 italic">"{request.rejectionReason}"</p>
                 </div>
              </div>
           )}
        </div>

        {/* Action Sidebar */}
        <div className="space-y-6">
           <Card className="border border-slate-200 shadow-xl shadow-slate-200/50">
              <CardHeader className="pb-4">
                 <CardTitle className="text-xs font-black uppercase tracking-widest text-[#2c3e50]/50">Sent By</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                 <div className="flex items-center gap-4">
                    <div className="p-4 rounded-3xl bg-brand-mint-teal/10 text-brand-mint-teal">
                       <Building2 className="h-8 w-8" />
                    </div>
                    <div>
                       <h3 className="text-xl font-black text-brand-deep-dark tracking-tight leading-tight">{request.sender.name}</h3>
                       <p className="text-[10px] font-black text-brand-mint-teal uppercase tracking-widest">{request.sender.level || 'Official Ecosystem Startup'}</p>
                    </div>
                 </div>

                 <div className="space-y-3 pt-2">
                    <div className="flex items-center gap-3 text-sm font-medium text-slate-600">
                       <UserIcon className="h-4 w-4 text-slate-400" />
                       {request.sender.user.firstName} {request.sender.user.lastName}
                    </div>
                    <div className="flex items-center gap-3 text-sm font-medium text-slate-600">
                       <FileText className="h-4 w-4 text-slate-400" />
                       {request.sender.user.email}
                    </div>
                 </div>

                 <div className="pt-4 space-y-3">
                    <Button 
                      asChild 
                      variant="outline" 
                      className="w-full rounded-2xl h-12 border-slate-200 font-black text-[10px] uppercase tracking-widest hover:bg-brand-mint-teal hover:text-white hover:border-brand-mint-teal transition-all shadow-sm"
                    >
                       <Link href={`/stakeholder/applications/${request.sender.applicationId}`}>
                         View Startup Full Profile
                       </Link>
                    </Button>
                 </div>
              </CardContent>
           </Card>

           {request.status === "PENDING" && (
              <Card className="border border-brand-mint-teal/20 shadow-xl shadow-brand-mint-teal/5 bg-brand-mint-teal/[0.02]">
                 <CardHeader>
                    <CardTitle className="text-xs font-black uppercase tracking-widest text-brand-deep-dark">Decision Desk</CardTitle>
                 </CardHeader>
                 <CardContent className="space-y-3">
                    <Button 
                      onClick={() => handleStatusUpdate(FormalRequestStatus.ACCEPTED)} 
                      disabled={actionLoading}
                      className="w-full rounded-2xl h-14 bg-brand-mint-teal text-white hover:bg-brand-mint-teal/90 font-black text-xs uppercase tracking-widest shadow-xl shadow-brand-mint-teal/20"
                    >
                      {actionLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : (
                        <span className="flex items-center gap-2">
                          <CheckCircle className="h-5 w-5" /> Accept Request
                        </span>
                      )}
                    </Button>
                    <Button 
                      variant="outline"
                      onClick={() => setRejectDialogOpen(true)} 
                      disabled={actionLoading}
                      className="w-full rounded-2xl h-12 bg-white text-rose-600 hover:bg-rose-50 border-rose-100 font-black text-xs uppercase tracking-widest transition-all"
                    >
                      Reject Request
                    </Button>
                 </CardContent>
              </Card>
           )}
        </div>
      </div>

      {/* Rejection Dialog */}
      <Dialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
        <DialogContent className="sm:max-w-[450px] rounded-[32px] p-8 border-none shadow-2xl">
          <DialogHeader>
            <DialogTitle className="text-2xl font-black text-slate-800 flex items-center gap-3">
               <div className="p-2 rounded-xl bg-rose-50 text-rose-600">
                  <XCircle className="h-6 w-6" />
               </div>
               Reject Request
            </DialogTitle>
            <DialogDescription className="font-bold text-slate-400 uppercase tracking-widest text-[10px] mt-2">
               Provide a formal reason for this decision.
            </DialogDescription>
          </DialogHeader>
          <div className="py-6">
            <Textarea 
              placeholder="e.g. Requested resource is currently unavailable for this category..."
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              className="min-h-[140px] rounded-3xl border-slate-100 bg-slate-50 focus:ring-rose-500 transition-all resize-none font-medium p-5"
            />
          </div>
          <DialogFooter className="gap-3">
            <Button variant="ghost" onClick={() => setRejectDialogOpen(false)} className="rounded-2xl font-black text-xs uppercase tracking-widest text-slate-400">Cancel</Button>
            <Button 
              onClick={() => handleStatusUpdate(FormalRequestStatus.REJECTED, rejectionReason)}
              disabled={!rejectionReason.trim() || actionLoading}
              className="bg-rose-600 hover:bg-rose-700 text-white font-black uppercase tracking-widest rounded-2xl px-8 h-12 shadow-lg shadow-rose-600/20"
            >
              {actionLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Confirm Rejection"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
