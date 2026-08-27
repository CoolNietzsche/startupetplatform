"use client";

import React, { useEffect, useState } from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Loader2, Users, UserCheck, Clock, Mail, CheckCircle2 } from "lucide-react";
import { getApplicationAssignment } from "../application-actions";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";

interface CommitteeMemberViewModalProps {
  isOpen: boolean;
  onClose: () => void;
  application: { id: string; name: string } | null;
}

export function CommitteeMemberViewModal({
  isOpen,
  onClose,
  application
}: CommitteeMemberViewModalProps) {
  const [loading, setLoading] = useState(false);
  const [assignment, setAssignment] = useState<any>(null);

  useEffect(() => {
    if (isOpen && application) {
      fetchAssignment();
    } else {
      setAssignment(null);
    }
  }, [isOpen, application]);

  const fetchAssignment = async () => {
    if (!application) return;
    setLoading(true);
    try {
      const res = await getApplicationAssignment(application.id);
      if (res.success) {
        setAssignment(res.data);
      }
    } catch (error) {
      console.error("Failed to fetch assignment:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] sm:max-h-[90vh] overflow-hidden flex flex-col p-0 gap-0">
        <div className="p-6 pb-2 border-b bg-slate-50/50">
          <DialogHeader>
            <div className="flex items-center gap-2 mb-1">
              <Users className="h-5 w-5 text-indigo-600" />
              <DialogTitle className="text-xl font-bold">Assigned Evaluation Team</DialogTitle>
            </div>
            <DialogDescription>
              Reviewing the expert committee assigned to <span className="font-semibold text-indigo-900 underline underline-offset-2 decoration-indigo-200">{application?.name}</span>
            </DialogDescription>
          </DialogHeader>
        </div>

        <div className="flex-1 overflow-y-auto p-6 scrollbar-thin scrollbar-thumb-slate-200">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-12 gap-3">
              <Loader2 className="h-8 w-8 animate-spin text-indigo-500" />
              <p className="text-sm text-muted-foreground uppercase tracking-widest font-medium">Syncing data...</p>
            </div>
          ) : assignment ? (
            <div className="space-y-6">
              <div className="bg-indigo-50 border border-indigo-100 p-4 rounded-2xl shadow-sm">
                <div className="flex justify-between items-center mb-4">
                  <div className="flex items-center gap-2">
                    <div className="bg-white p-2 rounded-lg shadow-sm border border-indigo-100">
                      <Users className="h-4 w-4 text-indigo-600" />
                    </div>
                    <div>
                      <p className="text-[10px] text-indigo-600 font-bold uppercase tracking-wider">Committee</p>
                      <p className="text-sm font-bold text-slate-900">{assignment.committeeName}</p>
                    </div>
                  </div>
                  <Badge variant="outline" className="bg-white text-indigo-700 border-indigo-200 font-bold">
                    {assignment.reviews?.length || 0} Members
                  </Badge>
                </div>
                <div className="flex items-center gap-2 text-[11px] text-indigo-700 font-medium">
                  <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                  <span>Verified evaluation team for startup certification tracking</span>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between px-1">
                  <div className="flex items-center gap-2">
                    <UserCheck className="h-4 w-4 text-emerald-600" />
                    <span className="text-sm font-bold text-slate-700 uppercase tracking-wider">Review Status</span>
                  </div>
                  <p className="text-[10px] text-slate-400 font-medium uppercase">Live update</p>
                </div>
                
                <div className="space-y-2.5">
                  {assignment.reviews && assignment.reviews.length > 0 ? (
                    assignment.reviews.map((review: any) => {
                      const isChair = assignment.chairMemberId === review.memberId;
                      const user = review.member.user;
                      const initials = `${user.firstName?.[0] || 'U'}${user.lastName?.[0] || 'P'}`.toUpperCase();
                      
                      return (
                        <div 
                          key={review.id} 
                          className={`flex flex-col p-4 rounded-2xl border transition-all duration-200 ${
                            isChair ? 'bg-indigo-50/40 border-indigo-200 shadow-sm ring-1 ring-indigo-100/50' : 'bg-white border-slate-100 hover:border-slate-200 hover:shadow-md'
                          }`}
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex gap-4">
                              <Avatar className={`h-11 w-11 border-2 ${isChair ? 'border-indigo-400 shadow-sm' : 'border-slate-100'}`}>
                                <AvatarFallback className={isChair ? 'bg-indigo-600 text-white font-bold' : 'bg-slate-100 text-slate-600'}>
                                  {initials}
                                </AvatarFallback>
                              </Avatar>
                              <div className="space-y-1">
                                <div className="flex items-center gap-2 flex-wrap">
                                  <span className="text-sm font-bold text-slate-900 tracking-tight">{user.firstName} {user.lastName}</span>
                                  {isChair && (
                                    <Badge className="bg-indigo-600 hover:bg-indigo-600 text-[9px] h-4 px-2 uppercase tracking-tighter shadow-sm font-bold">
                                      Chairperson
                                    </Badge>
                                  )}
                                </div>
                                <div className="flex items-center gap-1.5 text-xs text-slate-500 bg-slate-50/50 w-fit px-2 py-0.5 rounded-full border border-slate-100">
                                  <Mail className="h-3 w-3" />
                                  <span className="truncate max-w-[150px]">{user.email}</span>
                                </div>
                              </div>
                            </div>
                            <div className="flex flex-col items-end gap-2">
                              {review.status === 'SUBMITTED' || review.status === 'COMPLETED' ? (
                                <div className="flex items-center gap-1 text-emerald-600 font-bold text-[10px] bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">
                                  <CheckCircle2 className="h-3 w-3" />
                                  DONE
                                </div>
                              ) : (
                                <Badge variant="outline" className="bg-slate-50 text-slate-400 border-slate-200 text-[10px] py-0 px-2 flex items-center gap-1 font-bold">
                                  <Clock className="h-2.5 w-2.5" />
                                  PENDING
                                </Badge>
                              )}
                              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">
                                Role: <span className={isChair ? "text-indigo-600" : "text-slate-500"}>{review.member.memberRole}</span>
                              </p>
                            </div>
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div className="text-center py-20 text-slate-400 flex flex-col items-center gap-3">
                      <Users className="h-10 w-10 opacity-10" />
                      <p className="italic text-sm">No evaluation members assigned yet.</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-16 space-y-4">
               <div className="bg-slate-50 h-16 w-16 rounded-full flex items-center justify-center mx-auto shadow-inner">
                 <Users className="h-8 w-8 text-slate-300" />
               </div>
               <div className="space-y-1">
                 <p className="text-sm font-bold text-slate-900">No active assignment</p>
                 <p className="text-xs text-slate-500 max-w-[200px] mx-auto">This application hasn't been assigned to a committee yet.</p>
               </div>
            </div>
          )}
        </div>

        <div className="p-6 py-4 border-t bg-slate-50/50">
          <DialogFooter>
            <Button onClick={onClose} variant="secondary" className="bg-slate-900 hover:bg-slate-800 text-white font-bold h-10 px-8 rounded-xl transition-all active:scale-95 shadow-md w-full sm:w-auto">
              Close Overview
            </Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
}
