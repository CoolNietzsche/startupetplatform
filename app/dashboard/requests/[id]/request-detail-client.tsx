"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { 
  ArrowLeft, 
  Building2, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  Paperclip, 
  ExternalLink,
  Edit3,
  Trash2,
  Loader2,
  Send,
  AlertTriangle
} from "lucide-react";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { FileUploader } from "@/components/ui/file-uploader";
import { toast } from "sonner";
import { cancelFormalRequest, updateFormalRequest } from "../actions";
import { FormalRequestStatus } from "@prisma/client";

export default function RequestDetailClient({ request }: { request: any }) {
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    subject: request.subject,
    body: request.body,
    attachmentFileIds: request.attachmentFileId ? [request.attachmentFileId] : [] as string[],
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "PENDING":
        return <Badge className="bg-amber-500 text-white border-transparent uppercase font-black text-[10px] tracking-widest px-3">Pending</Badge>;
      case "ACCEPTED":
        return <Badge className="bg-[#00C076] text-white border-transparent uppercase font-black text-[10px] tracking-widest px-3">Accepted</Badge>;
      case "REJECTED":
        return <Badge className="bg-rose-500 text-white border-transparent uppercase font-black text-[10px] tracking-widest px-3">Rejected</Badge>;
      case "CANCELLED":
        return <Badge className="bg-slate-500 text-white border-transparent uppercase font-black text-[10px] tracking-widest px-3">Cancelled</Badge>;
      default:
        return <Badge className="uppercase font-black text-[10px] tracking-widest px-3">{status}</Badge>;
    }
  };

  const handleCancel = async () => {
    setLoading(true);
    try {
      const res = await cancelFormalRequest(request.id);
      if (res.success) {
        toast.success("Request cancelled successfully.");
        router.refresh();
      } else {
        toast.error(res.message || "Failed to cancel request.");
      }
    } catch (err) {
      toast.error("An error occurred.");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await updateFormalRequest(request.id, {
        subject: form.subject,
        body: form.body,
        attachmentFileId: form.attachmentFileIds[0] || undefined
      });

      if (res.success) {
        toast.success("Request updated successfully.");
        setIsEditing(false);
        router.refresh();
      } else {
        toast.error(res.message || "Failed to update request.");
      }
    } catch (err) {
      toast.error("An error occurred.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-20">
      <div className="flex items-center justify-between">
        <Button variant="ghost" asChild className="hover:bg-slate-100 rounded-xl gap-2 font-bold text-slate-600">
          <Link href="/dashboard/requests">
            <ArrowLeft className="h-4 w-4" />
            Back to History
          </Link>
        </Button>

        {request.status === "PENDING" && !isEditing && (
          <div className="flex gap-3">
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="outline" className="border-rose-100 text-rose-600 hover:bg-rose-50 rounded-xl font-bold gap-2">
                  <Trash2 className="h-4 w-4" />
                  Cancel Request
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent className="rounded-3xl border-slate-200">
                <AlertDialogHeader>
                  <AlertDialogTitle className="text-xl font-black text-slate-800">Are you sure?</AlertDialogTitle>
                  <AlertDialogDescription className="font-medium text-slate-500">
                    This will permanently cancel your formal request. Stakeholders will see it as cancelled and you will need to send a new one if you change your mind.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel className="rounded-xl font-bold">Nevermind</AlertDialogCancel>
                  <AlertDialogAction onClick={handleCancel} className="bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-bold">
                    Yes, Cancel Request
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>

            <Button onClick={() => setIsEditing(true)} className="bg-brand-mint-teal hover:bg-brand-mint-teal/90 text-white rounded-xl font-bold gap-2 shadow-lg shadow-brand-mint-teal/20">
              <Edit3 className="h-4 w-4" />
              Edit Request
            </Button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card className="border border-slate-200 shadow-xl shadow-slate-200/50 bg-white overflow-hidden rounded-[2rem]">
            <CardHeader className="bg-slate-50/50 border-b border-slate-100 p-8">
              <div className="flex items-center gap-3 mb-4">
                {getStatusBadge(request.status)}
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  Submitted {new Date(request.createdAt).toLocaleDateString()}
                </span>
              </div>
              
              {isEditing ? (
                <div className="space-y-4 pt-2">
                   <div className="space-y-2">
                      <Label className="text-xs font-black uppercase tracking-widest text-slate-500">Subject</Label>
                      <Input 
                        value={form.subject} 
                        onChange={(e) => setForm({...form, subject: e.target.value})}
                        className="h-12 rounded-xl border-slate-200 focus:ring-brand-mint-teal shadow-sm"
                      />
                   </div>
                </div>
              ) : (
                <CardTitle className="text-3xl font-black text-brand-deep-dark tracking-tighter leading-tight">
                  {request.subject}
                </CardTitle>
              )}
            </CardHeader>
            <CardContent className="p-8 space-y-8">
               {isEditing ? (
                  <div className="space-y-6">
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <Label className="text-xs font-black uppercase tracking-widest text-slate-500">Message Body</Label>
                        <span className="text-[10px] font-bold text-slate-400">{form.body.length} / 2000</span>
                      </div>
                      <Textarea 
                        value={form.body} 
                        onChange={(e) => setForm({...form, body: e.target.value})}
                        className="min-h-[250px] rounded-2xl border-slate-200 focus:ring-brand-mint-teal shadow-sm resize-none"
                      />
                    </div>

                    <div className="space-y-2">
                      <FileUploader
                        label="Update Attachment (Optional)"
                        maxFiles={1}
                        acceptedTypes={[".pdf"]}
                        value={form.attachmentFileIds}
                        onChange={(ids) => setForm({ ...form, attachmentFileIds: ids })}
                      />
                    </div>

                    <div className="flex gap-3 pt-4">
                       <Button variant="outline" onClick={() => setIsEditing(false)} className="flex-1 h-12 rounded-xl font-bold">Cancel</Button>
                       <Button onClick={handleUpdate} disabled={loading} className="flex-1 h-12 rounded-xl bg-brand-mint-teal text-white font-black uppercase tracking-widest shadow-xl shadow-brand-mint-teal/20">
                         {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save Changes"}
                       </Button>
                    </div>
                  </div>
               ) : (
                  <>
                    <div className="space-y-4">
                      <h4 className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Formal Message</h4>
                      <div className="p-8 rounded-[1.5rem] bg-slate-50/50 border border-slate-100 text-slate-700 font-medium whitespace-pre-wrap leading-relaxed shadow-inner">
                        {request.body}
                      </div>
                    </div>

                    {request.rejectionReason && (
                      <div className="p-6 rounded-2xl bg-rose-50 border border-rose-100 flex gap-4">
                        <AlertTriangle className="h-6 w-6 text-rose-500 shrink-0" />
                        <div>
                          <h5 className="font-black text-rose-800 text-sm uppercase tracking-tight">Stakeholder Feedback</h5>
                          <p className="text-rose-700 text-sm font-medium mt-1 italic">"{request.rejectionReason}"</p>
                        </div>
                      </div>
                    )}

                    {request.attachment && (
                      <div className="space-y-4 pt-4 border-t border-slate-100">
                        <h4 className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Uploaded Attachment</h4>
                        <Link 
                           href={`/api/files/download/${request.attachment.id}`} 
                           target="_blank"
                           className="flex items-center justify-between p-5 rounded-2xl bg-[#F6F8FF] border border-brand-mint-teal/10 hover:border-brand-mint-teal/30 transition-all group shadow-sm"
                        >
                           <div className="flex items-center gap-4">
                              <div className="p-3 bg-white rounded-xl shadow-sm group-hover:scale-110 transition-transform text-[#00C076]">
                                 <Paperclip className="h-5 w-5" />
                              </div>
                              <div className="flex flex-col">
                                 <span className="text-sm font-black text-slate-800">{request.attachment.originalName}</span>
                                 <span className="text-[10px] font-bold text-slate-400 uppercase">Supporting PDF Document</span>
                              </div>
                           </div>
                           <ExternalLink className="h-4 w-4 text-brand-mint-teal" />
                        </Link>
                      </div>
                    )}
                  </>
               )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="border border-slate-200 shadow-lg shadow-slate-100 rounded-[1.5rem] overflow-hidden">
             <CardHeader className="bg-slate-50/50 p-6 border-b border-slate-100">
                <CardTitle className="text-sm font-black uppercase tracking-widest text-brand-deep-dark">Recipient Information</CardTitle>
             </CardHeader>
             <CardContent className="p-6 space-y-6">
                <div className="flex items-start gap-4">
                   <div className="p-3 rounded-2xl bg-indigo-50 text-indigo-600">
                      <Building2 className="h-5 w-5" />
                   </div>
                   <div className="flex flex-col">
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Stakeholder</span>
                      <span className="text-sm font-black text-slate-800 leading-tight">{request.recipient.name}</span>
                      <Badge variant="outline" className="w-fit mt-1.5 bg-indigo-50 text-indigo-600 border-indigo-100 uppercase text-[8px] font-black">{request.recipient.type}</Badge>
                   </div>
                </div>

                <div className="pt-6 border-t border-slate-50 flex items-center gap-4">
                   <div className="p-1 rounded-full bg-slate-100">
                      <div className="h-10 w-10 flex items-center justify-center font-black text-brand-mint-teal">
                         {request.recipient.name[0]}
                      </div>
                   </div>
                   <div className="flex flex-col">
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Contact Point</span>
                      <span className="text-[11px] font-bold text-slate-600">{request.recipient.email || 'Official Portal Channel'}</span>
                   </div>
                </div>
             </CardContent>
          </Card>

          <Card className="border border-slate-200 shadow-lg shadow-slate-100 rounded-[1.5rem] overflow-hidden">
             <CardHeader className="bg-slate-50/50 p-6 border-b border-slate-100">
                <CardTitle className="text-sm font-black uppercase tracking-widest text-brand-deep-dark">Timeline</CardTitle>
             </CardHeader>
             <CardContent className="p-6">
                <div className="space-y-6 relative ml-1 before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-[2px] before:bg-slate-100">
                   <div className="flex gap-4 relative">
                      <div className="h-6 w-6 rounded-full bg-[#00C076] text-white flex items-center justify-center z-10 shadow-lg shadow-brand-mint-teal/20">
                         <Send className="h-3 w-3" />
                      </div>
                      <div className="flex flex-col">
                         <span className="text-xs font-black text-slate-800">Request Sent</span>
                         <span className="text-[10px] font-bold text-slate-400">{new Date(request.createdAt).toLocaleString()}</span>
                      </div>
                   </div>

                   {request.status !== "PENDING" && (
                     <div className="flex gap-4 relative">
                        <div className={`h-6 w-6 rounded-full flex items-center justify-center z-10 shadow-lg ${request.status === 'ACCEPTED' ? 'bg-[#00C076] shadow-[#00C076]/20' : 'bg-rose-500 shadow-rose-500/20'} text-white`}>
                           {request.status === 'ACCEPTED' ? <CheckCircle2 className="h-3 w-3" /> : <XCircle className="h-3 w-3" />}
                        </div>
                        <div className="flex flex-col">
                           <span className="text-xs font-black text-slate-800">Status Updated</span>
                           <span className="text-[10px] font-bold text-slate-400">{new Date(request.updatedAt).toLocaleString()}</span>
                           <span className="text-[10px] font-black text-brand-mint-teal uppercase tracking-tighter mt-0.5">{request.status}</span>
                        </div>
                     </div>
                   )}
                </div>
             </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
