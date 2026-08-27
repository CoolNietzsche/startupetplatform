"use client";

import React, { useEffect, useState } from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Loader2, Users, UserCheck, Clock, Mail } from "lucide-react";
import { getApplicationAssignment } from "../ecosystem-actions";
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
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader className="pb-4 border-b">
          <div className="flex items-center gap-2 mb-1">
            <Users className="h-5 w-5 text-indigo-600" />
            <DialogTitle className="text-xl">Assigned Committee Members</DialogTitle>
          </div>
          <DialogDescription>
            Viewing members assigned to review <span className="font-semibold text-indigo-900">{application?.name}</span>
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-12 gap-3">
              <Loader2 className="h-8 w-8 animate-spin text-indigo-500" />
              <p className="text-sm text-muted-foreground uppercase tracking-widest font-medium">Loading evaluation team...</p>
            </div>
          ) : assignment ? (
            <div className="space-y-6">
              <div className="bg-indigo-50/50 p-4 rounded-xl border border-indigo-100/50">
                <div className="flex justify-between items-center mb-3">
                  <span className="text-xs font-bold text-indigo-600 uppercase tracking-wider">Committee Info</span>
                  <Badge variant="outline" className="bg-white text-indigo-700 border-indigo-200">
                    {assignment.committeeName}
                  </Badge>
                </div>
                <div className="flex items-center gap-3 text-sm text-indigo-900">
                  <div className="bg-white p-2 rounded-lg shadow-sm border border-indigo-100">
                    <Users className="h-4 w-4" />
                  </div>
                  <span className="font-medium">{assignment.reviews?.length || 0} Members assigned for this review</span>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-2 px-1">
                  <UserCheck className="h-4 w-4 text-emerald-600" />
                  <span className="text-sm font-bold text-slate-700 uppercase tracking-wider">Reviewer Status</span>
                </div>
                
                <ScrollArea className="h-[280px] pr-4 -mr-4">
                  <div className="space-y-2 pb-4">
                    {assignment.reviews && assignment.reviews.length > 0 ? (
                      assignment.reviews.map((review: any) => {
                        const isChair = assignment.chairMemberId === review.member.id;
                        const user = review.member.user;
                        const initials = `${user.firstName[0]}${user.lastName[0]}`.toUpperCase();
                        
                        return (
                          <div 
                            key={review.member.id} 
                            className={`flex flex-col p-3 rounded-xl border transition-all ${
                              isChair ? 'bg-indigo-50/30 border-indigo-200 shadow-sm' : 'bg-white border-slate-100 hover:border-slate-200'
                            }`}
                          >
                            <div className="flex items-start justify-between">
                              <div className="flex gap-3">
                                <Avatar className={`h-10 w-10 border-2 ${isChair ? 'border-indigo-200' : 'border-slate-100'}`}>
                                  <AvatarFallback className={isChair ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-600'}>
                                    {initials}
                                  </AvatarFallback>
                                </Avatar>
                                <div className="space-y-0.5">
                                  <div className="flex items-center gap-2">
                                    <span className="text-sm font-bold text-slate-900">{user.firstName} {user.lastName}</span>
                                    {isChair && (
                                      <Badge className="bg-indigo-600 hover:bg-indigo-600 text-[9px] h-4 px-1.5 uppercase tracking-tighter">Chairperson</Badge>
                                    )}
                                  </div>
                                  <div className="flex items-center gap-1.5 text-xs text-slate-500">
                                    <Mail className="h-3 w-3" />
                                    <span>{user.email}</span>
                                  </div>
                                </div>
                              </div>
                              <div className="flex flex-col items-end gap-1.5">
                                {review.status === 'SUBMITTED' ? (
                                  <Badge variant="success" className="bg-emerald-100 text-emerald-700 border-emerald-200 text-[10px] py-0 px-2">
                                    COMPLETED
                                  </Badge>
                                ) : (
                                  <Badge variant="outline" className="bg-slate-50 text-slate-500 border-slate-200 text-[10px] py-0 px-2 flex items-center gap-1">
                                    <Clock className="h-2.5 w-2.5" />
                                    PENDING
                                  </Badge>
                                )}
                                <span className="text-[10px] text-slate-400 font-medium">Role: {review.member.memberRole}</span>
                              </div>
                            </div>
                          </div>
                        );
                      })
                    ) : (
                      <div className="text-center py-12 text-slate-400 italic text-sm">
                        No members assigned yet.
                      </div>
                    )}
                  </div>
                </ScrollArea>
              </div>
            </div>
          ) : (
            <div className="text-center py-12 space-y-3">
               <div className="bg-slate-50 h-12 w-12 rounded-full flex items-center justify-center mx-auto">
                 <Users className="h-6 w-6 text-slate-300" />
               </div>
               <p className="text-sm text-slate-500">No committee assignment found for this application.</p>
            </div>
          )}
        </div>

        <Separator className="bg-slate-100" />
        
        <div className="pt-4 flex justify-end">
          <Button onClick={onClose} variant="secondary" className="bg-slate-100 hover:bg-slate-200 text-slate-900 font-bold px-8">
            Close Overview
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
